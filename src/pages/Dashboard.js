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
  TablePagination,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Alert,
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useThemeContext } from "../Layout/ThemeContext";
import EditProfileButton from "../Login/EditProfileButton";
import EditProfileModal from "../Login/EditProfileModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JobDetailsModal from "./jobDetailsModal";

// Job Details Component for better parsing and display
const JobDetailsComponent = ({
  jobDetails,
  maxItems = 2,
  showPrices = true,
  compact = false,
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
    if (
      typeof jobDetailsString === "string" &&
      !jobDetailsString.trim().startsWith("[") &&
      !jobDetailsString.trim().startsWith("{")
    ) {
      return (
        <Typography
          variant="body2"
          sx={{ fontSize: compact ? "0.8rem" : "0.875rem" }}
        >
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
              <Box
                key={index}
                sx={{
                  mb: compact ? 0.3 : 0.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontSize: compact ? "0.8rem" : "0.875rem",
                    lineHeight: 1.2,
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
                      fontSize: "0.75rem",
                      height: compact ? "18px" : "20px",
                      fontWeight: 600,
                      "& .MuiChip-label": {
                        px: compact ? 0.5 : 1,
                      },
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
                  fontStyle: "italic",
                  fontSize: compact ? "0.7rem" : "0.75rem",
                }}
              >
                +{details.length - maxItems} more service
                {details.length - maxItems > 1 ? "s" : ""}
              </Typography>
            )}
          </Box>
        );
      } else if (typeof details === "object" && details !== null) {
        // Handle single object case
        return (
          <Box>
            {details.description && (
              <Typography
                variant="body2"
                sx={{ fontSize: compact ? "0.8rem" : "0.875rem" }}
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
                  height: compact ? "18px" : "20px",
                }}
              />
            )}
          </Box>
        );
      } else {
        return (
          <Typography
            variant="body2"
            sx={{ fontSize: compact ? "0.8rem" : "0.875rem" }}
          >
            {typeof details === "object"
              ? JSON.stringify(details)
              : String(details)}
          </Typography>
        );
      }
    } catch (error) {
      console.warn("Failed to parse job details:", error);
      // If JSON parsing fails, display the original string
      return (
        <Typography
          variant="body2"
          sx={{ fontSize: compact ? "0.8rem" : "0.875rem" }}
        >
          {jobDetailsString}
        </Typography>
      );
    }
  };
  return parseAndDisplayJobDetails(jobDetails);
};

