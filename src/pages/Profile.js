import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  Chip,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import BusinessIcon from "@mui/icons-material/Business";
import axios from "axios";

const Profile = () => {
  const [garageData, setGarageData] = useState({
    name: "Garage",
    image: "",
    email: "N/A",
    phone: "N/A",
    address: "N/A",
    gstNumber: "N/A", // Added GST number field
    subscriptionType: "Free",
    isSubscribed: false,
  });

  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [imageChanged, setImageChanged] = useState(false); // Track if image was changed
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchGarageProfile = async () => {
      const garageId = localStorage.getItem("garageId");
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
          gstNumber: data.gstNumber || "N/A", // Added GST number
          subscriptionType: data.subscriptionType || "Free",
          isSubscribed: data.isSubscribed || false,
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
    setImageChanged(false); // Reset image change flag
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditData({ ...garageData });
    setImageChanged(false); // Reset image change flag
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const compressImage = (file, maxWidth = 400, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
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
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showSnackbar("Please select a valid image file", "error");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar("Image size should be less than 5MB", "error");
      return;
    }

    try {
      // Compress image
      const compressedImage = await compressImage(file);
      
      setEditData(prev => ({
        ...prev,
        image: compressedImage
      }));
      
      setImageChanged(true); // Mark that image has been changed
      showSnackbar("Image uploaded successfully", "success");
    } catch (error) {
      console.error("Error processing image:", error);
      showSnackbar("Failed to process image", "error");
    }
  };

  const handleSaveChanges = async () => {
    const garageId = localStorage.getItem("garageId");
    if (!garageId) {
      showSnackbar("Garage ID not found", "error");
      return;
    }

    // Validate required fields (removed email from validation since it's not editable)
    if (!editData.name) {
      showSnackbar("Name is a required field", "error");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Prepare the data payload for the API
      const updatePayload = {
        name: editData.name,
        phone: editData.phone || "",
        address: editData.address || "",
        gstNumber: editData.gstNumber || "", // Added GST number to payload
        subscriptionType: editData.subscriptionType,
        isSubscribed: editData.isSubscribed,
      };

      // Always include logo in the payload, whether it's new, existing, or empty
      // This ensures the logo field is properly updated on the server
      updatePayload.logo = editData.image || "";

      console.log("Payload size:", JSON.stringify(updatePayload).length, "bytes");
      console.log("Logo included:", !!updatePayload.logo);
      console.log("Image changed:", imageChanged);

      const response = await axios.put(
        `https://garage-management-zi5z.onrender.com/api/garage/allgarages/${garageId}`,
        updatePayload,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        // Update the local state with the new data
        const updatedGarageData = { ...editData };
        setGarageData(updatedGarageData);
        
        // Update localStorage with the new values
        localStorage.setItem("garageName", editData.name);
        localStorage.setItem("garageLogo", editData.image || "");

        // Reset flags
        setImageChanged(false);
        setEditDialogOpen(false);
        
        showSnackbar("Profile updated successfully!", "success");

        // Optionally, you can force a page refresh to ensure all components reflect the new logo
        // window.location.reload();
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

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: { xs: 0, sm: 35 },
      overflow: 'auto'
    }}>
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
          {/* {garageData.isSubscribed && (
            <Chip
              label={`${garageData.subscriptionType.toUpperCase()} Plan`}
              color="success"
              sx={{ mt: 1 }}
            />
          )} */}
        </Box>

        {/* Details */}
        <Box sx={{ p: 3 }}>
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
                <Typography>GST: {garageData.gstNumber}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon color="action" />
                <Typography>{garageData.address}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Garage Profile
        </DialogTitle>
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
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  size="small"
                >
                  Change Logo
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Max 5MB, recommended 400x400px
              </Typography>
              {imageChanged && (
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                  ✓ New image selected
                </Typography>
              )}
            </Grid>

            {/* Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Garage Name"
                value={editData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                variant="outlined"
              />
            </Grid>

            {/* Email - Read Only */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editData.email || ""}
                variant="outlined"
                disabled
                helperText="Email cannot be changed"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                  },
                }}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                variant="outlined"
              />
            </Grid>

            {/* GST Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GST Number"
                value={editData.gstNumber || ""}
                onChange={(e) => handleInputChange("gstNumber", e.target.value.toUpperCase())}
                variant="outlined"
                placeholder="e.g., 27AAAPL1234C1Z5"
                inputProps={{ maxLength: 15 }}
                helperText="15-digit GST identification number"
              />
            </Grid>

            {/* Subscription Type */}
            {/* <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Subscription Type</InputLabel>
                <Select
                  value={editData.subscriptionType || "Free"}
                  onChange={(e) => handleInputChange("subscriptionType", e.target.value)}
                  label="Subscription Type"
                >
                  <MenuItem value="Free">Free</MenuItem>
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                  <MenuItem value="Enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}

            {/* Subscription Status */}
            {/* <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.isSubscribed || false}
                    onChange={(e) => handleInputChange("isSubscribed", e.target.checked)}
                    color="primary"
                  />
                }
                label="Active Subscription"
                sx={{ mt: 2 }}
              />
            </Grid> */}

            {/* Address */}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleEditClose}
            startIcon={<CancelIcon />}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={updating}
          >
            {updating ? <CircularProgress size={20} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;