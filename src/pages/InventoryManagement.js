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
  FormControlLabel,
  Checkbox,
  Grid,
  Pagination,
  TableFooter,
  TablePagination,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InventoryManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for form fields
  const [formData, setFormData] = useState({
    partNumber: '',
    partName: '',
    quantity: '',
    pricePerUnit: '',
    sgstEnabled: false,
    sgstPercentage: '',
    cgstEnabled: false,
    cgstPercentage: ''
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Inventory data from API
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('partName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItemData, setEditItemData] = useState({
    id: '',
    partNumber: '',
    partName: '',
    quantity: '',
    pricePerUnit: '',
    sgstEnabled: false,
    sgstPercentage: '',
    cgstEnabled: false,
    cgstPercentage: ''
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const garageId = localStorage.getItem('garageId');

  // Calculate tax amounts based on percentages
  const calculateTaxAmount = (pricePerUnit, quantity, percentage) => {
    if (!pricePerUnit || !quantity || !percentage) return 0;
    const totalPrice = parseFloat(pricePerUnit) * parseInt(quantity);
    return (totalPrice * parseFloat(percentage)) / 100;
  };

  // Calculate total tax amount (SGST + CGST)
  const calculatetaxAmount = (pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage) => {
    let totalTax = 0;

    if (sgstEnabled && sgstPercentage) {
      totalTax += calculateTaxAmount(pricePerUnit, quantity, sgstPercentage);
    }

    if (cgstEnabled && cgstPercentage) {
      totalTax += calculateTaxAmount(pricePerUnit, quantity, cgstPercentage);
    }

    return totalTax;
  };

  // Calculate total price including taxes
  const calculateTotalPrice = (pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage) => {
    if (!pricePerUnit || !quantity) return 0;

    const basePrice = parseFloat(pricePerUnit) * parseInt(quantity);
    const totalTax = calculatetaxAmount(pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage);

    return basePrice + totalTax;
  };

  // Function to fetch inventory data
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/garage/inventory/${garageId}`,
        {
          headers: {}
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

  // Check if part number already exists
  const checkDuplicatePartNumber = (partNumber, excludeId = null) => {
    return inventoryData.some(item =>
      item.partNumber === partNumber &&
      (excludeId ? (item._id || item.id) !== excludeId : true)
    );
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...inventoryData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.partName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.partNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      // Handle numeric fields
      if (sortField === 'quantity' || sortField === 'pricePerUnit') {
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
    // Reset to first page when filtering
    setPage(0);
  }, [inventoryData, searchTerm, sortField, sortDirection]);

  // Get paginated data
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (!garageId) {
      navigate("/login")
    }
    fetchInventory();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle edit modal input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditItemData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open edit modal with item data
  const handleOpenEditModal = (item) => {
    console.log("Opening edit modal for item:", item);

    if (!item._id && !item.id) {
      setNotification({
        open: true,
        message: 'Item ID is missing. Cannot edit this item.',
        severity: 'error'
      });
      return;
    }

    const itemId = item._id || item.id;

    setEditItemData({
      id: itemId,
      partNumber: item.partNumber || '',
      partName: item.partName || '',
      quantity: item.quantity?.toString() || '',
      pricePerUnit: item.pricePerUnit?.toString() || '',
      sgstEnabled: item.sgstEnabled || false,
      sgstPercentage: item.sgstPercentage?.toString() || '',
      cgstEnabled: item.cgstEnabled || false,
      cgstPercentage: item.cgstPercentage?.toString() || ''
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

      if (!editItemData.id) {
        throw new Error('Item ID is missing. Cannot update this item.');
      }


      // Calculate tax amounts
      const sgstAmount = editItemData.sgstEnabled ?
        calculateTaxAmount(editItemData.pricePerUnit, editItemData.quantity, editItemData.sgstPercentage) : 0;
      const cgstAmount = editItemData.cgstEnabled ?
        calculateTaxAmount(editItemData.pricePerUnit, editItemData.quantity, editItemData.cgstPercentage) : 0;

      const taxAmount = sgstAmount + cgstAmount;

      const requestData = {
        carName: 'abc',
        model: 1,
        partNumber: editItemData.partNumber,
        partName: editItemData.partName,
        quantity: parseInt(editItemData.quantity),
        pricePerUnit: parseFloat(editItemData.pricePerUnit),
        // sgstEnabled: editItemData.sgstEnabled,
        // sgstPercentage: editItemData.sgstEnabled ? parseFloat(editItemData.sgstPercentage) : 0,
        // sgstAmount: sgstAmount,
        // cgstEnabled: editItemData.cgstEnabled,
        // cgstPercentage: editItemData.cgstEnabled ? parseFloat(editItemData.cgstPercentage) : 0,
        // cgstAmount: cgstAmount,
        taxAmount: taxAmount
      };

      console.log('Updating item with ID:', editItemData.id);
      console.log('Request data:', requestData);

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

      setNotification({
        open: true,
        message: 'Item updated successfully!',
        severity: 'success'
      });

      setEditModalOpen(false);
      fetchInventory();

    } catch (error) {
      console.error('Error updating item:', error);

      setNotification({
        open: true,
        message: error.message || error.response?.data?.message || 'Failed to update item. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // Check for duplicate part number
      // if (checkDuplicatePartNumber(formData.partNumber)) {
      //   throw new Error('Part number already exists. Please use a different part number.');
      // }

      // Calculate tax amounts
      const sgstAmount = formData.sgstEnabled ?
        calculateTaxAmount(formData.pricePerUnit, formData.quantity, formData.sgstPercentage) : 0;
      const cgstAmount = formData.cgstEnabled ?
        calculateTaxAmount(formData.pricePerUnit, formData.quantity, formData.cgstPercentage) : 0;

      const taxAmount = sgstAmount + cgstAmount;

      const requestData = {
        name: 'abc', // You might want to make this dynamic
        garageId: garageId,
        quantity: parseInt(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        partNumber: formData.partNumber,
        partName: formData.partName,
        // sgstEnabled: formData.sgstEnabled,
        // sgstPercentage: formData.sgstEnabled ? parseFloat(formData.sgstPercentage) : 0,
        // sgstAmount: sgstAmount,
        // cgstEnabled: formData.cgstEnabled,
        // cgstPercentage: formData.cgstEnabled ? parseFloat(formData.cgstPercentage) : 0,
        // cgstAmount: cgstAmount,
        taxAmount: taxAmount
      };

      console.log('Adding inventory item with data:', requestData);

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

      setNotification({
        open: true,
        message: 'Part added successfully!',
        severity: 'success'
      });

      // Reset form
      setFormData({
        partNumber: '',
        partName: '',
        quantity: '',
        pricePerUnit: '',
        sgstEnabled: false,
        sgstPercentage: '',
        cgstEnabled: false,
        cgstPercentage: ''
      });

      fetchInventory();

    } catch (error) {
      console.error('Error adding part:', error);

      setNotification({
        open: true,
        message: error.message || error.response?.data?.message || 'Failed to add part. Please try again.',
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
      ml: { xs: 0, sm: 35 },
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
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mb: 3 }}
            >
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="partNumber"
                    label="Part Number"
                    variant="outlined"
                    value={formData.partNumber}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    error={checkDuplicatePartNumber(formData.partNumber)}
                    helperText={checkDuplicatePartNumber(formData.partNumber) ? "Part number already exists" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="partName"
                    label="Part Name"
                    variant="outlined"
                    value={formData.partName}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="quantity"
                    label="Quantity"
                    type="number"
                    variant="outlined"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: 1 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="pricePerUnit"
                    label="Price Per Unit"
                    type="number"
                    variant="outlined"
                    value={formData.pricePerUnit}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: 0, step: "0.01" }}
                    fullWidth
                  />
                </Grid>
              </Grid>

              {/* Tax Section */}
              <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Tax Configuration</Typography>

                <Grid container spacing={2}>
                  {/* SGST Section */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="sgstEnabled"
                            checked={formData.sgstEnabled}
                            onChange={handleInputChange}
                          />
                        }
                        label="Enable SGST"
                      />
                      {formData.sgstEnabled && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            name="sgstPercentage"
                            label="SGST Percentage (%)"
                            type="number"
                            variant="outlined"
                            value={formData.sgstPercentage}
                            onChange={handleInputChange}
                            required={formData.sgstEnabled}
                            inputProps={{ min: 0, max: 100, step: "0.01" }}
                            fullWidth
                            size="small"
                          />
                          {formData.pricePerUnit && formData.quantity && formData.sgstPercentage && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                              SGST Amount: ₹{calculateTaxAmount(formData.pricePerUnit, formData.quantity, formData.sgstPercentage).toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* CGST Section */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="cgstEnabled"
                            checked={formData.cgstEnabled}
                            onChange={handleInputChange}
                          />
                        }
                        label="Enable CGST"
                      />
                      {formData.cgstEnabled && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            name="cgstPercentage"
                            label="CGST Percentage (%)"
                            type="number"
                            variant="outlined"
                            value={formData.cgstPercentage}
                            onChange={handleInputChange}
                            required={formData.cgstEnabled}
                            inputProps={{ min: 0, max: 100, step: "0.01" }}
                            fullWidth
                            size="small"
                          />
                          {formData.pricePerUnit && formData.quantity && formData.cgstPercentage && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                              CGST Amount: ₹{calculateTaxAmount(formData.pricePerUnit, formData.quantity, formData.cgstPercentage).toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Total Tax and Price Display */}
                {formData.pricePerUnit && formData.quantity && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" color="primary">
                          Total Tax: ₹{calculatetaxAmount(
                            formData.pricePerUnit,
                            formData.quantity,
                            formData.sgstEnabled,
                            formData.sgstPercentage,
                            formData.cgstEnabled,
                            formData.cgstPercentage
                          ).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formData.sgstEnabled && formData.sgstPercentage && (
                            <>SGST: ₹{calculateTaxAmount(formData.pricePerUnit, formData.quantity, formData.sgstPercentage).toFixed(2)}</>
                          )}
                          {formData.sgstEnabled && formData.cgstEnabled && formData.sgstPercentage && formData.cgstPercentage && <> + </>}
                          {formData.cgstEnabled && formData.cgstPercentage && (
                            <>CGST: ₹{calculateTaxAmount(formData.pricePerUnit, formData.quantity, formData.cgstPercentage).toFixed(2)}</>
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6">
                          Total Price: ₹{calculateTotalPrice(
                            formData.pricePerUnit,
                            formData.quantity,
                            formData.sgstEnabled,
                            formData.sgstPercentage,
                            formData.cgstEnabled,
                            formData.cgstPercentage
                          ).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Base Price: ₹{(parseFloat(formData.pricePerUnit) * parseInt(formData.quantity || 0)).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || checkDuplicatePartNumber(formData.partNumber)}
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
            </Box>

            {/* Search and Filter Section */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by part name or number..."
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
                <Select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="partName">Part Name</MenuItem>
                  <MenuItem value="partNumber">Part Number</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                  <MenuItem value="pricePerUnit">Price</MenuItem>
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
              <Table sx={{ minWidth: 650 }} aria-label="inventory table">
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
                        cursor: 'pointer',
                        '&:first-of-type': {
                          borderTopLeftRadius: theme.shape.borderRadius,
                        },
                        '&:last-of-type': {
                          borderTopRightRadius: theme.shape.borderRadius,
                        }
                      }
                    }}
                  >
                    <TableCell onClick={() => handleSortChange('partNumber')}>
                      Part No. {sortField === 'partNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('partName')}>
                      Name Of Part {sortField === 'partName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('quantity')}>
                      Qty {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSortChange('pricePerUnit')}>
                      Price/Unit {sortField === 'pricePerUnit' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell>Total Tax</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow
                      key={row._id || row.id || `row-${index}`}
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
                      <TableCell>{row.partNumber}</TableCell>
                      <TableCell>{row.partName}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{typeof row.pricePerUnit === 'number' ? `₹${row.pricePerUnit.toFixed(2)}` : row.price}</TableCell>
                      <TableCell>
                        {/* <Typography variant="body2" color="primary" fontWeight={600}>
                          ₹{(row.taxAmount ||
                            calculatetaxAmount(
                              row.pricePerUnit,
                              row.quantity,
                              row.sgstEnabled,
                              row.sgstPercentage,
                              row.cgstEnabled,
                              row.cgstPercentage
                            )).toFixed(2)}
                        </Typography>
                        {((row.sgstEnabled && row.sgstPercentage) || (row.cgstEnabled && row.cgstPercentage)) && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {row.sgstEnabled && row.sgstPercentage && `SGST: ${row.sgstPercentage}%`}
                            {row.sgstEnabled && row.cgstEnabled && row.sgstPercentage && row.cgstPercentage && ` + `}
                            {row.cgstEnabled && row.cgstPercentage && `CGST: ${row.cgstPercentage}%`}
                          </Typography>
                        )} */}
                        {row.taxAmount}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          ₹{(row.totalPrice ||
                            calculateTotalPrice(
                              row.pricePerUnit,
                              row.quantity,
                              row.sgstEnabled,
                              row.sgstPercentage,
                              row.cgstEnabled,
                              row.cgstPercentage
                            )).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEditModal(row)}
                          sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Empty rows for consistent table height */}
                  {paginatedData.length < rowsPerPage && Array.from({
                    length: rowsPerPage - paginatedData.length
                  }).map((_, index) => (
                    <TableRow key={`empty-${index}`} sx={{ height: 73 }}>
                      <TableCell colSpan={7}></TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                {/* Table Footer with Pagination */}
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      colSpan={7}
                      count={filteredData.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      SelectProps={{
                        inputProps: {
                          'aria-label': 'rows per page',
                        },
                        native: true,
                      }}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      sx={{
                        '& .MuiTablePagination-toolbar': {
                          backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                        },
                        '& .MuiTablePagination-caption': {
                          fontWeight: 500,
                        }
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            {/* Summary Statistics */}
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
                    ₹{filteredData.reduce((sum, item) => {
                      const totalTax = calculatetaxAmount(
                        item.pricePerUnit,
                        item.quantity,
                        item.sgstEnabled,
                        item.sgstPercentage,
                        item.cgstEnabled,
                        item.cgstPercentage
                      );
                      return sum + totalTax;
                    }, 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tax Amount
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6" fontWeight={600}>
                    ₹{filteredData.reduce((sum, item) => {
                      const total = calculateTotalPrice(
                        item.pricePerUnit,
                        item.quantity,
                        item.sgstEnabled,
                        item.sgstPercentage,
                        item.cgstEnabled,
                        item.cgstPercentage
                      );
                      return sum + total;
                    }, 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </Grid>
              </Grid>
            </Box>
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
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
          </Grid>

          {/* Tax Section for Edit Modal */}
          <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Tax Configuration</Typography>

            <Grid container spacing={2}>
              {/* SGST Section */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="sgstEnabled"
                        checked={editItemData.sgstEnabled}
                        onChange={handleEditInputChange}
                      />
                    }
                    label="Enable SGST"
                  />
                  {editItemData.sgstEnabled && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        name="sgstPercentage"
                        label="SGST Percentage (%)"
                        type="number"
                        variant="outlined"
                        value={editItemData.sgstPercentage}
                        onChange={handleEditInputChange}
                        required={editItemData.sgstEnabled}
                        inputProps={{ min: 0, max: 100, step: "0.01" }}
                        fullWidth
                        size="small"
                      />
                      {editItemData.pricePerUnit && editItemData.quantity && editItemData.sgstPercentage && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                          SGST Amount: ₹{calculateTaxAmount(editItemData.pricePerUnit, editItemData.quantity, editItemData.sgstPercentage).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* CGST Section */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="cgstEnabled"
                        checked={editItemData.cgstEnabled}
                        onChange={handleEditInputChange}
                      />
                    }
                    label="Enable CGST"
                  />
                  {editItemData.cgstEnabled && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        name="cgstPercentage"
                        label="CGST Percentage (%)"
                        type="number"
                        variant="outlined"
                        value={editItemData.cgstPercentage}
                        onChange={handleEditInputChange}
                        required={editItemData.cgstEnabled}
                        inputProps={{ min: 0, max: 100, step: "0.01" }}
                        fullWidth
                        size="small"
                      />
                      {editItemData.pricePerUnit && editItemData.quantity && editItemData.cgstPercentage && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                          CGST Amount: ₹{calculateTaxAmount(editItemData.pricePerUnit, editItemData.quantity, editItemData.cgstPercentage).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Total Tax and Price Display */}
            {editItemData.pricePerUnit && editItemData.quantity && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="primary">
                      Total Tax: ₹{calculatetaxAmount(
                        editItemData.pricePerUnit,
                        editItemData.quantity,
                        editItemData.sgstEnabled,
                        editItemData.sgstPercentage,
                        editItemData.cgstEnabled,
                        editItemData.cgstPercentage
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editItemData.sgstEnabled && editItemData.sgstPercentage && (
                        <>SGST: ₹{calculateTaxAmount(editItemData.pricePerUnit, editItemData.quantity, editItemData.sgstPercentage).toFixed(2)}</>
                      )}
                      {editItemData.sgstEnabled && editItemData.cgstEnabled && editItemData.sgstPercentage && editItemData.cgstPercentage && <> + </>}
                      {editItemData.cgstEnabled && editItemData.cgstPercentage && (
                        <>CGST: ₹{calculateTaxAmount(editItemData.pricePerUnit, editItemData.quantity, editItemData.cgstPercentage).toFixed(2)}</>
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">
                      Total Price: ₹{calculateTotalPrice(
                        editItemData.pricePerUnit,
                        editItemData.quantity,
                        editItemData.sgstEnabled,
                        editItemData.sgstPercentage,
                        editItemData.cgstEnabled,
                        editItemData.cgstPercentage
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Base Price: ₹{(parseFloat(editItemData.pricePerUnit) * parseInt(editItemData.quantity || 0)).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
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