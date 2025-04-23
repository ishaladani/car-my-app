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
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginGarage } from './api';
const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
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
      // Use your API service to login
      const response = await loginGarage(formData.email, formData.password);
      
      // Handle successful login
      if (response && response.token) {
        // Store token in localStorage
        localStorage.setItem('garageToken', response.token);
        localStorage.setItem('garageData', JSON.stringify(response.garage));
        
        console.log('Login successful:', response);
        
        // Redirect to dashboard
        navigate('/');
      }
    } catch (err) {
      // Handle API errors
      if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
          p: 2
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: 430,
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            position: 'relative'
          }}
        >
          <Typography 
            variant="h3" 
            component="h1"
            sx={{
              mb: 4,
              fontWeight: 600,
              color: '#08197B'
            }}
          >
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              width: '100%'
            }}
          >
            <TextField
              fullWidth
              name="email"
              label="Email"
              variant="outlined"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F3F3F3',
                  '& fieldset': {
                    border: 'none'
                  }
                }
              }}
            />
            
            <TextField
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F3F3F3',
                  '& fieldset': {
                    border: 'none'
                  }
                }
              }}
              InputProps={{
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
                )
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{
                height: 40,
                width: 150,
                fontSize: '1rem',
                mb: 2,
                backgroundColor: '#08197B',
                '&:hover': {
                  backgroundColor: '#364ab8'
                },
                '&:disabled': {
                  backgroundColor: '#cccccc'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Login'
              )}
            </Button>
          </Box>
          
          <Typography variant="body1">
            Don't have an account?{' '}
            <Link 
              component="button"
              variant="body1"
              onClick={() => navigate('/signup')}
              sx={{
                fontWeight: 600,
                color: 'black',
                textDecoration: 'none',
                '&:hover': {
                  color: '#364ab8',
                  textDecoration: 'underline'
                }
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;