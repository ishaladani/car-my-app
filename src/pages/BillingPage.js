import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const AutoServeBilling = () => {
  const today = new Date().toISOString().split('T')[0];
   const token = localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : '';
  
  
  // State management
  const [carDetails, setCarDetails] = useState({
    carNumber: 'ABO-123',
    company: 'Toyota',
    model: 'Corolla',
    customerName: 'John Smith',
    contact: '9876543210',
    email: 'john@example.com',
    billingDate: today,
    invoiceNo: 'INV-2023-001'
  });

  const [parts, setParts] = useState([
    { id: 1, name: 'Oil Filter', quantity: 2, pricePerUnit: 150, total: 300 },
    { id: 2, name: 'Air Filter', quantity: 1, pricePerUnit: 250, total: 250 },
    { id: 3, name: 'Brake Pads', quantity: 4, pricePerUnit: 400, total: 1600 }
  ]);

  const [services, setServices] = useState([
    { 
      id: 1, 
      name: 'Engine Repair', 
      engineer: 'Alex Johnson', 
      progress: 65, 
      status: 'In Progress', 
      laborCost: 1200 
    },
    { 
      id: 2, 
      name: 'Brake Replacement', 
      engineer: 'Sarah Williams', 
      progress: 100, 
      status: 'Completed', 
      laborCost: 800 
    }
  ]);

  const [summary, setSummary] = useState({
    totalPartsCost: 2150,
    totalLaborCost: 2000,
    subtotal: 4150,
    gstAmount: 747,
    discount: 200,
    totalAmount: 4697
  });

   
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [apiResponseMessage, setApiResponseMessage] = useState(null);
  const [showApiResponse, setShowApiResponse] = useState(false);
  
  // New part/service dialog states
  const [showNewPartDialog, setShowNewPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({ name: '', quantity: 1, pricePerUnit: 0 });
  
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
  const [newService, setNewService] = useState({ name: '', engineer: '', laborCost: 0 });

  // Edit price dialog states
  const [showEditPriceDialog, setShowEditPriceDialog] = useState(false);
  const [editItem, setEditItem] = useState({ id: null, type: '', field: '', value: 0 });

  // Calculate totals whenever parts, services, or discount changes
  useEffect(() => {
    calculateTotals();
  }, [parts, services, summary.discount]);

  const calculateTotals = () => {
    // Calculate total parts cost
    const totalPartsCost = parts.reduce((sum, part) => sum + part.total, 0);
    
    // Calculate total labor cost
    const totalLaborCost = services.reduce((sum, service) => sum + service.laborCost, 0);
    
    // Calculate subtotal
    const subtotal = totalPartsCost + totalLaborCost;
    
    // Calculate GST (18%)
    const gstAmount = Math.round(subtotal * 0.18);
    
    // Get current discount
    const discount = summary.discount || 0;
    
    // Calculate total
    const totalAmount = subtotal + gstAmount - discount;
    
    // Update summary
    setSummary({
      totalPartsCost,
      totalLaborCost,
      subtotal,
      gstAmount,
      discount,
      totalAmount
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCarDetails({
      ...carDetails,
      [id]: value
    });
  };

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    setSummary({ ...summary, discount });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
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
        total: parseInt(quantity) * parseFloat(pricePerUnit)
      };
      
      setParts([...parts, newPartObj]);
      setNewPart({ name: '', quantity: 1, pricePerUnit: 0 });
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
        status: 'Pending',
        laborCost: parseFloat(laborCost)
      };
      
      setServices([...services, newServiceObj]);
      setNewService({ name: '', engineer: '', laborCost: 0 });
      setShowNewServiceDialog(false);
    }
  };

  // Remove part
  const removePart = (id) => {
    setParts(parts.filter(part => part.id !== id));
  };

  // Remove service
  const removeService = (id) => {
    setServices(services.filter(service => service.id !== id));
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
    
    if (type === 'part') {
      const updatedParts = parts.map(part => {
        if (part.id === id) {
          const updatedPart = { ...part, [field]: newValue };
          updatedPart.total = updatedPart.quantity * updatedPart.pricePerUnit;
          return updatedPart;
        }
        return part;
      });
      setParts(updatedParts);
    } else if (type === 'service') {
      const updatedServices = services.map(service => {
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
    // First show payment modal
    setShowPaymentModal(true);
  };

  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(false);
    setShowProcessModal(true);
  };

  const processPayment = async () => {
    // Format the data for the API
    const apiData = {
      parts: parts.map(part => ({
        name: part.name,
        quantity: part.quantity,
        pricePerUnit: part.pricePerUnit
      })),
      services: services.map(service => ({
        name: service.name,
        engineer: service.engineer,
        laborCost: service.laborCost,
        status: service.status
      })),
      discount: summary.discount,
      gstPercentage: 18
    };

    // Close process modal
    setShowProcessModal(false);

    try {
      const response = await fetch(
        'https://garage-management-system-cr4w.onrender.com/api/billing/generate/680f20ab54c9b20411680d56',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
                },
          body: JSON.stringify(apiData)
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setApiResponseMessage({
          type: 'success',
          message: 'Bill generated and payment processed successfully!'
        });
        // Show thank you message
        setShowThankYou(true);
      } else {
        setApiResponseMessage({
          type: 'error',
          message: data.message || 'Failed to generate bill'
        });
      }
    } catch (error) {
      setApiResponseMessage({
        type: 'error',
        message: 'Network error: ' + error.message
      });
    }
    
    setShowApiResponse(true);
  };

  const printBill = () => {
    window.print();
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Billing
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<ReceiptIcon />}
            onClick={generateBill}
            disabled={showThankYou}
          >
            Generate Bill
          </Button>
        </Box>

        {/* Car & Customer Details */}
        {!showThankYou && (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 4,
                    height: 20,
                    backgroundColor: 'primary.main',
                    marginRight: 1,
                    borderRadius: 1
                  }
                }}>
                  Car & Customer Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      id="carNumber"
                      label="Car Number"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      value={carDetails.carNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      id="company"
                      label="Company"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      value={carDetails.company}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      id="model"
                      label="Model"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      value={carDetails.model}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      id="customerName"
                      label="Customer Name"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      value={carDetails.customerName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      id="contact"
                      label="Contact"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      value={carDetails.contact}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      id="email"
                      label="Email"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      value={carDetails.email}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      id="billingDate"
                      label="Date of Billing"
                      variant="outlined"
                      type="date"
                      fullWidth
                      margin="dense"
                      value={carDetails.billingDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      id="invoiceNo"
                      label="Invoice No."
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      value={carDetails.invoiceNo}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Parts Used */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 4,
                    height: 20,
                    backgroundColor: 'primary.main',
                    marginRight: 1,
                    borderRadius: 1
                  }
                }}>
                  Parts Used
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white' }}>Sr.No</TableCell>
                        <TableCell sx={{ color: 'white' }}>Part Name</TableCell>
                        <TableCell sx={{ color: 'white' }}>Qty</TableCell>
                        <TableCell sx={{ color: 'white' }}>Price/Piece</TableCell>
                        <TableCell sx={{ color: 'white' }}>Total Price</TableCell>
                        <TableCell sx={{ color: 'white' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parts.map((part, index) => (
                        <TableRow key={part.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{part.name}</TableCell>
                          <TableCell>{part.quantity}</TableCell>
                          <TableCell>
                            {formatCurrency(part.pricePerUnit).replace('₹', '')}
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => openEditPrice(part.id, 'part', 'pricePerUnit', part.pricePerUnit)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                          <TableCell>{formatCurrency(part.total)}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => removePart(part.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => setShowNewPartDialog(true)}
                >
                  Add Part
                </Button>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 4,
                    height: 20,
                    backgroundColor: 'primary.main',
                    marginRight: 1,
                    borderRadius: 1
                  }
                }}>
                  Service Details
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white' }}>Service</TableCell>
                        <TableCell sx={{ color: 'white' }}>Engineer</TableCell>
                        <TableCell sx={{ color: 'white' }}>Progress</TableCell>
                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                        <TableCell sx={{ color: 'white' }}>Labour Cost</TableCell>
                        <TableCell sx={{ color: 'white' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id} hover>
                          <TableCell>{service.name}</TableCell>
                          <TableCell>{service.engineer}</TableCell>
                          <TableCell sx={{ width: '15%' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={service.progress} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={service.status} 
                              color={getStatusColor(service.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(service.laborCost).replace('₹', '')}
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => openEditPrice(service.id, 'service', 'laborCost', service.laborCost)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => removeService(service.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => setShowNewServiceDialog(true)}
                >
                  Add Service
                </Button>
              </CardContent>
            </Card>

            {/* Bill Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 4,
                    height: 20,
                    backgroundColor: 'primary.main',
                    marginRight: 1,
                    borderRadius: 1
                  }
                }}>
                  Bill Summary
                </Typography>
                <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, py: 1, borderBottom: '1px dashed grey.300' }}>
                    <Typography>Total Parts Cost:</Typography>
                    <Typography>{formatCurrency(summary.totalPartsCost)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, py: 1, borderBottom: '1px dashed grey.300' }}>
                    <Typography>Total Labour Cost:</Typography>
                    <Typography>{formatCurrency(summary.totalLaborCost)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, py: 1, borderBottom: '1px dashed grey.300' }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(summary.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, py: 1, borderBottom: '1px dashed grey.300' }}>
                    <Typography>GST (18%):</Typography>
                    <Typography>{formatCurrency(summary.gstAmount)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, py: 1, borderBottom: '1px dashed grey.300' }}>
                    <Typography>Discount:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={summary.discount}
                        onChange={handleDiscountChange}
                        sx={{ width: 100, mr: 1 }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                      <Typography>({formatCurrency(summary.discount)})</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, fontWeight: 'bold' }}>
                    <Typography fontWeight="bold" color="primary.dark" fontSize="18px">Total Amount:</Typography>
                    <Typography fontWeight="bold" color="primary.dark" fontSize="18px">{formatCurrency(summary.totalAmount)}</Typography>
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </>
        )}

        {/* Thank You Message (shown after payment) */}
        {showThankYou && (
          <Box sx={{ textAlign: 'center', py: 5, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <CheckIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" color="primary.dark" gutterBottom>
              Thank You!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your payment has been processed successfully and the receipt has been sent to the customer.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Invoice #{carDetails.invoiceNo} | Amount: {formatCurrency(summary.totalAmount)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={printBill}
              sx={{ mt: 2 }}
            >
              Print Bill
            </Button>
          </Box>
        )}
      </Paper>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <DialogTitle>Select Payment Method</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            sx={{ mb: 2, py: 1.5 }}
            startIcon={<AccountBalanceIcon />}
            onClick={() => selectPaymentMethod('Cash')}
          >
            Cash Payment
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mb: 2, py: 1.5 }}
            startIcon={<CreditCardIcon />}
            onClick={() => selectPaymentMethod('Card')}
          >
            Credit/Debit Card
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ py: 1.5 }}
            startIcon={<AccountBalanceIcon />}
            onClick={() => selectPaymentMethod('Online')}
          >
            Online Payment
          </Button>
        </DialogContent>
              </Dialog>
            </Container>
        );
      };
      
      export default AutoServeBilling;

        