const Dashboard = () => {
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }

  const token = localStorage.getItem("token"); // ✅ Get JWT token
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [selectedJobData, setSelectedJobData] = useState(null);

  // Search and Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination states
  const [showAllLowStock, setShowAllLowStock] = useState(false);
  const [showAllHighStock, setShowAllHighStock] = useState(false);
  const [pendingDevices, setPendingDevices] = useState([]);
  const [showAllPendingDevices, setShowAllPendingDevices] = useState(false);

  // Job pagination
  const [jobsPage, setJobsPage] = useState(0);
  const [jobsRowsPerPage, setJobsRowsPerPage] = useState(5);
  const ITEMS_PER_PAGE = 5;

  const [currentJobs, setCurrentJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

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

  const handleUpdate = async (id) => {
    try {
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add token here too
          },
        }
      );
      const jobCard = response.data;
      const { engineerId, laborHours, qualityCheck } = jobCard;

      // Add safety checks for engineerId
      if (
        !engineerId ||
        !Array.isArray(engineerId) ||
        engineerId.length === 0 ||
        !engineerId[0]?._id
      ) {
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

  const handleViewDetails = (job) => {
    setSelectedJobData(job);
    setJobDetailsModalOpen(true);
  };

  const handleDownloadPDF = (job) => {
    setSelectedJobData(job);
    setJobDetailsModalOpen(true);
  };

  // Search and Filter Functions
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    applyFilters(searchTerm, statusFilter, startDate, endDate);
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    applyFilters(search, newStatus, startDate, endDate);
  };

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

  const applyFilters = (searchTerm, status, start, end) => {
    let filtered = [...currentJobs];
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (job) =>
          (job.carNumber && job.carNumber.toLowerCase().includes(searchTerm)) ||
          (job.registrationNumber &&
            job.registrationNumber.toLowerCase().includes(searchTerm)) ||
          (job.customerName &&
            job.customerName.toLowerCase().includes(searchTerm)) ||
          (job.jobDetails &&
            job.jobDetails.toLowerCase().includes(searchTerm)) ||
          (job.type && job.type.toLowerCase().includes(searchTerm))
      );
    }
    if (status && status !== "All") {
      filtered = filtered.filter((job) => job.status === status);
    }
    if (start && end) {
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.createdAt);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return jobDate >= startDate && jobDate <= endDate;
      });
    }
    setFilteredJobs(filtered);
    setJobsPage(0);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setStartDate("");
    setEndDate("");
    setFilteredJobs(currentJobs);
    setJobsPage(0);
  };

  const handleJobsPageChange = (event, newPage) => {
    setJobsPage(newPage);
  };

  const handleJobsRowsPerPageChange = (event) => {
    setJobsRowsPerPage(parseInt(event.target.value, 10));
    setJobsPage(0);
  };

  const getPaginatedJobs = () => {
    const startIndex = jobsPage * jobsRowsPerPage;
    const endIndex = startIndex + jobsRowsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  };

  const getDisplayedItems = (items, showAll, itemsPerPage = ITEMS_PER_PAGE) => {
    return showAll ? items : items.slice(0, itemsPerPage);
  };

  const shouldShowMoreButton = (
    items,
    showAll,
    itemsPerPage = ITEMS_PER_PAGE
  ) => {
    return items.length > itemsPerPage;
  };

  // Fetch job data from API
  useEffect(() => {
    // if (!garageId) {
    //   navigate("/login");
    //   return;
    // }

    const fetchJobs = async () => {
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/garage/${garageId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ Added token
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expired. Please log in again.");
            // setTimeout(() => navigate("/login"), 2000);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const jobsData = Array.isArray(data)
          ? data
          : data.jobCards
          ? data.jobCards
          : data.data
          ? data.data
          : [];

        // Sort jobs by updatedAt date (most recent first)
        const sortedJobsData = jobsData.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA; // Descending order (newest first)
        });

        const activeJobs = sortedJobsData.filter(
          (job) => job.status === "Pending" || job.status === "In Progress"
        );

        setCurrentJobs(activeJobs);
        setFilteredJobs(activeJobs);
        setJobsPage(0);

        const updatedStats = [...dashboardStats];
        updatedStats[0].value = activeJobs.length;
        setDashboardStats(updatedStats);

        const pendingDevicesFromJobs = activeJobs.map((job) => ({
          id: job._id,
          deviceName:
            job.carNumber || job.registrationNumber || "Unknown Device",
          customerName: job.customerName || "N/A",
          status: job.status,
          jobType: job.jobDetails || job.type || "General Service",
          dateCreated: job.createdAt || new Date().toISOString(),
        }));
        setPendingDevices(pendingDevicesFromJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError(`Failed to load jobs data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [garageId, token, navigate]);

  // Update filtered jobs when currentJobs changes
  useEffect(() => {
    setFilteredJobs(currentJobs);
  }, [currentJobs]);

  // Fetch inventory data from API
  useEffect(() => {
    const fetchInventory = async () => {
      if (!garageId || !token) return;

      try {
        setInventoryLoading(true);
        setInventoryError(null);

        const response = await fetch(
          `https://garage-management-zi5z.onrender.com/api/garage/inventory/${garageId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ Token added
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const inventoryData = Array.isArray(data)
          ? data
          : data.inventory || data.data || [];

        const highStock = [];
        const lowStock = [];

        inventoryData.forEach((item) => {
          const inventoryItem = {
            id: item._id || "",
            name: item.partName || "Unknown Part",
            quantity: item.quantity || 0,
            price: item.pricePerUnit || 0,
            carName: item.carName || "",
            model: item.model || "",
            reorderPoint: Math.floor(item.quantity * 0.2) || 5,
          };
          if (item.quantity >= 10) {
            highStock.push(inventoryItem);
          } else {
            lowStock.push(inventoryItem);
          }
        });

        const updatedStats = [...dashboardStats];
        updatedStats[1].value = inventoryData.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        setDashboardStats(updatedStats);

        setHighStockItems(highStock);
        setLowStockItems(lowStock);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        setInventoryError(`Failed to load inventory data: ${error.message}`);
        setHighStockItems([]);
        setLowStockItems([]);
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventory();
  }, [garageId, token]);

  const getStatusChip = (status) => {
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

  const getJobProgress = (job) => {
    if (
      !job.engineerId ||
      !Array.isArray(job.engineerId) ||
      job.engineerId.length === 0 ||
      !job.engineerId[0]?._id
    ) {
      return 25;
    } else if (job.laborHours === null || job.laborHours === undefined) {
      return 50;
    } else if (!job.qualityCheck || !job.qualityCheck.billApproved) {
      return 75;
    } else {
      return 90;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return theme.palette.success.main;
    if (progress >= 75) return theme.palette.info.main;
    if (progress >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
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
              {/* Rest of your UI remains unchanged */}
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
              </Box>
              <Divider sx={{ my: 3 }} />

              {/* Stats Cards */}
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

              {/* Search and Filter Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Active Jobs ({filteredJobs.length} of {currentJobs.length}{" "}
                  total)
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      value={search}
                      onChange={handleSearch}
                      placeholder="Search by vehicle, customer, or job details..."
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        endAdornment: search && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSearch("");
                                applyFilters(
                                  "",
                                  statusFilter,
                                  startDate,
                                  endDate
                                );
                              }}
                            >
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        label="Status"
                      >
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                      </Select>
                    </FormControl>
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
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleClearFilters}
                      startIcon={<FilterListIcon />}
                      size="small"
                      sx={{ height: "40px" }}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>
                {(search || statusFilter !== "All" || startDate || endDate) && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {filteredJobs.length === 0
                      ? "No jobs match your search criteria"
                      : `Showing ${filteredJobs.length} job(s) matching your criteria`}
                  </Alert>
                )}
              </Box>

              {/* Jobs Table */}
              <Paper
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 3,
                  overflow: "hidden",
                  mb: 4,
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
                ) : filteredJobs.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1">
                      {currentJobs.length === 0
                        ? "No active jobs found. Create your first job to get started."
                        : "No jobs match your search criteria. Try adjusting your filters."}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>No.</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Vehicle No.</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Service</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Status Page</TableCell>
                            <TableCell>Update</TableCell>
                            <TableCell>Details</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getPaginatedJobs().map((job, index) => {
                            const progress = getJobProgress(job);
                            const progressColor = getProgressColor(progress);
                            return (
                              <TableRow key={job._id}>
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {index + 1}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {typeof job.createdBy === "object" &&
                                  job.createdBy?.name
                                    ? job.createdBy.name
                                    : typeof job.createdBy === "string"
                                    ? job.createdBy
                                    : "N/A"}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {job.carNumber ||
                                    job.registrationNumber ||
                                    "N/A"}
                                </TableCell>
                                <TableCell>
                                  {job.customerName || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <JobDetailsComponent
                                    jobDetails={job.jobDetails}
                                    maxItems={2}
                                    showPrices={true}
                                    compact={true}
                                  />
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
                                        value={progress}
                                        sx={{
                                          height: 8,
                                          borderRadius: 5,
                                          backgroundColor: darkMode
                                            ? "rgba(255, 255, 255, 0.12)"
                                            : "rgba(0, 0, 0, 0.08)",
                                          "& .MuiLinearProgress-bar": {
                                            borderRadius: 5,
                                            backgroundColor: progressColor,
                                          },
                                        }}
                                      />
                                    </Box>
                                    <Box sx={{ minWidth: 35 }}>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        {`${progress}%`}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {getStatusChip(job.status)}
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const {
                                      engineerId,
                                      laborHours,
                                      qualityCheck,
                                    } = job;
                                    if (
                                      !engineerId ||
                                      !Array.isArray(engineerId) ||
                                      engineerId.length === 0 ||
                                      !engineerId[0]?._id
                                    ) {
                                      return "Assign Engineer";
                                    } else if (
                                      laborHours === null ||
                                      laborHours === undefined
                                    ) {
                                      return "Work In Progress";
                                    } else if (
                                      !qualityCheck ||
                                      !qualityCheck.billApproved
                                    ) {
                                      return "Quality Check";
                                    } else {
                                      return "Billing";
                                    }
                                  })()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ mr: 1 }}
                                    onClick={() => handleUpdate(job._id)}
                                  >
                                    Update
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleViewDetails(job)}
                                    sx={{ mr: 1 }}
                                  >
                                    Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* Pagination */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Showing {jobsPage * jobsRowsPerPage + 1} to{" "}
                        {Math.min(
                          (jobsPage + 1) * jobsRowsPerPage,
                          filteredJobs.length
                        )}{" "}
                        of {filteredJobs.length} jobs
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Rows per page:
                          </Typography>
                          <select
                            value={jobsRowsPerPage}
                            onChange={handleJobsRowsPerPageChange}
                            style={{
                              padding: "4px 8px",
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: "4px",
                              backgroundColor: theme.palette.background.paper,
                              color: theme.palette.text.primary,
                            }}
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                          </select>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            onClick={(e) =>
                              handleJobsPageChange(e, jobsPage - 1)
                            }
                            disabled={jobsPage === 0}
                            size="small"
                          >
                            <NavigateBeforeIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ mx: 2 }}>
                            Page {jobsPage + 1} of{" "}
                            {Math.ceil(filteredJobs.length / jobsRowsPerPage)}
                          </Typography>
                          <IconButton
                            onClick={(e) =>
                              handleJobsPageChange(e, jobsPage + 1)
                            }
                            disabled={
                              jobsPage >=
                              Math.ceil(filteredJobs.length / jobsRowsPerPage) -
                                1
                            }
                            size="small"
                          >
                            <NavigateNextIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>

              {/* Inventory Section */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Inventory Management
              </Typography>
              <Grid container spacing={3}>
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
                                {/* <TableCell align="right">Unit Price</TableCell> */}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {getDisplayedItems(
                                lowStockItems,
                                showAllLowStock
                              ).map((item) => (
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
                                  {/* <TableCell align="right">
                                    {item.price.toLocaleString()}
                                  </TableCell> */}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      {shouldShowMoreButton(lowStockItems, showAllLowStock) && (
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
                            endIcon={
                              showAllLowStock ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )
                            }
                            sx={{ fontWeight: 600 }}
                            onClick={() => setShowAllLowStock(!showAllLowStock)}
                          >
                            {showAllLowStock
                              ? `Show Less (${ITEMS_PER_PAGE} items)`
                              : `Show More (${
                                  lowStockItems.length - ITEMS_PER_PAGE
                                } more)`}
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Grid>
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
                                {/* <TableCell align="right">Unit Price</TableCell> */}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {getDisplayedItems(
                                highStockItems,
                                showAllHighStock
                              ).map((item) => (
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
                                  {/* <TableCell align="right">
                                    {item.price.toLocaleString()}
                                  </TableCell> */}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      {shouldShowMoreButton(
                        highStockItems,
                        showAllHighStock
                      ) && (
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
                            endIcon={
                              showAllHighStock ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )
                            }
                            sx={{ fontWeight: 600 }}
                            onClick={() =>
                              setShowAllHighStock(!showAllHighStock)
                            }
                          >
                            {showAllHighStock
                              ? `Show Less (${ITEMS_PER_PAGE} items)`
                              : `Show More (${
                                  highStockItems.length - ITEMS_PER_PAGE
                                } more)`}
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Modals */}
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

      <JobDetailsModal
        open={jobDetailsModalOpen}
        onClose={() => {
          setJobDetailsModalOpen(false);
          setSelectedJobData(null);
        }}
        jobData={selectedJobData}
      />
    </>
  );
};

export default Dashboard;
