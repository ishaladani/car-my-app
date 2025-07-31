import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Alert, Button, Typography } from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import { getBaseApiUrl } from "../config/api";

const SubscriptionChecker = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState("checking"); // checking, active, expired, error
  const [subscriptionData, setSubscriptionData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const garageId = localStorage.getItem("garageId");
      const token = localStorage.getItem("token");

      if (!garageId || !token) {
        setSubscriptionStatus("error");
        return;
      }

      // Try the new endpoint first
      let response = await fetch(
        `${getBaseApiUrl()}/api/plans/subscription-status/${garageId}`,
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
          `${getBaseApiUrl()}/api/garage/subscription-status/${garageId}`,
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

      if (data.subscriptionExpired === true) {
        setSubscriptionStatus("expired");
      } else {
        setSubscriptionStatus("active");
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setSubscriptionStatus("error");
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
        message: "Your subscription has expired. Please renew your plan.",
      },
    });
  };

  const handleContinueAnyway = () => {
    setSubscriptionStatus("active");
  };

  if (subscriptionStatus === "checking") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Typography>Checking subscription status...</Typography>
      </Box>
    );
  }

  if (subscriptionStatus === "expired") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="warning"
          icon={<WarningAmber />}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleContinueAnyway}
              >
                Continue Anyway
              </Button>
              <Button
                color="inherit"
                size="small"
                variant="contained"
                onClick={handleRenewPlan}
              >
                Renew Plan
              </Button>
            </Box>
          }
        >
          <Typography variant="h6" gutterBottom>
            Subscription Expired
          </Typography>
          <Typography variant="body2">
            Your garage management subscription has expired. Some features may
            be limited. Please renew your plan to continue using all features.
          </Typography>
          {subscriptionData && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Expired on:{" "}
                {new Date(subscriptionData.expiryDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Alert>
        {children}
      </Box>
    );
  }

  if (subscriptionStatus === "error") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Unable to verify subscription status. Please check your connection and
          try again.
        </Alert>
        {children}
      </Box>
    );
  }

  // Subscription is active, render children normally
  return children;
};

export default SubscriptionChecker;
