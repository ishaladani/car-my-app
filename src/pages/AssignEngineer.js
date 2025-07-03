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
  AttachMoney as MoneyIcon
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
  
  // Updated job details state to include pricing
  const [jobPoints, setJobPoints] = useState([]);
  const [currentJobPoint, setCurrentJobPoint] = useState({
    description: '',
    price: ''
  });

  const jobCardId = location.state?.jobCardId;
  const garageId = localStorage.getItem('garageId');
  const garageToken = localStorage.getItem('token');

  // Main State
  const [engineers, setEngineers] = useState([]);
  const [assignments, setAssignments] = useState([
    {
      id: Date.now(),
      engineer: null,
      parts: [],
      priority: 'medium',
      estimatedDuration: '',
      notes: ''
    }
  ]);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [jobCardIds, setJobCardIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [parsedJobDetails, setParsedJobDetails] = useState([]);

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

  // Updated job details functions with pricing
  const addJobPoint = () => {
    if (currentJobPoint.description.trim() && currentJobPoint.price) {
      const newJobPoint = {
        description: currentJobPoint.description.trim(),
        price: parseFloat(currentJobPoint.price) || 0
      };
      setJobPoints(prev => [...prev, newJobPoint]);
      setCurrentJobPoint({ description: '', price: '' });
    }
  };
  
  const removeJobPoint = (indexToRemove) => {
    setJobPoints(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleJobPointInputChange = (field, value) => {
    setCurrentJobPoint(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleJobPointKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addJobPoint();
    }
  };

  // Calculate total job details price
  const calculateJobDetailsTotal = () => {
    return jobPoints.reduce((total, point) => total + (point.price || 0), 0);
  };

  // Updated function to get job details for API
  const getJobDetailsForAPI = () => {
    // Combine existing and new job details
    let combinedJobDetails = [];
    
    // Add existing job details from parsed data
    if (parsedJobDetails.length > 0) {
      combinedJobDetails = [...parsedJobDetails];
    }
    
    // Add new job details from current input
    if (jobPoints.length > 0) {
      combinedJobDetails = [...combinedJobDetails, ...jobPoints];
    }
    
    return JSON.stringify(combinedJobDetails);
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

  // Helper function to get available quantity considering all current selections
  const getAvailableQuantity = (partId) => {
    const originalPart = inventoryParts.find(p => p._id === partId);
    if (!originalPart) return 0;

    // Calculate total selected quantity across all assignments
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

  // Update Part Quantity using PUT API, DELETE only when qty = 0
  const updatePartQuantity = useCallback(async (partId, newQuantity) => {
    try {
      console.log(`Updating part ${partId} to quantity: ${newQuantity}`);
      
      if (newQuantity === 0) {
        // When quantity reaches 0, use DELETE API
        await apiCall(`/garage/inventory/delete/${partId}`, {
          method: 'DELETE'
        });
        console.log(`Part ${partId} deleted (quantity reached 0)`);
      } else {
        // Use PUT API to update quantity
        await apiCall(`/garage/inventory/update/${partId}`, {
          method: 'PUT',
          data: { quantity: newQuantity }
        });
        console.log(`Part ${partId} updated to quantity: ${newQuantity}`);
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
      console.log('🔄 Setting assignments with job card data:', jobCardDataTemp);
      
      // Set engineer and parts in assignments if they exist
      if (jobCardDataTemp.engineerId && jobCardDataTemp.engineerId.length > 0) {
        const assignedEngineer = jobCardDataTemp.engineerId[0]; // Get first engineer
        
        // Find the full engineer object from the engineers list
        const fullEngineerData = engineers.find(eng => eng._id === assignedEngineer._id);
        
        console.log('👤 Found assigned engineer:', assignedEngineer);
        console.log('👤 Full engineer data:', fullEngineerData);
        
        if (fullEngineerData || assignedEngineer) {
          // Convert partsUsed from job card to format expected by the form
          let formattedParts = [];
          if (jobCardDataTemp.partsUsed && jobCardDataTemp.partsUsed.length > 0) {
            console.log('🔧 Processing parts used:', jobCardDataTemp.partsUsed);
            
            formattedParts = jobCardDataTemp.partsUsed.map(usedPart => {
              // Find the part in inventory to get full details
              const inventoryPart = inventoryParts.find(invPart => 
                invPart.partName === usedPart.partName || 
                invPart._id === usedPart.partId ||
                invPart._id === usedPart._id
              );
              
              if (inventoryPart) {
                console.log(`✅ Found part in inventory: ${usedPart.partName}`);
                return {
                  ...inventoryPart,
                  selectedQuantity: usedPart.quantity || 1,
                  availableQuantity: inventoryPart.quantity
                };
              } else {
                // If part not found in inventory, create a mock part object
                console.log(`⚠️ Part not found in inventory, creating mock: ${usedPart.partName}`);
                return {
                  _id: usedPart._id || `mock-${Date.now()}-${usedPart.partName}`,
                  partName: usedPart.partName || 'Unknown Part',
                  partNumber: usedPart.partNumber || '',
                  quantity: 0, // No stock available
                  selectedQuantity: usedPart.quantity || 1,
                  pricePerUnit: usedPart.totalPrice ? (usedPart.totalPrice / (usedPart.quantity || 1)) : 0,
                  gstPercentage: usedPart.gstPercentage || 0,
                  carName: usedPart.carName || '',
                  model: usedPart.model || '',
                  availableQuantity: 0
                };
              }
            });
          }

          // Update the first assignment with engineer and parts
          const newAssignment = {
            id: Date.now(),
            engineer: fullEngineerData || assignedEngineer,
            parts: formattedParts,
            priority: 'medium',
            estimatedDuration: jobCardDataTemp.laborHours ? `${jobCardDataTemp.laborHours} hours` : '',
            notes: jobCardDataTemp.engineerRemarks || ''
          };

          setAssignments([newAssignment]);

          console.log('✅ Successfully set engineer:', fullEngineerData || assignedEngineer);
          console.log('✅ Successfully set parts:', formattedParts);
          console.log('📋 Assignment created:', newAssignment);
          
          // Clear temp data
          setJobCardDataTemp(null);
          
          setSnackbar({
            open: true,
            message: `✅ Job card data populated! Engineer: ${assignedEngineer.name}, Parts: ${formattedParts.length} items`,
            severity: 'success'
          });
        }
      }
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
        console.log('📋 Fetched Job Card Data:', jobCardData);

        // Enhanced job details parsing
        if (jobCardData.jobDetails) {
          try {
            // First try to parse as JSON (new format with price)
            const parsed = JSON.parse(jobCardData.jobDetails);
            if (Array.isArray(parsed)) {
              // New format: array of objects with description and price
              setParsedJobDetails(parsed);
              // Don't set jobPoints here as we want to show existing data separately
            } else {
              // Handle other JSON formats
              setParsedJobDetails([]);
            }
          } catch (e) {
            // If JSON parsing fails, treat as old string format
            console.log('Job details is in old string format, converting...');
            const lines = jobCardData.jobDetails.split('\n');
            const cleanLines = lines.map(line => line.replace(/^\d+\.\s*/, '').trim())
                                    .filter(line => line.length > 0);
            
            // Convert old format to new format with default price of 0
            const convertedJobDetails = cleanLines.map(line => ({
              description: line,
              price: 0
            }));
            
            setParsedJobDetails(convertedJobDetails);
            
            // Set jobPoints to empty array for new input
            setJobPoints([]);
          }
        } else {
          setParsedJobDetails([]);
          setJobPoints([]);
        }

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

  // Remove assignment
  const removeAssignment = (assignmentId) => {
    if (assignments.length > 1) {
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
    }
  };

  // Update assignment
  const updateAssignment = (assignmentId, field, value) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, [field]: value }
        : assignment
    ));

    if (formErrors[`assignment_${assignmentId}_${field}`]) {
      setFormErrors(prev => ({ 
        ...prev, 
        [`assignment_${assignmentId}_${field}`]: null 
      }));
    }
  };

  // Handle Part Selection (Local State Only)
  const handlePartSelection = (assignmentId, newParts, previousParts = []) => {
    try {
      // Find newly added parts
      const addedParts = newParts.filter(newPart => 
        !previousParts.some(prevPart => prevPart._id === newPart._id)
      );

      // Process newly added parts - only validate, don't update API
      for (const addedPart of addedParts) {
        // Check if part has sufficient quantity available
        const availableQuantity = getAvailableQuantity(addedPart._id);
        if (availableQuantity < 1) {
          setError(`Part "${addedPart.partName}" is out of stock!`);
          return; // Don't update the selection
        }
      }

      // Update the parts with selected quantity (local state only)
      const updatedParts = newParts.map(part => ({
        ...part,
        selectedQuantity: part.selectedQuantity || 1,
        availableQuantity: part.quantity
      }));

      // Update the assignment with new parts (local state only)
      updateAssignment(assignmentId, 'parts', updatedParts);

    } catch (err) {
      console.error('Error handling part selection:', err);
      setError('Failed to update part selection');
    }
  };

  // Handle Part Quantity Change (Local State Only)
  const handlePartQuantityChange = (assignmentId, partIndex, newQuantity, oldQuantity) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const part = assignment.parts[partIndex];
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

      // Update the part quantity in the assignment (local state only)
      const updatedParts = assignment.parts.map((p, idx) => 
        idx === partIndex 
          ? { ...p, selectedQuantity: newQuantity }
          : p
      );
      
      updateAssignment(assignmentId, 'parts', updatedParts);

      // Clear any previous errors
      if (error && error.includes(part.partName)) {
        setError(null);
      }

    } catch (err) {
      console.error('Error updating part quantity:', err);
      setError(`Failed to update quantity for "${part.partName}"`);
    }
  };

  // Handle Part Removal (Local State Only)
  const handlePartRemoval = (assignmentId, partIndex) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const part = assignment.parts[partIndex];
    if (!part) return;

    try {
      // Remove part from assignment (local state only)
      const updatedParts = assignment.parts.filter((_, idx) => idx !== partIndex);
      updateAssignment(assignmentId, 'parts', updatedParts);

    } catch (err) {
      console.error('Error removing part:', err);
      setError(`Failed to remove part "${part.partName}"`);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    
    assignments.forEach((assignment, index) => {
      const assignmentKey = `assignment_${assignment.id}`;
      
      if (!assignment.engineer) {
        errors[`${assignmentKey}_engineer`] = 'Please select an engineer';
      }
    });
    
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

  // Updated updateJobCard function to handle job details with prices
  const updateJobCard = async (jobCardId, jobDetails, partsUsed) => {
    try {
      console.log(`Updating job card ${jobCardId} with job details and parts:`, { jobDetails, partsUsed });
      
      // Validate parts data before sending
      const validatedParts = partsUsed.map(part => ({
        partId: part.partId || part._id,
        partName: part.partName || '',
        partNumber: part.partNumber || '',
        quantity: Number(part.quantity) || 1,
        pricePerUnit: Number(part.pricePerUnit) || 0,
        gstPercentage: Number(part.gstPercentage) || 0,
        totalPrice: Number((part.pricePerUnit || 0) * (part.quantity || 1)),
        gstAmount: Number(((part.pricePerUnit || 0) * (part.quantity || 1) * (part.gstPercentage || 0)) / 100),
        carName: part.carName || '',
        model: part.model || ''
      }));

      const updatePayload = {
        jobDetails: jobDetails,
        partsUsed: validatedParts
      };

      console.log('Sending update payload:', updatePayload);

      const response = await axios.put(
        `${API_BASE_URL}/jobCards/${id}`,
        updatePayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': garageToken ? `Bearer ${garageToken}` : '',
          }
        }
      );

      console.log(`Job card ${jobCardId} updated successfully:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`Failed to update job card ${jobCardId}:`, err.response?.data || err.message);
      throw err;
    }
  };

  // Updated handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setFormErrors({});

    try {
      // Get job details for API - combined existing and new
      const jobDetailsString = getJobDetailsForAPI();

      // Calculate total job details cost
      const totalJobDetailsCost = (() => {
        const existingCost = parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
        const newCost = jobPoints.reduce((total, item) => total + (item.price || 0), 0);
        return existingCost + newCost;
      })();

      // Collect all parts used across all assignments with enhanced data
      const allPartsUsed = [];
      const partUpdates = []; // Track inventory updates needed

      assignments.forEach(assignment => {
        assignment.parts.forEach(part => {
          const existingPartIndex = allPartsUsed.findIndex(p => p.partId === part._id);
          const selectedQuantity = part.selectedQuantity || 1;
          
          if (existingPartIndex !== -1) {
            allPartsUsed[existingPartIndex].quantity += selectedQuantity;
          } else {
            allPartsUsed.push({
              partId: part._id,
              partName: part.partName,
              partNumber: part.partNumber || '',
              quantity: selectedQuantity,
              pricePerUnit: part.pricePerUnit || 0,
              gstPercentage: part.gstPercentage || part.taxAmount || 0,
              carName: part.carName || '',
              model: part.model || ''
            });
          }

          // Track inventory updates needed
          const existingUpdateIndex = partUpdates.findIndex(p => p.partId === part._id);
          if (existingUpdateIndex !== -1) {
            partUpdates[existingUpdateIndex].totalUsed += selectedQuantity;
          } else {
            partUpdates.push({
              partId: part._id,
              partName: part.partName,
              totalUsed: selectedQuantity,
              originalQuantity: part.quantity
            });
          }
        });
      });

      // Update inventory for all used parts
      console.log('Updating inventory for used parts...');
      for (const partUpdate of partUpdates) {
        const currentPart = inventoryParts.find(p => p._id === partUpdate.partId);
        if (currentPart) {
          const newQuantity = currentPart.quantity - partUpdate.totalUsed;
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for "${partUpdate.partName}". Required: ${partUpdate.totalUsed}, Available: ${currentPart.quantity}`);
          }
          
          console.log(`Updating ${partUpdate.partName}: ${currentPart.quantity} -> ${newQuantity}`);
          await updatePartQuantity(partUpdate.partId, newQuantity);
        }
      }

      // Update job card with job details and parts used
      const targetJobCardIds = jobCardIds.length > 0 ? jobCardIds : [id];
      
      const jobCardUpdatePromises = targetJobCardIds.map(jobCardId => {
        if (jobCardId) {
          return updateJobCard(jobCardId, jobDetailsString, allPartsUsed);
        }
      }).filter(Boolean);

      // Process each assignment
      const assignmentPromises = assignments.map(async (assignment) => {
        const payload = {
          jobCardIds: targetJobCardIds,
          parts: assignment.parts.map(part => ({
            partId: part._id,
            partName: part.partName,
            quantity: part.selectedQuantity || 1
          })),
          priority: assignment.priority,
          notes: assignment.notes
        };

        console.log(`Assigning to engineer ${assignment.engineer._id}:`, payload);
        
        return axios.put(
          `https://garage-management-zi5z.onrender.com/api/jobcards/assign-jobcards/${assignment.engineer._id}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      });

      // Execute job card updates first
      if (jobCardUpdatePromises.length > 0) {
        console.log('Updating job cards with job details and parts used...');
        await Promise.all(jobCardUpdatePromises);
        console.log('Job cards updated successfully');
      }

      // Execute all assignments
      console.log('Assigning to engineers...');
      const results = await Promise.all(assignmentPromises);
      
      console.log('All assignments completed:', results.map(r => r.data));
      console.log('Job details updated with combined data:', jobDetailsString);
      console.log('Total job details cost:', totalJobDetailsCost);
      console.log('Parts used in job cards:', allPartsUsed);
      console.log('Inventory updated for parts:', partUpdates);
      
      // Show success message with totals
      setSnackbar({
        open: true,
        message: `✅ Assignment completed! Job Details Cost: ₹${totalJobDetailsCost.toFixed(2)}, Parts: ${allPartsUsed.length} items`,
        severity: 'success'
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/Work-In-Progress/${id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Assignment error:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Failed to assign to engineers');
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

  // Enhanced Add New Part - Based on InventoryManagement
  const handleAddPart = async () => {
    // Validation - Similar to InventoryManagement
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

    // Check for duplicate part number (if provided)
    if (newPart.partNumber && checkDuplicatePartNumber(newPart.partNumber)) {
      setPartAddError('Part number already exists. Please use a different part number.');
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      // Calculate tax amounts like in InventoryManagement
      const sgstAmount = newPart.sgstEnabled ?
        calculateTaxAmount(newPart.pricePerUnit, newPart.quantity, newPart.sgstPercentage) : 0;
      const cgstAmount = newPart.cgstEnabled ?
        calculateTaxAmount(newPart.pricePerUnit, newPart.quantity, newPart.cgstPercentage) : 0;

      const taxAmount = sgstAmount + cgstAmount;

      const requestData = {
        name: newPart.name, // Default name as per InventoryManagement
        garageId: garageId,
        quantity: parseInt(newPart.quantity),
        pricePerUnit: parseFloat(newPart.pricePerUnit),
        partNumber: newPart.partNumber,
        partName: newPart.partName,
        carName: newPart.carName,
        model: newPart.model,
        taxAmount: taxAmount
      };

      console.log('Adding inventory item with data:', requestData);

      const response = await axios.post(
        'https://garage-management-zi5z.onrender.com/api/garage/inventory/add',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Add response:', response.data);

      await fetchInventoryParts();

      setPartAddSuccess(true);
      setSnackbar({
        open: true,
        message: 'Part added successfully!',
        severity: 'success'
      });

      // Reset form like in InventoryManagement
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
      
      {/* <Snackbar 
        open={success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Assignment completed successfully!
        </Alert>
      </Snackbar> */}

      {/* Form Data Snackbar */}
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
        }}
      >
        <CssBaseline />
        <Container maxWidth="lg">
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
              <Typography variant="h5" fontWeight={600}>
                Assign Engineer & Job Details
              </Typography>
              {fetchingData && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Loading job card data...
                  </Typography>
                </Box>
              )}
              {jobCardDataTemp && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Setting up engineer and parts...
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
          </Box>

          {/* Updated Assignment Summary Card with Job Details Cost */}
          <Card sx={{ mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Assignment Summary
                {isEditMode && (
                  <Chip 
                    label="Editing Existing Job Card" 
                    color="info" 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {assignments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Assignments
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {(() => {
                        // Count existing + new job points
                        const existingCount = parsedJobDetails.length;
                        const newCount = jobPoints.length;
                        return existingCount + newCount;
                      })()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Job Details Points
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      ₹{(() => {
                        // Calculate total cost from existing + new job points
                        const existingCost = parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
                        const newCost = jobPoints.reduce((total, item) => total + (item.price || 0), 0);
                        return (existingCost + newCost).toFixed(0);
                      })()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Job Details Cost
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {new Set(assignments.filter(a => a.engineer).map(a => a.engineer._id)).size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Engineers Assigned
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {assignments.reduce((total, assignment) => total + assignment.parts.length, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Parts Selected
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Pre-loaded Engineer Info */}
              {isEditMode && assignments[0]?.engineer && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'info.main' }}>
                    📋 Pre-loaded from Job Card:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      👤 Engineer:
                    </Typography>
                    <Chip
                      label={assignments[0].engineer.name}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  {assignments[0].notes && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        💬 Engineer Remarks:
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{assignments[0].notes}"
                      </Typography>
                    </Box>
                  )}
                  {/* Show existing job details cost */}
                  {parsedJobDetails.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        💰 Existing Job Details Cost:
                      </Typography>
                      <Chip
                        label={`₹${parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0).toFixed(2)}`}
                        color="success"
                        size="small"
                      />
                    </Box>
                  )}
                </>
              )}
              
              {/* Job Details Cost Breakdown */}
              {(parsedJobDetails.length > 0 || jobPoints.length > 0) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    💰 Job Details Cost Breakdown:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {parsedJobDetails.length > 0 && (
                      <Chip
                        label={`Existing: ₹${parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0).toFixed(2)}`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    {jobPoints.length > 0 && (
                      <Chip
                        label={`New: ₹${jobPoints.reduce((total, item) => total + (item.price || 0), 0).toFixed(2)}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    <Chip
                      label={`Total: ₹${(() => {
                        const existingCost = parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
                        const newCost = jobPoints.reduce((total, item) => total + (item.price || 0), 0);
                        return (existingCost + newCost).toFixed(2);
                      })()}`}
                      color="success"
                      size="small"
                    />
                  </Box>
                </>
              )}
              
              {/* Parts Summary */}
              {(() => {
                const allPartsUsed = [];
                assignments.forEach(assignment => {
                  assignment.parts.forEach(part => {
                    const existingPartIndex = allPartsUsed.findIndex(p => p._id === part._id);
                    const selectedQuantity = part.selectedQuantity || 1;
                    
                    if (existingPartIndex !== -1) {
                      allPartsUsed[existingPartIndex].quantity += selectedQuantity;
                    } else {
                      allPartsUsed.push({ ...part, quantity: selectedQuantity });
                    }
                  });
                });
                
                if (allPartsUsed.length > 0) {
                  return (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        {isEditMode ? '🔧 Parts from Job Card:' : '🔧 Parts to be Updated in Job Card:'}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {allPartsUsed.map((part, index) => (
                          <Chip
                            key={index}
                            label={`${part.partName} (Qty: ${part.quantity})`}
                            color={isEditMode ? "secondary" : "info"}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {isEditMode 
                          ? `These parts were previously used in job card: ${id}`
                          : `These parts will be added to the partsUsed field in job card${jobCardIds.length > 1 ? 's' : ''}: ${(jobCardIds.length > 0 ? jobCardIds : [id]).join(', ')}`
                        }
                      </Typography>
                    </>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>

          {/* Enhanced Job Details Section with Price */}
          <Card sx={{ mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Job Details (Point-wise with Pricing)
              </Typography>
              <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {/* Input section for adding new job points */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <TextField
                        fullWidth
                        placeholder="Enter job detail description..."
                        value={currentJobPoint.description}
                        onChange={(e) => handleJobPointInputChange('description', e.target.value)}
                        onKeyPress={handleJobPointKeyPress}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ flex: 2, minWidth: '200px' }}
                      />
                      
                      <TextField
                        label="Price (₹)"
                        type="number"
                        placeholder="0.00"
                        value={currentJobPoint.price}
                        onChange={(e) => handleJobPointInputChange('price', e.target.value)}
                        onKeyPress={handleJobPointKeyPress}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{ 
                          min: 0, 
                          step: 0.01 
                        }}
                        sx={{ flex: 1, minWidth: '120px' }}
                      />
                      
                      <Button
                        variant="contained"
                        onClick={addJobPoint}
                        disabled={!currentJobPoint.description.trim() || !currentJobPoint.price}
                        startIcon={<AddIcon />}
                        sx={{ minWidth: 120 }}
                      >
                        Add Point
                      </Button>
                    </Box>

                    {/* Display current job points being added */}
                    {jobPoints.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Current Job Details Points:
                        </Typography>
                        <List sx={{ 
                          bgcolor: 'background.paper', 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 1,
                          mb: 2
                        }}>
                          {jobPoints.map((point, index) => (
                            <ListItem key={index} divider>
                              <ListItemText 
                                primary={point.description}
                                secondary={`Price: ₹${point.price.toFixed(2)}`}
                                sx={{ wordBreak: 'break-word' }}
                              />
                              <ListItemSecondaryAction>
                                <IconButton 
                                  edge="end" 
                                  onClick={() => removeJobPoint(index)} 
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                        
                        {/* Total Price Summary */}
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText',
                          borderRadius: 1,
                          mb: 2
                        }}>
                          <Typography variant="h6" fontWeight={600}>
                            Total New Job Details Cost: ₹{calculateJobDetailsTotal().toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Display existing job details from job card (if any) */}
                    {parsedJobDetails.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'info.main' }}>
                          📋 Existing Job Details from Job Card:
                        </Typography>
                        <List sx={{ 
                          bgcolor: 'background.paper', 
                          border: 1, 
                          borderColor: 'info.main', 
                          borderRadius: 1 
                        }}>
                          {parsedJobDetails.map((item, index) => (
                            <ListItem key={index} divider>
                              <ListItemText 
                                primary={`Description: ${item.description}`} 
                                secondary={`Price: ₹${item.price}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        {/* Total from existing job details */}
                        <Box sx={{ 
                          mt: 1,
                          p: 1, 
                          bgcolor: 'info.main', 
                          color: 'info.contrastText',
                          borderRadius: 1
                        }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Existing Total: ₹{parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* API Preview */}
                    {/* {jobPoints.length > 0 && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Preview (JSON format sent to API):
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-line', 
                            fontFamily: 'monospace', 
                            color: 'text.primary',
                            fontSize: '0.75rem'
                          }}
                        >
                          {JSON.stringify(jobPoints, null, 2)}
                        </Typography>
                      </Box>
                    )} */}
                  </Grid>
                </Grid>
              </Paper>
            </CardContent>
          </Card>

          {/* Main Form Card */}
          <Card sx={{ mb: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={600}>
                    Engineer Assignments
                  </Typography>
                </Box>

                {/* Assignments */}
                {assignments.map((assignment, index) => (
                  <Accordion 
                    key={assignment.id} 
                    defaultExpanded 
                    sx={{ 
                      mb: 2, 
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                        <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                          Assignment #{index + 1}
                          {assignment.engineer && (
                            <Chip 
                              label={assignment.engineer.name} 
                              size="small" 
                              sx={{ ml: 1 }} 
                              color="primary"
                            />
                          )}
                          <Chip 
                            label={assignment.priority} 
                            size="small" 
                            sx={{ ml: 1 }} 
                            color={getPriorityColor(assignment.priority)}
                          />
                          {assignment.parts.length > 0 && (
                            <Chip 
                              label={`${assignment.parts.length} parts`} 
                              size="small" 
                              sx={{ ml: 1 }} 
                              color="info"
                            />
                          )}
                        </Typography>
                        {assignments.length > 1 && (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAssignment(assignment.id);
                            }}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {/* Engineer Selection */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
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
                              getOptionLabel={(option) => option.name || ''}
                              value={assignment.engineer}
                              onChange={(event, newValue) => {
                                updateAssignment(assignment.id, 'engineer', newValue);
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
                            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                              ✅ This engineer was pre-selected from the job card
                            </Typography>
                          )}
                        </Grid>

                        {/* Priority Selection */}
                        <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Priority
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={assignment.priority}
                              onChange={(e) => updateAssignment(assignment.id, 'priority', e.target.value)}
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
                            alignItems: 'center', 
                            mb: 1,
                            flexWrap: 'wrap',
                            gap: 1
                          }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Select Parts (Optional)
                            </Typography>
                            <Tooltip title="Add New Part">
                              <Button
                                variant="outlined"
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
                              options={inventoryParts.filter(part => getAvailableQuantity(part._id) > 0)}
                              getOptionLabel={(option) => 
                                `${option.partName} (${option.partNumber || 'N/A'}) - ₹${option.pricePerUnit || 0} | GST: ${option.gstPercentage || option.taxAmount || 0}% | Available: ${getAvailableQuantity(option._id)}`
                              }
                              value={assignment.parts}
                              onChange={(event, newValue) => {
                                handlePartSelection(assignment.id, newValue, assignment.parts);
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
                          {assignment.parts.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Selected Parts with Details:
                                {isEditMode && (
                                  <Chip 
                                    label="Pre-loaded from Job Card" 
                                    size="small" 
                                    color="secondary" 
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Typography>
                              <List dense>
                                {assignment.parts.map((part, partIndex) => {
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
                                  // This is the current available quantity + already selected quantity for this specific part
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
                                                  handlePartQuantityChange(assignment.id, partIndex, newQuantity, selectedQuantity);
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

                                                handlePartQuantityChange(assignment.id, partIndex, newQuantity, oldQuantity);
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
                                                  handlePartQuantityChange(assignment.id, partIndex, newQuantity, selectedQuantity);
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
                                            onClick={() => handlePartRemoval(assignment.id, partIndex)}
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
                                              GST: ₹{gstPercentage}
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
                                const grandTotal = assignment.parts.reduce((total, part) => {
                                  const selectedQuantity = part.selectedQuantity || 1;
                                  const unitPrice = part.pricePerUnit || 0;
                                  const gstPercentage = part.gstPercentage || part.taxAmount || 0;
                                  const totalPrice = unitPrice * selectedQuantity;
                                  const gstAmount = (totalPrice * gstPercentage) / 100;
                                  return total + totalPrice + gstAmount;
                                }, 0);
                                return (
                                  <Box sx={{ mt: 1, p: 1, backgroundColor: 'primary.main', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={600} color="primary.contrastText">
                                      Assignment Parts Total: ₹{grandTotal.toFixed(2)}
                                    </Typography>
                                  </Box>
                                );
                              })()}
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {/* Submit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={isSubmitting || isLoading}
                    sx={{ px: 6, py: 1.5, textTransform: 'uppercase' }}
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

            {/* Tax Section - Based on InventoryManagement */}
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

        {/* Add Engineer Dialog */}
        <Dialog 
          open={openAddEngineerDialog} 
          onClose={handleCloseAddEngineerDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { bgcolor: 'background.paper' }
          }}
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