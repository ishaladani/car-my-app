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
  useTheme
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
  { id: 1, name: 'John Smith', vehicle: 'Toyota Camry' },
  { id: 2, name: 'Sarah Johnson', vehicle: 'Honda Accord' },
  { id: 3, name: 'Michael Brown', vehicle: 'Ford F-150' },
  { id: 4, name: 'Jennifer Lee', vehicle: 'Tesla Model 3' },
  { id: 5, name: 'Robert Wilson', vehicle: 'Chevrolet Silverado' },
];

const SetServiceReminder = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for form fields
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderType, setReminderType] = useState('Status');
  const [customerMessage, setCustomerMessage] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const reminderData = {
      customer: selectedCustomer,
      reminderDate,
      reminderType,
      customerMessage
    };
    
    console.log('Reminder Data:', reminderData);
    // Add your submission logic here
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
                  <Box>
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
                      placeholder="Enter Customer Name"
                      variant="outlined"
                      value={selectedCustomer ? selectedCustomer.name : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) setSelectedCustomer(null);
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
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
                  startIcon={<SendIcon />}
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
                  Send Reminder
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SetServiceReminder;