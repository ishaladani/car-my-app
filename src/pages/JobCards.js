import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Paper,
  CssBaseline,
  Container,
  LinearProgress,
  Rating,
  useTheme,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Snackbar,
  Alert,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera,
  Videocam,
  DirectionsCar,
  Person,
  LocalGasStation,
  Phone,
  Email,
  DriveEta,
  Description,
  Speed,
  EventNote,
  Policy,
  Numbers,
  LocalOffer,
  AttachMoney,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: '10px 15px',
  margin: '8px 0',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  border: `1px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
  },
}));

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

const validateCarNumber = (carNumber) => {
  // Basic car number validation - adjust based on your region's format
  const carNumberRegex = /^[A-Z0-9\s-]{4,15}$/i;
  return carNumberRegex.test(carNumber);
};

const validatePolicyNumber = (policyNumber) => {
  // Basic policy number validation
  return policyNumber.length >= 5 && policyNumber.length <= 20;
};

const validateRegistrationNumber = (regNumber) => {
  // Basic registration number validation
  return regNumber.length >= 5 && regNumber.length <= 20;
};

const validateExcessAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= 0 && numAmount <= 1000000;
};

const validateKilometer = (km) => {
  const numKm = parseInt(km);
  return !isNaN(numKm) && numKm >= 0 && numKm <= 9999999;
};

const validateFileSize = (file, maxSizeMB) => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  return allowedTypes.includes(file.type) && validateFileSize(file, 10);
};

const validateVideoFile = (file) => {
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
  return allowedTypes.includes(file.type) && validateFileSize(file, 50);
};

const JobCards = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [fuelLevel, setFuelLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const garageId = localStorage.getItem('garageId');

  // Form state
  const [formData, setFormData] = useState({
    customerNumber:'',
    customerName: '',
    contactNumber: '',
    email: '',
    carNumber: '',
    model: '',
    company: '',
    kilometer: '',
    fuelType: 'petrol',
    insuranceProvider: '',
    expiryDate: '',
    policyNumber: '',
    registrationNumber: '',
    type: '',
    excessAmount: '',
  });

  // Job Details Point-wise state
  const [jobPoints, setJobPoints] = useState(['']);
  const [currentJobPoint, setCurrentJobPoint] = useState('');

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // File state
  const [carImages, setCarImages] = useState({
    frontView: null,
    rearView: null,
    leftSide: null,
    rightSide: null
  });
  const [videoFile, setVideoFile] = useState(null);
  const [fileErrors, setFileErrors] = useState({});

  useEffect(() => {
    if (!garageId) {
      navigate("/login");
    }
  }, []);

  // Real-time validation function
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'customerName':
        if (!value.trim()) {
          error = 'Customer name is required';
        } else if (value.trim().length < 2) {
          error = 'Customer name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          error = 'Customer name must be less than 50 characters';
        }
        break;

      case 'contactNumber':
        if (!value.trim()) {
          error = 'Contact number is required';
        } else if (!validatePhone(value)) {
          error = 'Please enter a valid phone number (10-15 digits)';
        }
        break;

      case 'email':
        if (value.trim() && !validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'carNumber':
        if (!value.trim()) {
          error = 'Car number is required';
        } else if (!validateCarNumber(value)) {
          error = 'Please enter a valid car number';
        }
        break;

      case 'model':
        if (!value.trim()) {
          error = 'Car model is required';
        } else if (value.trim().length < 2) {
          error = 'Model must be at least 2 characters';
        }
        break;

      case 'company':
        if (value.trim() && value.trim().length < 2) {
          error = 'Company name must be at least 2 characters';
        }
        break;

      case 'kilometer':
        if (value && !validateKilometer(value)) {
          error = 'Please enter a valid kilometer reading (0-9,999,999)';
        }
        break;

      case 'insuranceProvider':
        if (value.trim() && value.trim().length < 2) {
          error = 'Insurance provider must be at least 2 characters';
        }
        break;

      case 'expiryDate':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            error = 'Expiry date cannot be in the past';
          }
        }
        break;

      case 'policyNumber':
        if (value.trim() && !validatePolicyNumber(value)) {
          error = 'Policy number must be 5-20 characters';
        }
        break;

      case 'registrationNumber':
        if (value.trim() && !validateRegistrationNumber(value)) {
          error = 'Registration number must be 5-20 characters';
        }
        break;

      case 'excessAmount':
        if (value && !validateExcessAmount(value)) {
          error = 'Please enter a valid amount (0-1,000,000)';
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Handle form field changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle field blur events
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Job Points Management
  const addJobPoint = () => {
    if (currentJobPoint.trim()) {
      setJobPoints(prev => [...prev.filter(point => point.trim()), currentJobPoint.trim()]);
      setCurrentJobPoint('');
    }
  };

  const removeJobPoint = (indexToRemove) => {
    setJobPoints(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const updateJobPoint = (index, value) => {
    setJobPoints(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleJobPointKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addJobPoint();
    }
  };

  // Convert job points to single string for API
  const getJobDetailsForAPI = () => {
    const validPoints = jobPoints.filter(point => point.trim());
    return validPoints.map((point, index) => `${index + 1}. ${point}`).join('\n');
  };

  // Validate all form fields
  const validateAllFields = () => {
    const newErrors = {};
    const newTouched = {};

    Object.keys(formData).forEach(key => {
      newTouched[key] = true;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (view, file) => {
    if (!file) return;

    const newFileErrors = { ...fileErrors };
    
    if (!validateImageFile(file)) {
      newFileErrors[view] = 'Please upload a valid image file (JPEG, PNG, WebP) under 10MB';
      setFileErrors(newFileErrors);
      return;
    }

    // Clear any previous error for this view
    delete newFileErrors[view];
    setFileErrors(newFileErrors);
    
    setCarImages(prev => ({ ...prev, [view]: file }));
  };

  const handleVideoUpload = (file) => {
    if (!file) return;

    const newFileErrors = { ...fileErrors };
    
    if (!validateVideoFile(file)) {
      newFileErrors.video = 'Please upload a valid video file (MP4, AVI, MOV, WMV, WebM) under 50MB';
      setFileErrors(newFileErrors);
      return;
    }

    // Clear any previous error
    delete newFileErrors.video;
    setFileErrors(newFileErrors);
    
    setVideoFile(file);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isFormValid = validateAllFields();
    const hasFileErrors = Object.keys(fileErrors).length > 0;

    if (!isFormValid) {
      setSnackbar({
        open: true,
        message: 'Please fix all validation errors before submitting',
        severity: 'error'
      });
      return;
    }

    if (hasFileErrors) {
      setSnackbar({
        open: true,
        message: 'Please fix file upload errors before submitting',
        severity: 'error'
      });
      return;
    }

    // Check if at least one image is uploaded (optional requirement)
    const hasImages = Object.values(carImages).some(image => image !== null);
    if (!hasImages) {
      setSnackbar({
        open: true,
        message: 'Please upload at least one car image',
        severity: 'warning'
      });
      return;
    }

    // Check if at least one job point is added
    const validJobPoints = jobPoints.filter(point => point.trim());
    // if (validJobPoints.length === 0) {
    //   setSnackbar({
    //     open: true,
    //     message: 'Please add at least one job detail point',
    //     severity: 'warning'
    //   });
    //   return;
    // }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      
      // Append job details as concatenated string
      formDataToSend.append('jobDetails', getJobDetailsForAPI());
      formDataToSend.append('garageId', garageId);
      formDataToSend.append('fuelLevel', fuelLevel);
      formDataToSend.append('customerNumber', 1);

      // Append files
      Object.entries(carImages).forEach(([view, file]) => {
        if (file) formDataToSend.append('images', file, `${view}_${file.name}`);
      });
      
      if (videoFile) {
        formDataToSend.append('video', videoFile, `video_${videoFile.name}`);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      };

      if (!garageId) {
        navigate("/login");
        return;
      }
       
      const apiBaseUrl = 'https://garage-management-zi5z.onrender.com';
      const response = await axios.post(
        `${apiBaseUrl}/api/garage/jobCards/add`,
        formDataToSend,
        config
      );

      setSnackbar({
        open: true,
        message: 'Job card created successfully!',
        severity: 'success'
      });

      // Navigate to Assign-Engineer with the job card ID
      setTimeout(() => navigate(`/Assign-Engineer/${response.data.jobCard._id}`, { 
        state: { jobCardId: response.data.jobCard._id } 
      }), 1500);
      
    } catch (error) {
      console.error('API Error:', error);
      
      let errorMessage = 'Failed to create job card';
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        
        // Handle validation errors from server
        if (error.response.status === 400 && error.response.data.errors) {
          const serverErrors = {};
          error.response.data.errors.forEach(err => {
            serverErrors[err.field] = err.message;
          });
          setErrors(prev => ({ ...prev, ...serverErrors }));
        }
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - please try again';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('Development mode: Proceeding with mock data');
        setTimeout(() => navigate('/Assign-Engineer', { state: { jobCardId: 'mock-id' } }), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if field has error
  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: { xs: 0, sm: 35 },
      overflow: 'auto'
    }}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <DirectionsCar fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h5" color="primary">
                  Create Job Card
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {loading && <LinearProgress sx={{ mb: 2 }} />}
              
              {/* Customer & Car Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Customer & Car Details
                </Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    {[
                      { name: 'customerName', label: 'Customer Name', icon: <Person />, required: true },
                      { name: 'contactNumber', label: 'Contact Number', icon: <Phone />, required: true },
                      { name: 'email', label: 'Email', icon: <Email />, type: 'email' },
                      { name: 'carNumber', label: 'Car Number', icon: <DriveEta />, required: true },
                      { name: 'model', label: 'Model', icon: <DirectionsCar />, required: true },
                      { name: 'company', label: 'Company', icon: <LocalOffer /> },
                      { name: 'kilometer', label: 'Kilometer', icon: <Speed />, type: 'number' },
                    ].map((field) => (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField
                          fullWidth
                          name={field.name}
                          label={field.label}
                          value={formData[field.name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type={field.type || 'text'}
                          required={field.required || false}
                          error={hasError(field.name)}
                          helperText={hasError(field.name) ? errors[field.name] : ''}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {field.icon}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    ))}
                    
                    <Grid item xs={12} md={4}>
                      <FormControl component="fieldset">
                        <Typography variant="subtitle2" gutterBottom>
                          Fuel Type
                        </Typography>
                        <RadioGroup
                          row
                          name="fuelType"
                          value={formData.fuelType}
                          onChange={handleChange}
                        >
                          {['petrol', 'diesel', 'cng', 'electric'].map((type) => (
                            <FormControlLabel 
                              key={type}
                              value={type} 
                              control={<Radio />} 
                              label={type.charAt(0).toUpperCase() + type.slice(1)} 
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <Grid item xs={12} md={4}>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Fuel Level
                        </Typography>
                        <Rating
                          name="fuelLevel"
                          value={fuelLevel}
                          max={4}
                          onChange={(_, newValue) => setFuelLevel(newValue)}
                          icon={<LocalGasStation color="primary" />}
                          emptyIcon={<LocalGasStation />}
                        />
                      </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Insurance Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Insurance Details
                </Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    {[
                      { name: 'insuranceProvider', label: 'Insurance Provider', icon: <Policy /> },
                      { name: 'expiryDate', label: 'Expiry Date', icon: <EventNote />, type: 'date', InputLabelProps: { shrink: true } },
                      { name: 'policyNumber', label: 'Policy Number', icon: <Numbers /> },
                      { name: 'carNumber', label: 'Registration Number', icon: <Numbers /> },
                      { name: 'type', label: 'Type', icon: <LocalOffer /> },
                      { name: 'excessAmount', label: 'Excess Amount', icon: <AttachMoney />, type: 'number' },
                    ].map((field) => (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField
                          fullWidth
                          name={field.name}
                          label={field.label}
                          value={formData[field.name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type={field.type || 'text'}
                          error={hasError(field.name)}
                          helperText={hasError(field.name) ? errors[field.name] : ''}
                          InputLabelProps={field.InputLabelProps}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {field.icon}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>

              {/* Job Details - Point-wise */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Job Details (Point-wise)
                </Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          placeholder="Enter job detail point..."
                          value={currentJobPoint}
                          onChange={(e) => setCurrentJobPoint(e.target.value)}
                          onKeyPress={handleJobPointKeyPress}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Description />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={addJobPoint}
                          disabled={!currentJobPoint.trim()}
                          startIcon={<AddIcon />}
                          sx={{ minWidth: 120 }}
                        >
                          Add Point
                        </Button>
                      </Box>
                      
                      {/* Display added job points */}
                      {jobPoints.filter(point => point.trim()).length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Job Details Points:
                          </Typography>
                          <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            {jobPoints.map((point, index) => (
                              point.trim() && (
                                <ListItem key={index} divider>
                                  <ListItemText 
                                    primary={`${index + 1}. ${point}`}
                                    sx={{ wordBreak: 'break-word' }}
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton 
                                      edge="end" 
                                      onClick={() => removeJobPoint(index)}
                                      color="error"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              )
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      {/* Preview of what will be sent to API */}
                      {jobPoints.filter(point => point.trim()).length > 0 && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Preview (This will be sent to API):
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                            {getJobDetailsForAPI()}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Media Upload */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Car Images & Videos
                </Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Upload Car Images (4 Sides) *
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { view: 'frontView', label: 'Front View' },
                      { view: 'rearView', label: 'Rear View' },
                      { view: 'leftSide', label: 'Left Side' },
                      { view: 'rightSide', label: 'Right Side' },
                    ].map((side) => (
                      <Grid item xs={12} sm={6} md={3} key={side.view}>
                        <UploadButton
                          component="label"
                          startIcon={<PhotoCamera />}
                          fullWidth
                          sx={{ 
                            height: '100px', 
                            flexDirection: 'column',
                            borderColor: fileErrors[side.view] ? theme.palette.error.main : undefined
                          }}
                        >
                          {side.label}
                          <VisuallyHiddenInput 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(side.view, e.target.files[0])}
                          />
                          {carImages[side.view] && (
                            <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                              {carImages[side.view].name}
                            </Typography>
                          )}
                        </UploadButton>
                        {fileErrors[side.view] && (
                          <FormHelperText error sx={{ ml: 2 }}>
                            {fileErrors[side.view]}
                          </FormHelperText>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
                    Upload Video (Optional)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <UploadButton
                        component="label"
                        startIcon={<Videocam />}
                        fullWidth
                        sx={{ 
                          height: '100px', 
                          flexDirection: 'column',
                          borderColor: fileErrors.video ? theme.palette.error.main : undefined
                        }}
                      >
                        Drop video here or click to browse
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Max file size: 50MB
                        </Typography>
                        <VisuallyHiddenInput 
                          type="file" 
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(e.target.files[0])}
                        />
                        {videoFile && (
                          <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                            {videoFile.name}
                          </Typography>
                        )}
                      </UploadButton>
                      {fileErrors.video && (
                        <FormHelperText error sx={{ ml: 2 }}>
                          {fileErrors.video}
                        </FormHelperText>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ 
                    px: 6, 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Job Card'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
  );
};

export default JobCards;