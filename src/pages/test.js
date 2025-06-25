import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
 ListItemText,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';

const JobCardForm = () => {
  const [jobPoints, setJobPoints] = useState(['']);
  const [currentJobPoint, setCurrentJobPoint] = useState('');
  const [newPart, setNewPart] = useState({
    partName: '',
    partNumber: '',
    carName: '',
    model: '',
    quantity: 1,
    pricePerUnit: 0,
  });
  const [assignments, setAssignments] = useState([
    {
      id: Date.now(),
      engineer: null,
      parts: [],
    },
  ]);
  const [engineers, setEngineers] = useState([]);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [parsedJobDetails, setParsedJobDetails] = useState([]);
  const [partAddError, setPartAddError] = useState(null);
  const [partAddSuccess, setPartAddSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Add job detail point
  const addJobPoint = () => {
    if (currentJobPoint.trim()) {
      setJobPoints(prev => [...prev.filter(point => point.trim()), currentJobPoint.trim()]);
      setCurrentJobPoint('');
    }
  };

  // Remove job detail point
  const removeJobPoint = (indexToRemove) => {
    setJobPoints(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Format job points for API
  const getJobDetailsForAPI = () => {
    return jobPoints.filter(point => point.trim()).join('\n');
  };

  // Handle part input change
  const handlePartInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (partAddError) setPartAddError(null);
  };

  // Add new part to inventory
  const handleAddPart = () => {
    if (!newPart.partName.trim()) {
      setPartAddError('Part Name is required.');
      return;
    }

    setInventoryParts(prev => [...prev, { ...newPart, _id: `part-${Date.now()}` }]);
    setPartAddSuccess(true);
    setTimeout(() => setPartAddSuccess(false), 3000);
    setNewPart({
      partName: '',
      partNumber: '',
      carName: '',
      model: '',
      quantity: 1,
      pricePerUnit: 0,
    });
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    const jobDetails = getJobDetailsForAPI();
    const allPartsUsed = assignments.flatMap(assignment =>
      assignment.parts.map(part => ({
        ...part,
        totalPrice: part.pricePerUnit * part.selectedQuantity,
      }))
    );

    console.log('Submitted Job Details:', jobDetails);
    console.log('Parts Used:', allPartsUsed);
    alert('Job submitted successfully!');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Job Card
      </Typography>

      {/* Job Details */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Job Details</Typography>
        {jobPoints.map((point, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              value={point}
              onChange={(e) => {
                const updated = [...jobPoints];
                updated[index] = e.target.value;
                setJobPoints(updated);
              }}
            />
            <Button color="error" onClick={() => removeJobPoint(index)}>Remove</Button>
          </Box>
        ))}
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            placeholder="Add new job detail"
            value={currentJobPoint}
            onChange={(e) => setCurrentJobPoint(e.target.value)}
          />
          <Button variant="outlined" onClick={addJobPoint} sx={{ mt: 1 }}>
            Add Detail
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Parts Inventory */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1">Add New Part</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Part Name *"
              name="partName"
              value={newPart.partName}
              onChange={handlePartInputChange}
              error={!newPart.partName.trim() && !!partAddError}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Part Number"
              name="partNumber"
              value={newPart.partNumber}
              onChange={handlePartInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Car Name"
              name="carName"
              value={newPart.carName}
              onChange={handlePartInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model"
              name="model"
              value={newPart.model}
              onChange={handlePartInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity *"
              name="quantity"
              type="number"
              value={newPart.quantity}
              onChange={handlePartInputChange}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price Per Unit"
              name="pricePerUnit"
              type="number"
              value={newPart.pricePerUnit}
              onChange={handlePartInputChange}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleAddPart} sx={{ mt: 2 }}>
          Add to Inventory
        </Button>
        {partAddSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>Part added successfully!</Alert>
        )}
        {partAddError && (
          <Alert severity="error" sx={{ mt: 2 }}>{partAddError}</Alert>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Engineer Assignments */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1">Assign Engineers</Typography>
        {assignments.map((assignment, idx) => (
          <Card key={idx} sx={{ mb: 2, p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Engineer Name"
                  value={assignment.engineer?.name || ''}
                  onChange={(e) => {
                    const updated = [...assignments];
                    updated[idx].engineer = { name: e.target.value };
                    setAssignments(updated);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Selected Parts"
                  value={assignment.parts.map(p => p.partName).join(', ') || 'None'}
                  disabled
                />
              </Grid>
            </Grid>
          </Card>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Submit Button */}
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Job Card
      </Button>

      {/* Error Notification */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default JobCardForm;