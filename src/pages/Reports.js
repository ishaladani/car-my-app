import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Container,
  CssBaseline,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { 
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import axios from 'axios';

const RecordReport = () => {
  const token = localStorage.getItem("authToken")
    ? `Bearer ${localStorage.getItem("authToken")}`
    : "";
  const garageId = localStorage.getItem("garageId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('financial');
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      if (!token || !garageId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `https://garage-management-system-cr4w.onrender.com/api/inventory/${garageId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        // Process the response
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.inventory
          ? response.data.inventory
          : response.data.data
          ? response.data.data
          : [];

        setInventoryData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        setError("Failed to load inventory data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [token, garageId]);

const handleSearch = (e) => {
  const searchTerm = e.target.value.toLowerCase();
  setSearch(searchTerm);
  
  if (searchTerm.trim() === '') {
    setFilteredData(inventoryData);
  } else {
    const filtered = inventoryData.filter(
      item => 
        (item.partName && item.partName.toLowerCase().includes(searchTerm)) || 
        (item.partNumber && item.partNumber.toLowerCase().includes(searchTerm)) || 
        (item.carName && item.carName.toLowerCase().includes(searchTerm)) || 
        (item.model && item.model.toLowerCase().includes(searchTerm))
    );
    setFilteredData(filtered);
  }
};

  // Handle report type change
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  // Handle date changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // Handle view button click
  const handleViewClick = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  // Generate report
  const handleGenerateReport = () => {
    // Filter data based on date range if provided
    let reportData = [...inventoryData];
    
    if (startDate && endDate) {
      reportData = reportData.filter(item => {
        const itemDate = new Date(item.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });
    }
    
    // In a real app, you would generate the report based on the type
    console.log(`Generating ${reportType} report for ${reportData.length} items`);
    alert(`Report generated for ${reportData.length} items (${reportType})`);
  };

  // Download report
  const handleDownloadReport = () => {
    // In a real app, you would download the report
    console.log(`Downloading ${reportType} report`);
    alert(`Downloading ${reportType} report`);
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto'
    }}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Card sx={{ mb: 4, overflow: 'visible', borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <IconButton 
                  sx={{ mr: 1, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" color="primary">
                  Record & Report
                </Typography>
              </Box>
              <Chip 
                icon={<AssessmentIcon />} 
                label="Inventory Reports" 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Search Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Search By Part Name, Number, Car Name or Model
              </Typography>
              <TextField
                fullWidth
                value={search}
                onChange={handleSearch}
                placeholder="Enter search term..."
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Inventory Table */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Inventory Records
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        Part Name
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        Part Number
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        Car Name
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        Model
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        Quantity
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        Price
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                        align="center"
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                          Loading inventory data...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <TableRow 
                          key={item._id}
                          sx={{ 
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(84, 110, 122, 0.05)',
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(84, 110, 122, 0.1)',
                            },
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.15)' 
                                : 'rgba(84, 110, 122, 0.15)',
                            },
                          }}
                        >
                          <TableCell>{item.partName || 'N/A'}</TableCell>
                          <TableCell>{item.partNumber || 'N/A'}</TableCell>
                          <TableCell>{item.carName || 'N/A'}</TableCell>
                          <TableCell>{item.model || 'N/A'}</TableCell>
                          <TableCell>{item.quantity || 0}</TableCell>
                          <TableCell>${item.pricePerUnit?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              startIcon={<VisibilityIcon />}
                              size="small"
                              onClick={() => handleViewClick(item)}
                              sx={{ 
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.dark,
                                },
                                textTransform: 'none',
                                borderRadius: 1,
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                          No inventory records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Generate Reports Section */}
            {/* <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Generate Reports
              </Typography>
              <Paper elevation={0} sx={{ 
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                mb: 3
              }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        Start Date
                      </Typography>
                      <TextField 
                        fullWidth 
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        End Date
                      </Typography>
                      <TextField 
                        fullWidth 
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                      Select Report Type
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={reportType}
                        onChange={handleReportTypeChange}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Select report type' }}
                      >
                        <MenuItem value="financial">Financial Report</MenuItem>
                        <MenuItem value="inventory">Inventory Report</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AssessmentIcon />}
                    onClick={handleGenerateReport}
                    sx={{ 
                      py: 1.5, 
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    Generate Report
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleDownloadReport}
                    sx={{ 
                      py: 1.5, 
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    Download Report
                  </Button>
                </Grid>
              </Grid>
            </Box> */}
          </CardContent>
        </Card>
      </Container>

      {/* Item Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Inventory Item Details</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Part Name:</strong> {selectedItem.partName || 'N/A'}
              </DialogContentText>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Part Number:</strong> {selectedItem.partNumber || 'N/A'}
              </DialogContentText>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Car Name:</strong> {selectedItem.carName || 'N/A'}
              </DialogContentText>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Model:</strong> {selectedItem.model || 'N/A'}
              </DialogContentText>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Quantity:</strong> {selectedItem.quantity || 0}
              </DialogContentText>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Price per Unit:</strong> ${selectedItem.pricePerUnit?.toFixed(2) || '0.00'}
              </DialogContentText>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Added On:</strong> {new Date(selectedItem.createdAt).toLocaleDateString()}
              </DialogContentText>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecordReport;