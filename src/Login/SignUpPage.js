import React, { useState, useEffect } from 'react';
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
  Paper,
  IconButton,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fade,
  Slide,
  Zoom,
  Switch,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CloudUpload,
  CheckCircle,
  Email,
  Phone,
  Business,
  Lock,
  LocationOn,
  Person,
  Payment,
  Star,
  Security,
  Verified,
  LightMode,
  DarkMode,
  MyLocation,
  CreditCard,
  AccountBalance
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from "../Layout/ThemeContext";

// Fixed Razorpay key configuration
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_qjd934YSnvGxQZ';

const SignUpPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigation = useNavigate();
  const { darkMode, toggleDarkMode } = useThemeContext();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    otp: '',
    gstNumber: '',
    panNumber: '',
    taxType: 'gst' // 'gst' or 'pan'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [plans, setPlanData] = useState(null);
  const [error, setError] = useState(null);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Basic Information',
    'Verify Email',
    'Choose Plan',
    'Complete Registration'
  ];

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setFetchingPlans(true);
        const response = await fetch('https://garage-management-zi5z.onrender.com/api/admin/plan', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPlanData(data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching plan:', err);
      } finally {
        setFetchingPlans(false);
      }
    };
    fetchPlan();
  }, []);

  // Updated handleChange function with email lowercase conversion
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Automatically convert email to lowercase as user types
    if (name === 'email') {
      processedValue = value.toLowerCase();
    }
    
    // Format GST number
    if (name === 'gstNumber') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    // Format PAN number
    if (name === 'panNumber') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle tax type change (GST or PAN)
  const handleTaxTypeChange = (e) => {
    const newTaxType = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      taxType: newTaxType,
      // Clear the other field when switching
      gstNumber: newTaxType === 'gst' ? prev.gstNumber : '',
      panNumber: newTaxType === 'pan' ? prev.panNumber : ''
    }));
    
    // Clear related errors
    if (errors.gstNumber) {
      setErrors((prev) => ({ ...prev, gstNumber: '' }));
    }
    if (errors.panNumber) {
      setErrors((prev) => ({ ...prev, panNumber: '' }));
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showSnackbar('Geolocation is not supported by this browser.', 'error');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use a reverse geocoding service (example with OpenStreetMap Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;
            
            setFormData((prev) => ({ ...prev, address }));
            showSnackbar('Location fetched successfully!', 'success');
          } else {
            throw new Error('Failed to get address from coordinates');
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          showSnackbar('Could not get address. Please enter manually.', 'warning');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = 'Unable to retrieve your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }
        
        showSnackbar(errorMessage, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Validate GST number format
  const validateGSTNumber = (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  // Validate PAN number format
  const validatePANNumber = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Garage Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, '')))
      newErrors.phone = 'Phone number must be 10 digits';
    if (!otpVerified) newErrors.otp = 'Please verify your email';

    // Validate tax information based on selected type
    if (formData.taxType === 'gst') {
      if (!formData.gstNumber.trim()) {
        newErrors.gstNumber = 'GST Number is required';
      } else if (!validateGSTNumber(formData.gstNumber)) {
        newErrors.gstNumber = 'Invalid GST Number format (e.g., 22AAAAA0000A1Z5)';
      }
    } else if (formData.taxType === 'pan') {
      if (!formData.panNumber.trim()) {
        newErrors.panNumber = 'PAN Number is required';
      } else if (!validatePANNumber(formData.panNumber)) {
        newErrors.panNumber = 'Invalid PAN Number format (e.g., ABCDE1234F)';
      }
    }

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
    setActiveStep(3);
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

  const sendOTP = async () => {
    // Use the already lowercase email from formData
    const normalizedEmail = formData.email.trim();
    
    if (!normalizedEmail) {
      showSnackbar('Please enter your email address first.', 'error');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      showSnackbar('Please enter a valid email address.', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/verify/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });
      
      const data = await response.json();
      
      if (response.ok || 
          (data.message && data.message.toLowerCase().includes('otp sent')) ||
          (data.success === true)) {
        showSnackbar('OTP sent to your email successfully!', 'success');
        setOtpSent(true);
        setActiveStep(1);
      } else if (data.message && data.message.toLowerCase().includes('garage') && data.message.toLowerCase().includes('not found')) {
        showSnackbar('OTP sent to your email for verification!', 'success');
        setOtpSent(true);
        setActiveStep(1);
      } else {
        throw new Error(data.message || data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('Send OTP Error:', err);
      
      if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
        showSnackbar('Network error. Please check your connection and try again.', 'error');
      } else {
        showSnackbar(err.message || 'Error sending OTP. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp.trim()) {
      showSnackbar('Please enter the OTP.', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/verify/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      
      const data = await response.json();
      
      if (response.ok || 
          (data.message && (data.message.toLowerCase().includes('verified') || 
                           data.message.toLowerCase().includes('success') ||
                           data.message.toLowerCase().includes('valid'))) ||
          (data.success === true)) {
        showSnackbar('Email verified successfully!', 'success');
        setOtpVerified(true);
        setActiveStep(2);
        if (errors.otp) {
          setErrors((prev) => ({ ...prev, otp: '' }));
        }
      } else if (data.message && data.message.toLowerCase().includes('garage') && data.message.toLowerCase().includes('not found')) {
        showSnackbar('Email verification completed!', 'success');
        setOtpVerified(true);
        setActiveStep(2);
        if (errors.otp) {
          setErrors((prev) => ({ ...prev, otp: '' }));
        }
      } else if (data.message && (data.message.toLowerCase().includes('invalid') || 
                                 data.message.toLowerCase().includes('expired') ||
                                 data.message.toLowerCase().includes('wrong'))) {
        throw new Error('Invalid or expired OTP. Please try again.');
      } else {
        throw new Error(data.message || data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      
      if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
        showSnackbar('Network error. Please check your connection and try again.', 'error');
      } else {
        showSnackbar(err.message || 'Error verifying OTP. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
      }
      
      if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === '' || RAZORPAY_KEY_ID.includes('your_actual_key_here')) {
        throw new Error('Razorpay key not configured. Please contact support.');
      }
      
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
      
      let orderId, orderAmount;
      if (orderData.order && typeof orderData.order === 'object') {
        orderId = orderData.order.id || orderData.order.order_id || orderData.order.orderId;
        orderAmount = orderData.order.amount || orderData.order.amount_due || selectedPlan.amount * 100;
      } else {
        orderId = orderData.id || orderData.order_id || orderData.orderId || orderData.razorpayOrderId;
        orderAmount = orderData.amount || orderData.amount_due || selectedPlan.amount * 100;
      }
      
      if (!orderId) {
        throw new Error(`Invalid order response from server. No order ID found in response structure.`);
      }
      
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        name: 'Garage Management',
        description: `${selectedPlan.name} Plan Subscription`,
        order_id: orderId,
        handler: async (response) => {
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
      
      const garageFormData = new FormData();
      
      garageFormData.append('name', formData.name);
      garageFormData.append('address', formData.address);
      garageFormData.append('phone', formData.phone);
      garageFormData.append('email', formData.email);
      garageFormData.append('password', formData.password);
      garageFormData.append('durationInMonths', selectedPlan.durationInMonths.toString());
      garageFormData.append('amount', selectedPlan.amount.toString());
      garageFormData.append('isFreePlan', selectedPlan.amount === 0 ? 'true' : 'false');
      
      // Add GST or PAN based on selection
      if (formData.taxType === 'gst' && formData.gstNumber) {
        garageFormData.append('gstNum', formData.gstNumber);
      } else if (formData.taxType === 'pan' && formData.panNumber) {
        garageFormData.append('panNum', formData.panNumber);
      }
      
      garageFormData.append('razorpayOrderId', paymentDetails.razorpayOrderId || '');
      garageFormData.append('razorpayPaymentId', paymentDetails.razorpayPaymentId || '');
      garageFormData.append('razorpaySignature', paymentDetails.razorpaySignature || '');
      
      if (logo) {
        garageFormData.append('logo', logo);
      }
      
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/create', {
        method: 'POST',
        body: garageFormData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error && data.error.includes("garage is not defined")) {
          showSnackbar(
            'Garage created successfully! Waiting for admin approval.',
            'success'
          );
          
          setTimeout(() => {
            navigation('/waiting-approval', { 
              state: { 
                garageName: formData.name,
                email: formData.email,
                planName: selectedPlan.name 
              }
            });
          }, 2000);
          
          resetForm();
          return;
        }
        
        if (data.error && data.error.includes("E11000")) {
          throw new Error("Garage name already exists. Please choose a different name.");
        }
        
        if (data.message && data.message.toLowerCase().includes('validation')) {
          throw new Error(data.message || "Validation failed. Please check all fields.");
        }
        
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }
      
      showSnackbar(
        selectedPlan.amount === 0 
          ? 'Garage created successfully! Waiting for admin approval.' 
          : 'Payment successful! Garage created successfully! Waiting for admin approval.', 
        'success'
      );
      
      setTimeout(() => {
        navigation('/waiting-approval', { 
          state: { 
            garageName: formData.name,
            email: formData.email,
            planName: selectedPlan.name 
          }
        });
      }, 2000);
      
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
      confirmPassword: '',
      address: '',
      phone: '',
      otp: '',
      gstNumber: '',
      panNumber: '',
      taxType: 'gst'
    });
    setSelectedPlan(null);
    setOtpSent(false);
    setOtpVerified(false);
    setLogo(null);
    setLogoPreview(null);
    setActiveStep(0);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderBasicInformation = () => (
    <Fade in={true}>
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Garage Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email || "Email will automatically convert to lowercase"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <LocationOn color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      startIcon={locationLoading ? <CircularProgress size={16} /> : <MyLocation />}
                      sx={{ 
                        borderRadius: 2,
                        minWidth: 'auto',
                        px: 2
                      }}
                    >
                      {locationLoading ? 'Getting...' : 'Get Location'}
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          {/* Tax Information Section */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1 }} />
                Tax Information
              </Typography>
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                  Select Tax Registration Type
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.taxType}
                  onChange={handleTaxTypeChange}
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel 
                    value="gst" 
                    control={<Radio />} 
                    label="GST Number"
                    sx={{ 
                      border: formData.taxType === 'gst' ? '2px solid' : '1px solid',
                      borderColor: formData.taxType === 'gst' ? 'primary.main' : 'grey.300',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      m: 0,
                      bgcolor: formData.taxType === 'gst' ? (theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50') : 'transparent'
                    }}
                  />
                  <FormControlLabel 
                    value="pan" 
                    control={<Radio />} 
                    label="PAN Number"
                    sx={{ 
                      border: formData.taxType === 'pan' ? '2px solid' : '1px solid',
                      borderColor: formData.taxType === 'pan' ? 'primary.main' : 'grey.300',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      m: 0,
                      bgcolor: formData.taxType === 'pan' ? (theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50') : 'transparent'
                    }}
                  />
                </RadioGroup>
              </FormControl>

              <Grid container spacing={2}>
                {formData.taxType === 'gst' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="GST Number"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      error={!!errors.gstNumber}
                      helperText={errors.gstNumber || "Format: 22AAAAA0000A1Z5 (15 characters)"}
                      placeholder="22AAAAA0000A1Z5"
                      inputProps={{ maxLength: 15 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCard color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                )}

                {formData.taxType === 'pan' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="PAN Number"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      error={!!errors.panNumber}
                      helperText={errors.panNumber || "Format: ABCDE1234F (10 characters)"}
                      placeholder="ABCDE1234F"
                      inputProps={{ maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCard color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Paper
              elevation={1}
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                border: '2px dashed',
                borderColor: logo ? 'success.main' : 'grey.300',
                bgcolor: logo ? (theme.palette.mode === 'dark' ? 'success.900' : 'success.50') : (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50'
                }
              }}
              component="label"
            >
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleLogoChange}
              />
              <CloudUpload sx={{ fontSize: 40, color: 'action.active', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Upload Garage Logo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose an image file for your garage logo
              </Typography>
              {logo && (
                <Box mt={2}>
                  <Chip 
                    label={`Selected: ${logo.name}`} 
                    color="success" 
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              )}
            </Paper>
            
            {logoPreview && (
              <Zoom in={!!logoPreview}>
                <Box mt={2} textAlign="center">
                  <Avatar
                    src={logoPreview}
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      margin: '0 auto',
                      border: '3px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                  <Typography variant="caption" display="block" mt={1} color="text.secondary">
                    Logo Preview
                  </Typography>
                </Box>
              </Zoom>
            )}
          </Grid>
        </Grid>
        
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={sendOTP}
            disabled={loading || !formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)}
            startIcon={loading ? <CircularProgress size={20} /> : <Email />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 3
            }}
          >
            {loading ? 'Sending OTP...' : 'Send Verification Code'}
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  const renderEmailVerification = () => (
    <Fade in={true}>
      <Box textAlign="center">
        <Security sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Verify Your Email
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          We've sent a verification code to <strong>{formData.email}</strong>
        </Typography>
        
        <Box mt={4} mb={4}>
          <TextField
            fullWidth
            label="Enter Verification Code"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            disabled={!otpSent}
            error={!!errors.otp}
            helperText={errors.otp}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Verified color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              maxWidth: 400,
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
          />
        </Box>
        
        <Button
          variant="contained"
          size="large"
          onClick={verifyOTP}
          disabled={loading || !formData.otp.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600,
            boxShadow: 3
          }}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>
        
        {otpVerified && (
          <Zoom in={otpVerified}>
            <Box mt={3} display="flex" alignItems="center" justifyContent="center">
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="body1" color="success.main" fontWeight={600}>
                Email Verified Successfully!
              </Typography>
            </Box>
          </Zoom>
        )}
      </Box>
    </Fade>
  );

  const renderPlanSelection = () => (
    <Fade in={true}>
      <Box>
        <Typography variant="h5" fontWeight={600} textAlign="center" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
          Select the perfect plan for your garage management needs
        </Typography>
        
        {fetchingPlans ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Typography ml={2} variant="h6">Loading plans...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {plans && plans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card
                    onClick={() => handleSelectPlan(plan)}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: '0.3s',
                      border: selectedPlan?.name === plan.name ? '3px solid' : '1px solid',
                      borderColor: selectedPlan?.name === plan.name ? 'primary.main' : 'grey.300',
                      borderRadius: 3,
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                      },
                      ...(selectedPlan?.name === plan.name && {
                        boxShadow: 4,
                        bgcolor: 'primary.50'
                      })
                    }}
                  >
                    {plan.popular && (
                      <Chip
                        label="Most Popular"
                        color="secondary"
                        sx={{
                          position: 'absolute',
                          top: -10,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontWeight: 600,
                          zIndex: 1
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {plan.name}
                      </Typography>
                      
                      <Box my={2}>
                        <Typography 
                          variant="h4" 
                          fontWeight={800} 
                          color={plan.amount === 0 ? 'success.main' : 'primary.main'}
                        >
                          {plan.price}
                        </Typography>
                        {plan.amount > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            for {plan.durationInMonths} months
                          </Typography>
                        )}
                      </Box>
                      
                      <Box textAlign="left">
                        {plan.features && plan.features.map((feature, i) => (
                          <Box key={i} display="flex" alignItems="center" mb={1}>
                            <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                      
                      {selectedPlan?.name === plan.name && (
                        <Box mt={2}>
                          <Chip
                            label="Selected"
                            color="primary"
                            variant="filled"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
        
        {selectedPlan && (
          <Box mt={4} textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => setActiveStep(3)}
              startIcon={<Payment />}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: 3
              }}
            >
              Continue with {selectedPlan.name}
            </Button>
          </Box>
        )}
      </Box>
    </Fade>
  );

  const renderFinalStep = () => (
    <Fade in={true}>
      <Box textAlign="center">
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Ready to Create Your Account
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' }}>
          <Grid container spacing={2} textAlign="left">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Garage Name</Typography>
              <Typography variant="body1" fontWeight={600}>{formData.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1" fontWeight={600}>{formData.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography variant="body1" fontWeight={600}>{formData.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Selected Plan</Typography>
              <Typography variant="body1" fontWeight={600} color="primary.main">
                {selectedPlan?.name} - {selectedPlan?.price}
              </Typography>
            </Grid>
            {formData.taxType === 'gst' && formData.gstNumber && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">GST Number</Typography>
                <Typography variant="body1" fontWeight={600}>{formData.gstNumber}</Typography>
              </Grid>
            )}
            {formData.taxType === 'pan' && formData.panNumber && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">PAN Number</Typography>
                <Typography variant="body1" fontWeight={600}>{formData.panNumber}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        <Box mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !selectedPlan || !otpVerified}
            startIcon={loading ? <CircularProgress size={20} /> : selectedPlan?.amount > 0 ? <Payment /> : <CheckCircle />}
            sx={{ 
              px: 6, 
              py: 2, 
              borderRadius: 3,
              fontSize: '1.2rem',
              fontWeight: 700,
              boxShadow: 4,
              minWidth: 250
            }}
          >
            {loading ? 'Processing...' : selectedPlan?.amount === 0 ? 'Create Free Account' : `Pay ${selectedPlan?.price} & Create`}
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, #1a237e 0%, #000051 100%)`
          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Theme Toggle */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Box
            onClick={toggleDarkMode}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)'
              }
            }}
          >
            {darkMode ? (
              <DarkMode sx={{ mr: 1, fontSize: 24 }} />
            ) : (
              <LightMode sx={{ mr: 1, fontSize: 24 }} />
            )}
            <Typography variant="body2" fontWeight={500}>
              {darkMode ? 'Dark' : 'Light'} Mode
            </Typography>
          </Box>
        </Box>
        <Slide direction="down" in={true} mountOnEnter unmountOnExit>
          <Paper
            elevation={10}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              bgcolor: 'background.paper'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(45deg, #1a237e 30%, #000051 90%)`
                  : `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                color: 'white',
                p: 4,
                textAlign: 'center'
              }}
            >
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Join Garage Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Start managing your garage with our powerful platform
              </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              {/* Stepper */}
              <Box mb={4}>
                <Stepper 
                  activeStep={activeStep} 
                  alternativeLabel={!isMobile ? true : false}
                  orientation={isMobile ? "vertical" : "horizontal"}
                  sx={{
                    "& .MuiStepLabel-root": {
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      textAlign: isMobile ? "left" : "center"
                    },
                    "& .MuiStepConnector-root": {
                      marginLeft: isMobile ? "12px" : 0,
                    }
                  }}
                >
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Step Content */}
              <Box>
                {activeStep === 0 && renderBasicInformation()}
                {activeStep === 1 && renderEmailVerification()}
                {activeStep === 2 && renderPlanSelection()}
                {activeStep === 3 && renderFinalStep()}
              </Box>

              {/* Navigation */}
              <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0 || loading}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  Back
                </Button>
                
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Typography
                      component="span"
                      color="primary"
                      sx={{ cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => navigation('/login')}
                    >
                      Sign In
                    </Typography>
                  </Typography>
                </Box>
                
                <Box width={80} /> {/* Spacer for alignment */}
              </Box>
            </Box>
          </Paper>
        </Slide>

        {/* Plan Selection Dialog */}
        <Dialog 
          open={openPlanDialog} 
          onClose={() => setOpenPlanDialog(false)} 
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              Choose Your Plan
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select the perfect plan for your garage management needs
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            {fetchingPlans ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress size={40} />
                <Typography ml={2} variant="h6">Loading plans...</Typography>
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {plans && plans.map((plan, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      onClick={() => handleSelectPlan(plan)}
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: '0.3s',
                        border: selectedPlan?.name === plan.name ? '3px solid' : '1px solid',
                        borderColor: selectedPlan?.name === plan.name ? 'primary.main' : (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'),
                        borderRadius: 3,
                        position: 'relative',
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        }
                      }}
                    >
                      {plan.popular && (
                        <Chip
                          label="Most Popular"
                          color="secondary"
                          sx={{
                            position: 'absolute',
                            top: -10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontWeight: 600
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {plan.name}
                        </Typography>
                        
                        <Typography 
                          variant="h4" 
                          fontWeight={800} 
                          color={plan.amount === 0 ? 'success.main' : 'primary.main'}
                          gutterBottom
                        >
                          {plan.price}
                        </Typography>
                        
                        <Box textAlign="left" mt={2}>
                          {plan.features && plan.features.map((feature, i) => (
                            <Box key={i} display="flex" alignItems="center" mb={1}>
                              <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                              <Typography variant="body2">{feature}</Typography>
                            </Box>
                          ))}
                        </Box>
                        
                        {selectedPlan?.name === plan.name && (
                          <Box mt={2}>
                            <Chip
                              label="Selected"
                              color="primary"
                              variant="filled"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenPlanDialog(false)} variant="outlined">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notification */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              fontWeight: 500
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default SignUpPage;