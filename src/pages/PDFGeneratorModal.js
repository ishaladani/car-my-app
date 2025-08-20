
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

// Enhanced PDF Generator Modal Component with proper download functionality
const PDFGeneratorModal = ({ open, onClose, jobData }) => {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

  // Parse job details helper
  const parseJobDetails = (jobDetails) => {
    if (!jobDetails) return null;
    
    try {
      const parsed = JSON.parse(jobDetails);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing job details:', error);
      return [{ description: jobDetails, price: 'N/A' }];
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate total from job details
  const calculateJobDetailsTotal = (jobDetails) => {
    const parsedDetails = parseJobDetails(jobDetails);
    if (!parsedDetails) return 0;
    
    return parsedDetails.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + price;
    }, 0);
  };

  // Calculate parts total
  const calculatePartsTotal = (partsUsed) => {
    if (!partsUsed || !Array.isArray(partsUsed)) return 0;
    
    return partsUsed.reduce((total, part) => {
      return total + (part.totalPrice || 0);
    }, 0);
  };

  // Method 1: Generate PDF using jsPDF (Recommended)
  // const generatePDFWithJsPDF = async () => {
  //   try {
  //     setIsGenerating(true);
      
  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     const pageWidth = pdf.internal.pageSize.getWidth();
  //     const pageHeight = pdf.internal.pageSize.getHeight();
  //     let yPosition = 20;

  //     // Header
  //     pdf.setFontSize(24);
  //     pdf.setTextColor(25, 118, 210); // Primary blue color
  //     pdf.text('Garage Management System', pageWidth / 2, yPosition, { align: 'center' });
      
  //     yPosition += 10;
  //     pdf.setFontSize(16);
  //     pdf.setTextColor(102, 102, 102);
  //     pdf.text('Job Card & Service Report', pageWidth / 2, yPosition, { align: 'center' });
      
  //     yPosition += 20;
      
  //     // Job Information Section
  //     pdf.setFontSize(14);
  //     pdf.setTextColor(25, 118, 210);
  //     pdf.text('Job Information', 20, yPosition);
  //     yPosition += 10;
      
  //     pdf.setFontSize(10);
  //     pdf.setTextColor(0, 0, 0);
      
  //     const jobInfo = [
  //       [`Job ID: ${jobData?._id?.slice(-8) || 'N/A'}`, `Vehicle: ${jobData?.carNumber || jobData?.registrationNumber || 'N/A'}`],
  //       [`Customer: ${jobData?.customerName || 'N/A'}`, `Contact: ${jobData?.contactNumber || jobData?.phone || 'N/A'}`],
  //       [`Model: ${jobData?.model || 'N/A'}`, `Fuel: ${jobData?.fuelType || 'N/A'}`],
  //       [`Kilometers: ${jobData?.kilometer || 'N/A'} km`, `Status: ${jobData?.status || 'Unknown'}`]
  //     ];
      
  //     jobInfo.forEach(([left, right]) => {
  //       pdf.text(left, 20, yPosition);
  //       pdf.text(right, pageWidth / 2 + 10, yPosition);
  //       yPosition += 7;
  //     });
      
  //     yPosition += 10;
      
  //     // Service Details Section
  //     pdf.setFontSize(14);
  //     pdf.setTextColor(25, 118, 210);
  //     pdf.text('Service Details', 20, yPosition);
  //     yPosition += 10;
      
  //     const parsedDetails = parseJobDetails(jobData?.jobDetails);
  //     if (parsedDetails) {
  //       pdf.setFontSize(10);
  //       pdf.setTextColor(0, 0, 0);
        
  //       // Table headers
  //       pdf.setFontSize(9);
  //       pdf.setTextColor(255, 255, 255);
  //       pdf.setFillColor(25, 118, 210);
  //       pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
  //       pdf.text('S.No.', 25, yPosition + 5);
  //       pdf.text('Service Description', 45, yPosition + 5);
  //       pdf.text('Amount (₹)', pageWidth - 40, yPosition + 5);
  //       yPosition += 10;
        
  //       // Table content
  //       pdf.setTextColor(0, 0, 0);
  //       parsedDetails.forEach((item, index) => {
  //         if (yPosition > pageHeight - 30) {
  //           pdf.addPage();
  //           yPosition = 20;
  //         }
          
  //         pdf.setFillColor(index % 2 === 0 ? 245 : 255, 245, 245);
  //         pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
          
  //         pdf.text(`${index + 1}`, 25, yPosition + 5);
  //         pdf.text(item.description || 'N/A', 45, yPosition + 5);
  //         pdf.text(`₹${item.price || 'N/A'}`, pageWidth - 40, yPosition + 5);
  //         yPosition += 8;
  //       });
        
  //       // Total
  //       const total = calculateJobDetailsTotal(jobData?.jobDetails);
  //       pdf.setFillColor(227, 242, 253);
  //       pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
  //       pdf.setFontSize(10);
  //       pdf.text('Service Total:', pageWidth / 2, yPosition + 5);
  //       pdf.text(`₹${total.toFixed(2)}`, pageWidth - 40, yPosition + 5);
  //       yPosition += 15;
  //     }
      
  //     // Parts Used Section (if applicable)
  //     if (jobData?.partsUsed && jobData.partsUsed.length > 0) {
  //       if (yPosition > pageHeight - 50) {
  //         pdf.addPage();
  //         yPosition = 20;
  //       }
        
  //       pdf.setFontSize(14);
  //       pdf.setTextColor(25, 118, 210);
  //       pdf.text('Parts Used', 20, yPosition);
  //       yPosition += 10;
        
  //       // Parts table headers
  //       pdf.setFontSize(9);
  //       pdf.setTextColor(255, 255, 255);
  //       pdf.setFillColor(25, 118, 210);
  //       pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
  //       pdf.text('S.No.', 25, yPosition + 5);
  //       pdf.text('Part Name', 45, yPosition + 5);
  //       pdf.text('Qty', pageWidth - 60, yPosition + 5);
  //       pdf.text('Amount (₹)', pageWidth - 40, yPosition + 5);
  //       yPosition += 10;
        
  //       // Parts table content
  //       pdf.setTextColor(0, 0, 0);
  //       jobData.partsUsed.forEach((part, index) => {
  //         if (yPosition > pageHeight - 30) {
  //           pdf.addPage();
  //           yPosition = 20;
  //         }
          
  //         pdf.setFillColor(index % 2 === 0 ? 245 : 255, 245, 245);
  //         pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
          
  //         pdf.text(`${index + 1}`, 25, yPosition + 5);
  //         pdf.text(part.partName || 'N/A', 45, yPosition + 5);
  //         pdf.text(`${part.quantity || 'N/A'}`, pageWidth - 60, yPosition + 5);
  //         pdf.text(`₹${part.totalPrice?.toFixed(2) || '0.00'}`, pageWidth - 40, yPosition + 5);
  //         yPosition += 8;
  //       });
        
  //       // Parts total
  //       const partsTotal = calculatePartsTotal(jobData.partsUsed);
  //       pdf.setFillColor(227, 242, 253);
  //       pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
  //       pdf.setFontSize(10);
  //       pdf.text('Parts Total:', pageWidth / 2, yPosition + 5);
  //       pdf.text(`₹${partsTotal.toFixed(2)}`, pageWidth - 40, yPosition + 5);
  //       yPosition += 15;
  //     }
      
  //     // Summary Section
  //     if (yPosition > pageHeight - 50) {
  //       pdf.addPage();
  //       yPosition = 20;
  //     }
      
  //     pdf.setFontSize(14);
  //     pdf.setTextColor(25, 118, 210);
  //     pdf.text('Work Summary', 20, yPosition);
  //     yPosition += 10;
      
  //     pdf.setFontSize(10);
  //     pdf.setTextColor(0, 0, 0);
      
  //     const summaryInfo = [
  //       [`Created Date: ${formatDate(jobData?.createdAt)}`, `Completed Date: ${formatDate(jobData?.completedAt || jobData?.updatedAt)}`],
  //       [`Labor Hours: ${jobData?.laborHours || 'N/A'} hours`, `Total Cost: ₹${(calculateJobDetailsTotal(jobData?.jobDetails) + calculatePartsTotal(jobData?.partsUsed)).toFixed(2)}`]
  //     ];
      
  //     summaryInfo.forEach(([left, right]) => {
  //       pdf.text(left, 20, yPosition);
  //       pdf.text(right, pageWidth / 2 + 10, yPosition);
  //       yPosition += 7;
  //     });
      
  //     // Engineers Section
  //     if (jobData?.engineerId && jobData.engineerId.length > 0) {
  //       yPosition += 10;
  //       pdf.setFontSize(14);
  //       pdf.setTextColor(25, 118, 210);
  //       pdf.text('Assigned Engineers', 20, yPosition);
  //       yPosition += 10;
        
  //       pdf.setFontSize(10);
  //       pdf.setTextColor(0, 0, 0);
  //       const engineers = jobData.engineerId.map(engineer => engineer.name || engineer.username || 'Unknown').join(', ');
  //       pdf.text(engineers, 20, yPosition);
  //       yPosition += 15;
  //     }
      
  //     // Signature Section
  //     if (yPosition > pageHeight - 40) {
  //       pdf.addPage();
  //       yPosition = 20;
  //     }
      
  //     yPosition += 20;
  //     pdf.setFontSize(12);
  //     pdf.text('Customer Signature', 40, yPosition);
  //     pdf.text('Service Manager Signature', pageWidth - 80, yPosition);
      
  //     pdf.line(20, yPosition - 5, 80, yPosition - 5); // Customer signature line
  //     pdf.line(pageWidth - 100, yPosition - 5, pageWidth - 20, yPosition - 5); // Manager signature line
      
  //     // Footer
  //     yPosition += 20;
  //     pdf.setFontSize(8);
  //     pdf.setTextColor(128, 128, 128);
  //     pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, pageWidth / 2, yPosition, { align: 'center' });
  //     pdf.text('This is a computer-generated document.', pageWidth / 2, yPosition + 5, { align: 'center' });
      
  //     // Download the PDF
  //     const fileName = `JobCard_${jobData?.carNumber || jobData?.registrationNumber || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
  //     pdf.save(fileName);
      
  //     setIsGenerating(false);
  //     onClose();
      
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     setIsGenerating(false);
  //     alert('Failed to generate PDF. Please try again.');
  //   }
  // };
  const generatePDFWithJsPDF = () => {
    setIsGenerating(true);
    try {
      if (!jobData) {
        throw new Error('No job data available');
      }
      
      const doc = new jsPDF();
  
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text("🧾 Job Card Details", 14, 20);
  
      const tableData = [
        ['Customer Name', jobData.customerName || 'N/A'],
        ['Contact Number', jobData.contactNumber || 'N/A'],
        ['Email', jobData.email || 'N/A'],
        ['Company', jobData.company || 'N/A'],
        ['Car Number', jobData.carNumber || jobData.registrationNumber || 'N/A'],
        ['Model', jobData.model || 'N/A'],
        ['Kilometer', jobData.kilometer ? `${jobData.kilometer} km` : 'N/A'],
        ['Fuel Type', jobData.fuelType || 'N/A'],
        ['Insurance Provider', jobData.insuranceProvider || 'N/A'],
        ['Policy Number', jobData.policyNumber || 'N/A'],
        ['Expiry Date', formatDate(jobData.expiryDate)],
        ['Excess Amount', String(jobData.excessAmount) ? `${String(jobData.excessAmount)}` : 'N/A'],
        ['Job Type', jobData.type || 'N/A'],
        ['Engineer', jobData.engineerId?.[0]?.name || 'Not Assigned'],
        ['Engineer Remarks', jobData.engineerRemarks || 'N/A'],
        ['Status', jobData.status || 'N/A'],
        ['Created Date', formatDate(jobData.createdAt)],
      ];
  
      doc.autoTable({
        startY: 30,
        head: [['Field', 'Value']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [25, 118, 210], // MUI Primary
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 10, right: 10 },
      });
  
      doc.save(`JobCard_${jobData.carNumber || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`);
      setIsGenerating(false);
      alert('PDF generated successfully!');
      onClose();
    } catch (err) {
      console.error("PDF generation failed", err);
      setIsGenerating(false);
      alert("PDF generation failed. Please try again.");
    }
  };
  

  // Method 2: Generate PDF using html2canvas + jsPDF (Alternative)
  const generatePDFWithHTML2Canvas = async () => {
    try {
      setIsGenerating(true);
      
      
      // Create a temporary div with the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: white; width: 210mm; min-height: 297mm;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1976d2; padding-bottom: 20px;">
            <h1 style="color: #1976d2; margin-bottom: 5px;">Garage Management System</h1>
            <h2 style="color: #666; margin: 0;">Job Card & Service Report</h2>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1976d2; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Job Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p><strong>Job ID:</strong> ${jobData?._id?.slice(-8) || 'N/A'}</p>
                <p><strong>Vehicle:</strong> ${jobData?.carNumber || jobData?.registrationNumber || 'N/A'}</p>
                <p><strong>Customer:</strong> ${jobData?.customerName || 'N/A'}</p>
                <p><strong>Contact:</strong> ${jobData?.contactNumber || jobData?.phone || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Model:</strong> ${jobData?.model || 'N/A'}</p>
                <p><strong>Fuel:</strong> ${jobData?.fuelType || 'N/A'}</p>
                <p><strong>Kilometers:</strong> ${jobData?.kilometer || 'N/A'} km</p>
                <p><strong>Status:</strong> ${jobData?.status || 'Unknown'}</p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1976d2; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Service Details</h3>
            ${(() => {
              const parsedDetails = parseJobDetails(jobData?.jobDetails);
              if (parsedDetails) {
                let tableHTML = `
                  <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <thead>
                      <tr style="background-color: #1976d2; color: white;">
                        <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">S.No.</th>
                        <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Service Description</th>
                        <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                `;
                
                parsedDetails.forEach((item, index) => {
                  tableHTML += `
                    <tr style="background-color: ${index % 2 === 0 ? '#f5f5f5' : 'white'};">
                      <td style="border: 1px solid #ddd; padding: 12px;">${index + 1}</td>
                      <td style="border: 1px solid #ddd; padding: 12px;">${item.description || 'N/A'}</td>
                      <td style="border: 1px solid #ddd; padding: 12px;">₹${item.price || 'N/A'}</td>
                    </tr>
                  `;
                });
                
                const total = calculateJobDetailsTotal(jobData?.jobDetails);
                tableHTML += `
                    <tr style="background-color: #e3f2fd; font-weight: bold;">
                      <td colspan="2" style="border: 1px solid #ddd; padding: 12px;"><strong>Service Total:</strong></td>
                      <td style="border: 1px solid #ddd; padding: 12px;"><strong>₹${total.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
                `;
                return tableHTML;
              }
              return '<p>No service details available</p>';
            })()}
          </div>
          
          <div style="margin-top: 40px; text-align: center;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px;">
              <div style="text-align: center; border-top: 2px solid #333; padding-top: 10px;">
                <strong>Customer Signature</strong>
              </div>
              <div style="text-align: center; border-top: 2px solid #333; padding-top: 10px;">
                <strong>Service Manager Signature</strong>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
            <p>This is a computer-generated document.</p>
          </div>
        </div>
      `;
      
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      const fileName = `JobCard_${jobData?.carNumber || jobData?.registrationNumber || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setIsGenerating(false);
      onClose();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Method 3: Browser's native print to PDF (Fallback)
  const generatePDFWithPrint = () => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Job Card - ${jobData?.carNumber || 'N/A'}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #1976d2;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #1976d2;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 20px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Garage Management System</div>
            <div class="document-title">Job Card & Service Report</div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1976d2; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Job Information</h3>
            <p><strong>Job ID:</strong> ${jobData?._id?.slice(-8) || 'N/A'}</p>
            <p><strong>Vehicle:</strong> ${jobData?.carNumber || jobData?.registrationNumber || 'N/A'}</p>
            <p><strong>Customer:</strong> ${jobData?.customerName || 'N/A'}</p>
            <p><strong>Status:</strong> ${jobData?.status || 'Unknown'}</p>
          </div>
          
          <div class="no-print" style="margin: 20px 0; text-align: center;">
            <p><strong>To save as PDF:</strong> Use Ctrl+P (Windows) or Cmd+P (Mac), then select "Save as PDF" as the destination.</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Print / Save as PDF</button>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!jobData) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Generate Job Card PDF</Typography>
        <IconButton
          color="inherit"
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 1 }}
          disabled={isGenerating}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Job Card
          </Typography>
          
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Vehicle: {jobData.carNumber || jobData.registrationNumber || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer: {jobData.customerName || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Job ID: {jobData._id?.slice(-8) || 'N/A'}
            </Typography>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose your preferred method to generate the PDF:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generatePDFWithJsPDF}
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={20} /> : <FileDownloadIcon />}
              size="large"
              fullWidth
            >
              {isGenerating ? 'Generating PDF...' : 'Download PDF (Recommended)'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={generatePDFWithHTML2Canvas}
              disabled={isGenerating}
              startIcon={<FileDownloadIcon />}
              size="large"
              fullWidth
            >
              Download PDF (Alternative Method)
            </Button>
            
            <Button
              variant="outlined"
              onClick={generatePDFWithPrint}
              disabled={isGenerating}
              startIcon={<PrintIcon />}
              size="large"
              fullWidth
            >
              Print / Save as PDF (Browser)
            </Button>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          size="large"
          disabled={isGenerating}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PDFGeneratorModal;