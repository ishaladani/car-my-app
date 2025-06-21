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
  ListItemSecondaryAction,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  Chip
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
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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

// Status options for dropdown
const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'in_progress', label: 'In Progress', color: 'info' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'on_hold', label: 'On Hold', color: 'default' }
];

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateChassisNumber = (chassisNumber) => {
  const upperChassis = chassisNumber.toUpperCase();
  const chassisRegex = /^[A-Z0-9]{17}$/;
  return chassisRegex.test(upperChassis);
};

const validateCarNumber = (carNumber) => {
  const carNumberRegex = /^[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}$/i;
  return carNumberRegex.test(carNumber);
};


const validatePolicyNumber = (policyNumber) => {
  return policyNumber.length >= 5 && policyNumber.length <= 20;
};

const validateRegistrationNumber = (regNumber) => {
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
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const [fuelLevel, setFuelLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const garageId = localStorage.getItem('garageId');

  // Form state with status field added
  const [formData, setFormData] = useState({
    customerNumber: '',
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
    chesiNumber: '',
    tyreCondition: '',
    status: 'pending'
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

  // Existing Images URLs (for edit mode)
  const [existingImages, setExistingImages] = useState({
    frontView: null,
    rearView: null,
    leftSide: null,
    rightSide: null
  });
  const [existingVideo, setExistingVideo] = useState(null);

  useEffect(() => {
    if (!garageId) {
      navigate("/login");
    }
  }, []);

  // Fetch job card data when id is present
  useEffect(() => {
    const fetchJobCardData = async () => {
      if (!id) return;
      setFetchingData(true);
      setIsEditMode(true);
      try {
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`, 
          {
            headers: {
              'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
            }
          }
        );
        const jobCardData = response.data;

        console.log('Fetched Job Card Data:', jobCardData);

        setFormData({
          customerNumber: jobCardData.customerNumber || '',
          customerName: jobCardData.customerName || '',
          contactNumber: jobCardData.contactNumber || '',
          email: jobCardData.email || '',
          carNumber: jobCardData.carNumber || '',
          model: jobCardData.model || '',
          company: jobCardData.company || '',
          kilometer: jobCardData.kilometer?.toString() || '',
          fuelType: jobCardData.fuelType || 'petrol',
          insuranceProvider: jobCardData.insuranceProvider || '',
          expiryDate: jobCardData.expiryDate ? new Date(jobCardData.expiryDate).toISOString().split('T')[0] : '',
          policyNumber: jobCardData.policyNumber || '',
          registrationNumber: jobCardData.carNumber || '',
          type: jobCardData.type || '',
          excessAmount: jobCardData.excessAmount?.toString() || '',
          chesiNumber: jobCardData.chesiNumber || '',
          tyreCondition: jobCardData.tyreCondition || '',
          status: jobCardData.status || 'pending'
        });

        if (jobCardData.fuelLevel !== undefined) {
          setFuelLevel(jobCardData.fuelLevel);
        }

        if (jobCardData.jobDetails) {
          const lines = jobCardData.jobDetails.split('\n');
          setJobPoints(lines.filter(line => line.trim()));
        }

        if (jobCardData.images && Array.isArray(jobCardData.images)) {
          const imagesByView = {
            frontView: jobCardData.images[0],
            rearView: jobCardData.images[1],
            leftSide: jobCardData.images[2],
            rightSide: jobCardData.images[3],
          };
          setExistingImages(imagesByView);
        }

        if (jobCardData.video) {
          setExistingVideo(jobCardData.video);
        }

        setSnackbar({
          open: true,
          message: 'Job card data loaded successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error fetching job card data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load job card data: ' + (error.response?.data?.message || error.message),
          severity: 'error'
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchJobCardData();
  }, [id]);

  // Fields that should be converted to uppercase
  const uppercaseFields = [
    'carNumber',
    'chesiNumber',
    'policyNumber',
    'registrationNumber',
    'type'
  ];

  // Real-time validation function
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'customerName':
        if (!value.trim()) error = 'Customer name is required';
        else if (value.trim().length < 2) error = 'At least 2 characters';
        else if (value.trim().length > 50) error = 'Max 50 characters allowed';
        break;
      case 'contactNumber':
        if (!value.trim()) error = 'Contact number is required';
        else if (!validatePhone(value)) error = 'Enter valid phone number';
        break;
      case 'email':
        if (value.trim() && !validateEmail(value)) error = 'Enter valid email';
        break;
      case 'carNumber':
        if (!value.trim()) error = 'Car number is required';
        else if (!validateCarNumber(value)) error = 'Enter valid car number';
        break;
      case 'model':
        if (!value.trim()) error = 'Car model is required';
        else if (value.trim().length < 2) error = 'Model must be at least 2 characters';
        break;
      case 'company':
        if (value.trim() && value.trim().length < 2) error = 'Company must be at least 2 characters';
        break;
      case 'kilometer':
        if (value && !validateKilometer(value)) error = 'Valid kilometer reading required';
        break;
      case 'insuranceProvider':
        if (value.trim() && value.trim().length < 2) error = 'Insurance provider must be at least 2 characters';
        break;
      case 'expiryDate':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) error = 'Expiry date cannot be in the past';
        }
        break;
      case 'policyNumber':
        if (value.trim() && !validatePolicyNumber(value)) error = 'Policy number must be 5–20 characters';
        break;
      case 'registrationNumber':
        if (value.trim() && !validateRegistrationNumber(value)) error = 'Must be 5–20 characters';
        break;
      case 'chesiNumber':
        if (value.trim() && !validateChassisNumber(value)) error = 'Chassis number must be 10–20 characters';
        break;
      case 'excessAmount':
        if (value && !validateExcessAmount(value)) error = 'Enter a valid amount (0–1,000,000)';
        break;
      case 'status':
        if (!value) error = 'Status is required';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (uppercaseFields.includes(name)) {
      updatedValue = value.toUpperCase();
    }

    if (name === 'email') {
      updatedValue = value.trim().toLowerCase();
    }

    if (name === 'chesiNumber') {
      updatedValue = value.replace(/\s/g, '').toUpperCase();
    }

    if (name === 'policyNumber') {
      updatedValue = value.replace(/\s/g, '').toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: updatedValue }));
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, updatedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const updateJobCardStatus = async (newStatus) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`, 
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
          }
        }
      );
      setFormData(prev => ({ ...prev, status: newStatus }));
      setSnackbar({
        open: true,
        message: `Job card status updated to ${newStatus}!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update status: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
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

  const getJobDetailsForAPI = () => {
    const validPoints = jobPoints.filter(point => point.trim());
    return validPoints.map((point, index) => `${index + 1}. ${point}`).join('\n');
  };

  const validateAllFields = () => {
    const newErrors = {};
    const newTouched = {};
    Object.keys(formData).forEach(key => {
      newTouched[key] = true;
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
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
    delete newFileErrors[view];
    setFileErrors(newFileErrors);
    setCarImages(prev => ({ ...prev, [view]: file }));
    // Clear existing image when new one is uploaded
    setExistingImages(prev => ({ ...prev, [view]: null }));
  };

  const handleVideoUpload = (file) => {
    if (!file) return;
    const newFileErrors = { ...fileErrors };
    if (!validateVideoFile(file)) {
      newFileErrors.video = 'Please upload a valid video file (MP4, AVI, MOV, WMV, WebM) under 50MB';
      setFileErrors(newFileErrors);
      return;
    }
    delete newFileErrors.video;
    setFileErrors(newFileErrors);
    setVideoFile(file);
    // Clear existing video when new one is uploaded
    setExistingVideo(null);
  };

  const removeUploadedImage = (view) => {
    setCarImages(prev => ({ ...prev, [view]: null }));
    setSnackbar({
      open: true,
      message: 'Image removed. Upload a new one or keep existing images.',
      severity: 'info'
    });
  };

  const removeUploadedVideo = () => {
    setVideoFile(null);
    setSnackbar({
      open: true,
      message: 'Video removed. Upload a new one if needed.',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const isFormValid = validateAllFields();
    const hasFileErrors = Object.keys(fileErrors).length > 0;

    if (!isFormValid || hasFileErrors) {
      setSnackbar({
        open: true,
        message: 'Please fix all validation errors before submitting',
        severity: 'error'
      });
      return;
    }

    // Check for images - required for both create and update
    const hasNewImages = Object.values(carImages).some(image => image !== null);
    const hasExistingImages = Object.values(existingImages).some(imageUrl => imageUrl !== null);
    const totalImagesCount = Object.values(carImages).filter(img => img !== null).length + 
                           Object.values(existingImages).filter(img => img !== null).length;

    if (!hasNewImages && !hasExistingImages) {
      setSnackbar({
        open: true,
        message: 'Please upload at least one car image',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = 'https://garage-management-zi5z.onrender.com';

      if (!garageId) {
        navigate("/login");
        return;
      }

      let response;

      if (isEditMode && id) {
        // For updates, handle images/video separately if there are new files
        const hasNewFiles = hasNewImages || videoFile;

        if (hasNewFiles) {
          // Use FormData for file uploads in edit mode
          const formDataToSend = new FormData();

          // Add all form fields
          Object.entries(formData).forEach(([key, value]) => {
            if (value) formDataToSend.append(key, value);
          });

          // Add additional fields
          formDataToSend.append('jobDetails', getJobDetailsForAPI());
          formDataToSend.append('garageId', garageId);
          formDataToSend.append('fuelLevel', fuelLevel);

          // Add information about which existing images to keep
          const imagesToKeep = Object.entries(existingImages)
            .filter(([key, value]) => value !== null)
            .map(([key]) => key);
          formDataToSend.append('keepExistingImages', JSON.stringify(imagesToKeep));

          // Add information about video removal
          if (!existingVideo && !videoFile) {
            formDataToSend.append('removeVideo', 'true');
          }

          // Add image files
          Object.entries(carImages).forEach(([view, file]) => {
            if (file) formDataToSend.append('images', file, `${view}_${file.name}`);
          });

          // Add video file
          if (videoFile) {
            formDataToSend.append('video', videoFile, `video_${videoFile.name}`);
          }

          const configWithFiles = {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
            },
            timeout: 60000, // Increased timeout for file uploads
          };

          response = await axios.put(
            `${apiBaseUrl}/api/garage/jobCards/${id}`,
            formDataToSend,
            configWithFiles
          );
        } else {
          // Use JSON for updates without new files
          const jobCardPayload = {
            contactNumber: formData.contactNumber,
            customerName: formData.customerName,
            email: formData.email,
            carNumber: formData.carNumber,
            model: formData.model,
            company: formData.company,
            kilometer: formData.kilometer,
            fuelType: formData.fuelType,
            insuranceProvider: formData.insuranceProvider,
            expiryDate: formData.expiryDate,
            policyNumber: formData.policyNumber,
            registrationNumber: formData.carNumber,
            type: formData.type,
            excessAmount: formData.excessAmount,
            chesiNumber: formData.chesiNumber,
            tyreCondition: formData.tyreCondition,
            status: formData.status,
            jobDetails: getJobDetailsForAPI(),
            fuelLevel: fuelLevel,
            // Add information about which existing images/video to keep
            keepExistingImages: Object.entries(existingImages)
              .filter(([key, value]) => value !== null)
              .map(([key]) => key),
            keepExistingVideo: existingVideo !== null,
          };

          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
            },
          };

          response = await axios.put(
            `${apiBaseUrl}/api/garage/jobCards/${id}`,
            jobCardPayload,
            config
          );
        }
      } else {
        // Create new job card - always use FormData
        const formDataToSend = new FormData();

        // Add all form fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value) formDataToSend.append(key, value);
        });

        // Add additional fields
        formDataToSend.append('jobDetails', getJobDetailsForAPI());
        formDataToSend.append('garageId', garageId);
        formDataToSend.append('fuelLevel', fuelLevel);
        formDataToSend.append('customerNumber', 1);

        // Add image files
        Object.entries(carImages).forEach(([view, file]) => {
          if (file) formDataToSend.append('images', file, `${view}_${file.name}`);
        });

        // Add video file
        if (videoFile) {
          formDataToSend.append('video', videoFile, `video_${videoFile.name}`);
        }

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
          },
          timeout: 60000,
        };

        response = await axios.post(
          `${apiBaseUrl}/api/garage/jobCards/add`,
          formDataToSend,
          config
        );
      }

      setSnackbar({
        open: true,
        message: `Job card ${isEditMode ? 'updated' : 'created'} successfully!`,
        severity: 'success'
      });

      setTimeout(() => navigate(`/Assign-Engineer/${response.data.jobCard?._id || response.data._id || id}`, {
        state: { jobCardId: response.data.jobCard?._id || response.data._id || id }
      }), 1500);

    } catch (error) {
      console.error('API Error:', error);
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} job card`;
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
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

    } finally {
      setLoading(false);
    }
  };

  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const getFieldStyling = (fieldName) => {
    if (uppercaseFields.includes(fieldName)) {
      return { textTransform: 'uppercase' };
    }
    return {};
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  if (fetchingData) {
    return (
      <Box sx={{ flexGrow: 1, mb: 4, ml: { xs: 0, sm: 35 }, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Job Card Data...</Typography>
        </Box>
      </Box>
    );
  }

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
                {isEditMode ? <EditIcon fontSize="large" color="primary" sx={{ mr: 2 }} /> : <DirectionsCar fontSize="large" color="primary" sx={{ mr: 2 }} />}
                <Typography variant="h5" color="primary">
                  {isEditMode ? `Edit Job Card ${id}` : 'Create Job Card'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                {isEditMode && (
                  <Chip 
                    label={`Status: ${formData.status.replace('_', ' ').toUpperCase()}`}
                    color={getStatusColor(formData.status)}
                    variant="outlined"
                  />
                )}
                {isEditMode && (
                  <Typography variant="body2" color="text.secondary">
                    Job Card ID: {id}
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 3 }} />

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {loading && <LinearProgress sx={{ mb: 2 }} />}

              {/* Status Section - Only shown in edit mode */}
              {isEditMode && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Job Status</Typography>
                  <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel id="status-label">Status</InputLabel>
                          <Select
                            labelId="status-label"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            label="Status"
                            startAdornment={
                              <InputAdornment position="start">
                                <AssignmentIcon />
                              </InputAdornment>
                            }
                          >
                            {statusOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                <Chip 
                                  label={option.label} 
                                  color={option.color} 
                                  size="small" 
                                  sx={{ mr: 1 }}
                                />
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            Update the current status of this job card
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Button
                          variant="outlined"
                          onClick={() => updateJobCardStatus(formData.status)}
                          disabled={loading}
                          startIcon={<SaveIcon />}
                          sx={{ mt: 1 }}
                        >
                          Update Status Only
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* Customer & Car Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Customer & Car Details</Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    {[
                      { name: 'customerName', label: 'Customer Name', icon: <Person />, required: true },
                      { name: 'contactNumber', label: 'Contact Number', icon: <Phone />, required: true },
                      { name: 'email', label: 'Email', icon: <Email /> },
                      { name: 'carNumber', label: 'Car Number', icon: <DriveEta />, required: true },
                      { name: 'model', label: 'Model', icon: <DirectionsCar />, required: true },
                      { name: 'company', label: 'Company', icon: <LocalOffer /> },
                      { name: 'kilometer', label: 'Kilometer', icon: <Speed />, type: 'number' },
                      { name: 'chesiNumber', label: 'Chassis Number', icon: <Numbers />, helperText: 'Vehicle Identification Number (VIN)' },
                      { name: 'tyreCondition', label: 'Tyre Condition', icon: <LocalGasStation /> },
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
                          helperText={hasError(field.name) ? errors[field.name] : (field.helperText || '')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {field.icon}
                              </InputAdornment>
                            ),
                            sx: getFieldStyling(field.name)
                          }}
                          inputProps={{ 
                            style: getFieldStyling(field.name),
                            ...(field.name === 'chesiNumber' && { placeholder: 'Enter chassis/VIN number' })
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>

              {/* Insurance Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Insurance Details</Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    {[
                      { name: 'insuranceProvider', label: 'Insurance Provider', icon: <Policy /> },
                      { name: 'expiryDate', label: 'Expiry Date', icon: <EventNote />, type: 'date', InputLabelProps: { shrink: true } },
                      { name: 'policyNumber', label: 'Policy Number', icon: <Numbers />, helperText: 'Insurance policy reference number' },
                      { name: 'carNumber', label: 'Car Number ', icon: <Numbers />, helperText: 'Vehicle registration certificate number' },
                      { name: 'type', label: 'Insurance Type', icon: <LocalOffer />, helperText: 'e.g., Comprehensive, Third Party' },
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
                          helperText={hasError(field.name) ? errors[field.name] : (field.helperText || '')}
                          InputLabelProps={field.InputLabelProps}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {field.icon}
                              </InputAdornment>
                            ),
                            sx: getFieldStyling(field.name)
                          }}
                          inputProps={{ 
                            style: getFieldStyling(field.name),
                            ...(field.name === 'policyNumber' && { placeholder: 'Enter policy number' }),
                            ...(field.name === 'registrationNumber' && { placeholder: 'Enter registration number' }),
                            ...(field.name === 'type' && { placeholder: 'Enter insurance type' })
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>

              {/* Fuel Level */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Fuel Level</Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography component="legend" sx={{ mb: 1 }}>Current Fuel Level</Typography>
                      <Rating
                        name="fuel-level"
                        value={fuelLevel}
                        onChange={(event, newValue) => {
                          setFuelLevel(newValue);
                        }}
                        max={5}
                        size="large"
                        icon={<LocalGasStation fontSize="inherit" />}
                        emptyIcon={<LocalGasStation fontSize="inherit" />}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {fuelLevel}/5 - {fuelLevel === 1 ? 'Very Low' : fuelLevel === 2 ? 'Low' : fuelLevel === 3 ? 'Medium' : fuelLevel === 4 ? 'High' : 'Full'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Job Details - Point-wise */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Job Details (Point-wise)</Typography>
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

                      {jobPoints.filter(point => point.trim()).length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Job Details Points:</Typography>
                          <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            {jobPoints.map((point, index) => (
                              point.trim() && (
                                <ListItem key={index} divider>
                                  <ListItemText primary={`${index + 1}. ${point}`} sx={{ wordBreak: 'break-word' }} />
                                  <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => removeJobPoint(index)} color="error">
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              )
                            ))}
                          </List>
                        </Box>
                      )}

                      {jobPoints.filter(point => point.trim()).length > 0 && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>Preview (sent to API):</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                            {getJobDetailsForAPI()}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Car Images Upload/Display */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Car Images</Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    {[
                      { key: 'frontView', label: 'Front View' },
                      { key: 'rearView', label: 'Rear View' },
                      { key: 'leftSide', label: 'Left Side' },
                      { key: 'rightSide', label: 'Right Side' },
                    ].map((imageType) => (
                      <Grid item xs={12} sm={6} md={3} key={imageType.key}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle1" sx={{ mb: 2 }}>{imageType.label}</Typography>
                          
                          {/* Display existing image if available */}
                          {existingImages[imageType.key] && !carImages[imageType.key] && (
                            <Box sx={{ mb: 2, position: 'relative' }}>
                              <img 
                                src={existingImages[imageType.key]} 
                                alt={imageType.label}
                                style={{ 
                                  width: '100%', 
                                  height: '150px', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px', 
                                  border: '1px solid #ddd' 
                                }} 
                              />
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setExistingImages(prev => ({ ...prev, [imageType.key]: null }));
                                  setSnackbar({
                                    open: true,
                                    message: `${imageType.label} will be removed when you save.`,
                                    severity: 'warning'
                                  });
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: 5,
                                  right: 5,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                                }}
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Current Image
                              </Typography>
                            </Box>
                          )}

                          {/* Display new uploaded image preview */}
                          {carImages[imageType.key] && (
                            <Box sx={{ mb: 2, position: 'relative' }}>
                              <img 
                                src={URL.createObjectURL(carImages[imageType.key])} 
                                alt={imageType.label}
                                style={{ 
                                  width: '100%', 
                                  height: '150px', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px', 
                                  border: '2px solid #4caf50' 
                                }} 
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeUploadedImage(imageType.key)}
                                sx={{
                                  position: 'absolute',
                                  top: 5,
                                  right: 5,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                                }}
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                                New Image Selected
                              </Typography>
                            </Box>
                          )}

                          {/* Upload button */}
                          <UploadButton
                            component="label"
                            variant="outlined"
                            startIcon={<PhotoCamera />}
                            fullWidth
                          >
                            {carImages[imageType.key] ? 'Change Image' : 
                             existingImages[imageType.key] ? 'Replace Image' : 'Upload Image'}
                            <VisuallyHiddenInput 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleImageUpload(imageType.key, e.target.files[0])}
                            />
                          </UploadButton>

                          {/* Show file error if any */}
                          {fileErrors[imageType.key] && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                              {fileErrors[imageType.key]}
                            </Typography>
                          )}

                          {/* Show file name if uploaded */}
                          {carImages[imageType.key] && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              {carImages[imageType.key].name}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Video Upload Section */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Video (Optional)</Typography>
                    
                    {/* Display existing video if available */}
                    {existingVideo && !videoFile && (
                      <Box sx={{ mb: 2, position: 'relative' }}>
                        <video 
                          controls 
                          style={{ 
                            width: '100%', 
                            height: 'auto', 
                            borderRadius: '8px' 
                          }}
                        >
                          <source src={existingVideo} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setExistingVideo(null);
                            setSnackbar({
                              open: true,
                              message: 'Video will be removed when you save.',
                              severity: 'warning'
                            });
                          }}
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Current Video
                        </Typography>
                      </Box>
                    )}

                    {/* Display new uploaded video preview */}
                    {videoFile && (
                      <Box sx={{ mb: 2, position: 'relative' }}>
                        <video 
                          controls 
                          style={{ 
                            width: '100%', 
                            height: 'auto', 
                            borderRadius: '8px',
                            border: '2px solid #4caf50'
                          }}
                        >
                          <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <IconButton
                          size="small"
                          onClick={removeUploadedVideo}
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                          New Video Selected: {videoFile.name}
                        </Typography>
                      </Box>
                    )}

                    {/* Video upload button */}
                    <UploadButton
                      component="label"
                      variant="outlined"
                      startIcon={<Videocam />}
                    >
                      {videoFile ? 'Change Video' : 
                       existingVideo ? 'Replace Video' : 'Upload Video'}
                      <VisuallyHiddenInput 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => handleVideoUpload(e.target.files[0])}
                      />
                    </UploadButton>

                    {/* Show video file error if any */}
                    {fileErrors.video && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                        {fileErrors.video}
                      </Typography>
                    )}
                  </Box>
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
                  sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 600, fontSize: '1rem', textTransform: 'none' }}
                >
                  {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Job Card' : 'Save Job Card')}
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