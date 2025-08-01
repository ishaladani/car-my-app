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
import { Snackbar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getAdminApiUrl } from "../config/api";

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
  const [isGarageLogin, setIsGarageLogin] = useState(true); // Will be auto-detected
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
  const BASE_URL = getAdminApiUrl().replace("/api/admin", "");

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
    if (logoutLoading) return;

    try {
      setLogoutLoading(true);
      const token = localStorage.getItem("token");
      const headers = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Determine which ID to use based on usertype
      let logoutId;
      if (currentUser?.userType === "garage") {
        logoutId = currentUser.garageId;
      } else if (currentUser?.userType === "user") {
        logoutId = localStorage.getItem("userId");
      } else {
        logoutId = currentUser?.garageId;
      }

      if (logoutId) {
        try {
          await axios.post(`${BASE_URL}/api/logout`, { logoutId }, { headers });
        } catch (error) {
          console.error("Logout API error:", error);
        }
      }

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("garageId");
      localStorage.removeItem("userId");
      localStorage.removeItem("name");

      setIsLoggedIn(false);
      setCurrentUser(null);
      setFormData({ email: "", password: "" });
      setError("");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value,
    });
    setForgotPasswordError("");
  };

  // Unified login function that auto-detects user type
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, try garage login
      let response = await fetch(`${BASE_URL}/api/garage/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      let data = await response.json();

      // If garage login fails, try user login
      if (!response.ok) {
        response = await fetch(`${BASE_URL}/api/user/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // User login successful
        setIsGarageLogin(false);
      } else {
        // Garage login successful
        setIsGarageLogin(true);
      }

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
      const userId = isGarageLogin ? data.garage?._id : data.user?._id;

      if (garageId) {
        localStorage.setItem("garageId", garageId);
      }

      if (userId) {
        localStorage.setItem("userId", userId);
      }

      setIsLoggedIn(true);
      setCurrentUser({
        userType: isGarageLogin ? "garage" : "user",
        garageId: garageId || null,
        token: data.token || null,
      });

      navigate("/");
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

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordLoading(true);

    if (
      !forgotPasswordData.newPassword ||
      !forgotPasswordData.confirmPassword
    ) {
      setForgotPasswordError("Please fill in all fields");
      setForgotPasswordLoading(false);
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setForgotPasswordError("Passwords do not match");
      setForgotPasswordLoading(false);
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      setForgotPasswordError("Password must be at least 6 characters long");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/verify/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp,
          newPassword: forgotPasswordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to reset password");
      }

      setForgotPasswordSuccess(
        "Password reset successfully! You can now login."
      );
      setTimeout(() => {
        closeForgotPasswordDialog();
        setFormData({ email: forgotPasswordData.email, password: "" });
      }, 2000);
    } catch (err) {
      setForgotPasswordError(err.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  // Theme colors - simplified for unified login
  const getThemeColors = () => {
    return { primary: "#1976d2", secondary: "#42a5f5", accent: "#2196F3" };
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
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {currentUser?.userType === "garage"
                  ? "Garage Management"
                  : "Customer Portal"}
              </Typography>
            </Box>
            <Button
              color="inherit"
              onClick={handleLogout}
              disabled={logoutLoading}
              startIcon={
                logoutLoading ? <CircularProgress size={16} /> : <ExitToApp />
              }
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`,
          pt: isLoggedIn ? 8 : 0,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {!isLoggedIn ? (
              <>
                {/* Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
                      mb: 2,
                    }}
                  >
                    <DirectionsCar sx={{ fontSize: 40, color: "white" }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign in to your account to continue
                  </Typography>
                </Box>

                {/* Login Form */}
                <Box component="form" onSubmit={handleLogin} noValidate>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    sx={getTextFieldStyles()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    sx={getTextFieldStyles()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      height: 48,
                      fontWeight: 600,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
                      "&:hover": {
                        background: `linear-gradient(45deg, ${colors.primary} 40%, ${colors.secondary} 100%)`,
                      },
                    }}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <VerifiedUser />
                      )
                    }
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>

                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={openForgotPasswordDialog}
                      sx={{
                        color: colors.primary,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      New to the platform?
                    </Typography>
                  </Divider>

                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      textAlign: "center",
                    }}
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
                </Box>
              </>
            ) : (
              <>
                {/* Welcome Message */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
                      mb: 2,
                    }}
                  >
                    {currentUser?.userType === "garage" ? (
                      <DirectionsCar sx={{ fontSize: 40, color: "white" }} />
                    ) : (
                      <AccountCircle sx={{ fontSize: 40, color: "white" }} />
                    )}
                  </Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome, {localStorage.getItem("name") || "User"}!
                  </Typography>
                  <Chip
                    label={
                      currentUser?.userType === "garage"
                        ? "Garage Owner"
                        : "Customer"
                    }
                    color="primary"
                    variant="outlined"
                    icon={
                      currentUser?.userType === "garage" ? (
                        <DirectionsCar />
                      ) : (
                        <AccountCircle />
                      )
                    }
                  />
                </Box>

                {/* Dashboard Access Button */}
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
              </>
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

          <Box sx={{ mt: 3 }}>
            {forgotPasswordStep === 0 && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Enter your email address to receive a password reset OTP.
                </Typography>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={forgotPasswordData.email}
                  onChange={handleForgotPasswordChange}
                  sx={getTextFieldStyles()}
                />
              </Box>
            )}

            {forgotPasswordStep === 1 && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Enter the OTP sent to your email address.
                </Typography>
                <TextField
                  fullWidth
                  label="OTP"
                  name="otp"
                  value={forgotPasswordData.otp}
                  onChange={handleForgotPasswordChange}
                  sx={getTextFieldStyles()}
                />
                {resendTimer > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Resend OTP in {resendTimer} seconds
                  </Typography>
                )}
              </Box>
            )}

            {forgotPasswordStep === 2 && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Enter your new password.
                </Typography>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={forgotPasswordData.newPassword}
                  onChange={handleForgotPasswordChange}
                  sx={{ ...getTextFieldStyles(), mb: 2 }}
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
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={forgotPasswordData.confirmPassword}
                  onChange={handleForgotPasswordChange}
                  sx={getTextFieldStyles()}
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

            {forgotPasswordError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {forgotPasswordError}
              </Alert>
            )}

            {forgotPasswordSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {forgotPasswordSuccess}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={closeForgotPasswordDialog} color="inherit">
            Cancel
          </Button>
          {forgotPasswordStep === 0 && (
            <Button
              onClick={handleSendOtp}
              disabled={forgotPasswordLoading || !forgotPasswordData.email}
              startIcon={
                forgotPasswordLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Send />
                )
              }
            >
              {forgotPasswordLoading ? "Sending..." : "Send OTP"}
            </Button>
          )}
          {forgotPasswordStep === 1 && (
            <Button
              onClick={handleVerifyOtp}
              disabled={forgotPasswordLoading || !forgotPasswordData.otp}
              startIcon={
                forgotPasswordLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <VerifiedUser />
                )
              }
            >
              {forgotPasswordLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          )}
          {forgotPasswordStep === 2 && (
            <Button
              onClick={handleResetPassword}
              disabled={
                forgotPasswordLoading ||
                !forgotPasswordData.newPassword ||
                !forgotPasswordData.confirmPassword
              }
              startIcon={
                forgotPasswordLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <VerifiedUser />
                )
              }
            >
              {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      {/* The original code had Snackbar imports and state, but they were not used in the new_code.
          Therefore, I will remove them as they are not directly related to the new_code's login flow. */}
    </>
  );
};

export default LoginPage;
