import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Sample customer data for autocomplete
const customers = [
  { id: 1, name: 'John Smith', vehicle: 'Toyota Camry', carNumber: '1234567890' },
  { id: 2, name: 'Sarah Johnson', vehicle: 'Honda Accord', carNumber: '1234567891' },
  { id: 3, name: 'Michael Brown', vehicle: 'Ford F-150', carNumber: '1234567892' },
  { id: 4, name: 'Jennifer Lee', vehicle: 'Tesla Model 3', carNumber: '1234567893' },
  { id: 5, name: 'Robert Wilson', vehicle: 'Chevrolet Silverado', carNumber: '1234567894' },
];

const SetServiceReminder = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for form fields
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderType, setReminderType] = useState('Status');
  const [customerMessage, setCustomerMessage] = useState('');
  
  // State for feedback and loading
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // For search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.carNumber.includes(value)
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle selecting a customer from search results
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setShowResults(false);
  };

  // Format date for API (from mm/dd/yyyy to yyyy-mm-dd)
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    
    return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
  };

  // Clear messages
  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer || !reminderDate || !customerMessage) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      
      
      // Prepare the request data
      const reminderData = {
        carNumber: selectedCustomer.carNumber,
        reminderDate: formatDateForAPI(reminderDate),
        message: customerMessage
      };
      
      // API call
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/reminders/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reminder');
      }
      
      // Success feedback
      setSuccessMessage('Reminder sent successfully!');
      
      // Reset form fields after a short delay
      setTimeout(() => {
        setSelectedCustomer(null);
        setSearchTerm('');
        setReminderDate('');
        setReminderType('Status');
        setCustomerMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Error sending reminder:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
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
        
        <Card sx={{ 
          mb: 4, 
          overflow: 'visible', 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
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
                      Search Customer
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Customer Name or Car Number"
                      variant="outlined"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          position: 'absolute', 
                          width: '100%', 
                          maxHeight: 200, 
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
                          </Box>
                        ))}
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
                      Set Reminder Date
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="mm/dd/yyyy"
                      variant="outlined"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="action" />
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
                        inputProps={{ 'aria-label': 'Without label' }}
                      >
                        <MenuItem value="Status">Status</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
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
                      Customer Message
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Type your message here..."
                      variant="outlined"
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                    />
                  </Box>
                </Box>
              </Paper>
              
              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
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
      
      {/* Success Message */}
      {successMessage && (
        <Box 
          sx={{ 
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: { xs: '90%', sm: 'auto', md: '400px' },
            textAlign: 'center'
          }}
        >
          <Alert 
            severity="success" 
            variant="filled"
            icon
            sx={{ 
              width: '100%',
              boxShadow: theme.shadows[6],
              fontSize: '1rem',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {successMessage}
          </Alert>
        </Box>
      )}
      
      {/* Error Message */}
      {errorMessage && (
        <Box 
          sx={{ 
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: { xs: '90%', sm: 'auto', md: '400px' },
            textAlign: 'center'
          }}
        >
          <Alert 
            severity="error" 
            variant="filled"
            icon
            onClose={clearMessages}
            sx={{ 
              width: '100%',
              boxShadow: theme.shadows[6],
              fontSize: '1rem',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {errorMessage}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default SetServiceReminder;