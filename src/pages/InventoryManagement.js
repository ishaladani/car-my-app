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
  CircularProgress,
  Grid,
  TableFooter,
  TablePagination,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InventoryManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const API_BASE_URL = 'https://garage-management-zi5z.onrender.com/api';
  const garageId = localStorage.getItem('garageId');
  const token = localStorage.getItem('token');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    carName: '',
    model: '',
    partNumber: '',
    partName: '',
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    hsnNumber: '',
    igst: '',
    cgst: '',
    taxType: 'igst',
  });

  const [editItemData, setEditItemData] = useState({
    id: '',
    carName: '',
    model: '',
    partNumber: '',
    partName: '',
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    hsnNumber: '',
    igst: '',
    cgst: '',
    taxType: 'igst',
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('partName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Calculate single part GST amount
  const calculateSinglePartGST = (sellingPrice, igst, cgst) => {
    if (!sellingPrice) return 0;
    const price = parseFloat(sellingPrice) || 0;
    const igstRate = parseFloat(igst) || 0;
    const cgstRate = parseFloat(cgst) || 0;

    const igstAmount = (price * igstRate) / 100;
    const cgstAmount = (price * cgstRate) / 100;
    return igstAmount + cgstAmount;
  };

  // Calculate total value with GST for a part
  const calculateTotalValueWithGST = (sellingPrice, quantity, igst, cgst) => {
    const gstPerUnit = calculateSinglePartGST(sellingPrice, igst, cgst);
    const total = (parseFloat(sellingPrice) + gstPerUnit) * parseInt(quantity || 0);
    return isNaN(total) ? 0 : parseFloat(total.toFixed(2));
  };

  const calculateTotalGSTAmount = () => {
    let totalGST = 0;
    let totalBaseAmount = 0;
    let totalAmountWithGST = 0;

    inventoryData.forEach(item => {
      const qty = item.quantity || 0;
      const price = item.sellingPrice || 0;
      const igst = item.igst || 0;
      const cgst = item.cgst || 0;

      const baseAmount = price * qty;
      const gstAmount = calculateSinglePartGST(price, igst, cgst) * qty;
      const amountWithGST = baseAmount + gstAmount;

      totalBaseAmount += baseAmount;
      totalGST += gstAmount;
      totalAmountWithGST += amountWithGST;
    });

    return {
      totalBaseAmount: parseFloat(totalBaseAmount.toFixed(2)),
      totalGST: parseFloat(totalGST.toFixed(2)),
      totalAmountWithGST: parseFloat(totalAmountWithGST.toFixed(2))
    };
  };

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/garage/inventory/${garageId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setInventoryData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setNotification({
        open: true,
        message: 'Failed to fetch inventory data.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!garageId) {
      navigate('/login');
      return;
    }
    fetchInventory();
  }, [garageId, navigate]);

  useEffect(() => {
    let filtered = [...inventoryData];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.carName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (['quantity', 'purchasePrice', 'sellingPrice', 'model'].includes(sortField)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sortDirection === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    setFilteredData(filtered);
    setPage(0);
  }, [inventoryData, searchTerm, sortField, sortDirection]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItemData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setFormData({
      carName: '',
      model: '',
      partNumber: '',
      partName: '',
      quantity: '',
      purchasePrice: '',
      sellingPrice: '',
      hsnNumber: '',
      igst: '',
      cgst: '',
      taxType: 'igst',
    });
    setAddModalOpen(true);
  };

  const validateFormData = (data) => {
    const errors = [];
    if (!data.carName.trim()) errors.push('Car Name is required');
    if (!data.model.trim()) errors.push('Model is required');
    if (!data.partNumber.trim()) errors.push('Part Number is required');
    if (!data.partName.trim()) errors.push('Part Name is required');
    if (!data.quantity || parseInt(data.quantity) <= 0) errors.push('Valid quantity is required');
    if (!data.purchasePrice || parseFloat(data.purchasePrice) <= 0)
      errors.push('Valid purchase price is required');
    if (!data.sellingPrice || parseFloat(data.sellingPrice) <= 0)
      errors.push('Valid selling price is required');
    
    // Check if at least one tax rate is provided
    const igst = parseFloat(data.igst) || 0;
    const cgst = parseFloat(data.cgst) || 0;
    
    if (igst === 0 && cgst === 0) {
      errors.push('At least one tax rate (IGST or CGST) is required');
    }
    
    if (igst < 0 || cgst < 0) {
      errors.push('Tax rates cannot be negative');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const errors = validateFormData(formData);
      if (errors.length > 0) throw new Error(errors.join(', '));

      const igst = parseFloat(formData.igst) || 0;
      const cgst = parseFloat(formData.cgst) || 0;

      const singlePartGST = calculateSinglePartGST(formData.sellingPrice, igst, cgst);
      const totalTaxAmount = singlePartGST * parseInt(formData.quantity);

      const requestData = {
        garageId,
        carName: formData.carName.trim(),
        model: formData.model.trim(),
        partNumber: formData.partNumber.trim(),
        partName: formData.partName.trim(),
        quantity: parseInt(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        hsnNumber: formData.hsnNumber.trim(),
        igst,
        cgst,
        taxAmount: parseFloat(singlePartGST.toFixed(2)),
        totalTaxAmount: parseFloat(totalTaxAmount.toFixed(2)),
      };

      await axios.post(`${API_BASE_URL}/inventory/add`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      setNotification({
        open: true,
        message: `✅ Part "${formData.partName}" added successfully! GST: ₹${singlePartGST.toFixed(2)} per unit`,
        severity: 'success',
      });
      setAddModalOpen(false);
      fetchInventory();
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to add part.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async () => {
    try {
      setIsEditSubmitting(true);
      if (!editItemData.id) throw new Error('Item ID missing');

      const errors = validateFormData(editItemData);
      if (errors.length > 0) throw new Error(errors.join(', '));

      const igst = parseFloat(editItemData.igst) || 0;
      const cgst = parseFloat(editItemData.cgst) || 0;

      const singlePartGST = calculateSinglePartGST(editItemData.sellingPrice, igst, cgst);
      const totalTaxAmount = singlePartGST * parseInt(editItemData.quantity);

      const requestData = {
        quantity: parseInt(editItemData.quantity),
        sellingPrice: parseFloat(editItemData.sellingPrice),
        purchasePrice: parseFloat(editItemData.purchasePrice),
        carName: editItemData.carName.trim(),
        model: editItemData.model.trim(),
        partNumber: editItemData.partNumber.trim(),
        partName: editItemData.partName.trim(),
        hsnNumber: editItemData.hsnNumber.trim(),
        igst,
        cgst,
        taxAmount: parseFloat(singlePartGST.toFixed(2)),
        totalTaxAmount: parseFloat(totalTaxAmount.toFixed(2)),
      };

      await axios.put(`${API_BASE_URL}/inventory/update/${editItemData.id}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      setNotification({
        open: true,
        message: `✅ Part "${editItemData.partName}" updated successfully! GST: ₹${singlePartGST.toFixed(2)} per unit`,
        severity: 'success',
      });
      setEditModalOpen(false);
      fetchInventory();
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to update part.',
        severity: 'error',
      });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleOpenEditModal = (item) => {
    const itemId = item._id || item.id;
    if (!itemId) {
      setNotification({
        open: true,
        message: 'Invalid item: ID missing.',
        severity: 'error',
      });
      return;
    }

    setEditItemData({
      id: itemId,
      carName: item.carName || '',
      model: item.model?.toString() || '',
      partNumber: item.partNumber || '',
      partName: item.partName || '',
      quantity: item.quantity?.toString() || '',
      purchasePrice: item.purchasePrice?.toString() || '',
      sellingPrice: item.sellingPrice?.toString() || '',
      hsnNumber: item.hsnNumber || '',
      igst: item.igst?.toString() || '',
      cgst: item.cgst?.toString() || '',
      taxType: item.igst > 0 ? 'igst' : 'cgst',
    });
    setEditModalOpen(true);
  };

  const handleDeleteItem = async (item) => {
    console.log('handleDeleteItem called with:', item); // Debug log
    const itemId = item._id || item.id;
    if (!itemId) {
      setNotification({
        open: true,
        message: 'Invalid item: ID missing.',
        severity: 'error',
      });
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${item.partName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/garage/inventory/delete/${itemId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      setNotification({
        open: true,
        message: `✅ Part "${item.partName}" deleted successfully!`,
        severity: 'success',
      });
      fetchInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to delete part.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 4, ml: { xs: 0, sm: 35 }, overflow: 'auto', pt: 3 }}>
      <CssBaseline />
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255,255,255,0.8)',
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1" fontWeight={600}>
              Inventory Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            sx={{ backgroundColor: '#ff4d4d', '&:hover': { backgroundColor: '#e63939' }, display: { xs: 'none', sm: 'flex' } }}
          >
            Add Part
          </Button>
        </Box>

        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: theme.shadows[3] }}>
          <CardContent sx={{ p: 4 }}>
            {/* Search & Sort */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                sx={{ minWidth: 300, flex: 1 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortField} onChange={(e) => setSortField(e.target.value)} label="Sort By">
                  <MenuItem value="carName">Car Name</MenuItem>
                  <MenuItem value="model">Model</MenuItem>
                  <MenuItem value="partName">Part Name</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                  <MenuItem value="sellingPrice">Selling Price</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                startIcon={<FilterListIcon />}
              >
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }} onClick={() => handleSortChange('carName')}>Car Name</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }} onClick={() => handleSortChange('model')}>Model</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }} onClick={() => handleSortChange('partNumber')}>Part No.</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }} onClick={() => handleSortChange('partName')}>Part Name</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }} onClick={() => handleSortChange('quantity')}>Qty</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }} onClick={() => handleSortChange('sellingPrice')}>Selling Price</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Single Part GST</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Total Value (with GST)</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold', minWidth: '200px' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row) => (
                    <TableRow key={row._id || row.id} sx={{ '&:nth-of-type(even)': { bgcolor: theme.palette.action.hover } }}>
                      <TableCell>{row.carName || 'N/A'}</TableCell>
                      <TableCell>{row.model || 'N/A'}</TableCell>
                      <TableCell>{row.partNumber || 'N/A'}</TableCell>
                      <TableCell>{row.partName || 'N/A'}</TableCell>
                      <TableCell>{row.quantity || 0}</TableCell>
                      <TableCell>₹{parseFloat(row.sellingPrice || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        ₹{calculateSinglePartGST(row.sellingPrice, row.igst, row.cgst).toFixed(2)}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {row.igst > 0 && `IGST: ${row.igst}%`}
                          {row.cgst > 0 && ` CGST: ${row.cgst}%`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₹{calculateTotalValueWithGST(row.sellingPrice, row.quantity, row.igst, row.cgst).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenEditModal(row)}
                            sx={{ borderRadius: 1 }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              console.log('Delete button clicked for:', row);
                              if (typeof handleDeleteItem === 'function') {
                                handleDeleteItem(row);
                              } else {
                                console.error('handleDeleteItem is not a function');
                                alert('Delete function not available');
                              }
                            }}
                            sx={{ 
                              borderRadius: 1,
                              '&:hover': { 
                                backgroundColor: 'error.light',
                                color: 'error.contrastText'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Summary */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Grid container spacing={3} textAlign="center">
                <Grid item xs={6} sm={3}>
                  <Typography variant="h6">{filteredData.length}</Typography>
                  <Typography variant="body2">Total Items</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h6">{filteredData.reduce((sum, i) => sum + (i.quantity || 0), 0)}</Typography>
                  <Typography variant="body2">Total Qty</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h6" color="primary">
                    ₹{calculateTotalGSTAmount().totalGST.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Total GST</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h6">
                    ₹{calculateTotalGSTAmount().totalAmountWithGST.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Total Value</Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Add Modal */}
        <Dialog 
          open={addModalOpen} 
          onClose={() => setAddModalOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold" color="primary">Add New Part to Inventory</Typography>
              <IconButton onClick={() => setAddModalOpen(false)} disabled={isSubmitting}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField name="carName" label="Car Name *" value={formData.carName} onChange={handleInputChange} required fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="model" label="Model *" value={formData.model} onChange={handleInputChange} required fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="partNumber" label="Part Number *" value={formData.partNumber} onChange={handleInputChange} required fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="partName" label="Part Name *" value={formData.partName} onChange={handleInputChange} required fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="quantity" label="Quantity *" type="number" value={formData.quantity} onChange={handleInputChange} required fullWidth margin="normal" inputProps={{ min: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="purchasePrice" 
                    label="Purchase Price *" 
                    type="number" 
                    value={formData.purchasePrice} 
                    onChange={handleInputChange} 
                    required 
                    fullWidth 
                    margin="normal" 
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start">₹</InputAdornment> 
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="sellingPrice" label="Selling Price *" type="number" value={formData.sellingPrice} onChange={handleInputChange} required fullWidth margin="normal" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="hsnNumber" label="HSN Number" value={formData.hsnNumber} onChange={handleInputChange} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="IGST (%)"
                    name="igst"
                    type="number"
                    value={formData.igst}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{ min: 0, max: 30, step: '0.01' }}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="CGST (%)"
                    name="cgst"
                    type="number"
                    value={formData.cgst}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{ min: 0, max: 15, step: '0.01' }}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}>
                {isSubmitting ? 'Adding...' : 'Add Part'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Edit Part</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField name="carName" label="Car Name *" value={editItemData.carName} onChange={handleEditInputChange} required fullWidth margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="model" label="Model *" value={editItemData.model} onChange={handleEditInputChange} required fullWidth margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="partNumber" label="Part Number *" value={editItemData.partNumber} onChange={handleEditInputChange} required fullWidth margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="partName" label="Part Name *" value={editItemData.partName} onChange={handleEditInputChange} required fullWidth margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="quantity" label="Quantity *" type="number" value={editItemData.quantity} onChange={handleEditInputChange} required fullWidth margin="normal" inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="sellingPrice" label="Selling Price *" type="number" value={editItemData.sellingPrice} onChange={handleEditInputChange} required fullWidth margin="normal" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="IGST (%)"
                  name="igst"
                  type="number"
                  value={editItemData.igst}
                  onChange={handleEditInputChange}
                  fullWidth
                  inputProps={{ min: 0, max: 30, step: '0.01' }}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CGST (%)"
                  name="cgst"
                  type="number"
                  value={editItemData.cgst}
                  onChange={handleEditInputChange}
                  fullWidth
                  inputProps={{ min: 0, max: 15, step: '0.01' }}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateItem} variant="contained" disabled={isEditSubmitting}>
              {isEditSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenAddModal}
          sx={{ position: 'fixed', bottom: 16, right: 16, display: { xs: 'flex', sm: 'none' }, backgroundColor: '#ff4d4d' }}
        >
          <AddIcon />
        </Fab>

        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default InventoryManagement;