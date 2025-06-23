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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Chip,
  Avatar,
  Divider,
  Alert,
  Fade,
  Skeleton,
   FormControl,
   InputLabel,
   Select,
   useTheme,
   MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import axios from 'axios';

import { useNavigate, useParams } from 'react-router-dom';

const WorkInProgress = () => {
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }
  // Sample data - replace with your actual state management
   const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const navigate = useNavigate();
    const { id } = useParams(); 
     const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
      });
  
const [carDetails, setCarDetails] = useState({
    company: '',
    model: '',
    carNo: ''
  });
  
  // Customer details state
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    contactNo: '',
    email: ''
  });
  
  // Insurance details state
  const [insuranceDetails, setInsuranceDetails] = useState({
    company: '',
    number: '',
    type: '',
    expiry: '',
    regNo: '',
    amount: ''
  });
  
  // Engineer details state
  const [engineerDetails, setEngineerDetails] = useState({
    fullName: '',
    assignedDateTime: ''
  });
  
  
  const [parts, setParts] = useState([]);
  
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [laborHours, setLaborHours] = useState('');

  const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'in_progress', label: 'In Progress', color: 'info' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'on_hold', label: 'On Hold', color: 'default' }
];

    useEffect(() => {
      const fetchJobCardData = async () => {
        if(!garageId){
          navigate("/login")
        }
        try {
          setFetchLoading(true);
          
          const response = await axios.get(
            `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          const data = response.data;
          
          // Populate car details
          setCarDetails({
            company: data.company || '',
            model: data.model || '',
            carNo: data.carNumber || ''
          });
          
          // Populate customer details
          setCustomerDetails({
            name: data.customerName || '',
            contactNo: data.contactNumber || '',
            email: data.email || ''
          });
          
          // Populate insurance details
          setInsuranceDetails({
            company: data.insuranceProvider || '',
            number: data.policyNumber || '',
            type: data.type || '',
            expiry: data.expiryDate ? data.expiryDate.split('T')[0] : '',
            regNo: data.registrationNumber || '',
            amount: data.excessAmount?.toString() || ''
          });
          
          // Populate engineer details
          setEngineerDetails({
            fullName: data.engineerId && data.engineerId.length > 0 ? data.engineerId[0].name : '',
            assignedDateTime: data.createdAt ? 
              new Date(data.createdAt).toISOString().slice(0, 16) : ''
          });
          
          // Populate parts if available
          if (data.partsUsed && data.partsUsed.length > 0) {
            const existingParts = data.partsUsed.map((part, index) => ({
              id: index + 1,
              partName: part.partName || '',
              partNumber: '',
              qty: part.quantity?.toString() || '',
              pricePerPiece: part.pricePerPiece?.toString() || '',
              gstPercent: '',
              totalPrice: part.totalPrice?.toString() || ''
            }));
            
            setParts(existingParts);
          } else {
            // Initialize with one empty row if no parts exist
            setParts([{ 
              id: 1, 
              partName: '', 
              partNumber: '', 
              qty: '', 
              pricePerPiece: '', 
              gstPercent: '', 
              totalPrice: '' 
            }]);
          }
          
          // Populate status, remarks, and labor hours
          if (data.status) {
            setStatus(data.status);
          }
          
          if (data.engineerRemarks) {
            setRemarks(data.engineerRemarks);
          }
          
          if (data.laborHours !== undefined) {
            setLaborHours(data.laborHours.toString());
          }
          
        } catch (error) {
          console.error('Error fetching job card data:', error);
          setSnackbar({
            open: true,
            message: `Error: ${error.response?.data?.message || 'Failed to fetch job card data'}`,
            severity: 'error'
          });
        } finally {
          setFetchLoading(false);
        }
      };
      
      fetchJobCardData();
    }, [id, garageId, navigate]);

  const handleAddRow = () => {
    const newId = parts.length > 0 ? Math.max(...parts.map(part => part.id)) + 1 : 1;
    setParts([...parts, {
      id: newId,
      partName: '',
      qty: '',
      totalPrice: ''
    }]);
  };

  const handleDeleteRow = (id) => {
    if (parts.length > 1) {
      setParts(parts.filter(part => part.id !== id));
    }
  };

  const handlePartChange = (id, field, value) => {
    const updatedParts = parts.map(part => {
      if (part.id === id) {
        return { ...part, [field]: value };
      }
      return part;
    });
    setParts(updatedParts);
  };

     const handleSubmit = async (e) => {
       e.preventDefault();
       
       try {
         setIsLoading(true);
         
         // Filter out empty parts - only check for fields that are actually used in the UI
         const validParts = parts.filter(part => 
           part.partName && 
           part.partName.trim() !== '' && 
           part.qty && 
           part.qty.trim() !== '' &&
           part.totalPrice && 
           part.totalPrice.trim() !== ''
         );
         
         console.log('Valid parts found:', validParts);
         
         // Prepare request data
         const requestData = {
           laborHours: parseInt(laborHours) || 0,
           engineerRemarks: remarks,
           status: status
         };
         
         // Only include partsUsed if there are valid parts to send
         if (validParts.length > 0) {
           const formattedParts = validParts.map(part => ({
             partName: part.partName,
             quantity: parseInt(part.qty) || 1,
             pricePerPiece: parseFloat(part.pricePerPiece) || 0,
             totalPrice: parseFloat(part.totalPrice) || 0
           }));
           
           requestData.partsUsed = formattedParts;
           console.log('Sending parts data:', formattedParts);
         } else {
           console.log('No valid parts to send, keeping existing parts data');
         }
         
         console.log("Submitting to job card ID:", id);
         console.log("Request data:", requestData);
         
         const response = await axios.put(
           `https://garage-management-zi5z.onrender.com/api/garage/jobcards/${id}/workprogress`,
           requestData,
           {
             headers: {
               'Content-Type': 'application/json'
             }
           }
         );
         
         setSnackbar({
           open: true,
           message: 'Work progress updated successfully!',
           severity: 'success'
         });
         
         // Navigate to Quality Check page after successful submission
         setTimeout(() => {
           navigate(`/Quality-Check/${id}`);
         }, 1500);
         
       } catch (error) {
         console.error('Error updating work progress:', error);
         setSnackbar({
           open: true,
           message: `Error: ${error.response?.data?.message || 'Failed to update work progress'}`,
           severity: 'error'
         });
       } finally {
         setIsLoading(false);
       }
     };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon />;
      case 'Pending': return <PendingIcon />;
      default: return <TimerIcon />;
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
      <Container maxWidth="xl">
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: '#1976d2',
            borderRadius: 3,
            border: '1px solid #e2e8f0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
              onClick={() => navigate(`/assign-engineer/${id}`)}
                sx={{ 
                  mr: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight={700} color="white">
                  Work In Progress
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mt: 0.5 }}>
                  Update work status and parts used for job card
                </Typography>
              </Box>
            </Box>
            <Chip 
              icon={getStatusIcon(status)}
              label={status}
              color={getStatusColor(status)}
              size="large"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} lg={8}>
              {/* Vehicle & Customer Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Car Details */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Box sx={{ 
                      background: '#1976d2',
                      color: 'white',
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                        <CarIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Vehicle Details
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <TextField 
                        fullWidth 
                        label="Company"
                        variant="outlined"
                        value={carDetails.company}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                      <TextField 
                        fullWidth 
                        label="Model"
                        variant="outlined"
                        value={carDetails.model}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                      <TextField 
                        fullWidth 
                        label="Registration Number"
                        variant="outlined"
                        value={carDetails.carNo}
                        InputProps={{ readOnly: true }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Customer Details */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Box sx={{ 
                      background: '#1976d2',
                      color: 'white',
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Customer Details
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <TextField 
                        fullWidth 
                        label="Customer Name"
                        variant="outlined"
                        value={customerDetails.name}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                      <TextField 
                        fullWidth 
                        label="Contact Number"
                        variant="outlined"
                        value={customerDetails.contactNo}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                      />
                      <TextField 
                        fullWidth 
                        label="Email Address"
                        variant="outlined"
                        value={customerDetails.email}
                        InputProps={{ readOnly: true }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Parts Used Section */}
              <Card 
                elevation={0}
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}
              >
                <Box sx={{ 
                  background: '#1976d2',
                  color: 'white',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                      <BuildIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Parts Used
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleAddRow}
                    startIcon={<AddIcon />}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Add Part
                  </Button>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Sr.No.</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Part Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Quantity</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Total Price (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parts.map((part, index) => (
                          <TableRow key={part.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            <TableCell>
                              <Chip 
                                label={index + 1} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            </TableCell>
                            <TableCell>
                              <TextField 
                                fullWidth 
                                size="small"
                                variant="outlined"
                                placeholder="Enter part name"
                                value={part.partName}
                                onChange={(e) => handlePartChange(part.id, 'partName', e.target.value)}
                                sx={{ minWidth: 200 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField 
                                fullWidth 
                                size="small"
                                type="number"
                                variant="outlined"
                                placeholder="Qty"
                                value={part.qty}
                                onChange={(e) => handlePartChange(part.id, 'qty', e.target.value)}
                                sx={{ maxWidth: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField 
                                fullWidth 
                                size="small"
                                type="number"
                                variant="outlined"
                                placeholder="Price"
                                value={part.totalPrice}
                                onChange={(e) => handlePartChange(part.id, 'totalPrice', e.target.value)}
                                sx={{ maxWidth: 120 }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                color="error"
                                onClick={() => handleDeleteRow(part.id)}
                                disabled={parts.length === 1}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: 'rgba(239, 68, 68, 0.1)' 
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Work Details */}
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}
              >
                <Box sx={{ 
                  background: '#1976d2',
                  color: 'white',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <CommentIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Work Details
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        label="Labor Hours"
                        type="number"
                        variant="outlined"
                        value={laborHours}
                        onChange={(e) => setLaborHours(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TimerIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {/* <TextField
                        select
                        fullWidth
                        label="Work Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        variant="outlined"
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </TextField> */}
                        <Box sx={{ mb: 4 }}>
                                        {/* <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Job Status</Typography> */}
                                        {/* <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}> */}
                                          <Grid container spacing={3}>
                                            <Grid item xs={12} md={12}>
                                              <FormControl fullWidth>
                                                <InputLabel id="status-label">Status</InputLabel>
                                                <Select
                                                  labelId="status-label"
                                                  name="status"
                                                  onChange={(e) => setStatus(e.target.value)}
                                                  label="Status"
                                                  startAdornment={
                                                    <InputAdornment position="start">
                                                      <AssignmentIcon />
                                                    </InputAdornment>
                                                  }
                                                >
                                                  {statusOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                      <Chip 
                                                        label={option.label} 
                                                        color={option.color} 
                                                        size="small" 
                                                        sx={{ mr: 1 }}
                                                      />
                                                      {option.label}
                                                    </MenuItem>
                                                  ))}
                                                </Select>
                                                {/* <FormHelperText>
                                                  Update the current status of this job card
                                                </FormHelperText> */}
                                              </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                              {/* <Button
                                                variant="outlined"
                                                onClick={() => updateJobCardStatus(formData.status)}
                                                disabled={loading}
                                                startIcon={<SaveIcon />}
                                                sx={{ mt: 1 }}
                                              >
                                                Update Status Only
                                              </Button> */}
                                            </Grid>
                                          </Grid>
                                        {/* </Paper> */}
                                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Engineer Remarks"
                        placeholder="Enter detailed remarks about the work performed..."
                        variant="outlined"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Sidebar */}
            <Grid item xs={12} lg={4}>
              {/* Insurance Details */}
              <Card 
                elevation={0}
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}
              >
                <Box sx={{ 
                  background: '#1976d2',
                  color: '#1e293b',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Avatar sx={{ bgcolor: 'rgba(30, 41, 59, 0.1)', mr: 2 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Insurance Details
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="#64748b" gutterBottom>
                      Insurance Company
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {insuranceDetails.company}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="#64748b" gutterBottom>
                      Policy Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {insuranceDetails.number}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="#64748b" gutterBottom>
                      Policy Type
                    </Typography>
                    <Chip 
                      label={insuranceDetails.type} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="#64748b" gutterBottom>
                      Expiry Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(insuranceDetails.expiry).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="#64748b" gutterBottom>
                      Coverage Amount
                    </Typography>
                    <Typography variant="h6" color="success.main" fontWeight={600}>
                      ₹{insuranceDetails.amount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Engineer Details */}
              <Card 
                elevation={0}
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}
              >
                <Box sx={{ 
                  background: '#1976d2',
                  color: '#1e293b',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Avatar sx={{ bgcolor: 'rgba(30, 41, 59, 0.1)', mr: 2 }}>
                    <EngineeringIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Assigned Engineer
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: 'primary.main',
                        mr: 2,
                        fontSize: '1.5rem',
                        fontWeight: 600
                      }}
                    >
                      {engineerDetails.fullName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="#1e293b">
                        {engineerDetails.fullName}
                      </Typography>
                      <Typography variant="body2" color="#64748b">
                        Senior Technician
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="#64748b" gutterBottom>
                      Assigned Date & Time
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(engineerDetails.assignedDateTime).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  background: '#1976d2',
                  color: 'white'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Job Summary
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Parts:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {parts.filter(p => p.partName).length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Labor Hours:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {laborHours || '0'} hrs
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Parts Cost:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{parts.reduce((sum, part) => sum + (parseFloat(part.totalPrice) || 0), 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Submit Button */}
             {/* Submit Button */}
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        mt: 3, 
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        textAlign: 'center'
                      }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ 
                          px: 6, 
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, #303f9f 0%, #7b1fa2 100%)'
                              : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                          }
                        }}
                      >
                        {isLoading ? 'Updating...' : 'Submit Work Progress'}
                      </Button>
                    </Paper>
        </form>
      </Container>
    </Box>
  );
};

export default WorkInProgress;