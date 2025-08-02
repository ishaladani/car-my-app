import React, { useState, useEffect } from 'react';
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
  Container
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Logout,
  ExitToApp
} from '@mui/icons-material';
import axios from 'axios';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isGarageLogin, setIsGarageLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Forgot Password State
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // API Base URL
  const BASE_URL = 'https://garage-management-zi5z.onrender.com';

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const garageId = localStorage.getItem('garageId');
    if (token && userType && garageId) {
      setIsLoggedIn(true);
      setCurrentUser({
        userType,
        garageId,
        token
      });
      setIsGarageLogin(userType === 'garage');
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    console.log("=== LOGOUT BUTTON CLICKED ===");
    setLogoutLoading(true);
    try {
      const storedUserId = localStorage.getItem("garageId");
      const token = localStorage.getItem("token");
      console.log("Stored userId:", storedUserId);
      console.log("Stored token:", token ? "Token exists" : "No token found");
      if (!storedUserId) {
        console.error("No userId found in localStorage");
        return;
      }
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      console.log("Making API call to logout...");
      const response = await axios.post(
        `${BASE_URL}/api/garage/logout/${storedUserId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("Logout API response:", response.data);
      console.log("Logout API called successfully");
    } catch (error) {
      console.error("Error calling logout API:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } finally {
      console.log("Clearing localStorage and resetting state...");
      localStorage.clear();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setFormData({ email: '', password: '' });
      setError('');
      setLogoutLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // Handle forgot password form changes
  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (forgotPasswordError) setForgotPasswordError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isGarageLogin 
        ? `${BASE_URL}/api/garage/login`
        : `${BASE_URL}/api/garage/user/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Handle subscription expiry
      if (data.message && data.message.includes('subscription has expired')) {
        if (isGarageLogin && data.garage && data.garage._id) {
          localStorage.setItem('garageId', data.garage._id);
          localStorage.setItem('garageName', data.garage.name || 'Your Garage');
          localStorage.setItem('garageEmail', data.garage.email || formData.email);
        }
        navigate('/renew-plan', {
          state: {
            garageId: data.garage?._id,
            garageName: data.garage?.name || 'Your Garage',
            garageEmail: data.garage?.email || formData.email,
            message: data.message
          }
        });
        return;
      }

      // Normal login flow
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', isGarageLogin ? 'garage' : 'user');
      localStorage.setItem('name', isGarageLogin ? data.garage.name : data.user.name);

      if (isGarageLogin && data.garage && data.garage._id) {
        localStorage.setItem('garageId', data.garage._id);
      } else if (!isGarageLogin && data.user && data.user.garageId) {
        localStorage.setItem('garageId', data.user.garageId);
      }

      setIsLoggedIn(true);
      setCurrentUser({
        userType: isGarageLogin ? 'garage' : 'user',
        garageId: isGarageLogin ? data.garage?._id : data.user?.garageId,
        token: data.token
      });

      const redirectPath = isGarageLogin ? '/' : '/';
      navigate(redirectPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordLoading(true);
    if (!forgotPasswordData.email) {
      setForgotPasswordError('Please enter your email address');
      setForgotPasswordLoading(false);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/verify/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: forgotPasswordData.email
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send OTP');
      }
      const data = await response.json();
      setForgotPasswordSuccess('OTP sent successfully! Please check your email.');
      setOtpSent(true);
      setForgotPasswordStep(1);
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(prev => {
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
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordLoading(true);
    if (!forgotPasswordData.otp) {
      setForgotPasswordError('Please enter the OTP');
      setForgotPasswordLoading(false);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/verify/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid OTP');
      }
      const data = await response.json();
      setForgotPasswordSuccess('OTP verified successfully!');
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
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordLoading(true);
    if (!forgotPasswordData.newPassword || !forgotPasswordData.confirmPassword) {
      setForgotPasswordError('Please fill in all password fields');
      setForgotPasswordLoading(false);
      return;
    }
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      setForgotPasswordLoading(false);
      return;
    }
    if (forgotPasswordData.newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters long');
      setForgotPasswordLoading(false);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/verify/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          newPassword: forgotPasswordData.newPassword
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Password reset failed');
      }
      const data = await response.json();
      setForgotPasswordSuccess('Password reset successfully! You can now login with your new password.');
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
    setFormData({ email: '', password: '' });
    setError('');
  };

  const openForgotPasswordDialog = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordStep(0);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setOtpSent(false);
    setOtpVerified(false);
    setResendTimer(0);
  };

  const closeForgotPasswordDialog = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordStep(0);
    setForgotPasswordData({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setOtpSent(false);
    setOtpVerified(false);
    setResendTimer(0);
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      handleSendOtp({ preventDefault: () => {} });
    }
  };

  // Dynamic styling based on login type
  const getThemeColors = () => {
    return isGarageLogin 
      ? { primary: '#08197B', secondary: '#364ab8', accent: '#2196F3' }
      : { primary: '#2E7D32', secondary: '#4CAF50', accent: '#66BB6A' };
  };
  const colors = getThemeColors();

  // Theme-aware TextField styles
  const getTextFieldStyles = () => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? theme.palette.background.paper 
        : theme.palette.background.default,
      color: theme.palette.text.primary,
      borderRadius: 2,
      '& fieldset': {
        borderColor: theme.palette.mode === 'dark' 
          ? theme.palette.divider 
          : theme.palette.grey[300]
      },
      '&:hover fieldset': {
        borderColor: colors.secondary
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary
      },
      '& input': {
        color: theme.palette.text.primary,
      },
      '& input::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 0.7
      }
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      '&.Mui-focused': {
        color: colors.primary
      }
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      color: theme.palette.text.secondary
    }
  });

  const steps = ['Verify Email', 'Enter OTP', 'New Password'];

  return (
    <>
      <CssBaseline />
      
      {/* Top Navigation Bar with Logout (Only when logged in) */}
      {isLoggedIn && (
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{ 
            backgroundColor: 'transparent',
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.appBar
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" component="div" sx={{ color: colors.primary, fontWeight: 600 }}>
                Garage Management
              </Typography>
              <Chip
                icon={currentUser?.userType === 'garage' ? <DirectionsCar /> : <AccountCircle />}
                label={`Logged in as ${currentUser?.userType === 'garage' ? 'Garage' : 'User'}`}
                size="small"
                sx={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  fontWeight: 500
                }}
              />
            </Box>
            <Button
              variant="outlined"
              onClick={handleLogout}
              disabled={logoutLoading}
              startIcon={logoutLoading ? <CircularProgress size={16} /> : <ExitToApp />}
              sx={{
                borderColor: '#ff4444',
                color: '#ff4444',
                backgroundColor: 'rgba(255, 68, 68, 0.08)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#cc3333',
                  backgroundColor: 'rgba(255, 68, 68, 0.15)',
                  color: '#cc3333'
                },
                '&:disabled': {
                  borderColor: theme.palette.text.disabled,
                  color: theme.palette.text.disabled,
                  backgroundColor: 'transparent'
                }
              }}
            >
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          p: 2,
          pt: isLoggedIn ? 10 : 2,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${colors.primary}25 0%, ${colors.accent}15 100%)`
            : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}10 100%)`
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{
              width: '100%',
              maxWidth: 450,
              mx: 'auto',
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              position: 'relative',
              backgroundColor: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark' 
                ? `1px solid ${theme.palette.divider}` 
                : 'none'
            }}
          >
            {/* Show expiry alert if redirected from expired session */}
            {location.state?.message && (
              <Alert
                severity="warning"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: '#fff3e0',
                  color: '#e65100',
                  fontWeight: 500
                }}
              >
                {location.state.message}
              </Alert>
            )}

            {/* Already Logged In Alert */}
            {isLoggedIn && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.success.dark 
                    : theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                  '& .MuiAlert-message': {
                    fontWeight: 500
                  }
                }}
              >
                ✅ You are successfully logged in as {currentUser?.userType === 'garage' ? 'Garage Owner' : 'Customer'}. 
                Use the logout button above to switch accounts.
              </Alert>
            )}

            {/* Login Type Indicator */}
            <Box sx={{ mb: 3 }}>
              <Chip
                icon={isGarageLogin ? <DirectionsCar /> : <AccountCircle />}
                label={`${isGarageLogin ? 'Garage' : 'User'} Login`}
                sx={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1
                }}
              />
            </Box>

            <Typography 
              variant="h3" 
              component="h1"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: colors.primary,
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              {isLoggedIn ? 'Account Status' : 'Welcome Back'}
            </Typography>

            <Typography 
              variant="body1" 
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                fontSize: '1.1rem'
              }}
            >
              {isLoggedIn 
                ? 'You are currently signed in. Use the navigation above to access your dashboard or logout.'
                : (isGarageLogin 
                  ? 'Access your garage management system'
                  : 'Sign in to your customer account')
              }
            </Typography>

            {/* Show login form only when not logged in */}
            {!isLoggedIn && (
              <>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? theme.palette.error.dark 
                        : theme.palette.error.light,
                      color: theme.palette.error.contrastText,
                      '& .MuiAlert-message': {
                        fontWeight: 500
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    placeholder={isGarageLogin ? "garage@example.com" : "user@example.com"}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={{
                      mb: 3,
                      ...getTextFieldStyles()
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {isGarageLogin ? <Business color="action" /> : <Person color="action" />}
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    sx={{
                      mb: 2,
                      ...getTextFieldStyles()
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            sx={{ color: colors.primary }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  {/* Forgot Password Link */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={openForgotPasswordDialog}
                      sx={{
                        color: colors.primary,
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          color: colors.secondary,
                          textDecoration: 'underline'
                        }
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
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 3,
                      borderRadius: 2,
                      backgroundColor: colors.primary,
                      background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
                      '&:hover': {
                        backgroundColor: colors.secondary,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 6px 20px ${colors.primary}30`
                      },
                      '&:disabled': {
                        backgroundColor: theme.palette.action.disabledBackground,
                        color: theme.palette.action.disabled
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      `Sign In as ${isGarageLogin ? 'Garage' : 'User'}`
                    )}
                  </Button>
                </Box>

                {/* Renew Plan Button */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/renew-plan')}
                    startIcon={<VerifiedUser />}
                    sx={{
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '&:hover': {
                        borderColor: '#f57c00',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        color: '#f57c00'
                      },
                      fontWeight: 600,
                      width: '100%'
                    }}
                  >
                    Renew Your Plan
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
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: colors.primary,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: colors.primary,
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isGarageLogin ? <DirectionsCar /> : <AccountCircle />}
                      <Typography variant="body1" fontWeight={500}>
                        {isGarageLogin ? 'Garage Owner' : 'Customer'}
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 3 }}
                />

                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  Don't have an account?{' '}
                  <Link 
                    component="button"
                    variant="body1"
                    onClick={() => navigate('/signup')}
                    sx={{
                      fontWeight: 600,
                      color: colors.primary,
                      textDecoration: 'none',
                      '&:hover': {
                        color: colors.secondary,
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Create Account
                  </Link>
                </Typography>
              </>
            )}

            {/* Show dashboard access buttons when logged in */}
            {isLoggedIn && (
              <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                  startIcon={currentUser?.userType === 'garage' ? <DirectionsCar /> : <AccountCircle />}
                  sx={{
                    height: 48,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: colors.primary,
                    background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
                    '&:hover': {
                      backgroundColor: colors.secondary,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 6px 20px ${colors.primary}30`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Go to Dashboard
                </Button>
              </Box>
            )}

            {/* Additional Info */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: theme.palette.mode === 'dark' 
                ? `${colors.primary}20` 
                : `${colors.primary}08`, 
              borderRadius: 2 
            }}>
              <Typography variant="body2" color="text.secondary">
                {isLoggedIn 
                  ? '🎉 You have full access to your account features and dashboard'
                  : (isGarageLogin 
                    ? '🔧 Manage your garage operations, appointments, and customer service'
                    : '🚗 Book services, track repairs, and manage your vehicle maintenance')
                }
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={closeForgotPasswordDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            backgroundColor: theme.palette.background.paper,
            border: theme.palette.mode === 'dark' 
              ? `1px solid ${theme.palette.divider}` 
              : 'none'
          }
        }}
      >
        {/* ... existing dialog content ... */}
      </Dialog>
    </>
  );
};

export default LoginPage;