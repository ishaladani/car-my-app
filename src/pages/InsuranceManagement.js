import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  CssBaseline,
  Snackbar,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const InsuranceManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expiringInsurances, setExpiringInsurances] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form state for adding insurance
  const [insuranceForm, setInsuranceForm] = useState({
    policyNumber: '',
    company: '',
    type: '',
    startDate: '',
    expiryDate: '',
    premiumAmount: '',
    carNumber: '',
    contactPerson: '',
    phoneNumber: '',
    garageId: garageId || ''
  });

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
    };
  };

  // Fetch expiring insurances
  const fetchExpiringInsurances = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/insurance/expiring', {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpiringInsurances(data || []);
        setMessage({ type: 'success', text: 'Expiring insurances loaded successfully!' });
      } else {
        throw new Error('Failed to fetch expiring insurances');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
      console.error('Error fetching expiring insurances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new insurance
  const addInsurance = async () => {
    setLoading(true);
    try {
      const insuranceData = {
        policyNumber: insuranceForm.policyNumber,
        company: insuranceForm.company,
        type: insuranceForm.type,
        startDate: insuranceForm.startDate,
        expiryDate: insuranceForm.expiryDate,
        premiumAmount: parseFloat(insuranceForm.premiumAmount) || 0,
        carNumber: insuranceForm.carNumber,
        contactPerson: insuranceForm.contactPerson,
        phoneNumber: insuranceForm.phoneNumber,
        garageId: insuranceForm.garageId || garageId
      };

      

      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/insurance/add', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(insuranceData)
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Insurance added successfully!' });
        setOpenDialog(false);
        // Reset form
        setInsuranceForm({
          policyNumber: '',
          company: '',
          type: '',
          startDate: '',
          expiryDate: '',
          premiumAmount: '',
          carNumber: '',
          contactPerson: '',
          phoneNumber: '',
          garageId: garageId || ''
        });
        // Refresh expiring insurances if on that tab
        if (activeTab === 1) {
          fetchExpiringInsurances();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to add insurance');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
      console.error('Error adding insurance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setInsuranceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      fetchExpiringInsurances();
    }
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status chip based on days until expiry
  const getStatusChip = (endDate) => {
    const days = getDaysUntilExpiry(endDate);
    if (days < 0) {
      return <Chip label="Expired" color="error" size="small" icon={<ErrorIcon />} />;
    } else if (days <= 30) {
      return <Chip label={`${days} days left`} color="warning" size="small" icon={<WarningIcon />} />;
    } else {
      return <Chip label="Active" color="success" size="small" icon={<CheckCircleIcon />} />;
    }
  };

  // Close messages after 5 seconds
  useEffect(() => {
    if (!garageId) {
      navigate("/login");
    }
  }, [garageId, navigate]);

  const handleCloseMessage = () => {
    setMessage({ type: '', text: '' });
  };

  // Mobile card view for insurance items
  const renderMobileInsuranceCard = (insurance, index) => (
    <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight={600}>
            {insurance.policyNumber || 'N/A'}
          </Typography>
          {insurance.expiryDate && getStatusChip(insurance.expiryDate)}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Company:</Typography>
            <Typography variant="body2">{insurance.company || 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Type:</Typography>
            <Typography variant="body2">{insurance.type || 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>End Date:</Typography>
            <Typography variant="body2">
              {insurance.expiryDate ? new Date(insurance.expiryDate).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Car Number:</Typography>
            <Typography variant="body2">{insurance.carNumber || 'N/A'}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto',
      pt: {xs: 2, sm: 3},
      px: {xs: 2, sm: 0}
    }}>
      <CssBaseline />
      
      <Container maxWidth="lg" sx={{ px: {xs: 1, sm: 3} }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          fontWeight={600} 
          color="primary" 
          sx={{ 
            mb: {xs: 2, sm: 3},
            textAlign: {xs: 'center', sm: 'left'}
          }}
        >
          Insurance Management System
        </Typography>

        {/* Message Snackbar */}
        <Snackbar
          open={!!message.text}
          autoHideDuration={5000}
          onClose={handleCloseMessage}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseMessage} 
            severity={message.type === 'error' ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {message.text}
          </Alert>
        </Snackbar>

        {/* Tabs */}
        <Card sx={{ 
          mb: {xs: 2, sm: 3}, 
          borderRadius: 2, 
          boxShadow: theme.shadows[3],
          overflow: 'hidden'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
                height: 3,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: {xs: '0.875rem', sm: '1rem'},
                minHeight: {xs: 48, sm: 48},
                py: {xs: 1, sm: 1.5},
                px: {xs: 1, sm: 2},
              }
            }}
          >
            <Tab label={isMobile ? "Add" : "Add Insurance"} />
            <Tab label={isMobile ? "Expiring" : "Expiring Insurances"} />
          </Tabs>
        </Card>

        {/* Add Insurance Tab */}
        {activeTab === 0 && (
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}>
            <CardContent sx={{ p: {xs: 2, sm: 4} }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: {xs: 'column', sm: 'row'},
                justifyContent: 'space-between', 
                alignItems: {xs: 'stretch', sm: 'center'}, 
                mb: 3,
                gap: {xs: 2, sm: 0}
              }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  component="h2" 
                  fontWeight={600}
                  sx={{ textAlign: {xs: 'center', sm: 'left'} }}
                >
                  Add New Insurance Policy
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                  fullWidth={isMobile}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    minHeight: {xs: 44, sm: 36}
                  }}
                >
                  Add Insurance
                </Button>
              </Box>
              
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Click the "Add Insurance" button to create a new insurance policy record.
                All insurance policies will be tracked for expiration dates automatically.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Expiring Insurances Tab */}
        {activeTab === 1 && (
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}>
            <CardContent sx={{ p: {xs: 2, sm: 4} }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: {xs: 'column', sm: 'row'},
                justifyContent: 'space-between', 
                alignItems: {xs: 'stretch', sm: 'center'}, 
                mb: 3,
                gap: {xs: 2, sm: 0}
              }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  component="h2" 
                  fontWeight={600}
                  sx={{ textAlign: {xs: 'center', sm: 'left'} }}
                >
                  Expiring Insurance Policies
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                  onClick={fetchExpiringInsurances}
                  disabled={loading}
                  fullWidth={isMobile}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    minHeight: {xs: 44, sm: 36}
                  }}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Desktop Table View */}
                  {!isMobile && (
                    <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              '& .MuiTableCell-head': {
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                letterSpacing: '0.02em',
                                textTransform: 'uppercase',
                                border: 'none',
                                '&:first-of-type': {
                                  borderTopLeftRadius: theme.shape.borderRadius,
                                },
                                '&:last-of-type': {
                                  borderTopRightRadius: theme.shape.borderRadius,
                                }
                              }
                            }}
                          >
                            <TableCell>Policy Number</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Policy Type</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Car Number</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {expiringInsurances.length > 0 ? (
                            expiringInsurances.map((insurance, index) => (
                              <TableRow
                                key={insurance._id || index}
                                sx={{ 
                                  '&:nth-of-type(even)': { 
                                    backgroundColor: theme.palette.action.hover 
                                  },
                                  '&:hover': {
                                    backgroundColor: theme.palette.action.selected,
                                  },
                                  '& .MuiTableCell-root': {
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    padding: theme.spacing(1.5),
                                  }
                                }}
                              >
                                <TableCell>{insurance.policyNumber || 'N/A'}</TableCell>
                                <TableCell>{insurance.company || 'N/A'}</TableCell>
                                <TableCell>{insurance.type || 'N/A'}</TableCell>
                                <TableCell>
                                  {insurance.expiryDate ? 
                                    new Date(insurance.expiryDate).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>{insurance.carNumber || 'N/A'}</TableCell>
                                <TableCell>
                                  {insurance.expiryDate && getStatusChip(insurance.expiryDate)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                  No expiring insurances found. Click "Refresh" to check for updates.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* Mobile Card View */}
                  {isMobile && (
                    <Box>
                      {expiringInsurances.length > 0 ? (
                        expiringInsurances.map((insurance, index) => 
                          renderMobileInsuranceCard(insurance, index)
                        )
                      ) : (
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              No expiring insurances found. Click "Refresh" to check for updates.
                            </Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Insurance Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Add New Insurance Policy</Typography>
              <IconButton onClick={() => setOpenDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent dividers sx={{ p: {xs: 2, sm: 3} }}>
            <Grid container spacing={{xs: 2, sm: 3}}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Number"
                  value={insuranceForm.policyNumber}
                  onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                  required
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Insurance Company"
                  value={insuranceForm.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Type"
                  value={insuranceForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  placeholder="e.g., Comprehensive, Third Party"
                  required
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Car Number"
                  value={insuranceForm.carNumber}
                  onChange={(e) => handleInputChange('carNumber', e.target.value)}
                  placeholder="e.g., ABC-123"
                  required
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={insuranceForm.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  value={insuranceForm.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Premium Amount"
                  type="number"
                  value={insuranceForm.premiumAmount}
                  onChange={(e) => handleInputChange('premiumAmount', e.target.value)}
                  placeholder="0.00"
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={insuranceForm.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={insuranceForm.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="e.g., +1-234-567-8900"
                  variant="outlined"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: {xs: 2, sm: 3}, 
            gap: 1,
            flexDirection: {xs: 'column', sm: 'row'},
            '& .MuiButton-root': {
              minHeight: {xs: 44, sm: 36},
              width: {xs: '100%', sm: 'auto'}
            }
          }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={addInsurance}
              variant="contained"
              disabled={loading || !insuranceForm.policyNumber || !insuranceForm.company || !insuranceForm.type || !insuranceForm.carNumber || !insuranceForm.expiryDate}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {loading ? 'Adding...' : 'Add Insurance'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default InsuranceManagement;