import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, LinearProgress, Paper,
  useMediaQuery, useTheme, Snackbar, Alert, IconButton
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
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
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
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 40;

    // Helper: Draw bordered rectangle
    const drawBorderedRect = (x, y, width, height, fillColor = null) => {
      if (fillColor) {
        // Handle different color formats safely
        try {
          if (typeof fillColor === 'string' && fillColor.startsWith('#')) {
            const hex = fillColor.substring(1);
            if (hex.length === 6) {
              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);
              doc.setFillColor(r, g, b);
            } else {
              doc.setFillColor(240, 240, 240); // Default light gray
            }
          } else if (typeof fillColor === 'string') {
            // Handle named colors
            switch(fillColor) {
              case 'lightgray':
              case '#f8f9fa':
                doc.setFillColor(248, 249, 250);
                break;
              case 'darkblue':
              case '#34495e':
                doc.setFillColor(52, 73, 94);
                break;
              case 'blue':
              case '#3498db':
                doc.setFillColor(52, 152, 219);
                break;
              case 'green':
              case '#27ae60':
                doc.setFillColor(39, 174, 96);
                break;
              case 'lightgreen':
              case '#e8f5e8':
                doc.setFillColor(232, 245, 232);
                break;
              default:
                doc.setFillColor(240, 240, 240);
            }
          } else {
            doc.setFillColor(240, 240, 240); // Default
          }
          doc.rect(x, y, width, height, 'F');
        } catch (error) {
          console.warn('Color setting error:', error);
          // Draw without fill if color fails
        }
      }
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.rect(x, y, width, height);
    };

    // Helper: Check if new page is needed
    const checkPageBreak = (requiredSpace) => {
      if (currentY + requiredSpace > pageHeight - 100) {
        doc.addPage();
        currentY = 40;
        return true;
      }
      return false;
    };

    // Calculate totals properly - only include valid parts
    const validParts = parts.filter(part => part && part.total > 0);
    
    // Parts subtotal (never taxed) - match BillSummarySection logic
    const partsSubtotal = summary.totalPartsCost || 0;
    
    // Use actual API data for labor services - ensure we get the correct value
    let laborTotal = 0;
    
    // Try multiple sources for labor data - match BillSummarySection logic
    if (jobCardData?.laborServicesTotal && jobCardData.laborServicesTotal > 0) {
      laborTotal = jobCardData.laborServicesTotal;
    } else if (laborServicesTotal && laborServicesTotal > 0) {
      laborTotal = laborServicesTotal;
    } else if (jobCardData?.laborServices && Array.isArray(jobCardData.laborServices)) {
      // Calculate from labor services array if available
      laborTotal = jobCardData.laborServices.reduce((sum, service) => sum + (parseFloat(service.amount) || 0), 0);
    }
    
    // For debugging - log the labor total
    console.log('PDF Labor Total:', laborTotal, 'jobCardData:', jobCardData?.laborServicesTotal, 'laborServicesTotal:', laborServicesTotal);
    
    // 🔑 Only apply GST on Labour/Service (not on parts) - match BillSummarySection logic
    const shouldApplyGst = gstSettings.billType === 'gst' && laborTotal > 0;
    
    // ✅ GST ONLY on Labour - match BillSummarySection logic
    const laborGstAmount = shouldApplyGst ? (laborTotal * (gstSettings.gstPercentage / 100)) : 0;
    
    // ❌ NO GST on Parts - match BillSummarySection logic
    const partsGstAmount = 0; // Always 0
    
    // Total GST = Only Labour GST - match BillSummarySection logic
    const totalGstAmount = laborGstAmount;
    
    // Subtotal (Parts + Labour) - match BillSummarySection logic
    const totalBeforeTax = partsSubtotal + laborTotal;
    
    // Final total: parts + labour + GST (only on labour) - discount - match BillSummarySection logic
    const finalAmount = totalBeforeTax + totalGstAmount - (summary.discount || 0);

    // Number to Words function
    const numberToWords = (num) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      if (num === 0) return 'Zero';
      let words = '';
      if (num >= 10000000) {
        words += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
        num %= 10000000;
      }
      if (num >= 100000) {
        words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
        num %= 100000;
      }
      if (num >= 1000) {
        words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
      }
      if (num >= 100) {
        words += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      if (num >= 20) {
        words += tens[Math.floor(num / 10)];
        if (num % 10 !== 0) words += ' ' + ones[num % 10];
      } else if (num >= 10) {
        words += teens[num - 10];
      } else if (num > 0) {
        words += ones[num];
      }
      return words.trim();
    };

    // -----------------------------
    // HEADER SECTION
    // -----------------------------
    drawBorderedRect(margin, currentY, contentWidth, 120, 'lightgray');

    // Logo - Simple approach without complex graphics
    const logoSize = 50;
    const logoX = margin + 15;
    const logoY = currentY + 15;
    
    if (garageDetails.logoUrl) {
      try {
        // Draw white background circle
        // doc.setFillColor(255, 255, 255);
        // doc.setDrawColor(200, 200, 200);
        // doc.setLineWidth(2);
        // doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'FD');
        
        // Add logo image (square crop will be contained within circle)
        doc.addImage(garageDetails.logoUrl, 'JPEG', logoX + 5, logoY + 5, logoSize - 10, logoSize - 10);
        
      } catch (error) {
        console.warn('Logo load failed:', error);
        // Draw placeholder
        doc.setFillColor(240, 240, 240);
        doc.setDrawColor(180, 180, 180);
        doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'FD');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("LOGO", logoX + logoSize/2 - 15, logoY + logoSize/2 + 5);
      }
    }

    // Company Name
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    const companyName = garageDetails.name.toUpperCase();
    const companyNameWidth = doc.getTextWidth(companyName);
    const centerX = (pageWidth - companyNameWidth) / 2;
    doc.text(companyName, centerX, currentY + 40);

    // Invoice Type Banner
    const billTypeText = gstSettings.billType === 'gst' ? 'GST TAX INVOICE' : 'NON-GST INVOICE';
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    const bannerWidth = 150;
    const bannerX = (pageWidth - bannerWidth) / 2;
    doc.setFillColor(52, 152, 219);
    doc.rect(bannerX, currentY + 50, bannerWidth, 20, 'F');
    const billTypeWidth = doc.getTextWidth(billTypeText);
    doc.text(billTypeText, bannerX + (bannerWidth - billTypeWidth) / 2, currentY + 63);

    // Contact details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const addressLine = garageDetails.address;
    const addressWidth = doc.getTextWidth(addressLine);
    doc.text(addressLine, (pageWidth - addressWidth) / 2, currentY + 80);

    const gstLine = `GST No: ${garageDetails.gstNumber || 'N/A'}`;
    const gstWidth = doc.getTextWidth(gstLine);
    doc.text(gstLine, (pageWidth - gstWidth) / 2, currentY + 95);

    if (garageDetails.phone || garageDetails.email) {
      const contactLine = `${garageDetails.phone ? 'Ph: ' + garageDetails.phone : ''}${garageDetails.phone && garageDetails.email ? ' | ' : ''}${garageDetails.email ? 'Email: ' + garageDetails.email : ''}`;
      const contactWidth = doc.getTextWidth(contactLine);
      doc.text(contactLine, (pageWidth - contactWidth) / 2, currentY + 110);
    }

    currentY += 140;

    // -----------------------------
    // CUSTOMER & INVOICE DETAILS
    // -----------------------------
    const detailsY = currentY;
    const leftSectionWidth = (contentWidth * 0.6) - 5;
    const rightSectionWidth = (contentWidth * 0.4) - 5;
    
    // Bill To Section
    drawBorderedRect(margin, detailsY, leftSectionWidth, 130);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 152, 219);
    doc.text("BILL TO", margin + 10, detailsY + 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${gstSettings.billToParty || carDetails.customerName}`, margin + 10, detailsY + 40);
    doc.text(`Contact: ${carDetails.contact}`, margin + 10, detailsY + 55);
    if (carDetails.email) doc.text(`Email: ${carDetails.email}`, margin + 10, detailsY + 70);
    if (gstSettings.customerGstNumber && gstSettings.billType === 'gst') {
      doc.text(`GST No: ${gstSettings.customerGstNumber}`, margin + 10, detailsY + 85);
    }
    
    // Vehicle Details
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 152, 219);
    doc.text("VEHICLE DETAILS", margin + 10, detailsY + 105);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`${carDetails.company} ${carDetails.model} | Reg: ${carDetails.carNumber}`, margin + 10, detailsY + 120);

    // Invoice Details
    drawBorderedRect(margin + leftSectionWidth + 10, detailsY, rightSectionWidth, 130, 'lightgray');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 152, 219);
    doc.text("SHIP", margin + leftSectionWidth + 20, detailsY + 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${carDetails.invoiceNo}`, margin + leftSectionWidth + 20, detailsY + 40);
    doc.text(`Job Card No: ${jobCardData?.jobCardNumber || 'N/A'}`, margin + leftSectionWidth + 20, detailsY + 55);
    doc.text(`Date: ${carDetails.billingDate}`, margin + leftSectionWidth + 20, detailsY + 70);
    if (jobCardData?.insuranceProvider) {
      doc.text(`Insurance: ${jobCardData.insuranceProvider}`, margin + leftSectionWidth + 20, detailsY + 85);
    }
    
    currentY = detailsY + 150;

    // -----------------------------
    // ITEMS TABLE
    // -----------------------------
    const tableStartY = currentY;
    const colWidths = gstSettings.billType === 'gst' 
      ? { 
          srNo: 35, 
          productName: 240,
          hsnCode: 60,  
          qty: 40, 
          rate: 70, 
          amount: 80 
        }
      : { 
          srNo: 35, 
          productName: 240, 
          hsnCode: 60, 
          qty: 40, 
          rate: 70, 
          amount: 80 
        };
    const totalTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
    
    // Table Header
    const headerY = tableStartY;
    drawBorderedRect(margin, headerY, totalTableWidth, 35, 'darkblue');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    
    let colX = margin;
    const headers = ["Sr.", "Product/Service Description", "HSN Code", "Qty", "Rate", "Amount"];
    headers.forEach((text, i) => {
      const w = colWidths[Object.keys(colWidths)[i]];
      const txtW = doc.getTextWidth(text);
      if (i === 1) {
        doc.text(text, colX + 5, headerY + 22);
      } else {
        doc.text(text, colX + (w - txtW) / 2, headerY + 22);
      }
      if (i < 6) {
        doc.setDrawColor(255, 255, 255);
        doc.line(colX + w, headerY, colX + w, headerY + 35);
      }
      colX += w;
    });
    
    doc.setTextColor(0, 0, 0);
    currentY = headerY + 35;

    // Table row drawing function
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let rowIndex = 1;
    
    const drawTableRow = (rowData, y, isAlternate = false) => {
      const rowHeight = 30;
      const bgColor = isAlternate ? 'lightgray' : null;
      drawBorderedRect(margin, y, totalTableWidth, rowHeight, bgColor);
      
      colX = margin;
      rowData.forEach((cell, i) => {
        const w = colWidths[Object.keys(colWidths)[i]];
        let display = cell.toString();
        
        // Format currency properly - use proper rupee symbol
        const isCurrencyColumn = (i === 4 || i === 5); // Rate and Amount columns
          
        if (isCurrencyColumn) {
          if (display !== '' && !isNaN(display)) {
            display = ' ' + parseFloat(display).toFixed(2);
          }
        }
        
        // Handle long text in product name
        if (i === 1 && display.length > 30) {
          const lines = doc.splitTextToSize(display, w - 10);
          doc.text(lines[0], colX + 5, y + 20);
          if (lines.length > 1) {
            doc.setFontSize(8);
            doc.text(lines[1].substring(0, 25) + '...', colX + 5, y + 28);
            doc.setFontSize(9);
          }
        } else {
          const txtW = doc.getTextWidth(display);
          
          // Right align for Sr.No, Qty, Rate, Amount columns
          if (i === 0 || i === 3 || i === 4 || i === 5) {
            doc.text(display, colX + w - txtW - 5, y + 20);
          } 
          // Center align for HSN Code column  
          else if (i === 2) {
            doc.text(display, colX + (w - txtW) / 2, y + 20);
          }
          // Left align for Product Name
          else {
            doc.text(display, colX + 5, y + 20);
          }
        }
        
        if (i < 6) {
          doc.setDrawColor(220, 220, 220);
          doc.line(colX + w, y, colX + w, y + rowHeight);
        }
        colX += w;
      });
      return rowHeight;
    };

    // Add only valid parts rows
    validParts.forEach((part, index) => {
      checkPageBreak(35);
      
      // Parts are never taxed - match BillSummarySection logic
      const amount = part.pricePerUnit * part.quantity;
      
      const row = [
        rowIndex++,
        part.name,
        part.hsnNumber || 'N/A',
        part.quantity,
        amount.toFixed(2),
        amount.toFixed(2)
      ];
      
      currentY += drawTableRow(row, currentY, index % 2 === 1);
    });

    // Add Labor & Services Row if exists
    console.log('Adding Labor & Services row, laborTotal:', laborTotal);
    
    // Always add Labor & Services row if there's any labor data (even 0.01)
    if (laborTotal && laborTotal > 0) {
      checkPageBreak(35);
      
      // Labor services - match BillSummarySection logic
      const row = [
        rowIndex++,
        "Labor & Services",
        "-", // Default HSN for services
        "-",
        laborTotal.toFixed(2),
        laborTotal.toFixed(2)
      ];
      
      console.log('Labor & Services row data:', row);
      currentY += drawTableRow(row, currentY, validParts.length % 2 === 0);
    } else {
      console.log('No labor total found, skipping Labor & Services row. laborTotal:', laborTotal);
      console.log('Available data sources:', {
        jobCardDataLaborServicesTotal: jobCardData?.laborServicesTotal,
        laborServicesTotal: laborServicesTotal,
        jobCardDataLaborServices: jobCardData?.laborServices
      });
    }

    // Add empty rows only if needed (minimum 5 rows total)
    const totalDataRows = validParts.length + (laborTotal > 0 ? 1 : 0);
    const minRows = Math.max(5, totalDataRows);
    for (let i = totalDataRows; i < minRows; i++) {
      const emptyRow = gstSettings.billType === 'gst' 
        ? ["", "", "", "", "", ""] // GST: 6 columns
        : ["", "", "", "", "", ""]; // Non-GST: 6 columns
      currentY += drawTableRow(emptyRow, currentY, i % 2 === 1);
    }

    currentY += 20;

    // -----------------------------
    // BILLING SUMMARY
    // -----------------------------
    checkPageBreak(300);
    
    const summaryWidth = 250;
    const summaryX = pageWidth - margin - summaryWidth;
    
    // Summary Header
    drawBorderedRect(summaryX, currentY, summaryWidth, 30, 'darkblue');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("BILLING SUMMARY", summaryX + 10, currentY + 20);
    currentY += 30;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    // 💰 Cost Breakdown - match BillSummarySection exactly
    drawBorderedRect(summaryX, currentY, summaryWidth, 25);
    doc.setFont("helvetica", "normal");
    doc.text("Parts:", summaryX + 10, currentY + 17);
    doc.setFont("helvetica", "bold");
    doc.text(` ${partsSubtotal.toFixed(2)}`, summaryX + summaryWidth - 90, currentY + 17);
    currentY += 25;
    
    // Labour
    if (laborTotal > 0) {
      drawBorderedRect(summaryX, currentY, summaryWidth, 25, 'lightgray');
      doc.setFont("helvetica", "normal");
      doc.text("Labour:", summaryX + 10, currentY + 17);
      doc.setFont("helvetica", "bold");
      doc.text(` ${laborTotal.toFixed(2)}`, summaryX + summaryWidth - 90, currentY + 17);
      currentY += 25;
    }

    // Labour GST (only if GST is applied)
    if (shouldApplyGst && laborGstAmount > 0) {
      drawBorderedRect(summaryX, currentY, summaryWidth, 25);
      doc.setFont("helvetica", "normal");
      doc.text("Labour GST:", summaryX + 10, currentY + 17);
      doc.setFont("helvetica", "bold");
      doc.text(` ${laborGstAmount.toFixed(2)}`, summaryX + summaryWidth - 90, currentY + 17);
      currentY += 25;
    }

    // Subtotal
    drawBorderedRect(summaryX, currentY, summaryWidth, 25);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", summaryX + 10, currentY + 17);
    doc.setFont("helvetica", "bold");
    doc.text(` ${(totalBeforeTax + totalGstAmount).toFixed(2)}`, summaryX + summaryWidth - 90, currentY + 17);
    currentY += 25;

    // Total GST (only if GST is applied)
    if (shouldApplyGst && totalGstAmount > 0) {
      drawBorderedRect(summaryX, currentY, summaryWidth, 25);
      doc.setFont("helvetica", "normal");
      doc.text("Total GST:", summaryX + 10, currentY + 17);
      doc.setFont("helvetica", "bold");
      doc.text(` ${totalGstAmount.toFixed(2)}`, summaryX + summaryWidth - 90, currentY + 17);
      currentY += 25;
    }
    


    // Discount (only if discount exists)
    if (summary.discount > 0) {
      drawBorderedRect(summaryX, currentY, summaryWidth, 25);
      doc.setFont("helvetica", "normal");
      doc.text("Discount:", summaryX + 10, currentY + 17);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(39, 174, 96); // Green color for discount
      doc.text(`-${summary.discount.toFixed(2)}`, summaryX + summaryWidth - 90, currentY + 17);
      doc.setTextColor(0, 0, 0);
      currentY += 25;
    }

    // Grand Total - match BillSummarySection exactly
    drawBorderedRect(summaryX, currentY, summaryWidth, 35, 'green');
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    
    // Show appropriate title based on GST setting
    const totalTitle = shouldApplyGst ? 'GRAND TOTAL' : 'GRAND TOTAL';
    doc.text(totalTitle, summaryX + 10, currentY + 23);
    doc.text(` ${finalAmount.toFixed(2)}`, summaryX + summaryWidth - 120, currentY + 23);
    currentY += 50;

    // Quality Check Section
    if (jobCardData?.qualityCheck) {
      checkPageBreak(100);
      const qualityCheckY = currentY;
      
      // Quality Check Header
      drawBorderedRect(margin, qualityCheckY, contentWidth, 30, 'darkblue');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text("QUALITY CHECK DETAILS", margin + 10, qualityCheckY + 20);
      currentY += 30;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      // Quality Check Notes
      if (jobCardData.qualityCheck.notes) {
        drawBorderedRect(margin, currentY, contentWidth, 30, 'lightgray');
        doc.setFont("helvetica", "normal");
        doc.text("Notes:", margin + 10, currentY + 17);
        doc.setFont("helvetica", "bold");
        doc.text(jobCardData.qualityCheck.notes, margin + 50, currentY + 17);
        currentY += 30;
      }
      
      // Quality Check Date
      if (jobCardData.qualityCheck.date) {
        drawBorderedRect(margin, currentY, contentWidth, 30, 'lightgray');
        doc.setFont("helvetica", "normal");
        doc.text("Date:", margin + 10, currentY + 17);
        doc.setFont("helvetica", "bold");
        const qualityDate = new Date(jobCardData.qualityCheck.date).toLocaleDateString();
        doc.text(qualityDate, margin + 50, currentY + 17);
        currentY += 30;
      }
      
      // Bill Approval Status
      drawBorderedRect(margin, currentY, contentWidth, 30, 'lightgray');
      doc.setFont("helvetica", "normal");
      doc.text("Bill Approved:", margin + 10, currentY + 17);
      doc.setFont("helvetica", "bold");
      const approvalStatus = jobCardData.qualityCheck.billApproved ? "YES" : "NO";
      const approvalColor = jobCardData.qualityCheck.billApproved ? [39, 174, 96] : [231, 76, 60];
      doc.setTextColor(...approvalColor);
      doc.text(approvalStatus, margin + 100, currentY + 17);
      doc.setTextColor(0, 0, 0);
      currentY += 30;
    }

    // Amount in Words
    doc.setTextColor(0, 0, 0);
    const amountInWords = numberToWords(Math.round(finalAmount)) + " Rupees Only";
    drawBorderedRect(margin, currentY, contentWidth, 35, 'lightgreen');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Amount in Words:", margin + 10, currentY + 15);
    doc.setFont("helvetica", "normal");
    doc.text(amountInWords, margin + 10, currentY + 28);
    currentY += 50;

    // -----------------------------
    // FOOTER SECTION
    // -----------------------------
    checkPageBreak(150);
    
    if (garageDetails.bankDetails.bankName) {
      const footerY = currentY;
      
      // Bank Details
      drawBorderedRect(margin, footerY, contentWidth / 2, 120, 'lightgray');
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 152, 219);
      doc.text("BANK DETAILS", margin + 10, footerY + 20);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Bank: ${garageDetails.bankDetails.bankName}`, margin + 10, footerY + 35);
      doc.text(`A/c Holder: ${garageDetails.bankDetails.accountHolderName}`, margin + 10, footerY + 50);
      doc.text(`A/c No: ${garageDetails.bankDetails.accountNumber}`, margin + 10, footerY + 65);
      doc.text(`IFSC: ${garageDetails.bankDetails.ifscCode}`, margin + 10, footerY + 80);
      if (garageDetails.bankDetails.upiId) {
        doc.text(`UPI: ${garageDetails.bankDetails.upiId}`, margin + 10, footerY + 95);
      }

      // Terms & Conditions
      const termsX = margin + (contentWidth / 2) + 10;
      drawBorderedRect(termsX, footerY, contentWidth / 2 - 10, 120, 'lightgray');
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 152, 219);
      doc.text("TERMS & CONDITIONS", termsX + 10, footerY + 20);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("1. Goods once sold will not be taken back.", termsX + 10, footerY + 35);
      doc.text("2. Our risk ceases as goods leave premises.", termsX + 10, footerY + 47);
      doc.text("3. Subject to local jurisdiction only.", termsX + 10, footerY + 59);
      doc.text("4. Payment terms: As agreed", termsX + 10, footerY + 71);
      doc.text("5. E. & O.E.", termsX + 10, footerY + 83);
      if (gstSettings.billType === 'gst') {
        doc.text("6. GST as applicable.", termsX + 10, footerY + 95);
      }
      
      currentY += 140;
    }

    // Signature Section
    checkPageBreak(80);
    doc.setFont("helvetica", "bold");
    doc.text("For " + garageDetails.name.toUpperCase(), pageWidth - margin - 120, currentY + 60);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", pageWidth - margin - 120, currentY + 75);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 30);
    doc.text(`Bill Type: ${gstSettings.billType.toUpperCase()} | Page 1`, pageWidth - margin - 100, pageHeight - 30);

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

  // UPDATED: WhatsApp function with PDF attachment and fallback
 const sendBillViaWhatsApp = async () => {
  try {
    setSendingWhatsApp(true);
    
    // Generate PDF
    const doc = generateProfessionalGSTInvoice();
    const pdfBlob = doc.output('blob');
    
    // Try to send via API first
    try {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `Invoice_${carDetails.invoiceNo}.pdf`);
      formData.append('phone', carDetails.contact);
      formData.append('message', `🚗 *${gstSettings.billType.toUpperCase()} INVOICE*\n*${garageDetails.name}*\n\nInvoice #${carDetails.invoiceNo}\nTotal: ₹${summary.totalAmount}\n\nPlease find your invoice attached.`);
      formData.append('garageId', localStorage.getItem('garageId'));
      
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/send-invoice-whatsapp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Invoice sent via WhatsApp successfully!",
          severity: "success"
        });
        return;
      }
    } catch (apiError) {
      console.log('API not available, using fallback method');
    }
    
    // Fallback: Download PDF and send text message
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${carDetails.invoiceNo}.pdf`;
    link.click();
    
    // Send WhatsApp text message with invoice details
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

📄 PDF invoice has been downloaded. Please share it manually.

Thank you!`;

    const phone = `91${carDetails.contact.replace(/\D/g, '')}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    
    setSnackbar({
      open: true,
      message: "PDF downloaded! WhatsApp message opened. Please share the PDF manually.",
      severity: "info"
    });
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    setSnackbar({
      open: true,
      message: "Failed to send WhatsApp message. Please try again.",
      severity: "error"
    });
  } finally {
    setSendingWhatsApp(false);
  }
 };

  const openEmailDialog = () => setShowEmailDialog(true);

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
        sendBillViaEmail={sendBillViaEmail} 
        carDetails={carDetails} 
      />
      
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