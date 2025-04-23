import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';

// Sample service history data
const serviceHistoryData = [
  { id: 1, date: '2025-03-15', carNumber: 'ABC-123', owner: 'John Smith', details: 'Engine Repair' },
  { id: 2, date: '2025-03-10', carNumber: 'XYZ-456', owner: 'Sarah Williams', details: 'Brake Replacement' },
  { id: 3, date: '2025-03-05', carNumber: 'DEF-789', owner: 'Michael Brown', details: 'Oil Change' },
  { id: 4, date: '2025-02-28', carNumber: 'GHI-101', owner: 'Jessica Davis', details: 'Tire Rotation' },
  { id: 5, date: '2025-02-22', carNumber: 'JKL-234', owner: 'Robert Taylor', details: 'A/C Repair' },
];

const RecordReport = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('financial');
  const [filteredData, setFilteredData] = useState(serviceHistoryData);

  // Filter service history based on search term
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    
    if (searchTerm.trim() === '') {
      setFilteredData(serviceHistoryData);
    } else {
      const filtered = serviceHistoryData.filter(
        item => 
          item.carNumber.toLowerCase().includes(searchTerm) || 
          item.owner.toLowerCase().includes(searchTerm)
      );
      setFilteredData(filtered);
    }
  };

  // Handle report type change
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle date changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
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
                label="Service Reports" 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Search Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Search By Car Number Or Owner Name
              </Typography>
              <TextField
                fullWidth
                value={search}
                onChange={handleSearch}
                placeholder="Enter Car Number Or Owner Name"
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

            {/* Service History Table */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Service History
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      >
                        Car Number
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      >
                        Owner
                      </TableCell>
                      {/* <TableCell 
                        sx={{ 
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      >
                        Details
                      </TableCell> */}
                      <TableCell 
                        sx={{ 
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
                    {filteredData.length > 0 ? (
                      filteredData.map((row) => (
                        <TableRow 
                          key={row.id}
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
                          <TableCell>{formatDate(row.date)}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{row.carNumber}</TableCell>
                          <TableCell>{row.owner}</TableCell>
                          {/* <TableCell>{row.details}</TableCell> */}
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              startIcon={<VisibilityIcon />}
                              size="small"
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
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                          No records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Generate Reports Section */}
            <Box sx={{ mb: 4 }}>
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
                        {/* <MenuItem value="service">Service Report</MenuItem>
                        <MenuItem value="customer">Customer Report</MenuItem> */}
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
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RecordReport;