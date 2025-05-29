import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Visibility, 
  VisibilityOff, 
  Business, 
  Person,
  DirectionsCar,
  AccountCircle 
} from '@mui/icons-material';

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

  // API Base URL
  const BASE_URL = 'https://garage-management-zi5z.onrender.com';

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  // Basic validation
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
    
    // Store token and user type in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('userType', isGarageLogin ? 'garage' : 'user');
    
    // Store garageId based on login type and response structure
    if (isGarageLogin && data.garage && data.garage._id) {
      // For garage login: garageId is at data.garage._id
      localStorage.setItem('garageId', data.garage._id);
    } else if (!isGarageLogin && data.user && data.user.garageId) {
  localStorage.setItem('garageId', data.user.garageId);
}
    
    // Navigate to appropriate dashboard
    const redirectPath = isGarageLogin ? '/' : '/';
    navigate(redirectPath);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginTypeChange = (e) => {
    setIsGarageLogin(e.target.checked);
    // Clear form and error when switching login types
    setFormData({ email: '', password: '' });
    setError('');
  };

  // Dynamic styling based on login type
  const getThemeColors = () => {
    return isGarageLogin 
      ? { primary: '#08197B', secondary: '#364ab8', accent: '#2196F3' }
      : { primary: '#2E7D32', secondary: '#4CAF50', accent: '#66BB6A' };
  };

  const colors = getThemeColors();

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          p: 2,
          background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}10 100%)`
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: 450,
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
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
            Welcome Back
          </Typography>

          <Typography 
            variant="body1" 
            sx={{
              mb: 4,
              color: theme.palette.text.secondary,
              fontSize: '1.1rem'
            }}
          >
            {isGarageLogin 
              ? 'Access your garage management system'
              : 'Sign in to your customer account'
            }
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontWeight: 500
                }
              }}
            >
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleLogin}
            sx={{ width: '100%' }}
          >
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
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FAFAFA',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#E0E0E0'
                  },
                  '&:hover fieldset': {
                    borderColor: colors.secondary
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.primary
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: colors.primary
                }
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
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FAFAFA',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#E0E0E0'
                  },
                  '&:hover fieldset': {
                    borderColor: colors.secondary
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.primary
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: colors.primary
                }
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
                  backgroundColor: '#CCCCCC'
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

          {/* Additional Info based on login type */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: `${colors.primary}08`, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {isGarageLogin 
                ? '🔧 Manage your garage operations, appointments, and customer service'
                : '🚗 Book services, track repairs, and manage your vehicle maintenance'
              }
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;