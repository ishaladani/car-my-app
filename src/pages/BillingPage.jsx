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
import ServicesSection from "../components/ServicesSection";
import FinalInspectionSection from "../components/FinalInspectionSection";
import BillSummarySection from "../components/BillSummarySection";
import ThankYouSection from "../components/ThankYouSection";
import PaymentMethodDialog from "../components/PaymentMethodDialog";
import ProcessingPaymentDialog from "../components/ProcessingPaymentDialog";
import EmailDialog from "../components/EmailDialog";    
import EditPriceDialog from "../components/EditPriceDialog";
import AddPartDialog from "../components/AddPartDialog";
import AddServiceDialog from "../components/AddServiceDialog";
import SnackbarAlert from "../components/SnackbarAlert";

const AutoServeBilling = () => {
  const { id: jobCardIdFromUrl } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  let garageId = localStorage.getItem("garageId") || localStorage.getItem("garage_id");
  
  const today = new Date().toISOString().split("T")[0];

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
  const [services, setServices] = useState([]);

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

  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    engineer: "",
    laborCost: 0,
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
        console.log('Bill status updated successfully');
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
        console.log(`🔍 Fetching job card data for ID: ${jobCardIdFromUrl}`);
        
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${jobCardIdFromUrl}`
        );
        
        const data = response.data;
        console.log('📊 Job card data received:', data);
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
          console.log('🔧 Parts processed:', apiParts);
          setParts(apiParts);
        } else {
          // UPDATED: Add default service if no parts or services found
          setParts([]);
        }

        // Enhanced services processing
        let apiServices = [];

        if (data.services?.length > 0) {
          apiServices = data.services.map((service, index) => ({
            id: index + 1,
            name: service.serviceName || service.name || '',
            engineer: service.engineer || service.engineerName || 
                     (data.engineerId?.length > 0 ? data.engineerId[0].name : null) ||
                     data.engineerId?.name || 'Assigned Engineer',
            progress: service.progress || 100,
            status: service.status || 'Completed',
            laborCost: parseFloat(service.laborCost) || 0
          }));
        }

        if (apiServices.length === 0 && data.jobDetails) {
          try {
            const jobDetailsArray = JSON.parse(data.jobDetails);
            
            if (Array.isArray(jobDetailsArray) && jobDetailsArray.length > 0) {
              apiServices = jobDetailsArray.map((job, index) => ({
                id: index + 1,
                name: job.description || `Service ${index + 1}`,
                engineer: (data.engineerId?.length > 0 ? data.engineerId[0].name : null) ||
                         data.engineerId?.name || 'Assigned Engineer',
                progress: 100,
                status: 'Completed',
                laborCost: parseFloat(job.price) || 0
              }));
            }
          } catch (error) {
            console.error('Error parsing jobDetails:', error);
            apiServices = [{
              id: 1,
              name: 'Service Details (Parsing Error)',
              engineer: (data.engineerId?.length > 0 ? data.engineerId[0].name : null) ||
                       data.engineerId?.name || 'Assigned Engineer',
              progress: 100,
              status: 'Completed',
              laborCost: parseFloat(data.laborHours) * 500 || 0
            }];
          }
        }

        if (apiServices.length === 0 && data.laborHours) {
          apiServices = [{
            id: 1,
            name: 'General Service',
            engineer: (data.engineerId?.length > 0 ? data.engineerId[0].name : null) ||
                     data.engineerId?.name || 'Assigned Engineer',
            progress: 100,
            status: 'Completed',
            laborCost: parseFloat(data.laborHours) * 500 || 0
          }];
        }

        // UPDATED: Add default service if no parts or services found
        if (apiServices.length === 0 && parts.length === 0) {
          apiServices = [{
            id: 1,
            name: 'Vehicle Inspection & General Service',
            engineer: (data.engineerId?.length > 0 ? data.engineerId[0].name : null) ||
                     data.engineerId?.name || 'Service Engineer',
            progress: 100,
            status: 'Completed',
            laborCost: 500 // Default service charge
          }];
          console.log('⚙️ Added default service');
        }

        console.log('⚙️ Services processed:', apiServices);
        setServices(apiServices);

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
          inspectionNotes = `Vehicle inspected on ${today}. All work completed satisfactorily. Vehicle is ready for delivery.`;
          console.log('📝 Added default inspection notes');
        }
        setFinalInspection(inspectionNotes);

        // Set email recipient
        if (data.email || data.customer?.email) {
          setEmailRecipient(data.email || data.customer?.email);
        }

        console.log('✅ Job card data processing completed');

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
    const totalPartsCost = parts.reduce((sum, part) => sum + (part.total || 0), 0);
    const totalLaborCost = services.reduce(
      (sum, service) => sum + (service.laborCost || 0),
      0
    );
    const subtotal = totalPartsCost + totalLaborCost;
    const discount = summary.discount || 0;
    
    let gstAmount = 0;
    let totalAmount = subtotal - discount;
    
    if (gstSettings.includeGst && gstSettings.billType === 'gst') {
      if (gstSettings.gstType === 'percentage') {
        gstAmount = Math.round(subtotal * (gstSettings.gstPercentage / 100));
      } else {
        gstAmount = gstSettings.gstAmount || 0;
      }
      totalAmount = subtotal + gstAmount - discount;
    }

    setSummary({
      totalPartsCost,
      totalLaborCost,
      subtotal,
      gstAmount,
      discount,
      totalAmount,
    });
  };

  useEffect(() => {
    calculateTotals();
  }, [parts, services, summary.discount, gstSettings]);

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

  const removePart = (id) => {
    setParts(prev => prev.filter(part => part.id !== id));
  };

  const removeService = (id) => {
    setServices(prev => prev.filter(service => service.id !== id));
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

  // Function to update bill and job status
 const updateBillAndJobStatus = async (jobCardId) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('No authentication token found');
    setSnackbar({
      open: true,
      message: 'Authentication failed. Please log in again.',
      severity: 'error'
    });
    return;
  }

  try {
    // Headers with Authorization
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    // Update bill status
    const billStatusResponse = await axios.put(
      `https://garage-management-zi5z.onrender.com/api/jobcards/updatebillstatus/${jobCardId}`,
      {}, // Empty body if backend doesn't expect data
      config
    );

    if (billStatusResponse.status === 200) {
      console.log('✅ Bill status updated successfully');
      setBillGenerated(true);

      // Update job card status to Completed
      const statusUpdateResponse = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/jobcards/updatestatus/${jobCardId}`,
        { status: 'Completed' },
         {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (statusUpdateResponse.status === 200) {
        console.log('✅ Job card status updated to Completed');
        if (jobCardData) {
          setJobCardData(prev => ({ ...prev, status: 'Completed' }));
        }
      }
    }
  } catch (error) {
    console.error('❌ Error updating bill and job status:', error);

    // Handle specific error cases
    if (error.response) {
      const errorMsg = error.response.data.message || 'Unknown error';
      // setSnackbar({
      //   open: true,
      //   message: `Update failed: ${errorMsg}`,
      //   severity: 'error'
      // });
    } else if (error.request) {
      setSnackbar({
        open: true,
        message: 'No response from server. Check your network.',
        severity: 'error'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Request error: ' + error.message,
        severity: 'error'
      });
    }
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

    console.log('🔍 Testing API endpoints...');
    
    for (const endpoint of endpointsToTest) {
      try {
        // Try a simple GET request first to see if endpoint exists
        const response = await axios.get(endpoint.replace('generate', 'test').replace('create', 'test'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 5000
        });
        console.log(`✅ ${endpoint} - Responded with status: ${response.status}`);
      } catch (error) {
        if (error.response) {
          console.log(`❓ ${endpoint} - Status: ${error.response.status} (${error.response.status === 404 ? 'Not Found' : 'Other Error'})`);
        } else {
          console.log(`❌ ${endpoint} - Network error: ${error.message}`);
        }
      }
    }

    // Test basic API connectivity
    try {
      const healthCheck = await axios.get('https://garage-management-zi5z.onrender.com/api/health', {
        timeout: 5000
      });
      console.log('✅ API Server is reachable');
    } catch (error) {
      console.log('❌ API Server connectivity issue');
    }
  };

  // UPDATED: Enhanced status validation function with better logic
  const validateJobCompletion = () => {
    const issues = [];
    
    // UPDATED: More flexible parts/services validation
    const hasPartsOrServices = parts.length > 0 || services.length > 0;
    const totalAmount = summary.totalAmount || 0;
    
    if (!hasPartsOrServices && totalAmount === 0) {
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
      const defaultInspection = `Vehicle inspected on ${today}. All work completed satisfactorily. Vehicle is ready for delivery.`;
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

  // UPDATED: Generate bill function with enhanced validation
const generateBill = () => {
  if (isBillAlreadyGenerated || billGenerated) {
    setSnackbar({
      open: true,
      message: 'Bill has already been generated for this job card',
      severity: 'warning'
    });
    return;
  }

  const validation = validateJobCompletion();
  if (!validation.isValid) {
    setSnackbar({
      open: true,
      message: `Please complete: ${validation.issues.join(', ')}`,
      severity: 'error'
    });
    return;
  }

  // ✅ Use the correct jobCardIdFromUrl and include auth token
  const token = localStorage.getItem('token');
  if (!token) {
    setSnackbar({
      open: true,
      message: 'Authentication token not found. Please log in again.',
      severity: 'error'
    });
    return;
  }

  fetch(`https://garage-management-zi5z.onrender.com/api/jobcards/${jobCardIdFromUrl}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      generateBill: true, 
      status: "Completed" 
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Bill generation response:', data);
    
    if (data.success || data.message?.includes('updated')) {
      // ✅ Update local state
      setBillGenerated(true);
      setIsBillAlreadyGenerated(true);

      // ✅ Show payment modal
      setShowPaymentModal(true);

      setSnackbar({
        open: true,
        message: 'Bill generated successfully! Proceed with payment.',
        severity: 'success'
      });
    } else {
      throw new Error(data.message || 'Bill generation failed');
    }
  })
  .catch(error => {
    console.error('Error generating bill:', error);
    setSnackbar({
      open: true,
      message: `Failed to generate bill: ${error.message}`,
      severity: 'error'
    });
  });
};


  // Function to ensure minimum bill requirements
  const ensureMinimumBillRequirements = () => {
    let updated = false;
    
    // Ensure final inspection exists
    if (!finalInspection.trim()) {
      const defaultInspection = `Vehicle ${carDetails.carNumber} inspected on ${today}. All work completed satisfactorily. Vehicle is ready for delivery.`;
      setFinalInspection(defaultInspection);
      updated = true;
    }
    
    // Ensure bill to party exists
    if (!gstSettings.billToParty.trim() && carDetails.customerName.trim()) {
      setGstSettings(prev => ({ ...prev, billToParty: carDetails.customerName }));
      updated = true;
    }
    
    // Ensure at least one service exists
    if (parts.length === 0 && services.length === 0) {
      const defaultService = {
        id: Date.now(),
        name: 'Vehicle Inspection & General Service',
        engineer: 'Service Engineer',
        progress: 100,
        status: 'Completed',
        laborCost: 500
      };
      setServices([defaultService]);
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
      services: services.map(service => ({
        serviceName: service.name,
        laborCost: service.laborCost,
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
        console.log(`Trying endpoint: ${endpoint}`);
        
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
            message: data.message || "Professional bill generated and payment processed successfully! Job completed.",
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
        services: services.map(service => ({
          serviceName: service.name,
          laborCost: service.laborCost,
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
          console.log(`Trying bill generation endpoint: ${endpoint}`);
          
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
              message: paymentResponse.data?.message || "Online payment processed successfully! Job completed.",
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
          services: services.map(service => ({
            serviceName: service.name,
            laborCost: service.laborCost,
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
  const saveEditedPrice = () => {
    const { id, type, field, value } = editItem;
    const newValue = parseFloat(value);

    if (type === "part") {
      setParts(prev => prev.map(part => 
        part.id === id 
          ? { ...part, [field]: newValue, total: field === 'pricePerUnit' ? part.quantity * newValue : part.total } 
          : part
      ));
    } else if (type === "service") {
      setServices(prev => prev.map(service => 
        service.id === id ? { ...service, [field]: newValue } : service
      ));
    }

    setShowEditPriceDialog(false);
  };

  // UPDATED: Add new part with HSN number
  const addNewPart = () => {
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

      setParts(prev => [...prev, newPartObj]);
      setNewPart({ name: "", quantity: 1, pricePerUnit: 0, hsnNumber: "" });
      setShowNewPartDialog(false);
    }
  };

  const addNewService = () => {
    const { name, engineer, laborCost } = newService;
    if (name && engineer && laborCost > 0) {
      const newServiceObj = {
        id: Date.now(),
        name,
        engineer,
        progress: 100,
        status: "Completed",
        laborCost: parseFloat(laborCost),
      };

      setServices(prev => [...prev, newServiceObj]);
      setNewService({ name: "", engineer: "", laborCost: 0 });
      setShowNewServiceDialog(false);
    }
  };

  // UPDATED: Professional GST PDF generation with bank details
  const generateProfessionalGSTInvoice = () => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 30;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = 40;

      // Helper functions remain the same...
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
          if (num % 10 !== 0) {
            words += ' ' + ones[num % 10];
          }
        } else if (num >= 10) {
          words += teens[num - 10];
        } else if (num > 0) {
          words += ones[num];
        }
        
        return words.trim();
      };

      const drawBorderedRect = (x, y, width, height, fillColor = null) => {
        if (fillColor) {
          doc.setFillColor(fillColor);
          doc.rect(x, y, width, height, 'F');
        }
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.rect(x, y, width, height);
      };

      // Header Section
      drawBorderedRect(margin, currentY, contentWidth, 80);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      // After doc.setFontSize(16); add:
if (garageDetails.logoUrl) {
  const logoImg = new Image();
  logoImg.src = garageDetails.logoUrl;
  doc.addImage(logoImg, 'PNG', margin + 10, currentY + 10, 50, 50); // Adjust size/position
}

// Move company name to right of logo
const companyName = garageDetails.name.toUpperCase();
const nameX = margin + 70; // After logo
doc.text(companyName, nameX, currentY + 25);
  
doc.setFontSize(9);
doc.setFont("helvetica", "normal");

if (garageDetails.phone) {
  const phoneLine = `Phone: ${garageDetails.phone}`;
  const phoneWidth = doc.getTextWidth(phoneLine);
  doc.text(phoneLine, (pageWidth - phoneWidth) / 2, currentY + 80);
}

if (garageDetails.email) {
  const emailLine = `Email: ${garageDetails.email}`;
  const emailWidth = doc.getTextWidth(emailLine);
  doc.text(emailLine, (pageWidth - emailWidth) / 2, currentY + 95);
}

      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const addressLine = `${garageDetails.address}`;
      const addressWidth = doc.getTextWidth(addressLine);
      doc.text(addressLine, (pageWidth - addressWidth) / 2, currentY + 45);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const gstLine = `GST No: ${garageDetails.gstNumber || 'N/A'}`;
      const gstWidth = doc.getTextWidth(gstLine);
      doc.text(gstLine, (pageWidth - gstWidth) / 2, currentY + 65);
      
      currentY += 100;

      // Bill Type Section
      const billTypeText = gstSettings.billType === 'gst' ? 'GST Tax Invoice' : 'Non-GST Invoice';
      const docTypeY = currentY;
      drawBorderedRect(margin, docTypeY, 120, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(billTypeText, margin + 10, docTypeY + 17);
      
      drawBorderedRect(pageWidth - margin - 80, docTypeY, 80, 25);
      doc.text("Original", pageWidth - margin - 70, docTypeY + 17);
      
      currentY += 35;

      // Bill To and Ship To Section
      const billShipY = currentY;
      const billToWidth = contentWidth / 2 - 5;
      
      // Bill To Section
      drawBorderedRect(margin, billShipY, billToWidth, 120);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Bill to:", margin + 10, billShipY + 20);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${gstSettings.billToParty || carDetails.customerName}`, margin + 10, billShipY + 40);
      doc.text(`Contact: ${carDetails.contact}`, margin + 10, billShipY + 55);
      if (carDetails.email) {
        doc.text(`Email: ${carDetails.email}`, margin + 10, billShipY + 70);
      }
      if (gstSettings.customerGstNumber && gstSettings.billType === 'gst') {
        doc.text(`GST No: ${gstSettings.customerGstNumber}`, margin + 10, billShipY + 85);
      }
      
      // Ship To Section
      const shipToWidth = contentWidth / 2 - 5;
      drawBorderedRect(margin + billToWidth + 10, billShipY, shipToWidth, 120);
      doc.setFont("helvetica", "bold");
      doc.text("Ship To / Insurance:", margin + billToWidth + 20, billShipY + 20);
      doc.setFont("helvetica", "normal");
      doc.text(`Insurance Compny: ${gstSettings.insuranceProvider}`, margin + billToWidth + 20, billShipY + 40);
      doc.text(`Vehicle: ${carDetails.company} ${carDetails.model}`, margin + billToWidth + 20, billShipY + 55);
      doc.text(`Reg No: ${carDetails.carNumber}`, margin + billToWidth + 20, billShipY + 70);
      
      const invoiceDetailsX = margin + billToWidth + 20;
      doc.setFontSize(9);
      doc.text(`Invoice No: ${carDetails.invoiceNo}`, invoiceDetailsX, billShipY + 100);
      doc.text(`Date: ${carDetails.billingDate}`, invoiceDetailsX, billShipY + 115);
      
      currentY = billShipY + 140;

      // Items Table
      const tableStartY = currentY;
      const colWidths = {
        srNo: 40,
        productName: 180,
        hsnSac: 60,
        qty: 35,
        unit: 40,
        rate: 70,
        gstPercent: 50,
        amount: 70
      };
      
      const totalTableWidth = Object.values(colWidths).reduce((sum, width) => sum + width, 0);
      
      // Table header
      let headerY = tableStartY;
      drawBorderedRect(margin, headerY, totalTableWidth, 30, '#f0f0f0');
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      
      let colX = margin;
      const headers = ["Sr.No", "Product/Service Name", "HSN/SAC", "Qty", "Unit", "Rate", "GST%", "Amount"];
      const columnKeys = Object.keys(colWidths);
      
      headers.forEach((header, index) => {
        const colWidth = colWidths[columnKeys[index]];
        const textWidth = doc.getTextWidth(header);
        const textX = colX + (colWidth - textWidth) / 2;
        doc.text(header, textX, headerY + 20);
        
        if (index < headers.length - 1) {
          doc.line(colX + colWidth, headerY, colX + colWidth, headerY + 30);
        }
        colX += colWidth;
      });

      currentY = headerY + 30;

      // Table rows
      doc.setFont("helvetica", "normal");
      let rowIndex = 1;
      
      const drawTableRow = (rowData, rowY) => {
        const rowHeight = 25;
        drawBorderedRect(margin, rowY, totalTableWidth, rowHeight);
        
        colX = margin;
        rowData.forEach((cellData, index) => {
          const colWidth = colWidths[columnKeys[index]];
          let displayText = cellData.toString();
          
          if (index === 1 && displayText.length > 20) {
            displayText = displayText.substring(0, 18) + "...";
          }
          
          if (index === 0 || index >= 3) {
            const textWidth = doc.getTextWidth(displayText);
            doc.text(displayText, colX + colWidth - textWidth - 5, rowY + 17);
          } else {
            doc.text(displayText, colX + 5, rowY + 17);
          }
          
          if (index < rowData.length - 1) {
            doc.line(colX + colWidth, rowY, colX + colWidth, rowY + rowHeight);
          }
          colX += colWidth;
        });
        
        return rowHeight;
      };
      
      // Parts rows
     // Inside table rows loop
if (parts.length > 0) {
  parts.forEach((part) => {
    const gstDisplay = gstSettings.billType === 'gst' ? `${gstSettings.gstPercentage}%` : '0%';
    const rowData = [
      rowIndex.toString(),
      part.name,
      part.hsnNumber || "8708",
      part.quantity.toString(),
      "Nos",
      part.pricePerUnit.toFixed(2),
      gstDisplay,
      part.total.toFixed(2)
    ];
    const rowHeight = drawTableRow(rowData, currentY);
    currentY += rowHeight;
    rowIndex++;
  });
}

// For services, show HSN as blank or "9954" but hide in UI?
// If you want to hide HSN column for services, skip it in display

      // Services rows
      if (services.length > 0) {
        services.forEach((service) => {
          const gstDisplay = gstSettings.billType === 'gst' ? `${gstSettings.gstPercentage}%` : '0%';
          const rowData = [
            rowIndex.toString(),
            service.name,
            "9954",
            "1",
            "Nos",
            service.laborCost.toFixed(2),
            gstDisplay,
            service.laborCost.toFixed(2)
          ];
          
          const rowHeight = drawTableRow(rowData, currentY);
          currentY += rowHeight;
          rowIndex++;
        });
      }

      // Empty rows
      const minRows = 8;
      const currentRows = parts.length + services.length;
      if (currentRows < minRows) {
        for (let i = currentRows; i < minRows; i++) {
          const emptyRowData = ["", "", "", "", "", "", "", ""];
          const rowHeight = drawTableRow(emptyRowData, currentY);
          currentY += rowHeight;
        }
      }

      currentY += 10;

      // Summary Section
      const summaryWidth = 200;
      const summaryX = pageWidth - margin - summaryWidth;
      
      // Sub Total
      drawBorderedRect(summaryX, currentY, summaryWidth, 25);
      doc.setFont("helvetica", "bold");
      doc.text("Sub Total", summaryX + 10, currentY + 17);
      doc.text(summary.subtotal.toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
      currentY += 25;
      
      // Taxable Amount
      drawBorderedRect(summaryX, currentY, summaryWidth, 25);
      doc.text("Taxable Amount", summaryX + 10, currentY + 17);
      doc.text(summary.subtotal.toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
      currentY += 25;

      // GST Details (only if GST bill type)
      if (gstSettings.billType === 'gst' && summary.gstAmount > 0) {
        if (gstSettings.isInterState) {
          drawBorderedRect(summaryX, currentY, summaryWidth, 25);
          doc.text(`IGST ${gstSettings.gstPercentage}%`, summaryX + 10, currentY + 17);
          doc.text(summary.gstAmount.toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
          currentY += 25;
        } else {
          drawBorderedRect(summaryX, currentY, summaryWidth, 25);
          doc.text(`CGST ${gstSettings.cgstPercentage}%`, summaryX + 10, currentY + 17);
          doc.text((summary.gstAmount / 2).toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
          currentY += 25;
          
          drawBorderedRect(summaryX, currentY, summaryWidth, 25);
          doc.text(`SGST ${gstSettings.sgstPercentage}%`, summaryX + 10, currentY + 17);
          doc.text((summary.gstAmount / 2).toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
          currentY += 25;
        }
      }

      // Discount
      if (summary.discount > 0) {
        drawBorderedRect(summaryX, currentY, summaryWidth, 25);
        doc.text("Discount", summaryX + 10, currentY + 17);
        doc.text(`-${summary.discount.toFixed(2)}`, summaryX + summaryWidth - 80, currentY + 17);
        currentY += 25;
      }

      // Round Off
      const roundOff = Math.round(summary.totalAmount) - summary.totalAmount;
      if (Math.abs(roundOff) > 0.01) {
        drawBorderedRect(summaryX, currentY, summaryWidth, 25);
        doc.text("Round Off", summaryX + 10, currentY + 17);
        doc.text(roundOff.toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
        currentY += 25;
      }

      // Grand Total
      drawBorderedRect(summaryX, currentY, summaryWidth, 30, '#f0f0f0');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Grand Total", summaryX + 10, currentY + 20);
      doc.text(Math.round(summary.totalAmount).toFixed(2), summaryX + summaryWidth - 80, currentY + 20);
      currentY += 40;

      // Amount in Words
      const amountInWords = numberToWords(Math.round(summary.totalAmount)) + " Only";
      drawBorderedRect(margin, currentY, contentWidth, 30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Bill Amount:", margin + 10, currentY + 15);
      doc.setFont("helvetica", "normal");
      doc.text(amountInWords, margin + 80, currentY + 15);
      currentY += 40;

      // UPDATED: Bank Details Section with complete information
      // UPDATED: Bank Details Section with complete information
if (garageDetails.bankDetails.bankName || garageDetails.bankDetails.accountNumber) {
  drawBorderedRect(margin, currentY, contentWidth / 2, 100);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Details:", margin + 10, currentY + 20);
  doc.setFont("helvetica", "normal");
  doc.text(`Bank: ${garageDetails.bankDetails.bankName || 'N/A'}`, margin + 10, currentY + 35);
  doc.text(`A/c Holder: ${garageDetails.bankDetails.accountHolderName || 'N/A'}`, margin + 10, currentY + 50);
  doc.text(`A/c No: ${garageDetails.bankDetails.accountNumber || 'N/A'}`, margin + 10, currentY + 65);
  doc.text(`IFSC: ${garageDetails.bankDetails.ifscCode || 'N/A'}`, margin + 10, currentY + 80);
  if (garageDetails.bankDetails.upiId) {
    doc.text(`UPI: ${garageDetails.bankDetails.upiId}`, margin + 10, currentY + 95);
  }
}

      // Terms & Conditions
      const termsX = margin + (contentWidth / 2) + 10;
      drawBorderedRect(termsX, currentY, contentWidth / 2 - 10, 100);
      doc.setFont("helvetica", "bold");
      doc.text("Terms & Conditions:", termsX + 10, currentY + 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("1. Goods once sold will not be taken back.", termsX + 10, currentY + 35);
      doc.text("2. Our risk ceases as goods leave premises.", termsX + 10, currentY + 47);
      doc.text("3. Subject to local jurisdiction only.", termsX + 10, currentY + 59);
      doc.text("4. E. & O.E.", termsX + 10, currentY + 71);
      if (gstSettings.billType === 'gst') {
        doc.text("5. GST as applicable.", termsX + 10, currentY + 83);
      }
      
      currentY += 120;

      // Authorized Signatory
      // doc.setFontSize(10);
      // doc.setFont("helvetica", "bold");
      // currentY += 40;
      // doc.text("(Authorized Signatory)", pageWidth - margin - 200, currentY);

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const timestamp = new Date().toLocaleString();
      // doc.text(`Generated on: ${timestamp}`, margin, pageHeight - 20);
      doc.text(`Bill Type: ${gstSettings.billType.toUpperCase()}`, pageWidth - margin - 100, pageHeight - 20);

      return doc;
      
    } catch (error) {
      console.error('Professional GST PDF Generation Error:', error);
      throw new Error('Failed to generate professional invoice: ' + error.message);
    }
  };

  // Enhanced download function
  const downloadPdfBill = () => {
    try {
      if (!carDetails.invoiceNo) {
        setSnackbar({
          open: true,
          message: 'Invoice number is required to generate PDF',
          severity: 'error'
        });
        return;
      }

      if (!carDetails.customerName) {
        setSnackbar({
          open: true,
          message: 'Customer name is required to generate PDF',
          severity: 'error'
        });
        return;
      }

      const doc = generateProfessionalGSTInvoice();
      const billTypeText = gstSettings.billType === 'gst' ? 'GST' : 'Non-GST';
      const fileName = `${billTypeText}_Invoice_${carDetails.invoiceNo}_${carDetails.carNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(fileName);
      
      setSnackbar({
        open: true,
        message: `Professional ${billTypeText} invoice PDF downloaded successfully!`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({
        open: true,
        message: `Failed to download PDF: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Enhanced email function
  const sendBillViaEmail = async () => {
    try {
      setSendingEmail(true);
      
      if (!emailRecipient || !emailRecipient.includes('@')) {
        setSnackbar({
          open: true,
          message: 'Please enter a valid email address',
          severity: 'error'
        });
        return;
      }

      const doc = generateProfessionalGSTInvoice();
      const pdfBlob = doc.output('blob');
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      const billTypeText = gstSettings.billType === 'gst' ? 'GST' : 'Non-GST';
      downloadLink.download = `${billTypeText}_Invoice_${carDetails.invoiceNo}_${carDetails.carNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      downloadLink.click();
      
      const subject = encodeURIComponent(emailSubject || `${billTypeText} Invoice #${carDetails.invoiceNo} - ${garageDetails.name}`);
      const gstInfo = gstSettings.billType === 'gst' ? `GST (${gstSettings.gstPercentage}%): ₹${summary.gstAmount}` : 'Non-GST Bill';
      const body = encodeURIComponent(
        emailMessage || 
        `Dear ${carDetails.customerName},\n\nPlease find attached your ${billTypeText} invoice for vehicle ${carDetails.carNumber}.\n\nInvoice Details:\n- Invoice No: ${carDetails.invoiceNo}\n- Date: ${carDetails.billingDate}\n- Bill Type: ${billTypeText}\n- ${gstInfo}\n- Total Amount: ₹${summary.totalAmount}\n- Bill To: ${gstSettings.billToParty}\n- Ship To: ${gstSettings.shiftToParty}\n\nThank you for choosing ${garageDetails.name}.\n\nBest regards,\n${garageDetails.name}`
      );
      const recipient = encodeURIComponent(emailRecipient);

      const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');

      setSnackbar({
        open: true,
        message: `Email client opened with ${billTypeText} invoice details. PDF has been downloaded for manual attachment.`,
        severity: 'success'
      });

      setShowEmailDialog(false);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
      
    } catch (error) {
      console.error('Email send error:', error);
      setSnackbar({
        open: true,
        message: `Failed to prepare email: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // UPDATED: WhatsApp function with bill type information
  const sendBillViaWhatsApp = async () => {
    setSendingWhatsApp(true);
    try {
      if (!carDetails.contact || carDetails.contact.length < 10) {
        throw new Error("Valid contact number is required");
      }

      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

      let gstInfo = '';
      if (gstSettings.billType === 'gst') {
        if (gstSettings.isInterState) {
          gstInfo = `*TAX DETAILS:*\n🔸 IGST (${gstSettings.gstPercentage}%): ₹${summary.gstAmount}\n🔸 Total Tax: ₹${summary.gstAmount}`;
        } else {
          gstInfo = `*TAX DETAILS:*\n🔸 CGST (${gstSettings.cgstPercentage}%): ₹${Math.round(summary.gstAmount / 2)}\n🔸 SGST (${gstSettings.sgstPercentage}%): ₹${Math.round(summary.gstAmount / 2)}\n🔸 Total GST: ₹${summary.gstAmount}`;
        }
      } else {
        gstInfo = '*BILL TYPE: Non-GST Invoice*';
      }

      const billTypeText = gstSettings.billType === 'gst' ? 'GST TAX INVOICE' : 'NON-GST INVOICE';

      const billMessage = `🚗 *${billTypeText}*
━━━━━━━━━━━━━━━━━━━━━
*${garageDetails.name}*
📍 ${garageDetails.address}
📞 ${garageDetails.phone}
📧 ${garageDetails.email}
${gstSettings.billType === 'gst' ? `🆔 GST: ${garageDetails.gstNumber}` : '🆔 Non-GST Business'}
━━━━━━━━━━━━━━━━━━━━━
*INVOICE DETAILS:*
🧾 Invoice No: *${carDetails.invoiceNo}*
📅 Date: ${formattedDate}
💳 Payment: ${paymentMethod || 'Cash Payment'}
━━━━━━━━━━━━━━━━━━━━━
*BILLING DETAILS:*
👤 Bill To: ${gstSettings.billToParty}
📱 Contact: ${carDetails.contact}
📧 Email: ${carDetails.email}
🏢 Ship To: ${gstSettings.shiftToParty}
${gstSettings.customerGstNumber && gstSettings.billType === 'gst' ? `🆔 Customer GST: ${gstSettings.customerGstNumber}` : ''}
━━━━━━━━━━━━━━━━━━━━━
*VEHICLE DETAILS:*
🚙 ${carDetails.company} ${carDetails.model}
🔖 Registration: ${carDetails.carNumber}
━━━━━━━━━━━━━━━━━━━━━
${parts.length > 0 ? `*PARTS USED:*\n${parts.map(part => `🔧 ${part.name} (${part.quantity}) - HSN: ${part.hsnNumber}: ₹${part.total}`).join('\n')}\n` : ''}
${services.length > 0 ? `*SERVICES PROVIDED:*\n${services.map(service => `⚙️ ${service.name}: ₹${service.laborCost}`).join('\n')}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━
*BILL SUMMARY:*
💰 Subtotal: ₹${summary.subtotal}
${gstInfo}
${summary.discount > 0 ? `💸 Discount: -₹${summary.discount}` : ''}
*💳 GRAND TOTAL: ₹${summary.totalAmount}*
━━━━━━━━━━━━━━━━━━━━━
${finalInspection ? `*INSPECTION NOTES:*\n📝 ${finalInspection}\n━━━━━━━━━━━━━━━━━━━━━\n` : ''}
🙏 *Thank you for choosing our service!*
*Visit us again for quality automotive care.*`;

      let phoneNumber = carDetails.contact.replace(/\D/g, '');
      if (phoneNumber.length === 10) phoneNumber = `91${phoneNumber}`;

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(billMessage)}`;
      window.open(whatsappUrl, '_blank');

      setApiResponseMessage({
        type: "success",
        message: `WhatsApp ${gstSettings.billType.toUpperCase()} invoice prepared for ${carDetails.customerName}.`,
      });
    } catch (error) {
      console.error("WhatsApp send error:", error);
      setApiResponseMessage({
        type: "warning",
        message: error.message || "Couldn't send WhatsApp message.",
      });
    } finally {
      setSendingWhatsApp(false);
      setShowApiResponse(true);
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
            />
            <ServicesSection 
              services={services} 
              removeService={removeService} 
              openEditPrice={openEditPrice} 
              setShowNewServiceDialog={setShowNewServiceDialog} 
              isMobile={isMobile}
              tableCellStyle={tableCellStyle}
              getStatusColor={getStatusColor}
              disabled={isBillAlreadyGenerated}
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
            sendBillViaWhatsApp={sendBillViaWhatsApp} 
            sendingWhatsApp={sendingWhatsApp} 
            openEmailDialog={openEmailDialog} 
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
          
          <AddServiceDialog 
            showNewServiceDialog={showNewServiceDialog} 
            setShowNewServiceDialog={setShowNewServiceDialog} 
            isMobile={isMobile} 
            newService={newService} 
            setNewService={setNewService} 
            addNewService={addNewService} 
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