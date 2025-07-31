import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  useTheme,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  CalendarToday,
  Payment,
  Business,
  Speed,
  Storage,
  Support,
  ArrowForward,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getBaseApiUrl } from "../config/api";

const SubscriptionManager = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const garageId = localStorage.getItem("garageId");
      const token = localStorage.getItem("token");

      if (!garageId || !token) {
        throw new Error("Authentication required");
      }

      // Try the new endpoint first
      let response = await fetch(
        `${getBaseApiUrl()}/api/plans/subscription-details/${garageId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If new endpoint doesn't exist, try the old endpoint
      if (!response.ok && response.status === 404) {
        response = await fetch(
          `${getBaseApiUrl()}/api/garage/subscription-details/${garageId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubscriptionData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewPlan = () => {
    const garageId = localStorage.getItem("garageId");
    const garageName = localStorage.getItem("garageName");
    const garageEmail = localStorage.getItem("garageEmail");

    navigate("/renew-plan-flow", {
      state: {
        garageId,
        garageName,
        garageEmail,
        message: "Renew your subscription to continue enjoying all features.",
      },
    });
  };

  const handleUpgradePlan = () => {
    const garageId = localStorage.getItem("garageId");
    const garageName = localStorage.getItem("garageName");
    const garageEmail = localStorage.getItem("garageEmail");

    navigate("/renew-plan-flow", {
      state: {
        garageId,
        garageName,
        garageEmail,
        message: "Upgrade your plan to access more features.",
        upgrade: true,
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle color="success" />;
      case "expired":
        return <Warning color="error" />;
      case "pending":
        return <Warning color="warning" />;
      default:
        return <Warning color="default" />;
    }
  };

  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateProgress = (expiryDate) => {
    if (!expiryDate) return 0;
    const daysRemaining = calculateDaysRemaining(expiryDate);
    const totalDays = 30; // Assuming monthly subscription
    return Math.max(
      0,
      Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)
    );
  };

  const getPlanFeatures = (planName) => {
    const features = {
      "Basic Plan": [
        "Basic garage management",
        "Up to 50 vehicles",
        "Email support",
        "Job card management",
        "Customer database",
      ],
      "Premium Plan": [
        "Advanced features",
        "Unlimited vehicles",
        "Priority support",
        "Analytics dashboard",
        "Inventory management",
        "Service reminders",
      ],
      "Enterprise Plan": [
        "All features",
        "Multi-location support",
        "24/7 support",
        "Custom integrations",
        "Advanced reporting",
        "API access",
      ],
    };
    return features[planName] || [];
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Refresh />
            <Typography>Loading subscription details...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            <Typography variant="h6">Error Loading Subscription</Typography>
            <Typography variant="body2">{error}</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchSubscriptionData}
              sx={{ mt: 1 }}
            >
              Retry
            </Button>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            No Subscription Found
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You don't have an active subscription. Please subscribe to access
            all features.
          </Typography>
          <Button
            variant="contained"
            onClick={handleRenewPlan}
            startIcon={<Payment />}
          >
            Subscribe Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = calculateDaysRemaining(subscriptionData.expiryDate);
  const progress = calculateProgress(subscriptionData.expiryDate);
  const isExpired = subscriptionData.subscriptionExpired === true;
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <>
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Subscription Status
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {getStatusIcon(
                  subscriptionData.subscriptionExpired ? "expired" : "active"
                )}
                <Chip
                  label={isExpired ? "Expired" : "Active"}
                  color={getStatusColor(isExpired ? "expired" : "active")}
                  size="small"
                />
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenDetailsDialog(true)}
            >
              View Details
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Current Plan
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {subscriptionData.planName || "Basic Plan"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Expiry Date
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {subscriptionData.expiryDate
                  ? new Date(subscriptionData.expiryDate).toLocaleDateString()
                  : "N/A"}
              </Typography>
            </Grid>
          </Grid>

          {!isExpired && (
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Days Remaining
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {daysRemaining} days
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={isExpiringSoon ? "warning" : "primary"}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {(isExpired || isExpiringSoon) && (
            <Alert
              severity={isExpired ? "error" : "warning"}
              sx={{ mt: 2 }}
              action={
                <Button color="inherit" size="small" onClick={handleRenewPlan}>
                  {isExpired ? "Renew Now" : "Renew Early"}
                </Button>
              }
            >
              {isExpired
                ? "Your subscription has expired. Renew now to continue using all features."
                : "Your subscription expires soon. Consider renewing early to avoid service interruption."}
            </Alert>
          )}

          <Box mt={2} display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={handleRenewPlan}
              startIcon={<Payment />}
              fullWidth
            >
              {isExpired ? "Renew Plan" : "Manage Subscription"}
            </Button>
            {!isExpired && (
              <Button
                variant="outlined"
                onClick={handleUpgradePlan}
                startIcon={<ArrowForward />}
                fullWidth
              >
                Upgrade Plan
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Subscription Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Subscription Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Plan Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary="Plan Name"
                    secondary={subscriptionData.planName || "Basic Plan"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Start Date"
                    secondary={
                      subscriptionData.startDate
                        ? new Date(
                            subscriptionData.startDate
                          ).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Expiry Date"
                    secondary={
                      subscriptionData.expiryDate
                        ? new Date(
                            subscriptionData.expiryDate
                          ).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Payment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Amount"
                    secondary={`₹${subscriptionData.amount || "N/A"}`}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Plan Features
              </Typography>
              <List dense>
                {getPlanFeatures(subscriptionData.planName).map(
                  (feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  )
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleRenewPlan}
            startIcon={<Payment />}
          >
            Manage Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubscriptionManager;
