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
  DialogActions,
  TablePagination,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Work as WorkIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';



const RecordReport = () => {
  const navigate = useNavigate();
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { darkMode } = useThemeContext();

  // Search and Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Completed');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data States
  const [jobsData, setJobsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate PDF Function - Directly in the component
  const generatePDFWithJsPDF = (jobData) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text(" Job Card Details", 14, 20);

      const tableData = [
        ['Customer Name', jobData.customerName || 'N/A'],
        ['Contact Number', jobData.contactNumber || 'N/A'],
        ['Email', jobData.email || 'N/A'],
        ['Company', jobData.company || 'N/A'],
        ['Car Number', jobData.carNumber || jobData.registrationNumber || 'N/A'],
        ['Model', jobData.model || 'N/A'],
        ['Kilometer', jobData.kilometer ? `${jobData.kilometer} km` : 'N/A'],
        ['Fuel Type', jobData.fuelType || 'N/A'],
        ['Insurance Provider', jobData.insuranceProvider || 'N/A'],
        ['Policy Number', jobData.policyNumber || 'N/A'],
        ['Expiry Date', formatDate(jobData.expiryDate)],
        ['Excess Amount', jobData.excessAmount ? `RS.${jobData.excessAmount}` : 'N/A'],
        ['Job Type', jobData.type || 'N/A'],
        ['Engineer', jobData.engineerId?.[0]?.name || 'Not Assigned'],
        ['Engineer Remarks', jobData.engineerRemarks || 'N/A'],
        ['Status', jobData.status || 'N/A'],
        ['Created Date', formatDate(jobData.createdAt)],
      ];

      autoTable(doc, {
        startY: 30,
        head: [['Field', 'Value']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 10, right: 10 },
      });

      doc.save(`JobCard_${jobData.carNumber || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("PDF generation failed. Please try again.");
    }
  };

  // Handle Download PDF
  const handleDownloadPDF = (job) => {
    if (!job) return;
    generatePDFWithJsPDF(job);
  };

  // Fetch job data from API
  useEffect(() => {
    if (!garageId) {
      navigate("/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/garage/${garageId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const jobsData = Array.isArray(data)
          ? data
          : data.jobCards
          ? data.jobCards
          : data.data
          ? data.data
          : [];

        const completedJobs = jobsData.filter(job => job.status === "Completed");
        setJobsData(completedJobs);
        setFilteredData(completedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError(`Failed to load jobs  ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [garageId, navigate]);

  // Handle search
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    applyFilters(searchTerm, statusFilter, startDate, endDate);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    applyFilters(search, newStatus, startDate, endDate);
  };

  // Handle date changes
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    applyFilters(search, statusFilter, newStartDate, endDate);
  };
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    applyFilters(search, statusFilter, startDate, newEndDate);
  };

  // Apply all filters
  const applyFilters = (searchTerm, status, start, end) => {
    let filtered = [...jobsData];
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        job => 
          (job.carNumber && job.carNumber.toLowerCase().includes(searchTerm)) || 
          (job.registrationNumber && job.registrationNumber.toLowerCase().includes(searchTerm)) || 
          (job.customerName && job.customerName.toLowerCase().includes(searchTerm)) || 
          (job.jobDetails && job.jobDetails.toLowerCase().includes(searchTerm)) ||
          (job.type && job.type.toLowerCase().includes(searchTerm))
      );
    }
    if (status && status !== 'All') {
      filtered = filtered.filter(job => job.status === status);
    }
    if (start && end) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.createdAt);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return jobDate >= startDate && jobDate <= endDate;
      });
    }
    setFilteredData(filtered);
    setPage(0);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const JobDetailsComponent = ({ 
    jobDetails, 
    maxItems = 2, 
    showPrices = true,
    compact = false 
  }) => {
    const parseAndDisplayJobDetails = (jobDetailsString) => {
      if (!jobDetailsString) {
        return (
          <Typography variant="body2" color="text.secondary">
            No details available
          </Typography>
        );
      }
  
      // If it's already a plain string (not JSON), display it directly
      if (typeof jobDetailsString === 'string' && 
          !jobDetailsString.trim().startsWith('[') && 
          !jobDetailsString.trim().startsWith('{')) {
        return (
          <Typography variant="body2" sx={{ fontSize: compact ? '0.8rem' : '0.875rem' }}>
            {jobDetailsString}
          </Typography>
        );
      }
  
      try {
        const details = JSON.parse(jobDetailsString);
        
        if (Array.isArray(details) && details.length > 0) {
          return (
            <Box>
              {details.slice(0, maxItems).map((item, index) => (
                <Box key={index} sx={{ 
                  mb: compact ? 0.3 : 0.5, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      flex: 1, 
                      fontSize: compact ? '0.8rem' : '0.875rem',
                      lineHeight: 1.2
                    }}
                  >
                    • {item.description || item.name || `Service ${index + 1}`}
                  </Typography>
                  {showPrices && item.price && (
                    <Chip 
                      label={`${item.price}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.75rem',
                        height: compact ? '18px' : '20px',
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          px: compact ? 0.5 : 1
                        }
                      }}
                    />
                  )}
                </Box>
              ))}
              {details.length > maxItems && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    fontStyle: 'italic',
                    fontSize: compact ? '0.7rem' : '0.75rem'
                  }}
                >
                  +{details.length - maxItems} more service{details.length - maxItems > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          );
        } else if (typeof details === 'object' && details !== null) {
          // Handle single object case
          return (
            <Box>
              {details.description && (
                <Typography 
                  variant="body2" 
                  sx={{ fontSize: compact ? '0.8rem' : '0.875rem' }}
                >
                  • {details.description}
                </Typography>
              )}
              {showPrices && details.price && (
                <Chip 
                  label={`${details.price}`} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    mt: 0.5, 
                    fontWeight: 600,
                    height: compact ? '18px' : '20px'
                  }}
                />
              )}
            </Box>
          );
        } else {
          return (
            <Typography 
              variant="body2" 
              sx={{ fontSize: compact ? '0.8rem' : '0.875rem' }}
            >
              {String(details)}
            </Typography>
          );
        }
      } catch (error) {
        console.warn('Failed to parse job details:', error);
        // If JSON parsing fails, display the original string
        return (
          <Typography 
            variant="body2" 
            sx={{ fontSize: compact ? '0.8rem' : '0.875rem' }}
          >
            {jobDetailsString}
          </Typography>
        );
      }
    };
  
    return parseAndDisplayJobDetails(jobDetails);
  };

  // Handle view button click
  const handleViewClick = (job) => {
    setSelectedJob(job);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedJob(null);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('Completed');
    setStartDate('');
    setEndDate('');
    setFilteredData(jobsData);
    setPage(0);
  };

  // Handle update button click
  const handleUpdate = async (id) => {
    try {
      const response = await axios.get(`https://garage-management-zi5z.onrender.com/api/garage/jobCards/ ${id}`); 
      const jobCard = response.data;
      const { engineerId, laborHours, qualityCheck } = jobCard;
      if (!engineerId || engineerId.length === 0 || !engineerId[0]?._id) {
        navigate(`/assign-engineer/${id}`);
      } else if (laborHours === null || laborHours === undefined) {
        navigate(`/work-in-progress/${id}`);
      } else if (!qualityCheck || !qualityCheck.billApproved) {
        navigate(`/quality-check/${id}`);
      } else {
        navigate(`/billing/${id}`);
      }
    } catch (error) {
      console.error("Error fetching job card:", error);
      alert("Failed to load job card details.");
    }
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 4, ml: {xs: 0, sm: 35}, overflow: 'auto' }}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Card sx={{ mb: 4, overflow: 'visible', borderRadius: 2 }}>
          <CardContent>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <IconButton 
                  sx={{ mr: 1, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
                  onClick={() => navigate(-1)}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" color="primary">
                  Completed Job Records & Reports
                </Typography>
              </Box>
              <Chip 
                icon={<WorkIcon />} 
                label={`${filteredData.length} Completed Jobs`}
                color="success" 
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>
            <Divider sx={{ my: 3 }} />

            {/* Search and Filter Section */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {/* Search Bar */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by car number, customer name, job details..."
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Status Filter */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* Start Date */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              {/* End Date */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              {/* Clear Filters Button */}
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<FileDownloadIcon />}
                  size="small"
                  sx={{ height: '40px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Job Cards Table */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Completed Job Cards
                </Typography>
              </Box>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading job records...</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} elevation={0} sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    overflowX: 'auto',
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            backgroundColor: theme.palette.primary.main,
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            Job ID
                          </TableCell>
                          <TableCell sx={{ 
                            backgroundColor: theme.palette.primary.main,
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            Car Number
                          </TableCell>
                          <TableCell sx={{ 
                            backgroundColor: theme.palette.primary.main,
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            Customer Name
                          </TableCell>
                          <TableCell sx={{ 
                            backgroundColor: theme.palette.primary.main,
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            Job Details
                          </TableCell>
                          <TableCell sx={{ 
                            backgroundColor: theme.palette.primary.main,
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ 
                            backgroundColor: theme.palette.primary.main,
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            Completed Date
                          </TableCell>
                          <TableCell sx={{ 
                            backgroundColor: theme.palette.primary.main,
                            color: '#fff',
                            fontWeight: 'bold'
                          }}
                            align="center"
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getCurrentPageData().length > 0 ? (
                          getCurrentPageData().map((job, index) => (
                            <TableRow key={job._id || index}>
                              <TableCell>{job._id?.slice(-6) || 'N/A'}</TableCell>
                              <TableCell>{job.carNumber || job.registrationNumber || 'N/A'}</TableCell>
                              <TableCell>{job.customerName || 'N/A'}</TableCell>
                              <JobDetailsComponent 
                                    jobDetails={job.jobDetails} 
                                    maxItems={2}
                                    showPrices={true}
                                    compact={true}
                                  />
                              <TableCell>
                                <Chip 
                                  label={job.status || 'Unknown'} 
                                  color={
                                    job.status === 'Completed' ? 'success' :
                                    job.status === 'In Progress' ? 'warning' :
                                    job.status === 'Pending' ? 'info' : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{formatDate(job.completedAt || job.updatedAt)}</TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate(`/jobs/${job._id}`)}
                                  >
                                    Job Card
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleUpdate(job._id)}
                                  >
                                    Update
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleViewClick(job)}
                                  >
                                    Details
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                              {filteredData.length === 0 && jobsData.length > 0 
                                ? "No jobs match your search criteria" 
                                : "No completed job records found"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Pagination */}
                  <TablePagination
                    component="div"
                    count={filteredData.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{ mt: 2 }}
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Enhanced Job Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white', p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Job Card Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedJob?.carNumber || selectedJob?.registrationNumber || 'Vehicle Information'}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedJob && (
            <Box>
              {/* Main Info Section */}
              <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="overline" color="text.secondary">
                        Job ID
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedJob._id?.slice(-8) || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="overline" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={selectedJob.status || 'Unknown'} 
                          color={
                            selectedJob.status === 'Completed' ? 'success' :
                            selectedJob.status === 'In Progress' ? 'warning' :
                            selectedJob.status === 'Pending' ? 'info' : 'default'
                          }
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="overline" color="text.secondary">
                        Total Cost
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        ₹{selectedJob.totalCost?.toLocaleString() || '0'}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              <Divider />
              {/* Detailed Information */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Detailed Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Vehicle Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.carNumber || selectedJob.registrationNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Customer Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.customerName || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Contact Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.contactNumber || selectedJob.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Created Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedJob.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Completed Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedJob.completedAt || selectedJob.updatedAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Labor Hours
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.laborHours || 'N/A'} hours
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: theme.palette.background.default }}>
          <Button 
            onClick={() => handleDownloadPDF(selectedJob)} 
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{ mr: 2 }}
          >
            Download PDF
          </Button>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecordReport;