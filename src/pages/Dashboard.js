import React, { useState, useEffect } from "react";
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
} from "@mui/material";
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
} from "@mui/icons-material";
import { useThemeContext } from "../Layout/ThemeContext";
import EditProfileButton from "../Login/EditProfileButton";
import EditProfileModal from "../Login/EditProfileModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const token = localStorage.getItem("authToken")
    ? `Bearer ${localStorage.getItem("authToken")}`
    : "";
  const garageId = localStorage.getItem("garageId");

  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentJobs, setCurrentJobs] = useState([]);
  const [dashboardStats, setDashboardStats] = useState([
    {
      title: "Active Jobs",
      value: 0,
      change: 0,
      isIncrease: true,
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      color: "#2563eb",
      lightColor: "rgba(37, 99, 235, 0.1)",
    },
    {
      title: "Parts Available",
      value: 0,
      change: 0,
      isIncrease: false,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: "#ea580c",
      lightColor: "rgba(234, 88, 12, 0.1)",
    },
    {
      title: "Pending Reminders",
      value: 0,
      change: 0,
      isIncrease: false,
      icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
      color: "#dc2626",
      lightColor: "rgba(220, 38, 38, 0.1)",
    },
  ]);

  // Inventory data will be fetched from API and separated into low/high stock
  const [lowStockItems, setLowStockItems] = useState([]);
  const [highStockItems, setHighStockItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  const navigate = useNavigate();

  const handleSaveProfile = (data) => {
    setProfileData(data);
  };

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

  const handleUpdate = (id) => {
    navigate(`assign-engineer/${id}`);
  };

  // Fetch garage profile data
  useEffect(() => {
    const fetchGarageProfile = async () => {
      if (!token || !garageId) return;

      try {
        const response = await axios.get(
          `https://garage-management-system-cr4w.onrender.com/api/garage/${garageId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (response.data && response.data.name) {
          setProfileData({
            name: response.data.name || "Your Garage",
            image: response.data.image || "",
          });
        }
      } catch (error) {
        console.error("Error fetching garage profile:", error);
      }
    };

    fetchGarageProfile();
  }, [token, garageId]);

  // Fetch job data from API
  useEffect(() => {
    const fetchJobs = async () => {
      if (!token || !garageId) {
        setError(
          "Authentication token or garage ID not found. Please log in again."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `https://garage-management-system-cr4w.onrender.com/api/jobCards/garage/${garageId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        // Process the response
        const jobsData = Array.isArray(response.data)
          ? response.data
          : response.data.jobCards
          ? response.data.jobCards
          : response.data.data
          ? response.data.data
          : [];

        // Extract and format job data from API response
        setCurrentJobs(jobsData);

        // Update dashboard stats
        const updatedStats = [...dashboardStats];

        // Count active jobs (Pending or In Progress)
        const activeJobsCount = jobsData.filter(
          (job) => job.status === "In Progress" || job.status === "Pending"
        ).length;

        updatedStats[0].value = activeJobsCount;
        setDashboardStats(updatedStats);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token, garageId]);

  // Fetch inventory data from API
  useEffect(() => {
    const fetchInventory = async () => {
      if (!token || !garageId) return;

      try {
        setInventoryLoading(true);
        setInventoryError(null);

        const response = await axios.get(
          `https://garage-management-system-cr4w.onrender.com/api/inventory/${garageId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        // Process the response
        const inventoryData = Array.isArray(response.data)
          ? response.data
          : response.data.inventory
          ? response.data.inventory
          : response.data.data
          ? response.data.data
          : [];

        // Sort inventory items into high and low stock based on quantity
        const highStock = [];
        const lowStock = [];

        inventoryData.forEach((item) => {
          // Using the actual structure from the API
          const inventoryItem = {
            id: item._id || "",
            name: item.partName || "Unknown Part",
            quantity: item.quantity || 0,
            price: item.pricePerUnit || 0,
            carName: item.carName || "",
            model: item.model || "",
            reorderPoint: Math.floor(item.quantity * 0.2) || 5,
          };

          // Items with quantity >= 10 go to high stock, others to low stock (threshold can be adjusted)
          if (item.quantity >= 10) {
            highStock.push(inventoryItem);
          } else {
            lowStock.push(inventoryItem);
          }
        });

        // Update the dashboard stats with total inventory count
        const updatedStats = [...dashboardStats];
        updatedStats[1].value = inventoryData.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        setDashboardStats(updatedStats);

        // Update state with sorted inventory items
        setHighStockItems(highStock);
        setLowStockItems(lowStock);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        setInventoryError(
          "Failed to load inventory data. Please try again later."
        );

        // Set fallback empty arrays if API fails
        setHighStockItems([]);
        setLowStockItems([]);
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventory();
  }, [token, garageId]);

  const getStatusChip = (status) => {
    // Standardize status value
    const normalizedStatus = status || "Pending";

    switch (normalizedStatus) {
      case "Completed":
        return (
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label={normalizedStatus}
            size="small"
            sx={{
              backgroundColor: darkMode
                ? "rgba(22, 163, 74, 0.2)"
                : "rgba(22, 163, 74, 0.1)",
              color: theme.palette.success.main,
              fontWeight: 600,
              "& .MuiChip-icon": { color: theme.palette.success.main },
            }}
          />
        );
      case "In Progress":
        return (
          <Chip
            icon={<WarningIcon fontSize="small" />}
            label={normalizedStatus}
            size="small"
            sx={{
              backgroundColor: darkMode
                ? "rgba(234, 88, 12, 0.2)"
                : "rgba(234, 88, 12, 0.1)",
              color: theme.palette.warning.main,
              fontWeight: 600,
              "& .MuiChip-icon": { color: theme.palette.warning.main },
            }}
          />
        );
      case "Pending":
        return (
          <Chip
            icon={<CalendarIcon fontSize="small" />}
            label={normalizedStatus}
            size="small"
            sx={{
              backgroundColor: darkMode
                ? "rgba(37, 99, 235, 0.2)"
                : "rgba(37, 99, 235, 0.1)",
              color: theme.palette.info.main,
              fontWeight: 600,
              "& .MuiChip-icon": { color: theme.palette.info.main },
            }}
          />
        );
      default:
        return (
          <Chip
            label={normalizedStatus}
            size="small"
            sx={{
              backgroundColor: darkMode
                ? "rgba(100, 116, 139, 0.2)"
                : "rgba(100, 116, 139, 0.1)",
              color: theme.palette.text.secondary,
              fontWeight: 600,
            }}
          />
        );
    }
  };

  // Calculate job progress based on status
  const getJobProgress = (status) => {
    switch (status) {
      case "Completed":
        return 100;
      case "In Progress":
        return 60;
      case "Pending":
        return 10;
      default:
        return 0;
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          mb: 4,
          ml: { xs: 0, sm: 35 },
          overflow: "auto",
        }}
      >
        <Container maxWidth="xl">
          <Card sx={{ mb: 4, overflow: "visible", borderRadius: 2 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box display="flex" alignItems="center">
                  <DashboardIcon
                    fontSize="large"
                    sx={{ color: "#3f51b5", mr: 2 }}
                  />
                  <Typography variant="h5" color="primary">
                    Dashboard Overview
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setModalOpen(true)}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  Edit Profile
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Stats Cards - exactly 3 cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {dashboardStats.map((card, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: "16px",
                        borderTop: `4px solid ${card.color}`,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold", mb: 0.5 }}
                            >
                              {card.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {card.title}
                            </Typography>
                          </Box>
                          <Avatar
                            sx={{
                              bgcolor: darkMode ? card.color : card.lightColor,
                              color: darkMode ? "white" : card.color,
                              width: 56,
                              height: 56,
                            }}
                          >
                            {card.icon}
                          </Avatar>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Chip
                            icon={
                              card.isIncrease ? (
                                <TrendingUpIcon fontSize="small" />
                              ) : (
                                <TrendingDownIcon fontSize="small" />
                              )
                            }
                            label={`${card.change}%`}
                            size="small"
                            sx={{
                              backgroundColor: darkMode
                                ? card.isIncrease
                                  ? "rgba(22, 163, 74, 0.2)"
                                  : "rgba(220, 38, 38, 0.2)"
                                : card.isIncrease
                                ? "rgba(22, 163, 74, 0.1)"
                                : "rgba(220, 38, 38, 0.1)",
                              color: card.isIncrease
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                              fontWeight: 600,
                              ".MuiChip-icon": { color: "inherit" },
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Current Jobs
                  </Typography>
                  <Box>{/* You can add buttons here if needed */}</Box>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  {loading ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <CircularProgress size={40} />
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        Loading job data...
                      </Typography>
                    </Box>
                  ) : error ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="body1" color="error">
                        {error}
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </Box>
                  ) : currentJobs.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="body1">
                        No jobs found. Create your first job to get started.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/jobs")}
                      >
                        Create New Job
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Vehicle No.</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Service</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Update</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {currentJobs.map((job) => (
                            <TableRow key={job._id}>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {job.carNumber ||
                                  job.registrationNumber ||
                                  "N/A"}
                              </TableCell>
                              <TableCell>{job.customerName || "N/A"}</TableCell>
                              <TableCell>
                                {job.jobDetails ||
                                  job.type ||
                                  "General Service"}
                              </TableCell>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Box sx={{ width: "100%", mr: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={getJobProgress(job.status)}
                                      sx={{
                                        height: 6,
                                        borderRadius: 5,
                                        backgroundColor: darkMode
                                          ? "rgba(255, 255, 255, 0.12)"
                                          : "rgba(0, 0, 0, 0.08)",
                                        "& .MuiLinearProgress-bar": {
                                          borderRadius: 5,
                                          backgroundColor:
                                            job.status === "Completed"
                                              ? theme.palette.success.main
                                              : job.status === "In Progress"
                                              ? theme.palette.warning.main
                                              : theme.palette.info.main,
                                        },
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 35 }}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {`${getJobProgress(job.status)}%`}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>{getStatusChip(job.status)}</TableCell>

                              <TableCell>
                                <Button onClick={() => handleUpdate(job._id)}>
                                  Update
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {currentJobs.length > 5 && (
                    <Box sx={{ textAlign: "center", py: 2 }}>
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
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.error.main,
                        }}
                      >
                        Low in Stock
                      </Typography>
                      <Chip
                        label={`${lowStockItems.length} items`}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Paper
                      elevation={0}
                      sx={{
                        height: "100%",
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 3,
                        overflow: "hidden",
                        borderLeft: `4px solid ${theme.palette.error.main}`,
                      }}
                    >
                      {inventoryLoading ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                          <CircularProgress size={30} />
                        </Box>
                      ) : inventoryError ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                          <Typography variant="body2" color="error">
                            {inventoryError}
                          </Typography>
                        </Box>
                      ) : lowStockItems.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                          <Typography variant="body2">
                            No low stock items found.
                          </Typography>
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
                              {lowStockItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell sx={{ fontWeight: 500 }}>
                                    {item.name}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={item.quantity}
                                      size="small"
                                      sx={{
                                        backgroundColor: darkMode
                                          ? "rgba(220, 38, 38, 0.2)"
                                          : "rgba(220, 38, 38, 0.1)",
                                        color: theme.palette.error.main,
                                        fontWeight: 600,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    ₹{item.price.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      <Box
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          borderTop: `1px solid ${theme.palette.divider}`,
                        }}
                      >
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
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.success.main,
                        }}
                      >
                        High in Stock
                      </Typography>
                      <Chip
                        label={`${highStockItems.length} items`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Paper
                      elevation={0}
                      sx={{
                        height: "100%",
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 3,
                        overflow: "hidden",
                        borderLeft: `4px solid ${theme.palette.success.main}`,
                      }}
                    >
                      {inventoryLoading ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                          <CircularProgress size={30} />
                        </Box>
                      ) : inventoryError ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                          <Typography variant="body2" color="error">
                            {inventoryError}
                          </Typography>
                        </Box>
                      ) : highStockItems.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                          <Typography variant="body2">
                            No high stock items found.
                          </Typography>
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
                              {highStockItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell sx={{ fontWeight: 500 }}>
                                    {item.name}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={item.quantity}
                                      size="small"
                                      sx={{
                                        backgroundColor: darkMode
                                          ? "rgba(22, 163, 74, 0.2)"
                                          : "rgba(22, 163, 74, 0.1)",
                                        color: theme.palette.success.main,
                                        fontWeight: 600,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    ₹{item.price.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      <Box
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          borderTop: `1px solid ${theme.palette.divider}`,
                        }}
                      >
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
        <MenuItem
          onClick={handleActionMenuClose}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Cancel Job" />
        </MenuItem>
      </Menu>
      <EditProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProfile}
        currentName={profileData.name}
        currentImage={profileData.image}
      />
    </>
  );
};

export default Dashboard;