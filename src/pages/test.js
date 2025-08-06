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
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress as MuiCircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://garage-management-zi5z.onrender.com/api';

const AssignEngineer = () => {
  const { darkMode } = useThemeContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const garageId = localStorage.getItem('garageId');
  const garageToken = localStorage.getItem('token');

  // State
  const [engineers, setEngineers] = useState([]);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [jobCardIds, setJobCardIds] = useState([]);
  const [assignments, setAssignments] = useState([
    {
      id: Date.now(),
      engineer: null,
      parts: [],
      priority: 'medium',
      notes: ''
    }
  ]);
  const [jobPoints, setJobPoints] = useState([]);
  const [currentJobPoint, setCurrentJobPoint] = useState({ description: '' });
  const [parsedJobDetails, setParsedJobDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [jobCardDataTemp, setJobCardDataTemp] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Dialogs
  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({
    garageId,
    carName: "",
    model: "",
    partNumber: "",
    partName: "",
    quantity: 1,
    purchasePrice: 0,
    sellingPrice: 0,
    hsnNumber: "",
    igst: 0,
    cgstSgst: 0,
    taxType: 'igst'
  });
  const [addingPart, setAddingPart] = useState(false);
  const [partAddError, setPartAddError] = useState(null);

  const [openAddEngineerDialog, setOpenAddEngineerDialog] = useState(false);
  const [newEngineer, setNewEngineer] = useState({
    name: "", email: "", phone: "", specialty: "", garageId
  });
  const [addingEngineer, setAddingEngineer] = useState(false);
  const [engineerAddError, setEngineerAddError] = useState(null);

  // Utility API Call
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': garageToken ? `Bearer ${garageToken}` : '',
          ...options.headers
        },
        ...options
      });
      return response;
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err);
      throw err;
    }
  }, [garageToken]);

  // Fetch Engineers
  const fetchEngineers = useCallback(async () => {
    if (!garageId) return;
    try {
      setIsLoading(true);
      const res = await apiCall(`/garage/engineers/${garageId}`, { method: 'GET' });
      setEngineers(res.data?.engineers || []);
    } catch (err) {
      setError('Failed to load engineers');
    } finally {
      setIsLoading(false);
    }
  }, [garageId, apiCall]);

  // Fetch Inventory
  const fetchInventoryParts = useCallback(async () => {
    if (!garageId) return;
    try {
      setIsLoadingInventory(true);
      const res = await apiCall(`/garage/inventory/${garageId}`, { method: 'GET' });
      setInventoryParts(res.data?.parts || []);
    } catch (err) {
      setError('Failed to load inventory');
    } finally {
      setIsLoadingInventory(false);
    }
  }, [garageId, apiCall]);

  // Get available quantity considering all selected parts
  const getAvailableQuantity = (partId) => {
    const originalPart = inventoryParts.find(p => p._id === partId);
    if (!originalPart) return 0;

    let totalSelected = 0;
    assignments.forEach(assignment => {
      assignment.parts.forEach(part => {
        if (part._id === partId) {
          totalSelected += part.selectedQuantity || 1;
        }
      });
    });

    return Math.max(0, originalPart.quantity - totalSelected);
  };

  // Update job card with parts used
  const updateJobCardWithParts = async (partsUsed) => {
    try {
      const formattedParts = partsUsed.map(part => {
        const sellingPrice = Number(part.sellingPrice) || 0;
        const taxRate = Number(part.taxAmount || 0); // percentage
        const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
        const quantity = Number(part.selectedQuantity || 1);
        const totalPrice = pricePerPiece * quantity;

        return {
          partName: part.partName,
          quantity,
          pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
          totalPrice: parseFloat(totalPrice.toFixed(2))
        };
      });

      await axios.put(
        `${API_BASE_URL}/garage/jobcards/${id}/workprogress`,
        { partsUsed: formattedParts },
        { headers: { Authorization: `Bearer ${garageToken}` } }
      );

      setSnackbar({
        open: true,
        message: `✅ Job card updated with ${formattedParts.length} part(s)`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating job card:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update job card',
        severity: 'error'
      });
    }
  };

  // Handle part selection
  const handlePartSelection = async (assignmentId, newParts) => {
    const uniqueParts = newParts.map(part => ({
      ...part,
      selectedQuantity: part.selectedQuantity || 1
    }));

    updateAssignment(assignmentId, 'parts', uniqueParts);

    if (id) {
      await updateJobCardWithParts(uniqueParts);
    }
  };

  // Handle quantity change
  const handlePartQuantityChange = async (assignmentId, partIndex, newQuantity) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const part = assignment.parts[partIndex];
    const availableQuantity = getAvailableQuantity(part._id) + (part.selectedQuantity || 1);

    if (newQuantity < 1 || newQuantity > availableQuantity) {
      setError(`Quantity must be between 1 and ${availableQuantity}`);
      return;
    }

    const updatedParts = assignment.parts.map((p, idx) =>
      idx === partIndex ? { ...p, selectedQuantity: newQuantity } : p
    );

    updateAssignment(assignmentId, 'parts', updatedParts);

    if (id) {
      await updateJobCardWithParts(updatedParts);
    }
  };

  // Remove part
  const handlePartRemoval = async (assignmentId, partIndex) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    const part = assignment.parts[partIndex];

    const updatedParts = assignment.parts.filter((_, idx) => idx !== partIndex);
    updateAssignment(assignmentId, 'parts', updatedParts);

    if (id) {
      await updateJobCardWithParts(updatedParts);
    }

    setSnackbar({
      open: true,
      message: `Part "${part.partName}" removed`,
      severity: 'info'
    });
  };

  // Add job point
  const addJobPoint = () => {
    if (currentJobPoint.description.trim()) {
      setJobPoints(prev => [...prev, { id: Date.now(), description: currentJobPoint.description.trim() }]);
      setCurrentJobPoint({ description: '' });
    }
  };

  const removeJobPoint = (index) => {
    setJobPoints(prev => prev.filter((_, i) => i !== index));
  };

  // Handle input
  const handleJobPointInputChange = (field, value) => {
    setCurrentJobPoint(prev => ({ ...prev, [field]: value }));
  };

  const handleJobPointKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addJobPoint();
    }
  };

  // Get job details for API
  const getJobDetailsForAPI = () => {
    const combined = [...parsedJobDetails, ...jobPoints];
    return JSON.stringify(combined);
  };

  // Priority color
  const getPriorityColor = (priority) => {
    return priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success';
  };

  // Update assignment
  const updateAssignment = (assignmentId, field, value) => {
    setAssignments(prev => prev.map(assignment =>
      assignment.id === assignmentId ? { ...assignment, [field]: value } : assignment
    ));
  };

  // Remove assignment
  const removeAssignment = (assignmentId) => {
    if (assignments.length > 1) {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    }
  };

  // Add Engineer
  const handleAddEngineer = async () => {
    if (!newEngineer.name?.trim() || !newEngineer.email?.trim() || !newEngineer.phone?.trim()) {
      setEngineerAddError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEngineer.email)) {
      setEngineerAddError('Invalid email');
      return;
    }

    if (!/^\d{10}$/.test(newEngineer.phone)) {
      setEngineerAddError('Phone must be 10 digits');
      return;
    }

    setAddingEngineer(true);
    try {
      await apiCall('/garage/engineers/add', {
        method: 'POST',
        data: newEngineer
      });
      await fetchEngineers();
      setSnackbar({ open: true, message: 'Engineer added!', severity: 'success' });
      handleCloseAddEngineerDialog();
    } catch (err) {
      setEngineerAddError(err.response?.data?.message || 'Failed to add engineer');
    } finally {
      setAddingEngineer(false);
    }
  };

  // Add Part
  const handleAddPart = async () => {
    if (!newPart.partName || !newPart.carName || !newPart.model || newPart.quantity <= 0) {
      setPartAddError('Please fill all required fields');
      return;
    }

    setAddingPart(true);
    try {
      const igst = newPart.taxType === 'igst' ? parseFloat(newPart.igst) || 0 : 0;
      const cgstSgst = newPart.taxType === 'cgstSgst' ? parseFloat(newPart.cgstSgst) || 0 : 0;
      const taxAmount = newPart.taxType === 'igst' ? igst : cgstSgst * 2;

      await axios.post(`${API_BASE_URL}/garage/inventory/add`, {
        name: "abc",
        garageId,
        carName: newPart.carName,
        model: newPart.model,
        partNumber: newPart.partNumber,
        partName: newPart.partName,
        quantity: parseInt(newPart.quantity),
        purchasePrice: parseFloat(newPart.purchasePrice),
        sellingPrice: parseFloat(newPart.sellingPrice),
        hsnNumber: newPart.hsnNumber,
        igst,
        cgstSgst,
        taxAmount
      }, {
        headers: { Authorization: `Bearer ${garageToken}` }
      });

      await fetchInventoryParts();
      setSnackbar({ open: true, message: 'Part added!', severity: 'success' });
      handleCloseAddPartDialog();
    } catch (err) {
      setPartAddError(err.response?.data?.message || 'Failed to add part');
    } finally {
      setAddingPart(false);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const allPartsUsed = [];
      const partUpdates = [];

      assignments.forEach(assignment => {
        assignment.parts.forEach(part => {
          const selectedQty = part.selectedQuantity || 1;
          const existingIndex = allPartsUsed.findIndex(p => p.partName === part.partName);
          const sellingPrice = Number(part.sellingPrice) || 0;
          const taxRate = Number(part.taxAmount || 0);
          const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
          const totalPrice = pricePerPiece * selectedQty;

          if (existingIndex !== -1) {
            allPartsUsed[existingIndex].quantity += selectedQty;
            allPartsUsed[existingIndex].totalPrice += totalPrice;
          } else {
            allPartsUsed.push({
              partName: part.partName,
              quantity: selectedQty,
              pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
              totalPrice: parseFloat(totalPrice.toFixed(2))
            });
          }

          partUpdates.push({ partId: part._id, qty: selectedQty });
        });
      });

      // Update inventory
      for (const update of partUpdates) {
        const part = inventoryParts.find(p => p._id === update.partId);
        if (part && part.quantity >= update.qty) {
          await apiCall(`/garage/inventory/update/${update.partId}`, {
            method: 'PUT',
            data: { quantity: part.quantity - update.qty }
          });
        }
      }

      // Update job card
      if (id) {
        await updateJobCardWithParts(allPartsUsed);
      }

      setSuccess(true);
      setSnackbar({ open: true, message: '✅ Assignment completed!', severity: 'success' });
      setTimeout(() => navigate(`/Work-In-Progress/${id}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    assignments.forEach((a, i) => {
      if (!a.engineer) errors[`assignment_${a.id}_engineer`] = 'Required';
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleCloseAddPartDialog = () => {
    setOpenAddPartDialog(false);
    setPartAddError(null);
    setNewPart({
      garageId, carName: "", model: "", partNumber: "", partName: "",
      quantity: 1, purchasePrice: 0, sellingPrice: 0, hsnNumber: "", igst: 0, cgstSgst: 0, taxType: 'igst'
    });
  };

  const handleCloseAddEngineerDialog = () => {
    setOpenAddEngineerDialog(false);
    setEngineerAddError(null);
    setNewEngineer({ name: "", email: "", phone: "", specialty: "", garageId });
  };

  const handleEngineerInputChange = (field, value) => {
    setNewEngineer(prev => ({ ...prev, [field]: value }));
  };

  const handlePartInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewPart(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Initialize
  useEffect(() => {
    fetchEngineers();
    fetchInventoryParts();
  }, [fetchEngineers, fetchInventoryParts]);

  // Fetch job card data
  useEffect(() => {
    const fetchJobCardData = async () => {
      if (!id) return;
      setIsEditMode(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/garage/jobCards/${id}`, {
          headers: { Authorization: `Bearer ${garageToken}` }
        });
        const data = res.data;

        if (data.jobDetails) {
          try {
            const parsed = JSON.parse(data.jobDetails);
            if (Array.isArray(parsed)) setParsedJobDetails(parsed);
          } catch (e) {
            const lines = data.jobDetails.split('\n').filter(l => l.trim());
            setParsedJobDetails(lines.map(l => ({ description: l.trim() })));
          }
        }

        setJobCardDataTemp(data);
      } catch (err) {
        setError('Failed to load job card');
      }
    };
    if (id) fetchJobCardData();
  }, [id, garageToken]);

  // Set assignments after data loads
  useEffect(() => {
    if (jobCardDataTemp && engineers.length && inventoryParts.length && !isLoading && !isLoadingInventory) {
      const assignedEngineer = jobCardDataTemp.engineerId?.[0];
      const fullEngineer = engineers.find(e => e._id === assignedEngineer?._id) || assignedEngineer;

      let formattedParts = [];
      if (jobCardDataTemp.partsUsed?.length) {
        formattedParts = jobCardDataTemp.partsUsed.map(used => {
          const invPart = inventoryParts.find(p => p.partName === used.partName);
          return invPart ? { ...invPart, selectedQuantity: used.quantity || 1 } : {
            partName: used.partName,
            selectedQuantity: used.quantity || 1,
            sellingPrice: (used.totalPrice / used.quantity) || 0,
            taxAmount: 0
          };
        });
      }

      if (fullEngineer) {
        setAssignments([{
          id: Date.now(),
          engineer: fullEngineer,
          parts: formattedParts,
          priority: 'medium',
          notes: jobCardDataTemp.engineerRemarks || ''
        }]);
      }

      setJobCardDataTemp(null);
    }
  }, [jobCardDataTemp, engineers, inventoryParts, isLoading, isLoadingInventory]);

  return (
    <>
      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <Box sx={{ flexGrow: 1, mb: 4, ml: { xs: 0, sm: 35 }, px: { xs: 1, sm: 3 } }}>
        <CssBaseline />
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(`/jobs/${id}`)}><ArrowBackIcon /></IconButton>
            <Typography variant="h5" fontWeight={600}>Assign Engineer & Job Details</Typography>
          </Box>

          {/* Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Assignment Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{assignments.length}</Typography>
                  <Typography variant="body2">Assignments</Typography>
                </Box></Grid>
                <Grid item xs={6} sm={3}><Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{jobPoints.length + parsedJobDetails.length}</Typography>
                  <Typography variant="body2">Job Points</Typography>
                </Box></Grid>
                <Grid item xs={6} sm={3}><Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{assignments.reduce((a, b) => a + b.parts.length, 0)}</Typography>
                  <Typography variant="body2">Parts Used</Typography>
                </Box></Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Job Details</Typography>
              <TextField
                fullWidth
                placeholder="Add job detail"
                value={currentJobPoint.description}
                onChange={(e) => handleJobPointInputChange('description', e.target.value)}
                onKeyPress={handleJobPointKeyPress}
                InputProps={{ startAdornment: <InputAdornment position="start"><DescriptionIcon /></InputAdornment> }}
                sx={{ mb: 2 }}
              />
              <List>
                {jobPoints.map((p, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={p.description} />
                    <IconButton onClick={() => removeJobPoint(i)} color="error"><DeleteIcon /></IconButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {assignments.map((a) => (
                  <Accordion key={a.id} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Assignment #{assignments.indexOf(a) + 1}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            options={engineers}
                            getOptionLabel={(o) => o.name || o.email || ''}
                            value={a.engineer}
                            onChange={(e, v) => updateAssignment(a.id, 'engineer', v)}
                            renderInput={(params) => <TextField {...params} label="Engineer" />}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <Select value={a.priority} onChange={(e) => updateAssignment(a.id, 'priority', e.target.value)}>
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Autocomplete
                            multiple
                            options={inventoryParts.filter(p => getAvailableQuantity(p._id) > 0)}
                            getOptionLabel={(o) => `${o.partName} (${o.partNumber})`}
                            value={a.parts}
                            onChange={(e, v) => handlePartSelection(a.id, v)}
                            renderInput={(params) => <TextField {...params} label="Select Parts" />}
                          />
                          {a.parts.length > 0 && (
                            <List>
                              {a.parts.map((part, idx) => (
                                <ListItem key={part._id}>
                                  <ListItemText
                                    primary={part.partName}
                                    secondary={`Qty: ${part.selectedQuantity || 1} | ₹${part.sellingPrice} + ${part.taxAmount}% tax`}
                                  />
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" onClick={() => handlePartQuantityChange(a.id, idx, (part.selectedQuantity || 1) - 1)}>-</Button>
                                    <TextField size="small" value={part.selectedQuantity || 1} sx={{ width: 60 }} />
                                    <Button size="small" onClick={() => handlePartQuantityChange(a.id, idx, (part.selectedQuantity || 1) + 1)}>+</Button>
                                    <IconButton onClick={() => handlePartRemoval(a.id, idx)} color="error"><DeleteIcon /></IconButton>
                                  </Box>
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <MuiCircularProgress size={20} /> : <SendIcon />}
                    size="large"
                  >
                    {isSubmitting ? 'Saving...' : 'Submit'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default AssignEngineer;