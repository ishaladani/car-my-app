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
  FileDownload as FileDownloadIcon,
  Work as WorkIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('All'); // GST/Non-GST filter

  // Data States
  const [jobsData, setJobsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Sort by updatedAt (most recent first)
  const sortJobsByUpdatedAt = (jobs) => {
    return jobs.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA; // Descending: latest first
    });
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate PDF Function
  const generatePDFWithJsPDF = (jobData) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text("Job Card Details", 14, 20);

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
        ['Excess Amount', jobData.excessAmount ? `₹${jobData.excessAmount}` : 'N/A'],
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

  // Format job details for display
  const formatJobDetails = (jobDetailsString) => {
    if (!jobDetailsString) return 'No details available';
    if (typeof jobDetailsString === 'string' && 
        !jobDetailsString.trim().startsWith('[') && 
        !jobDetailsString.trim().startsWith('{')) {
      return jobDetailsString;
    }
    try {
      const details = JSON.parse(jobDetailsString);
      if (Array.isArray(details) && details.length > 0) {
        const displayItems = details.slice(0, 2).map(item => {
          const description = item.description || item.name || 'Service';
          const price = item.price ? ` (₹${item.price})` : '';
          return `• ${description}${price}`;
        }).join('\n');
        const moreCount = details.length - 2;
        const moreText = moreCount > 0 ? `\n+${moreCount} more service${moreCount > 1 ? 's' : ''}` : '';
        return displayItems + moreText;
      } else if (typeof details === 'object' && details !== null) {
        const description = details.description || 'Service';
        const price = details.price ? ` (₹${details.price})` : '';
        return `• ${description}${price}`;
      } else {
        return String(details);
      }
    } catch (error) {
      console.warn('Failed to parse job details:', error);
      return jobDetailsString;
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
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const jobsData = Array.isArray(data)
          ? data
          : data.jobCards || data.data || [];

        const completedJobs = jobsData.filter(job => job.status === "Completed");

        // ✅ Sort by updatedAt (most recent first)
        const sortedJobs = sortJobsByUpdatedAt(completedJobs);
        setJobsData(sortedJobs);
        setFilteredData(sortedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError(`Failed to load jobs: ${error.message}`);
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
    applyFilters(searchTerm, startDate, endDate, billTypeFilter);
  };

  // Handle date changes
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    applyFilters(search, newStartDate, endDate, billTypeFilter);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    applyFilters(search, startDate, newEndDate, billTypeFilter);
  };

  // Handle Bill Type filter
  const handleBillTypeFilterChange = (e) => {
    const newBillType = e.target.value;
    setBillTypeFilter(newBillType);
    applyFilters(search, startDate, endDate, newBillType);
  };

  // Apply all filters and sort
  const applyFilters = (searchTerm, start, end, billType) => {
    let filtered = [...jobsData];

    // Search
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

    // Date range
    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= startDateObj && jobDate <= endDateObj;
      });
    }

    // Bill Type filter
    if (billType && billType !== 'All') {
      if (billType === 'GST') {
        filtered = filtered.filter(job => job.gstApplicable === true);
      } else if (billType === 'Non-GST') {
        filtered = filtered.filter(job => job.gstApplicable === false);
      }
    }

    // ✅ Re-sort filtered results by updatedAt
    const sortedFiltered = sortJobsByUpdatedAt(filtered);
    setFilteredData(sortedFiltered);
    setPage(0);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Job Details Component (compact view in table)
  const JobDetailsComponent = ({ jobDetails, maxItems = 2, showPrices = true, compact = false }) => {
    const parseAndDisplayJobDetails = (jobDetailsString) => {
      if (!jobDetailsString) {
        return (
          <Typography variant="body2" color="text.secondary">
            No details available
          </Typography>
        );
      }

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
                      label={`₹${item.price}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.75rem',
                        height: compact ? '18px' : '20px',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: compact ? 0.5 : 1 }
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
                  label={`₹${details.price}`} 
                  size="small" 
                  variant="outlined"
                  sx={{ mt: 0.5, fontWeight: 600, height: compact ? '18px' : '20px' }}
                />
              )}
            </Box>
          );
        }
        return <Typography variant="body2">{String(details)}</Typography>;
      } catch (error) {
        return (
          <Typography variant="body2" sx={{ fontSize: compact ? '0.8rem' : '0.875rem' }}>
            {jobDetailsString}
          </Typography>
        );
      }
    };

    return parseAndDisplayJobDetails(jobDetails);
  };

  // View job details
  const handleViewClick = (job) => {
    setSelectedJob(job);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedJob(null);
  };

  // Clear all filters and re-sort
  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setBillTypeFilter('All');
    const sortedJobs = sortJobsByUpdatedAt([...jobsData]);
    setFilteredData(sortedJobs);
    setPage(0);
  };

  // Navigate to billing
  const handleViewBill = (jobId) => {
    navigate(`/billing/${jobId}`);
  };

  // Get paginated data
  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 4, ml: { xs: 0, sm: 35 }, overflow: 'auto' }}>
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

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by car number, customer name..."
                  variant="outlined"
                  size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
              </Grid>
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
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Bill Type</InputLabel>
                  <Select
                    value={billTypeFilter}
                    onChange={handleBillTypeFilterChange}
                    label="Bill Type"
                  >
                    <MenuItem value="All">All Bills</MenuItem>
                    <MenuItem value="GST">GST</MenuItem>
                    <MenuItem value="Non-GST">Non-GST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
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

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Job Table */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Completed Job Cards (Last Updated First)
              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading job records...</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Job ID</TableCell>
                          <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Car Number</TableCell>
                          <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Customer Name</TableCell>
                          <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Subaccount</TableCell>
                          <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Job Details</TableCell>
                          <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }}>Last Updated</TableCell>
                          <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getCurrentPageData().length > 0 ? (
                          getCurrentPageData().map((job, index) => (
                            <TableRow key={job._id || index}>
                              <TableCell>{job._id?.slice(-6) || 'N/A'}</TableCell>
                              <TableCell>{job.carNumber || job.registrationNumber || 'N/A'}</TableCell>
                              <TableCell>{job.customerName || 'N/A'}</TableCell>
                              <TableCell>
                                {job.subaccountId && job.subaccountId.name ? (
                                  <Chip label={job.subaccountId.name} size="small" variant="outlined" />
                                ) : 'N/A'}
                              </TableCell>
                              <TableCell sx={{ maxWidth: '300px', whiteSpace: 'pre-line' }}>
                                <JobDetailsComponent jobDetails={job.jobDetails} />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={job.status || 'Unknown'} 
                                  color={job.status === 'Completed' ? 'success' : job.status === 'In Progress' ? 'warning' : 'info'} 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>{formatDate(job.updatedAt || job.createdAt)}</TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ReceiptIcon />}
                                    onClick={() => handleViewBill(job._id)}
                                  >
                                    Bill
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
                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                              {filteredData.length === 0 && jobsData.length > 0 
                                ? "No jobs match your search criteria" 
                                : "No completed job records found"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

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

      {/* Job Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Job Card Details</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedJob?.carNumber || selectedJob?.registrationNumber}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedJob && (
            <Box>
              <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="overline" color="text.secondary">Job ID</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedJob._id?.slice(-8) || 'N/A'}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="overline" color="text.secondary">Status</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={selectedJob.status || 'Unknown'} 
                          color={selectedJob.status === 'Completed' ? 'success' : selectedJob.status === 'In Progress' ? 'warning' : 'info'} 
                          sx={{ fontWeight: 600 }} 
                        />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="overline" color="text.secondary">Bill Type</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={selectedJob.gstApplicable ? 'GST' : 'Non-GST'} 
                          color={selectedJob.gstApplicable ? 'primary' : 'secondary'} 
                          variant="outlined" 
                          sx={{ fontWeight: 600 }} 
                        />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              <Divider />
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Detailed Information</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Vehicle Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.carNumber || selectedJob.registrationNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Customer Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.customerName || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Subaccount</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.subaccountId?.name || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Contact Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.contactNumber || selectedJob.phone || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Job Details</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: 'pre-line' }}>
                        {formatJobDetails(selectedJob.jobDetails)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Created Date</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedJob.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Last Updated</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedJob.updatedAt || selectedJob.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Labor Hours</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.laborHours || 'N/A'} hours
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Engineer</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.engineerId?.[0]?.name || 'Not Assigned'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: theme.palette.background.default }}>
          <Button onClick={() => handleDownloadPDF(selectedJob)} variant="contained" startIcon={<FileDownloadIcon />}>
            Download PDF
          </Button>
          <Button onClick={() => handleViewBill(selectedJob?._id)} variant="outlined" startIcon={<ReceiptIcon />}>
            View Bill
          </Button>
          <Button onClick={handleCloseDialog} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecordReport;