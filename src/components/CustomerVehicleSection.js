import React from 'react';
import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';

const CustomerVehicleSection = ({ carDetails, handleInputChange, isMobile, today }) => {
  const fields = [
    { id: "customerName", label: "Customer Name", xs: 12, sm: 6, md: 4 },
    { id: "contact", label: "Contact Number", xs: 12, sm: 6, md: 4 },
    { id: "email", label: "Email Address", xs: 12, sm: 6, md: 4 },
    { id: "address", label: "Customer Address", xs: 12, sm: 6, md: 6 },
    { id: "carNumber", label: "Vehicle Registration", xs: 12, sm: 6, md: 3 },
    { id: "company", label: "Make", xs: 12, sm: 6, md: 3 },
    { id: "model", label: "Model", xs: 12, sm: 6, md: 3 },
    { id: "billingDate", label: "Service Date", type: "date", xs: 12, sm: 6, md: 3 },
    { id: "invoiceNo", label: "Invoice Number", xs: 12, sm: 6, md: 6, readOnly: true }, // Invoice number set to read-only
  ];

  return (
    <Card sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Customer & Vehicle Information
        </Typography>
        <Grid container spacing={3}>
          {fields.map((field) => (
            <Grid item xs={field.xs} sm={field.sm} md={field.md} key={field.id}>
              <TextField
                id={field.id}
                label={field.label}
                variant="outlined"
                fullWidth
                margin="dense"
                value={carDetails[field.id]}
                onChange={handleInputChange}
                type={field.type || "text"}
                InputLabelProps={field.type === "date" ? { shrink: true } : {}}
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                // Make invoiceNo field read-only
                InputProps={{
                  readOnly: field.readOnly || false,
                }}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CustomerVehicleSection;
