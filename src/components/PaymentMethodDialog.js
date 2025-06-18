import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { AccountBalance as AccountBalanceIcon, CreditCard as CreditCardIcon, Receipt as ReceiptIcon } from '@mui/icons-material';

const PaymentMethodDialog = ({ showPaymentModal, setShowPaymentModal, isMobile, selectPaymentMethod }) => {
  return (
    <Dialog
      open={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">Select Payment Method</Typography>
        <Typography variant="body2" color="text.secondary">Choose how the customer will pay for this service</Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              sx={{ py: 2, borderRadius: 2, background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)' }}
              startIcon={<AccountBalanceIcon />}
              onClick={() => selectPaymentMethod("Cash")}
            >
              💵 Cash Payment
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ py: 2, borderRadius: 2, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
              startIcon={<CreditCardIcon />}
              onClick={() => selectPaymentMethod("Card")}
            >
              💳 Credit/Debit Card
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ py: 2, borderRadius: 2, background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)' }}
              startIcon={<ReceiptIcon />}
              onClick={() => selectPaymentMethod("Online Payment")}
            >
              🌐 Online Payment (UPI/Net Banking)
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setShowPaymentModal(false)} sx={{ width: isMobile ? "100%" : "auto" }} color="error">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentMethodDialog;