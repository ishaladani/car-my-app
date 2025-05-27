import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
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
  CssBaseline,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Delete as DeleteIcon, Warning as WarningIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InsuranceManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    carName: '',
    insuranceType: '',
    insurancePrice: '',
    company: '',
    expiryDate: '',
    taxAmount: ''
  });

  // State for insurance data
  const [insuranceData, setInsuranceData] = useState([]);
  const [expiringInsurance, setExpiringInsurance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [expiringLoading, setExpiringLoading] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    data: null
  });

  // API Base URLs
  const BASE_URL = 'https://garage-management-zi5z.onrender.com';
  const INSURANCE_API = `${BASE_URL}/api/insurance`;

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
  };

  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch expiring insurance data
  const fetchExpiringInsurance = async () => {
    try {
      setExpiringLoading(true);
      const token = getToken();
      
      if (!token) {
        showSnackbar('Please login to continue', 'error');
        navigate('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/admin/insurance/expiring`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showSnackbar('Session expired. Please login again', 'error');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch expiring insurance data: ${response.status}`);
      }

      const data = await response.json();
      setExpiringInsurance(data.data || data || []);
      
      if ((data.data || data || []).length > 0) {
        showSnackbar(`Found ${(data.data || data || []).length} insurance policies expiring soon!`, 'warning');
      }
    } catch (error) {
      console.error('Error fetching expiring insurance data:', error);
      showSnackbar('Failed to load expiring insurance data', 'error');
    } finally {
      setExpiringLoading(false);
    }
  };

  // Fetch insurance data
  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        showSnackbar('Please login to continue', 'error');
        navigate('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/admin/insurance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showSnackbar('Session expired. Please login again', 'error');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch insurance data: ${response.status}`);
      }

      const data = await response.json();
      setInsuranceData(data.data || data || []);
    } catch (error) {
      console.error('Error fetching insurance data:', error);
      showSnackbar('Failed to load insurance data', 'error');
      // Set sample data as fallback
      setInsuranceData([
        { id: 1, carNumber: 'ABC123', insuranceType: 'Comprehensive', price: '$500', company: 'Geico', expiry: '12/31/2023' },
        { id: 2, carNumber: 'XYZ789', insuranceType: 'Liability', price: '$300', company: 'Progressive', expiry: '06/30/2024' },
        { id: 3, carNumber: 'DEF456', insuranceType: 'Collision', price: '$400', company: 'State Farm', expiry: '09/15/2023' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchInsuranceData();
    fetchExpiringInsurance();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add insurance via API
  const addInsurance = async (insuranceData) => {
    const token = getToken();
    
    if (!token) {
      showSnackbar('Please login to continue', 'error');
      navigate('/login');
      return false;
    }

    const response = await fetch(`${BASE_URL}/admin/insurance/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(insuranceData)
    });

    if (!response.ok) {
      if (response.status === 401) {
        showSnackbar('Session expired. Please login again', 'error');
        navigate('/login');
        return false;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    return await response.json();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.carName || !formData.insuranceType || !formData.insurancePrice || 
        !formData.company || !formData.expiryDate) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitLoading(true);
      
      const insurancePayload = {
        carName: formData.carName,
        insuranceType: formData.insuranceType,
        insurancePrice: parseFloat(formData.insurancePrice),
        company: formData.company,
        expiryDate: formData.expiryDate,
        taxAmount: formData.taxAmount ? parseFloat(formData.taxAmount) : 0
      };

      const result = await addInsurance(insurancePayload);
      
      showSnackbar('Insurance added successfully!', 'success');
      
      // Reset form
      setFormData({
        carName: '',
        insuranceType: '',
        insurancePrice: '',
        company: '',
        expiryDate: '',
        taxAmount: ''
      });
      
      // Refresh the insurance data
      await fetchInsuranceData();
      
    } catch (error) {
      console.error('Error adding insurance:', error);
      showSnackbar(error.message || 'Failed to add insurance', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (insurance) => {
    setEditDialog({
      open: true,
      data: insurance
    });
  };

  // Handle delete insurance (if needed)
  const handleDelete = async (insuranceId) => {
    if (!window.confirm('Are you sure you want to delete this insurance record?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/admin/insurance/${insuranceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showSnackbar('Insurance deleted successfully', 'success');
        await fetchInsuranceData();
        await fetchExpiringInsurance();
      } else {
        throw new Error('Failed to delete insurance');
      }
    } catch (error) {
      console.error('Error deleting insurance:', error);
      showSnackbar('Failed to delete insurance', 'error');
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
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              Insurance Management
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={showExpiring ? "contained" : "outlined"}
              color="warning"
              startIcon={<WarningIcon />}
              onClick={() => setShowExpiring(!showExpiring)}
              disabled={expiringLoading}
            >
              {expiringLoading ? 'Loading...' : `Expiring (${expiringInsurance.length})`}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchInsuranceData();
                fetchExpiringInsurance();
              }}
              disabled={loading || expiringLoading}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        <Card sx={{ 
          mb: 4, 
          overflow: 'visible', 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3
              }}
            >
              <TextField
                name="carName"
                label="Car Name *"
                variant="outlined"
                value={formData.carName}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
                required
              />
              <TextField
                name="insuranceType"
                label="Insurance Type *"
                variant="outlined"
                value={formData.insuranceType}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
                required
              />
              <TextField
                name="insurancePrice"
                label="Insurance Price *"
                variant="outlined"
                type="number"
                value={formData.insurancePrice}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
                required
              />
              <TextField
                name="company"
                label="Company *"
                variant="outlined"
                value={formData.company}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
                required
              />
              <TextField
                name="expiryDate"
                label="Expiry Date *"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.expiryDate}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
                required
              />
              <TextField
                name="taxAmount"
                label="Tax Amount"
                variant="outlined"
                type="number"
                value={formData.taxAmount}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={submitLoading}
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
                {submitLoading ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Adding...
                  </>
                ) : (
                  'Add Insurance'
                )}
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Expiring Insurance Alert */}
                {showExpiring && expiringInsurance.length > 0 && (
                  <Alert 
                    severity="warning" 
                    sx={{ mb: 3 }}
                    action={
                      <Button color="inherit" size="small" onClick={() => setShowExpiring(false)}>
                        Hide
                      </Button>
                    }
                  >
                    <Typography variant="subtitle1" fontWeight="600">
                      ⚠️ {expiringInsurance.length} Insurance Policies Expiring Soon
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {expiringInsurance.slice(0, 3).map((insurance, index) => (
                        <Typography key={index} variant="body2">
                          • {insurance.carNumber || insurance.carName} ({insurance.company}) - Expires: {insurance.expiry || insurance.expiryDate}
                        </Typography>
                      ))}
                      {expiringInsurance.length > 3 && (
                        <Typography variant="body2" fontStyle="italic">
                          ...and {expiringInsurance.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </Alert>
                )}

                <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
                  <Table sx={{ minWidth: 650 }} aria-label="insurance table">
                    <TableHead sx={{ bgcolor: showExpiring && expiringInsurance.length > 0 ? theme.palette.warning.main : theme.palette.success.main }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Car Number</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Insurance Type</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price/Unit</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Company</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Expiry</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(showExpiring ? expiringInsurance : insuranceData).map((row) => {
                        const isExpiring = expiringInsurance.some(exp => exp.id === row.id);
                        const expiryDate = new Date(row.expiry || row.expiryDate);
                        const today = new Date();
                        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <TableRow
                            key={row.id}
                            sx={{ 
                              '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover },
                              backgroundColor: isExpiring ? 'rgba(255, 152, 0, 0.1)' : 'inherit'
                            }}
                          >
                            <TableCell>{row.carNumber || row.carName}</TableCell>
                            <TableCell>{row.insuranceType}</TableCell>
                            <TableCell>
                              {typeof row.price === 'string' ? row.price : `${row.insurancePrice || row.price}`}
                            </TableCell>
                            <TableCell>{row.company}</TableCell>
                            <TableCell>{row.expiry || row.expiryDate}</TableCell>
                            <TableCell>
                              {isExpiring ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                                  <WarningIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                  <Typography variant="body2" color="warning.main">
                                    {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} days left`}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="success.main">Active</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                  variant="outlined" 
                                  color="primary"
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleEdit(row)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleDelete(row.id)}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Empty rows for better visual */}
                      {Array.from({ 
                        length: Math.max(0, 10 - (showExpiring ? expiringInsurance : insuranceData).length) 
                      }).map((_, index) => (
                        <TableRow key={`empty-${index}`}>
                          <TableCell style={{ height: 53 }}></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })}>
        <DialogTitle>Edit Insurance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Edit functionality can be implemented here with the selected insurance data.
          </Typography>
          {editDialog.data && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Car:</strong> {editDialog.data.carNumber || editDialog.data.carName}</Typography>
              <Typography><strong>Type:</strong> {editDialog.data.insuranceType}</Typography>
              <Typography><strong>Company:</strong> {editDialog.data.company}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, data: null })}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InsuranceManagement;