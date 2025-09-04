import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import emailjs from 'emailjs-com';
import { EMAILJS_CONFIG, initEmailJS, isEmailJSConfigured } from '../config/emailjs';

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
  carDetails,
  garageDetails,
  gstSettings,
  summary,
  jobCardData,
  generateProfessionalGSTInvoice // Pass the PDF generation function from parent
}) => {
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Initialize EmailJS when component mounts
  useEffect(() => {
    initEmailJS();
  }, []);

  const sendBillViaEmail = async () => {
    if (!emailRecipient || !emailRecipient.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if EmailJS is configured
    if (!isEmailJSConfigured()) {
      setEmailError('❌ EmailJS is not configured. Please update the configuration in src/config/emailjs.js');
      return;
    }

    setIsSending(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      // Generate the professional PDF using the same function as download
      const doc = generateProfessionalGSTInvoice();
      
      // Convert PDF to base64 for email attachment
      const pdfDataUri = doc.output('datauristring');
      const base64 = pdfDataUri.split(',')[1];

      // Prepare email template parameters
      const templateParams = {
        to_email: emailRecipient,
        subject: emailSubject || `Invoice #${carDetails.invoiceNo} - ${garageDetails.name}`,
        message: emailMessage || `Dear ${carDetails.customerName},\n\nPlease find your invoice #${carDetails.invoiceNo} attached.\n\nThank you for choosing our services!\n\nBest regards,\n${garageDetails.name}`,
        invoice_number: carDetails.invoiceNo,
        customer_name: carDetails.customerName,
        total_amount: summary.totalAmount,
        garage_name: garageDetails.name,
        attachment: base64,
        attachment_name: `Invoice_${carDetails.invoiceNo}.pdf`
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      if (response.status === 200) {
        setEmailSuccess('✅ Invoice sent successfully!');
        setTimeout(() => {
          setShowEmailDialog(false);
          setEmailSuccess('');
        }, 2000);
      } else {
        throw new Error('Email service returned non-200 status');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      if (err.message && err.message.includes('Public Key is invalid')) {
        setEmailError('❌ EmailJS configuration error. Please check your PUBLIC_KEY in src/config/emailjs.js');
      } else if (err.message && err.message.includes('Service ID')) {
        setEmailError('❌ EmailJS service error. Please check your SERVICE_ID in src/config/emailjs.js');
      } else if (err.message && err.message.includes('Template ID')) {
        setEmailError('❌ EmailJS template error. Please check your TEMPLATE_ID in src/config/emailjs.js');
      } else {
        setEmailError(`❌ Failed to send invoice: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsSending(false);
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
        {/* Error/Success Messages */}
        {emailError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {emailError}
          </Alert>
        )}
        {emailSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {emailSuccess}
          </Alert>
        )}

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
              disabled={isSending}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Subject"
              variant="outlined"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder={`Invoice #${carDetails.invoiceNo} - ${garageDetails.name}`}
              disabled={isSending}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Message"
              multiline
              rows={6}
              variant="outlined"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder={`Dear ${carDetails.customerName},\n\nPlease find your invoice #${carDetails.invoiceNo} attached.\n\nThank you for choosing our services!\n\nBest regards,\n${garageDetails.name}`}
              helperText="This message will be sent along with the professional PDF invoice attachment"
              disabled={isSending}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 3, backgroundColor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
              <Typography variant="body2" fontWeight={500}>
                📎 Professional PDF invoice will be auto-attached
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                Includes complete invoice details, GST breakdown, and professional formatting
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={() => setShowEmailDialog(false)} 
          sx={{ width: isMobile ? '100%' : 'auto' }}
          disabled={isSending}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
          onClick={sendBillViaEmail}
          disabled={!emailRecipient.includes('@') || isSending}
          fullWidth={isMobile}
          sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
        >
          {isSending ? 'Sending Invoice...' : 'Send Professional Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailDialog;
