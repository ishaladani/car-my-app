import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const GarageDetailsSection = ({ garageDetails }) => {
  return (
    <Card sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Garage Information
        </Typography>
        <Typography variant="body1" fontWeight={500}>{garageDetails.name}</Typography>
        <Typography variant="body2" color="text.secondary">{garageDetails.address}</Typography>
        <Typography variant="body2" color="text.secondary">Phone: {garageDetails.phone}</Typography>
        <Typography variant="body2" color="text.secondary">GST: {garageDetails.gstNumber}</Typography>
        <Typography variant="body2" color="text.secondary">Email: {garageDetails.email}</Typography>
            </CardContent>
    </Card>
  );
};

export default GarageDetailsSection;