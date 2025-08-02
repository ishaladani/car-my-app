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
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!jobData) return null;

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

  const parsedJobDetails = (() => {
    try {
      return Array.isArray(JSON.parse(jobData.jobDetails)) ? JSON.parse(jobData.jobDetails) : [];
    } catch {
      return [];
    }
  })();

  const generatePDF = () => {
    setIsGeneratingPDF(true);
    const doc = new jsPDF();

    // Set up colors
    const primaryColor = [63, 81, 181]; // Theme primary color
    const lightGray = [245, 245, 245];   // Light background for headers
    const darkGray = [66, 66, 66];       // Dark text for headers
    const blackColor = [0, 0, 0];        // Standard black text

    // --- Page Setup ---
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const sectionSpacing = 12; // Space after a section
    const headerHeight = 30;   // Height for main header

    // --- Header with company branding ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); // Increased header font size
    doc.setFont('helvetica', 'bold');
    doc.text('JOB CARD DETAILS', margin, 19); // Adjusted Y position

    // Job ID and Date (aligned to the right)
    doc.setFontSize(12); // Increased font size
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 50, 19); // Adjusted position

    // Reset text color for content
    doc.setTextColor(...blackColor);
    let yPosition = headerHeight + 10; // Start content below header

    // --- Helper Function for Section Headers ---
    const addSectionHeader = (title) => {
         // Check if enough space for header and some content, else new page
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFillColor(...lightGray);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F'); // Slightly taller header
        doc.setFontSize(14); // Increased section header font size
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkGray);
        doc.text(title, margin + 3, yPosition + 7); // Adjusted Y for vertical centering
        yPosition += 15; // Increased space after header
        doc.setTextColor(...blackColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12); // Set body font size
    };

    // --- Customer Information Section ---
    addSectionHeader('CUSTOMER INFORMATION');
    const customerData = [
      ['Customer Name', jobData.customerName || 'N/A'],
      ['Contact Number', jobData.contactNumber || 'N/A'],
      ['Email', jobData.email || 'N/A'],
      ['Company', jobData.company || 'N/A']
    ];
    autoTable(doc, {
      startY: yPosition,
      body: customerData,
      theme: 'plain',
      styles: {
        fontSize: 12, // Increased font size
        cellPadding: 4, // Increased padding
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        overflow: 'linebreak', // Handle text overflow
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 }, // Slightly wider label column
        1: { cellWidth: pageWidth - 2 * margin - 55 - 10 } // Adjust data column width
      },
       bodyStyles: {
           valign: 'top' // Align text to the top of cells
       },
      margin: { left: margin, right: margin },
      didDrawPage: function (data) {
        yPosition = data.cursor.y + sectionSpacing; // Update Y position after table
      }
    });

    // --- Vehicle Information Section ---
    addSectionHeader('VEHICLE INFORMATION');
    const vehicleData = [
      ['Car Number', jobData.carNumber || 'N/A'],
      ['Registration Number', jobData.registrationNumber || 'N/A'],
      ['Model', jobData.model || 'N/A'],
      ['Kilometer', jobData.kilometer ? `${jobData.kilometer} km` : 'N/A'],
      ['Fuel Type', jobData.fuelType || 'N/A']
    ];
    autoTable(doc, {
      startY: yPosition,
      body: vehicleData,
      theme: 'plain',
      styles: {
        fontSize: 12,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: pageWidth - 2 * margin - 55 - 10 }
      },
       bodyStyles: {
           valign: 'top'
       },
      margin: { left: margin, right: margin },
      didDrawPage: function (data) {
        yPosition = data.cursor.y + sectionSpacing;
      }
    });

    // --- Insurance Information Section ---
    addSectionHeader('INSURANCE INFORMATION');
    const insuranceData = [
      ['Insurance Provider', jobData.insuranceProvider || 'N/A'],
      ['Policy Number', jobData.policyNumber || 'N/A'],
      ['Insurance Type', jobData.type || 'N/A'],
      ['Expiry Date', formatDate(jobData.expiryDate)],
      ['Excess Amount', jobData.excessAmount ? `${jobData.excessAmount.toLocaleString()}` : 'N/A']
    ];
    autoTable(doc, {
      startY: yPosition,
      body: insuranceData,
      theme: 'plain',
      styles: {
        fontSize: 12,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: pageWidth - 2 * margin - 55 - 10 }
      },
       bodyStyles: {
           valign: 'top'
       },
      margin: { left: margin, right: margin },
      didDrawPage: function (data) {
        yPosition = data.cursor.y + sectionSpacing;
      }
    });

    // --- Job Information Section ---
    addSectionHeader('JOB INFORMATION');
    const jobInfoData = [
      ['Assigned Engineer', jobData.engineerId && jobData.engineerId.length > 0 ? jobData.engineerId[0].name : 'Not Assigned'],
      ['Status', jobData.status || 'Pending'],
      ['Created Date', formatDate(jobData.createdAt)],
      ['Engineer Remarks', jobData.engineerRemarks || 'N/A']
    ];
    autoTable(doc, {
      startY: yPosition,
      body: jobInfoData,
      theme: 'plain',
      styles: {
        fontSize: 12,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: pageWidth - 2 * margin - 55 - 10 }
      },
       bodyStyles: {
           valign: 'top'
       },
      margin: { left: margin, right: margin },
      didDrawPage: function (data) {
        yPosition = data.cursor.y + sectionSpacing;
      }
    });

    // --- Job Details Section (if exists) ---
    if (parsedJobDetails.length > 0) {
      addSectionHeader('JOB DETAILS & SERVICES');
      // Prepare job details data
      const jobDetailsData = parsedJobDetails.map((item, index) => {
        const description = item.description || 'N/A';
        return [index + 1, description];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['S.No.', 'Description']],
        body: jobDetailsData,
        theme: 'striped',
        styles: {
          fontSize: 12,
          cellPadding: 5, // Increased padding
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 12
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' }, // Slightly wider S.No.
          1: { cellWidth: pageWidth - 2 * margin - 25 - 15 } // Adjust description width
        },
         bodyStyles: {
             valign: 'top'
         },
        margin: { left: margin, right: margin },
        // Ensure table doesn't split awkwardly
        pageBreak: 'auto',
        didDrawPage: function (data) {
            yPosition = data.cursor.y + sectionSpacing;
        }
      });
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9); // Slightly larger footer font
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      doc.text('Generated by Job Management System', margin, pageHeight - 10);
    }

    // --- Save the PDF ---
    const fileName = `JobCard_${jobData.carNumber || 'N/A'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    setIsGeneratingPDF(false);
  };

  return (
    <>
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
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Customer Information
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.customerName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Contact</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.contactNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Company</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {jobData.company || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Vehicle Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BuildIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Vehicle Information
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Car Number</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.carNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Registration Number</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.registrationNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Model</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.model || 'N/A'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Kilometer</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {jobData.kilometer ? `${jobData.kilometer} km` : 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {jobData.fuelType || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Insurance Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InsuranceIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Insurance Information
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Provider</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.insuranceProvider || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Policy Number</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.policyNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {formatDate(jobData.expiryDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Excess Amount</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {jobData.excessAmount ? `₹${jobData.excessAmount.toLocaleString()}` : 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Job Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BuildIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Job Information
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Insurance Type</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.type || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Engineer</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.engineerId && jobData.engineerId.length > 0 ? jobData.engineerId[0].name : 'Not Assigned'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Engineer Remarks</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {jobData.engineerRemarks || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Job Details Section */}
            {parsedJobDetails.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Job Details & Services
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                      {parsedJobDetails.map((item, index) => (
                        <Box key={index} component="li" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.description || 'N/A'}</span>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
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
                        <Box key={index} sx={{ width: '150px', cursor: 'pointer' }}>
                          <img
                            src={image}
                            alt={`Job Image ${index + 1}`}
                            style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                            onClick={() => setZoomedImage(image)}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            onError={(e) => {
                              console.error(`Failed to load image: ${image}`);
                              e.target.style.display = 'none';
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                    <Alert severity="info">
                      Click any image to zoom.
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
      {/* Image Zoom Modal */}
      {zoomedImage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.8)',
            zIndex: 1600,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out',
          }}
          onClick={() => {
            setZoomedImage(null);
            setZoomLevel(1);
          }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              border: '4px solid white',
              borderRadius: 2,
              transition: 'transform 0.3s ease',
              transform: `scale(${zoomLevel})`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage}
              alt="Zoomed Job"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onMouseEnter={() => setZoomLevel(1.5)}
              onMouseLeave={() => setZoomLevel(1)}
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default JobDetailsModal;