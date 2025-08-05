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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InventoryManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Base API URL - Using your provided production backend
  const API_BASE_URL = 'https://garage-management-zi5z.onrender.com/api';

  // State for modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form data states
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
    cgstSgst: '',
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
    cgstSgst: '',
  });

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Inventory data
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search & sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('partName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Auth & Garage Info
  const garageId = localStorage.getItem('garageId');
  const token = localStorage.getItem('token');

  // Calculate tax amount
  const calculateTaxAmount = (purchasePrice, quantity, igst, cgstSgst) => {
    if (!purchasePrice || !quantity) return 0;
    const totalPrice = parseFloat(purchasePrice) * parseInt(quantity);
    const igstAmount = igst ? (totalPrice * parseFloat(igst)) / 100 : 0;
    const cgstSgstAmount = cgstSgst ? (totalPrice * parseFloat(cgstSgst) * 2) / 100 : 0; // CGST + SGST
    return igstAmount + cgstSgstAmount;
  };

  // Calculate total price including tax
  const calculateTotalPrice = (purchasePrice, quantity, igst, cgstSgst) => {
    const basePrice = parseFloat(purchasePrice) * parseInt(quantity || 0);
    const taxAmount = calculateTaxAmount(purchasePrice, quantity, igst, cgstSgst);
    return basePrice + taxAmount;
  };

   // Function to fetch inventory data
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/inventory/${garageId}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          }
        );
  
        const data = response.data;
        const inventoryArray = Array.isArray(data) ? data : data.data || [];
        setInventoryData(inventoryArray);
        setFilteredData(inventoryArray);
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

  // Apply search and sort
  useEffect(() => {
    let filtered = [...inventoryData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.carName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.model?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
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

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
    setPage(0);
  }, [inventoryData, searchTerm, sortField, sortDirection]);

  // Paginated data
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Event handlers
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

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItemData((prev) => ({ ...prev, [name]: value }));
  };

  // Modal handlers
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
      cgstSgst: '',
    });
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => setAddModalOpen(false);
  const handleCloseEditModal = () => setEditModalOpen(false);

  const handleOpenEditModal = (item) => {
    if (!item._id && !item.id) {
      setNotification({
        open: true,
        message: 'Item ID is missing. Cannot edit this item.',
        severity: 'error',
      });
      return;
    }

    const itemId = item._id || item.id;
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
      cgstSgst: item.cgstSgst?.toString() || '',
    });
    setEditModalOpen(true);
  };

  // Validate form data
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
    return errors;
  };

  // Add new part
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const taxAmount = calculateTaxAmount(
        formData.purchasePrice,
        formData.quantity,
        formData.igst,
        formData.cgstSgst
      );

      const requestData = {
        garageId,
        carName: formData.carName.trim(),
        model: formData.model.trim(),
        partNumber: formData.partNumber.trim(),
        partName: formData.partName.trim(),
        quantity: parseInt(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        taxAmount,
        hsnNumber: formData.hsnNumber.trim(),
        igst: parseFloat(formData.igst) || 0,
        cgstSgst: parseFloat(formData.cgstSgst) || 0,
      };

      
      await axios.post(`${API_BASE_URL}/inventory/add`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      setNotification({
        open: true,
        message: 'Part added successfully!',
        severity: 'success',
      });
      setAddModalOpen(false);
      fetchInventory();
    } catch (error) {
      console.error('Error adding part:', error);
      setNotification({
        open: true,
        message: error.message || error.response?.data?.message || 'Failed to add part.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing part
  const handleUpdateItem = async () => {
    try {
      setIsEditSubmitting(true);

      if (!editItemData.id) {
        throw new Error('Item ID is missing. Cannot update.');
      }

      const validationErrors = validateFormData(editItemData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const requestData = {
        quantity: parseInt(editItemData.quantity),
        sellingPrice: parseFloat(editItemData.sellingPrice),
        purchasePrice: parseFloat(editItemData.purchasePrice),
        carName: editItemData.carName.trim(),
        model: editItemData.model.trim(),
        partNumber: editItemData.partNumber.trim(),
        partName: editItemData.partName.trim(),
        hsnNumber: editItemData.hsnNumber.trim(),
        igst: parseFloat(editItemData.igst) || 0,
        cgstSgst: parseFloat(editItemData.cgstSgst) || 0,
      };

      
      await axios.put(`${API_BASE_URL}/inventory/update/${editItemData.id}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      setNotification({
        open: true,
        message: 'Item updated successfully!',
        severity: 'success',
      });
      setEditModalOpen(false);
      fetchInventory();
    } catch (error) {
      console.error('Error updating item:', error);
      setNotification({
        open: true,
        message: error.message || error.response?.data?.message || 'Failed to update item.',
        severity: 'error',
      });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Redirect if no garageId
  useEffect(() => {
    if (!garageId) {
      navigate('/login');
      return;
    }
    fetchInventory();
  }, [garageId, navigate]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        mb: 4,
        ml: { xs: 0, sm: 35 },
        overflow: 'auto',
        pt: 3,
      }}
    >
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
            bgcolor: 'rgba(255, 255, 255, 0.7)',
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
            sx={{
              backgroundColor: '#ff4d4d',
              '&:hover': { backgroundColor: '#e63939' },
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            Add Part
          </Button>
        </Box>

        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: theme.shadows[3] }}>
          <CardContent sx={{ p: 4 }}>
            {/* Search & Sort */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by part name, number, car name or model..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                sx={{ minWidth: 300, flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortField} onChange={(e) => setSortField(e.target.value)} label="Sort By">
                  <MenuItem value="carName">Car Name</MenuItem>
                  <MenuItem value="model">Model</MenuItem>
                  <MenuItem value="partName">Part Name</MenuItem>
                  <MenuItem value="partNumber">Part Number</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                  <MenuItem value="purchasePrice">Purchase Price</MenuItem>
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

            {/* Inventory Table */}
            <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
              <Table aria-label="inventory table">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      '& .MuiTableCell-head': {
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        border: 'none',
                        cursor: 'pointer',
                      },
                    }}
                  >
                    <TableCell onClick={() => handleSortChange('carName')}>
                      Car Name {sortField === 'carName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('model')}>
                      Model {sortField === 'model' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('partNumber')}>
                      Part No. {sortField === 'partNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('partName')}>
                      Part Name {sortField === 'partName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('quantity')}>
                      Qty {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('purchasePrice')}>
                      Purchase Price {sortField === 'purchasePrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('sellingPrice')}>
                      Selling Price {sortField === 'sellingPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell>Tax Amount</TableCell>
                    <TableCell>HSN Number</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow
                      key={row._id || row.id || `row-${index}`}
                      sx={{
                        '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover },
                        '&:hover': { backgroundColor: theme.palette.action.selected },
                        '& .MuiTableCell-root': { borderBottom: `1px solid ${theme.palette.divider}`, padding: '6px 12px' },
                      }}
                    >
                      <TableCell>{row.carName || 'N/A'}</TableCell>
                      <TableCell>{row.model || 'N/A'}</TableCell>
                      <TableCell>{row.partNumber || 'N/A'}</TableCell>
                      <TableCell>{row.partName || 'N/A'}</TableCell>
                      <TableCell>{row.quantity || 0}</TableCell>
                      <TableCell>₹{parseFloat(row.purchasePrice || 0).toFixed(2)}</TableCell>
                      <TableCell>₹{parseFloat(row.sellingPrice || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          ₹{(row.taxAmount || calculateTaxAmount(
                            row.purchasePrice,
                            row.quantity,
                            row.igst,
                            row.cgstSgst
                          )).toFixed(2)}
                        </Typography>
                        {(row.igst || row.cgstSgst) && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {row.igst && `IGST: ${row.igst}%`}
                            {row.igst && row.cgstSgst && ' | '}
                            {row.cgstSgst && `CGST+SGST: ${(row.cgstSgst * 2)}%`}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row.hsnNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEditModal(row)}
                          sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 500 }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      colSpan={10}
                      count={filteredData.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            {/* Summary Stats */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6" fontWeight={600}>
                    {filteredData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'Filtered Items' : 'Total Items'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6" fontWeight={600}>
                    {filteredData.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Quantity
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    ₹{filteredData
                      .reduce(
                        (sum, item) =>
                          sum +
                          calculateTaxAmount(item.purchasePrice, item.quantity, item.igst, item.cgstSgst),
                        0
                      )
                      .toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tax Amount
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6" fontWeight={600}>
                    ₹{filteredData
                      .reduce(
                        (sum, item) =>
                          sum + calculateTotalPrice(item.purchasePrice, item.quantity, item.igst, item.cgstSgst),
                        0
                      )
                      .toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Inventory Value
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={fetchInventory}
            disabled={isLoading}
            sx={{ px: 3, py: 1, borderRadius: 2 }}
          >
            {isLoading ? 'Loading...' : 'Refresh Inventory'}
          </Button>
        </Box>
      </Container>

      {/* Add Part Modal */}
      <Dialog open={addModalOpen} onClose={handleCloseAddModal} fullWidth maxWidth="md">
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add New Part</Typography>
            <IconButton onClick={handleCloseAddModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* All form fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="carName"
                  label="Car Name *"
                  value={formData.carName}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  margin="normal"
                  placeholder="e.g., Toyota Camry"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="model"
                  label="Model *"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  margin="normal"
                  placeholder="e.g., 2023"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="partNumber"
                  label="Part Number *"
                  value={formData.partNumber}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  margin="normal"
                  placeholder="e.g., TOY-CAM-001"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="partName"
                  label="Part Name *"
                  value={formData.partName}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  margin="normal"
                  placeholder="e.g., Oil Filter"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="quantity"
                  label="Quantity *"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="purchasePrice"
                  label="Purchase Price *"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: '0.01' }}
                  fullWidth
                  margin="normal"
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="sellingPrice"
                  label="Selling Price *"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: '0.01' }}
                  fullWidth
                  margin="normal"
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="hsnNumber"
                  label="HSN Number"
                  value={formData.hsnNumber}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="igst"
                  label="IGST (%)"
                  type="number"
                  value={formData.igst}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, max: 100, step: '0.01' }}
                  fullWidth
                  margin="normal"
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="cgstSgst"
                  label="CGST/SGST (each %)"
                  type="number"
                  value={formData.cgstSgst}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, max: 100, step: '0.01' }}
                  fullWidth
                  margin="normal"
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              </Grid>
            </Grid>

            {/* Tax Preview */}
            {formData.purchasePrice && formData.quantity && (formData.igst || formData.cgstSgst) && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Tax Calculation Preview</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Base Amount: ₹{(parseFloat(formData.purchasePrice) * parseInt(formData.quantity || 0)).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      Tax Amount: ₹{calculateTaxAmount(
                        formData.purchasePrice,
                        formData.quantity,
                        formData.igst,
                        formData.cgstSgst
                      ).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" fontWeight={600}>
                      Total: ₹{calculateTotalPrice(
                        formData.purchasePrice,
                        formData.quantity,
                        formData.igst,
                        formData.cgstSgst
                      ).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAddModal} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{
              backgroundColor: '#ff4d4d',
              '&:hover': { backgroundColor: '#e63939' },
            }}
          >
            {isSubmitting ? 'Adding Part...' : 'Add Part'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={handleCloseEditModal} fullWidth maxWidth="md">
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Inventory Item</Typography>
            <IconButton onClick={handleCloseEditModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Edit form fields (same structure as Add) */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="carName"
                label="Car Name *"
                value={editItemData.carName}
                onChange={handleEditInputChange}
                required
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="model"
                label="Model *"
                value={editItemData.model}
                onChange={handleEditInputChange}
                required
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="partNumber"
                label="Part Number *"
                value={editItemData.partNumber}
                onChange={handleEditInputChange}
                required
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="partName"
                label="Part Name *"
                value={editItemData.partName}
                onChange={handleEditInputChange}
                required
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantity"
                label="Quantity *"
                type="number"
                value={editItemData.quantity}
                onChange={handleEditInputChange}
                required
                inputProps={{ min: 1 }}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="purchasePrice"
                label="Purchase Price *"
                type="number"
                value={editItemData.purchasePrice}
                onChange={handleEditInputChange}
                required
                inputProps={{ min: 0, step: '0.01' }}
                fullWidth
                margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="sellingPrice"
                label="Selling Price *"
                type="number"
                value={editItemData.sellingPrice}
                onChange={handleEditInputChange}
                required
                inputProps={{ min: 0, step: '0.01' }}
                fullWidth
                margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="hsnNumber"
                label="HSN Number"
                value={editItemData.hsnNumber}
                onChange={handleEditInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="igst"
                label="IGST (%)"
                type="number"
                value={editItemData.igst}
                onChange={handleEditInputChange}
                inputProps={{ min: 0, max: 100, step: '0.01' }}
                fullWidth
                margin="normal"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="cgstSgst"
                label="CGST/SGST (each %)"
                type="number"
                value={editItemData.cgstSgst}
                onChange={handleEditInputChange}
                inputProps={{ min: 0, max: 100, step: '0.01' }}
                fullWidth
                margin="normal"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEditModal} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateItem}
            variant="contained"
            disabled={isEditSubmitting}
            startIcon={isEditSubmitting ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {isEditSubmitting ? 'Updating...' : 'Update Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenAddModal}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
          backgroundColor: '#ff4d4d',
          '&:hover': { backgroundColor: '#e63939' },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryManagement;