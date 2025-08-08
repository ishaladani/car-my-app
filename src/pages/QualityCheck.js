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
  CircularProgress,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const QualityCheck = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
 
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }

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

  const currentDateTime = format(new Date(), "MM/dd/yyyy - hh:mm a");

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, "MM/dd/yyyy");
  };

  useEffect(() => {
    const fetchJobCardData = async () => {
      try {
        if(!garageId){
          navigate("/login")
        }
        setIsLoading(true);
        
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/jobCards/${id}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        const data = response.data;
        setJobCardData(data);

        
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
          setParts([{ 
            id: 1, 
            partName: 'No parts used', 
            qty: '0', 
            pricePerPiece: '0', 
            totalPrice: '0' 
          }]);
        }
        
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
  }, [id, garageId, navigate]);

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (finalInspection) {
        await axios.put(
          `https://garage-management-zi5z.onrender.com/api/garage/jobcards/${id}/qualitycheck`,
          { notes: finalInspection },
          { headers: {  'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('Error saving quality check:', error);
      
      if (error.response?.data?.message !== 'Quality Check already completed') {
        setSnackbar({
          open: true,
          message: `Error: ${error.response?.data?.message || 'Failed to save quality check'}`,
          severity: 'error',
        });
      }
    } finally {
      setIsSubmitting(false);
      navigate(`/billing/${id}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading quality check data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto',
      pt: 3,
      backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
      minHeight: '100vh'
    }}>
      <CssBaseline />
      
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center',
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: theme.shadows[2]
        }}>
          <IconButton 
            onClick={() => navigate(`/work-in-progress/${id}`)} 
            sx={{ 
              mr: 2,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" fontWeight={700} color="primary">
              Quality Check Report
            </Typography>
           
          </Box>
          {/* <Chip 
            icon={<CalendarIcon />}
            label={currentDateTime}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.9rem', py: 2 }}
          /> */}
        </Box>

        {/* Engineer and Status Info */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Engineer Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Assigned Engineer
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {jobCardData?.engineerId?.[0]?.name || 'Not Assigned'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Work Summary
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Labor Hours:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {jobCardData?.laborHours || '0'} hours
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Parts Used:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {parts.filter(part => part.partName !== 'No parts used').length} items
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Vehicle, Customer and Insurance Details */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Grid container spacing={0}>
              {/* Car Details */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  p: 3, 
                  borderRight: { xs: 0, md: `1px solid ${theme.palette.divider}` },
                  borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 0 },
                  height: '100%',
                  minHeight: '280px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Vehicle Details
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Company
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {jobCardData?.company || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Model
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {jobCardData?.model || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Car Number
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {jobCardData?.carNumber || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              {/* Customer Details */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  p: 3, 
                  borderRight: { xs: 0, md: `1px solid ${theme.palette.divider}` },
                  borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 0 },
                  height: '100%',
                  minHeight: '280px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Customer Details
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Name
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {jobCardData?.customerName || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <PhoneIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Contact
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {jobCardData?.contactNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <EmailIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        sx={{ 
                          wordBreak: 'break-all',
                          lineHeight: 1.4,
                          maxWidth: '100%'
                        }}
                      >
                        {jobCardData?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              {/* Insurance Details */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  p: 3,
                  height: '100%',
                  minHeight: '280px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Insurance Details
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Provider
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {jobCardData?.insuranceProvider || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Policy Number
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {jobCardData?.policyNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Expiry Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(jobCardData?.expiryDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Parts Used Table */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Parts Used
              </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      align="center" 
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        py: 2
                      }}
                    >
                      Sr.No.
                    </TableCell>
                    <TableCell 
                      align="center" 
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      Part Name
                    </TableCell>
                    <TableCell 
                      align="center" 
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      Quantity
                    </TableCell>
                    {/* <TableCell 
                      align="center" 
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      Price/Piece
                    </TableCell> */}
                    <TableCell 
                      align="center" 
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      Total Price
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parts.map((part, index) => (
                    <TableRow key={part.id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                      <TableCell align="center" sx={{ py: 2, fontWeight: 500 }}>
                        {index + 1}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 500 }}>
                        {part.partName}
                      </TableCell>
                      <TableCell align="center">
                        {part.qty}
                      </TableCell>
                      {/* <TableCell align="center">
                        ₹{part.pricePerPiece}
                      </TableCell> */}
                      <TableCell align="center" sx={{ fontWeight: 500 }}>
                        ₹{part.totalPrice}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Engineer Remarks */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotesIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Engineer Remarks
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="body1" sx={{ fontStyle: jobCardData?.engineerRemarks ? 'normal' : 'italic' }}>
                {jobCardData?.engineerRemarks || 'No remarks provided by the engineer'}
              </Typography>
            </Paper>
          </CardContent>
        </Card>

        {/* Quality Check Form */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Quality Check Notes
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Enter your quality check observations, any issues found, recommendations, or approval notes..."
                variant="outlined"
                value={finalInspection}
                onChange={(e) => setFinalInspection(e.target.value)}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  disabled={isSubmitting}
                  sx={{ 
                    px: 6, 
                    py: 2, 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 3,
                    minWidth: '250px',
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                    }
                  }}
                >
                  {isSubmitting ? 'Processing...' : 'Approve & Continue to Billing'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
      
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