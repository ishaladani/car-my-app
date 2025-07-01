import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Chip,
  Avatar,
  Alert,
  useTheme,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Save as SaveIcon,
  Source as SourceIcon,
  LibraryAdd as LibraryAddIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://garage-management-zi5z.onrender.com/api';

const WorkInProgress = () => {
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }
  
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isLoadingEngineers, setIsLoadingEngineers] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  
  const garageToken = localStorage.getItem('token');
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [carDetails, setCarDetails] = useState({
    company: '',
    model: '',
    carNo: ''
  });
  
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    contactNo: '',
    email: ''
  });
  
  // Engineers state - MULTIPLE SELECTION
  const [engineers, setEngineers] = useState([]);
  const [assignedEngineers, setAssignedEngineers] = useState([]);
  
  // Inventory parts state
  const [inventoryParts, setInventoryParts] = useState([]);
  
  // COMBINED PARTS STATE - existing + new inventory parts
  const [allParts, setAllParts] = useState([]);
  const [partIdCounter, setPartIdCounter] = useState(1);
  
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [laborHours, setLaborHours] = useState('');

  // Add Part Dialog states
  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({
    garageId,
    name: "abc",
    carName: "",
    model: "",
    partNumber: "",
    partName: "",
    quantity: 1,
    pricePerUnit: 0,
    sgstEnabled: false,
    sgstPercentage: '',
    cgstEnabled: false,
    cgstPercentage: '',
    taxAmount: 0
  });
  const [addingPart, setAddingPart] = useState(false);
  const [partAddSuccess, setPartAddSuccess] = useState(false);
  const [partAddError, setPartAddError] = useState(null);

  // Parts addition mode
  const [addPartMode, setAddPartMode] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'in_progress', label: 'In Progress', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' },
    { value: 'on_hold', label: 'On Hold', color: 'default' }
  ];

  // Tax calculation functions
  const calculateTaxAmount = (pricePerUnit, quantity, percentage) => {
    if (!pricePerUnit || !quantity || !percentage) return 0;
    const totalPrice = parseFloat(pricePerUnit) * parseInt(quantity);
    return (totalPrice * parseFloat(percentage)) / 100;
  };

  const calculateTotalTaxAmount = (pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage) => {
    let totalTax = 0;
    if (sgstEnabled && sgstPercentage) {
      totalTax += calculateTaxAmount(pricePerUnit, quantity, sgstPercentage);
    }
    if (cgstEnabled && cgstPercentage) {
      totalTax += calculateTaxAmount(pricePerUnit, quantity, cgstPercentage);
    }
    return totalTax;
  };

  const calculateTotalPrice = (pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage) => {
    if (!pricePerUnit || !quantity) return 0;
    const basePrice = parseFloat(pricePerUnit) * parseInt(quantity);
    const totalTax = calculateTotalTaxAmount(pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage);
    return basePrice + totalTax;
  };

  const checkDuplicatePartNumber = (partNumber, excludeId = null) => {
    return inventoryParts.some(item =>
      item.partNumber === partNumber &&
      (excludeId ? (item._id || item.id) !== excludeId : true)
    );
  };

  // API utility function
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
      setIsLoadingEngineers(true);
      const res = await apiCall(`/garage/engineers/${garageId}`, { method: 'GET' });
      setEngineers(res.data?.engineers || res.data || []);
    } catch (err) {
      console.error('Failed to fetch engineers:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load engineers',
        severity: 'error'
      });
    } finally {
      setIsLoadingEngineers(false);
    }
  }, [garageId, apiCall]);

  // Fetch Inventory Parts
  const fetchInventoryParts = useCallback(async () => {
    if (!garageId) return;
    
    try {
      setIsLoadingInventory(true);
      const res = await apiCall(`/garage/inventory/${garageId}`, { method: 'GET' });
      setInventoryParts(res.data?.parts || res.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load inventory parts',
        severity: 'error'
      });
    } finally {
      setIsLoadingInventory(false);
    }
  }, [garageId, apiCall]);

  // Get available quantity for inventory parts
  const getAvailableQuantity = (inventoryPartId) => {
    const originalPart = inventoryParts.find(p => p._id === inventoryPartId);
    if (!originalPart) return 0;

    // Calculate total selected quantity from allParts
    let totalSelected = 0;
    allParts.forEach(part => {
      if (part.type === 'inventory' && part.inventoryId === inventoryPartId) {
        totalSelected += part.selectedQuantity || 1;
      }
    });

    return Math.max(0, originalPart.quantity - totalSelected);
  };

  // Update part quantity in inventory
  const updatePartQuantity = useCallback(async (partId, newQuantity) => {
    try {
      console.log(`Updating part ${partId} to quantity: ${newQuantity}`);
      
      if (newQuantity === 0) {
        await apiCall(`/garage/inventory/delete/${partId}`, {
          method: 'DELETE'
        });
      } else {
        await apiCall(`/garage/inventory/update/${partId}`, {
          method: 'PUT',
          data: { quantity: newQuantity }
        });
      }
      
      await fetchInventoryParts();
      
    } catch (err) {
      console.error(`Failed to update quantity for part ${partId}:`, err);
      throw new Error(`Failed to update part quantity: ${err.response?.data?.message || err.message}`);
    }
  }, [apiCall, fetchInventoryParts]);

  // PARTS MANAGEMENT FUNCTIONS

  // Add inventory part to list
  const addInventoryPartToList = (inventoryPart) => {
    const availableQuantity = getAvailableQuantity(inventoryPart._id);
    if (availableQuantity <= 0) {
      setSnackbar({
        open: true,
        message: `No stock available for "${inventoryPart.partName}"`,
        severity: 'error'
      });
      return;
    }

    const newPart = {
      id: partIdCounter,
      type: 'inventory',
      inventoryId: inventoryPart._id,
      partName: inventoryPart.partName,
      partNumber: inventoryPart.partNumber || '',
      selectedQuantity: 1,
      pricePerUnit: inventoryPart.pricePerUnit || 0,
      gstPercentage: inventoryPart.gstPercentage || inventoryPart.taxAmount || 0,
      carName: inventoryPart.carName || '',
      model: inventoryPart.model || '',
      availableQuantity: availableQuantity,
      totalPrice: 0,
      isExisting: false
    };

    setAllParts(prev => [...prev, newPart]);
    setPartIdCounter(prev => prev + 1);
  };

  // Remove part from list
  const removePartFromList = (partId) => {
    setAllParts(prev => prev.filter(part => part.id !== partId));
  };

  // Update part in list
  const updatePartInList = (partId, field, value) => {
    setAllParts(prev => prev.map(part => {
      if (part.id === partId) {
        return { ...part, [field]: value };
      }
      return part;
    }));
  };

  // Handle inventory part quantity change
  const handleInventoryPartQuantityChange = (partId, newQuantity) => {
    const part = allParts.find(p => p.id === partId);
    if (!part) return;

    if (part.type === 'existing') {
      // For existing parts, just update quantity
      if (newQuantity < 1) {
        setSnackbar({
          open: true,
          message: 'Quantity must be at least 1',
          severity: 'error'
        });
        return;
      }
      updatePartInList(partId, 'selectedQuantity', newQuantity);
      return;
    }

    if (part.type === 'inventory') {
      const availableQuantity = getAvailableQuantity(part.inventoryId);
      const currentlySelected = part.selectedQuantity || 1;
      const maxSelectableQuantity = availableQuantity + currentlySelected;

      if (newQuantity > maxSelectableQuantity) {
        setSnackbar({
          open: true,
          message: `Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`,
          severity: 'error'
        });
        return;
      }

      if (newQuantity < 1) {
        setSnackbar({
          open: true,
          message: 'Quantity must be at least 1',
          severity: 'error'
        });
        return;
      }

      updatePartInList(partId, 'selectedQuantity', newQuantity);
    }
  };

  // Calculate final price for a part
  const calculatePartFinalPrice = (part) => {
    if (part.type === 'existing') {
      // For existing parts, use the totalPrice or calculate from pricePerUnit
      if (part.totalPrice && part.totalPrice > 0) {
        return parseFloat(part.totalPrice) * (part.selectedQuantity || 1);
      }
      return parseFloat(part.pricePerUnit || 0) * (part.selectedQuantity || 1);
    } else if (part.type === 'inventory') {
      const unitPrice = part.pricePerUnit || 0;
      const quantity = part.selectedQuantity || 1;
      const gstPercentage = part.gstPercentage || 0;
      const totalPrice = unitPrice * quantity;
      const gstAmount = (totalPrice * gstPercentage) / 100;
      return totalPrice + gstAmount;
    }
    return 0;
  };

  // Add new part to inventory
  const handleAddPart = async () => {
    if (!newPart.partName?.trim()) {
      setPartAddError('Please fill part name');
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

    if (newPart.partNumber && checkDuplicatePartNumber(newPart.partNumber)) {
      setPartAddError('Part number already exists. Please use a different part number.');
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      const sgstAmount = newPart.sgstEnabled ?
        calculateTaxAmount(newPart.pricePerUnit, newPart.quantity, newPart.sgstPercentage) : 0;
      const cgstAmount = newPart.cgstEnabled ?
        calculateTaxAmount(newPart.pricePerUnit, newPart.quantity, newPart.cgstPercentage) : 0;

      const taxAmount = sgstAmount + cgstAmount;

      const requestData = {
        name: newPart.name,
        garageId: garageId,
        quantity: parseInt(newPart.quantity),
        pricePerUnit: parseFloat(newPart.pricePerUnit),
        partNumber: newPart.partNumber,
        partName: newPart.partName,
        carName: newPart.carName,
        model: newPart.model,
        taxAmount: taxAmount
      };

      const response = await axios.post(
        'https://garage-management-zi5z.onrender.com/api/garage/inventory/add',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      await fetchInventoryParts();

      setPartAddSuccess(true);
      setSnackbar({
        open: true,
        message: 'Part added successfully!',
        severity: 'success'
      });

      setNewPart({
        garageId,
        name: "abc",
        carName: "",
        model: "",
        partNumber: "",
        partName: "",
        quantity: 1,
        pricePerUnit: 0,
        sgstEnabled: false,
        sgstPercentage: '',
        cgstEnabled: false,
        cgstPercentage: '',
        taxAmount: 0
      });

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

  // Fetch job card data and populate form
  useEffect(() => {
    const fetchJobCardData = async () => {
      if (!id) return;
      setFetchLoading(true);
      
      try {
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': garageToken ? `Bearer ${garageToken}` : '',
            }
          }
        );
        
        const data = response.data;
        
        // Populate car details
        setCarDetails({
          company: data.company || '',
          model: data.model || '',
          carNo: data.carNumber || ''
        });
        
        // Populate customer details
        setCustomerDetails({
          name: data.customerName || '',
          contactNo: data.contactNumber || '',
          email: data.email || ''
        });
        
        // Set assigned engineers - MULTIPLE SELECTION
        if (data.engineerId && data.engineerId.length > 0) {
          const checkEngineersLoaded = setInterval(() => {
            if (!isLoadingEngineers && engineers.length > 0) {
              const assignedEngList = data.engineerId.map(engData => {
                return engineers.find(eng => eng._id === engData._id);
              }).filter(Boolean);
              setAssignedEngineers(assignedEngList);
              clearInterval(checkEngineersLoaded);
            }
          }, 100);
        }
        
        // LOAD EXISTING PARTS from partsUsed
        if (data.partsUsed && data.partsUsed.length > 0) {
          const existingParts = data.partsUsed.map((part, index) => ({
            id: index + 1,
            type: 'existing',
            partName: part.partName || '',
            partNumber: part.partNumber || '',
            selectedQuantity: part.quantity || 1,
            pricePerUnit: part.pricePerUnit || 0,
            totalPrice: part.totalPrice || 0,
            gstPercentage: part.gstPercentage || 0,
            carName: part.carName || '',
            model: part.model || '',
            isExisting: true,
            _id: part._id // Keep original ID for reference
          }));
          
          setAllParts(existingParts);
          setPartIdCounter(existingParts.length + 1);
        } else {
          // Initialize with empty array if no existing parts
          setAllParts([]);
          setPartIdCounter(1);
        }
        
        // Populate status, remarks, and labor hours
        if (data.status) {
          setStatus(data.status);
        }
        
        if (data.engineerRemarks) {
          setRemarks(data.engineerRemarks);
        }
        
        if (data.laborHours !== undefined) {
          setLaborHours(data.laborHours.toString());
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
          message: `Error: ${error.response?.data?.message || 'Failed to fetch job card data'}`,
          severity: 'error'
        });
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchJobCardData();
  }, [id, garageToken, isLoadingEngineers, engineers]);

  // Initialize data
  useEffect(() => {
    if (!garageId) {
      navigate("/login");
      return;
    }
    
    fetchInventoryParts();
    fetchEngineers();
  }, [fetchInventoryParts, fetchEngineers, garageId, navigate]);

  // Enhanced submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Process all parts from the unified list
      const allPartsUsed = [];
      
      // Separate parts by type
      const existingParts = allParts.filter(part => part.type === 'existing' && part.partName && part.partName.trim() !== '');
      const inventoryParts = allParts.filter(part => part.type === 'inventory' && part.partName && part.partName.trim() !== '');

      // Add existing parts (already used parts)
      existingParts.forEach(part => {
        allPartsUsed.push({
          _id: part._id, // Include original ID for updates
          partName: part.partName,
          partNumber: part.partNumber || '',
          quantity: parseInt(part.selectedQuantity) || 1,
          pricePerUnit: parseFloat(part.pricePerUnit) || 0,
          totalPrice: part.totalPrice ? parseFloat(part.totalPrice) : calculatePartFinalPrice(part),
          gstPercentage: part.gstPercentage || 0,
          carName: part.carName || '',
          model: part.model || ''
        });
      });

      // Add new inventory parts and update inventory quantities
      for (const part of inventoryParts) {
        const selectedQuantity = part.selectedQuantity || 1;
        
        allPartsUsed.push({
          partId: part.inventoryId,
          partName: part.partName,
          partNumber: part.partNumber || '',
          quantity: selectedQuantity,
          pricePerUnit: part.pricePerUnit || 0,
          gstPercentage: part.gstPercentage || 0,
          totalPrice: calculatePartFinalPrice(part),
          carName: part.carName || '',
          model: part.model || ''
        });

        // Update inventory quantity
        const currentPart = inventoryParts.find(p => p._id === part.inventoryId);
        if (currentPart) {
          const newQuantity = currentPart.quantity - selectedQuantity;
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for "${part.partName}". Required: ${selectedQuantity}, Available: ${currentPart.quantity}`);
          }
          await updatePartQuantity(part.inventoryId, newQuantity);
        }
      }
      
      const requestData = {
        laborHours: parseInt(laborHours) || 0,
        engineerRemarks: remarks,
        status: status,
        assignedEngineerId: assignedEngineers.map(eng => eng._id) // Multiple engineers
      };
      
      if (allPartsUsed.length > 0) {
        requestData.partsUsed = allPartsUsed;
      }
      
      console.log("Submitting work progress:", requestData);
      
      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/jobcards/${id}/workprogress`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': garageToken ? `Bearer ${garageToken}` : '',
          }
        }
      );
      
      setSnackbar({
        open: true,
        message: `✅ Work progress updated! Engineers: ${assignedEngineers.map(e => e.name).join(', ')}, Parts: ${allPartsUsed.length} items`,
        severity: 'success'
      });
      
      // setTimeout(() => {
      //   navigate(`/Quality-Check/${id}`);
      // }, 1500);
      
    } catch (error) {
      console.error('Error updating work progress:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message || 'Failed to update work progress'}`,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dialog handlers
  const handleCloseAddPartDialog = () => {
    setOpenAddPartDialog(false);
    setPartAddError(null);
    setPartAddSuccess(false);
    setNewPart({
      garageId,
      name: "abc",
      carName: "",
      model: "",
      partNumber: "",
      partName: "",
      quantity: 1,
      pricePerUnit: 0,
      sgstEnabled: false,
      sgstPercentage: '',
      cgstEnabled: false,
      cgstPercentage: '',
      taxAmount: 0
    });
  };

  const handlePartInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (partAddError) setPartAddError(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (fetchLoading) {
    return (
      <Box sx={{ 
        flexGrow: 1, 
        mb: 4, 
        ml: { xs: 0, sm: 35 }, 
        overflow: 'auto', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
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
      // ml: {xs: 0, sm: 35},
      overflow: 'auto',
      pt: 3
    }}>
      <Container maxWidth="xl">
        <form onSubmit={handleSubmit}>

          {/* Assigned Engineers Section */}
          <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Box sx={{ 
              background: '#1976d2',
              color: 'white',
              p: 2.5,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Assigned Engineers
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {isLoadingEngineers ? (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                  <CircularProgress size={20} />
                  <Typography sx={{ ml: 1 }}>Loading engineers...</Typography>
                </Box>
              ) : (
                <Autocomplete
                  multiple
                  fullWidth
                  options={engineers}
                  getOptionLabel={(option) => option.name || ''}
                  value={assignedEngineers}
                  onChange={(event, newValue) => setAssignedEngineers(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option.name}
                        {...getTagProps({ index })}
                        color="primary"
                        key={option._id}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select multiple engineers"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <PeopleIcon color="action" />
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
              {assignedEngineers.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    ✅ Engineers Assigned: {assignedEngineers.length}
                  </Typography>
                  {assignedEngineers.map((engineer, index) => (
                    <Typography key={engineer._id} variant="body2" color="text.secondary">
                      {index + 1}. {engineer.name} - Email: {engineer.email} | Phone: {engineer.phone}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Parts Management Section */}
          <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Box sx={{ 
              background: '#1976d2',
              color: 'white',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                  <BuildIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Parts Management
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Add Part from Inventory">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setAddPartMode('inventory')}
                    startIcon={<InventoryIcon />}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    From Inventory
                  </Button>
                </Tooltip>
                <Tooltip title="Add New Part to Inventory">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setOpenAddPartDialog(true)}
                    startIcon={<LibraryAddIcon />}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Create New
                  </Button>
                </Tooltip>
              </Box>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {/* Add from Inventory Section */}
              {addPartMode === 'inventory' && (
                <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.light', opacity: 0.1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                    Select from Inventory
                  </Typography>
                  {isLoadingInventory ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                      <CircularProgress size={20} />
                      <Typography sx={{ ml: 2 }}>Loading inventory...</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Autocomplete
                        fullWidth
                        options={inventoryParts.filter(part => getAvailableQuantity(part._id) > 0)}
                        getOptionLabel={(option) => 
                          `${option.partName} (${option.partNumber || 'N/A'}) - ₹${option.pricePerUnit || 0} | Available: ${getAvailableQuantity(option._id)}`
                        }
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="body2" fontWeight={500}>
                                {option.partName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Part #: {option.partNumber || 'N/A'} | 
                                Price: ₹{option.pricePerUnit || 0} | 
                                GST: {option.gstPercentage || option.taxAmount || 0}% | 
                                Available: {getAvailableQuantity(option._id)} | 
                                {option.carName} - {option.model}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search and select parts from inventory"
                            variant="outlined"
                            size="small"
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
                        onChange={(event, newValue) => {
                          if (newValue) {
                            addInventoryPartToList(newValue);
                            event.target.value = '';
                          }
                        }}
                        noOptionsText="No parts available in inventory"
                        filterOptions={(options, { inputValue }) => {
                          return options.filter(option => 
                            getAvailableQuantity(option._id) > 0 && (
                              option.partName.toLowerCase().includes(inputValue.toLowerCase()) ||
                              option.partNumber?.toLowerCase().includes(inputValue.toLowerCase()) ||
                              option.carName?.toLowerCase().includes(inputValue.toLowerCase()) ||
                              option.model?.toLowerCase().includes(inputValue.toLowerCase())
                            )
                          );
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => setAddPartMode('')}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* Parts Display */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  All Parts ({allParts.length})
                </Typography>
                
                {allParts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                    <SourceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No parts added yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Existing parts will be loaded from job card or add new inventory parts
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Part Details</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Quantity</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Total</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allParts.map((part) => (
                          <TableRow key={part.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            <TableCell>
                              <Chip 
                                label={part.type === 'existing' ? 'Existing' : 'Inventory'} 
                                color={part.type === 'existing' ? 'warning' : 'primary'}
                                size="small" 
                                icon={part.type === 'existing' ? <AssignmentIcon /> : <InventoryIcon />}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {part.partName}
                                </Typography>
                                {part.type === 'inventory' && (
                                  <Typography variant="caption" color="info.main" sx={{ display: 'block' }}>
                                    Available: {getAvailableQuantity(part.inventoryId) + (part.selectedQuantity || 1)}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newQuantity = (part.selectedQuantity || 1) - 1;
                                    if (newQuantity >= 1) {
                                      handleInventoryPartQuantityChange(part.id, newQuantity);
                                    }
                                  }}
                                  disabled={(part.selectedQuantity || 1) <= 1}
                                  sx={{ 
                                    minWidth: '24px', 
                                    width: '24px', 
                                    height: '24px',
                                    border: `1px solid ${theme.palette.divider}`
                                  }}
                                >
                                  <Typography variant="caption" fontWeight="bold">-</Typography>
                                </IconButton>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={part.selectedQuantity || 1}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value) || 1;
                                    handleInventoryPartQuantityChange(part.id, newQuantity);
                                  }}
                                  inputProps={{ 
                                    min: 1,
                                    style: { width: '50px', textAlign: 'center' }
                                  }}
                                  sx={{ 
                                    width: '70px',
                                    '& .MuiInputBase-input': {
                                      textAlign: 'center',
                                      fontSize: '0.875rem'
                                    }
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newQuantity = (part.selectedQuantity || 1) + 1;
                                    handleInventoryPartQuantityChange(part.id, newQuantity);
                                  }}
                                  sx={{ 
                                    minWidth: '24px', 
                                    width: '24px', 
                                    height: '24px',
                                    border: `1px solid ${theme.palette.divider}`
                                  }}
                                >
                                  <Typography variant="caption" fontWeight="bold">+</Typography>
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color="primary">
                                ₹{calculatePartFinalPrice(part).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                color="error"
                                onClick={() => removePartFromList(part.id)}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: 'rgba(239, 68, 68, 0.1)' 
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Parts Total */}
                {allParts.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'success.main', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="success.contrastText">
                        <strong>Existing Parts:</strong> {allParts.filter(p => p.type === 'existing').length} | 
                        <strong> Inventory Parts:</strong> {allParts.filter(p => p.type === 'inventory').length}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600} color="success.contrastText">
                        <strong>Total: ₹{allParts.reduce((total, part) => total + calculatePartFinalPrice(part), 0).toFixed(2)}</strong>
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'center'
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ 
                px: 6, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #303f9f 0%, #7b1fa2 100%)'
                    : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                }
              }}
            >
              {isLoading ? 'Updating...' : 'Update Parts'}
            </Button>
          </Paper>
        </form>
      </Container>

      {/* Add Part Dialog */}
      <Dialog 
        open={openAddPartDialog} 
        onClose={handleCloseAddPartDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: 'background.paper' }
        }}
      >
        <DialogTitle>Add New Part to Inventory</DialogTitle>
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
          
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              fullWidth 
              label="Part Number" 
              name="partNumber"
              value={newPart.partNumber} 
              onChange={handlePartInputChange}
              error={checkDuplicatePartNumber(newPart.partNumber)}
              helperText={checkDuplicatePartNumber(newPart.partNumber) ? "Part number already exists" : ""}
            />
            <TextField 
              fullWidth 
              label="Part Name *" 
              name="partName"
              value={newPart.partName} 
              onChange={handlePartInputChange}
              required
              error={!newPart.partName.trim() && !!partAddError}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Car Name" 
                name="carName"
                value={newPart.carName} 
                onChange={handlePartInputChange}
              />
              <TextField 
                fullWidth 
                label="Model" 
                name="model"
                value={newPart.model} 
                onChange={handlePartInputChange}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Quantity *" 
                name="quantity"
                type="number" 
                value={newPart.quantity} 
                onChange={handlePartInputChange}
                required
                inputProps={{ min: 1 }}
              />
              <TextField 
                fullWidth 
                label="Price Per Unit" 
                name="pricePerUnit"
                type="number" 
                value={newPart.pricePerUnit} 
                onChange={handlePartInputChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
          </Box>

          {/* Tax Section */}
          <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Tax Configuration</Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* SGST Section */}
              <Box sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="sgstEnabled"
                      checked={newPart.sgstEnabled}
                      onChange={handlePartInputChange}
                    />
                  }
                  label="Enable SGST"
                />
                {newPart.sgstEnabled && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      name="sgstPercentage"
                      label="SGST Percentage (%)"
                      type="number"
                      variant="outlined"
                      value={newPart.sgstPercentage}
                      onChange={handlePartInputChange}
                      required={newPart.sgstEnabled}
                      inputProps={{ min: 0, max: 100, step: "0.01" }}
                      fullWidth
                      size="small"
                    />
                    {newPart.pricePerUnit && newPart.quantity && newPart.sgstPercentage && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        SGST Amount: ₹{calculateTaxAmount(newPart.pricePerUnit, newPart.quantity, newPart.sgstPercentage).toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* CGST Section */}
              <Box sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="cgstEnabled"
                      checked={newPart.cgstEnabled}
                      onChange={handlePartInputChange}
                    />
                  }
                  label="Enable CGST"
                />
                {newPart.cgstEnabled && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      name="cgstPercentage"
                      label="CGST Percentage (%)"
                      type="number"
                      variant="outlined"
                      value={newPart.cgstPercentage}
                      onChange={handlePartInputChange}
                      required={newPart.cgstEnabled}
                      inputProps={{ min: 0, max: 100, step: "0.01" }}
                      fullWidth
                      size="small"
                    />
                    {newPart.pricePerUnit && newPart.quantity && newPart.cgstPercentage && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        CGST Amount: ₹{calculateTaxAmount(newPart.pricePerUnit, newPart.quantity, newPart.cgstPercentage).toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Total Tax and Price Display */}
            {newPart.pricePerUnit && newPart.quantity && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="primary">
                      Total Tax: ₹{calculateTotalTaxAmount(
                        newPart.pricePerUnit,
                        newPart.quantity,
                        newPart.sgstEnabled,
                        newPart.sgstPercentage,
                        newPart.cgstEnabled,
                        newPart.cgstPercentage
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {newPart.sgstEnabled && newPart.sgstPercentage && (
                        <>SGST: ₹{calculateTaxAmount(newPart.pricePerUnit, newPart.quantity, newPart.sgstPercentage).toFixed(2)}</>
                      )}
                      {newPart.sgstEnabled && newPart.cgstEnabled && newPart.sgstPercentage && newPart.cgstPercentage && <> + </>}
                      {newPart.cgstEnabled && newPart.cgstPercentage && (
                        <>CGST: ₹{calculateTaxAmount(newPart.pricePerUnit, newPart.quantity, newPart.cgstPercentage).toFixed(2)}</>
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      Total Price: ₹{calculateTotalPrice(
                        newPart.pricePerUnit,
                        newPart.quantity,
                        newPart.sgstEnabled,
                        newPart.sgstPercentage,
                        newPart.cgstEnabled,
                        newPart.cgstPercentage
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Base Price: ₹{(parseFloat(newPart.pricePerUnit) * parseInt(newPart.quantity || 0)).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
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
            disabled={addingPart || checkDuplicatePartNumber(newPart.partNumber)} 
            variant="contained"
            startIcon={addingPart ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {addingPart ? 'Adding...' : 'Add Part'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default WorkInProgress;