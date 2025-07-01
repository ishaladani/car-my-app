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
  DialogContentText,
  DialogActions,
  TablePagination,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Work as WorkIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ADD THESE NEW IMPORTS FOR PDF FUNCTIONALITY
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Enhanced PDF Generator Modal Component
const PDFGeneratorModal = ({ open, onClose, jobData }) => {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

  // Parse job details helper
  const parseJobDetails = (jobDetails) => {
    if (!jobDetails) return null;
    
    try {
      const parsed = JSON.parse(jobDetails);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing job details:', error);
      return [{ description: jobDetails, price: 'N/A' }];
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate total from job details
  const calculateJobDetailsTotal = (jobDetails) => {
    const parsedDetails = parseJobDetails(jobDetails);
    if (!parsedDetails) return 0;
    
    return parsedDetails.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + price;
    }, 0);
  };

  // Calculate parts total
  const calculatePartsTotal = (partsUsed) => {
    if (!partsUsed || !Array.isArray(partsUsed)) return 0;
    
    return partsUsed.reduce((total, part) => {
      return total + (part.totalPrice || 0);
    }, 0);
  };

  // Method 1: Generate PDF using jsPDF (Recommended)
  const generatePDFWithJsPDF = async () => {
    try {
      setIsGenerating(true);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(25, 118, 210); // Primary blue color
      pdf.text('Garage Management System', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Job Card & Service Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Job Information Section
      pdf.setFontSize(14);
      pdf.setTextColor(25, 118, 210);
      pdf.text('Job Information', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const jobInfo = [
        [`Job ID: ${jobData?._id?.slice(-8) || 'N/A'}`, `Vehicle: ${jobData?.carNumber || jobData?.registrationNumber || 'N/A'}`],
        [`Customer: ${jobData?.customerName || 'N/A'}`, `Contact: ${jobData?.contactNumber || jobData?.phone || 'N/A'}`],
        [`Model: ${jobData?.model || 'N/A'}`, `Fuel: ${jobData?.fuelType || 'N/A'}`],
        [`Kilometers: ${jobData?.kilometer || 'N/A'} km`, `Status: ${jobData?.status || 'Unknown'}`]
      ];
      
      jobInfo.forEach(([left, right]) => {
        pdf.text(left, 20, yPosition);
        pdf.text(right, pageWidth / 2 + 10, yPosition);
        yPosition += 7;
      });
      
      yPosition += 10;
      
      // Service Details Section
      pdf.setFontSize(14);
      pdf.setTextColor(25, 118, 210);
      pdf.text('Service Details', 20, yPosition);
      yPosition += 10;
      
      const parsedDetails = parseJobDetails(jobData?.jobDetails);
      if (parsedDetails) {
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        // Table headers
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.setFillColor(25, 118, 210);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.text('S.No.', 25, yPosition + 5);
        pdf.text('Service Description', 45, yPosition + 5);
        pdf.text('Amount (₹)', pageWidth - 40, yPosition + 5);
        yPosition += 10;
        
        // Table content
        pdf.setTextColor(0, 0, 0);
        parsedDetails.forEach((item, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFillColor(index % 2 === 0 ? 245 : 255, 245, 245);
          pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
          
          pdf.text(`${index + 1}`, 25, yPosition + 5);
          pdf.text(item.description || 'N/A', 45, yPosition + 5);
          pdf.text(`₹${item.price || 'N/A'}`, pageWidth - 40, yPosition + 5);
          yPosition += 8;
        });
        
        // Total
        const total = calculateJobDetailsTotal(jobData?.jobDetails);
        pdf.setFillColor(227, 242, 253);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.setFontSize(10);
        pdf.text('Service Total:', pageWidth / 2, yPosition + 5);
        pdf.text(`₹${total.toFixed(2)}`, pageWidth - 40, yPosition + 5);
        yPosition += 15;
      }
      
      // Parts Used Section (if applicable)
      if (jobData?.partsUsed && jobData.partsUsed.length > 0) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(25, 118, 210);
        pdf.text('Parts Used', 20, yPosition);
        yPosition += 10;
        
        // Parts table headers
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.setFillColor(25, 118, 210);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.text('S.No.', 25, yPosition + 5);
        pdf.text('Part Name', 45, yPosition + 5);
        pdf.text('Qty', pageWidth - 60, yPosition + 5);
        pdf.text('Amount (₹)', pageWidth - 40, yPosition + 5);
        yPosition += 10;
        
        // Parts table content
        pdf.setTextColor(0, 0, 0);
        jobData.partsUsed.forEach((part, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFillColor(index % 2 === 0 ? 245 : 255, 245, 245);
          pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
          
          pdf.text(`${index + 1}`, 25, yPosition + 5);
          pdf.text(part.partName || 'N/A', 45, yPosition + 5);
          pdf.text(`${part.quantity || 'N/A'}`, pageWidth - 60, yPosition + 5);
          pdf.text(`₹${part.totalPrice?.toFixed(2) || '0.00'}`, pageWidth - 40, yPosition + 5);
          yPosition += 8;
        });
        
        // Parts total
        const partsTotal = calculatePartsTotal(jobData.partsUsed);
        pdf.setFillColor(227, 242, 253);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.setFontSize(10);
        pdf.text('Parts Total:', pageWidth / 2, yPosition + 5);
        pdf.text(`₹${partsTotal.toFixed(2)}`, pageWidth - 40, yPosition + 5);
        yPosition += 15;
      }
      
      // Summary Section
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(25, 118, 210);
      pdf.text('Work Summary', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const summaryInfo = [
        [`Created Date: ${formatDate(jobData?.createdAt)}`, `Completed Date: ${formatDate(jobData?.completedAt || jobData?.updatedAt)}`],
        [`Labor Hours: ${jobData?.laborHours || 'N/A'} hours`, `Total Cost: ₹${(calculateJobDetailsTotal(jobData?.jobDetails) + calculatePartsTotal(jobData?.partsUsed)).toFixed(2)}`]
      ];
      
      summaryInfo.forEach(([left, right]) => {
        pdf.text(left, 20, yPosition);
        pdf.text(right, pageWidth / 2 + 10, yPosition);
        yPosition += 7;
      });
      
      // Engineers Section
      if (jobData?.engineerId && jobData.engineerId.length > 0) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setTextColor(25, 118, 210);
        pdf.text('Assigned Engineers', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        const engineers = jobData.engineerId.map(engineer => engineer.name || engineer.username || 'Unknown').join(', ');
        pdf.text(engineers, 20, yPosition);
        yPosition += 15;
      }
      
      // Signature Section
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      yPosition += 20;
      pdf.setFontSize(12);
      pdf.text('Customer Signature', 40, yPosition);
      pdf.text('Service Manager Signature', pageWidth - 80, yPosition);
      
      pdf.line(20, yPosition - 5, 80, yPosition - 5); // Customer signature line
      pdf.line(pageWidth - 100, yPosition - 5, pageWidth - 20, yPosition - 5); // Manager signature line
      
      // Footer
      yPosition += 20;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, pageWidth / 2, yPosition, { align: 'center' });
      pdf.text('This is a computer-generated document.', pageWidth / 2, yPosition + 5, { align: 'center' });
      
      // Download the PDF
      const fileName = `JobCard_${jobData?.carNumber || jobData?.registrationNumber || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setIsGenerating(false);
      onClose();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Method 2: Browser's native print to PDF (Fallback)
  const generatePDFWithPrint = () => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Job Card - ${jobData?.carNumber || 'N/A'}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #1976d2;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #1976d2;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 20px;
              color: #666;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1976d2;
              margin-bottom: 15px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dotted #ccc;
            }
            .info-label {
              font-weight: 600;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .job-details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .job-details-table th,
            .job-details-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .job-details-table th {
              background-color: #1976d2;
              color: white;
              font-weight: 600;
            }
            .job-details-table tr:nth-child(even) {
              background-color: #f5f5f5;
            }
            .total-row {
              font-weight: bold;
              background-color: #e3f2fd !important;
            }
            .signature-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 50px;
            }
            .signature-box {
              text-align: center;
              border-top: 2px solid #333;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Garage Management System</div>
            <div class="document-title">Job Card & Service Report</div>
          </div>

          <div class="section">
            <div class="section-title">Job Information</div>
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <span class="info-label">Job ID:</span>
                  <span class="info-value">${jobData?._id?.slice(-8) || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Vehicle Number:</span>
                  <span class="info-value">${jobData?.carNumber || jobData?.registrationNumber || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Customer Name:</span>
                  <span class="info-value">${jobData?.customerName || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Contact Number:</span>
                  <span class="info-value">${jobData?.contactNumber || jobData?.phone || 'N/A'}</span>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <span class="info-label">Vehicle Model:</span>
                  <span class="info-value">${jobData?.model || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Fuel Type:</span>
                  <span class="info-value">${jobData?.fuelType || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Kilometers:</span>
                  <span class="info-value">${jobData?.kilometer || 'N/A'} km</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span>
                  <span class="info-value">${jobData?.status || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="no-print" style="margin: 20px 0; text-align: center; background: #f0f0f0; padding: 15px; border-radius: 5px;">
            <p><strong>To save as PDF:</strong> Use Ctrl+P (Windows) or Cmd+P (Mac), then select "Save as PDF" as the destination.</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Print / Save as PDF</button>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!jobData) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Generate Job Card PDF</Typography>
        <IconButton
          color="inherit"
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 1 }}
          disabled={isGenerating}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Job Card Preview
          </Typography>
          
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Vehicle: {jobData.carNumber || jobData.registrationNumber || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer: {jobData.customerName || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Job ID: {jobData._id?.slice(-8) || 'N/A'}
            </Typography>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose your preferred method to generate the PDF:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generatePDFWithJsPDF}
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={20} /> : <FileDownloadIcon />}
              size="large"
              fullWidth
            >
              {isGenerating ? 'Generating PDF...' : 'Download PDF (Recommended)'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={generatePDFWithPrint}
              disabled={isGenerating}
              startIcon={<PrintIcon />}
              size="large"
              fullWidth
            >
              Print / Save as PDF (Browser)
            </Button>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          size="large"
          disabled={isGenerating}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Job Details Display Component (Keep existing)
const JobDetailsDisplay = ({ jobDetails, variant = 'table', theme }) => {
  const parseJobDetails = (jobDetails) => {
    if (!jobDetails) return null;
    
    try {
      const parsed = JSON.parse(jobDetails);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing job details:', error);
      return [{ description: jobDetails, price: 'N/A' }];
    }
  };

  const parsedDetails = parseJobDetails(jobDetails);
  
  if (!parsedDetails) {
    return (
      <Typography variant="body2" color="text.secondary">
        {jobDetails || 'No job details available'}
      </Typography>
    );
  }

  if (variant === 'table') {
    return (
      <Box>
        {parsedDetails.map((item, index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {item.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ₹{item.price || 'N/A'}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'detailed') {
    return (
      <Box>
        {parsedDetails.map((item, index) => (
          <Box 
            key={index} 
            sx={{ 
              mb: 2, 
              p: 2, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              '&:last-child': { mb: 0 }
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {item.description}
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.success.main 
                  }}
                >
                  ₹{item.price || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
        
        {/* Total calculation if multiple items */}
        {parsedDetails.length > 1 && (
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: `2px solid ${theme.palette.primary.main}` 
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Service Cost:
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.success.main 
                  }}
                >
                  ₹{parsedDetails.reduce((total, item) => {
                    const price = parseFloat(item.price) || 0;
                    return total + price;
                  }, 0)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

// Main RecordReport Component (Keep the rest of your existing code)
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
  const [selectedJobData, setSelectedJobData] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  
  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Keep all your existing functions (parseJobDetails, useEffect, handleSearch, etc.)
  // Just add this modification to the handleDownloadPDF function:

  // Handle PDF download - UPDATED FUNCTION
  const handleDownloadPDF = (job) => {
    setSelectedJobData(job);
    setPdfModalOpen(true);
  };

  // Keep all your other existing functions and JSX exactly the same...
  // [All your existing code from parseJobDetails through the return statement]

  // Parse job details helper
  const parseJobDetails = (jobDetails) => {
    if (!jobDetails) return null;
    
    try {
      const parsed = JSON.parse(jobDetails);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing job details:', error);
      return [{ description: jobDetails, price: 'N/A' }];
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

        const response = await fetch(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/garage/${garageId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Jobs API response:", data);

        // Process the response
        const jobsData = Array.isArray(data)
          ? data
          : data.jobCards
          ? data.jobCards
          : data.data
          ? data.data
          : [];

        // Filter only completed jobs
        const completedJobs = jobsData.filter(job => job.status === "Completed");
        
        setJobsData(completedJobs);
        setFilteredData(completedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError(`Failed to load jobs data: ${error.message}`);
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

    // Apply search filter
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

    // Apply status filter
    if (status && status !== 'All') {
      filtered = filtered.filter(job => job.status === status);
    }

    // Apply date range filter
    if (start && end) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.createdAt);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return jobDate >= startDate && jobDate <= endDate;
      });
    }

    setFilteredData(filtered);
    setPage(0); // Reset to first page when filters change
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      const response = await axios.get(`https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`); 
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto'
    }}>
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
                  startIcon={<FilterListIcon />}
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
                    overflow: 'hidden'
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
                            <TableRow 
                              key={job._id || index}
                              sx={{ 
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.05)' 
                                  : 'rgba(84, 110, 122, 0.05)',
                                '&:nth-of-type(odd)': {
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.1)' 
                                    : 'rgba(84, 110, 122, 0.1)',
                                },
                                '&:hover': {
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.15)' 
                                    : 'rgba(84, 110, 122, 0.15)',
                                },
                              }}
                            >
                              <TableCell>{job._id?.slice(-6) || 'N/A'}</TableCell>
                              <TableCell>{job.carNumber || job.registrationNumber || 'N/A'}</TableCell>
                              <TableCell>{job.customerName || 'N/A'}</TableCell>
                              <TableCell>
                                <JobDetailsDisplay jobDetails={job.jobDetails} variant="table" theme={theme} />
                              </TableCell>
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
                                    sx={{ alignSelf: 'center' }}
                                  >
                                    Job Card
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleUpdate(job._id)}
                                    sx={{ 
                                      textTransform: 'none',
                                      borderRadius: 1,
                                      minWidth: '70px'
                                    }}
                                  >
                                    Update
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleViewClick(job)}
                                    sx={{ 
                                      textTransform: 'none',
                                      borderRadius: 1,
                                      minWidth: '70px'
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
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          p: 3
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Job Card Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedJob?.carNumber || selectedJob?.registrationNumber || 'Vehicle Information'}
              </Typography>
            </Box>
            <IconButton 
              onClick={handleCloseDialog}
              sx={{ 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
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
                  
                  {/* Job Details Section */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        Job Details & Services
                      </Typography>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                        <JobDetailsDisplay jobDetails={selectedJob.jobDetails} variant="detailed" theme={theme} />
                      </Paper>
                    </Box>
                  </Grid>
                  
                  {/* Engineer Information */}
                  {selectedJob.engineerId && selectedJob.engineerId.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Assigned Engineers
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {selectedJob.engineerId.map((engineer, index) => (
                            <Chip
                              key={index}
                              label={engineer.name || engineer.username || `Engineer ${index + 1}`}
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                  )}

                  {/* Parts Used */}
                  {selectedJob.partsUsed && selectedJob.partsUsed.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                          Parts Used
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Part Name</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell align="right">Price</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedJob.partsUsed.map((part, index) => (
                                <TableRow key={index}>
                                  <TableCell>{part.partName || part.name || 'N/A'}</TableCell>
                                  <TableCell>{part.quantity || 'N/A'}</TableCell>
                                  <TableCell align="right">₹{part.totalPrice?.toLocaleString() || 'N/A'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Grid>
                  )}
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

      {/* PDF Generator Modal */}
      <PDFGeneratorModal 
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        jobData={selectedJobData}
      />
    </Box>
  );
};

export default RecordReport;