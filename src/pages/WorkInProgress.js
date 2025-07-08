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
  Grid,
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
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  MenuItem,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ButtonGroup,
  Tab,
  Tabs,
  TabPanel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Save as SaveIcon,
  ShoppingCart as ShoppingCartIcon,
  Edit as EditIcon,
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

  const [insuranceDetails, setInsuranceDetails] = useState({
    company: '',
    number: '',
    type: '',
    expiry: '',
    regNo: '',
    amount: ''
  });

  // Engineers state - MULTIPLE SELECTION
  const [engineers, setEngineers] = useState([]);
  const [assignedEngineers, setAssignedEngineers] = useState([]); // Changed to array for multiple selection

  // Inventory parts state
  const [inventoryParts, setInventoryParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]); // New state for selected parts

  // COMBINED PARTS STATE - existing + new inventory parts
  const [allParts, setAllParts] = useState([]);
  const [partIdCounter, setPartIdCounter] = useState(1);

  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
  const [formErrors, setFormErrors] = useState({});

  // Parts addition mode
  const [addPartMode, setAddPartMode] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'in_progress', label: 'In Progress', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' },
    { value: 'on_hold', label: 'On Hold', color: 'default' }
  ];


  const handlePartSelection = (newParts, previousParts = []) => {
  try {
    // Create a map to track parts by their ID for easier management
    const partsMap = new Map();
    
    // First, add all previously selected parts to the map
    previousParts.forEach(part => {
      partsMap.set(part._id, { ...part });
    });
    
    // Process the new selection
    newParts.forEach(newPart => {
      const existingPart = partsMap.get(newPart._id);
      
      if (existingPart) {
        // Part already exists, increment quantity by 1
        const currentQuantity = existingPart.selectedQuantity || 1;
        const newQuantity = currentQuantity + 1;
        
        // Check if new quantity exceeds available stock
        const availableQuantity = getAvailableQuantity(newPart._id);
        const maxSelectableQuantity = availableQuantity + currentQuantity;
        
        if (newQuantity > maxSelectableQuantity) {
          setError(`Cannot add more "${newPart.partName}". Maximum available: ${maxSelectableQuantity}, Current: ${currentQuantity}`);
          return;
        }
        
        // Update the quantity
        partsMap.set(newPart._id, {
          ...existingPart,
          selectedQuantity: newQuantity
        });
      } else {
        // New part, check if it has sufficient quantity available
        const availableQuantity = getAvailableQuantity(newPart._id);
        if (availableQuantity < 1) {
          setError(`Part "${newPart.partName}" is out of stock!`);
          return;
        }
        
        // Add new part with initial quantity of 1
        partsMap.set(newPart._id, {
          ...newPart,
          selectedQuantity: 1,
          availableQuantity: availableQuantity
        });
      }
    });
    
    // Convert map back to array
    const updatedParts = Array.from(partsMap.values());
    
    // Update selected parts
    setSelectedParts(updatedParts);
    
    // Clear any previous errors
    if (error) {
      setError(null);
    }
    
  } catch (err) {
    console.error('Error handling part selection:', err);
    setError('Failed to update part selection');
  }
};


