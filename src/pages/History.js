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
  History as HistoryIcon,
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
      const parsed = JSON.parse(jobDetailsString);
      if (Array.isArray(parsed)) {
        return (
          <Box>
            {parsed.slice(0, maxItems).map((item, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ fontSize: compact ? "0.8rem" : "0.875rem" }}
              >
                • {item}
              </Typography>
            ))}
            {parsed.length > maxItems && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: compact ? "0.7rem" : "0.75rem" }}
              >
                +{parsed.length - maxItems} more items
              </Typography>
            )}
          </Box>
        );
      } else if (typeof parsed === "object") {
        const entries = Object.entries(parsed).slice(0, maxItems);
        return (
          <Box>
            {entries.map(([key, value], index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ fontSize: compact ? "0.8rem" : "0.875rem" }}
              >
                • {key}:{" "}
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
              </Typography>
            ))}
            {Object.keys(parsed).length > maxItems && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: compact ? "0.7rem" : "0.75rem" }}
              >
                +{Object.keys(parsed).length - maxItems} more fields
              </Typography>
            )}
          </Box>
        );
      }
    } catch (error) {
      // If parsing fails, display as plain text
      return (
        <Typography
          variant="body2"
          sx={{ fontSize: compact ? "0.8rem" : "0.875rem" }}
        >
          {jobDetailsString}
        </Typography>
      );
    }

    return (
      <Typography
        variant="body2"
        sx={{ fontSize: compact ? "0.8rem" : "0.875rem" }}
      >
        {jobDetailsString}
      </Typography>
    );
  };

  return parseAndDisplayJobDetails(jobDetails);
};

