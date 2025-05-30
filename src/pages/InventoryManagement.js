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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItemData, setEditItemData] = useState({
    id: '',
    carName: '',
    model: '',
    partNumber: '',
    partName: '',
    quantity: '',
    pricePerUnit: '',
    taxType: '',
    taxAmount: ''
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const garageId = localStorage.getItem('garageId'); // Use stored ID or fallback to default

  // Function to fetch inventory data
  const fetchInventory = async () => {
    try {
      
      setIsLoading(true);
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/garage/inventory/${garageId}`, 
        {
          headers: {
          }
        }
      );
      
      const data = response.data;
      setInventoryData(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setNotification({
        open: true,
        message: error.message || 'Failed to fetch inventory',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if(!garageId){
        navigate("\login")
      }
    fetchInventory();
  }, []);

  // For debugging to help identify item structure
  useEffect(() => {
    if (inventoryData.length > 0) {
      console.log('First inventory item structure:', inventoryData[0]);
    }
  }, [inventoryData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit modal input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItemData(prev => ({
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

  // Open edit modal with item data
  const handleOpenEditModal = (item) => {
    console.log("Opening edit modal for item:", item);
    
    // Ensure we have the item ID
    if (!item._id && !item.id) {
      setNotification({
        open: true,
        message: 'Item ID is missing. Cannot edit this item.',
        severity: 'error'
      });
      return;
    }
    
    // Use MongoDB _id field if available, otherwise fallback to id
    const itemId = item._id || item.id;
    
    setEditItemData({
      id: itemId,
      carName: item.carName || '',
      model: item.model || '',
      partNumber: item.partNumber || '',
      partName: item.partName || '',
      quantity: item.quantity?.toString() || '',
      pricePerUnit: item.pricePerUnit?.toString() || '',
      taxType: item.taxType || item.tax || '',
      taxAmount: item.taxAmount?.toString() || ''
    });
    setEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  // Update inventory item
  const handleUpdateItem = async () => {
    try {
      setIsEditSubmitting(true);
      
      // Check if we have a valid item ID
      if (!editItemData.id) {
        throw new Error('Item ID is missing. Cannot update this item.');
      }
      
      // Prepare the data for API call
      const requestData = {
        carName: editItemData.carName,
        model: editItemData.model,
        partNumber: editItemData.partNumber,
        partName: editItemData.partName,
        quantity: parseInt(editItemData.quantity),
        pricePerUnit: parseFloat(editItemData.pricePerUnit),
        taxAmount: parseFloat(editItemData.taxAmount),
        taxType: editItemData.taxType
      };

      console.log('Updating item with ID:', editItemData.id);
      console.log('Request data:', requestData);
      console.log('Full update URL:', `https://garage-management-zi5z.onrender.com/api/garage/inventory/update/${editItemData.id}`);

      // Make API call to update inventory item
      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/inventory/update/${editItemData.id}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Update response:', response.data);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Item updated successfully!',
        severity: 'success'
      });

      // Close the modal and refresh inventory
      setEditModalOpen(false);
      fetchInventory();
      
    } catch (error) {
      console.error('Error updating item:', error);
      
      // Log detailed error information for debugging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      
      setNotification({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to update item. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Handle form submission - UPDATED to match API requirements
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Prepare the data for API call according to the specified format
      const requestData = {
        name: formData.carName, // Using carName as the name field
        garageId: garageId, // Using the stored garageId or default
        quantity: parseInt(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        partNumber: parseInt(formData.partNumber) || formData.partNumber, // Try to parse as int if possible
        partName: formData.partName
        // Note: tax fields are not included as they're not in the example API request
      };

      console.log('Adding inventory item with data:', requestData);

      // Make API call to add inventory item
      const response = await axios.post(
        'https://garage-management-zi5z.onrender.com/api/garage/inventory/add',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Add response:', response.data);
      
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
      
      // Log detailed error information for debugging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      
      setNotification({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to add part. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
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
      
      {/* Loading overlay */}
      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999
        }}>
          <CircularProgress />
        </Box>
      )}
      
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
                  required
                  label="Tax"
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
                disabled={isSubmitting}
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
                {isSubmitting ? 'Adding...' : 'Add Part'}
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
                      key={row._id || row.id || `row-${index}`}
                      sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}
                    >
                      <TableCell>{row.partNumber}</TableCell>
                      <TableCell>{row.partName}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{typeof row.pricePerUnit === 'number' ? `${row.pricePerUnit.toFixed(2)}` : row.price}</TableCell>
                      <TableCell>{row.taxType || row.tax}</TableCell>
                      <TableCell>
                        {row.totalPrice || (row.quantity && row.pricePerUnit ? 
                          `${(row.quantity * row.pricePerUnit).toFixed(2)}` : 
                          '')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          color="primary"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEditModal(row)}
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
          disabled={isLoading}
          sx={{ 
            px: 3, 
            py: 1,
            borderRadius: 2,
          }}
        >
          {isLoading ? 'Loading...' : 'Refresh Inventory'}
        </Button>
      </Box>

      {/* Edit Item Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Inventory Item</Typography>
            <IconButton onClick={handleCloseEditModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box 
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2
            }}
          >
            <TextField
              name="carName"
              label="Car Name"
              variant="outlined"
              value={editItemData.carName}
              onChange={handleEditInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="model"
              label="Model"
              variant="outlined"
              value={editItemData.model}
              onChange={handleEditInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="partNumber"
              label="Part Number"
              variant="outlined"
              value={editItemData.partNumber}
              onChange={handleEditInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="partName"
              label="Part Name"
              variant="outlined"
              value={editItemData.partName}
              onChange={handleEditInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              value={editItemData.quantity}
              onChange={handleEditInputChange}
              required
              inputProps={{ min: 1 }}
              fullWidth
              margin="normal"
            />
            <TextField
              name="pricePerUnit"
              label="Price Per Unit"
              type="number"
              variant="outlined"
              value={editItemData.pricePerUnit}
              onChange={handleEditInputChange}
              required
              inputProps={{ min: 0, step: "0.01" }}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tax</InputLabel>
              <Select
                name="taxType"
                value={editItemData.taxType}
                onChange={handleEditInputChange}
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
              value={editItemData.taxAmount}
              onChange={handleEditInputChange}
              required
              inputProps={{ min: 0, step: "0.01" }}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseEditModal} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateItem} 
            variant="contained" 
            color="primary"
            disabled={isEditSubmitting}
            startIcon={isEditSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isEditSubmitting ? 'Updating...' : 'Update Item'}
          </Button>
        </DialogActions>
      </Dialog>

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