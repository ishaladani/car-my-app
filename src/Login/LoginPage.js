import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CssBaseline,
  Paper,
  useTheme,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Business,
  Person,
  DirectionsCar,
  AccountCircle,
  Email,
  Lock,
  VerifiedUser,
  Send,
  ExitToApp,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isGarageLogin, setIsGarageLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Forgot Password State
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // API Base URL
  const BASE_URL = "https://garage-management-zi5z.onrender.com";

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const garageId = localStorage.getItem("garageId");
    if (token && userType && garageId) {
      setIsLoggedIn(true);
      setCurrentUser({
        userType,
        garageId,
        token,
      });
      setIsGarageLogin(userType === "garage");
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const storedUserId = localStorage.getItem("garageId");
      const token = localStorage.getItem("token");

      if (!storedUserId) {
        console.error("No garageId found in localStorage");
      }
      if (!token) {
        console.error("No token found in localStorage");
      }

      if (storedUserId && token) {
        await axios.post(
          `${BASE_URL}/api/garage/logout/${storedUserId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setFormData({ email: "", password: "" });
      setError("");
      setLogoutLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // Handle forgot password form changes
  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (forgotPasswordError) setForgotPasswordError("");
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isGarageLogin
        ? `${BASE_URL}/api/garage/login`
        : `${BASE_URL}/api/garage/user/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Check for expired subscription
      if (
        data.subscriptionExpired === true &&
        data.message ===
          "Your subscription has expired. Please renew your plan."
      ) {
        try {
          // Fetch garage details using email
          const encodedEmail = encodeURIComponent(formData.email);
          const res = await fetch(
            `${BASE_URL}/api/garage/get-garage-id/${encodedEmail}`
          );

          if (!res.ok) throw new Error("Failed to fetch garage data");

          const result = await res.json();
          const { garageId, name, email: garageEmail } = result.data;

          // Navigate to renew-plan with full data
          navigate("/renew-plan", {
            state: {
              garageId,
              garageName: name,
              garageEmail: garageEmail,
              message: data.message,
            },
          });
        } catch (err) {
          console.error("Error fetching garage data:", err);
          alert("Could not retrieve garage details. Please contact support.");
        }

        setError(data.message);
        return;
      }

      // Save login data with safety checks
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("userType", isGarageLogin ? "garage" : "user");
      localStorage.setItem(
        "name",
        isGarageLogin
          ? data.garage?.name || "Unknown Garage"
          : data.user?.name || "Unknown User"
      );

      const garageId = isGarageLogin ? data.garage?._id : data.user?.garageId;

      if (garageId) {
        localStorage.setItem("garageId", garageId);
      }

      setIsLoggedIn(true);
      setCurrentUser({
        userType: isGarageLogin ? "garage" : "user",
        garageId: garageId || null,
        token: data.token || null,
      });

      navigate(isGarageLogin ? "/" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for password reset
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    setForgotPasswordLoading(true);

    if (!forgotPasswordData.email) {
      setForgotPasswordError("Please enter your email address");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/verify/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordData.email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send OTP");
      }

      setForgotPasswordSuccess("OTP sent successfully! Check your email.");
      setOtpSent(true);
      setForgotPasswordStep(1);
      setResendTimer(60);

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setForgotPasswordError(err.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordLoading(true);

    if (!forgotPasswordData.otp) {
      setForgotPasswordError("Please enter the OTP");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/verify/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid OTP");
      }

      setForgotPasswordSuccess("OTP verified successfully!");
      setOtpVerified(true);
      setForgotPasswordStep(2);
    } catch (err) {
      setForgotPasswordError(err.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordLoading(true);

    const { newPassword, confirmPassword } = forgotPasswordData;

    if (!newPassword || !confirmPassword) {
      setForgotPasswordError("Please fill in all fields");
      setForgotPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotPasswordError("Passwords do not match");
      setForgotPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError("Password must be at least 6 characters");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/verify/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Password reset failed");
      }

      setForgotPasswordSuccess(
        "Password reset successful! You can now log in."
      );
      setTimeout(() => {
        closeForgotPasswordDialog();
      }, 3000);
    } catch (err) {
      setForgotPasswordError(err.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginTypeChange = (e) => {
    setIsGarageLogin(e.target.checked);
    setFormData({ email: "", password: "" });
    setError("");
  };

  const openForgotPasswordDialog = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordStep(0);
    setForgotPasswordData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    setOtpSent(false);
    setOtpVerified(false);
    setResendTimer(0);
  };

  const closeForgotPasswordDialog = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordStep(0);
    setForgotPasswordData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    setOtpSent(false);
    setOtpVerified(false);
    setResendTimer(0);
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      handleSendOtp({ preventDefault: () => {} });
    }
  };

  // Theme colors
  const getThemeColors = () => {
    return isGarageLogin
      ? { primary: "#08197B", secondary: "#364ab8", accent: "#2196F3" }
      : { primary: "#2E7D32", secondary: "#4CAF50", accent: "#66BB6A" };
  };

  const colors = getThemeColors();

  // TextField styling
  const getTextFieldStyles = () => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.background.paper
          : theme.palette.background.default,
      borderRadius: 2,
      "& fieldset": {
        borderColor:
          theme.palette.mode === "dark" ? theme.palette.divider : "#ddd",
      },
      "&:hover fieldset": {
        borderColor: colors.secondary,
      },
      "&.Mui-focused fieldset": {
        borderColor: colors.primary,
      },
      "& input": {
        color: theme.palette.text.primary,
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.text.secondary,
      "&.Mui-focused": { color: colors.primary },
    },
  });

  const steps = ["Verify Email", "Enter OTP", "New Password"];

  return (
    <>
      <CssBaseline />

      {/* AppBar (only when logged in) */}
      {isLoggedIn && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: "transparent",
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: colors.primary, fontWeight: 600 }}
              >
                Garage Management
              </Typography>
              <Chip
                icon={
                  currentUser?.userType === "garage" ? (
                    <DirectionsCar />
                  ) : (
                    <AccountCircle />
                  )
                }
                label={`Logged in as ${
                  currentUser?.userType === "garage" ? "Garage" : "User"
                }`}
                size="small"
                sx={{
                  backgroundColor: colors.primary,
                  color: "white",
                  fontWeight: 500,
                }}
              />
            </Box>
            <Button
              variant="outlined"
              onClick={handleLogout}
              disabled={logoutLoading}
              startIcon={
                logoutLoading ? <CircularProgress size={16} /> : <ExitToApp />
              }
              sx={{
                borderColor: "#ff4444",
                color: "#ff4444",
                backgroundColor: "rgba(255, 68, 68, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(255, 68, 68, 0.15)",
                  color: "#cc3333",
                },
              }}
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </Button>
          </Toolbar>
        </AppBar>
      )}

      {/* Main Login Page */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 2,
          pt: isLoggedIn ? 10 : 2,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${colors.primary}25 0%, ${colors.accent}15 100%)`
              : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}10 100%)`,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{
              width: "100%",
              maxWidth: 450,
              mx: "auto",
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Already logged in alert */}
            {isLoggedIn && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                ✅ You are logged in as{" "}
                {currentUser?.userType === "garage"
                  ? "Garage Owner"
                  : "Customer"}
                .
              </Alert>
            )}

            {/* Login Type Chip */}
            <Box sx={{ mb: 3 }}>
              <Chip
                icon={isGarageLogin ? <DirectionsCar /> : <AccountCircle />}
                label={`${isGarageLogin ? "Garage" : "User"} Login`}
                sx={{
                  backgroundColor: colors.primary,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  px: 2,
                  py: 1,
                }}
              />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              sx={{ mb: 2, fontWeight: 700, color: colors.primary }}
            >
              {isLoggedIn ? "Account Status" : "Welcome Back"}
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 4, color: theme.palette.text.secondary }}
            >
              {isLoggedIn
                ? "You are currently signed in."
                : isGarageLogin
                ? "Access your garage management system"
                : "Sign in to your customer account"}
            </Typography>

            {/* Login Form */}
            {!isLoggedIn && (
              <>
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                    {error ===
                      "Your subscription has expired. Please renew your plan." && (
                      <Button
                        variant="contained"
                        color="warning"
                        sx={{ ml: 2, mt: 1 }}
                        onClick={async () => {
                          try {
                            const encodedEmail = encodeURIComponent(
                              formData.email
                            );
                            const res = await fetch(
                              `${BASE_URL}/api/garage/get-garage-id/${encodedEmail}`
                            );
                            if (!res.ok) throw new Error("Garage not found");
                            const result = await res.json();
                            const { garageId, name, email } = result.data;
                            navigate("/renew-plan", {
                              state: {
                                garageId,
                                garageName: name,
                                garageEmail: email,
                                message: error,
                              },
                            });
                          } catch (err) {
                            alert(
                              "Could not retrieve garage details. Please contact support."
                            );
                          }
                        }}
                      >
                        Renew Now
                      </Button>
                    )}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3, ...getTextFieldStyles() }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {isGarageLogin ? (
                            <Business color="action" />
                          ) : (
                            <Person color="action" />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    sx={{ mb: 2, ...getTextFieldStyles() }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}
                  >
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={openForgotPasswordDialog}
                      sx={{
                        color: colors.primary,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    fullWidth
                    sx={{
                      height: 48,
                      fontWeight: 600,
                      mb: 3,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: `0 6px 20px ${colors.primary}30`,
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      `Sign In as ${isGarageLogin ? "Garage" : "User"}`
                    )}
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Switch Login Type
                  </Typography>
                </Divider>

                <FormControlLabel
                  control={
                    <Switch
                      checked={isGarageLogin}
                      onChange={handleLoginTypeChange}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {isGarageLogin ? <DirectionsCar /> : <AccountCircle />}
                      <Typography fontWeight={500}>
                        {isGarageLogin ? "Garage Owner" : "Customer"}
                      </Typography>
                    </Box>
                  }
                />

                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    variant="body1"
                    onClick={() => navigate("/signup")}
                    sx={{
                      fontWeight: 600,
                      color: colors.primary,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Create Account
                  </Link>
                </Typography>
              </>
            )}

            {/* Dashboard Access Button */}
            {isLoggedIn && (
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/")}
                  startIcon={
                    currentUser?.userType === "garage" ? (
                      <DirectionsCar />
                    ) : (
                      <AccountCircle />
                    )
                  }
                  sx={{
                    height: 48,
                    fontWeight: 600,
                    borderRadius: 2,
                    background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
                  }}
                >
                  Go to Dashboard
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={closeForgotPasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ textAlign: "center", color: colors.primary, fontWeight: 700 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Lock /> Reset Password
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={forgotPasswordStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {forgotPasswordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotPasswordError}
            </Alert>
          )}
          {forgotPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotPasswordSuccess}
            </Alert>
          )}

          {forgotPasswordStep === 0 && (
            <Box component="form" onSubmit={handleSendOtp}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={forgotPasswordData.email}
                onChange={handleForgotPasswordChange}
                required
                sx={{ mb: 3, ...getTextFieldStyles() }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {forgotPasswordStep === 1 && (
            <Box component="form" onSubmit={handleVerifyOtp}>
              <TextField
                fullWidth
                name="otp"
                label="Enter OTP"
                type="text"
                value={forgotPasswordData.otp}
                onChange={handleForgotPasswordChange}
                required
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    fontSize: "1.5rem",
                    letterSpacing: "0.5rem",
                  },
                }}
                sx={{ mb: 2, ...getTextFieldStyles() }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VerifiedUser color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  sx={{ color: colors.primary }}
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </Button>
              </Box>
            </Box>
          )}

          {forgotPasswordStep === 2 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                name="newPassword"
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                value={forgotPasswordData.newPassword}
                onChange={handleForgotPasswordChange}
                required
                sx={{ mb: 2, ...getTextFieldStyles() }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={forgotPasswordData.confirmPassword}
                onChange={handleForgotPasswordChange}
                required
                sx={{ mb: 3, ...getTextFieldStyles() }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={closeForgotPasswordDialog}
            variant="outlined"
            sx={{ borderColor: colors.primary, color: colors.primary }}
          >
            Cancel
          </Button>
          {forgotPasswordStep === 0 && (
            <Button
              onClick={handleSendOtp}
              variant="contained"
              disabled={forgotPasswordLoading}
              startIcon={<Send />}
            >
              {forgotPasswordLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Send OTP"
              )}
            </Button>
          )}
          {forgotPasswordStep === 1 && (
            <Button
              onClick={handleVerifyOtp}
              variant="contained"
              disabled={forgotPasswordLoading}
              startIcon={<VerifiedUser />}
            >
              {forgotPasswordLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Verify OTP"
              )}
            </Button>
          )}
          {forgotPasswordStep === 2 && (
            <Button
              onClick={handleResetPassword}
              variant="contained"
              disabled={forgotPasswordLoading}
              startIcon={<Lock />}
            >
              {forgotPasswordLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginPage;
