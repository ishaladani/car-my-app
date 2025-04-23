import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CssBaseline,
  useTheme
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InsuranceManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    carName: '',
    insuranceType: '',
    insurancePrice: '',
    company: '',
    expiryDate: '',
    taxAmount: ''
  });

  // Sample data for the table
  const [insuranceData, setInsuranceData] = useState([
    { id: 1, carNumber: 'ABC123', insuranceType: 'Comprehensive', price: '$500', company: 'Geico', expiry: '12/31/2023' },
    { id: 2, carNumber: 'XYZ789', insuranceType: 'Liability', price: '$300', company: 'Progressive', expiry: '06/30/2024' },
    { id: 3, carNumber: 'DEF456', insuranceType: 'Collision', price: '$400', company: 'State Farm', expiry: '09/15/2023' },
  ]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add new insurance to the table
    const newInsurance = {
      id: insuranceData.length + 1,
      carNumber: formData.carName,
      insuranceType: formData.insuranceType,
      price: `$${formData.insurancePrice}`,
      company: formData.company,
      expiry: formData.expiryDate
    };
    
    setInsuranceData([...insuranceData, newInsurance]);
    // Reset form
    setFormData({
      carName: '',
      insuranceType: '',
      insurancePrice: '',
      company: '',
      expiryDate: '',
      taxAmount: ''
    });
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
      <Container maxWidth="lg">
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
            Insurance Management
          </Typography>
        </Box>
        
        <Card sx={{ 
          mb: 4, 
          overflow: 'visible', 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3
              }}
            >
              <TextField
                name="carName"
                label="Car Name"
                variant="outlined"
                value={formData.carName}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="insuranceType"
                label="Insurance Type"
                variant="outlined"
                value={formData.insuranceType}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="insurancePrice"
                label="Insurance Price"
                variant="outlined"
                type="number"
                value={formData.insurancePrice}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="company"
                label="Company"
                variant="outlined"
                value={formData.company}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="expiryDate"
                label="Expiry Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={formData.expiryDate}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="taxAmount"
                label="Tax Amount"
                variant="outlined"
                type="number"
                value={formData.taxAmount}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                onClick={handleSubmit}
                sx={{ 
                  px: 4, 
                  py: 1.5, 
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
                Add Insurance
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
              <Table sx={{ minWidth: 650 }} aria-label="insurance table">
                <TableHead sx={{ bgcolor: theme.palette.success.main }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Car Number</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Insurance Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price/Unit</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Company</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Expiry</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insuranceData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}
                    >
                      <TableCell>{row.carNumber}</TableCell>
                      <TableCell>{row.insuranceType}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell>{row.expiry}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          color="primary"
                          size="small"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Empty rows for better visual */}
                  {Array.from({ length: 10 - insuranceData.length }).map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                      <TableCell style={{ height: 53 }}></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default InsuranceManagement;