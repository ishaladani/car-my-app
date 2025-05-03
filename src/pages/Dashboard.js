import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  LinearProgress,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Container,
  CssBaseline,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Dashboard as DashboardIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
// import TopNavbarManager from '../layouts/NavBarManager';

// Stats cards data (to be computed from API data)
const statsCards = [
  {
    title: 'Active Jobs',
    value: 0, // Will be updated from API
    change: 12,
    isIncrease: true,
    icon: <BuildIcon sx={{ fontSize: 40 }} />,
    color: '#2563eb',
    lightColor: 'rgba(37, 99, 235, 0.1)',
  },
  {
    title: 'Parts Available',
    value: 0, // Will be updated from API 
    change: 3,
    isIncrease: false,
    icon: <InventoryIcon sx={{ fontSize: 40 }} />,
    color: '#ea580c',
    lightColor: 'rgba(234, 88, 12, 0.1)',
  },
  {
    title: 'Pending Reminders',
    value: 0, // Will be updated from API
    change: 2,
    isIncrease: true,
    icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
    color: '#dc2626',
    lightColor: 'rgba(220, 38, 38, 0.1)',
  },
];


const Dashboard = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  
  // State for job data from API
  const [currentJobs, setCurrentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Updated stats cards state
  const [dashboardStats, setDashboardStats] = useState([...statsCards]);
  
  // Inventory data will be fetched from API and separated into low/high stock
  const [lowStockItems, setLowStockItems] = useState([]);
  const [highStockItems, setHighStockItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  
  // Menu handling
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  // Fetch job data from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          'https://garage-management-system-cr4w.onrender.com/api/jobCards/garage/67f3a7f8ccb6f320da3a5117',
          {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTgzNjExMiwiZXhwIjoxNzQ2NDQwOTEyfQ.mbslJPECjgTs4UCT4wDitdJazrCBlWc8SagHAKgvyeo'
            }
          }
        );
        
        // Process the response
        const jobsData = Array.isArray(response.data) ? response.data : 
                        response.data.jobCards ? response.data.jobCards : 
                        response.data.data ? response.data.data : [];
        
        // Map API data to our expected format
        const formattedJobs = jobsData.map(job => {
          // Extract job data safely with fallbacks
          let progress = 0;
          switch (job.status) {
            case 'completed':
              progress = 100;
              break;
            case 'inProgress':
              progress = 60;
              break;
            case 'pending':
              progress = 0;
              break;
            default:
              progress = job.progress || 0;
          }
          
          return {
            id: job._id || job.id,
            vehicleNo: job.vehicleDetails?.registrationNumber || 'N/A',
            customer: job.customerDetails?.name || 'Unknown',
            service: job.serviceType || 'General Service',
            date: new Date(job.date || job.createdAt).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            status: job.status ? capitalizeFirstLetter(job.status === 'inProgress' ? 'In Progress' : job.status) : 'Pending',
            progress: progress,
            priority: job.priority || 'Medium',
            technician: job.assignedEngineer?.name || 'Unassigned'
          };
        });
        
        setCurrentJobs(formattedJobs);
        
        // Update dashboard stats
        updateDashboardStats(formattedJobs);
        
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  // Fetch inventory data from API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setInventoryLoading(true);
        setInventoryError(null);
        
        const response = await axios.get(
          'https://garage-management-system-cr4w.onrender.com/api/inventory/67f3a7f8ccb6f320da3a5117',
          {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY3ZjNhN2Y4Y2NiNmYzMjBkYTNhNTExNyIsImlhdCI6MTc0NTgzNjExMiwiZXhwIjoxNzQ2NDQwOTEyfQ.mbslJPECjgTs4UCT4wDitdJazrCBlWc8SagHAKgvyeo'
            }
          }
        );
        
        // Process the response
        const inventoryData = Array.isArray(response.data) ? response.data : 
                           response.data.inventory ? response.data.inventory : 
                           response.data.data ? response.data.data : [];
        
        // Sort inventory items into high and low stock based on quantity threshold (50)
        const highStock = [];
        const lowStock = [];
        
        inventoryData.forEach(item => {
          const inventoryItem = {
            id: item._id || item.id,
            name: item.partName || 'Unknown Part',
            quantity: item.quantity || 0,
            price: item.pricePerUnit || 0,
            carName: item.carName || '',
            model: item.model || '',
            reorderPoint: Math.floor(item.quantity * 0.2) || 5 // Set reorder point at 20% of quantity or default 5
          };
          
          // Items with quantity >= 50 go to high stock, others to low stock
          if (item.quantity >= 50) {
            highStock.push(inventoryItem);
          } else {
            lowStock.push(inventoryItem);
          }
        });
        
        // Update the dashboard stats with inventory count
        const updatedStats = [...dashboardStats];
        updatedStats[1].value = inventoryData.reduce((total, item) => total + (item.quantity || 0), 0);
        setDashboardStats(updatedStats);
        
        // Update state with sorted inventory items
        setHighStockItems(highStock);
        setLowStockItems(lowStock);
        
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setInventoryError('Failed to load inventory data. Please try again later.');
        
        // Set fallback empty arrays if API fails
        setHighStockItems([]);
        setLowStockItems([]);
      } finally {
        setInventoryLoading(false);
      }
    };
    
    fetchInventory();
  }, []);
  
  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Update dashboard stats based on jobs data
  const updateDashboardStats = (jobs) => {
    if (!jobs || !jobs.length) return;
    
    // Count active jobs
    const activeJobsCount = jobs.filter(job => 
      job.status === 'In Progress' || job.status === 'Pending'
    ).length;
    
    // Update stats card
    const updatedStats = [...dashboardStats];
    // updatedStats[0].value = activeJobsCount;
    
    // For demo purposes, we'll keep the parts count and reminders as they are
    // updatedStats[1].value = 143; // Parts available
    // updatedStats[2].value = 8;   // Pending reminders
    
    setDashboardStats(updatedStats);
  };
  
  // Menu handlers
  const handleActionMenuOpen = (event, jobId) => {
    setActionMenu(event.currentTarget);
    setSelectedJobId(jobId);
  };
  
  const handleActionMenuClose = () => {
    setActionMenu(null);
    setSelectedJobId(null);
  };
  
  // Status chip renderer
  const getStatusChip = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label={status}
            size="small"
            sx={{
              backgroundColor: darkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)',
              color: theme.palette.success.main,
              fontWeight: 600,
              '& .MuiChip-icon': { color: theme.palette.success.main },
            }}
          />
        );
      case 'In Progress':
        return (
          <Chip
            icon={<WarningIcon fontSize="small" />}
            label={status}
            size="small"
            sx={{
              backgroundColor: darkMode ? 'rgba(234, 88, 12, 0.2)' : 'rgba(234, 88, 12, 0.1)',
              color: theme.palette.warning.main,
              fontWeight: 600,
              '& .MuiChip-icon': { color: theme.palette.warning.main },
            }}
          />
        );
      case 'Pending':
        return (
          <Chip
            icon={<CalendarIcon fontSize="small" />}
            label={status}
            size="small"
            sx={{
              backgroundColor: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
              color: theme.palette.info.main,
              fontWeight: 600,
              '& .MuiChip-icon': { color: theme.palette.info.main },
            }}
          />
        );
      default:
        return (
          <Chip
            label={status}
            size="small"
            sx={{ 
              backgroundColor: darkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(100, 116, 139, 0.1)',
              color: theme.palette.text.secondary,
              fontWeight: 600 
            }}
          />
        );
    }
  };
  
  // Priority chip renderer
  const getPriorityChip = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <Chip
            label={priority}
            size="small"
            sx={{
              backgroundColor: darkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)',
              color: theme.palette.error.main,
              fontWeight: 600,
            }}
          />
        );
      case 'Medium':
        return (
          <Chip
            label={priority}
            size="small"
            sx={{
              backgroundColor: darkMode ? 'rgba(234, 88, 12, 0.2)' : 'rgba(234, 88, 12, 0.1)',
              color: theme.palette.warning.main,
              fontWeight: 600,
            }}
          />
        );
      case 'Low':
        return (
          <Chip
            label={priority}
            size="small"
            sx={{
              backgroundColor: darkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)',
              color: theme.palette.success.main,
              fontWeight: 600,
            }}
          />
        );
      default:
        return (
          <Chip
            label={priority}
            size="small"
            sx={{ 
              backgroundColor: darkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(100, 116, 139, 0.1)',
              color: theme.palette.text.secondary,
              fontWeight: 600 
            }}
          />
        );
    }
  };

  return (
    <>
      {/* <TopNavbarManager /> */}
      <CssBaseline />
      <Box sx={{ 
          flexGrow: 1,
          mb: 4,
          ml: {xs: 0, sm: 35},
          overflow: 'auto'
        }}>
        <Container maxWidth="xl">
          <Card sx={{ mb: 4, overflow: 'visible', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <DashboardIcon fontSize="large" sx={{ color: '#3f51b5', mr: 2 }} />
                  <Typography variant="h5" color="primary">
                    Dashboard Overview
                  </Typography>
                </Box>
                <Button 
                  variant="text" 
                  startIcon={<RefreshIcon />} 
                  onClick={() => window.location.reload()} 
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }} />

              {/* Stats Cards - exactly 3 cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {dashboardStats.map((card, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card elevation={0} sx={{ 
                      height: '100%', 
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: '16px',
                      borderTop: `4px solid ${card.color}`,
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box>
                            {loading ? (
                              <CircularProgress size={28} />
                            ) : (
                              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {card.value}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {card.title}
                            </Typography>
                          </Box>
                          <Avatar
                            sx={{
                              bgcolor: darkMode ? card.color : card.lightColor,
                              color: darkMode ? 'white' : card.color,
                              width: 56,
                              height: 56,
                            }}
                          >
                            {card.icon}
                          </Avatar>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            icon={card.isIncrease ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                            label={`${card.change}%`}
                            size="small"
                            sx={{
                              backgroundColor: darkMode 
                                ? (card.isIncrease ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)')
                                : (card.isIncrease ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)'),
                              color: card.isIncrease ? theme.palette.success.main : theme.palette.error.main,
                              fontWeight: 600,
                              '.MuiChip-icon': { color: 'inherit' },
                              mr: 1,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            vs. last week
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Current Jobs Table */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Current Jobs
                  </Typography>
                  <Box>
                    {loading && <CircularProgress size={24} sx={{ mr: 2 }} />}
                  </Box>
                </Box>
                <Paper elevation={0} sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  {error ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Alert 
                        severity="error" 
                        icon={<ErrorIcon />}
                        sx={{ mb: 2 }}
                      >
                        {error}
                      </Alert>
                      <Button 
                        variant="contained" 
                        startIcon={<RefreshIcon />} 
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </Box>
                  ) : loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Vehicle No.</TableCell>
                              <TableCell>Customer</TableCell>
                              <TableCell>Service</TableCell>
                              <TableCell>Progress</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {currentJobs.length > 0 ? (
                              currentJobs.map((job) => (
                                <TableRow key={job.id}>
                                  <TableCell sx={{ fontWeight: 500 }}>{job.vehicleNo}</TableCell>
                                  <TableCell>{job.customer}</TableCell>
                                  <TableCell>{job.service}</TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                      <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress
                                          variant="determinate"
                                          value={job.progress}
                                          sx={{
                                            height: 6,
                                            borderRadius: 5,
                                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                                            '& .MuiLinearProgress-bar': {
                                              borderRadius: 5,
                                              backgroundColor:
                                                job.status === 'Completed'
                                                  ? theme.palette.success.main
                                                  : job.status === 'In Progress'
                                                    ? theme.palette.warning.main
                                                    : theme.palette.info.main,
                                            },
                                          }}
                                        />
                                      </Box>
                                      <Box sx={{ minWidth: 35 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          {`${Math.round(job.progress)}%`}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>{getStatusChip(job.status)}</TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleActionMenuOpen(e, job.id)}
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} align="center">
                                  <Typography variant="body2" sx={{ py: 2 }}>
                                    No jobs found. Add your first job to get started.
                                  </Typography>
                                  <Button 
                                    variant="outlined" 
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 1, mb: 2 }}
                                  >
                                    Add New Job
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {currentJobs.length > 5 && (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Button
                            endIcon={<ArrowForwardIcon />}
                            sx={{ fontWeight: 600 }}
                          >
                            View All Jobs
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              </Box>

              {/* Inventory Section - now with Low Stock and High Stock side by side */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Inventory Management
              </Typography>
              <Grid container spacing={3}>
                {/* Low Stock Inventory */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                        Low in Stock
                      </Typography>
                      {inventoryLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Chip
                          label={`${lowStockItems.length} items`}
                          size="small"
                          color="error"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Paper elevation={0} sx={{ 
                      height: '100%',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: 3,
                      overflow: 'hidden',
                      borderLeft: `4px solid ${theme.palette.error.main}`,
                    }}>
                      {inventoryError ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Alert 
                            severity="error" 
                            sx={{ mb: 2 }}
                          >
                            {inventoryError}
                          </Alert>
                          <Button 
                            variant="outlined" 
                            size="small"
                            color="error"
                            startIcon={<RefreshIcon />} 
                            onClick={() => window.location.reload()}
                          >
                            Retry
                          </Button>
                        </Box>
                      ) : inventoryLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <TableContainer sx={{ maxHeight: 300 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Part Name</TableCell>
                                <TableCell align="center">Quantity</TableCell>
                                <TableCell align="right">Unit Price</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {lowStockItems.length > 0 ? (
                                lowStockItems.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell sx={{ fontWeight: 500 }}>
                                      {item.name}
                                      {item.carName && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          {item.carName} {item.model}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={item.quantity}
                                        size="small"
                                        sx={{
                                          backgroundColor: darkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)',
                                          color: theme.palette.error.main,
                                          fontWeight: 600,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">₹{item.price.toLocaleString()}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    <Typography variant="body2" sx={{ py: 2 }}>
                                      No low stock items found.
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Button
                          variant="text"
                          color="error"
                          endIcon={<ArrowForwardIcon />}
                          sx={{ fontWeight: 600 }}
                        >
                          Order Low Stock Items
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                </Grid>

                {/* High in Stock */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        High in Stock
                      </Typography>
                      {inventoryLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Chip
                          label={`${highStockItems.length} items`}
                          size="small"
                          color="success"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Paper elevation={0} sx={{ 
                      height: '100%',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: 3,
                      overflow: 'hidden',
                      borderLeft: `4px solid ${theme.palette.success.main}`,
                    }}>
                      {inventoryError ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Alert 
                            severity="error" 
                            sx={{ mb: 2 }}
                          >
                            {inventoryError}
                          </Alert>
                          <Button 
                            variant="outlined" 
                            size="small"
                            color="success"
                            startIcon={<RefreshIcon />} 
                            onClick={() => window.location.reload()}
                          >
                            Retry
                          </Button>
                        </Box>
                      ) : inventoryLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <TableContainer sx={{ maxHeight: 300 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Part Name</TableCell>
                                <TableCell align="center">Quantity</TableCell>
                                <TableCell align="right">Unit Price</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {highStockItems.length > 0 ? (
                                highStockItems.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell sx={{ fontWeight: 500 }}>
                                      {item.name}
                                      {item.carName && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          {item.carName} {item.model}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={item.quantity}
                                        size="small"
                                        sx={{
                                          backgroundColor: darkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)',
                                          color: theme.palette.success.main,
                                          fontWeight: 600,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">₹{item.price.toLocaleString()}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    <Typography variant="body2" sx={{ py: 2 }}>
                                      No high stock items found.
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Button
                          variant="text"
                          color="success"
                          endIcon={<ArrowForwardIcon />}
                          sx={{ fontWeight: 600 }}
                        >
                          Manage Inventory
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Job Actions Menu */}
      <Menu
        anchorEl={actionMenu}
        open={Boolean(actionMenu)}
        onClose={handleActionMenuClose}
        PaperProps={{
          elevation: 2,
          sx: { 
            minWidth: 180, 
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        <MenuItem onClick={handleActionMenuClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem onClick={handleActionMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Job" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleActionMenuClose} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Cancel Job" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default Dashboard;