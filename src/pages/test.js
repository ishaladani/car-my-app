import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Card,
  CardContent,
  Avatar,
  IconButton,
  useTheme,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Security as InsuranceIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const JobDetailsModal = ({ open, onClose, jobData }) => {
  const theme = useTheme();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!jobData) return null;

  // Base URL for accessing uploaded files
  const BASE_URL = 'https://garage-management-zi5z.onrender.com'; 

  // Helper to convert local image path to public URL
  const getPublicImageUrl = (filePath) => {
    if (!filePath) return '';
    const filename = filePath.split('/').pop(); // Extract filename from full path
    return `${BASE_URL}/uploads/${filename}`;
  };

  // Status chip based on job status
  const getStatusChip = (status) => {
    const normalizedStatus = status || "Pending";
    switch (normalizedStatus) {
      case "Completed":
        return (
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label={normalizedStatus}
            size="small"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        );
      case "In Progress":
        return (
          <Chip
            icon={<WarningIcon fontSize="small" />}
            label={normalizedStatus}
            size="small"
            color="warning"
            sx={{ fontWeight: 600 }}
          />
        );
      case "Pending":
        return (
          <Chip
            icon={<CalendarIcon fontSize="small" />}
            label={normalizedStatus}
            size="small"
            color="info"
            sx={{ fontWeight: 600 }}
          />
        );
      default:
        return (
          <Chip
            label={normalizedStatus}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(63, 81, 181);
      doc.text('JOB CARD DETAILS', pageWidth / 2, 20, { align: 'center' });

      // Job ID
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Job ID: ${jobData._id}`, pageWidth / 2, 30, { align: 'center' });

      let yPos = 50;
      const lineHeight = 8;
      const sectionSpacing = 15;

      const addSection = (title, data) => {
        if (yPos + (data.length * lineHeight) + 30 > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(63, 81, 181);
        doc.text(title, 20, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        data.forEach(([label, value]) => {
          doc.setFont(undefined, 'bold');
          doc.text(`${label}:`, 25, yPos);
          doc.setFont(undefined, 'normal');

          const maxWidth = pageWidth - 80;
          const valueText = String(value || 'N/A');
          const lines = doc.splitTextToSize(valueText, maxWidth);
          doc.text(lines, 80, yPos);
          yPos += lineHeight * lines.length;
        });

        yPos += sectionSpacing;
      };

      // Add all sections
      addSection('CUSTOMER INFORMATION', [
        ['Customer Name', jobData.customerName],
        ['Contact Number', jobData.contactNumber],
        ['Email', jobData.email],
        ['Company', jobData.company]
      ]);

      addSection('VEHICLE INFORMATION', [
        ['Car Number', jobData.carNumber],
        ['Registration Number', jobData.registrationNumber],
        ['Model', jobData.model],
        ['Kilometer', jobData.kilometer ? `${jobData.kilometer} km` : 'N/A'],
        ['Fuel Type', jobData.fuelType]
      ]);

      addSection('INSURANCE INFORMATION', [
        ['Insurance Provider', jobData.insuranceProvider],
        ['Policy Number', jobData.policyNumber],
        ['Expiry Date', formatDate(jobData.expiryDate)],
        ['Excess Amount', jobData.excessAmount ? `₹${jobData.excessAmount}` : 'N/A']
      ]);

      addSection('JOB INFORMATION', [
        ['Job Type', jobData.type],
        ['Job Details', jobData.jobDetails],
        ['Status', jobData.status],
        ['Engineer', jobData.engineerId?.name || 'Not Assigned'],
        ['Engineer Remarks', jobData.engineerRemarks],
        ['Labor Hours', jobData.laborHours ? `${jobData.laborHours} hours` : 'N/A'],
        ['Created Date', formatDateTime(jobData.createdAt)],
        ['Last Updated', formatDateTime(jobData.updatedAt)]
      ]);

      if (jobData.qualityCheck && jobData.qualityCheck.notes) {
        addSection('QUALITY CHECK', [
          ['Notes', jobData.qualityCheck.notes],
          ['Date', formatDateTime(jobData.qualityCheck.date)],
          ['Done By', jobData.qualityCheck.doneBy],
          ['Bill Approved', jobData.qualityCheck.billApproved ? 'Yes' : 'No']
        ]);
      }

      if (jobData.images && jobData.images.length > 0) {
        const imageList = jobData.images.map((image, index) => {
          const url = getPublicImageUrl(image);
          return [`Image ${index + 1}`, url];
        });
        addSection('ATTACHMENTS', imageList);
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
        doc.text(
          `Generated on ${new Date().toLocaleString('en-IN')}`,
          20,
          pageHeight - 10
        );
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      const safeCarNumber = (jobData.carNumber || jobData._id || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `JobCard_${safeCarNumber}_${dateStr}.pdf`;

      doc.save(filename);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Detailed PDF Error:', error);
      console.error('Error stack:', error.stack);
      let errorMessage = 'Error generating PDF. ';
      if (error.message.includes('jsPDF')) {
        errorMessage += 'PDF library not loaded properly.';
      } else {
        errorMessage += `${error.message}`;
      }
      alert(errorMessage + ' Please try again or contact support.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <BuildIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Job Card Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Job ID: {jobData._id}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {getStatusChip(jobData.status)}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        <Grid container spacing={3}>
          {/* Customer Info */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Customer Information
                  </Typography>
                </Box>
                {/* Display customer fields */}
                {/* Same as before */}
              </CardContent>
            </Card>
          </Grid>

          {/* Vehicle Info */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                {/* Display vehicle fields */}
              </CardContent>
            </Card>
          </Grid>

          {/* Insurance Info */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                {/* Display insurance fields */}
              </CardContent>
            </Card>
          </Grid>

          {/* Job Info */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                {/* Display job fields */}
              </CardContent>
            </Card>
          </Grid>

          {/* Quality Check */}
          {jobData.qualityCheck && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  {/* Quality check fields */}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Timestamps */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                {/* Timeline fields */}
              </CardContent>
            </Card>
          </Grid>

          {/* Images Section */}
          {jobData.images && jobData.images.length > 0 && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Job Images ({jobData.images.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {jobData.images.map((image, index) => (
                      <Box key={index} sx={{ width: '150px' }}>
                        <img
                          src={getPublicImageUrl(image)}
                          alt={`Job Image ${index + 1}`}
                          style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Box>
                  <Alert severity="info">
                    These are the actual images attached to the job.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
        <Button
          onClick={generatePDF}
          variant="contained"
          startIcon={isGeneratingPDF ? <CircularProgress size={16} /> : <DownloadIcon />}
          disabled={isGeneratingPDF}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsModal;