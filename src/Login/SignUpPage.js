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
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Slide,
  Zoom,
  Switch,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
  Security,
  Verified,
  LightMode,
  DarkMode,
  MyLocation,
  CreditCard,
  AccountBalance,
  Receipt,
  AccountBox,
  Save,
  Send,
  HourglassEmpty,
  Done,
  ErrorOutline,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EnhancedSignUpPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    otp: '',
    gstNum: '',
    panNum: '',
    taxType: 'gst',
    durationInMonths: 12,
    isFreePlan: true,
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      upiId: ''
    }
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
  const [plans, setPlanData] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showBankDetails, setShowBankDetails] = useState(false);
  // New states for the updated registration flow
  const [garageRegistered, setGarageRegistered] = useState(false);
  const [garageId, setGarageId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  const steps = [
    'Basic Information',
    'Tax & Business Details',
    'Choose Plan',
    'Bank Details (Optional)',
    'Complete Registration',
    'Verify Email',
    'Registration Status'
  ];

  const theme = {
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2', dark: '#115293' },
      secondary: { main: '#dc004e' },
      background: { paper: darkMode ? '#424242' : '#ffffff' },
      text: { primary: darkMode ? '#ffffff' : '#000000', secondary: darkMode ? '#cccccc' : '#666666' }
    }
  };

  // Fetch plans from API on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
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
      // Transform API response to match component structure
      const transformedPlans = data.map(plan => ({
        id: plan._id || plan.id,
        name: plan.name,
        price: `₹${plan.price || 0}`,
        amount: plan.price || 0,
        durationInMonths: plan.durationInMonths || 1,
        popular: plan.popular || false,
        features: plan.features || []
      }));
      setPlanData(transformedPlans);
    } catch (err) {
      console.error('Error fetching plans:', err);
      showSnackbar('Failed to load plans. Using default plans.', 'warning');
      // Fallback to default plans
      setPlanData([
        {
          name: 'Free Plan',
          price: '₹0',
          amount: 0,
          durationInMonths: 1,
          popular: false,
          features: ['Basic garage management', 'Up to 10 vehicles', 'Basic reporting']
        },
        {
          name: 'Premium Plan',
          price: '₹999',
          amount: 999,
          durationInMonths: 12,
          popular: true,
          features: ['Advanced garage management', 'Unlimited vehicles', 'Advanced reporting', 'Customer management', 'Inventory tracking']
        },
        {
          name: 'Enterprise Plan',
          price: '₹2999',
          amount: 2999,
          durationInMonths: 12,
          popular: false,
          features: ['All Premium features', 'Multi-location support', 'API access', 'Priority support', 'Custom integrations']
        }
      ]);
    } finally {
      setFetchingPlans(false);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- NEW HELPER FUNCTION FOR FIELD-SPECIFIC VALIDATION ---
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Garage Name is required';
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email is invalid';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (formData.password !== value) { // Compare with the main password state
          error = 'Passwords do not match';
        }
        break;
      case 'address':
        if (!value.trim()) error = 'Address is required';
        break;
      case 'phone':
        const cleanedPhone = value.replace(/\D/g, '');
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (cleanedPhone.length !== 10) {
          error = 'Phone number must be 10 digits';
        }
        break;
      case 'gstNum':
        if (formData.taxType === 'gst') { // Only validate if GST is selected
          if (!value.trim()) {
            error = 'GST Number is required';
          } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
            error = 'Invalid GST Number format';
          }
        } else {
            // If taxType is not GST, clear GST error
            error = ''; // Or you could delete the error in handleChange
        }
        break;
      case 'panNum':
        if (formData.taxType === 'pan') { // Only validate if PAN is selected
          if (!value.trim()) {
            error = 'PAN Number is required';
          } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
            error = 'Invalid PAN Number format';
          }
        } else {
             // If taxType is not PAN, clear PAN error
            error = ''; // Or you could delete the error in handleChange
        }
        break;
      // Bank Details validation (if needed on change)
      case 'bankDetails.accountHolderName':
      case 'bankDetails.accountNumber':
      case 'bankDetails.ifscCode':
        // These are handled during step validation or final submission
        // You could add specific checks here if needed
        break;
      default:
        break;
    }
    return error;
  };
  // --- END NEW HELPER FUNCTION ---

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;

    // Process email to lowercase immediately
    if (name === 'email') {
      processedValue = value.toLowerCase();
    }

    // Update formData
    if (name.startsWith('bankDetails.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [fieldName]: processedValue
        }
      }));
      // Optionally validate bank details fields here if needed immediately on change
      // For now, bank details validation primarily happens on Continue/Submit
    } else {
      if (name === 'taxType') {
        // Special handling for taxType change
        setFormData(prev => ({
          ...prev,
          [name]: processedValue,
          // Don't clear the tax numbers here, let user decide
          // gstNum: processedValue === 'gst' ? prev.gstNum : '',
          // panNum: processedValue === 'pan' ? prev.panNum : ''
        }));

        // Clear errors for both tax fields when type changes
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.gstNum;
            delete newErrors.panNum;
            return newErrors;
        });

      } else {
        setFormData(prev => ({ ...prev, [name]: processedValue }));

        // --- KEY CHANGE: Validate and Update Error for the Specific Field ---
        // Get the error message for the changed field
        const fieldError = validateField(name, processedValue);

        // Update the errors state for this specific field
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          if (fieldError) {
            // If there's an error, set it
            newErrors[name] = fieldError;
          } else {
            // If no error, remove the error message for this field
            delete newErrors[name];
          }
          return newErrors;
        });
        // --- END KEY CHANGE ---
      }
    }
    // Note: The general error clearing logic `if (errors[name]) { ... }` is removed
    // because the new logic above handles it more precisely.
  };

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
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;
            setFormData(prev => ({ ...prev, address }));
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
        showSnackbar('Unable to retrieve your location.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Validation function for initial registration (without OTP verification)
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Garage Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone number must be 10 digits';
    if (formData.taxType === 'gst') {
      if (!formData.gstNum.trim()) newErrors.gstNum = 'GST Number is required';
      else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNum)) {
        newErrors.gstNum = 'Invalid GST Number format';
      }
    } else if (formData.taxType === 'pan') { // Use else if for clarity
      if (!formData.panNum.trim()) newErrors.panNum = 'PAN Number is required';
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNum)) {
        newErrors.panNum = 'Invalid PAN Number format';
      }
    } else {
        // If neither GST nor PAN is selected (though default is GST)
        // You might want to require one or the other
        // For now, we assume one must be selected based on radio buttons
    }
    if (showBankDetails) {
      const bankDetails = formData.bankDetails;
      // Basic dependency validation for bank details
      if ((bankDetails.accountHolderName || bankDetails.accountNumber || bankDetails.ifscCode) &&
          (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode)) {
          // If any of the key fields are filled, all must be filled
          if (bankDetails.accountHolderName && !bankDetails.accountNumber) {
              newErrors['bankDetails.accountNumber'] = 'Account number is required when account holder name is provided';
          }
          if (bankDetails.accountNumber && !bankDetails.accountHolderName) {
              newErrors['bankDetails.accountHolderName'] = 'Account holder name is required when account number is provided';
          }
          if (bankDetails.accountNumber && !bankDetails.ifscCode) {
              newErrors['bankDetails.ifscCode'] = 'IFSC code is required when account number is provided';
          }
          if (bankDetails.ifscCode && !bankDetails.accountNumber) {
              newErrors['bankDetails.accountNumber'] = 'Account number is required when IFSC code is provided';
          }
          // Add validation for IFSC format if it's present
          if (bankDetails.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
              newErrors['bankDetails.ifscCode'] = 'Invalid IFSC code format';
          }
      }
    }
    // Note: We don't validate OTP here since it's verified later in the flow
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Separate validation for OTP verification step
  const validateOTP = () => {
    if (!formData.otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'Please enter the OTP' }));
      return false;
    }
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
    return true;
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
    setFormData(prev => ({
      ...prev,
      durationInMonths: plan.durationInMonths,
      isFreePlan: plan.amount === 0
    }));
    setActiveStep(3); // Move to bank details step
  };

  // Step 1: Submit initial registration
  const handleSubmitRegistration = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form.', 'error');
      return;
    }
    if (!selectedPlan) {
      showSnackbar('Please select a plan before submitting.', 'warning');
      return;
    }
    try {
      setLoading(true);
      const registrationData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email.trim(),
        password: formData.password,
        gstNum: formData.taxType === 'gst' ? formData.gstNum : '',
        panNum: formData.taxType === 'pan' ? formData.panNum : '',
        bankDetails: showBankDetails && formData.bankDetails.accountHolderName ? {
          accountHolderName: formData.bankDetails.accountHolderName,
          accountNumber: formData.bankDetails.accountNumber,
          ifscCode: formData.bankDetails.ifscCode,
          bankName: formData.bankDetails.bankName,
          branchName: formData.bankDetails.branchName,
          upiId: formData.bankDetails.upiId
        } : undefined
      };
      console.log('Submitting registration with data:', registrationData);
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/submit-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
      // Extract garage ID and token from response
      const createdGarageId = data.garage?.id || data.id || data.garageId;
      const token = data.token || data.accessToken;
      setGarageId(createdGarageId);
      setAuthToken(token);
      setGarageRegistered(true);
      showSnackbar('Registration submitted successfully! Now sending verification email...', 'success');
      // Move to email verification step
      setActiveStep(5);
      // Automatically send OTP after successful registration
      await sendOTPAfterRegistration();
    } catch (err) {
      console.error('Registration error:', err);
      showSnackbar(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send OTP after successful registration
  const sendOTPAfterRegistration = async () => {
    try {
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      if (data.success ||
          data.message?.toLowerCase().includes('otp sent') ||
          data.message?.toLowerCase().includes('sent successfully') ||
          response.status === 200) {
        showSnackbar('Verification email sent successfully!', 'success');
        setOtpSent(true);
      } else {
        throw new Error(data.message || 'Failed to send verification email');
      }
    } catch (err) {
      console.error('Send OTP Error:', err);
      showSnackbar('Registration successful but failed to send verification email. You can request it again.', 'warning');
    }
  };

  // Manually send/resend OTP
  const sendOTP = async () => {
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
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: normalizedEmail
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      if (data.success ||
          data.message?.toLowerCase().includes('otp sent') ||
          data.message?.toLowerCase().includes('sent successfully') ||
          response.status === 200) {
        showSnackbar('OTP sent to your email successfully!', 'success');
        setOtpSent(true);
      } else {
        throw new Error(data.message || 'Failed to send OTP');
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
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: formData.otp.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      if (data.success ||
          data.message?.toLowerCase().includes('verified') ||
          data.message?.toLowerCase().includes('valid') ||
          data.message?.toLowerCase().includes('success') ||
          response.status === 200) {
        showSnackbar('Email verified successfully!', 'success');
        setOtpVerified(true);
        setRegistrationCompleted(true);
        setActiveStep(6); // Move to final status step
        if (errors.otp) {
          setErrors(prev => ({ ...prev, otp: '' }));
        }
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
        showSnackbar('Network error. Please check your connection and try again.', 'error');
      } else if (err.message.includes('expired') || err.message.includes('invalid')) {
        showSnackbar('Invalid or expired OTP. Please try again.', 'error');
      } else {
        showSnackbar(err.message || 'Error verifying OTP. Please try again.', 'error');
      }
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
      gstNum: '',
      panNum: '',
      taxType: 'gst',
      durationInMonths: 12,
      isFreePlan: true,
      bankDetails: {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        upiId: ''
      }
    });
    setSelectedPlan(null);
    setOtpSent(false);
    setOtpVerified(false);
    setLogo(null);
    setLogoPreview(null);
    setActiveStep(0);
    setShowBankDetails(false);
    setGarageRegistered(false);
    setGarageId(null);
    setAuthToken(null);
    setRegistrationCompleted(false);
    setErrors({});
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
        <Typography variant="h5" fontWeight={600} textAlign="center" gutterBottom>
          Basic Information
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
          Enter your garage's basic details to get started
        </Typography>
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
                      sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                    >
                      {locationLoading ? 'Getting...' : 'Get Location'}
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
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
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: logo ? 'success.main' : 'grey.300',
                bgcolor: logo ? 'success.50' : 'grey.50',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
              component="label"
            >
              <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
              <CloudUpload sx={{ fontSize: 40, color: 'action.active', mb: 1 }} />
              <Typography variant="h6" gutterBottom>Upload Garage Logo</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose an image file for your garage logo (Optional)
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
        {/* --- Updated Continue Button for Step 0 --- */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              // Validate all fields relevant to Step 0 before proceeding
              const step0Fields = ['name', 'email', 'password', 'confirmPassword', 'address', 'phone'];
              let isValid = true;
              let newErrors = { ...errors };
              step0Fields.forEach(field => {
                const error = validateField(field, formData[field]);
                if (error) {
                  newErrors[field] = error;
                  isValid = false;
                } else {
                  delete newErrors[field]; // Ensure valid fields don't show errors
                }
              });
              // Special check for password confirmation match
              // This is already handled by validateField for confirmPassword, but double-checking is fine
              setErrors(newErrors);

              if (isValid) {
                setActiveStep(1); // Proceed only if valid
              } else {
                showSnackbar('Please fix the errors in the form before continuing.', 'error');
              }
            }}
            // Disable if any required field is empty or if there are known errors
            disabled={
              !formData.name.trim() ||
              !formData.email.trim() ||
              !formData.phone.trim() ||
              !formData.address.trim() ||
              !formData.password ||
              !formData.confirmPassword ||
              !!errors.name ||
              !!errors.email ||
              !!errors.phone ||
              !!errors.address ||
              !!errors.password ||
              !!errors.confirmPassword
            }
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 3
            }}
          >
            Continue
          </Button>
        </Box>
        {/* --- End Update --- */}
      </Box>
    </Fade>
  );

  const renderTaxBusinessDetails = () => (
    <Fade in={true}>
      <Box>
        <Typography variant="h5" fontWeight={600} textAlign="center" gutterBottom>
          Tax & Business Details
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
          Provide your business tax information
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
                Tax Registration Type
              </FormLabel>
              <RadioGroup
                row
                name="taxType"
                value={formData.taxType}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="gst"
                  control={<Radio />}
                  label="GST Registration"
                  sx={{ mr: 4 }}
                />
                <FormControlLabel
                  value="pan"
                  control={<Radio />}
                  label="PAN Registration"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          {formData.taxType === 'gst' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="GST Number"
                name="gstNum"
                value={formData.gstNum}
                onChange={handleChange}
                error={!!errors.gstNum}
                helperText={errors.gstNum || "Format: 22AAAAA0000A1Z5"}
                placeholder="22AAAAA0000A1Z5"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Receipt color="action" />
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
                name="panNum"
                value={formData.panNum}
                onChange={handleChange}
                error={!!errors.panNum}
                helperText={errors.panNum || "Format: ABCDE1234F"}
                placeholder="ABCDE1234F"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBox color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          )}
        </Grid>
        {/* --- Updated Continue Button for Step 1 --- */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              // Validate tax details before proceeding
              const taxField = formData.taxType === 'gst' ? 'gstNum' : (formData.taxType === 'pan' ? 'panNum' : null);
              let isValid = true;
              let newErrors = { ...errors };

              if (taxField) {
                  const taxValue = formData[taxField];
                  const error = validateField(taxField, taxValue);

                  // Update errors state for the tax field
                  if (error) {
                    newErrors[taxField] = error;
                    isValid = false;
                  } else {
                    delete newErrors[taxField]; // Clear error if valid
                  }
              } else {
                  // If somehow no tax type is selected (shouldn't happen with radio buttons)
                  // You might want to show an error or just proceed
                  isValid = false; // Or true, depending on your logic
                  showSnackbar('Please select a tax registration type.', 'warning');
              }
              setErrors(newErrors);

              if (isValid) {
                setActiveStep(2); // Proceed only if valid
              } else {
                if (taxField) {
                  showSnackbar(`Please fix the error in ${formData.taxType === 'gst' ? 'GST' : 'PAN'} Number.`, 'error');
                }
                // Snackbar message already shown above for missing tax type
              }
            }}
            // Disable if the required tax field is empty or has errors, or if taxType is somehow invalid
            disabled={
              (formData.taxType === 'gst' && (!formData.gstNum.trim() || !!errors.gstNum)) ||
              (formData.taxType === 'pan' && (!formData.panNum.trim() || !!errors.panNum)) ||
              (formData.taxType !== 'gst' && formData.taxType !== 'pan') // Disable if neither is selected
            }
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 3
            }}
          >
            Continue to Plan Selection
          </Button>
        </Box>
        {/* --- End Update --- */}
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
        {fetchingPlans && (
          <Box display="flex" justifyContent="center" alignItems="center" my={4}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading available plans...
            </Typography>
          </Box>
        )}
        <Box mb={2} display="flex" justifyContent="center">
          <Button
            variant="outlined"
            onClick={fetchPlans}
            disabled={fetchingPlans}
            startIcon={fetchingPlans ? <CircularProgress size={20} /> : <Refresh />}
            sx={{ borderRadius: 2 }}
          >
            {fetchingPlans ? 'Loading...' : 'Refresh Plans'}
          </Button>
        </Box>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {plans.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id || index}>
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
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.map((feature, i) => (
                          <Box key={i} display="flex" alignItems="center" mb={1}>
                            <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))
                      ) : (
                        <Box display="flex" alignItems="center" mb={1}>
                          <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                          <Typography variant="body2">Full garage management features</Typography>
                        </Box>
                      )}
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
        {plans.length === 0 && !fetchingPlans && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No plans available at the moment. Please try refreshing.
            </Typography>
          </Box>
        )}
      </Box>
    </Fade>
  );

  const renderBankDetails = () => (
    <Fade in={true}>
      <Box>
        <Typography variant="h5" fontWeight={600} textAlign="center" gutterBottom>
          Bank Details (Optional)
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
          Add your bank details for seamless transactions
        </Typography>
        <Box mb={3} display="flex" justifyContent="center">
          <FormControlLabel
            control={
              <Switch
                checked={showBankDetails}
                onChange={(e) => setShowBankDetails(e.target.checked)}
                color="primary"
              />
            }
            label="Add Bank Details"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        {showBankDetails && (
          <Fade in={showBankDetails}>
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    name="bankDetails.accountHolderName"
                    value={formData.bankDetails.accountHolderName}
                    onChange={handleChange}
                    error={!!errors['bankDetails.accountHolderName']}
                    helperText={errors['bankDetails.accountHolderName']}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    name="bankDetails.accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleChange}
                    error={!!errors['bankDetails.accountNumber']}
                    helperText={errors['bankDetails.accountNumber']}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalance color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    name="bankDetails.ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleChange}
                    error={!!errors['bankDetails.ifscCode']}
                    helperText={errors['bankDetails.ifscCode'] || "Format: ABCD0123456"}
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
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
                    label="Branch Name"
                    name="bankDetails.branchName"
                    value={formData.bankDetails.branchName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="UPI ID (Optional)"
                    name="bankDetails.upiId"
                    value={formData.bankDetails.upiId}
                    onChange={handleChange}
                    placeholder="user@paytm"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Payment color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}
        {/* --- Updated Continue Button for Step 3 --- */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              let isValid = true;
              let newErrors = { ...errors };

              if (showBankDetails) {
                // Validate all relevant bank detail fields for dependencies and format
                const bd = formData.bankDetails;
                // Check dependencies: if any key field is filled, all must be
                if ((bd.accountHolderName || bd.accountNumber || bd.ifscCode) &&
                    (!bd.accountHolderName || !bd.accountNumber || !bd.ifscCode)) {
                    isValid = false;
                    // Set specific errors for missing dependent fields
                    if (bd.accountHolderName && !bd.accountNumber) {
                        newErrors['bankDetails.accountNumber'] = 'Account number is required when account holder name is provided';
                    } else if (!bd.accountHolderName && bd.accountNumber) {
                        newErrors['bankDetails.accountHolderName'] = 'Account holder name is required when account number is provided';
                    } else {
                        // If neither is filled initially, or both are filled, check the next dependency
                        // Clear potential previous errors if they are now resolved by filling the other
                        delete newErrors['bankDetails.accountNumber'];
                        delete newErrors['bankDetails.accountHolderName'];
                    }

                    if (bd.accountNumber && !bd.ifscCode) {
                        newErrors['bankDetails.ifscCode'] = 'IFSC code is required when account number is provided';
                    } else if (bd.ifscCode && !bd.accountNumber) {
                        newErrors['bankDetails.accountNumber'] = 'Account number is required when IFSC code is provided';
                    } else {
                         // Clear potential previous errors if they are now resolved
                         delete newErrors['bankDetails.ifscCode'];
                         // Only delete account number error if it wasn't triggered by missing account holder above
                         if (!newErrors['bankDetails.accountHolderName']) {
                             delete newErrors['bankDetails.accountNumber'];
                         }
                    }
                } else {
                    // If all key dependencies are met or none are touched, clear those errors
                    delete newErrors['bankDetails.accountHolderName'];
                    delete newErrors['bankDetails.accountNumber'];
                    delete newErrors['bankDetails.ifscCode'];

                    // Now validate individual field formats if they are present
                    if (bd.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bd.ifscCode)) {
                        newErrors['bankDetails.ifscCode'] = 'Invalid IFSC code format';
                        isValid = false;
                    }
                    // Add other individual field validations here if needed (e.g., account number format)
                }
              }
              setErrors(newErrors);

              if (isValid) {
                setActiveStep(4); // Proceed only if valid (or if skipped)
              } else {
                showSnackbar('Please fix the errors in the bank details or leave them blank to skip.', 'error');
              }
            }}
            startIcon={<Save />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 3
            }}
          >
            {showBankDetails ? 'Save & Continue' : 'Skip Bank Details'}
          </Button>
        </Box>
        {/* --- End Update --- */}
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
            {formData.taxType === 'gst' && formData.gstNum && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">GST Number</Typography>
                <Typography variant="body1" fontWeight={600}>{formData.gstNum}</Typography>
              </Grid>
            )}
            {formData.taxType === 'pan' && formData.panNum && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">PAN Number</Typography>
                <Typography variant="body1" fontWeight={600}>{formData.panNum}</Typography>
              </Grid>
            )}
            {showBankDetails && formData.bankDetails.accountHolderName && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                    Bank Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Account Holder</Typography>
                  <Typography variant="body1" fontWeight={600}>{formData.bankDetails.accountHolderName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.bankDetails.accountNumber ? `****${formData.bankDetails.accountNumber.slice(-4)}` : ''}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        <Box mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmitRegistration}
            disabled={loading || !selectedPlan}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
          After registration, you will receive a verification email.
        </Typography>
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
        {garageRegistered && (
          <Box mb={3}>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Registration successful! Please verify your email to complete the process.
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mt={4} mb={4}>
          <TextField
            fullWidth
            label="Enter Verification Code"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            disabled={!otpSent && !garageRegistered}
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
        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
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
          <Button
            variant="outlined"
            size="large"
            onClick={sendOTP}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            {loading ? 'Sending...' : 'Resend OTP'}
          </Button>
        </Box>
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

  const renderRegistrationStatus = () => (
    <Fade in={true}>
      <Box textAlign="center">
        {registrationCompleted ? (
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        ) : (
          <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        )}
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {registrationCompleted ? 'Registration Complete!' : 'Registration Incomplete'}
        </Typography>
        {registrationCompleted ? (
          <Box>
            <Typography variant="body1" color="success.main" paragraph>
              Your garage registration has been completed successfully!
            </Typography>
            <Paper elevation={2} sx={{ p: 3, mt: 3, mb: 3, borderRadius: 2, bgcolor: 'success.50' }}>
              <Typography variant="h6" fontWeight={600} color="success.main" gutterBottom>
                Registration Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Account Created Successfully" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Email Verification Completed" />
                </ListItem>
                {showBankDetails && formData.bankDetails.accountHolderName && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Bank Details Saved" />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <HourglassEmpty color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Pending Admin Approval" />
                </ListItem>
              </List>
              <Box mt={2} p={2} bgcolor="info.50" borderRadius={1}>
                <Typography variant="body2" color="info.main" fontWeight={600}>
                  Important: Your garage registration is now pending admin approval.
                  You will receive an email notification once your garage is approved and activated.
                </Typography>
              </Box>
              {garageId && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Registration ID: {garageId}
                </Typography>
              )}
            </Paper>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                startIcon={<CheckCircle />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: 3
                }}
              >
                Go to Login
              </Button>
              <Button
                variant="outlined"
                onClick={resetForm}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Register Another Garage
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" color="error.main" paragraph>
              Registration is incomplete. Please complete the email verification process.
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                onClick={() => setActiveStep(5)}
                startIcon={<Email />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: 3
                }}
              >
                Complete Verification
              </Button>
              <Button
                variant="outlined"
                onClick={resetForm}
                startIcon={<Refresh />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Start Over
              </Button>
            </Box>
          </Box>
        )}
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
                  alternativeLabel={true}
                  sx={{
                    "& .MuiStepLabel-root": {
                      fontSize: "0.875rem",
                      textAlign: "center"
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
                {activeStep === 1 && renderTaxBusinessDetails()}
                {activeStep === 2 && renderPlanSelection()}
                {activeStep === 3 && renderBankDetails()}
                {activeStep === 4 && renderFinalStep()}
                {activeStep === 5 && renderEmailVerification()}
                {activeStep === 6 && renderRegistrationStatus()}
              </Box>
              {/* Navigation */}
              {activeStep < 6 && (
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
                        onClick={() => navigate('/login')}
                      >
                        Sign In
                      </Typography>
                    </Typography>
                  </Box>
                  <Box width={80} /> {/* Spacer for alignment */}
                </Box>
              )}
            </Box>
          </Paper>
        </Slide>
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

export default EnhancedSignUpPage;