const History = () => {
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");
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
  const [jobsPage, setJobsPage] = useState(0);
  const [jobsRowsPerPage, setJobsRowsPerPage] = useState(10);
  const ITEMS_PER_PAGE = 10;

  const [currentJobs, setCurrentJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [dashboardStats, setDashboardStats] = useState([
    {
      title: "Total Jobs",
      value: 0,
      change: 0,
      isIncrease: true,
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      color: "#2563eb",
      lightColor: "rgba(37, 99, 235, 0.1)",
    },
    {
      title: "Completed",
      value: 0,
      change: 0,
      isIncrease: true,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: "#16a34a",
      lightColor: "rgba(22, 163, 74, 0.1)",
    },
    {
      title: "In Progress",
      value: 0,
      change: 0,
      isIncrease: false,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: "#dc2626",
      lightColor: "rgba(220, 38, 38, 0.1)",
    },
  ]);

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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        navigate(`/assign-engineer/${id}`);
      }
    } catch (error) {
      console.error("Error fetching job card:", error);
      setError("Failed to fetch job card details");
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJobData(job);
    setJobDetailsModalOpen(true);
  };

  const handleDownloadPDF = (job) => {
    // Navigate to billing page for PDF generation
    navigate(`/billing/${job._id}`);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const applyFilters = (searchTerm, status, start, end) => {
    let filtered = [...currentJobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.carNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.jobId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.customerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (status && status !== "All") {
      filtered = filtered.filter((job) => job.status === status);
    }

    // Date range filter
    if (start) {
      filtered = filtered.filter(
        (job) => new Date(job.createdAt) >= new Date(start)
      );
    }
    if (end) {
      filtered = filtered.filter(
        (job) => new Date(job.createdAt) <= new Date(end + "T23:59:59")
      );
    }

    return filtered;
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setStartDate("");
    setEndDate("");
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

  // Fetch job cards for the logged-in user
  useEffect(() => {
    const fetchJobs = async () => {
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Build URL with user filtering
        let url = `https://garage-management-zi5z.onrender.com/api/garage/jobCards/garage/${garageId}`;

        // Add user filter for subusers (not garage owners)
        if (userType === "user" && userId) {
          url += `?createdBy=${userId}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expired. Please log in again.");
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

        setCurrentJobs(jobsData);
        setFilteredJobs(jobsData);
        setJobsPage(0);

        // Update stats
        const totalJobs = jobsData.length;
        const completedJobs = jobsData.filter(
          (job) => job.status === "Completed"
        ).length;
        const inProgressJobs = jobsData.filter(
          (job) => job.status === "In Progress" || job.status === "Pending"
        ).length;

        const updatedStats = [...dashboardStats];
        updatedStats[0].value = totalJobs;
        updatedStats[1].value = completedJobs;
        updatedStats[2].value = inProgressJobs;
        setDashboardStats(updatedStats);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError(`Failed to load jobs data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [garageId, token, userId, userType, navigate]);

  // Update filtered jobs when currentJobs changes
  useEffect(() => {
    setFilteredJobs(currentJobs);
  }, [currentJobs]);

  // Apply filters when search or filters change
  useEffect(() => {
    const filtered = applyFilters(search, statusFilter, startDate, endDate);
    setFilteredJobs(filtered);
    setJobsPage(0);
  }, [search, statusFilter, startDate, endDate, currentJobs]);

  const getStatusChip = (status) => {
    const statusConfig = {
      "In Progress": { color: "warning", icon: <BuildIcon /> },
      Completed: { color: "success", icon: <CheckCircleIcon /> },
      Pending: { color: "info", icon: <WarningIcon /> },
      Cancelled: { color: "error", icon: <WarningIcon /> },
    };

    const config = statusConfig[status] || {
      color: "default",
      icon: <WarningIcon />,
    };

    return (
      <Chip
        icon={config.icon}
        label={status}
        color={config.color}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const getJobProgress = (job) => {
    const statusProgress = {
      Pending: 25,
      "In Progress": 75,
      Completed: 100,
      Cancelled: 0,
    };
    return statusProgress[job.status] || 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "success";
    if (progress >= 75) return "warning";
    if (progress >= 25) return "info";
    return "error";
  };

  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          mb: 4,
          ml: { xs: 0, sm: 35 },
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading History...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        mb: 4,
        ml: { xs: 0, sm: 35 },
        overflow: "auto",
        pt: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            p: 3,
            mb: 3,
            bgcolor: "#1976d2",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => navigate("/")}
                sx={{
                  mr: 2,
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  <HistoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Job History
                </Typography>
                <Typography
                  variant="body2"
                  color="rgba(255,255,255,0.8)"
                  sx={{ mt: 0.5 }}
                >
                  View all job cards created by you
                </Typography>
              </Box>
            </Box>
            <EditProfileButton
              profileData={profileData}
              onSave={handleSaveProfile}
            />
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={stat.color}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {stat.title}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: stat.lightColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search and Filters */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search jobs..."
                  value={search}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                    startIcon={<RefreshIcon />}
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                      Job ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                      Customer
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                      Vehicle
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                      Progress
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                      Created
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getPaginatedJobs().map((job) => (
                    <TableRow key={job._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {job.jobId || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {job.customerName || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.customerNumber || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {job.carNumber || job.registrationNumber || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.model || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(job.status)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box sx={{ width: "100%", mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={getJobProgress(job)}
                              color={getProgressColor(getJobProgress(job))}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {getJobProgress(job)}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(job.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(event) =>
                            handleActionMenuOpen(event, job._id)
                          }
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredJobs.length}
              page={jobsPage}
              onPageChange={handleJobsPageChange}
              rowsPerPage={jobsRowsPerPage}
              onRowsPerPageChange={handleJobsRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenu}
          open={Boolean(actionMenu)}
          onClose={handleActionMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleViewDetails(
                currentJobs.find((job) => job._id === selectedJobId)
              );
              handleActionMenuClose();
            }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleUpdate(selectedJobId);
              handleActionMenuClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Update Job</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDownloadPDF(
                currentJobs.find((job) => job._id === selectedJobId)
              );
              handleActionMenuClose();
            }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download PDF</ListItemText>
          </MenuItem>
        </Menu>

        {/* Job Details Modal */}
        <JobDetailsModal
          open={jobDetailsModalOpen}
          onClose={() => setJobDetailsModalOpen(false)}
          jobData={selectedJobData}
        />

        {/* Profile Modal */}
        <EditProfileModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProfile}
          profileData={profileData}
        />
      </Container>
    </Box>
  );
};

export default History;
