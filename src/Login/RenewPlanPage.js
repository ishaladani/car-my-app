// RenewPlanPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  CssBaseline,
  useTheme,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Email } from "@mui/icons-material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const RenewPlanPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Email and garage fetching states
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fetchingGarage, setFetchingGarage] = useState(false);
  const [garageData, setGarageData] = useState(null);
  const [step, setStep] = useState("email"); // "email", "renewal", "payment", "completed"

  // Existing states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const BASE_URL = "https://garage-management-zi5z.onrender.com";
  const RAZORPAY_KEY_ID =
    process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID_HERE";

  const colors = {
    primary: "#08197B",
    secondary: "#364ab8",
    accent: "#2196F3",
  };

  // If garage data is passed via state (existing flow), skip email step
  useEffect(() => {
    if (state && state.garageId) {
      setGarageData({
        garageId: state.garageId,
        garageName: state.garageName || "Your Garage",
        garageEmail: state.garageEmail,
      });
      setStep("renewal");
    }
  }, [state]);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fetch garage information by email
  const handleFetchGarageInfo = async () => {
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setFetchingGarage(true);
    setError("");

    try {
      
      const response = await axios.get(
        `${BASE_URL}/api/garage/get-garage-id/${encodeURIComponent(email)}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );


      if (response.data && response.data.data && response.data.data.garageId) {
        const garageInfo = response.data.data;
        setGarageData({
          garageId: garageInfo.garageId,
          garageName: garageInfo.name || "Your Garage",
          garageEmail: garageInfo.email || email,
          // Add any other fields returned by your API
          ...garageInfo,
        });
        setStep("renewal");
        setSuccess(response.data.message || "Garage information found successfully!");
      } else {
        setError("No garage found with this email address.");
      }
    } catch (err) {
      console.error("Error fetching garage info:", err);
      
      if (err.response?.status === 404) {
        setError("No garage found with this email address. Please check your email and try again.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          "Failed to fetch garage information. Please try again."
        );
      }
    } finally {
      setFetchingGarage(false);
    }
  };

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onerror = () => setError("Failed to load Razorpay gateway.");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch all plans when step changes to renewal
  useEffect(() => {
    if (step === "renewal") {
      const fetchPlans = async () => {
        setFetchingPlans(true);
        try {
          const response = await fetch(`${BASE_URL}/api/plans/all`);
          const data = await response.json();
          const plansArr = data?.data || [];
          setPlans(plansArr);
          if (Array.isArray(plansArr) && plansArr.length > 0) {
            setSelectedPlanId(plansArr[0]._id); // select first plan
          }
        } catch (err) {
          console.error("Error fetching plans:", err);
          setError("Failed to load available plans.");
        } finally {
          setFetchingPlans(false);
        }
      };
      fetchPlans();
    }
  }, [step, BASE_URL]);

  // Step 1: Create Renewal Order
  const handleCreateOrder = async () => {

    setError("");
    setSuccess("");
    setLoading(true);

    if (!garageData?.garageId) {
      setError("Garage ID is missing.");
      setLoading(false);
      return;
    }

    if (!selectedPlanId) {
      setError("Please select a plan.");
      setLoading(false);
      return;
    }

    try {
    

      const response = await axios.post(
        `${BASE_URL}/api/plans/renew`,
        {
          garageId: garageData.garageId,
          planId: selectedPlanId,
          paymentMethod: "razorpay",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );


      // Extract orderId from the correct path in response
      let orderId;
      if (response.data.order && response.data.order.orderId) {
        orderId = response.data.order.orderId;
      } else if (response.data.orderId) {
        orderId = response.data.orderId;
      } else {
        console.error("No orderId found in response:", response.data);
        setError("Order created but no order ID received. Please try again.");
        setLoading(false);
        return;
      }

      setOrderId(orderId);
      setSuccess("Order created successfully! Proceed to payment.");
      setStep("payment");
    } catch (err) {
      console.error("Order creation error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      // If API fails, create a test order for debugging
      if (err.response?.status === 404 || err.response?.status >= 500) {
        const testOrderId = "test_order_" + Date.now();
        setOrderId(testOrderId);
        setSuccess(
          "Test order created for debugging. You can now test the payment flow."
        );
        setStep("payment");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to create renewal order."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Open Real Razorpay Payment Gateway
  const handlePayment = async () => {
    if (!orderId) {
      setError("Order ID is missing. Please create an order first.");
      return;
    }

    setLoading(true);
    setError("");

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      setError("Payment gateway not loaded. Please check internet connection.");
      setLoading(false);
      return;
    }

    // Check if Razorpay key is properly configured
    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === "rzp_test_YOUR_KEY_ID_HERE") {
      setError("Razorpay key not configured. Please contact support.");
      setLoading(false);
      return;
    }

    try {
      let amount, currency;

      // Check if this is a test order
      if (orderId.startsWith("test_order_")) {
        amount = 99900; // ₹999 in paise
        currency = "INR";
      } else {
        // Fetch order details (amount, currency)
        try {
          const orderRes = await axios.get(
            `${BASE_URL}/api/plans/order/${orderId}`
          );
          const orderData = orderRes.data.data;
          amount = orderData.amount;
          currency = orderData.currency;
        } catch (orderError) {
          // Use the amount from the order creation response
          const selectedPlan = plans.find((p) => p._id === selectedPlanId);
          amount = (selectedPlan?.amount || 999) * 100; // Convert to paise
          currency = "INR";
        }
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount, // in paise (₹999 → 99900)
        currency: currency || "INR",
        name: "Garage Management System",
        description: "Subscription Renewal",
        order_id: orderId,
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            setLoading(true);
            const verifyRes = await axios.post(
              `${BASE_URL}/api/plans/complete-renewal`,
              {
                garageId: garageData.garageId,
                planId: selectedPlanId,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                paymentMethod: "razorpay",
              },
              {
                headers: { "Content-Type": "application/json" },
              }
            );
            setSuccess(
              verifyRes.data.message || "Subscription renewed successfully!"
            );
            setCompleted(true);
            setStep("completed");
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Contact support."
            );
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: garageData?.garageName || "Customer",
          email: garageData?.garageEmail || "",
          contact: "", // Add phone if available
        },
        theme: {
          color: colors.primary,
        },
        modal: {
          escape: false,
          backdropclose: false,
        },
        notes: {
          garageId: garageData?.garageId,
          planId: selectedPlanId,
        },
      };

 

      const rzp = new window.Razorpay(options);

      // Try to open the popup with multiple attempts
      try {
        rzp.open();
      } catch (openError) {
        console.error("Failed to open Razorpay popup:", openError);

        // Try again with a delay
        setTimeout(() => {
          try {
            const newRzp = new window.Razorpay(options);
            newRzp.open();
          } catch (retryError) {
            console.error("Retry also failed:", retryError);
            setError("Failed to open payment popup. Please try again.");
          }
        }, 1000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load payment details. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Render Email Input Step
  const renderEmailStep = () => (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        borderRadius: 3,
        textAlign: "center",
        backgroundColor: theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        border:
          theme.palette.mode === "dark"
            ? `1px solid ${theme.palette.divider}`
            : "none",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 700, color: colors.primary }}
      >
        🔁 Renew Subscription
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 3, color: theme.palette.text.secondary }}
      >
        Enter your registered email address to find your garage information
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError("");
          setError("");
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleFetchGarageInfo();
          }
        }}
        error={!!emailError}
        helperText={emailError}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="primary" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        onClick={handleFetchGarageInfo}
        disabled={fetchingGarage || !email.trim()}
        fullWidth
        sx={{
          height: 48,
          fontWeight: 600,
          borderRadius: 2,
          background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
          "&:hover": { backgroundColor: colors.secondary },
          "&:disabled": { opacity: 0.7 },
        }}
      >
        {fetchingGarage ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Find My Garage"
        )}
      </Button>

      <Typography
        variant="body2"
        sx={{ mt: 2, color: theme.palette.text.secondary }}
      >
        Don't have an account?{" "}
        <Button
          color="primary"
          onClick={() => navigate("/register")}
          sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
        >
          Register here
        </Button>
      </Typography>
    </Paper>
  );

  // Render Renewal Step (existing content)
  const renderRenewalStep = () => (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        borderRadius: 3,
        textAlign: "center",
        backgroundColor: theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        border:
          theme.palette.mode === "dark"
            ? `1px solid ${theme.palette.divider}`
            : "none",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 700, color: colors.primary }}
      >
        🔁 Renew Subscription
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 3, color: theme.palette.text.secondary }}
      >
        Your subscription has expired. Please renew your plan.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      {/* Garage Info */}
      <List sx={{ mb: 3, textAlign: "left" }}>
        <ListItem>
          <ListItemIcon>
            <strong>🆔</strong>
          </ListItemIcon>
          <ListItemText
            primary="Garage ID"
            secondary={garageData?.garageId || "Not available"}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <strong>🏢</strong>
          </ListItemIcon>
          <ListItemText primary="Name" secondary={garageData?.garageName} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <strong>📧</strong>
          </ListItemIcon>
          <ListItemText primary="Email" secondary={garageData?.garageEmail} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <strong>📋</strong>
          </ListItemIcon>
          <ListItemText
            primary="Selected Plan"
            secondary={
              plans.find((p) => p._id === selectedPlanId)?.name ||
              "Loading..."
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <strong>💰</strong>
          </ListItemIcon>
          <ListItemText
            primary="Amount"
            secondary={
              selectedPlanId &&
              plans.find((p) => p._id === selectedPlanId)
                ? `₹${
                    plans.find((p) => p._id === selectedPlanId).amount
                  }/${
                    plans.find((p) => p._id === selectedPlanId)
                      .durationInMonths > 1
                      ? `${
                          plans.find((p) => p._id === selectedPlanId)
                            .durationInMonths
                        } months`
                      : "month"
                  }`
                : "₹0"
            }
          />
        </ListItem>
      </List>

      {/* Plan Selection */}
      {fetchingPlans ? (
        <Box sx={{ mb: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Loading plans...
          </Typography>
        </Box>
      ) : (
        plans.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Select a Plan
            </Typography>
            <List>
              {plans.map((plan) => (
                <ListItem
                  key={plan._id}
                  button
                  selected={selectedPlanId === plan._id}
                  onClick={() => setSelectedPlanId(plan._id)}
                  sx={{
                    border:
                      selectedPlanId === plan._id
                        ? `2px solid ${colors.primary}`
                        : "1px solid #eee",
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor:
                      selectedPlanId === plan._id
                        ? `${colors.primary}10`
                        : "transparent",
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {plan.name}
                        </Typography>
                        {plan.popular && (
                          <Box
                            component="span"
                            sx={{
                              ml: 1,
                              px: 1,
                              py: 0.2,
                              background: "#ffe082",
                              color: "#b28704",
                              borderRadius: 1,
                              fontSize: "0.8em",
                              fontWeight: 700,
                            }}
                          >
                            Popular
                          </Box>
                        )}
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          ₹{plan.amount}/
                          {plan.durationInMonths > 1
                            ? `${plan.durationInMonths} months`
                            : "month"}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        {plan.features?.map((f, idx) => (
                          <li key={idx} style={{ fontSize: 13 }}>
                            {f}
                          </li>
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )
      )}

      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setStep("email")}
          sx={{ flex: 1 }}
        >
          Change Email
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateOrder}
          disabled={loading || !selectedPlanId}
          sx={{
            flex: 2,
            height: 48,
            fontWeight: 600,
            borderRadius: 2,
            background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
            "&:hover": { backgroundColor: colors.secondary },
            "&:disabled": { opacity: 0.7 },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create Renewal Order"
          )}
        </Button>
      </Box>
    </Paper>
  );

  // Render Payment Step
  const renderPaymentStep = () => (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        borderRadius: 3,
        textAlign: "center",
        backgroundColor: theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        border:
          theme.palette.mode === "dark"
            ? `1px solid ${theme.palette.divider}`
            : "none",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 700, color: colors.primary }}
      >
        💳 Complete Payment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Typography
        variant="body1"
        sx={{ mb: 3, color: theme.palette.text.secondary }}
      >
        Order created successfully! Click the button below to proceed with payment.
      </Typography>

      <Button
        variant="contained"
        onClick={handlePayment}
        disabled={loading}
        fullWidth
        sx={{
          height: 48,
          fontWeight: 600,
          borderRadius: 2,
          backgroundColor: colors.accent,
          "&:hover": { backgroundColor: "#1976D2" },
          "&:disabled": { opacity: 0.7 },
          mb: 2,
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Pay Now (Razorpay)"
        )}
      </Button>

      {orderId && (
        <Typography
          variant="body2"
          sx={{ mt: 2, color: "text.secondary" }}
        >
          Order ID: <strong>{orderId}</strong>
        </Typography>
      )}

      {/* Debug Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (!window.Razorpay) {
              alert("Razorpay not loaded!");
              return;
            }

            if (
              !RAZORPAY_KEY_ID ||
              RAZORPAY_KEY_ID === "rzp_test_YOUR_KEY_ID_HERE"
            ) {
              alert(
                "❌ Razorpay key not configured!\n\nPlease set REACT_APP_RAZORPAY_KEY_ID in your .env file.\n\nCurrent key: " +
                  RAZORPAY_KEY_ID
              );
              return;
            }

            const testOptions = {
              key: RAZORPAY_KEY_ID,
              amount: 99900,
              currency: "INR",
              name: "Test Payment",
              description: "Test",
              order_id: "test_" + Date.now(),
              handler: function (response) {
                alert("✅ Test payment successful!");
              },
              prefill: {
                name: garageData?.garageName || "Test",
                email: garageData?.garageEmail || "test@test.com",
              },
              theme: { color: "#1976d2" },
            };

            try {
            
              const rzp = new window.Razorpay(testOptions);
              rzp.open();
            } catch (error) {
              console.error("Test failed:", error);
              alert("❌ Test failed: " + error.message);
            }
          }}
          sx={{ fontSize: "12px" }}
        >
          🧪 Test Razorpay
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={() => {
         
            alert(
              `Razorpay: ${!!window.Razorpay}\nKey: ${RAZORPAY_KEY_ID}\nOrder: ${orderId}`
            );
          }}
          sx={{ fontSize: "12px" }}
        >
          🔍 Check Status
        </Button>
      </Box>
    </Paper>
  );

  // Render Completed Step
  const renderCompletedStep = () => (
    <Paper
      elevation={6}
      sx={{
        p: 4,
        borderRadius: 3,
        textAlign: "center",
        backgroundColor: theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        border:
          theme.palette.mode === "dark"
            ? `1px solid ${theme.palette.divider}`
            : "none",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2, fontWeight: 700, color: "#2E7D32" }}
      >
        ✅ Payment Successful!
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Typography
        variant="body1"
        sx={{ mb: 3, color: theme.palette.text.secondary }}
      >
        Your subscription has been renewed successfully!
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/")}
        fullWidth
        sx={{
          height: 48,
          fontWeight: 600,
          borderRadius: 2,
          backgroundColor: "#2E7D32",
          "&:hover": { backgroundColor: "#1B5E20" },
        }}
      >
        Go to Dashboard
      </Button>
    </Paper>
  );

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 2,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${colors.primary}25 0%, ${colors.accent}15 100%)`
              : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}10 100%)`,
        }}
      >
        <Container maxWidth="sm">
          {step === "email" && renderEmailStep()}
          {step === "renewal" && renderRenewalStep()}
          {step === "payment" && renderPaymentStep()}
          {step === "completed" && renderCompletedStep()}
        </Container>
      </Box>
    </>
  );
};

export default RenewPlanPage;