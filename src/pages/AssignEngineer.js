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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useTheme,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  AttachMoney as MoneyIcon,
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

  const jobCardId = location.state?.jobCardId;
  const garageId = localStorage.getItem('garageId');
  const garageToken = localStorage.getItem('token');

  // Main State
  const [engineers, setEngineers] = useState([]);
  const [assignment, setAssignment] = useState({
    engineer: null,
    parts: [],
    priority: 'medium',
    estimatedDuration: '',
    notes: ''
  });
  const [inventoryParts, setInventoryParts] = useState([]);
  const [jobCardIds, setJobCardIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedParts, setSelectedParts] = useState([]); // For Autocomplete selection
  const [showInventoryConfirmation, setShowInventoryConfirmation] = useState(false);



  // Clean up duplicate parts whenever assignment.parts changes
  useEffect(() => {
    if (assignment.parts.length > 0) {
      removeDuplicateParts();
    }
  }, [assignment.parts]);

  // Enhanced Add Part Dialog States - Based on InventoryManagement
  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({
    garageId,
    name: "abc", // Default name as per InventoryManagement
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

  const [fetchingData, setFetchingData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);


  const updateJobCardWithParts = async (partsUsed) => {
    try {
      // Get existing parts from job card data if available
      let existingParts = [];
      if (jobCardDataTemp && jobCardDataTemp.partsUsed) {
        existingParts = jobCardDataTemp.partsUsed.map(part => ({
          partName: part.partName,
          quantity: part.quantity,
          pricePerPiece: part.pricePerPiece,
          totalPrice: part.totalPrice,
          _id: part._id
        }));
      }

      // Combine existing parts with new parts
      const allParts = [...existingParts];

      // Add new parts, avoiding duplicates by partName
      partsUsed.forEach(newPart => {
        const existingIndex = allParts.findIndex(p => p.partName === newPart.partName);
        if (existingIndex !== -1) {
          // Update existing part with new data
          allParts[existingIndex] = {
            ...allParts[existingIndex],
            quantity: newPart.selectedQuantity || newPart.quantity || 1,
            pricePerPiece: newPart.sellingPrice || newPart.pricePerUnit || 0,
            totalPrice: (newPart.sellingPrice || newPart.pricePerUnit || 0) * (newPart.selectedQuantity || newPart.quantity || 1)
          };
        } else {
          // Add new part
          const quantity = newPart.selectedQuantity || newPart.quantity || 1;
          const pricePerPiece = newPart.sellingPrice || newPart.pricePerUnit || 0;
          const totalPrice = pricePerPiece * quantity;

          allParts.push({
            partName: newPart.partName,
            quantity: quantity,
            pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
            totalPrice: parseFloat(totalPrice.toFixed(2))
          });
        }
      });

      const formattedParts = allParts.map(part => ({
        partName: part.partName,
        partNumber: part.partNumber || '',
        hsnNumber: part.hsnNumber || '',
        quantity: Number(part.quantity || 1),
        pricePerPiece: parseFloat((part.pricePerPiece || 0).toFixed(2)),
        totalPrice: parseFloat((part.totalPrice || 0).toFixed(2)),
        igst: parseFloat((part.igst || 0).toFixed(2)),
        cgstSgst: parseFloat((part.cgstSgst || 0).toFixed(2))
      }));

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



  // Function to handle part removal (same pattern as WorkInProgress)
  const handlePartRemoval = async (partIndex) => {
    try {
      const updatedParts = selectedParts.filter((_, idx) => idx !== partIndex);
      setSelectedParts(updatedParts);
      
      // Update assignment with new parts (excluding pre-loaded parts)
      const preLoadedParts = assignment.parts.filter(part => part.isPreLoaded);
      const userSelectedParts = updatedParts.map(part => ({
        ...part,
        isPreLoaded: false
      }));
      
      // Ensure no duplicates by creating a map of parts by ID
      const partsMapForAssignment = new Map();
      
      // Add pre-loaded parts first
      preLoadedParts.forEach(part => {
        partsMapForAssignment.set(part._id, part);
      });
      
      // Add user-selected parts, overwriting any duplicates
      userSelectedParts.forEach(part => {
        partsMapForAssignment.set(part._id, part);
      });
      
      const finalParts = Array.from(partsMapForAssignment.values());
      
      setAssignment(prev => ({
        ...prev,
        parts: finalParts
      }));
    } catch (err) {
      console.error("Error removing part:", err);
      setError(`Failed to remove part`);
    }
  };

  // Function to handle part quantity change (same pattern as WorkInProgress)
  const handlePartQuantityChange = async (partIndex, newQuantity, oldQuantity) => {
    const part = selectedParts[partIndex];
    if (!part) return;

    try {
      const availableQuantity = getAvailableQuantity(part._id);
      const currentlySelected = part.selectedQuantity || 1;
      const maxSelectableQuantity = availableQuantity + currentlySelected;

      if (newQuantity > maxSelectableQuantity) {
        setError(
          `Cannot select more than ${maxSelectableQuantity} units of "${part.partName}". Available: ${availableQuantity}, Currently Selected: ${currentlySelected}`
        );
        return;
      }
      if (newQuantity < 1) {
        setError("Quantity must be at least 1");
        return;
      }

      const updatedParts = selectedParts.map((p, idx) =>
        idx === partIndex ? { ...p, selectedQuantity: newQuantity } : p
      );
      setSelectedParts(updatedParts);
      
      // Update assignment with new parts (excluding pre-loaded parts)
      const preLoadedParts = assignment.parts.filter(part => part.isPreLoaded);
      const userSelectedParts = updatedParts.map(part => ({
        ...part,
        isPreLoaded: false
      }));
      
      // Ensure no duplicates by creating a map of parts by ID
      const partsMapForAssignment = new Map();
      
      // Add pre-loaded parts first
      preLoadedParts.forEach(part => {
        partsMapForAssignment.set(part._id, part);
      });
      
      // Add user-selected parts, overwriting any duplicates
      userSelectedParts.forEach(part => {
        partsMapForAssignment.set(part._id, part);
      });
      
      const finalParts = Array.from(partsMapForAssignment.values());
      
      setAssignment(prev => ({
        ...prev,
        parts: finalParts
      }));
      
      if (error && error.includes(part.partName)) {
        setError(null);
      }
    } catch (err) {
      console.error("Error updating part quantity:", err);
      setError(`Failed to update quantity for "${part.partName}"`);
    }
  };

  // Snackbar notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // State to store job card data temporarily until engineers and parts are loaded
  const [jobCardDataTemp, setJobCardDataTemp] = useState(null);

  // Tax calculation functions based on InventoryManagement
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

  // Check if part number already exists
  const checkDuplicatePartNumber = (partNumber, excludeId = null) => {
    return inventoryParts.some(item =>
      item.partNumber === partNumber &&
      (excludeId ? (item._id || item.id) !== excludeId : true)
    );
  };

  // Debug function to check inventory status (only call when needed)
 

  // Utility API Call with Authorization
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

  // Fetch Inventory Parts
  const fetchInventoryParts = useCallback(async () => {
    if (!garageId) {
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
  }, [garageId, apiCall]);



  // Helper function to get available quantity considering current selection
  const getAvailableQuantity = (partId) => {
    const originalPart = inventoryParts.find(p => p._id === partId);
    if (!originalPart) {
      return 0;
    }

    let totalSelected = 0;
    assignment.parts.forEach(part => {
      if (part._id === partId) {
        totalSelected += part.selectedQuantity || 1;
      }
    });

    const available = Math.max(0, originalPart.quantity - totalSelected);
    return available;
  };

  // Update Part Quantity using PUT API, DELETE only when qty = 0
  const updatePartQuantity = useCallback(async (partId, newQuantity) => {
    try {

      if (newQuantity === 0) {
        // When quantity reaches 0, use DELETE API
        await apiCall(`/garage/inventory/delete/${partId}`, {
          method: 'DELETE'
        });
      } else {
        // Use PUT API to update quantity
        await apiCall(`/garage/inventory/update/${partId}`, {
          method: 'PUT',
          data: { quantity: newQuantity }
        });
      }

      // Refresh inventory after updating
      await fetchInventoryParts();

    } catch (err) {
      console.error(`Failed to update quantity for part ${partId}:`, err);
      throw new Error(`Failed to update part quantity: ${err.response?.data?.message || err.message}`);
    }
  }, [apiCall, fetchInventoryParts]);



  // Initialize job card IDs
  useEffect(() => {
    const initialJobCardIds = [];

    if (id) {
      initialJobCardIds.push(id);
    }

    if (jobCardId && jobCardId !== id) {
      initialJobCardIds.push(jobCardId);
    }

    setJobCardIds(initialJobCardIds);
  }, [id, jobCardId]);

  // Fetch Engineers
  const fetchEngineers = useCallback(async () => {
    if (!garageId) {
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
  }, [garageId, apiCall]);

  // Initialize data
  useEffect(() => {
    fetchInventoryParts();
    fetchEngineers();
  }, [fetchInventoryParts, fetchEngineers]);

  // Set assignments after engineers and inventory are loaded
  useEffect(() => {
    if (jobCardDataTemp && engineers.length > 0 && inventoryParts.length > 0 && !isLoading && !isLoadingInventory) {

      // Convert partsUsed from job card to format expected by the form
      let formattedParts = [];
      if (jobCardDataTemp.partsUsed && jobCardDataTemp.partsUsed.length > 0) {
        console.log('Processing partsUsed from job card:', jobCardDataTemp.partsUsed);

        const validParts = jobCardDataTemp.partsUsed.filter(usedPart => usedPart && (usedPart.partName || usedPart._id));
        console.log('Valid parts after filtering:', validParts);

        formattedParts = validParts.map(usedPart => {
          // Find the part in inventory to get full details
          const inventoryPart = inventoryParts.find(invPart =>
            invPart.partName === usedPart.partName ||
            invPart._id === usedPart.partId ||
            invPart._id === usedPart._id
          );

          if (inventoryPart) {
            return {
              ...inventoryPart,
              selectedQuantity: usedPart.quantity || 1,
              availableQuantity: inventoryPart.quantity,
              // Ensure sellingPrice and taxAmount are properly set
              sellingPrice: inventoryPart.sellingPrice || inventoryPart.pricePerUnit || 0,
              taxAmount: inventoryPart.taxAmount || inventoryPart.gstPercentage || 0,
              // Mark as pre-loaded from job card
              isPreLoaded: true,
              // Preserve original values from job card
              originalQuantity: usedPart.quantity || 1,
              originalPricePerPiece: usedPart.pricePerPiece || 0,
              originalTotalPrice: usedPart.totalPrice || 0
            };
          } else {
            // If part not found in inventory, create a part object using job card data
            const pricePerPiece = usedPart.pricePerPiece || 0;
            const sellingPrice = pricePerPiece > 0 ? pricePerPiece : 100;
            const taxRate = 0;

            return {
              _id: usedPart._id || `mock-${Date.now()}-${usedPart.partName || 'unknown'}`,
              partName: usedPart.partName || 'Unknown Part',
              partNumber: usedPart.partNumber || '',
              quantity: 0, // No stock available in inventory
              selectedQuantity: usedPart.quantity || 1,
              sellingPrice: sellingPrice,
              pricePerUnit: sellingPrice,
              taxAmount: taxRate,
              gstPercentage: taxRate,
              carName: usedPart.carName || '',
              model: usedPart.model || '',
              availableQuantity: 0,
              // Mark as pre-loaded from job card
              isPreLoaded: true,
              // Preserve original values from job card
              originalQuantity: usedPart.quantity || 1,
              originalPricePerPiece: usedPart.pricePerPiece || 0,
              originalTotalPrice: usedPart.totalPrice || 0
            };
          }
        });
      }

      // Set engineer if exists, otherwise leave as null
      let assignedEngineer = null;
      if (jobCardDataTemp.engineerId && jobCardDataTemp.engineerId.length > 0) {
        assignedEngineer = jobCardDataTemp.engineerId[0]; // Get first engineer
        // Find the full engineer object from the engineers list
        const fullEngineerData = engineers.find(eng => eng._id === assignedEngineer._id);
        if (fullEngineerData) {
          assignedEngineer = fullEngineerData;
        }
      }

      // Update the first assignment with engineer and parts
      const newAssignment = {
        id: Date.now(),
        engineer: assignedEngineer,
        parts: formattedParts,
        priority: 'medium',
        estimatedDuration: jobCardDataTemp.laborHours ? `${jobCardDataTemp.laborHours} hours` : '',
        notes: jobCardDataTemp.engineerRemarks || ''
      };

      setAssignment(newAssignment);

      // Initialize selectedParts with user-selected parts (non-pre-loaded)
      const userSelectedParts = formattedParts.filter(part => !part.isPreLoaded);
      setSelectedParts(userSelectedParts);

      // Clear temp data
      setJobCardDataTemp(null);

      setSnackbar({
        open: true,
        message: `✅ Job card data populated! ${assignedEngineer ? `Engineer: ${assignedEngineer.name || assignedEngineer.email || 'Unknown Engineer'}, ` : ''}Parts: ${formattedParts.length} items`,
        severity: 'success'
      });
    }
  }, [jobCardDataTemp, engineers, inventoryParts, isLoading, isLoadingInventory]);

  // Updated useEffect for fetching job card data with proper job details parsing
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
              Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
            }
          }
        );

        const jobCardData = response.data;

        // Job details parsing removed - no longer needed

        // Store job card data temporarily to be processed when engineers and parts are loaded
        setJobCardDataTemp(jobCardData);

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










  // Function to handle part selection using Autocomplete (same pattern as WorkInProgress)
  const handlePartSelection = async (newParts, previousParts = []) => {
    try {
      const partsMap = new Map();
      previousParts.forEach((part) => {
        partsMap.set(part._id, { ...part });
      });

      newParts.forEach((newPart) => {
        const existingPart = partsMap.get(newPart._id);
        if (existingPart) {
          const currentQuantity = existingPart.selectedQuantity || 1;
          const newQuantity = currentQuantity + 1;
          const availableQuantity = getAvailableQuantity(newPart._id);
          const maxSelectableQuantity = availableQuantity + currentQuantity;
          if (newQuantity > maxSelectableQuantity) {
            setError(
              `Cannot add more "${newPart.partName}". Maximum available: ${maxSelectableQuantity}, Current: ${currentQuantity}`
            );
            return;
          }
          partsMap.set(newPart._id, {
            ...existingPart,
            selectedQuantity: newQuantity,
          });
        } else {
          const availableQuantity = getAvailableQuantity(newPart._id);
          if (availableQuantity < 1) {
            setError(`Part "${newPart.partName}" is out of stock!`);
            return;
          }
          partsMap.set(newPart._id, {
            ...newPart,
            selectedQuantity: 1,
            availableQuantity: availableQuantity,
          });
        }
      });

      const updatedParts = Array.from(partsMap.values());
      setSelectedParts(updatedParts);
      
      // Update assignment with new parts (excluding pre-loaded parts)
      const preLoadedParts = assignment.parts.filter(part => part.isPreLoaded);
      const userSelectedParts = updatedParts.map(part => ({
        ...part,
        isPreLoaded: false
      }));
      
      // Ensure no duplicates by creating a map of parts by ID
      const partsMapForAssignment = new Map();
      
      // Add pre-loaded parts first
      preLoadedParts.forEach(part => {
        partsMapForAssignment.set(part._id, part);
      });
      
      // Add user-selected parts, overwriting any duplicates
      userSelectedParts.forEach(part => {
        partsMapForAssignment.set(part._id, part);
      });
      
      const finalParts = Array.from(partsMapForAssignment.values());
      
      setAssignment(prev => ({
        ...prev,
        parts: finalParts
      }));
      
      if (error) setError(null);
    } catch (err) {
      console.error("Error handling part selection:", err);
      setError("Failed to update part selection");
    }
  };





  // Function to remove duplicate parts from assignment
  const removeDuplicateParts = () => {
    const uniqueParts = [];
    const seenIds = new Set();
    
    console.log('Checking for duplicates in assignment.parts:', assignment.parts.length, 'parts');
    
    assignment.parts.forEach(part => {
      if (!seenIds.has(part._id)) {
        seenIds.add(part._id);
        uniqueParts.push(part);
      } else {
        console.log('Found duplicate part:', part.partName, 'with ID:', part._id, 'isPreLoaded:', part.isPreLoaded);
      }
    });
    
    if (uniqueParts.length !== assignment.parts.length) {
      console.log('Removed duplicate parts:', assignment.parts.length - uniqueParts.length);
      console.log('Original parts:', assignment.parts.map(p => ({ id: p._id, name: p.partName, isPreLoaded: p.isPreLoaded })));
      console.log('Unique parts:', uniqueParts.map(p => ({ id: p._id, name: p.partName, isPreLoaded: p.isPreLoaded })));
      setAssignment(prev => ({
        ...prev,
        parts: uniqueParts
      }));
    }
  };



  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!assignment.engineer) {
      errors.engineer = 'Please select an engineer';
    }

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

  // Enhanced function to collect all parts (pre-loaded + user-selected) for API
  const getAllPartsForAPI = () => {
    const allParts = [];

    assignment.parts.forEach(part => {
      const selectedQuantity = part.selectedQuantity || 1;

      // For pre-loaded parts, use original values from job card
      if (part.isPreLoaded) {
        const quantity = part.originalQuantity || selectedQuantity;
        const pricePerPiece = part.originalPricePerPiece || part.sellingPrice || 0;
        const totalPrice = part.originalTotalPrice || (pricePerPiece * quantity);

        allParts.push({
          partName: part.partName,
          partNumber: part.partNumber || '',
          hsnNumber: part.hsnNumber || '',
          quantity: quantity,
          pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
          totalPrice: parseFloat(totalPrice.toFixed(2)),
          taxPercentage: part.taxAmount || part.gstPercentage || 0,
          isPreLoaded: true
        });
      } else {
        // For user-selected parts, calculate normally
        const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
        const taxRate = Number(part.taxAmount || part.gstPercentage || 0);
        const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
        const totalPrice = pricePerPiece * selectedQuantity;

        allParts.push({
          partName: part.partName,
          partNumber: part.partNumber || '',
          hsnNumber: part.hsnNumber || '',
          quantity: selectedQuantity,
          pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
          totalPrice: parseFloat(totalPrice.toFixed(2)),
          taxPercentage: taxRate,
          isPreLoaded: false
        });
      }
    });

    return allParts;
  };

  // Enhanced updateJobCard function to handle both pre-loaded and user-selected parts
  const updateJobCard = async (jobCardId, jobDetails, partsUsed) => {
    try {
      // Get all parts (pre-loaded + user-selected)
      const allParts = getAllPartsForAPI();

      // Format parts data according to the workprogress API structure
      const formattedParts = allParts.map(part => ({
        partName: part.partName || '',
        partNumber: part.partNumber || '',
        hsnNumber: part.hsnNumber || '',
        quantity: Number(part.quantity || 1),
        pricePerPiece: parseFloat((part.pricePerPiece || 0).toFixed(2)),
        totalPrice: parseFloat((part.totalPrice || 0).toFixed(2)),
        taxPercentage: Number(part.taxPercentage || 0),
        igst: parseFloat((part.igst || 0).toFixed(2)),
        cgstSgst: parseFloat((part.cgstSgst || 0).toFixed(2))
      }));

      const updatePayload = {
        partsUsed: formattedParts
      };

      console.log('Updating job card with all parts:', formattedParts);
      console.log('Pre-loaded parts:', allParts.filter(p => p.isPreLoaded));
      console.log('User-selected parts:', allParts.filter(p => !p.isPreLoaded));

      const response = await axios.put(
        `${API_BASE_URL}/garage/jobcards/${jobCardId}/workprogress`,
        updatePayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': garageToken ? `Bearer ${garageToken}` : '',
          }
        }
      );

      return response.data;
    } catch (err) {
      console.error(`Failed to update job card ${jobCardId}:`, err.response?.data || err.message);
      throw err;
    }
  };

  // Function to validate inventory quantities before assignment
  const validateInventoryQuantities = (partsUsed) => {
    const errors = [];
    
    partsUsed.forEach(part => {
      if (part._id && part.selectedQuantity && !part.isPreLoaded) {
        // Get the current inventory quantity from the inventoryParts state
        const inventoryPart = inventoryParts.find(invPart => invPart._id === part._id);
        const currentQuantity = inventoryPart ? inventoryPart.quantity : 0;
        const requestedQuantity = part.selectedQuantity;
        
        console.log(`Validating part ${part.partName}: Available=${currentQuantity}, Requested=${requestedQuantity}`);
        
        if (requestedQuantity > currentQuantity) {
          errors.push(`Insufficient quantity for ${part.partName}. Available: ${currentQuantity}, Requested: ${requestedQuantity}`);
        }
      }
    });
    
    return errors;
  };

  // Function to update inventory quantities
  const updateInventoryQuantities = async (partsUsed) => {
    try {
      console.log('🔄 Updating inventory quantities for parts:', partsUsed);
      
      // Validate quantities before updating
      const validationErrors = validateInventoryQuantities(partsUsed);
      if (validationErrors.length > 0) {
        throw new Error(`Inventory validation failed: ${validationErrors.join(', ')}`);
      }
      
      const updatePromises = partsUsed.map(async (part) => {
        if (part._id && part.selectedQuantity) {
          const currentQuantity = part.quantity || 0;
          const usedQuantity = part.selectedQuantity;
          const newQuantity = Math.max(0, currentQuantity - usedQuantity);
          
          console.log(`Updating part ${part.partName}: ${currentQuantity} - ${usedQuantity} = ${newQuantity}`);
          
          // Update inventory quantity using the same API structure as InventoryManagement
          const requestData = {
            quantity: newQuantity,
            sellingPrice: parseFloat(part.sellingPrice || 0),
            purchasePrice: parseFloat(part.purchasePrice || 0),
            carName: part.carName || '',
            model: part.model || '',
            partNumber: part.partNumber || '',
            partName: part.partName || '',
            hsnNumber: part.hsnNumber || '',
            igst: parseFloat(part.igst || 0),
            cgstSgst: parseFloat(part.cgstSgst || 0),
          };

          await axios.put(
            `${API_BASE_URL}/inventory/update/${part._id}`,
            requestData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': garageToken ? `Bearer ${garageToken}` : '',
              }
            }
          );
          
          // If quantity becomes 0, delete the item from inventory
          if (newQuantity === 0) {
            console.log(`Deleting part ${part.partName} from inventory (quantity = 0)`);
            await axios.delete(
              `${API_BASE_URL}/garage/inventory/delete/${part._id}`,
              {
                headers: {
                  'Authorization': garageToken ? `Bearer ${garageToken}` : '',
                }
              }
            );
          }
        }
      });
      
      await Promise.all(updatePromises);
      console.log('✅ Inventory quantities updated successfully');
      
      // Refresh inventory data after update
      await fetchInventoryParts();
    } catch (error) {
      console.error('❌ Error updating inventory quantities:', error);
      throw new Error(`Failed to update inventory: ${error.response?.data?.message || error.message}`);
    }
  };

  // Updated handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if there are parts that will reduce inventory
    const partsToReduceInventory = assignment.parts.filter(part => part._id && part.selectedQuantity);
    
    if (partsToReduceInventory.length > 0) {
      setShowInventoryConfirmation(true);
      return;
    }

    await processAssignment();
  };

  // Process the actual assignment
  const processAssignment = async () => {
    setIsSubmitting(true);
    setError(null);
    setFormErrors({});

    try {
      // Collect all parts used with enhanced data
      const allPartsUsed = getAllPartsForAPI();

      // Update job card with parts used using the workprogress API
      const targetJobCardIds = jobCardIds.length > 0 ? jobCardIds : [id];

      console.log('🚀 Starting job card updates with parts:', {
        targetJobCardIds,
        allPartsUsed,
        preLoadedParts: allPartsUsed.filter(p => p.isPreLoaded),
        userSelectedParts: allPartsUsed.filter(p => !p.isPreLoaded)
      });

      const jobCardUpdatePromises = targetJobCardIds.map(jobCardId => {
        if (jobCardId) {
          return updateJobCard(jobCardId, null, allPartsUsed);
        }
      }).filter(Boolean);

      // Process assignment
      const payload = {
        jobCardIds: targetJobCardIds,
        parts: assignment.parts.map(part => ({
          partId: part._id,
          partName: part.partName,
          quantity: part.selectedQuantity || 1,
          taxAmount: part.taxAmount || 0,
        })),
        priority: assignment.priority,
        notes: assignment.notes
      };

      const assignmentPromise = axios.put(
        `https://garage-management-zi5z.onrender.com/api/jobcards/assign-jobcards/${assignment.engineer._id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Execute job card updates first
      if (jobCardUpdatePromises.length > 0) {
        await Promise.all(jobCardUpdatePromises);
      }

      // Refresh inventory data before validation to ensure we have the latest data
      await fetchInventoryParts();
      
      // Update inventory quantities for all parts used
      await updateInventoryQuantities(assignment.parts);

      // Execute assignment
      await assignmentPromise;

      // Calculate total cost for success message
      const totalCost = allPartsUsed.reduce((total, part) => total + (part.totalPrice || 0), 0);

      // Calculate pre-loaded vs user-selected parts
      const preLoadedParts = allPartsUsed.filter(part => part.isPreLoaded);
      const userSelectedParts = allPartsUsed.filter(part => !part.isPreLoaded);

      // Show success message with detailed breakdown
      const inventoryReduction = assignment.parts.reduce((total, part) => total + (part.selectedQuantity || 1), 0);
      const successMessage = `✅ Assignment completed! 
        Total Cost: ₹${totalCost.toFixed(2)}
        Parts: ${preLoadedParts.length} pre-loaded + ${userSelectedParts.length} user-selected = ${allPartsUsed.length} total
        Inventory reduced by ${inventoryReduction} units successfully`;

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/Work-In-Progress/${id}`);
      }, 2000);

    } catch (err) {
      console.error('Assignment error:', err.response?.data || err.message);
      
      // Check if it's an inventory validation error
      if (err.message && err.message.includes('Inventory validation failed')) {
        setSnackbar({
          open: true,
          message: `❌ ${err.message}. Please check inventory quantities and try again.`,
          severity: 'error'
        });
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to assign to engineers');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add New Engineer
  const handleAddEngineer = async () => {
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
        phone: newEngineer.phone,
        garageId
      };

      await apiCall('/garage/engineers/add', {
        method: 'POST',
        data: formattedEngineer
      });

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

  // Handle Add Part
  const handleAddPart = async () => {
    if (!newPart.partName?.trim() || !newPart.carName?.trim() || !newPart.model?.trim()) {
      setPartAddError('Please fill Car Name, Model, and Part Name');
      return;
    }
    if (newPart.quantity <= 0) {
      setPartAddError('Quantity must be greater than 0');
      return;
    }
    if (newPart.purchasePrice < 0 || newPart.sellingPrice < 0) {
      setPartAddError('Prices cannot be negative');
      return;
    }

    if (newPart.partNumber && checkDuplicatePartNumber(newPart.partNumber)) {
      setPartAddError('Part number already exists');
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      const igst = parseFloat(newPart.igst) || 0;
      const cgstSgst = parseFloat(newPart.cgstSgst) || 0;
      const baseAmount = newPart.sellingPrice * newPart.quantity;
      const taxAmount = newPart.taxType === 'igst'
        ? (baseAmount * igst) / 100
        : 2 * ((baseAmount * cgstSgst) / 100);

      const requestData = {
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
        igst: newPart.taxType === 'igst' ? igst : 0,
        cgstSgst: newPart.taxType === 'cgstSgst' ? cgstSgst : 0,
        taxAmount
      };

      await axios.post(`${API_BASE_URL}/garage/inventory/add`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: garageToken ? `Bearer ${garageToken}` : ''
        }
      });

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
        purchasePrice: 0,
        sellingPrice: 0,
        hsnNumber: "",
        igst: '',
        cgstSgst: '',
        taxType: 'igst'
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

  // Close Handlers
  const handleCloseAlert = () => {
    setError(null);
    setSuccess(false);
    setFormErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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

  // Handle input changes for new engineer
  const handleEngineerInputChange = (field, value) => {
    setNewEngineer(prev => ({ ...prev, [field]: value }));
    if (engineerAddError) setEngineerAddError(null);
  };

  // Enhanced Handle input changes for new part - Based on InventoryManagement
  const handlePartInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (partAddError) setPartAddError(null);
  };

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <>
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

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          mb: 4,
          ml: { xs: 0, sm: 35 },
          overflow: "auto",
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <CssBaseline />
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
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
                onClick={() => navigate(`/jobs/${id}`)}
                sx={{ mr: 2 }}
                aria-label="Go back"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h5"
                fontWeight={600}
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                Assign Engineer & Job Details
              </Typography>
            </Box>
          </Box>

          {/* Updated Assignment Summary Card with Job Details Cost */}
          <Card sx={{ mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Assignment Summary
                {isEditMode && (
                  <Chip
                    label="Editing Existing Job Card"
                    color="info"
                    size="small"
                    sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 }, display: { xs: 'block', sm: 'inline-block' } }}
                  />
                )}
              </Typography>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      0
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Job Details Points
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="success.main"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      ₹{(() => {
                        // Calculate parts cost only
                        const partsCost = assignment.parts.reduce((partTotal, part) => {
                          const selectedQuantity = part.selectedQuantity || 1;
                          const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
                          const taxRate = Number(part.taxAmount || part.gstPercentage || 0);
                          const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
                          const partTotalPrice = pricePerPiece * selectedQuantity;
                          return partTotal + partTotalPrice;
                        }, 0);

                        return partsCost.toFixed(0);
                      })()}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Total Parts Cost
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      {assignment.engineer ? 1 : 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Engineers Assigned
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      {assignment.parts.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Parts Selected
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'info.light', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'info.main'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.dark', mb: 1 }}>
                      📦 Inventory Impact Summary:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Pre-loaded Parts:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {assignment.parts.filter(part => part.isPreLoaded).length} (No inventory change)
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">User Selected Parts:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                                                          {selectedParts.length} (Will reduce inventory)
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Total Quantity:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {assignment.parts.reduce((partTotal, part) => 
                            partTotal + (part.selectedQuantity || 1), 0
                          )} units
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Status:</Typography>
                        <Chip 
                          label={isSubmitting ? "Processing..." : "Ready"} 
                          size="small" 
                          color={isSubmitting ? "warning" : "success"} 
                          variant="filled"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

            </CardContent>
          </Card>

          {/* Enhanced Job Details Section with Price */}


          {/* Main Form Card */}
          <Card sx={{ mb: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{
                  mb: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2
                }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    Engineer Assignments
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenAddEngineerDialog(true)}
                      size="small"
                      sx={{ flex: { xs: 1, sm: 'none' } }}
                    >
                      Add Engineer
                    </Button>
                  </Box>
                </Box>

                {/* Assignment */}
                <Accordion
                  defaultExpanded
                  sx={{
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper'
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      pr: 2,
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography
                        variant="subtitle1"
                        sx={{
                          flexGrow: 1,
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        Engineer Assignment
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {assignment.engineer && (
                          <Chip
                            label={assignment.engineer.name || assignment.engineer.email || 'Unknown Engineer'}
                            size="small"
                            color="primary"
                          />
                        )}
                        <Chip
                          label={assignment.priority}
                          size="small"
                          color={getPriorityColor(assignment.priority)}
                        />
                        {assignment.parts.length > 0 && (
                          <Chip
                            label={`${assignment.parts.length} parts`}
                            size="small"
                            color="info"
                          />
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
                      <Grid container spacing={{ xs: 2, sm: 3 }}>
                        {/* Engineer Selection */}
                        <Grid item xs={12} md={6}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 1,
                              fontWeight: 600,
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                          >
                            Select Engineer *
                          </Typography>
                          {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                              <CircularProgress size={20} />
                              <Typography sx={{ ml: 1 }}>Loading engineers...</Typography>
                            </Box>
                          ) : (
                            <Autocomplete
                              fullWidth
                              options={engineers}
                              getOptionLabel={(option) => {
                                if (!option) return '';
                                if (typeof option === 'string') return option;
                                return option.name || option.email || JSON.stringify(option) || '';
                              }}
                              isOptionEqualToValue={(option, value) => {
                                if (!option || !value) return false;
                                return option._id === value._id || option.id === value.id;
                              }}
                              value={assignment.engineer}
                              onChange={(event, newValue) => {
                                setAssignment(prev => ({
                                  ...prev,
                                  engineer: newValue
                                }));
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select engineer"
                                  variant="outlined"
                                  error={!!formErrors[`assignment_${assignment.id}_engineer`]}
                                  helperText={formErrors[`assignment_${assignment.id}_engineer`]}
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
                          {assignment.engineer && isEditMode && (
                            <Typography
                              variant="caption"
                              color="success.main"
                              sx={{
                                mt: 1,
                                display: 'block',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }}
                            >
                              ✅ This engineer was pre-selected from the job card
                            </Typography>
                          )}
                        </Grid>

                        {/* Priority Selection */}
                        <Grid item xs={12} md={3}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 1,
                              fontWeight: 600,
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                          >
                            Priority
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={assignment.priority}
                              onChange={(e) => setAssignment(prev => ({
                                ...prev,
                                priority: e.target.value
                              }))}
                            >
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                                                  {/* Parts Selection with Quantity Management */}
                          <Grid item xs={12}>
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: { xs: 'stretch', sm: 'center' },
                              mb: 1,
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 1
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title="Add New Part">
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => setOpenAddPartDialog(true)}
                                    sx={{ flex: { xs: 1, sm: 'none' } }}
                                  >
                                    Add Part
                                  </Button>
                                </Tooltip>
                                
                                <Tooltip title="Clear all selected parts">
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => {
                                      const existingPreLoadedParts = assignment.parts.filter(part => part.isPreLoaded);
                                      setAssignment(prev => ({
                                        ...prev,
                                        parts: existingPreLoadedParts
                                      }));
                                      setSuccess('All user-selected parts cleared');
                                    }}
                                    sx={{ flex: { xs: 1, sm: 'none' } }}
                                  >
                                    Clear All
                                  </Button>
                                </Tooltip>
                              </Box>
                            </Box>


                    

                          {/* No Parts Available Notice */}
                          {(() => {
                            const availableParts = inventoryParts.filter(part => {
                              const isAlreadySelected = assignment.parts.some(selectedPart => selectedPart._id === part._id);
                              const hasAvailableQuantity = getAvailableQuantity(part._id) > 0;
                              return !isAlreadySelected && hasAvailableQuantity;
                            });

                            if (availableParts.length === 0 && !isLoadingInventory) {
                              return (
                                <Alert
                                  severity="warning"
                                  sx={{ mb: 2 }}
                                  icon={<InventoryIcon />}
                                >
                                  <Typography variant="body2">
                                    <strong>No parts available:</strong> All parts in inventory are either out of stock or already selected (including pre-loaded parts from job card). You can add new parts using the "Add Part" button.
                                  </Typography>
                                </Alert>
                              );
                            }
                            return null;
                          })()}

                          {isLoadingInventory && (
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
                          )}
                          


                          {/* Parts Selection with Autocomplete (same pattern as WorkInProgress) */}
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mb: 1,
                                fontWeight: 600,
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}
                            >
                              Select Parts:
                            </Typography>
                            {isLoadingInventory ? (
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                py: 2
                              }}>
                                <CircularProgress size={20} />
                                <Typography sx={{ ml: 2 }}>Loading parts...</Typography>
                              </Box>
                            ) : (
                              <Autocomplete
                                multiple
                                fullWidth
                                options={inventoryParts.filter(
                                  (part) => getAvailableQuantity(part._id) > 0
                                )}
                                getOptionLabel={(option) =>
                                  `${option.partName} (${
                                    option.partNumber || "N/A"
                                  }) - HSN: ${option.hsnNumber || "N/A"} | ₹${option.sellingPrice || 0} | GST: ${
                                    option.gstPercentage || option.taxAmount || 0
                                  }% | Available: ${getAvailableQuantity(option._id)}`
                                }
                                value={selectedParts}
                                onChange={(event, newValue) => {
                                  handlePartSelection(newValue, selectedParts);
                                }}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => (
                                    <Chip
                                      variant="outlined"
                                      label={`${option.partName} (${
                                        option.partNumber || "N/A"
                                      }) - Qty: ${option.selectedQuantity || 1} @ ₹${
                                        option.sellingPrice || 0
                                      }`}
                                      {...getTagProps({ index })}
                                      key={option._id}
                                    />
                                  ))
                                }
                                renderOption={(props, option) => (
                                  <Box component="li" {...props}>
                                    <Box sx={{ width: "100%" }}>
                                      <Typography variant="body2" fontWeight={500}>
                                        {option.partName}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Part : {option.partNumber || "N/A"} | HSN: {option.hsnNumber || "N/A"} | Price: ₹
                                        {option.sellingPrice || 0} | GST:{" "}
                                        {option.gstPercentage || option.taxAmount || 0}% |
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
                                  return options.filter(
                                    (option) =>
                                      getAvailableQuantity(option._id) > 0 &&
                                      (option.partName
                                        .toLowerCase()
                                        .includes(inputValue.toLowerCase()) ||
                                        option.partNumber
                                          ?.toLowerCase()
                                          .includes(inputValue.toLowerCase()) ||
                                        option.carName
                                          ?.toLowerCase()
                                          .includes(inputValue.toLowerCase()) ||
                                        option.model
                                          ?.toLowerCase()
                                          .includes(inputValue.toLowerCase()))
                                  );
                                }}
                              />
                            )}
                          </Box>

                          {/* Current Selection Summary */}
                          {selectedParts.length > 0 && (
                            <Box sx={{ 
                              mt: 2, 
                              p: 2, 
                              bgcolor: 'primary.light', 
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'primary.main'
                            }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.dark', mb: 1 }}>
                                📋 Current Selection Summary:
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.secondary">User Selected Parts:</Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {selectedParts.length} parts
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.secondary">Total Quantity:</Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {selectedParts.reduce((total, part) => total + (part.selectedQuantity || 1), 0)} units
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.secondary">Pre-loaded Parts:</Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {assignment.parts.filter(part => part.isPreLoaded).length} parts
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.secondary">Status:</Typography>
                                  <Chip 
                                    label="Ready to Add More" 
                                    size="small" 
                                    color="success" 
                                    variant="filled"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="caption" color="warning.main" sx={{ fontStyle: 'italic' }}>
                                    ⚠️ Total inventory reduction: {selectedParts.reduce((total, part) => total + (part.selectedQuantity || 1), 0)} units
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          )}

                          {/* User Selected Parts - Display First */}
                          {selectedParts.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 1,
                                  fontWeight: 600,
                                  fontSize: { xs: '0.9rem', sm: '1rem' },
                                  color: 'primary.main'
                                }}
                              >
                                🔧 User Selected Parts ({selectedParts.length}):
                              </Typography>
                              <Alert
                                severity="success"
                                sx={{ mb: 2 }}
                                icon={<AddIcon />}
                              >
                                <Typography variant="body2">
                                  {selectedParts.length === 1 
                                    ? 'This is a newly selected part that will be added to the job card along with the pre-loaded parts.'
                                    : `These are ${selectedParts.length} newly selected parts that will be added to the job card along with the pre-loaded parts.`
                                  }
                                </Typography>
                              </Alert>
                              <List dense>
                                {selectedParts.map((part, partIndex) => {
                                    const selectedQuantity = part.selectedQuantity || 1;
                                    const quantity = part.quantity || 0;
                                    const unitPrice = part.sellingPrice || 0;
                                    const gstPercentage = part.taxAmount || 0;
                                    const gst = quantity > 0 ? (part.taxAmount * selectedQuantity) / quantity : 0;
                                    const totalTax = (gstPercentage * selectedQuantity);
                                    const totalPrice = unitPrice * selectedQuantity;
                                    const gstAmount = (totalPrice * gstPercentage) / 100;
                                    const finalPrice = totalPrice + totalTax;

                                    const availableQuantity = getAvailableQuantity(part._id);
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
                                        <Box sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'flex-start',
                                          width: '100%',
                                          flexDirection: { xs: 'column', sm: 'row' },
                                          gap: { xs: 1, sm: 0 }
                                        }}>
                                          <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                              <Typography
                                                variant="body2"
                                                fontWeight={500}
                                                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                              >
                                                {part.partName}
                                              </Typography>
                                              <Chip
                                                label="User Selected"
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                              />
                                            </Box>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                display: 'block',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                              }}
                                            >
                                              Part #: {part.partNumber || 'N/A'} | HSN: {part.hsnNumber || 'N/A'} | {part.carName} - {part.model}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                display: 'block',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                              }}
                                            >
                                              Tax: {(part.taxAmount || part.gstPercentage || 0)}% | Price: ₹{part.sellingPrice || 0}
                                            </Typography>

                                            <Typography
                                              variant="caption"
                                              color="primary.main"
                                              sx={{
                                                display: 'block',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                              }}
                                            >
                                              Max Selectable: {maxSelectableQuantity} | Selected: {selectedQuantity}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="warning.main"
                                              sx={{
                                                display: 'block',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                fontStyle: 'italic'
                                              }}
                                            >
                                              ⚠️ Inventory will be reduced by {selectedQuantity} on assignment
                                            </Typography>
                                          </Box>
                                          <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            width: { xs: '100%', sm: 'auto' },
                                            justifyContent: { xs: 'space-between', sm: 'flex-end' }
                                          }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <Tooltip title={isSubmitting ? "Quantity controls disabled during submission" : "Decrease quantity (inventory will be updated on form submission)"}>
                                                <span>
                                                  <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                      const newQuantity = selectedQuantity - 1;
                                                      if (newQuantity >= 1) {
                                                        handlePartQuantityChange(partIndex, newQuantity, selectedQuantity);
                                                      }
                                                    }}
                                                    disabled={selectedQuantity <= 1 || isSubmitting}
                                                    sx={{
                                                      minWidth: '24px',
                                                      width: '24px',
                                                      height: '24px',
                                                      border: `1px solid ${theme.palette.divider}`
                                                    }}
                                                  >
                                                    <Typography variant="caption" fontWeight="bold">-</Typography>
                                                  </IconButton>
                                                </span>
                                              </Tooltip>
                                              <Tooltip title={isSubmitting ? "Quantity input disabled during submission" : "Enter quantity (inventory will be updated on form submission)"}>
                                                <TextField
                                                  size="small"
                                                  type="number"
                                                  label="Qty"
                                                  value={selectedQuantity}
                                                  onChange={(e) => {
                                                    const newQuantity = parseInt(e.target.value) || 1;
                                                    const oldQuantity = selectedQuantity;

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
                                                    readOnly: (isMaxQuantityReached && selectedQuantity === maxSelectableQuantity)
                                                  }}
                                                  sx={{
                                                    width: '70px',
                                                    '& .MuiInputBase-input': {
                                                      textAlign: 'center',
                                                      fontSize: '0.875rem'
                                                    }
                                                  }}
                                                  error={availableQuantity === 0}
                                                  disabled={maxSelectableQuantity === 0 || isSubmitting}
                                                />
                                              </Tooltip>
                                              <Tooltip title={isSubmitting ? "Quantity controls disabled during submission" : "Increase quantity (inventory will be updated on form submission)"}>
                                                <span>
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
                                                    disabled={selectedQuantity >= maxSelectableQuantity || availableQuantity === 0 || isSubmitting}
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
                                                </span>
                                              </Tooltip>
                                            </Box>
                                            <Tooltip title={isSubmitting ? "Remove button disabled during submission" : "Remove part from selection"}>
                                              <span>
                                                <IconButton
                                                  size="small"
                                                  color="error"
                                                  onClick={() => {
                                                    handlePartRemoval(partIndex);
                                                  }}
                                                  disabled={isSubmitting}
                                                >
                                                  <DeleteIcon fontSize="small" />
                                                </IconButton>
                                              </span>
                                            </Tooltip>
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
                                            <Grid item xs={12} sm={4}>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                }}
                                              >
                                                Price/Unit: ₹{unitPrice.toFixed(2)}
                                              </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                              >
                                                GST: ₹{gst}
                                              </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={5}>
                                              <Typography
                                                variant="caption"
                                                fontWeight={600}
                                                color="primary"
                                                sx={{
                                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                }}
                                              >
                                                Total: ₹{finalPrice.toFixed(2)}
                                              </Typography>
                                            </Grid>
                                          </Grid>
                                        </Box>
                                      </ListItem>
                                    );
                                  })}
                              </List>
                            </Box>
                          )}

                          {/* Pre-loaded Parts from Job Card - Display Second */}
                          {assignment.parts.filter(part => part.isPreLoaded).length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 1,
                                  fontWeight: 600,
                                  fontSize: { xs: '0.9rem', sm: '1rem' },
                                  color: 'info.main'
                                }}
                              >
                                📋 Pre-loaded Parts from Job Card:
                              </Typography>
                              {/* <Alert
                                severity="info"
                                sx={{ mb: 2 }}
                                icon={<InventoryIcon />}
                              >
                                <Typography variant="body2">
                                  These parts were pre-loaded from the job card and will be automatically included in the work progress update.
                                </Typography>
                              </Alert> */}
                              <List dense>
                                {assignment.parts
                                  .filter(part => part && part.partName && part.isPreLoaded)
                                  .map((part, partIndex) => {
                                    const selectedQuantity = part.selectedQuantity || 1;
                                    const quantity = part.quantity || 0;
                                    const unitPrice = part.sellingPrice || 0;
                                    const gstPercentage = part.taxAmount || 0;
                                    const gst = quantity > 0 ? (part.taxAmount * selectedQuantity) / quantity : 0;
                                    const totalTax = (gstPercentage * selectedQuantity) / 100;
                                    const totalPrice = unitPrice * selectedQuantity;
                                    const gstAmount = (totalPrice * gstPercentage) / 100;
                                    const finalPrice = totalPrice + totalTax;

                                    const availableQuantity = getAvailableQuantity(part._id);
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
                                        <Box sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'flex-start',
                                          width: '100%',
                                          flexDirection: { xs: 'column', sm: 'row' },
                                          gap: { xs: 1, sm: 0 }
                                        }}>
                                          <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                              <Typography
                                                variant="body2"
                                                fontWeight={500}
                                                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                              >
                                                {part.partName}
                                              </Typography>
                                              {part.isPreLoaded && (
                                                <Chip
                                                  label="From Job Card"
                                                  size="small"
                                                  color="info"
                                                  variant="outlined"
                                                  sx={{ fontSize: '0.7rem', height: '20px' }}
                                                />
                                              )}
                                            </Box>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                display: 'block',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                              }}
                                            >
                                              Part #: {part.partNumber || 'N/A'} | {part.carName} - {part.model}
                                            </Typography>

                                            <Typography
                                              variant="caption"
                                              color="info.main"
                                              sx={{
                                                display: 'block',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                              }}
                                            >
                                              {part.isPreLoaded ? (
                                                `Quantity: ${selectedQuantity} (Fixed from Job Card)`
                                              ) : (
                                                `Max Selectable: ${maxSelectableQuantity} | Selected: ${selectedQuantity}`
                                              )}
                                            </Typography>
                                          </Box>
                                          <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            width: { xs: '100%', sm: 'auto' },
                                            justifyContent: { xs: 'space-between', sm: 'flex-end' }
                                          }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <IconButton
                                                size="small"
                                                onClick={() => {
                                                  if (part.isPreLoaded) return;
                                                  const newQuantity = selectedQuantity - 1;
                                                  if (newQuantity >= 1) {
                                                    handlePartQuantityChange(partIndex, newQuantity, selectedQuantity);
                                                  }
                                                }}
                                                disabled={selectedQuantity <= 1 || part.isPreLoaded}
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
                                                  if (part.isPreLoaded) return;
                                                  const newQuantity = parseInt(e.target.value) || 1;
                                                  const oldQuantity = selectedQuantity;

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
                                                  readOnly: (isMaxQuantityReached && selectedQuantity === maxSelectableQuantity) || part.isPreLoaded
                                                }}
                                                sx={{
                                                  width: '70px',
                                                  '& .MuiInputBase-input': {
                                                    textAlign: 'center',
                                                    fontSize: '0.875rem'
                                                  }
                                                }}
                                                error={availableQuantity === 0}
                                                disabled={maxSelectableQuantity === 0 || part.isPreLoaded}
                                              />
                                              <IconButton
                                                size="small"
                                                onClick={() => {
                                                  if (part.isPreLoaded) return;
                                                  const newQuantity = selectedQuantity + 1;
                                                  if (newQuantity <= maxSelectableQuantity) {
                                                    handlePartQuantityChange(partIndex, newQuantity, selectedQuantity);
                                                  } else {
                                                    setError(`Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`);
                                                  }
                                                }}
                                                disabled={selectedQuantity >= maxSelectableQuantity || availableQuantity === 0 || part.isPreLoaded}
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
                                              onClick={() => {
                                                if (part.isPreLoaded) {
                                                  setError("Pre-loaded parts from job card cannot be removed.");
                                                  return;
                                                }
                                                handlePartRemoval(partIndex);
                                              }}
                                              disabled={part.isPreLoaded}
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
                                            <Grid item xs={12} sm={4}>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                  fontStyle: part.isPreLoaded ? 'italic' : 'normal',
                                                  color: part.isPreLoaded ? 'text.disabled' : 'text.secondary',
                                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                }}
                                              >
                                                Price/Unit: ₹{unitPrice.toFixed(2)}
                                                {part.isPreLoaded && ' (Fixed)'}
                                              </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                              >
                                                GST: ₹{gst}
                                              </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={5}>
                                              <Typography
                                                variant="caption"
                                                fontWeight={600}
                                                color="primary"
                                                sx={{
                                                  fontStyle: part.isPreLoaded ? 'italic' : 'normal',
                                                  color: part.isPreLoaded ? 'text.disabled' : 'primary',
                                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                }}
                                              >
                                                Total: ₹{finalPrice.toFixed(2)}
                                                {part.isPreLoaded && ' (Fixed)'}
                                              </Typography>
                                            </Grid>
                                          </Grid>
                                        </Box>
                                      </ListItem>
                                    );
                                  })}
                              </List>
                            </Box>
                          )}
                          
                          {/* Summary Section for Multiple Parts */}
                          {(() => {
                            const userSelectedParts = selectedParts;
                            if (userSelectedParts.length > 1) {
                              const totalQuantity = userSelectedParts.reduce((sum, part) => sum + (part.selectedQuantity || 1), 0);
                              const totalValue = userSelectedParts.reduce((sum, part) => {
                                const unitPrice = part.sellingPrice || 0;
                                const quantity = part.selectedQuantity || 1;
                                const gstPercentage = part.taxAmount || 0;
                                const basePrice = unitPrice * quantity;
                                const gstAmount = (basePrice * gstPercentage) / 100;
                                return sum + basePrice + gstAmount;
                              }, 0);
                              
                              return (
                                <Box sx={{ 
                                  mt: 2, 
                                  p: 2, 
                                  bgcolor: 'success.light', 
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'success.main'
                                }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.dark', mb: 1 }}>
                                    📊 Multiple Parts Summary:
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="caption" color="text.secondary">Total Parts:</Typography>
                                      <Typography variant="body2" fontWeight={600}>{userSelectedParts.length}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="caption" color="text.secondary">Total Quantity:</Typography>
                                      <Typography variant="body2" fontWeight={600}>{totalQuantity}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="caption" color="text.secondary">Total Value:</Typography>
                                      <Typography variant="body2" fontWeight={600}>₹{totalValue.toFixed(2)}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="caption" color="text.secondary">Status:</Typography>
                                      <Chip 
                                        label="Ready" 
                                        size="small" 
                                        color="success" 
                                        variant="filled"
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>
                              );
                            }
                            return null;
                          })()}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                {/* Final Summary Before Submission */}
                {(() => {
                  const allParts = getAllPartsForAPI();
                  const preLoadedParts = allParts.filter(part => part.isPreLoaded);
                  const userSelectedParts = allParts.filter(part => !part.isPreLoaded);

                  console.log('📊 Final Summary Debug:', {
                    allParts: allParts.length,
                    preLoadedParts: preLoadedParts.length,
                    userSelectedParts: userSelectedParts.length,
                    preLoadedDetails: preLoadedParts.map(p => p.partName),
                    userSelectedDetails: userSelectedParts.map(p => p.partName)
                  });

                  // Handle Select All Parts button click
                  const handleSelectAllParts = async () => {
                    try {
                      // Get jobCardId from URL params or use the one from jobCardDataTemp
                      const currentJobCardId = jobCardId || jobCardDataTemp?._id || id;
                      
                      if (!currentJobCardId) {
                        setError('Job Card ID is missing. Please refresh the page and try again.');
                        return;
                      }

                      console.log('🚀 Calling /workprogress API with all parts:', {
                        jobCardId: currentJobCardId,
                        allParts: allParts,
                        partsCount: allParts.length
                      });
                      
                      // Call the workprogress API with all parts
                      const response = await axios.post(
                        `https://garage-management-zi5z.onrender.com/api/garage/jobcards/${currentJobCardId}/workprogress`,
                        {
                          partsUsed: allParts.map(part => ({
                            partName: part.partName || '',
                            partNumber: part.partNumber || '',
                            hsnNumber: part.hsnNumber || '',
                            quantity: Number(part.quantity || 1),
                            pricePerPiece: parseFloat((part.pricePerPiece || 0).toFixed(2)),
                            totalPrice: parseFloat((part.totalPrice || 0).toFixed(2)),
                            igst: parseFloat((part.igst || 0).toFixed(2)),
                            cgstSgst: parseFloat((part.cgstSgst || 0).toFixed(2))
                          }))
                        },
                        {
                          headers: {
                            Authorization: garageToken ? `Bearer ${garageToken}` : '',
                            'Content-Type': 'application/json'
                          }
                        }
                      );

                      console.log('✅ /workprogress API response:', response.data);
                      setSuccess('All parts successfully sent to work progress API!');
                      
                    } catch (error) {
                      console.error('❌ Error calling /workprogress API:', error);
                      setError(`Failed to send parts to work progress API: ${error.response?.data?.message || error.message}`);
                    }
                  };

                  // if (allParts.length > 0) {
                  //   return (
                  //     <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2 }}>
                  //       <Typography
                  //         variant="h6"
                  //         sx={{
                  //           mb: 2,
                  //           fontWeight: 600,
                  //           fontSize: { xs: '1rem', sm: '1.1rem' }
                  //         }}
                  //                                >
                  //          📋 Final Parts Summary for Work Progress API:
                  //        </Typography>

                  //       {/* User Selected Parts Summary - Display First */}
                  //       {userSelectedParts.length > 0 && (
                  //         <Box sx={{ mb: 2 }}>
                  //           <Typography
                  //             variant="subtitle1"
                  //             sx={{
                  //               mb: 1,
                  //               fontWeight: 600,
                  //               fontSize: { xs: '0.9rem', sm: '1rem' },
                  //               color: 'primary.main'
                  //             }}
                  //           >
                  //             🔧 User Selected Parts ({userSelectedParts.length}):
                  //           </Typography>
                  //           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  //             {userSelectedParts.map((part, index) => (
                  //               <Chip
                  //                 key={index}
                  //                 label={`${part.partName} (Qty: ${part.quantity})`}
                  //                 color="primary"
                  //                 variant="outlined"
                  //                 size="small"
                  //               />
                  //             ))}
                  //           </Box>
                  //         </Box>
                  //       )}

                  //       {/* Pre-loaded Parts Summary - Display Second */}
                  //       {preLoadedParts.length > 0 && (
                  //         <Box sx={{ mb: 2 }}>
                  //           <Typography
                  //             variant="subtitle1"
                  //             sx={{
                  //               mb: 1,
                  //               fontWeight: 600,
                  //               fontSize: { xs: '0.9rem', sm: '1rem' },
                  //               color: 'info.main'
                  //             }}
                  //           >
                  //             📋 Pre-loaded Parts from Job Card ({preLoadedParts.length}):
                  //           </Typography>
                  //           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  //             {preLoadedParts.map((part, index) => (
                  //               <Chip
                  //                 key={index}
                  //                 label={`${part.partName} (Qty: ${part.quantity})`}
                  //                 color="info"
                  //                 variant="outlined"
                  //                 size="small"
                  //               />
                  //             ))}
                  //           </Box>
                  //         </Box>
                  //       )}

                  //       {/* Select All Parts Button */}
                  //       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  //         <Button
                  //           variant="contained"
                  //           color="success"
                  //           size="large"
                  //           onClick={handleSelectAllParts}
                  //           startIcon={<SendIcon />}
                  //           sx={{
                  //             px: { xs: 3, sm: 4 },
                  //             py: 1.5,
                  //             textTransform: 'uppercase',
                  //             fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  //             fontWeight: 600
                  //           }}
                  //         >
                  //           Select All Parts ({allParts.length})
                  //         </Button>
                  //       </Box>

                  //       <Alert
                  //         severity="info"
                  //         sx={{ mt: 2 }}
                  //         icon={<SendIcon />}
                  //       >
                  //         <Typography variant="body2">
                  //           <strong>Total {allParts.length} parts</strong> will be sent to the <code>/workprogress</code> API endpoint, including both pre-loaded parts from the job card and newly selected parts.
                  //         </Typography>
                  //       </Alert>
                  //     </Box>
                  //   );
                  // }
                  return null;
                })()}

                {/* Submit Button - FIXED */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 2 }}>
                  {isSubmitting && (
                    <Alert severity="info" sx={{ width: '100%', maxWidth: 600 }}>
                      <Typography variant="body2">
                        <strong>Processing:</strong> Updating inventory quantities and assigning engineers. Please wait...
                      </Typography>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={isSubmitting || isLoading}
                    sx={{
                      px: { xs: 4, sm: 6 },
                      py: 1.5,
                      textTransform: 'uppercase',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {isSubmitting ? 'Assigning...' : 'Assign Engineer & Update Job Card'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Container>

        {/* Enhanced Add Part Dialog - Based on InventoryManagement */}
        <Dialog
          open={openAddPartDialog}
          onClose={handleCloseAddPartDialog}
          maxWidth="sm"
          fullWidth
          fullScreen={{ xs: true, sm: false }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Add New Part</Typography>
              <IconButton onClick={handleCloseAddPartDialog}><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
            {partAddSuccess && <Alert severity="success" sx={{ mb: 2 }}>Part added successfully!</Alert>}
            {partAddError && <Alert severity="error" sx={{ mb: 2 }}>{partAddError}</Alert>}

            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12}>
                <TextField
                  label="Car Name *"
                  name="carName"
                  value={newPart.carName}
                  onChange={handlePartInputChange}
                  required
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Model *"
                  name="model"
                  value={newPart.model}
                  onChange={handlePartInputChange}
                  required
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Part Number *"
                  name="partNumber"
                  value={newPart.partNumber}
                  onChange={handlePartInputChange}
                  required
                  fullWidth
                  margin="normal"
                  error={newPart.partNumber && checkDuplicatePartNumber(newPart.partNumber)}
                  helperText={newPart.partNumber && checkDuplicatePartNumber(newPart.partNumber) ? "Already exists" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Part Name *"
                  name="partName"
                  value={newPart.partName}
                  onChange={handlePartInputChange}
                  required
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Quantity *"
                  name="quantity"
                  type="number"
                  value={newPart.quantity}
                  onChange={handlePartInputChange}
                  required
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Purchase Price *"
                  name="purchasePrice"
                  type="number"
                  value={newPart.purchasePrice}
                  onChange={handlePartInputChange}
                  required
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Selling Price *"
                  name="sellingPrice"
                  type="number"
                  value={newPart.sellingPrice}
                  onChange={handlePartInputChange}
                  required
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="HSN Number"
                  name="hsnNumber"
                  value={newPart.hsnNumber}
                  onChange={handlePartInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>

            {/* Tax Type Selection */}
            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Tax Type</InputLabel>
                <Select
                  name="taxType"
                  value={newPart.taxType}
                  onChange={handlePartInputChange}
                  label="Tax Type"
                >
                  <MenuItem value="igst">IGST</MenuItem>
                  <MenuItem value="cgstSgst">CGST + SGST</MenuItem>
                </Select>
              </FormControl>

              {newPart.taxType === 'igst' ? (
                <TextField
                  label="IGST (%)"
                  name="igst"
                  type="number"
                  value={newPart.igst}
                  onChange={handlePartInputChange}
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              ) : (
                <TextField
                  label="CGST/SGST (each %)"
                  name="cgstSgst"
                  type="number"
                  value={newPart.cgstSgst}
                  onChange={handlePartInputChange}
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              )}
            </Box>

            {/* Tax Preview */}
            {(newPart.purchasePrice && newPart.quantity && (newPart.igst || newPart.cgstSgst)) && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Tax Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Base: ₹{(newPart.purchasePrice * newPart.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="primary">
                      Tax: ₹{calculateTaxAmount(newPart.purchasePrice, newPart.quantity, newPart.taxType === 'igst' ? newPart.igst : newPart.cgstSgst * 2).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6">
                      Total: ₹{calculateTotalPrice(newPart.purchasePrice, newPart.quantity, newPart.igst, newPart.cgstSgst).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button onClick={handleCloseAddPartDialog} color="inherit">Cancel</Button>
            <Button
              onClick={handleAddPart}
              variant="contained"
              disabled={addingPart || !newPart.partName.trim()}
              startIcon={addingPart ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{ backgroundColor: '#ff4d4d', '&:hover': { backgroundColor: '#e63939' } }}
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
          fullScreen={{ xs: true, sm: false }}
          PaperProps={{
            sx: { bgcolor: 'background.paper' }
          }}
        >
          <DialogTitle>Add New Engineer</DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
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

            <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name *"
                  value={newEngineer.name}
                  onChange={(e) => handleEngineerInputChange('name', e.target.value)}
                  error={!newEngineer.name.trim() && !!engineerAddError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={newEngineer.email}
                  onChange={(e) => handleEngineerInputChange('email', e.target.value)}
                  error={!newEngineer.email.trim() && !!engineerAddError}
                />
              </Grid>
              <Grid item xs={12}>
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
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button
              onClick={handleCloseAddEngineerDialog}
              disabled={addingEngineer}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEngineer}
              disabled={addingEngineer}
              variant="contained"
              startIcon={addingEngineer ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              {addingEngineer ? 'Adding...' : 'Add Engineer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Inventory Confirmation Dialog */}
        <Dialog
          open={showInventoryConfirmation}
          onClose={() => setShowInventoryConfirmation(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { bgcolor: 'background.paper' }
          }}
        >
          <DialogTitle sx={{ color: 'warning.main' }}>
            ⚠️ Confirm Inventory Reduction
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              The following parts will be removed from inventory when you assign the engineer:
            </Typography>
            <Box sx={{ mb: 2 }}>
              {assignment.parts.filter(part => part._id && part.selectedQuantity).map((part, index) => (
                <Typography key={part._id} variant="body2" sx={{ mb: 1 }}>
                  • <strong>{part.partName}</strong>: {part.selectedQuantity} units
                </Typography>
              ))}
            </Box>
            <Typography variant="body2" color="warning.main" sx={{ fontStyle: 'italic' }}>
              Total inventory reduction: {assignment.parts.reduce((total, part) => total + (part.selectedQuantity || 1), 0)} units
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. Are you sure you want to proceed?
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
            <Button
              onClick={() => setShowInventoryConfirmation(false)}
              disabled={isSubmitting}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowInventoryConfirmation(false);
                processAssignment();
              }}
              disabled={isSubmitting}
              variant="contained"
              color="warning"
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              {isSubmitting ? 'Processing...' : 'Confirm & Assign'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AssignEngineer;