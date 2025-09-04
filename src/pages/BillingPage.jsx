import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, LinearProgress, Paper,
  useMediaQuery, useTheme, Snackbar, Alert, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Receipt as ReceiptIcon, CreditCard as CreditCardIcon, AccountBalance as AccountBalanceIcon,
  Check as CheckIcon, WhatsApp as WhatsAppIcon, Email as EmailIcon, ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { DownloadOutlined as DownloadIcon } from "@mui/icons-material";
import axios from "axios";
import { jsPDF } from 'jspdf';

// Import all components
import GarageDetailsSection from "../components/GarageDetailsSection";
import CustomerVehicleSection from "../components/CustomerVehicleSection";
import GSTSettingsSection from "../components/GSTSettingsSection";
import PartsSection from "../components/PartsSection";  

import FinalInspectionSection from "../components/FinalInspectionSection";
import BillSummarySection from "../components/BillSummarySection";
import ThankYouSection from "../components/ThankYouSection";
import PaymentMethodDialog from "../components/PaymentMethodDialog";
import ProcessingPaymentDialog from "../components/ProcessingPaymentDialog";
import EmailDialog from "../components/EmailDialog";    
import EditPriceDialog from "../components/EditPriceDialog";
import AddPartDialog from "../components/AddPartDialog";

import SnackbarAlert from "../components/SnackbarAlert";

const AutoServeBilling = () => {
  const { id: jobCardIdFromUrl } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  let garageId = localStorage.getItem("garageId") || localStorage.getItem("garage_id");
  
  const today = new Date().toISOString().split("T")[0];
  const [laborServicesTotal, setLaborServicesTotal] = useState(0);

  // UPDATED: State declarations with complete bank details
 const [garageDetails, setGarageDetails] = useState({
  name: "",
  address: "",
  phone: "",
  gstNumber: "",
  email: "",
  website: "",
  logoUrl: "", // NEW: Add logo field
  bankDetails: {
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    branchName: "",
    upiId: ""
  }
});

  const [isLoading, setIsLoading] = useState(true);
  const [jobCardData, setJobCardData] = useState(null);
  const [finalInspection, setFinalInspection] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // NEW: Add state for bill generation status
  const [billGenerated, setBillGenerated] = useState(false);
  const [isBillAlreadyGenerated, setIsBillAlreadyGenerated] = useState(false);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // UPDATED: Enhanced GST settings with bill type and party details
  const [gstSettings, setGstSettings] = useState({
    includeGst: true,
    gstType: 'percentage',
    gstPercentage: 18,
    gstAmount: 0,
    cgstPercentage: 9,
    sgstPercentage: 9,
    customerGstNumber: '',
    isInterState: false,
    // NEW: Added bill type and party details
    billType: 'gst', // 'gst' or 'non-gst'
    billToParty: '',
    shiftToParty: '',
    insuranceProvider:''
    
  });

  const [carDetails, setCarDetails] = useState({
    carNumber: "",
    company: "",
    model: "",
    customerName: "",
    contact: "",
    email: "",
    address: "",
    billingDate: today,
    invoiceNo: "",
  });

  const [parts, setParts] = useState([]);


  const [summary, setSummary] = useState({
    totalPartsCost: 0,
    totalLaborCost: 0,
    subtotal: 0,
    gstAmount: 0,
    discount: 0,
    totalAmount: 0,
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [apiResponseMessage, setApiResponseMessage] = useState(null);
  const [showApiResponse, setShowApiResponse] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const [showNewPartDialog, setShowNewPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({
    name: "",
    quantity: 1,
    pricePerUnit: 0,
    hsnNumber: "" // NEW: Added HSN number for parts
  });



  const [showEditPriceDialog, setShowEditPriceDialog] = useState(false);
  const [editItem, setEditItem] = useState({
    id: null,
    type: "",
    field: "",
    value: 0,
  });

  const tableCellStyle = {
    py: isMobile ? 1 : 2,
    px: isMobile ? 1 : 3,
    fontSize: isMobile ? "0.75rem" : "0.875rem",
  };

  // Handle back navigation
  const handleGoBack = () => {
    navigate(`/Quality-Check/${jobCardIdFromUrl}`);
  };

  // NEW: Function to update bill status
  const updateBillStatus = async (jobCardId) => {
    try {
      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/jobcards/updatebillstatus/${jobCardId}`
      );
      
      if (response.status === 200) {

        setBillGenerated(true);
      }
    } catch (error) {
      console.error('Error updating bill status:', error);
    }
  };
  
  // UPDATED: Fetch garage data with complete bank details
  useEffect(() => {
    const fetchGarageData = async () => {
      if (!garageId) return;
      
      try {
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/getgaragebyid/${garageId}`
        );
        const data = response.data;
        
setGarageDetails({
  name: data.name || "",
  address: data.address || "",
  phone: data.phone || "",
  gstNumber: data.gstNum || data.gstNumber || "",
  email: data.email || "",
  website: data.website || "",
  logoUrl: data.logoUrl || data.logo || "", // Support multiple field names
  bankDetails: {
  bankName: data.bankDetails?.bankName || data.bankName || "",
  accountNumber: data.bankDetails?.accountNumber || data.accountNumber || "",
  ifscCode: data.bankDetails?.ifscCode || data.ifscCode || "",
  accountHolderName: data.bankDetails?.accountHolderName || data.accountHolderName || "",
  branchName: data.bankDetails?.branchName || data.branchName || "",
  upiId: data.bankDetails?.upiId || data.upiId || ""
}
});
      } catch (error) {
        console.error("Error fetching garage data:", error);
      }
    };

    fetchGarageData();
  }, [garageId]);

  // UPDATED: Fetch job card data with improved services processing and default values
  useEffect(() => {
    const fetchJobCardData = async () => {
      if (!garageId) navigate("/login");
      if (!jobCardIdFromUrl) {
        setSnackbar({
          open: true,
          message: 'No job card ID found in URL',
          severity: 'error'
        });
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);

        
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${jobCardIdFromUrl}`
        );
        
        const data = response.data;
        
        setJobCardData(data);
        
        // NEW: Check if bill is already generated
        if (data.generateBill === true) {
          setIsBillAlreadyGenerated(true);
          setBillGenerated(true);
          setShowThankYou(true);
          
          setSnackbar({
            open: true,
            message: 'Bill has already been generated for this job card',
            severity: 'info'
          });
        }
        
        const invoiceNo = data.invoiceNumber || `INV-${Date.now()}`;

        setCarDetails({
          carNumber: data.carNumber || data.registrationNumber || "",
          company: data.company || data.carBrand || "",
          model: data.model || data.carModel || "",
          customerName: data.customerName || data.customer?.name || "",
          contact: data.contactNumber || data.customer?.contact || "",
          email: data.email || data.customer?.email || "",
          address: data.customer?.address || "",
          billingDate: today,
          invoiceNo: invoiceNo,
        });

        // UPDATED: Set bill to party and shift to party from job card data
        setGstSettings(prev => ({
  ...prev,
  billToParty: data.customerName || data.customer?.name || "",
  shiftToParty: data.insuranceCompany || data.insurance?.company || "N/A",
  insuranceProvider: data.insuranceProvider || data.insurance?.company || "N/A"
}));

        // UPDATED: Process parts with HSN numbers
        if (data.partsUsed?.length > 0) {
          const apiParts = data.partsUsed.map((part, index) => ({
            id: index + 1,
            name: part.partName || part.name || '',
            quantity: parseInt(part.quantity) || 1,
            pricePerUnit: parseFloat(part.pricePerPiece || part.pricePerUnit || part.sellingPrice) || 0,
            total: parseFloat(part.totalPrice) || (parseInt(part.quantity) * parseFloat(part.pricePerPiece || part.sellingPrice)) || 0,
            hsnNumber: part.hsnNumber || part.hsn || "8708" // Default HSN for auto parts
          }));

          setParts(apiParts);
        } else {
          // UPDATED: Add default service if no parts or services found
          setParts([]);
        }



        // UPDATED: Set final inspection notes with better fallback
        let inspectionNotes = '';
        if (data.qualityCheck?.notes) {
          inspectionNotes = data.qualityCheck.notes;
        } else if (data.engineerRemarks) {
          inspectionNotes = data.engineerRemarks;
        } else if (data.remarks) {
          inspectionNotes = data.remarks;
        } else {
          // UPDATED: Provide default inspection notes
          inspectionNotes = `Vehicle inspected on ${today}. All work Completed satisfactorily. Vehicle is ready for delivery.`;

        }
        setFinalInspection(inspectionNotes);

        // Set email recipient
        if (data.email || data.customer?.email) {
          setEmailRecipient(data.email || data.customer?.email);
        }

        

      } catch (error) {
        console.error('❌ Error fetching job card data:', error);
        setSnackbar({
          open: true,
          message: `Error: ${error.response?.data?.message || 'Failed to fetch job card data'}`,
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCardData();
  }, [jobCardIdFromUrl, today, garageId, navigate]);

  // Calculate totals
 const calculateTotals = () => {
  const totalPartsCost = gstSettings?.includeGst === false 
    ? parts.reduce((sum, part) => sum + ((part.pricePerUnit || 0) * (part.quantity || 0)), 0)
    : parts.reduce((sum, part) => sum + (part.total || 0), 0);
  
  // Use actual API data for labor services (same as PDF calculation)
  const laborTotal = jobCardData?.laborServicesTotal || laborServicesTotal || 0;
  const actualLaborTax = jobCardData?.laborServicesTax || 0;
  
  const subtotal = totalPartsCost; // Subtotal is only parts (same as PDF)
  const discount = summary.discount || 0;
  
  // Calculate GST amounts using actual API data (same as PDF)
  let gstOnParts = 0;
  if (gstSettings.billType === 'gst') {
    gstOnParts = (totalPartsCost * gstSettings.gstPercentage) / 100;
  }
  
  const totalGstAmount = gstOnParts + actualLaborTax;
  const totalAfterGst = subtotal + laborTotal + totalGstAmount;
  const totalAmount = totalAfterGst - discount;

  setSummary({
    totalPartsCost,
    totalLaborCost: laborTotal, // Use API data
    subtotal,
    gstAmount: totalGstAmount,
    discount,
    totalAmount,
  });
};

useEffect(() => {
  calculateTotals();
}, [laborServicesTotal, parts, summary.discount, gstSettings, jobCardData]);

  // UPDATED: Handler functions with new GST settings
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCarDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleGstIncludeChange = (event) => {
    setGstSettings(prev => ({ 
      ...prev, 
      includeGst: event.target.checked,
      billType: event.target.checked ? 'gst' : 'non-gst'
    }));
  };

  const handleBillTypeChange = (event) => {
    const billType = event.target.value;
    setGstSettings(prev => ({ 
      ...prev, 
      billType,
      includeGst: billType === 'gst'
    }));
  };

    const updateLaborAndTax = async () => {
    if (!jobCardIdFromUrl) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Authentication token not found.',
        severity: 'error'
      });
      return;
    }

    const laborServicesTotal = summary.totalLaborCost;
    let laborServicesTax = 0;

    if (gstSettings.billType === 'gst') {
      laborServicesTax = Math.round(laborServicesTotal * (gstSettings.gstPercentage / 100));
    }

    const updateData = {
      laborServicesTotal,
      laborServicesTax
    };

    try {
      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/jobcards/${jobCardIdFromUrl}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {

      }
    } catch (error) {
      console.error('❌ Error updating labor and tax:', error);
      setSnackbar({
        open: true,
        message: `Failed to update labor/tax: ${error.response?.data?.message || error.message}`,
        severity: 'warning'
      });
    }
  };

  const handleBillToPartyChange = (event) => {
    setGstSettings(prev => ({ ...prev, billToParty: event.target.value }));
  };

  const handleShiftToPartyChange = (event) => {
    setGstSettings(prev => ({ ...prev, shiftToParty: event.target.value }));
  };

  const handleGstTypeChange = (event) => {
    setGstSettings(prev => ({ ...prev, gstType: event.target.value }));
  };

  const handleGstPercentageChange = (event) => {
    const percentage = parseFloat(event.target.value) || 0;
    setGstSettings(prev => ({
      ...prev,
      gstPercentage: percentage,
      cgstPercentage: percentage / 2,
      sgstPercentage: percentage / 2
    }));
  };

  const handleGstAmountChange = (event) => {
    setGstSettings(prev => ({ ...prev, gstAmount: parseFloat(event.target.value) || 0 }));
  };

  const handleCustomerGstChange = (event) => {
    setGstSettings(prev => ({ ...prev, customerGstNumber: event.target.value.toUpperCase() }));
  };

  const handleInterStateChange = (event) => {
    setGstSettings(prev => ({ ...prev, isInterState: event.target.checked }));
  };

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    setSummary(prev => ({ ...prev, discount }));
  };

  const removePart = async (id) => {
    // Remove from local state
    const updatedParts = parts.filter(part => part.id !== id);
    setParts(updatedParts);

    // Update job card via API
    try {
              const partsForAPI = updatedParts.map(part => ({
          _id: part.id, // Changed from partId to _id to match WorkInProgress.js expectations
          partName: part.name,
          quantity: part.quantity,
          totalPrice: part.total,
        }));

      const updatePayload = {
        partsUsed: partsForAPI
      };

      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/jobCards/${jobCardIdFromUrl}`,
        updatePayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );

      
      setSnackbar({
        open: true,
        message: "Part removed successfully and updated in job card!",
        severity: "success",
      });
    } catch (error) {
      console.error('Error updating job card after part removal:', error);
      setSnackbar({
        open: true,
        message: "Part removed locally but failed to update job card. Please try again.",
        severity: "warning",
      });
    }
  };



  const openEditPrice = (id, type, field, value) => {
    setEditItem({ id, type, field, value });
    setShowEditPriceDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "warning";
      default: return "error";
    }
  };

  const formatAmount = (amount) => {
    return `₹${new Intl.NumberFormat("en-IN", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(amount)}`;
  };

  // Payment method selection
  const selectPaymentMethod = async (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(false);
    
    if (method === "Online Payment") {
      await processOnlinePayment();
    } else {
      await processPayment();
    }
  };

