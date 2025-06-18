import React from 'react';
import { Card, CardContent, TextField, Typography } from '@mui/material';

const FinalInspectionSection = ({ finalInspection, setFinalInspection }) => {
  return (
    <Card sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Final Inspection & Additional Notes
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Enter final inspection notes, additional comments, or special instructions..."
          value={finalInspection}
          onChange={(e) => setFinalInspection(e.target.value)}
        />
      </CardContent>
    </Card>
  );
};

export default FinalInspectionSection;