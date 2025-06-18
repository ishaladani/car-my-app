import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography, InputAdornment } from '@mui/material';

const AddPartDialog = ({ 
  showNewPartDialog, 
  setShowNewPartDialog, 
  isMobile, 
  newPart, 
  setNewPart, 
  addNewPart 
}) => {
  return (
    <Dialog
      open={showNewPartDialog}
      onClose={() => setShowNewPartDialog(false)}
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" color="primary">🔧 Add New Part</Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              label="Part Name"
              fullWidth
              variant="outlined"
              value={newPart.name}
              onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
              placeholder="e.g., Brake Pads, Engine Oil, Spark Plugs"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={newPart.quantity}
              onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })}
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
              onChange={(e) => setNewPart({ ...newPart, pricePerUnit: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
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