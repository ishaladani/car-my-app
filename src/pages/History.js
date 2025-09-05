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
  TablePagination,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Work as WorkIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import { useNavigate } from 'react-router-dom';


import JobDetailsModal from "./jobDetailsModal";

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
  const [billTypeFilter, setBillTypeFilter] = useState('All');
  const [createdByFilter, setCreatedByFilter] = useState('All'); // New filter

  // Data States
  const [jobsData, setJobsData] = useState([]);
  const [allJobsData, setAllJobsData] = useState([]); // Store all data before user filtering
  const [filteredData, setFilteredData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [availableCreators, setAvailableCreators] = useState([]); // For filter dropdown

  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cookie Helper Functions
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const getUserFromCookies = () => {
    const userType = getCookie('userType');
    const name = getCookie('name');
    return { userType, name };
  };

  // Helper function to safely get created by name
  const getCreatedByName = (createdBy) => {
    if (!createdBy) return null;
    if (typeof createdBy === 'string') return createdBy;
    if (typeof createdBy === 'object' && createdBy.name) return createdBy.name;
    return 'Unknown';
  };

  // Helper function to safely get engineer name
  const getEngineerName = (engineerId) => {
    if (!engineerId) return null;
    if (typeof engineerId === 'string') return engineerId;
    if (Array.isArray(engineerId) && engineerId.length > 0) {
      const engineer = engineerId[0];
      if (typeof engineer === 'object' && engineer.name) return engineer.name;
      if (typeof engineer === 'string') return engineer;
    }
    if (typeof engineerId === 'object' && engineerId.name) return engineerId.name;
    return null;
  };

  // Helper function to safely get subaccount name
  const getSubaccountName = (subaccountId) => {
    if (!subaccountId) return null;
    if (typeof subaccountId === 'string') return subaccountId;
    if (typeof subaccountId === 'object' && subaccountId.name) return subaccountId.name;
    return null;
  };

  // ✅ Sort by updatedAt (most recent first)
  const sortJobsByUpdatedAt = (jobs) => {
    return jobs.sort((a, b) => {
      // Use updatedAt if available, otherwise fall back to createdAt
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      
      // Handle invalid dates
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB - dateA; // Descending: latest first
    });
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        
        // Get user data from cookies
        const { userType, name } = getUserFromCookies();
        
        const response = await fetch(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/garage/${garageId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const allJobsArray = Array.isArray(data)
          ? data
          : data.jobCards || data.data || [];

        // Filter only completed jobs first
        const completedJobs = allJobsArray.filter(job => 
          job.status && (job.status.toLowerCase() === "completed" || job.status.toLowerCase() === "complete")
        );

        // Store all completed jobs for reference
        setAllJobsData(completedJobs);

        // Get unique creators for filter dropdown
        const creators = [...new Set(completedJobs
          .map(job => getCreatedByName(job.createdBy))
          .filter(name => name && name !== 'Unknown')
        )];
        setAvailableCreators(creators);

        let filteredJobs = completedJobs;

        // ✅ Enhanced filtering by createdBy if userType is "user"
        if (userType === "user" && name) {
          filteredJobs = completedJobs.filter(job => {
            const createdByName = getCreatedByName(job.createdBy);
            const matches = createdByName === name;
            
            // Debug logging
            console.log(`Job ${job._id}: createdBy = ${createdByName}, user = ${name}, matches = ${matches}`);
            
            return matches;
          });
          
          console.log(`✅ User filtering applied:`);
          console.log(`   - User type: ${userType}`);
          console.log(`   - User name: ${name}`);
          console.log(`   - Total completed jobs: ${completedJobs.length}`);
          console.log(`   - Jobs matching user: ${filteredJobs.length}`);
        } else {
          console.log(`ℹ️ No user filtering applied (userType: ${userType}, name: ${name})`);
        }

        // ✅ Sort by updatedAt (most recent first)
        const sortedJobs = sortJobsByUpdatedAt(filteredJobs);
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
    applyFilters(searchTerm, startDate, endDate, billTypeFilter, createdByFilter);
  };

  // Handle date changes
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    applyFilters(search, newStartDate, endDate, billTypeFilter, createdByFilter);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    applyFilters(search, startDate, newEndDate, billTypeFilter, createdByFilter);
  };

  // Handle Bill Type filter
  const handleBillTypeFilterChange = (e) => {
    const newBillType = e.target.value;
    setBillTypeFilter(newBillType);
    applyFilters(search, startDate, endDate, newBillType, createdByFilter);
  };

  // Handle Created By filter
  const handleCreatedByFilterChange = (e) => {
    const newCreatedBy = e.target.value;
    setCreatedByFilter(newCreatedBy);
    applyFilters(search, startDate, endDate, billTypeFilter, newCreatedBy);
  };

  // Apply all filters and sort
  const applyFilters = (searchTerm, start, end, billType, createdBy) => {
    let filtered = [...jobsData];

    // Search
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        job => 
          (job.carNumber && job.carNumber.toLowerCase().includes(searchTerm)) || 
          (job.registrationNumber && job.registrationNumber.toLowerCase().includes(searchTerm)) || 
          (job.customerName && job.customerName.toLowerCase().includes(searchTerm)) || 
          (job.jobDetails && job.jobDetails.toLowerCase().includes(searchTerm)) ||
          (job.type && job.type.toLowerCase().includes(searchTerm)) ||
          (getCreatedByName(job.createdBy) && getCreatedByName(job.createdBy).toLowerCase().includes(searchTerm))
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

    // Created By filter (only for non-user types)
    const { userType } = getUserFromCookies();
    if (userType !== 'user' && createdBy && createdBy !== 'All') {
      filtered = filtered.filter(job => getCreatedByName(job.createdBy) === createdBy);
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
  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setJobDetailsModalOpen(true);
  };

  // Clear all filters and re-sort
  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setBillTypeFilter('All');
    setCreatedByFilter('All');
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

  // Get current user info for display
  const { userType, name } = getUserFromCookies();
  const isUserTypeUser = userType === "user";

  return (
    <Box sx={{ 
      flexGrow: 1, 
      mb: 4, 
      ml: { xs: 0, sm: 35 }, 
      overflow: 'auto',
      px: { xs: 1, sm: 0 } // Add horizontal padding for mobile
    }}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 3 } }}>
        <Card sx={{ mb: 4, overflow: 'visible', borderRadius: 2 }}>
          <CardContent>
            {/* Header */}
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              mb={2}
              gap={{ xs: 2, sm: 0 }}
            >
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <IconButton 
                  sx={{ mr: 1, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
                  onClick={() => navigate(-1)}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box>
                  <Typography variant="h5" color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Completed Job Records & Reports
                  </Typography>
                  {isUserTypeUser && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Showing records created by: {name || 'Unknown User'}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Chip 
                icon={<WorkIcon />} 
                label={`${filteredData.length} Completed Jobs${isUserTypeUser ? ' (Your Records)' : ''}`}
                color="success" 
                variant="outlined"
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  height: { xs: '28px', sm: '32px' }
                }}
              />
            </Box>
            <Divider sx={{ my: 3 }} />

            {/* User Type Alert */}
            {isUserTypeUser && (
              <Alert severity="info" sx={{ mb: 3 }} icon={<FilterListIcon />}>
                <Typography variant="body2">
                  <strong>Filtered View:</strong> You are viewing only the job records that you created ({filteredData.length} records). 
                  {allJobsData.length > filteredData.length && (
                    <span> There are {allJobsData.length - filteredData.length} additional records created by other users.</span>
                  )}
                  Contact your administrator to view all records.
                </Typography>
              </Alert>
            )}

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={6} sm={3} md={2}>
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
              <Grid item xs={6} sm={3} md={2}>
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
              <Grid item xs={6} sm={6} md={2}>
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
              {/* Show Created By filter only for non-user types */}
              {!isUserTypeUser && (
                <Grid item xs={6} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Created By</InputLabel>
                    <Select
                      value={createdByFilter}
                      onChange={handleCreatedByFilterChange}
                      label="Created By"
                    >
                      <MenuItem value="All">All Creators</MenuItem>
                      {availableCreators.map((creator) => (
                        <MenuItem key={creator} value={creator}>
                          {creator}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={12} md={isUserTypeUser ? 3 : 1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
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
                {isUserTypeUser && ` - Created by ${name}`}
              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading job records...</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 2,
                      overflowX: 'auto', // Enable horizontal scroll
                      '&::-webkit-scrollbar': {
                        height: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: '4px',
                      },
                    }}
                  >
                    <Table sx={{ minWidth: 800 }}> {/* Set minimum width for table */}
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            minWidth: { xs: '80px', sm: '100px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Job ID
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            minWidth: { xs: '100px', sm: '120px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Car Number
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            minWidth: { xs: '120px', sm: '150px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Customer Name
                          </TableCell>
                          {/* <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            minWidth: { xs: '100px', sm: '120px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Subaccount
                          </TableCell> */}
                          {/* <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            minWidth: { xs: '200px', sm: '300px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Job Details
                          </TableCell> */}
                          <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            minWidth: { xs: '100px', sm: '120px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Created By
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            minWidth: { xs: '80px', sm: '100px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            minWidth: { xs: '120px', sm: '150px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            Last Updated ⬇
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: 'primary.main', 
                            color: '#fff', 
                            fontWeight: 'bold', 
                            minWidth: { xs: '150px', sm: '200px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }} align="center">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getCurrentPageData().length > 0 ? (
                          getCurrentPageData().map((job, index) => (
                            <TableRow key={job._id || index}>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Chip 
                                  label={job._id?.slice(-6) || 'N/A'} 
                                  size="small" 
                                  variant="outlined" 
                                  color="primary"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {job.carNumber || job.registrationNumber || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {job.customerName || 'N/A'}
                                </Typography>
                              </TableCell>
                              {/* <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {getSubaccountName(job.subaccountId) ? (
                                  <Chip 
                                    label={getSubaccountName(job.subaccountId)} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                  />
                                ) : (
                                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    N/A
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ 
                                maxWidth: { xs: '200px', sm: '300px' }, 
                                whiteSpace: 'pre-line',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}>
                                <JobDetailsComponent jobDetails={job.jobDetails} compact={true} />
                              </TableCell> */}
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Chip 
                                  label={getCreatedByName(job.createdBy) || 'Unknown'} 
                                  size="small" 
                                  variant="outlined"
                                  color={getCreatedByName(job.createdBy) === name ? 'primary' : 'default'}
                                  sx={{ 
                                    fontWeight: getCreatedByName(job.createdBy) === name ? 600 : 400,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Chip 
                                  label={job.status || 'Unknown'} 
                                  color={job.status?.toLowerCase() === 'completed' ? 'success' : job.status?.toLowerCase() === 'in progress' ? 'warning' : 'info'} 
                                  size="small"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {formatDate(job.updatedAt || job.createdAt)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Stack 
                                  direction={{ xs: 'column', sm: 'row' }} 
                                  spacing={{ xs: 0.5, sm: 1 }} 
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ReceiptIcon />}
                                    onClick={() => handleViewBill(job._id)}
                                    sx={{ 
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      minWidth: { xs: '60px', sm: 'auto' },
                                      px: { xs: 1, sm: 2 }
                                    }}
                                  >
                                    Bill
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleViewDetails(job)}
                                    sx={{ 
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      minWidth: { xs: '60px', sm: 'auto' },
                                      px: { xs: 1, sm: 2 }
                                    }}
                                  >
                                    Details
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                              {filteredData.length === 0 && jobsData.length > 0 
                                ? "No jobs match your search criteria" 
                                : isUserTypeUser 
                                  ? `No completed job records found created by ${name}`
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
                    sx={{ 
                      mt: 2,
                      '& .MuiTablePagination-toolbar': {
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                        alignItems: { xs: 'flex-start', sm: 'center' }
                      },
                      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      },
                      '& .MuiTablePagination-actions': {
                        marginLeft: { xs: 0, sm: 'auto' }
                      }
                    }}
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>

             {/* Job Details Modal */}
       <JobDetailsModal
         open={jobDetailsModalOpen}
         onClose={() => setJobDetailsModalOpen(false)}
         jobData={selectedJob}
       />

      
    </Box>
  );
};

export default RecordReport;