import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography, InputAdornment } from '@mui/material';

const AddPartDialog = ({ 
  showNewPartDialog, 
  setShowNewPartDialog, 
  isMobile, 
  newPart, 
  setNewPart, 
  addNewPart, 
  includeHsnField, 
  gstSettings, 
  inventoryParts 
}) => {
  // Find selected inventory part for auto-fill
  const selectedInv = inventoryParts?.find(p => p.name === newPart.name) || {};
  // GST auto-fill
  const sgst = gstSettings?.sgstPercentage || 9;
  const cgst = gstSettings?.cgstPercentage || 9;
  const igst = gstSettings?.gstPercentage || 18;
  const isInterState = gstSettings?.isInterState;

  return (
    <Dialog
      open={showNewPartDialog}
      onClose={() => setShowNewPartDialog(false)}
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" color="primary">Add Part from Inventory</Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              label="Select Part"
              fullWidth
              SelectProps={{ native: true }}
              value={newPart.name}
              onChange={e => {
                const inv = inventoryParts?.find(p => p.name === e.target.value) || {};
                setNewPart({
                  ...newPart,
                  name: e.target.value,
                  pricePerUnit: inv.sellingPrice || 0,
                  hsnNumber: inv.hsnNumber || "8708",
                });
              }}
            >
              <option value="">-- Select --</option>
              {inventoryParts?.map(p => (
                <option key={p._id} value={p.name}>
                  {p.name} (Stock: {p.stock || 0})
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={newPart.quantity}
              onChange={e => setNewPart({ ...newPart, quantity: e.target.value })}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Price per Unit"
              type="number"
              fullWidth
              variant="outlined"
              value={newPart.pricePerUnit}
              onChange={e => setNewPart({ ...newPart, pricePerUnit: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="HSN Code"
              fullWidth
              variant="outlined"
              value={newPart.hsnNumber || "8708"}
              onChange={e => setNewPart({ ...newPart, hsnNumber: e.target.value })}
              inputProps={{ maxLength: 8 }}
            />
          </Grid>
          {gstSettings?.billType === "gst" && (
            <>
              {!isInterState ? (
                <>
                  <Grid item xs={3}>
                    <TextField
                      label="SGST (%)"
                      fullWidth
                      variant="outlined"
                      value={sgst}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="CGST (%)"
                      fullWidth
                      variant="outlined"
                      value={cgst}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={6}>
                  <TextField
                    label="IGST (%)"
                    fullWidth
                    variant="outlined"
                    value={igst}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              )}
            </>
          )}
          <Grid item xs={12}>
            <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={500}>
                Total Amount: ₹{(newPart.quantity * newPart.pricePerUnit).toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setShowNewPartDialog(false)} sx={{ width: isMobile ? "100%" : "auto" }}>
          Cancel
        </Button>
        <Button
          onClick={addNewPart}
          variant="contained"
          color="primary"
          sx={{ width: isMobile ? "100%" : "auto", background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
          disabled={!newPart.name || newPart.quantity <= 0 || newPart.pricePerUnit <= 0}
        >
          Add Part
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPartDialog;