import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Check as CheckIcon, Download as DownloadIcon, WhatsApp as WhatsAppIcon, Email as EmailIcon } from '@mui/icons-material';

const ThankYouSection = ({ 
  carDetails, 
  summary, 
  gstSettings, 
  paymentMethod, 
  isMobile, 
  downloadPdfBill, 
  sendBillViaWhatsApp, 
  sendingWhatsApp, 
  openEmailDialog 
}) => {
  return (
    <Box sx={{ textAlign: "center", py: 5, px: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3, color: 'white' }}>
      <CheckIcon sx={{ fontSize: 80, color: "white", mb: 2, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 2 }} />
      <Typography variant="h4" gutterBottom fontWeight="bold">Payment Successful! 🎉</Typography>
      <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>Professional invoice generated and processed successfully</Typography>
      
      <Box sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 3, mb: 4, backdropFilter: 'blur(10px)' }}>
        <Typography variant="body1" gutterBottom>📄 Invoice #{carDetails.invoiceNo}</Typography>
        <Typography variant="h5" fontWeight="bold">Amount: ₹{summary.totalAmount}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
          {gstSettings.includeGst ? 'Including GST' : 'Excluding GST'} • Payment: {paymentMethod || 'Cash'}
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>Choose how you'd like to share this professional invoice:</Typography>

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', minWidth: isMobile ? '100%' : 200 }}
          startIcon={<DownloadIcon />}
          onClick={downloadPdfBill}
        >
          Download PDF Invoice
        </Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: '#25d366', color: 'white', minWidth: isMobile ? '100%' : 200 }}
          startIcon={<WhatsAppIcon />}
          onClick={sendBillViaWhatsApp}
          disabled={sendingWhatsApp}
        >
          {sendingWhatsApp ? "Preparing..." : "Send via WhatsApp"}
        </Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', minWidth: isMobile ? '100%' : 200 }}
          startIcon={<EmailIcon />}
          onClick={openEmailDialog}
        >
          Email Invoice
        </Button>
      </Box>
    </Box>
  );
};

export default ThankYouSection;