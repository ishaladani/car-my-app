import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Check as CheckIcon,
  WhatsApp as WhatsAppIcon, // Added WhatsApp icon
} from "@mui/icons-material";
import axios from "axios";

const AutoServeBilling = () => {
  // Get jobCardId from URL parameters
  const { jobCardId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [jobCardData, setJobCardData] = useState(null);
    const [finalInspection, setFinalInspection] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
      });
  
  // Alternative method to get jobCardId if not using react-router params
  const location = useLocation();
  const getJobCardIdFromUrl = () => {
    // Extract jobCardId from the current URL
    const pathSegments = location.pathname.split('/');
    const idIndex = pathSegments.findIndex(segment => segment === 'billing') + 1;
    return pathSegments[idIndex] || ''; // Return empty string if not found
  };
  
  // Use jobCardId from URL params if available, otherwise extract from URL
  const jobCardIdFromUrl = jobCardId || getJobCardIdFromUrl();

  const today = new Date().toISOString().split("T")[0];
  const token = localStorage.getItem("authToken")
    ? `Bearer ${localStorage.getItem("authToken")}`
    : "";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


    useEffect(() => {
      const fetchJobCardData = async () => {
        try {
          setIsLoading(true);
          
          const response = await axios.get(
            `https://garage-management-system-cr4w.onrender.com/api/jobCards/${jobCardId}`,
            {
              headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
              }
            }
          );
          
          const data = response.data;
          setJobCardData(data);
          
          // Populate parts if available
          if (data.partsUsed && data.partsUsed.length > 0) {
            const existingParts = data.partsUsed.map((part, index) => ({
              id: index + 1,
              partName: part.partName || '',
              qty: part.quantity?.toString() || '',
              pricePerPiece: part.pricePerPiece?.toString() || '',
              totalPrice: part.totalPrice?.toString() || ''
            }));
            
            setParts(existingParts);
          } else {
            // Initialize with one empty row if no parts exist
            setParts([{ 
              id: 1, 
              partName: '', 
              qty: '', 
              pricePerPiece: '', 
              totalPrice: '' 
            }]);
          }
          
          // Set initial inspection notes if available
          if (data.qualityCheck && data.qualityCheck.notes) {
            setFinalInspection(data.qualityCheck.notes);
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
    }, [jobCardId]);

  // State management
  const [carDetails, setCarDetails] = useState({
    carNumber: "ABO-123",
    company: "Toyota",
    model: "Corolla",
    customerName: "John Smith",
    contact: "7990879645",
    email: "john@example.com",
    billingDate: today,
    invoiceNo: "INV-2023-001",
  });

  const [parts, setParts] = useState([
    { id: 1, name: "Oil Filter", quantity: 2, pricePerUnit: 150, total: 300 },
    { id: 2, name: "Air Filter", quantity: 1, pricePerUnit: 250, total: 250 },
    { id: 3, name: "Brake Pads", quantity: 4, pricePerUnit: 400, total: 1600 },
  ]);

  const [services, setServices] = useState([
    {
      id: 1,
      name: "Engine Repair",
      engineer: "Alex Johnson",
      progress: 65,
      status: "In Progress",
      laborCost: 1200,
    },
    {
      id: 2,
      name: "Brake Replacement",
      engineer: "Sarah Williams",
      progress: 100,
      status: "Completed",
      laborCost: 800,
    },
  ]);

  const [summary, setSummary] = useState({
    totalPartsCost: 2150,
    totalLaborCost: 2000,
    subtotal: 4150,
    gstAmount: 747,
    discount: 200,
    totalAmount: 4697,
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [apiResponseMessage, setApiResponseMessage] = useState(null);
  const [showApiResponse, setShowApiResponse] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false); // New state for WhatsApp sending status

  // New part/service dialog states
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

  // Edit price dialog states
  const [showEditPriceDialog, setShowEditPriceDialog] = useState(false);
  const [editItem, setEditItem] = useState({
    id: null,
    type: "",
    field: "",
    value: 0,
  });

  // Calculate totals whenever parts, services, or discount changes
  useEffect(() => {
    calculateTotals();
  }, [parts, services, summary.discount]);

  // Load data based on jobCardId when component mounts
  useEffect(() => {
    if (jobCardIdFromUrl) {
      // You can add an API call here to fetch job card details based on the ID
      console.log(`Loading job card with ID: ${jobCardIdFromUrl}`);
      
      // Example of how you might fetch job card data
      // fetchJobCardData(jobCardIdFromUrl);
    }
  }, [jobCardIdFromUrl]);

  // Example function to fetch job card data (implement as needed)
  const fetchJobCardData = async (id) => {
    try {
      const response = await fetch(
        `https://garage-management-system-cr4w.onrender.com/api/jobcard/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Update state with fetched data
        // setCarDetails({ ...data.carDetails });
        // setParts(data.parts || []);
        // setServices(data.services || []);
      } else {
        console.error("Failed to fetch job card data");
      }
    } catch (error) {
      console.error("Error fetching job card data:", error);
    }
  };

  const calculateTotals = () => {
    const totalPartsCost = parts.reduce((sum, part) => sum + part.total, 0);
    const totalLaborCost = services.reduce(
      (sum, service) => sum + service.laborCost,
      0
    );
    const subtotal = totalPartsCost + totalLaborCost;
    const gstAmount = Math.round(subtotal * 0.18);
    const discount = summary.discount || 0;
    const totalAmount = subtotal + gstAmount - discount;

    setSummary({
      totalPartsCost,
      totalLaborCost,
      subtotal,
      gstAmount,
      discount,
      totalAmount,
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCarDetails({
      ...carDetails,
      [id]: value,
    });
  };

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    setSummary({ ...summary, discount });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Add new part
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

      setParts([...parts, newPartObj]);
      setNewPart({ name: "", quantity: 1, pricePerUnit: 0 });
      setShowNewPartDialog(false);
    }
  };

  // Add new service
  const addNewService = () => {
    const { name, engineer, laborCost } = newService;
    if (name && engineer && laborCost > 0) {
      const newServiceObj = {
        id: Date.now(),
        name,
        engineer,
        progress: 0,
        status: "Pending",
        laborCost: parseFloat(laborCost),
      };

      setServices([...services, newServiceObj]);
      setNewService({ name: "", engineer: "", laborCost: 0 });
      setShowNewServiceDialog(false);
    }
  };

  // Remove part
  const removePart = (id) => {
    setParts(parts.filter((part) => part.id !== id));
  };

  // Remove service
  const removeService = (id) => {
    setServices(services.filter((service) => service.id !== id));
  };

  // Open edit price dialog
  const openEditPrice = (id, type, field, value) => {
    setEditItem({ id, type, field, value });
    setShowEditPriceDialog(true);
  };

  // Save edited price
  const saveEditedPrice = () => {
    const { id, type, field, value } = editItem;
    const newValue = parseFloat(value);

    if (type === "part") {
      const updatedParts = parts.map((part) => {
        if (part.id === id) {
          const updatedPart = { ...part, [field]: newValue };
          updatedPart.total = updatedPart.quantity * updatedPart.pricePerUnit;
          return updatedPart;
        }
        return part;
      });
      setParts(updatedParts);
    } else if (type === "service") {
      const updatedServices = services.map((service) => {
        if (service.id === id) {
          return { ...service, [field]: newValue };
        }
        return service;
      });
      setServices(updatedServices);
    }

    setShowEditPriceDialog(false);
  };

  // Generate bill via API
  const generateBill = async () => {
    setShowPaymentModal(true);
  };

  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(false);
    setShowProcessModal(true);
  };

  const processPayment = async () => {
    // Validate that we have a job card ID
    if (!jobCardIdFromUrl) {
      setApiResponseMessage({
        type: "error",
        message: "No job card ID found in URL. Cannot process payment.",
      });
      setShowApiResponse(true);
      setShowProcessModal(false);
      return;
    }

    const apiData = {
      parts: parts.map((part) => ({
        name: part.name,
        quantity: part.quantity,
        pricePerUnit: part.pricePerUnit,
      })),
      services: services.map((service) => ({
        name: service.name,
        engineer: service.engineer,
        laborCost: service.laborCost,
        status: service.status,
      })),
      discount: summary.discount,
      gstPercentage: 18,
    };

    setShowProcessModal(false);

    try {
      // Use the job card ID from URL parameters
      const response = await fetch(
        `https://garage-management-system-cr4w.onrender.com/api/billing/generate/${jobCardIdFromUrl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(apiData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApiResponseMessage({
          type: "success",
          message: "Bill generated and payment processed successfully!",
        });
        setShowThankYou(true);
      } else {
        setApiResponseMessage({
          type: "error",
          message: data.message || "Failed to generate bill",
        });
      }
    } catch (error) {
      setApiResponseMessage({
        type: "error",
        message: "Network error: " + error.message,
      });
    }

    setShowApiResponse(true);
  };

  const printBill = () => {
    window.print();
  };

  // New function to send bill via WhatsApp
  const sendBillViaWhatsApp = async () => {
    setSendingWhatsApp(true);
    
    try {
      if (!carDetails.contact || carDetails.contact.length < 10) {
        throw new Error("Valid contact number is required to send WhatsApp message");
      }
      
      // Format the bill data for WhatsApp message
      const billData = {
        invoiceNo: carDetails.invoiceNo,
        carNumber: carDetails.carNumber,
        customerName: carDetails.customerName,
        contact: carDetails.contact,
        totalAmount: summary.totalAmount,
        parts: parts,
        services: services,
        summary: summary,
        paymentMethod: paymentMethod,
        jobCardId: jobCardIdFromUrl
      };
      
      // Since the API endpoint might not exist yet, we'll implement a direct WhatsApp URL approach
      // This opens WhatsApp with a pre-filled message containing the bill details
      
      // Create a formatted message for WhatsApp
      const billMessage = `*INVOICE #${carDetails.invoiceNo}*\n
*Customer:* ${carDetails.customerName}
*Vehicle:* ${carDetails.company} ${carDetails.model} (${carDetails.carNumber})
*Date:* ${carDetails.billingDate}\n
*Services:*
${services.map(service => `- ${service.name}: ₹${service.laborCost}`).join('\n')}\n
*Parts:*
${parts.map(part => `- ${part.name} (${part.quantity} x ₹${part.pricePerUnit}): ₹${part.total}`).join('\n')}\n
*Summary:*
Parts: ₹${summary.totalPartsCost}
Labor: ₹${summary.totalLaborCost}
Subtotal: ₹${summary.subtotal}
GST (18%): ₹${summary.gstAmount}
Discount: ₹${summary.discount}
*Total: ₹${summary.totalAmount}*\n
Thank you for choosing our service!`;
      
      // Format phone number (remove any non-digit characters and ensure it has country code)
      let phoneNumber = carDetails.contact.replace(/\D/g, '');
      if (phoneNumber.length === 10) {
        // Add India country code if 10 digits (assuming Indian numbers)
        phoneNumber = `91${phoneNumber}`;
      }
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(billMessage)}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      setApiResponseMessage({
        type: "success",
        message: `WhatsApp message prepared for ${carDetails.customerName}. Please send the message in the opened WhatsApp tab.`,
      });
      
      // Note: In a production app, you would still use the API approach once it's available
      // The commented code below would be used once the API endpoint is implemented
      /*
      const response = await fetch(
        `https://garage-management-system-cr4w.onrender.com/api/billing/send-whatsapp/${jobCardIdFromUrl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(billData),
        }
      );
      
      // Check content type before parsing JSON
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        
        if (response.ok) {
          setApiResponseMessage({
            type: "success",
            message: `Bill sent successfully to ${carDetails.customerName} via WhatsApp!`,
          });
        } else {
          setApiResponseMessage({
            type: "error",
            message: data.message || "Failed to send bill via WhatsApp",
          });
        }
      } else {
        // Handle non-JSON response
        throw new Error("API endpoint not available. Using direct WhatsApp link instead.");
      }
      */
    } catch (error) {
      console.error("WhatsApp send error:", error);
      setApiResponseMessage({
        type: "warning",
        message: error.message || "Couldn't use API to send WhatsApp message. Using direct WhatsApp link instead.",
      });
    } finally {
      setSendingWhatsApp(false);
      setShowApiResponse(true);
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "warning";
      default:
        return "error";
    }
  };

  // Responsive table cell styling
  const tableCellStyle = {
    py: isMobile ? 1 : 2,
    px: isMobile ? 1 : 3,
    fontSize: isMobile ? "0.75rem" : "0.875rem",
  };

  return (
    <Box sx={{ ml: { xs: 0, md: "280px" }, px: { xs: 2, md: 3 }, py: 4 }}>
      <Paper elevation={3} sx={{ mb: 4, p: isMobile ? 2 : 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            mb: 3,
            gap: isMobile ? 2 : 0,
          }}
        >
          <Typography variant="h4" color="primary" fontWeight="bold">
            Billing {jobCardIdFromUrl ? `- Job #${jobCardIdFromUrl}` : ''}
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
            Generate Bill
          </Button>
        </Box>

        {/* Car & Customer Details */}
        {!showThankYou && (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  color="primary"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "&::before": {
                      content: '""',
                      display: "inline-block",
                      width: 4,
                      height: 20,
                      backgroundColor: "primary.main",
                      marginRight: 1,
                      borderRadius: 1,
                    },
                  }}
                >
                  Car & Customer Details
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      id: "carNumber",
                      label: "Car Number",
                      xs: 12,
                      sm: 6,
                      md: 3,
                    },
                    { id: "company", label: "Company", xs: 12, sm: 6, md: 3 },
                    { id: "model", label: "Model", xs: 12, sm: 6, md: 3 },
                    {
                      id: "customerName",
                      label: "Customer Name",
                      xs: 12,
                      sm: 6,
                      md: 3,
                    },
                    { id: "contact", label: "Contact", xs: 12, sm: 6, md: 3 },
                    { id: "email", label: "Email", xs: 12, sm: 6, md: 3 },
                    {
                      id: "billingDate",
                      label: "Date of Billing",
                      type: "date",
                      xs: 12,
                      sm: 6,
                      md: 3,
                    },
                    {
                      id: "invoiceNo",
                      label: "Invoice No.",
                      xs: 12,
                      sm: 6,
                      md: 3,
                    },
                  ].map((field) => (
                    <Grid
                      item
                      xs={field.xs}
                      sm={field.sm}
                      md={field.md}
                      key={field.id}
                    >
                      <TextField
                        id={field.id}
                        label={field.label}
                        variant="outlined"
                        fullWidth
                        margin="dense"
                        value={carDetails[field.id]}
                        onChange={handleInputChange}
                        type={field.type || "text"}
                        InputLabelProps={
                          field.type === "date" ? { shrink: true } : {}
                        }
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Parts Used */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    mb: 2,
                    gap: isMobile ? 2 : 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      "&::before": {
                        content: '""',
                        display: "inline-block",
                        width: 4,
                        height: 20,
                        backgroundColor: "primary.main",
                        marginRight: 1,
                        borderRadius: 1,
                      },
                    }}
                  >
                    Parts Used
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewPartDialog(true)}
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                  >
                    Add Part
                  </Button>
                </Box>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ mb: 2, overflowX: "auto" }}
                >
                  <Table size={isMobile ? "small" : "medium"}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "primary.main" }}>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Sr.No
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Part Name
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Qty
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Price/Piece
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Total Price
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parts.map((part, index) => (
                        <TableRow key={part.id} hover>
                          <TableCell sx={tableCellStyle}>{index + 1}</TableCell>
                          <TableCell sx={tableCellStyle}>{part.name}</TableCell>
                          <TableCell sx={tableCellStyle}>
                            {part.quantity}
                          </TableCell>
                          <TableCell sx={tableCellStyle}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {formatCurrency(part.pricePerUnit).replace(
                                "₹",
                                ""
                              )}
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  openEditPrice(
                                    part.id,
                                    "part",
                                    "pricePerUnit",
                                    part.pricePerUnit
                                  )
                                }
                                sx={{ ml: 1 }}
                              >
                                <EditIcon
                                  fontSize={isMobile ? "small" : "medium"}
                                />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell sx={tableCellStyle}>
                            {formatCurrency(part.total)}
                          </TableCell>
                          <TableCell sx={tableCellStyle}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removePart(part.id)}
                            >
                              <DeleteIcon
                                fontSize={isMobile ? "small" : "medium"}
                              />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    mb: 2,
                    gap: isMobile ? 2 : 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      "&::before": {
                        content: '""',
                        display: "inline-block",
                        width: 4,
                        height: 20,
                        backgroundColor: "primary.main",
                        marginRight: 1,
                        borderRadius: 1,
                      },
                    }}
                  >
                    Service Details
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewServiceDialog(true)}
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                  >
                    Add Service
                  </Button>
                </Box>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ mb: 2, overflowX: "auto" }}
                >
                  <Table size={isMobile ? "small" : "medium"}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "primary.main" }}>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Service
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Engineer
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Progress
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Labour Cost
                        </TableCell>
                        <TableCell sx={{ color: "white", ...tableCellStyle }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id} hover>
                          <TableCell sx={tableCellStyle}>
                            {service.name}
                          </TableCell>
                          <TableCell sx={tableCellStyle}>
                            {service.engineer}
                          </TableCell>
                          <TableCell sx={{ ...tableCellStyle, width: "15%" }}>
                            <LinearProgress
                              variant="determinate"
                              value={service.progress}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </TableCell>
                          <TableCell sx={tableCellStyle}>
                            <Chip
                              label={service.status}
                              color={getStatusColor(service.status)}
                              size={isMobile ? "small" : "medium"}
                            />
                          </TableCell>
                          <TableCell sx={tableCellStyle}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {formatCurrency(service.laborCost).replace(
                                "₹",
                                ""
                              )}
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  openEditPrice(
                                    service.id,
                                    "service",
                                    "laborCost",
                                    service.laborCost
                                  )
                                }
                                sx={{ ml: 1 }}
                              >
                                <EditIcon
                                  fontSize={isMobile ? "small" : "medium"}
                                />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell sx={tableCellStyle}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeService(service.id)}
                            >
                              <DeleteIcon
                                fontSize={isMobile ? "small" : "medium"}
                              />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Bill Summary */}
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  color="primary"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "&::before": {
                      content: '""',
                      display: "inline-block",
                      width: 4,
                      height: 20,
                      backgroundColor: "primary.main",
                      marginRight: 1,
                      borderRadius: 1,
                    },
                  }}
                >
                  Bill Summary
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: isMobile ? 2 : 3, backgroundColor: "grey.50" }}
                >
                  {[
                    {
                      label: "Total Parts Cost:",
                      value: formatCurrency(summary.totalPartsCost),
                    },
                    {
                      label: "Total Labour Cost:",
                      value: formatCurrency(summary.totalLaborCost),
                    },
                    {
                      label: "Subtotal:",
                      value: formatCurrency(summary.subtotal),
                    },
                    {
                      label: "GST (18%):",
                      value: formatCurrency(summary.gstAmount),
                    },
                    {
                      label: "Discount:",
                      value: (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TextField
                            size="small"
                            type="number"
                            value={summary.discount}
                            onChange={handleDiscountChange}
                            sx={{ width: isMobile ? 80 : 100, mr: 1 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                          />
                          <Typography>
                            ({formatCurrency(summary.discount)})
                          </Typography>
                        </Box>
                      ),
                      custom: true,
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: "space-between",
                        mb: 1,
                        py: 1,
                        borderBottom: "1px dashed grey.300",
                        gap: isMobile ? 1 : 0,
                      }}
                    >
                      <Typography>{item.label}</Typography>
                      {item.custom ? (
                        item.value
                      ) : (
                        <Typography>{item.value}</Typography>
                      )}
                    </Box>
                  ))}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      py: 1,
                      fontWeight: "bold",
                      gap: isMobile ? 1 : 0,
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      color="primary.dark"
                      fontSize={isMobile ? "16px" : "18px"}
                    >
                      Total Amount:
                    </Typography>
                    <Typography
                      fontWeight="bold"
                      color="primary.dark"
                      fontSize={isMobile ? "16px" : "18px"}
                    >
                      {formatCurrency(summary.totalAmount)}
                    </Typography>
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </>
        )}

        {/* Thank You Message (shown after payment) */}
        {showThankYou && (
          <Box
            sx={{
              textAlign: "center",
              py: isMobile ? 3 : 5,
              px: isMobile ? 2 : 4,
              backgroundColor: "grey.50",
              borderRadius: 2,
            }}
          >
            <CheckIcon
              sx={{
                fontSize: isMobile ? 40 : 60,
                color: "primary.main",
                mb: 2,
              }}
            />
            <Typography
              variant={isMobile ? "h5" : "h4"}
              color="primary.dark"
              gutterBottom
            >
              Thank You!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your payment has been processed successfully and the receipt has
              been sent to the customer.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Invoice #{carDetails.invoiceNo} | Amount:{" "}
              {formatCurrency(summary.totalAmount)}
            </Typography>
            
            {/* Button Container - Modified to include WhatsApp button */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              gap: 2,
              mt: 2
            }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={printBill}
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
              >
                Print Bill
              </Button>
              
              {/* New WhatsApp Send Button */}
              <Button
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon />}
                onClick={sendBillViaWhatsApp}
                disabled={sendingWhatsApp}
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
                sx={{ 
                  backgroundColor: '#25d366',
                  '&:hover': {
                    backgroundColor: '#128C7E',
                  }
                }}
              >
                {sendingWhatsApp ? "Sending..." : "Send Bill via WhatsApp"}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Payment Method Dialog */}
      <Dialog
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Select Payment Method</DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                sx={{ py: isMobile ? 1 : 1.5 }}
                startIcon={<AccountBalanceIcon />}
                onClick={() => selectPaymentMethod("Cash")}
              >
                Cash Payment
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ py: isMobile ? 1 : 1.5 }}
                startIcon={<CreditCardIcon />}
                onClick={() => selectPaymentMethod("Card")}
              >
                Credit/Debit Card
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                sx={{ py: isMobile ? 1 : 1.5 }}
                startIcon={<AccountBalanceIcon />}
                onClick={() => selectPaymentMethod("Online")}
              >
                Online Payment
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowPaymentModal(false)}
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Processing Payment Dialog */}
      <Dialog
        open={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Processing {paymentMethod} Payment</DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <LinearProgress sx={{ mb: 3 }} />
            <Typography>
              Processing your payment via {paymentMethod}...
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowProcessModal(false)}
            color="error"
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Cancel
          </Button>
          <Button
            onClick={processPayment}
            variant="contained"
            color="primary"
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog
        open={showEditPriceDialog}
        onClose={() => setShowEditPriceDialog(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>
          Edit {editItem.field === "pricePerUnit" ? "Part Price" : "Labor Cost"}
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label={
              editItem.field === "pricePerUnit"
                ? "New Price per Unit"
                : "New Labor Cost"
            }
            type="number"
            fullWidth
            variant="outlined"
            value={editItem.value}
            onChange={(e) =>
              setEditItem({ ...editItem, value: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowEditPriceDialog(false)}
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveEditedPrice}
            variant="contained"
            color="primary"
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Part Dialog */}
      <Dialog
        open={showNewPartDialog}
        onClose={() => setShowNewPartDialog(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Add New Part</DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Part Name"
            fullWidth
            variant="outlined"
            value={newPart.name}
            onChange={(e) =>
              setNewPart({ ...newPart, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={newPart.quantity}
            onChange={(e) =>
              setNewPart({ ...newPart, quantity: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Price per Unit"
            type="number"
            fullWidth
            variant="outlined"
            value={newPart.pricePerUnit}
            onChange={(e) =>
              setNewPart({ ...newPart, pricePerUnit: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowNewPartDialog(false)}
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Cancel
          </Button>
          <Button
            onClick={addNewPart}
            variant="contained"
            color="primary"
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Add Part
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Service Dialog */}
      <Dialog
        open={showNewServiceDialog}
        onClose={() => setShowNewServiceDialog(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Service Name"
            fullWidth
            variant="outlined"
            value={newService.name}
            onChange={(e) =>
              setNewService({ ...newService, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Engineer Name"
            fullWidth
            variant="outlined"
            value={newService.engineer}
            onChange={(e) =>
              setNewService({ ...newService, engineer: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Labor Cost"
            type="number"
            fullWidth
            variant="outlined"
            value={newService.laborCost}
            onChange={(e) =>
              setNewService({ ...newService, laborCost: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowNewServiceDialog(false)}
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Cancel
          </Button>
          <Button
            onClick={addNewService}
            variant="contained"
            color="primary"
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Add Service
          </Button>
        </DialogActions>
      </Dialog>

      {/* API Response Snackbar */}
      <Snackbar
        open={showApiResponse}
        autoHideDuration={6000}
        onClose={() => setShowApiResponse(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowApiResponse(false)}
          severity={apiResponseMessage?.type || "info"}
          sx={{ width: "100%" }}
        >
          {apiResponseMessage?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AutoServeBilling;