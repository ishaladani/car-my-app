import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  Checkbox,
} from "@mui/material";
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
  Edit as EditIcon,
} from "@mui/icons-material";
import { useThemeContext } from "../Layout/ThemeContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_BASE_URL = "https://garage-management-zi5z.onrender.com/api";

const AssignEngineer = () => {
  const { darkMode } = useThemeContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Updated job details state to include pricing
  const [jobPoints, setJobPoints] = useState([]);
  const [currentJobPoint, setCurrentJobPoint] = useState({
    description: "",
  });

  const jobCardId = location.state?.jobCardId;
  const garageId = localStorage.getItem("garageId");
  const garageToken = localStorage.getItem("token");

  // Main State
  const [engineers, setEngineers] = useState([]);
  const [assignments, setAssignments] = useState([
    {
      id: Date.now(),
      engineer: null,
      parts: [],
      priority: "medium",
      estimatedDuration: "",
      notes: "",
    },
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

  // NEW: Add state for editing part prices and GST settings
  const [editingPartPrice, setEditingPartPrice] = useState(null);
  const [gstSettings, setGstSettings] = useState({
    includeGst: true,
    billType: "gst", // 'gst' or 'non-gst'
  });

  // NEW: Functions for editing part prices and GST logic
  const handleEditPartPrice = (assignmentId, partIndex, currentPrice) => {
    setEditingPartPrice({
      assignmentId,
      partIndex,
      currentPrice: parseFloat(currentPrice) || 0,
    });
  };

  const handleSavePartPrice = (newPrice) => {
    if (editingPartPrice) {
      const { assignmentId, partIndex } = editingPartPrice;
      const newPriceNum = parseFloat(newPrice) || 0;

      setAssignments((prev) =>
        prev.map((assignment) => {
          if (assignment.id === assignmentId) {
            const updatedParts = [...assignment.parts];
            updatedParts[partIndex] = {
              ...updatedParts[partIndex],
              sellingPrice: newPriceNum,
              pricePerUnit: newPriceNum,
            };
            return { ...assignment, parts: updatedParts };
          }
          return assignment;
        })
      );

      setEditingPartPrice(null);
    }
  };

  const handleGstToggle = (event) => {
    setGstSettings((prev) => ({
      ...prev,
      includeGst: event.target.checked,
      billType: event.target.checked ? "gst" : "non-gst",
    }));
  };

  const calculatePartPriceWithGst = (part, selectedQuantity) => {
    const unitPrice = part.sellingPrice || part.pricePerUnit || 0;
    const basePrice = unitPrice * selectedQuantity;

    if (gstSettings.billType === "non-gst") {
      // Remove tax for non-GST bills
      return basePrice;
    } else {
      // Include tax for GST bills
      const taxAmount = part.taxAmount || 0;
      const originalQuantity = part.quantity || 1;
      const calculatedTax = (selectedQuantity * taxAmount) / originalQuantity;
      return basePrice + calculatedTax;
    }
  };

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
    sgstPercentage: "",
    cgstEnabled: false,
    cgstPercentage: "",
    taxAmount: 0,
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
    specialty: "",
  });
  const [addingEngineer, setAddingEngineer] = useState(false);
  const [engineerAddSuccess, setEngineerAddSuccess] = useState(false);
  const [engineerAddError, setEngineerAddError] = useState(null);

  const [fetchingData, setFetchingData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const updateJobCardWithParts = async (selectedParts) => {
    try {
      // Get existing job details
      const jobDetailsString = getJobDetailsForAPI();

      // Format parts for API
      const formattedParts = selectedParts.map((part) => ({
        _id: part._id,
        partId: part._id,
        partName: part.partName,
        partNumber: part.partNumber || "",
        quantity: part.selectedQuantity || 1,
        sellingPrice: part.sellingPrice || 0,
        gstPercentage: part.taxAmount || 0,
        carName: part.carName || "",
        model: part.model || "",
      }));

      console.log("Updating job card immediately with parts:", formattedParts);

      // Update job card with current job details and newly selected parts
      await updateJobCard(id, jobDetailsString, formattedParts);

      // Show success notification
      setSnackbar({
        open: true,
        message: `✅ Job card updated with ${formattedParts.length} part(s)`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating job card with parts:", error);
      setSnackbar({
        open: true,
        message: "Failed to update job card with selected parts",
        severity: "error",
      });
    }
  };

  // **ALTERNATIVE: Update job card when part quantity changes**
  const handlePartQuantityChange = async (
    assignmentId,
    partIndex,
    newQuantity,
    oldQuantity
  ) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
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
        setError(
          `Cannot select more than ${maxSelectableQuantity} units of "${part.partName}". Available: ${availableQuantity}, Currently Selected: ${currentlySelected}`
        );
        return;
      }

      if (newQuantity < 1) {
        setError("Quantity must be at least 1");
        return;
      }

      // Update the part quantity in the assignment (local state)
      const updatedParts = assignment.parts.map((p, idx) =>
        idx === partIndex ? { ...p, selectedQuantity: newQuantity } : p
      );

      updateAssignment(assignmentId, "parts", updatedParts);

      // **NEW: Update job card API with updated quantities**
      if (id) {
        await updateJobCardWithParts(updatedParts);
      }

      // Clear any previous errors
      if (error && error.includes(part.partName)) {
        setError(null);
      }
    } catch (err) {
      console.error("Error updating part quantity:", err);
      setError(`Failed to update quantity for "${part.partName}"`);
    }
  };

  // **ENHANCED: Update job card when parts are removed**
  const handlePartRemoval = async (assignmentId, partIndex) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const part = assignment.parts[partIndex];
    if (!part) return;

    try {
      // Remove part from assignment (local state)
      const updatedParts = assignment.parts.filter(
        (_, idx) => idx !== partIndex
      );
      updateAssignment(assignmentId, "parts", updatedParts);

      // **NEW: Update job card API with remaining parts**
      if (id) {
        await updateJobCardWithParts(updatedParts);
      }

      setSnackbar({
        open: true,
        message: `Part "${part.partName}" removed and job card updated`,
        severity: "info",
      });
    } catch (err) {
      console.error("Error removing part:", err);
      setError(`Failed to remove part "${part.partName}"`);
    }
  };

  // **ENHANCED: Collect all parts from all assignments for job card update**
  const getAllSelectedParts = () => {
    const allPartsUsed = [];
    assignments.forEach((assignment) => {
      assignment.parts.forEach((part) => {
        const existingPartIndex = allPartsUsed.findIndex(
          (p) => p._id === part._id
        );
        const selectedQuantity = part.selectedQuantity || 1;

        if (existingPartIndex !== -1) {
          allPartsUsed[existingPartIndex].quantity += selectedQuantity;
        } else {
          // Calculate tax amount: selectedQuantity * taxAmount / quantity
          const calculatedTaxAmount =
            (selectedQuantity * part.taxAmount) / part.quantity;

          allPartsUsed.push({
            _id: part._id,
            partId: part._id,
            partName: part.partName,
            partNumber: part.partNumber || "",
            quantity: selectedQuantity,
            sellingPrice: part.sellingPrice || 0,
            gstPercentage: part.taxAmount || 0,
            originalQuantity: part.quantity, // Store original quantity for calculation
            carName: part.carName || "",
            model: part.model || "",
          });
        }
      });
    });
    return allPartsUsed;
  };

  // **ENHANCED: Update job card with all parts from all assignments**
  const updateJobCardWithAllParts = async () => {
    try {
      const jobDetailsString = getJobDetailsForAPI();
      const allParts = getAllSelectedParts();

      if (id) {
        await updateJobCard(id, jobDetailsString, allParts);
        console.log("Job card updated with all parts:", allParts);
      }
    } catch (error) {
      console.error("Error updating job card with all parts:", error);
      throw error;
    }
  };

  // Updated job details functions with pricing
  const addJobPoint = () => {
    if (currentJobPoint.description.trim()) {
      const newJobPoint = {
        id: Date.now(), // Simple ID generation
        description: currentJobPoint.description.trim(),
      };

      setJobPoints((prev) => [...prev, newJobPoint]);

      // Clear the input fields
      setCurrentJobPoint({ description: "" });
    }
  };

  const removeJobPoint = (indexToRemove) => {
    setJobPoints((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle input changes
  const handleJobPointInputChange = (field, value) => {
    setCurrentJobPoint((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleJobPointKeyPress = (e) => {
    if (e.key === "Enter") {
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
    message: "",
    severity: "success",
  });

  // State to store job card data temporarily until engineers and parts are loaded
  const [jobCardDataTemp, setJobCardDataTemp] = useState(null);

  // Tax calculation functions based on InventoryManagement
  const calculateTaxAmount = (pricePerUnit, quantity, percentage) => {
    if (!pricePerUnit || !quantity || !percentage) return 0;
    const totalPrice = parseFloat(pricePerUnit) * parseInt(quantity);
    return (totalPrice * parseFloat(percentage)) / 100;
  };

  const calculateTotalTaxAmount = (
    pricePerUnit,
    quantity,
    sgstEnabled,
    sgstPercentage,
    cgstEnabled,
    cgstPercentage
  ) => {
    let totalTax = 0;

    if (sgstEnabled && sgstPercentage) {
      totalTax += calculateTaxAmount(pricePerUnit, quantity, sgstPercentage);
    }

    if (cgstEnabled && cgstPercentage) {
      totalTax += calculateTaxAmount(pricePerUnit, quantity, cgstPercentage);
    }

    return totalTax;
  };

  const calculateTotalPrice = (
    pricePerUnit,
    quantity,
    sgstEnabled,
    sgstPercentage,
    cgstEnabled,
    cgstPercentage
  ) => {
    if (!pricePerUnit || !quantity) return 0;

    const basePrice = parseFloat(pricePerUnit) * parseInt(quantity);
    const totalTax = calculateTotalTaxAmount(
      pricePerUnit,
      quantity,
      sgstEnabled,
      sgstPercentage,
      cgstEnabled,
      cgstPercentage
    );

    return basePrice + totalTax;
  };

  // Check if part number already exists
  const checkDuplicatePartNumber = (partNumber, excludeId = null) => {
    return inventoryParts.some(
      (item) =>
        item.partNumber === partNumber &&
        (excludeId ? (item._id || item.id) !== excludeId : true)
    );
  };

  // Utility API Call with Authorization
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

  // Fetch Inventory Parts
  const fetchInventoryParts = useCallback(async () => {
    if (!garageId) {
      return;
    }

    try {
      setIsLoadingInventory(true);
      const res = await apiCall(`/garage/inventory/${garageId}`, {
        method: "GET",
      });
      setInventoryParts(res.data?.parts || res.data || []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("Failed to load inventory parts");
    } finally {
      setIsLoadingInventory(false);
    }
  }, [garageId, apiCall]);

  const removeExistingJobPoint = (indexToRemove) => {
    setParsedJobDetails((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // Helper function to get available quantity considering all current selections
  const getAvailableQuantity = (partId) => {
    const originalPart = inventoryParts.find((p) => p._id === partId);
    if (!originalPart) return 0;

    // Calculate total selected quantity across all assignments
    let totalSelected = 0;
    assignments.forEach((assignment) => {
      assignment.parts.forEach((part) => {
        if (part._id === partId) {
          totalSelected += part.selectedQuantity || 1;
        }
      });
    });

    return Math.max(0, originalPart.quantity - totalSelected);
  };

  // Update Part Quantity using PUT API, DELETE only when qty = 0
  const updatePartQuantity = useCallback(
    async (partId, newQuantity) => {
      try {
        console.log(`Updating part ${partId} to quantity: ${newQuantity}`);

        if (newQuantity === 0) {
          // When quantity reaches 0, use DELETE API
          await apiCall(`/garage/inventory/delete/${partId}`, {
            method: "DELETE",
          });
          console.log(`Part ${partId} deleted (quantity reached 0)`);
        } else {
          // Use PUT API to update quantity
          await apiCall(`/garage/inventory/update/${partId}`, {
            method: "PUT",
            data: { quantity: newQuantity },
          });
          console.log(`Part ${partId} updated to quantity: ${newQuantity}`);
        }

        // Refresh inventory after updating
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
      const res = await apiCall(`/garage/engineers/${garageId}`, {
        method: "GET",
      });
      setEngineers(res.data?.engineers || res.data || []);
    } catch (err) {
      console.error("Failed to fetch engineers:", err);
      setError(err.response?.data?.message || "Failed to load engineers");
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
    if (
      jobCardDataTemp &&
      engineers.length > 0 &&
      inventoryParts.length > 0 &&
      !isLoading &&
      !isLoadingInventory
    ) {
      console.log(
        "🔄 Setting assignments with job card data:",
        jobCardDataTemp
      );

      // Set engineer and parts in assignments if they exist
      if (jobCardDataTemp.engineerId && jobCardDataTemp.engineerId.length > 0) {
        const assignedEngineer = jobCardDataTemp.engineerId[0]; // Get first engineer

        // Find the full engineer object from the engineers list
        const fullEngineerData = engineers.find(
          (eng) => eng._id === assignedEngineer._id
        );

        console.log("👤 Found assigned engineer:", assignedEngineer);
        console.log("👤 Full engineer data:", fullEngineerData);

        if (fullEngineerData || assignedEngineer) {
          // Convert partsUsed from job card to format expected by the form
          let formattedParts = [];
          if (
            jobCardDataTemp.partsUsed &&
            jobCardDataTemp.partsUsed.length > 0
          ) {
            console.log("🔧 Processing parts used:", jobCardDataTemp.partsUsed);

            formattedParts = jobCardDataTemp.partsUsed.map((usedPart) => {
              // Find the part in inventory to get full details
              const inventoryPart = inventoryParts.find(
                (invPart) =>
                  invPart.partName === usedPart.partName ||
                  invPart._id === usedPart.partId ||
                  invPart._id === usedPart._id
              );

              if (inventoryPart) {
                console.log(`✅ Found part in inventory: ${usedPart.partName}`);
                return {
                  ...inventoryPart,
                  selectedQuantity: usedPart.quantity || 1,
                  availableQuantity: inventoryPart.quantity,
                };
              } else {
                // If part not found in inventory, create a mock part object
                console.log(
                  `⚠️ Part not found in inventory, creating mock: ${usedPart.partName}`
                );
                return {
                  _id:
                    usedPart._id || `mock-${Date.now()}-${usedPart.partName}`,
                  partName: usedPart.partName || "Unknown Part",
                  partNumber: usedPart.partNumber || "",
                  quantity: 0, // No stock available
                  selectedQuantity: usedPart.quantity || 1,
                  pricePerUnit: usedPart.totalPrice
                    ? usedPart.totalPrice / (usedPart.quantity || 1)
                    : 0,
                  gstPercentage: usedPart.gstPercentage || 0,
                  carName: usedPart.carName || "",
                  model: usedPart.model || "",
                  availableQuantity: 0,
                };
              }
            });
          }

          // Update the first assignment with engineer and parts
          const newAssignment = {
            id: Date.now(),
            engineer: fullEngineerData || assignedEngineer,
            parts: formattedParts,
            priority: "medium",
            estimatedDuration: jobCardDataTemp.laborHours
              ? `${jobCardDataTemp.laborHours} hours`
              : "",
            notes: jobCardDataTemp.engineerRemarks || "",
          };

          setAssignments([newAssignment]);

          console.log(
            "✅ Successfully set engineer:",
            fullEngineerData || assignedEngineer
          );
          console.log("✅ Successfully set parts:", formattedParts);
          console.log("📋 Assignment created:", newAssignment);

          // Clear temp data
          setJobCardDataTemp(null);

          setSnackbar({
            open: true,
            message: `✅ Job card data populated! Engineer: ${assignedEngineer.name}, Parts: ${formattedParts.length} items`,
            severity: "success",
          });
        }
      }
    }
  }, [
    jobCardDataTemp,
    engineers,
    inventoryParts,
    isLoading,
    isLoadingInventory,
  ]);

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
              Authorization: localStorage.getItem("token")
                ? `Bearer ${localStorage.getItem("token")}`
                : "",
            },
          }
        );

        const jobCardData = response.data;
        console.log("📋 Fetched Job Card Data:", jobCardData);

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
            console.log("Job details is in old string format, converting...");
            const lines = jobCardData.jobDetails.split("\n");
            const cleanLines = lines
              .map((line) => line.replace(/^\d+\.\s*/, "").trim())
              .filter((line) => line.length > 0);

            // Convert old format to new format with default price of 0
            const convertedJobDetails = cleanLines.map((line) => ({
              description: line,
              price: 0,
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
          message: "Job card data loaded successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error("Error fetching job card data:", error);
        setSnackbar({
          open: true,
          message:
            "Failed to load job card data: " +
            (error.response?.data?.message || error.message),
          severity: "error",
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
      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== assignmentId)
      );
    }
  };

  // Update assignment
  const updateAssignment = (assignmentId, field, value) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, [field]: value }
          : assignment
      )
    );

    if (formErrors[`assignment_${assignmentId}_${field}`]) {
      setFormErrors((prev) => ({
        ...prev,
        [`assignment_${assignmentId}_${field}`]: null,
      }));
    }
  };

  const handlePartSelection = async (
    assignmentId,
    newParts,
    previousParts = []
  ) => {
    try {
      console.log("=== Part Selection Started ===");
      console.log("Assignment ID:", assignmentId);
      console.log("New Parts:", newParts);
      console.log("Previous Parts:", previousParts);

      // Prevent selecting duplicate parts
      const uniqueParts = [];
      const seenIds = new Set();

      for (const part of newParts) {
        if (!seenIds.has(part._id)) {
          seenIds.add(part._id);
          uniqueParts.push({
            ...part,
            selectedQuantity: part.selectedQuantity || 1,
            availableQuantity: part.quantity,
          });
        }
      }

      console.log("Unique Parts:", uniqueParts);

      // Update the assignment with filtered parts (no duplicates)
      updateAssignment(assignmentId, "parts", uniqueParts);

      // **ENHANCED: Immediately update job card API with selected parts**
      if (id && uniqueParts.length > 0) {
        console.log("Updating job card with parts...");
        await updateJobCardWithParts(uniqueParts);
        console.log("Job card updated successfully");
      } else {
        console.log("No job card ID or no parts to update");
      }

      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error handling part selection:", err);
      setError("Failed to update part selection and job card");
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    assignments.forEach((assignment, index) => {
      const assignmentKey = `assignment_${assignment.id}`;

      if (!assignment.engineer) {
        errors[`${assignmentKey}_engineer`] = "Please select an engineer";
      }
    });

    if (!id && (!jobCardIds || jobCardIds.length === 0)) {
      errors.jobCards = "No job cards to assign";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please fix the form errors");
      return false;
    }

    return true;
  };

  // Updated updateJobCard function to handle job details with prices
  const updateJobCard = async (jobCardId, jobDetails, partsUsed) => {
    try {
      console.log(
        `Updating job card ${jobCardId} with job details and parts:`,
        { jobDetails, partsUsed }
      );

      // Create array format with sellingPrice, txt, selectedQuantity, and partName as requested
      const partsArray = partsUsed.map((part) => {
        const selectedQuantity = Number(part.quantity) || 1;
        const sellingPrice = Number(part.sellingPrice) || 0; // Use sellingPrice from part data
        const taxAmount = Number(part.taxAmount) || 0; // Use taxAmount from part data
        const originalQuantity =
          Number(part.originalQuantity) || part.quantity || 1;

        // Calculate tax amount: selectedQuantity * taxAmount / quantity
        const calculatedTaxAmount =
          (selectedQuantity * taxAmount) / originalQuantity;

        // Calculate final price: sellingPrice + calculatedTaxAmount
        const finalPrice = sellingPrice + calculatedTaxAmount;

        return {
          partName: part.partName || "",
          sellingPrice: sellingPrice,
          txt: calculatedTaxAmount, // Tax amount calculated as per requirement
          selectedQuantity: selectedQuantity,
          finalPrice: finalPrice,
        };
      });

      // Validate parts data before sending with new calculation format
      const validatedParts = partsUsed.map((part) => {
        const selectedQuantity = Number(part.quantity) || 1;
        const sellingPrice = Number(part.sellingPrice) || 0; // Use sellingPrice from part data
        const taxAmount = Number(part.taxAmount) || 0; // Use taxAmount from part data
        const originalQuantity =
          Number(part.originalQuantity) || part.quantity || 1;

        // Calculate tax amount: selectedQuantity * taxAmount / quantity
        const calculatedTaxAmount =
          (selectedQuantity * taxAmount) / originalQuantity;

        // Calculate final price: sellingPrice + calculatedTaxAmount
        const finalPrice = sellingPrice + calculatedTaxAmount;

        return {
          _id: part._id || part.partId, // Use _id first, then fallback to partId
          partId: part._id || part.partId,
          partName: part.partName || "",
          partNumber: part.partNumber || "",
          quantity: selectedQuantity,
          sellingPrice: sellingPrice,
          gstPercentage: calculatedTaxAmount,
          totalPrice: finalPrice,
          carName: part.carName || "",
          model: part.model || "",
        };
      });

      const updatePayload = {
        jobDetails: jobDetails,
        partsUsed: validatedParts,
        partsArray: partsArray, // New array format with sellingPrice, txt, selectedQuantity, partName
      };

      console.log("Sending update payload:", updatePayload);
      console.log(
        "Parts Array (sellingPrice, txt, selectedQuantity, partName):",
        partsArray
      );
      console.log("All selected parts being sent to API:", validatedParts);

      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`,
        updatePayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: garageToken ? `Bearer ${garageToken}` : "",
          },
        }
      );

      console.log(`Job card ${jobCardId} updated successfully:`, response.data);
      return response.data;
    } catch (err) {
      console.error(
        `Failed to update job card ${jobCardId}:`,
        err.response?.data || err.message
      );
      throw err;
    }
  };

  // Debug function to test API call with specific data
  const testUpdateJobCard = async () => {
    try {
      const testData = {
        jobDetails: "[]",
        partsUsed: [
          {
            _id: "688a38f62b00cd582fbc319b",
            partId: "688a38f62b00cd582fbc319b",
            partName: "breack",
            partNumber: "3",
            quantity: 1,
            sellingPrice: 100,
            gstPercentage: 0,
            totalPrice: 100,
            carName: "abc",
            model: "12",
          },
          {
            _id: "688a30942b00cd582fbc2efc",
            partId: "688a30942b00cd582fbc2efc",
            partName: "ok",
            partNumber: "32",
            quantity: 1,
            sellingPrice: 20,
            gstPercentage: 0,
            totalPrice: 20,
            carName: "abc",
            model: "12",
          },
        ],
        partsArray: [
          {
            partName: "breack",
            sellingPrice: 100,
            txt: 0,
            selectedQuantity: 1,
            finalPrice: 100,
          },
          {
            partName: "ok",
            sellingPrice: 20,
            txt: 0,
            selectedQuantity: 1,
            finalPrice: 20,
          },
        ],
      };

      console.log("Testing API call with data:", testData);

      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`,
        testData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: garageToken ? `Bearer ${garageToken}` : "",
          },
        }
      );

      console.log("Test API response:", response.data);
      return response.data;
    } catch (err) {
      console.error("Test API call failed:", err.response?.data || err.message);
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
        const existingCost = parsedJobDetails.reduce(
          (total, item) => total + (parseFloat(item.price) || 0),
          0
        );
        const newCost = jobPoints.reduce(
          (total, item) => total + (item.price || 0),
          0
        );
        return existingCost + newCost;
      })();

      // Collect all parts used across all assignments with enhanced data
      const allPartsUsed = [];
      const partUpdates = []; // Track inventory updates needed

      assignments.forEach((assignment) => {
        assignment.parts.forEach((part) => {
          const existingPartIndex = allPartsUsed.findIndex(
            (p) => p._id === part._id
          );
          const selectedQuantity = part.selectedQuantity || 1;

          if (existingPartIndex !== -1) {
            allPartsUsed[existingPartIndex].quantity += selectedQuantity;
          } else {
            // Calculate tax amount: selectedQuantity * taxAmount / quantity
            const calculatedTaxAmount =
              (selectedQuantity * part.taxAmount) / part.quantity;

            // Calculate final price: sellingPrice + calculatedTaxAmount
            const finalPrice = (part.sellingPrice || 0) + calculatedTaxAmount;

            allPartsUsed.push({
              _id: part._id,
              partId: part._id,
              partName: part.partName,
              partNumber: part.partNumber || "",
              quantity: selectedQuantity,
              sellingPrice: part.sellingPrice || 0, // Changed from pricePerUnit to sellingPrice
              gstPercentage: calculatedTaxAmount, // Use calculated tax amount
              totalPrice: finalPrice, // Add totalPrice field
              originalQuantity: part.quantity, // Store original quantity for calculation
              carName: part.carName || "",
              model: part.model || "",
            });
          }

          // Track inventory updates needed
          const existingUpdateIndex = partUpdates.findIndex(
            (p) => p.partId === part._id
          );
          if (existingUpdateIndex !== -1) {
            partUpdates[existingUpdateIndex].totalUsed += selectedQuantity;
          } else {
            partUpdates.push({
              partId: part._id,
              partName: part.partName,
              totalUsed: selectedQuantity,
              originalQuantity: part.quantity,
            });
          }
        });
      });

      console.log(
        "Total parts collected from all assignments:",
        allPartsUsed.length
      );
      console.log("All parts collected:", allPartsUsed);

      // Update inventory for all used parts
      console.log("Updating inventory for used parts...");
      for (const partUpdate of partUpdates) {
        const currentPart = inventoryParts.find(
          (p) => p._id === partUpdate.partId
        );
        if (currentPart) {
          const newQuantity = currentPart.quantity - partUpdate.totalUsed;
          if (newQuantity < 0) {
            throw new Error(
              `Insufficient stock for "${partUpdate.partName}". Required: ${partUpdate.totalUsed}, Available: ${currentPart.quantity}`
            );
          }

          console.log(
            `Updating ${partUpdate.partName}: ${currentPart.quantity} -> ${newQuantity}`
          );
          await updatePartQuantity(partUpdate.partId, newQuantity);
        }
      }

      // Update job card with job details and parts used
      const targetJobCardIds = jobCardIds.length > 0 ? jobCardIds : [id];

      const jobCardUpdatePromises = targetJobCardIds
        .map((jobCardId) => {
          if (jobCardId) {
            return updateJobCard(jobCardId, jobDetailsString, allPartsUsed);
          }
        })
        .filter(Boolean);

      // Process each assignment
      const assignmentPromises = assignments.map(async (assignment) => {
        const payload = {
          jobCardIds: targetJobCardIds,
          parts: assignment.parts.map((part) => ({
            partId: part._id,
            partName: part.partName,
            quantity: part.selectedQuantity || 1,
            taxAmount: part.taxAmount || 0,
          })),
          priority: assignment.priority,
          notes: assignment.notes,
        };

        console.log(
          `Assigning to engineer ${assignment.engineer._id}:`,
          payload
        );

        return axios.put(
          `https://garage-management-zi5z.onrender.com/api/jobcards/assign-jobcards/${assignment.engineer._id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      });

      // Execute job card updates first
      if (jobCardUpdatePromises.length > 0) {
        console.log("Updating job cards with job details and parts used...");
        await Promise.all(jobCardUpdatePromises);
        console.log("Job cards updated successfully");
      }

      // Execute all assignments
      console.log("Assigning to engineers...");
      const results = await Promise.all(assignmentPromises);

      console.log(
        "All assignments completed:",
        results.map((r) => r.data)
      );
      console.log("Job details updated with combined data:", jobDetailsString);
      console.log("Total job details cost:", totalJobDetailsCost);
      console.log("Parts used in job cards:", allPartsUsed);
      console.log("Inventory updated for parts:", partUpdates);

      // Show success message with totals
      setSnackbar({
        open: true,
        message: `✅ Assignment completed! Job Details Cost: ₹${totalJobDetailsCost.toFixed(
          2
        )}, Parts: ${allPartsUsed.length} items`,
        severity: "success",
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/Work-In-Progress/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Assignment error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to assign to engineers"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add New Engineer
  const handleAddEngineer = async () => {
    if (
      !newEngineer.name?.trim() ||
      !newEngineer.email?.trim() ||
      !newEngineer.phone?.trim()
    ) {
      setEngineerAddError("Please fill all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEngineer.email)) {
      setEngineerAddError("Invalid email format");
      return;
    }

    if (!/^\d{10}$/.test(newEngineer.phone)) {
      setEngineerAddError("Phone number must be exactly 10 digits");
      return;
    }

    setAddingEngineer(true);
    setEngineerAddError(null);

    try {
      const formattedEngineer = {
        ...newEngineer,
        phone: newEngineer.phone,
        garageId,
      };

      await apiCall("/garage/engineers/add", {
        method: "POST",
        data: formattedEngineer,
      });

      await fetchEngineers();

      setEngineerAddSuccess(true);
      setTimeout(() => {
        setEngineerAddSuccess(false);
        handleCloseAddEngineerDialog();
      }, 1500);
    } catch (err) {
      console.error("Add engineer error:", err);
      setEngineerAddError(
        err.response?.data?.message || "Failed to add engineer"
      );
    } finally {
      setAddingEngineer(false);
    }
  };

  // Handle Add Part
  const handleAddPart = async () => {
    if (
      !newPart.partName?.trim() ||
      !newPart.carName?.trim() ||
      !newPart.model?.trim()
    ) {
      setPartAddError("Please fill Car Name, Model, and Part Name");
      return;
    }
    if (newPart.quantity <= 0) {
      setPartAddError("Quantity must be greater than 0");
      return;
    }
    if (newPart.purchasePrice < 0 || newPart.sellingPrice < 0) {
      setPartAddError("Prices cannot be negative");
      return;
    }

    if (newPart.partNumber && checkDuplicatePartNumber(newPart.partNumber)) {
      setPartAddError("Part number already exists");
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      const igst = parseFloat(newPart.igst) || 0;
      const cgstSgst = parseFloat(newPart.cgstSgst) || 0;
      const baseAmount = newPart.purchasePrice * newPart.quantity;
      const taxAmount =
        newPart.taxType === "igst"
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
        igst: newPart.taxType === "igst" ? igst : 0,
        cgstSgst: newPart.taxType === "cgstSgst" ? cgstSgst : 0,
        taxAmount,
      };

      await axios.post(`${API_BASE_URL}/garage/inventory/add`, requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: garageToken ? `Bearer ${garageToken}` : "",
        },
      });

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
        igst: "",
        cgstSgst: "",
        taxType: "igst",
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

  // Close Handlers
  const handleCloseAlert = () => {
    setError(null);
    setSuccess(false);
    setFormErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
      specialty: "",
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
      sgstPercentage: "",
      cgstEnabled: false,
      cgstPercentage: "",
      taxAmount: 0,
    });
  };

  // Handle input changes for new engineer
  const handleEngineerInputChange = (field, value) => {
    setNewEngineer((prev) => ({ ...prev, [field]: value }));
    if (engineerAddError) setEngineerAddError(null);
  };

  // Enhanced Handle input changes for new part - Based on InventoryManagement
  const handlePartInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPart((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (partAddError) setPartAddError(null);
  };

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <>
      {/* Error & Success Alerts */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
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
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={testUpdateJobCard}
                size="small"
              >
                Test API Call
              </Button>
            </Box>
          </Box>

          {/* Updated Assignment Summary Card with Job Details Cost */}
          <Card sx={{ mb: 3, borderRadius: 2, bgcolor: "background.paper" }}>
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
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      {assignments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Assignments
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: "center" }}>
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
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="success.main">
                      ₹
                      {(() => {
                        // Calculate total cost from existing + new job points
                        const existingCost = parsedJobDetails.reduce(
                          (total, item) =>
                            total + (parseFloat(item.price) || 0),
                          0
                        );
                        const newCost = jobPoints.reduce(
                          (total, item) => total + (item.price || 0),
                          0
                        );
                        return (existingCost + newCost).toFixed(0);
                      })()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Job Details Cost
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      {
                        new Set(
                          assignments
                            .filter((a) => a.engineer)
                            .map((a) => a.engineer._id)
                        ).size
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Engineers Assigned
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      {assignments.reduce(
                        (total, assignment) => total + assignment.parts.length,
                        0
                      )}
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
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: 600, color: "info.main" }}
                  >
                    📋 Pre-loaded from Job Card:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        💬 Engineer Remarks:
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                        "{assignments[0].notes}"
                      </Typography>
                    </Box>
                  )}
                  {/* Show existing job details cost */}
                  {parsedJobDetails.length > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        💰 Existing Job Details Cost:
                      </Typography>
                      <Chip
                        label={`₹${parsedJobDetails
                          .reduce(
                            (total, item) =>
                              total + (parseFloat(item.price) || 0),
                            0
                          )
                          .toFixed(2)}`}
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
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    💰 Job Details Cost Breakdown:
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}
                  >
                    {parsedJobDetails.length > 0 && (
                      <Chip
                        label={`Existing: ₹${parsedJobDetails
                          .reduce(
                            (total, item) =>
                              total + (parseFloat(item.price) || 0),
                            0
                          )
                          .toFixed(2)}`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    {jobPoints.length > 0 && (
                      <Chip
                        label={`New: ₹${jobPoints
                          .reduce((total, item) => total + (item.price || 0), 0)
                          .toFixed(2)}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    <Chip
                      label={`Total: ₹${(() => {
                        const existingCost = parsedJobDetails.reduce(
                          (total, item) =>
                            total + (parseFloat(item.price) || 0),
                          0
                        );
                        const newCost = jobPoints.reduce(
                          (total, item) => total + (item.price || 0),
                          0
                        );
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
                assignments.forEach((assignment) => {
                  assignment.parts.forEach((part) => {
                    const existingPartIndex = allPartsUsed.findIndex(
                      (p) => p._id === part._id
                    );
                    const selectedQuantity = part.selectedQuantity || 1;

                    if (existingPartIndex !== -1) {
                      allPartsUsed[existingPartIndex].quantity +=
                        selectedQuantity;
                    } else {
                      allPartsUsed.push({
                        ...part,
                        quantity: selectedQuantity,
                      });
                    }
                  });
                });

                if (allPartsUsed.length > 0) {
                  return (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        {isEditMode
                          ? "🔧 Parts from Job Card:"
                          : "🔧 Parts to be Updated in Job Card:"}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {isEditMode
                          ? `These parts were previously used in job card: ${id}`
                          : `These parts will be added to the partsUsed field in job card${
                              jobCardIds.length > 1 ? "s" : ""
                            }: ${(jobCardIds.length > 0
                              ? jobCardIds
                              : [id]
                            ).join(", ")}`}
                      </Typography>

                      {/* Debug Information */}
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "warning.light",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          🔍 Debug Information:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mb: 1 }}
                        >
                          Total Parts Found: {allPartsUsed.length}
                        </Typography>
                        {allPartsUsed.map((part, index) => (
                          <Typography
                            key={index}
                            variant="caption"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            {index + 1}. {part.partName} - ID: {part._id} - Qty:{" "}
                            {part.quantity}
                          </Typography>
                        ))}
                      </Box>
                    </>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>

          {/* Enhanced Job Details Section with Price */}
          <Card sx={{ mb: 3, borderRadius: 2, bgcolor: "background.paper" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Job Details (Point-wise)
              </Typography>
              <Paper
                sx={{
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box
                      sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}
                    >
                      <TextField
                        fullWidth
                        placeholder="Enter job detail description..."
                        value={currentJobPoint.description}
                        onChange={(e) =>
                          handleJobPointInputChange(
                            "description",
                            e.target.value
                          )
                        }
                        onKeyPress={handleJobPointKeyPress}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ flex: 2, minWidth: "200px" }}
                      />
                      <Button
                        variant="contained"
                        onClick={addJobPoint}
                        disabled={!currentJobPoint.description.trim()}
                        startIcon={<AddIcon />}
                        sx={{ minWidth: 120 }}
                      >
                        Add Point
                      </Button>
                    </Box>

                    {jobPoints.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Current Job Details Points:
                        </Typography>
                        <List
                          sx={{
                            bgcolor: "background.paper",
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            mb: 2,
                          }}
                        >
                          {jobPoints.map((point, index) => (
                            <ListItem key={index} divider>
                              <ListItemText
                                primary={point.description}
                                sx={{ wordBreak: "break-word" }}
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
                      </Box>
                    )}

                    {parsedJobDetails.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ color: "info.main" }}
                        >
                          📋 Existing Job Details from Job Card:
                        </Typography>
                        <List
                          sx={{
                            bgcolor: "background.paper",
                            border: 1,
                            borderColor: "info.main",
                            borderRadius: 1,
                          }}
                        >
                          {parsedJobDetails.map((item, index) => (
                            <ListItem key={index} divider>
                              <ListItemText
                                primary={`Description: ${item.description}`}
                              />
                              <ListItemSecondaryAction>
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
          <Card sx={{ mb: 4, borderRadius: 2, bgcolor: "background.paper" }}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Engineer Assignments
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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

                {/* Assignments */}
                {assignments.map((assignment, index) => (
                  <Accordion
                    key={assignment.id}
                    defaultExpanded
                    sx={{
                      mb: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: "background.paper",
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          pr: 2,
                        }}
                      >
                        <DragIcon sx={{ mr: 1, color: "text.secondary" }} />
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
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            Select Engineer *
                          </Typography>
                          {isLoading ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                py: 2,
                              }}
                            >
                              <CircularProgress size={20} />
                              <Typography sx={{ ml: 1 }}>
                                Loading engineers...
                              </Typography>
                            </Box>
                          ) : (
                            <Autocomplete
                              fullWidth
                              options={engineers}
                              getOptionLabel={(option) => option.name || ""}
                              value={assignment.engineer}
                              onChange={(event, newValue) => {
                                updateAssignment(
                                  assignment.id,
                                  "engineer",
                                  newValue
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select engineer"
                                  variant="outlined"
                                  error={
                                    !!formErrors[
                                      `assignment_${assignment.id}_engineer`
                                    ]
                                  }
                                  helperText={
                                    formErrors[
                                      `assignment_${assignment.id}_engineer`
                                    ]
                                  }
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
                              sx={{ mt: 1, display: "block" }}
                            >
                              ✅ This engineer was pre-selected from the job
                              card
                            </Typography>
                          )}
                        </Grid>

                        {/* Priority Selection */}
                        <Grid item xs={12} md={3}>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            Priority
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={assignment.priority}
                              onChange={(e) =>
                                updateAssignment(
                                  assignment.id,
                                  "priority",
                                  e.target.value
                                )
                              }
                            >
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Parts Selection with Quantity Management */}
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
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
                                Loading parts...
                              </Typography>
                            </Box>
                          ) : (
                            <Autocomplete
                              multiple
                              fullWidth
                              options={inventoryParts.filter(
                                (part) =>
                                  getAvailableQuantity(part._id) > 0 &&
                                  !assignment.parts.some(
                                    (p) => p._id === part._id
                                  )
                              )}
                              getOptionLabel={(option) =>
                                `${option.partName} (${
                                  option.partNumber || "N/A"
                                }) - ₹${option.pricePerUnit || 0} | GST: ${
                                  option.gstPercentage || option.taxAmount || 0
                                }%`
                              }
                              value={assignment.parts}
                              onChange={(event, newValue) => {
                                handlePartSelection(
                                  assignment.id,
                                  newValue,
                                  assignment.parts
                                );
                              }}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip
                                    variant="outlined"
                                    label={`${option.partName} (${
                                      option.partNumber || "N/A"
                                    }) - Qty: ${
                                      option.selectedQuantity || 1
                                    } @ ₹${option.pricePerUnit || 0}`}
                                    {...getTagProps({ index })}
                                    key={option._id}
                                  />
                                ))
                              }
                              renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                  <Box sx={{ width: "100%" }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {option.partName}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Part #: {option.partNumber || "N/A"} |
                                      Price: ₹{option.pricePerUnit || 0} | GST:{" "}
                                      {option.gstPercentage ||
                                        option.taxAmount ||
                                        0}
                                      % | Available:{" "}
                                      {getAvailableQuantity(option._id)} |
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
                          {assignment.parts.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ mb: 1, fontWeight: 600 }}
                              >
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
                                  const selectedQuantity =
                                    part.selectedQuantity || 1;
                                  const unitPrice = part.sellingPrice || 0;
                                  const finalPrice = calculatePartPriceWithGst(
                                    part,
                                    selectedQuantity
                                  );

                                  // Log the calculated values as requested
                                  const calculatedTax =
                                    (selectedQuantity * (part.taxAmount || 0)) /
                                    (part.quantity || 1);
                                  console.log(`Part: ${part.partName}`, {
                                    sellingPrice: unitPrice,
                                    selectedQuantity: selectedQuantity,
                                    taxAmount: part.taxAmount,
                                    originalQuantity: part.quantity,
                                    calculatedTax: calculatedTax,
                                    finalPrice: finalPrice,
                                  });

                                  // Get available quantity considering all current selections
                                  const availableQuantity =
                                    getAvailableQuantity(part._id);

                                  // Calculate the maximum quantity user can select
                                  // This is the current available quantity + already selected quantity for this specific part
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
                                          <Typography
                                            variant="body2"
                                            fontWeight={500}
                                          >
                                            {part.partName}
                                          </Typography>
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
                                            Selected: {selectedQuantity}
                                          </Typography>
                                        </Box>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          {/* Edit Price Button */}
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() =>
                                              handleEditPartPrice(
                                                assignment.id,
                                                partIndex,
                                                part.sellingPrice ||
                                                  part.pricePerUnit
                                              )
                                            }
                                            sx={{
                                              minWidth: "24px",
                                              width: "24px",
                                              height: "24px",
                                              border: `1px solid ${theme.palette.primary.main}`,
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
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
                                                    assignment.id,
                                                    partIndex,
                                                    newQuantity,
                                                    selectedQuantity
                                                  );
                                                }
                                              }}
                                              disabled={selectedQuantity <= 1}
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
                                                const newQuantity =
                                                  parseInt(e.target.value) || 1;
                                                const oldQuantity =
                                                  selectedQuantity;

                                                // Validate quantity limits
                                                if (newQuantity < 1) {
                                                  return;
                                                }

                                                if (
                                                  newQuantity >
                                                  maxSelectableQuantity
                                                ) {
                                                  setError(
                                                    `Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`
                                                  );
                                                  return;
                                                }

                                                handlePartQuantityChange(
                                                  assignment.id,
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
                                                  isMaxQuantityReached &&
                                                  selectedQuantity ===
                                                    maxSelectableQuantity,
                                              }}
                                              sx={{
                                                width: "70px",
                                                "& .MuiInputBase-input": {
                                                  textAlign: "center",
                                                  fontSize: "0.875rem",
                                                },
                                              }}
                                              error={availableQuantity === 0}
                                              disabled={
                                                maxSelectableQuantity === 0
                                              }
                                            />
                                            <IconButton
                                              size="small"
                                              onClick={() => {
                                                const newQuantity =
                                                  selectedQuantity + 1;
                                                if (
                                                  newQuantity <=
                                                  maxSelectableQuantity
                                                ) {
                                                  handlePartQuantityChange(
                                                    assignment.id,
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
                                                availableQuantity === 0
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
                                              handlePartRemoval(
                                                assignment.id,
                                                partIndex
                                              )
                                            }
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
                                          <Grid item xs={6}>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Price/Unit: ₹
                                              {unitPrice.toFixed(2)}
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography
                                              variant="caption"
                                              fontWeight={600}
                                              color="primary"
                                            >
                                              Total: ₹{finalPrice.toFixed(2)}
                                            </Typography>
                                          </Grid>
                                          {gstSettings.billType === "gst" && (
                                            <Grid item xs={12}>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                              >
                                                GST: ₹
                                                {(
                                                  (selectedQuantity *
                                                    (part.taxAmount || 0)) /
                                                  (part.quantity || 1)
                                                ).toFixed(2)}
                                              </Typography>
                                            </Grid>
                                          )}
                                        </Grid>
                                      </Box>
                                    </ListItem>
                                  );
                                })}
                              </List>
                              {/* Total Summary */}
                              {(() => {
                                const grandTotal = assignment.parts.reduce(
                                  (total, part) => {
                                    const selectedQuantity =
                                      part.selectedQuantity || 1;
                                    const unitPrice = part.pricePerUnit || 0;
                                    const gstPercentage =
                                      part.gstPercentage || part.taxAmount || 0;
                                    const totalPrice =
                                      unitPrice * selectedQuantity;
                                    const gstAmount =
                                      (totalPrice * gstPercentage) / 100;
                                    return total + totalPrice + gstAmount;
                                  },
                                  0
                                );
                                return (
                                  // <Box sx={{ mt: 1, p: 1, backgroundColor: 'primary.main', borderRadius: 1 }}>
                                  //   <Typography variant="subtitle2" fontWeight={600} color="primary.contrastText">
                                  //     Assignment Parts Total: ₹{grandTotal.toFixed(2)}
                                  //   </Typography>
                                  // </Box>
                                  <></>
                                );
                              })()}
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {/* GST Settings Section - Moved after parts management */}
                <Card
                  sx={{ mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      GST Settings
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={gstSettings.includeGst}
                            onChange={handleGstToggle}
                            color="primary"
                          />
                        }
                        label="Include GST in bill"
                      />
                      <Chip
                        label={
                          gstSettings.billType === "gst"
                            ? "GST Bill"
                            : "Non-GST Bill"
                        }
                        color={
                          gstSettings.billType === "gst"
                            ? "primary"
                            : "secondary"
                        }
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {gstSettings.billType === "gst"
                        ? "Tax will be included in part prices"
                        : "Tax will be removed from part prices"}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SendIcon />
                      )
                    }
                    disabled={isSubmitting || isLoading}
                    sx={{ px: 6, py: 1.5, textTransform: "uppercase" }}
                  >
                    {isSubmitting
                      ? "Assigning..."
                      : "Assign Engineer & Update Job Card"}
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
                        {(newPart.purchasePrice * newPart.quantity).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="primary">
                        Tax: ₹
                        {calculateTaxAmount(
                          newPart.purchasePrice,
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
                          newPart.purchasePrice,
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

        {/* Edit Part Price Dialog */}
        <Dialog
          open={!!editingPartPrice}
          onClose={() => setEditingPartPrice(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { bgcolor: "background.paper" },
          }}
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Edit Part Price</Typography>
              <IconButton onClick={() => setEditingPartPrice(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="New Price (₹)"
              type="number"
              value={editingPartPrice?.currentPrice || ""}
              onChange={(e) => {
                const newPrice = e.target.value;
                setEditingPartPrice((prev) =>
                  prev ? { ...prev, currentPrice: newPrice } : null
                );
              }}
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingPartPrice(null)}>Cancel</Button>
            <Button
              onClick={() =>
                handleSavePartPrice(editingPartPrice?.currentPrice)
              }
              variant="contained"
              disabled={!editingPartPrice?.currentPrice}
            >
              Save Price
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
            sx: { bgcolor: "background.paper" },
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
                  onChange={(e) =>
                    handleEngineerInputChange("name", e.target.value)
                  }
                  error={!newEngineer.name.trim() && !!engineerAddError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={newEngineer.email}
                  onChange={(e) =>
                    handleEngineerInputChange("email", e.target.value)
                  }
                  error={!newEngineer.email.trim() && !!engineerAddError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone *"
                  value={newEngineer.phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    handleEngineerInputChange("phone", value);
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
                  onChange={(e) =>
                    handleEngineerInputChange("specialty", e.target.value)
                  }
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
              startIcon={
                addingEngineer ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {addingEngineer ? "Adding..." : "Add Engineer"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AssignEngineer;
