import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  IconButton,
  Grid,
  CssBaseline,
  Paper,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const QualityCheck = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams(); // Get jobCard ID from URL params
  const token = localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : '';

  // State for parts table and final inspection remarks
  const [parts, setParts] = useState([]);
  const [finalInspection, setFinalInspection] = useState('');
  const [jobCardData, setJobCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get current date and time for display
  const currentDateTime = format(new Date(), "MM/dd/yyyy - hh:mm a");

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, "MM/dd/yyyy");
  };

  // Fetch job card data when component mounts
  useEffect(() => {
    const fetchJobCardData = async () => {
      try {
        setIsLoading(true);
        
        const response = await axios.get(
          `https://garage-management-system-cr4w.onrender.com/api/jobCards/${id}`,
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const data = response.data;
        setJobCardData(data);
        
        // Populate parts if available
        if (data.partsUsed && data.partsUsed.length > 0) {
          const existingParts = data.partsUsed.map((part, index) => ({
            id: index + 1,
            partName: part.partName || '',
            qty: part.quantity?.toString() || '',
            pricePerPiece: part.pricePerPiece?.toString() || '',
            totalPrice: part.totalPrice?.toString() || ''
          }));
          
          setParts(existingParts);
        } else {
          // Initialize with one empty row if no parts exist
          setParts([{ 
            id: 1, 
            partName: '', 
            qty: '', 
            pricePerPiece: '', 
            totalPrice: '' 
          }]);
        }
        
        // Set initial inspection notes if available
        if (data.qualityCheck && data.qualityCheck.notes) {
          setFinalInspection(data.qualityCheck.notes);
        }
        
      } catch (error) {
        console.error('Error fetching job card data:', error);
        setSnackbar({
          open: true,
          message: `Error: ${error.response?.data?.message || 'Failed to fetch job card data'}`,
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCardData();
  }, [id]);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Handle form submission and navigation to billing page
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First, save the quality check notes if needed
      if (finalInspection) {
        await axios.put(
          `https://garage-management-system-cr4w.onrender.com/api/jobCards/${id}/quality-check`,
          { notes: finalInspection },
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Navigate to billing page with the job card ID
      navigate(`/billing/${id}`);
      
    } catch (error) {
      console.error('Error saving quality check:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || 'Failed to save quality check'}`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto',
      pt: 3
    }}>
      <CssBaseline />

      {/* Loading overlay */}
      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999
        }}>
          <CircularProgress />
        </Box>
      )}
      
      <Container maxWidth="md">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 2, 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Quality Check
          </Typography>
        </Box>
        
        <Card sx={{ 
          mb: 4, 
          overflow: 'visible', 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {/* Engineer and Date/Time info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <BuildIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body1">
                      Done By Engineer: {' '}
                      <Typography 
                        component="span" 
                        fontWeight={600}
                        color={theme.palette.primary.main}
                      >
                        {jobCardData?.engineerId?.name || 'N/A'}
                      </Typography>
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'flex-start', md: 'flex-end' }
                    }}
                  >
                    <CalendarIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body1">
                      Date & Time: {' '}
                      <Typography 
                        component="span" 
                        fontWeight={600}
                        color={theme.palette.primary.main}
                      >
                        {currentDateTime}
                      </Typography>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Vehicle, Customer and Insurance Details */}
              <Paper
                elevation={0}
                sx={{
                  mb: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Grid container>
                  <Grid item xs={12} md={4}>
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        p: 1.5,
                        textAlign: 'center',
                        fontWeight: 600
                      }}
                    >
                      Car Details
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        p: 1.5,
                        textAlign: 'center',
                        fontWeight: 600,
                        borderLeft: { xs: 0, md: `1px solid ${theme.palette.primary.dark}` },
                        borderRight: { xs: 0, md: `1px solid ${theme.palette.primary.dark}` },
                        borderTop: { xs: `1px solid ${theme.palette.primary.dark}`, md: 0 },
                        borderBottom: { xs: `1px solid ${theme.palette.primary.dark}`, md: 0 }
                      }}
                    >
                      Customer Details
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        p: 1.5,
                        textAlign: 'center',
                        fontWeight: 600,
                        borderTop: { xs: `1px solid ${theme.palette.primary.dark}`, md: 0 }
                      }}
                    >
                      Insurance Details
                    </Box>
                  </Grid>
                </Grid>

                <Grid container sx={{ p: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ pr: { xs: 0, md: 2 } }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '80px' }}>Company:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.company || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '80px' }}>Model:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.model || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', mb: { xs: 2, md: 0 } }}>
                        <Typography variant="body1" sx={{ minWidth: '80px' }}>Car No.:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.carNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ px: { xs: 0, md: 2 }, mt: { xs: 2, md: 0 } }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Name:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.customerName || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Contact No.:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.contactNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', mb: { xs: 2, md: 0 } }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Email:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ pl: { xs: 0, md: 2 }, mt: { xs: 2, md: 0 } }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Company:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.insuranceProvider || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Number:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.policyNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Expiry Date:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {jobCardData?.expiryDate ? formatDate(jobCardData.expiryDate) : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Parts Used - Read Only */}
              <Box sx={{ mt: 4, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Parts Used
                </Typography>
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: theme.shadows[2] }}>
                  <TableContainer>
                    <Table aria-label="parts table">
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Sr.No.
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Part Name
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Qty
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Price/Piece
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Total Price
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parts.map((part) => (
                          <TableRow key={part.id}>
                            <TableCell align="center">{part.id}</TableCell>
                            <TableCell align="center">
                              {part.partName}
                            </TableCell>
                            <TableCell align="center">
                              {part.qty}
                            </TableCell>
                            <TableCell align="center">
                              {part.pricePerPiece}
                            </TableCell>
                            <TableCell align="center">
                              {part.totalPrice}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>

              {/* Engineer Remarks */}
              <Box sx={{ mt: 4, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Engineer Remarks
                </Typography>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                  <Typography variant="body1">
                    {jobCardData?.engineerRemarks || 'No remarks provided'}
                  </Typography>
                </Paper>
              </Box>

              {/* Labor Hours */}
              <Box sx={{ mt: 4, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Labor Hours
                </Typography>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                  <Typography variant="body1">
                    {jobCardData?.laborHours || '0'} hours
                  </Typography>
                </Paper>
              </Box>

              {/* Final Inspection */}
              <Box sx={{ mt: 4, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Quality Check Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Final Inspection......"
                  variant="outlined"
                  value={finalInspection}
                  onChange={(e) => setFinalInspection(e.target.value)}
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  disabled={isSubmitting || isLoading}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    width: '50%',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                    }
                  }}
                >
                  {isSubmitting ? 'Approving...' : 'Approve Bill'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QualityCheck;