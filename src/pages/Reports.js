import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
  Tooltip,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Work as WorkIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { useThemeContext } from "../Layout/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { getGarageApiUrl, getBaseApiUrl } from "../config/api";

const RecordReport = () => {
  const navigate = useNavigate();
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { darkMode } = useThemeContext();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Search and Filter States
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [billTypeFilter, setBillTypeFilter] = useState("All");

  // Data States
  const [jobsData, setJobsData] = useState([]);
  const [filteredJobsData, setFilteredJobsData] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sort data by completed date (most recent first)
  const sortJobsByCompletedDate = (jobs) => {
    return jobs.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.updatedAt || a.createdAt);
      const dateB = new Date(b.completedAt || b.updatedAt || b.createdAt);
      return dateB - dateA; // Descending order (most recent first)
    });
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatCurrencyForPDF = (amount) => {
  const number = amount || 0;
  const formattedNumber = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  })
    .format(number)
    .replace("₹", "Rs "); // Replace ₹ with Rs
  return formattedNumber;
};

  // Generate PDF for jobs
  const generateJobsPDF = (jobs) => {
  const doc = new jsPDF();

  const formatCurrencyForPDF = (amount) => {
    const number = amount || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    })
      .format(number)
      .replace("₹", "Rs ");
  };

  // Title
  doc.setFontSize(20);
  doc.text("Financial Report - Completed Jobs", 20, 20);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

  // Summary
  const totalJobs = jobs.length;
  const totalAmount = jobs.reduce((sum, job) => sum + (job.totalAmount || 0), 0);

  doc.setFontSize(14);
  doc.text("Summary:", 20, 45);
  doc.setFontSize(12);
  doc.text(`Total Jobs: ${totalJobs}`, 20, 55);
  doc.text(`Total Revenue: ${formatCurrencyForPDF(totalAmount)}`, 20, 65);

  // Table
  const tableData = jobs.map((job) => [
    job.jobId || "N/A",
    job.customerName || "N/A",
    job.carNumber || "N/A",
    formatCurrencyForPDF(job.totalAmount || 0),
    new Date(job.completedAt || job.updatedAt).toLocaleDateString("en-IN"),
  ]);

  autoTable(doc, {
    head: [["Job ID", "Customer", "Vehicle", "Amount", "Completed Date"]],
    body: tableData,
    startY: 80,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [25, 118, 210] },
  });

  doc.save(`financial-report-${new Date().toISOString().split("T")[0]}.pdf`);
};


