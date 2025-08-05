import React from "react";
import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  Check as CheckIcon,
  Download as DownloadIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Print as PrintIcon,
} from "@mui/icons-material";

const ThankYouSection = ({
  carDetails,
  summary,
  gstSettings,
  paymentMethod,
  isMobile,
  downloadPdfBill,
  printInvoice,                // ← Passed from AutoServeBilling
  sendBillViaWhatsApp,
  sendingWhatsApp,
  openEmailDialog,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 5,
        px: 4,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 3,
        color: "white",
        maxWidth: "900px",
        margin: "0 auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      {/* Success Icon */}
      <CheckIcon
        sx={{
          fontSize: 80,
          color: "white",
          mb: 2,
          background: "rgba(255,255,255,0.2)",
          borderRadius: "50%",
          p: 2,
        }}
      />

      {/* Title */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Payment Successful! 🎉
      </Typography>
      <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
        Professional invoice generated and processed successfully
      </Typography>

      {/* Invoice Summary */}
      <Box
        sx={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          p: 3,
          mb: 4,
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography variant="body1" gutterBottom>
          📄 Invoice #{carDetails.invoiceNo}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          Amount: ₹{summary.totalAmount.toLocaleString("en-IN")}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
          {gstSettings.billType === 'gst' ? "Including GST" : "Excluding GST"} •
          Payment: {paymentMethod || "Cash"}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
        Choose how you'd like to share this professional invoice:
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Download PDF */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            minWidth: isMobile ? "100%" : 200,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.3)",
            },
          }}
          startIcon={<DownloadIcon />}
          onClick={downloadPdfBill}
        >
          Download PDF
        </Button>

        {/* Print Invoice */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            minWidth: isMobile ? "100%" : 200,
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
          startIcon={<PrintIcon />}
          onClick={printInvoice}
        >
          Print Invoice
        </Button>

        {/* WhatsApp */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#25d366",
            color: "white",
            minWidth: isMobile ? "100%" : 200,
            "&:hover": {
              backgroundColor: "#128c7e",
            },
          }}
          startIcon={<WhatsAppIcon />}
          onClick={sendBillViaWhatsApp}
          disabled={sendingWhatsApp}
        >
          {sendingWhatsApp ? "Preparing..." : "WhatsApp Invoice"}
        </Button>

        {/* Email */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            minWidth: isMobile ? "100%" : 200,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.3)",
            },
          }}
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