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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CssBaseline,
  useTheme
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InventoryManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    carName: '',
    model: '',
    partNumber: '',
    partName: '',
    quantity: '',
    pricePerUnit: '',
    taxType: '',
    taxAmount: ''
  });

  // Sample data for the table
  const [inventoryData, setInventoryData] = useState([
    { 
      id: 1, 
      partNumber: 'BP-1001', 
      partName: 'Brake Pads', 
      quantity: 24, 
      price: '$25.99', 
      tax: 'SGST', 
      totalPrice: '$623.76' 
    },
    { 
      id: 2, 
      partNumber: 'OF-2002', 
      partName: 'Oil Filter', 
      quantity: 36, 
      price: '$8.50', 
      tax: 'CGST', 
      totalPrice: '$306.00' 
    },
    { 
      id: 3, 
      partNumber: 'SP-4004', 
      partName: 'Spark Plugs', 
      quantity: 60, 
      price: '$4.99', 
      tax: 'SGST', 
      totalPrice: '$299.40' 
    },
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
    
    // Calculate total price
    const total = (parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit)).toFixed(2);
    
    // Add new part to the table
    const newPart = {
      id: inventoryData.length + 1,
      partNumber: formData.partNumber,
      partName: formData.partName,
      quantity: formData.quantity,
      price: `$${formData.pricePerUnit}`,
      tax: formData.taxType,
      totalPrice: `$${total}`
    };
    
    setInventoryData([...inventoryData, newPart]);
    // Reset form
    setFormData({
      carName: '',
      model: '',
      partNumber: '',
      partName: '',
      quantity: '',
      pricePerUnit: '',
      taxType: '',
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
            Inventory Management
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
                name="model"
                label="Model"
                variant="outlined"
                value={formData.model}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="partNumber"
                label="Part Number"
                variant="outlined"
                value={formData.partNumber}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="partName"
                label="Part Name"
                variant="outlined"
                value={formData.partName}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                variant="outlined"
                value={formData.quantity}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                name="pricePerUnit"
                label="Price Per Unit"
                type="number"
                variant="outlined"
                value={formData.pricePerUnit}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
              <FormControl sx={{ flex: '1 1 200px' }}>
                <InputLabel>Tax</InputLabel>
                <Select
                  name="taxType"
                  value={formData.taxType}
                  onChange={handleInputChange}
                  label="Tax"
                >
                  <MenuItem value="SGST">SGST</MenuItem>
                  <MenuItem value="CGST">CGST</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="taxAmount"
                label="Tax Amount"
                type="number"
                variant="outlined"
                value={formData.taxAmount}
                onChange={handleInputChange}
                sx={{ flex: '1 1 200px' }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  backgroundColor: '#ff4d4d',
                  '&:hover': {
                    backgroundColor: '#e63939',
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                Add Part
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
              <Table sx={{ minWidth: 650 }} aria-label="inventory table">
                <TableHead sx={{ bgcolor: '#ff4d4d' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Part No.</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name Of Part</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Qty</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price/Unit</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tax</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}
                    >
                      <TableCell>{row.partNumber}</TableCell>
                      <TableCell>{row.partName}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{row.tax}</TableCell>
                      <TableCell>{row.totalPrice}</TableCell>
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
                  {Array.from({ length: 10 - inventoryData.length }).map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                      <TableCell style={{ height: 53 }}></TableCell>
                      <TableCell></TableCell>
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

export default InventoryManagement;