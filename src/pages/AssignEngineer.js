import React, { useState, useEffect, useCallback } from 'react';
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
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
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
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://garage-management-zi5z.onrender.com/api'; 

const AssignEngineer = () => {
  const { darkMode } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const jobCardId = location.state?.jobCardId;
  const garageId = localStorage.getItem('garageId');

  // Main State
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineers, setSelectedEngineers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [jobCardIds, setJobCardIds] = useState([]); // For multiple job card assignment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Add Part Dialog States
  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({
    garageId,
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

  // Add Engineer Dialog States
  const [openAddEngineerDialog, setOpenAddEngineerDialog] = useState(false);
  const [newEngineer, setNewEngineer] = useState({
    name: "",
    garageId,
    email: "",
    phone: "",
    specialty: ""
  });
  const [addingEngineer, setAddingEngineer] = useState(false);
  const [engineerAddSuccess, setEngineerAddSuccess] = useState(false);
  const [engineerAddError, setEngineerAddError] = useState(null);

  // Utility API Call
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      return response;
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err);
      throw err;
    }
  }, []);

  // Initialize job card IDs
  useEffect(() => {
    const initialJobCardIds = [];
    
    // Add the current job card ID from URL params
    if (id) {
      initialJobCardIds.push(id);
    }
    
    // Add job card ID from location state if different
    if (jobCardId && jobCardId !== id) {
      initialJobCardIds.push(jobCardId);
    }
    
    setJobCardIds(initialJobCardIds);
  }, [id, jobCardId]);

  // Initialize default tasks
  useEffect(() => {
    setTasks([
      { id: 1, name: 'Engine Repair', duration: '4-6 hours' },
      { id: 2, name: 'Brake Replacement', duration: '2-3 hours' },
      { id: 3, name: 'Oil Change', duration: '1 hour' },
      { id: 4, name: 'Tire Rotation', duration: '1 hour' },
      { id: 5, name: 'A/C Repair', duration: '3-4 hours' },
      { id: 6, name: 'Battery Replacement', duration: '1 hour' },
      { id: 7, name: 'Transmission Service', duration: '4-5 hours' },
    ]);
  }, []);

  // Fetch Inventory Parts
  const fetchInventoryParts = useCallback(async () => {
    if (!garageId) {
      navigate("/login");
      return;
    }
    
    try {
      setIsLoadingInventory(true);
      const res = await apiCall(`/garage/inventory/${garageId}`, { method: 'GET' });
      setInventoryParts(res.data?.parts || res.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory parts');
    } finally {
      setIsLoadingInventory(false);
    }
  }, [garageId, navigate, apiCall]);

  // Fetch Engineers
  const fetchEngineers = useCallback(async () => {
    if (!garageId) {
      navigate("/login");
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await apiCall(`/garage/engineers/${garageId}`, { method: 'GET' });
      setEngineers(res.data?.engineers || res.data || []);
    } catch (err) {
      console.error('Failed to fetch engineers:', err);
      setError(err.response?.data?.message || 'Failed to load engineers');
    } finally {
      setIsLoading(false);
    }
  }, [garageId, navigate, apiCall]);

  // Initialize data
  useEffect(() => {
    fetchInventoryParts();
    fetchEngineers();
  }, [fetchInventoryParts, fetchEngineers]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    
    // Engineer selection is required
    if (!selectedEngineers || selectedEngineers.length === 0) {
      errors.engineers = 'Please select an engineer';
    }
    
    // Job card ID validation
    if (!id && (!jobCardIds || jobCardIds.length === 0)) {
      errors.jobCards = 'No job cards to assign';
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError('Please fix the form errors');
      return false;
    }
    
    return true;
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setFormErrors({});

    // Get the selected engineer ID
    const selectedEngineerId = selectedEngineers.length > 0 ? selectedEngineers[0]._id : null;
    
    if (!selectedEngineerId) {
      setError('Please select an engineer');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      jobCardIds: jobCardIds.length > 0 ? jobCardIds : [id] // Fallback to URL param ID
    };

    console.log("Payload being sent:", payload);
    console.log("Selected Engineer ID:", selectedEngineerId);
    console.log("Job Card IDs to assign:", payload.jobCardIds);

    try {
      const res = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/jobcards/assign-jobcards/${selectedEngineerId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Success:', res.data);
      
      if (res.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/Work-In-Progress/${id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Assignment error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to assign job cards to engineer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add New Engineer
  const handleAddEngineer = async () => {
    // Validation
    if (!newEngineer.name?.trim() || !newEngineer.email?.trim() || !newEngineer.phone?.trim()) {
      setEngineerAddError('Please fill all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEngineer.email)) {
      setEngineerAddError('Invalid email format');
      return;
    }

    if (!/^\d{10}$/.test(newEngineer.phone)) {
      setEngineerAddError('Phone number must be exactly 10 digits');
      return;
    }

    setAddingEngineer(true);
    setEngineerAddError(null);

    try {
      const formattedEngineer = {
        ...newEngineer,
        phone: newEngineer.phone, // Keep as string to preserve leading zeros
        garageId
      };

      await apiCall('/garage/engineers/add', {
        method: 'POST',
        data: formattedEngineer
      });

      // Refresh engineers list
      await fetchEngineers();

      setEngineerAddSuccess(true);
      setTimeout(() => {
        setEngineerAddSuccess(false);
        handleCloseAddEngineerDialog();
      }, 1500);
    } catch (err) {
      console.error('Add engineer error:', err);
      setEngineerAddError(err.response?.data?.message || 'Failed to add engineer');
    } finally {
      setAddingEngineer(false);
    }
  };

  // Add New Part
  const handleAddPart = async () => {
    // Validation
    if (!newPart.carName?.trim() || !newPart.model?.trim() || !newPart.partName?.trim()) {
      setPartAddError('Please fill all required fields');
      return;
    }

    if (newPart.quantity <= 0) {
      setPartAddError('Quantity must be greater than 0');
      return;
    }

    if (newPart.pricePerUnit < 0) {
      setPartAddError('Price cannot be negative');
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      await apiCall('/garage/inventory/add', {
        method: 'POST',
        data: newPart
      });

      // Refresh inventory parts
      await fetchInventoryParts();

      setPartAddSuccess(true);
      setTimeout(() => {
        setPartAddSuccess(false);
        handleCloseAddPartDialog();
      }, 1500);
    } catch (err) {
      console.error('Add part error:', err);
      setPartAddError(err.response?.data?.message || 'Failed to add part');
    } finally {
      setAddingPart(false);
    }
  };

  // Close Handlers
  const handleCloseAlert = () => {
    setError(null);
    setSuccess(false);
    setFormErrors({});
  };

  const handleCloseAddEngineerDialog = () => {
    setOpenAddEngineerDialog(false);
    setEngineerAddError(null);
    setEngineerAddSuccess(false);
    setNewEngineer({ 
      name: "", 
      garageId, 
      email: "", 
      phone: "", 
      specialty: "" 
    });
  };

  const handleCloseAddPartDialog = () => {
    setOpenAddPartDialog(false);
    setPartAddError(null);
    setPartAddSuccess(false);
    setNewPart({
      garageId,
      carName: "",
      model: "",
      partNumber: "",
      partName: "",
      quantity: 1,
      pricePerUnit: 0,
      taxAmount: 0
    });
  };

  // Handle input changes for new engineer
  const handleEngineerInputChange = (field, value) => {
    setNewEngineer(prev => ({ ...prev, [field]: value }));
    if (engineerAddError) setEngineerAddError(null);
  };

  // Handle input changes for new part
  const handlePartInputChange = (field, value) => {
    setNewPart(prev => ({ ...prev, [field]: value }));
    if (partAddError) setPartAddError(null);
  };

  return (
    <>
      {/* Error & Success Alerts */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleCloseAlert}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Engineer assigned successfully!
        </Alert>
      </Snackbar>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          mb: 4,
          ml: { xs: 0, sm: 35 },
          overflow: "auto",
        }}
      >
        <CssBaseline />
        <Container maxWidth="md">
          {/* Header */}
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ mr: 2 }}
                aria-label="Go back"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" fontWeight={600}>
                Assign Engineer
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddEngineerDialog(true)}
              size="small"
            >
              Add Engineer
            </Button>
          </Box>

          {/* Main Form Card */}
          <Card sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Paper sx={{ p: 3, mb: 4 }} elevation={0}>
                  <Grid container spacing={3}>
                    {/* Engineer Selection */}
                    <Grid item xs={12}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                        Select Engineers *
                      </Typography>
                      {isLoading ? (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          py: 4 
                        }}>
                          <CircularProgress size={24} />
                          <Typography sx={{ ml: 2 }}>
                            Loading engineers...
                          </Typography>
                        </Box>
                      ) : (
                        <Autocomplete
                          multiple
                          fullWidth
                          options={engineers}
                          getOptionLabel={(option) => option.name || ''}
                          value={selectedEngineers}
                          onChange={(event, newValue) => {
                            setSelectedEngineers(newValue);
                            if (formErrors.engineers) {
                              setFormErrors(prev => ({ ...prev, engineers: null }));
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select one or more engineers"
                              variant="outlined"
                              error={!!formErrors.engineers}
                              helperText={formErrors.engineers}
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
                          disabled={engineers.length === 0}
                          noOptionsText="No engineers available"
                        />
                      )}
                    </Grid>

                    {/* Task Assignment */}
                    <Grid item xs={12}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                        Assign Task *
                      </Typography>
                      <Autocomplete
                        fullWidth
                        options={tasks}
                        getOptionLabel={(option) => `${option.name} (${option.duration})`}
                        value={selectedTask}
                        onChange={(event, newValue) => {
                          setSelectedTask(newValue);
                          if (formErrors.task) {
                            setFormErrors(prev => ({ ...prev, task: null }));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select or type a task"
                            variant="outlined"
                            error={!!formErrors.task}
                            helperText={formErrors.task}
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
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 1,
                        flexWrap: 'wrap',
                        gap: 1
                      }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Select Parts (Optional)
                        </Typography>
                        <Tooltip title="Add New Part">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenAddPartDialog(true)}
                          >
                            Add Part
                          </Button>
                        </Tooltip>
                      </Box>
                      
                      {isLoadingInventory ? (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          py: 2 
                        }}>
                          <CircularProgress size={20} />
                          <Typography sx={{ ml: 2 }}>
                            Loading parts...
                          </Typography>
                        </Box>
                      ) : (
                        <Autocomplete
                          multiple
                          fullWidth
                          options={inventoryParts}
                          getOptionLabel={(option) => 
                            `${option.partName} (${option.carName} - ${option.model}) - Qty: ${option.quantity}`
                          }
                          value={selectedParts}
                          onChange={(event, newValue) => setSelectedParts(newValue)}
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
                          noOptionsText="No parts available"
                        />
                      )}
                    </Grid>
                  </Grid>
                </Paper>

                {/* Submit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={isSubmitting || isLoading}
                    sx={{ px: 4, py: 1.5, textTransform: 'uppercase' }}
                  >
                    {isSubmitting ? 'Assigning...' : 'Assign Engineer'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Container>

        {/* Add Part Dialog */}
        <Dialog 
          open={openAddPartDialog} 
          onClose={handleCloseAddPartDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Part</DialogTitle>
          <DialogContent>
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
                  label="Car Name *" 
                  value={newPart.carName} 
                  onChange={(e) => handlePartInputChange('carName', e.target.value)}
                  error={!newPart.carName.trim() && !!partAddError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Model *" 
                  value={newPart.model} 
                  onChange={(e) => handlePartInputChange('model', e.target.value)}
                  error={!newPart.model.trim() && !!partAddError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Part Number" 
                  value={newPart.partNumber} 
                  onChange={(e) => handlePartInputChange('partNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Part Name *" 
                  value={newPart.partName} 
                  onChange={(e) => handlePartInputChange('partName', e.target.value)}
                  error={!newPart.partName.trim() && !!partAddError}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth 
                  label="Quantity *" 
                  type="number" 
                  value={newPart.quantity} 
                  onChange={(e) => handlePartInputChange('quantity', Math.max(1, Number(e.target.value)))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth 
                  label="Price Per Unit" 
                  type="number" 
                  value={newPart.pricePerUnit} 
                  onChange={(e) => handlePartInputChange('pricePerUnit', Math.max(0, Number(e.target.value)))}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  fullWidth 
                  label="Tax Amount" 
                  type="number" 
                  value={newPart.taxAmount} 
                  onChange={(e) => handlePartInputChange('taxAmount', Math.max(0, Number(e.target.value)))}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseAddPartDialog}
              disabled={addingPart}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPart} 
              disabled={addingPart} 
              variant="contained"
              startIcon={addingPart ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {addingPart ? 'Adding...' : 'Add Part'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Engineer Dialog */}
        <Dialog 
          open={openAddEngineerDialog} 
          onClose={handleCloseAddEngineerDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Engineer</DialogTitle>
          <DialogContent>
            {engineerAddSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Engineer added successfully!
              </Alert>
            )}
            {engineerAddError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {engineerAddError}
              </Alert>
            )}
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Name *" 
                  value={newEngineer.name} 
                  onChange={(e) => handleEngineerInputChange('name', e.target.value)}
                  error={!newEngineer.name.trim() && !!engineerAddError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Email *" 
                  type="email" 
                  value={newEngineer.email} 
                  onChange={(e) => handleEngineerInputChange('email', e.target.value)}
                  error={!newEngineer.email.trim() && !!engineerAddError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Phone *" 
                  value={newEngineer.phone} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleEngineerInputChange('phone', value);
                  }}
                  error={!newEngineer.phone.trim() && !!engineerAddError}
                  placeholder="10-digit phone number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Specialty" 
                  value={newEngineer.specialty} 
                  onChange={(e) => handleEngineerInputChange('specialty', e.target.value)}
                  placeholder="e.g., Engine Specialist, Brake Expert"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseAddEngineerDialog}
              disabled={addingEngineer}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddEngineer} 
              disabled={addingEngineer} 
              variant="contained"
              startIcon={addingEngineer ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {addingEngineer ? 'Adding...' : 'Add Engineer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AssignEngineer;