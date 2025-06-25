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
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level

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

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("JOB CARD DETAILS", 14, 20);
    doc.setFontSize(10);
    doc.text(`Job ID: ${jobData._id}`, 14, 28);

    const jobDetailsString = parsedJobDetails.map(d => `${d.description} - ₹${d.price}`).join(", ");

    
    const tableData = [
      ['Customer Name', jobData.customerName || 'N/A'],
      ['Contact Number', jobData.contactNumber || 'N/A'],
      ['Email', jobData.email || 'N/A'],
      ['Company', jobData.company || 'N/A'],
      ['Car Number', jobData.carNumber || 'N/A'],
      ['Registration Number', jobData.registrationNumber || 'N/A'],
      ['Model', jobData.model || 'N/A'],
      ['Kilometer', jobData.kilometer ? `${jobData.kilometer} km` : 'N/A'],
      ['Fuel Type', jobData.fuelType || 'N/A'],
      ['Insurance Provider', jobData.insuranceProvider || 'N/A'],
      ['Policy Number', jobData.policyNumber || 'N/A'],
      ['Expiry Date', formatDate(jobData.expiryDate)],
      ['Excess Amount', jobData.excessAmount ? `₹${jobData.excessAmount.toLocaleString()}` : 'N/A'],
      ['Job Type', jobData.type || 'N/A'],
      ['Job Details', jobDetailsString || 'N/A'],
      ['Engineer', jobData.engineerId && jobData.engineerId.length > 0 ? jobData.engineerId[0].name : 'Not Assigned'],
      ['Engineer Remarks', jobData.engineerRemarks || 'N/A'],
      ['Status', jobData.status || 'N/A'],
      ['Created Date', formatDate(jobData.createdAt)]
    ];

    autoTable(doc, {
      startY: 35,
      head: [['Field', 'Value']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [63, 81, 181] },
      margin: { left: 10, right: 10 },
    });

    doc.save(`JobCard_${jobData._id}.pdf`);
  };

  const parsedJobDetails = (() => {
    try {
      return Array.isArray(JSON.parse(jobData.jobDetails)) ? JSON.parse(jobData.jobDetails) : [];
    } catch {
      return [];
    }
  })();

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
                    <Typography variant="body2" color="text.secondary">Job Type</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      {jobData.type || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Job Details</Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    <Box component="ul" sx={{ pl: 2 }}>
              {parsedJobDetails.length > 0 ? (
                parsedJobDetails.map((item, index) => (
                  <li key={index}>{item.description} - ₹{item.price}</li>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No job details provided.</Typography>
              )}
            </Box>
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

            {/* Images Section - Zoom Enabled */}
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