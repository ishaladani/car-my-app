import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, initEmailJS } from '../config/emailjs';

const EmailDialog = ({
  showEmailDialog,
  setShowEmailDialog,
  isMobile,
  emailRecipient,
  setEmailRecipient,
  emailSubject,
  setEmailSubject,
  emailMessage,
  setEmailMessage,
  carDetails
}) => {

  // Initialize EmailJS when component mounts
  useEffect(() => {
    initEmailJS();
  }, []);

  const sendBillViaEmail = async () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Invoice", 20, 20);
      doc.setFontSize(12);
      doc.text(`Car: ${carDetails?.carName || 'N/A'}`, 20, 40);
      doc.text(`Model: ${carDetails?.model || 'N/A'}`, 20, 50);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
      doc.text(`Thanks for choosing our service.`, 20, 80);

      const pdfDataUri = doc.output('datauristring'); // base64 PDF
      const base64 = pdfDataUri.split(',')[1]; // remove the data: prefix

      const templateParams = {
        to_email: emailRecipient,
        subject: emailSubject,
        message: emailMessage,
        attachment: base64
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      alert('✅ Invoice sent successfully!');
      setShowEmailDialog(false);
    } catch (err) {
      console.error('Error sending email:', err);
      alert('❌ Failed to send invoice.');
    }
  };

  return (
    <Dialog
      open={showEmailDialog}
      onClose={() => setShowEmailDialog(false)}
      fullScreen={isMobile}
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold" color="primary">
          📧 Send Professional Invoice via Email
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recipient Email Address"
              type="email"
              variant="outlined"
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
              required
              helperText="Enter the customer's email address"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Subject"
              variant="outlined"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Message"
              multiline
              rows={8}
              variant="outlined"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              helperText="This message will be sent along with the PDF invoice attachment"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 3, backgroundColor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
              <Typography variant="body2" fontWeight={500}>
                📎 PDF invoice will be auto-attached
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                Includes car details and formatted layout
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setShowEmailDialog(false)} sx={{ width: isMobile ? '100%' : 'auto' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          onClick={sendBillViaEmail}
          disabled={!emailRecipient.includes('@')}
          fullWidth={isMobile}
          sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
        >
          Send Professional Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailDialog;
