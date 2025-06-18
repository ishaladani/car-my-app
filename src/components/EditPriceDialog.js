import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, InputAdornment } from '@mui/material';

const EditPriceDialog = ({ 
  showEditPriceDialog, 
  setShowEditPriceDialog, 
  isMobile, 
  editItem, 
  setEditItem, 
  saveEditedPrice 
}) => {
  return (
    <Dialog
      open={showEditPriceDialog}
      onClose={() => setShowEditPriceDialog(false)}
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" color="primary">
          Edit {editItem.field === "pricePerUnit" ? "Part Price" : "Labor Cost"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          label={editItem.field === "pricePerUnit" ? "New Price per Unit" : "New Labor Cost"}
          type="number"
          fullWidth
          variant="outlined"
          value={editItem.value}
          onChange={(e) => setEditItem({ ...editItem, value: e.target.value })}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setShowEditPriceDialog(false)} sx={{ width: isMobile ? "100%" : "auto" }}>
          Cancel
        </Button>
        <Button
          onClick={saveEditedPrice}
          variant="contained"
          color="primary"
          sx={{ width: isMobile ? "100%" : "auto", background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPriceDialog;