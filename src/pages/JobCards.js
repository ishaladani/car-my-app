import React, { useState } from 'react';
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
  Alert
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
  AttachMoney
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
 const token = localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '';
  const garageId = localStorage.getItem('garageId');
  // Form state
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

  // File state
  const [carImages, setCarImages] = useState({
    frontView: null,
    rearView: null,
    leftSide: null,
    rightSide: null
  });
  const [videoFile, setVideoFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (view, file) => {
    setCarImages(prev => ({ ...prev, [view]: file }));
  };

  const handleVideoUpload = (file) => {
    setVideoFile(file);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const formDataToSend = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      formDataToSend.append('garageId', garageId);
  
      // Append files
      Object.entries(carImages).forEach(([view, file]) => {
        if (file) formDataToSend.append('images', file, `${view}_${file.name}`);
      });
      
      if (videoFile) {
        formDataToSend.append('video', videoFile, `video_${videoFile.name}`);
      }
  
      const config = {
        headers: {
          'Authorization': token,}
      };
  
      const apiBaseUrl = 'https://garage-management-zi5z.onrender.com';
      const response = await axios.post(
        `${apiBaseUrl}/api/jobCards/add`,
        formDataToSend,
        config
      );
  
      setSnackbar({
        open: true,
        message: 'Job card created successfully!',
        severity: 'success'
      });
  
      // Navigate to Assign-Engineer with the job card ID
      setTimeout(() => navigate(`/Assign-Engineer/${response.data.jobCard._id}`, { state: { jobCardId: response.data.jobCard._id } }), 1500);
      
    } catch (error) {
      console.error('API Error:', error);
      
      let errorMessage = 'Failed to create job card';
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
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
            <Box component="form" onSubmit={handleSubmit}>
              {loading && <LinearProgress sx={{ mb: 2 }} />}
              
              {/* Customer & Car Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Customer & Car Details
                </Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    {[
                      { name: 'customerNumber', label: 'Customer Number', icon: <Person /> },
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
                          type={field.type || 'text'}
                          required={field.required || false}
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
                      { name: 'registrationNumber', label: 'Registration Number', icon: <Numbers /> },
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
                          type={field.type || 'text'}
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

              {/* Job Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Job Details
                </Typography>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                              <Description />
                            </InputAdornment>
                          ),
                        }}
                      />
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
                    Upload Car Images (4 Sides)
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
                          sx={{ height: '100px', flexDirection: 'column' }}
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
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
                    Upload Video
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <UploadButton
                        component="label"
                        startIcon={<Videocam />}
                        fullWidth
                        sx={{ height: '100px', flexDirection: 'column' }}
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