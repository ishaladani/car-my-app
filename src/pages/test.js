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
  Alert,
  useMediaQuery,
  useTheme,
  Stack,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Check as CheckIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const AutoServeBilling = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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

  // Section Title Component
  const SectionTitle = ({ icon, title }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 2,
      borderBottom: `2px solid ${theme.palette.primary.main}`,
      pb: 1
    }}>
      {icon}
      <Typography 
        variant="h6" 
        color="primary.dark" 
        fontWeight="600" 
        sx={{ ml: 1 }}
      >
        {title}
      </Typography>
    </Box>
  );

  // Responsive Table Component
  const ResponsiveTable = ({ headers, data, renderRow }) => {
    if (isMobile) {
      return (
        <Stack spacing={2}>
          {data.map((item, index) => (
            <Card key={item.id} variant="outlined" sx={{ position: 'relative' }}>
              <CardContent sx={{ pb: 1 }}>
                {renderRow(item, index, true)}
              </CardContent>
            </Card>
          ))}
        </Stack>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Table size={isTablet ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.primary.main,
            }}>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold' }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}>
                {renderRow(item, index, false)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Navigation Sidebar (for desktop)
  const Sidebar = () => (
    <Box 
      sx={{ 
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        width: 80,
        backgroundColor: theme.palette.primary.dark,
        color: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        alignItems: 'center',
        pt: 4
      }}
    >
      <Avatar sx={{ 
        bgcolor: 'white', 
        color: theme.palette.primary.dark,
        width: 50,
        height: 50,
        mb: 4
      }}>
        <SpeedIcon />
      </Avatar>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <IconButton sx={{ color: 'white' }}>
          <HomeIcon />
        </IconButton>
        <IconButton sx={{ color: 'white' }}>
          <CarIcon />
        </IconButton>
        <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}>
          <ReceiptIcon />
        </IconButton>
        <IconButton sx={{ color: 'white' }}>
          <SettingsIcon />
        </IconButton>
        <IconButton sx={{ color: 'white' }}>
          <PersonIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Sidebar />
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, md: 4 }, 
          px: { xs: 2, md: 4 },
          ml: { md: '80px' },
          width: { md: 'calc(100% - 80px)' }
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            p: { xs: 2, md: 3 }, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: `1px solid ${theme.palette.grey[200]}`
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center', 
            mb: 3 
          }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              color="primary.dark" 
              fontWeight="bold"
              sx={{ mb: isMobile ? 2 : 0 }}
            >
              <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Billing Dashboard
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ReceiptIcon />}
              onClick={generateBill}
              disabled={showThankYou}
              size={isMobile ? "medium" : "large"}
              sx={{ 
                borderRadius: 2, 
                px: 3, 
                py: isMobile ? 1 : 1.5,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Generate Bill
            </Button>
          </Box>

          {/* Car & Customer Details */}
          {!showThankYou && (
            <>
              <Card sx={{ 
                mb: 4, 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                border: `1px solid ${theme.palette.grey[200]}`}`
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <SectionTitle 
                    icon={<CarIcon color="primary" />} 
                    title="Car & Customer Details" 
                  />
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CarIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
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
              <Card sx={{ 
                mb: 4, 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                border: `1px solid ${theme.palette.grey[200]}`
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <SectionTitle 
                    icon={<SettingsIcon color="primary" />} 
                    title="Parts Used" 
                  />
                  
                  <ResponsiveTable
                    headers={['Sr.No', 'Part Name', 'Qty', 'Price/Piece', 'Total Price', 'Action']}
                    data={parts}
                    renderRow={(part, index, isMobileView) => {
                      if (isMobileView) {
                        return (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">{part.name}</Typography>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => removePart(part.id)}
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Quantity</Typography>
                                <Typography variant="body1">{part.quantity}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Price/Unit</Typography>
                                <Typography variant="body1">
                                  {formatCurrency(part.pricePerUnit).replace('₹', '')}
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => openEditPrice(part.id, 'part', 'pricePerUnit', part.pricePerUnit)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Total</Typography>
                                <Typography variant="body1" fontWeight="bold" color="primary.dark">
                                  {formatCurrency(part.total)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </>
                        );
                      }
                      
                      return (
                        <>
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
                        </>
                      );
                    }}
                  />
                  
                  <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewPartDialog(true)}
                    sx={{ 
                      borderRadius: 2, 
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Add Part
                  </Button>
                </CardContent>
              </Card>

              {/* Service Details */}
              <Card sx={{ 
                mb: 4, 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                border: `1px solid ${theme.palette.grey[200]}`
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <SectionTitle 
                    icon={<SettingsIcon color="primary" />} 
                    title="Service Details" 
                  />
                  
                  <ResponsiveTable
                    headers={['Service', 'Engineer', 'Progress', 'Status', 'Labour Cost', 'Action']}
                    data={services}
                    renderRow={(service, index, isMobileView) => {
                      if (isMobileView) {
                        return (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">{service.name}</Typography>
                              <Chip 
                                label={service.status} 
                                color={getStatusColor(service.status)}
                                size="small"
                                sx={{ position: 'absolute', top: 12, right: 8 }}
                              />
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Engineer</Typography>
                                <Typography variant="body1">{service.engineer}</Typography>
                              </Grid>
                              <Grid item xs={12} sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">Progress</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={service.progress} 
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 4,
                                      flexGrow: 1,
                                      mr: 1
                                    }}
                                  />
                                  <Typography variant="body2">{service.progress}%</Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">Labour Cost</Typography>
                                <Typography variant="body1">
                                  {formatCurrency(service.laborCost)}
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => openEditPrice(service.id, 'service', 'laborCost', service.laborCost)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Typography>
                              </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => removeService(service.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </>
                        );
                      }
                      
                      return (
                        <>
                          <TableCell>{service.name}</TableCell>
                          <TableCell>{service.engineer}</TableCell>
                          <TableCell sx={{ width: '15%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={service.progress} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  flexGrow: 1,
                                  mr: 1
                                }}
                              />
                              <Typography variant="body2">{service.progress}%</Typography>
                            </Box>
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
                        </>
                      );
                    }}
                  />
                  
                  <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewServiceDialog(true)}
                    sx={{ 
                      borderRadius: 2, 
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Add Service
                  </Button>
                </CardContent>
              </Card>

              {/* Bill Summary */}
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                border: `1px solid ${theme.palette.grey[200]