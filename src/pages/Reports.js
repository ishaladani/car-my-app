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

  // Calculate total amount for a job
  const calculateJobTotal = (job) => {
    let total = 0;

    // Add parts cost
    if (job.partsUsed && Array.isArray(job.partsUsed)) {
      total += job.partsUsed.reduce((sum, part) => {
        return sum + (part.totalPrice || 0);
      }, 0);
    }

    // Add labor services
    total += (job.laborServicesTotal || 0);
    total += (job.laborServicesTax || 0);
    total += (job.excessAmount || 0);

    return total;
  };

  // Enhanced job data processing
  const processJobData = (rawJobs) => {
    return rawJobs.map(job => ({
      ...job,
      totalAmount: calculateJobTotal(job),
      completedAt: job.updatedAt, // Use updatedAt as completedAt
      // Normalize status (handle both "completed" and "Completed")
      normalizedStatus: job.status?.toLowerCase() === 'completed'
    }));
  };

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
      job.carNumber || job.registrationNumber || "N/A",
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

    // Enhanced color scheme
    const colors = {
      primary: [41, 128, 185],      // Professional blue
      secondary: [52, 73, 94],      // Dark gray
      accent: [230, 126, 34],       // Orange
      success: [39, 174, 96],       // Green
      danger: [231, 76, 60],        // Red
      light: [236, 240, 241],       // Light gray
      white: [255, 255, 255]
    };

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

    // Helper function to add header
    const addHeader = () => {
      // Background header
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 210, 35, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text("INVENTORY REPORT", 20, 20);

      // Date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 20, 28);

      // Reset text color
      doc.setTextColor(0, 0, 0);
    };

    // Helper function to add footer
    const addFooter = (pageNum) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${pageNum}`, 20, pageHeight - 10);
      doc.text(`Generated by Inventory Management System`, 105, pageHeight - 10, { align: 'center' });
    };

    // Start with header
    addHeader();

    const summary = inventoryData?.summary || {};
    let yPos = 45;

    // Enhanced Summary Section with Cards Layout
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colors.secondary);
    doc.text("Executive Summary", 20, yPos);
    yPos += 5;

    // Add underline
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 70, yPos);
    yPos += 15;

    // Helper function to create a summary card
    const createSummaryCard = (x, y, width, height, title, value, bgColor) => {
      // Card background
      doc.setFillColor(...bgColor);
      doc.roundedRect(x, y, width, height, 2, 2, 'F');

      // Card border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, width, height, 2, 2, 'S');

      // Title
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(title, x + 4, y + 6);

      // Value
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(value.toString(), x + 4, y + height - 4);
    };

    // Card dimensions
    const cardWidth = 54;
    const cardHeight = 20;
    const cardSpacing = 2;
    const startX = 20;

    // Row 1 - Main metrics
    createSummaryCard(startX, yPos, cardWidth, cardHeight,
      'Total Parts', summary.totalParts || 0, [240, 248, 255]);

    createSummaryCard(startX + cardWidth + cardSpacing, yPos, cardWidth, cardHeight,
      'Available Quantity', summary.totalPartsAvailable || 0, [240, 255, 240]);

    createSummaryCard(startX + (cardWidth + cardSpacing) * 2, yPos, cardWidth, cardHeight,
      'Low Stock Items', summary.lowStockCount || 0, [255, 240, 240]);

    yPos += cardHeight + 8;

    // Row 2 - Financial metrics (wider cards)
    const wideCardWidth = 82;

    createSummaryCard(startX, yPos, wideCardWidth, cardHeight,
      'Purchase Value', formatCurrencyForPDF(summary.totalPurchaseValue), [250, 250, 250]);

    createSummaryCard(startX + wideCardWidth + cardSpacing, yPos, wideCardWidth, cardHeight,
      'Selling Value', formatCurrencyForPDF(summary.totalSellingValue), [255, 248, 230]);

    yPos += cardHeight + 8;

    // Row 3 - Profit and Out of Stock
    createSummaryCard(startX, yPos, wideCardWidth, cardHeight,
      'Potential Profit', formatCurrencyForPDF(summary.potentialProfit), [240, 255, 240]);

    createSummaryCard(startX + wideCardWidth + cardSpacing, yPos, wideCardWidth, cardHeight,
      'Out of Stock', summary.outOfStockCount || 0, [255, 235, 235]);

    yPos += cardHeight + 20;

    // Enhanced Low Stock Section
    if (inventoryData.lowStockItems?.length > 0) {
      // Check if we need a new page
      if (yPos > 200) {
        doc.addPage();
        addHeader();
        yPos = 45;
      }

      // Section header with warning styling
      doc.setFillColor(...colors.danger);
      doc.rect(20, yPos - 5, 170, 12, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("⚠ LOW STOCK ALERT", 25, yPos + 3);

      doc.setTextColor(0, 0, 0);
      yPos += 15;

      autoTable(doc, {
        head: [["Part Name", "Part Number", "Car/Model", "Qty", "Purchase Price", "Selling Price"]],
        body: inventoryData.lowStockItems.map((part) => [
          part.partName || part.name,
          part.partNumber || "N/A",
          `${part.carName || ""} ${part.model || ""}`.trim() || "N/A",
          part.quantity.toString(),
          formatCurrencyForPDF(part.purchasePrice || part.price || 0),
          formatCurrencyForPDF(part.sellingPrice || part.price || 0),
        ]),
        startY: yPos,
        theme: 'striped',
        styles: {
          fontSize: 9,
          cellPadding: 4,
          alternateRowStyles: { fillColor: [255, 249, 249] }
        },
        headStyles: {
          fillColor: colors.danger,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        columnStyles: {
          3: { halign: 'center', textColor: colors.danger, fontStyle: 'bold' },
          4: { halign: 'right' },
          5: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      });

      yPos = doc.lastAutoTable.finalY + 20;
    }

    // Enhanced All Items Section
    if (inventoryData.allItems?.length > 0) {
      // Add new page for all items
      doc.addPage();
      addHeader();
      yPos = 45;

      // Section header
      doc.setFillColor(...colors.primary);
      doc.rect(20, yPos - 5, 170, 12, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(" ALL INVENTORY ITEMS", 25, yPos + 3);

      doc.setTextColor(0, 0, 0);
      yPos += 15;

      // Calculate totals for the footer
      const totalPurchaseValue = inventoryData.allItems.reduce((sum, item) =>
        sum + (item.purchasePrice * item.quantity), 0);
      const totalSellingValue = inventoryData.allItems.reduce((sum, item) =>
        sum + (item.sellingPrice * item.quantity), 0);

      autoTable(doc, {
        head: [["Part Name", "Part No.", "Car/Model", "Qty", "Purchase ₹", "Selling ₹", "Total Value ₹"]],
        body: inventoryData.allItems.map((part) => [
          part.name,
          part.partNumber || "N/A",
          `${part.carName || ""} ${part.model || ""}`.trim() || "N/A",
          part.quantity.toString(),
          formatCurrencyForPDF(part.purchasePrice),
          formatCurrencyForPDF(part.sellingPrice),
          formatCurrencyForPDF(part.totalSellingValue || (part.sellingPrice * part.quantity)),
        ]),
        foot: [["", "", "", "TOTALS:",
          formatCurrencyForPDF(totalPurchaseValue),
          formatCurrencyForPDF(totalSellingValue),
          formatCurrencyForPDF(totalSellingValue)]],
        startY: yPos,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          alternateRowStyles: { fillColor: [249, 249, 249] }
        },
        headStyles: {
          fillColor: colors.primary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        footStyles: {
          fillColor: colors.secondary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        columnStyles: {
          3: { halign: 'center' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 },
        showFoot: true
      });
    }

    // Add footers to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    // Enhanced filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    doc.save(`inventory-report-${timestamp}.pdf`);
  };

  // Auto-load inventory data when inventory tab is selected
  useEffect(() => {
    if (activeTab === 1 && !inventoryData && garageId && token) {
      fetchInventoryData();
    }
  }, [activeTab, garageId, token, inventoryData]);
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

        // Process job data to calculate totals and normalize fields
        const processedJobs = processJobData(jobsData);

        // Filter: Only jobs where status is "Completed" (case-insensitive) AND bill is approved
        const completedJobs = processedJobs.filter(
          (job) => job.normalizedStatus && job.qualityCheck?.billApproved === true
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
              sum + (item.quantity || 0) * (item.sellingPrice || 0),
            0
          ),
          totalPurchaseValue: inventoryArray.reduce(
            (sum, item) =>
              sum + (item.quantity || 0) * (item.purchasePrice || 0),
            0
          ),
          potentialProfit: inventoryArray.reduce(
            (sum, item) =>
              sum +
              (item.quantity || 0) *
              ((item.sellingPrice || 0) - (item.purchasePrice || 0)),
            0
          ),
          lowStockCount: inventoryArray.filter(
            (item) => (item.quantity || 0) <= 10
          ).length,
          outOfStockCount: inventoryArray.filter(
            (item) => (item.quantity || 0) === 0
          ).length,
        },
        totalItems: inventoryArray.length,
        totalValue: inventoryArray.reduce(
          (sum, item) =>
            sum + (item.quantity || 0) * (item.sellingPrice || 0),
          0
        ),
        lowStockItems: inventoryArray.filter(
          (item) => (item.quantity || 0) <= 10
        ),
        allItems: inventoryArray.map((item) => ({
          id: item._id,
          name: item.partName,
          partNumber: item.partNumber,
          quantity: item.quantity || 0,
          purchasePrice: item.purchasePrice || 0,
          sellingPrice: item.sellingPrice || 0,
          carName: item.carName || "",
          model: item.model || "",
          hsnNumber: item.hsnNumber || "",
          taxAmount: item.taxAmount || 0,
          igst: item.igst || 0,
          cgstSgst: item.cgstSgst || 0,
          totalSellingValue: (item.quantity || 0) * (item.sellingPrice || 0),
          totalPurchaseValue: (item.quantity || 0) * (item.purchasePrice || 0),
          profit: (item.quantity || 0) * ((item.sellingPrice || 0) - (item.purchasePrice || 0))
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
          job.registrationNumber?.toLowerCase().includes(searchTerm) ||
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
    <Box sx={{ 
      flexGrow: 1, 
      mb: 4, 
      ml: { xs: 0, sm: 35 }, 
      overflow: "auto",
      px: { xs: 1, sm: 0 } // Add horizontal padding for mobile
    }}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 3 } }}>
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
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: "space-between",
                gap: { xs: 2, sm: 0 }
              }}
            >
              <Box sx={{ 
                display: "flex", 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: "wrap",
                gap: { xs: 1, sm: 0 }
              }}>
                <IconButton
                  onClick={() => navigate("/")}
                  sx={{
                    mr: { xs: 0, sm: 2 },
                    mb: { xs: 1, sm: 0 },
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                    alignSelf: { xs: 'flex-start', sm: 'center' }
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                </IconButton>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' },
                      lineHeight: 1.2,
                      wordBreak: 'break-word'
                    }}
                  >
                    📊 Reports And Analytics
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 0.5, 
                      opacity: 0.9, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                      lineHeight: 1.3,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    Comprehensive reports for inventory and financial analysis
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                display: "flex", 
                gap: 1, 
                width: { xs: '100%', sm: 'auto' }, 
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                mt: { xs: 1, sm: 0 }
              }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
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
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: '36px', sm: '40px' },
                    px: { xs: 2, sm: 3 }
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
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  minHeight: { xs: 56, sm: 64 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                  fontWeight: 500,
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1, sm: 1.5 },
                  textTransform: 'none',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: '120px', sm: '160px' }
                },
                "& .MuiTabs-scrollButtons": {
                  "&.Mui-disabled": {
                    opacity: 0.3,
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }
                },
                "& .MuiTabs-indicator": {
                  height: { xs: 3, sm: 4 },
                  borderRadius: { xs: '2px 2px 0 0', sm: '2px 2px 0 0' }
                }
              }}
            >
              <Tab
                icon={<ReceiptIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                label={
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: { xs: 0.5, sm: 1 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    position: 'relative'
                  }}>
                    <span style={{ 
                      fontSize: 'inherit',
                      textAlign: 'center',
                      lineHeight: 1.2
                    }}>
                      Financial Report
                    </span>
                    <Badge
                      sx={{
                        position: 'absolute',
                        top: { xs: -2, sm: -8 },
                        right: { xs: -8, sm: -12 },
                        fontSize: { xs: '0.6rem', sm: '0.75rem' },
                        minWidth: { xs: '16px', sm: '20px' },
                        height: { xs: '16px', sm: '20px' }
                      }}
                      badgeContent={financialSummary.totalJobs}
                      color="primary"
                    />
                  </Box>
                }
                iconPosition="top"
              />
              <Tab
                icon={<InventoryIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                label={
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: { xs: 0.5, sm: 1 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    position: 'relative'
                  }}>
                    <span style={{ 
                      fontSize: 'inherit',
                      textAlign: 'center',
                      lineHeight: 1.2
                    }}>
                      Inventory Report
                    </span>
                    {inventoryData && (
                      <Badge
                        sx={{
                          position: 'absolute',
                          top: { xs: -2, sm: -8 },
                          right: { xs: -8, sm: -12 },
                          fontSize: { xs: '0.6rem', sm: '0.75rem' },
                          minWidth: { xs: '16px', sm: '20px' },
                          height: { xs: '16px', sm: '20px' }
                        }}
                        badgeContent={inventoryData.summary?.lowStockCount || 0}
                        color="warning"
                      />
                    )}
                  </Box>
                }
                iconPosition="top"
              />
            </Tabs>
          </CardContent>
        </Card>

        {/* Financial Report Tab */}
        {activeTab === 0 && (
          <>
            {/* Financial Summary Cards */}
            <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: '100%' }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%' }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: "space-between",
                        height: '100%',
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="primary"
                          sx={{ 
                            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
                            lineHeight: 1.2,
                            wordBreak: 'break-word'
                          }}
                        >
                          {financialSummary.totalJobs}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                            lineHeight: 1.2,
                            mt: 0.5
                          }}
                        >
                          Total Jobs
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: { xs: 1, sm: 1.5, md: 2 },
                          borderRadius: 2,
                          bgcolor: "primary.light",
                          color: "white",
                          flexShrink: 0
                        }}
                      >
                        <WorkIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: '100%' }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%' }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: "space-between",
                        height: '100%',
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="success.main"
                          sx={{ 
                            fontSize: { xs: '1rem', sm: '1.3rem', md: '1.8rem' },
                            lineHeight: 1.2,
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {formatCurrency(financialSummary.totalRevenue)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                            lineHeight: 1.2,
                            mt: 0.5
                          }}
                        >
                          Total Revenue
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: { xs: 1, sm: 1.5, md: 2 },
                          borderRadius: 2,
                          bgcolor: "success.light",
                          color: "white",
                          flexShrink: 0
                        }}
                      >
                        <TrendingUpIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: '100%' }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%' }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: "space-between",
                        height: '100%',
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="info.main"
                          sx={{ 
                            fontSize: { xs: '1rem', sm: '1.3rem', md: '1.8rem' },
                            lineHeight: 1.2,
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {formatCurrency(financialSummary.averageRevenue)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                            lineHeight: 1.2,
                            mt: 0.5
                          }}
                        >
                          Average Revenue
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: { xs: 1, sm: 1.5, md: 2 },
                          borderRadius: 2,
                          bgcolor: "info.light",
                          color: "white",
                          flexShrink: 0
                        }}
                      >
                        <TrendingUpIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: '100%' }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%' }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: "space-between",
                        height: '100%',
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="warning.main"
                          sx={{ 
                            fontSize: { xs: '1rem', sm: '1.3rem', md: '1.8rem' },
                            lineHeight: 1.2,
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {formatCurrency(financialSummary.thisMonthRevenue)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                            lineHeight: 1.2,
                            mt: 0.5
                          }}
                        >
                          This Month
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: { xs: 1, sm: 1.5, md: 2 },
                          borderRadius: 2,
                          bgcolor: "warning.light",
                          color: "white",
                          flexShrink: 0
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Search and Filters */}
            <Card
              elevation={0}
              sx={{ mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      placeholder="Search jobs..."
                      value={search}
                      onChange={handleSearch}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Bill Type</InputLabel>
                      <Select
                        value={billTypeFilter}
                        onChange={handleBillTypeFilterChange}
                        label="Bill Type"
                        sx={{
                          '& .MuiSelect-select': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }
                        }}
                      >
                        <MenuItem value="All" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Types</MenuItem>
                        <MenuItem value="GST" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>GST</MenuItem>
                        <MenuItem value="Non-GST" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Non-GST</MenuItem>
                      </Select>
                    </FormControl>
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
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
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
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={3}>
                    <Box sx={{ 
                      display: "flex", 
                      gap: { xs: 1, sm: 1.5 }, 
                      flexDirection: { xs: 'row', sm: 'row' },
                      justifyContent: { xs: 'stretch', sm: 'flex-end' }
                    }}>
                      <Button
                        variant="outlined"
                        onClick={handleClearFilters}
                        startIcon={<FilterListIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                        size="small"
                        fullWidth={{ xs: true, sm: false }}
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          minHeight: { xs: '36px', sm: '40px' }
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => generateJobsPDF(filteredJobsData)}
                        startIcon={<FileDownloadIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                        size="small"
                        fullWidth={{ xs: true, sm: false }}
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          minHeight: { xs: '36px', sm: '40px' }
                        }}
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
                    <TableContainer
                      sx={{
                        overflowX: 'auto',
                        maxHeight: { xs: '70vh', sm: '80vh' },
                        '&::-webkit-scrollbar': {
                          height: '8px',
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: theme.palette.primary.main,
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          }
                        },
                      }}
                    >
                      <Table sx={{ minWidth: { xs: 800, sm: 900, md: 1000 } }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell
                              sx={{ 
                                fontWeight: 600, 
                                color: "#475569",
                                minWidth: { xs: '90px', sm: '110px', md: '120px' },
                                maxWidth: { xs: '120px', sm: '140px', md: '150px' },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              Job ID
                            </TableCell>
                            <TableCell
                              sx={{ 
                                fontWeight: 600, 
                                color: "#475569",
                                minWidth: { xs: '130px', sm: '160px', md: '180px' },
                                maxWidth: { xs: '150px', sm: '180px', md: '200px' },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              Customer
                            </TableCell>
                            <TableCell
                              sx={{ 
                                fontWeight: 600, 
                                color: "#475569",
                                minWidth: { xs: '110px', sm: '130px', md: '140px' },
                                maxWidth: { xs: '130px', sm: '150px', md: '160px' },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              Vehicle
                            </TableCell>
                            <TableCell
                              sx={{ 
                                fontWeight: 600, 
                                color: "#475569",
                                minWidth: { xs: '110px', sm: '130px', md: '140px' },
                                maxWidth: { xs: '130px', sm: '150px', md: '160px' },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                textAlign: 'right'
                              }}
                            >
                              Amount
                            </TableCell>
                            <TableCell
                              sx={{ 
                                fontWeight: 600, 
                                color: "#475569",
                                minWidth: { xs: '130px', sm: '160px', md: '180px' },
                                maxWidth: { xs: '150px', sm: '180px', md: '200px' },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              Completed Date
                            </TableCell>
                            <TableCell
                              sx={{ 
                                fontWeight: 600, 
                                color: "#475569",
                                minWidth: { xs: '90px', sm: '110px', md: '120px' },
                                maxWidth: { xs: '110px', sm: '130px', md: '140px' },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                textAlign: 'center'
                              }}
                            >
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getCurrentPageData().map((job) => (
                            <TableRow key={job._id} hover>
                              <TableCell 
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  maxWidth: { xs: '120px', sm: '140px', md: '150px' },
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  fontWeight={500} 
                                  sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                  title={job.jobId || "N/A"}
                                >
                                  {job.jobId || "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell 
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  maxWidth: { xs: '150px', sm: '180px', md: '200px' }
                                }}
                              >
                                <Box>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={500} 
                                    sx={{ 
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={job.customerName || "N/A"}
                                  >
                                    {job.customerName || "N/A"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ 
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block'
                                    }}
                                    title={job.contactNumber || "N/A"}
                                  >
                                    {job.contactNumber || "N/A"}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell 
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  maxWidth: { xs: '130px', sm: '150px', md: '160px' }
                                }}
                              >
                                <Box>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={500} 
                                    sx={{ 
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={job.carNumber || job.registrationNumber || "N/A"}
                                  >
                                    {job.carNumber ||
                                      job.registrationNumber ||
                                      "N/A"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ 
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block'
                                    }}
                                    title={job.model || "N/A"}
                                  >
                                    {job.model || "N/A"}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell 
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  maxWidth: { xs: '130px', sm: '150px', md: '160px' },
                                  textAlign: 'right'
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  color="success.main"
                                  sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={formatCurrency(job.totalAmount || 0)}
                                >
                                  {formatCurrency(job.totalAmount || 0)}
                                </Typography>
                              </TableCell>
                              <TableCell 
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  maxWidth: { xs: '150px', sm: '180px', md: '200px' }
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={formatDate(job.completedAt || job.updatedAt)}
                                >
                                  {formatDate(job.completedAt || job.updatedAt)}
                                </Typography>
                              </TableCell>
                              <TableCell 
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  maxWidth: { xs: '110px', sm: '130px', md: '140px' },
                                  textAlign: 'center'
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewBill(job._id)}
                                  sx={{ 
                                    color: "primary.main",
                                    '& .MuiSvgIcon-root': {
                                      fontSize: { xs: '1rem', sm: '1.25rem' }
                                    }
                                  }}
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
                      sx={{ 
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
              </CardContent>
            </Card>
          </>
        )}

        {/* Inventory Report Tab */}
        {activeTab === 1 && (
          <>
            {/* Inventory Summary Cards */}
            {inventoryData && (
              <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: '100%' }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%' }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: "space-between",
                          height: '100%',
                          gap: { xs: 1, sm: 0 }
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="primary"
                            sx={{ 
                              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word'
                            }}
                          >
                            {inventoryData?.summary?.totalParts || 0}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                              lineHeight: 1.2,
                              mt: 0.5
                            }}
                          >
                            Total Parts
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: "primary.light",
                            color: "white",
                            flexShrink: 0
                          }}
                        >
                          <InventoryIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: '100%' }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%' }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: "space-between",
                          height: '100%',
                          gap: { xs: 1, sm: 0 }
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="success.main"
                            sx={{ 
                              fontSize: { xs: '1rem', sm: '1.3rem', md: '1.8rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {formatCurrency(
                              inventoryData?.summary?.totalSellingValue || 0
                            )}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                              lineHeight: 1.2,
                              mt: 0.5
                            }}
                          >
                            Total Value
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: "success.light",
                            color: "white",
                            flexShrink: 0
                          }}
                        >
                          <TrendingUpIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: '100%' }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%' }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: "space-between",
                          height: '100%',
                          gap: { xs: 1, sm: 0 }
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="warning.main"
                            sx={{ 
                              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word'
                            }}
                          >
                            {inventoryData?.summary?.lowStockCount || 0}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                              lineHeight: 1.2,
                              mt: 0.5
                            }}
                          >
                            Low Stock
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: "warning.light",
                            color: "white",
                            flexShrink: 0
                          }}
                        >
                          <WarningIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: '100%' }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 3 }, height: '100%' }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: "space-between",
                          height: '100%',
                          gap: { xs: 1, sm: 0 }
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="error.main"
                            sx={{ 
                              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word'
                            }}
                          >
                            {inventoryData?.summary?.outOfStockCount || 0}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                              lineHeight: 1.2,
                              mt: 0.5
                            }}
                          >
                            Out of Stock
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: "error.light",
                            color: "white",
                            flexShrink: 0
                          }}
                        >
                          <CloseIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }} />
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
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2, 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  justifyContent: "space-between" 
                }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Inventory Management
                  </Typography>
                  <Box sx={{ 
                    display: "flex", 
                    gap: 2, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <Button
                      variant="outlined"
                      onClick={fetchInventoryData}
                      disabled={inventoryLoading}
                      startIcon={
                        inventoryLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <RefreshIcon />
                        )
                      }
                      size="small"
                      fullWidth={false}
                    >
                      {inventoryLoading ? "Loading..." : "Refresh Data"}
                    </Button>
                    {inventoryData && (
                      <Button
                        variant="contained"
                        onClick={() => generateInventoryPDF(inventoryData)}
                        startIcon={<FileDownloadIcon />}
                        size="small"
                        fullWidth={false}
                      >
                        Export PDF
                      </Button>
                    )}
                  </Box>
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
                                  Part Number
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Car/Model
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
                                        {part.partName}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{part.partNumber || "N/A"}</TableCell>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                          {part.carName || "N/A"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {part.model || "N/A"}
                                        </Typography>
                                      </Box>
                                    </TableCell>
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
                                      {formatCurrency(part.purchasePrice)}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(part.sellingPrice)}
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
                              Unit Price
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
                                {formatCurrency(part.quantity * part.price)}
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