const updateBillAndJobStatus = async (jobCardId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    return;
  }

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    // ✅ Step 1: Update bill status
    await axios.put(
      `https://garage-management-zi5z.onrender.com/api/jobcards/updatebillstatus/${jobCardId}`,
      {}, 
      config
    );

    // ✅ Step 2: Update job card status to "Completed"
    const statusUpdateResponse = await axios.put(
      `https://garage-management-zi5z.onrender.com/api/jobcards/updatestatus/${jobCardId}`,
      { status: 'Completed' },
      config
    );

    if (statusUpdateResponse.status === 200) {
      
      setJobCardData(prev => ({ ...prev, status: 'Completed' }));
    }
  } catch (error) {
    console.error('❌ Error updating bill and job status:', error);
    // Snackbar error handling...
  }
};

  // NEW: Function to test API endpoints and provide diagnostics
  const testApiEndpoints = async () => {
    const endpointsToTest = [
      `https://garage-management-zi5z.onrender.com/api/bill/generate/${jobCardIdFromUrl}`,
      `https://garage-management-zi5z.onrender.com/api/bills/generate/${jobCardIdFromUrl}`,
      `https://garage-management-zi5z.onrender.com/api/jobcards/${jobCardIdFromUrl}/bill`,
      `https://garage-management-zi5z.onrender.com/api/jobcards/${jobCardIdFromUrl}/generate-bill`,
      `https://garage-management-zi5z.onrender.com/api/bill/create/${jobCardIdFromUrl}`,
      `https://garage-management-zi5z.onrender.com/api/bills/create/${jobCardIdFromUrl}`
    ];

    
    
    for (const endpoint of endpointsToTest) {
      try {
        // Try a simple GET request first to see if endpoint exists
        const response = await axios.get(endpoint.replace('generate', 'test').replace('create', 'test'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 5000
        });

      } catch (error) {
        if (error.response) {
          
        } else {
          
        }
      }
    }

    // Test basic API connectivity
    try {
      const healthCheck = await axios.get('https://garage-management-zi5z.onrender.com/api/health', {
        timeout: 5000
      });

    } catch (error) {
      
    }
  };

  // UPDATED: Enhanced status validation function with better logic
  const validateJobCompletion = () => {
    const issues = [];
    
    // UPDATED: More flexible parts validation
    const hasParts = parts.length > 0;
    const totalAmount = summary.totalAmount || 0;
    
    if (!hasParts && totalAmount === 0) {
      issues.push("At least one part or service is required, or add a minimum service charge");
    }
    
    if (!carDetails.customerName.trim()) {
      issues.push("Customer name is required");
    }
    
    if (!carDetails.contact.trim()) {
      issues.push("Customer contact is required");
    }
    
    // UPDATED: More flexible final inspection validation
    if (!finalInspection.trim()) {
      // Auto-generate default inspection notes if missing
      const defaultInspection = `Vehicle inspected on ${today}. All work Completed satisfactorily. Vehicle is ready for delivery.`;
      setFinalInspection(defaultInspection);
    }
    
    if (!gstSettings.billToParty.trim()) {
      // Auto-set bill to party if missing
      if (carDetails.customerName.trim()) {
        setGstSettings(prev => ({ ...prev, billToParty: carDetails.customerName }));
      } else {
        issues.push("Bill to party is required");
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

const generateBill = async () => {
  if (billGenerated) return;

  const { isValid, issues } = validateJobCompletion();
  if (!isValid) {
    setSnackbar({ open: true, message: issues.join(', '), severity: 'error' });
    return;
  }

  // Check if jobCardIdFromUrl exists before proceeding
  if (!jobCardIdFromUrl) {
    setSnackbar({
      open: true,
      message: 'Job card ID is missing.',
      severity: 'error'
    });
    return;
  }

  // Check if token exists before proceeding
  const token = localStorage.getItem('token');
  if (!token) {
    setSnackbar({
      open: true,
      message: 'Authentication token not found.',
      severity: 'error'
    });
    return;
  }

  updateLaborAndTax(); // Updates labor & tax in DB
  updateBillAndJobStatus(jobCardIdFromUrl); // Key function
  setBillGenerated(true);
  setShowPaymentModal(true);
  setSnackbar({ open: true, message: 'Bill generated!', severity: 'success' });

  try {
    const response = await axios.put(
      `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${jobCardIdFromUrl}`,
      {
        status: "Completed",
        generateBill: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.status === 200) {
      setSnackbar({
        open: true,
        message: 'Bill generated and job marked as Completed!',
        severity: 'success'
      });

      // Update local state
      setBillGenerated(true);
      setIsBillAlreadyGenerated(true);
      setJobCardData(prev => ({ ...prev, status: 'Completed', generateBill: true })); 

      // Open payment modal
      setShowPaymentModal(true);
    } else {
      throw new Error('Failed to update job status');
    }
  } catch (error) {
    console.error('Error updating job card:', error);
    setSnackbar({
      open: true,
      message: `Failed to generate bill: ${error.response?.data?.message || error.message}`,
      severity: 'error'
    });
  }
};


  // Function to ensure minimum bill requirements
  const ensureMinimumBillRequirements = () => {
    let updated = false;
    
    // Ensure final inspection exists
    if (!finalInspection.trim()) {
      const defaultInspection = `Vehicle ${carDetails.carNumber} inspected on ${today}. All work Completed satisfactorily. Vehicle is ready for delivery.`;
      setFinalInspection(defaultInspection);
      updated = true;
    }
    
    // Ensure bill to party exists
    if (!gstSettings.billToParty.trim() && carDetails.customerName.trim()) {
      setGstSettings(prev => ({ ...prev, billToParty: carDetails.customerName }));
      updated = true;
    }
    

    
    if (updated) {
      setSnackbar({
        open: true,
        message: 'Default values added to complete the bill. Please review before generating.',
        severity: 'info'
      });
    }
    
    return updated;
  };

  // UPDATED: Payment processing with multiple API endpoint attempts
  const processPayment = async () => {
    if (!jobCardIdFromUrl) {
      setApiResponseMessage({
        type: "error",
        message: "No job card ID found in URL. Cannot process payment.",
      });
      setShowApiResponse(true);
      return;
    }

    // UPDATED: Prepare API data according to expected structure
    const apiData = {
      parts: parts.map(part => ({
        partName: part.name,
        quantity: part.quantity,
        sellingPrice: part.pricePerUnit,
        hsnNumber: part.hsnNumber || "8708"
      })),

      discount: summary.discount,
      gstPercentage: gstSettings.gstPercentage,
      billType: gstSettings.billType,
      billToParty: gstSettings.billToParty,
      shiftToParty: gstSettings.shiftToParty
    };

    // List of possible API endpoints to try
      const possibleEndpoints = [
    `https://garage-management-zi5z.onrender.com/api/billing/generate/${jobCardIdFromUrl}`,
    `https://garage-management-zi5z.onrender.com/api/garage/billing/generate/${jobCardIdFromUrl}`
  ];

    let lastError = null;
    let success = false;

    for (const endpoint of possibleEndpoints) {
      try {

        
        const response = await axios.post(endpoint, apiData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 10000 // 10 second timeout
        });

        const data = response.data;
        if (response.status === 200 || response.status === 201) {
          await updateBillAndJobStatus(jobCardIdFromUrl);
          
          setApiResponseMessage({
            type: "success",
            message: data.message || "Professional bill generated and payment processed successfully! Job Completed.",
          });
          setShowThankYou(true);
          
          if (data.invoiceNumber) {
            setCarDetails(prev => ({ ...prev, invoiceNo: data.invoiceNumber }));
          }
          
          success = true;
          break; // Exit loop on success
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error);
        lastError = error;
        
        // If it's a 404, continue to next endpoint
        if (error.response?.status === 404) {
          continue;
        }
        
        // If it's a different error (401, 403, 500, etc.), we might want to stop
        if (error.response?.status && error.response.status !== 404) {
          lastError = error;
          break;
        }
      }
    }

    // If no endpoint worked, try fallback approach
    if (!success) {
      try {
        await handleFallbackBillGeneration(apiData);
        success = true;
      } catch (fallbackError) {
        console.error("Fallback bill generation failed:", fallbackError);
        
        setApiResponseMessage({
          type: "error",
          message: `Bill generation failed. Last error: ${lastError?.response?.data?.message || lastError?.message || "All API endpoints returned 404"}. Please contact support.`,
        });
      }
    }

    setShowApiResponse(true);
  };

  // Fallback bill generation when API endpoints don't work
 const handleFallbackBillGeneration = async (billData) => {
  try {
    // ✅ Use the correct billing generation endpoint
    const response = await axios.post(
      `https://garage-management-zi5z.onrender.com/api/billing/generate/${jobCardIdFromUrl}`,
      billData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.status === 200 || response.status === 201) {
      setApiResponseMessage({
        type: "success",
        message: "Bill generated successfully!",
      });
      await updateBillAndJobStatus(jobCardIdFromUrl); // This updates jobcard status
      setShowThankYou(true);
    }
  } catch (error) {
    console.error("Fallback bill generation failed:", error);
    setApiResponseMessage({
      type: "error",
      message: error.response?.data?.message || "Bill generation failed. Please contact support.",
    });
    setShowApiResponse(true);
  }
};

  // UPDATED: Online payment processing with multiple endpoint attempts
  const processOnlinePayment = async () => {
    if (!jobCardIdFromUrl) {
      setApiResponseMessage({
        type: "error",
        message: "No job card ID found. Cannot process payment.",
      });
      setShowApiResponse(true);
      return;
    }

    try {
      // UPDATED: Use new API structure
      const apiData = {
        parts: parts.map(part => ({
          partName: part.name,
          quantity: part.quantity,
          sellingPrice: part.pricePerUnit,
          hsnNumber: part.hsnNumber || "8708"
        })),

        discount: summary.discount,
        gstPercentage: gstSettings.gstPercentage,
        billType: gstSettings.billType,
        billToParty: gstSettings.billToParty,
        shiftToParty: gstSettings.shiftToParty
      };

      // Try multiple possible endpoints for bill generation
     const possibleEndpoints = [
  `https://garage-management-zi5z.onrender.com/api/billing/generate/${jobCardIdFromUrl}`
];

      let billResponse = null;
      let lastError = null;

      for (const endpoint of possibleEndpoints) {
        try {
  
          
          billResponse = await axios.post(endpoint, apiData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            timeout: 10000
          });

          if (billResponse.status === 200 || billResponse.status === 201) {
            break; // Success, exit loop
          }
        } catch (error) {
          console.error(`Error with endpoint ${endpoint}:`, error);
          lastError = error;
          
          if (error.response?.status === 404) {
            continue; // Try next endpoint
          } else {
            throw error; // Non-404 error, stop trying
          }
        }
      }

      // If bill generation failed, try fallback
      if (!billResponse || (billResponse.status !== 200 && billResponse.status !== 201)) {
        await handleFallbackBillGeneration(apiData);
        
        setApiResponseMessage({
          type: "warning",
          message: "Bill generated using fallback method. Online payment may need manual processing.",
        });
        setShowThankYou(true);
        setShowApiResponse(true);
        return;
      }

      const responseData = billResponse.data;
      
      // Check if response has bill ID for payment processing
      if (responseData.bill && responseData.bill._id) {
        const billId = responseData.bill._id;
        const invoiceNo = responseData.bill.invoiceNo;

        setCarDetails(prev => ({ ...prev, invoiceNo: invoiceNo || prev.invoiceNo }));

        // Try to process online payment
        try {
          const paymentResponse = await axios.post(
            "https://garage-management-zi5z.onrender.com/api/bill/pay",
            {
              billId: billId,
              paymentMethod: "Online Payment"
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          if (paymentResponse.status === 200 || paymentResponse.status === 201) {
            await updateBillAndJobStatus(jobCardIdFromUrl);
            
            setApiResponseMessage({
              type: "success",
              message: paymentResponse.data?.message || "Online payment processed successfully! Job Completed.",
            });
            setShowThankYou(true);
          } else {
            throw new Error(paymentResponse.data?.message || "Payment failed");
          }
        } catch (paymentError) {
          console.error("Payment processing error:", paymentError);
          
          // Bill was created but payment failed
          await updateBillAndJobStatus(jobCardIdFromUrl);
          
          setApiResponseMessage({
            type: "warning",
            message: "Bill generated successfully, but online payment processing failed. Please process payment manually.",
          });
          setShowThankYou(true);
        }
      } else {
        // Bill response doesn't have expected structure
        await updateBillAndJobStatus(jobCardIdFromUrl);
        
        setApiResponseMessage({
          type: "warning",
          message: "Bill generated but payment processing unavailable. Please process payment manually.",
        });
        setShowThankYou(true);
      }

    } catch (error) {
      console.error("Online Payment Error:", error);
      
      // Try fallback approach
      try {
        const apiData = {
          parts: parts.map(part => ({
            partName: part.name,
            quantity: part.quantity,
            sellingPrice: part.pricePerUnit,
            hsnNumber: part.hsnNumber || "8708"
          })),

          discount: summary.discount,
          gstPercentage: gstSettings.gstPercentage,
          billType: gstSettings.billType,
          billToParty: gstSettings.billToParty,
          shiftToParty: gstSettings.shiftToParty
        };

        await handleFallbackBillGeneration(apiData);
        
        setApiResponseMessage({
          type: "warning",
          message: "Bill generated using fallback method. Online payment may need manual processing.",
        });
        setShowThankYou(true);
        
      } catch (fallbackError) {
        setApiResponseMessage({
          type: "error",
          message: error.response?.data?.message || 
                 error.message || 
                 "Failed to process online payment and bill generation.",
        });
      }
    }
    
    setShowApiResponse(true);
  };

  // Item management functions
  const saveEditedPrice = async () => {
    const { id, type, field, value } = editItem;
    const newValue = parseFloat(value);

    if (type === "part") {
      const updatedParts = parts.map(part => 
        part.id === id 
          ? { ...part, [field]: newValue, total: field === 'pricePerUnit' ? part.quantity * newValue : part.total } 
          : part
      );
      setParts(updatedParts);

      // Update job card via API for part price changes
      try {
        const partsForAPI = updatedParts.map(part => ({
          _id: part.id, // Changed from partId to _id to match WorkInProgress.js expectations
          partName: part.name,
          quantity: part.quantity,
          totalPrice: part.total,
        }));

        const updatePayload = {
          partsUsed: partsForAPI
        };

        const response = await axios.put(
          `https://garage-management-zi5z.onrender.com/api/jobCards/${jobCardIdFromUrl}`,
          updatePayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
            }
          }
        );


        setSnackbar({
          open: true,
          message: "Price updated successfully and saved to job card!",
          severity: "success",
        });
      } catch (error) {
        console.error('Error updating job card after price edit:', error);
        setSnackbar({
          open: true,
          message: "Price updated locally but failed to save to job card. Please try again.",
          severity: "warning",
        });
      }
    }

    setShowEditPriceDialog(false);
  };

  // UPDATED: Add new part with HSN number
  const addNewPart = async () => {
    const { name, quantity, pricePerUnit, hsnNumber } = newPart;
    if (name && quantity > 0 && pricePerUnit > 0) {
      const newPartObj = {
        id: Date.now(),
        name,
        quantity: parseInt(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        total: parseInt(quantity) * parseFloat(pricePerUnit),
        hsnNumber: hsnNumber || "8708"
      };

      // Add to local state
      setParts(prev => [...prev, newPartObj]);
      setNewPart({ name: "", quantity: 1, pricePerUnit: 0, hsnNumber: "" });
      setShowNewPartDialog(false);

      // Update job card via API
      try {
        const updatedParts = [...parts, newPartObj].map(part => ({
          _id: part.id, // Changed from partId to _id to match WorkInProgress.js expectations
          partName: part.name,
          quantity: part.quantity,
          totalPrice: part.total,
        }));

        const updatePayload = {
          partsUsed: updatedParts
        };

        const response = await axios.put(
          `https://garage-management-zi5z.onrender.com/api/jobCards/${jobCardIdFromUrl}`,
          updatePayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
            }
          }
        );


        setSnackbar({
          open: true,
          message: "Part added successfully and saved to job card!",
          severity: "success",
        });
      } catch (error) {
        console.error('Error updating job card with new part:', error);
        setSnackbar({
          open: true,
          message: "Part added locally but failed to save to job card. Please try again.",
          severity: "warning",
        });
      }
    }
  };



  // ===================================================================
// 1. PROFESSIONAL GST INVOICE GENERATION (PDF)
// ===================================================================
const generateProfessionalGSTInvoice = () => {
  try {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // ——— compact layout tuning for single-page fit ———
    const margin = 24;                      // was 30
    const contentWidth = pageWidth - margin * 2;
    let currentY = 28;                      // was 40
    const lineGap = 14;                     // compact line height

    // Helper: Draw bordered rectangle
    const drawBorderedRect = (x, y, width, height, fillColor = null) => {
      if (fillColor) {
        try {
          if (typeof fillColor === 'string' && fillColor.startsWith('#')) {
            const hex = fillColor.substring(1);
            if (hex.length === 6) {
              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);
              doc.setFillColor(r, g, b);
            } else {
              doc.setFillColor(240, 240, 240);
            }
          } else if (typeof fillColor === 'string') {
            switch (fillColor) {
              case 'lightgray':
              case '#f8f9fa':
                doc.setFillColor(248, 249, 250); break;
              case 'darkblue':
              case '#34495e':
                doc.setFillColor(52, 73, 94); break;
              case 'blue':
              case '#3498db':
                doc.setFillColor(52, 152, 219); break;
              case 'green':
              case '#27ae60':
                doc.setFillColor(39, 174, 96); break;
              case 'lightgreen':
              case '#e8f5e8':
                doc.setFillColor(232, 245, 232); break;
              default:
                doc.setFillColor(240, 240, 240);
            }
          } else {
            doc.setFillColor(240, 240, 240);
          }
          doc.rect(x, y, width, height, 'F');
        } catch (_) { /* ignore fill errors */ }
      }
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.rect(x, y, width, height);
    };

    // Helper: NEVER add a second page — instead, stop adding rows/sections
    const wouldOverflow = (requiredSpace) =>
      currentY + requiredSpace > pageHeight - 80; // footer buffer

    // Calculate totals (unchanged business rules)
    const validParts = parts.filter(p => p && Number(p.total) > 0);
    const partsSubtotal = summary.totalPartsCost || 0;

    let laborTotal = 0;
    if (jobCardData?.laborServicesTotal > 0) laborTotal = jobCardData.laborServicesTotal;
    else if (laborServicesTotal > 0) laborTotal = laborServicesTotal;
    else if (Array.isArray(jobCardData?.laborServices)) {
      laborTotal = jobCardData.laborServices.reduce((s, srv) => s + (parseFloat(srv.amount) || 0), 0);
    }

    const shouldApplyGst = gstSettings.billType === 'gst' && laborTotal > 0;
    const laborGstAmount = shouldApplyGst ? (laborTotal * (gstSettings.gstPercentage / 100)) : 0;
    const partsGstAmount = 0;
    const totalGstAmount = laborGstAmount + partsGstAmount;
    const totalBeforeTax = partsSubtotal + laborTotal;
    const finalAmount = totalBeforeTax + totalGstAmount - (summary.discount || 0);

    // Number to Words (short + compact)
    const numberToWords = (num) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      if (num === 0) return 'Zero';
      let words = '';
      const crore = Math.floor(num / 10000000); if (crore) { words += numberToWords(crore) + ' Crore '; num %= 10000000; }
      const lakh = Math.floor(num / 100000); if (lakh) { words += numberToWords(lakh) + ' Lakh '; num %= 100000; }
      const thousand = Math.floor(num / 1000); if (thousand) { words += numberToWords(thousand) + ' Thousand '; num %= 1000; }
      const hundred = Math.floor(num / 100); if (hundred) { words += ones[hundred] + ' Hundred '; num %= 100; }
      if (num >= 20) { words += tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : ''); }
      else if (num >= 10) { words += teens[num - 10]; }
      else if (num > 0) { words += ones[num]; }
      return words.trim();
    };

    // -----------------------------
    // HEADER (shorter, centered)
    // -----------------------------
    drawBorderedRect(margin, currentY, contentWidth, 96, 'lightgray');

    // Logo (smaller)
    const logoSize = 44;
    const logoX = margin + 10;
    const logoY = currentY + 10;
    if (garageDetails.logoUrl) {
      try { doc.addImage(garageDetails.logoUrl, 'JPEG', logoX, logoY, logoSize, logoSize); } catch (_) {}
    }

    // Company Name
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    const companyName = (garageDetails.name || '').toUpperCase();
    const companyNameWidth = doc.getTextWidth(companyName);
    const centerX = (pageWidth - companyNameWidth) / 2;
    doc.text(companyName, centerX, currentY + 28);

    // Address + GST + Contact (compact lines)
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const mkCenter = (t, dy) => {
      const w = doc.getTextWidth(t);
      doc.text(t, (pageWidth - w) / 2, currentY + dy);
    };
    if (garageDetails.address) mkCenter(garageDetails.address, 44);
    mkCenter(`GST No: ${garageDetails.gstNumber || 'N/A'}`, 58);
    if (garageDetails.phone || garageDetails.email) {
      const contactLine = `${garageDetails.phone ? 'Ph: ' + garageDetails.phone : ''}${garageDetails.phone && garageDetails.email ? ' | ' : ''}${garageDetails.email ? 'Email: ' + garageDetails.email : ''}`;
      mkCenter(contactLine, 72);
    }
    currentY += 96 + 8;

    // -----------------------------
    // CUSTOMER & INVOICE DETAILS (tight, two boxes)
    // -----------------------------
    const detailsY = currentY;
    const leftW = Math.floor(contentWidth * 0.60) - 6;
    const rightW = Math.floor(contentWidth * 0.40) - 6;

    // BILL TO
    drawBorderedRect(margin, detailsY, leftW, 110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(52, 152, 219);
    doc.text("BILL TO", margin + 8, detailsY + 18);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let y = detailsY + 18 + lineGap;
    const put = (label, val) => { if (!val) return; doc.text(`${label}: ${val}`, margin + 8, y); y += lineGap; };

    put("Name", gstSettings.billToParty || carDetails.customerName);
    put("Contact", carDetails.contact);
    if (carDetails.email) put("Email", carDetails.email);
    if (gstSettings.customerGstNumber && gstSettings.billType === 'gst') put("GST No", gstSettings.customerGstNumber);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 152, 219);
    doc.text("VEHICLE", margin + 8, detailsY + 18 + lineGap * 4 + 6);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`${carDetails.company} ${carDetails.model} | Reg: ${carDetails.carNumber}`, margin + 8, detailsY + 18 + lineGap * 5 + 6);

    // INVOICE BOX
    drawBorderedRect(margin + leftW + 12, detailsY, rightW, 110, 'lightgray');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 152, 219);
    doc.text("INVOICE", margin + leftW + 20, detailsY + 18);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const rightX = margin + leftW + 20;
    doc.text(`Invoice No: ${carDetails.invoiceNo}`, rightX, detailsY + 18 + lineGap);
    doc.text(`Job Card No: ${jobCardData?.jobCardNumber || 'N/A'}`, rightX, detailsY + 18 + lineGap * 2);
    doc.text(`Date: ${carDetails.billingDate}`, rightX, detailsY + 18 + lineGap * 3);
    if (jobCardData?.insuranceProvider) {
      doc.text(`Insurance: ${jobCardData.insuranceProvider}`, rightX, detailsY + 18 + lineGap * 4);
    }

    currentY = detailsY + 110 + 10;

    // -----------------------------
    // ITEMS TABLE (full page width)
    // -----------------------------
    // Calculate column widths to use full page width for better space utilization
    const colWidths = { 
      srNo: Math.floor(contentWidth * 0.08),      // 8% of content width
      productName: Math.floor(contentWidth * 0.45), // 45% of content width - largest for descriptions
      hsnCode: Math.floor(contentWidth * 0.10),   // 15% of content width
      qty: Math.floor(contentWidth * 0.10),       // 10% of content width
      rate: Math.floor(contentWidth * 0.12),      // 12% of content width
      amount: Math.floor(contentWidth * 0.15)     // 10% of content width
    };
    const totalTableWidth = contentWidth; // Use full content width instead of fixed widths

    const headerY = currentY;
    drawBorderedRect(margin, headerY, totalTableWidth, 28, 'darkblue');
    doc.setFontSize(9.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);

    let colX = margin;
    ["Sr.", "Product/Service Description", "HSN Code", "Qty", "Rate ", "Amount"].forEach((text, i) => {
      const w = colWidths[Object.keys(colWidths)[i]];
      const txtW = doc.getTextWidth(text);
      
      if (i === 1) {
        // Product/Service - left aligned
        doc.text(text, colX + 8, headerY + 19);
      } else if (i === 0 || i === 2 || i === 3) {
        // Sr, HSN, Qty - center aligned
        doc.text(text, colX + (w - txtW) / 2, headerY + 19);
      } else {
        // Rate and Amount - right aligned
        doc.text(text, colX + w - txtW - 8, headerY + 19);
      }
      
      // Draw column separators
      if (i < 5) {
        doc.setDrawColor(255, 255, 255);
        doc.line(colX + w, headerY, colX + w, headerY + 28);
      }
      colX += w;
    });

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    currentY = headerY + 28;

    const rowHeight = 24; // slightly taller for better readability
    let rowIndex = 1;

    const drawTableRow = (rowData, y, shaded = false) => {
      if (wouldOverflow(rowHeight)) return 0; // stop adding rows if overflow
      drawBorderedRect(margin, y, totalTableWidth, rowHeight, shaded ? 'lightgray' : null);
      let x = margin;
      rowData.forEach((cell, i) => {
        const w = colWidths[Object.keys(colWidths)[i]];
        let display = (cell ?? '').toString();

        if ((i === 4 || i === 5) && display !== '' && !isNaN(display)) {
          display = ' ' + parseFloat(display).toFixed(2);
        }

        if (i === 1) {
          // Product name - left aligned with more space for longer names
          const maxLength = Math.floor(w / 6); // Approximate characters that fit
          const text = display.length > maxLength ? display.slice(0, maxLength) + '…' : display;
          doc.text(text, x + 8, y + 16);
        } else if (i === 2) {
          // HSN Code - center aligned
          const tW = doc.getTextWidth(display);
          doc.text(display, x + (w - tW) / 2, y + 16);
        } else if (i === 0) {
          // Sr No - center aligned
          const tW = doc.getTextWidth(display);
          doc.text(display, x + (w - tW) / 2, y + 16);
        } else if (i === 3) {
          // Quantity - center aligned
          const tW = doc.getTextWidth(display);
          doc.text(display, x + (w - tW) / 2, y + 16);
        } else if (i === 4 || i === 5) {
          // Rate and Amount - right aligned
          const tW = doc.getTextWidth(display);
          doc.text(display, x + w - tW - 8, y + 16);
        }
        
        // Draw column separators
        if (i < 5) { // Don't draw line after last column
          doc.setDrawColor(220, 220, 220);
          doc.line(x + w, y, x + w, y + rowHeight);
        }
        x += w;
      });
      return rowHeight;
    };

    // Parts rows
    validParts.forEach((part, idx) => {
      if (wouldOverflow(rowHeight)) return;
      const amount = (Number(part.pricePerUnit) || 0) * (Number(part.quantity) || 0);
      const row = [
        rowIndex++,
        part.name || 'Part',
        part.hsnNumber || '-',
        part.quantity ?? '-',
        (Number(part.pricePerUnit) || 0).toFixed(2),
        amount.toFixed(2),
      ];
      const h = drawTableRow(row, currentY, idx % 2 === 1);
      currentY += h;
    });

    // Labour row
    if (!wouldOverflow(rowHeight) && laborTotal > 0) {
      const row = [rowIndex++, "Labor & Services", "-", "-", laborTotal.toFixed(2), laborTotal.toFixed(2)];
      const h = drawTableRow(row, currentY, validParts.length % 2 === 0);
      currentY += h;
    }

    currentY += 8;

    // -----------------------------
    // BILLING SUMMARY (compact card)
    // -----------------------------
    const summaryWidth = 240;
    const summaryX = pageWidth - margin - summaryWidth;

    const summaryBlockHeight =
      26 * (1 + (laborTotal > 0 ? 1 : 0) + (shouldApplyGst && laborGstAmount > 0 ? 1 : 0) +
        (summary.discount > 0 ? 2 : 1)); // includes subtotal & grand total lines

    if (!wouldOverflow(summaryBlockHeight + 40)) {
      drawBorderedRect(summaryX, currentY, summaryWidth, 26, 'darkblue');
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(255, 255, 255);
      doc.text("BILLING SUMMARY", summaryX + 10, currentY + 18);
      currentY += 26;

      const lineRow = (label, value, shaded = false, bold = false, green = false) => {
        if (wouldOverflow(26)) return false;
        drawBorderedRect(summaryX, currentY, summaryWidth, 26, shaded ? 'lightgray' : null);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text(label, summaryX + 10, currentY + 17);
        if (green) doc.setTextColor(39, 174, 96);
        const valTxt = ` ${Number(value).toFixed(2)}`;
        const tW = doc.getTextWidth(valTxt);
        doc.text(valTxt, summaryX + summaryWidth - tW - 10, currentY + 17);
        doc.setTextColor(0, 0, 0);
        currentY += 26;
        return true;
      };

      lineRow("Parts:", partsSubtotal, false, true);
      if (laborTotal > 0) lineRow("Labour:", laborTotal, true, true);
      if (shouldApplyGst && laborGstAmount > 0) lineRow("Labour GST:", laborGstAmount, false, true);
      lineRow("Subtotal:", totalBeforeTax + totalGstAmount, true, true);
      if (summary.discount > 0) lineRow("Discount:", summary.discount * -1, false, true, true);

      // Grand Total
      if (!wouldOverflow(32)) {
        drawBorderedRect(summaryX, currentY, summaryWidth, 32, 'green');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text("GRAND TOTAL", summaryX + 10, currentY + 21);
        const gt = ` ${finalAmount.toFixed(2)}`;
        const gtw = doc.getTextWidth(gt);
        doc.text(gt, summaryX + summaryWidth - gtw - 10, currentY + 21);
        currentY += 36;
      }
    }

    // -----------------------------
    // BANK DETAILS (FULL-WIDTH, TWO COLUMNS)
    // -----------------------------
    const bank = garageDetails.bankDetails || {};
    if (bank.bankName && !wouldOverflow(110)) {
      const blockH = 100;
      const blockY = currentY;
      drawBorderedRect(margin, blockY, contentWidth, blockH, 'lightgray');

      // Header
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 152, 219);
      doc.setFontSize(11);
      doc.text("BANK DETAILS", margin + 10, blockY + 18);

      // Two-column layout
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);

      const colPad = 10;
      const colGap = 16;
      const colWidth = (contentWidth - colGap - colPad * 2) / 2;

      const leftX = margin + colPad;
      const rightX = leftX + colWidth + colGap;
      let yL = blockY + 18 + lineGap;
      let yR = blockY + 18 + lineGap;

      // Left column
      const L = (label, val) => { if (!val) return; doc.text(`${label}: ${val}`, leftX, yL); yL += lineGap; };
      L("Bank", bank.bankName);
      L("A/c Holder", bank.accountHolderName);
      L("A/c No", bank.accountNumber);
      L("IFSC", bank.ifscCode);

      // Right column
      const R = (label, val) => { if (!val) return; doc.text(`${label}: ${val}`, rightX, yR); yR += lineGap; };
      R("Branch", bank.branchName || bank.branch || "");
      R("UPI", bank.upiId || "");
      R("Notes", bank.notes || "");

      currentY += blockH + 8;
    }

    // -----------------------------
    // FOOTER (compact)
    // -----------------------------
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 28);
    const pageInfo = `Bill Type: ${String(gstSettings.billType || '').toUpperCase()} | Page 1 of 1`;
    const pW = doc.getTextWidth(pageInfo);
    doc.text(pageInfo, pageWidth - margin - pW, pageHeight - 28);

    return doc;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate invoice: ' + error.message);
  }
};


  const downloadPdfBill = () => {
  if (!carDetails.invoiceNo || !carDetails.customerName) {
    setSnackbar({
      open: true,
      message: 'Invoice number and customer name are required.',
      severity: 'error'
    });
    return;
  }
  const doc = generateProfessionalGSTInvoice();
  const type = gstSettings.billType === 'gst' ? 'GST' : 'Non-GST';
  const fileName = `${type}_Invoice_${carDetails.invoiceNo}_${carDetails.carNumber}.pdf`;
  doc.save(fileName);
  setSnackbar({ open: true, message: `${type} invoice downloaded!`, severity: 'success' });
};

const printInvoice = () => {
  try {
    const doc = generateProfessionalGSTInvoice();
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    // Create a simple approach that works across browsers
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `Invoice_${carDetails.invoiceNo}.pdf`;
    
    // Try to open in new tab first
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      // Show success message
      setSnackbar({
        open: true,
        message: "PDF opened in new tab. Please use browser's print function (Ctrl+P) to print.",
        severity: "success",
      });
      
      // Clean up URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    } else {
      // If popup blocked, download the file
      link.click();
      URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: "PDF downloaded. Please open the file and print manually.",
        severity: "info",
      });
    }
    
  } catch (error) {
    console.error("Error printing invoice:", error);
    setSnackbar({
      open: true,
      message: "Failed to generate PDF. Please try again.",
      severity: "error",
    });
  }
};

  // Enhanced email function with PDF attachment and fallback
 const sendBillViaEmail = async () => {
  try {
    setSendingEmail(true);
    
    // Generate PDF
    const doc = generateProfessionalGSTInvoice();
    const pdfBlob = doc.output('blob');
    
    // Try to send via API first
    try {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `Invoice_${carDetails.invoiceNo}.pdf`);
      formData.append('email', emailRecipient || carDetails.email);
      formData.append('subject', emailSubject || `Invoice #${carDetails.invoiceNo} - ${garageDetails.name}`);
      formData.append('message', emailMessage || `Dear ${carDetails.customerName},\n\nPlease find your invoice attached.\n\nTotal: ₹${summary.totalAmount}\n\nRegards,\n${garageDetails.name}`);
      formData.append('garageId', localStorage.getItem('garageId'));
      
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/send-invoice-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Invoice sent via email successfully!",
          severity: "success"
        });
        setShowEmailDialog(false);
        return;
      }
    } catch (apiError) {
      console.log('API not available, using fallback method');
    }
    
    // Fallback: Download PDF and open email client
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${carDetails.invoiceNo}.pdf`;
    link.click();
    
    const subject = `Invoice #${carDetails.invoiceNo} - ${garageDetails.name}`;
    const body = `Dear ${carDetails.customerName},\n\nPlease find your invoice attached.\n\nTotal: ₹${summary.totalAmount}\n\nRegards,\n${garageDetails.name}`;
    window.open(`mailto:${emailRecipient || carDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    
    setSnackbar({
      open: true,
      message: "PDF downloaded! Email client opened. Please attach the PDF manually.",
      severity: "info"
    });
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
  } catch (error) {
    console.error('Error sending email:', error);
    setSnackbar({
      open: true,
      message: "Failed to send email. Please try again.",
      severity: "error"
    });
  } finally {
    setSendingEmail(false);
  }
};

  // ENHANCED: WhatsApp Business API function for sending PDF invoices
  const sendBillViaWhatsApp = async () => {
    try {
      setSendingWhatsApp(true);
      
      // Generate PDF
      const doc = generateProfessionalGSTInvoice();
      const pdfBlob = doc.output('blob');
      
      // Method 1: Try to send via your backend API with WhatsApp Business integration
      try {
        const formData = new FormData();
        formData.append('pdf', pdfBlob, `Invoice_${carDetails.invoiceNo}.pdf`);
        formData.append('phone', carDetails.contact);
        formData.append('message', `🚗 *${gstSettings.billType.toUpperCase()} INVOICE*\n*${garageDetails.name}*\n\nInvoice #${carDetails.invoiceNo}\nTotal: ₹${summary.totalAmount}\n\nPlease find your invoice attached.`);
        formData.append('garageId', localStorage.getItem('garageId'));
        formData.append('customerName', carDetails.customerName);
        formData.append('invoiceDate', carDetails.billingDate);
        
        const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/send-invoice-whatsapp', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setSnackbar({
              open: true,
              message: "✅ Invoice sent via WhatsApp Business successfully!",
              severity: "success"
            });
            return;
          } else {
            console.log('API returned error, trying alternative method');
          }
        }
      } catch (apiError) {
        console.log('Backend API not available, using WhatsApp Business direct method');
      }
      
      // Method 2: Direct WhatsApp Business API integration (if you have API keys)
      try {
        // Check if WhatsApp Business API credentials are configured
        const whatsappConfig = localStorage.getItem('whatsappBusinessConfig');
        if (whatsappConfig) {
          const config = JSON.parse(whatsappConfig);
          const phoneNumberId = config.phoneNumberId;
          const accessToken = config.accessToken;
          
          if (phoneNumberId && accessToken) {
            // Convert PDF to base64
            const reader = new FileReader();
            reader.onload = async () => {
              const base64PDF = reader.result.split(',')[1];
              
              // Send via WhatsApp Business API
              const whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: `91${carDetails.contact.replace(/\D/g, '')}`,
                  type: 'document',
                  document: {
                    link: `data:application/pdf;base64,${base64PDF}`,
                    filename: `Invoice_${carDetails.invoiceNo}.pdf`,
                    caption: `🚗 *${gstSettings.billType.toUpperCase()} INVOICE*\n*${garageDetails.name}*\n\nInvoice #${carDetails.invoiceNo}\nTotal: ₹${summary.totalAmount}\n\nPlease find your invoice attached.`
                  }
                })
              });
              
              if (whatsappResponse.ok) {
                setSnackbar({
                  open: true,
                  message: "✅ Invoice sent via WhatsApp Business API successfully!",
                  severity: "success"
                });
                return;
              }
            };
            reader.readAsDataURL(pdfBlob);
            return;
          }
        }
      } catch (whatsappError) {
        console.log('WhatsApp Business API not configured, using fallback method');
      }
      
      // Method 3: Fallback - Download PDF and open WhatsApp with pre-filled message
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${carDetails.invoiceNo}.pdf`;
      link.click();
      
      // Create comprehensive WhatsApp message
      const gstInfo = gstSettings.billType === 'gst'
        ? `GST (${gstSettings.gstPercentage}%): ₹${summary.gstAmount}`
        : 'Non-GST Bill';

      const msg = `🚗 *${gstSettings.billType.toUpperCase()} INVOICE*
*${garageDetails.name}*
📞 ${garageDetails.phone}
📍 ${garageDetails.address}

*Invoice No:* ${carDetails.invoiceNo}
*Date:* ${carDetails.billingDate}
*Customer:* ${carDetails.customerName}
*Vehicle:* ${carDetails.company} ${carDetails.model}
*Reg:* ${carDetails.carNumber}

*Parts:* ₹${summary.totalPartsCost}
*Labor:* ₹${laborServicesTotal}
*Subtotal:* ₹${summary.subtotal}
${gstInfo}
${summary.discount > 0 ? `*Discount:* -₹${summary.discount}` : ''}
*Total:* *₹${summary.totalAmount}*

📄 PDF invoice has been downloaded. Please attach it to this message.

Thank you!`;

      // Format phone number for WhatsApp
      const phone = `91${carDetails.contact.replace(/\D/g, '')}`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      
      setSnackbar({
        open: true,
        message: "📱 PDF downloaded! WhatsApp opened. Please attach the PDF manually.",
        severity: "info"
      });
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      setSnackbar({
        open: true,
        message: "❌ Failed to send WhatsApp message. Please try again.",
        severity: "error"
      });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const openEmailDialog = () => setShowEmailDialog(true);

  // WhatsApp Business API configuration
  const [showWhatsAppConfig, setShowWhatsAppConfig] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState({
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: ''
  });

  // Load WhatsApp Business configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem('whatsappBusinessConfig');
    if (savedConfig) {
      try {
        setWhatsappConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Error parsing WhatsApp config:', e);
      }
    }
  }, []);

  // Save WhatsApp Business configuration
  const saveWhatsAppConfig = () => {
    try {
      localStorage.setItem('whatsappBusinessConfig', JSON.stringify(whatsappConfig));
      setSnackbar({
        open: true,
        message: "✅ WhatsApp Business API configuration saved successfully!",
        severity: "success"
      });
      setShowWhatsAppConfig(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "❌ Failed to save WhatsApp configuration",
        severity: "error"
      });
    }
  };

  // Open WhatsApp Business configuration dialog
  const openWhatsAppConfig = () => setShowWhatsAppConfig(true);

  // Loading state UI
  if (isLoading) {
    return (
      <Box sx={{ ml: { xs: 0, md: "280px" }, px: { xs: 2, md: 3 }, py: 4 }}>
        <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            Loading job card data...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ ml: { xs: 0, md: "280px" }, px: { xs: 2, md: 3 }, py: 4 }}>
      <Paper elevation={3} sx={{ mb: 4, p: isMobile ? 2 : 3, borderRadius: 2 }}>
        {/* Header with Back Button */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row", 
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center", 
          mb: 3, 
          gap: isMobile ? 2 : 0 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={handleGoBack}
              sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant={isMobile ? "h5" : "h4"} color="primary" fontWeight="bold">
              Professional Billing System ({gstSettings.billType.toUpperCase()})
            </Typography>
          </Box>
          
          {/* Action Buttons */}
          {!isBillAlreadyGenerated && !billGenerated ? (
            <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
            
              <Button
                variant="contained"
                color="primary"
                startIcon={<ReceiptIcon />}
                onClick={generateBill}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                
              >
                Generate {gstSettings.billType.toUpperCase()} Bill
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckIcon />}
                disabled
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
              >
                {gstSettings.billType.toUpperCase()} Bill Generated ✓
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={downloadPdfBill}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
              >
                Download {gstSettings.billType.toUpperCase()} Invoice
              </Button>
            </Box>
          )}
        </Box>

        {/* Bill generation warning if already generated */}
        {isBillAlreadyGenerated && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This {gstSettings.billType.toUpperCase()} invoice has already been generated. You can download the PDF or share via WhatsApp/Email below.
          </Alert>
        )}


        {!showThankYou ? (
          <>
            <GarageDetailsSection garageDetails={garageDetails} />
            <CustomerVehicleSection 
              carDetails={carDetails} 
              handleInputChange={handleInputChange} 
              isMobile={isMobile} 
              today={today}
              disabled={isBillAlreadyGenerated}
            />
            
            {/* UPDATED: Enhanced GST Settings Section with Bill Type and Party Details */}
            <GSTSettingsSection 
              gstSettings={gstSettings} 
              handleGstIncludeChange={handleGstIncludeChange}
              handleBillTypeChange={handleBillTypeChange}
              handleBillToPartyChange={handleBillToPartyChange}
              handleShiftToPartyChange={handleShiftToPartyChange}
              handleGstTypeChange={handleGstTypeChange}
              handleGstPercentageChange={handleGstPercentageChange}
              handleGstAmountChange={handleGstAmountChange}
              handleCustomerGstChange={handleCustomerGstChange}
              handleInterStateChange={handleInterStateChange}
              summary={summary}
              isMobile={isMobile}
              disabled={isBillAlreadyGenerated}
            />
            
            <PartsSection 
              parts={parts} 
              removePart={removePart} 
              openEditPrice={openEditPrice} 
              setShowNewPartDialog={setShowNewPartDialog} 
              isMobile={isMobile}
              tableCellStyle={tableCellStyle}
              disabled={isBillAlreadyGenerated}
              gstSettings={gstSettings} 
            />

            <FinalInspectionSection 
              finalInspection={finalInspection} 
              setFinalInspection={setFinalInspection}
              disabled={isBillAlreadyGenerated}
            />
          <BillSummarySection 
  summary={summary} 
  gstSettings={gstSettings} 
  handleDiscountChange={handleDiscountChange} 
  paymentMethod={paymentMethod} 
  isMobile={isMobile}
  formatAmount={formatAmount}
  disabled={isBillAlreadyGenerated}
  laborServicesTotal={laborServicesTotal}
  onLaborChange={setLaborServicesTotal} // 👈 Add this
/>
          </>
        ) : (
        <ThankYouSection 
  carDetails={carDetails} 
  summary={summary} 
  gstSettings={gstSettings} 
  paymentMethod={paymentMethod} 
  isMobile={isMobile} 
  downloadPdfBill={downloadPdfBill}      
  printInvoice={printInvoice}             // ← Add this
  sendBillViaWhatsApp={sendBillViaWhatsApp} 
  sendingWhatsApp={sendingWhatsApp} 
  openEmailDialog={openEmailDialog} 
  sendingEmail={sendingEmail}
  garageDetails={garageDetails}
  parts={parts}
  laborServicesTotal={laborServicesTotal}
  openWhatsAppConfig={openWhatsAppConfig}  // ← Add WhatsApp configuration
  whatsappConfigured={!!whatsappConfig.phoneNumberId && !!whatsappConfig.accessToken}  // ← Add configuration status
/>
        )}
      </Paper>

      <PaymentMethodDialog 
        showPaymentModal={showPaymentModal} 
        setShowPaymentModal={setShowPaymentModal} 
        isMobile={isMobile} 
        selectPaymentMethod={selectPaymentMethod} 
      />
      
      <EmailDialog 
        showEmailDialog={showEmailDialog} 
        setShowEmailDialog={setShowEmailDialog} 
        isMobile={isMobile} 
        emailRecipient={emailRecipient} 
        setEmailRecipient={setEmailRecipient} 
        emailSubject={emailSubject} 
        setEmailSubject={setEmailSubject} 
        emailMessage={emailMessage} 
        setEmailMessage={setEmailMessage} 
        carDetails={carDetails}
        garageDetails={garageDetails}
        gstSettings={gstSettings}
        summary={summary}
        jobCardData={jobCardData}
        generateProfessionalGSTInvoice={generateProfessionalGSTInvoice}
      />

      {/* WhatsApp Business API Configuration Dialog */}
      <Dialog
        open={showWhatsAppConfig}
        onClose={() => setShowWhatsAppConfig(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'success.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <WhatsAppIcon />
          WhatsApp Business API Configuration
          {whatsappConfig.phoneNumberId && whatsappConfig.accessToken && (
            <Box sx={{ ml: 'auto', fontSize: '0.8em', opacity: 0.8 }}>
              ✅ Configured
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure your WhatsApp Business API credentials to send PDF invoices directly via WhatsApp.
          </Typography>
          
          <TextField
            fullWidth
            label="Phone Number ID"
            value={whatsappConfig.phoneNumberId}
            onChange={(e) => setWhatsappConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
            placeholder="e.g., 123456789012345"
            sx={{ mb: 2 }}
            helperText="Your WhatsApp Business Phone Number ID from Meta Developer Console"
          />
          
          <TextField
            fullWidth
            label="Access Token"
            value={whatsappConfig.accessToken}
            onChange={(e) => setWhatsappConfig(prev => ({ ...prev, accessToken: e.target.value }))}
            placeholder="EAA..."
            sx={{ mb: 2 }}
            helperText="Your WhatsApp Business Access Token from Meta Developer Console"
            type="password"
          />
          
          <TextField
            fullWidth
            label="Business Account ID (Optional)"
            value={whatsappConfig.businessAccountId}
            onChange={(e) => setWhatsappConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
            placeholder="e.g., 123456789012345"
            sx={{ mb: 2 }}
            helperText="Your WhatsApp Business Account ID (optional)"
          />
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>How to get these credentials:</strong>
              <br />1. Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener">Meta Developer Console</a>
              <br />2. Create a WhatsApp Business App
              <br />3. Get your Phone Number ID and Access Token
              <br />4. Configure webhook for message delivery
            </Typography>
          </Alert>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> You need a verified WhatsApp Business account and approval from Meta to send messages via API. 
              The free tier allows limited messages per month.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowWhatsAppConfig(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={saveWhatsAppConfig}
            variant="contained"
            color="success"
            startIcon={<WhatsAppIcon />}
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Only show edit dialogs if bill is not generated */}
      {!isBillAlreadyGenerated && (
        <>
          <EditPriceDialog 
            showEditPriceDialog={showEditPriceDialog} 
            setShowEditPriceDialog={setShowEditPriceDialog} 
            isMobile={isMobile} 
            editItem={editItem} 
            setEditItem={setEditItem} 
            saveEditedPrice={saveEditedPrice} 
          />
          
          {/* UPDATED: Add Part Dialog with HSN Number field */}
          <AddPartDialog 
            showNewPartDialog={showNewPartDialog} 
            setShowNewPartDialog={setShowNewPartDialog} 
            isMobile={isMobile} 
            newPart={newPart} 
            setNewPart={setNewPart} 
            addNewPart={addNewPart} 
            includeHsnField={true}
          />
          

        </>
      )}

      <SnackbarAlert 
        showApiResponse={showApiResponse} 
        setShowApiResponse={setShowApiResponse} 
        apiResponseMessage={apiResponseMessage} 
      />
      <SnackbarAlert 
        showApiResponse={snackbar.open} 
        setShowApiResponse={() => setSnackbar({...snackbar, open: false})} 
        apiResponseMessage={{message: snackbar.message, type: snackbar.severity}} 
      />
    </Box>
  );
};

export default AutoServeBilling;