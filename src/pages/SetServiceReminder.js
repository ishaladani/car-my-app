import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CssBaseline,
  Paper,
  useTheme,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SetServiceReminder = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  
  // Get garage ID with error handling
  const getGarageId = useCallback(() => {
    try {
      return localStorage.getItem("garageId") || localStorage.getItem("garage_id") || null;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }, []);
  
  const [garageId, setGarageId] = useState(getGarageId);
  
  // State for customer data
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState('');
  
  // State for form fields
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderType, setReminderType] = useState('Status');
  const [customerMessage, setCustomerMessage] = useState('');
  
  // State for validation
  const [dateError, setDateError] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [messageError, setMessageError] = useState('');
  
  // State for feedback and loading
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // For search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // State for calendar dialog
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateFromCalendar, setSelectedDateFromCalendar] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Check garage ID and redirect if needed
  useEffect(() => {
    const currentGarageId = getGarageId();
    setGarageId(currentGarageId);
    
    if (!currentGarageId) {
      navigate("/login");
    }
  }, [navigate, getGarageId]);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    if (!garageId) return;
    
    setCustomersLoading(true);
    setCustomersError('');
    
    try {
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/garage/jobCards/garage/${garageId}`,
        {
          timeout: 30000 // 30 second timeout
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        // Transform job card data to customer format
        const customerData = response.data.map((jobCard, index) => ({
          id: jobCard._id || index,
          name: jobCard.customerName || jobCard.customer?.name || 'Unknown Customer',
          vehicle: `${jobCard.carBrand || jobCard.company || 'Unknown'} ${jobCard.carModel || jobCard.model || ''}`.trim(),
          carNumber: jobCard.carNumber || jobCard.registrationNumber || '',
          contact: jobCard.contactNumber || jobCard.customer?.contact || '',
          email: jobCard.email || jobCard.customer?.email || '',
          jobCardId: jobCard._id,
          status: jobCard.status || 'Unknown',
          // Additional fields that might be useful
          createdAt: jobCard.createdAt,
          updatedAt: jobCard.updatedAt,
          engineerId: jobCard.engineerId
        }));

        // Remove duplicates based on car number or customer name
        const uniqueCustomers = customerData.filter((customer, index, self) => {
          return index === self.findIndex(c => 
            (c.carNumber && c.carNumber === customer.carNumber) ||
            (c.name && c.name === customer.name && c.vehicle === customer.vehicle)
          );
        });

        setCustomers(uniqueCustomers);
        console.log('Fetched customers:', uniqueCustomers);
      } else {
        setCustomers([]);
        setCustomersError('No customer data found');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      
      let errorMsg = 'Failed to load customer data';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Please check your connection.';
      } else if (error.response) {
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = 'Network error. Please check your connection.';
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      setCustomersError(errorMsg);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  }, [garageId]);

  // Fetch customers on component mount and when garageId changes
  useEffect(() => {
    if (garageId) {
      fetchCustomers();
    }
  }, [garageId, fetchCustomers]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Date validation function
  const validateDate = (dateString) => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    // Additional validation - check if date is valid
    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day &&
           date >= new Date(); // Ensure date is not in the past
  };

  // Input sanitization
  const sanitizeInput = (input) => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/[<>]/g, '');
  };

  // Handle search input changes with debouncing
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCustomerError('');
    
    if (value.length > 0) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.carNumber.toLowerCase().includes(value.toLowerCase()) ||
        customer.vehicle.toLowerCase().includes(value.toLowerCase()) ||
        (customer.contact && customer.contact.includes(value))
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setSelectedCustomer(null);
    }
  }, [customers]);

  // Handle selecting a customer from search results
  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setShowResults(false);
    setCustomerError('');
  }, []);

  // Handle date input with validation
  const handleDateChange = (e) => {
    const value = e.target.value;
    setReminderDate(value);
    
    if (value && !validateDate(value)) {
      setDateError('Please enter a valid future date in MM/DD/YYYY format');
    } else {
      setDateError('');
    }
  };

  // Handle message input with sanitization
  const handleMessageChange = (e) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setCustomerMessage(sanitizedValue);
    
    if (sanitizedValue.trim()) {
      setMessageError('');
    }
  };

  // Date formatting functions
  const formatDateToDisplay = (date) => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    
    return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
  };

  // Calendar functions
  const handleCalendarOpen = () => {
    setShowCalendar(true);
    if (reminderDate) {
      const [month, day, year] = reminderDate.split('/').map(Number);
      if (month && day && year) {
        setCalendarDate(new Date(year, month - 1, day));
      }
    }
  };

  const handleCalendarClose = () => {
    setShowCalendar(false);
  };

  const handleDateSelect = (date) => {
    const formattedDate = formatDateToDisplay(date);
    setReminderDate(formattedDate);
    setSelectedDateFromCalendar(date);
    setDateError('');
    setShowCalendar(false);
  };

  const generateCalendarDays = (currentDate) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Adjust to show full week
    startDate.setDate(startDate.getDate() - startDate.getDay());
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days = [];
    const currentDateForComparison = new Date();
    currentDateForComparison.setHours(0, 0, 0, 0);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = date < currentDateForComparison;
      const isSelected = selectedDateFromCalendar && 
        date.toDateString() === selectedDateFromCalendar.toDateString();
      
      days.push({
        date: new Date(date),
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelected
      });
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    if (!selectedCustomer) {
      setCustomerError('Please select a customer');
      isValid = false;
    }
    
    if (!reminderDate) {
      setDateError('Please enter a reminder date');
      isValid = false;
    } else if (!validateDate(reminderDate)) {
      setDateError('Please enter a valid future date in MM/DD/YYYY format');
      isValid = false;
    }
    
    if (!customerMessage.trim()) {
      setMessageError('Please enter a message for the customer');
      isValid = false;
    }
    
    return isValid;
  };

  // Clear all messages
  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setShowSuccess(false);
    setShowError(false);
  };

  // Reset form
  const resetForm = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setReminderDate('');
    setReminderType('Status');
    setCustomerMessage('');
    setDateError('');
    setCustomerError('');
    setMessageError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    clearMessages();
    
    // Validate form
    if (!validateForm()) {
      setErrorMessage('Please fix the errors above');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare the request data - simplified to match the curl command
      const reminderData = {
        carNumber: selectedCustomer.carNumber || "",
        reminderDate: formatDateForAPI(reminderDate) || "",
        message: sanitizeInput(customerMessage) || ""
      };
      
      console.log('Sending reminder data:', reminderData);
      
      // API call with correct endpoint
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/reminders/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminderData),
      });
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (!response.ok) {
        const errorMsg = result.message || result.error || `Server error: ${response.status}`;
        throw new Error(errorMsg);
      }
      
      // Success feedback
      setSuccessMessage(result.message || 'Reminder sent successfully!');
      setShowSuccess(true);
      
      // Reset form after a delay
      timeoutRef.current = setTimeout(() => {
        resetForm();
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error sending reminder:', error);
      
      let errorMsg = 'Failed to send reminder. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMsg = 'Request timeout. Please check your connection and try again.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle closing snackbars
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage('');
  };

  const handleCloseError = () => {
    setShowError(false);
    setErrorMessage('');
  };

  // Retry loading customers
  const handleRetryLoadCustomers = () => {
    setCustomersError('');
    fetchCustomers();
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto',
      pt: 3
    }}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 2, 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Set Service Reminder
          </Typography>
        </Box>

        {/* Customer Loading Error */}
        {customersError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRetryLoadCustomers}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            {customersError}
          </Alert>
        )}
        
        <Card sx={{ 
          mb: 4, 
          overflow: 'visible', 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Customer Search */}
                  <Box sx={{ position: 'relative' }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      Search Customer *
                    </Typography>
                    
                    {customersLoading ? (
                      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                    ) : (
                      <TextField
                        fullWidth
                        placeholder="Enter Customer Name, Car Number, or Vehicle"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        error={!!customerError}
                        helperText={customerError || `${customers.length} customers available`}
                        disabled={customers.length === 0}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    
                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && !customersLoading && (
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          position: 'absolute', 
                          width: '100%', 
                          maxHeight: 300, 
                          overflow: 'auto',
                          zIndex: 1000,
                          mt: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {searchResults.map((customer) => (
                          <Box 
                            key={customer.id}
                            sx={{ 
                              p: 2, 
                              cursor: 'pointer',
                              '&:hover': { 
                                bgcolor: theme.palette.action.hover 
                              },
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <Typography variant="body1" fontWeight={500}>
                              {customer.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {customer.vehicle} (#{customer.carNumber})
                            </Typography>
                            {customer.contact && (
                              <Typography variant="caption" color="text.secondary">
                                Contact: {customer.contact}
                              </Typography>
                            )}
                            {customer.status && (
                              <Typography variant="caption" color="primary" sx={{ ml: 2 }}>
                                Status: {customer.status}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Paper>
                    )}
                    
                    {/* No Results Message */}
                    {showResults && searchResults.length === 0 && searchTerm && !customersLoading && (
                      <Paper
                        elevation={1}
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          p: 2,
                          mt: 0.5,
                          textAlign: 'center',
                          zIndex: 1000,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No customers found matching "{searchTerm}"
                        </Typography>
                      </Paper>
                    )}
                    
                    {/* Selected Customer Info */}
                    {selectedCustomer && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.primary.light}`,
                          bgcolor: theme.palette.primary.lightest || 'rgba(25, 118, 210, 0.08)',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Selected Customer:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedCustomer.name} - {selectedCustomer.vehicle}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          Car #: {selectedCustomer.carNumber}
                        </Typography>
                        {selectedCustomer.contact && (
                          <Typography variant="body2" color="text.secondary">
                            Contact: {selectedCustomer.contact}
                          </Typography>
                        )}
                        {selectedCustomer.email && (
                          <Typography variant="body2" color="text.secondary">
                            Email: {selectedCustomer.email}
                          </Typography>
                        )}
                      </Paper>
                    )}
                  </Box>
                  
                  {/* Reminder Date */}
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      Set Reminder Date *
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="mm/dd/yyyy"
                      variant="outlined"
                      value={reminderDate}
                      onChange={handleDateChange}
                      error={!!dateError}
                      helperText={dateError || 'Enter a future date in MM/DD/YYYY format or click calendar icon'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconButton
                              onClick={handleCalendarOpen}
                              size="small"
                              sx={{ p: 0.5 }}
                            >
                              <CalendarIcon color="action" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  {/* Reminder Type */}
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      Reminder Type
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={reminderType}
                        onChange={(e) => setReminderType(e.target.value)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Reminder type' }}
                      >
                        <MenuItem value="Status">Status Update</MenuItem>
                        <MenuItem value="Pending">Pending Service</MenuItem>
                        <MenuItem value="Completed">Service Completed</MenuItem>
                        <MenuItem value="Maintenance">Maintenance Due</MenuItem>
                        <MenuItem value="Inspection">Inspection Required</MenuItem>
                        <MenuItem value="Follow-up">Follow-up Required</MenuItem>
                        <MenuItem value="Payment">Payment Reminder</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Customer Message */}
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      Customer Message *
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Type your message here..."
                      variant="outlined"
                      value={customerMessage}
                      onChange={handleMessageChange}
                      error={!!messageError}
                      helperText={messageError}
                      inputProps={{
                        maxLength: 500
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {customerMessage.length}/500 characters
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || customersLoading || customers.length === 0}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                    },
                    '&:disabled': {
                      boxShadow: 'none',
                    }
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reminder'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
      
      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      
      {/* Calendar Dialog */}
      <Dialog
        open={showCalendar}
        onClose={handleCalendarClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Select Reminder Date
            </Typography>
            <IconButton onClick={handleCalendarClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, pb: 2 }}>
          {/* Calendar Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
            px: 1
          }}>
            <IconButton 
              onClick={() => navigateMonth(-1)}
              sx={{ 
                bgcolor: theme.palette.action.hover,
                '&:hover': { bgcolor: theme.palette.action.selected }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Typography variant="h6" fontWeight={500}>
              {calendarDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </Typography>
            
            <IconButton 
              onClick={() => navigateMonth(1)}
              sx={{ 
                bgcolor: theme.palette.action.hover,
                '&:hover': { bgcolor: theme.palette.action.selected },
                transform: 'rotate(180deg)'
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
          
          {/* Days of Week Header */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1,
            mb: 1
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Box key={day} sx={{ 
                textAlign: 'center', 
                py: 1,
                fontWeight: 600,
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}>
                {day}
              </Box>
            ))}
          </Box>
          
          {/* Calendar Days */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1
          }}>
            {generateCalendarDays(calendarDate).map((dayObj, index) => (
              <Button
                key={index}
                variant={dayObj.isSelected ? "contained" : "text"}
                onClick={() => !dayObj.isPast && handleDateSelect(dayObj.date)}
                disabled={dayObj.isPast}
                sx={{
                  minWidth: 'auto',
                  height: 40,
                  p: 0,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  color: dayObj.isCurrentMonth 
                    ? dayObj.isToday 
                      ? theme.palette.primary.main
                      : theme.palette.text.primary
                    : theme.palette.text.disabled,
                  backgroundColor: dayObj.isSelected 
                    ? theme.palette.primary.main
                    : dayObj.isToday 
                      ? theme.palette.primary.light + '20'
                      : 'transparent',
                  fontWeight: dayObj.isToday ? 600 : 400,
                  '&:hover': {
                    backgroundColor: dayObj.isSelected 
                      ? theme.palette.primary.dark
                      : dayObj.isPast 
                        ? 'transparent'
                        : theme.palette.action.hover,
                  },
                  '&:disabled': {
                    color: theme.palette.text.disabled,
                    backgroundColor: 'transparent',
                  },
                  ...(dayObj.isSelected && {
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  })
                }}
              >
                {dayObj.day}
              </Button>
            ))}
          </Box>
          
          {/* Today Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleDateSelect(new Date())}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Select Today
            </Button>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCalendarClose}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SetServiceReminder;