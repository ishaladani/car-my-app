import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, LinearProgress, Paper, Grid,
  useMediaQuery, useTheme, Alert, IconButton, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, FormControl, InputLabel, Select, MenuItem,
  Accordion, AccordionSummary, AccordionDetails, Divider,
  Avatar, ListItem, ListItemAvatar, ListItemText, List
} from "@mui/material";
import {
  Inventory as InventoryIcon, TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon, Refresh as RefreshIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon, Download as DownloadIcon,
  Print as PrintIcon, Share as ShareIcon, FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon, ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon
} from "@mui/icons-material";
import axios from "axios";

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  let garageId = localStorage.getItem("garageId") || localStorage.getItem("garage_id");
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [lowStockAlert, setLowStockAlert] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [apiErrors, setApiErrors] = useState({
    report: null,
    lowStock: null,
    summary: null
  });

  // Handle back navigation
  const handleGoBack = () => {
    navigate('/dashboard'); // Adjust route as needed
  };

  // API call functions
  const fetchInventoryReport = async (threshold = lowStockThreshold) => {
    try {
      console.log(`🔍 Fetching inventory report with threshold: ${threshold}`);
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/inventory/report/${garageId}?lowStockThreshold=${threshold}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 10000
        }
      );
      
      console.log('📊 Inventory report received:', response.data);
      setInventoryReport(response.data.report);
      setApiErrors(prev => ({ ...prev, report: null }));
      
    } catch (error) {
      console.error('❌ Error fetching inventory report:', error);
      setApiErrors(prev => ({ 
        ...prev, 
        report: error.response?.data?.message || error.message || 'Failed to fetch inventory report'
      }));
    }
  };

  const fetchLowStockItems = async (threshold = lowStockThreshold) => {
    try {
      console.log(`🔍 Fetching low stock items with threshold: ${threshold}`);
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/inventory/low-stock/${garageId}?threshold=${threshold}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 10000
        }
      );
      
      console.log('⚠️ Low stock alert received:', response.data);
      setLowStockAlert(response.data.alert);
      setApiErrors(prev => ({ ...prev, lowStock: null }));
      
    } catch (error) {
      console.error('❌ Error fetching low stock items:', error);
      setApiErrors(prev => ({ 
        ...prev, 
        lowStock: error.response?.data?.message || error.message || 'Failed to fetch low stock items'
      }));
    }
  };

  const fetchInventorySummary = async () => {
    try {
      console.log('🔍 Fetching inventory summary');
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/inventory/summary/${garageId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 10000
        }
      );
      
      console.log('📈 Inventory summary received:', response.data);
      setInventorySummary(response.data.summary);
      setApiErrors(prev => ({ ...prev, summary: null }));
      
    } catch (error) {
      console.error('❌ Error fetching inventory summary:', error);
      setApiErrors(prev => ({ 
        ...prev, 
        summary: error.response?.data?.message || error.message || 'Failed to fetch inventory summary'
      }));
    }
  };

  // Fetch all data
  const fetchAllInventoryData = async (threshold = lowStockThreshold) => {
    setIsLoading(true);
    setLastUpdated(new Date());
    
    try {
      await Promise.all([
        fetchInventoryReport(threshold),
        fetchLowStockItems(threshold),
        fetchInventorySummary()
      ]);
      
      setSnackbar({
        open: true,
        message: 'Inventory data refreshed successfully!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setSnackbar({
        open: true,
        message: 'Some inventory data could not be loaded',
        severity: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!garageId) {
      navigate("/login");
      return;
    }
    
    fetchAllInventoryData();
  }, [garageId, navigate]);

  // Handle threshold change
  const handleThresholdChange = (newThreshold) => {
    setLowStockThreshold(newThreshold);
    fetchAllInventoryData(newThreshold);
  };

  // Utility functions
  const getStockStatusColor = (currentStock, minStock = lowStockThreshold) => {
    if (currentStock === 0) return 'error';
    if (currentStock <= minStock) return 'warning';
    if (currentStock <= minStock * 2) return 'info';
    return 'success';
  };

  const getStockStatusText = (currentStock, minStock = lowStockThreshold) => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= minStock) return 'Low Stock';
    if (currentStock <= minStock * 2) return 'Moderate';
    return 'In Stock';
  };

  const formatCurrency = (amount) => {
    return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount || 0)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter inventory items based on actual API structure
  const getFilteredParts = (parts) => {
    if (!parts) return [];
    
    let filtered = parts;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(part => 
        part.model?.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(part =>
        part.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.carName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.hsnNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get unique categories (using model field as category)
  const getCategories = () => {
    if (!inventoryReport?.allParts) return [];
    const categories = [...new Set(inventoryReport.allParts.map(part => part.model).filter(Boolean))];
    return categories;
  };

  // Summary Card Component
  const SummaryCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => (
    <Card sx={{ height: '100%', borderLeft: `4px solid ${theme.palette[color].main}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ ml: { xs: 0, md: "280px" }, px: { xs: 2, md: 3 }, py: 4 }}>
        <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Box sx={{ textAlign: 'center' }}>
              <LinearProgress sx={{ width: 300, mb: 2 }} />
              <Typography variant="h6">Loading inventory data...</Typography>
              <Typography variant="body2" color="textSecondary">
                Fetching reports, low stock items, and summary
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ ml: { xs: 0, md: "280px" }, px: { xs: 2, md: 3 }, py: 4 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ mb: 4, p: isMobile ? 2 : 3, borderRadius: 2 }}>
        <Box sx={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row", 
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center", 
          mb: 3, 
          gap: isMobile ? 2 : 0 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={handleGoBack}
              sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} color="primary" fontWeight="bold">
                Inventory Dashboard
              </Typography>
              {lastUpdated && (
                <Typography variant="body2" color="textSecondary">
                  Last updated: {formatDate(lastUpdated)}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                Garage ID: {garageId}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchAllInventoryData()}
              size={isMobile ? "small" : "medium"}
            >
              Refresh Data
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              size={isMobile ? "small" : "medium"}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {/* Controls Section */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', mb: 3 }}>
          <TextField
            label="Low Stock Threshold"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => handleThresholdChange(parseInt(e.target.value) || 3)}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Search Parts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by part name, number, car name..."
            size="small"
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="Model"
            >
              <MenuItem value="all">All Models</MenuItem>
              {getCategories().map(category => (
                <MenuItem key={category} value={category}>Model {category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* API Error Alerts */}
      {Object.values(apiErrors).some(error => error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>API Connection Issues:</strong>
          </Typography>
          {apiErrors.report && <Typography variant="body2">• Inventory Report: {apiErrors.report}</Typography>}
          {apiErrors.lowStock && <Typography variant="body2">• Low Stock Items: {apiErrors.lowStock}</Typography>}
          {apiErrors.summary && <Typography variant="body2">• Inventory Summary: {apiErrors.summary}</Typography>}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Parts"
            value={inventorySummary?.totalUniqueParts || inventoryReport?.summary?.totalParts || 0}
            subtitle={`${inventorySummary?.totalPartsAvailable || inventoryReport?.summary?.totalPartsAvailable || 0} units available`}
            icon={<InventoryIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Value"
            value={formatCurrency(inventorySummary?.totalSellingValue || inventoryReport?.summary?.totalSellingValue)}
            subtitle={`Purchase: ${formatCurrency(inventorySummary?.totalPurchaseValue || inventoryReport?.summary?.totalPurchaseValue)}`}
            icon={<AssessmentIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Potential Profit"
            value={formatCurrency(inventorySummary?.potentialProfit || inventoryReport?.summary?.potentialProfit)}
            subtitle="Selling - Purchase"
            icon={<TrendingUpIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Low Stock Alert"
            value={lowStockAlert?.summary?.totalLowStockParts || inventoryReport?.summary?.lowStockCount || 0}
            subtitle={`${lowStockAlert?.summary?.outOfStockParts || inventoryReport?.summary?.outOfStockCount || 0} out of stock`}
            icon={<WarningIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Low Stock Items Section */}
      <Paper elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6" fontWeight="bold">
                Low Stock Alert ({lowStockAlert?.allLowStockParts?.length || inventoryReport?.lowStockParts?.length || 0} parts)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {(lowStockAlert?.allLowStockParts?.length > 0 || inventoryReport?.lowStockParts?.length > 0) ? (
              <List>
                {(lowStockAlert?.allLowStockParts || inventoryReport?.lowStockParts || []).slice(0, 10).map((part, index) => (
                  <React.Fragment key={part._id || index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: part.quantity === 0 ? 'error.main' : 'warning.main' }}>
                          {part.quantity || 0}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {part.partName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ({part.partNumber})
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Car: {part.carName} | Model: {part.model} | HSN: {part.hsnNumber}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Purchase: {formatCurrency(part.purchasePrice)} | Selling: {formatCurrency(part.sellingPrice)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={part.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                          color={part.quantity === 0 ? 'error' : 'warning'}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" display="block" color="textSecondary">
                          Stock: {part.quantity}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < (lowStockAlert?.allLowStockParts || inventoryReport?.lowStockParts || []).slice(0, 10).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {(lowStockAlert?.allLowStockParts?.length || inventoryReport?.lowStockParts?.length || 0) > 10 && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="primary" align="center">
                          +{(lowStockAlert?.allLowStockParts?.length || inventoryReport?.lowStockParts?.length) - 10} more parts with low stock
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main">
                  All Parts Well Stocked!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  No parts below the threshold of {lowStockThreshold} units
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Detailed Inventory Report */}
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Detailed Inventory Report
                {inventoryReport?.allParts && ` (${getFilteredParts(inventoryReport.allParts).length} parts)`}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {inventoryReport?.allParts && getFilteredParts(inventoryReport.allParts).length > 0 ? (
              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Part Details</strong></TableCell>
                      <TableCell><strong>Car/Model</strong></TableCell>
                      <TableCell align="right"><strong>Stock</strong></TableCell>
                      <TableCell align="right"><strong>Purchase Price</strong></TableCell>
                      <TableCell align="right"><strong>Selling Price</strong></TableCell>
                      <TableCell align="right"><strong>Total Value</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredParts(inventoryReport.allParts).map((part, index) => (
                      <TableRow 
                        key={part._id || index}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {part.partName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Part #: {part.partNumber} | HSN: {part.hsnNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{part.carName}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Model: {part.model}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            color={part.quantity === 0 ? 'error' : part.isLowStock ? 'warning.main' : 'inherit'}
                            fontWeight={part.isLowStock || part.quantity === 0 ? 'bold' : 'normal'}
                          >
                            {part.quantity || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(part.purchasePrice)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(part.sellingPrice)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(part.totalSellingValue)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            P: {formatCurrency(part.totalPurchaseValue)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={part.isOutOfStock ? 'Out of Stock' : part.isLowStock ? 'Low Stock' : 'In Stock'}
                            color={part.isOutOfStock ? 'error' : part.isLowStock ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InventoryIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  {searchTerm || filterCategory !== 'all' ? 'No parts match your filters' : 'No inventory data available'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {searchTerm || filterCategory !== 'all' ? 'Try adjusting your search or filter criteria' : 'Check your API connection or add inventory parts'}
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Category Breakdown */}
      {inventorySummary?.categories && (
        <Paper elevation={3} sx={{ mt: 4, borderRadius: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon color="secondary" />
                <Typography variant="h6" fontWeight="bold">
                  Category Breakdown ({inventorySummary.categories.length} categories)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {inventorySummary.categories.map((category, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          Model {category.category}
                        </Typography>
                        <Typography variant="h4" color="secondary" sx={{ my: 1 }}>
                          {category.partsCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          parts
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                          {formatCurrency(category.totalValue)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({...snackbar, open: false})}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            zIndex: 9999 
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default InventoryDashboard;