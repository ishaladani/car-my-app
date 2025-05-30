import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff, AddCircleOutline, CheckCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_qjd934YSnvGxQZ';

export default function SignUpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: ''
  });

  // UI/UX state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);

  // Available plans
  const plans = [
    {
      name: 'Free',
      price: 'Free',
      features: ['Basic garage management', 'Up to 5 vehicles', 'Basic reporting'],
      amount: 0,
      subscriptionType: 'free',
      popular: false,
      durationInMonths: 1,
      isFreePlan: true
    },
    {
      name: '1 Month',
      price: '₹999',
      features: ['Full garage management', 'Unlimited vehicles', 'Advanced reporting'],
      amount: 999,
      subscriptionType: 'monthly',
      popular: true,
      durationInMonths: 1,
      isFreePlan: false
    },
    {
      name: '6 Months',
      price: '₹2999',
      features: ['All premium features', 'Inventory management', 'Priority support'],
      amount: 2999,
      subscriptionType: 'half_yearly',
      popular: false,
      durationInMonths: 6,
      isFreePlan: false
    }
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Garage Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, '')))
      newErrors.phone = 'Phone number must be 10 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Plan selection handler
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenPlanDialog(false);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form.', 'error');
      return;
    }

    if (!selectedPlan) {
      showSnackbar('Please select a plan before submitting.', 'warning');
      return;
    }

    if (selectedPlan.isFreePlan) {
      await handleFreeSignup();
    } else {
      await handlePaidSignup();
    }
  };

  // Handle free signup
  const handleFreeSignup = async () => {
    try {
      setLoading(true);
      
      const requestBody = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        durationInMonths: selectedPlan.durationInMonths,
        amount: selectedPlan.amount,
        isFreePlan: true
      };

      console.log('Creating free account with:', requestBody);

      const response = await fetch(
        'https://garage-management-zi5z.onrender.com/api/garage/create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Account creation failed');
      }

      showSnackbar('✅ Free account created successfully!', 'success');
      navigate('/login');
    } catch (err) {
      console.error('Signup Error:', err);
      showSnackbar(err.message || 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle paid signup with Razorpay
  const handlePaidSignup = async () => {
    try {
      setLoading(true);

      // 1. Create order with backend
      const orderResponse = await fetch(
        'https://garage-management-zi5z.onrender.com/api/garage/payment/createorderforsignup',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            durationInMonths: selectedPlan.durationInMonths,
            amount: selectedPlan.amount,
            subscriptionType: selectedPlan.subscriptionType,
            isFreePlan: false
          })
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      console.log('Order created:', orderData);

      // 2. Initialize Razorpay payment
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: selectedPlan.amount * 100, // Razorpay expects paise
        currency: 'INR',
        name: 'Garage Management',
        description: `${selectedPlan.name} Subscription`,
        order_id: orderData.orderId || orderData.id,
        handler: async (response) => {
          // 3. Handle successful payment
          try {
            const verificationResponse = await fetch(
              'https://garage-management-zi5z.onrender.com/api/garage/create',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: formData.name,
                  address: formData.address,
                  phone: formData.phone,
                  email: formData.email,
                  password: formData.password,
                  durationInMonths: selectedPlan.durationInMonths,
                  amount: selectedPlan.amount,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  isFreePlan: false
                })
              }
            );

            if (!verificationResponse.ok) {
              const errorData = await verificationResponse.json();
              throw new Error(errorData.message || 'Account creation failed after payment');
            }

            showSnackbar('✅ Payment successful! Account created.', 'success');
            navigate('/login');
          } catch (err) {
            console.error('Account creation error:', err);
            showSnackbar(err.message || 'Account creation failed after payment', 'error');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#1976d2'
        }
      };

      // 4. Open Razorpay payment dialog
      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', (response) => {
        showSnackbar(`Payment failed: ${response.error.description}`, 'error');
      });

    } catch (err) {
      console.error('Payment setup error:', err);
      showSnackbar(err.message || 'Payment setup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the component remains the same)
  return (
     <Container maxWidth="md" sx={{ mt: 5 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: 3,
              bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff'
            }}
          >
            <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
              Create Your Garage Account
            </Typography>
    
            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Garage Name */}
              <TextField
                fullWidth
                label="Garage Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
                size="small"
              />
    
              {/* Email */}
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                size="small"
              />
    
              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
    
              {/* Address */}
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                margin="normal"
                size="small"
              />
    
              {/* Phone */}
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                margin="normal"
                size="small"
              />
    
              {/* Selected Plan Display */}
              {selectedPlan && (
                <Box
                  sx={{
                    border: '2px dashed #1976d2',
                    borderRadius: 2,
                    p: 2,
                    my: 2,
                    bgcolor: theme.palette.mode === 'dark' ? '#1a237e10' : '#bbdefb30'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography fontWeight="bold">{selectedPlan.name}</Typography>
                      <Typography color={selectedPlan.isFreePlan ? 'green' : 'primary'}>
                        {selectedPlan.price}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Duration: {selectedPlan.durationInMonths} month{selectedPlan.durationInMonths > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<AddCircleOutline />}
                      onClick={() => setOpenPlanDialog(true)}
                    >
                      Change Plan
                    </Button>
                  </Box>
                </Box>
              )}
    
              {/* Choose Plan Button */}
              {!selectedPlan && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddCircleOutline />}
                  onClick={() => setOpenPlanDialog(true)}
                  sx={{ mb: 2 }}
                >
                  Choose Subscription Plan
                </Button>
              )}
    
              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                disabled={loading || !selectedPlan}
                startIcon={selectedPlan?.isFreePlan ? null : <CheckCircleOutline />}
                onClick={handleSubmit}
                sx={{ py: 1.5 }}
              >
                {loading
                  ? 'Processing...'
                  : selectedPlan?.isFreePlan
                  ? 'Create Free Account'
                  : `Pay ${selectedPlan?.price} & Create Account`}
              </Button>
    
              {/* Login Link */}
              <Box mt={3} textAlign="center">
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ cursor: 'pointer' }}
                    fontWeight="bold"
                    onClick={() => navigate('/login')}
                  >
                    Login here
                  </Typography>
                </Typography>
              </Box>
            </form>
          </Box>
    
          {/* Plan Selection Dialog */}
          <Dialog open={openPlanDialog} onClose={() => setOpenPlanDialog(false)} fullScreen={isMobile}>
            <DialogTitle>Select Your Plan</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ my: 1 }}>
                {plans.map((plan, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box
                      onClick={() => handleSelectPlan(plan)}
                      sx={{
                        p: 2,
                        border: selectedPlan?.name === plan.name ? '2px solid #1976d2' : '1px solid #ccc',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        position: 'relative',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: 3
                        }
                      }}
                    >
                      {plan.popular && (
                        <Chip
                          label="Popular"
                          color="secondary"
                          size="small"
                          sx={{ position: 'absolute', top: -8, right: 8 }}
                        />
                      )}
                      <Typography variant="h6" fontWeight="bold">
                        {plan.name}
                      </Typography>
                      <Typography
                        variant="h5"
                        color={plan.isFreePlan ? 'green' : 'orange'}
                        fontWeight="bold"
                      >
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {plan.durationInMonths} month{plan.durationInMonths > 1 ? 's' : ''}
                      </Typography>
                      <Box component="ul" sx={{ paddingLeft: '1rem', mt: 1, mb: 0 }}>
                        {plan.features.map((feature, i) => (
                          <Box component="li" key={i} sx={{ mb: 0.5 }}>
                            <Typography variant="body2" color="textSecondary">
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPlanDialog(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>
    
          {/* Snackbar Notification */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
  );
}