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

  // State declarations with complete bank details
  const [garageDetails, setGarageDetails] = useState({
    name: "",
    address: "",
    phone: "",
    gstNumber: "",
    email: "",
    website: "",
    logoUrl: "",
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

  const [billGenerated, setBillGenerated] = useState(false);
  const [isBillAlreadyGenerated, setIsBillAlreadyGenerated] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // Enhanced GST settings with bill type and party details
  const [gstSettings, setGstSettings] = useState({
    includeGst: true,
    gstType: 'percentage',
    gstPercentage: 18,
    gstAmount: 0,
    cgstPercentage: 9,
    sgstPercentage: 9,
    customerGstNumber: '',
    isInterState: false,
    billType: 'gst', // 'gst' or 'non-gst'
    billToParty: '',
    shiftToParty: '',
    insuranceProvider: ''
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
    hsnNumber: ""
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

  // ✅ NEW: Function to update labor and tax in job card
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
        console.log('✅ Labor and tax updated successfully:', response.data);
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

  // Fetch garage data with complete bank details
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
          logoUrl: data.logoUrl || data.logo || "",
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

        if (data.generateBill === true) {
          setIsBillAlreadyGenerated(true);
          setBillGenerated(true);
          setShowThankYou(true);
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

        setGstSettings(prev => ({
          ...prev,
          billToParty: data.customerName || data.customer?.name || "",
          shiftToParty: data.insuranceCompany || data.insurance?.company || "N/A",
          insuranceProvider: data.insuranceProvider || data.insurance?.company || "N/A"
        }));

        if (data.partsUsed?.length > 0) {
          const apiParts = data.partsUsed.map((part, index) => ({
            id: index + 1,
            name: part.partName || part.name || '',
            quantity: parseInt(part.quantity) || 1,
            pricePerUnit: parseFloat(part.pricePerPiece || part.pricePerUnit || part.sellingPrice) || 0,
            total: parseFloat(part.totalPrice) || (parseInt(part.quantity) * parseFloat(part.pricePerPiece || part.sellingPrice)) || 0,
            hsnNumber: part.hsnNumber || part.hsn || "8708"
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
            engineer: service.engineer || service.engineerName || 
                     (data.engineerId?.length > 0 ? data.engineerId[0].name : null) ||
                     data.engineerId?.name || 'Assigned Engineer',
            progress: service.progress || 100,
            status: service.status || 'Completed',
            laborCost: parseFloat(service.laborCost) || 0
          }));
        }
        setServices(apiServices);

        let inspectionNotes = '';
        if (data.qualityCheck?.notes) {
          inspectionNotes = data.qualityCheck.notes;
        } else if (data.engineerRemarks) {
          inspectionNotes = data.engineerRemarks;
        } else if (data.remarks) {
          inspectionNotes = data.remarks;
        } else {
          inspectionNotes = `Vehicle inspected on ${today}. All work completed satisfactorily. Vehicle is ready for delivery.`;
        }
        setFinalInspection(inspectionNotes);

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
    const totalPartsCost = parts.reduce((sum, part) => sum + (part.total || 0), 0);
    const totalLaborCost = services.reduce((sum, service) => sum + (service.laborCost || 0), 0);
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

  // Handlers
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

  // ✅ Updated generateBill function with labor/tax update
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

    // ✅ Update labor and tax first
    updateLaborAndTax(); // This runs in background

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
        setBillGenerated(true);
        setIsBillAlreadyGenerated(true);
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

  // Validation function
  const validateJobCompletion = () => {
    const issues = [];
    const hasPartsOrServices = parts.length > 0 || services.length > 0;
    const totalAmount = summary.totalAmount || 0;

    if (!hasPartsOrServices && totalAmount === 0) {
      issues.push("At least one part or service is required");
    }
    if (!carDetails.customerName.trim()) {
      issues.push("Customer name is required");
    }
    if (!carDetails.contact.trim()) {
      issues.push("Customer contact is required");
    }
    if (!gstSettings.billToParty.trim()) {
      issues.push("Bill to party is required");
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  };

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