const generateInventoryPDF = (inventoryData) => {
  if (!inventoryData) return;

  const doc = new jsPDF();
  const formatCurrencyForPDF = (amount) => {
    const number = amount || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    })
      .format(number)
      .replace("₹", "Rs ");
  };

  // Title
  doc.setFontSize(20);
  doc.text("Inventory Report", 20, 20);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

  // Summary
  const summary = inventoryData?.summary || {};
  let yPos = 45;

  doc.setFontSize(14);
  doc.text("Summary:", 20, yPos);
  yPos += 12;

  doc.setFontSize(12);
  doc.text(`Total Parts: ${summary.totalParts}`, 20, yPos);
  yPos += 10;

  doc.text(`Total Available: ${summary.totalPartsAvailable}`, 20, yPos);
  yPos += 10;

  doc.text(
    `Purchase Value: ${formatCurrencyForPDF(summary.totalPurchaseValue)}`,
    20,
    yPos
  );
  yPos += 10;

  doc.text(
    `Selling Value: ${formatCurrencyForPDF(summary.totalSellingValue)}`,
    20,
    yPos
  );
  yPos += 10;

  doc.text(
    `Potential Profit: ${formatCurrencyForPDF(summary.potentialProfit)}`,
    20,
    yPos
  );
  yPos += 10;

  doc.text(`Low Stock Items: ${summary.lowStockCount}`, 20, yPos);
  yPos += 10;

  doc.text(`Out of Stock: ${summary.outOfStockCount}`, 20, yPos);
  yPos += 20;

  // Low Stock Table
  if (inventoryData.lowStockItems?.length > 0) {
    autoTable(doc, {
      head: [["Part Name", "Model", "Quantity", "Purchase Price", "Selling Price"]],
      body: inventoryData.lowStockItems.map((part) => [
        part.name,
        part.model,
        part.quantity,
        formatCurrencyForPDF(part.price),
        formatCurrencyForPDF(part.price),
      ]),
      startY: yPos,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 152, 0] },
    });
  }

  doc.save(`inventory-report-${new Date().toISOString().split("T")[0]}.pdf`);
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
          `${getGarageApiUrl()}/jobCards/garage/${garageId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const jobsData = Array.isArray(data)
          ? data
          : data.jobCards
          ? data.jobCards
          : data.data
          ? data.data
          : [];
        
        // Filter: Only jobs where status is "Completed" AND progress is exactly 100
        const completedJobs = jobsData.filter(
          (job) => job.status === "Completed" && job.progress === 100
        );

        // Sort jobs by completed date (most recent first)
        const sortedJobs = sortJobsByCompletedDate(completedJobs);
        setJobsData(sortedJobs);
        setFilteredJobsData(sortedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError(`Failed to load jobs: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [garageId, navigate, token]);

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setInventoryLoading(true);
      const response = await axios.get(
        `${getGarageApiUrl()}/inventory/${garageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Transform the inventory data to match the expected format
      const inventoryArray = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Create a report structure from the inventory data
      const report = {
        summary: {
          totalParts: inventoryArray.length,
          totalPartsAvailable: inventoryArray.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          ),
          totalSellingValue: inventoryArray.reduce(
            (sum, item) =>
              sum +
              (item.quantity || 0) *
                (item.sellingPrice || item.pricePerUnit || 0),
            0
          ),
          totalPurchaseValue: inventoryArray.reduce(
            (sum, item) =>
              sum +
              (item.quantity || 0) *
                (item.purchasePrice || item.pricePerUnit || 0),
            0
          ),
          potentialProfit: inventoryArray.reduce(
            (sum, item) =>
              sum +
              (item.quantity || 0) *
                ((item.sellingPrice || item.pricePerUnit || 0) -
                  (item.purchasePrice || item.pricePerUnit || 0)),
            0
          ),
          lowStockCount: inventoryArray.filter(
            (item) => (item.quantity || 0) < 3
          ).length,
          outOfStockCount: inventoryArray.filter(
            (item) => (item.quantity || 0) === 0
          ).length,
        },
        totalItems: inventoryArray.length,
        totalValue: inventoryArray.reduce(
          (sum, item) =>
            sum +
            (item.quantity || 0) *
              (item.sellingPrice || item.pricePerUnit || 0),
          0
        ),
        lowStockItems: inventoryArray.filter(
          (item) => (item.quantity || 0) < 3
        ),
        allItems: inventoryArray.map((item) => ({
          id: item._id,
          name: item.partName || item.name,
          quantity: item.quantity || 0,
          price: item.sellingPrice || item.pricePerUnit || 0,
          carName: item.carName || "",
          model: item.model || "",
          reorderPoint: Math.floor((item.quantity || 0) * 0.2) || 5,
        })),
      };

      setInventoryData(report);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setError(`Failed to load inventory data: ${error.message}`);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Fetch financial data
  const [financialData, setFinancialData] = useState(null);
  const [financialLoading, setFinancialLoading] = useState(false);

  const fetchFinancialData = async () => {
    try {
      setFinancialLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(
        `${getBaseApiUrl()}/api/billing/financial-report/${garageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );
      setFinancialData(response.data.report);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setError(`Failed to load financial data: ${error.message}`);
    } finally {
      setFinancialLoading(false);
    }
  };

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

  // Handle Bill Type filter change
  const handleBillTypeFilterChange = (e) => {
    const newBillType = e.target.value;
    setBillTypeFilter(newBillType);
    applyFilters(search, startDate, endDate, newBillType);
  };

  // Apply filters
  const applyFilters = (searchTerm, start, end, billType) => {
    let filtered = [...jobsData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.customerName?.toLowerCase().includes(searchTerm) ||
          job.carNumber?.toLowerCase().includes(searchTerm) ||
          job.jobId?.toLowerCase().includes(searchTerm) ||
          job.customerNumber?.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (start) {
      filtered = filtered.filter(
        (job) => new Date(job.completedAt || job.updatedAt) >= new Date(start)
      );
    }
    if (end) {
      filtered = filtered.filter(
        (job) =>
          new Date(job.completedAt || job.updatedAt) <=
          new Date(end + "T23:59:59")
      );
    }

    // Bill type filter (if implemented)
    if (billType && billType !== "All") {
      // This would need to be implemented based on your bill data structure
      // filtered = filtered.filter(job => job.billType === billType);
    }

    setFilteredJobsData(filtered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedJob(null);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setBillTypeFilter("All");
    // Re-sort the original data when clearing filters
    const sortedJobs = sortJobsByCompletedDate([...jobsData]);
    setFilteredJobsData(sortedJobs);
    setPage(0);
  };

  // Handle view bill button click
  const handleViewBill = (jobId) => {
    // Navigate to the billing page for the specific job
    navigate(`/billing/${jobId}`);
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredJobsData.slice(startIndex, endIndex);
  };

  // Calculate financial summary
  const financialSummary = financialData
    ? {
        totalJobs: financialData.summary.totalBills,
        totalRevenue: financialData.summary.totalRevenue,
        averageRevenue:
          financialData.summary.totalBills > 0
            ? financialData.summary.totalRevenue /
              financialData.summary.totalBills
            : 0,
        thisMonthJobs: financialData.currentMonth.jobs,
        thisMonthRevenue: financialData.currentMonth.revenue,
        grossProfit: financialData.summary.grossProfit,
        netProfit: financialData.summary.netProfit,
      }
    : {
        totalJobs: filteredJobsData.length,
        totalRevenue: filteredJobsData.reduce(
          (sum, job) => sum + (job.totalAmount || 0),
          0
        ),
        averageRevenue:
          filteredJobsData.length > 0
            ? filteredJobsData.reduce(
                (sum, job) => sum + (job.totalAmount || 0),
                0
              ) / filteredJobsData.length
            : 0,
        thisMonthJobs: filteredJobsData.filter((job) => {
          const jobDate = new Date(job.completedAt || job.updatedAt);
          const now = new Date();
          return (
            jobDate.getMonth() === now.getMonth() &&
            jobDate.getFullYear() === now.getFullYear()
          );
        }).length,
        thisMonthRevenue: filteredJobsData
          .filter((job) => {
            const jobDate = new Date(job.completedAt || job.updatedAt);
            const now = new Date();
            return (
              jobDate.getMonth() === now.getMonth() &&
              jobDate.getFullYear() === now.getFullYear()
            );
          })
          .reduce((sum, job) => sum + (job.totalAmount || 0), 0),
        grossProfit: 0,
        netProfit: 0,
      };

  return (
    <Box sx={{ flexGrow: 1, mb: 4, ml: { xs: 0, sm: 35 }, overflow: "auto" }}>
      <CssBaseline />
      <Container maxWidth="xl">
        {/* Header */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
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
                  <ArrowBackIcon />
                </IconButton>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    📊 Reports And Report
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                    Comprehensive reports for inventory and financial analysis
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    if (activeTab === 0) {
                      fetchFinancialData();
                    } else {
                      fetchInventoryData();
                    }
                  }}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  minHeight: 64,
                  fontSize: "1rem",
                  fontWeight: 500,
                },
              }}
            >
              <Tab
                icon={<ReceiptIcon />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>Financial Report</span>
                    <Badge
                      badgeContent={financialSummary.totalJobs}
                      color="primary"
                    />
                  </Box>
                }
                iconPosition="start"
              />
              <Tab
                icon={<InventoryIcon />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>Inventory Report</span>
                    {inventoryData && (
                      <Badge
                        badgeContent={inventoryData.summary?.lowStockCount || 0}
                        color="warning"
                      />
                    )}
                  </Box>
                }
                iconPosition="start"
              />
            </Tabs>
          </CardContent>
        </Card>

        {/* Financial Report Tab */}
        {activeTab === 0 && (
          <>
            {/* Financial Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                          color="primary"
                        >
                          {financialSummary.totalJobs}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Jobs
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "primary.light",
                          color: "white",
                        }}
                      >
                        <WorkIcon />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                          color="success.main"
                        >
                          {formatCurrency(financialSummary.totalRevenue)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Revenue
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "success.light",
                          color: "white",
                        }}
                      >
                        <TrendingUpIcon />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                          color="info.main"
                        >
                          {formatCurrency(financialSummary.averageRevenue)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Revenue
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "info.light",
                          color: "white",
                        }}
                      >
                        <TrendingUpIcon />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                          color="warning.main"
                        >
                          {formatCurrency(financialSummary.thisMonthRevenue)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This Month
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "warning.light",
                          color: "white",
                        }}
                      >
                        <CalendarTodayIcon />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Financial Data Actions */}
            <Card
              elevation={0}
              sx={{ mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Button
                    variant="contained"
                    onClick={fetchFinancialData}
                    disabled={financialLoading}
                    startIcon={
                      financialLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <RefreshIcon />
                      )
                    }
                  >
                    {financialLoading ? "Loading..." : "Load Financial Data"}
                  </Button>
                  {financialData && (
                    <Button
                      variant="outlined"
                      onClick={() => generateJobsPDF(filteredJobsData)}
                      startIcon={<FileDownloadIcon />}
                    >
                      Export PDF
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <Card
              elevation={0}
              sx={{ mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                      <InputLabel>Bill Type</InputLabel>
                      <Select
                        value={billTypeFilter}
                        onChange={handleBillTypeFilterChange}
                        label="Bill Type"
                      >
                        <MenuItem value="All">All Types</MenuItem>
                        <MenuItem value="GST">GST</MenuItem>
                        <MenuItem value="Non-GST">Non-GST</MenuItem>
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
                        startIcon={<FilterListIcon />}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => generateJobsPDF(filteredJobsData)}
                        startIcon={<FileDownloadIcon />}
                      >
                        Export PDF
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card
              elevation={0}
              sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
            >
              <CardContent sx={{ p: 0 }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell
                              sx={{ fontWeight: 600, color: "#475569" }}
                            >
                              Job ID
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, color: "#475569" }}
                            >
                              Customer
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, color: "#475569" }}
                            >
                              Vehicle
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, color: "#475569" }}
                            >
                              Amount
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, color: "#475569" }}
                            >
                              Completed Date
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, color: "#475569" }}
                            >
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getCurrentPageData().map((job) => (
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
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {job.customerNumber || "N/A"}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {job.carNumber ||
                                      job.registrationNumber ||
                                      "N/A"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {job.model || "N/A"}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  color="success.main"
                                >
                                  {formatCurrency(job.totalAmount || 0)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDate(job.completedAt || job.updatedAt)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewBill(job._id)}
                                  sx={{ color: "primary.main" }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      component="div"
                      count={filteredJobsData.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Inventory Report Tab */}
        {activeTab === 1 && (
          <>
            {/* Inventory Summary Cards */}
            {inventoryData && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                            color="primary"
                          >
                            {inventoryData?.summary?.totalParts || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Parts
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "primary.light",
                            color: "white",
                          }}
                        >
                          <InventoryIcon />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                            color="success.main"
                          >
                            {formatCurrency(
                              inventoryData?.summary?.totalSellingValue || 0
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Value
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "success.light",
                            color: "white",
                          }}
                        >
                          <TrendingUpIcon />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                            color="warning.main"
                          >
                            {inventoryData?.summary?.lowStockCount || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Low Stock
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "warning.light",
                            color: "white",
                          }}
                        >
                          <WarningIcon />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
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
                            color="error.main"
                          >
                            {inventoryData?.summary?.outOfStockCount || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Out of Stock
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "error.light",
                            color: "white",
                          }}
                        >
                          <CloseIcon />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Inventory Actions */}
            <Card
              elevation={0}
              sx={{ mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Button
                    variant="contained"
                    onClick={fetchInventoryData}
                    disabled={inventoryLoading}
                    startIcon={
                      inventoryLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <RefreshIcon />
                      )
                    }
                  >
                    {inventoryLoading ? "Loading..." : "Load Inventory Data"}
                  </Button>
                  {inventoryData && (
                    <Button
                      variant="outlined"
                      onClick={() => generateInventoryPDF(inventoryData)}
                      startIcon={<FileDownloadIcon />}
                    >
                      Export PDF
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Inventory Data */}
            {inventoryLoading ? (
              <Card
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <CircularProgress />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading inventory data...
                  </Typography>
                </CardContent>
              </Card>
            ) : inventoryData ? (
              <>
                {/* Low Stock Alert */}
                {inventoryData?.lowStockItems &&
                  inventoryData.lowStockItems.length > 0 && (
                    <Card
                      elevation={0}
                      sx={{
                        mb: 3,
                        borderRadius: 3,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="warning.main"
                          sx={{ mb: 2 }}
                        >
                          ⚠️ Low Stock Alert (
                          {inventoryData.lowStockItems.length} items)
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#fff3e0" }}>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Part Name
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Model
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Quantity
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Purchase Price
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Selling Price
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Status
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {inventoryData.lowStockItems.map(
                                (part, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        {part.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{part.model}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={part.quantity}
                                        color={
                                          part.quantity === 0
                                            ? "error"
                                            : "warning"
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(part.price)}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(part.price)}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={
                                          part.quantity === 0
                                            ? "Out of Stock"
                                            : "Low Stock"
                                        }
                                        color={
                                          part.quantity === 0
                                            ? "error"
                                            : "warning"
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  )}

                {/* All Parts Table */}
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      All Inventory Parts ({inventoryData.allItems?.length || 0}{" "}
                      items)
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Part Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Model
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Quantity
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Purchase Price
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Selling Price
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Total Value
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {inventoryData.allItems?.map((part, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {part.name}
                                </Typography>
                              </TableCell>
                              <TableCell>{part.model}</TableCell>
                              <TableCell>
                                <Chip
                                  label={part.quantity}
                                  color={
                                    part.quantity === 0
                                      ? "error"
                                      : part.quantity <= 3
                                      ? "warning"
                                      : "success"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {formatCurrency(part.price)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(part.price)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(part.totalSellingValue)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    part.quantity === 0
                                      ? "Out of Stock"
                                      : part.quantity <= 3
                                      ? "Low Stock"
                                      : "In Stock"
                                  }
                                  color={
                                    part.quantity === 0
                                      ? "error"
                                      : part.quantity <= 3
                                      ? "warning"
                                      : "success"
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    Click "Load Inventory Data" to view inventory report
                  </Typography>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Job Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">Job Details</Typography>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedJob && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedJob.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Job ID: {selectedJob.jobId}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Vehicle: {selectedJob.carNumber} - {selectedJob.model}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status: {selectedJob.status}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Job Details:
                </Typography>
                <Typography variant="body2">
                  {selectedJob.jobDetails || "No details available"}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
            {selectedJob && (
              <Button
                variant="contained"
                onClick={() => handleViewBill(selectedJob._id)}
              >
                View Bill
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default RecordReport;
