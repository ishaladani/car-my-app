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
  sendBillViaWhatsApp,
  sendingWhatsApp,
  openEmailDialog,
  garageDetails,
  parts,
  laborServicesTotal,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Reuse the generateProfessionalGSTInvoice logic (passed from parent or define locally if needed)
  // This function is expected to be available from parent (AutoServeBilling)
  const generatePdfForPrint = () => {
    try {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 30;
      const contentWidth = pageWidth - margin * 2;
      let currentY = 40;

      const drawBorderedRect = (x, y, width, height, fillColor = null) => {
        if (fillColor) {
          doc.setFillColor(fillColor);
          doc.rect(x, y, width, height, 'F');
        }
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.rect(x, y, width, height);
      };

      const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventy', 'Eighteen', 'Nineteen'];
        if (num === 0) return 'Zero';
        let words = '';
        if (num >= 10000000) {
          words += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
          num %= 10000000;
        }
        if (num >= 100000) {
          words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
          num %= 100000;
        }
        if (num >= 1000) {
          words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
          num %= 1000;
        }
        if (num >= 100) {
          words += ones[Math.floor(num / 100)] + ' Hundred ';
          num %= 100;
        }
        if (num >= 20) {
          words += tens[Math.floor(num / 10)];
          if (num % 10 !== 0) words += ' ' + ones[num % 10];
        } else if (num >= 10) {
          words += teens[num - 10];
        } else if (num > 0) {
          words += ones[num];
        }
        return words.trim();
      };

      // -----------------------------
      // HEADER
      // -----------------------------
      drawBorderedRect(margin, currentY, contentWidth, 100);
      if (garageDetails.logoUrl) {
        const logoImg = new Image();
        logoImg.src = garageDetails.logoUrl;
        logoImg.onload = () => {
          doc.addImage(logoImg, 'PNG', margin + 10, currentY + 10, 50, 50);
        };
      }
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const companyName = garageDetails.name || "AutoServe";
      const companyNameWidth = doc.getTextWidth(companyName);
      doc.text(companyName, margin + (contentWidth - companyNameWidth) / 2, currentY + 25);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const addressLine = `${garageDetails.address}`;
      const addressWidth = doc.getTextWidth(addressLine);
      doc.text(addressLine, (pageWidth - addressWidth) / 2, currentY + 45);
      const gstLine = `GST No: ${garageDetails.gstNumber || 'N/A'}`;
      const gstWidth = doc.getTextWidth(gstLine);
      doc.text(gstLine, (pageWidth - gstWidth) / 2, currentY + 65);
      if (garageDetails.phone) {
        const phoneLine = `Phone: ${garageDetails.phone}`;
        const phoneWidth = doc.getTextWidth(phoneLine);
        doc.text(phoneLine, (pageWidth - phoneWidth) / 2, currentY + 80);
      }
      if (garageDetails.email) {
        const emailLine = `Email: ${garageDetails.email}`;
        const emailWidth = doc.getTextWidth(emailLine);
        doc.text(emailLine, (pageWidth - emailWidth) / 2, currentY + 95);
      }
      currentY += 100;

      // -----------------------------
      // BILL TO & SHIP TO
      // -----------------------------
      const billShipY = currentY;
      const sectionWidth = contentWidth / 2 - 5;
      drawBorderedRect(margin, billShipY, sectionWidth, 120);
      doc.setFont("helvetica", "bold");
      doc.text("Bill to:", margin + 10, billShipY + 20);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${gstSettings.billToParty || carDetails.customerName}`, margin + 10, billShipY + 40);
      doc.text(`Contact: ${carDetails.contact}`, margin + 10, billShipY + 55);
      if (carDetails.email) doc.text(`Email: ${carDetails.email}`, margin + 10, billShipY + 70);
      if (gstSettings.customerGstNumber && gstSettings.billType === 'gst') {
        doc.text(`GST No: ${gstSettings.customerGstNumber}`, margin + 10, billShipY + 85);
      }

      drawBorderedRect(margin + sectionWidth + 10, billShipY, sectionWidth, 120);
      doc.setFont("helvetica", "bold");
      doc.text("Ship To / Insurance:", margin + sectionWidth + 20, billShipY + 20);
      doc.setFont("helvetica", "normal");
      doc.text(`Insurance: ${gstSettings.shiftToParty}`, margin + sectionWidth + 20, billShipY + 40);
      doc.text(`Vehicle: ${carDetails.company} ${carDetails.model}`, margin + sectionWidth + 20, billShipY + 55);
      doc.text(`Reg No: ${carDetails.carNumber}`, margin + sectionWidth + 20, billShipY + 70);
      doc.text(`Invoice No: ${carDetails.invoiceNo}`, margin + sectionWidth + 20, billShipY + 100);
      doc.text(`Date: ${carDetails.billingDate}`, margin + sectionWidth + 20, billShipY + 115);
      currentY = billShipY + 140;

      // -----------------------------
      // ITEMS TABLE
      // -----------------------------
      const tableStartY = currentY;
      const colWidths = { srNo: 40, productName: 180, hsnSac: 60, qty: 35, unit: 40, rate: 70, gstPercent: 50, amount: 70 };
      const totalTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
      const headerY = tableStartY;
      drawBorderedRect(margin, headerY, totalTableWidth, 30, '#f0f0f0');
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      let colX = margin;
      ["Sr.No", "Product/Service Name", "HSN/SAC", "Qty", "Unit", "Rate", "GST%", "Amount"].forEach((text, i) => {
        const w = colWidths[Object.keys(colWidths)[i]];
        const txtW = doc.getTextWidth(text);
        doc.text(text, colX + (w - txtW) / 2, headerY + 20);
        if (i < 7) doc.line(colX + w, headerY, colX + w, headerY + 30);
        colX += w;
      });
      currentY = headerY + 30;
      doc.setFont("helvetica", "normal");
      let rowIndex = 1;

      const drawTableRow = (rowData, y) => {
        const rowHeight = 25;
        drawBorderedRect(margin, y, totalTableWidth, rowHeight);
        colX = margin;
        rowData.forEach((cell, i) => {
          const w = colWidths[Object.keys(colWidths)[i]];
          const display = cell.toString();
          const txtW = doc.getTextWidth(display);
          if (i === 0 || i >= 3) {
            doc.text(display, colX + w - txtW - 5, y + 17);
          } else {
            doc.text(display, colX + 5, y + 17);
          }
          if (i < 7) doc.line(colX + w, y, colX + w, y + rowHeight);
          colX += w;
        });
        return rowHeight;
      };

      parts.forEach(part => {
        const gstDisplay = gstSettings.billType === 'gst' ? `${gstSettings.gstPercentage}%` : '0%';
        const row = [
          rowIndex++,
          part.name,
          part.hsnNumber || "8708",
          part.quantity,
          "Nos",
          part.pricePerUnit.toFixed(2),
          gstDisplay,
          part.total.toFixed(2)
        ];
        currentY += drawTableRow(row, currentY);
      });

      if (laborServicesTotal > 0) {
        const gstDisplay = gstSettings.billType === 'gst' ? `${gstSettings.gstPercentage}%` : '0%';
        const row = [
          rowIndex++,
          "Labor & Services",
          "9954",
          "1",
          "Nos",
          laborServicesTotal.toFixed(2),
          gstDisplay,
          laborServicesTotal.toFixed(2)
        ];
        currentY += drawTableRow(row, currentY);
      }

      const minRows = 8;
      const filledRows = parts.length + (laborServicesTotal > 0 ? 1 : 0);
      for (let i = filledRows; i < minRows; i++) {
        currentY += drawTableRow(["", "", "", "", "", "", "", ""], currentY);
      }
      currentY += 10;

      // -----------------------------
      // SUMMARY
      // -----------------------------
      const summaryWidth = 200;
      const summaryX = pageWidth - margin - summaryWidth;
      drawBorderedRect(summaryX, currentY, summaryWidth, 25);
      doc.setFont("helvetica", "bold");
      doc.text("Sub Total", summaryX + 10, currentY + 17);
      doc.text(summary.subtotal.toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
      currentY += 25;

      if (gstSettings.billType === 'gst' && summary.gstAmount > 0) {
        if (gstSettings.isInterState) {
          drawBorderedRect(summaryX, currentY, summaryWidth, 25);
          doc.text(`IGST ${gstSettings.gstPercentage}%`, summaryX + 10, currentY + 17);
          doc.text(summary.gstAmount.toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
          currentY += 25;
        } else {
          drawBorderedRect(summaryX, currentY, summaryWidth, 25);
          doc.text(`CGST ${gstSettings.cgstPercentage}%`, summaryX + 10, currentY + 17);
          doc.text((summary.gstAmount / 2).toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
          currentY += 25;
          drawBorderedRect(summaryX, currentY, summaryWidth, 25);
          doc.text(`SGST ${gstSettings.sgstPercentage}%`, summaryX + 10, currentY + 17);
          doc.text((summary.gstAmount / 2).toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
          currentY += 25;
        }
      }

      if (summary.discount > 0) {
        drawBorderedRect(summaryX, currentY, summaryWidth, 25);
        doc.text("Discount", summaryX + 10, currentY + 17);
        doc.text(`-${summary.discount.toFixed(2)}`, summaryX + summaryWidth - 80, currentY + 17);
        currentY += 25;
      }

      const roundOff = Math.round(summary.totalAmount) - summary.totalAmount;
      if (Math.abs(roundOff) > 0.01) {
        drawBorderedRect(summaryX, currentY, summaryWidth, 25);
        doc.text("Round Off", summaryX + 10, currentY + 17);
        doc.text(roundOff.toFixed(2), summaryX + summaryWidth - 80, currentY + 17);
        currentY += 25;
      }

      drawBorderedRect(summaryX, currentY, summaryWidth, 30, '#f0f0f0');
      doc.setFontSize(12);
      doc.text("Grand Total", summaryX + 10, currentY + 20);
      doc.text(Math.round(summary.totalAmount).toFixed(2), summaryX + summaryWidth - 80, currentY + 20);
      currentY += 40;

      const amountInWords = numberToWords(Math.round(summary.totalAmount)) + " Only";
      drawBorderedRect(margin, currentY, contentWidth, 30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Bill Amount:", margin + 10, currentY + 15);
      doc.setFont("helvetica", "normal");
      doc.text(amountInWords, margin + 80, currentY + 15);
      currentY += 40;

      return doc;
    } catch (error) {
      console.error("Error generating PDF for print:", error);
      alert("Failed to generate invoice for printing. Please try again.");
      return null;
    }
  };

  // ✅ Fixed: Print Invoice Handler (Single onload, proper cleanup)
  const printInvoice = () => {
    try {
      const doc = generatePdfForPrint();
      if (!doc) return;

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement('iframe');

      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.src = url;

      document.body.appendChild(iframe);

      // ✅ Single onload handler with print + cleanup
      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();

          // Clean up after print
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 1000);
        } catch (printError) {
          console.error("Error during print:", printError);
          alert("Printing failed. Please try again.");
        }
      };

      // Optional: Handle load error
      iframe.onerror = () => {
        alert("Failed to load PDF for printing.");
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Error in printInvoice:", error);
      alert("An unexpected error occurred while printing.");
    }
  };

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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Payment Successful! 🎉
      </Typography>
      <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
        Professional invoice generated and processed successfully
      </Typography>

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
          {gstSettings.includeGst ? "Including GST" : "Excluding GST"} •
          Payment: {paymentMethod || "Cash"}
        </Typography>
      </Box>

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
        <Button
          variant="contained"
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            minWidth: isMobile ? "100%" : 200,
          }}
          startIcon={<DownloadIcon />}
          onClick={downloadPdfBill}
        >
          Download PDF
        </Button>

        {/* <Button
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            minWidth: isMobile ? "100%" : 200,
          }}
          startIcon={<PrintIcon />}
          onClick={printInvoice}
        >
          Print Invoice
        </Button> */}

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#25d366",
            color: "white",
            minWidth: isMobile ? "100%" : 200,
          }}
          startIcon={<WhatsAppIcon />}
          onClick={sendBillViaWhatsApp}
          disabled={sendingWhatsApp}
        >
          {sendingWhatsApp ? "Preparing..." : "WhatsApp Invoice"}
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            minWidth: isMobile ? "100%" : 200,
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