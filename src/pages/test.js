import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  IconButton,
  Stack,
  Chip,
  CssBaseline,
  Container,
  LinearProgress,
  Rating,
  useTheme,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera,
  Videocam,
  CloudUpload,
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
  AttachMoney
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Custom styled component for file input
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

// Styled upload button
const UploadButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: '10px 15px',
  margin: '8px 0',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  border: `1px dashed ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  '&:hover': {
    boxShadow: 'none',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    borderColor: theme.palette.primary.main,
  },
}));

const JobCards = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const navigate = useNavigate();
  const [fuelLevel, setFuelLevel] = useState(2);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);
  
  // File state for image uploads
  const [carImages, setCarImages] = useState({
    frontView: null,
    rearView: null,
    leftSide: null,
    rightSide: null
  });
  
  // Video file state
  const [videoFile, setVideoFile] = useState(null);
  
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
    jobDetails: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleImageUpload = (view, file) => {
    setCarImages(prev => ({
      ...prev,
      [view]: file
    }));
  };
  
  const handleVideoUpload = (file) => {
    setVideoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('garageId', '67e0f80b5c8f6293f36e3506');
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('customerNumber', formData.customerNumber);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('company', formData.company);
      formDataToSend.append('carNumber', formData.carNumber);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('kilometer', formData.kilometer);
      formDataToSend.append('fuelType', formData.fuelType);
      formDataToSend.append('insuranceProvider', formData.insuranceProvider);
      formDataToSend.append('policyNumber', formData.policyNumber);
      
      // Format date if exists
      if (formData.expiryDate) {
        formDataToSend.append('expiryDate', new Date(formData.expiryDate).toISOString());
      }
      
      formDataToSend.append('registrationNumber', formData.registrationNumber);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('excessAmount', formData.excessAmount);
      formDataToSend.append('jobDetails', formData.jobDetails);
      
      // Append images if they exist
      Object.entries(carImages).forEach(([view, file]) => {
        if (file) {
          formDataToSend.append('images', file);
        }
      });
      
      // Append video if it exists
      if (videoFile) {
        formDataToSend.append('video', videoFile);
      }

      // Make API request
      const response = await axios.post(
        'https://garage-management-system-cr4w.onrender.com/api/jobCards/add',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // If you have an authorization token, add it here
            'Authorization': `Bearer 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTQ4NTI1MywiZXhwIjoxNzQ2MDkwMDUzfQ.YRQFzeGUwW0HGBEP1Jj-VHEcf9XM9M0YdVaVnJcwt18'`
          }
        }
      );

      setSnackbar({
        open: true,
        message: 'Job card created successfully!',
        severity: 'success'
      });

      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/Assign-Engineer');
      }, 1500);

    } catch (error) {
      console.error('Error creating job card:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create job card',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto'
    }}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Card sx={{ mb: 4, overflow: 'visible', borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <DirectionsCar fontSize="large" sx={{ color: theme.palette.primary.main, mr: 2 }} />
                <Typography variant="h5" color="primary">
                  Create Job Card
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}  
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 2,
                  fontWeight: 600,
                  px: 3
                }}
              >
                {loading ? 'Saving...' : 'Save Job Card'}
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {loading && <LinearProgress sx={{ mb: 2 }} />}
              
              {/* Car Details Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Customer & Car Details
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="customerNumber"
                        label="Customer Number"
                        value={formData.customerNumber}
                        onChange={handleChange}
                        placeholder="Auto-fill Register Number"
                        variant="outlined"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="customerName"
                        label="Customer Name"
                        value={formData.customerName}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="contactNumber"
                        label="Contact Number"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                        type="email"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="carNumber"
                        label="Car Number"
                        value={formData.carNumber}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DriveEta color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="model"
                        label="Model"
                        value={formData.model}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DirectionsCar color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="company"
                        label="Company"
                        value={formData.company}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocalOffer color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="kilometer"
                        label="Kilometer"
                        value={formData.kilometer}
                        onChange={handleChange}
                        variant="outlined"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Speed color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
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
                            <FormControlLabel value="petrol" control={<Radio />} label="Petrol" />
                            <FormControlLabel value="diesel" control={<Radio />} label="Diesel" />
                            <FormControlLabel value="cng" control={<Radio />} label="CNG" />
                            <FormControlLabel value="electric" control={<Radio />} label="Electric" />
                          </RadioGroup>
                        </FormControl>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Fuel Level
                        </Typography>
                        <Rating
                          name="fuelLevel"
                          value={fuelLevel}
                          max={4}
                          onChange={(event, newValue) => {
                            setFuelLevel(newValue);
                          }}
                          icon={<LocalGasStation color="primary" />}
                          emptyIcon={<LocalGasStation color="disabled" />}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Insurance Details Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Insurance Details
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="insuranceProvider"
                        label="Insurance Provider"
                        value={formData.insuranceProvider}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Policy color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="expiryDate"
                        label="Expiry Date"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EventNote color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="policyNumber"
                        label="Policy Number"
                        value={formData.policyNumber}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Numbers color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="registrationNumber"
                        label="Registration Number"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Numbers color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="type"
                        label="Type"
                        value={formData.type}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocalOffer color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="excessAmount"
                        label="Excess Amount"
                        value={formData.excessAmount}
                        onChange={handleChange}
                        variant="outlined"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Job Details Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Job Details
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="jobDetails"
                        label="Job Details"
                        multiline
                        rows={5}
                        value={formData.jobDetails}
                        onChange={handleChange}
                        placeholder="Enter detailed description of the job"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                              <Description color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Car Images & Videos Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Car Images & Videos
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Upload Car Images (4 Sides)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <UploadButton
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        fullWidth
                        sx={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      >
                        Front View
                        <VisuallyHiddenInput 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload('frontView', e.target.files[0])}
                        />
                        {carImages.frontView && (
                          <Typography variant="caption" color="primary.main" sx={{ mt: 1 }}>
                            {carImages.frontView.name}
                          </Typography>
                        )}
                      </UploadButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <UploadButton
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        fullWidth
                        sx={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      >
                        Rear View
                        <VisuallyHiddenInput 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload('rearView', e.target.files[0])}
                        />
                        {carImages.rearView && (
                          <Typography variant="caption" color="primary.main" sx={{ mt: 1 }}>
                            {carImages.rearView.name}
                          </Typography>
                        )}
                      </UploadButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <UploadButton
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        fullWidth
                        sx={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      >
                        Left Side
                        <VisuallyHiddenInput 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload('leftSide', e.target.files[0])}
                        />
                        {carImages.leftSide && (
                          <Typography variant="caption" color="primary.main" sx={{ mt: 1 }}>
                            {carImages.leftSide.name}
                          </Typography>
                        )}
                      </UploadButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <UploadButton
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        fullWidth
                        sx={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      >
                        Right Side
                        <VisuallyHiddenInput 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload('rightSide', e.target.files[0])}
                        />
                        {carImages.rightSide && (
                          <Typography variant="caption" color="primary.main" sx={{ mt: 1 }}>
                            {carImages.rightSide.name}
                          </Typography>
                        )}
                      </UploadButton>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
                    Upload Video
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <UploadButton
                        component="label"
                        variant="outlined"
                        startIcon={<Videocam />}
                        fullWidth
                        sx={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
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
                          <Typography variant="caption" color="primary.main" sx={{ mt: 1 }}>
                            {videoFile.name}
                          </Typography>
                        )}
                      </UploadButton>
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
                    boxShadow: 3,
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

      {/* Success/Error Snackbar */}
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