import React,{ useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  InputAdornment, 
  IconButton,
  Switch, 
  Card, 
  CardContent,
  Grid,
  FormControlLabel,
  Dialog,
  AppBar,
  Toolbar,
  Slide,
  useTheme,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Link,
  Snackbar,
  Alert
} from '@mui/material';

// Import Material UI icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Transition for the subscription dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SignUpPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Updated form fields to match API requirements
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    address: '',
    phone: ''
  });

  // Create a theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleOpenSubscriptionDialog = () => {
    setOpenSubscriptionDialog(true);
  };

  const handleCloseSubscriptionDialog = () => {
    setOpenSubscriptionDialog(false);
  };

  const selectPlan = (plan, price) => {
    setSelectedPlan({ plan, price });
    handleCloseSubscriptionDialog();
  };

  const cancelPlan = () => {
    setSelectedPlan(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handleRazorpayPayment = async () => {
  try {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Create order on your backend (you'll need to implement this endpoint)
    const orderResponse = await fetch('https://garage-management-system-cr4w.onrender.com/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: selectedPlan.price === 'Free' ? 0 : parseInt(selectedPlan.price.replace(/\D/g, '')) * 100, // Convert to paise
        currency: 'INR',
        receipt: `garage_signup_${Date.now()}`
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(orderData.message || 'Failed to create payment order');
    }

    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Garage Management System',
      description: `Payment for ${selectedPlan.plan} plan`,
      order_id: orderData.id,
      handler: async function(response) {
        // Verify payment on your backend
        const verificationResponse = await fetch('https://your-backend-api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            plan: selectedPlan.plan,
            price: selectedPlan.price,
            ...formData
          }),
        });

        const verificationData = await verificationResponse.json();

        if (verificationResponse.ok) {
          setSnackbar({
            open: true,
            message: 'Payment successful! Account created.',
            severity: 'success'
          });
          // Proceed with form submission
          handleSubmit(new Event('submit'));
        } else {
          throw new Error(verificationData.message || 'Payment verification failed');
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      notes: {
        address: formData.address,
        plan: selectedPlan.plan
      },
      theme: {
        color: '#3399cc'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    
    rzp.on('payment.failed', function(response) {
      setSnackbar({
        open: true,
        message: `Payment failed: ${response.error.description}`,
        severity: 'error'
      });
    });

  } catch (error) {
    setSnackbar({
      open: true,
      message: error.message || 'Payment processing error',
      severity: 'error'
    });
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // If free plan, submit directly
  if (selectedPlan?.price === 'Free') {
    setLoading(true);
    try {
      const response = await fetch('https://garage-management-system-cr4w.onrender.com/api/garage/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
          location: formData.location,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          plan: selectedPlan?.plan || 'Free'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Garage created successfully!',
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to create garage');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  } else {
    // For paid plans, initiate payment
    handleRazorpayPayment();
  }
};

  const plans = [
  { 
    name: 'Basic', 
    price: 'Free', 
    features: ['Limited access', 'Basic support', '1 project'],
    amount: 0
  },
  { 
    name: 'Standard', 
    price: '₹999/mo', 
    features: ['Full access', 'Priority support', '5 projects'],
    amount: 99900 // in paise
  },
  { 
    name: 'Premium', 
    price: '₹1999/mo', 
    features: ['Premium features', '24/7 support', 'Unlimited projects'],
    amount: 199900 // in paise
  }
];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          bgcolor: 'background.default',
          transition: 'background-color 0.3s'
        }}
      >
        {/* Dark Mode Toggle */}
        <FormControlLabel
          control={
            <Switch 
              checked={isDarkMode} 
              onChange={toggleDarkMode} 
              icon={<LightModeIcon />}
              checkedIcon={<DarkModeIcon />}
              sx={{ 
                '& .MuiSwitch-switchBase.Mui-checked': { 
                  color: '#f9a825' 
                } 
              }}
            />
          }
          label={isDarkMode ? "Dark Mode" : "Light Mode"}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16
          }}
        />

        <Container maxWidth="md">
          <Paper 
            elevation={6} 
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              Create Garage Account
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                margin="normal"
                id="name"
                name="name"
                label="Garage Name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                required
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
              
              <TextField
                fullWidth
                margin="normal"
                id="location"
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                variant="outlined"
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                id="address"
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                variant="outlined"
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                id="phone"
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                required
              />

              {/* Selected Plan Display */}
              {selectedPlan && (
                <Card 
                  sx={{ 
                    mt: 3,
                    mb: 3,
                    position: 'relative',
                    border: `2px dashed ${theme.palette.primary.main}`,
                    bgcolor: isDarkMode ? 'rgba(63, 81, 181, 0.1)' : 'rgba(63, 81, 181, 0.05)'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Selected Plan:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {selectedPlan.plan}
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: theme.palette.mode === 'dark' ? '#f9a825' : '#f57c00'
                      }}
                    >
                      {selectedPlan.price}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={cancelPlan}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'error.dark',
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </CardContent>
                </Card>
              )}

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleOpenSubscriptionDialog}
                sx={{ mt: 2, mb: 2, py: 1.5 }}
              >
                Choose Subscription
              </Button>

              <Button
  type="submit"
  fullWidth
  variant="contained"
  color="primary"
  disabled={loading || !selectedPlan}
  sx={{ 
    mt: 1, 
    mb: 2, 
    py: 1.5,
    position: 'relative'
  }}
>
  {selectedPlan?.price === 'Free' 
    ? (loading ? 'Creating Account...' : 'Sign Up') 
    : (loading ? 'Processing...' : `Pay ${selectedPlan?.price} & Sign Up`)}
</Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link 
                    href="#" 
                    underline="hover" 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer' 
                    }}
                  >
                    Login
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>

        {/* Subscription Dialog */}
        <Dialog
          fullWidth
          maxWidth="sm"
          open={openSubscriptionDialog}
          onClose={handleCloseSubscriptionDialog}
          TransitionComponent={Transition}
        >
          <AppBar position="static" color="primary" sx={{ position: 'relative' }}>
            <Toolbar>
              <Typography sx={{ flex: 1 }} variant="h6" component="div">
                Choose Your Plan
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseSubscriptionDialog}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {plans.map((plan, index) => (
                <Grid item xs={12} key={index}>
                  <Card 
                    raised={selectedPlan?.plan === plan.name}
                    onClick={() => selectPlan(plan.name, plan.price)}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      transform: selectedPlan?.plan === plan.name ? 'scale(1.02)' : 'scale(1)',
                      border: selectedPlan?.plan === plan.name ? `2px solid ${theme.palette.primary.main}` : 'none',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="div">
                          {plan.name}
                        </Typography>
                        <Typography 
                          variant="h5" 
                          component="div" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: theme.palette.mode === 'dark' ? '#f9a825' : '#f57c00'
                          }}
                        >
                          {plan.price}
                        </Typography>
                      </Box>
                      <Box>
                        {plan.features.map((feature, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircleOutlineIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default SignUpPage;