import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Paper,
  CssBaseline,
  Container,
  LinearProgress,
  Rating,
  useTheme,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Snackbar,
  Alert,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Avatar,
  CardMedia,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  Save as SaveIcon,
  PhotoCamera,
  Videocam,
  DirectionsCar,
  Person,
  LocalGasStation,
  Phone,
  Email,
  DriveEta,
  Description,
  Speed,
  EventNote,
  Policy,
  Numbers,
  LocalOffer,
  AttachMoney,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  CloudUpload as CloudUploadIcon,
  Preview as PreviewIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  CurrencyRupee,
  CameraAlt,
  Refresh as RefreshIcon,
  PhotoLibrary,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Styled components
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UploadButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: "10px 15px",
  margin: "8px 0",
  textTransform: "none",
  fontWeight: 500,
  boxShadow: "none",
  border: `1px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
  },
}));

const CameraButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: "10px 15px",
  margin: "8px 0",
  textTransform: "none",
  fontWeight: 500,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const PreviewDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    maxWidth: "90vw",
    maxHeight: "90vh",
    margin: theme.spacing(2),
  },
}));

const PreviewCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: `1px solid ${theme.palette.divider}`,
}));

const CameraContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  maxWidth: 400,
  margin: "0 auto",
  backgroundColor: "#000",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

const CameraVideo = styled("video")({
  width: "100%",
  height: "auto",
  display: "block",
});

const CameraCanvas = styled("canvas")({
  display: "none",
});

// Camera Photo Upload Component
const CameraPhotoUpload = ({
  imageType,
  existingImage,
  newImage,
  onImageChange,
  onRemoveExisting,
  onRemoveNew,
  fileError,
}) => {
  const theme = useTheme();
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera
  const startCamera = useCallback(async () => {
    setCameraError("");
    setIsCapturing(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Use back camera on mobile
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Unable to access camera. ";

      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow camera permission and try again.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (error.name === "NotSupportedError") {
        errorMessage += "Camera is not supported in this browser.";
      } else {
        errorMessage += "Please check camera permissions and try again.";
      }

      setCameraError(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Create a File object from the blob
          const fileName = `${imageType.key}_captured_${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: "image/jpeg" });

          setCapturedPhoto(URL.createObjectURL(blob));

          // Store the file for upload
          onImageChange(file);
        }
      },
      "image/jpeg",
      0.9
    );
  }, [imageType.key, onImageChange]);

  // Handle camera dialog open
  const handleOpenCamera = () => {
    setShowCamera(true);
    setCapturedPhoto(null);
    startCamera();
  };

  // Handle camera dialog close
  const handleCloseCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCapturedPhoto(null);
    setCameraError("");
  };

  // Handle photo confirmation
  const handleConfirmPhoto = () => {
    stopCamera();
    setShowCamera(false);
    setCapturedPhoto(null);
  };

  // Handle retake photo
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageChange(file);
    }
    // Clear the input value so the same file can be selected again
    event.target.value = "";
  };

  // Check if camera is supported
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        {imageType.label}
      </Typography>

      {/* Display existing image */}
      {existingImage && !newImage && (
        <Box sx={{ mb: 2, position: "relative" }}>
          <img
            src={existingImage}
            alt={imageType.label}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
          <IconButton
            size="small"
            onClick={onRemoveExisting}
            sx={{
              position: "absolute",
              top: 5,
              right: 5,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
            }}
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
          <Chip
            label="Current Image"
            size="small"
            color="default"
            sx={{ mt: 1 }}
          />
        </Box>
      )}

      {/* Display new uploaded/captured image */}
      {newImage && (
        <Box sx={{ mb: 2, position: "relative" }}>
          <img
            src={URL.createObjectURL(newImage)}
            alt={imageType.label}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid #4caf50",
            }}
          />
          <IconButton
            size="small"
            onClick={onRemoveNew}
            sx={{
              position: "absolute",
              top: 5,
              right: 5,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
            }}
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
          <Chip
            label={
              newImage.name && newImage.name.includes("captured")
                ? "Photo Captured"
                : "Photo Selected"
            }
            size="small"
            color="success"
            sx={{ mt: 1 }}
          />
        </Box>
      )}

      {/* Action buttons */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        flexWrap="wrap"
        sx={{ mb: 1 }}
      >
        {/* Camera button - only show if camera is supported */}
        {isCameraSupported() && (
          <Tooltip title="Take photo with camera">
            <CameraButton
              startIcon={<CameraAlt />}
              onClick={handleOpenCamera}
              size="small"
            >
              Take Photo
            </CameraButton>
          </Tooltip>
        )}

        {/* Upload button */}
        <Tooltip title="Upload from device">
          <UploadButton
            component="label"
            variant="outlined"
            startIcon={<PhotoLibrary />}
            size="small"
          >
            {newImage ? "Change" : existingImage ? "Replace" : "Upload"}
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </UploadButton>
        </Tooltip>
      </Stack>

      {/* File error display */}
      {fileError && (
        <Alert severity="error" sx={{ mt: 1, textAlign: "left" }}>
          {fileError}
        </Alert>
      )}

      {/* Camera Dialog */}
      <Dialog
        open={showCamera}
        onClose={handleCloseCamera}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CameraAlt sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Capture {imageType.label}</Typography>
          </Box>
          <IconButton onClick={handleCloseCamera}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          {cameraError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cameraError}
            </Alert>
          ) : (
            <CameraContainer>
              {!capturedPhoto ? (
                <>
                  <CameraVideo ref={videoRef} autoPlay playsInline muted />
                  <CameraCanvas ref={canvasRef} />
                </>
              ) : (
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />
              )}
            </CameraContainer>
          )}

          {isCapturing && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Starting camera...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          {cameraError ? (
            <Button
              onClick={startCamera}
              startIcon={<RefreshIcon />}
              disabled={isCapturing}
              variant="contained"
            >
              Try Again
            </Button>
          ) : !capturedPhoto ? (
            <Button
              onClick={capturePhoto}
              variant="contained"
              startIcon={<PhotoCamera />}
              disabled={!stream || isCapturing}
              color="primary"
              sx={{ px: 4 }}
            >
              Capture Photo
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                onClick={handleRetakePhoto}
                startIcon={<RefreshIcon />}
                variant="outlined"
              >
                Retake
              </Button>
              <Button
                onClick={handleConfirmPhoto}
                startIcon={<CheckIcon />}
                variant="contained"
                color="success"
              >
                Use This Photo
              </Button>
            </Stack>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Status options for dropdown
const statusOptions = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "in_progress", label: "In Progress", color: "info" },
  { value: "completed", label: "Completed", color: "success" },
  { value: "cancelled", label: "Cancelled", color: "error" },
  { value: "on_hold", label: "On Hold", color: "default" },
];

// Fuel type options
const fuelTypeOptions = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "cng", label: "CNG" },
  { value: "lpg", label: "LPG" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
];

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateChassisNumber = (chassisNumber) => {
  const upperChassis = chassisNumber.toUpperCase();
  const chassisRegex = /^[A-Z0-9]{17}$/;
  return chassisRegex.test(upperChassis);
};

const validateCarNumber = (carNumber) => {
  const carNumberRegex =
    /^[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}$/i;
  return carNumberRegex.test(carNumber);
};

const validatePolicyNumber = (policyNumber) => {
  return policyNumber.length >= 5 && policyNumber.length <= 20;
};

const validateRegistrationNumber = (regNumber) => {
  return regNumber.length >= 5 && regNumber.length <= 20;
};

const validateExcessAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= 0 && numAmount <= 1000000;
};

const validateKilometer = (km) => {
  const numKm = parseInt(km);
  return !isNaN(numKm) && numKm >= 0 && numKm <= 9999999;
};

const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 10000000;
};

const validateFileSize = (file, maxSizeMB) => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

const validateImageFile = (file) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  return allowedTypes.includes(file.type) && validateFileSize(file, 10);
};

const validateVideoFile = (file) => {
  const allowedTypes = [
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/webm",
  ];
  return allowedTypes.includes(file.type) && validateFileSize(file, 50);
};

const JobCards = () => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const [fuelLevel, setFuelLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const garageId = localStorage.getItem("garageId");

  const CreateBy = localStorage.getItem("name");

  // Form state with status field added
  const [formData, setFormData] = useState({
    customerNumber: "",
    customerName: "",
    contactNumber: "",
    email: "",
    carNumber: "",
    model: "",
    company: "",
    kilometer: "",
    fuelType: "",
    insuranceProvider: "",
    expiryDate: "",
    policyNumber: "",
    registrationNumber: "",
    type: "",
    excessAmount: "",
    chesiNumber: "",
    status: "pending",
  });

  // Job Details with price
  const [jobPoints, setJobPoints] = useState([]);
  const [currentJobDescription, setCurrentJobDescription] = useState("");
  const [currentJobPrice, setCurrentJobPrice] = useState("");

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // File state
  const [carImages, setCarImages] = useState({
    frontView: null,
    rearView: null,
    leftSide: null,
    rightSide: null,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [fileErrors, setFileErrors] = useState({});

  // Existing Images URLs (for edit mode)
  const [existingImages, setExistingImages] = useState({
    frontView: null,
    rearView: null,
    leftSide: null,
    rightSide: null,
  });
  const [existingVideo, setExistingVideo] = useState(null);

  const generatePreviewPDF = () => {
    const doc = new jsPDF();
    const primaryColor = [63, 81, 181];
    const lightGray = [245, 245, 245];
    const darkGray = [66, 66, 66];
    const blackColor = [0, 0, 0];

    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    const sectionSpacing = 12;
    const headerHeight = 30;

    let yPosition = 20;

    // --- Header ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, headerHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("JOB CARD PREVIEW", margin, 19);
    doc.setFontSize(12);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-IN")}`,
      pageWidth - margin - 50,
      19
    );
    doc.setTextColor(...blackColor);
    yPosition = headerHeight + 10;

    // --- Helper: Section Header ---
    const addSectionHeader = (title) => {
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFillColor(...lightGray);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, "F");
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkGray);
      doc.text(title, margin + 3, yPosition + 7);
      yPosition += 15;
      doc.setTextColor(...blackColor);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
    };

    // --- Customer Info ---
    addSectionHeader("CUSTOMER INFORMATION");
    const customerData = [
      ["Customer Name", formData.customerName || "N/A"],
      ["Contact Number", formData.contactNumber || "N/A"],
      ["Email", formData.email || "N/A"],
      ["Company", formData.company || "N/A"],
    ];
    autoTable(doc, {
      startY: yPosition,
      body: customerData,
      theme: "plain",
      styles: {
        fontSize: 12,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: pageWidth - 2 * margin - 55 - 10 },
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        yPosition = data.cursor.y + sectionSpacing;
      },
    });

    // --- Vehicle Info ---
    addSectionHeader("VEHICLE INFORMATION");
    const vehicleData = [
      ["Car Number", formData.carNumber || "N/A"],
      ["Model", formData.model || "N/A"],
      ["Kilometer", formData.kilometer ? `${formData.kilometer} km` : "N/A"],
      [
        "Fuel Type",
        fuelTypeOptions.find((o) => o.value === formData.fuelType)?.label ||
          "N/A",
      ],
      ["Fuel Level", getFuelLevelText(fuelLevel)],
      ["Chassis Number", formData.chesiNumber || "N/A"],
    ];
    autoTable(doc, {
      startY: yPosition,
      body: vehicleData,
      theme: "plain",
      styles: {
        fontSize: 12,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: pageWidth - 2 * margin - 55 - 10 },
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        yPosition = data.cursor.y + sectionSpacing;
      },
    });

    // --- Insurance Info ---
    if (
      formData.insuranceProvider ||
      formData.policyNumber ||
      formData.expiryDate
    ) {
      addSectionHeader("INSURANCE INFORMATION");
      const insuranceData = [
        ["Provider", formData.insuranceProvider || "N/A"],
        ["Policy Number", formData.policyNumber || "N/A"],
        [
          "Expiry Date",
          formData.expiryDate
            ? new Date(formData.expiryDate).toLocaleDateString()
            : "N/A",
        ],
        ["Type", formData.type || "N/A"],
        [
          "Excess Amount",
          formData.excessAmount ? `₹${formData.excessAmount}` : "N/A",
        ],
      ];
      autoTable(doc, {
        startY: yPosition,
        body: insuranceData,
        theme: "plain",
        styles: {
          fontSize: 12,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55 },
          1: { cellWidth: pageWidth - 2 * margin - 55 - 10 },
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          yPosition = data.cursor.y + sectionSpacing;
        },
      });
    }

    // --- Job Details ---
    if (jobPoints.length > 0) {
      addSectionHeader("JOB DETAILS & SERVICES");
      const jobDetailsData = jobPoints.map((item, index) => [
        index + 1,
        item.description || "N/A",
      ]);
      autoTable(doc, {
        startY: yPosition,
        head: [["S.No.", "Description"]],
        body: jobDetailsData,
        theme: "striped",
        styles: { fontSize: 12, cellPadding: 5 },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 25, halign: "center" },
          1: { cellWidth: pageWidth - 2 * margin - 25 - 15 },
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          yPosition = data.cursor.y + sectionSpacing;
        },
      });
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
      doc.text(
        "Generated by Job Management System",
        margin,
        doc.internal.pageSize.height - 10
      );
    }

    // --- Save PDF ---
    const fileName = `JobCardPreview_${formData.carNumber || "N/A"}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  };

  useEffect(() => {
    if (!garageId) {
      navigate("/login");
    }
  }, []);

  // Fetch job card data when id is present
  useEffect(() => {
    const fetchJobCardData = async () => {
      if (!id) return;
      setFetchingData(true);
      setIsEditMode(true);
      try {
        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`,
          {
            headers: {
              Authorization: localStorage.getItem("token")
                ? `Bearer ${localStorage.getItem("token")}`
                : "",
            },
          }
        );
        const jobCardData = response.data;

        console.log("Fetched Job Card Data:", jobCardData);

        setFormData({
          customerNumber: jobCardData.customerNumber || "",
          customerName: jobCardData.customerName || "",
          contactNumber: jobCardData.contactNumber || "",
          email: jobCardData.email || "",
          carNumber: jobCardData.carNumber || "",
          model: jobCardData.model || "",
          company: jobCardData.company || "",
          kilometer: jobCardData.kilometer?.toString() || "",
          fuelType: jobCardData.fuelType || "petrol",
          insuranceProvider: jobCardData.insuranceProvider || "",
          expiryDate: jobCardData.expiryDate
            ? new Date(jobCardData.expiryDate).toISOString().split("T")[0]
            : "",
          policyNumber: jobCardData.policyNumber || "",
          registrationNumber: jobCardData.carNumber || "",
          type: jobCardData.type || "",
          excessAmount: jobCardData.excessAmount?.toString() || "",
          chesiNumber: jobCardData.chesiNumber || "",
          status: jobCardData.status || "pending",
        });

        if (jobCardData.fuelLevel !== undefined) {
          setFuelLevel(jobCardData.fuelLevel);
        }

        // Parse job details with price information
        if (jobCardData.jobDetails) {
          try {
            const parsedJobDetails = JSON.parse(jobCardData.jobDetails);
            if (Array.isArray(parsedJobDetails)) {
              setJobPoints(parsedJobDetails);
            }
          } catch (e) {
            const lines = jobCardData.jobDetails.split("\n");
            const oldFormatPoints = lines
              .filter((line) => line.trim())
              .map((line) => ({ description: line.trim(), price: "" }));
            setJobPoints(oldFormatPoints);
          }
        }

        if (jobCardData.images && Array.isArray(jobCardData.images)) {
          const imagesByView = {
            frontView: jobCardData.images[0],
            rearView: jobCardData.images[1],
            leftSide: jobCardData.images[2],
            rightSide: jobCardData.images[3],
          };
          setExistingImages(imagesByView);
        }

        if (jobCardData.video) {
          setExistingVideo(jobCardData.video);
        }

        setSnackbar({
          open: true,
          message: "Job card data loaded successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error("Error fetching job card data:", error);
        setSnackbar({
          open: true,
          message:
            "Failed to load job card data: " +
            (error.response?.data?.message || error.message),
          severity: "error",
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchJobCardData();
  }, [id]);

  // Fields that should be converted to uppercase
  const uppercaseFields = [
    "carNumber",
    "chesiNumber",
    "policyNumber",
    "registrationNumber",
    "type",
  ];

  // Real-time validation function
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "customerName":
        if (!value.trim()) error = "Customer name is required";
        else if (value.trim().length < 2) error = "At least 2 characters";
        else if (value.trim().length > 50) error = "Max 50 characters allowed";
        break;
      case "contactNumber":
        if (!value.trim()) error = "Contact number is required";
        else if (!validatePhone(value)) error = "Enter valid phone number";
        break;
      case "email":
        if (value.trim() && !validateEmail(value)) error = "Enter valid email";
        break;
      case "carNumber":
        if (!value.trim()) error = "Car number is required";
        else if (!validateCarNumber(value)) error = "Enter valid car number";
        break;
      case "model":
        if (!value.trim()) error = "Car model is required";
        else if (value.trim().length < 2)
          error = "Model must be at least 2 characters";
        break;
      case "company":
        if (value.trim() && value.trim().length < 2)
          error = "Company must be at least 2 characters";
        break;
      case "kilometer":
        if (value && !validateKilometer(value))
          error = "Valid kilometer reading required";
        break;
      case "fuelType":
        if (!value) error = "Fuel type is required";
        break;
      case "insuranceProvider":
        if (value.trim() && value.trim().length < 2)
          error = "Insurance provider must be at least 2 characters";
        break;
      case "policyNumber":
        if (value.trim() && !validatePolicyNumber(value))
          error = "Policy number must be 5–20 characters";
        break;
      case "registrationNumber":
        if (value.trim() && !validateRegistrationNumber(value))
          error = "Must be 5–20 characters";
        break;
      case "chesiNumber":
        if (value.trim() && !validateChassisNumber(value))
          error = "Chassis number must be 10–20 characters";
        break;
      case "excessAmount":
        // Only validate if value exists and is not empty
        if (value && value.trim() && !validateExcessAmount(value))
          error = "Enter a valid amount (0–1,000,000)";
        break;
      case "status":
        if (!value) error = "Status is required";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Handle uppercase fields
    if (uppercaseFields.includes(name)) {
      updatedValue = value.toUpperCase();
    }

    // Special handling for email and chassis number
    if (name === "email") {
      updatedValue = value.trim().toLowerCase();
    }
    if (name === "chesiNumber") {
      updatedValue = value.replace(/\s/g, "").toUpperCase();
    }
    if (name === "policyNumber") {
      updatedValue = value.replace(/\s/g, "").toUpperCase();
    }

    // Reset fuel level if fuelType is CNG or LPG
    if (name === "fuelType") {
      if (value === "cng" || value === "lpg") {
        setFuelLevel(null); // Or keep it undefined
      } else {
        setFuelLevel(2); // Default to Low
      }
    }

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, updatedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const updateJobCardStatus = async (newStatus) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/jobCards/${id}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token")
              ? `Bearer ${localStorage.getItem("token")}`
              : "",
          },
        }
      );
      setFormData((prev) => ({ ...prev, status: newStatus }));
      setSnackbar({
        open: true,
        message: `Job card status updated to ${newStatus}!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setSnackbar({
        open: true,
        message:
          "Failed to update status: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Job Points Management with price
  const addJobPoint = () => {
    if (currentJobDescription.trim()) {
      const newJobPoint = {
        description: currentJobDescription.trim(),
        price: currentJobPrice.trim() || "0",
      };
      setJobPoints((prev) => [...prev, newJobPoint]);
      setCurrentJobDescription("");
      setCurrentJobPrice("");
    }
  };

  const removeJobPoint = (indexToRemove) => {
    setJobPoints((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const updateJobPoint = (index, field, value) => {
    setJobPoints((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleJobPointKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addJobPoint();
    }
  };

  // Return JSON format for API with price information
  const getJobDetailsForAPI = () => {
    const validPoints = jobPoints.filter(
      (point) => point.description && point.description.trim()
    );
    return JSON.stringify(validPoints);
  };

  // Calculate total job cost
  const calculateTotalJobCost = () => {
    return jobPoints.reduce((total, point) => {
      const price = parseFloat(point.price) || 0;
      return total + price;
    }, 0);
  };

  const validateAllFields = () => {
    const newErrors = {};
    const newTouched = {};
    Object.keys(formData).forEach((key) => {
      newTouched[key] = true;
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setTouched(newTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (view, file) => {
    if (!file) return;
    const newFileErrors = { ...fileErrors };
    if (!validateImageFile(file)) {
      newFileErrors[view] =
        "Please upload a valid image file (JPEG, PNG, WebP) under 10MB";
      setFileErrors(newFileErrors);
      return;
    }
    delete newFileErrors[view];
    setFileErrors(newFileErrors);
    setCarImages((prev) => ({ ...prev, [view]: file }));
    setExistingImages((prev) => ({ ...prev, [view]: null }));
  };

  const handleVideoUpload = (file) => {
    if (!file) return;
    const newFileErrors = { ...fileErrors };
    if (!validateVideoFile(file)) {
      newFileErrors.video =
        "Please upload a valid video file (MP4, AVI, MOV, WMV, WebM) under 50MB";
      setFileErrors(newFileErrors);
      return;
    }
    delete newFileErrors.video;
    setFileErrors(newFileErrors);
    setVideoFile(file);
    setExistingVideo(null);
  };

  const removeUploadedImage = (view) => {
    setCarImages((prev) => ({ ...prev, [view]: null }));
    setSnackbar({
      open: true,
      message: "Image removed. Upload a new one or keep existing images.",
      severity: "info",
    });
  };

  const removeUploadedVideo = () => {
    setVideoFile(null);
    setSnackbar({
      open: true,
      message: "Video removed. Upload a new one if needed.",
      severity: "info",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Preview handler - shows preview instead of immediately submitting
  const handlePreview = (e) => {
    e.preventDefault();

    // Validate all fields before showing preview
    const isFormValid = validateAllFields();
    const hasFileErrors = Object.keys(fileErrors).length > 0;

    if (!isFormValid || hasFileErrors) {
      setSnackbar({
        open: true,
        message: "Please fix all validation errors before previewing",
        severity: "error",
      });
      return;
    }

    // Check for images - required for both create and update
    const hasNewImages = Object.values(carImages).some(
      (image) => image !== null
    );
    const hasExistingImages = Object.values(existingImages).some(
      (imageUrl) => imageUrl !== null
    );

    if (!hasNewImages && !hasExistingImages) {
      setSnackbar({
        open: true,
        message: "Please upload at least one car image",
        severity: "warning",
      });
      return;
    }

    setShowPreview(true);
  };

  const handleActualSubmit = async () => {
    setLoading(true);
    setShowPreview(false);

    try {
      const apiBaseUrl = "https://garage-management-zi5z.onrender.com";

      if (!garageId) {
        navigate("/login");
        return;
      }

      // Get the createdBy value from localStorage
      const createdBy = localStorage.getItem("name") || "Unknown User";

      let response;

      if (isEditMode && id) {
        // For updates, handle images/video separately if there are new files
        const hasNewImages = Object.values(carImages).some(
          (image) => image !== null
        );
        const hasNewFiles = hasNewImages || videoFile;

        if (hasNewFiles) {
          // Use FormData for file uploads in edit mode
          const formDataToSend = new FormData();

          // Add all form fields
          Object.entries(formData).forEach(([key, value]) => {
            if (value) formDataToSend.append(key, value);
          });

          // Add additional fields including createdBy
          formDataToSend.append("jobDetails", getJobDetailsForAPI());
          formDataToSend.append("garageId", garageId);
          formDataToSend.append("fuelLevel", fuelLevel);
          formDataToSend.append("createdBy", createdBy); // Added this line

          // Add information about which existing images to keep
          const imagesToKeep = Object.entries(existingImages)
            .filter(([key, value]) => value !== null)
            .map(([key]) => key);
          formDataToSend.append(
            "keepExistingImages",
            JSON.stringify(imagesToKeep)
          );

          // Add information about video removal
          if (!existingVideo && !videoFile) {
            formDataToSend.append("removeVideo", "true");
          }

          // Add image files
          Object.entries(carImages).forEach(([view, file]) => {
            if (file)
              formDataToSend.append("images", file, `${view}_${file.name}`);
          });

          // Add video file
          if (videoFile) {
            formDataToSend.append(
              "video",
              videoFile,
              `video_${videoFile.name}`
            );
          }

          const configWithFiles = {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: localStorage.getItem("token")
                ? `Bearer ${localStorage.getItem("token")}`
                : "",
            },
            timeout: 60000,
          };

          response = await axios.put(
            `${apiBaseUrl}/api/garage/jobCards/${id}`,
            formDataToSend,
            configWithFiles
          );
        } else {
          // Use JSON for updates without new files
          const jobCardPayload = {
            contactNumber: formData.contactNumber,
            customerName: formData.customerName,
            email: formData.email,
            carNumber: formData.carNumber,
            model: formData.model,
            company: formData.company,
            kilometer: formData.kilometer,
            fuelType: formData.fuelType,
            insuranceProvider: formData.insuranceProvider,
            expiryDate: formData.expiryDate,
            policyNumber: formData.policyNumber,
            registrationNumber: formData.carNumber,
            type: formData.type,
            excessAmount: formData.excessAmount,
            chesiNumber: formData.chesiNumber,
            status: formData.status,
            jobDetails: getJobDetailsForAPI(),
            fuelLevel: fuelLevel,
            createdBy: createdBy, // Added this line
            keepExistingImages: Object.entries(existingImages)
              .filter(([key, value]) => value !== null)
              .map(([key]) => key),
            keepExistingVideo: existingVideo !== null,
          };

          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("token")
                ? `Bearer ${localStorage.getItem("token")}`
                : "",
            },
          };

          response = await axios.put(
            `${apiBaseUrl}/api/garage/jobCards/${id}`,
            jobCardPayload,
            config
          );
        }
      } else {
        // Create new job card - always use FormData
        const formDataToSend = new FormData();

        // Add all form fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value) formDataToSend.append(key, value);
        });

        // Add additional fields
        formDataToSend.append("jobDetails", getJobDetailsForAPI());
        formDataToSend.append("garageId", garageId);
        formDataToSend.append("fuelLevel", fuelLevel);
        formDataToSend.append("customerNumber", 1);
        formDataToSend.append("createdBy", createdBy); // Changed from CreateBy to createdBy for consistency
        // Note: If your API expects 'CreateBy' instead of 'createdBy', change it back to:
        // formDataToSend.append('CreateBy', createdBy);

        // Add image files
        Object.entries(carImages).forEach(([view, file]) => {
          if (file)
            formDataToSend.append("images", file, `${view}_${file.name}`);
        });

        // Add video file
        if (videoFile) {
          formDataToSend.append("video", videoFile, `video_${videoFile.name}`);
        }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: localStorage.getItem("token")
              ? `Bearer ${localStorage.getItem("token")}`
              : "",
          },
          timeout: 60000,
        };

        response = await axios.post(
          `${apiBaseUrl}/api/garage/jobCards/add`,
          formDataToSend,
          config
        );
      }

      setSnackbar({
        open: true,
        message: `Job card ${isEditMode ? "updated" : "created"} successfully!`,
        severity: "success",
      });

      setTimeout(
        () =>
          navigate(
            `/Assign-Engineer/${
              response.data.jobCard?._id || response.data._id || id
            }`,
            {
              state: {
                jobCardId:
                  response.data.jobCard?._id || response.data._id || id,
              },
            }
          ),
        1500
      );
    } catch (error) {
      console.error("API Error:", error);
      let errorMessage = `Failed to ${
        isEditMode ? "update" : "create"
      } job card`;
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.status === 400 && error.response.data.errors) {
          const serverErrors = {};
          error.response.data.errors.forEach((err) => {
            serverErrors[err.field] = err.message;
          });
          setErrors((prev) => ({ ...prev, ...serverErrors }));
        }
      } else if (error.request) {
        errorMessage = "Network error - please check your connection";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout - please try again";
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const getFieldStyling = (fieldName) => {
    if (uppercaseFields.includes(fieldName)) {
      return { textTransform: "uppercase" };
    }
    return {};
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.color : "default";
  };

  const getFuelLevelText = (level) => {
    switch (level) {
      case 1:
        return "Very Low";
      case 2:
        return "Low";
      case 3:
        return "Medium";
      case 4:
        return "High";
      case 5:
        return "Full";
      default:
        return "Unknown";
    }
  };

  // Customer & Car Details fields
  const customerCarFields = [
    {
      name: "customerName",
      label: "Customer Name",
      icon: <Person />,
      required: true,
    },
    {
      name: "contactNumber",
      label: "Contact Number",
      icon: <Phone />,
      required: true,
    },
    { name: "email", label: "Email", icon: <Email /> },
    {
      name: "carNumber",
      label: "Car Number",
      icon: <DriveEta />,
      required: true,
    },
    { name: "model", label: "Model", icon: <DirectionsCar />, required: true },
    { name: "company", label: "Company", icon: <LocalOffer /> },
    { name: "kilometer", label: "Kilometer", icon: <Speed />, type: "number" },
    {
      name: "chesiNumber",
      label: "Chassis Number",
      icon: <Numbers />,
      helperText: "Vehicle Identification Number (VIN)",
    },
  ];

  // Preview Component
  const PreviewModal = () => (
    <PreviewDialog
      open={showPreview}
      onClose={() => setShowPreview(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <VisibilityIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h5" component="div">
            Job Card Preview
          </Typography>
        </Box>
        <IconButton onClick={() => setShowPreview(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Header Info */}

          {/* Customer Details */}
          <PreviewCard>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Person sx={{ mr: 1 }} />
                Customer Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Customer Name:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Number:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.contactNumber}
                  </Typography>
                </Grid>
                {formData.email && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.email}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </PreviewCard>

          {/* Vehicle Details */}
          <PreviewCard>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <DirectionsCar sx={{ mr: 1 }} />
                Vehicle Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Car Number:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.carNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Model:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.model}
                  </Typography>
                </Grid>
                {formData.company && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Company:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.company}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fuel Type:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {fuelTypeOptions.find(
                      (option) => option.value === formData.fuelType
                    )?.label || formData.fuelType}
                  </Typography>
                </Grid>
                {formData.kilometer && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Kilometer:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.kilometer} km
                    </Typography>
                  </Grid>
                )}
                {formData.chesiNumber && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Chassis Number:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.chesiNumber}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </PreviewCard>

          {/* Fuel Level - Only shown if fuelType is not CNG or LPG */}
          {formData.fuelType !== "cng" && formData.fuelType !== "lpg" && (
            <PreviewCard>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <LocalGasStation sx={{ mr: 1 }} />
                  Fuel Level
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Rating
                    name="fuel-level-preview"
                    value={fuelLevel}
                    readOnly
                    max={5}
                    size="large"
                    icon={<LocalGasStation fontSize="inherit" />}
                    emptyIcon={<LocalGasStation fontSize="inherit" />}
                  />
                  <Typography variant="body1" fontWeight={500}>
                    {fuelLevel}/5 - {getFuelLevelText(fuelLevel)}
                  </Typography>
                </Box>
              </CardContent>
            </PreviewCard>
          )}

          {/* Insurance Details */}
          {(formData.insuranceProvider ||
            formData.policyNumber ||
            formData.expiryDate ||
            formData.type ||
            formData.excessAmount) && (
            <PreviewCard>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Policy sx={{ mr: 1 }} />
                  Insurance Details
                </Typography>
                <Grid container spacing={2}>
                  {formData.insuranceProvider && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Insurance Provider:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formData.insuranceProvider}
                      </Typography>
                    </Grid>
                  )}
                  {formData.policyNumber && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Policy Number:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formData.policyNumber}
                      </Typography>
                    </Grid>
                  )}
                  {formData.expiryDate && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Expiry Date:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(formData.expiryDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                  {formData.type && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Type:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formData.type}
                      </Typography>
                    </Grid>
                  )}
                  {formData.excessAmount && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Excess Amount:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        ₹{formData.excessAmount}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </PreviewCard>
          )}

          {/* Job Details with pricing table */}
          {jobPoints.length > 0 && (
            <PreviewCard>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Description sx={{ mr: 1 }} />
                  Job Details & Pricing
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>S.No.</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Description</strong>
                        </TableCell>
                        {/* <TableCell align="right"><strong>Price (₹)</strong></TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobPoints.map((point, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell sx={{ wordBreak: "break-word" }}>
                            {point.description}
                          </TableCell>
                          {/* <TableCell align="right">
                            {point.price ? `₹${parseFloat(point.price).toLocaleString('en-IN')}` : '₹0'}
                          </TableCell> */}
                        </TableRow>
                      ))}
                      {/* <TableRow>
                        <TableCell colSpan={2} align="right"><strong>Total Cost:</strong></TableCell>
                        <TableCell align="right">
                          <strong>₹{calculateTotalJobCost().toLocaleString('en-IN')}</strong>
                        </TableCell>
                      </TableRow> */}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </PreviewCard>
          )}

          {/* Images Preview */}
          {(Object.values(carImages).some((img) => img) ||
            Object.values(existingImages).some((img) => img)) && (
            <PreviewCard>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PhotoCamera sx={{ mr: 1 }} />
                  Car Images
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { key: "frontView", label: "Front View" },
                    { key: "rearView", label: "Rear View" },
                    { key: "leftSide", label: "Left Side" },
                    { key: "rightSide", label: "Right Side" },
                  ].map((imageType) => {
                    const hasNewImage = carImages[imageType.key];
                    const hasExistingImage = existingImages[imageType.key];

                    if (hasNewImage || hasExistingImage) {
                      return (
                        <Grid item xs={6} sm={3} key={imageType.key}>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {imageType.label}
                            </Typography>
                            <img
                              src={
                                hasNewImage
                                  ? URL.createObjectURL(hasNewImage)
                                  : hasExistingImage
                              }
                              alt={imageType.label}
                              style={{
                                width: "100%",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: hasNewImage
                                  ? "2px solid #4caf50"
                                  : "1px solid #ddd",
                              }}
                            />
                            {hasNewImage && (
                              <Typography
                                variant="caption"
                                color="success.main"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                {hasNewImage.name &&
                                hasNewImage.name.includes("captured")
                                  ? "Camera Captured"
                                  : "New Image"}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      );
                    }
                    return null;
                  })}
                </Grid>
              </CardContent>
            </PreviewCard>
          )}

          {/* Video Preview */}
          {(videoFile || existingVideo) && (
            <PreviewCard>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Videocam sx={{ mr: 1 }} />
                  Video
                </Typography>
                <Box sx={{ maxWidth: 400, mx: "auto" }}>
                  <video
                    controls
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      border: videoFile
                        ? "2px solid #4caf50"
                        : "1px solid #ddd",
                    }}
                  >
                    <source
                      src={
                        videoFile
                          ? URL.createObjectURL(videoFile)
                          : existingVideo
                      }
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                  {videoFile && (
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ display: "block", mt: 1, textAlign: "center" }}
                    >
                      New Video: {videoFile.name}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </PreviewCard>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}
      >
        <Button
          onClick={() => setShowPreview(false)}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Edit
        </Button>

        {/* New Download PDF Button */}
        <Button
          onClick={generatePreviewPDF}
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{ mr: 2 }}
        >
          Download PDF
        </Button>

        <Button
          onClick={handleActualSubmit}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CheckIcon />
            )
          }
          sx={{ px: 4 }}
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
            ? "Confirm Update"
            : "Confirm Save"}
        </Button>
      </DialogActions>
    </PreviewDialog>
  );

  if (fetchingData) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          mb: 4,
          ml: { xs: 0, sm: 35 },
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Job Card Data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        mb: 4,
        ml: { xs: 0, sm: 35 },
        overflow: "auto",
      }}
    >
      <CssBaseline />
      <Container maxWidth="xl">
        <Card sx={{ mb: 4, borderRadius: 2, bgcolor: "background.paper" }}>
          <CardContent>
            {/* Header Section */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box display="flex" alignItems="center">
                {isEditMode ? (
                  <EditIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                ) : (
                  <DirectionsCar
                    fontSize="large"
                    color="primary"
                    sx={{ mr: 2 }}
                  />
                )}
                <Typography variant="h5" color="primary">
                  {isEditMode ? `Edit Job Card ` : "Create Job Card"}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                {isEditMode && (
                  <Chip
                    label={`Status: ${formData.status
                      .replace("_", " ")
                      .toUpperCase()}`}
                    color={getStatusColor(formData.status)}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 3 }} />

            {/* Form */}
            <Box component="form" onSubmit={handlePreview} noValidate>
              {loading && <LinearProgress sx={{ mb: 2 }} />}

              {/* Status Section - Only shown in edit mode */}
              {isEditMode && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Job Status
                  </Typography>
                  <Paper
                    sx={{
                      p: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel id="status-label">Status</InputLabel>
                          <Select
                            labelId="status-label"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            label="Status"
                            startAdornment={
                              <InputAdornment position="start">
                                <AssignmentIcon />
                              </InputAdornment>
                            }
                          >
                            {statusOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                <Chip
                                  label={option.label}
                                  color={option.color}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            Update the current status of this job card
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Button
                          variant="outlined"
                          onClick={() => updateJobCardStatus(formData.status)}
                          disabled={loading}
                          startIcon={<SaveIcon />}
                          sx={{ mt: 1 }}
                        >
                          Update Status Only
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* Customer & Car Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Customer & Car Details
                </Typography>
                <Paper
                  sx={{
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Grid container spacing={3}>
                    {customerCarFields.map((field) => (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField
                          fullWidth
                          name={field.name}
                          label={field.label}
                          value={formData[field.name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type={field.type || "text"}
                          required={field.required || false}
                          error={hasError(field.name)}
                          helperText={
                            hasError(field.name)
                              ? errors[field.name]
                              : field.helperText || ""
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {field.icon}
                              </InputAdornment>
                            ),
                            sx: getFieldStyling(field.name),
                          }}
                          inputProps={{
                            style: getFieldStyling(field.name),
                            ...(field.name === "chesiNumber" && {
                              placeholder: "Enter chassis/VIN number",
                            }),
                          }}
                        />
                      </Grid>
                    ))}

                    {/* Fuel Type Dropdown */}
                    <Grid item xs={12} md={4}>
                      <FormControl
                        fullWidth
                        required
                        error={hasError("fuelType")}
                      >
                        <InputLabel id="fuel-type-label">Fuel Type</InputLabel>
                        <Select
                          labelId="fuel-type-label"
                          name="fuelType"
                          value={formData.fuelType}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label="Fuel Type"
                          startAdornment={
                            <InputAdornment position="start">
                              <LocalGasStation />
                            </InputAdornment>
                          }
                        >
                          {fuelTypeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {hasError("fuelType")
                            ? errors.fuelType
                            : "Select the vehicle's fuel type"}
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Fuel Level - Only shown if fuelType is not CNG or LPG */}
              {formData.fuelType !== "cng" && formData.fuelType !== "lpg" && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Fuel Level
                  </Typography>
                  <Paper
                    sx={{
                      p: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography component="legend" sx={{ mb: 1 }}>
                          Current Fuel Level
                        </Typography>
                        <Rating
                          name="fuel-level"
                          value={fuelLevel}
                          onChange={(event, newValue) => {
                            setFuelLevel(newValue);
                          }}
                          max={5}
                          size="large"
                          icon={<LocalGasStation fontSize="inherit" />}
                          emptyIcon={<LocalGasStation fontSize="inherit" />}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {fuelLevel}/5 - {getFuelLevelText(fuelLevel)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* Insurance Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Insurance Details
                </Typography>
                <Paper
                  sx={{
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Grid container spacing={3}>
                    {[
                      {
                        name: "insuranceProvider",
                        label: "Insurance Provider",
                        icon: <Policy />,
                      },
                      {
                        name: "expiryDate",
                        label: "Expiry Date",
                        icon: <EventNote />,
                        type: "date",
                        InputLabelProps: { shrink: true },
                      },
                      {
                        name: "policyNumber",
                        label: "Policy Number",
                        icon: <Numbers />,
                        helperText: "Insurance policy reference number",
                      },
                      {
                        name: "carNumber",
                        label: "Car Number",
                        icon: <Numbers />,
                        helperText: "Vehicle registration certificate number",
                      },
                      {
                        name: "type",
                        label: "Insurance Type",
                        icon: <LocalOffer />,
                        helperText: "e.g., Comprehensive, Third Party",
                      },
                      {
                        name: "excessAmount",
                        label: "Excess Amount",
                        icon: <AttachMoney />,
                        type: "number",
                      },
                    ].map((field) => (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField
                          fullWidth
                          name={field.name}
                          label={field.label}
                          value={formData[field.name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type={field.type || "text"}
                          error={hasError(field.name)}
                          helperText={
                            hasError(field.name)
                              ? errors[field.name]
                              : field.helperText || ""
                          }
                          InputLabelProps={field.InputLabelProps}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {field.icon}
                              </InputAdornment>
                            ),
                            sx: getFieldStyling(field.name),
                          }}
                          inputProps={{
                            style: getFieldStyling(field.name),
                            ...(field.name === "policyNumber" && {
                              placeholder: "Enter policy number",
                            }),
                            ...(field.name === "registrationNumber" && {
                              placeholder: "Enter registration number",
                            }),
                            ...(field.name === "type" && {
                              placeholder: "Enter insurance type",
                            }),
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>

              {/* Job Details with Price */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Job Details & Pricing
                </Typography>
                <Paper
                  sx={{
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          placeholder="Enter job description..."
                          value={currentJobDescription}
                          onChange={(e) =>
                            setCurrentJobDescription(e.target.value)
                          }
                          onKeyPress={handleJobPointKeyPress}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Description />
                              </InputAdornment>
                            ),
                          }}
                        />
                        {/* <TextField
                          placeholder="Price (₹)"
                          value={currentJobPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                              setCurrentJobPrice(value);
                            }
                          }}
                          onKeyPress={handleJobPointKeyPress}
                          type="number"
                          sx={{ minWidth: 150 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CurrencyRupee fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        /> */}
                        <Button
                          variant="contained"
                          onClick={addJobPoint}
                          disabled={!currentJobDescription.trim()}
                          startIcon={<AddIcon />}
                          sx={{ minWidth: 120 }}
                        >
                          Add Item
                        </Button>
                      </Box>

                      {jobPoints.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Job Items & Pricing:
                          </Typography>
                          <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ mt: 2 }}
                          >
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <strong>S.No.</strong>
                                  </TableCell>
                                  <TableCell>
                                    <strong>Description</strong>
                                  </TableCell>
                                  {/* <TableCell align="right"><strong>Price (₹)</strong></TableCell> */}
                                  <TableCell align="center">
                                    <strong>Actions</strong>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {jobPoints.map((point, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell sx={{ wordBreak: "break-word" }}>
                                      <TextField
                                        value={point.description}
                                        onChange={(e) =>
                                          updateJobPoint(
                                            index,
                                            "description",
                                            e.target.value
                                          )
                                        }
                                        variant="standard"
                                        fullWidth
                                        multiline
                                        InputProps={{ disableUnderline: false }}
                                      />
                                    </TableCell>
                                    {/* <TableCell align="right">
                                      <TextField
                                        value={point.price}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                                            updateJobPoint(index, 'price', value);
                                          }
                                        }}
                                        variant="standard"
                                        type="number"
                                        InputProps={{ 
                                          disableUnderline: false,
                                          startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                        }}
                                      />
                                    </TableCell> */}
                                    <TableCell align="center">
                                      <IconButton
                                        onClick={() => removeJobPoint(index)}
                                        color="error"
                                        size="small"
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {/* <TableRow>
                                  <TableCell colSpan={2} align="right"><strong>Total Cost:</strong></TableCell>
                                  <TableCell align="right">
                                    <Typography variant="h6" color="primary">
                                      <strong>₹{calculateTotalJobCost().toLocaleString('en-IN')}</strong>
                                    </Typography>
                                  </TableCell>
                                  <TableCell></TableCell>
                                </TableRow> */}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* UPDATED: Car Images Upload/Display with Camera Support */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Car Images
                  <Chip
                    label="Camera Supported"
                    size="small"
                    color="success"
                    sx={{ ml: 2 }}
                    icon={<CameraAlt fontSize="small" />}
                  />
                </Typography>
                <Paper
                  sx={{
                    p: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Grid container spacing={3}>
                    {[
                      { key: "frontView", label: "Front View" },
                      { key: "rearView", label: "Rear View" },
                      { key: "leftSide", label: "Left Side" },
                      { key: "rightSide", label: "Right Side" },
                    ].map((imageType) => (
                      <Grid item xs={12} sm={6} md={3} key={imageType.key}>
                        <CameraPhotoUpload
                          imageType={imageType}
                          existingImage={existingImages[imageType.key]}
                          newImage={carImages[imageType.key]}
                          onImageChange={(file) =>
                            handleImageUpload(imageType.key, file)
                          }
                          onRemoveExisting={() => {
                            setExistingImages((prev) => ({
                              ...prev,
                              [imageType.key]: null,
                            }));
                            setSnackbar({
                              open: true,
                              message: `${imageType.label} will be removed when you save.`,
                              severity: "warning",
                            });
                          }}
                          onRemoveNew={() => removeUploadedImage(imageType.key)}
                          fileError={fileErrors[imageType.key]}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Video Upload Section */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Video (Optional)
                    </Typography>

                    {/* Display existing video if available */}
                    {existingVideo && !videoFile && (
                      <Box sx={{ mb: 2, position: "relative" }}>
                        <video
                          controls
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                          }}
                        >
                          <source src={existingVideo} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setExistingVideo(null);
                            setSnackbar({
                              open: true,
                              message: "Video will be removed when you save.",
                              severity: "warning",
                            });
                          }}
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 1)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 1 }}
                        >
                          Current Video
                        </Typography>
                      </Box>
                    )}

                    {/* Display new uploaded video preview */}
                    {videoFile && (
                      <Box sx={{ mb: 2, position: "relative" }}>
                        <video
                          controls
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                            border: "2px solid #4caf50",
                          }}
                        >
                          <source
                            src={URL.createObjectURL(videoFile)}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                        <IconButton
                          size="small"
                          onClick={removeUploadedVideo}
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 1)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                        <Typography
                          variant="caption"
                          color="success.main"
                          sx={{ display: "block", mt: 1 }}
                        >
                          New Video Selected: {videoFile.name}
                        </Typography>
                      </Box>
                    )}

                    {/* Video upload button */}
                    <UploadButton
                      component="label"
                      variant="outlined"
                      startIcon={<Videocam />}
                    >
                      {videoFile
                        ? "Change Video"
                        : existingVideo
                        ? "Replace Video"
                        : "Upload Video"}
                      <VisuallyHiddenInput
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoUpload(e.target.files[0])}
                      />
                    </UploadButton>

                    {/* Show video file error if any */}
                    {fileErrors.video && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block", mt: 1 }}
                      >
                        {fileErrors.video}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Box>

              {/* Submit Button - Changed to Preview */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<PreviewIcon />}
                  disabled={loading}
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                  }}
                >
                  Preview Job Card
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Preview Modal */}
      <PreviewModal />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobCards;
