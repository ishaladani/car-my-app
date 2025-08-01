import React from "react";
import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";

const GarageDetailsSection = ({ garageDetails }) => {
  return (
    <Card sx={{ mb: 4, border: "1px solid #e0e0e0", borderRadius: 3 }}>
      <CardContent>
        {/* Garage Logo and Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {garageDetails.logoUrl && (
            <Avatar
              src={garageDetails.logoUrl}
              alt={garageDetails.name}
              sx={{
                width: 60,
                height: 60,
                mr: 2,
                border: "2px solid #e0e0e0",
              }}
            />
          )}
          <Box>
            <Typography variant="h5" color="primary" fontWeight={600}>
              {garageDetails.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Professional Auto Service
            </Typography>
          </Box>
        </Box>

        {/* Garage Details */}
        <Typography variant="body2" color="text.secondary">
          {garageDetails.address}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phone: {garageDetails.phone}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          GST: {garageDetails.gstNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Email: {garageDetails.email}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GarageDetailsSection;