// Alternative approach: Modified Autocomplete onChange handler
const handleAutocompleteChange = (event, newValue, reason, details) => {
  if (reason === 'selectOption' && details?.option) {
    const selectedPart = details.option;
    const existingPartIndex = selectedParts.findIndex(part => part._id === selectedPart._id);
    
    if (existingPartIndex !== -1) {
      // Part already exists, increment quantity
      const currentQuantity = selectedParts[existingPartIndex].selectedQuantity || 1;
      const newQuantity = currentQuantity + 1;
      
      // Check availability
      const availableQuantity = getAvailableQuantity(selectedPart._id);
      const maxSelectableQuantity = availableQuantity + currentQuantity;
      
      if (newQuantity > maxSelectableQuantity) {
        setError(`Cannot add more "${selectedPart.partName}". Maximum available: ${maxSelectableQuantity}`);
        return;
      }
      
      // Update quantity
      const updatedParts = [...selectedParts];
      updatedParts[existingPartIndex] = {
        ...updatedParts[existingPartIndex],
        selectedQuantity: newQuantity
      };
      setSelectedParts(updatedParts);
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Increased quantity of "${selectedPart.partName}" to ${newQuantity}`,
        severity: 'success'
      });
    } else {
      // New part selection
      const availableQuantity = getAvailableQuantity(selectedPart._id);
      if (availableQuantity < 1) {
        setError(`Part "${selectedPart.partName}" is out of stock!`);
        return;
      }
      
      const newPart = {
        ...selectedPart,
        selectedQuantity: 1,
        availableQuantity: availableQuantity
      };
      
      setSelectedParts(prev => [...prev, newPart]);
      
      setSnackbar({
        open: true,
        message: `Added "${selectedPart.partName}" to selection`,
        severity: 'success'
      });
    }
  } else if (reason === 'removeOption') {
    // Handle removal normally
    setSelectedParts(newValue);
  }
};

// Updated Autocomplete component with custom onChange
const AutocompleteWithQuantityUpdate = () => {
  return (
    <Autocomplete
      multiple
      fullWidth
      options={inventoryParts.filter(part => getAvailableQuantity(part._id) > 0)}
      getOptionLabel={(option) => 
        `${option.partName} (${option.partNumber || 'N/A'}) - ₹${option.pricePerUnit || 0} | GST: ${option.gstPercentage || option.taxAmount || 0}% | Available: ${getAvailableQuantity(option._id)}`
      }
      value={selectedParts}
      onChange={handleAutocompleteChange}
      // Disable tag removal to force using our custom logic
      disableCloseOnSelect={true}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={`${option.partName} (${option.partNumber || 'N/A'}) - Qty: ${option.selectedQuantity || 1} @ ₹${option.pricePerUnit || 0}`}
            {...getTagProps({ index })}
            key={option._id}
            onDelete={() => {
              // Custom delete handler
              const updatedParts = selectedParts.filter((_, idx) => idx !== index);
              setSelectedParts(updatedParts);
            }}
          />
        ))
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={500}>
              {option.partName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Part : {option.partNumber || 'N/A'} | 
              Price: ₹{option.pricePerUnit || 0} | 
              GST: {option.gstPercentage || option.taxAmount || 0}| 
              Available: {getAvailableQuantity(option._id)} | 
              {option.carName} - {option.model}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select parts needed (selecting same part will increase quantity)"
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
      noOptionsText="No parts available in stock"
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
  );
};

// RECOMMENDED: Replace your existing Autocomplete with this implementation
const ImprovedPartsSelection = () => {
  const [selectedPart, setSelectedPart] = useState(null);
  
  const handleAddPart = () => {
    if (!selectedPart) return;
    
    const existingPartIndex = selectedParts.findIndex(part => part._id === selectedPart._id);
    
    if (existingPartIndex !== -1) {
      // Part exists, increment quantity
      const currentQuantity = selectedParts[existingPartIndex].selectedQuantity || 1;
      const newQuantity = currentQuantity + 1;
      
      // Check availability
      const availableQuantity = getAvailableQuantity(selectedPart._id);
      const maxSelectableQuantity = availableQuantity + currentQuantity;
      
      if (newQuantity > maxSelectableQuantity) {
        setError(`Cannot add more "${selectedPart.partName}". Maximum available: ${maxSelectableQuantity}`);
        return;
      }
      
      // Update quantity
      const updatedParts = [...selectedParts];
      updatedParts[existingPartIndex] = {
        ...updatedParts[existingPartIndex],
        selectedQuantity: newQuantity
      };
      setSelectedParts(updatedParts);
      
      setSnackbar({
        open: true,
        message: `Increased "${selectedPart.partName}" quantity to ${newQuantity}`,
        severity: 'success'
      });
    } else {
      // Add new part
      const availableQuantity = getAvailableQuantity(selectedPart._id);
      if (availableQuantity < 1) {
        setError(`Part "${selectedPart.partName}" is out of stock!`);
        return;
      }
      
      const newPart = {
        ...selectedPart,
        selectedQuantity: 1,
        availableQuantity: availableQuantity
      };
      
      setSelectedParts(prev => [...prev, newPart]);
      
      setSnackbar({
        open: true,
        message: `Added "${selectedPart.partName}" to selection`,
        severity: 'success'
      });
    }
    
    // Clear selection
    setSelectedPart(null);
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Select Parts from Inventory (Optional)
      </Typography>
      
      {isLoadingInventory ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
          <CircularProgress size={20} />
          <Typography sx={{ ml: 2 }}>Loading parts...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <Autocomplete
            fullWidth
            options={inventoryParts.filter(part => getAvailableQuantity(part._id) > 0)}
            getOptionLabel={(option) => 
              `${option.partName} (${option.partNumber || 'N/A'}) - Available: ${getAvailableQuantity(option._id)}`
            }
            value={selectedPart}
            onChange={(event, newValue) => setSelectedPart(newValue)}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" fontWeight={500}>
                    {option.partName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Part: {option.partNumber || 'N/A'} | Price: ₹{option.pricePerUnit || 0} | Available: {getAvailableQuantity(option._id)}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search and select a part (can select same part multiple times)"
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
          <Button
            variant="contained"
            onClick={handleAddPart}
            disabled={!selectedPart}
            startIcon={<AddIcon />}
            sx={{ minWidth: 100, height: 56 }}
          >
            Add
          </Button>
        </Box>
      )}
      
      {/* Display message about how to use */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💡 Tip: Select the same part multiple times to increase quantity, or use the quantity controls below
      </Typography>
    </Box>
  );
};

  const handlePartRemoval = (partIndex) => {
    try {
      // Remove part from selection (local state only)
      const updatedParts = selectedParts.filter((_, idx) => idx !== partIndex);
      setSelectedParts(updatedParts);
    } catch (err) {
      console.error('Error removing part:', err);
      setError(`Failed to remove part`);
    }
  };

  const handlePartQuantityChange = (partIndex, newQuantity, oldQuantity) => {
    const part = selectedParts[partIndex];
    if (!part) return;

    try {
      // Get available quantity considering all current selections
      const availableQuantity = getAvailableQuantity(part._id);
      const currentlySelected = part.selectedQuantity || 1;
      const maxSelectableQuantity = availableQuantity + currentlySelected;

      // Validate maximum quantity
      if (newQuantity > maxSelectableQuantity) {
        setError(`Cannot select more than ${maxSelectableQuantity} units of "${part.partName}". Available: ${availableQuantity}, Currently Selected: ${currentlySelected}`);
        return;
      }

      if (newQuantity < 1) {
        setError('Quantity must be at least 1');
        return;
      }

      // Update the part quantity in the selection (local state only)
      const updatedParts = selectedParts.map((p, idx) => 
        idx === partIndex 
          ? { ...p, selectedQuantity: newQuantity }
          : p
      );
      
      setSelectedParts(updatedParts);

      // Clear any previous errors
      if (error && error.includes(part.partName)) {
        setError(null);
      }

    } catch (err) {
      console.error('Error updating part quantity:', err);
      setError(`Failed to update quantity for "${part.partName}"`);
    }
  };

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

    // Calculate total selected quantity from selectedParts
    let totalSelected = 0;
    selectedParts.forEach(part => {
      if (part._id === inventoryPartId) {
        totalSelected += part.selectedQuantity || 1;
      }
    });

    // Also consider allParts for inventory parts
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

  const calculatePartFinalPrice = (part) => {
    const unitPrice = parseFloat(part.pricePerUnit);
    const quantity = parseInt(part.selectedQuantity || 1);
    const gstPercentage = parseFloat(part.gstPercentage) || 0;

    const total = unitPrice * quantity;
    const gstAmount = (total * gstPercentage) / 100;
    return total + gstAmount;
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

        // Populate insurance details
        setInsuranceDetails({
          company: data.insuranceProvider || '',
          number: data.policyNumber || '',
          type: data.type || '',
          expiry: data.expiryDate ? data.expiryDate.split('T')[0] : '',
          regNo: data.registrationNumber || '',
          amount: data.excessAmount?.toString() || ''
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
      const newSelectedParts = selectedParts.filter(part => part.partName && part.partName.trim() !== '');

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

      // Add newly selected parts
      for (const part of newSelectedParts) {
        const selectedQuantity = part.selectedQuantity || 1;

        allPartsUsed.push({
          partId: part._id,
          partName: part.partName,
          partNumber: part.partNumber || '',
          quantity: selectedQuantity,
          pricePerUnit: part.pricePerUnit || 0,
          gstPercentage: part.gstPercentage || part.taxAmount || 0,
          totalPrice: calculatePartFinalPrice(part),
          carName: part.carName || '',
          model: part.model || ''
        });

        // Update inventory quantity
        const currentPart = inventoryParts.find(p => p._id === part._id);
        if (currentPart) {
          const newQuantity = currentPart.quantity - selectedQuantity;
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for "${part.partName}". Required: ${selectedQuantity}, Available: ${currentPart.quantity}`);
          }
          await updatePartQuantity(part._id, newQuantity);
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

      setTimeout(() => {
        navigate(`/Quality-Check/${id}`);
      }, 1500);

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

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      default: return <TimerIcon />;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (fetchLoading) {
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
      overflow: 'auto',
      pt: 3
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: '#1976d2',
            borderRadius: 3,
            border: '1px solid #e2e8f0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate(`/assign-engineer/${id}`)}
                sx={{
                  mr: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight={700} color="white">
                  Work In Progress
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mt: 0.5 }}>
                  Update work status and manage parts for job card
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={getStatusIcon(status)}
              label={statusOptions.find(opt => opt.value === status)?.label || status}
              color={getStatusColor(status)}
              size="large"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12}>
              {/* Vehicle & Customer Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Car Details */}
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Box sx={{
                      background: '#1976d2',
                      color: 'white',
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                        <CarIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Vehicle Details
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <TextField
                        fullWidth
                        label="Company"
                        variant="outlined"
                        value={carDetails.company}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Model"
                        variant="outlined"
                        value={carDetails.model}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Registration Number"
                        variant="outlined"
                        value={carDetails.carNo}
                        InputProps={{ readOnly: true }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Customer Details */}
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Box sx={{
                      background: '#1976d2',
                      color: 'white',
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Customer Details
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <TextField
                        fullWidth
                        label="Customer Name"
                        variant="outlined"
                        value={customerDetails.name}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Contact Number"
                        variant="outlined"
                        value={customerDetails.contactNo}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Email Address"
                        variant="outlined"
                        value={customerDetails.email}
                        InputProps={{ readOnly: true }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Assigned Engineers Section - MULTIPLE SELECTION */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}
              >
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

              {/* PARTS SECTION */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}
              >
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
                  {/* Parts Selection */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Select Parts from Inventory (Optional)
                    </Typography>
                    
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
                        options={inventoryParts.filter(part => getAvailableQuantity(part._id) > 0)}
                        getOptionLabel={(option) => 
                          `${option.partName} (${option.partNumber || 'N/A'}) - ₹${option.pricePerUnit || 0} | GST: ${option.gstPercentage || option.taxAmount || 0}% | Available: ${getAvailableQuantity(option._id)}`
                        }
                        value={selectedParts}
                        onChange={(event, newValue) => {
                          handlePartSelection(newValue, selectedParts);
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={`${option.partName} (${option.partNumber || 'N/A'}) - Qty: ${option.selectedQuantity || 1} @ ₹${option.pricePerUnit || 0}`}
                              {...getTagProps({ index })}
                              key={option._id}
                            />
                          ))
                        }
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="body2" fontWeight={500}>
                                {option.partName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Part : {option.partNumber || 'N/A'} | 
                                Price: ₹{option.pricePerUnit || 0} | 
                                GST: {option.gstPercentage || option.taxAmount || 0}| 
                                Available: {getAvailableQuantity(option._id)} | 
                                {option.carName} - {option.model}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select parts needed"
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
                        noOptionsText="No parts available in stock"
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
                    )}

                    {/* Selected Parts with Enhanced Quantity Management */}
                    {selectedParts.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Selected Parts with Details:
                        </Typography>
                        <List dense>
                          {selectedParts.map((part, partIndex) => {
                            const selectedQuantity = part.selectedQuantity || 1;
                            const quantity= part.quantity;
                            const unitPrice = part.pricePerUnit || 0;
                            const gstPercentage = part.taxAmount || 0;
                            const totalTax= (gstPercentage * selectedQuantity)/quantity;
                            const totalPrice = unitPrice * selectedQuantity;
                            const gstAmount = (totalPrice * gstPercentage) / 100;
                            const finalPrice = totalPrice + totalTax;
                            
                            // Get available quantity considering all current selections
                            const availableQuantity = getAvailableQuantity(part._id);
                            
                            // Calculate the maximum quantity user can select
                            const maxSelectableQuantity = availableQuantity + selectedQuantity;
                            const isMaxQuantityReached = selectedQuantity >= maxSelectableQuantity;

                            return (
                              <ListItem 
                                key={part._id} 
                                sx={{ 
                                  border: `1px solid ${theme.palette.divider}`, 
                                  borderRadius: 1, 
                                  mb: 1,
                                  py: 1,
                                  flexDirection: 'column',
                                  alignItems: 'stretch',
                                  bgcolor: 'background.paper'
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={500}>
                                      {part.partName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      Part #: {part.partNumber || 'N/A'} | {part.carName} - {part.model}
                                    </Typography>
                                    <Typography variant="caption" color={availableQuantity > 0 ? 'success.main' : 'error.main'} sx={{ display: 'block' }}>
                                      Available Stock: {availableQuantity}
                                    </Typography>
                                    <Typography variant="caption" color="info.main" sx={{ display: 'block' }}>
                                      Max Selectable: {maxSelectableQuantity} | Selected: {selectedQuantity}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          const newQuantity = selectedQuantity - 1;
                                          if (newQuantity >= 1) {
                                            handlePartQuantityChange(partIndex, newQuantity, selectedQuantity);
                                          }
                                        }}
                                        disabled={selectedQuantity <= 1}
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
                                        label="Qty"
                                        value={selectedQuantity}
                                        onChange={(e) => {
                                          const newQuantity = parseInt(e.target.value) || 1;
                                          const oldQuantity = selectedQuantity;
                                          
                                          // Validate quantity limits
                                          if (newQuantity < 1) {
                                            return;
                                          }
                                          
                                          if (newQuantity > maxSelectableQuantity) {
                                            setError(`Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`);
                                            return;
                                          }

                                          handlePartQuantityChange(partIndex, newQuantity, oldQuantity);
                                        }}
                                        inputProps={{ 
                                          min: 1, 
                                          max: maxSelectableQuantity,
                                          style: { width: '50px', textAlign: 'center' },
                                          readOnly: isMaxQuantityReached && selectedQuantity === maxSelectableQuantity
                                        }}
                                        sx={{ 
                                          width: '70px',
                                          '& .MuiInputBase-input': {
                                            textAlign: 'center',
                                            fontSize: '0.875rem'
                                          }
                                        }}
                                        error={availableQuantity === 0}
                                        disabled={maxSelectableQuantity === 0}
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          const newQuantity = selectedQuantity + 1;
                                          if (newQuantity <= maxSelectableQuantity) {
                                            handlePartQuantityChange(partIndex, newQuantity, selectedQuantity);
                                          } else {
                                            setError(`Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`);
                                          }
                                        }}
                                        disabled={selectedQuantity >= maxSelectableQuantity || availableQuantity === 0}
                                        sx={{ 
                                          minWidth: '24px', 
                                          width: '24px', 
                                          height: '24px',
                                          border: `1px solid ${selectedQuantity >= maxSelectableQuantity ? theme.palette.error.main : theme.palette.divider}`,
                                          color: selectedQuantity >= maxSelectableQuantity ? 'error.main' : 'inherit'
                                        }}
                                      >
                                        <Typography variant="caption" fontWeight="bold">+</Typography>
                                      </IconButton>
                                    </Box>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handlePartRemoval(partIndex)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                                {/* Price Details */}
                                <Box sx={{ 
                                  mt: 1, 
                                  p: 1, 
                                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)', 
                                  borderRadius: 1 
                                }}>
                                  <Grid container spacing={1} alignItems="center">
                                    <Grid item xs={4}>
                                      <Typography variant="caption" color="text.secondary">
                                        Price/Unit: ₹{unitPrice.toFixed(2)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                      <Typography variant="caption" color="text.secondary">
                                        GST: {gstPercentage}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={5}>
                                      <Typography variant="caption" fontWeight={600} color="primary">
                                        Total: ₹{finalPrice.toFixed(2)}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </ListItem>
                            );
                          })}
                        </List>
                        {/* Total Summary */}
                        {(() => {
                          const grandTotal = selectedParts.reduce((total, part) => {
                            const selectedQuantity = part.selectedQuantity || 1;
                            const unitPrice = part.pricePerUnit || 0;
                            const gstPercentage = part.gstPercentage || part.taxAmount || 0;
                            const totalPrice = unitPrice * selectedQuantity;
                            const gstAmount = (totalPrice * gstPercentage) / 100;
                            return total + totalPrice + gstAmount;
                          }, 0);
                          return (
                            // <Box sx={{ mt: 1, p: 1, backgroundColor: 'primary.main', borderRadius: 1 }}>
                            //   <Typography variant="subtitle2" fontWeight={600} color="primary.contrastText">
                            //     Selected Parts Total: ₹{grandTotal.toFixed(2)}
                            //   </Typography>
                            // </Box>
                            <>
                            </>
                          );
                        })()}
                      </Box>
                    )}
                  </Box>

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
                                    GST: {option.taxAmount || 0}% |
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
                              {/* <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell> */}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {allParts.map((part) => (
                              <TableRow key={part.id} >
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
                                  {part.type === 'existing' ? (
                                    <Typography variant="body2" color="text.secondary">
                                      Quantity: {part.selectedQuantity || 1}
                                    </Typography>
                                  ) : (
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
                                  )}
                                </TableCell>

                                <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                      {part.totalPrice}
                                    </Typography>
                                </TableCell>

                                {/* <TableCell>
                                  <IconButton
                                    color="error"
                                    onClick={() => removePartFromList(part.id)}
                                    disabled={part.type === 'existing'}
                                    sx={{
                                      '&:hover': {
                                        bgcolor: part.type === 'existing' ? 'transparent' : 'rgba(239, 68, 68, 0.1)'
                                      }
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell> */}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {/* Parts Total */}
                    {/* {allParts.length > 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'success.main', borderRadius: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="success.contrastText">
                              <strong>Existing Parts:</strong> {allParts.filter(p => p.type === 'existing').length}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="success.contrastText">
                              <strong>Inventory Parts:</strong> {allParts.filter(p => p.type === 'inventory').length}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" fontWeight={600} color="success.contrastText">
                              <strong>Total: ₹{allParts.reduce((total, part) => total + calculatePartFinalPrice(part), 0).toFixed(2)}</strong>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )} */}
                  </Box>
                </CardContent>
              </Card>

              {/* Work Details */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}
              >
                <Box sx={{
                  background: '#1976d2',
                  color: 'white',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <CommentIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Work Details
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Labor Hours"
                        type="number"
                        variant="outlined"
                        value={laborHours}
                        onChange={(e) => setLaborHours(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TimerIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                          labelId="status-label"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
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
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Engineer Remarks"
                        placeholder="Enter detailed remarks about the work performed..."
                        variant="outlined"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Sidebar */}
            <Grid item xs={12} lg={12}>
              {/* Insurance Details - Responsive Version */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  color: 'white',
                  p: { xs: 2, sm: 2.5 },
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Insurance Details
                  </Typography>
                </Box>

                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
  <Grid container spacing={2}>
    {/* Insurance Company */}
    <Grid item xs={12} sm={6}>
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e2e8f0'}`,
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SecurityIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Insurance Company
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {insuranceDetails.company || 'Not specified'}
        </Typography>
      </Box>
    </Grid>

    {/* Policy Number */}
    <Grid item xs={12} sm={6}>
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e2e8f0'}`,
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AssignmentIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Policy Number
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {insuranceDetails.number || 'Not specified'}
        </Typography>
      </Box>
    </Grid>

    {/* Policy Type */}
    <Grid item xs={12} sm={6}>
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e2e8f0'}`,
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <InventoryIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Policy Type
          </Typography>
        </Box>
        {insuranceDetails.type ? (
          <Chip
            label={insuranceDetails.type}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        ) : (
          <Typography variant="body1" fontWeight={600} color="text.primary">
            Not specified
          </Typography>
        )}
      </Box>
    </Grid>

    {/* Expiry Date */}
    <Grid item xs={12} sm={6}>
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e2e8f0'}`,
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TimerIcon sx={{ fontSize: 18, color: theme.palette.warning.main, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Expiry Date
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {insuranceDetails.expiry ? new Date(insuranceDetails.expiry).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'Not specified'}
        </Typography>
        {insuranceDetails.expiry && (
          <Typography variant="caption" color={
            new Date(insuranceDetails.expiry) < new Date()
              ? 'error.main'
              : new Date(insuranceDetails.expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? 'warning.main'
                : 'success.main'
          }>
            {new Date(insuranceDetails.expiry) < new Date()
              ? '⚠ Expired'
              : new Date(insuranceDetails.expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? '⚠ Expires Soon'
                : '✅ Valid'}
          </Typography>
        )}
      </Box>
    </Grid>
  </Grid>

  {/* Summary Section */}
  {(insuranceDetails.company || insuranceDetails.number) && (
    <Box sx={{
      mt: 3,
      p: 2,
      bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#eff6ff',
      borderRadius: 2,
      border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#bfdbfe'}`
    }}>
      <Typography variant="body2" color="primary" fontWeight={600} gutterBottom>
        📦 Insurance Summary
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {insuranceDetails.company && (
          <Chip
            label={`Company: ${insuranceDetails.company}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
        {insuranceDetails.type && (
          <Chip
            label={`Type: ${insuranceDetails.type}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
        {insuranceDetails.expiry && (
          <Chip
            label={`Expires: ${new Date(insuranceDetails.expiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
            size="small"
            variant="outlined"
            color={new Date(insuranceDetails.expiry) < new Date() ? 'error' : 'primary'}
          />
        )}
      </Box>
    </Box>
  )}
</CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 3,
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
                background: '#1565c0',
                '&:hover': {
                  background: '#1565c0',
                }
              }}
            >
              {isLoading ? 'Updating...' : 'Submit Work Progress'}
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

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Part Number"
                name="partNumber"
                value={newPart.partNumber}
                onChange={handlePartInputChange}
                error={checkDuplicatePartNumber(newPart.partNumber)}
                helperText={checkDuplicatePartNumber(newPart.partNumber) ? "Part number already exists" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Part Name *"
                name="partName"
                value={newPart.partName}
                onChange={handlePartInputChange}
                required
                error={!newPart.partName.trim() && !!partAddError}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Car Name"
                name="carName"
                value={newPart.carName}
                onChange={handlePartInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                name="model"
                value={newPart.model}
                onChange={handlePartInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price Per Unit"
                name="pricePerUnit"
                type="number"
                value={newPart.pricePerUnit}
                onChange={handlePartInputChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>

          {/* Tax Section */}
          <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Tax Configuration</Typography>

            <Grid container spacing={2}>
              {/* SGST Section */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
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
              </Grid>

              {/* CGST Section */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
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
              </Grid>
            </Grid>

            {/* Total Tax and Price Display */}
            {newPart.pricePerUnit && newPart.quantity && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                </Grid>
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

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            maxWidth: '400px'
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

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