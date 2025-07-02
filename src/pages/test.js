import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Divider,
  Container,
  Chip,
} from '@mui/material';

import {
  CarIcon as CarIcon,
  PersonIcon as PersonIcon,
  PeopleIcon as PeopleIcon,
  BuildIcon as BuildIcon,
  InventoryIcon as InventoryIcon,
  LibraryAddIcon as LibraryAddIcon,
  DeleteIcon as DeleteIcon,
  SecurityIcon as SecurityIcon,
  AssignmentIcon as AssignmentIcon,
  TimerIcon as TimerIcon,
} from '@mui/icons-material';

const WorkInProgress = () => {
  const [laborHours, setLaborHours] = useState('2');
  const [status, setStatus] = useState('In Progress');

  // Sample data - replace with real API data
  const carDetails = {
    company: 'Toyota',
    model: 'Corolla',
    carNo: 'TN-1234',
  };

  const customerDetails = {
    name: 'John Doe',
    contact: '+91 9876543210',
    email: 'john@example.com',
  };

  const insuranceDetails = {
    company: 'HDFC Ergo',
    policyNo: 'POL123456',
    type: 'Comprehensive',
    expiry: '2025-12-31',
  };

  const partsUsed = [
    { id: 1, partName: 'Oil Filter', quantity: 2, price: 200 },
    { id: 2, partName: 'Brake Pad', quantity: 1, price: 450 },
  ];

  const calculateTotal = () =>
    partsUsed.reduce((total, part) => total + part.price * part.quantity, 0);

  return (
    <Box sx={{ flexGrow: 1, mb: 4, px: { xs: 2, sm: 3 }, pt: 2 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: '#1976d2',
            borderRadius: 2,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ color: 'white', textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" fontWeight={700}>
              Work In Progress
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mt: 0.5 }}>
              Update work status and manage parts for job card
            </Typography>
          </Box>
          <Chip
            icon={<AssignmentIcon />}
            label="In Progress"
            color="warning"
            size="medium"
            sx={{ fontWeight: 600 }}
          />
        </Paper>

        <form onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={8}>
              {/* Vehicle & Customer Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ background: '#1976d2', color: 'white', p: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
                        <CarIcon />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Vehicle Details
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <TextField fullWidth label="Company" value={carDetails.company} InputProps={{ readOnly: true }} sx={{ mb: 1 }} />
                      <TextField fullWidth label="Model" value={carDetails.model} InputProps={{ readOnly: true }} sx={{ mb: 1 }} />
                      <TextField fullWidth label="Registration Number" value={carDetails.carNo} InputProps={{ readOnly: true }} />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ background: '#1976d2', color: 'white', p: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Customer Details
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <TextField fullWidth label="Name" value={customerDetails.name} InputProps={{ readOnly: true }} sx={{ mb: 1 }} />
                      <TextField fullWidth label="Contact" value={customerDetails.contact} InputProps={{ readOnly: true }} sx={{ mb: 1 }} />
                      <TextField fullWidth label="Email" value={customerDetails.email} InputProps={{ readOnly: true }} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Assigned Engineers Section */}
              <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ background: '#1976d2', color: 'white', p: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Assigned Engineers
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Button variant="contained" color="primary" startIcon={<LibraryAddIcon />}>
                    Add Engineer
                  </Button>
                </CardContent>
              </Card>

              {/* Parts Management */}
              <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ background: '#1976d2', color: 'white', p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
                      <BuildIcon />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Parts Management
                    </Typography>
                  </Box>
                  <Button variant="contained" size="small" startIcon={<InventoryIcon />} color="success">
                    From Inventory
                  </Button>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                    <Table size="small">
                      <TableBody>
                        {partsUsed.map((part) => (
                          <TableRow key={part.id}>
                            <TableCell>{part.partName}</TableCell>
                            <TableCell align="right">{part.quantity}</TableCell>
                            <TableCell align="right">₹{part.price}</TableCell>
                            <TableCell align="right">
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Work Details */}
              <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ background: '#1976d2', color: 'white', p: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 1 }}>
                    <TimerIcon />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Work Details
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Labor Hours"
                        type="number"
                        value={laborHours}
                        onChange={(e) => setLaborHours(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          label="Status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                          <MenuItem value="Pending">Pending</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Engineer Remarks"
                        placeholder="Enter remarks..."
                        value="All parts installed."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Insurance Details */}
              <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ background: '#1976d2', color: 'white', p: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 1 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Insurance Details
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption">Company:</Typography>
                      <Typography variant="body2">{insuranceDetails.company}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption">Policy No:</Typography>
                      <Typography variant="body2">{insuranceDetails.policyNo}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption">Type:</Typography>
                      <Chip label={insuranceDetails.type} color="primary" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption">Expires:</Typography>
                      <Typography variant="body2">
                        {new Date(insuranceDetails.expiry).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', background: '#1976d2', color: 'white' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Work Summary
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography align="center">{partsUsed.length}</Typography>
                      <Typography variant="caption">Parts Used</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="center">{laborHours}</Typography>
                      <Typography variant="caption">Labor Hours</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}>
                        <Typography align="center" fontWeight={600}>
                          Total: ₹{calculateTotal()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              startIcon={<span className="material-icons">save</span>}
              sx={{
                py: 1.2,
                fontSize: '1rem',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)' },
              }}
            >
              Submit Work Progress
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default WorkInProgress;