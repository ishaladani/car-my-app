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
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import axios from "axios";

const Profile = () => {
  const [garageData, setGarageData] = useState({
    name: "Garage",
    image: "",
    email: "N/A",
    phone: "N/A",
    address: "N/A",
    subscriptionType: "Free",
    isSubscribed: false,
  });

  const [loading, setLoading] = useState(true);

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
          subscriptionType: data.subscriptionType || "Free",
          isSubscribed: data.isSubscribed || false,
        };

        setGarageData(updatedData);

        localStorage.setItem("garageName", updatedData.name);
        if (updatedData.image) {
          localStorage.setItem("garageLogo", updatedData.image);
        }
      } catch (error) {
        console.error("Error fetching garage data:", error);
        setGarageData({
          ...garageData,
          name: localStorage.getItem("garageName") || "Garage",
          image: localStorage.getItem("garageLogo") || "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGarageProfile();
  }, []);

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
          {garageData.isSubscribed && (
            <Chip
              label={`${garageData.subscriptionType.toUpperCase()} Plan`}
              color="success"
              sx={{ mt: 1 }}
            />
          )}
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
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon color="action" />
                <Typography>{garageData.address}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
