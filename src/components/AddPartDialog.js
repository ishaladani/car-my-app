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
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
      const sgstAmount = newPart.sgstEnabled ?
        calculateTaxAmount(newPart.sellingPrice, newPart.quantity, newPart.sgstPercentage) : 0;
      const cgstAmount = newPart.cgstEnabled ?
        calculateTaxAmount(newPart.sellingPrice, newPart.quantity, newPart.cgstPercentage) : 0;

      const taxAmount = sgstAmount + cgstAmount;

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
        taxType: newPart.taxType,
        igst: parseFloat(newPart.igst) || 0,
        cgstSgst: parseFloat(newPart.cgstSgst) || 0,
        sgstEnabled: newPart.sgstEnabled,
        sgstPercentage: parseFloat(newPart.sgstPercentage) || 0,
        cgstEnabled: newPart.cgstEnabled,
        cgstPercentage: parseFloat(newPart.cgstPercentage) || 0,
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
        cgstSgst: 0,
        sgstEnabled: false,
        sgstPercentage: '',
        cgstEnabled: false,
        cgstPercentage: '',
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
      cgstSgst: 0,
      sgstEnabled: false,
      sgstPercentage: '',
      cgstEnabled: false,
      cgstPercentage: '',
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
      <DialogContent sx={{ p: 3 }}>
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

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Part Number"
              name="partNumber"
              value={newPart.partNumber}
              onChange={handlePartInputChange}
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
              error={!newPart.partName?.trim() && !!partAddError}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Car Name"
              name="carName"
              value={newPart.carName}
              onChange={handlePartInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model"
              name="model"
              value={newPart.model}
              onChange={handlePartInputChange}
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
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Purchase Price"
              name="purchasePrice"
              type="number"
              value={newPart.purchasePrice}
              onChange={handlePartInputChange}
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
                inputProps={{ maxLength: 8 }}
              />
            </Grid>
          )}
        </Grid>

        {/* Tax Configuration Section */}
        <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Tax Configuration</Typography>

          <Grid container spacing={2}>
            {/* SGST Section */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="sgstEnabled"
                      checked={newPart.sgstEnabled}
                      onChange={handlePartInputChange}
                    />
                  }
                  label="Enable SGST"
                />
                {newPart.sgstEnabled && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      name="sgstPercentage"
                      label="SGST Percentage (%)"
                      type="number"
                      variant="outlined"
                      value={newPart.sgstPercentage}
                      onChange={handlePartInputChange}
                      required={newPart.sgstEnabled}
                      inputProps={{ min: 0, max: 100, step: "0.01" }}
                      fullWidth
                      size="small"
                    />
                    {newPart.sellingPrice && newPart.quantity && newPart.sgstPercentage && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        SGST Amount: ₹{calculateTaxAmount(newPart.sellingPrice, newPart.quantity, newPart.sgstPercentage).toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* CGST Section */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="cgstEnabled"
                      checked={newPart.cgstEnabled}
                      onChange={handlePartInputChange}
                    />
                  }
                  label="Enable CGST"
                />
                {newPart.cgstEnabled && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      name="cgstPercentage"
                      label="CGST Percentage (%)"
                      type="number"
                      variant="outlined"
                      value={newPart.cgstPercentage}
                      onChange={handlePartInputChange}
                      required={newPart.cgstEnabled}
                      inputProps={{ min: 0, max: 100, step: "0.01" }}
                      fullWidth
                      size="small"
                    />
                    {newPart.sellingPrice && newPart.quantity && newPart.cgstPercentage && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        CGST Amount: ₹{calculateTaxAmount(newPart.sellingPrice, newPart.quantity, newPart.cgstPercentage).toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Total Tax and Price Display */}
          {newPart.sellingPrice && newPart.quantity && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="primary">
                    Total Tax: ₹{calculateTotalTaxAmount(
                      newPart.sellingPrice,
                      newPart.quantity,
                      newPart.sgstEnabled,
                      newPart.sgstPercentage,
                      newPart.cgstEnabled,
                      newPart.cgstPercentage
                    ).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {newPart.sgstEnabled && newPart.sgstPercentage && (
                      <>SGST: ₹{calculateTaxAmount(newPart.sellingPrice, newPart.quantity, newPart.sgstPercentage).toFixed(2)}</>
                    )}
                    {newPart.sgstEnabled && newPart.cgstEnabled && newPart.sgstPercentage && newPart.cgstPercentage && <> + </>}
                    {newPart.cgstEnabled && newPart.cgstPercentage && (
                      <>CGST: ₹{calculateTaxAmount(newPart.sellingPrice, newPart.quantity, newPart.cgstPercentage).toFixed(2)}</>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">
                    Total Price: ₹{calculateTotalPrice(
                      newPart.sellingPrice,
                      newPart.quantity,
                      newPart.sgstEnabled,
                      newPart.sgstPercentage,
                      newPart.cgstEnabled,
                      newPart.cgstPercentage
                    ).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Base Price: ₹{(parseFloat(newPart.sellingPrice) * parseInt(newPart.quantity || 0)).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
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
          startIcon={addingPart ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            width: isMobile ? "100%" : "auto",
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
          }}
        >
          {addingPart ? 'Adding...' : 'Add Part'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPartDialog;