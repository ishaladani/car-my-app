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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CssBaseline,
  Paper,
  useTheme,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Fab,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Send as SendIcon,
  Add as AddIcon
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

const AssignEngineer = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const navigate = useNavigate();
  
  // State management
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // State for Add Part Dialog
  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({
    garageId: "67e0f80b5c8f6293f36e3506",
    carName: "",
    model: "",
    partNumber: "",
    partName: "",
    quantity: 1,
    pricePerUnit: 0,
    taxAmount: 0
  });
  const [addingPart, setAddingPart] = useState(false);
  const [partAddSuccess, setPartAddSuccess] = useState(false);
  const [partAddError, setPartAddError] = useState(null);

  // Fetch inventory parts from API on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get(
          'https://garage-management-system-cr4w.onrender.com/api/inventory/67e0f80b5c8f6293f36e3506',
          {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTgxNjY5NCwiZXhwIjoxNzQ2NDIxNDk0fQ.eFBVfYMr5ys2xe485aP1i_UlV1Z_P_8H4uiKk-VdAWM'
            }
          }
        );
        // Accept both array or {data: array} response
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setInventoryParts(data);
      } catch (err) {
        setError('Failed to load inventory parts');
      }
    };
    fetchInventory();
  }, [partAddSuccess]);

  // Fetch engineers from API
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(
          'https://garage-management-system-cr4w.onrender.com/api/engineers/67f3a7f8ccb6f320da3a5117',
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTU1Njk0OSwiZXhwIjoxNzQ2MTYxNzQ5fQ.djYdc2q1eBqydjWbk6V9ZzIRDeBFAHvl9BgeVkhAgt8'
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

    setIsSubmitting(true);
    setError(null);

    try {
      // API call as per user instruction
      const response = await fetch('https://garage-management-system-cr4w.onrender.com/api/jobCards/assign-engineer/680f20ab54c9b20411680d56', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTgxNjY5NCwiZXhwIjoxNzQ2NDIxNDk0fQ.eFBVfYMr5ys2xe485aP1i_UlV1Z_P_8H4uiKk-VdAWM',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ engineerId: selectedEngineer._id })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to assign engineer');
      }

      setSuccess(true);
      setTimeout(() => navigate('/Work-In-Progress'), 1500);
    } catch (error) {
      console.error('Assignment error:', error);
      setError(error.message || 'Failed to assign engineer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Part Dialog open/close
  const handleOpenAddPartDialog = () => {
    setOpenAddPartDialog(true);
  };

  const handleCloseAddPartDialog = () => {
    setOpenAddPartDialog(false);
    setPartAddError(null);
    // Reset the form
    setNewPart({
      garageId: "67e0f80b5c8f6293f36e3506",
      carName: "",
      model: "",
      partNumber: "",
      partName: "",
      quantity: 1,
      pricePerUnit: 0,
      taxAmount: 0
    });
  };

  // Handle new part form input changes
  const handlePartInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    if (name === 'quantity' || name === 'pricePerUnit' || name === 'taxAmount') {
      setNewPart({
        ...newPart,
        [name]: Number(value)
      });
    } else {
      setNewPart({
        ...newPart,
        [name]: value
      });
    }
  };

  // Handle add part form submission
  const handleAddPart = async () => {
    // Validate form
    if (!newPart.carName || !newPart.model || !newPart.partName) {
      setPartAddError('Please fill all required fields');
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      const response = await axios.post(
        'https://garage-management-system-cr4w.onrender.com/api/inventory/add',
        newPart,
        {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTgxNjY5NCwiZXhwIjoxNzQ2NDIxNDk0fQ.eFBVfYMr5ys2xe485aP1i_UlV1Z_P_8H4uiKk-VdAWM',
            'Content-Type': 'application/json'
          }
        }
      );

      // Set success and close dialog
      setPartAddSuccess(true);
      setTimeout(() => {
        setPartAddSuccess(false);
        handleCloseAddPartDialog();
        // Refresh inventory parts
        fetchInventoryParts();
      }, 1500);
    } catch (error) {
      console.error('Add part error:', error);
      setPartAddError(error.response?.data?.message || error.message || 'Failed to add part. Please try again.');
    } finally {
      setAddingPart(false);
    }
  };

  // Fetch inventory parts separately (to refresh after adding a new part)
  const fetchInventoryParts = async () => {
    try {
      const response = await axios.get(
        'https://garage-management-system-cr4w.onrender.com/api/inventory/67e0f80b5c8f6293f36e3506',
        {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTgxNjY5NCwiZXhwIjoxNzQ2NDIxNDk0fQ.eFBVfYMr5ys2xe485aP1i_UlV1Z_P_8H4uiKk-VdAWM'
          }
        }
      );
      // Handle the response data
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setInventoryParts(data);
    } catch (err) {
      console.error('Error refreshing inventory:', err);
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600}
                        sx={{ color: theme.palette.text.primary }}
                      >
                        Select Parts
                      </Typography>
                      <Tooltip title="Add New Part">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={handleOpenAddPartDialog}
                          sx={{ borderRadius: 2 }}
                        >
                          Add Part
                        </Button>
                      </Tooltip>
                    </Box>
                    <Autocomplete
                      fullWidth
                      multiple
                      options={inventoryParts}
                      getOptionLabel={(option) => `${option.partName} (${option.carName} - ${option.model})`}
                      value={selectedParts}
                      onChange={(event, newValue) => {
                        setSelectedParts(newValue);
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" fontWeight={500}>
                              {option.partName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.carName} - {option.model}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Qty: {option.quantity} | ₹{option.pricePerUnit}
                            </Typography>
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

      {/* Add Part Dialog */}
      <Dialog open={openAddPartDialog} onClose={handleCloseAddPartDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: theme.palette.primary.contrastText,
          display: 'flex',
          alignItems: 'center',
          py: 2
        }}>
          <InventoryIcon sx={{ mr: 1 }} />
          Add New Part
        </DialogTitle>
        <DialogContent dividers>
          {partAddSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Part added successfully!
            </Alert>
          )}
          {partAddError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {partAddError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Car Name"
                name="carName"
                value={newPart.carName}
                onChange={handlePartInputChange}
                required
                variant="outlined"
                placeholder="E.g., Honda Civic"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                name="model"
                value={newPart.model}
                onChange={handlePartInputChange}
                required
                variant="outlined"
                placeholder="E.g., VX 2020"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Part Number"
                name="partNumber"
                value={newPart.partNumber}
                onChange={handlePartInputChange}
                variant="outlined"
                placeholder="E.g., HON12345"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Part Name"
                name="partName"
                value={newPart.partName}
                onChange={handlePartInputChange}
                required
                variant="outlined"
                placeholder="E.g., Brake Pad"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={newPart.quantity}
                onChange={handlePartInputChange}
                required
                variant="outlined"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Price Per Unit (₹)"
                name="pricePerUnit"
                type="number"
                value={newPart.pricePerUnit}
                onChange={handlePartInputChange}
                required
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tax Amount (₹)"
                name="taxAmount"
                type="number"
                value={newPart.taxAmount}
                onChange={handlePartInputChange}
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseAddPartDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddPart} 
            variant="contained" 
            color="primary"
            disabled={addingPart}
            startIcon={addingPart ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            {addingPart ? 'Adding...' : 'Add Part'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignEngineer;