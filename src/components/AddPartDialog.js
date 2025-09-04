import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const AddPartDialog = ({
  showNewPartDialog,
  setShowNewPartDialog,
  isMobile,
  newPart,
  setNewPart,
  addNewPart,
  includeHsnField = true
}) => {
  const [addingPart, setAddingPart] = useState(false);
  const [partAddError, setPartAddError] = useState(null);
  const [partAddSuccess, setPartAddSuccess] = useState(false);

  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }

  // Tax calculation functions
  const calculateTaxAmount = (pricePerUnit, quantity, percentage) => {
    if (!pricePerUnit || !quantity || !percentage) return 0;
    const totalPrice = parseFloat(pricePerUnit) * parseInt(quantity);
    return (totalPrice * parseFloat(percentage)) / 100;
  };

  const calculateTotalTaxAmount = (pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage) => {
    let totalTax = 0;
    if (sgstEnabled && sgstPercentage) {
      totalTax += calculateTaxAmount(pricePerUnit, quantity, sgstPercentage);
    }
    if (cgstEnabled && cgstPercentage) {
      totalTax += calculateTaxAmount(pricePerUnit, quantity, cgstPercentage);
    }
    return totalTax;
  };

  const calculateTotalPrice = (pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage) => {
    if (!pricePerUnit || !quantity) return 0;
    const basePrice = parseFloat(pricePerUnit) * parseInt(quantity);
    const totalTax = calculateTotalTaxAmount(pricePerUnit, quantity, sgstEnabled, sgstPercentage, cgstEnabled, cgstPercentage);
    return basePrice + totalTax;
  };

  const checkDuplicatePartNumber = (partNumber, excludeId = null) => {
    // This would need to be implemented based on your inventory data
    return false; // Placeholder
  };

  const handlePartInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (partAddError) setPartAddError(null);
  };

  const handleAddPart = async () => {
    if (!newPart.partName?.trim()) {
      setPartAddError('Please fill part name');
      return;
    }

    if (newPart.quantity <= 0) {
      setPartAddError('Quantity must be greater than 0');
      return;
    }

    if (newPart.sellingPrice < 0) {
      setPartAddError('Price cannot be negative');
      return;
    }

    if (newPart.partNumber && checkDuplicatePartNumber(newPart.partNumber)) {
      setPartAddError('Part number already exists. Please use a different part number.');
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      const igstAmount = parseFloat(newPart.igst) || 0;
      const cgstAmount = parseFloat(newPart.cgst) || 0;

      const singlePartGST = (newPart.sellingPrice * (igstAmount + cgstAmount)) / 100;
      const taxAmount = singlePartGST * newPart.quantity;

      const requestData = {
        garageId: garageId,
        quantity: parseInt(newPart.quantity),
        purchasePrice: parseFloat(newPart.purchasePrice),
        sellingPrice: parseFloat(newPart.sellingPrice),
        partNumber: newPart.partNumber,
        partName: newPart.partName,
        carName: newPart.carName,
        model: newPart.model,
        hsnNumber: newPart.hsnNumber,
        igst: parseFloat(newPart.igst) || 0,
        cgst: parseFloat(newPart.cgst) || 0,
        taxAmount: taxAmount
      };


      const response = await axios.post(
        'https://garage-management-zi5z.onrender.com/api/garage/inventory/add',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      setPartAddSuccess(true);

      // Reset form
      setNewPart({
        garageId,
        name: "abc",
        carName: "",
        model: "",
        partNumber: "",
        partName: "",
        quantity: 1,
        purchasePrice: 0,
        sellingPrice: 0,
        hsnNumber: "",
        taxType: "igst",
        igst: 0,
        cgst: 0,
        taxAmount: 0
      });

      setTimeout(() => {
        setPartAddSuccess(false);
        handleCloseAddPartDialog();
      }, 1500);
    } catch (err) {
      console.error('Add part error:', err);
      setPartAddError(err.response?.data?.message || 'Failed to add part');
    } finally {
      setAddingPart(false);
    }
  };

  const handleCloseAddPartDialog = () => {
    setShowNewPartDialog(false);
    setPartAddError(null);
    setPartAddSuccess(false);
    setNewPart({
      garageId,
      name: "abc",
      carName: "",
      model: "",
      partNumber: "",
      partName: "",
      quantity: 1,
      purchasePrice: 0,
      sellingPrice: 0,
      hsnNumber: "",
              taxType: "igst",
        igst: 0,
        cgst: 0,
      taxAmount: 0
    });
  };

  return (
    <Dialog
      open={showNewPartDialog}
      onClose={handleCloseAddPartDialog}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold" color="primary">Add New Part to Inventory</Typography>
          <IconButton onClick={handleCloseAddPartDialog} disabled={addingPart}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {partAddSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Part added successfully!
          </Alert>
        )}
        {partAddError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {partAddError}
          </Alert>
        )}

        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Car Name *"
              name="carName"
              value={newPart.carName}
              onChange={handlePartInputChange}
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model *"
              name="model"
              value={newPart.model}
              onChange={handlePartInputChange}
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Part Number *"
              name="partNumber"
              value={newPart.partNumber}
              onChange={handlePartInputChange}
              required
              margin="normal"
              error={checkDuplicatePartNumber(newPart.partNumber)}
              helperText={checkDuplicatePartNumber(newPart.partNumber) ? "Part number already exists" : ""}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Part Name *"
              name="partName"
              value={newPart.partName}
              onChange={handlePartInputChange}
              required
              margin="normal"
              error={!newPart.partName?.trim() && !!partAddError}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity *"
              name="quantity"
              type="number"
              value={newPart.quantity}
              onChange={handlePartInputChange}
              required
              margin="normal"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Purchase Price *"
              name="purchasePrice"
              type="number"
              value={newPart.purchasePrice}
              onChange={handlePartInputChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Selling Price *"
              name="sellingPrice"
              type="number"
              value={newPart.sellingPrice}
              onChange={handlePartInputChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          {includeHsnField && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="HSN Code"
                name="hsnNumber"
                value={newPart.hsnNumber}
                onChange={handlePartInputChange}
                margin="normal"
                inputProps={{ maxLength: 8 }}
              />
            </Grid>
          )}
        </Grid>

        {/* Tax Fields */}
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="IGST (%)"
                name="igst"
                type="number"
                value={newPart.igst}
                onChange={handlePartInputChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 30, step: 0.01 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CGST (%)"
                name="cgst"
                type="number"
                value={newPart.cgst}
                onChange={handlePartInputChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 15, step: 0.01 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Tax Preview */}
        {newPart.sellingPrice && newPart.quantity && (newPart.igst || newPart.cgst) && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>GST Calculation Preview</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Selling Price per Unit: ₹{parseFloat(newPart.sellingPrice || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {newPart.quantity}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="primary">
                  Single Part GST: ₹{(() => {
                    const igst = parseFloat(newPart.igst) || 0;
                    const cgst = parseFloat(newPart.cgst) || 0;
                    const igstAmount = (newPart.sellingPrice * igst) / 100;
                    const cgstAmount = (newPart.sellingPrice * cgst) / 100;
                    const singlePartGST = igstAmount + cgstAmount;
                    return singlePartGST.toFixed(2);
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="success.main">
                  Total GST for Quantity: ₹{(() => {
                    const igst = parseFloat(newPart.igst) || 0;
                    const cgst = parseFloat(newPart.cgst) || 0;
                    const igstAmount = (newPart.sellingPrice * igst) / 100;
                    const cgstAmount = (newPart.sellingPrice * cgst) / 100;
                    const singlePartGST = igstAmount + cgstAmount;
                    return (singlePartGST * newPart.quantity).toFixed(2);
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" color="success.dark">
                  Total Amount (Including GST): ₹{(() => {
                    const igst = parseFloat(newPart.igst) || 0;
                    const cgst = parseFloat(newPart.cgst) || 0;
                    const igstAmount = (newPart.sellingPrice * igst) / 100;
                    const cgstAmount = (newPart.sellingPrice * cgst) / 100;
                    const singlePartGST = igstAmount + cgstAmount;
                    const totalAmount = (newPart.sellingPrice + singlePartGST) * newPart.quantity;
                    return totalAmount.toFixed(2);
                  })()}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
        <Button
          onClick={handleCloseAddPartDialog}
          disabled={addingPart}
          sx={{ width: isMobile ? "100%" : "auto" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddPart}
          disabled={addingPart || checkDuplicatePartNumber(newPart.partNumber) || !newPart.partName?.trim() || newPart.quantity <= 0 || newPart.sellingPrice <= 0}
          variant="contained"
          color="primary"
          startIcon={addingPart ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          sx={{
            width: isMobile ? "100%" : "auto",
            backgroundColor: '#ff4d4d',
            '&:hover': { backgroundColor: '#e63939' }
          }}
        >
          {addingPart ? 'Adding...' : 'Add Part'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPartDialog;