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

  // Updated job details state to include pricing
  const [jobPoints, setJobPoints] = useState([]);
  const [currentJobPoint, setCurrentJobPoint] = useState({
    description: '',
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
        quantity: Number(part.quantity || 1),
        pricePerPiece: parseFloat((part.pricePerPiece || 0).toFixed(2)),
        totalPrice: parseFloat((part.totalPrice || 0).toFixed(2))
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

  // **ALTERNATIVE: Update job card when part quantity changes**
  const handlePartQuantityChange = async (assignmentId, partIndex, newQuantity, oldQuantity) => {
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

      // Update the part quantity in the assignment (local state)
      const updatedParts = assignment.parts.map((p, idx) =>
        idx === partIndex
          ? { ...p, selectedQuantity: newQuantity }
          : p
      );

      updateAssignment(assignmentId, 'parts', updatedParts);

      if (id && updatedParts.length > 0) {
        await updateJobCardWithParts(updatedParts);
      }

      if (error && error.includes(part.partName)) {
        setError(null);
      }

    } catch (err) {
      console.error('Error updating part quantity:', err);
      setError(`Failed to update quantity for "${part.partName}"`);
    }
  };

  // **ENHANCED: Update job card when parts are removed**
  const handlePartRemoval = async (assignmentId, partIndex) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const part = assignment.parts[partIndex];
    if (!part) return;

    try {
      // Remove part from assignment (local state)
      const updatedParts = assignment.parts.filter((_, idx) => idx !== partIndex);
      updateAssignment(assignmentId, 'parts', updatedParts);

      if (id && updatedParts.length > 0) {
        await updateJobCardWithParts(updatedParts);
      }

      setSnackbar({
        open: true,
        message: `Part "${part.partName}" removed`,
        severity: 'info'
      });

    } catch (err) {
      console.error('Error removing part:', err);
      setError(`Failed to remove part "${part.partName}"`);
    }
  };

  // **ENHANCED: Collect all parts from all assignments for job card update**
  const getAllSelectedParts = () => {
    const allPartsUsed = [];

    // First, add existing parts from job card data
    if (jobCardDataTemp && jobCardDataTemp.partsUsed) {
      jobCardDataTemp.partsUsed.forEach(existingPart => {
        allPartsUsed.push({
          partName: existingPart.partName,
          quantity: existingPart.quantity,
          pricePerPiece: existingPart.pricePerPiece,
          totalPrice: existingPart.totalPrice,
          _id: existingPart._id,
          isExisting: true
        });
      });
    }

    // Then add parts from assignments
    assignments.forEach(assignment => {
      assignment.parts.forEach(part => {
        const existingIndex = allPartsUsed.findIndex(p => p.partName === part.partName);

        // For pre-loaded parts, use original values from job card
        if (part.isPreLoaded) {
          const qty = part.originalQuantity || part.selectedQuantity || 1;
          const pricePerPiece = part.originalPricePerPiece || part.sellingPrice || 0;
          const totalPrice = part.originalTotalPrice || (pricePerPiece * qty);

          if (existingIndex !== -1) {
            // Update existing part with new data
            allPartsUsed[existingIndex] = {
              ...allPartsUsed[existingIndex],
              quantity: qty,
              pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
              totalPrice: parseFloat(totalPrice.toFixed(2))
            };
          } else {
            allPartsUsed.push({
              partName: part.partName,
              quantity: qty,
              pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
              totalPrice: parseFloat(totalPrice.toFixed(2))
            });
          }
        } else {
          // For newly added parts, calculate normally
          const qty = part.selectedQuantity || 1;
          // Get the selling price from the part (could be from inventory or job card)
          const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
          const taxRate = Number(part.taxAmount || part.gstPercentage || 0); // percentage
          const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100); // sellingPrice + taxAmount

          if (existingIndex !== -1) {
            // Update existing part with new data
            allPartsUsed[existingIndex] = {
              ...allPartsUsed[existingIndex],
              quantity: qty,
              pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
              totalPrice: parseFloat((pricePerPiece * qty).toFixed(2))
            };
          } else {
            // If sellingPrice is 0, try to find the part in inventory to get correct pricing
            if (pricePerPiece === 0) {
              const inventoryPart = inventoryParts.find(invPart =>
                invPart.partName === part.partName ||
                invPart._id === part._id
              );
              if (inventoryPart) {
                const sellingPrice = Number(inventoryPart.sellingPrice || inventoryPart.pricePerUnit || 0);
                const taxRate = Number(inventoryPart.taxAmount || inventoryPart.gstPercentage || 0);
                const newPricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);

                allPartsUsed.push({
                  partName: part.partName,
                  quantity: qty,
                  pricePerPiece: parseFloat(newPricePerPiece.toFixed(2)),
                  totalPrice: parseFloat((newPricePerPiece * qty).toFixed(2))
                });
              } else {
                allPartsUsed.push({
                  partName: part.partName,
                  quantity: qty,
                  pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
                  totalPrice: parseFloat((pricePerPiece * qty).toFixed(2))
                });
              }
            } else {
              allPartsUsed.push({
                partName: part.partName,
                quantity: qty,
                pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
                totalPrice: parseFloat((pricePerPiece * qty).toFixed(2))
              });
            }
          }
        }
      });
    });
    return allPartsUsed;
  };

  // **ENHANCED: Update job card with all parts from all assignments**
  const updateJobCardWithAllParts = async () => {
    try {
      const allParts = getAllSelectedParts();

      if (id) {
        await updateJobCard(id, null, allParts);
      }
    } catch (error) {
      console.error('Error updating job card with all parts:', error);
      throw error;
    }
  };


  // Updated job details functions with pricing
  const addJobPoint = () => {
    if (currentJobPoint.description.trim()) {
      const newJobPoint = {
        id: Date.now(), // Simple ID generation
        description: currentJobPoint.description.trim()
      };

      setJobPoints(prev => [...prev, newJobPoint]);

      // Clear the input fields
      setCurrentJobPoint({ description: '' });
    }
  };

  const removeJobPoint = (indexToRemove) => {
    setJobPoints(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle input changes
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

  // Debug function to check inventory status (only call when needed)
  const debugInventoryStatus = () => {
    console.log('🔍 Inventory Debug Info:', {
      totalInventoryParts: inventoryParts.length,
      partsWithLowStock: inventoryParts.filter(part => part.quantity < 5).map(part => ({
        name: part.partName,
        quantity: part.quantity,
        available: getAvailableQuantity(part._id)
      })),
      assignments: assignments.map(assignment => ({
        assignmentId: assignment.id,
        partsCount: assignment.parts.length,
        preLoadedCount: assignment.parts.filter(p => p.isPreLoaded).length,
        userSelectedCount: assignment.parts.filter(p => !p.isPreLoaded).length,
        allParts: assignment.parts.map(p => ({ name: p.partName, isPreLoaded: p.isPreLoaded }))
      })),
      allPartsForAPI: getAllPartsForAPI().map(p => ({ name: p.partName, isPreLoaded: p.isPreLoaded }))
    });
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

  const removeExistingJobPoint = (indexToRemove) => {
    setParsedJobDetails(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Helper function to get available quantity considering all current selections
  const getAvailableQuantity = (partId) => {
    const originalPart = inventoryParts.find(p => p._id === partId);
    if (!originalPart) {
      return 0;
    }

    let totalSelected = 0;
    assignments.forEach(assignment => {
      assignment.parts.forEach(part => {
        // Only count user-selected parts, not pre-loaded parts
        if (part._id === partId && !part.isPreLoaded) {
          totalSelected += part.selectedQuantity || 1;
        }
      });
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


      // Set engineer and parts in assignments if they exist
      if (jobCardDataTemp.engineerId && jobCardDataTemp.engineerId.length > 0) {
        const assignedEngineer = jobCardDataTemp.engineerId[0]; // Get first engineer

        // Find the full engineer object from the engineers list
        const fullEngineerData = engineers.find(eng => eng._id === assignedEngineer._id);


        if (fullEngineerData || assignedEngineer) {
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
                // If part not found in inventory, create a mock part object with default pricing
                // Use the pricePerPiece from the job card data if available
                const pricePerPiece = usedPart.pricePerPiece || 0;
                const sellingPrice = pricePerPiece > 0 ? pricePerPiece : 100; // Default to 100 if no price
                const taxRate = 0; // Default tax rate

                return {
                  _id: usedPart._id || `mock-${Date.now()}-${usedPart.partName || 'unknown'}`,
                  partName: usedPart.partName || 'Unknown Part',
                  partNumber: usedPart.partNumber || '',
                  quantity: 0, // No stock available
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



          // Clear temp data
          setJobCardDataTemp(null);

          setSnackbar({
            open: true,
            message: `✅ Job card data populated! Engineer: ${assignedEngineer.name || assignedEngineer.email || 'Unknown Engineer'}, Parts: ${formattedParts.length} items`,
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


  const handlePartSelection = async (assignmentId, newParts, previousParts = []) => {
    try {
      console.log('🔄 Part selection triggered:', {
        assignmentId,
        newParts: newParts,
        previousParts: previousParts,
        newPartsLength: newParts.length,
        previousPartsLength: previousParts.length
      });

      const currentAssignment = assignments.find(a => a.id === assignmentId);
      if (!currentAssignment) {
        console.error('❌ Assignment not found:', assignmentId);
        return;
      }

      // Keep existing pre-loaded parts
      const existingPreLoadedParts = currentAssignment.parts.filter(part => part.isPreLoaded);

      // Process new parts (user-selected parts)
      const processedNewParts = newParts
        .filter(part => !part.isPreLoaded) // Only process non-pre-loaded parts
        .map(part => ({
          ...part,
          selectedQuantity: part.selectedQuantity || 1,
          isPreLoaded: false
        }));

      const allParts = [...existingPreLoadedParts, ...processedNewParts];

      console.log('📦 Processed parts:', {
        assignmentId,
        existingPreLoadedParts: existingPreLoadedParts.length,
        processedNewParts: processedNewParts.length,
        totalParts: allParts.length,
        allParts: allParts.map(p => ({ name: p.partName, isPreLoaded: p.isPreLoaded }))
      });

      updateAssignment(assignmentId, 'parts', allParts);

      if (id && allParts.length > 0) {
        await updateJobCardWithParts(allParts);
      }

    } catch (err) {
      console.error('❌ Error handling part selection:', err);
      setError('Failed to update part selection and job card');
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

  // Enhanced function to collect all parts (pre-loaded + user-selected) for API
  const getAllPartsForAPI = () => {
    const allParts = [];

    assignments.forEach(assignment => {
      assignment.parts.forEach(part => {
        const selectedQuantity = part.selectedQuantity || 1;

        // For pre-loaded parts, use original values from job card
        if (part.isPreLoaded) {
          const quantity = part.originalQuantity || selectedQuantity;
          const pricePerPiece = part.originalPricePerPiece || part.sellingPrice || 0;
          const totalPrice = part.originalTotalPrice || (pricePerPiece * quantity);

          allParts.push({
            partName: part.partName,
            quantity: quantity,
            pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
            totalPrice: parseFloat(totalPrice.toFixed(2)),
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
            quantity: selectedQuantity,
            pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
            totalPrice: parseFloat(totalPrice.toFixed(2)),
            isPreLoaded: false
          });
        }
      });
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
        quantity: Number(part.quantity || 1),
        pricePerPiece: parseFloat((part.pricePerPiece || 0).toFixed(2)),
        totalPrice: parseFloat((part.totalPrice || 0).toFixed(2))
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
      const allPartsUsed = getAllPartsForAPI();
      const partUpdates = []; // Track inventory updates needed

      // Track inventory updates needed (only for user-selected parts)
      assignments.forEach(assignment => {
        assignment.parts.forEach(part => {
          if (!part.isPreLoaded) {
            const selectedQuantity = part.selectedQuantity || 1;
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
          }
        });
      });

      // Update inventory for all used parts
      for (const partUpdate of partUpdates) {
        const currentPart = inventoryParts.find(p => p._id === partUpdate.partId);
        if (currentPart) {
          const newQuantity = currentPart.quantity - partUpdate.totalUsed;
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for "${partUpdate.partName}". Required: ${partUpdate.totalUsed}, Available: ${currentPart.quantity}`);
          }

          await updatePartQuantity(partUpdate.partId, newQuantity);
        }
      }

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

      // Process each assignment
      const assignmentPromises = assignments.map(async (assignment) => {
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
        await Promise.all(jobCardUpdatePromises);
      }

      // Execute all assignments
      const results = await Promise.all(assignmentPromises);


      // Calculate total cost for success message
      const totalCost = (() => {
        const jobDetailsCost = totalJobDetailsCost;
        const partsCost = allPartsUsed.reduce((total, part) => total + (part.totalPrice || 0), 0);
        return jobDetailsCost + partsCost;
      })();

      // Calculate pre-loaded vs user-selected parts
      const preLoadedParts = allPartsUsed.filter(part => part.isPreLoaded);
      const userSelectedParts = allPartsUsed.filter(part => !part.isPreLoaded);

      // Show success message with detailed breakdown
      const successMessage = `✅ Assignment completed! 
        Total Cost: ₹${totalCost.toFixed(2)} 
        (Job Details: ₹${totalJobDetailsCost.toFixed(2)} + Parts: ₹${(totalCost - totalJobDetailsCost).toFixed(2)}) 
        Parts: ${preLoadedParts.length} pre-loaded + ${userSelectedParts.length} user-selected = ${allPartsUsed.length} total`;

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
                <Grid item xs={6} sm={2.4}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      {assignments.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Total Assignments
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      {(() => {
                        const existingCount = parsedJobDetails.length;
                        const newCount = jobPoints.length;
                        return existingCount + newCount;
                      })()}
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
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="success.main"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      ₹{(() => {
                        // Calculate job details cost
                        const existingCost = parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
                        const newCost = jobPoints.reduce((total, item) => total + (item.price || 0), 0);
                        const jobDetailsCost = existingCost + newCost;

                        // Calculate parts cost
                        const partsCost = assignments.reduce((total, assignment) => {
                          return total + assignment.parts.reduce((partTotal, part) => {
                            const selectedQuantity = part.selectedQuantity || 1;
                            const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
                            const taxRate = Number(part.taxAmount || part.gstPercentage || 0);
                            const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
                            const partTotalPrice = pricePerPiece * selectedQuantity;
                            return partTotal + partTotalPrice;
                          }, 0);
                        }, 0);

                        // Return total cost (job details + parts)
                        return (jobDetailsCost + partsCost).toFixed(0);
                      })()}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Total Job Cost
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      {new Set(assignments.filter(a => a.engineer).map(a => a.engineer._id)).size}
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
                <Grid item xs={6} sm={2.4}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                    >
                      {assignments.reduce((total, assignment) => total + assignment.parts.length, 0)}
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
              </Grid>

              {/* Pre-loaded Engineer Info */}
              {isEditMode && assignments[0]?.engineer && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'info.main',
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    📋 Pre-loaded from Job Card:
                  </Typography>
                  <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                    icon={<InventoryIcon />}
                  >
                    <Typography variant="body2">
                      The following data was automatically loaded from the job card and will be included in the work progress update.
                    </Typography>
                  </Alert>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      👤 Engineer:
                    </Typography>
                    <Chip
                      label={assignments[0].engineer.name || assignments[0].engineer.email || 'Unknown Engineer'}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  {assignments[0].notes && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        💬 Engineer Remarks:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          wordBreak: 'break-word',
                          maxWidth: { xs: '100%', sm: '60%' }
                        }}
                      >
                        "{assignments[0].notes}"
                      </Typography>
                    </Box>
                  )}
                  {parsedJobDetails.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                  {(() => {
                    // Calculate pre-loaded parts cost
                    const preLoadedPartsCost = assignments.reduce((total, assignment) => {
                      return total + assignment.parts.filter(part => part.isPreLoaded).reduce((partTotal, part) => {
                        const selectedQuantity = part.selectedQuantity || 1;
                        const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
                        const taxRate = Number(part.taxAmount || part.gstPercentage || 0);
                        const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
                        const partTotalPrice = pricePerPiece * selectedQuantity;
                        return partTotal + partTotalPrice;
                      }, 0);
                    }, 0);

                    // Calculate user-selected parts cost
                    const userSelectedPartsCost = assignments.reduce((total, assignment) => {
                      return total + assignment.parts.filter(part => !part.isPreLoaded).reduce((partTotal, part) => {
                        const selectedQuantity = part.selectedQuantity || 1;
                        const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
                        const taxRate = Number(part.taxAmount || part.gstPercentage || 0);
                        const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
                        const partTotalPrice = pricePerPiece * selectedQuantity;
                        return partTotal + partTotalPrice;
                      }, 0);
                    }, 0);

                    const totalPartsCost = preLoadedPartsCost + userSelectedPartsCost;

                    if (totalPartsCost > 0) {
                      return (
                        <>
                          {preLoadedPartsCost > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" color="text.secondary">
                                📋 Pre-loaded Parts Cost:
                              </Typography>
                              <Chip
                                label={`₹${preLoadedPartsCost.toFixed(2)}`}
                                color="info"
                                size="small"
                              />
                            </Box>
                          )}
                          {userSelectedPartsCost > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" color="text.secondary">
                                🔧 User Selected Parts Cost:
                              </Typography>
                              <Chip
                                label={`₹${userSelectedPartsCost.toFixed(2)}`}
                                color="primary"
                                size="small"
                              />
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary">
                              🔧 Total Parts Cost:
                            </Typography>
                            <Chip
                              label={`₹${totalPartsCost.toFixed(2)}`}
                              color="warning"
                              size="small"
                            />
                          </Box>
                        </>
                      );
                    }
                    return null;
                  })()}
                </>
              )}

              {/* Total Cost Breakdown */}
              {(parsedJobDetails.length > 0 || jobPoints.length > 0 || assignments.some(a => a.parts.length > 0)) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    💰 Total Cost Breakdown:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {/* Job Details Cost */}
                    {(() => {
                      const existingCost = parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
                      const newCost = jobPoints.reduce((total, item) => total + (item.price || 0), 0);
                      const jobDetailsCost = existingCost + newCost;

                      if (jobDetailsCost > 0) {
                        return (
                          <>
                            {parsedJobDetails.length > 0 && (
                              <Chip
                                label={`Job Details (Existing): ₹${existingCost.toFixed(2)}`}
                                color="secondary"
                                variant="outlined"
                                size="small"
                              />
                            )}
                            {jobPoints.length > 0 && (
                              <Chip
                                label={`Job Details (New): ₹${newCost.toFixed(2)}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            )}
                            <Chip
                              label={`Job Details Total: ₹${jobDetailsCost.toFixed(2)}`}
                              color="info"
                              size="small"
                            />
                          </>
                        );
                      }
                      return null;
                    })()}

                    {/* Parts Cost */}
                    {(() => {
                      const partsCost = assignments.reduce((total, assignment) => {
                        return total + assignment.parts.reduce((partTotal, part) => {
                          const selectedQuantity = part.selectedQuantity || 1;
                          const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
                          const taxRate = Number(part.taxAmount || part.gstPercentage || 0);
                          const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
                          const partTotalPrice = pricePerPiece * selectedQuantity;
                          return partTotal + partTotalPrice;
                        }, 0);
                      }, 0);

                      if (partsCost > 0) {
                        return (
                          <Chip
                            label={`Parts Cost: ₹${partsCost.toFixed(2)}`}
                            color="warning"
                            size="small"
                          />
                        );
                      }
                      return null;
                    })()}

                    {/* Total Cost */}
                    {(() => {
                      const existingCost = parsedJobDetails.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
                      const newCost = jobPoints.reduce((total, item) => total + (item.price || 0), 0);
                      const jobDetailsCost = existingCost + newCost;

                      const partsCost = assignments.reduce((total, assignment) => {
                        return total + assignment.parts.reduce((partTotal, part) => {
                          const selectedQuantity = part.selectedQuantity || 1;
                          const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
                          const taxRate = Number(part.taxAmount || part.gstPercentage || 0);
                          const pricePerPiece = sellingPrice + (sellingPrice * taxRate / 100);
                          const partTotalPrice = pricePerPiece * selectedQuantity;
                          return partTotal + partTotalPrice;
                        }, 0);
                      }, 0);

                      const totalCost = jobDetailsCost + partsCost;

                      if (totalCost > 0) {
                        return (
                          <Chip
                            label={`Grand Total: ₹${totalCost.toFixed(2)}`}
                            color="success"
                            size="small"
                          />
                        );
                      }
                      return null;
                    })()}
                  </Box>
                </>
              )}

              {/* Parts Summary */}
              {(() => {
                const preLoadedParts = [];
                const userSelectedParts = [];

                assignments.forEach(assignment => {
                  assignment.parts.forEach(part => {
                    const selectedQuantity = part.selectedQuantity || 1;

                    if (part.isPreLoaded) {
                      const existingIndex = preLoadedParts.findIndex(p => p._id === part._id);
                      if (existingIndex !== -1) {
                        preLoadedParts[existingIndex].quantity += selectedQuantity;
                      } else {
                        preLoadedParts.push({ ...part, quantity: selectedQuantity });
                      }
                    } else {
                      const existingIndex = userSelectedParts.findIndex(p => p._id === part._id);
                      if (existingIndex !== -1) {
                        userSelectedParts[existingIndex].quantity += selectedQuantity;
                      } else {
                        userSelectedParts.push({ ...part, quantity: selectedQuantity });
                      }
                    }
                  });
                });

                if (preLoadedParts.length > 0 || userSelectedParts.length > 0) {
                  return (
                    <>
                      <Divider sx={{ my: 2 }} />

                      {/* User Selected Parts Summary - Display First */}
                      {userSelectedParts.length > 0 && (
                        <>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              mb: 1,
                              fontWeight: 600,
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              color: 'primary.main'
                            }}
                          >
                            🔧 User Selected Parts:
                          </Typography>
                          <Alert
                            severity="success"
                            sx={{ mb: 2 }}
                            icon={<AddIcon />}
                          >
                            <Typography variant="body2">
                              These are newly selected parts that will be added to the job card along with the pre-loaded parts.
                            </Typography>
                          </Alert>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {userSelectedParts.map((part, index) => (
                              <Chip
                                key={index}
                                label={`${part.partName} (Qty: ${part.quantity})`}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Box>
                        </>
                      )}

                      {/* Pre-loaded Parts Summary - Display Second */}
                      {preLoadedParts.length > 0 && (
                        <>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              mb: 1,
                              fontWeight: 600,
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              color: 'info.main'
                            }}
                          >
                            📋 Pre-loaded Parts from Job Card:
                          </Typography>
                          <Alert
                            severity="info"
                            sx={{ mb: 2 }}
                            icon={<InventoryIcon />}
                          >
                            <Typography variant="body2">
                              These parts were automatically loaded from the job card and will be included in the work progress update.
                            </Typography>
                          </Alert>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {preLoadedParts.map((part, index) => (
                              <Chip
                                key={index}
                                label={`${part.partName} (Qty: ${part.quantity})`}
                                color="info"
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Box>
                        </>
                      )}

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: 'block',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        {isEditMode
                          ? `All parts (pre-loaded + user-selected) will be updated in job card: ${id}`
                          : `All parts will be added to the partsUsed field in job card${jobCardIds.length > 1 ? 's' : ''}: ${(jobCardIds.length > 0 ? jobCardIds : [id]).join(', ')}`
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
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Job Details (Point-wise)
              </Typography>
              <Paper sx={{ p: { xs: 2, sm: 3 }, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
                        sx={{ flex: 2, minWidth: { xs: '100%', sm: '200px' } }}
                      />
                      <Button
                        variant="contained"
                        onClick={addJobPoint}
                        disabled={!currentJobPoint.description.trim()}
                        startIcon={<AddIcon />}
                        sx={{
                          minWidth: { xs: '100%', sm: '120px' },
                          mt: { xs: 1, sm: 0 }
                        }}
                      >
                        Add Point
                      </Button>
                    </Box>

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
                            <ListItem key={index} divider sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
                              <ListItemText
                                primary={point.description}
                                sx={{
                                  wordBreak: 'break-word',
                                  mb: { xs: 1, sm: 0 }
                                }}
                              />
                              <ListItemSecondaryAction sx={{ position: { xs: 'static', sm: 'absolute' } }}>
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
                      </Box>
                    )}

                    {parsedJobDetails.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{
                            color: 'info.main',
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }}
                        >
                          📋 Existing Job Details from Job Card:
                        </Typography>
                        <List sx={{
                          bgcolor: 'background.paper',
                          border: 1,
                          borderColor: 'info.main',
                          borderRadius: 1
                        }}>
                          {parsedJobDetails.map((item, index) => (
                            <ListItem key={index} divider sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
                              <ListItemText
                                primary={`Description: ${item.description}`}
                                sx={{
                                  wordBreak: 'break-word',
                                  mb: { xs: 1, sm: 0 }
                                }}
                              />
                              <ListItemSecondaryAction sx={{ position: { xs: 'static', sm: 'absolute' } }}>
                                <IconButton
                                  edge="end"
                                  onClick={() => removeExistingJobPoint(index)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </CardContent>
          </Card>

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
                          Assignment #{index + 1}
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
                            alignItems: { xs: 'stretch', sm: 'center' },
                            mb: 1,
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 1
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                              >
                                Select Parts (Optional)
                              </Typography>
                              <Tooltip title="You can select multiple parts at once. Use Ctrl/Cmd + Click to select multiple parts.">
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ cursor: 'help' }}
                                >
                                  ℹ️
                                </Typography>
                              </Tooltip>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
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
                              <Tooltip title="Debug Inventory Status (Check Console)">
                                <Button
                                  variant="outlined"
                                  color="secondary"
                                  size="small"
                                  onClick={debugInventoryStatus}
                                  sx={{ flex: { xs: 1, sm: 'none' } }}
                                >
                                  Debug
                                </Button>
                              </Tooltip>
                            </Box>
                          </Box>

                          {/* Pre-loaded Parts Notice */}
                          {assignment.parts.filter(part => part.isPreLoaded).length > 0 && (
                            <Alert
                              severity="info"
                              sx={{ mb: 2 }}
                              icon={<InventoryIcon />}
                            >
                              <Typography variant="body2">
                                <strong>Pre-loaded parts detected:</strong> {assignment.parts.filter(part => part.isPreLoaded).length} parts from the job card are already included and will be sent to the work progress API.
                              </Typography>
                            </Alert>
                          )}

                          {/* No Parts Available Notice */}
                          {(() => {
                            const availableParts = inventoryParts.filter(part => {
                              const isAlreadySelected = assignment.parts.some(selectedPart => selectedPart._id === part._id);
                              const hasAvailableQuantity = getAvailableQuantity(part._id) > 0;
                              return isAlreadySelected || hasAvailableQuantity;
                            });

                            if (availableParts.length === 0 && !isLoadingInventory) {
                              return (
                                <Alert
                                  severity="warning"
                                  sx={{ mb: 2 }}
                                  icon={<InventoryIcon />}
                                >
                                  <Typography variant="body2">
                                    <strong>No parts available:</strong> All parts in inventory are either out of stock or already selected. You can add new parts using the "Add Part" button.
                                  </Typography>
                                </Alert>
                              );
                            }
                            return null;
                          })()}

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
                              options={inventoryParts.filter(part => {
                                // Allow parts that are already selected or have available quantity
                                const isAlreadySelected = assignment.parts.some(selectedPart => selectedPart._id === part._id);
                                const hasAvailableQuantity = getAvailableQuantity(part._id) > 0;
                                return isAlreadySelected || hasAvailableQuantity;
                              })}
                              getOptionLabel={(option) => {
                                const available = getAvailableQuantity(option._id);
                                const stockStatus = available <= 2 ? '⚠️ LOW STOCK' : available <= 5 ? '⚠️' : '';
                                return `${option.partName} (${option.partNumber || 'N/A'}) - ₹${option.pricePerUnit || 0} | GST: ${option.gstPercentage || option.taxAmount || 0}% | Available: ${available} ${stockStatus}`;
                              }}
                              isOptionEqualToValue={(option, value) => {
                                if (!option || !value) return false;
                                return option._id === value._id || option.id === value.id;
                              }}
                              value={assignment.parts.filter(part => !part.isPreLoaded)} // Only show user-selected parts in the dropdown
                              onChange={(event, newValue) => {
                                console.log('🔄 Autocomplete onChange:', {
                                  newValue: newValue,
                                  newValueLength: newValue.length,
                                  assignmentId: assignment.id
                                });
                                handlePartSelection(assignment.id, newValue, assignment.parts);
                              }}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip
                                    variant="outlined"
                                    color={option.isPreLoaded ? "info" : "primary"}
                                    label={`${option.partName} (${option.partNumber || 'N/A'}) - Qty: ${option.selectedQuantity || 1} @ ₹${option.pricePerUnit || 0}`}
                                    {...getTagProps({ index })}
                                    key={option._id}
                                    sx={{
                                      fontSize: '0.75rem',
                                      '& .MuiChip-label': {
                                        fontSize: '0.75rem'
                                      }
                                    }}
                                  />
                                ))
                              }
                              renderOption={(props, option) => {
                                const available = getAvailableQuantity(option._id);
                                const stockStatus = available <= 2 ? '⚠️ LOW STOCK' : available <= 5 ? '⚠️' : '';
                                return (
                                  <Box component="li" {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Typography variant="body2" noWrap sx={{ width: '100%', textOverflow: 'ellipsis' }}>
                                      {option.partName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                                      #{option.partNumber} | ₹{option.pricePerUnit} | GST: {option.taxAmount}% | Avail: {available} {stockStatus}
                                    </Typography>
                                  </Box>
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  InputProps={{
                                    ...params.InputProps,
                                    sx: { borderRadius: 1 }
                                  }}
                                />
                              )}
                              sx={{ '& .MuiAutocomplete-popper': { maxHeight: 300 } }}
                              noOptionsText="No parts available in stock or all parts already selected"
                              filterOptions={(options, { inputValue }) => {
                                return options.filter(option => {
                                  // Allow parts that are already selected or have available quantity
                                  const isAlreadySelected = assignment.parts.some(selectedPart => selectedPart._id === option._id);
                                  const hasAvailableQuantity = getAvailableQuantity(option._id) > 0;
                                  const isAvailable = isAlreadySelected || hasAvailableQuantity;

                                  return isAvailable && (
                                    option.partName.toLowerCase().includes(inputValue.toLowerCase()) ||
                                    option.partNumber?.toLowerCase().includes(inputValue.toLowerCase()) ||
                                    option.carName?.toLowerCase().includes(inputValue.toLowerCase()) ||
                                    option.model?.toLowerCase().includes(inputValue.toLowerCase())
                                  );
                                });
                              }}
                            />
                          )}

                          {/* User Selected Parts - Display First */}
                          {assignment.parts.filter(part => part && part.partName && !part.isPreLoaded).length > 0 && (
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
                                🔧 User Selected Parts:
                              </Typography>
                              <Alert
                                severity="success"
                                sx={{ mb: 2 }}
                                icon={<AddIcon />}
                              >
                                <Typography variant="body2">
                                  These are newly selected parts that will be added to the job card along with the pre-loaded parts.
                                </Typography>
                              </Alert>
                              <List dense>
                                {assignment.parts
                                  .filter(part => part && part.partName && !part.isPreLoaded)
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
                                              Part #: {part.partNumber || 'N/A'} | {part.carName} - {part.model}
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
                                              onClick={() => {
                                                handlePartRemoval(assignment.id, partIndex);
                                              }}
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
                              <Alert
                                severity="info"
                                sx={{ mb: 2 }}
                                icon={<InventoryIcon />}
                              >
                                <Typography variant="body2">
                                  These parts were pre-loaded from the job card and will be automatically included in the work progress update.
                                </Typography>
                              </Alert>
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
                                                    handlePartQuantityChange(assignment.id, partIndex, newQuantity, selectedQuantity);
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

                                                  handlePartQuantityChange(assignment.id, partIndex, newQuantity, oldQuantity);
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
                                                    handlePartQuantityChange(assignment.id, partIndex, newQuantity, selectedQuantity);
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
                                                handlePartRemoval(assignment.id, partIndex);
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
                          <List dense>
                            {assignment.parts
                              .filter(part => part && part.partName && !part.isPreLoaded)
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
                                          Part #: {part.partNumber || 'N/A'} | {part.carName} - {part.model}
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
                                          onClick={() => {
                                            handlePartRemoval(assignment.id, partIndex);
                                          }}
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
                        </Grid>
                      </Grid>  {/* ✅ Closing missing Grid container */} 
                    </AccordionDetails>
                  </Accordion>
                ))}

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
                  //       >
                  //         📋 Final Parts Summary for Work Progress API:
                  //       </Typography>

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
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
      </Box>
    </>
  );
};

export default AssignEngineer;