import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography, InputAdornment } from '@mui/material';

const AddServiceDialog = ({ 
  showNewServiceDialog, 
  setShowNewServiceDialog, 
  isMobile, 
  newService, 
  setNewService, 
  addNewService 
}) => {
  return (
    <Dialog
      open={showNewServiceDialog}
      onClose={() => setShowNewServiceDialog(false)}
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" color="primary">⚙️ Add New Service</Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              label="Service Name"
              fullWidth
              variant="outlined"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              placeholder="e.g., Engine Tune-up, Brake Service, Oil Change"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Engineer/Technician Name"
              fullWidth
              variant="outlined"
              value={newService.engineer}
              onChange={(e) => setNewService({ ...newService, engineer: e.target.value })}
              placeholder="Enter engineer or technician name"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Service Cost"
              type="number"
              fullWidth
              variant="outlined"
              value={newService.laborCost}
              onChange={(e) => setNewService({ ...newService, laborCost: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setShowNewServiceDialog(false)} sx={{ width: isMobile ? "100%" : "auto" }}>
          Cancel
        </Button>
        <Button
          onClick={addNewService}
          variant="contained"
          color="primary"
          sx={{ width: isMobile ? "100%" : "auto", background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
          disabled={!newService.name || !newService.engineer || newService.laborCost <= 0}
        >
          Add Service
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddServiceDialog;