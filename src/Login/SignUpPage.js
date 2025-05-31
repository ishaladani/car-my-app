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
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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

// Fixed Razorpay key configuration
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_qjd934YSnvGxQZ';

const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080'];

export default function SignUpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigation = useNavigate(); 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: 'Free',
      features: ['Basicgarage  management', 'Up to 5 vehicles', 'Basic reporting'],
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
      subscriptionType: '1_month',
      popular: true,
      durationInMonths: 1,
      isFreePlan: false
    },
    {
      name: '3 Months',
      price: '₹1999',
      features: ['All Free features', 'Inventory management', 'Priority support'],
      amount: 1999,
      subscriptionType: '3_months',
      popular: false,
      durationInMonths: 3,
      isFreePlan: false
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

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

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenPlanDialog(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form.', 'error');
      return;
    }

    if (!selectedPlan) {
      showSnackbar('Please select a plan before submitting.', 'warning');
      return;
    }

    if (selectedPlan.amount === 0) {
      await handleGarageSignup();
    } else {
      await handleRazorpayPayment();
    }
  };
// Replace the order handling section (around lines 140-155) with this fixed version:

const handleRazorpayPayment = async () => {
  try {
    setLoading(true);
    
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
    }

    // Validate Razorpay key - fixed validation logic
    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === '' || RAZORPAY_KEY_ID.includes('your_actual_key_here')) {
      throw new Error('Razorpay key not configured. Please contact support.');
    }

    console.log('Using Razorpay Key:', RAZORPAY_KEY_ID); // For debugging
    
    // 1. Create Razorpay order
    const orderResponse = await fetch('https://garage-management-zi5z.onrender.com/api/garage/payment/createorderforsignup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: selectedPlan.amount,
        subscriptionType: selectedPlan.subscriptionType
      })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${orderResponse.status} - ${orderResponse.statusText}`);
    }

    const orderData = await orderResponse.json();
    
    // Debug log to see what we're getting from the server
    console.log('Order response from server:', orderData);
    
    // FIXED: Handle nested order object structure
    let orderId, orderAmount;
    
    if (orderData.order && typeof orderData.order === 'object') {
      // Server returns { success: true, order: { id: "...", amount: ... } }
      orderId = orderData.order.id || orderData.order.order_id || orderData.order.orderId;
      orderAmount = orderData.order.amount || orderData.order.amount_due || selectedPlan.amount * 100;
    } else {
      // Fallback: Server returns order details directly
      orderId = orderData.id || orderData.order_id || orderData.orderId || orderData.razorpayOrderId;
      orderAmount = orderData.amount || orderData.amount_due || selectedPlan.amount * 100;
    }
    
    if (!orderId) {
      console.error('Full order response:', JSON.stringify(orderData, null, 2));
      throw new Error(`Invalid order response from server. No order ID found in response structure.`);
    }

    console.log('Extracted Order ID:', orderId);
    console.log('Order Amount:', orderAmount);

    // 2. Open Razorpay payment dialog
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderAmount,
      currency: 'INR',
      name: 'Garage Management',
      description: `${selectedPlan.name} Plan Subscription`,
      order_id: orderId,
      handler: async (response) => {
        // 3. Verify payment and create account
        await handleGarageSignup({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        });
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: '#1976d2'
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          showSnackbar('Payment cancelled', 'info');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', (response) => {
      setLoading(false);
      showSnackbar(
        response.error?.description || 'Payment failed. Please try again.',
        'error'
      );
    });

    rzp.open();
    
  } catch (err) {
    console.error('Payment error:', err);
    showSnackbar(err.message || 'Payment processing failed', 'error');
    setLoading(false);
  }
};

  const handleGarageSignup = async (paymentDetails = {}) => {
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
        isFreePlan:selectedPlan.amount == 0 ? true : false,
        ...paymentDetails
      };

      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      showSnackbar(
        selectedPlan.amount === 0 
          ? 'Free garage account created successfully!' 
          : 'Payment successful! Garage account created successfully!', 
        'success'
      );
      
      resetForm();

    } catch (err) {
      console.error('Signup error:', err);
      showSnackbar(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      address: '',
      phone: ''
    });
    setSelectedPlan(null);
  };

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
                  <Typography color={selectedPlan.amount === 0 ? 'green' : 'primary'}>
                    {selectedPlan.price}
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
            startIcon={selectedPlan?.amount > 0 ? <CheckCircleOutline /> : null}
            onClick={handleSubmit}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Processing...' : selectedPlan?.amount === 0 ? 'Create Free Account' : `Pay ${selectedPlan?.price} & Create`}
          </Button>
        </form>

        {/* Login Link */}
        <Box mt={3} textAlign="center">
          <Typography variant="body2">
            Already have an account?{' '}
            <Typography
              component="span"
              color="primary"
              sx={{ cursor: 'pointer' }}
              fontWeight="bold"
              onClick={() => navigation('/login')}
            >
              Login here
            </Typography>
          </Typography>
        </Box>
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
    transition: '0.3s',
    boxShadow: selectedPlan?.name === plan.name ? 4 : 1,
    bgcolor: selectedPlan?.name === plan.name ? '#e3f2fd' : '#fff',
    '&:hover': {
      boxShadow: 3,
      bgcolor: '#f1f1f1',
    }
  }}
>
  <Typography variant="h6" fontWeight="bold" gutterBottom>
    {plan.name}
  </Typography>
  <Typography color={plan.amount === 0 ? 'green' : 'primary'} gutterBottom>
    {plan.price}
  </Typography>
  <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
    {plan.features.map((feature, i) => (
      <li key={i} style={{ marginBottom: 4 }}>{feature}</li>
    ))}
  </ul>
  {plan.popular && (
    <Chip label="Most Popular" color="secondary" size="small" sx={{ mt: 1 }} />
  )}
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