import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  CardActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircleOutline,
  AddCircleOutline,
  WarningAmber,
  CreditCard,
  AccountBalance,
  Business,
  CheckCircle,
  Payment,
  Receipt,
  ArrowBack,
  ArrowForward,
  Info,
  Security,
  Support,
  Speed,
  Storage,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { getBaseApiUrl } from "../config/api";

// Fixed Razorpay key configuration
const RAZORPAY_KEY_ID =
  process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_qjd934YSnvGxQZ";

const RenewPlanFlow = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Flow state
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Garage data
  const [garageData, setGarageData] = useState({
    garageId: "",
    garageName: "",
    garageEmail: "",
    message: "",
  });

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlanData] = useState(null);
  const [fetchingPlans, setFetchingPlans] = useState(false);

  // Payment state
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  const [paymentDetails, setPaymentDetails] = useState(null);

  // UI state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [error, setError] = useState(null);

  // Steps configuration
  const steps = [
    {
      label: "Verify Garage",
      description: "Confirm your garage details",
      icon: <Business />,
    },
    {
      label: "Select Plan",
      description: "Choose your renewal plan",
      icon: <AddCircleOutline />,
    },
    {
      label: "Payment",
      description: "Complete payment securely",
      icon: <Payment />,
    },
    {
      label: "Activation",
      description: "Activate your subscription",
      icon: <CheckCircle />,
    },
  ];

  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpaySDK = () => {
      return new Promise((resolve, reject) => {
        if (window.Razorpay) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          console.log("Razorpay SDK loaded");
          resolve();
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay SDK");
          reject(new Error("Failed to load Razorpay gateway."));
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpaySDK().catch((err) => {
      setError(err.message);
    });
  }, []);

  // Initialize garage data
  useEffect(() => {
    const stateData = location.state;
    const localGarageId = localStorage.getItem("garageId");
    const localGarageName = localStorage.getItem("garageName");
    const localGarageEmail = localStorage.getItem("garageEmail");

    setGarageData({
      garageId: stateData?.garageId || localGarageId || "",
      garageName: stateData?.garageName || localGarageName || "Your Garage",
      garageEmail: stateData?.garageEmail || localGarageEmail || "",
      message:
        stateData?.message ||
        "Your subscription has expired. Please renew your plan.",
    });

    // Auto-advance to step 1 if garage data is available
    if (stateData?.garageId || localGarageId) {
      setActiveStep(1);
      setCompletedSteps([0]);
    }
  }, [location.state]);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setFetchingPlans(true);

        // Try the new endpoint first
        let response = await fetch(`${getBaseApiUrl()}/api/plans/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // If new endpoint doesn't exist, try the old endpoint
        if (!response.ok && response.status === 404) {
          response = await fetch(`${getBaseApiUrl()}/api/admin/plan`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPlanData(data.data || data);
      } catch (err) {
        setError(err.message);

        // Fallback plans if API fails
        setPlanData([
          {
            name: "Basic Plan",
            price: "₹999/month",
            amount: 999,
            durationInMonths: 1,
            features: [
              "Basic garage management",
              "Up to 50 vehicles",
              "Email support",
              "Job card management",
              "Customer database",
            ],
            icon: <Business />,
          },
          {
            name: "Premium Plan",
            price: "₹2999/6 months",
            amount: 2999,
            durationInMonths: 6,
            features: [
              "Advanced features",
              "Unlimited vehicles",
              "Priority support",
              "Analytics dashboard",
              "Inventory management",
              "Service reminders",
            ],
            popular: true,
            icon: <Speed />,
          },
          {
            name: "Enterprise Plan",
            price: "₹4999/year",
            amount: 4999,
            durationInMonths: 12,
            features: [
              "All features",
              "Multi-location support",
              "24/7 support",
              "Custom integrations",
              "Advanced reporting",
              "API access",
            ],
            icon: <Storage />,
          },
        ]);
      } finally {
        setFetchingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleNext = async () => {
    if (activeStep === 0 && !garageData.garageId) {
      showSnackbar("Please provide valid garage details", "warning");
      return;
    }

    if (activeStep === 1 && !selectedPlan) {
      showSnackbar("Please select a plan to continue", "warning");
      return;
    }

    // If moving to payment step (step 2), trigger payment process
    if (activeStep === 1) {
      await handlePayment();
      return;
    }

    const newCompletedSteps = [...completedSteps];
    if (!newCompletedSteps.includes(activeStep)) {
      newCompletedSteps.push(activeStep);
    }
    setCompletedSteps(newCompletedSteps);
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleStepClick = (step) => {
    if (step <= activeStep || completedSteps.includes(step)) {
      setActiveStep(step);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenPlanDialog(false);

    // Auto-advance to payment step
    if (!completedSteps.includes(1)) {
      setCompletedSteps([...completedSteps, 1]);
    }
    setActiveStep(2);
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      showSnackbar("Please select a plan first", "warning");
      return;
    }

    if (!garageData.garageId) {
      showSnackbar("Garage ID not found. Please login again.", "error");
      navigate("/login");
      return;
    }

    await processPayment();
  };

  const processPayment = async () => {
    try {
      console.log("=== Starting Payment Process ===");
      console.log("Garage ID:", garageData.garageId);
      console.log("Selected Plan:", selectedPlan);
      console.log("Current step:", activeStep);

      setLoading(true);
      setPaymentStatus("processing");

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK not loaded. Please refresh the page and try again."
        );
      }

      // Validate Razorpay key
      if (
        !RAZORPAY_KEY_ID ||
        RAZORPAY_KEY_ID === "" ||
        RAZORPAY_KEY_ID.includes("your_actual_key_here")
      ) {
        throw new Error("Razorpay key not configured. Please contact support.");
      }

      // 1. Create renewal order
      const orderResponse = await fetch(`${getBaseApiUrl()}/api/plans/renew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          garageId: garageData.garageId,
          planId: selectedPlan._id || selectedPlan.id,
          paymentMethod: "razorpay",
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${orderResponse.status}`
        );
      }

      const orderData = await orderResponse.json();

      // Extract order details
      let orderId, orderAmount;

      if (orderData.order && typeof orderData.order === "object") {
        orderId =
          orderData.order.id ||
          orderData.order.order_id ||
          orderData.order.orderId;
        orderAmount =
          orderData.order.amount ||
          orderData.order.amount_due ||
          selectedPlan.amount * 100;
      } else {
        orderId =
          orderData.id ||
          orderData.order_id ||
          orderData.orderId ||
          orderData.razorpayOrderId;
        orderAmount =
          orderData.amount || orderData.amount_due || selectedPlan.amount * 100;
      }

      if (!orderId) {
        throw new Error(
          "Invalid order response from server. No order ID found."
        );
      }

      // 2. Open Razorpay payment dialog
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: "INR",
        name: "Garage Management",
        description: `${selectedPlan.name} Plan Renewal`,
        order_id: orderId,
        handler: async (response) => {
          // 3. Process renewal with payment details
          await processRenewal({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: garageData.garageName,
          email: garageData.garageEmail,
        },
        theme: {
          color: "#1976d2",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentStatus("pending");
            showSnackbar("Payment cancelled", "info");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        setLoading(false);
        setPaymentStatus("failed");
        showSnackbar(
          response.error?.description || "Payment failed. Please try again.",
          "error"
        );
      });

      rzp.open();
    } catch (err) {
      setLoading(false);
      setPaymentStatus("failed");
      showSnackbar(err.message || "Payment processing failed", "error");
    }
  };

  const processRenewal = async (paymentDetails) => {
    try {
      setLoading(true);
      setPaymentStatus("processing");

      const requestBody = {
        garageId: garageData.garageId,
        planId: selectedPlan._id || selectedPlan.id,
        orderId: paymentDetails.razorpayOrderId,
        paymentId: paymentDetails.razorpayPaymentId,
        signature: paymentDetails.razorpaySignature,
        paymentMethod: "razorpay",
      };

      const response = await fetch(
        `${getBaseApiUrl()}/api/plans/complete-renewal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      setPaymentStatus("success");
      setPaymentDetails(paymentDetails);

      // Complete the flow
      setCompletedSteps([...completedSteps, 2, 3]);
      setActiveStep(3);

      showSnackbar(
        "Plan renewed successfully! Redirecting to dashboard...",
        "success"
      );

      // Navigate to dashboard after renewal
      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            renewalSuccess: true,
            planName: selectedPlan.name,
          },
        });
      }, 3000);
    } catch (err) {
      setPaymentStatus("failed");
      showSnackbar(err.message || "Plan renewal failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verify Your Garage Details
            </Typography>
            <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Garage Name
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {garageData.garageName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {garageData.garageEmail}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Garage ID
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="500"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {garageData.garageId || "Not available"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            {!garageData.garageId && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Garage details not found. Please go back to login and try again.
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Your Renewal Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose the plan that best fits your garage needs
            </Typography>

            {selectedPlan && (
              <Card sx={{ border: "2px solid #1976d2", mb: 3 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedPlan.name}
                      </Typography>
                      <Typography
                        variant="h5"
                        color="primary"
                        fontWeight="bold"
                      >
                        {selectedPlan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {selectedPlan.durationInMonths} month(s)
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<AddCircleOutline />}
                      onClick={() => setOpenPlanDialog(true)}
                      disabled={fetchingPlans}
                    >
                      Change Plan
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={
                fetchingPlans ? (
                  <CircularProgress size={20} />
                ) : (
                  <AddCircleOutline />
                )
              }
              onClick={() => setOpenPlanDialog(true)}
              sx={{ py: 2 }}
              disabled={fetchingPlans}
            >
              {fetchingPlans
                ? "Loading Plans..."
                : selectedPlan
                ? "Change Plan"
                : "Choose Renewal Plan"}
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Complete Payment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Secure payment powered by Razorpay
            </Typography>

            {selectedPlan && (
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Plan:</Typography>
                  <Typography fontWeight="500">{selectedPlan.name}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Duration:</Typography>
                  <Typography fontWeight="500">
                    {selectedPlan.durationInMonths} month(s)
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {selectedPlan.price}
                  </Typography>
                </Box>
              </Paper>
            )}

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
              <Security color="primary" />
              <Typography variant="body2" color="text.secondary">
                Your payment is secured with bank-level encryption
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !selectedPlan}
              startIcon={
                loading ? <CircularProgress size={20} /> : <CreditCard />
              }
              onClick={handlePayment}
              sx={{ py: 2 }}
            >
              {loading
                ? "Processing Payment..."
                : `Pay ${selectedPlan?.price} & Continue`}
            </Button>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Activation Complete
            </Typography>

            {paymentStatus === "success" ? (
              <Box textAlign="center">
                <CheckCircle
                  sx={{ fontSize: 80, color: "success.main", mb: 2 }}
                />
                <Typography variant="h5" color="success.main" gutterBottom>
                  Plan Activated Successfully!
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Your {selectedPlan?.name} has been activated and you can now
                  access all features.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Redirecting to dashboard...
                </Typography>
              </Box>
            ) : (
              <Box textAlign="center">
                <WarningAmber
                  sx={{ fontSize: 80, color: "warning.main", mb: 2 }}
                />
                <Typography variant="h5" color="warning.main" gutterBottom>
                  Payment Processing
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Please wait while we process your payment and activate your
                  plan.
                </Typography>
                <CircularProgress />

                {/* Debug buttons */}
                <Box mt={3} display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      console.log("Current payment status:", paymentStatus);
                      console.log("Current step:", activeStep);
                      console.log("Selected plan:", selectedPlan);
                    }}
                  >
                    Debug Status
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setPaymentStatus("pending");
                      setLoading(false);
                      setActiveStep(2);
                    }}
                  >
                    Reset Payment
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Box
        sx={{
          p: 4,
          borderRadius: 4,
          boxShadow: 3,
          bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <WarningAmber sx={{ fontSize: 60, color: "#FF9800", mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Renew Your Subscription
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {garageData.garageName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {garageData.message}
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? "vertical" : "horizontal"}
          sx={{ mb: 4 }}
        >
          {steps.map((step, index) => (
            <Step key={step.label} completed={completedSteps.includes(index)}>
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor: completedSteps.includes(index)
                    ? "pointer"
                    : "default",
                }}
                icon={step.icon}
              >
                {!isMobile && step.label}
              </StepLabel>
              {isMobile && (
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepContent>
              )}
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

        {/* Navigation */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>

          <Box>
            <Button
              variant="outlined"
              onClick={handleBackToLogin}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>

            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                disabled={loading}
              >
                {activeStep === steps.length - 2 ? "Complete" : "Next"}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Plan Selection Dialog */}
      <Dialog
        open={openPlanDialog}
        onClose={() => setOpenPlanDialog(false)}
        fullScreen={isMobile}
        maxWidth="lg"
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Select Renewal Plan
          </Typography>
        </DialogTitle>
        <DialogContent>
          {fetchingPlans ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
              <Typography ml={2}>Loading plans...</Typography>
            </Box>
          ) : error ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <Typography color="error">
                Failed to load plans. Using default plans.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ my: 1 }}>
              {plans &&
                plans.map((plan, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      onClick={() => handleSelectPlan(plan)}
                      sx={{
                        cursor: "pointer",
                        transition: "0.3s",
                        border:
                          selectedPlan?.name === plan.name
                            ? "2px solid #1976d2"
                            : "1px solid #ccc",
                        boxShadow: selectedPlan?.name === plan.name ? 4 : 1,
                        bgcolor:
                          selectedPlan?.name === plan.name ? "#e3f2fd" : "#fff",
                        "&:hover": {
                          boxShadow: 3,
                          bgcolor: "#f1f1f1",
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ position: "relative" }}>
                          {plan.popular && (
                            <Chip
                              label="Most Popular"
                              color="secondary"
                              size="small"
                              sx={{ position: "absolute", top: -8, right: -8 }}
                            />
                          )}
                          <Box display="flex" alignItems="center" mb={2}>
                            {plan.icon}
                            <Typography variant="h6" fontWeight="bold" ml={1}>
                              {plan.name}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h5"
                            color="primary"
                            fontWeight="bold"
                            gutterBottom
                          >
                            {plan.price}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Duration: {plan.durationInMonths} month(s)
                          </Typography>
                          <List dense>
                            {plan.features &&
                              plan.features.map((feature, i) => (
                                <ListItem key={i} sx={{ py: 0.5 }}>
                                  <ListItemIcon sx={{ minWidth: 30 }}>
                                    <CheckCircleOutline
                                      color="primary"
                                      fontSize="small"
                                    />
                                  </ListItemIcon>
                                  <ListItemText primary={feature} />
                                </ListItem>
                              ))}
                          </List>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          fullWidth
                          variant={
                            selectedPlan?.name === plan.name
                              ? "contained"
                              : "outlined"
                          }
                          startIcon={
                            selectedPlan?.name === plan.name ? (
                              <CheckCircleOutline />
                            ) : null
                          }
                        >
                          {selectedPlan?.name === plan.name
                            ? "Selected"
                            : "Select Plan"}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPlanDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RenewPlanFlow;
