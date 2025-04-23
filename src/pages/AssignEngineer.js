import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  IconButton,
  Autocomplete,
  Chip,
  Grid,
  CssBaseline,
  Paper,
  useTheme,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Sample data for tasks and parts (can be moved to API calls if needed)
const tasks = [
  { id: 1, name: 'Engine Repair', duration: '4-6 hours' },
  { id: 2, name: 'Brake Replacement', duration: '2-3 hours' },
  { id: 3, name: 'Oil Change', duration: '1 hour' },
  { id: 4, name: 'Tire Rotation', duration: '1 hour' },
  { id: 5, name: 'A/C Repair', duration: '3-4 hours' },
  { id: 6, name: 'Battery Replacement', duration: '1 hour' },
  { id: 7, name: 'Transmission Service', duration: '4-5 hours' },
];

const inventoryParts = [
  { id: 1, name: 'Brake Pads', sku: 'BP-1001', quantity: 24 },
  { id: 2, name: 'Oil Filter', sku: 'OF-2002', quantity: 36 },
  { id: 3, name: 'Air Filter', sku: 'AF-3003', quantity: 18 },
  { id: 4, name: 'Spark Plugs', sku: 'SP-4004', quantity: 60 },
  { id: 5, name: 'Engine Oil', sku: 'EO-5005', quantity: 48 },
  { id: 6, name: 'Coolant', sku: 'CO-6006', quantity: 30 },
  { id: 7, name: 'Transmission Fluid', sku: 'TF-7007', quantity: 20 },
];

const AssignEngineer = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const navigate = useNavigate();
  
  // State management
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch engineers from API
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(
          'https://garage-management-system-cr4w.onrender.com/api/engineers/67e0f80b5c8f6293f36e3506',
          {
            headers: {
              'Content-Type': 'application/json',
              // Uncomment if authentication is required
              // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        // Handle different response structures
        const data = response.data;
        if (!data) {
          throw new Error('No data received from server');
        }
        
        // Check if data is an array or needs to be extracted
        const engineersData = Array.isArray(data) ? data : 
                            data.engineers ? data.engineers : 
                            data.data ? data.data : [];
        
        setEngineers(engineersData);
      } catch (error) {
        console.error('Error fetching engineers:', error);
        setError(error.response?.data?.message || 
               error.message || 
               'Failed to load engineers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngineers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedEngineer) {
      setError('Please select an engineer');
      return;
    }
    
    if (!selectedTask) {
      setError('Please select a task');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare data to submit
      const assignmentData = {
        engineer: {
          id: selectedEngineer.id,
          name: selectedEngineer.name,
          specialty: selectedEngineer.specialty || 'General'
        },
        task: {
          id: selectedTask.id,
          name: selectedTask.name,
          duration: selectedTask.duration
        },
        parts: selectedParts.map(part => ({
          id: part.id,
          name: part.name,
          sku: part.sku,
          quantity: 1
        })),
        jobId: '67e0f80b5c8f6293f36e3506'
      };
      
      // Make API call
      const response = await axios.post(
        'https://garage-management-system-cr4w.onrender.com/api/engineers/add/67e0f80b5c8f6293f36e3506',
        assignmentData,
        {
          headers: {
            'Content-Type': 'application/json',
            // Uncomment if authentication is required
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Validate response
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/Work-In-Progress'), 1500);
      
    } catch (error) {
      console.error('Assignment error:', error);
      setError(error.response?.data?.message || 
             error.message || 
             'Failed to assign engineer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto',
      pt: 3
    }}>
      <CssBaseline />
      <Container maxWidth="md">
        {/* Success/Error Alerts */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar open={success} autoHideDuration={3000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
            Engineer assigned successfully!
          </Alert>
        </Snackbar>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/jobs')} 
            sx={{ 
              mr: 2, 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Assign Engineer
          </Typography>
        </Box>
        
        <Card sx={{ 
          mb: 4, 
          overflow: 'visible', 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <Grid container spacing={3}>
                  {/* Engineer Selection */}
                  <Grid item xs={12}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      Select Engineer
                    </Typography>
                    {isLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Loading engineers...</Typography>
                      </Box>
                    ) : error ? (
                      <Alert severity="error">
                        {error}
                        <Button onClick={() => window.location.reload()} sx={{ ml: 2 }} size="small">
                          Retry
                        </Button>
                      </Alert>
                    ) : (
                      <Autocomplete
                        fullWidth
                        options={engineers}
                        getOptionLabel={(option) => option.name || 'Unknown'}
                        value={selectedEngineer}
                        onChange={(event, newValue) => {
                          setSelectedEngineer(newValue);
                        }}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body1" fontWeight={500}>
                                {option.name}
                              </Typography>
                              {option.specialty && (
                                <Typography variant="caption" color="text.secondary">
                                  {option.specialty}
                                </Typography>
                              )}
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            placeholder="Search for engineer"
                            variant="outlined"
                            required
                            error={!selectedEngineer && !!error}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    )}
                  </Grid>
                  
                  {/* Task Assignment */}
                  <Grid item xs={12}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      Assign Task
                    </Typography>
                    <Autocomplete
                      fullWidth
                      options={tasks}
                      getOptionLabel={(option) => option.name}
                      value={selectedTask}
                      onChange={(event, newValue) => {
                        setSelectedTask(newValue);
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" fontWeight={500}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Est. Duration: {option.duration}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          placeholder="Select or type a task"
                          variant="outlined"
                          required
                          error={!selectedTask && !!error}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <AssignmentIcon color="action" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  {/* Parts Selection */}
                  <Grid item xs={12}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      Select Parts From Inventory
                    </Typography>
                    <Autocomplete
                      multiple
                      fullWidth
                      options={inventoryParts}
                      getOptionLabel={(option) => option.name}
                      value={selectedParts}
                      onChange={(event, newValue) => {
                        setSelectedParts(newValue);
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={option.id}
                            label={`${option.name} (${option.sku})`}
                            {...getTagProps({ index })}
                            variant="outlined"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          />
                        ))
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body1" fontWeight={500}>
                                {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                SKU: {option.sku}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`Qty: ${option.quantity}`} 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          placeholder="Select parts needed for this task"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <InventoryIcon color="action" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  disabled={isSubmitting || isLoading || !!error}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                    }
                  }}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AssignEngineer;