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

  // State declarations
 const [garageDetails, setGarageDetails] = useState({
    name: "",
    address: "",
    phone: "",
    gstNumber: "",
    email: "",
    website: "",
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

  
  // Fetch garage data
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
          gstNumber: data.gstNumber || garageDetails.gstNumber,
          email: data.email || garageDetails.email,
          website: data.website || garageDetails.website,
        });
      } catch (error) {
        console.error("Error fetching garage data:", error);
      }
    };

    fetchGarageData();
  }, [garageId]);

  // Fetch job card data
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

        let apiServices = [];
        if (data.services?.length > 0) {
          apiServices = data.services.map((service, index) => ({
            id: index + 1,
            name: service.serviceName || service.name || '',
            engineer: service.engineer || service.engineerName || data.engineerId?.name || 'Assigned Engineer',
            progress: service.progress || 100,
            status: service.status || 'Completed',
            laborCost: parseFloat(service.laborCost) || 0
          }));
        }
        
        if (apiServices.length === 0 && data.laborHours) {
          apiServices = [{
            id: 1,
            name: 'General Service',
            engineer: data.engineerId?.name || 'Assigned Engineer',
            progress: 100,
            status: 'Completed',
            laborCost: parseFloat(data.laborHours) * 500 || 0
          }];
        }
        setServices(apiServices);

        if (data.qualityCheck?.notes) {
          setFinalInspection(data.qualityCheck.notes);
        } else if (data.engineerRemarks) {
          setFinalInspection(data.engineerRemarks);
        } else if (data.remarks) {
          setFinalInspection(data.remarks);
        }

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

  const generateBill = () => setShowPaymentModal(true);

  // MODIFIED: Payment method selection now directly processes payment
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

  // Payment processing functions
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
        setApiResponseMessage({
          type: "success",
          message: data.message || "Professional bill generated and payment processed successfully!",
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
        setApiResponseMessage({
          type: "success",
          message: paymentResponse.data?.message || "Online payment processed successfully!",
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

  // PDF and sharing functions
// Complete PDF generation function for AutoServeBilling component
const generateProfessionalPdfInvoice = () => {
  try {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 40;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace) => {
      if (currentY + requiredSpace > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // Helper function to draw a horizontal line
    const drawLine = (y, width = contentWidth) => {
      doc.setLineWidth(1);
      doc.line(margin, y, margin + width, y);
    };

    // Header Section
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(garageDetails.name.toUpperCase(), margin, currentY);
    currentY += 30;

    // Garage Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${garageDetails.address}`, margin, currentY);
    currentY += 15;
    doc.text(`Phone: ${garageDetails.phone} | Email: ${garageDetails.email}`, margin, currentY);
    currentY += 15;
    if (garageDetails.gstNumber) {
      doc.text(`GST NO: ${garageDetails.gstNumber}`, margin, currentY);
      currentY += 15;
    }

    // Draw header line
    drawLine(currentY);
    currentY += 20;

    // Invoice title and details
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", margin, currentY);
    
    // Invoice details on the right
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const invoiceDetailsX = pageWidth - margin - 150;
    doc.text(`INVOICE DATE: ${carDetails.billingDate}`, invoiceDetailsX, currentY - 5);
    doc.text(`INVOICE NO: ${carDetails.invoiceNo}`, invoiceDetailsX, currentY + 10);
    currentY += 35;

    // Customer and Vehicle Details Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER DETAILS:", margin, currentY);
    currentY += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${carDetails.customerName}`, margin, currentY);
    doc.text(`Contact: ${carDetails.contact}`, margin + 200, currentY);
    currentY += 15;
    doc.text(`Email: ${carDetails.email}`, margin, currentY);
    currentY += 15;
    if (carDetails.address) {
      doc.text(`Address: ${carDetails.address}`, margin, currentY);
      currentY += 15;
    }
    if (gstSettings.customerGstNumber) {
      doc.text(`Customer GST: ${gstSettings.customerGstNumber}`, margin, currentY);
      currentY += 15;
    }

    // Vehicle Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("VEHICLE DETAILS:", margin, currentY + 10);
    currentY += 30;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Model: ${carDetails.company} ${carDetails.model}`, margin, currentY);
    doc.text(`Registration No: ${carDetails.carNumber}`, margin + 250, currentY);
    currentY += 25;

    // Draw line before itemized section
    drawLine(currentY);
    currentY += 20;

    // Parts Table Header
    if (parts.length > 0) {
      checkPageBreak(100);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PARTS DETAILS:", margin, currentY);
      currentY += 20;

      // Table headers
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      
      const colWidths = {
        srNo: 40,
        description: 250,
        qty: 50,
        rate: 80,
        amount: 80
      };
      
      let colX = margin;
      doc.text("Sr.No", colX, currentY);
      colX += colWidths.srNo;
      doc.text("Part Description", colX, currentY);
      colX += colWidths.description;
      doc.text("Qty", colX, currentY);
      colX += colWidths.qty;
      doc.text("Rate", colX, currentY);
      colX += colWidths.rate;
      doc.text("Amount", colX, currentY);
      
      currentY += 15;
      drawLine(currentY - 5);
      currentY += 10;

      // Parts data
      doc.setFont("helvetica", "normal");
      parts.forEach((part, index) => {
        checkPageBreak(20);
        
        colX = margin;
        doc.text((index + 1).toString(), colX, currentY);
        colX += colWidths.srNo;
        
        // Handle long part names
        const partName = part.name.length > 35 ? part.name.substring(0, 35) + "..." : part.name;
        doc.text(partName, colX, currentY);
        colX += colWidths.description;
        
        doc.text(part.quantity.toString(), colX, currentY);
        colX += colWidths.qty;
        
        doc.text(part.pricePerUnit.toFixed(2), colX, currentY);
        colX += colWidths.rate;
        
        doc.text(part.total.toFixed(2), colX, currentY);
        
        currentY += 15;
      });

      // Parts subtotal
      currentY += 5;
      drawLine(currentY);
      currentY += 15;
      
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL PARTS AMOUNT:", margin + 290, currentY);
      doc.text(summary.totalPartsCost.toFixed(2), margin + 450, currentY);
      currentY += 25;
    }

    // Services Table
    if (services.length > 0) {
      checkPageBreak(100);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SERVICES PROVIDED:", margin, currentY);
      currentY += 20;

      // Service table headers
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      
      let colX = margin;
      doc.text("Sr.No", colX, currentY);
      colX += 40;
      doc.text("Service Description", colX, currentY);
      colX += 250;
      doc.text("Engineer", colX, currentY);
      colX += 100;
      doc.text("Labor Cost", colX, currentY);
      
      currentY += 15;
      drawLine(currentY - 5);
      currentY += 10;

      // Services data
      doc.setFont("helvetica", "normal");
      services.forEach((service, index) => {
        checkPageBreak(20);
        
        colX = margin;
        doc.text((index + 1).toString(), colX, currentY);
        colX += 40;
        
        const serviceName = service.name.length > 30 ? service.name.substring(0, 30) + "..." : service.name;
        doc.text(serviceName, colX, currentY);
        colX += 250;
        
        const engineerName = service.engineer.length > 15 ? service.engineer.substring(0, 15) + "..." : service.engineer;
        doc.text(engineerName, colX, currentY);
        colX += 100;
        
        doc.text(service.laborCost.toFixed(2), colX, currentY);
        
        currentY += 15;
      });

      // Services subtotal
      currentY += 5;
      drawLine(currentY);
      currentY += 15;
      
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL LABOR AMOUNT:", margin + 290, currentY);
      doc.text(summary.totalLaborCost.toFixed(2), margin + 450, currentY);
      currentY += 25;
    }

    // Final Inspection Notes
    if (finalInspection) {
      checkPageBreak(60);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("WORK DONE/REMARKS:", margin, currentY);
      currentY += 20;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const inspectionLines = doc.splitTextToSize(finalInspection, contentWidth - 20);
      doc.text(inspectionLines, margin, currentY);
      currentY += inspectionLines.length * 12 + 15;
    }

    // Bill Summary Section
    checkPageBreak(150);
    
    drawLine(currentY);
    currentY += 20;

    // Summary calculations
    const summaryX = pageWidth - margin - 200;
    const labelX = summaryX - 100;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    doc.text("Subtotal:", labelX, currentY);
    doc.text(`₹${summary.subtotal.toFixed(2)}`, summaryX, currentY);
    currentY += 18;

    if (summary.discount > 0) {
      doc.text("Discount:", labelX, currentY);
      doc.text(`-₹${summary.discount.toFixed(2)}`, summaryX, currentY);
      currentY += 18;
    }

    // GST Details
    if (gstSettings.includeGst && summary.gstAmount > 0) {
      if (gstSettings.isInterState) {
        doc.text(`IGST (${gstSettings.gstPercentage}%):`, labelX, currentY);
        doc.text(`₹${summary.gstAmount.toFixed(2)}`, summaryX, currentY);
        currentY += 18;
      } else {
        doc.text(`CGST (${gstSettings.cgstPercentage}%):`, labelX, currentY);
        doc.text(`₹${(summary.gstAmount / 2).toFixed(2)}`, summaryX, currentY);
        currentY += 18;
        
        doc.text(`SGST (${gstSettings.sgstPercentage}%):`, labelX, currentY);
        doc.text(`₹${(summary.gstAmount / 2).toFixed(2)}`, summaryX, currentY);
        currentY += 18;
      }
    }

    // Final Amount with proper spacing and alignment
    currentY += 10;
    drawLine(currentY - 5, contentWidth);
    currentY += 25;
    
    // Calculate positions for final amount
    const finalAmountLabelX = margin + 100;
    const finalAmountValueX = pageWidth - margin - 120;
    
    // Create a box for the final amount to make it prominent
    doc.setLineWidth(2);
    // doc.rect(finalAmountLabelX - 20, currentY - 18, contentWidth - 160, 30);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FINAL BILL AMOUNT:", finalAmountLabelX, currentY);
    
    // Display the amount with proper alignment
    const finalAmountText = `RS.${summary.totalAmount.toFixed(2)}`;
    doc.text(finalAmountText, finalAmountValueX, currentY);
    
    currentY += 45;

    // Payment method if available
    if (paymentMethod) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Payment Method: ${paymentMethod}`, margin, currentY);
      currentY += 20;
    }

    // Footer
    checkPageBreak(60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("DELIVERY AGAINST CASH ONLY", margin, currentY);
    currentY += 30;

    // Thank you message
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for choosing our service!", margin, currentY);
    
    // Add timestamp
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.text(`Generated on: ${timestamp}`, margin, pageHeight - 20);

    return doc;
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF document: ' + error.message);
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

    const doc = generateProfessionalPdfInvoice();
    const fileName = `Invoice_${carDetails.invoiceNo}_${carDetails.carNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    doc.save(fileName);
    
    setSnackbar({
      open: true,
      message: 'Professional invoice PDF downloaded successfully!',
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
    const doc = generateProfessionalPdfInvoice();
    const pdfBlob = doc.output('blob');
    
    // Create download link for manual attachment
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = `Invoice_${carDetails.invoiceNo}_${carDetails.carNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    downloadLink.click();
    
    // Prepare email
    const subject = encodeURIComponent(emailSubject || `Invoice #${carDetails.invoiceNo} - ${garageDetails.name}`);
    const body = encodeURIComponent(
      emailMessage || 
      `Dear ${carDetails.customerName},\n\nPlease find attached your invoice for vehicle ${carDetails.carNumber}.\n\nInvoice Details:\n- Invoice No: ${carDetails.invoiceNo}\n- Date: ${carDetails.billingDate}\n- Amount: ₹${summary.totalAmount}\n\nThank you for choosing ${garageDetails.name}.\n\nBest regards,\n${garageDetails.name}`
    );
    const recipient = encodeURIComponent(emailRecipient);

    const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');

    setSnackbar({
      open: true,
      message: 'Email client opened with invoice details. PDF has been downloaded for manual attachment.',
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

// Function to fetch and integrate API data for more comprehensive billing
const fetchAdditionalJobCardData = async (jobCardId) => {
  try {
    const response = await axios.get(
      `https://garage-management-zi5z.onrender.com/api/jobCards/${jobCardId}`
    );
    
    const apiData = response.data;
    
    // Integrate additional data that might be missing
    if (apiData.additionalCharges && apiData.additionalCharges.length > 0) {
      const additionalServices = apiData.additionalCharges.map((charge, index) => ({
        id: services.length + index + 1,
        name: charge.description || 'Additional Charge',
        engineer: 'Service Team',
        progress: 100,
        status: 'Completed',
        laborCost: parseFloat(charge.amount) || 0
      }));
      
      setServices(prev => [...prev, ...additionalServices]);
    }
    
    // Update inspection notes if more detailed info is available
    if (apiData.detailedRemarks && !finalInspection) {
      setFinalInspection(apiData.detailedRemarks);
    }
    
    // Update GST settings based on API data
    if (apiData.gstDetails) {
      setGstSettings(prev => ({
        ...prev,
        ...apiData.gstDetails
      }));
    }
    
    return apiData;
    
  } catch (error) {
    console.error('Error fetching additional job card data:', error);
    return null;
  }
};

  const generatePdfBase64 = () => {
    try {
      const doc = generateProfessionalPdfInvoice();
      return doc.output('datauristring').split(',')[1];
    } catch (error) {
      console.error('PDF Base64 generation error:', error);
      throw new Error('Failed to generate PDF for email');
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

      const billMessage = `🚗 *TAX INVOICE*
━━━━━━━━━━━━━━━━━━━━━
*${garageDetails.name}*
📍 ${garageDetails.address}
📞 ${garageDetails.phone}
📧 ${garageDetails.email}
🆔 GST: ${garageDetails.gstNumber}
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
        message: `WhatsApp invoice prepared for ${carDetails.customerName}.`,
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
            Professional Billing System
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptIcon />}
            onClick={generateBill}
            disabled={showThankYou}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
          >
            Generate Professional Bill
          </Button>
        </Box>

        {!showThankYou ? (
          <>
            <GarageDetailsSection garageDetails={garageDetails} />
            <CustomerVehicleSection 
              carDetails={carDetails} 
              handleInputChange={handleInputChange} 
              isMobile={isMobile} 
              today={today}
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
            />
            <PartsSection 
              parts={parts} 
              removePart={removePart} 
              openEditPrice={openEditPrice} 
              setShowNewPartDialog={setShowNewPartDialog} 
              isMobile={isMobile}
              tableCellStyle={tableCellStyle}
            />
            <ServicesSection 
              services={services} 
              removeService={removeService} 
              openEditPrice={openEditPrice} 
              setShowNewServiceDialog={setShowNewServiceDialog} 
              isMobile={isMobile}
              tableCellStyle={tableCellStyle}
              getStatusColor={getStatusColor}
            />
            <FinalInspectionSection 
              finalInspection={finalInspection} 
              setFinalInspection={setFinalInspection} 
            />
            <BillSummarySection 
              summary={summary} 
              gstSettings={gstSettings} 
              handleDiscountChange={handleDiscountChange} 
              paymentMethod={paymentMethod} 
              isMobile={isMobile}
              formatAmount={formatAmount}
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
      {/* REMOVED: ProcessingPaymentDialog is no longer needed */}
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