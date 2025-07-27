import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const Profile = () => {
  const [garageData, setGarageData] = useState({
    name: "Garage",
    image: "",
    email: "N/A",
    phone: "N/A",
    address: "N/A",
    gstNum: "N/A",
    subscriptionType: "Free",
    isSubscribed: false,
    bankDetails: {
      accountHolderName: "N/A",
      accountNumber: "N/A",
      ifscCode: "N/A",
      bankName: "N/A",
      branchName: "N/A",
      upiId: "N/A"
    }
  });

  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const garageId = localStorage.getItem("garageId");

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Fetch garage profile data
  useEffect(() => {
    const fetchGarageProfile = async () => {
      if (!garageId) {
        console.error("No garageId found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.get(
          `https://garage-management-zi5z.onrender.com/api/garage/getgaragebyid/${garageId}`,
          { headers }
        );

        const data = response.data || {};

        const updatedData = {
          name: data.name || "Garage",
          image: data.logo || "",
          email: data.email || "N/A",
          phone: data.phone || "N/A",
          address: data.address || "N/A",
          gstNum: data.gstNum || "N/A",
          subscriptionType: data.subscriptionType || "Free",
          isSubscribed: data.isSubscribed || false,
          bankDetails: {
            accountHolderName: data.bankDetails?.accountHolderName || "N/A",
            accountNumber: data.bankDetails?.accountNumber || "N/A",
            ifscCode: data.bankDetails?.ifscCode || "N/A",
            bankName: data.bankDetails?.bankName || "N/A",
            branchName: data.bankDetails?.branchName || "N/A",
            upiId: data.bankDetails?.upiId || "N/A"
          }
        };

        setGarageData(updatedData);
        setEditData(updatedData);

        localStorage.setItem("garageName", updatedData.name);
        if (updatedData.image) {
          localStorage.setItem("garageLogo", updatedData.image);
        }
      } catch (error) {
        console.error("Error fetching garage data:", error);
        const fallbackData = {
          ...garageData,
          name: localStorage.getItem("garageName") || "Garage",
          image: localStorage.getItem("garageLogo") || "",
        };
        setGarageData(fallbackData);
        setEditData(fallbackData);
        showSnackbar("Failed to load garage data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchGarageProfile();
  }, []);

  const handleEditClick = () => {
    setEditData({ ...garageData });
    setImageChanged(false);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditData({ ...garageData });
    setImageChanged(false);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested fields like bankDetails.accountHolderName
      const [parent, child] = field.split('.');
      setEditData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const compressImage = (file, maxWidth = 400, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showSnackbar("Please select a valid image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showSnackbar("Image size should be less than 5MB", "error");
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setEditData((prev) => ({
        ...prev,
        image: compressedImage,
      }));
      setImageChanged(true);
      showSnackbar("Image uploaded successfully", "success");
    } catch (error) {
      console.error("Error processing image:", error);
      showSnackbar("Failed to process image", "error");
    }
  };

  const handleLogoUpload = async () => {
    const logoFile = document.getElementById("image-upload").files[0];

    if (!logoFile) {
      showSnackbar("Please select an image to upload", "error");
      return;
    }

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/updatelogo/${garageId}`,
        formData,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        showSnackbar("Logo updated successfully!", "success");
        setGarageData((prev) => ({ ...prev, image: response.data.logo }));
        localStorage.setItem("garageLogo", response.data.logo);
      }
    } catch (error) {
      console.error("Error updating logo:", error);
      showSnackbar("Failed to update logo", "error");
    }
  };

  const handleSaveChanges = async () => {
    const garageId = localStorage.getItem("garageId");
    if (!garageId) {
      showSnackbar("Garage ID not found", "error");
      return;
    }

    if (imageChanged) {
      await handleLogoUpload();
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Prepare the complete data payload for the API
      const updatePayload = {
        name: editData.name,
        phone: editData.phone || "",
        address: editData.address || "",
        email: editData.email || "",
        gstNum: editData.gstNum || "",
        subscriptionType: editData.subscriptionType,
        isSubscribed: editData.isSubscribed,
        bankDetails: {
          accountHolderName: editData.bankDetails?.accountHolderName || "",
          accountNumber: editData.bankDetails?.accountNumber || "",
          ifscCode: editData.bankDetails?.ifscCode || "",
          bankName: editData.bankDetails?.bankName || "",
          branchName: editData.bankDetails?.branchName || "",
          upiId: editData.bankDetails?.upiId || ""
        }
      };

      updatePayload.logo = editData.image || "";

      console.log("Update payload:", updatePayload);

      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/${garageId}`, // Updated to match your curl command
        updatePayload,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        const updatedGarageData = { ...editData };
        setGarageData(updatedGarageData);

        localStorage.setItem("garageName", editData.name);
        localStorage.setItem("garageLogo", editData.image || "");

        setImageChanged(false);
        setEditDialogOpen(false);

        showSnackbar("Profile updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error updating garage data:", error);

      if (error.response?.status === 413) {
        showSnackbar("Payload too large. Please use a smaller image or reduce other data.", "error");
      } else if (error.response?.status === 400) {
        showSnackbar("Invalid data format. Please check your inputs.", "error");
      } else {
        showSnackbar(
          error.response?.data?.message || "Failed to update profile",
          "error"
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber === "N/A") return accountNumber;
    const str = accountNumber.toString();
    if (str.length <= 4) return str;
    return str.substring(0, 2) + "*".repeat(str.length - 4) + str.substring(str.length - 2);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, mb: 4, ml: { xs: 0, sm: 35 }, overflow: "auto" }}>
      <Paper elevation={4} sx={{ borderRadius: 4, overflow: "hidden" }}>
        {/* Banner */}
        <Box
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            py: 4,
            textAlign: "center",
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleEditClick}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <EditIcon />
          </IconButton>

          <Avatar
            src={garageData.image}
            alt={garageData.name}
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 1,
              fontSize: 36,
              bgcolor: !garageData.image ? "#1565c0" : "transparent",
            }}
          >
            {!garageData.image && garageData.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" fontWeight="bold">
            {garageData.name}
          </Typography>
          <Typography>{garageData.email}</Typography>
        </Box>

        {/* Details */}
        <Box sx={{ p: 3 }}>
          {/* Contact Information */}
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon color="action" />
                <Typography>{garageData.phone}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <EmailIcon color="action" />
                <Typography>{garageData.email}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <BusinessIcon color="action" />
                <Typography>GST: {garageData.gstNum}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon color="action" />
                <Typography>{garageData.address}</Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Bank Details Section */}
          <Box sx={{ mt: 4 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountBalanceIcon color="action" />
                  <Typography variant="h6">Bank Details</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PersonIcon color="action" />
                      <Typography variant="subtitle2">Account Holder:</Typography>
                    </Box>
                    <Typography>{garageData.bankDetails.accountHolderName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PaymentIcon color="action" />
                      <Typography variant="subtitle2">Account Number:</Typography>
                    </Box>
                    <Typography>{maskAccountNumber(garageData.bankDetails.accountNumber)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <BusinessIcon color="action" />
                      <Typography variant="subtitle2">IFSC Code:</Typography>
                    </Box>
                    <Typography>{garageData.bankDetails.ifscCode}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AccountBalanceIcon color="action" />
                      <Typography variant="subtitle2">Bank Name:</Typography>
                    </Box>
                    <Typography>{garageData.bankDetails.bankName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationOnIcon color="action" />
                      <Typography variant="subtitle2">Branch:</Typography>
                    </Box>
                    <Typography>{garageData.bankDetails.branchName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PaymentIcon color="action" />
                      <Typography variant="subtitle2">UPI ID:</Typography>
                    </Box>
                    <Typography>{garageData.bankDetails.upiId}</Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Garage Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Profile Image */}
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Avatar
                src={editData.image}
                alt={editData.name}
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  fontSize: 48,
                  bgcolor: !editData.image ? "#1976d2" : "transparent",
                }}
              >
                {!editData.image && editData.name.charAt(0).toUpperCase()}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />} size="small">
                  Change Logo
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
                Max 5MB, recommended 400x400px
              </Typography>
              {imageChanged && (
                <Typography variant="caption" display="block" sx={{ mt: 1, color: "success.main" }}>
                  ✓ New image selected
                </Typography>
              )}
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Garage Name"
                value={editData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GST Number"
                value={editData.gstNum || ""}
                onChange={(e) => handleInputChange("gstNum", e.target.value.toUpperCase())}
                variant="outlined"
                placeholder="e.g., 27AAAPL1234C1Z5"
                inputProps={{ maxLength: 15 }}
                helperText="15-digit GST identification number"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={editData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                variant="outlined"
              />
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Bank Details</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Holder Name"
                value={editData.bankDetails?.accountHolderName || ""}
                onChange={(e) => handleInputChange("bankDetails.accountHolderName", e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={editData.bankDetails?.accountNumber || ""}
                onChange={(e) => handleInputChange("bankDetails.accountNumber", e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                value={editData.bankDetails?.ifscCode || ""}
                onChange={(e) => handleInputChange("bankDetails.ifscCode", e.target.value.toUpperCase())}
                variant="outlined"
                placeholder="e.g., SBIN0000123"
                inputProps={{ maxLength: 11 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={editData.bankDetails?.bankName || ""}
                onChange={(e) => handleInputChange("bankDetails.bankName", e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Branch Name"
                value={editData.bankDetails?.branchName || ""}
                onChange={(e) => handleInputChange("bankDetails.branchName", e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UPI ID"
                value={editData.bankDetails?.upiId || ""}
                onChange={(e) => handleInputChange("bankDetails.upiId", e.target.value)}
                variant="outlined"
                placeholder="e.g., user@paytm"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} startIcon={<CancelIcon />} disabled={updating}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant="contained" startIcon={<SaveIcon />} disabled={updating}>
            {updating ? <CircularProgress size={20} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose} 
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
