import React, { useState, useEffect, useCallback } from "react";
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
  TabPanel,
} from "@mui/material";
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
  People as PeopleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://garage-management-zi5z.onrender.com/api";

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
  const garageToken = localStorage.getItem("token");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [jobCardNumber, setJobCardNumber] = useState("");
  const [carDetails, setCarDetails] = useState({
    company: "",
    model: "",
    carNo: "",
  });
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    contactNo: "",
    email: "",
  });
  const [insuranceDetails, setInsuranceDetails] = useState({
    company: "",
    number: "",
    type: "",
    expiry: "",
    regNo: "",
    amount: "",
  });

  const [engineers, setEngineers] = useState([]);
  const [assignedEngineers, setAssignedEngineers] = useState([]);

  const [inventoryParts, setInventoryParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]); // For Autocomplete selection
  const [assignment, setAssignment] = useState({
    parts: [],
    priority: 'medium',
    estimatedDuration: '',
    notes: ''
  });
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({
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
    taxType: "igst",
    igst: 0,
    cgstSgst: 0,
    sgstEnabled: false,
    sgstPercentage: "",
    cgstEnabled: false,
    cgstPercentage: "",
    taxAmount: 0, // This will now be used as % (e.g. 18%), not ₹
  });

  const [addingPart, setAddingPart] = useState(false);
  const [partAddSuccess, setPartAddSuccess] = useState(false);
  const [partAddError, setPartAddError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [jobId, setJobId] = useState("");

  const statusOptions = [
    { value: "pending", label: "Pending", color: "warning" },
    { value: "in_progress", label: "In Progress", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "error" },
    { value: "on_hold", label: "On Hold", color: "default" },
  ];

  // Enhanced function to collect all parts (pre-loaded + user-selected) for API
  const getAllPartsForAPI = () => {
    const allParts = [];

    console.log('🔍 getAllPartsForAPI - Processing parts:');
    assignment.parts.forEach((part, index) => {
      console.log(`Part ${index + 1} (${part.partName}):`);
      console.log(`  Is Pre-loaded: ${part.isPreLoaded}`);
      console.log(`  taxAmount: ${part.taxAmount}`);
      console.log(`  taxPercentage: ${part.taxPercentage}`);
      console.log(`  gstPercentage: ${part.gstPercentage}`);
      
      const selectedQuantity = part.selectedQuantity || 1;

      // For pre-loaded parts, use original values from job card
      if (part.isPreLoaded) {
        const quantity = part.originalQuantity || selectedQuantity;
        const pricePerPiece = part.originalPricePerPiece || part.sellingPrice || 0;
        const totalPrice = part.originalTotalPrice || (pricePerPiece * quantity);
        const taxPercentage = part.taxPercentage || part.gstPercentage || 0;

        console.log(`  Pre-loaded - Using taxPercentage: ${taxPercentage}`);

        allParts.push({
          partName: part.partName,
          partNumber: part.partNumber || '',
          hsnNumber: part.hsnNumber || '',
          quantity: quantity,
          pricePerPiece: parseFloat(pricePerPiece.toFixed(2)),
          totalPrice: parseFloat(totalPrice.toFixed(2)),
          taxPercentage: taxPercentage, // Use taxPercentage, not taxAmount
          isPreLoaded: true
        });
      } else {
        // For user-selected parts, calculate normally
        const sellingPrice = Number(part.sellingPrice || part.pricePerUnit || 0);
        const taxRate = Number(part.taxAmount || part.gstPercentage || 0);
        const pricePerPiece = sellingPrice; // Base price without tax
        const totalPrice = (sellingPrice + (sellingPrice * taxRate / 100)) * selectedQuantity;

        console.log(`  User-selected - Using taxRate: ${taxRate}`);

        allParts.push({
          partName: part.partName,
          partNumber: part.partNumber || '',
          hsnNumber: part.hsnNumber || '',
          quantity: selectedQuantity,
          pricePerPiece: parseFloat(pricePerPiece.toFixed(2)), // Base price without tax
          totalPrice: parseFloat(totalPrice.toFixed(2)),
          taxPercentage: taxRate,
          isPreLoaded: false
        });
      }
    });

    console.log('📊 Final allParts array:', allParts);
    return allParts;
  };

  const handlePartSelection = async (newParts, previousParts = []) => {
    try {
      const partsMap = new Map();
      previousParts.forEach((part) => {
        partsMap.set(part._id, { ...part });
      });

      newParts.forEach((newPart) => {
        const existingPart = partsMap.get(newPart._id);
        if (existingPart) {
          // Part is already selected - do nothing, ignore the selection attempt
          // User should use +/- buttons to update quantity
          console.log(`Part "${newPart.partName}" is already selected. Use +/- buttons to update quantity.`);
          return;
        } else {
          // Calculate available quantity based on current state
          const originalInventoryPart = inventoryParts.find(p => p._id === newPart._id);
          if (!originalInventoryPart) {
            setSnackbar({
              open: true,
              message: `❌ Part "${newPart.partName}" not found in inventory`,
              severity: 'error'
            });
            return;
          }
          
          let totalSelected = 0;
          
          // Calculate total selected from all parts (pre-loaded + user-selected)
          assignment.parts.forEach((assignmentPart) => {
            if (assignmentPart._id === newPart._id) {
              totalSelected += assignmentPart.selectedQuantity || 1;
            }
          });
          
          const availableQuantity = Math.max(0, originalInventoryPart.quantity - totalSelected);
          
          if (availableQuantity < 1) {
            setSnackbar({
              open: true,
              message: `❌ Part "${newPart.partName}" is out of stock! Available quantity: ${availableQuantity}`,
              severity: 'error'
            });
            return;
          }
          // Calculate tax amounts using InventoryManagement style
          const sellingPrice = newPart.sellingPrice || newPart.pricePerUnit || 0;
          const taxPercentage = newPart.taxAmount || newPart.gstPercentage || 0;
          const quantity = 1;
          const baseAmount = sellingPrice * quantity;
          const gstAmount = (baseAmount * taxPercentage) / 100;
          const totalWithGST = baseAmount + gstAmount;

          partsMap.set(newPart._id, {
            ...newPart,
            selectedQuantity: 1,
            availableQuantity: availableQuantity,
            // Calculate GST amounts
            baseAmount: parseFloat(baseAmount.toFixed(2)),
            gstAmount: parseFloat(gstAmount.toFixed(2)),
            totalWithGST: parseFloat(totalWithGST.toFixed(2)),
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

  const handlePartQuantityChange = async (partIndex, newQuantity, oldQuantity) => {
    const part = selectedParts[partIndex];
    if (!part) return;

    try {
      // Calculate available quantity based on current state before making changes
      const originalPart = inventoryParts.find((p) => p._id === part._id);
      if (!originalPart) {
        setError(`Part not found in inventory`);
        return;
      }

      let totalSelected = 0;
      
      // Calculate total selected from all parts (pre-loaded + user-selected)
      assignment.parts.forEach((assignmentPart) => {
        if (assignmentPart._id === part._id) {
          totalSelected += assignmentPart.selectedQuantity || 1;
        }
      });
      
      // Remove the old quantity from total to get the correct available quantity
      const availableQuantity = Math.max(0, originalPart.quantity - totalSelected + oldQuantity);
      const maxSelectableQuantity = availableQuantity + newQuantity;

      if (newQuantity > maxSelectableQuantity) {
        setError(
          `Cannot select more than ${maxSelectableQuantity} units of "${part.partName}". Available: ${availableQuantity}, Requested: ${newQuantity}`
        );
        return;
      }
      if (newQuantity < 1) {
        setError("Quantity must be at least 1");
        return;
      }

      // Calculate tax amounts using InventoryManagement style for updated quantity
      const sellingPrice = part.sellingPrice || part.pricePerUnit || 0;
      const taxPercentage = part.taxAmount || part.gstPercentage || 0;
      const baseAmount = sellingPrice * newQuantity;
      const gstAmount = (baseAmount * taxPercentage) / 100;
      const totalWithGST = baseAmount + gstAmount;

      const updatedParts = selectedParts.map((p, idx) =>
        idx === partIndex ? { 
          ...p, 
          selectedQuantity: newQuantity,
          // Update GST amounts for new quantity
          baseAmount: parseFloat(baseAmount.toFixed(2)),
          gstAmount: parseFloat(gstAmount.toFixed(2)),
          totalWithGST: parseFloat(totalWithGST.toFixed(2)),
        } : p
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

  const calculateTaxAmount = (sellingPrice, quantity, percentage) => {
    if (!sellingPrice || !quantity || !percentage) return 0;
    const totalPrice = parseFloat(sellingPrice) * parseInt(quantity);
    return (totalPrice * parseFloat(percentage)) / 100;
  };

  const calculateTotalTaxAmount = (
    sellingPrice,
    quantity,
    sgstEnabled,
    sgstPercentage,
    cgstEnabled,
    cgstPercentage
  ) => {
    let totalTax = 0;
    if (sgstEnabled && sgstPercentage) {
      totalTax += calculateTaxAmount(sellingPrice, quantity, sgstPercentage);
    }
    if (cgstEnabled && cgstPercentage) {
      totalTax += calculateTaxAmount(sellingPrice, quantity, cgstPercentage);
    }
    return totalTax;
  };

  const calculateTotalPrice = (
    sellingPrice,
    quantity,
    sgstEnabled,
    sgstPercentage,
    cgstEnabled,
    cgstPercentage
  ) => {
    if (!sellingPrice || !quantity) return 0;
    const basePrice = parseFloat(sellingPrice) * parseInt(quantity);
    const totalTax = calculateTotalTaxAmount(
      sellingPrice,
      quantity,
      sgstEnabled,
      sgstPercentage,
      cgstEnabled,
      cgstPercentage
    );
    return basePrice + totalTax;
  };

  const checkDuplicatePartNumber = (partNumber, excludeId = null) => {
    return inventoryParts.some(
      (item) =>
        item.partNumber === partNumber &&
        (excludeId ? (item._id || item.id) !== excludeId : true)
    );
  };

  const apiCall = useCallback(
    async (endpoint, options = {}) => {
      try {
        const response = await axios({
          url: `${API_BASE_URL}${endpoint}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: garageToken ? `Bearer ${garageToken}` : "",
            ...options.headers,
          },
          ...options,
        });
        return response;
      } catch (err) {
        console.error(`API call failed for ${endpoint}:`, err);
        throw err;
      }
    },
    [garageToken]
  );

  const fetchEngineers = useCallback(async () => {
    if (!garageId) return;
    try {
      setIsLoadingEngineers(true);
      const res = await apiCall(`/garage/engineers/${garageId}`, {
        method: "GET",
      });
      setEngineers(res.data?.engineers || res.data || []);
    } catch (err) {
      console.error("Failed to fetch engineers:", err);
      setSnackbar({
        open: true,
        message: "Failed to load engineers",
        severity: "error",
      });
    } finally {
      setIsLoadingEngineers(false);
    }
  }, [garageId, apiCall]);

  const fetchInventoryParts = useCallback(async () => {
    if (!garageId) return;
    try {
      setIsLoadingInventory(true);
      const res = await apiCall(`/garage/inventory/${garageId}`, {
        method: "GET",
      });
      setInventoryParts(res.data?.parts || res.data || []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setSnackbar({
        open: true,
        message: "Failed to load inventory parts",
        severity: "error",
      });
    } finally {
      setIsLoadingInventory(false);
    }
  }, [garageId, apiCall]);

  const getAvailableQuantity = (inventoryPartId) => {
    const originalPart = inventoryParts.find((p) => p._id === inventoryPartId);
    if (!originalPart) return 0;

    let totalSelected = 0;
    
    // Only check assignment.parts to avoid double-counting
    // This includes both pre-loaded parts and user-selected parts
    assignment.parts.forEach((part) => {
      if (part._id === inventoryPartId) {
        totalSelected += part.selectedQuantity || 1;
      }
    });
    
    const availableQuantity = Math.max(0, originalPart.quantity - totalSelected);
    
    // Special case: If selected quantity equals inventory quantity, allow selecting the same part
    // This enables users to select the same part when they've selected all available quantity
    if (totalSelected === originalPart.quantity && totalSelected > 0) {
      return originalPart.quantity; // Return full inventory quantity to allow same part selection
    }
    
    return availableQuantity;
  };

  const updatePartQuantity = useCallback(
    async (partId, newQuantity) => {
      try {
        // Note: Inventory update will be handled when work progress is submitted
        // This prevents premature inventory changes during quantity adjustments
        console.log(`Planning inventory update for part ${partId}: quantity will be set to ${newQuantity} (will be applied on work progress submission)`);
      } catch (err) {
        console.error(`Failed to plan quantity update for part ${partId}:`, err);
        throw new Error(
          `Failed to plan part quantity update: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    },
    []
  );

  // Function to update job card with parts in API
  const updateJobCardWithParts = async (partsToUpdate) => {
    try {

      
      // Map parts to the simplified API structure based on successful response
      const partsForAPI = partsToUpdate.map(part => {
        const quantity = Number(part.selectedQuantity) || Number(part.quantity) || 1;
        const sellingPrice = Number(part.sellingPrice) || 0;
        const taxPercentage = Number(part.taxAmount || part.gstPercentage || 0);
        
        // Calculate total price with tax included
        const baseAmount = sellingPrice * quantity;
        const taxAmount = (baseAmount * taxPercentage) / 100;
        const totalPrice = baseAmount + taxAmount;
        
        return {
          partName: part.partName || '',
          partNumber: part.partNumber || '',
          hsnNumber: part.hsnNumber || '',
          quantity: quantity,
          pricePerPiece: sellingPrice, // Base price without tax
          totalPrice: parseFloat(totalPrice.toFixed(2)), // Total with tax included
          taxAmount: taxPercentage, // Tax percentage
          _id: part._id || part.partId || Date.now().toString() // Generate _id if not present
        };
      });

      const updatePayload = { partsUsed: partsForAPI };
      
      // Debug: Log the parts being sent to job card update
      console.log('📝 Job Card Update - Parts being sent:');
      partsForAPI.forEach((part, index) => {
        console.log(`Part ${index + 1}:`, {
          partName: part.partName,
          hsnNumber: part.hsnNumber,
          quantity: part.quantity,
          pricePerPiece: part.pricePerPiece,
          totalPrice: part.totalPrice,
          taxAmount: part.taxAmount
        });
      });

      const response = await axios.put(
        `${API_BASE_URL}/jobCards/${id}`,
        updatePayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${garageToken}`,
          }
        }
      );


      setSnackbar({
        open: true,
        message: "Parts updated successfully in job card!",
        severity: "success",
      });
      
      return response.data;
    } catch (err) {
      console.error('Failed to update job card with parts:', err);
      setSnackbar({
        open: true,
        message: "Failed to update parts in job card. Please try again.",
        severity: "error",
      });
      throw err;
    }
  };





  // ✅ FIXED: Correct tax calculation
  const handleAddPart = async () => {
    if (!newPart.partName?.trim()) {
      setPartAddError("Please fill part name");
      return;
    }
    if (newPart.quantity <= 0) {
      setPartAddError("Quantity must be greater than 0");
      return;
    }
    if (newPart.sellingPrice < 0) {
      setPartAddError("Price cannot be negative");
      return;
    }
    if (newPart.partNumber && checkDuplicatePartNumber(newPart.partNumber)) {
      setPartAddError(
        "Part number already exists. Please use a different part number."
      );
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      const sgstAmount = newPart.sgstEnabled ?
        calculateTaxAmount(newPart.sellingPrice, newPart.quantity, newPart.sgstPercentage) : 0;
      const cgstAmount = newPart.cgstEnabled ?
        calculateTaxAmount(newPart.sellingPrice, newPart.quantity, newPart.cgstPercentage) : 0;

      const taxAmount = sgstAmount + cgstAmount;

      const requestData = {
        garageId: garageId,
        quantity: parseInt(newPart.quantity),
        purchasePrice: parseFloat(newPart.purchasePrice),
        sellingPrice: parseFloat(newPart.sellingPrice),
        partNumber: newPart.partNumber,
        partName: newPart.partName,
        carName: newPart.carName,
        model: newPart.model,
        hsnNumber: newPart.hsnNumber,
        taxType: newPart.taxType,
        igst: newPart.taxType === 'igst' ? (parseFloat(newPart.igst) || 0) : (newPart.taxType === 'cgstSgst' ? (parseFloat(newPart.cgstSgst) || 0) : 0),
        cgstSgst: newPart.taxType === 'cgstSgst' ? (parseFloat(newPart.cgstSgst) || 0) : 0,
        sgstEnabled: newPart.sgstEnabled,
        sgstPercentage: parseFloat(newPart.sgstPercentage) || 0,
        cgstEnabled: newPart.cgstEnabled,
        cgstPercentage: parseFloat(newPart.cgstPercentage) || 0,
        taxAmount: taxAmount
      };

      const response = await axios.post(
        `${API_BASE_URL}/garage/inventory/add`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${garageToken}`,
          },
        }
      );

      await fetchInventoryParts();

      setPartAddSuccess(true);
      setSnackbar({
        open: true,
        message: "Part added successfully!",
        severity: "success",
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
        taxType: "igst",
        igst: 0,
        cgstSgst: 0,
        sgstEnabled: false,
        sgstPercentage: "",
        cgstEnabled: false,
        cgstPercentage: "",
        taxAmount: 0,
      });

      setTimeout(() => {
        setPartAddSuccess(false);
        handleCloseAddPartDialog();
      }, 1500);
    } catch (err) {
      console.error("Add part error:", err);
      setPartAddError(err.response?.data?.message || "Failed to add part");
    } finally {
      setAddingPart(false);
    }
  };

  // Clean up duplicate parts whenever assignment.parts changes
  useEffect(() => {
    if (assignment.parts.length > 0) {
      removeDuplicateParts();
    }
  }, [assignment.parts]);

  useEffect(() => {
    const fetchJobCardData = async () => {
      if (!id) return;
      setFetchLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/garage/jobCards/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${garageToken}`,
          },
        });
        const data = response.data;
        
        // Test HSN numbers from API data
        testHSNNumbers(data);
        
        setJobCardNumber(data.jobId || "");
        setJobId(data._id || "");

        setCarDetails({
          company: data.company || "",
          model: data.model || "",
          carNo: data.carNumber || data.registrationNumber || "",
        });

        setCustomerDetails({
          name: data.customerName || "",
          contactNo: data.contactNumber || "",
          email: data.email || "",
        });

        setInsuranceDetails({
          company: data.insuranceProvider || "",
          number: data.policyNumber || "",
          type: data.type || "",
          expiry: data.expiryDate ? data.expiryDate.split("T")[0] : "",
          regNo: data.registrationNumber || data.carNumber || "",
          amount: data.excessAmount?.toString() || "",
        });

        if (data.engineerId && data.engineerId.length > 0) {
          const checkEngineersLoaded = setInterval(() => {
            if (!isLoadingEngineers && engineers.length > 0) {
              const assignedEngList = data.engineerId
                .map((engData) => {
                  return engineers.find((eng) => eng._id === engData._id) || engData;
                })
                .filter(Boolean);
              setAssignedEngineers(assignedEngList);
              clearInterval(checkEngineersLoaded);
            }
          }, 100);

          setTimeout(() => clearInterval(checkEngineersLoaded), 5000);
        }

        if (data.partsUsed && data.partsUsed.length > 0) {
          console.log('Processing partsUsed from job card:', data.partsUsed);
          
          // Print HSN Numbers and Tax Amounts from API data
          console.log('📊 HSN Numbers and Tax Amounts from API:');
          data.partsUsed.forEach((part, index) => {
            console.log(`Part ${index + 1}: ${part.partName}`);
            console.log(`  HSN Number: ${part.hsnNumber || 'N/A'}`);
            console.log(`  Tax Amount: ₹${part.taxAmount || 0}`);
            console.log(`  Tax Percentage: ${part.taxPercentage || 0}%`);
            console.log(`  Total Price: ₹${part.totalPrice || 0}`);
            console.log('---');
          });
          
          // Convert partsUsed from job card to format expected by the form
          const validParts = data.partsUsed.filter(usedPart => usedPart && (usedPart.partName || usedPart._id));
          
          let formattedParts = [];
          if (validParts.length > 0) {
            formattedParts = validParts.map(usedPart => {
              // For parts from job card, preserve the original values
              let taxAmount = usedPart.taxAmount || 0; // Use taxAmount from API
              let taxPercentage = usedPart.taxPercentage || 0; // Use taxPercentage from API
              let pricePerPiece = usedPart.pricePerPiece || 0; // Base price per piece
              let totalPrice = usedPart.totalPrice || 0; // Total price including tax
              
              return {
                id: usedPart._id || `existing-${Math.random()}`,
                type: "existing",
                partName: usedPart.partName || "",
                partNumber: usedPart.partNumber || "",
                hsnNumber: usedPart.hsnNumber || "", // Add HSN Number
                selectedQuantity: usedPart.quantity || 1,
                sellingPrice: pricePerPiece, // Base price per piece
                pricePerPiece: pricePerPiece, // Base price per piece
                totalPrice: totalPrice, // Total price including tax
                gstPercentage: taxPercentage, // Use taxPercentage for backward compatibility
                carName: usedPart.carName || "",
                model: usedPart.model || "",
                isExisting: true,
                isPreLoaded: true, // Mark as pre-loaded from job card
                _id: usedPart._id,
                quantity: usedPart.quantity || 1,
                taxAmount: taxAmount, // Store the actual tax amount
                taxPercentage: taxPercentage, // Store the tax percentage
                originalQuantity: usedPart.quantity || 1,
                originalPricePerPiece: pricePerPiece,
                originalTotalPrice: totalPrice,
              };
            });
          }

          console.log('Formatted pre-loaded parts:', formattedParts);
          
          // Debug: Check HSN numbers in formatted parts
          console.log('🔍 HSN Numbers in formatted parts:');
          formattedParts.forEach((part, index) => {
            console.log(`Part ${index + 1}: ${part.partName}`);
            console.log(`  HSN Number: "${part.hsnNumber}"`);
            console.log(`  Part Number: "${part.partNumber}"`);
            console.log(`  Tax Amount: ₹${part.taxAmount}`);
            console.log(`  Tax Percentage: ${part.taxPercentage}%`);
            console.log('---');
          });
          
          // Set assignment.parts with pre-loaded parts
          setAssignment(prev => ({
            ...prev,
            parts: formattedParts
          }));
          
          // Initialize selectedParts with user-selected parts (non-pre-loaded)
          const userSelectedParts = formattedParts.filter(part => !part.isPreLoaded);
          setSelectedParts(userSelectedParts);
                  } else {
            setAssignment(prev => ({
              ...prev,
              parts: []
            }));
            setSelectedParts([]);
          }

        if (data.status) {
          const statusMapping = {
            "In Progress": "in_progress",
            Pending: "pending",
            Completed: "completed",
            Cancelled: "cancelled",
            "On Hold": "on_hold",
          };
          setStatus(statusMapping[data.status] || data.status.toLowerCase().replace(/\s+/g, "_"));
        }

        if (data.engineerRemarks || data.remarks) {
          setRemarks(data.engineerRemarks || data.remarks || "");
        }

        setSnackbar({
          open: true,
          message: "Job card data loaded successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error("Error fetching job card data:", error);
        setSnackbar({
          open: true,
          message: `Error: ${error.response?.data?.message || "Failed to fetch job card data"}`,
          severity: "error",
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchJobCardData();
  }, [id, garageToken, isLoadingEngineers, engineers]);

  useEffect(() => {
    if (!garageId) {
      navigate("/login");
      return;
    }
    fetchInventoryParts();
    fetchEngineers();
  }, [fetchInventoryParts, fetchEngineers, garageId, navigate]);

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
        if (part._id && part.selectedQuantity && !part.isExisting) {
          const currentQuantity = part.quantity || 0;
          const usedQuantity = part.selectedQuantity;
          const newQuantity = Math.max(0, currentQuantity - usedQuantity);
          
          console.log(`Updating part ${part.partName}: ${currentQuantity} - ${usedQuantity} = ${newQuantity}`);
          
          // Update inventory quantity
          await axios.put(
            `${API_BASE_URL}/inventory/update/${part._id}`,
            {
              quantity: newQuantity,
              carName: part.carName,
              model: part.model,
              partNumber: part.partNumber,
              partName: part.partName,
              hsnNumber: part.hsnNumber,
              igst: part.igst || 0,
              cgstSgst: part.cgstSgst || 0,
              purchasePrice: part.purchasePrice,
              sellingPrice: part.sellingPrice,
            },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assignedEngineers.length === 0) {
      setSnackbar({
        open: true,
        message: "Please assign at least one engineer",
        severity: "error",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get all parts (pre-loaded + user-selected) using the enhanced function
      const allPartsUsed = getAllPartsForAPI();
      
      // Get user-selected parts that will reduce inventory
      const userSelectedParts = assignment.parts.filter(part => !part.isPreLoaded && part._id);

      // Refresh inventory data before validation to ensure we have the latest data
      await fetchInventoryParts();
      
      // Update inventory quantities for user-selected parts
      if (userSelectedParts.length > 0) {
        await updateInventoryQuantities(userSelectedParts);
      }

      // Format parts for API - Updated to match API specification
      const formattedParts = allPartsUsed.map(part => {
        // For pre-loaded parts, use the original taxPercentage from the job card
        // For user-selected parts, calculate taxAmount based on taxPercentage
        let taxAmount;
        if (part.isPreLoaded) {
          // For pre-loaded parts, calculate taxAmount from taxPercentage
          const taxPercentage = Number(part.taxPercentage || 0);
          const basePrice = parseFloat(part.pricePerPiece || 0);
          taxAmount = parseFloat(((basePrice * taxPercentage) / 100).toFixed(2));
        } else {
          // Calculate taxAmount based on taxPercentage for user-selected parts
          const taxPercentage = Number(part.taxPercentage || 0);
          const basePrice = parseFloat(part.pricePerPiece || 0);
          taxAmount = parseFloat(((basePrice * taxPercentage) / 100).toFixed(2));
        }
        
        const quantity = Number(part.quantity || 1);
        const pricePerPiece = parseFloat((part.pricePerPiece || 0).toFixed(2)); // Base price without tax
        const totalPrice = parseFloat((part.totalPrice || 0).toFixed(2)); // Total with tax included
        
        return {
          partName: part.partName || '',
          partNumber: part.partNumber || '',
          hsnNumber: part.hsnNumber || '',
          quantity: quantity,
          pricePerPiece: pricePerPiece, // Base price without tax
          totalPrice: totalPrice, // Total with tax included
          taxAmount: taxAmount // Actual tax amount (not percentage)
        };
      });

      const requestData = {
        engineerRemarks: remarks || "",
        status: status || "in_progress",
        assignedEngineerId: assignedEngineers.map((eng) => eng._id),
        partsUsed: formattedParts,
        jobCardNumber: jobId,
      };

      // Debug: Log the API request data
      console.log('🚀 API Request Data being sent:');
      console.log('Request URL:', `${API_BASE_URL}/garage/jobcards/${id}/workprogress`);
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      console.log('Parts being sent:');
      requestData.partsUsed.forEach((part, index) => {
        console.log(`Part ${index + 1}:`, {
          partName: part.partName,
          hsnNumber: part.hsnNumber,
          quantity: part.quantity,
          pricePerPiece: part.pricePerPiece,
          totalPrice: part.totalPrice,
          taxAmount: part.taxAmount,
          isPreLoaded: allPartsUsed[index]?.isPreLoaded || false
        });
      });
      
      // Additional debug: Show original vs formatted data
      console.log('🔍 Original vs Formatted Data Comparison:');
      allPartsUsed.forEach((originalPart, index) => {
        const formattedPart = requestData.partsUsed[index];
        console.log(`Part ${index + 1} (${originalPart.partName}):`);
        console.log(`  Original taxAmount: ${originalPart.taxAmount}`);
        console.log(`  Original taxPercentage: ${originalPart.taxPercentage}`);
        console.log(`  Formatted taxAmount: ${formattedPart.taxAmount}`);
        console.log(`  Is Pre-loaded: ${originalPart.isPreLoaded}`);
        console.log(`  Price Per Piece: ${originalPart.pricePerPiece}`);
        console.log(`  Calculated Tax Amount: ${((originalPart.pricePerPiece || 0) * (originalPart.taxPercentage || 0) / 100).toFixed(2)}`);
        console.log('---');
      });



      const response = await axios.put(
        `${API_BASE_URL}/garage/jobcards/${id}/workprogress`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${garageToken}`,
          },
        }
      );

      // Calculate inventory reduction for success message
      const inventoryReduction = userSelectedParts.reduce((total, part) => total + (part.selectedQuantity || 1), 0);
      const preLoadedParts = allPartsUsed.filter(part => part.isPreLoaded);
      const userSelectedPartsCount = allPartsUsed.filter(part => !part.isPreLoaded);
      
      setSnackbar({
        open: true,
        message: `✅ Work progress updated! Job Card: ${jobCardNumber}, Engineers: ${assignedEngineers
          .map((e) => e.name)
          .join(", ")}, Parts: ${preLoadedParts.length} pre-loaded + ${userSelectedPartsCount.length} user-selected = ${allPartsUsed.length} total${inventoryReduction > 0 ? `, Inventory reduced by ${inventoryReduction} units` : ''}`,
        severity: "success",
      });

      setTimeout(() => {
        navigate(`/Quality-Check/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating work progress:", error);
      
      // Check if it's an inventory validation error
      if (error.message && error.message.includes('Inventory validation failed')) {
        setSnackbar({
          open: true,
          message: `❌ ${error.message}. Please check inventory quantities and try again.`,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${
            error.response?.data?.message ||
            error.message ||
            "Failed to update work progress"
          }`,
          severity: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
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
      purchasePrice: 0,
      sellingPrice: 0,
      hsnNumber: "",
      taxType: "igst",
      igst: 0,
      cgstSgst: 0,
      sgstEnabled: false,
      sgstPercentage: "",
      cgstEnabled: false,
      cgstPercentage: "",
      taxAmount: 0,
    });
  };

  const handlePartInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPart((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (partAddError) setPartAddError(null);
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.color : "default";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon />;
      case "pending":
        return <PendingIcon />;
      default:
        return <TimerIcon />;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Test function to verify HSN numbers from API data
  const testHSNNumbers = (apiData) => {
    console.log('🧪 Testing HSN Numbers from API Data:');
    if (apiData && apiData.partsUsed && Array.isArray(apiData.partsUsed)) {
      apiData.partsUsed.forEach((part, index) => {
        console.log(`Part ${index + 1}:`);
        console.log(`  Name: ${part.partName}`);
        console.log(`  HSN Number: "${part.hsnNumber}" (type: ${typeof part.hsnNumber})`);
        console.log(`  Tax Amount: ${part.taxAmount}`);
        console.log(`  Tax Percentage: ${part.taxPercentage}`);
        console.log('  ---');
      });
    } else {
      console.log('No parts data found in API response');
    }
  };

  if (fetchLoading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          mb: 4,
          ml: { xs: 0, sm: 35 },
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Job Card Data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
          sx={{
            flexGrow: 1,
            mb: 4,
            ml: { xs: 0, sm: 35 },
            overflow: "auto",
            pt: 3,
          }}
        >
          <Container maxWidth="xl">
            {/* Header */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                bgcolor: "#1976d2",
                borderRadius: 3,
                border: "1px solid #e2e8f0",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    onClick={() => navigate(`/assign-engineer/${id}`)}
                    sx={{
                      mr: 2,
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="white">
                      Work In Progress
                    </Typography>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.8)"
                      sx={{ mt: 0.5 }}
                    >
                      Update work status and manage parts for job card:{" "}
                      {jobCardNumber || "Loading..."}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={getStatusIcon(status)}
                  label={
                    statusOptions.find((opt) => opt.value === status)?.label ||
                    status
                  }
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
                          height: "100%",
                          borderRadius: 3,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Box
                          sx={{
                            background: "#1976d2",
                            color: "white",
                            p: 2.5,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
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
                          height: "100%",
                          borderRadius: 3,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Box
                          sx={{
                            background: "#1976d2",
                            color: "white",
                            p: 2.5,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
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
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Box
                      sx={{
                        background: "#1976d2",
                        color: "white",
                        p: 2.5,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
                        <PeopleIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Assigned Engineers
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      {isLoadingEngineers ? (
                        <Box sx={{ display: "flex", alignItems: "center", py: 2 }}>
                          <CircularProgress size={20} />
                          <Typography sx={{ ml: 1 }}>
                            Loading engineers...
                          </Typography>
                        </Box>
                      ) : (
                        <Autocomplete
                          multiple
                          fullWidth
                          options={engineers}
                          getOptionLabel={(option) => option.name || ""}
                          value={assignedEngineers}
                          onChange={(event, newValue) =>
                            setAssignedEngineers(newValue)
                          }
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                variant="outlined"
                                label={option.name}
                                color="primary"
                                key={option._id}
                                onDelete={undefined}
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select multiple engineers"
                              variant="outlined"
                              required={assignedEngineers.length === 0}
                              error={assignedEngineers.length === 0}
                              helperText={
                                assignedEngineers.length === 0
                                  ? "At least one engineer must be assigned"
                                  : ""
                              }
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: null, // Remove any end adornment (cancel icon)
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
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: "action.hover",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            color="success.main"
                            gutterBottom
                          >
                            ✅ Engineers Assigned: {assignedEngineers.length}
                          </Typography>
                          {assignedEngineers.map((engineer, index) => (
                            <Typography
                              key={engineer._id}
                              variant="body2"
                              color="text.secondary"
                            >
                              {index + 1}. {engineer.name} - Email: {engineer.email}{" "}
                              | Phone: {engineer.phone}
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
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Box
                      sx={{
                        background: "#1976d2",
                        color: "white",
                        p: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
                          <BuildIcon />
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                          Parts Management
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Add New Part to Inventory">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => setOpenAddPartDialog(true)}
                            startIcon={<LibraryAddIcon />}
                            sx={{
                              bgcolor: "rgba(255,255,255,0.2)",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                            }}
                          >
                            Create New
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
    
                    <CardContent sx={{ p: 3 }}>
                      {/* Parts Summary */}
                      {assignment.parts.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{ mb: 2 }}
                          >
                            Parts Summary
                          </Typography>
                          
                
                          {assignment.parts.filter(part => part.isPreLoaded).length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="info.main"
                                sx={{ mb: 1 }}
                              >
                                📋 Pre-loaded Parts from Job Card ({assignment.parts.filter(part => part.isPreLoaded).length}):
                              </Typography>
                              <Alert severity="info" sx={{ mb: 1 }}>
                                <Typography variant="body2">
                                  These parts were already assigned to this job card and cannot be modified.
                                </Typography>
                              </Alert>
                              <List dense>
                                {assignment.parts.filter(part => part.isPreLoaded).map((part, index) => (
                                  <ListItem key={part._id || index} sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={part.partName}
                                      secondary={`Part #: ${part.partNumber || 'N/A'} | HSN: ${part.hsnNumber || 'N/A'} | Quantity: ${part.selectedQuantity || 1} | Total Price: ₹${part.totalPrice || 0} | Tax: ${(part.taxPercentage || 0)}%`}
                                    />
                                    <Chip
                                      label="Pre-loaded"
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

  
                          {selectedParts.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="primary.main"
                                sx={{ mb: 1 }}
                              >
                                🔧 User Selected Parts ({selectedParts.length}):
                              </Typography>
                              <Alert severity="warning" sx={{ mb: 1 }}>
                                <Typography variant="body2">
                                  These parts will be removed from inventory when you update the work progress.
                                </Typography>
                              </Alert>
                            </Box>
                          )}

                  
                          {/* {assignment.parts && assignment.parts.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="success.main"
                                sx={{ mb: 1 }}
                              >
                                📊 Parts Summary - HSN Numbers & Tax Amounts:
                              </Typography>
                              <Alert severity="success" sx={{ mb: 1 }}>
                                <Typography variant="body2">
                                  Detailed breakdown of HSN numbers and tax amounts for all parts.
                                </Typography>
                              </Alert>
                              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 600 }}>Part Name</TableCell>
                                      <TableCell sx={{ fontWeight: 600 }}>HSN Number</TableCell>
                                      <TableCell sx={{ fontWeight: 600 }}>Tax Amount (₹)</TableCell>
                                      <TableCell sx={{ fontWeight: 600 }}>Tax %</TableCell>
                                      <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                      <TableCell sx={{ fontWeight: 600 }}>Total Price (₹)</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {assignment.parts.map((part, index) => {
                                      const taxAmount = part.taxAmount || part.gstPercentage || 0;
                                      const totalTaxAmount = (part.sellingPrice || 0) * (part.selectedQuantity || 1) * (taxAmount / 100);
                                      
                                     
                                     
                                      return (
                                        <TableRow key={part._id || index} hover>
                                          <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                              {part.partName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {part.partNumber || 'N/A'}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={part.hsnNumber || 'N/A'}
                                              size="small"
                                              color="primary"
                                              variant="outlined"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2" color="success.main" fontWeight={500}>
                                              ₹{part.taxAmount * part.quantity}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2" color="info.main">
                                              {part.taxPercentage}%
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2">
                                              {part.selectedQuantity || 1}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                              ₹{(part.totalPrice || 0).toFixed(2)}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
 
                              <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                                <Typography variant="body2" fontWeight={600} color="primary.dark">
                                  📈 Summary Totals:
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                  <Typography variant="body2">
                                    Total Parts: {assignment.parts.length}
                                  </Typography>
                                  <Typography variant="body2">
                                    Total Tax Amount: ₹{assignment.parts.reduce((total, part) => {
                                      const taxAmount = part.taxAmount || part.gstPercentage || 0;
                                      const totalTaxAmount = (part.sellingPrice || 0) * (part.selectedQuantity || 1) * (taxAmount / 100);
                                      return total + totalTaxAmount;
                                    }, 0).toFixed(2)}
                                  </Typography>
                                  <Typography variant="body2">
                                    Grand Total: ₹{assignment.parts.reduce((total, part) => total + (part.totalPrice || 0), 0).toFixed(2)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )} */}
                        </Box>
                      )}

                      {/* Parts Selection */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{ mb: 1 }}
                        >
                          Select Additional Parts from Inventory (Optional)
                        </Typography>
    
                        {isLoadingInventory ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              py: 2,
                            }}
                          >
                            <CircularProgress size={20} />
                            <Typography sx={{ ml: 2 }}>Loading parts...</Typography>
                          </Box>
                        ) : (
                                                     <Autocomplete
                             multiple
                             fullWidth
                             options={inventoryParts.filter(
                               (part) => {
                                 const availableQuantity = getAvailableQuantity(part._id);
                                 // Allow parts that have available quantity OR have been fully selected (to allow reselection)
                                 return availableQuantity > 0 || availableQuantity === part.quantity;
                               }
                             )}
                             getOptionLabel={(option) => {
                               const availableQuantity = getAvailableQuantity(option._id);
                               const isFullySelected = availableQuantity === option.quantity;
                               const statusText = isFullySelected ? "Fully Selected - Can Reselect" : `Available: ${availableQuantity}`;
                               
                               return `${option.partName} (${
                                 option.partNumber || "N/A"
                               }) - HSN: ${option.hsnNumber || "N/A"} | ₹${option.sellingPrice || 0} | GST11232: ${
                                 option.gstPercentage || option.taxAmount || 0
                               } | ${statusText}`;
                             }}
                             value={selectedParts}
                             onChange={(event, newValue) => {
                               handlePartSelection(newValue, selectedParts);
                             }}
                             noOptionsText="No parts available in stock"
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => (
                                <Chip
                                  variant="outlined"
                                  label={`${option.partName} (${
                                    option.partNumber || "N/A"
                                  }) - Qty: ${option.selectedQuantity || 1} @ ₹${
                                    option.sellingPrice || 0
                                  }`}
                                  key={option._id}
                                  onDelete={undefined}
                                />
                              ))
                            }
                            renderOption={(props, option) => {
                              const availableQuantity = getAvailableQuantity(option._id);
                              const isFullySelected = availableQuantity === option.quantity;
                              const statusText = isFullySelected ? "Fully Selected - Can Reselect" : `Available: ${availableQuantity}`;
                              const statusColor = isFullySelected ? "warning.main" : "text.secondary";
                              
                              return (
                                <Box component="li" {...props}>
                                  <Box sx={{ width: "100%" }}>
                                    <Typography variant="body2" fontWeight={500}>
                                      {option.partName}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color={statusColor}
                                    >
                                      Part : {option.partNumber || "N/A"} | HSN: {option.hsnNumber || "N/A"} | Price: ₹
                                      {option.sellingPrice || 0} | GST:{" "}
                                      {option.gstPercentage || option.taxAmount || 0}% |
                                      {statusText} |
                                      {option.carName} - {option.model}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select parts needed"
                                variant="outlined"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: null, // Remove any end adornment (cancel icon)
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
                            filterOptions={(options, { inputValue }) => {
                              return options.filter(
                                (option) => {
                                  // Exclude parts that are already selected
                                  const isAlreadySelected = selectedParts.some(selectedPart => selectedPart._id === option._id);
                                  
                                  const availableQuantity = getAvailableQuantity(option._id);
                                  const isAvailable = availableQuantity > 0 || availableQuantity === option.quantity;
                                  
                                  return !isAlreadySelected &&
                                    isAvailable &&
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
                                        .includes(inputValue.toLowerCase()));
                                }
                              );
                            }}
                          />
                        )}

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
                                  label="Ready to Update" 
                                  size="small" 
                                  color="success" 
                                  variant="outlined"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        )}
    
                        {/* Selected Parts with Enhanced Quantity Management */}
                        {selectedParts.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, fontWeight: 600 }}
                            >
                              Selected Parts with Details:
                            </Typography>
                            
                            {/* Inventory Impact Summary */}
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                              <Typography variant="caption" color="warning.dark" sx={{ fontStyle: 'italic' }}>
                                ⚠️ Total inventory reduction: {selectedParts.reduce((total, part) => total + (part.selectedQuantity || 1), 0)} units
                              </Typography>
                            </Box>
                            <List dense>
                              {selectedParts.map((part, partIndex) => {
                                const selectedQuantity = part.selectedQuantity || 1;
                                const quantity = part.quantity;
                                const sellingPrice = part.sellingPrice || 0;
                                const taxRate = part.taxAmount || 0; // percentage
                                
                                // For existing parts from job card, use the original values as-is
                                const pricePerPiece = part.isExisting ? part.sellingPrice : sellingPrice + taxRate;
                                const totalPrice = part.isExisting ? part.totalPrice : (pricePerPiece * selectedQuantity);
                                const taxAmount = part.isExisting ? 0 :  taxRate * selectedQuantity;
    

    
                                // Get available quantity considering all current selections
                                const availableQuantity = getAvailableQuantity(
                                  part._id
                                );
    
                                // Calculate the maximum quantity user can select
                                const maxSelectableQuantity =
                                  availableQuantity + selectedQuantity;
                                const isMaxQuantityReached =
                                  selectedQuantity >= maxSelectableQuantity;
    
                                return (
                                  <ListItem
                                    key={part._id}
                                    sx={{
                                      border: `1px solid ${theme.palette.divider}`,
                                      borderRadius: 1,
                                      mb: 1,
                                      py: 1,
                                      flexDirection: "column",
                                      alignItems: "stretch",
                                      bgcolor: "background.paper",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        width: "100%",
                                      }}
                                    >
                                      <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography
                                            variant="body2"
                                            fontWeight={500}
                                          >
                                            {part.partName}
                                          </Typography>
                                          {part.isExisting && (
                                            <Chip
                                              label="Read-only"
                                              size="small"
                                              color="info"
                                              variant="outlined"
                                              sx={{ fontSize: '0.7rem', height: '20px' }}
                                            />
                                          )}
                                          {!part.isExisting && (() => {
                                            const originalInventoryPart = inventoryParts.find(p => p._id === part._id);
                                            const isFullySelected = originalInventoryPart && selectedQuantity === originalInventoryPart.quantity;
                                            return isFullySelected ? (
                                              <Chip
                                                label="Fully Selected - Can Reselect"
                                                size="small"
                                                color="warning"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                              />
                                            ) : null;
                                          })()}
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ display: "block" }}
                                        >
                                          Part #: {part.partNumber || "N/A"} | HSN: {part.hsnNumber || "N/A"} |{" "}
                                          {part.carName} - {part.model}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ display: "block" }}
                                        >
                                          {/* Tax Amount: ₹{(part.taxAmount || 0).toFixed(2)}  */}
                                            Price: ₹{part.sellingPrice || 0}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="info.main"
                                          sx={{ display: "block" }}
                                        >
                                          {part.isExisting ? (
                                            `Quantity: ${selectedQuantity} (Fixed)`
                                          ) : (() => {
                                            const originalInventoryPart = inventoryParts.find(p => p._id === part._id);
                                            const isFullySelected = originalInventoryPart && selectedQuantity === originalInventoryPart.quantity;
                                            return isFullySelected ? 
                                              `Fully Selected: ${selectedQuantity} (Can Reselect)` :
                                              `Max Selectable: ${maxSelectableQuantity} | Selected: ${selectedQuantity}`;
                                          })()}
                                        </Typography>
                                        {!part.isExisting && (
                                          <Typography
                                            variant="caption"
                                            color="warning.main"
                                            sx={{
                                              display: "block",
                                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                              fontStyle: 'italic'
                                            }}
                                          >
                                            {(() => {
                                              const originalInventoryPart = inventoryParts.find(p => p._id === part._id);
                                              const isFullySelected = originalInventoryPart && selectedQuantity === originalInventoryPart.quantity;
                                              return isFullySelected ? 
                                                `⚠️ Fully selected - can be reselected for additional quantity` :
                                                `⚠️ Inventory will be reduced by ${selectedQuantity} on update`;
                                            })()}
                                          </Typography>
                                        )}
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                          }}
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              const newQuantity =
                                                selectedQuantity - 1;
                                              if (newQuantity >= 1) {
                                                handlePartQuantityChange(
                                                  partIndex,
                                                  newQuantity,
                                                  selectedQuantity
                                                );
                                              }
                                            }}
                                            disabled={selectedQuantity <= 1 || part.isExisting}
                                            sx={{
                                              minWidth: "24px",
                                              width: "24px",
                                              height: "24px",
                                              border: `1px solid ${theme.palette.divider}`,
                                            }}
                                          >
                                            <Typography
                                              variant="caption"
                                              fontWeight="bold"
                                            >
                                              -
                                            </Typography>
                                          </IconButton>
                                          <TextField
                                            size="small"
                                            type="number"
                                            label="Qty"
                                            value={selectedQuantity}
                                            onChange={(e) => {
                                              // Don't allow changes for existing parts
                                              if (part.isExisting) return;
                                              
                                              const newQuantity =
                                                parseInt(e.target.value) || 1;
                                              const oldQuantity = selectedQuantity;
    
                                              // Validate quantity limits
                                              if (newQuantity < 1) {
                                                return;
                                              }
    
                                              // Special case: Allow selecting same part when quantity equals inventory
                                              const originalInventoryPart = inventoryParts.find(p => p._id === part._id);
                                              const isQuantityEqualToInventory = originalInventoryPart && selectedQuantity === originalInventoryPart.quantity;
                                              
                                              if (
                                                newQuantity > maxSelectableQuantity && !isQuantityEqualToInventory
                                              ) {
                                                setError(
                                                  `Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`
                                                );
                                                return;
                                              }
    
                                              handlePartQuantityChange(
                                                partIndex,
                                                newQuantity,
                                                oldQuantity
                                              );
                                            }}
                                            inputProps={{
                                              min: 1,
                                              max: (() => {
                                                const originalInventoryPart = inventoryParts.find(p => p._id === part._id);
                                                const isQuantityEqualToInventory = originalInventoryPart && selectedQuantity === originalInventoryPart.quantity;
                                                return isQuantityEqualToInventory ? selectedQuantity + 1 : maxSelectableQuantity;
                                              })(),
                                              style: {
                                                width: "50px",
                                                textAlign: "center",
                                              },
                                              readOnly:
                                                (isMaxQuantityReached &&
                                                selectedQuantity ===
                                                  maxSelectableQuantity && 
                                                !(inventoryParts.find(p => p._id === part._id) && 
                                                  selectedQuantity === inventoryParts.find(p => p._id === part._id).quantity)) || part.isExisting,
                                            }}
                                            sx={{
                                              width: "70px",
                                              "& .MuiInputBase-input": {
                                                textAlign: "center",
                                                fontSize: "0.875rem",
                                              },
                                            }}
                                            error={availableQuantity === 0}
                                            disabled={maxSelectableQuantity === 0 || part.isExisting}
                                          />
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              const newQuantity =
                                                selectedQuantity + 1;
                                              
                                              // Special case: Allow selecting same part when quantity equals inventory
                                              const originalInventoryPart = inventoryParts.find(p => p._id === part._id);
                                              const isQuantityEqualToInventory = originalInventoryPart && selectedQuantity === originalInventoryPart.quantity;
                                              
                                              if (
                                                newQuantity <= maxSelectableQuantity || isQuantityEqualToInventory
                                              ) {
                                                handlePartQuantityChange(
                                                  partIndex,
                                                  newQuantity,
                                                  selectedQuantity
                                                );
                                              } else {
                                                setError(
                                                  `Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`
                                                );
                                              }
                                            }}
                                            disabled={
                                              (selectedQuantity >= maxSelectableQuantity && 
                                               !(inventoryParts.find(p => p._id === part._id) && 
                                                 selectedQuantity === inventoryParts.find(p => p._id === part._id).quantity)) ||
                                              availableQuantity === 0 ||
                                              part.isExisting
                                            }
                                            sx={{
                                              minWidth: "24px",
                                              width: "24px",
                                              height: "24px",
                                              border: `1px solid ${
                                                selectedQuantity >=
                                                maxSelectableQuantity
                                                  ? theme.palette.error.main
                                                  : theme.palette.divider
                                              }`,
                                              color:
                                                selectedQuantity >=
                                                maxSelectableQuantity
                                                  ? "error.main"
                                                  : "inherit",
                                            }}
                                          >
                                            <Typography
                                              variant="caption"
                                              fontWeight="bold"
                                            >
                                              +
                                            </Typography>
                                          </IconButton>
                                        </Box>
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() =>
                                            handlePartRemoval(partIndex)
                                          }
                                          disabled={part.isExisting}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                    {/* Price Details */}
                                    <Box
                                      sx={{
                                        mt: 1,
                                        p: 1,
                                        backgroundColor:
                                          theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.05)"
                                            : "rgba(0, 0, 0, 0.04)",
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Grid
                                        container
                                        spacing={1}
                                        alignItems="center"
                                      >
                                        <Grid item xs={4}>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ 
                                              fontStyle: part.isExisting ? 'italic' : 'normal',
                                              color: part.isExisting ? 'text.disabled' : 'text.secondary'
                                            }}
                                          >
                                            Price/Unit: ₹{part.sellingPrice.toFixed(2)}
                                            {part.isExisting && ' (Fixed)'}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            GST1: ₹{taxAmount.toFixed(2)}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={5}>
                                          <Typography
                                            variant="caption"
                                            fontWeight={600}
                                            color="primary"
                                            sx={{ 
                                              fontStyle: part.isExisting ? 'italic' : 'normal',
                                              color: part.isExisting ? 'text.disabled' : 'primary'
                                            }}
                                          >
                                            Total: ₹{totalPrice.toFixed(2)}
                                            {part.isExisting && ' (Fixed)'}
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
                      </Box>
    

    
                      {/* Parts Display */}
                      <Box>
                     
                      </Box>
                    </CardContent>
                  </Card>
    
                  {/* Work Details */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Box
                      sx={{
                        background: "#1976d2",
                        color: "white",
                        p: 2.5,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 2 }}>
                        <CommentIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Work Details
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
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
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                        color: "white",
                        p: { xs: 2, sm: 2.5 },
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 2 }}>
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
                          <Box
                            sx={{
                              p: 2,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "#1e1e1e"
                                  : "#f8fafc",
                              borderRadius: 2,
                              border: `1px solid ${
                                theme.palette.mode === "dark" ? "#333" : "#e2e8f0"
                              }`,
                              height: "100%",
                            }}
                          >
                            <Box
                              sx={{ display: "flex", alignItems: "center", mb: 1 }}
                            >
                              <SecurityIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.primary.main,
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                              >
                                Insurance Company
                              </Typography>
                            </Box>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color="text.primary"
                            >
                              {insuranceDetails.company || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
    
                        {/* Policy Number */}
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "#1e1e1e"
                                  : "#f8fafc",
                              borderRadius: 2,
                              border: `1px solid ${
                                theme.palette.mode === "dark" ? "#333" : "#e2e8f0"
                              }`,
                              height: "100%",
                            }}
                          >
                            <Box
                              sx={{ display: "flex", alignItems: "center", mb: 1 }}
                            >
                              <AssignmentIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.primary.main,
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                              >
                                Policy Number
                              </Typography>
                            </Box>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color="text.primary"
                            >
                              {insuranceDetails.number || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
    
                        {/* Policy Type */}
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "#1e1e1e"
                                  : "#f8fafc",
                              borderRadius: 2,
                              border: `1px solid ${
                                theme.palette.mode === "dark" ? "#333" : "#e2e8f0"
                              }`,
                              height: "100%",
                            }}
                          >
                            <Box
                              sx={{ display: "flex", alignItems: "center", mb: 1 }}
                            >
                              <InventoryIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.primary.main,
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                              >
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
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color="text.primary"
                              >
                                Not specified
                              </Typography>
                            )}
                          </Box>
                        </Grid>
    
                        {/* Expiry Date */}
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "#1e1e1e"
                                  : "#f8fafc",
                              borderRadius: 2,
                              border: `1px solid ${
                                theme.palette.mode === "dark" ? "#333" : "#e2e8f0"
                              }`,
                              height: "100%",
                            }}
                          >
                            <Box
                              sx={{ display: "flex", alignItems: "center", mb: 1 }}
                            >
                              <TimerIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.warning.main,
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                              >
                                Expiry Date
                              </Typography>
                            </Box>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color="text.primary"
                            >
                              {insuranceDetails.expiry
                                ? new Date(
                                    insuranceDetails.expiry
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Not specified"}
                            </Typography>
                            {insuranceDetails.expiry && (
                              <Typography
                                variant="caption"
                                color={
                                  new Date(insuranceDetails.expiry) < new Date()
                                    ? "error.main"
                                    : new Date(insuranceDetails.expiry) <
                                      new Date(
                                        Date.now() + 30 * 24 * 60 * 60 * 1000
                                      )
                                    ? "warning.main"
                                    : "success.main"
                                }
                              >
                                {new Date(insuranceDetails.expiry) < new Date()
                                  ? "⚠ Expired"
                                  : new Date(insuranceDetails.expiry) <
                                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                  ? "⚠ Expires Soon"
                                  : "✅ Valid"}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
    
                      {/* Summary Section */}
                      {(insuranceDetails.company || insuranceDetails.number) && (
                        <Box
                          sx={{
                            mt: 3,
                            p: 2,
                            bgcolor:
                              theme.palette.mode === "dark" ? "#2a2a2a" : "#eff6ff",
                            borderRadius: 2,
                            border: `1px solid ${
                              theme.palette.mode === "dark" ? "#444" : "#bfdbfe"
                            }`,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="primary"
                            fontWeight={600}
                            gutterBottom
                          >
                            📦 Insurance Summary
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                                label={`Expires: ${new Date(
                                  insuranceDetails.expiry
                                ).toLocaleDateString("en-IN", {
                                  month: "short",
                                  year: "numeric",
                                })}`}
                                size="small"
                                variant="outlined"
                                color={
                                  new Date(insuranceDetails.expiry) < new Date()
                                    ? "error"
                                    : "primary"
                                }
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
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: "center",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading || assignedEngineers.length === 0}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  sx={{
                    px: 6,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    background: "#1565c0",
                    "&:hover": {
                      background: "#1565c0",
                    },
                  }}
                >
                  {isLoading ? "Updating..." : "Submit Work Progress"}
                </Button>
                {assignedEngineers.length === 0 && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "block", mt: 1 }}
                  >
                    Please assign at least one engineer before submitting
                  </Typography>
                )}
              </Paper>
            </form>
          </Container>
    
          {/* Add Part Dialog */}
          <Dialog
            open={openAddPartDialog}
            onClose={handleCloseAddPartDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Add New Part</Typography>
                <IconButton onClick={handleCloseAddPartDialog}>
                  <CloseIcon />
                </IconButton>
              </Box>
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
    
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Part Number *"
                    name="partNumber"
                    value={newPart.partNumber}
                    onChange={handlePartInputChange}
                    required
                    fullWidth
                    margin="normal"
                    error={
                      newPart.partNumber &&
                      checkDuplicatePartNumber(newPart.partNumber)
                    }
                    helperText={
                      newPart.partNumber &&
                      checkDuplicatePartNumber(newPart.partNumber)
                        ? "Already exists"
                        : ""
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
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
    
                {newPart.taxType === "igst" ? (
                  <TextField
                    label="IGST (%)"
                    name="igst"
                    type="number"
                    value={newPart.igst}
                    onChange={handlePartInputChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                )}
              </Box>
    
              {/* Tax Preview */}
              {/* {newPart.sellingPrice && newPart.quantity && (newPart.igst || newPart.cgstSgst) && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>GST Calculation Preview</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Selling Price per Unit: ₹{parseFloat(newPart.sellingPrice || 0).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {newPart.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="primary">
                        Single Part GST: ₹{(() => {
                          const igst = newPart.taxType === 'igst' ? (parseFloat(newPart.igst) || 0) : (newPart.taxType === 'cgstSgst' ? (parseFloat(newPart.cgstSgst) || 0) : 0);
                          const cgstSgst = newPart.taxType === 'cgstSgst' ? (parseFloat(newPart.cgstSgst) || 0) : 0;
                          let singlePartGST = 0;
                          if (newPart.taxType === 'igst' && igst > 0) {
                            singlePartGST = (newPart.sellingPrice * igst) / 100;
                          } else if (newPart.taxType === 'cgstSgst' && cgstSgst > 0) {
                            singlePartGST = (newPart.sellingPrice * cgstSgst * 2) / 100;
                          }
                          return singlePartGST.toFixed(2);
                        })()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="success.main">
                        Total GST for Quantity: ₹{(() => {
                          const igst = newPart.taxType === 'igst' ? (parseFloat(newPart.igst) || 0) : (newPart.taxType === 'cgstSgst' ? (parseFloat(newPart.cgstSgst) || 0) : 0);
                          const cgstSgst = newPart.taxType === 'cgstSgst' ? (parseFloat(newPart.cgstSgst) || 0) : 0;
                          let singlePartGST = 0;
                          if (newPart.taxType === 'igst' && igst > 0) {
                            singlePartGST = (newPart.sellingPrice * igst) / 100;
                          } else if (newPart.taxType === 'cgstSgst' && cgstSgst > 0) {
                            singlePartGST = (newPart.sellingPrice * cgstSgst * 2) / 100;
                          }
                          return (singlePartGST * newPart.quantity).toFixed(2);
                        })()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="success.dark">
                        Total Amount (Including GST): ₹{(() => {
                          const igst = newPart.taxType === 'igst' ? (parseFloat(newPart.igst) || 0) : (newPart.taxType === 'cgstSgst' ? (parseFloat(newPart.cgstSgst) || 0) : 0);
                          const cgstSgst = newPart.taxType === 'cgstSgst' ? (parseFloat(newPart.cgstSgst) || 0) : 0;
                          let singlePartGST = 0;
                          if (newPart.taxType === 'igst' && igst > 0) {
                            singlePartGST = (newPart.sellingPrice * igst) / 100;
                          } else if (newPart.taxType === 'cgstSgst' && cgstSgst > 0) {
                            singlePartGST = (newPart.sellingPrice * cgstSgst * 2) / 100;
                          }
                          const totalAmount = (newPart.sellingPrice + singlePartGST) * newPart.quantity;
                          return totalAmount.toFixed(2);
                        })()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )} */}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddPartDialog} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={handleAddPart}
                variant="contained"
                disabled={addingPart || !newPart.partName.trim()}
                startIcon={
                  addingPart ? <CircularProgress size={20} /> : <AddIcon />
                }
                sx={{
                  backgroundColor: "#ff4d4d",
                  "&:hover": { backgroundColor: "#e63939" },
                }}
              >
                {addingPart ? "Adding..." : "Add Part"}
              </Button>
            </DialogActions>
          </Dialog>
    
          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                position: "fixed",
                top: 20,
                right: 20,
                zIndex: 9999,
                maxWidth: "400px",
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
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
  );
};

export default WorkInProgress;