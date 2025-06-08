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
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// This component would typically be integrated with your theme provider
// Similar to how the AssignEngineer component uses useThemeContext

const WorkInProgress = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams(); 
      let garageId = localStorage.getItem("garageId");
    if (!garageId) {
      garageId = localStorage.getItem("garage_id");
    }
  

  
  // Table rows state management (now an empty array to start with)
  const [parts, setParts] = useState([]);
  
  // Car details state
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
    speciality: '',
    assignedDateTime: ''
  });
  
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
   

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };
  
  // Fetch job card data when component mounts
  useEffect(() => {
    const fetchJobCardData = async () => {
       if(!garageId){
          navigate("\login")
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
  fullName: data.engineerId && data.engineerId.length > 0 ? data.engineerId[0].name : '',  // Access first element of array
  speciality: '', 
  assignedDateTime: data.createdAt ? 
    new Date(data.createdAt).toISOString().slice(0, 16) : ''
});
        
        // Populate parts if available
        if (data.partsUsed && data.partsUsed.length > 0) {
          const existingParts = data.partsUsed.map((part, index) => ({
            id: index + 1,
            partName: part.partName || '',
            partNumber: '',  // Not available in the response
            qty: part.quantity?.toString() || '',
            pricePerPiece: part.pricePerPiece?.toString() || '',
            gstPercent: '', // Not available in the response
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
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Filter out empty parts
      const validParts = parts.filter(part => 
        part.partName && part.qty && part.pricePerPiece && part.totalPrice
      );
      
      // Format the data according to API requirements
      const formattedParts = validParts.map(part => ({
        partName: part.partName,
        quantity: parseInt(part.qty),
        pricePerPiece: parseFloat(part.pricePerPiece),
        totalPrice: parseFloat(part.totalPrice)
      }));
      
      // Prepare request data
      const requestData = {
        partsUsed: formattedParts,
        laborHours: parseInt(laborHours) || 0,
        engineerRemarks: remarks,
        status: status
      };
      console.log("id", id)
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

  // Add a new empty row to the parts table
  const handleAddRow = () => {
    const newId = parts.length > 0 ? Math.max(...parts.map(part => part.id)) + 1 : 1;
    setParts([...parts, {
      id: newId,
      partName: '',
      partNumber: '',
      qty: '',
      pricePerPiece: '',
      gstPercent: '',
      totalPrice: ''
    }]);
  };
  
  // Delete a row from the parts table
  const handleDeleteRow = (id) => {
    if (parts.length > 1) {
      setParts(parts.filter(part => part.id !== id));
    } else {
      // If it's the last row, just clear it instead of removing
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
  };

  // Update part data in the table
  const handlePartChange = (id, field, value) => {
    const updatedParts = parts.map(part => {
      if (part.id === id) {
        const updatedPart = { ...part, [field]: value };
        
        // Auto-calculate total price if qty and pricePerPiece are filled
        if ((field === 'qty' || field === 'pricePerPiece') && updatedPart.qty && updatedPart.pricePerPiece) {
          const qty = parseFloat(updatedPart.qty);
          const price = parseFloat(updatedPart.pricePerPiece);
          const gst = updatedPart.gstPercent ? parseFloat(updatedPart.gstPercent) : 0;
          
          // Calculate total price with GST
          const priceWithoutGst = qty * price;
          const gstAmount = priceWithoutGst * (gst / 100);
          updatedPart.totalPrice = (priceWithoutGst + gstAmount).toFixed(2);
        }
        
        return updatedPart;
      }
      return part;
    });
    setParts(updatedParts);
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
      {fetchLoading && (
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
            Work In Progress
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
          <Grid container spacing={3}>
            {/* Car Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                height: '100%'
              }}>
                <Box sx={{ 
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: 'bold'
                }}>
                  Car Details
                </Box>
                <CardContent>
                  <TextField 
                    fullWidth 
                    placeholder="Company" 
                    margin="normal"
                    variant="outlined"
                    value={carDetails.company}
                    onChange={(e) => setCarDetails({...carDetails, company: e.target.value})}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CarIcon color="action" />
                        </InputAdornment>
                      ),
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Model" 
                    margin="normal"
                    variant="outlined"
                    value={carDetails.model}
                    onChange={(e) => setCarDetails({...carDetails, model: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Car No." 
                    margin="normal"
                    variant="outlined"
                    value={carDetails.carNo}
                    onChange={(e) => setCarDetails({...carDetails, carNo: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Customer Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                height: '100%'
              }}>
                <Box sx={{ 
                  bgcolor: 'rgb(9, 141, 97)',
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: 'bold'
                }}>
                  Customer Details
                </Box>
                <CardContent>
                  <TextField 
                    fullWidth 
                    placeholder="Name" 
                    margin="normal"
                    variant="outlined"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Contact No." 
                    margin="normal"
                    variant="outlined"
                    value={customerDetails.contactNo}
                    onChange={(e) => setCustomerDetails({...customerDetails, contactNo: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Email" 
                    margin="normal"
                    variant="outlined"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Insurance Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                mt: 2
              }}>
                <Box sx={{ 
                  bgcolor: 'rgb(9, 141, 97)',
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: 'bold'
                }}>
                  Insurance Details
                </Box>
                <CardContent>
                  <TextField 
                    fullWidth 
                    placeholder="Company" 
                    margin="normal"
                    variant="outlined"
                    value={insuranceDetails.company}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, company: e.target.value})}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SecurityIcon color="action" />
                        </InputAdornment>
                      ),
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Number" 
                    margin="normal"
                    variant="outlined"
                    value={insuranceDetails.number}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, number: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Type" 
                    margin="normal"
                    variant="outlined"
                    value={insuranceDetails.type}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, type: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    type="date"
                    label="Expiry"
                    margin="normal"
                    variant="outlined"
                    value={insuranceDetails.expiry}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, expiry: e.target.value})}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Reg. No." 
                    margin="normal"
                    variant="outlined"
                    value={insuranceDetails.regNo}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, regNo: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Amount" 
                    margin="normal"
                    variant="outlined"
                    value={insuranceDetails.amount}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, amount: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Engineer Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                mt: 2
              }}>
                <Box sx={{ 
                  bgcolor: 'rgb(9, 141, 97)',
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: 'bold'
                }}>
                  Engineer Details
                </Box>
                <CardContent>
                  <TextField 
                    fullWidth 
                    placeholder="Full Name" 
                    margin="normal"
                    variant="outlined"
                    value={engineerDetails.fullName}
                    onChange={(e) => setEngineerDetails({...engineerDetails, fullName: e.target.value})}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EngineeringIcon color="action" />
                        </InputAdornment>
                      ),
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Speciality" 
                    margin="normal"
                    variant="outlined"
                    value={engineerDetails.speciality}
                    onChange={(e) => setEngineerDetails({...engineerDetails, speciality: e.target.value})}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                  <TextField 
                    fullWidth 
                    type="datetime-local"
                    label="Date & Time Assigned"
                    margin="normal"
                    variant="outlined"
                    value={engineerDetails.assignedDateTime}
                    onChange={(e) => setEngineerDetails({...engineerDetails, assignedDateTime: e.target.value})}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Parts Used */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Parts Used
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: theme.shadows[3] }}>
              <TableContainer>
                <Table aria-label="parts table">
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Sr.No.
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Part Name
                      </TableCell>
                      {/* <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Part Number
                      </TableCell> */}
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Qty
                      </TableCell>
                      {/* <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Price/Piece
                      </TableCell> */}
                      {/* <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        GST %
                      </TableCell> */}
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Total Price
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell align="center">
                          {part.id}
                        </TableCell>
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            value={part.partName}
                            onChange={(e) => handlePartChange(part.id, 'partName', e.target.value)}
                          />
                        </TableCell>
                        {/* <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            value={part.partNumber}
                            onChange={(e) => handlePartChange(part.id, 'partNumber', e.target.value)}
                          />
                        </TableCell> */}
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            type="number"
                            value={part.qty}
                            onChange={(e) => handlePartChange(part.id, 'qty', e.target.value)}
                          />
                        </TableCell>
                        {/* <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            type="number"
                            value={part.pricePerPiece}
                            onChange={(e) => handlePartChange(part.id, 'pricePerPiece', e.target.value)}
                          />
                        </TableCell> */}
                        {/* <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            type="number"
                            value={part.gstPercent}
                            onChange={(e) => handlePartChange(part.id, 'gstPercent', e.target.value)}
                          />
                        </TableCell> */}
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            type="number"
                            value={part.totalPrice}
                            onChange={(e) => handlePartChange(part.id, 'totalPrice', e.target.value)}
                            InputProps={{ readOnly: true }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleDeleteRow(part.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Add Row Button */}
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleAddRow}
                  startIcon={<AddIcon />}
                >
                  Add Part
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Additional Fields */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Labour Hours"
                variant="outlined" 
                type="number"
                value={laborHours}
                onChange={(e) => setLaborHours(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                variant="outlined"
                required
              >
                <MenuItem value="">Select Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Remarks */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter Remarks"
            variant="outlined"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ mt: 3 }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <CommentIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || fetchLoading}
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
              {fetchLoading ? 'LOADING...' : isLoading ? 'SUBMITTING...' : 'SUBMIT REMARKS'}
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

export default WorkInProgress;