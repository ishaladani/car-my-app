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

  const theme = {
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#1976d2", dark: "#115293" },
      secondary: { main: "#dc004e" },
      background: {
        paper: darkMode ? "#424242" : "#ffffff",
        default: darkMode ? "#121212" : "#f5f5f5",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#000000",
        secondary: darkMode ? "#cccccc" : "#666666",
      },
    },
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

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
        console.log("Fetched plans:", plansArray);
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

  // --- Location Access ---
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showSnackbar("Geolocation is not supported by your browser.", "error");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          address: `${prev.address} (Lat: ${latitude.toFixed(
            6
          )}, Lng: ${longitude.toFixed(6)})`,
        }));
        setLocationLoading(false);
        showSnackbar("Location retrieved successfully!", "success");
      },
      (error) => {
        setLocationLoading(false);
        showSnackbar("Unable to retrieve your location.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
      // Step 4: Complete Registration - Send OTP
      console.log("=== Starting Registration Process ===");
      console.log("Form data:", formData);
      console.log("Selected plan:", formData.selectedPlan);
      console.log("Current step:", activeStep);

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

        console.log("Sending registration data:", registrationData);

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
          console.log("Primary endpoint failed, trying fallback...");
          // Fallback to direct endpoint
          response = await fetch(`${BASE_URL}/api/garage/submit-registration`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(registrationData),
          });
        }

        console.log("Registration response status:", response.status);

        let data;
        try {
          data = await response.json();
          console.log("Registration response data:", data);
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
        console.log("=== Verifying OTP ===");
        console.log("OTP:", formData.otp);

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
        console.log("OTP verification response:", data);

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
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
      console.log("=== Resending OTP ===");

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
      console.log("Resend OTP response:", data);

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
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
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
                      {locationLoading ? "Getting..." : "Get Location"}
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
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

        {/* Debug: Show selected plan */}
        <Box mb={3} p={2} bgcolor="info.light" borderRadius={2}>
          <Typography variant="body2" color="info.dark">
            🔍 Debug: {plans.length} plans loaded, selectedPlan:{" "}
            {formData.selectedPlan ? formData.selectedPlan.name : "None"}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              console.log("Current plans:", plans);
              console.log("Current formData:", formData);
            }}
            sx={{ mt: 1 }}
          >
            Debug Plans
          </Button>
        </Box>

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
                          ? "primary.light"
                          : "transparent",
                      "&:hover": {
                        transform: "scale(1.03)",
                        transition: "0.3s",
                      },
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      console.log("=== Plan Selected ===");
                      console.log("Selected plan:", plan);
                      console.log("Current formData:", formData);

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

                      console.log("Updated formData:", updatedFormData);

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
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleContinue}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: "1.1rem",
            fontWeight: 600,
            boxShadow: 3,
          }}
        >
          Create Account
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
    <Box
      sx={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #121212 0%, #1e1e1e 100%)"
          : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(45deg, #1976d2, #0d47a1)",
              color: "white",
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Create Your Garage Account
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Get started with our garage management platform
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
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
                  sx={{ borderRadius: 2 }}
                >
                  Back
                </Button>
              )}
              {activeStep < 6 && (
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
                    boxShadow: 3,
                  }}
                >
                  {activeStep === 5 ? "Verify" : "Continue"}
                </Button>
              )}
            </Box>

            {/* Renew Plan Link */}
            <Box mt={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Button
                  component="span"
                  color="primary"
                  onClick={() => navigate("/login")}
                  sx={{ fontWeight: 600, mx: 0.5 }}
                >
                  Sign In
                </Button>
                {" | "}
                <Button
                  component="span"
                  color="secondary"
                  onClick={() => navigate("/renew")}
                  sx={{ fontWeight: 600, mx: 0.5 }}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedSignUpPage;
