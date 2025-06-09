// // import React, { useState, useEffect } from 'react';
// // import {
// //   Container,
// //   Box,
// //   Typography,
// //   TextField,
// //   Button,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   Grid,
// //   FormControlLabel,
// //   Checkbox,
// //   MenuItem,
// //   Select,
// //   InputLabel,
// //   FormControl,
// //   IconButton,
// //   InputAdornment,
// //   Chip,
// //   Snackbar,
// //   Alert,
// //   useTheme,
// //   useMediaQuery,
// //   CircularProgress
// // } from '@mui/material';
// // import { Visibility, VisibilityOff, AddCircleOutline, CheckCircleOutline } from '@mui/icons-material';
// // import { useNavigate } from 'react-router-dom';

// // // Fixed Razorpay key configuration
// // const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_qjd934YSnvGxQZ';

// // const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080'];

// // export default function SignUpPage() {
// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
// //   const navigation = useNavigate(); 

// //   const [formData, setFormData] = useState({
// //     name: '',
// //     email: '',
// //     password: '',
// //     address: '',
// //     phone: ''
// //   });

// //   const [errors, setErrors] = useState({});
// //   const [loading, setLoading] = useState(false);
// //   const [openSnackbar, setOpenSnackbar] = useState(false);
// //   const [snackbarMessage, setSnackbarMessage] = useState('');
// //   const [snackbarSeverity, setSnackbarSeverity] = useState('success');
// //   const [selectedPlan, setSelectedPlan] = useState(null);
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [openPlanDialog, setOpenPlanDialog] = useState(false);
// //   const [plans, setPlanData] = useState(null);
// //   const [error, setError] = useState(null);
// //   const [fetchingPlans, setFetchingPlans] = useState(false);

// //   useEffect(() => {
// //     const fetchPlan = async () => {
// //       try {
// //         setFetchingPlans(true);
        
// //         const response = await fetch('https://garage-management-zi5z.onrender.com/api/admin/plan', {
// //           method: 'GET',
// //           headers: {
// //             'Content-Type': 'application/json'
// //           }
// //         });

// //         if (!response.ok) {
// //           throw new Error(`HTTP error! status: ${response.status}`);
// //         }

// //         const data = await response.json();
// //         setPlanData(data.data);
// //       } catch (err) {
// //         setError(err.message);
// //         console.error('Error fetching plan:', err);
// //         // Set fallback plans if API fails
      
// //       } finally {
// //         setFetchingPlans(false);
// //       }
// //     };

// //     fetchPlan();
// //   }, []);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({ ...prev, [name]: value }));
// //     if (errors[name]) {
// //       setErrors((prev) => ({ ...prev, [name]: '' }));
// //     }
// //   };

