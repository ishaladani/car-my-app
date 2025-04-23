import React, { useState } from 'react';
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
  CssBaseline
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
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
// import TopNavbarManager from '../layouts/NavBarManager';

// Demo data with exactly 3 stat cards
const statsCards = [
  {
    title: 'Active Jobs',
    value: 24,
    change: 12,
    isIncrease: true,
    icon: <BuildIcon sx={{ fontSize: 40 }} />,
    color: '#2563eb',
    lightColor: 'rgba(37, 99, 235, 0.1)',
  },
  {
    title: 'Parts Available',
    value: 143,
    change: 3,
    isIncrease: false,
    icon: <InventoryIcon sx={{ fontSize: 40 }} />,
    color: '#ea580c',
    lightColor: 'rgba(234, 88, 12, 0.1)',
  },
  {
    title: 'Pending Reminders',
    value: 8,
    change: 2,
    isIncrease: true,
    icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
    color: '#dc2626',
    lightColor: 'rgba(220, 38, 38, 0.1)',
  },
];

const currentJobs = [
  {
    id: 1,
    vehicleNo: 'ABC-123',
    customer: 'John Smith',
    service: 'Engine Repair',
    date: '24 Mar 2025',
    status: 'In Progress',
    progress: 65,
    priority: 'High',
    technician: 'Mike Johnson',
  },
  {
    id: 2,
    vehicleNo: 'XYZ-456',
    customer: 'Sarah Williams',
    service: 'Brake Replacement',
    date: '23 Mar 2025',
    status: 'Completed',
    progress: 100,
    priority: 'Medium',
    technician: 'David Thompson',
  },
  {
    id: 3,
    vehicleNo: 'DEF-789',
    customer: 'Michael Brown',
    service: 'Oil Change',
    date: '25 Mar 2025',
    status: 'Pending',
    progress: 0,
    priority: 'Low',
    technician: 'Unassigned',
  },
  {
    id: 4,
    vehicleNo: 'GHI-101',
    customer: 'Jessica Davis',
    service: 'Tire Rotation',
    date: '24 Mar 2025',
    status: 'In Progress',
    progress: 30,
    priority: 'Medium',
    technician: 'Chris Wilson',
  },
  {
    id: 5,
    vehicleNo: 'JKL-234',
    customer: 'Robert Taylor',
    service: 'A/C Repair',
    date: '24 Mar 2025',
    status: 'In Progress',
    progress: 45,
    priority: 'High',
    technician: 'Alex Martin',
  },
];

const lowStockItems = [
  { id: 1, name: 'Brake Pads', quantity: 3, reorderPoint: 5, price: 1200 },
  { id: 2, name: 'Oil Filters', quantity: 2, reorderPoint: 8, price: 750 },
  { id: 3, name: 'Air Filters', quantity: 1, reorderPoint: 5, price: 500 },
  { id: 4, name: 'Spark Plugs', quantity: 4, reorderPoint: 10, price: 850 },
];

const highStockItems = [
  { id: 1, name: 'Engine Oil', quantity: 50, price: 40000 },
  { id: 2, name: 'Tires', quantity: 20, price: 60000 },
  { id: 3, name: 'Wiper Blades', quantity: 35, price: 17500 },
  { id: 4, name: 'Coolant', quantity: 45, price: 22500 },
];

// const upcomingServices = [
//   { id: 1, vehicleNo: 'MNO-345', customer: 'Emma Wilson', service: 'Routine Maintenance', date: '26 Mar 2025' },
//   { id: 2, vehicleNo: 'PQR-678', customer: 'Daniel Garcia', service: 'Wheel Alignment', date: '27 Mar 2025' },
//   { id: 3, vehicleNo: 'STU-910', customer: 'Sophie Miller', service: 'Battery Check', date: '28 Mar 2025' },
// ];

const Dashboard = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  const handleActionMenuOpen = (event, jobId) => {
    setActionMenu(event.currentTarget);
    setSelectedJobId(jobId);
  };
  
  const handleActionMenuClose = () => {
    setActionMenu(null);
    setSelectedJobId(null);
  };
  
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
                {/* <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: 2,
                    fontWeight: 600,
                    px: 3
                  }}
                >
                  Refresh
                </Button> */}
              </Box>
              
              <Divider sx={{ my: 3 }} />

              {/* Stats Cards - exactly 3 cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {statsCards.map((card, index) => (
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
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {card.value}
                            </Typography>
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
                    {/* <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      sx={{ mr: 2, borderRadius: 2 }}
                    >
                      Filter
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      New Job
                    </Button> */}
                  </Box>
                </Box>
                <Paper elevation={0} sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Vehicle No.</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Service</TableCell>
                          {/* <TableCell>Date</TableCell> */}
                          {/* <TableCell>Technician</TableCell> */}
                          <TableCell>Progress</TableCell>
                          {/* <TableCell>Priority</TableCell> */}
                          <TableCell>Status</TableCell>
                          {/* <TableCell align="right">Actions</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentJobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell sx={{ fontWeight: 500 }}>{job.vehicleNo}</TableCell>
                            <TableCell>{job.customer}</TableCell>
                            <TableCell>{job.service}</TableCell>
                            {/* <TableCell>{job.date}</TableCell> */}
                            {/* <TableCell>{job.technician}</TableCell> */}
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
                            {/* <TableCell>{getPriorityChip(job.priority)}</TableCell> */}
                            <TableCell>{getStatusChip(job.status)}</TableCell>
                            {/* <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={(e) => handleActionMenuOpen(e, job.id)}
                                aria-label="more options"
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell> */}
                          </TableRow>
                        ))}
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
                      <Chip
                        label={`${lowStockItems.length} items`}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Paper elevation={0} sx={{ 
                      height: '100%',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: 3,
                      overflow: 'hidden',
                      borderLeft: `4px solid ${theme.palette.error.main}`,
                    }}>
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
                            {lowStockItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
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
                                <TableCell align="right">${item.price.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
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
                      <Chip
                        label={`${highStockItems.length} items`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Paper elevation={0} sx={{ 
                      height: '100%',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: 3,
                      overflow: 'hidden',
                      borderLeft: `4px solid ${theme.palette.success.main}`,
                    }}>
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
                            {highStockItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
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
                                <TableCell align="right">${item.price.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
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

                {/* Upcoming Services Section */}
                {/* <Grid item xs={12}>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Upcoming Services
                      </Typography>
                      <Chip
                        label={`Next 3 days`}
                        size="small"
                        color="info"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Paper elevation={0} sx={{ 
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <Grid container>
                        {upcomingServices.map((service) => (
                          <Grid item xs={12} md={4} key={service.id}>
                            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {service.vehicleNo}
                                </Typography>
                                <Chip
                                  label={service.date}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontWeight: 500 }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>{service.customer}</Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  label={service.service}
                                  size="small"
                                  sx={{
                                    backgroundColor: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                                    color: theme.palette.info.main,
                                    fontWeight: 500,
                                  }}
                                />
                                <IconButton size="small" color="primary">
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          endIcon={<ArrowForwardIcon />}
                          sx={{ fontWeight: 600 }}
                        >
                          View All Reminders
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                </Grid> */}
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