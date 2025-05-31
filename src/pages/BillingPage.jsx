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
     const{ id } =useParams();

    const jobCardIdFromUrl = id;
    
    const today = new Date().toISOString().split("T")[0];

  const [garageDetails, setGarageDetails] = useState({
    name: "",
    address: "",
    phone: "",
});

useEffect(() => {
    const fetchJobCardData = async () => {
        // Existing code...
    };

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

    fetchJobCardData();
}, [jobCardIdFromUrl, today, garageId]);
    
    // Alternative method to get jobCardId if not using react-router params
    // const getJobCardIdFromUrl = () => {
    //     const pathSegments = location.pathname.split('/');
    //     const idIndex = pathSegments.findIndex(segment => segment === 'billing') + 1;
    //     return pathSegments[idIndex] || '';
    // };
 
  
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

    // Fetch job card data from API
    useEffect(() => {
         if(!garageId){
        navigate("\login")
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
                    // Initialize with empty array if no parts
                    setParts([]);
                }

                // Process services data from API
                let apiServices = [];
                
                // Check if services exist in the response
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
                
                // If no services array, create from labor hours if available
                if (apiServices.length === 0 && data.laborHours) {
                    apiServices = [{
                        id: 1,
                        name: 'General Service',
                        engineer: data.engineerId?.name || 'Assigned Engineer',
                        progress: 100,
                        status: 'Completed',
                        laborCost: parseFloat(data.laborHours) * 500 || 0 // Assuming 500 per hour
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

                // Set default empty state on error
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
    }, [jobCardIdFromUrl,  today]);

    // Calculate totals whenever parts, services, or discount changes
    useEffect(() => {
        calculateTotals();
    }, [parts, services, summary.discount]);

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
- Total Amount: ₹${summary.totalAmount}
- Date: ${carDetails.billingDate}

Thank you for choosing SHIVAM MOTORS for your vehicle service needs.

Best regards,
SHIVAM MOTORS
Contact: 9909047943`);
    }, [carDetails, summary.totalAmount]);

    const calculateTotals = () => {
        const totalPartsCost = parts.reduce((sum, part) => sum + (part.total || 0), 0);
        const totalLaborCost = services.reduce(
            (sum, service) => sum + (service.laborCost || 0),
            0
        );
        const subtotal = totalPartsCost + totalLaborCost;
        const gstAmount = Math.round(subtotal * 0.18);
        const discount = summary.discount || 0;
        const totalAmount = subtotal + gstAmount - discount;

        setSummary({
            totalPartsCost,
            totalLaborCost,
            subtotal,
            gstAmount,
            discount,
            totalAmount,
        });
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };
const generatePdfBase64 = () => {
    const doc = new jsPDF();
    doc.text("Invoice Details", 10, 10);
    doc.text(`Customer: ${carDetails.customerName}`, 10, 20);
    doc.text(`Total: ₹${summary.totalAmount}`, 10, 30);
    return doc.output('datauristring').split(',')[1]; // Return Base64 without prefix
};

    // Enhanced PDF generation function
    // Enhanced PDF generation function with proper rupee symbol handling
const generatePdfInvoice = () => {
    try {
        const doc = new jsPDF();

        // Set properties
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const centerX = pageWidth / 2;
        let currentY = 15;

        // Use 'Rs.' instead of rupee symbol for better compatibility
        const rupeeSymbol = 'Rs.';

        // Add company header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(garageDetails.name, centerX, currentY, { align: 'center' });
        currentY += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(garageDetails.address, centerX, currentY, { align: 'center' });
        currentY += 5;
        doc.text(`Contact: ${garageDetails.phone}`, centerX, currentY, { align: 'center' });

        // Add line separator
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(10, currentY, pageWidth - 10, currentY);
        currentY += 10;

        // Add invoice number and date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`INVOICE #${carDetails.invoiceNo}`, 10, currentY);

        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${formattedDate}`, pageWidth - 10, currentY, { align: 'right' });
        currentY += 15;

        // Customer details
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Details:', 10, currentY);
        currentY += 7;

        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${carDetails.customerName}`, 10, currentY);
        currentY += 7;
        doc.text(`Vehicle: ${carDetails.company} ${carDetails.model} (${carDetails.carNumber})`, 10, currentY);
        currentY += 7;
        doc.text(`Contact: ${carDetails.contact}`, 10, currentY);
        currentY += 7;
        doc.text(`Email: ${carDetails.email}`, 10, currentY);
        currentY += 15;

        // Parts section if available
        if (parts.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Parts Used:', 10, currentY);
            currentY += 10;

            // Parts table header
            const colWidths = [60, 25, 35, 35];
            const colX = [10, 70, 95, 130];

            // Draw table header
            doc.setFillColor(66, 139, 202);
            doc.rect(10, currentY - 5, 155, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text('Part Name', colX[0] + 2, currentY);
            doc.text('Qty', colX[1] + 2, currentY);
            doc.text('Price/Piece', colX[2] + 2, currentY);
            doc.text('Total', colX[3] + 2, currentY);
            currentY += 8;

            // Draw parts data
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            parts.forEach((part, index) => {
                const bgColor = index % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
                doc.setFillColor(...bgColor);
                doc.rect(10, currentY - 5, 155, 8, 'F');

                doc.text(String(part.name || ''), colX[0] + 2, currentY);
                doc.text(String(part.quantity || ''), colX[1] + 2, currentY);
                doc.text(`${rupeeSymbol} ${part.pricePerUnit || ''}`, colX[2] + 2, currentY);
                doc.text(`${rupeeSymbol} ${part.total || ''}`, colX[3] + 2, currentY);
                currentY += 8;
            });

            currentY += 10;
        }

        // Services section if available
        if (services.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Services:', 10, currentY);
            currentY += 10;

            // Services table header
            const colX = [10, 70, 95, 130];
            doc.setFillColor(66, 139, 202);
            doc.rect(10, currentY - 5, 155, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text('Service Name', colX[0] + 2, currentY);
            doc.text('Engineer', colX[1] + 2, currentY);
            doc.text('Status', colX[2] + 2, currentY);
            doc.text('Labor Cost', colX[3] + 2, currentY);
            currentY += 8;

            // Draw services data
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            services.forEach((service, index) => {
                const bgColor = index % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
                doc.setFillColor(...bgColor);
                doc.rect(10, currentY - 5, 155, 8, 'F');

                doc.text(String(service.name || ''), colX[0] + 2, currentY);
                doc.text(String(service.engineer || '-'), colX[1] + 2, currentY);
                doc.text(String(service.status || 'Completed'), colX[2] + 2, currentY);
                doc.text(`${rupeeSymbol} ${service.laborCost || ''}`, colX[3] + 2, currentY);
                currentY += 8;
            });

            currentY += 15;
        }

        // Tax and total summary
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill Summary:', 10, currentY);
        currentY += 10;

        const halfGst = Math.round(summary.gstAmount / 2);

        // Updated summary data with proper rupee symbol
        const summaryData = [
            ['Parts Total:', `${rupeeSymbol} ${summary.totalPartsCost}`],
            ['Labor Total:', `${rupeeSymbol} ${summary.totalLaborCost}`],
            ['Subtotal:', `${rupeeSymbol} ${summary.subtotal}`],
            ['CGST (9%):', `${rupeeSymbol} ${halfGst}`],
            ['SGST (9%):', `${rupeeSymbol} ${halfGst}`],
            ['Discount:', `${rupeeSymbol} ${summary.discount}`],
            ['Total Amount:', `${rupeeSymbol} ${summary.totalAmount}`]
        ];

        const summaryStartX = pageWidth / 2 + 10;
        summaryData.forEach((item, index) => {
            const isTotal = index === summaryData.length - 1;
            doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
            doc.text(item[0], summaryStartX, currentY);
            doc.text(item[1], pageWidth - 20, currentY, { align: 'right' });
            currentY += 7;
        });

        currentY += 10;

        // Notes section
        if (finalInspection && finalInspection.trim() !== '') {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Notes:', 10, currentY);
            currentY += 7;
            doc.setFont('helvetica', 'normal');

            // Split text if too long
            const lines = doc.splitTextToSize(finalInspection, pageWidth - 20);
            lines.forEach(line => {
                if (currentY > pageHeight - 20) {
                    doc.addPage();
                    currentY = 20;
                }
                doc.text(line, 10, currentY);
                currentY += 7;
            });
            currentY += 5;
        }

        // Payment info and footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Payment Method: ${paymentMethod || 'DELIVERY AGAINST CASH ONLY'}`, 10, currentY);
        currentY += 10;

        doc.setFont('helvetica', 'italic');
        doc.text('Thank you for choosing our service!', centerX, currentY, { align: 'center' });

        return doc;
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw new Error('Failed to generate PDF document');
    }
};

// Alternative function with number formatting for currency
const formatCurrencyForPdf = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
    }).format(amount);
};

// Enhanced WhatsApp function with proper rupee symbol
// const sendBillViaWhatsApp = async () => {
//     setSendingWhatsApp(true);

//     try {
//         if (!carDetails.contact || carDetails.contact.length < 10) {
//             throw new Error("Valid contact number is required to send WhatsApp message");
//         }

//         const today = new Date();
//         const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

//         const billMessage = `*INVOICE #${carDetails.invoiceNo}*

// *SHIVAM MOTORS*
// PLOT NO:5, PHASE-1 NARODA GIDC, OPP.BSNL TELEPHONE EXCHANGE,NARODA
// GST: 24ADPFS3849B1ZY
// Contact: 9909047943

// *Customer:* ${carDetails.customerName}
// *Vehicle:* ${carDetails.company} ${carDetails.model} (${carDetails.carNumber})
// *Date:* ${formattedDate}

// ${parts.length > 0 ? `*Parts:*
// ${parts.map(part => `- ${part.name}: Rs. ${formatCurrencyForPdf(part.total)}`).join('\n')}` : ''}

// ${services.length > 0 ? `*Services:*
// ${services.map(service => `- ${service.name}: Rs. ${formatCurrencyForPdf(service.laborCost)}`).join('\n')}` : ''}

// *Taxes:*
// - CGST (9%): Rs. ${formatCurrencyForPdf(Math.round(summary.gstAmount / 2))}
// - SGST (9%): Rs. ${formatCurrencyForPdf(Math.round(summary.gstAmount / 2))}

// *Total Amount: Rs. ${formatCurrencyForPdf(summary.totalAmount)}*

// ${finalInspection ? finalInspection : ''}

// *Payment Method: ${paymentMethod || 'DELIVERY AGAINST CASH ONLY'}*

// Thank you for choosing our service!`;

//         let phoneNumber = carDetails.contact.replace(/\D/g, '');
//         if (phoneNumber.length === 10) {
//             phoneNumber = `91${phoneNumber}`;
//         }

//         const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(billMessage)}`;
//         window.open(whatsappUrl, '_blank');

//         setApiResponseMessage({
//             type: "success",
//             message: `WhatsApp invoice prepared for ${carDetails.customerName}. Please send the message in the opened WhatsApp tab.`,
//         });
//     } catch (error) {
//         console.error("WhatsApp send error:", error);
//         setApiResponseMessage({
//             type: "warning",
//             message: error.message || "Couldn't send WhatsApp message. Please try again.",
//         });
//     } finally {
//         setSendingWhatsApp(false);
//         setShowApiResponse(true);
//     }
// };

    const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject();
        reader.readAsDataURL(blob);
    });
};

const downloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Invoice Details", 10, 10);
    doc.save("invoice.pdf");
};

const sendEmailWithPdf = async () => {
    const pdfBlob = generatePdf();
    const base64Pdf = await blobToBase64(pdfBlob);

    const recipient = "customer@example.com";
    const subject = "Your Invoice";
    const body = "Please find attached your invoice.";
    const dataUri = `data:application/pdf;base64,${base64Pdf}`;

    // Attempt to open mail client with attachment
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&attachment=${encodeURIComponent(dataUri)}`;
};

const generatePdf = () => {
    const doc = new jsPDF();
    doc.text("Invoice Details", 10, 10);
    doc.text("Customer: John Doe", 10, 20);
    doc.text("Total: ₹5000", 10, 30);

    // Save as blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
};

    // Download PDF function
   const downloadPdfBill = () => {
    const doc = generatePdfInvoice();
    const fileName = `Invoice_${carDetails.invoiceNo}_${carDetails.carNumber}.pdf`;
    doc.save(fileName);
};

    // Email functions
    const openEmailDialog = () => {
        setShowEmailDialog(true);
    };
 const sendBillViaEmail = () => {
    const pdfBase64 = generatePdfBase64();
    const fileName = `Invoice_${carDetails.invoiceNo}_${carDetails.carNumber}.pdf`;
    
    const subject = encodeURIComponent(emailSubject || 'Your Invoice');
    const body = encodeURIComponent(emailMessage || 'Please find attached your invoice.');
    const recipient = encodeURIComponent(emailRecipient || '');
    
    const dataUri = `data:application/pdf;base64,${pdfBase64}`;
    
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&attachment=${encodeURIComponent(dataUri)}`;
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
        // For online payments, we'll call the payment API directly
        processOnlinePayment();
    } else {
        // For other methods, show the process modal
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

    setShowProcessModal(true); // Show processing indicator

    try {
        // First generate the bill
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
                gstPercentage: 18,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    
                },
            }
        );

        const responseData = billResponse.data;
        
        // Check if the response contains the bill object
        if (!responseData.bill || !responseData.bill._id) {
            throw new Error("Invalid response structure - missing bill ID");
        }

        const billId = responseData.bill._id;
        const invoiceNo = responseData.bill.invoiceNo;

        // Update the invoice number in state
        setCarDetails(prev => ({
            ...prev,
            invoiceNo: invoiceNo || prev.invoiceNo
        }));

        // Then process the online payment
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

    // Prepare the request data
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
        gstPercentage: 18,
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
            
            // Update the invoice number if returned from API
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

    // WhatsApp function
    const sendBillViaWhatsApp = async () => {
        setSendingWhatsApp(true);

        try {
            if (!carDetails.contact || carDetails.contact.length < 10) {
                throw new Error("Valid contact number is required to send WhatsApp message");
            }

            const today = new Date();
            const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

            const billMessage = `*INVOICE #${carDetails.invoiceNo}*

*SHIVAM MOTORS*
PLOT NO:5, PHASE-1 NARODA GIDC, OPP.BSNL TELEPHONE EXCHANGE,NARODA
GST: 24ADPFS3849B1ZY
Contact: 9909047943

*Customer:* ${carDetails.customerName}
*Vehicle:* ${carDetails.company} ${carDetails.model} (${carDetails.carNumber})
*Date:* ${formattedDate}

${parts.length > 0 ? `*Parts:*
${parts.map(part => `- ${part.name}: ₹${part.total}`).join('\n')}` : ''}

${services.length > 0 ? `*Services:*
${services.map(service => `- ${service.name}: ₹${service.laborCost}`).join('\n')}` : ''}
*Taxes:*
- CGST (9%): ₹${Math.round(summary.gstAmount / 2)}
- SGST (9%): ₹${Math.round(summary.gstAmount / 2)}

*Total Amount: ₹${summary.totalAmount}*

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
      <TableCell>Sr.No</TableCell>
      <TableCell>Part Name</TableCell>
      <TableCell>Qty</TableCell>
      <TableCell>Price/Piece</TableCell>
      <TableCell>Total Price</TableCell>
      <TableCell>Action</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {parts.map((part, index) => (
      <TableRow key={part.id} hover>
        <TableCell sx={tableCellStyle}>{index + 1}</TableCell>
        <TableCell sx={tableCellStyle}>{part.name}</TableCell>
        <TableCell sx={tableCellStyle}>
          {part.quantity}
        </TableCell>
        <TableCell sx={tableCellStyle}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {formatCurrency(part.pricePerUnit).replace(
              "₹",
              ""
            )}
            <IconButton
              size="small"
              color="primary"
              onClick={() =>
                openEditPrice(
                  part.id,
                  "part",
                  "pricePerUnit",
                  part.pricePerUnit
                )
              }
              sx={{ ml: 1 }}
            >
              <EditIcon
                fontSize={isMobile ? "small" : "medium"}
              />
            </IconButton>
          </Box>
        </TableCell>
        <TableCell sx={tableCellStyle}>
          {formatCurrency(part.total)}
        </TableCell>
        <TableCell sx={tableCellStyle}>
          <IconButton
            size="small"
            color="error"
            onClick={() => removePart(part.id)}
          >
            <DeleteIcon
              fontSize={isMobile ? "small" : "medium"}
            />
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
                                        No parts data available from API. Click "Add Part" to add manually.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Service Details */}
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
                                        Service Details ({services.length})
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<AddIcon />}
                                        onClick={() => setShowNewServiceDialog(true)}
                                        size={isMobile ? "small" : "medium"}
                                        fullWidth={isMobile}
                                    >
                                        Add Service
                                    </Button>
                                </Box>
                                {services.length > 0 ? (
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
            {formatCurrency(service.laborCost).replace(
              "₹",
              ""
            )}
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
              <EditIcon
                fontSize={isMobile ? "small" : "medium"}
              />
            </IconButton>
          </Box>
        </TableCell>
        <TableCell sx={tableCellStyle}>
          <IconButton
            size="small"
            color="error"
            onClick={() => removeService(service.id)}
          >
            <DeleteIcon
              fontSize={isMobile ? "small" : "medium"}
            />
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

                        {/* Bill Summary */}
                        {/* <Card>
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
                                    sx={{ p: isMobile ? 2 : 3, backgroundColor: "grey.50" }}
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
                                        {
                                            label: "GST (18%):",
                                            value: formatCurrency(summary.gstAmount),
                                        },
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
                                                                <InputAdornment position="start">
                                                                    ₹
                                                                </InputAdornment>
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
                                        <Box
                                            key={index}
                                            sx={{
                                                display: "flex",
                                                flexDirection: isMobile ? "column" : "row",
                                                justifyContent: "space-between",
                                                mb: 1,
                                                py: 1,
                                                borderBottom: "1px dashed grey.300",
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
                                            Total Amount:
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
                        </Card> */}

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
                        ? 'rgba(255, 255, 255, 0.05)' // Dark mode background
                        : 'grey.50' // Light mode background
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
                {
                    label: "GST (18%):",
                    value: formatCurrency(summary.gstAmount),
                },
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
                                        <InputAdornment position="start">
                                            ₹
                                        </InputAdornment>
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
                <Box
                    key={index}
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
                    Total Amount:
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

                {/* Thank You Message (shown after payment) */}
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

                        {/* Enhanced Button Container with all sharing options */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'center',
                            gap: 2,
                            mt: 3
                        }}>
                            {/* <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PrintIcon />}
                                onClick={printBill}
                                size={isMobile ? "small" : "medium"}
                                fullWidth={isMobile}
                            >
                                Print Bill
                            </Button> */}

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
          
                      {/* API Response Snackbar */}
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