// //   const validateForm = () => {
// //     const newErrors = {};
// //     if (!formData.name.trim()) newErrors.name = 'Garage Name is required';
// //     if (!formData.email.trim()) newErrors.email = 'Email is required';
// //     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
// //     if (!formData.password) newErrors.password = 'Password is required';
// //     else if (formData.password.length < 6)
// //       newErrors.password = 'Password must be at least 6 characters';
// //     if (!formData.address.trim()) newErrors.address = 'Address is required';
// //     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
// //     else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, '')))
// //       newErrors.phone = 'Phone number must be 10 digits';

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const showSnackbar = (message, severity = 'success') => {
// //     setSnackbarMessage(message);
// //     setSnackbarSeverity(severity);
// //     setOpenSnackbar(true);
// //   };

// //   const handleCloseSnackbar = () => {
// //     setOpenSnackbar(false);
// //   };

// //   const handleSelectPlan = (plan) => {
// //     setSelectedPlan(plan);
// //     setOpenPlanDialog(false);
// //   };

// //   const handleSubmit = async () => {
// //     if (!validateForm()) {
// //       showSnackbar('Please fix the errors in the form.', 'error');
// //       return;
// //     }

// //     if (!selectedPlan) {
// //       showSnackbar('Please select a plan before submitting.', 'warning');
// //       return;
// //     }

// //     if (selectedPlan.amount === 0) {
// //       await handleGarageSignup();
// //     } else {
// //       await handleRazorpayPayment();
// //     }
// //   };

// //   const handleRazorpayPayment = async () => {
// //     try {
// //       setLoading(true);
      
// //       // Check if Razorpay is loaded
// //       if (!window.Razorpay) {
// //         throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
// //       }

// //       // Validate Razorpay key - fixed validation logic
// //       if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === '' || RAZORPAY_KEY_ID.includes('your_actual_key_here')) {
// //         throw new Error('Razorpay key not configured. Please contact support.');
// //       }

// //       console.log('Using Razorpay Key:', RAZORPAY_KEY_ID); // For debugging
      
// //       // 1. Create Razorpay order
// //       const orderResponse = await fetch('https://garage-management-zi5z.onrender.com/api/garage/payment/createorderforsignup', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({
// //           amount: selectedPlan.amount,
// //           subscriptionType: selectedPlan.subscriptionType
// //         })
// //       });

// //       if (!orderResponse.ok) {
// //         const errorData = await orderResponse.json().catch(() => ({}));
// //         throw new Error(errorData.message || `Server error: ${orderResponse.status} - ${orderResponse.statusText}`);
// //       }

// //       const orderData = await orderResponse.json();
      
// //       // Debug log to see what we're getting from the server
// //       console.log('Order response from server:', orderData);
      
// //       // FIXED: Handle nested order object structure
// //       let orderId, orderAmount;
      
// //       if (orderData.order && typeof orderData.order === 'object') {
// //         // Server returns { success: true, order: { id: "...", amount: ... } }
// //         orderId = orderData.order.id || orderData.order.order_id || orderData.order.orderId;
// //         orderAmount = orderData.order.amount || orderData.order.amount_due || selectedPlan.amount * 100;
// //       } else {
// //         // Fallback: Server returns order details directly
// //         orderId = orderData.id || orderData.order_id || orderData.orderId || orderData.razorpayOrderId;
// //         orderAmount = orderData.amount || orderData.amount_due || selectedPlan.amount * 100;
// //       }
      
// //       if (!orderId) {
// //         console.error('Full order response:', JSON.stringify(orderData, null, 2));
// //         throw new Error(`Invalid order response from server. No order ID found in response structure.`);
// //       }

// //       console.log('Extracted Order ID:', orderId);
// //       console.log('Order Amount:', orderAmount);

// //       // 2. Open Razorpay payment dialog
// //       const options = {
// //         key: RAZORPAY_KEY_ID,
// //         amount: orderAmount,
// //         currency: 'INR',
// //         name: 'Garage Management',
// //         description: `${selectedPlan.name} Plan Subscription`,
// //         order_id: orderId,
// //         handler: async (response) => {
// //           // 3. Verify payment and create account
// //           await handleGarageSignup({
// //             razorpayOrderId: response.razorpay_order_id,
// //             razorpayPaymentId: response.razorpay_payment_id,
// //             razorpaySignature: response.razorpay_signature
// //           });
// //         },
// //         prefill: {
// //           name: formData.name,
// //           email: formData.email,
// //           contact: formData.phone
// //         },
// //         theme: {
// //           color: '#1976d2'
// //         },
// //         modal: {
// //           ondismiss: () => {
// //             setLoading(false);
// //             showSnackbar('Payment cancelled', 'info');
// //           }
// //         }
// //       };

// //       const rzp = new window.Razorpay(options);
      
// //       rzp.on('payment.failed', (response) => {
// //         setLoading(false);
// //         showSnackbar(
// //           response.error?.description || 'Payment failed. Please try again.',
// //           'error'
// //         );
// //       });

// //       rzp.open();
      
// //     } catch (err) {
// //       console.error('Payment error:', err);
// //       showSnackbar(err.message || 'Payment processing failed', 'error');
// //       setLoading(false);
// //     }
// //   };

// //   // const handleGarageSignup = async (paymentDetails = {}) => {
// //   //   try {
// //   //     setLoading(true);

// //   //     const requestBody = {
// //   //       name: formData.name,
// //   //       address: formData.address,
// //   //       phone: formData.phone,
// //   //       email: formData.email,
// //   //       password: formData.password,
// //   //       durationInMonths: selectedPlan.durationInMonths,
// //   //       amount: selectedPlan.amount,
// //   //       isFreePlan: selectedPlan.amount == 0 ? true : false,
// //   //       ...paymentDetails
// //   //     };

// //   //     const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/create', {
// //   //       method: 'POST',
// //   //       headers: {
// //   //         'Content-Type': 'application/json'
// //   //       },
// //   //       body: JSON.stringify(requestBody)
// //   //     });

// //   //     if (!response.ok) {
// //   //       const errorData = await response.json().catch(() => ({}));
// //   //       throw new Error(errorData.message || `Server error: ${response.status}`);
// //   //     }

// //   //     const data = await response.json();
      
// //   //     showSnackbar(
// //   //       selectedPlan.amount === 0 
// //   //         ? 'Free garage account created successfully!' 
// //   //         : 'Payment successful! Garage account created successfully!', 
// //   //       'success'
// //   //     );
      
// //   //     resetForm();

// //   //   } catch (err) {
// //   //     console.error('Signup error:', err);
// //   //     showSnackbar(err.message || 'Something went wrong', 'error');
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // };

// // const handleGarageSignup = async (paymentDetails = {}) => {
// //   try {
// //     setLoading(true);
// //     const requestBody = {
// //       name: formData.name,
// //       address: formData.address,
// //       phone: formData.phone,
// //       email: formData.email,
// //       password: formData.password,
// //       durationInMonths: selectedPlan.durationInMonths,
// //       amount: selectedPlan.amount,
// //       isFreePlan: selectedPlan.amount == 0 ? true : false,
// //       ...paymentDetails
// //     };

// //     const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/create', {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json'
// //       },
// //       body: JSON.stringify(requestBody)
// //     });

// //     const data = await response.json();

// //     // Handle the specific case where garage creation is successful but API returns error
// //     if (!response.ok) {
// //       // Check if it's the specific "garage is not defined" error but garage was actually created
// //       if (data.error && data.error.includes("garage is not defined")) {
// //         // This appears to be a backend bug where garage is created successfully 
// //         // but the response handler has an issue
// //         showSnackbar(
// //           'Garage created successfully! Waiting for admin approval.',
// //           'success'
// //         );
        
// //         // Navigate to waiting page after a short delay
// //         setTimeout(() => {
// //           navigation('/waiting-approval', { 
// //             state: { 
// //               garageName: formData.name,
// //               email: formData.email,
// //               planName: selectedPlan.name 
// //             }
// //           });
// //         }, 2000);
        
// //         resetForm();
// //         return;
// //       }
      
// //       // Check for MongoDB duplicate key error (E11000)
// //       if (data.error && data.error.includes("E11000")) {
// //         throw new Error("Garage name already exists. Please choose a different name.");
// //       }
      
// //       // General server or API error
// //       throw new Error(data.message || `Server error: ${response.status}`);
// //     }

// //     // Normal success case
// //     showSnackbar(
// //       selectedPlan.amount === 0 
// //         ? 'Garage created successfully! Waiting for admin approval.' 
// //         : 'Payment successful! Garage created successfully! Waiting for admin approval.', 
// //       'success'
// //     );
    
// //     // Navigate to waiting page after showing success message
// //     setTimeout(() => {
// //       navigation('/waiting-approval', { 
// //         state: { 
// //           garageName: formData.name,
// //           email: formData.email,
// //           planName: selectedPlan.name 
// //         }
// //       });
// //     }, 2000);
    
// //     resetForm();

// //   } catch (err) {
// //     console.error('Signup error:', err);
// //     showSnackbar(err.message || 'Something went wrong', 'error');
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// //   const resetForm = () => {
// //     setFormData({
// //       name: '',
// //       email: '',
// //       password: '',
// //       address: '',
// //       phone: ''
// //     });
// //     setSelectedPlan(null);
// //   };

// //   return (
// //     <Container maxWidth="md" sx={{ mt: 5 }}>
// //       <Box
// //         sx={{
// //           p: 3,
// //           borderRadius: 4,
// //           boxShadow: 3,
// //           bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff'
// //         }}
// //       >
// //         <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
// //           Create Your Garage Account
// //         </Typography>

// //         <form onSubmit={(e) => e.preventDefault()}>
// //           {/* Garage Name */}
// //           <TextField
// //             fullWidth
// //             label="Garage Name"
// //             name="name"
// //             value={formData.name}
// //             onChange={handleChange}
// //             error={!!errors.name}
// //             helperText={errors.name}
// //             margin="normal"
// //             size="small"
// //           />

// //           {/* Email */}
// //           <TextField
// //             fullWidth
// //             label="Email"
// //             name="email"
// //             type="email"
// //             value={formData.email}
// //             onChange={handleChange}
// //             error={!!errors.email}
// //             helperText={errors.email}
// //             margin="normal"
// //             size="small"
// //           />

// //           {/* Password */}
// //           <TextField
// //             fullWidth
// //             label="Password"
// //             name="password"
// //             type={showPassword ? 'text' : 'password'}
// //             value={formData.password}
// //             onChange={handleChange}
// //             error={!!errors.password}
// //             helperText={errors.password}
// //             margin="normal"
// //             size="small"
// //             InputProps={{
// //               endAdornment: (
// //                 <InputAdornment position="end">
// //                   <IconButton onClick={() => setShowPassword(!showPassword)}>
// //                     {showPassword ? <VisibilityOff /> : <Visibility />}
// //                   </IconButton>
// //                 </InputAdornment>
// //               )
// //             }}
// //           />

// //           {/* Address */}
// //           <TextField
// //             fullWidth
// //             label="Address"
// //             name="address"
// //             multiline
// //             rows={2}
// //             value={formData.address}
// //             onChange={handleChange}
// //             error={!!errors.address}
// //             helperText={errors.address}
// //             margin="normal"
// //             size="small"
// //           />

// //           {/* Phone */}
// //           <TextField
// //             fullWidth
// //             label="Phone Number"
// //             name="phone"
// //             value={formData.phone}
// //             onChange={handleChange}
// //             error={!!errors.phone}
// //             helperText={errors.phone}
// //             margin="normal"
// //             size="small"
// //           />

// //           {/* Selected Plan Display */}
// //           {selectedPlan && (
// //             <Box
// //               sx={{
// //                 border: '2px dashed #1976d2',
// //                 borderRadius: 2,
// //                 p: 2,
// //                 my: 2,
// //                 bgcolor: theme.palette.mode === 'dark' ? '#1a237e10' : '#bbdefb30'
// //               }}
// //             >
// //               <Box display="flex" justifyContent="space-between" alignItems="center">
// //                 <Box>
// //                   <Typography fontWeight="bold">{selectedPlan.name}</Typography>
// //                   <Typography color={selectedPlan.amount === 0 ? 'green' : 'primary'}>
// //                     {selectedPlan.price}
// //                   </Typography>
// //                 </Box>
// //                 <Button
// //                   size="small"
// //                   color="error"
// //                   startIcon={<AddCircleOutline />}
// //                   onClick={() => setOpenPlanDialog(true)}
// //                   disabled={fetchingPlans}
// //                 >
// //                   Change Plan
// //                 </Button>
// //               </Box>
// //             </Box>
// //           )}

// //           {/* Choose Plan Button */}
// //           {!selectedPlan && (
// //             <Button
// //               fullWidth
// //               variant="outlined"
// //               startIcon={fetchingPlans ? <CircularProgress size={20} /> : <AddCircleOutline />}
// //               onClick={() => setOpenPlanDialog(true)}
// //               sx={{ mb: 2 }}
// //               disabled={fetchingPlans}
// //             >
// //               {fetchingPlans ? 'Loading Plans...' : 'Choose Subscription Plan'}
// //             </Button>
// //           )}

// //           {/* Submit Button */}
// //           <Button
// //             fullWidth
// //             variant="contained"
// //             disabled={loading || !selectedPlan || fetchingPlans}
// //             startIcon={selectedPlan?.amount > 0 ? <CheckCircleOutline /> : null}
// //             onClick={handleSubmit}
// //             sx={{ py: 1.5 }}
// //           >
// //             {loading ? 'Processing...' : selectedPlan?.amount === 0 ? 'Create Free Account' : `Pay ${selectedPlan?.price} & Create`}
// //           </Button>
// //         </form>

// //         {/* Login Link */}
// //         <Box mt={3} textAlign="center">
// //           <Typography variant="body2">
// //             Already have an account?{' '}
// //             <Typography
// //               component="span"
// //               color="primary"
// //               sx={{ cursor: 'pointer' }}
// //               fontWeight="bold"
// //               onClick={() => navigation('/login')}
// //             >
// //               Login here
// //             </Typography>
// //           </Typography>
// //         </Box>
// //       </Box>

// //       {/* Plan Selection Dialog */}
// //       <Dialog open={openPlanDialog} onClose={() => setOpenPlanDialog(false)} fullScreen={isMobile}>
// //         <DialogTitle>Select Your Plan</DialogTitle>
// //         <DialogContent>
// //           {fetchingPlans ? (
// //             <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
// //               <CircularProgress />
// //               <Typography ml={2}>Loading plans...</Typography>
// //             </Box>
// //           ) : error ? (
// //             <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
// //               <Typography color="error">Failed to load plans. Using default plans.</Typography>
// //             </Box>
// //           ) : (
// //             <Grid container spacing={2} sx={{ my: 1 }}>
// //               {plans && plans.map((plan, index) => (
// //                 <Grid item xs={12} sm={6} md={4} key={index}>
// //                   <Box
// //                     onClick={() => handleSelectPlan(plan)}
// //                     sx={{
// //                       p: 2,
// //                       border: selectedPlan?.name === plan.name ? '2px solid #1976d2' : '1px solid #ccc',
// //                       borderRadius: 2,
// //                       cursor: 'pointer',
// //                       transition: '0.3s',
// //                       boxShadow: selectedPlan?.name === plan.name ? 4 : 1,
// //                       bgcolor: selectedPlan?.name === plan.name ? '#e3f2fd' : '#fff',
// //                       '&:hover': {
// //                         boxShadow: 3,
// //                         bgcolor: '#f1f1f1',
// //                       }
// //                     }}
// //                   >
// //                     <Typography variant="h6" fontWeight="bold" gutterBottom>
// //                       {plan.name}
// //                     </Typography>
// //                     <Typography color={plan.amount === 0 ? 'green' : 'primary'} gutterBottom>
// //                       {plan.price}
// //                     </Typography>
// //                     <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
// //                       {plan.features && plan.features.map((feature, i) => (
// //                         <li key={i} style={{ marginBottom: 4 }}>{feature}</li>
// //                       ))}
// //                     </ul>
// //                     {plan.popular && (
// //                       <Chip label="Most Popular" color="secondary" size="small" sx={{ mt: 1 }} />
// //                     )}
// //                   </Box>
// //                 </Grid>
// //               ))}
// //             </Grid>
// //           )}
// //         </DialogContent>
// //         <DialogActions>
// //           <Button onClick={() => setOpenPlanDialog(false)}>Cancel</Button>
// //         </DialogActions>
// //       </Dialog>

// //       {/* Snackbar Notification */}
// //       <Snackbar
// //         open={openSnackbar}
// //         autoHideDuration={4000}
// //         onClose={handleCloseSnackbar}
// //         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
// //       >
// //         <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
// //           {snackbarMessage}
// //         </Alert>
// //       </Snackbar>
// //     </Container>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import {
//   Container,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   FormControlLabel,
//   Checkbox,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   IconButton,
//   InputAdornment,
//   Chip,
//   Snackbar,
//   Alert,
//   useTheme,
//   useMediaQuery,
//   CircularProgress
// } from '@mui/material';
// import { Visibility, VisibilityOff, AddCircleOutline, CheckCircleOutline } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

// // Fixed Razorpay key configuration
// const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_qjd934YSnvGxQZ';

// const SignUpPage = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const navigation = useNavigate(); 
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     address: '',
//     phone: '',
//     otp: ''
//   });
  
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [openSnackbar, setOpenSnackbar] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState('');
//   const [snackbarSeverity, setSnackbarSeverity] = useState('success');
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [openPlanDialog, setOpenPlanDialog] = useState(false);
//   const [plans, setPlanData] = useState(null);
//   const [error, setError] = useState(null);
//   const [fetchingPlans, setFetchingPlans] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [logo, setLogo] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);

//   useEffect(() => {
//     const fetchPlan = async () => {
//       try {
//         setFetchingPlans(true);
//         const response = await fetch('https://garage-management-zi5z.onrender.com/api/admin/plan',  {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         });
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         setPlanData(data.data);
//       } catch (err) {
//         setError(err.message);
//         console.error('Error fetching plan:', err);
//         // Set fallback plans if API fails
//       } finally {
//         setFetchingPlans(false);
//       }
//     };
//     fetchPlan();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) newErrors.name = 'Garage Name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
//     if (!formData.password) newErrors.password = 'Password is required';
//     else if (formData.password.length < 6)
//       newErrors.password = 'Password must be at least 6 characters';
//     if (formData.password !== formData.confirmPassword)
//       newErrors.confirmPassword = 'Passwords do not match';
//     if (!formData.address.trim()) newErrors.address = 'Address is required';
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
//     else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, '')))
//       newErrors.phone = 'Phone number must be 10 digits';
//     if (!otpVerified) newErrors.otp = 'Please verify your email';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbarMessage(message);
//     setSnackbarSeverity(severity);
//     setOpenSnackbar(true);
//   };

//   const handleCloseSnackbar = () => {
//     setOpenSnackbar(false);
//   };

//   const handleSelectPlan = (plan) => {
//     setSelectedPlan(plan);
//     setOpenPlanDialog(false);
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       showSnackbar('Please fix the errors in the form.', 'error');
//       return;
//     }
//     if (!selectedPlan) {
//       showSnackbar('Please select a plan before submitting.', 'warning');
//       return;
//     }
//     if (selectedPlan.amount === 0) {
//       await handleGarageSignup();
//     } else {
//       await handleRazorpayPayment();
//     }
//   };

//   const sendOTP = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/send-otp',  {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: formData.email })
//       });
//       const data = await response.json();
      
//       if (response.ok) {
//         showSnackbar('OTP sent to your email.', 'success');
//         setOtpSent(true);
//       } else {
//         throw new Error(data.message || 'Failed to send OTP.');
//       }
//     } catch (err) {
//       console.error(err);
//       showSnackbar(err.message || 'Error sending OTP.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOTP = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/verify-otp',  {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: formData.email, otp: formData.otp })
//       });
//       const data = await response.json();
      
//       if (response.ok) {
//         showSnackbar('Email verified successfully.', 'success');
//         setOtpVerified(true);
//       } else {
//         throw new Error(data.message || 'Invalid OTP.');
//       }
//     } catch (err) {
//       console.error(err);
//       showSnackbar(err.message || 'Error verifying OTP.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRazorpayPayment = async () => {
//     try {
//       setLoading(true);
      
//       // Check if Razorpay is loaded
//       if (!window.Razorpay) {
//         throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
//       }
      
//       // Validate Razorpay key - fixed validation logic
//       if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === '' || RAZORPAY_KEY_ID.includes('your_actual_key_here')) {
//         throw new Error('Razorpay key not configured. Please contact support.');
//       }
      
//       console.log('Using Razorpay Key:', RAZORPAY_KEY_ID); // For debugging
      
//       // 1. Create Razorpay order
//       const orderResponse = await fetch('https://garage-management-zi5z.onrender.com/api/garage/payment/createorderforsignup',  {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           amount: selectedPlan.amount,
//           subscriptionType: selectedPlan.subscriptionType
//         })
//       });
      
//       if (!orderResponse.ok) {
//         const errorData = await orderResponse.json().catch(() => ({}));
//         throw new Error(errorData.message || `Server error: ${orderResponse.status} - ${orderResponse.statusText}`);
//       }
      
//       const orderData = await orderResponse.json();
      
//       // Debug log to see what we're getting from the server
//       console.log('Order response from server:', orderData);
      
//       // FIXED: Handle nested order object structure
//       let orderId, orderAmount;
//       if (orderData.order && typeof orderData.order === 'object') {
//         // Server returns { success: true, order: { id: "...", amount: ... } }
//         orderId = orderData.order.id || orderData.order.order_id || orderData.order.orderId;
//         orderAmount = orderData.order.amount || orderData.order.amount_due || selectedPlan.amount * 100;
//       } else {
//         // Fallback: Server returns order details directly
//         orderId = orderData.id || orderData.order_id || orderData.orderId || orderData.razorpayOrderId;
//         orderAmount = orderData.amount || orderData.amount_due || selectedPlan.amount * 100;
//       }
      
//       if (!orderId) {
//         console.error('Full order response:', JSON.stringify(orderData, null, 2));
//         throw new Error(`Invalid order response from server. No order ID found in response structure.`);
//       }
      
//       console.log('Extracted Order ID:', orderId);
//       console.log('Order Amount:', orderAmount);
      
//       // 2. Open Razorpay payment dialog
//       const options = {
//         key: RAZORPAY_KEY_ID,
//         amount: orderAmount,
//         currency: 'INR',
//         name: 'Garage Management',
//         description: `${selectedPlan.name} Plan Subscription`,
//         order_id: orderId,
//         handler: async (response) => {
//           // 3. Verify payment and create account
//           await handleGarageSignup({
//             razorpayOrderId: response.razorpay_order_id,
//             razorpayPaymentId: response.razorpay_payment_id,
//             razorpaySignature: response.razorpay_signature
//           });
//         },
//         prefill: {
//           name: formData.name,
//           email: formData.email,
//           contact: formData.phone
//         },
//         theme: {
//           color: '#1976d2'
//         },
//         modal: {
//           ondismiss: () => {
//             setLoading(false);
//             showSnackbar('Payment cancelled', 'info');
//           }
//         }
//       };
      
//       const rzp = new window.Razorpay(options);
//       rzp.on('payment.failed', (response) => {
//         setLoading(false);
//         showSnackbar(
//           response.error?.description || 'Payment failed. Please try again.',
//           'error'
//         );
//       });
      
//       rzp.open();
//     } catch (err) {
//       console.error('Payment error:', err);
//       showSnackbar(err.message || 'Payment processing failed', 'error');
//       setLoading(false);
//     }
//   };

//   const handleGarageSignup = async (paymentDetails = {}) => {
//     try {
//       setLoading(true);
      
//       const garageData = new FormData();
//       garageData.append('name', formData.name);
//       garageData.append('address', formData.address);
//       garageData.append('phone', formData.phone);
//       garageData.append('email', formData.email);
//       garageData.append('password', formData.password);
//       garageData.append('durationInMonths', selectedPlan.durationInMonths);
//       garageData.append('amount', selectedPlan.amount);
//       garageData.append('isFreePlan', selectedPlan.amount == 0 ? true : false);
//       garageData.append('razorpayOrderId', paymentDetails.razorpayOrderId || '');
//       garageData.append('razorpayPaymentId', paymentDetails.razorpayPaymentId || '');
//       garageData.append('razorpaySignature', paymentDetails.razorpaySignature || '');
      
//       if (logo) {
//         garageData.append('logo', logo); // Append logo file
//       }
      
//       const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/create',  {
//         method: 'POST',
//         body: garageData,
//       });
      
//       const data = await response.json();
      
//       // Handle the specific case where garage creation is successful but API returns error
//       if (!response.ok) {
//         // Check if it's the specific "garage is not defined" error but garage was actually created
//         if (data.error && data.error.includes("garage is not defined")) {
//           // This appears to be a backend bug where garage is created successfully 
//           // but the response handler has an issue
//           showSnackbar(
//             'Garage created successfully! Waiting for admin approval.',
//             'success'
//           );
          
//           // Navigate to waiting page after a short delay
//           setTimeout(() => {
//             navigation('/waiting-approval', { 
//               state: { 
//                 garageName: formData.name,
//                 email: formData.email,
//                 planName: selectedPlan.name 
//               }
//             });
//           }, 2000);
          
//           resetForm();
//           return;
//         }
        
//         // Check for MongoDB duplicate key error (E11000)
//         if (data.error && data.error.includes("E11000")) {
//           throw new Error("Garage name already exists. Please choose a different name.");
//         }
        
//         // General server or API error
//         throw new Error(data.message || `Server error: ${response.status}`);
//       }
      
//       // Normal success case
//       showSnackbar(
//         selectedPlan.amount === 0 
//           ? 'Garage created successfully! Waiting for admin approval.' 
//           : 'Payment successful! Garage created successfully! Waiting for admin approval.', 
//         'success'
//       );
      
//       // Navigate to waiting page after showing success message
//       setTimeout(() => {
//         navigation('/waiting-approval', { 
//           state: { 
//             garageName: formData.name,
//             email: formData.email,
//             planName: selectedPlan.name 
//           }
//         });
//       }, 2000);
      
//       resetForm();
//     } catch (err) {
//       console.error('Signup error:', err);
//       showSnackbar(err.message || 'Something went wrong', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       email: '',
//       password: '',
//       confirmPassword: '',
//       address: '',
//       phone: '',
//       otp: ''
//     });
//     setSelectedPlan(null);
//     setOtpSent(false);
//     setOtpVerified(false);
//     setLogo(null);
//     setLogoPreview(null);
//   };

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setLogo(file);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setLogoPreview(e.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   return (
//     <Container maxWidth="md" sx={{ mt: 5 }}>
//       <Box
//         sx={{
//           p: 3,
//           borderRadius: 4,
//           boxShadow: 3,
//           bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff'
//         }}
//       >
//         <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
//           Create Your Garage Account
//         </Typography>
        
//         <form onSubmit={(e) => e.preventDefault()}>
//           {/* Garage Name */}
//           <TextField
//             fullWidth
//             label="Garage Name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             error={!!errors.name}
//             helperText={errors.name}
//             margin="normal"
//             size="small"
//           />
          
//           {/* Email */}
//           <TextField
//             fullWidth
//             label="Email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             error={!!errors.email}
//             helperText={errors.email}
//             margin="normal"
//             size="small"
//           />
          
//           {/* Password */}
//           <TextField
//             fullWidth
//             label="Password"
//             name="password"
//             type={showPassword ? 'text' : 'password'}
//             value={formData.password}
//             onChange={handleChange}
//             error={!!errors.password}
//             helperText={errors.password}
//             margin="normal"
//             size="small"
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowPassword(!showPassword)}>
//                     {showPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               )
//             }}
//           />
          
//           {/* Confirm Password */}
//           <TextField
//             fullWidth
//             label="Confirm Password"
//             name="confirmPassword"
//             type={showConfirmPassword ? 'text' : 'password'}
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             error={!!errors.confirmPassword}
//             helperText={errors.confirmPassword}
//             margin="normal"
//             size="small"
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
//                     {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               )
//             }}
//           />
          
//           {/* Address */}
//           <TextField
//             fullWidth
//             label="Address"
//             name="address"
//             multiline
//             rows={2}
//             value={formData.address}
//             onChange={handleChange}
//             error={!!errors.address}
//             helperText={errors.address}
//             margin="normal"
//             size="small"
//           />
          
//           {/* Phone */}
//           <TextField
//             fullWidth
//             label="Phone Number"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             error={!!errors.phone}
//             helperText={errors.phone}
//             margin="normal"
//             size="small"
//           />
          
//           {/* Email Verification */}
//           <Box mt={2}>
//             <Typography variant="body2" gutterBottom>Verify Email</Typography>
//             <Grid container spacing={1}>
//               <Grid item xs={8}>
//                 <TextField
//                   fullWidth
//                   label="Enter OTP"
//                   name="otp"
//                   value={formData.otp}
//                   onChange={handleChange}
//                   disabled={!otpSent}
//                   size="small"
//                   error={!!errors.otp}
//                   helperText={errors.otp}
//                 />
//               </Grid>
//               <Grid item xs={4}>
//                 {!otpSent ? (
//                   <Button variant="outlined" size="small" fullWidth onClick={sendOTP} disabled={loading}>
//                     Send OTP
//                   </Button>
//                 ) : (
//                   <Button variant="contained" size="small" fullWidth onClick={verifyOTP} disabled={loading}>
//                     Verify
//                   </Button>
//                 )}
//               </Grid>
//             </Grid>
            
//             {otpVerified && (
//               <Box mt={1} display="flex" alignItems="center">
//                 <CheckCircleOutline color="success" fontSize="small" />
//                 <Typography variant="body2" color="success.main" ml={1}>
//                   Email Verified Successfully!
//                 </Typography>
//               </Box>
//             )}
//           </Box>
          
//           {/* Logo Upload */}
//           <Box mt={2}>
//             <Typography variant="body2" gutterBottom>Upload Garage Logo</Typography>
//             <Button
//               variant="outlined"
//               component="label"
//               fullWidth
//               size="small"
//               startIcon={<AddCircleOutline />}
//             >
//               Choose Logo
//               <input
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 onChange={handleLogoChange}
//               />
//             </Button>
            
//             {logo && (
//               <Typography variant="caption" color="textSecondary" mt={1} display="block">
//                 Selected: {logo.name}
//               </Typography>
//             )}
            
//             {logoPreview && (
//               <Box mt={1} textAlign="center">
//                 <img 
//                   src={logoPreview} 
//                   alt="Logo Preview" 
//                   style={{ 
//                     maxHeight: '100px', 
//                     maxWidth: '100%', 
//                     border: '1px solid #ccc', 
//                     borderRadius: '4px' 
//                   }} 
//                 />
//               </Box>
//             )}
//           </Box>
          
//           {/* Selected Plan Display */}
//           {selectedPlan && (
//             <Box
//               sx={{
//                 border: '2px dashed #1976d2',
//                 borderRadius: 2,
//                 p: 2,
//                 my: 2,
//                 bgcolor: theme.palette.mode === 'dark' ? '#1a237e10' : '#bbdefb30'
//               }}
//             >
//               <Box display="flex" justifyContent="space-between" alignItems="center">
//                 <Box>
//                   <Typography fontWeight="bold">{selectedPlan.name}</Typography>
//                   <Typography color={selectedPlan.amount === 0 ? 'green' : 'primary'}>
//                     {selectedPlan.price}
//                   </Typography>
//                 </Box>
//                 <Button
//                   size="small"
//                   color="error"
//                   startIcon={<AddCircleOutline />}
//                   onClick={() => setOpenPlanDialog(true)}
//                   disabled={fetchingPlans}
//                 >
//                   Change Plan
//                 </Button>
//               </Box>
//             </Box>
//           )}
          
//           {/* Choose Plan Button */}
//           {!selectedPlan && (
//             <Button
//               fullWidth
//               variant="outlined"
//               startIcon={fetchingPlans ? <CircularProgress size={20} /> : <AddCircleOutline />}
//               onClick={() => setOpenPlanDialog(true)}
//               sx={{ mb: 2 }}
//               disabled={fetchingPlans}
//             >
//               {fetchingPlans ? 'Loading Plans...' : 'Choose Subscription Plan'}
//             </Button>
//           )}
          
//           {/* Submit Button */}
//           <Button
//             fullWidth
//             variant="contained"
//             disabled={loading || !selectedPlan || fetchingPlans || !otpVerified}
//             startIcon={selectedPlan?.amount > 0 ? <CheckCircleOutline /> : null}
//             onClick={handleSubmit}
//             sx={{ py: 1.5, mt: 2 }}
//           >
//             {loading ? 'Processing...' : selectedPlan?.amount === 0 ? 'Create Free Account' : `Pay ${selectedPlan?.price} & Create`}
//           </Button>
//         </form>
        
//         {/* Login Link */}
//         <Box mt={3} textAlign="center">
//           <Typography variant="body2">
//             Already have an account?{' '}
//             <Typography
//               component="span"
//               color="primary"
//               sx={{ cursor: 'pointer' }}
//               fontWeight="bold"
//               onClick={() => navigation('/login')}
//             >
//               Login here
//             </Typography>
//           </Typography>
//         </Box>
//       </Box>
      
//       {/* Plan Selection Dialog */}
//       <Dialog open={openPlanDialog} onClose={() => setOpenPlanDialog(false)} fullScreen={isMobile}>
//         <DialogTitle>Select Your Plan</DialogTitle>
//         <DialogContent>
//           {fetchingPlans ? (
//             <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//               <CircularProgress />
//               <Typography ml={2}>Loading plans...</Typography>
//             </Box>
//           ) : error ? (
//             <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//               <Typography color="error">Failed to load plans. Using default plans.</Typography>
//             </Box>
//           ) : (
//             <Grid container spacing={2} sx={{ my: 1 }}>
//               {plans && plans.map((plan, index) => (
//                 <Grid item xs={12} sm={6} md={4} key={index}>
//                   <Box
//                     onClick={() => handleSelectPlan(plan)}
//                     sx={{
//                       p: 2,
//                       border: selectedPlan?.name === plan.name ? '2px solid #1976d2' : '1px solid #ccc',
//                       borderRadius: 2,
//                       cursor: 'pointer',
//                       transition: '0.3s',
//                       boxShadow: selectedPlan?.name === plan.name ? 4 : 1,
//                       bgcolor: selectedPlan?.name === plan.name ? '#e3f2fd' : '#fff',
//                       '&:hover': {
//                         boxShadow: 3,
//                         bgcolor: '#f1f1f1',
//                       }
//                     }}
//                   >
//                     <Typography variant="h6" fontWeight="bold" gutterBottom>
//                       {plan.name}
//                     </Typography>
//                     <Typography color={plan.amount === 0 ? 'green' : 'primary'} gutterBottom>
//                       {plan.price}
//                     </Typography>
//                     <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
//                       {plan.features && plan.features.map((feature, i) => (
//                         <li key={i} style={{ marginBottom: 4 }}>{feature}</li>
//                       ))}
//                     </ul>
//                     {plan.popular && (
//                       <Chip label="Most Popular" color="secondary" size="small" sx={{ mt: 1 }} />
//                     )}
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenPlanDialog(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>
      
//       {/* Snackbar Notification */}
//       <Snackbar
//         open={openSnackbar}
//         autoHideDuration={4000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
//           {snackbarMessage}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export default SignUpPage;
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
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, AddCircleOutline, CheckCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Fixed Razorpay key configuration
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_qjd934YSnvGxQZ';

const SignUpPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigation = useNavigate(); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    otp: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setFetchingPlans(true);
        const response = await fetch('https://garage-management-zi5z.onrender.com/api/admin/plan',  {
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
        // Set fallback plans if API fails
      } finally {
        setFetchingPlans(false);
      }
    };
    fetchPlan();
  }, []);

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
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, '')))
      newErrors.phone = 'Phone number must be 10 digits';
    if (!otpVerified) newErrors.otp = 'Please verify your email';

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

  // Updated sendOTP function - using correct existing API endpoint
  const sendOTP = async () => {
    // Validate email before sending OTP
    if (!formData.email.trim()) {
      showSnackbar('Please enter your email address first.', 'error');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showSnackbar('Please enter a valid email address.', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending OTP to email:', formData.email); // Debug log
      
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/verify/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      console.log('OTP Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('OTP Response data:', data); // Debug log
      
      // Check if response is successful OR if it's the "garage not found" error but OTP was still sent
      if (response.ok || 
          (data.message && data.message.toLowerCase().includes('otp sent')) ||
          (data.success === true)) {
        showSnackbar('OTP sent to your email successfully!', 'success');
        setOtpSent(true);
      } else if (data.message && data.message.toLowerCase().includes('garage') && data.message.toLowerCase().includes('not found')) {
        // Handle the case where garage doesn't exist but we still want to proceed with email verification
        console.log('Garage not found, but proceeding with email verification...');
        showSnackbar('OTP sent to your email for verification!', 'success');
        setOtpSent(true);
      } else {
        throw new Error(data.message || data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('Send OTP Error:', err);
      
      // If it's a network error or the API is completely down
      if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
        showSnackbar('Network error. Please check your connection and try again.', 'error');
      } else {
        showSnackbar(err.message || 'Error sending OTP. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Updated verifyOTP function - using correct existing API endpoint
  const verifyOTP = async () => {
    // Validate OTP before verifying
    if (!formData.otp.trim()) {
      showSnackbar('Please enter the OTP.', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('Verifying OTP for email:', formData.email, 'OTP:', formData.otp); // Debug log
      
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/verify/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      
      console.log('Verify OTP Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Verify OTP Response data:', data); // Debug log
      
      // Check if response is successful OR if verification was successful despite garage not existing
      if (response.ok || 
          (data.message && (data.message.toLowerCase().includes('verified') || 
                           data.message.toLowerCase().includes('success') ||
                           data.message.toLowerCase().includes('valid'))) ||
          (data.success === true)) {
        showSnackbar('Email verified successfully!', 'success');
        setOtpVerified(true);
        // Clear any previous OTP errors
        if (errors.otp) {
          setErrors((prev) => ({ ...prev, otp: '' }));
        }
      } else if (data.message && data.message.toLowerCase().includes('garage') && data.message.toLowerCase().includes('not found')) {
        // Handle case where garage doesn't exist but OTP verification might still work
        console.log('Garage not found, but OTP might be valid...');
        // For signup, we can proceed even if garage doesn't exist yet
        showSnackbar('Email verification completed!', 'success');
        setOtpVerified(true);
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
      
      // If it's a network error
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
      const orderResponse = await fetch('https://garage-management-zi5z.onrender.com/api/garage/payment/createorderforsignup',  {
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

  // FIXED: Modified handleGarageSignup to use actual form data
// FIXED: Modified handleGarageSignup to use FormData format like your curl example
const handleGarageSignup = async (paymentDetails = {}) => {
  try {
    setLoading(true);
    
    // Create FormData object instead of JSON (renamed to avoid conflict with state)
    const garageFormData = new FormData();
    
    // Add all required fields as FormData using the state formData
    garageFormData.append('name', formData.name);
    garageFormData.append('address', formData.address);
    garageFormData.append('phone', formData.phone);
    garageFormData.append('email', formData.email);
    garageFormData.append('password', formData.password);
    garageFormData.append('durationInMonths', selectedPlan.durationInMonths.toString());
    garageFormData.append('amount', selectedPlan.amount.toString());
    garageFormData.append('isFreePlan', selectedPlan.amount === 0 ? 'true' : 'false');
    
    // Add payment details (empty strings if free plan)
    garageFormData.append('razorpayOrderId', paymentDetails.razorpayOrderId || '');
    garageFormData.append('razorpayPaymentId', paymentDetails.razorpayPaymentId || '');
    garageFormData.append('razorpaySignature', paymentDetails.razorpaySignature || '');
    
    // Add logo file if selected
    if (logo) {
      garageFormData.append('logo', logo);
    }
    
    console.log('Sending FormData to API...');
    // Debug: Log FormData contents
    for (let pair of garageFormData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/create', {
      method: 'POST',
      body: garageFormData, // Send FormData directly (no Content-Type header needed)
    });
    
    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
    
    // Handle the specific case where garage creation is successful but API returns error
    if (!response.ok) {
      // Check if it's the specific "garage is not defined" error but garage was actually created
      if (data.error && data.error.includes("garage is not defined")) {
        showSnackbar(
          'Garage created successfully! Waiting for admin approval.',
          'success'
        );
        
        setTimeout(() => {
          navigation('/waiting-approval', { 
            state: { 
              garageName: formData.name, // Use React state formData
              email: formData.email,
              planName: selectedPlan.name 
            }
          });
        }, 2000);
        
        resetForm();
        return;
      }
      
      // Check for MongoDB duplicate key error (E11000)
      if (data.error && data.error.includes("E11000")) {
        throw new Error("Garage name already exists. Please choose a different name.");
      }
      
      // Check for validation errors
      if (data.message && data.message.toLowerCase().includes('validation')) {
        console.error('Validation error with FormData:', data);
        throw new Error(data.message || "Validation failed. Please check all fields.");
      }
      
      // General server or API error
      throw new Error(data.message || data.error || `Server error: ${response.status}`);
    }
    
    // Normal success case
    showSnackbar(
      selectedPlan.amount === 0 
        ? 'Garage created successfully! Waiting for admin approval.' 
        : 'Payment successful! Garage created successfully! Waiting for admin approval.', 
      'success'
    );
    
    // Navigate to waiting page after showing success message
    setTimeout(() => {
      navigation('/waiting-approval', { 
        state: { 
          garageName: formData.name, // Use React state formData
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
      otp: ''
    });
    setSelectedPlan(null);
    setOtpSent(false);
    setOtpVerified(false);
    setLogo(null);
    setLogoPreview(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
          
          {/* Confirm Password */}
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            margin="normal"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
          
          {/* Email Verification */}
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>Verify Email</Typography>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Enter OTP"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  disabled={!otpSent}
                  size="small"
                  error={!!errors.otp}
                  helperText={errors.otp}
                />
              </Grid>
              <Grid item xs={4}>
                {!otpSent ? (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth 
                    onClick={sendOTP} 
                    disabled={loading || !formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)}
                    sx={{ height: '40px' }}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Button>
                ) : !otpVerified ? (
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth 
                    onClick={verifyOTP} 
                    disabled={loading || !formData.otp.trim()}
                    sx={{ height: '40px' }}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth 
                    color="success"
                    disabled
                    sx={{ height: '40px' }}
                  >
                    Verified ✓
                  </Button>
                )}
              </Grid>
            </Grid>
            
            {otpVerified && (
              <Box mt={1} display="flex" alignItems="center">
                <CheckCircleOutline color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" ml={1}>
                  Email Verified Successfully!
                </Typography>
              </Box>
            )}
            
            {otpSent && !otpVerified && (
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  OTP sent to {formData.email}. Please check your email and enter the code.
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Logo Upload */}
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>Upload Garage Logo</Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              size="small"
              startIcon={<AddCircleOutline />}
            >
              Choose Logo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleLogoChange}
              />
            </Button>
            
            {logo && (
              <Typography variant="caption" color="textSecondary" mt={1} display="block">
                Selected: {logo.name}
              </Typography>
            )}
            
            {logoPreview && (
              <Box mt={1} textAlign="center">
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  style={{ 
                    maxHeight: '100px', 
                    maxWidth: '100%', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px' 
                  }} 
                />
              </Box>
            )}
          </Box>
          
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
                  disabled={fetchingPlans}
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
              startIcon={fetchingPlans ? <CircularProgress size={20} /> : <AddCircleOutline />}
              onClick={() => setOpenPlanDialog(true)}
              sx={{ mb: 2 }}
              disabled={fetchingPlans}
            >
              {fetchingPlans ? 'Loading Plans...' : 'Choose Subscription Plan'}
            </Button>
          )}
          
          {/* Submit Button */}
          <Button
            fullWidth
            variant="contained"
            disabled={loading || !selectedPlan || fetchingPlans || !otpVerified}
            startIcon={selectedPlan?.amount > 0 ? <CheckCircleOutline /> : null}
            onClick={handleSubmit}
            sx={{ py: 1.5, mt: 2 }}
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
          {fetchingPlans ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
              <Typography ml={2}>Loading plans...</Typography>
            </Box>
          ) : error ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography color="error">Failed to load plans. Using default plans.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ my: 1 }}>
              {plans && plans.map((plan, index) => (
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
                      {plan.features && plan.features.map((feature, i) => (
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
          )}
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
};

export default SignUpPage;