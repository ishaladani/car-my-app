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
  const [selectedParts, setSelectedParts] = useState([]);
  const [allParts, setAllParts] = useState([]);
  const [partIdCounter, setPartIdCounter] = useState(1);
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
  const [addPartMode, setAddPartMode] = useState("");

  const statusOptions = [
    { value: "pending", label: "Pending", color: "warning" },
    { value: "in_progress", label: "In Progress", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "error" },
    { value: "on_hold", label: "On Hold", color: "default" },
  ];

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
      
      // Update API with the new parts selection
      if (updatedParts.length > 0) {
        await updateJobCardWithParts(updatedParts);
      }
      
      if (error) setError(null);
    } catch (err) {
      console.error("Error handling part selection:", err);
      setError("Failed to update part selection");
    }
  };

  const handlePartRemoval = async (partIndex) => {
    try {
      const updatedParts = selectedParts.filter((_, idx) => idx !== partIndex);
      setSelectedParts(updatedParts);
      
      // Update API with the remaining parts
      if (updatedParts.length > 0) {
        await updateJobCardWithParts(updatedParts);
      } else {
        // If no parts remain, send empty array to clear parts
        await updateJobCardWithParts([]);
      }
    } catch (err) {
      console.error("Error removing part:", err);
      setError(`Failed to remove part`);
    }
  };

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
      
      // Update API with the updated parts
      await updateJobCardWithParts(updatedParts);
      
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
    selectedParts.forEach((part) => {
      if (part._id === inventoryPartId) {
        totalSelected += part.selectedQuantity || 1;
      }
    });
    allParts.forEach((part) => {
      if (part.type === "inventory" && part.inventoryId === inventoryPartId) {
        totalSelected += part.selectedQuantity || 1;
      }
    });
    return Math.max(0, originalPart.quantity - totalSelected);
  };

  const updatePartQuantity = useCallback(
    async (partId, newQuantity) => {
      try {
        if (newQuantity === 0) {
          await apiCall(`/garage/inventory/delete/${partId}`, {
            method: "DELETE",
          });
        } else {
          await apiCall(`/garage/inventory/update/${partId}`, {
            method: "PUT",
            data: { quantity: newQuantity },
          });
        }
        await fetchInventoryParts();
      } catch (err) {
        console.error(`Failed to update quantity for part ${partId}:`, err);
        throw new Error(
          `Failed to update part quantity: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    },
    [apiCall, fetchInventoryParts]
  );

  // Function to update job card with parts in API
  const updateJobCardWithParts = async (partsToUpdate) => {
    try {

      
      // Map parts to the simplified API structure based on successful response
      const partsForAPI = partsToUpdate.map(part => {
        const quantity = Number(part.selectedQuantity) || Number(part.quantity) || 1;
        const sellingPrice = Number(part.sellingPrice) || 0;
        const totalPrice = sellingPrice * quantity;
        
        return {
          partName: part.partName || '',
          quantity: quantity,
          totalPrice: totalPrice,
          _id: part._id || part.partId || Date.now().toString() // Generate _id if not present
        };
      });

      const updatePayload = { partsUsed: partsForAPI };
      


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

  const addInventoryPartToList = async (inventoryPart) => {
    const availableQuantity = getAvailableQuantity(inventoryPart._id);
    if (availableQuantity <= 0) {
      setSnackbar({
        open: true,
        message: `No stock available for "${inventoryPart.partName}"`,
        severity: "error",
      });
      return;
    }
    const newPart = {
      id: partIdCounter,
      type: "inventory",
      inventoryId: inventoryPart._id,
      partName: inventoryPart.partName,
      partNumber: inventoryPart.partNumber || "",
      selectedQuantity: 1,
      sellingPrice: inventoryPart.sellingPrice || 0,
      gstPercentage: inventoryPart.gstPercentage || inventoryPart.taxAmount || 0, // Use as %
      carName: inventoryPart.carName || "",
      model: inventoryPart.model || "",
      availableQuantity: availableQuantity,
      totalPrice: 0,
      isExisting: false,
    };
    setAllParts((prev) => [...prev, newPart]);
    setPartIdCounter((prev) => prev + 1);
    
    // Update API with the new part added to the list
    try {
      const currentSelectedParts = [...selectedParts];
      const partForAPI = {
        _id: inventoryPart._id,
        partName: inventoryPart.partName,
        selectedQuantity: 1,
        sellingPrice: inventoryPart.sellingPrice || 0,
      };
      
      const updatedParts = [...currentSelectedParts, partForAPI];
      await updateJobCardWithParts(updatedParts);
    } catch (err) {
      console.error("Error updating API when adding inventory part:", err);
    }
  };

  const removePartFromList = async (partId) => {
    const partToRemove = allParts.find((part) => part.id === partId);
    setAllParts((prev) => prev.filter((part) => part.id !== partId));
    
    // Update API by removing the part from selected parts
    if (partToRemove) {
      try {
        const updatedSelectedParts = selectedParts.filter(
          (part) => part._id !== partToRemove.inventoryId && part._id !== partToRemove._id
        );
        await updateJobCardWithParts(updatedSelectedParts);
      } catch (err) {
        console.error("Error updating API when removing part from list:", err);
      }
    }
  };

  const updatePartInList = (partId, field, value) => {
    setAllParts((prev) =>
      prev.map((part) => (part.id === partId ? { ...part, [field]: value } : part))
    );
  };

  const handleInventoryPartQuantityChange = async (partId, newQuantity) => {
    const part = allParts.find((p) => p.id === partId);
    if (!part) return;
    if (part.type === "existing") {
      if (newQuantity < 1) {
        setSnackbar({
          open: true,
          message: "Quantity must be at least 1",
          severity: "error",
        });
        return;
      }
      updatePartInList(partId, "selectedQuantity", newQuantity);
      
      // Update API with the updated existing part
      try {
        const updatedSelectedParts = selectedParts.map(p => 
          p._id === part._id ? { ...p, selectedQuantity: newQuantity } : p
        );
        await updateJobCardWithParts(updatedSelectedParts);
      } catch (err) {
        console.error("Error updating API when changing existing part quantity:", err);
      }
      return;
    }
    if (part.type === "inventory") {
      const availableQuantity = getAvailableQuantity(part.inventoryId);
      const currentlySelected = part.selectedQuantity || 1;
      const maxSelectableQuantity = availableQuantity + currentlySelected;
      if (newQuantity > maxSelectableQuantity) {
        setSnackbar({
          open: true,
          message: `Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`,
          severity: "error",
        });
        return;
      }
      if (newQuantity < 1) {
        setSnackbar({
          open: true,
          message: "Quantity must be at least 1",
          severity: "error",
        });
        return;
      }
      updatePartInList(partId, "selectedQuantity", newQuantity);
      
      // Update API with the updated inventory part
      try {
        const updatedSelectedParts = selectedParts.map(p => 
          p._id === part.inventoryId ? { ...p, selectedQuantity: newQuantity } : p
        );
        await updateJobCardWithParts(updatedSelectedParts);
      } catch (err) {
        console.error("Error updating API when changing inventory part quantity:", err);
      }
    }
  };

  const calculatePartFinalPrice = (part) => {
    const unitPrice = parseFloat(part.sellingPrice);
    const selectedQuantity = parseInt(part.selectedQuantity || 1);
    const taxPercentage = parseFloat(part.gstPercentage || 0); // Now treated as %
    const total = unitPrice * selectedQuantity;
    const calculatedTax = (total * taxPercentage) / 100;
    return total + calculatedTax;
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
      const taxPercentage =
        newPart.taxType === "igst"
          ? newPart.igst
          : parseFloat(newPart.cgstSgst) * 2;

      const requestData = {
        name: newPart.name,
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
        igst: newPart.taxType === "igst" ? parseFloat(newPart.igst) : 0,
        cgstSgst: newPart.taxType === "cgstSgst" ? parseFloat(newPart.cgstSgst) : 0,
        sgstEnabled: newPart.sgstEnabled,
        sgstPercentage: newPart.sgstEnabled ? parseFloat(newPart.sgstPercentage) : 0,
        cgstEnabled: newPart.cgstEnabled,
        cgstPercentage: newPart.cgstEnabled ? parseFloat(newPart.cgstPercentage) : 0,
        taxAmount: taxPercentage, // ✅ Store as %, not ₹
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

          const existingParts = data.partsUsed.map((part, index) => {
            // For parts from job card, pricePerPiece is the final price including tax
            // We need to extract the base selling price and tax amount
            let sellingPrice = part.sellingPrice || 0;
            let taxAmount = part.gstPercentage || 0;
            
            // If we have pricePerPiece from job card, treat it as the final price
            if (part.pricePerPiece && !sellingPrice) {
              // For job card parts, pricePerPiece is already the final price
              // We'll set sellingPrice to pricePerPiece and taxAmount to 0 for display
              sellingPrice = part.pricePerPiece;
              taxAmount = 0; // Since pricePerPiece already includes tax
            }
            
            return {
              id: index + 1,
              type: "existing",
              partName: part.partName || "",
              partNumber: part.partNumber || "",
              selectedQuantity: part.quantity || 1,
              sellingPrice: part.pricePerPiece || sellingPrice, // Use original pricePerPiece
              totalPrice: part.totalPrice || 0, // Use original totalPrice
              gstPercentage: taxAmount, // Use as %
              carName: part.carName || "",
              model: part.model || "",
              isExisting: true,
              _id: part._id,
              quantity: part.quantity || 1, // Original quantity
              taxAmount: taxAmount,
            };
          });

          setAllParts(existingParts);
          setSelectedParts(existingParts);
          setPartIdCounter(existingParts.length + 1);
        } else {
          setAllParts([]);
          setSelectedParts([]);
          setPartIdCounter(1);
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

      const allPartsUsed = [];
      const existingParts = allParts.filter(
        (part) => part.type === "existing" && part.partName && part.partName.trim() !== ""
      );
      const inventoryParts = allParts.filter(
        (part) => part.type === "inventory" && part.partName && part.partName.trim() !== ""
      );
      const newSelectedParts = selectedParts.filter(
        (part) => part.partName && part.partName.trim() !== ""
      );

      existingParts.forEach((part) => {
        // For existing parts, use the original values as-is from the job card
        allPartsUsed.push({
          _id: part._id,
          partName: part.partName,
          partNumber: part.partNumber || "",
          quantity: parseInt(part.quantity) || 1, // Use original quantity, not selectedQuantity
          pricePerPiece: parseFloat(part.sellingPrice) || 0, // Use original pricePerPiece
          totalPrice: parseFloat(part.totalPrice) || 0, // Use original totalPrice
          gstPercentage: part.gstPercentage || 0,
          originalQuantity: parseInt(part.quantity) || 1,
          carName: part.carName || "",
          model: part.model || "",
        });
      });

      for (const part of inventoryParts) {
        const selectedQuantity = part.selectedQuantity || 1;
        allPartsUsed.push({
          partId: part.inventoryId,
          partName: part.partName,
          partNumber: part.partNumber || "",
          quantity: selectedQuantity,
          sellingPrice: part.sellingPrice || 0,
          gstPercentage: part.gstPercentage || 0,
          totalPrice: calculatePartFinalPrice(part),
          originalQuantity: parseInt(part.quantity) || 1,
          carName: part.carName || "",
          model: part.model || "",
        });
        const currentPart = inventoryParts.find((p) => p._id === part.inventoryId);
        if (currentPart) {
          const newQuantity = currentPart.quantity - selectedQuantity;
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for "${part.partName}"`);
          }
          await updatePartQuantity(part.inventoryId, newQuantity);
        }
      }

      for (const part of newSelectedParts) {
        const selectedQuantity = part.selectedQuantity || 1;
        allPartsUsed.push({
          partId: part._id,
          partName: part.partName,
          partNumber: part.partNumber || "",
          quantity: selectedQuantity,
          sellingPrice: part.sellingPrice || 0,
          gstPercentage: part.gstPercentage || 0,
          totalPrice: calculatePartFinalPrice(part),
          originalQuantity: parseInt(part.quantity) || 1,
          carName: part.carName || "",
          model: part.model || "",
        });
        const currentPart = inventoryParts.find((p) => p._id === part._id);
        if (currentPart) {
          const newQuantity = currentPart.quantity - selectedQuantity;
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for "${part.partName}"`);
          }
          await updatePartQuantity(part._id, newQuantity);
        }
      }

      const partsArray = allPartsUsed.map((part) => {
        const selectedQuantity = Number(part.quantity) || 1;
        const sellingPrice = Number(part.sellingPrice) || 0;
        const taxPercentage = Number(part.gstPercentage || 0);
        const total = sellingPrice * selectedQuantity;
        const calculatedTaxAmount = (total * taxPercentage) / 100;
        const finalPrice = total + calculatedTaxAmount;
        return {
          partName: part.partName || "",
          sellingPrice: sellingPrice,
          txt: calculatedTaxAmount,
          selectedQuantity: selectedQuantity,
          finalPrice: finalPrice,
        };
      });

      const requestData = {
        engineerRemarks: remarks || "",
        status: status || "in_progress",
        assignedEngineerId: assignedEngineers.map((eng) => eng._id),
        partsUsed: allPartsUsed,
        partsArray: partsArray,
        jobCardNumber: jobId,
      };



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

      setSnackbar({
        open: true,
        message: `✅ Work progress updated! Job Card: ${jobCardNumber}, Engineers: ${assignedEngineers
          .map((e) => e.name)
          .join(", ")}, Parts: ${allPartsUsed.length} items`,
        severity: "success",
      });

      setTimeout(() => {
        navigate(`/Quality-Check/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating work progress:", error);
      setSnackbar({
        open: true,
        message: `Error: ${
          error.response?.data?.message ||
          error.message ||
          "Failed to update work progress"
        }`,
        severity: "error",
      });
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
                              required={assignedEngineers.length === 0}
                              error={assignedEngineers.length === 0}
                              helperText={
                                assignedEngineers.length === 0
                                  ? "At least one engineer must be assigned"
                                  : ""
                              }
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
                      {/* Parts Selection */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{ mb: 1 }}
                        >
                          Select Parts from Inventory (Optional)
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
                              (part) => getAvailableQuantity(part._id) > 0
                            )}
                            getOptionLabel={(option) =>
                              `${option.partName} (${
                                option.partNumber || "N/A"
                              }) - ₹${option.sellingPrice || 0} | GST: ${
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
                                    Part : {option.partNumber || "N/A"} | Price: ₹
                                    {option.sellingPrice || 0} | GST:{" "}
                                    {option.gstPercentage || option.taxAmount || 0}|
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
    
                        {/* Selected Parts with Enhanced Quantity Management */}
                        {selectedParts.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, fontWeight: 600 }}
                            >
                              Selected Parts with Details:
                            </Typography>
                            <List dense>
                              {selectedParts.map((part, partIndex) => {
                                const selectedQuantity = part.selectedQuantity || 1;
                                const quantity = part.quantity;
                                const sellingPrice = part.sellingPrice || 0;
                                const taxRate = part.taxAmount || 0; // percentage
                                
                                // For existing parts from job card, use the original values as-is
                                const pricePerPiece = part.isExisting ? part.sellingPrice : (sellingPrice + (sellingPrice * taxRate / 100));
                                const totalPrice = part.isExisting ? part.totalPrice : (pricePerPiece * selectedQuantity);
                                const taxAmount = part.isExisting ? 0 : ((sellingPrice * taxRate / 100) * selectedQuantity);
    

    
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
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ display: "block" }}
                                        >
                                          Part #: {part.partNumber || "N/A"} |{" "}
                                          {part.carName} - {part.model}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="info.main"
                                          sx={{ display: "block" }}
                                        >
                                          {part.isExisting ? (
                                            `Quantity: ${selectedQuantity} (Fixed)`
                                          ) : (
                                            `Max Selectable: ${maxSelectableQuantity} | Selected: ${selectedQuantity}`
                                          )}
                                        </Typography>
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
    
                                              if (
                                                newQuantity > maxSelectableQuantity
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
                                              max: maxSelectableQuantity,
                                              style: {
                                                width: "50px",
                                                textAlign: "center",
                                              },
                                              readOnly:
                                                (isMaxQuantityReached &&
                                                selectedQuantity ===
                                                  maxSelectableQuantity) || part.isExisting,
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
                                              if (
                                                newQuantity <= maxSelectableQuantity
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
                                              selectedQuantity >=
                                                maxSelectableQuantity ||
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
                                            Price/Unit: ₹{pricePerPiece.toFixed(2)}
                                            {part.isExisting && ' (Fixed)'}
                                          </Typography>
                                        </Grid>
                                        {/* <Grid item xs={3}>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            GST: ₹{taxAmount.toFixed(2)}
                                          </Typography>
                                        </Grid> */}
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
    
                      {/* Add from Inventory Section */}
                      {addPartMode === "inventory" && (
                        <Box
                          sx={{
                            mb: 3,
                            p: 2,
                            border: 1,
                            borderColor: "primary.main",
                            borderRadius: 1,
                            bgcolor: "primary.light",
                            opacity: 0.1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                          >
                            Select from Inventory
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
                              <Typography sx={{ ml: 2 }}>
                                Loading inventory...
                              </Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{ display: "flex", gap: 1, alignItems: "center" }}
                            >
                              <Autocomplete
                                fullWidth
                                options={inventoryParts.filter(
                                  (part) => getAvailableQuantity(part._id) > 0
                                )}
                                getOptionLabel={(option) =>
                                  `${option.partName} (${
                                    option.partNumber || "N/A"
                                  }) - ₹${
                                    option.sellingPrice || 0
                                  } | Available: ${getAvailableQuantity(
                                    option._id
                                  )}`
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
                                        Part #: {option.partNumber || "N/A"} |
                                        Price: ₹{option.sellingPrice || 0} | GST:{" "}
                                        {option.taxAmount || 0}% | Available:{" "}
                                        {getAvailableQuantity(option._id)} |
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
                                    event.target.value = "";
                                  }
                                }}
                                noOptionsText="No parts available in inventory"
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
                              <Button
                                variant="outlined"
                                onClick={() => setAddPartMode("")}
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
              {newPart.purchasePrice &&
                newPart.quantity &&
                (newPart.igst || newPart.cgstSgst) && (
                  <Box
                    sx={{ mt: 3, p: 2, bgcolor: "action.hover", borderRadius: 1 }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Tax Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Base: ₹
                          {(newPart.sellingPrice * newPart.quantity).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="primary">
                          Tax: ₹
                          {calculateTaxAmount(
                            newPart.sellingPrice,
                            newPart.quantity,
                            newPart.taxType === "igst"
                              ? newPart.igst
                              : newPart.cgstSgst * 2
                          ).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="h6">
                          Total: ₹
                          {calculateTotalPrice(
                            newPart.sellingPrice,
                            newPart.quantity,
                            newPart.igst,
                            newPart.cgstSgst
                          ).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
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