import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    Typography,
    Button,
    TextField,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Chip,
    Card,
    CardContent,
    Divider,
    InputAdornment,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Print as PrintIcon,
    Receipt as ReceiptIcon,
    CreditCard as CreditCardIcon,
    AccountBalance as AccountBalanceIcon,
    Check as CheckIcon,
    WhatsApp as WhatsAppIcon,
    Email as EmailIcon,
    PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { DownloadOutlined as DownloadIcon } from "@mui/icons-material";
import axios from "axios";
import { jsPDF } from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

const AutoServeBilling = () => {
    // Get jobCardId from URL parameters
    const { jobCardId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    let garageId = localStorage.getItem("garageId");
    if (!garageId) {
        garageId = localStorage.getItem("garage_id");
    }
    const { id } = useParams();
    const jobCardIdFromUrl = id;
    
    const today = new Date().toISOString().split("T")[0];

    const [garageDetails, setGarageDetails] = useState({
        name: "",
        address: "",
        phone: "",
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [jobCardData, setJobCardData] = useState(null);
    const [finalInspection, setFinalInspection] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Email functionality states
    const [sendingEmail, setSendingEmail] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');

    // GST Settings - NEW ADDITION
    const [gstSettings, setGstSettings] = useState({
        includeGst: true,        // Whether to include GST in bill
        gstType: 'percentage',   // 'percentage' or 'amount'
        gstPercentage: 18,       // GST percentage
        gstAmount: 0,            // Fixed GST amount
        cgstPercentage: 9,       // CGST percentage (half of total GST)
        sgstPercentage: 9        // SGST percentage (half of total GST)
    });

    // Car and customer details - initialized empty, populated from API
    const [carDetails, setCarDetails] = useState({
        carNumber: "",
        company: "",
        model: "",
        customerName: "",
        contact: "",
        email: "",
        billingDate: today,
        invoiceNo: "",
    });

    // Parts and services - initialized empty, populated from API
    const [parts, setParts] = useState([]);
    const [services, setServices] = useState([]);

    // Bill summary
    const [summary, setSummary] = useState({
        totalPartsCost: 0,
        totalLaborCost: 0,
        subtotal: 0,
        gstAmount: 0,
        discount: 0,
        totalAmount: 0,
    });

    // Modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [apiResponseMessage, setApiResponseMessage] = useState(null);
    const [showApiResponse, setShowApiResponse] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
    const [isGarageLoading, setIsGarageLoading] = useState(true);

    // Dialog states for adding/editing
    const [showNewPartDialog, setShowNewPartDialog] = useState(false);
    const [newPart, setNewPart] = useState({
        name: "",
        quantity: 1,
        pricePerUnit: 0,
    });

    const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
    const [newService, setNewService] = useState({
        name: "",
        engineer: "",
        laborCost: 0,
    });

    const [showEditPriceDialog, setShowEditPriceDialog] = useState(false);
    const [editItem, setEditItem] = useState({
        id: null,
        type: "",
        field: "",
        value: 0,
    });

    // GST Settings handlers - NEW ADDITION
    const handleGstIncludeChange = (event) => {
        setGstSettings({
            ...gstSettings,
            includeGst: event.target.checked
        });
    };

    const handleGstTypeChange = (event) => {
        setGstSettings({
            ...gstSettings,
            gstType: event.target.value
        });
    };

    const handleGstPercentageChange = (event) => {
        const percentage = parseFloat(event.target.value) || 0;
        setGstSettings({
            ...gstSettings,
            gstPercentage: percentage,
            cgstPercentage: percentage / 2,
            sgstPercentage: percentage / 2
        });
    };

    const handleGstAmountChange = (event) => {
        setGstSettings({
            ...gstSettings,
            gstAmount: parseFloat(event.target.value) || 0
        });
    };

    // Fetch garage data
    useEffect(() => {
        const fetchGarageData = async () => {
            try {
                const response = await axios.get(
                    `https://garage-management-zi5z.onrender.com/api/garage/getgaragebyid/${garageId}` 
                );
                const data = response.data;

                setGarageDetails({
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                });
            } catch (error) {
                console.error("Error fetching garage data:", error);
            }
        };

        if (garageId) {
            fetchGarageData();
        }
    }, [garageId]);

    // Fetch job card data from API
    useEffect(() => {
        if (!garageId) {
            navigate("/login");
        }
        
        const fetchJobCardData = async () => {
            if (!jobCardIdFromUrl) {
                setSnackbar({
                    open: true,
                    message: 'No job card ID found in URL',
                    severity: 'error'
                });
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                const response = await axios.get(
                    `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${jobCardIdFromUrl}`,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const data = response.data;
                setJobCardData(data);

                // Generate invoice number if not provided
                const invoiceNo = data.invoiceNumber || `INV-${Date.now()}`;

                // Update car details with fetched data
                setCarDetails({
                    carNumber: data.carNumber || data.registrationNumber || "",
                    company: data.company || data.carBrand || "",
                    model: data.model || data.carModel || "",
                    customerName: data.customerName || data.customer?.name || "",
                    contact: data.contactNumber || data.customer?.contact || "",
                    email: data.email || data.customer?.email || "",
                    billingDate: today,
                    invoiceNo: invoiceNo,
                });

                // Process parts data from API
                if (data.partsUsed && data.partsUsed.length > 0) {
                    const apiParts = data.partsUsed.map((part, index) => ({
                        id: index + 1,
                        name: part.partName || part.name || '',
                        quantity: parseInt(part.quantity) || 1,
                        pricePerUnit: parseFloat(part.pricePerPiece || part.pricePerUnit) || 0,
                        total: parseFloat(part.totalPrice) || (parseInt(part.quantity) * parseFloat(part.pricePerPiece)) || 0
                    }));
                    setParts(apiParts);
                } else {
                    setParts([]);
                }

                // Process services data from API
                let apiServices = [];
                
                if (data.services && data.services.length > 0) {
                    apiServices = data.services.map((service, index) => ({
                        id: index + 1,
                        name: service.serviceName || service.name || '',
                        engineer: service.engineer || service.engineerName || data.engineerId?.name || 'Assigned Engineer',
                        progress: service.progress || 100,
                        status: service.status || 'Completed',
                        laborCost: parseFloat(service.laborCost) || 0
                    }));
                }
                
                if (apiServices.length === 0 && data.laborHours) {
                    apiServices = [{
                        id: 1,
                        name: 'General Service',
                        engineer: data.engineerId?.name || 'Assigned Engineer',
                        progress: 100,
                        status: 'Completed',
                        laborCost: parseFloat(data.laborHours) * 500 || 0
                    }];
                }

                setServices(apiServices);

                // Set final inspection notes
                if (data.qualityCheck && data.qualityCheck.notes) {
                    setFinalInspection(data.qualityCheck.notes);
                } else if (data.engineerRemarks) {
                    setFinalInspection(data.engineerRemarks);
                } else if (data.remarks) {
                    setFinalInspection(data.remarks);
                }

                // Set email recipient
                if (data.email || data.customer?.email) {
                    setEmailRecipient(data.email || data.customer?.email);
                }

                console.log('Fetched job card data:', data);

            } catch (error) {
                console.error('Error fetching job card data:', error);
                setSnackbar({
                    open: true,
                    message: `Error: ${error.response?.data?.message || 'Failed to fetch job card data'}`,
                    severity: 'error'
                });

                setCarDetails({
                    carNumber: "",
                    company: "",
                    model: "",
                    customerName: "",
                    contact: "",
                    email: "",
                    billingDate: today,
                    invoiceNo: `INV-${Date.now()}`,
                });
                setParts([]);
                setServices([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobCardData();
    }, [jobCardIdFromUrl, today, garageId, navigate]);

    // Calculate totals whenever parts, services, discount, or GST settings change - UPDATED
    const calculateTotals = () => {
        const totalPartsCost = parts.reduce((sum, part) => sum + (part.total || 0), 0);
        const totalLaborCost = services.reduce(
            (sum, service) => sum + (service.laborCost || 0),
            0
        );
        const subtotal = totalPartsCost + totalLaborCost;
        const discount = summary.discount || 0;
        
        let gstAmount = 0;
        let totalAmount = subtotal - discount;
        
        if (gstSettings.includeGst) {
            if (gstSettings.gstType === 'percentage') {
                gstAmount = Math.round(subtotal * (gstSettings.gstPercentage / 100));
            } else {
                gstAmount = gstSettings.gstAmount || 0;
            }
            totalAmount = subtotal + gstAmount - discount;
        }

        setSummary({
            totalPartsCost,
            totalLaborCost,
            subtotal,
            gstAmount,
            discount,
            totalAmount,
        });
    };

    useEffect(() => {
        calculateTotals();
    }, [parts, services, summary.discount, gstSettings]);

    // Set default email values when car details change
    useEffect(() => {
        if (carDetails.email) {
            setEmailRecipient(carDetails.email);
        }
        setEmailSubject(`Invoice #${carDetails.invoiceNo} - ${carDetails.customerName}`);
        setEmailMessage(`Dear ${carDetails.customerName},

Please find attached the invoice for services rendered on your vehicle ${carDetails.company} ${carDetails.model} (${carDetails.carNumber}).

Invoice Details:
- Invoice Number: ${carDetails.invoiceNo}
- Total Amount: ${summary.totalAmount}
- Date: ${carDetails.billingDate}

Thank you for choosing ${garageDetails.name || 'SHIVAM MOTORS'} for your vehicle service needs.

Best regards,
${garageDetails.name || 'SHIVAM MOTORS'}
Contact: ${garageDetails.phone || '9909047943'}`);
    }, [carDetails, summary.totalAmount, garageDetails]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatCurrencyForPdf = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatAmount = (amount) => {
        return `Rs. ${new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 0,
        }).format(amount)}`;
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = () => reject();
            reader.readAsDataURL(blob);
        }); 
    };

    // Enhanced PDF generation function with dynamic GST - UPDATED
    const generatePdfInvoice = () => {
        try {
            const doc = new jsPDF();
            
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = 20;

            const checkPageBreak = (requiredSpace) => {
                if (currentY + requiredSpace > pageHeight - 30) {
                    doc.addPage();
                    currentY = 30;
                    return true;
                }
                return false;
            };

            const drawLine = (y, thickness = 0.5) => {
                doc.setDrawColor(150, 150, 150);
                doc.setLineWidth(thickness);
                doc.line(margin, y, pageWidth - margin, y);
            };

            // HEADER SECTION
            doc.setFillColor(41, 128, 185);
            doc.rect(0, 0, pageWidth, 35, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text(garageDetails.name || 'SHIVAM MOTORS', pageWidth / 2, 15, { align: 'center' });
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(garageDetails.address || 'PLOT NO:5, PHASE-1 NARODA GIDC, OPP.BSNL TELEPHONE EXCHANGE,NARODA', pageWidth / 2, 22, { align: 'center' });
            doc.text(`Phone: ${garageDetails.phone || '9909047943'}`, pageWidth / 2, 28, { align: 'center' });
            
            currentY = 50;
            doc.setTextColor(0, 0, 0);

            // INVOICE HEADER
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, currentY, contentWidth, 25, 'F');
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('INVOICE', margin + 5, currentY + 10);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            const today = new Date();
            const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            
            doc.text(`Invoice No: ${carDetails.invoiceNo}`, pageWidth - margin - 60, currentY + 8);
            doc.text(`Date: ${formattedDate}`, pageWidth - margin - 60, currentY + 15);
            doc.text(`GST: 24ADPFS3849B1ZY`, pageWidth - margin - 60, currentY + 22);
            
            currentY += 35;

            // CUSTOMER AND VEHICLE DETAILS
            checkPageBreak(40);
            
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, currentY, contentWidth / 2 - 5, 35, 'F');
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('BILL TO:', margin + 5, currentY + 8);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`${carDetails.customerName}`, margin + 5, currentY + 16);
            doc.text(`Phone: ${carDetails.contact}`, margin + 5, currentY + 23);
            doc.text(`Email: ${carDetails.email}`, margin + 5, currentY + 30);

            doc.setFillColor(250, 250, 250);
            doc.rect(pageWidth / 2 + 5, currentY, contentWidth / 2 - 5, 35, 'F');
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('VEHICLE DETAILS:', pageWidth / 2 + 10, currentY + 8);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`${carDetails.company} ${carDetails.model}`, pageWidth / 2 + 10, currentY + 16);
            doc.text(`Registration: ${carDetails.carNumber}`, pageWidth / 2 + 10, currentY + 23);
            doc.text(`Service Date: ${formattedDate}`, pageWidth / 2 + 10, currentY + 30);

            currentY += 45;

            // PARTS SECTION
            if (parts.length > 0) {
                checkPageBreak(60);
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(41, 128, 185);
                doc.text('PARTS USED', margin, currentY);
                currentY += 10;

                doc.setFillColor(41, 128, 185);
                doc.rect(margin, currentY, contentWidth, 12, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                
                const partsCols = {
                    sno: margin + 3,
                    name: margin + 15,
                    qty: margin + 110,
                    rate: margin + 135,
                    amount: margin + 165
                };
                
                doc.text('S.No', partsCols.sno, currentY + 8);
                doc.text('Part Description', partsCols.name, currentY + 8);
                doc.text('Qty', partsCols.qty, currentY + 8);
                doc.text('Rate', partsCols.rate, currentY + 8);
                doc.text('Amount', partsCols.amount, currentY + 8);
                
                currentY += 12;
                doc.setTextColor(0, 0, 0);

                parts.forEach((part, index) => {
                    checkPageBreak(10);
                    
                    const bgColor = index % 2 === 0 ? [248, 249, 250] : [255, 255, 255];
                    doc.setFillColor(...bgColor);
                    doc.rect(margin, currentY, contentWidth, 10, 'F');

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    
                    doc.text(`${index + 1}`, partsCols.sno, currentY + 7);
                    doc.text(String(part.name || '').substring(0, 45), partsCols.name, currentY + 7);
                    doc.text(String(part.quantity || ''), partsCols.qty, currentY + 7);
                    doc.text(formatAmount(part.pricePerUnit || 0), partsCols.rate, currentY + 7);
                    doc.text(formatAmount(part.total || 0), partsCols.amount, currentY + 7);
                    
                    currentY += 10;
                });

                currentY += 5;
            }

            // SERVICES SECTION
            if (services.length > 0) {
                checkPageBreak(60);
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(41, 128, 185);
                doc.text('SERVICES PROVIDED', margin, currentY);
                currentY += 10;

                doc.setFillColor(41, 128, 185);
                doc.rect(margin, currentY, contentWidth, 12, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                
                const servicesCols = {
                    sno: margin + 3,
                    service: margin + 15,
                    engineer: margin + 100,
                    amount: margin + 150
                };
                
                doc.text('S.No', servicesCols.sno, currentY + 8);
                doc.text('Service Description', servicesCols.service, currentY + 8);
                doc.text('Engineer', servicesCols.engineer, currentY + 8);
                doc.text('Labor Cost', servicesCols.amount, currentY + 8);
                
                currentY += 12;
                doc.setTextColor(0, 0, 0);

                services.forEach((service, index) => {
                    checkPageBreak(10);
                    
                    const bgColor = index % 2 === 0 ? [248, 249, 250] : [255, 255, 255];
                    doc.setFillColor(...bgColor);
                    doc.rect(margin, currentY, contentWidth, 10, 'F');

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    
                    doc.text(`${index + 1}`, servicesCols.sno, currentY + 7);
                    doc.text(String(service.name || '').substring(0, 40), servicesCols.service, currentY + 7);
                    doc.text(String(service.engineer || 'N/A').substring(0, 20), servicesCols.engineer, currentY + 7);
                    doc.text(formatAmount(service.laborCost || 0), servicesCols.amount, currentY + 7);
                    
                    currentY += 10;
                });

                currentY += 5;
            }

            // BILL SUMMARY SECTION - UPDATED WITH DYNAMIC GST
            const summaryHeight = 100;
            if (currentY + summaryHeight > pageHeight - 30) {
                doc.addPage();
                currentY = 30;
            }
            
            currentY += 10;
            
            const summaryStartX = margin;
            const summaryWidth = contentWidth;
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('BILL SUMMARY', summaryStartX, currentY);
            currentY += 5;
            
            drawLine(currentY, 1);
            currentY += 10;

            doc.setFillColor(248, 249, 250);
            doc.rect(summaryStartX, currentY, summaryWidth, 50, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(summaryStartX, currentY, summaryWidth, 50);

            currentY += 10;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);

            // Dynamic summary items based on GST settings
            const summaryItems = [
                ['Parts Total:', formatAmount(summary.totalPartsCost)],
                ['Labor Total:', formatAmount(summary.totalLaborCost)],
                ['Subtotal:', formatAmount(summary.subtotal)],
                ...(gstSettings.includeGst ? [
                    gstSettings.gstType === 'percentage' ? 
                        [`CGST (${gstSettings.cgstPercentage}%):`, formatAmount(Math.round(summary.gstAmount / 2))] :
                        ['CGST:', formatAmount(Math.round(summary.gstAmount / 2))],
                    gstSettings.gstType === 'percentage' ? 
                        [`SGST (${gstSettings.sgstPercentage}%):`, formatAmount(Math.round(summary.gstAmount / 2))] :
                        ['SGST:', formatAmount(Math.round(summary.gstAmount / 2))]
                ] : [
                    ['GST:', 'Not Applicable']
                ]),
                ['Discount:', formatAmount(summary.discount)],
            ];

            const leftColX = summaryStartX + 10;
            const rightColX = summaryStartX + summaryWidth - 50;
            
            summaryItems.forEach((item, index) => {
                const yPos = currentY + (index * 6);
                doc.text(item[0], leftColX, yPos);
                doc.text(item[1], rightColX, yPos);
            });

            currentY += (summaryItems.length * 6) + 5;

            // Total amount section
            doc.setFillColor(41, 128, 185);
            doc.rect(summaryStartX, currentY, summaryWidth, 12, 'F');
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`TOTAL AMOUNT ${!gstSettings.includeGst ? '(Excluding GST)' : '(Including GST)'}:`, leftColX, currentY + 8);
            doc.text(formatAmount(summary.totalAmount), rightColX, currentY + 8);

            currentY += 25;

            // Payment method
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 53, 69);
            doc.text(`Payment Method: ${paymentMethod || 'CASH PAYMENT'}`, margin, currentY);
            currentY += 8;

            return doc;
            
        } catch (error) {
            console.error('PDF Generation Error:', error);
            throw new Error('Failed to generate PDF document: ' + error.message);
        }
    };

    const downloadPdfBill = () => {
        try {
            const doc = generatePdfInvoice();
            const fileName = `Invoice_${carDetails.invoiceNo}_${carDetails.carNumber.replace(/\s+/g, '_')}.pdf`;
            doc.save(fileName);
            
            setSnackbar({
                open: true,
                message: 'Invoice PDF downloaded successfully!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Download error:', error);
            setSnackbar({
                open: true,
                message: 'Failed to download PDF. Please try again.',
                severity: 'error'
            });
        }
    };

    const generatePdfBase64 = () => {
        try {
            const doc = generatePdfInvoice();
            return doc.output('datauristring').split(',')[1];
        } catch (error) {
            console.error('PDF Base64 generation error:', error);
            throw new Error('Failed to generate PDF for email');
        }
    };

    const sendBillViaEmail = () => {
        try {
            const pdfBase64 = generatePdfBase64();
            const fileName = `Invoice_${carDetails.invoiceNo}_${carDetails.carNumber.replace(/\s+/g, '_')}.pdf`;
            
            const subject = encodeURIComponent(emailSubject || `Invoice #${carDetails.invoiceNo} - ${garageDetails.name}`);
            const body = encodeURIComponent(emailMessage || `Dear ${carDetails.customerName},

Please find attached the invoice for services rendered on your vehicle ${carDetails.company} ${carDetails.model} (${carDetails.carNumber}).

Invoice Details:
• Invoice Number: ${carDetails.invoiceNo}
• Total Amount: ${formatAmount(summary.totalAmount)}
• Service Date: ${new Date().toLocaleDateString('en-IN')}

Thank you for choosing ${garageDetails.name} for your vehicle service needs.

Best regards,
${garageDetails.name}
Contact: ${garageDetails.phone}`);
        
        const recipient = encodeURIComponent(emailRecipient || '');
        
        const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        
        setSnackbar({
            open: true,
            message: 'Email client opened. Please attach the downloaded PDF manually if the attachment didn\'t work automatically.',
            severity: 'info'
        });
        
        downloadPdfBill();
        
    } catch (error) {
        console.error('Email send error:', error);
        setSnackbar({
            open: true,
            message: 'Failed to prepare email. Please try downloading the PDF instead.',
            severity: 'error'
        });
    }
};

const openEmailDialog = () => {
    setShowEmailDialog(true);
};

const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCarDetails({
        ...carDetails,
        [id]: value,
    });
};

const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    setSummary({ ...summary, discount });
};

// Add new part
const addNewPart = () => {
    const { name, quantity, pricePerUnit } = newPart;
    if (name && quantity > 0 && pricePerUnit > 0) {
        const newPartObj = {
            id: Date.now(),
            name,
            quantity: parseInt(quantity),
            pricePerUnit: parseFloat(pricePerUnit),
            total: parseInt(quantity) * parseFloat(pricePerUnit),
        };

        setParts([...parts, newPartObj]);
        setNewPart({ name: "", quantity: 1, pricePerUnit: 0 });
        setShowNewPartDialog(false);
    }
};

// Add new service
const addNewService = () => {
    const { name, engineer, laborCost } = newService;
    if (name && engineer && laborCost > 0) {
        const newServiceObj = {
            id: Date.now(),
            name,
            engineer,
            progress: 0,
            status: "Pending",
            laborCost: parseFloat(laborCost),
        };

        setServices([...services, newServiceObj]);
        setNewService({ name: "", engineer: "", laborCost: 0 });
        setShowNewServiceDialog(false);
    }
};

// Remove part
const removePart = (id) => {
    setParts(parts.filter((part) => part.id !== id));
};

// Remove service
const removeService = (id) => {
    setServices(services.filter((service) => service.id !== id));
};

// Open edit price dialog
const openEditPrice = (id, type, field, value) => {
    setEditItem({ id, type, field, value });
    setShowEditPriceDialog(true);
};

// Save edited price
const saveEditedPrice = () => {
    const { id, type, field, value } = editItem;
    const newValue = parseFloat(value);

    if (type === "part") {
        const updatedParts = parts.map((part) => {
            if (part.id === id) {
                const updatedPart = { ...part, [field]: newValue };
                updatedPart.total = updatedPart.quantity * updatedPart.pricePerUnit;
                return updatedPart;
            }
            return part;
        });
        setParts(updatedParts);
    } else if (type === "service") {
        const updatedServices = services.map((service) => {
            if (service.id === id) {
                return { ...service, [field]: newValue };
            }
            return service;
        });
        setServices(updatedServices);
    }

    setShowEditPriceDialog(false);
};

// Generate bill via API
const generateBill = async () => {
    setShowPaymentModal(true);
};

const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(false);
    
    if (method === "Online Payment") {
        processOnlinePayment();
    } else {
        setShowProcessModal(true);
    }
};

const processOnlinePayment = async () => {
    if (!jobCardIdFromUrl) {
        setApiResponseMessage({
            type: "error",
            message: "No job card ID found. Cannot process payment.",
        });
        setShowApiResponse(true);
        return;
    }

    setShowProcessModal(true);

    try {
        const billResponse = await axios.post(
            `https://garage-management-zi5z.onrender.com/api/garage/billing/generate/${jobCardIdFromUrl}`,
            {
                parts: parts.map((part) => ({
                    name: part.name,
                    quantity: part.quantity,
                    pricePerUnit: part.pricePerUnit,
                })),
                services: services.map((service) => ({
                    description: service.name,
                    laborCost: service.laborCost,
                })),
                discount: summary.discount,
                gstSettings: {
                    includeGst: gstSettings.includeGst,
                    gstType: gstSettings.gstType,
                    gstPercentage: gstSettings.gstPercentage,
                    gstAmount: gstSettings.gstAmount
                },
                gstPercentage: gstSettings.includeGst ? gstSettings.gstPercentage : 0,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const responseData = billResponse.data;
        
        if (!responseData.bill || !responseData.bill._id) {
            throw new Error("Invalid response structure - missing bill ID");
        }

        const billId = responseData.bill._id;
        const invoiceNo = responseData.bill.invoiceNo;

        setCarDetails(prev => ({
            ...prev,
            invoiceNo: invoiceNo || prev.invoiceNo
        }));

        const paymentResponse = await axios.post(
            "https://garage-management-zi5z.onrender.com/api/garage/billing/pay",
            {
                billId: billId,
                paymentMethod: "Online Payment"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        setShowProcessModal(false);

        if (paymentResponse.status === 200 || paymentResponse.status === 201) {
            setApiResponseMessage({
                type: "success",
                message: paymentResponse.data?.message || "Online payment processed successfully!",
            });
            setShowThankYou(true);
        } else {
            throw new Error(paymentResponse.data?.message || "Payment failed");
        }

    } catch (error) {
        console.error("Payment Error:", error);
        setShowProcessModal(false);
        setApiResponseMessage({
            type: "error",
            message: error.response?.data?.message || 
                   error.message || 
                   "Failed to process online payment",
        });
    }

    setShowApiResponse(true);
};

// Updated processPayment function with GST settings
const processPayment = async () => {
    if (!jobCardIdFromUrl) {
        setApiResponseMessage({
            type: "error",
            message: "No job card ID found in URL. Cannot process payment.",
        });
        setShowApiResponse(true);
        setShowProcessModal(false);
        return;
    }

    const apiData = {
        parts: parts.map((part) => ({
            name: part.name,
            quantity: part.quantity,
            pricePerUnit: part.pricePerUnit,
        })),
        services: services.map((service) => ({
            description: service.name,
            laborCost: service.laborCost,
        })),
        discount: summary.discount,
        gstSettings: {
            includeGst: gstSettings.includeGst,
            gstType: gstSettings.gstType,
            gstPercentage: gstSettings.gstPercentage,
            gstAmount: gstSettings.gstAmount
        },
        gstPercentage: gstSettings.includeGst ? gstSettings.gstPercentage : 0,
    };

    setShowProcessModal(false);

    try {
        const response = await axios.post(
            `https://garage-management-zi5z.onrender.com/api/garage/billing/generate/${jobCardIdFromUrl}`,
            apiData,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const data = response.data;

        if (response.status === 200 || response.status === 201) {
            setApiResponseMessage({
                type: "success",
                message: data.message || "Bill generated and payment processed successfully!",
            });
            setShowThankYou(true);
            
            if (data.invoiceNumber) {
                setCarDetails(prev => ({
                    ...prev,
                    invoiceNo: data.invoiceNumber
                }));
            }
        } else {
            setApiResponseMessage({
                type: "error",
                message: data.message || "Failed to generate bill",
            });
        }
    } catch (error) {
        console.error("API Error:", error);
        setApiResponseMessage({
            type: "error",
            message: error.response?.data?.message || 
                   error.message || 
                   "Network error while processing payment",
        });
    }

    setShowApiResponse(true);
};

const printBill = () => {
    window.print();
};

// Updated WhatsApp function with dynamic GST info
const sendBillViaWhatsApp = async () => {
    setSendingWhatsApp(true);

    try {
        if (!carDetails.contact || carDetails.contact.length < 10) {
            throw new Error("Valid contact number is required to send WhatsApp message");
        }

        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        const gstInfo = gstSettings.includeGst ? 
            `*Taxes:*
- CGST (${gstSettings.cgstPercentage}%): ₹${Math.round(summary.gstAmount / 2)}
- SGST (${gstSettings.sgstPercentage}%): ₹${Math.round(summary.gstAmount / 2)}
- Total GST: ₹${summary.gstAmount}` : 
            '*GST: Not Applicable*';

        const billMessage = `*INVOICE #${carDetails.invoiceNo}*

*${garageDetails.name || 'SHIVAM MOTORS'}*
${garageDetails.address || 'PLOT NO:5, PHASE-1 NARODA GIDC, OPP.BSNL TELEPHONE EXCHANGE,NARODA'}
GST: 24ADPFS3849B1ZY
Contact: ${garageDetails.phone || '9909047943'}

*Customer:* ${carDetails.customerName}
*Vehicle:* ${carDetails.company} ${carDetails.model} (${carDetails.carNumber})
*Date:* ${formattedDate}

${parts.length > 0 ? `*Parts:*
${parts.map(part => `- ${part.name}: ₹${part.total}`).join('\n')}` : ''}

${services.length > 0 ? `*Services:*
${services.map(service => `- ${service.name}: ₹${service.laborCost}`).join('\n')}` : ''}

${gstInfo}

*Total Amount: ₹${summary.totalAmount}* ${!gstSettings.includeGst ? '(Excluding GST)' : '(Including GST)'}

${finalInspection ? finalInspection : ''}

*Payment Method: ${paymentMethod || 'DELIVERY AGAINST CASH ONLY'}*

Thank you for choosing our service!`;

        let phoneNumber = carDetails.contact.replace(/\D/g, '');
        if (phoneNumber.length === 10) {
            phoneNumber = `91${phoneNumber}`;
        }

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(billMessage)}`;
        window.open(whatsappUrl, '_blank');

        setApiResponseMessage({
            type: "success",
            message: `WhatsApp invoice prepared for ${carDetails.customerName}. Please send the message in the opened WhatsApp tab.`,
        });
    } catch (error) {
        console.error("WhatsApp send error:", error);
        setApiResponseMessage({
            type: "warning",
            message: error.message || "Couldn't send WhatsApp message. Please try again.",
        });
    } finally {
        setSendingWhatsApp(false);
        setShowApiResponse(true);
    }
};

// Status color mapping
const getStatusColor = (status) => {
    switch (status) {
        case "Completed":
            return "success";
        case "In Progress":
            return "warning";
        default:
            return "error";
    }
};

// Responsive table cell styling
const tableCellStyle = {
    py: isMobile ? 1 : 2,
    px: isMobile ? 1 : 3,
    fontSize: isMobile ? "0.75rem" : "0.875rem",
};

if (isLoading) {
    return (
        <Box sx={{ ml: { xs: 0, md: "280px" }, px: { xs: 2, md: 3 }, py: 4 }}>
            <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <LinearProgress sx={{ width: '50%' }} />
                </Box>
                <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                    Loading job card data...
                </Typography>
            </Paper>
        </Box>
    );
}

return (
    <Box sx={{ ml: { xs: 0, md: "280px" }, px: { xs: 2, md: 3 }, py: 4 }}>
        <Paper elevation={3} sx={{ mb: 4, p: isMobile ? 2 : 3, borderRadius: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    mb: 3,
                    gap: isMobile ? 2 : 0,
                }}
            >
                <Typography variant="h4" color="primary" fontWeight="bold">
                    Billing
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ReceiptIcon />}
                    onClick={generateBill}
                    disabled={showThankYou}
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                >
                    Generate Bill
                </Button>
            </Box>

            {/* Car & Customer Details */}
            {!showThankYou && (
                <>
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                color="primary"
                                gutterBottom
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    "&::before": {
                                        content: '""',
                                        display: "inline-block",
                                        width: 4,
                                        height: 20,
                                        backgroundColor: "primary.main",
                                        marginRight: 1,
                                        borderRadius: 1,
                                    },
                                }}
                            >
                                Car & Customer Details
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    {
                                        id: "carNumber",
                                        label: "Car Number",
                                        xs: 12,
                                        sm: 6,
                                        md: 3,
                                    },
                                    { id: "company", label: "Company", xs: 12, sm: 6, md: 3 },
                                    { id: "model", label: "Model", xs: 12, sm: 6, md: 3 },
                                    {
                                        id: "customerName",
                                        label: "Customer Name",
                                        xs: 12,
                                        sm: 6,
                                        md: 3,
                                    },
                                    { id: "contact", label: "Contact", xs: 12, sm: 6, md: 3 },
                                    { id: "email", label: "Email", xs: 12, sm: 6, md: 3 },
                                    {
                                        id: "billingDate",
                                        label: "Date of Billing",
                                        type: "date",
                                        xs: 12,
                                        sm: 6,
                                        md: 3,
                                    },
                                    {
                                        id: "invoiceNo",
                                        label: "Invoice No.",
                                        xs: 12,
                                        sm: 6,
                                        md: 3,
                                    },
                                ].map((field) => (
                                    <Grid
                                        item
                                        xs={field.xs}
                                        sm={field.sm}
                                        md={field.md}
                                        key={field.id}
                                    >
                                        <TextField
                                            id={field.id}
                                            label={field.label}
                                            variant="outlined"
                                            fullWidth
                                            margin="dense"
                                            value={carDetails[field.id]}
                                            onChange={handleInputChange}
                                            type={field.type || "text"}
                                            InputLabelProps={
                                                field.type === "date" ? { shrink: true } : {}
                                            }
                                            size={isMobile ? "small" : "medium"}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* GST Settings Card - NEW ADDITION */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                color="primary"
                                gutterBottom
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    "&::before": {
                                        content: '""',
                                        display: "inline-block",
                                        width: 4,
                                        height: 20,
                                        backgroundColor: "primary.main",
                                        marginRight: 1,
                                        borderRadius: 1,
                                    },
                                }}
                            >
                                GST Settings
                            </Typography>
                            
                            <Grid container spacing={2} alignItems="center">
                                {/* Include GST Toggle */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={gstSettings.includeGst}
                                                onChange={handleGstIncludeChange}
                                                color="primary"
                                            />
                                        }
                                        label="Include GST"
                                    />
                                </Grid>

                                {/* GST Type Selection */}
                                {gstSettings.includeGst && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                            <InputLabel>GST Type</InputLabel>
                                            <Select
                                                value={gstSettings.gstType}
                                                onChange={handleGstTypeChange}
                                                label="GST Type"
                                            >
                                                <MenuItem value="percentage">Percentage</MenuItem>
                                                <MenuItem value="amount">Fixed Amount</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}

                                {/* GST Percentage Input */}
                                {gstSettings.includeGst && gstSettings.gstType === 'percentage' && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="GST Percentage"
                                            type="number"
                                            value={gstSettings.gstPercentage}
                                            onChange={handleGstPercentageChange}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                            }}
                                            size={isMobile ? "small" : "medium"}
                                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                                        />
                                    </Grid>
                                )}

                                {/* GST Amount Input */}
                                {gstSettings.includeGst && gstSettings.gstType === 'amount' && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="GST Amount"
                                            type="number"
                                            value={gstSettings.gstAmount}
                                            onChange={handleGstAmountChange}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                            }}
                                            size={isMobile ? "small" : "medium"}
                                            inputProps={{ min: 0, step: 1 }}
                                        />
                                    </Grid>
                                )}

                                {/* GST Breakdown Display */}
                                {gstSettings.includeGst && gstSettings.gstType === 'percentage' && (
                                    <Grid item xs={12}>
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: 'info.light',
                                            borderRadius: 1,
                                            mt: 1
                                        }}>
                                            <Typography variant="body2" color="info.contrastText">
                                                GST Breakdown: CGST ({gstSettings.cgstPercentage}%) + SGST ({gstSettings.sgstPercentage}%) = {gstSettings.gstPercentage}% Total
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Parts Used */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: isMobile ? "column" : "row",
                                    justifyContent: "space-between",
                                    alignItems: isMobile ? "flex-start" : "center",
                                    mb: 2,
                                    gap: isMobile ? 2 : 0,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    color="primary"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        "&::before": {
                                            content: '""',
                                            display: "inline-block",
                                            width: 4,
                                            height: 20,
                                            backgroundColor: "primary.main",
                                            marginRight: 1,
                                            borderRadius: 1,
                                        },
                                    }}
                                >
                                    Parts Used ({parts.length})
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<AddIcon />}
                                    onClick={() => setShowNewPartDialog(true)}
                                    size={isMobile ? "small" : "medium"}
                                    fullWidth={isMobile}
                                >
                                    Add Part
                                </Button>
                            </Box>
                            {parts.length > 0 ? (
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                    sx={{ mb: 2, overflowX: "auto" }}
                                >
                                    <Table size={isMobile ? "small" : "medium"}>
                                        <TableHead>
                                            <TableRow
                                                sx={{
                                                    backgroundColor: theme.palette.primary.main,
                                                    '& .MuiTableCell-head': {
                                                        backgroundColor: theme.palette.primary.main,
                                                        color: theme.palette.primary.contrastText,
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem',
                                                        letterSpacing: '0.02em',
                                                        textTransform: 'uppercase',
                                                        border: 'none',
                                                        '&:first-of-type': {
                                                            borderTopLeftRadius: theme.shape.borderRadius,
                                                        },
                                                        '&:last-of-type': {
                                                            borderTopRightRadius: theme.shape.borderRadius,
                                                        }
                                                    }
                                                }}
                                            >
                                                <TableCell>Service</TableCell>
                                                <TableCell>Engineer</TableCell>
                                                <TableCell>Progress</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Labour Cost</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {services.map((service) => (
                                                <TableRow key={service.id} hover>
                                                    <TableCell sx={tableCellStyle}>
                                                        {service.name}
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyle}>
                                                        {service.engineer}
                                                    </TableCell>
                                                    <TableCell sx={{ ...tableCellStyle, width: "15%" }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={service.progress}
                                                            sx={{ height: 8, borderRadius: 4 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyle}>
                                                        <Chip
                                                            label={service.status}
                                                            color={getStatusColor(service.status)}
                                                            size={isMobile ? "small" : "medium"}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyle}>
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            {formatCurrency(service.laborCost).replace("", "")}
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() =>
                                                                    openEditPrice(
                                                                        service.id,
                                                                        "service",
                                                                        "laborCost",
                                                                        service.laborCost
                                                                    )
                                                                }
                                                                sx={{ ml: 1 }}
                                                            >
                                                                <EditIcon fontSize={isMobile ? "small" : "medium"} />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyle}>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => removeService(service.id)}
                                                        >
                                                            <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ textAlign: 'center', py: 2 }}
                                >
                                    No services data available from API. Click "Add Service" to add manually.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Final Inspection Notes */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                color="primary"
                                gutterBottom
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    "&::before": {
                                        content: '""',
                                        display: "inline-block",
                                        width: 4,
                                        height: 20,
                                        backgroundColor: "primary.main",
                                        marginRight: 1,
                                        borderRadius: 1,
                                    },
                                }}
                            >
                                Final Inspection Notes
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder="Enter final inspection notes or additional comments..."
                                value={finalInspection}
                                onChange={(e) => setFinalInspection(e.target.value)}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>

                    {/* Updated Bill Summary with Dynamic GST */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                color="primary"
                                gutterBottom
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    "&::before": {
                                        content: '""',
                                        display: "inline-block",
                                        width: 4,
                                        height: 20,
                                        backgroundColor: "primary.main",
                                        marginRight: 1,
                                        borderRadius: 1,
                                    },
                                }}
                            >
                                Bill Summary
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{ 
                                    p: isMobile ? 2 : 3, 
                                    backgroundColor: (theme) => 
                                        theme.palette.mode === 'dark' 
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'grey.50'
                                }}
                            >
                                {[
                                    {
                                        label: "Total Parts Cost:",
                                        value: formatCurrency(summary.totalPartsCost),
                                    },
                                    {
                                        label: "Total Labour Cost:",
                                        value: formatCurrency(summary.totalLaborCost),
                                    },
                                    {
                                        label: "Subtotal:",
                                        value: formatCurrency(summary.subtotal),
                                    },
                                    // Conditional GST display based on settings
                                    ...(gstSettings.includeGst ? [
                                        gstSettings.gstType === 'percentage' ? {
                                            label: `GST (${gstSettings.gstPercentage}%):`,
                                            value: formatCurrency(summary.gstAmount),
                                            breakdown: `CGST: ${formatCurrency(Math.round(summary.gstAmount / 2))} + SGST: ${formatCurrency(Math.round(summary.gstAmount / 2))}`
                                        } : {
                                            label: "GST (Fixed Amount):",
                                            value: formatCurrency(summary.gstAmount),
                                        }
                                    ] : []),
                                    {
                                        label: "Discount:",
                                        value: (
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={summary.discount}
                                                    onChange={handleDiscountChange}
                                                    sx={{ width: isMobile ? 80 : 100, mr: 1 }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">₹</InputAdornment>
                                                        ),
                                                    }}
                                                />
                                                <Typography>
                                                    ({formatCurrency(summary.discount)})
                                                </Typography>
                                            </Box>
                                        ),
                                        custom: true,
                                    },
                                ].map((item, index) => (
                                    <Box key={index}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: isMobile ? "column" : "row",
                                                justifyContent: "space-between",
                                                mb: 1,
                                                py: 1,
                                                borderBottom: (theme) => 
                                                    `1px dashed ${theme.palette.mode === 'dark' 
                                                        ? 'rgba(255, 255, 255, 0.12)' 
                                                        : theme.palette.grey[300]}`,
                                                gap: isMobile ? 1 : 0,
                                            }}
                                        >
                                            <Typography>{item.label}</Typography>
                                            {item.custom ? (
                                                item.value
                                            ) : (
                                                <Typography>{item.value}</Typography>
                                            )}
                                        </Box>
                                        {/* GST Breakdown */}
                                        {item.breakdown && (
                                            <Box sx={{ 
                                                fontSize: '0.75rem', 
                                                color: 'text.secondary', 
                                                ml: 2, 
                                                mb: 1 
                                            }}>
                                                {item.breakdown}
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: isMobile ? "column" : "row",
                                        justifyContent: "space-between",
                                        py: 1,
                                        fontWeight: "bold",
                                        gap: isMobile ? 1 : 0,
                                    }}
                                >
                                    <Typography
                                        fontWeight="bold"
                                        color="primary.dark"
                                        fontSize={isMobile ? "16px" : "18px"}
                                    >
                                        Total Amount {!gstSettings.includeGst ? "(Excluding GST)" : "(Including GST)"}:
                                    </Typography>
                                    <Typography
                                        fontWeight="bold"
                                        color="primary.dark"
                                        fontSize={isMobile ? "16px" : "18px"}
                                    >
                                        {formatCurrency(summary.totalAmount)}
                                    </Typography>
                                </Box>
                            </Paper>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Thank You Message */}
            {showThankYou && (
                <Box
                    sx={{
                        textAlign: "center",
                        py: isMobile ? 3 : 5,
                        px: isMobile ? 2 : 4,
                        backgroundColor: "grey.50",
                        borderRadius: 2,
                    }}
                >
                    <CheckIcon
                        sx={{
                            fontSize: isMobile ? 40 : 60,
                            color: "primary.main",
                            mb: 2,
                        }}
                    />
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        color="primary.dark"
                        gutterBottom
                    >
                        Thank You!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Your payment has been processed successfully and the receipt has
                        been sent to the customer.
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Invoice #{carDetails.invoiceNo} | Amount:{" "}
                        {formatCurrency(summary.totalAmount)}
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'center',
                        gap: 2,
                        mt: 3
                    }}>
                        <Button onClick={downloadPdfBill}>
                            <DownloadIcon /> Download Invoice
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<WhatsAppIcon />}
                            onClick={sendBillViaWhatsApp}
                            disabled={sendingWhatsApp}
                            size={isMobile ? "small" : "medium"}
                            fullWidth={isMobile}
                            sx={{
                                backgroundColor: '#25d366',
                                '&:hover': {
                                    backgroundColor: '#128C7E',
                                }
                            }}
                        >
                            {sendingWhatsApp ? "Sending..." : "Send via WhatsApp"}
                        </Button>

                        <Button
                            variant="contained"
                            color="info"
                            onClick={() => {
                                alert("Note: This feature works best with desktop email clients like Outlook. For web-based email services like Gmail, please download the PDF and attach it manually.");
                                sendBillViaEmail();
                            }}
                        >
                            Send Email with PDF
                        </Button>
                    </Box>
                </Box>
            )}
        </Paper>

        {/* Payment Method Selection Dialog */}
        <Dialog
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            fullScreen={isMobile}
        >
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            sx={{ py: isMobile ? 1 : 1.5 }}
                            startIcon={<AccountBalanceIcon />}
                            onClick={() => selectPaymentMethod("Cash")}
                        >
                            Cash Payment
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ py: isMobile ? 1 : 1.5 }}
                            startIcon={<CreditCardIcon />}
                            onClick={() => selectPaymentMethod("Card")}
                        >
                            Credit/Debit Card
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            sx={{ py: isMobile ? 1 : 1.5 }}
                            startIcon={<AccountBalanceIcon />}
                            onClick={() => selectPaymentMethod("Online Payment")}
                        >
                            Online Payment
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setShowPaymentModal(false)}
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>

        {/* Processing Payment Dialog */}
        <Dialog
            open={showProcessModal}
            onClose={() => setShowProcessModal(false)}
            fullScreen={isMobile}
        >
            <DialogTitle>Processing {paymentMethod} Payment</DialogTitle>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <LinearProgress sx={{ mb: 3 }} />
                    <Typography>
                        Processing your payment via {paymentMethod}...
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setShowProcessModal(false)}
                    color="error"
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={processPayment}
                    variant="contained"
                    color="primary"
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Confirm Payment
                </Button>
            </DialogActions>
        </Dialog>

        {/* Email Dialog */}
        <Dialog
            open={showEmailDialog}
            onClose={() => setShowEmailDialog(false)}
            fullScreen={isMobile}
            maxWidth="md"
        >
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Recipient Email"
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
                            label="Subject"
                            variant="outlined"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Message"
                            multiline
                            rows={6}
                            variant="outlined"
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            helperText="This message will be sent along with the PDF invoice attachment"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{
                            p: 2,
                            backgroundColor: 'info.light',
                            borderRadius: 1,
                            color: 'info.contrastText'
                        }}>
                            <Typography variant="body2">
                                📎 The PDF invoice will be automatically attached to this email.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setShowEmailDialog(false)}
                    sx={{ width: isMobile ? "100%" : "auto" }}
                    disabled={sendingEmail}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EmailIcon />}
                    onClick={sendBillViaEmail}
                    disabled={!emailRecipient.includes('@')}
                    fullWidth={isMobile}
                >
                    Send Email
                </Button>
            </DialogActions>
        </Dialog>

        {/* Edit Price Dialog */}
        <Dialog
            open={showEditPriceDialog}
            onClose={() => setShowEditPriceDialog(false)}
            fullScreen={isMobile}
        >
            <DialogTitle>
                Edit {editItem.field === "pricePerUnit" ? "Part Price" : "Labor Cost"}
            </DialogTitle>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label={
                        editItem.field === "pricePerUnit"
                            ? "New Price per Unit"
                            : "New Labor Cost"
                    }
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={editItem.value}
                    onChange={(e) =>
                        setEditItem({ ...editItem, value: e.target.value })
                    }
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setShowEditPriceDialog(false)}
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={saveEditedPrice}
                    variant="contained"
                    color="primary"
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>

        {/* New Part Dialog */}
        <Dialog
            open={showNewPartDialog}
            onClose={() => setShowNewPartDialog(false)}
            fullScreen={isMobile}
        >
            <DialogTitle>Add New Part</DialogTitle>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Part Name"
                    fullWidth
                    variant="outlined"
                    value={newPart.name}
                    onChange={(e) =>
                        setNewPart({ ...newPart, name: e.target.value })
                    }
                />
                <TextField
                    margin="dense"
                    label="Quantity"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={newPart.quantity}
                    onChange={(e) =>
                        setNewPart({ ...newPart, quantity: e.target.value })
                    }
                />
                <TextField
                    margin="dense"
                    label="Price per Unit"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={newPart.pricePerUnit}
                    onChange={(e) =>
                        setNewPart({ ...newPart, pricePerUnit: e.target.value })
                    }
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setShowNewPartDialog(false)}
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={addNewPart}
                    variant="contained"
                    color="primary"
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Add Part
                </Button>
            </DialogActions>
        </Dialog>

        {/* New Service Dialog */}
        <Dialog
            open={showNewServiceDialog}
            onClose={() => setShowNewServiceDialog(false)}
            fullScreen={isMobile}
        >
            <DialogTitle>Add New Service</DialogTitle>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Service Name"
                    fullWidth
                    variant="outlined"
                    value={newService.name}
                    onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                    }
                />
                <TextField
                    margin="dense"
                    label="Engineer Name"
                    fullWidth
                    variant="outlined"
                    value={newService.engineer}
                    onChange={(e) =>
                        setNewService({ ...newService, engineer: e.target.value })
                    }
                />
                <TextField
                    margin="dense"
                    label="Labor Cost"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={newService.laborCost}
                    onChange={(e) =>
                        setNewService({ ...newService, laborCost: e.target.value })
                    }
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setShowNewServiceDialog(false)}
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={addNewService}
                    variant="contained"
                    color="primary"
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    Add Service
                </Button>
            </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
            open={showApiResponse}
            autoHideDuration={6000}
            onClose={() => setShowApiResponse(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Alert
                onClose={() => setShowApiResponse(false)}
                severity={apiResponseMessage?.type || "info"}
                sx={{ width: "100%" }}
            >
                {apiResponseMessage?.message}
            </Alert>
        </Snackbar>
    </Box>
);
};

export default AutoServeBilling;