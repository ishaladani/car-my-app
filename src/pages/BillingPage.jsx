import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, LinearProgress, Paper,
  useMediaQuery, useTheme, Snackbar, Alert
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Receipt as ReceiptIcon, CreditCard as CreditCardIcon, AccountBalance as AccountBalanceIcon,
  Check as CheckIcon, WhatsApp as WhatsAppIcon, Email as EmailIcon
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
  let garageId = localStorage.getItem("garageId") || localStorage.getItem("garage_id");
  
  const today = new Date().toISOString().split("T")[0];

  // UPDATED: State declarations with bank details
  const [garageDetails, setGarageDetails] = useState({
    name: "",
    address: "",
    phone: "",
    gstNumber: "",
    email: "",
    website: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const [gstSettings, setGstSettings] = useState({
    includeGst: true,
    gstType: 'percentage',
    gstPercentage: 18,
    gstAmount: 0,
    cgstPercentage: 9,
    sgstPercentage: 9,
    customerGstNumber: '',
    isInterState: false,
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
      // Don't show error to user as this is a background operation
    }
  };
  
  // UPDATED: Fetch garage data with bank details
  useEffect(() => {
    const fetchGarageData = async () => {
      if (!garageId) return;
      
      try {
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/getgaragebyid/${garageId}`
        );
        const data = response.data;
        setGarageDetails({
          name: data.name || garageDetails.name,
          address: data.address || garageDetails.address,
          phone: data.phone || garageDetails.phone,
          gstNumber: data.gstNum || garageDetails.gstNum,
          email: data.email || garageDetails.email,
          website: data.website || garageDetails.website,
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          ifscCode: data.ifscCode || "",
        });
      } catch (error) {
        console.error("Error fetching garage data:", error);
      }
    };

    fetchGarageData();
  }, [garageId]);

  // UPDATED: Fetch job card data with improved services processing
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

        // Process parts
        if (data.partsUsed?.length > 0) {
          const apiParts = data.partsUsed.map((part, index) => ({
            id: index + 1,
            name: part.partName || part.name || '',
            quantity: parseInt(part.quantity) || 1,
            pricePerUnit: parseFloat(part.pricePerPiece || part.pricePerUnit) || 0,
            total: parseFloat(part.totalPrice) || (parseInt(part.quantity) * parseFloat(part.pricePerPiece)) || 0
          }));
          setParts(apiParts);
        } else {
          setParts([]);
        }

        // UPDATED: Enhanced services processing to handle jobDetails
        let apiServices = [];

        // First, try to get services from the services array (if available)
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

        // NEW: Parse jobDetails if services array is not available or empty
        if (apiServices.length === 0 && data.jobDetails) {
          try {
            // Parse the jobDetails JSON string
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
            // Fallback to single service if JSON parsing fails
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

        // Fallback: Create generic service from laborHours if no other data is available
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

        setServices(apiServices);

        // Set final inspection notes
        if (data.qualityCheck?.notes) {
          setFinalInspection(data.qualityCheck.notes);
        } else if (data.engineerRemarks) {
          setFinalInspection(data.engineerRemarks);
        } else if (data.remarks) {
          setFinalInspection(data.remarks);
        }

        // Set email recipient
        if (data.email || data.customer?.email) {
          setEmailRecipient(data.email || data.customer?.email);
        }

      } catch (error) {
        console.error('Error fetching job card data:', error);
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
    
    if (gstSettings.includeGst) {
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

  // Handler functions
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCarDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleGstIncludeChange = (event) => {
    setGstSettings(prev => ({ ...prev, includeGst: event.target.checked }));
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

  // UPDATED: Payment method selection now directly processes payment
  const selectPaymentMethod = async (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(false);
    
    // Directly process payment without showing processing modal
    if (method === "Online Payment") {
      await processOnlinePayment();
    } else {
      await processPayment();
    }
  };

  // UPDATED: Function to update bill status and job card status to completed
  const updateBillAndJobStatus = async (jobCardId) => {
    try {
      // Update bill generation status
      const billStatusResponse = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/jobcards/updatebillstatus/${jobCardId}`
      );
      
      if (billStatusResponse.status === 200) {
        console.log('Bill status updated successfully');
        setBillGenerated(true);
        
        // Update job card status to completed
        const statusUpdateResponse = await axios.put(
          `https://garage-management-zi5z.onrender.com/api/jobcards/updatestatus/${jobCardId}`,
          { status: 'Completed' }
        );
        
        if (statusUpdateResponse.status === 200) {
          console.log('Job card status updated to completed');
          // Update local job card data if needed
          if (jobCardData) {
            setJobCardData(prev => ({ ...prev, status: 'Completed' }));
          }
        }
      }
    } catch (error) {
      console.error('Error updating bill and job status:', error);
      // Don't show error to user as this is a background operation
    }
  };

  // Status validation function
  const validateJobCompletion = () => {
    const issues = [];
    
    if (parts.length === 0 && services.length === 0) {
      issues.push("No parts or services added");
    }
    
    if (!carDetails.customerName.trim()) {
      issues.push("Customer name is required");
    }
    
    if (!carDetails.contact.trim()) {
      issues.push("Customer contact is required");
    }
    
    if (!finalInspection.trim()) {
      issues.push("Final inspection notes are required");
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

  // Updated generate bill function with validation
  const generateBill = () => {
    if (isBillAlreadyGenerated || billGenerated) {
      setSnackbar({
        open: true,
        message: 'Bill has already been generated for this job card',
        severity: 'warning'
      });
      return;
    }
    
    // Validate job completion before generating bill
    const validation = validateJobCompletion();
    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: `Please complete: ${validation.issues.join(', ')}`,
        severity: 'error'
      });
      return;
    }
    
    setShowPaymentModal(true);
  };

  // UPDATED: Payment processing functions with status update
  const processPayment = async () => {
    if (!jobCardIdFromUrl) {
      setApiResponseMessage({
        type: "error",
        message: "No job card ID found in URL. Cannot process payment.",
      });
      setShowApiResponse(true);
      return;
    }

    const apiData = {
      parts: parts.map(part => ({
        name: part.name,
        quantity: part.quantity,
        pricePerUnit: part.pricePerUnit,
      })),
      services: services.map(service => ({
        description: service.name,
        laborCost: service.laborCost,
      })),
      discount: summary.discount,
      gstSettings: {
        includeGst: gstSettings.includeGst,
        gstType: gstSettings.gstType,
        gstPercentage: gstSettings.gstPercentage,
        gstAmount: gstSettings.gstAmount,
        customerGstNumber: gstSettings.customerGstNumber,
        isInterState: gstSettings.isInterState
      },
      gstPercentage: gstSettings.includeGst ? gstSettings.gstPercentage : 0,
    };

    try {
      const response = await axios.post(
        `https://garage-management-zi5z.onrender.com/api/garage/billing/generate/${jobCardIdFromUrl}`,
        apiData
      );

      const data = response.data;
      if (response.status === 200 || response.status === 201) {
        // NEW: Update both bill status and job status to completed
        await updateBillAndJobStatus(jobCardIdFromUrl);
        
        setApiResponseMessage({
          type: "success",
          message: data.message || "Professional bill generated and payment processed successfully! Job completed.",
        });
        setShowThankYou(true);
        
        if (data.invoiceNumber) {
          setCarDetails(prev => ({ ...prev, invoiceNo: data.invoiceNumber }));
        }
      } else {
        setApiResponseMessage({
          type: "error",
          message: data.message || "Failed to generate bill",
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      setApiResponseMessage({
        type: "error",
        message: error.response?.data?.message || 
               error.message || 
               "Network error while processing payment",
      });
    }

    setShowApiResponse(true);
  };

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
      const billResponse = await axios.post(
        `https://garage-management-zi5z.onrender.com/api/garage/billing/generate/${jobCardIdFromUrl}`,
        {
          parts: parts.map(part => ({
            name: part.name,
            quantity: part.quantity,
            pricePerUnit: part.pricePerUnit,
          })),
          services: services.map(service => ({
            description: service.name,
            laborCost: service.laborCost,
          })),
          discount: summary.discount,
          gstSettings: {
            includeGst: gstSettings.includeGst,
            gstType: gstSettings.gstType,
            gstPercentage: gstSettings.gstPercentage,
            gstAmount: gstSettings.gstAmount,
            customerGstNumber: gstSettings.customerGstNumber,
            isInterState: gstSettings.isInterState
          },
          gstPercentage: gstSettings.includeGst ? gstSettings.gstPercentage : 0,
        }
      );

      const responseData = billResponse.data;
      if (!responseData.bill || !responseData.bill._id) {
        throw new Error("Invalid response structure - missing bill ID");
      }

      const billId = responseData.bill._id;
      const invoiceNo = responseData.bill.invoiceNo;

      setCarDetails(prev => ({ ...prev, invoiceNo: invoiceNo || prev.invoiceNo }));

      const paymentResponse = await axios.post(
        "https://garage-management-zi5z.onrender.com/api/garage/billing/pay",
        {
          billId: billId,
          paymentMethod: "Online Payment"
        }
      );

      if (paymentResponse.status === 200 || paymentResponse.status === 201) {
        // NEW: Update both bill status and job status to completed
        await updateBillAndJobStatus(jobCardIdFromUrl);
        
        setApiResponseMessage({
          type: "success",
          message: paymentResponse.data?.message || "Online payment processed successfully! Job completed.",
        });
        setShowThankYou(true);
      } else {
        throw new Error(paymentResponse.data?.message || "Payment failed");
      }

    } catch (error) {
      console.error("Payment Error:", error);
      setApiResponseMessage({
        type: "error",
        message: error.response?.data?.message || 
               error.message || 
               "Failed to process online payment",
      });
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

  const addNewPart = () => {
    const { name, quantity, pricePerUnit } = newPart;
    if (name && quantity > 0 && pricePerUnit > 0) {
      const newPartObj = {
        id: Date.now(),
        name,
        quantity: parseInt(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        total: parseInt(quantity) * parseFloat(pricePerUnit),
      };

      setParts(prev => [...prev, newPartObj]);
      setNewPart({ name: "", quantity: 1, pricePerUnit: 0 });
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

  // UPDATED: Professional GST PDF generation function
 // UPDATED: Fixed Professional GST PDF generation function with proper table formatting
const generateProfessionalGSTInvoice = () => {
  try {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 40;

    // Helper function to convert number to words
    const numberToWords = (num) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      
      if (num === 0) return 'Zero';
      
      let words = '';
      
      // Handle crores
      if (num >= 10000000) {
        words += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
        num %= 10000000;
      }
      
      // Handle lakhs
      if (num >= 100000) {
        words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
        num %= 100000;
      }
      
      // Handle thousands
      if (num >= 1000) {
        words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
      }
      
      // Handle hundreds
      if (num >= 100) {
        words += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      
      // Handle tens and ones
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

    // Helper function to draw bordered rectangle
    const drawBorderedRect = (x, y, width, height, fillColor = null) => {
      if (fillColor) {
        doc.setFillColor(fillColor);
        doc.rect(x, y, width, height, 'F');
      }
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0); // Black border
      doc.rect(x, y, width, height);
    };

    // Helper function to wrap text in cell
    const wrapText = (text, maxWidth, fontSize = 9) => {
      doc.setFontSize(fontSize);
      const words = text.toString().split(' ');
      const lines = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const testWidth = doc.getTextWidth(testLine);
        
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    // Header Section with Border
    drawBorderedRect(margin, currentY, contentWidth, 80);
    
    // Company Name
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const companyName = garageDetails.name.toUpperCase();
    const nameWidth = doc.getTextWidth(companyName);
    doc.text(companyName, (pageWidth - nameWidth) / 2, currentY + 25);
    
    // Company Address
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const addressLine = `${garageDetails.address}`;
    const addressWidth = doc.getTextWidth(addressLine);
    doc.text(addressLine, (pageWidth - addressWidth) / 2, currentY + 45);
    
    // GST Number
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const gstLine = `GST No: ${garageDetails.gstNum || 'N/A'}`;
    const gstWidth = doc.getTextWidth(gstLine);
    doc.text(gstLine, (pageWidth - gstWidth) / 2, currentY + 65);
    
    currentY += 100;

    // Invoice Type Section
    const docTypeY = currentY;
    drawBorderedRect(margin, docTypeY, 100, 25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Tax Invoice", margin + 10, docTypeY + 17);
    
    // Original/Duplicate
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
    doc.text(`Name: ${carDetails.customerName}`, margin + 10, billShipY + 40);
    doc.text(`Contact: ${carDetails.contact}`, margin + 10, billShipY + 55);
    if (carDetails.email) {
      doc.text(`Email: ${carDetails.email}`, margin + 10, billShipY + 70);
    }
    if (gstSettings.customerGstNumber) {
      doc.text(`GST No: ${gstSettings.customerGstNumber}`, margin + 10, billShipY + 85);
    }
    
    // Ship To Section
    const shipToWidth = contentWidth / 2 - 5;
    drawBorderedRect(margin + billToWidth + 10, billShipY, shipToWidth, 120);
    doc.setFont("helvetica", "bold");
    doc.text("Insurance Details:", margin + billToWidth + 20, billShipY + 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${carDetails.customerName}`, margin + billToWidth + 20, billShipY + 40);
    doc.text(`Vehicle: ${carDetails.company} ${carDetails.model}`, margin + billToWidth + 20, billShipY + 55);
    doc.text(`Reg No: ${carDetails.carNumber}`, margin + billToWidth + 20, billShipY + 70);
    
    // Invoice Details on right side
    const invoiceDetailsX = margin + billToWidth + 20;
    doc.setFontSize(9);
    doc.text(`Invoice No: ${carDetails.invoiceNo}`, invoiceDetailsX, billShipY + 100);
    doc.text(`Date: ${carDetails.billingDate}`, invoiceDetailsX, billShipY + 115);
    
    currentY = billShipY + 140;

    // FIXED: Items Table with proper column widths and alignment
    const tableStartY = currentY;
    
    // Adjusted column widths to fit content properly
    const colWidths = {
      srNo: 40,        // Serial number
      productName: 180, // Product/Service name
      hsnSac: 60,      // HSN/SAC code
      qty: 35,         // Quantity
      unit: 40,        // Unit
      rate: 70,        // Rate per unit
      gstPercent: 50,  // GST percentage
      amount: 70       // Total amount
    };
    
    const totalTableWidth = Object.values(colWidths).reduce((sum, width) => sum + width, 0);
    
    // Draw table header with proper borders
    let headerY = tableStartY;
    drawBorderedRect(margin, headerY, totalTableWidth, 30, '#f0f0f0');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    
    // Draw vertical lines and add header text
    let colX = margin;
    const headers = ["Sr.No", "Product/Service Name", "HSN/SAC", "Qty", "Unit", "Rate", "GST%", "Amount"];
    const columnKeys = Object.keys(colWidths);
    
    headers.forEach((header, index) => {
      const colWidth = colWidths[columnKeys[index]];
      
      // Add header text (centered)
      const textWidth = doc.getTextWidth(header);
      const textX = colX + (colWidth - textWidth) / 2;
      doc.text(header, textX, headerY + 20);
      
      // Draw right border for column (except last column)
      if (index < headers.length - 1) {
        doc.line(colX + colWidth, headerY, colX + colWidth, headerY + 30);
      }
      
      colX += colWidth;
    });

    currentY = headerY + 30;

    // FIXED: Data rows with proper text wrapping and alignment
    doc.setFont("helvetica", "normal");
    let rowIndex = 1;
    
    // Function to draw table row with proper formatting
    const drawTableRow = (rowData, rowY) => {
      const rowHeight = 25;
      
      // Draw row background
      drawBorderedRect(margin, rowY, totalTableWidth, rowHeight);
      
      // Draw column content
      colX = margin;
      rowData.forEach((cellData, index) => {
        const colWidth = colWidths[columnKeys[index]];
        
        // Handle text wrapping for long content
        let displayText = cellData.toString();
        if (index === 1 && displayText.length > 20) { // Product name column
          displayText = displayText.substring(0, 18) + "...";
        }
        
        // Right align numbers, left align text
        if (index === 0 || index >= 3) { // Sr.No, Qty, Rate, GST%, Amount
          const textWidth = doc.getTextWidth(displayText);
          doc.text(displayText, colX + colWidth - textWidth - 5, rowY + 17);
        } else {
          doc.text(displayText, colX + 5, rowY + 17);
        }
        
        // Draw right border for column (except last column)
        if (index < rowData.length - 1) {
          doc.line(colX + colWidth, rowY, colX + colWidth, rowY + rowHeight);
        }
        
        colX += colWidth;
      });
      
      return rowHeight;
    };
    
    // Parts Data Rows
    if (parts.length > 0) {
      parts.forEach((part) => {
        const rowData = [
          rowIndex.toString(),
          part.name,
          "8708", // Default HSN code for auto parts
          part.quantity.toString(),
          "Nos",
          part.pricePerUnit.toFixed(2),
          `${gstSettings.gstPercentage}%`,
          part.total.toFixed(2)
        ];
        
        const rowHeight = drawTableRow(rowData, currentY);
        currentY += rowHeight;
        rowIndex++;
      });
    }

    // Services Data Rows
    if (services.length > 0) {
      services.forEach((service) => {
        const rowData = [
          rowIndex.toString(),
          service.name,
          "9954", // HSN code for repair services
          "1",
          "Nos",
          service.laborCost.toFixed(2),
          `${gstSettings.gstPercentage}%`,
          service.laborCost.toFixed(2)
        ];
        
        const rowHeight = drawTableRow(rowData, currentY);
        currentY += rowHeight;
        rowIndex++;
      });
    }

    // Add empty rows if needed to maintain table structure
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

    // Summary Section (keeping your existing summary code)
    const summaryStartY = currentY;
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

    // GST Details
    if (gstSettings.includeGst && summary.gstAmount > 0) {
      if (gstSettings.isInterState) {
        // IGST
        drawBorderedRect(summaryX, currentY, summaryWidth, 25);
        doc.text(`IGST ${gstSettings.gstPercentage}%`, summaryX + 10, currentY + 17);
        doc.text(summary.gstAmount.toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
        currentY += 25;
      } else {
        // CGST
        drawBorderedRect(summaryX, currentY, summaryWidth, 25);
        doc.text(`CGST ${gstSettings.cgstPercentage}%`, summaryX + 10, currentY + 17);
        doc.text((summary.gstAmount / 2).toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
        currentY += 25;
        
        // SGST
        drawBorderedRect(summaryX, currentY, summaryWidth, 25);
        doc.text(`SGST ${gstSettings.sgstPercentage}%`, summaryX + 10, currentY + 17);
        doc.text((summary.gstAmount / 2).toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
        currentY += 25;
      }
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

    // Bank Details Section
    if (garageDetails.bankName || garageDetails.accountNumber) {
      drawBorderedRect(margin, currentY, contentWidth / 2, 80);
      doc.setFont("helvetica", "bold");
      doc.text("Bank Details:", margin + 10, currentY + 20);
      doc.setFont("helvetica", "normal");
      doc.text(`Bank Name: ${garageDetails.bankName || 'N/A'}`, margin + 10, currentY + 35);
      doc.text(`A/c No: ${garageDetails.accountNumber || 'N/A'}`, margin + 10, currentY + 50);
      doc.text(`IFSC: ${garageDetails.ifscCode || 'N/A'}`, margin + 10, currentY + 65);
    }

    // Terms & Conditions
    const termsX = margin + (contentWidth / 2) + 10;
    drawBorderedRect(termsX, currentY, contentWidth / 2 - 10, 80);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", termsX + 10, currentY + 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("1. Goods once sold will not be taken back.", termsX + 10, currentY + 35);
    doc.text("2. Our risk ceases as goods leave premises.", termsX + 10, currentY + 47);
    doc.text("3. Subject to local jurisdiction only.", termsX + 10, currentY + 59);
    doc.text("4. E. & O.E.", termsX + 10, currentY + 71);
    
    currentY += 100;

    // Authorized Signatory
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    currentY += 40;
    doc.text("(Authorized Signatory)", pageWidth - margin - 200, currentY);

    // Footer with generated timestamp
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated on: ${timestamp}`, margin, pageHeight - 20);

    return doc;
    
  } catch (error) {
    console.error('Professional GST PDF Generation Error:', error);
    throw new Error('Failed to generate professional GST invoice: ' + error.message);
  }
};

  // Enhanced download function with better error handling
  const downloadPdfBill = () => {
    try {
      // Validate required data
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
      const fileName = `GST_Invoice_${carDetails.invoiceNo}_${carDetails.carNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(fileName);
      
      setSnackbar({
        open: true,
        message: 'Professional GST invoice PDF downloaded successfully!',
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

  // Enhanced email function with PDF attachment
  const sendBillViaEmail = async () => {
    try {
      setSendingEmail(true);
      
      // Validate email recipient
      if (!emailRecipient || !emailRecipient.includes('@')) {
        setSnackbar({
          open: true,
          message: 'Please enter a valid email address',
          severity: 'error'
        });
        return;
      }

      // Generate PDF
      const doc = generateProfessionalGSTInvoice();
      const pdfBlob = doc.output('blob');
      
      // Create download link for manual attachment
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `GST_Invoice_${carDetails.invoiceNo}_${carDetails.carNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      downloadLink.click();
      
      // Prepare email
      const subject = encodeURIComponent(emailSubject || `GST Invoice #${carDetails.invoiceNo} - ${garageDetails.name}`);
      const body = encodeURIComponent(
        emailMessage || 
        `Dear ${carDetails.customerName},\n\nPlease find attached your GST tax invoice for vehicle ${carDetails.carNumber}.\n\nInvoice Details:\n- Invoice No: ${carDetails.invoiceNo}\n- Date: ${carDetails.billingDate}\n- Amount: ₹${summary.totalAmount}\n- GST: ${gstSettings.includeGst ? 'Included' : 'Excluded'}\n\nThank you for choosing ${garageDetails.name}.\n\nBest regards,\n${garageDetails.name}`
      );
      const recipient = encodeURIComponent(emailRecipient);

      const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');

      setSnackbar({
        open: true,
        message: 'Email client opened with GST invoice details. PDF has been downloaded for manual attachment.',
        severity: 'success'
      });

      setShowEmailDialog(false);
      
      // Clean up URL
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

  const sendBillViaWhatsApp = async () => {
    setSendingWhatsApp(true);
    try {
      if (!carDetails.contact || carDetails.contact.length < 10) {
        throw new Error("Valid contact number is required");
      }

      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

      let gstInfo = '';
      if (gstSettings.includeGst) {
        if (gstSettings.isInterState) {
          gstInfo = `*TAX DETAILS:*\n🔸 IGST (${gstSettings.gstPercentage}%): ₹${summary.gstAmount}\n🔸 Total Tax: ₹${summary.gstAmount}`;
        } else {
          gstInfo = `*TAX DETAILS:*\n🔸 CGST (${gstSettings.cgstPercentage}%): ₹${Math.round(summary.gstAmount / 2)}\n🔸 SGST (${gstSettings.sgstPercentage}%): ₹${Math.round(summary.gstAmount / 2)}\n🔸 Total GST: ₹${summary.gstAmount}`;
        }
      } else {
        gstInfo = '*TAX: Not Applicable*';
      }

      const billMessage = `🚗 *GST TAX INVOICE*
━━━━━━━━━━━━━━━━━━━━━
*${garageDetails.name}*
📍 ${garageDetails.address}
📞 ${garageDetails.phone}
📧 ${garageDetails.email}
🆔 GST: ${garageDetails.gstNum}
━━━━━━━━━━━━━━━━━━━━━
*INVOICE DETAILS:*
🧾 Invoice No: *${carDetails.invoiceNo}*
📅 Date: ${formattedDate}
💳 Payment: ${paymentMethod || 'Cash Payment'}
━━━━━━━━━━━━━━━━━━━━━
*CUSTOMER DETAILS:*
👤 ${carDetails.customerName}
📱 ${carDetails.contact}
📧 ${carDetails.email}
${gstSettings.customerGstNumber ? `🆔 Customer GST: ${gstSettings.customerGstNumber}` : ''}
━━━━━━━━━━━━━━━━━━━━━
*VEHICLE DETAILS:*
🚙 ${carDetails.company} ${carDetails.model}
🔖 Registration: ${carDetails.carNumber}
━━━━━━━━━━━━━━━━━━━━━
${parts.length > 0 ? `*PARTS USED:*\n${parts.map(part => `🔧 ${part.name} (${part.quantity}): ₹${part.total}`).join('\n')}\n` : ''}
${services.length > 0 ? `*SERVICES PROVIDED:*\n${services.map(service => `⚙️ ${service.name}: ₹${service.laborCost}`).join('\n')}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━
*BILL SUMMARY:*
💰 Subtotal: ₹${summary.subtotal}
${gstInfo}
${summary.discount > 0 ? `💸 Discount: -₹${summary.discount}` : ''}
*💳 GRAND TOTAL: ₹${summary.totalAmount}* ${!gstSettings.includeGst ? '(Excluding GST)' : '(Including GST)'}
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
        message: `WhatsApp GST invoice prepared for ${carDetails.customerName}.`,
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
        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", mb: 3, gap: isMobile ? 2 : 0 }}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Professional GST Billing System
          </Typography>
          
          {/* UPDATED: Button behavior based on bill status */}
          {!isBillAlreadyGenerated && !billGenerated ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReceiptIcon />}
              onClick={generateBill}
              fullWidth={isMobile}
              size={isMobile ? "small" : "medium"}
            >
              Generate Professional GST Bill
            </Button>
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
                GST Bill Generated ✓
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={downloadPdfBill}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
              >
                Download GST Invoice
              </Button>
            </Box>
          )}
        </Box>

        {/* UPDATED: Show bill generation warning if already generated */}
        {isBillAlreadyGenerated && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This GST invoice has already been generated. You can download the PDF or share via WhatsApp/Email below.
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
            <GSTSettingsSection 
              gstSettings={gstSettings} 
              handleGstIncludeChange={handleGstIncludeChange}
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
      
      {/* UPDATED: Only show edit dialogs if bill is not generated */}
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
          <AddPartDialog 
            showNewPartDialog={showNewPartDialog} 
            setShowNewPartDialog={setShowNewPartDialog} 
            isMobile={isMobile} 
            newPart={newPart} 
            setNewPart={setNewPart} 
            addNewPart={addNewPart} 
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