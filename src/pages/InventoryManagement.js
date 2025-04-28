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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CssBaseline,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InventoryManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    carName: '',
    model: '',
    partNumber: '',
    partName: '',
    quantity: '',
    pricePerUnit: '',
    taxType: '',
    taxAmount: ''
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Inventory data from API
  const [inventoryData, setInventoryData] = useState([]);
  // State for selected part
  const [selectedPart, setSelectedPart] = useState('');

  // Function to fetch inventory data
  const fetchInventory = async () => {
    try {
      const response = await fetch('https://garage-management-system-cr4w.onrender.com/api/inventory/67e0f80b5c8f6293f36e3506', {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTgxNjY5NCwiZXhwIjoxNzQ2NDIxNDk0fQ.eFBVfYMr5ys2xe485aP1i_UlV1Z_P_8H4uiKk-VdAWM'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      setInventoryData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to fetch inventory',
        severity: 'error'
      });
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Add event listener for page refresh
  useEffect(() => {
    const handlePageRefresh = () => {
      fetchInventory();
    };

    // Listen for page refresh events
    window.addEventListener('load', handlePageRefresh);
    
    // Cleanup the event listener
    return () => {
      window.removeEventListener('load', handlePageRefresh);
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Auto-populate fields when a part is selected from inventory
  useEffect(() => {
    if (selectedPart) {
      const selectedPartData = inventoryData.find(part => 
        (part.partNumber || part.id) === selectedPart
      );
      
      if (selectedPartData) {
        setFormData(prev => ({
          ...prev,
          partNumber: selectedPartData.partNumber || '',
          partName: selectedPartData.partName || '',
          quantity: selectedPartData.quantity || '',
          pricePerUnit: selectedPartData.pricePerUnit || '',
          // Extract numeric value from price string if needed
          ...(selectedPartData.price && typeof selectedPartData.price === 'string' && !selectedPartData.pricePerUnit && {
            pricePerUnit: selectedPartData.price.replace(/[^0-9.]/g, '')
          }),
          taxType: selectedPartData.tax || selectedPartData.taxType || '',
          taxAmount: selectedPartData.taxAmount || ''
        }));
      }
    }
  }, [selectedPart, inventoryData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare the data for API call
      const requestData = {
        garageId: "67e0f80b5c8f6293f36e3506",
        carName: formData.carName,
        model: formData.model,
        partNumber: formData.partNumber,
        partName: formData.partName,
        quantity: parseInt(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        taxAmount: parseFloat(formData.taxAmount)
      };

      // Use the same token as AssignEngineer for consistency
      const response = await fetch('https://garage-management-system-cr4w.onrender.com/api/inventory/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTgxNjY5NCwiZXhwIjoxNzQ2NDIxNDk0fQ.eFBVfYMr5ys2xe485aP1i_UlV1Z_P_8H4uiKk-VdAWM',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to add part.');
      }
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Part added successfully!',
        severity: 'success'
      });

      // Reset form
      setFormData({
        carName: '',
        model: '',
        partNumber: '',
        partName: '',
        quantity: '',
        pricePerUnit: '',
        taxType: '',
        taxAmount: ''
      });
      
      // Reset selected part
      setSelectedPart('');
      // Refresh inventory
      fetchInventory();

    } catch (error) {
      console.error('Error adding part:', error);
      setNotification({
        open: true,
        message: error.message || 'Failed to add part. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
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
            Inventory Management
          </Typography>
        </Box>
        
        <Card sx={{ 
          mb: 4, 
          overflow: 'visible', 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Select Parts From Inventory */}
            <Box sx={{ mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel id="select-part-label">Select Parts From Inventory</InputLabel>
                <Select
                  labelId="select-part-label"
                  id="select-part"
                  value={selectedPart}
                  label="Select Parts From Inventory"
                  onChange={e => setSelectedPart(e.target.value)}
                >
                  {inventoryData.length > 0 ? (
                    inventoryData.map((part, idx) => (
                      <MenuItem key={part.id || idx} value={part.partNumber || part.id || idx}>
                        {part.partName ? `${part.partName} (${part.partNumber})` : part.partNumber || part.id || idx}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No parts available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
            
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
                label="Car Name"
                variant="outlined"
                value={formData.carName}
                onChange={handleInputChange}
                required
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="model"
                label="Model"
                variant="outlined"
                value={formData.model}
                onChange={handleInputChange}
                required
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="partNumber"
                label="Part Number"
                variant="outlined"
                value={formData.partNumber}
                onChange={handleInputChange}
                required
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="partName"
                label="Part Name"
                variant="outlined"
                value={formData.partName}
                onChange={handleInputChange}
                required
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                variant="outlined"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                inputProps={{ min: 1 }}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="pricePerUnit"
                label="Price Per Unit"
                type="number"
                variant="outlined"
                value={formData.pricePerUnit}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: "0.01" }}
                sx={{ flex: '1 1 200px' }}
              />
              <FormControl sx={{ flex: '1 1 200px' }}>
                <InputLabel>Tax</InputLabel>
                <Select
                  name="taxType"
                  value={formData.taxType}
                  onChange={handleInputChange}
                  label="Tax"
                  required
                >
                  <MenuItem value="SGST">SGST</MenuItem>
                  <MenuItem value="CGST">CGST</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="taxAmount"
                label="Tax Amount"
                type="number"
                variant="outlined"
                value={formData.taxAmount}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: "0.01" }}
                sx={{ flex: '1 1 200px' }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                type="submit"
                variant="contained"
                onClick={handleSubmit}
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  backgroundColor: '#ff4d4d',
                  '&:hover': {
                    backgroundColor: '#e63939',
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                Add Part
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
              <Table sx={{ minWidth: 650 }} aria-label="inventory table">
                <TableHead sx={{ bgcolor: '#ff4d4d' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Part No.</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name Of Part</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Qty</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price/Unit</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tax</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryData.map((row, index) => (
                    <TableRow
                      key={row.id || `row-${index}`}
                      sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}
                    >
                      <TableCell>{row.partNumber}</TableCell>
                      <TableCell>{row.partName}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{typeof row.pricePerUnit === 'number' ? `$${row.pricePerUnit.toFixed(2)}` : row.price}</TableCell>
                      <TableCell>{row.taxType || row.tax}</TableCell>
                      <TableCell>
                        {row.totalPrice || (row.quantity && row.pricePerUnit ? 
                          `$${(row.quantity * row.pricePerUnit).toFixed(2)}` : 
                          '')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          color="primary"
                          size="small"
                          onClick={() => setSelectedPart(row.partNumber || row.id || `row-${index}`)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Empty rows for better visual */}
                  {Array.from({ length: Math.max(0, 10 - inventoryData.length) }).map((_, index) => (
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
          </CardContent>
        </Card>
      </Container>

      {/* Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={fetchInventory}
          sx={{ 
            px: 3, 
            py: 1,
            borderRadius: 2,
          }}
        >
          Refresh Inventory
        </Button>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryManagement;