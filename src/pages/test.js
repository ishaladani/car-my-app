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
  ExitToApp
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
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

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const garageId = localStorage.getItem('garageId');
    if (token && userType && garageId) {
      setIsLoggedIn(true);
      setCurrentUser({ userType, garageId, token });
      setIsGarageLogin(userType === 'garage');
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const storedUserId = localStorage.getItem("garageId");
      const token = localStorage.getItem("token");

      if (!storedUserId) {
        console.error("No userId found in localStorage");
      }
      if (!token) {
        console.error("No token found in localStorage");
      }

      await axios.post(
        `${BASE_URL}/api/garage/logout/${storedUserId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Handle forgot password form changes
  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({ ...prev, [name]: value }));
    if (forgotPasswordError) setForgotPasswordError('');
  };

  // Main Login Handler
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // 🔥 Redirect to renew-plan if subscription has expired
      if (data.message && data.message.includes('subscription has expired')) {
        if (isGarageLogin && data.garage?._id) {
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

      // Save login data and redirect
      localStorage.setItem('token', data.token);
      const userType = isGarageLogin ? 'garage' : 'user';
      localStorage.setItem('userType', userType);
      localStorage.setItem('name', isGarageLogin ? data.garage.name : data.user.name);

      const garageId = isGarageLogin 
        ? data.garage?._id 
        : data.user?.garageId;

      localStorage.setItem('garageId', garageId);

      setIsLoggedIn(true);
      setCurrentUser({ userType, garageId, token: data.token });

      navigate(isGarageLogin ? '/' : '/');
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Send OTP
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordData.email })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send OTP');
      }

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

  // Forgot Password: Verify OTP
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid OTP');
      }

      setForgotPasswordSuccess('OTP verified successfully!');
      setOtpVerified(true);
      setForgotPasswordStep(2);
    } catch (err) {
      setForgotPasswordError(err.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Forgot Password: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordLoading(true);

    const { newPassword, confirmPassword } = forgotPasswordData;
    if (!newPassword || !confirmPassword) {
      setForgotPasswordError('Please fill in all password fields');
      setForgotPasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      setForgotPasswordLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters long');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/verify/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Password reset failed');
      }

      setForgotPasswordSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        closeForgotPasswordDialog();
      }, 3000);
    } catch (err) {
      setForgotPasswordError(err.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Switch between garage and user login
  const handleLoginTypeChange = (e) => {
    setIsGarageLogin(e.target.checked);
    setFormData({ email: '', password: '' });
    setError('');
  };

  // Open forgot password dialog
  const openForgotPasswordDialog = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordStep(0);
    setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setOtpSent(false);
    setOtpVerified(false);
    setResendTimer(0);
  };

  // Close forgot password dialog
  const closeForgotPasswordDialog = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordStep(0);
    setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setOtpSent(false);
    setOtpVerified(false);
    setResendTimer(0);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer === 0) {
      handleSendOtp({ preventDefault: () => {} });
    }
  };

  // Theme color based on login type
  const getThemeColors = () => {
    return isGarageLogin 
      ? { primary: '#08197B', secondary: '#364ab8', accent: '#2196F3' }
      : { primary: '#2E7D32', secondary: '#4CAF50', accent: '#66BB6A' };
  };
  const colors = getThemeColors();

  // Dynamic TextField styles
  const getTextFieldStyles = () => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? theme.palette.background.paper 
        : theme.palette.background.default,
      borderRadius: 2,
      '& fieldset': {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : '#ddd'
      },
      '&:hover fieldset': { borderColor: colors.secondary },
      '&.Mui-focused fieldset': { borderColor: colors.primary }
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      '&.Mui-focused': { color: colors.primary }
    }
  });

  const steps = ['Verify Email', 'Enter OTP', 'New Password'];

  return (
    <>
      <CssBaseline />
      
      {/* Top Bar (Visible when logged in) */}
      {isLoggedIn && (
        <AppBar position="fixed" elevation={0} sx={{ backgroundColor: 'transparent', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>Garage Management</Typography>
              <Chip
                icon={currentUser?.userType === 'garage' ? <DirectionsCar /> : <AccountCircle />}
                label={`Logged in as ${currentUser?.userType}`}
                size="small"
                sx={{ backgroundColor: colors.primary, color: 'white' }}
              />
            </Box>
            <Button
              variant="outlined"
              onClick={handleLogout}
              disabled={logoutLoading}
              startIcon={logoutLoading ? <CircularProgress size={16} /> : <ExitToApp />}
              sx={{ borderColor: '#ff4444', color: '#ff4444' }}
            >
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </Toolbar>
        </AppBar>
      )}

      {/* Main Login Page */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
          pt: isLoggedIn ? 10 : 2,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${colors.primary}25 0%, ${colors.accent}15 100%)`
            : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}10 100%)`
        }}
      >
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: theme.palette.background.paper }}>
            {isLoggedIn ? (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>✅ You are logged in as {currentUser?.userType === 'garage' ? 'Garage Owner' : 'Customer'}</Alert>
            ) : null}

            <Chip
              icon={isGarageLogin ? <DirectionsCar /> : <AccountCircle />}
              label={`${isGarageLogin ? 'Garage' : 'User'} Login`}
              sx={{ backgroundColor: colors.primary, color: 'white', fontWeight: 600, mb: 3 }}
            />

            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: colors.primary }}>Welcome Back</Typography>
            <Typography variant="body1" sx={{ mb: 4, color: theme.palette.text.secondary }}>
              {isGarageLogin ? 'Access your garage management system' : 'Sign in to your customer account'}
            </Typography>

            {!isLoggedIn && (
              <Box component="form" onSubmit={handleLogin}>
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

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
                        {isGarageLogin ? <Business /> : <Person />}
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2, ...getTextFieldStyles() }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end" sx={{ color: colors.primary }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Link
                    component="button"
                    onClick={openForgotPasswordDialog}
                    sx={{ color: colors.primary, textDecoration: 'none', fontWeight: 500 }}
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
                    borderRadius: 2,
                    backgroundColor: colors.primary,
                    background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : `Sign In as ${isGarageLogin ? 'Garage' : 'User'}`}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">Switch Login Type</Typography>
                </Divider>

                <FormControlLabel
                  control={<Switch checked={isGarageLogin} onChange={handleLoginTypeChange} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isGarageLogin ? <DirectionsCar /> : <AccountCircle />}
                      <Typography fontWeight={500}>{isGarageLogin ? 'Garage Owner' : 'Customer'}</Typography>
                    </Box>
                  }
                />

                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  Don't have an account?{' '}
                  <Link 
                    component="button"
                    onClick={() => navigate('/signup')}
                    sx={{ fontWeight: 600, color: colors.primary }}
                  >
                    Create Account
                  </Link>
                </Typography>
              </Box>
            )}

            {isLoggedIn && (
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                startIcon={currentUser?.userType === 'garage' ? <DirectionsCar /> : <AccountCircle />}
                sx={{
                  mt: 4,
                  height: 48,
                  fontWeight: 600,
                  backgroundColor: colors.primary,
                  background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`
                }}
              >
                Go to Dashboard
              </Button>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={closeForgotPasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: colors.primary, fontWeight: 700 }}>
          <Lock /> Reset Password
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={forgotPasswordStep}>{steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>

          {forgotPasswordError && <Alert severity="error" sx={{ mb: 2 }}>{forgotPasswordError}</Alert>}
          {forgotPasswordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{forgotPasswordSuccess}</Alert>}

          {forgotPasswordStep === 0 && (
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={forgotPasswordData.email}
              onChange={handleForgotPasswordChange}
              required
              sx={{ mt: 2, ...getTextFieldStyles() }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
            />
          )}

          {forgotPasswordStep === 1 && (
            <>
              <TextField
                fullWidth
                name="otp"
                label="Enter OTP"
                type="text"
                value={forgotPasswordData.otp}
                onChange={handleForgotPasswordChange}
                required
                inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
                sx={{ mb: 2, ...getTextFieldStyles() }}
                InputProps={{ startAdornment: <InputAdornment position="start"><VerifiedUser /></InputAdornment> }}
              />
              <Button disabled={resendTimer > 0} onClick={handleResendOtp} sx={{ color: colors.primary }}>
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </Button>
            </>
          )}

          {forgotPasswordStep === 2 && (
            <>
              <TextField
                fullWidth
                name="newPassword"
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={forgotPasswordData.newPassword}
                onChange={handleForgotPasswordChange}
                required
                sx={{ mb: 2, ...getTextFieldStyles() }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" sx={{ color: colors.primary }}>
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={forgotPasswordData.confirmPassword}
                onChange={handleForgotPasswordChange}
                required
                sx={{ mb: 3, ...getTextFieldStyles() }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: colors.primary }}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeForgotPasswordDialog} variant="outlined" sx={{ borderColor: colors.primary, color: colors.primary }}>
            Cancel
          </Button>
          {forgotPasswordStep === 0 && (
            <Button onClick={handleSendOtp} variant="contained" disabled={forgotPasswordLoading} startIcon={<Send />}>
              {forgotPasswordLoading ? <CircularProgress size={20} color="inherit" /> : 'Send OTP'}
            </Button>
          )}
          {forgotPasswordStep === 1 && (
            <Button onClick={handleVerifyOtp} variant="contained" disabled={forgotPasswordLoading} startIcon={<VerifiedUser />}>
              {forgotPasswordLoading ? <CircularProgress size={20} color="inherit" /> : 'Verify OTP'}
            </Button>
          )}
          {forgotPasswordStep === 2 && (
            <Button onClick={handleResetPassword} variant="contained" disabled={forgotPasswordLoading} startIcon={<Lock />}>
              {forgotPasswordLoading ? <CircularProgress size={20} color="inherit" /> : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginPage;