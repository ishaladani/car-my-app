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
} from "@mui/material";
import {
  CheckCircleOutline,
  AddCircleOutline,
  WarningAmber,
  CreditCard,
  AccountBalance,
  Business,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { getBaseApiUrl } from "../config/api";

// Fixed Razorpay key configuration
const RAZORPAY_KEY_ID =
  process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_qjd934YSnvGxQZ";

const RenewPlanPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Get garage data from navigation state or localStorage
  const [garageData, setGarageData] = useState({
    garageId: "",
    garageName: "",
    garageEmail: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [plans, setPlanData] = useState(null);
  const [error, setError] = useState(null);
  const [fetchingPlans, setFetchingPlans] = useState(false);

  // Initialize garage data from navigation state or localStorage
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
  }, [location.state]);

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
        console.error("Error fetching plans:", err);

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
            ],
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
              "Analytics",
            ],
            popular: true,
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
            ],
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

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenPlanDialog(false);
  };

  const handleRenewPlan = async () => {
    if (!selectedPlan) {
      showSnackbar("Please select a plan to renew.", "warning");
      return;
    }

    if (!garageData.garageId) {
      showSnackbar("Garage ID not found. Please login again.", "error");
      navigate("/login");
      return;
    }

    await handleRazorpayPayment();
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);

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

      console.log("Using Razorpay Key:", RAZORPAY_KEY_ID);

      // 1. Create renewal order - try new endpoint first
      let orderResponse = await fetch(`${getBaseApiUrl()}/api/plans/renew`, {
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

      // If new endpoint doesn't exist, try the old endpoint
      if (!orderResponse.ok && orderResponse.status === 404) {
        orderResponse = await fetch(
          `${getBaseApiUrl()}/api/garage/payment/createorderforsignup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: selectedPlan.amount,
              subscriptionType:
                selectedPlan.subscriptionType || selectedPlan.name,
            }),
          }
        );
      }

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Server error: ${orderResponse.status} - ${orderResponse.statusText}`
        );
      }

      const orderData = await orderResponse.json();
      console.log("Order response from server:", orderData);

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
        console.error(
          "Full order response:",
          JSON.stringify(orderData, null, 2)
        );
        throw new Error(
          `Invalid order response from server. No order ID found in response structure.`
        );
      }

      console.log("Extracted Order ID:", orderId);
      console.log("Order Amount:", orderAmount);

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
            showSnackbar("Payment cancelled", "info");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        setLoading(false);
        showSnackbar(
          response.error?.description || "Payment failed. Please try again.",
          "error"
        );
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      showSnackbar(err.message || "Payment processing failed", "error");
      setLoading(false);
    }
  };

  const processRenewal = async (paymentDetails) => {
    try {
      setLoading(true);

      const requestBody = {
        garageId: garageData.garageId,
        planId: selectedPlan._id || selectedPlan.id,
        orderId: paymentDetails.razorpayOrderId,
        paymentId: paymentDetails.razorpayPaymentId,
        signature: paymentDetails.razorpaySignature,
        paymentMethod: "razorpay",
      };

      // Try new endpoint first
      let response = await fetch(
        `${getBaseApiUrl()}/api/plans/complete-renewal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      // If new endpoint doesn't exist, try the old endpoint
      if (!response.ok && response.status === 404) {
        const oldRequestBody = {
          durationInMonths: selectedPlan.durationInMonths,
          amount: selectedPlan.amount,
          paymentDetails: {
            paymentId: paymentDetails.razorpayPaymentId,
            method: "upi",
            status: "paid",
          },
        };

        response = await fetch(
          `${getBaseApiUrl()}/api/garage/renewplan/${garageData.garageId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(oldRequestBody),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      showSnackbar(
        "Plan renewed successfully! You can now access your garage dashboard.",
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
      }, 2000);
    } catch (err) {
      console.error("Renewal error:", err);
      showSnackbar(err.message || "Plan renewal failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
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
            Subscription Expired
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {garageData.garageName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {garageData.message}
          </Typography>
        </Box>

        {/* Garage Info Card */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: theme.palette.mode === "dark" ? "#2a2a2a" : "#f8f9fa",
            border: "1px solid #e0e0e0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Business sx={{ color: "#1976d2" }} />
            <Typography variant="h6" fontWeight="bold">
              Garage Information
            </Typography>
          </Box>
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
          </Grid>
        </Paper>

        {/* Selected Plan Display */}
        {selectedPlan && (
          <Card
            sx={{
              border: "2px solid #1976d2",
              borderRadius: 2,
              mb: 4,
              bgcolor:
                theme.palette.mode === "dark" ? "#1a237e10" : "#bbdefb30",
            }}
          >
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
                  <Typography variant="h5" color="primary" fontWeight="bold">
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

        {/* Choose Plan Button */}
        {!selectedPlan && (
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
            sx={{ mb: 4, py: 2 }}
            disabled={fetchingPlans}
          >
            {fetchingPlans ? "Loading Plans..." : "Choose Renewal Plan"}
          </Button>
        )}

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleBackToLogin}
              sx={{ py: 1.5 }}
            >
              Back to Login
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !selectedPlan || fetchingPlans}
              startIcon={<CreditCard />}
              onClick={handleRenewPlan}
              sx={{ py: 1.5 }}
            >
              {loading ? "Processing..." : `Pay ${selectedPlan?.price} & Renew`}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Plan Selection Dialog */}
      <Dialog
        open={openPlanDialog}
        onClose={() => setOpenPlanDialog(false)}
        fullScreen={isMobile}
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
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                          >
                            {plan.name}
                          </Typography>
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
                          <Box sx={{ mt: 2 }}>
                            {plan.features &&
                              plan.features.map((feature, i) => (
                                <Typography
                                  key={i}
                                  variant="body2"
                                  sx={{ mb: 0.5 }}
                                >
                                  • {feature}
                                </Typography>
                              ))}
                          </Box>
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

export default RenewPlanPage;
