import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Typography } from '@mui/material';

const ProcessingPaymentDialog = ({ showProcessModal, setShowProcessModal, isMobile, paymentMethod, processPayment }) => {
  return (
    <Dialog
      open={showProcessModal}
      onClose={() => setShowProcessModal(false)}
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="primary">Processing Payment</Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <LinearProgress sx={{ mb: 3, height: 8, borderRadius: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }} />
          <Typography variant="h6" gutterBottom>Processing your {paymentMethod} payment...</Typography>
          <Typography variant="body2" color="text.secondary">Please wait while we generate your professional invoice</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setShowProcessModal(false)} color="error" sx={{ width: isMobile ? "100%" : "auto" }}>
          Cancel
        </Button>
        <Button
          onClick={processPayment}
          variant="contained"
          color="primary"
          sx={{ width: isMobile ? "100%" : "auto", background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
        >
          Confirm Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessingPaymentDialog;