// src/pages/EnhancedSignUpPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Switch,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CloudUpload,
  CheckCircle,
  Email,
  Phone,
  Business,
  Lock,
  LocationOn,
  Person,
  Payment,
  Security,
  Verified,
  LightMode,
  DarkMode,
  MyLocation,
  CreditCard,
  AccountBalance,
  Receipt,
  AccountBox,
  Save,
  Send,
  HourglassEmpty,
  Done,
  ErrorOutline,
  Refresh,
  PhotoCamera,
  Delete,
  Image,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { getGarageApiUrl, getBaseApiUrl } from "../config/api.js";

const BASE_URL = "https://garage-management-zi5z.onrender.com";

const EnhancedSignUpPage = () => {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    otp: "",
    gstNum: "",
    panNum: "",
    taxType: "gst",
    durationInMonths: 12,
    isFreePlan: true,
    selectedPlan: null,
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      upiId: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [garageRegistered, setGarageRegistered] = useState(false);
  const [garageId, setGarageId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  const steps = [
    "Basic Information",
    "Tax & Business Details",
    "Choose Plan",
    "Bank Details (Optional)",
    "Complete Registration",
    "Verify Email",
    "Registration Status",
  ];

  // Enhanced Theme Configuration
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#90caf9" : "#1976d2",
        dark: darkMode ? "#42a5f5" : "#115293",
        light: darkMode ? "#e3f2fd" : "#bbdefb",
      },
      secondary: {
        main: darkMode ? "#f48fb1" : "#dc004e",
        dark: darkMode ? "#c2185b" : "#9a0036",
      },
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#000000",
        secondary: darkMode ? "#b0b0b0" : "#666666",
      },
      success: {
        main: darkMode ? "#4caf50" : "#2e7d32",
        light: darkMode ? "#81c784" : "#c8e6c9",
        dark: darkMode ? "#2e7d32" : "#1b5e20",
      },
      error: {
        main: darkMode ? "#f44336" : "#d32f2f",
        light: darkMode ? "#e57373" : "#ffcdd2",
        dark: darkMode ? "#c62828" : "#b71c1c",
      },
      warning: {
        main: darkMode ? "#ff9800" : "#ed6c02",
        light: darkMode ? "#ffb74d" : "#fff3c4",
        dark: darkMode ? "#f57c00" : "#e65100",
      },
      info: {
        main: darkMode ? "#2196f3" : "#0288d1",
        light: darkMode ? "#64b5f6" : "#b3e5fc",
        dark: darkMode ? "#1976d2" : "#01579b",
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
              '& fieldset': {
                borderColor: darkMode ? "#555555" : "#cccccc",
              },
              '&:hover fieldset': {
                borderColor: darkMode ? "#90caf9" : "#1976d2",
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? "#90caf9" : "#1976d2",
              },
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? "#b0b0b0" : "#666666",
            },
            '& .MuiOutlinedInput-input': {
              color: darkMode ? "#ffffff" : "#000000",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          contained: {
            boxShadow: darkMode ? "0 4px 12px rgba(144, 202, 249, 0.3)" : "0 4px 12px rgba(25, 118, 210, 0.3)",
            '&:hover': {
              boxShadow: darkMode ? "0 6px 16px rgba(144, 202, 249, 0.4)" : "0 6px 16px rgba(25, 118, 210, 0.4)",
            },
          },
          outlined: {
            borderColor: darkMode ? "#555555" : "#cccccc",
            color: darkMode ? "#ffffff" : "#000000",
            '&:hover': {
              backgroundColor: darkMode ? "rgba(144, 202, 249, 0.1)" : "rgba(25, 118, 210, 0.1)",
              borderColor: darkMode ? "#90caf9" : "#1976d2",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#2d2d2d" : "#f5f5f5",
            color: darkMode ? "#ffffff" : "#000000",
          },
          outlined: {
            borderColor: darkMode ? "#555555" : "#cccccc",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
          },
        },
      },
    },
  });

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Logo validation and handling
  const validateLogo = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      return "Logo file size should be less than 5MB";
    }
    
    if (!allowedTypes.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, GIF, or WebP)";
    }
    
    return "";
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateLogo(file);
      if (error) {
        setLogoError(error);
        showSnackbar(error, "error");
        return;
      }

      setLogoError("");
      setLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      showSnackbar("Logo uploaded successfully!", "success");
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    setLogoError("");
    // Clear the file input
    const fileInput = document.getElementById('logo-upload-input');
    if (fileInput) {
      fileInput.value = '';
    }
    showSnackbar("Logo removed", "info");
  };

  // Check location permission and provide guidance
  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      } catch (error) {
        console.log('Permission API not supported');
        return 'unknown';
      }
    }
    return 'unknown';
  };

  // Enhanced Location with precise address detection
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showSnackbar("Geolocation is not supported by your browser.", "error");
      return;
    }

    // Check permission status first
    const permissionStatus = await checkLocationPermission();
    
    if (permissionStatus === 'denied') {
      setLocationPermissionDenied(true);
      showSnackbar("Location access is blocked. Please enable it in browser settings and refresh the page.", "error");
      return;
    }

    setLocationLoading(true);
    
    // Use higher accuracy settings
    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 60000 // 1 minute cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        console.log(`Location detected: ${latitude}, ${longitude} (Accuracy: ${accuracy}m)`);
        
        try {
          // Get human-readable address using reverse geocoding
          const address = await reverseGeocode(latitude, longitude);
          
          if (address && address.length > 10 && !address.includes('India, Vejalpur')) {
            setFormData((prev) => ({
              ...prev,
              address: address,
            }));
            showSnackbar(`Address detected: ${address.substring(0, 50)}${address.length > 50 ? '...' : ''}`, "success");
          } else {
            // If we get a generic/incorrect location, ask user to enter manually
            setFormData((prev) => ({
              ...prev,
              address: prev.address + (prev.address ? "\n" : "") + `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Please enter your exact address above)`,
            }));
            showSnackbar("GPS detected your area, but please enter your specific address for accuracy.", "warning");
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          const coordText = `GPS Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setFormData((prev) => ({
            ...prev,
            address: prev.address + (prev.address ? "\n" : "") + coordText + "\n(Please enter your complete address above)",
          }));
          showSnackbar("Location coordinates detected. Please enter your full address above them.", "info");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = "Unable to retrieve your location.";
        let suggestions = "";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationPermissionDenied(true);
            errorMessage = "Location access denied.";
            suggestions = " Please allow location access in your browser settings, or enter your address manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS signal is weak.";
            suggestions = " Please move to an area with better signal or enter your address manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            suggestions = " Please ensure GPS is enabled or enter your address manually.";
            break;
        }
        
        showSnackbar(errorMessage + suggestions, "error");
      },
      options
    );
  };

  // Improved reverse geocoding with multiple services and better precision
  const reverseGeocode = async (lat, lng) => {
    console.log(`Attempting reverse geocoding for: ${lat}, ${lng}`);
    
    // Method 1: Try Google Maps-like precision with OpenStreetMap
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
        {
          headers: {
            'User-Agent': 'GarageManagement/1.0 (contact@garage.com)'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Nominatim response:', data);
        if (data && data.address) {
          const formatted = formatNominatimAddressPrecise(data);
          if (formatted && formatted.length > 20) {
            return formatted;
          }
        }
      }
    } catch (error) {
      console.log("Nominatim failed:", error);
    }

    // Method 2: Try BigDataCloud with higher precision
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en&key=bdc_hlrYl9n2Fd4xYf2QyX2Z3ZE3gXw7kYb`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('BigDataCloud response:', data);
        if (data && (data.locality || data.city)) {
          const formatted = formatBigDataCloudAddressPrecise(data);
          if (formatted && formatted.length > 15) {
            return formatted;
          }
        }
      }
    } catch (error) {
      console.log("BigDataCloud failed:", error);
    }

    console.log("All geocoding services failed");
    return null;
  };

  // Enhanced address formatting functions
  const formatNominatimAddressPrecise = (data) => {
    const address = data.address || {};
    const parts = [];
    
    // Start with most specific location details
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      parts.push(address.road);
    } else if (address.residential) {
      parts.push(address.residential);
    } else if (address.hamlet) {
      parts.push(address.hamlet);
    }
    
    // Add area/locality details
    if (address.suburb && !parts.join(' ').includes(address.suburb)) {
      parts.push(address.suburb);
    } else if (address.neighbourhood && !parts.join(' ').includes(address.neighbourhood)) {
      parts.push(address.neighbourhood);
    } else if (address.quarter && !parts.join(' ').includes(address.quarter)) {
      parts.push(address.quarter);
    }
    
    // City/locality
    if (address.village && !parts.join(' ').includes(address.village)) {
      parts.push(address.village);
    } else if (address.town && !parts.join(' ').includes(address.town)) {
      parts.push(address.town);
    } else if (address.city && !parts.join(' ').includes(address.city)) {
      parts.push(address.city);
    }
    
    // District/state
    if (address.county && !parts.join(' ').includes(address.county)) {
      parts.push(address.county);
    }
    if (address.state && !parts.join(' ').includes(address.state)) {
      parts.push(address.state);
    }
    
    // Country and postal code
    if (address.country && address.country !== 'India') {
      parts.push(address.country);
    }
    if (address.postcode) {
      parts.push(address.postcode);
    }
    
    return parts.filter(Boolean).join(', ');
  };

  const formatBigDataCloudAddressPrecise = (data) => {
    const parts = [];
    
    // Add most specific available information
    if (data.streetName) {
      if (data.streetNumber) {
        parts.push(`${data.streetNumber} ${data.streetName}`);
      } else {
        parts.push(data.streetName);
      }
    }
    
    if (data.localityInfo && data.localityInfo.administrative) {
      // Get the most detailed administrative level
      const adminLevels = data.localityInfo.administrative
        .filter(level => level.adminLevel <= 10)
        .sort((a, b) => a.adminLevel - b.adminLevel);
      
      adminLevels.forEach(level => {
        if (level.name && !parts.join(' ').includes(level.name)) {
          parts.push(level.name);
        }
      });
    }
    
    if (data.locality && !parts.join(' ').includes(data.locality)) {
      parts.push(data.locality);
    }
    
    if (data.city && !parts.join(' ').includes(data.city)) {
      parts.push(data.city);
    }
    
    if (data.principalSubdivision && !parts.join(' ').includes(data.principalSubdivision)) {
      parts.push(data.principalSubdivision);
    }
    
    if (data.countryName && data.countryName !== 'India') {
      parts.push(data.countryName);
    }
    
    if (data.postcode) {
      parts.push(data.postcode);
    }
    
    return parts.filter(Boolean).join(', ');
  };

  // --- Field Validation ---
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Garage Name is required";
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Email is invalid";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      case "confirmPassword":
        if (formData.password !== value) {
          error = "Passwords do not match";
        }
        break;
      case "address":
        if (!value.trim()) error = "Address is required";
        break;
      case "phone":
        const cleanedPhone = value.replace(/\D/g, "");
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (cleanedPhone.length !== 10) {
          error = "Phone number must be 10 digits";
        }
        break;
      case "gstNum":
        if (formData.taxType === "gst") {
          if (!value.trim()) {
            error = "GST Number is required";
          } else if (
            !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
              value
            )
          ) {
            error = "Invalid GST Number format";
          }
        } else {
          error = "";
        }
        break;
      case "panNum":
        if (formData.taxType === "pan") {
          if (!value.trim()) {
            error = "PAN Number is required";
          } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
            error = "Invalid PAN Number format";
          }
        } else {
          error = "";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === "checkbox" ? checked : value;

    if (name === "email") {
      processedValue = value.toLowerCase();
    }

    if (name.startsWith("bankDetails.")) {
      const fieldName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [fieldName]: processedValue },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }

    const fieldError = validateField(name, processedValue);
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (fieldError) {
        newErrors[name] = fieldError;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  // --- Fetch Plans ---
  const fetchPlans = async () => {
    setFetchingPlans(true);
    try {
      const response = await fetch(getBaseApiUrl("/api/plans/all"));
      const data = await response.json();
      if (response.ok) {
        // Handle different response structures
        const plansArray = data.data || data || [];
        setPlans(Array.isArray(plansArray) ? plansArray : []);
      } else {
        throw new Error(data.message || "Failed to fetch plans");
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      // Set default plans if API fails
      const defaultPlans = [
        {
          _id: "free",
          name: "Free Plan",
          price: "₹0/month",
          durationInMonths: 1,
          features: [
            "Basic garage management",
            "Up to 5 vehicles",
            "Basic reporting",
          ],
        },
        {
          _id: "basic",
          name: "Basic Plan",
          price: "₹999/month",
          durationInMonths: 1,
          features: ["Basic features", "Up to 50 vehicles", "Email support"],
        },
        {
          _id: "premium",
          name: "Premium Plan",
          price: "₹1999/3 months",
          durationInMonths: 3,
          features: [
            "Advanced features",
            "Unlimited vehicles",
            "Priority support",
            "Analytics",
          ],
        },
      ];
      setPlans(defaultPlans);
    } finally {
      setFetchingPlans(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // --- Form Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Garage Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, "")))
      newErrors.phone = "Phone number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (activeStep === 0) {
      if (validateForm()) {
        setActiveStep(1);
      } else {
        showSnackbar(
          "Please fix the errors in the form before continuing.",
          "error"
        );
      }
    } else if (activeStep === 1) {
      const taxField =
        formData.taxType === "gst"
          ? "gstNum"
          : formData.taxType === "pan"
          ? "panNum"
          : null;
      let isValid = true;
      let newErrors = { ...errors };

      if (taxField) {
        const taxValue = formData[taxField];
        const error = validateField(taxField, taxValue);
        if (error) {
          newErrors[taxField] = error;
          isValid = false;
        } else {
          delete newErrors[taxField];
        }
      } else {
        isValid = false;
        newErrors.taxType = "Please select a tax type";
      }

      setErrors(newErrors);
      if (isValid) setActiveStep(2);
      else showSnackbar("Please complete tax details.", "error");
    } else if (activeStep === 2) {
      setActiveStep(3);
    } else if (activeStep === 3) {
      const bd = formData.bankDetails;
      let isValid = true;
      const newErrors = {};

      if (bd.accountHolderName || bd.accountNumber || bd.ifscCode) {
        if (bd.accountHolderName && !bd.accountNumber) {
          newErrors["bankDetails.accountNumber"] =
            "Account number is required when account holder name is provided";
          isValid = false;
        }
        if (bd.accountNumber && !bd.accountHolderName) {
          newErrors["bankDetails.accountHolderName"] =
            "Account holder name is required when account number is provided";
          isValid = false;
        }
        if (bd.accountNumber && !bd.ifscCode) {
          newErrors["bankDetails.ifscCode"] =
            "IFSC code is required when account number is provided";
          isValid = false;
        }
        if (bd.ifscCode && !bd.accountNumber) {
          newErrors["bankDetails.accountNumber"] =
            "Account number is required when IFSC code is provided";
          isValid = false;
        }
        if (bd.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bd.ifscCode)) {
          newErrors["bankDetails.ifscCode"] = "Invalid IFSC code format";
          isValid = false;
        }
      }

      setErrors(newErrors);
      if (isValid) {
        setActiveStep(4);
      } else {
        showSnackbar(
          "Please fix the errors in the bank details or leave them blank to skip.",
          "error"
        );
      }
    } else if (activeStep === 4) {
      // Check if a plan is selected
      if (!formData.selectedPlan) {
        showSnackbar("Please select a plan before continuing.", "error");
        return;
      }

      setLoading(true);
      try {
        // Prepare registration data
        const registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          gstNum: formData.gstNum,
          panNum: formData.panNum,
          taxType: formData.taxType,
          durationInMonths:
            formData.selectedPlan?.durationInMonths ||
            formData.durationInMonths,
          isFreePlan:
            formData.selectedPlan?.price === "Free" || formData.isFreePlan,
          planDetails: formData.selectedPlan,
          bankDetails: formData.bankDetails,
        };

        // If logo exists, you might want to upload it separately or include it in formData
        if (logo) {
          // You can handle logo upload here - either as FormData or base64
          registrationData.hasLogo = true;
          registrationData.logoName = logo.name;
        }

        // Call registration API with fallback
        let response;
        try {
          response = await fetch(getGarageApiUrl("/submit-registration"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(registrationData),
          });
        } catch (error) {
          // Fallback to direct endpoint
          response = await fetch(`${BASE_URL}/api/garage/submit-registration`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(registrationData),
          });
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          throw new Error(
            `Server returned invalid response (${response.status}). Please try again.`
          );
        }

        if (response.ok) {
          showSnackbar(
            "Registration successful! Please check your email for OTP.",
            "success"
          );
          setGarageRegistered(true);
          setActiveStep(5);
        } else {
          throw new Error(data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Registration error:", error);
        showSnackbar(
          error.message || "Registration failed. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 5) {
      // Step 5: Verify OTP
      if (!formData.otp || formData.otp.length < 4) {
        showSnackbar("Please enter a valid OTP (minimum 4 digits).", "error");
        return;
      }

      // Validate OTP format (numbers only)
      if (!/^\d+$/.test(formData.otp)) {
        showSnackbar("OTP should contain only numbers.", "error");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(getGarageApiUrl("/verify-registration"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          showSnackbar(
            "Email verified successfully! Your account is now active.",
            "success"
          );
          setActiveStep(6);
        } else {
          throw new Error(data.message || "OTP verification failed");
        }
      } catch (error) {
        console.error("OTP verification error:", error);
        showSnackbar(
          error.message || "OTP verification failed. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Resend OTP function
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        getGarageApiUrl("/resend-registration-otp"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSnackbar(
          "OTP resent successfully! Please check your email.",
          "success"
        );
      } else {
        throw new Error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showSnackbar(
        error.message || "Failed to resend OTP. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <Fade in={true}>
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          textAlign="center"
          gutterBottom
        >
          Basic Garage Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Garage Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          
          {/* Address Field */}
          <Grid item xs={12}>
            <Box mb={1}>
              <Typography variant="body2" color="text.secondary">
                Enter your complete garage address or use location detection
              </Typography>
            </Box>
            
            {locationPermissionDenied && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>Location Access Blocked:</strong> To use auto-detection, please:
                  <br />• Click the location icon (🔒) in your browser's address bar
                  <br />• Select "Allow" for location access
                  <br />• Refresh this page and try again
                  <br />• Or simply enter your address manually below
                </Typography>
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Complete Garage Address"
              name="address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address || "Include street, area, city, state, pincode for accurate service"}
              placeholder="e.g., Shop No. 15, ABC Complex, Sector 12, Near XYZ Mall, Your City, State - 123456"
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    <LocationOn color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        startIcon={
                          locationLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <MyLocation />
                          )
                        }
                        sx={{ borderRadius: 2, minWidth: "auto", px: 2 }}
                      >
                        {locationLoading ? "Detecting..." : "Auto Detect"}
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            address: ""
                          }));
                          setLocationPermissionDenied(false);
                        }}
                        sx={{ borderRadius: 2, minWidth: "auto", px: 2, fontSize: "0.75rem" }}
                      >
                        Clear
                      </Button>
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              <Chip 
                label="📍 Be specific for accurate service" 
                size="small" 
                variant="outlined"
                color="info"
              />
              <Chip 
                label="Include landmarks nearby" 
                size="small" 
                variant="outlined"
                color="secondary"
              />
              <Chip 
                label="Manual entry is more accurate" 
                size="small" 
                variant="outlined"
                color="success"
              />
            </Box>
          </Grid>

          {/* Logo Upload Section - Moved Below Address */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Image color="primary" />
                Garage Logo (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload your garage logo to personalize your account. Max size: 5MB
              </Typography>
            </Box>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 3,
                border: '2px dashed',
                borderColor: logoError ? 'error.main' : (darkMode ? '#555555' : '#cccccc'),
                borderRadius: 2,
                backgroundColor: logoError 
                  ? (darkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)') 
                  : (darkMode ? 'rgba(144, 202, 249, 0.05)' : 'rgba(25, 118, 210, 0.05)'),
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: logoError 
                    ? (darkMode ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)') 
                    : (darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)'),
                  borderColor: logoError ? 'error.main' : 'primary.main',
                }
              }}
            >
              {logoPreview ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={logoPreview}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      border: '3px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {logo?.name} ({Math.round(logo?.size / 1024)} KB)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Change Logo
                      <input
                        id="logo-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        style={{ display: 'none' }}
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      size="small"
                      onClick={handleRemoveLogo}
                      sx={{ borderRadius: 2 }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  {/* <CloudUpload sx={{ 
                    fontSize: 48, 
                    color: logoError ? 'error.main' : 'primary.main', 
                    mb: 2 
                  }} /> */}
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<PhotoCamera />}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    Upload Logo
                    <input
                      id="logo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    JPEG, PNG, GIF, WebP up to 5MB
                  </Typography>
                </Box>
              )}
            </Box>
            
            {logoError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {logoError}
              </Alert>
            )}
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderTaxBusinessDetails = () => (
    <Fade in={true}>
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          textAlign="center"
          gutterBottom
        >
          Tax & Business Details
        </Typography>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Select Tax Type</FormLabel>
          <RadioGroup
            row
            name="taxType"
            value={formData.taxType}
            onChange={(e) =>
              setFormData({ ...formData, taxType: e.target.value })
            }
          >
            <FormControlLabel value="gst" control={<Radio />} label="GST" />
            <FormControlLabel value="pan" control={<Radio />} label="PAN" />
          </RadioGroup>
        </FormControl>

        <Grid container spacing={3}>
          {formData.taxType === "gst" && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="GST Number"
                name="gstNum"
                value={formData.gstNum}
                onChange={handleChange}
                error={!!errors.gstNum}
                helperText={errors.gstNum || "Format: 27AABCCDDEEFFGZG"}
                placeholder="27AABCCDDEEFFGZG"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Receipt color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
          )}
          {formData.taxType === "pan" && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="PAN Number"
                name="panNum"
                value={formData.panNum}
                onChange={handleChange}
                error={!!errors.panNum}
                helperText={errors.panNum || "Format: ABCDE1234F"}
                placeholder="ABCDE1234F"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBox color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Fade>
  );

  const renderPlanSelection = () => (
    <Fade in={true}>
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          textAlign="center"
          gutterBottom
        >
          Choose Your Plan
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          paragraph
        >
          Select a plan that fits your garage business needs.
        </Typography>

        {formData.selectedPlan && (
          <Box mb={3} p={2} bgcolor="success.light" borderRadius={2}>
            <Typography variant="body2" color="success.dark">
              ✅ Selected: {formData.selectedPlan.name} -{" "}
              {formData.selectedPlan.price}(
              {formData.selectedPlan.durationInMonths} months)
            </Typography>
          </Box>
        )}

        {fetchingPlans ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} mt={2}>
            {plans.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">No plans available at the moment.</Alert>
              </Grid>
            ) : (
              plans.map((plan) => (
                <Grid item xs={12} sm={6} md={4} key={plan._id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      border:
                        formData.selectedPlan?._id === plan._id
                          ? "2px solid"
                          : "1px solid",
                      borderColor:
                        formData.selectedPlan?._id === plan._id
                          ? "primary.main"
                          : "divider",
                      backgroundColor:
                        formData.selectedPlan?._id === plan._id
                          ? (darkMode ? "rgba(144, 202, 249, 0.1)" : "rgba(25, 118, 210, 0.05)")
                          : "transparent",
                      "&:hover": {
                        transform: "scale(1.03)",
                        transition: "0.3s",
                        backgroundColor: darkMode ? "rgba(144, 202, 249, 0.05)" : "rgba(25, 118, 210, 0.02)",
                      },
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const isFree =
                        plan.price === "Free" ||
                        plan.price === "₹0" ||
                        plan.price === "₹0/month";

                      const updatedFormData = {
                        ...formData,
                        isFreePlan: isFree,
                        durationInMonths: plan.durationInMonths,
                        selectedPlan: plan,
                      };

                      setFormData(updatedFormData);

                      showSnackbar(
                        `Plan "${plan.name}" selected successfully!`,
                        "success"
                      );
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          {plan.name}
                        </Typography>
                        {formData.selectedPlan?._id === plan._id && (
                          <CheckCircle color="primary" fontSize="small" />
                        )}
                      </Box>
                      <Typography variant="h5" color="primary" mt={1}>
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.durationInMonths} months
                      </Typography>
                      <List dense>
                        {plan.features?.map((feature, i) => (
                          <ListItem key={i} sx={{ py: 0.5 }}>
                            <CheckCircle
                              fontSize="small"
                              color="success"
                              sx={{ mr: 1 }}
                            />
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </Fade>
  );

  const renderBankDetails = () => (
    <Fade in={true}>
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight={600}>
            Bank Details (Optional)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowBankDetails(!showBankDetails)}
            startIcon={<Payment />}
            sx={{ borderRadius: 2 }}
          >
            {showBankDetails ? "Hide" : "Add Bank Details"}
          </Button>
        </Box>

        {showBankDetails && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Holder Name"
                name="bankDetails.accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleChange}
                error={!!errors["bankDetails.accountHolderName"]}
                helperText={errors["bankDetails.accountHolderName"]}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number"
                name="bankDetails.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
                error={!!errors["bankDetails.accountNumber"]}
                helperText={errors["bankDetails.accountNumber"]}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalance color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                name="bankDetails.ifscCode"
                value={formData.bankDetails.ifscCode}
                onChange={handleChange}
                error={!!errors["bankDetails.ifscCode"]}
                helperText={
                  errors["bankDetails.ifscCode"] || "Format: ABCD0123456"
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalance color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bankDetails.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalance color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Branch Name"
                name="bankDetails.branchName"
                value={formData.bankDetails.branchName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UPI ID (Optional)"
                name="bankDetails.upiId"
                value={formData.bankDetails.upiId}
                onChange={handleChange}
                placeholder="user@paytm"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Payment color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Fade>
  );

  const renderFinalStep = () => (
    <Fade in={true}>
      <Box textAlign="center">
        <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Ready to Create Your Account
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Review your information and create your garage account.
        </Typography>
        
        {/* Show selected logo in summary */}
        {logoPreview && (
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your uploaded logo:
            </Typography>
            <Avatar
              src={logoPreview}
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 1,
                border: '2px solid',
                borderColor: 'primary.main'
              }}
            />
          </Box>
        )}
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleContinue}
          disabled={loading}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: "1.1rem",
            fontWeight: 600,
            boxShadow: 3,
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </Box>
    </Fade>
  );

  const renderVerifyEmail = () => (
    <Fade in={true}>
      <Box textAlign="center">
        <Security sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Verify Your Email
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          We've sent a verification code to <strong>{formData.email}</strong>
        </Typography>
        {garageRegistered && (
          <Box mb={3}>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Registration successful! Please verify your email to complete
                the process.
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mt={4} mb={4}>
          <TextField
            fullWidth
            label="Enter Verification Code"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            error={!!errors.otp}
            helperText={errors.otp}
            sx={{
              maxWidth: 300,
              mx: "auto",
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />
        </Box>
        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            onClick={handleContinue}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: "1.1rem",
              fontWeight: 600,
              boxShadow: 3,
            }}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResendOTP}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            {loading ? "Sending..." : "Resend OTP"}
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  const renderStatus = () => (
    <Fade in={true}>
      <Box textAlign="center">
        <Done sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Registration Complete!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Your garage account has been created successfully.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/login")}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: "1.1rem",
            fontWeight: 600,
            boxShadow: 3,
          }}
        >
          Go to Login
        </Button>
      </Box>
    </Fade>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderTaxBusinessDetails();
      case 2:
        return renderPlanSelection();
      case 3:
        return renderBankDetails();
      case 4:
        return renderFinalStep();
      case 5:
        return renderVerifyEmail();
      case 6:
        return renderStatus();
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: darkMode
            ? "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)"
            : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
          py: 6,
          px: 2,
          transition: "all 0.3s ease",
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={darkMode ? 0 : 8}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
              color: darkMode ? "#ffffff" : "#000000",
              border: darkMode ? "1px solid #333333" : "none",
              boxShadow: darkMode 
                ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                : "0 8px 32px rgba(25, 118, 210, 0.1)",
            }}
          >
            <Box
              sx={{
                background: darkMode
                  ? "linear-gradient(45deg, #1a237e, #0d47a1, #01579b)"
                  : "linear-gradient(45deg, #1976d2, #0d47a1, #01579b)",
                color: "white",
                p: 4,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: darkMode 
                    ? "radial-gradient(circle at 30% 70%, rgba(144, 202, 249, 0.1) 0%, transparent 50%)"
                    : "radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
                  pointerEvents: "none",
                },
              }}
            >
              {/* Theme Toggle Button */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={toggleDarkMode}
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Box>

              {/* Logo Section */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 3,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    overflow: 'hidden',
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Garage Logo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Business
                      sx={{
                        fontSize: 40,
                        color: "white",
                      }}
                    />
                  )}
                </Box>
              </Box>
              
              <Typography variant="h4" fontWeight="bold" sx={{ position: "relative", zIndex: 1 }}>
                Create Your Garage Account
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, position: "relative", zIndex: 1 }}>
                Get started with our garage management platform
              </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        "& .MuiStepLabel-label": {
                          color: darkMode ? "#b0b0b0" : "#666666",
                          "&.Mui-active": {
                            color: darkMode ? "#90caf9" : "#1976d2",
                          },
                          "&.Mui-completed": {
                            color: darkMode ? "#4caf50" : "#2e7d32",
                          },
                        },
                        "& .MuiStepIcon-root": {
                          color: darkMode ? "#555555" : "#cccccc",
                          "&.Mui-active": {
                            color: darkMode ? "#90caf9" : "#1976d2",
                          },
                          "&.Mui-completed": {
                            color: darkMode ? "#4caf50" : "#2e7d32",
                          },
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {getStepContent(activeStep)}

              <Box
                mt={4}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                {activeStep > 0 && activeStep < 6 && (
                  <Button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2,
                      color: darkMode ? "#ffffff" : "#000000",
                      borderColor: darkMode ? "#555555" : "#cccccc",
                      "&:hover": {
                        backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                        borderColor: darkMode ? "#90caf9" : "#1976d2",
                      },
                    }}
                  >
                    Back
                  </Button>
                )}
                {activeStep < 6 && activeStep !== 4 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleContinue}
                    disabled={
                      (activeStep === 0 &&
                        (!formData.name.trim() ||
                          !formData.email.trim() ||
                          !formData.phone.trim() ||
                          !formData.address.trim() ||
                          !formData.password ||
                          !formData.confirmPassword ||
                          !!errors.name ||
                          !!errors.email ||
                          !!errors.phone ||
                          !!errors.address ||
                          !!errors.password ||
                          !!errors.confirmPassword)) ||
                      (activeStep === 1 &&
                        ((formData.taxType === "gst" &&
                          (!formData.gstNum.trim() || !!errors.gstNum)) ||
                          (formData.taxType === "pan" &&
                            (!formData.panNum.trim() || !!errors.panNum)) ||
                          (formData.taxType !== "gst" &&
                            formData.taxType !== "pan")))
                    }
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      boxShadow: darkMode ? "0 4px 12px rgba(144, 202, 249, 0.3)" : "0 4px 12px rgba(25, 118, 210, 0.3)",
                      "&:hover": {
                        boxShadow: darkMode ? "0 6px 16px rgba(144, 202, 249, 0.4)" : "0 6px 16px rgba(25, 118, 210, 0.4)",
                      },
                    }}
                  >
                    {activeStep === 5 ? "Verify" : "Continue"}
                  </Button>
                )}
              </Box>

              {/* Navigation Links */}
              <Box mt={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Button
                    component="span"
                    color="primary"
                    onClick={() => navigate("/login")}
                    sx={{ 
                      fontWeight: 600, 
                      mx: 0.5,
                      color: darkMode ? "#90caf9" : "#1976d2",
                      "&:hover": {
                        backgroundColor: darkMode ? "rgba(144, 202, 249, 0.1)" : "rgba(25, 118, 210, 0.1)",
                      },
                    }}
                  >
                    Sign In
                  </Button>
                  {" | "}
                  <Button
                    component="span"
                    color="secondary"
                    onClick={() => navigate("/renew")}
                    sx={{ 
                      fontWeight: 600, 
                      mx: 0.5,
                      color: darkMode ? "#f48fb1" : "#dc004e",
                      "&:hover": {
                        backgroundColor: darkMode ? "rgba(244, 143, 177, 0.1)" : "rgba(220, 0, 78, 0.1)",
                      },
                    }}
                  >
                    Renew Plan
                  </Button>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{
              backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
              color: darkMode ? "#ffffff" : "#000000",
              "& .MuiAlert-icon": {
                color: snackbar.severity === "success" 
                  ? (darkMode ? "#4caf50" : "#2e7d32")
                  : snackbar.severity === "error"
                  ? (darkMode ? "#f44336" : "#d32f2f")
                  : snackbar.severity === "warning"
                  ? (darkMode ? "#ff9800" : "#ed6c02")
                  : (darkMode ? "#2196f3" : "#0288d1"),
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default EnhancedSignUpPage;