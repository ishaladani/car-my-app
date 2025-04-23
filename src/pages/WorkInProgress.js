import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  IconButton,
  Grid,
  CssBaseline,
  Paper,
  useTheme,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// This component would typically be integrated with your theme provider
// Similar to how the AssignEngineer component uses useThemeContext

const WorkInProgress = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Table rows state management
  const [parts, setParts] = useState([
    { id: 1, partName: '', partNumber: '', qty: '', pricePerPiece: '', gstPercent: '', totalPrice: '' },
    { id: 2, partName: '', partNumber: '', qty: '', pricePerPiece: '', gstPercent: '', totalPrice: '' },
    { id: 3, partName: '', partNumber: '', qty: '', pricePerPiece: '', gstPercent: '', totalPrice: '' },
    { id: 4, partName: '', partNumber: '', qty: '', pricePerPiece: '', gstPercent: '', totalPrice: '' }
  ]);
  
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [laborHours, setLaborHours] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    // Add your submission logic here
  };

  // Update part data in the table
  const handlePartChange = (id, field, value) => {
    const updatedParts = parts.map(part => {
      if (part.id === id) {
        return { ...part, [field]: value };
      }
      return part;
    });
    setParts(updatedParts);
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto',
      pt: 3
    }}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 2, 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Work In Progress
          </Typography>
        </Box>
        
        <Card sx={{ 
          mb: 4, 
          overflow: 'visible', 
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Car Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                height: '100%'
              }}>
                <Box sx={{ 
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: 'bold'
                }}>
                  Car Details
                </Box>
                <CardContent>
                  <TextField 
                    fullWidth 
                    placeholder="Company" 
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Model" 
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Car No." 
                    margin="normal"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Customer Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                height: '100%'
              }}>
                <Box sx={{ 
                  bgcolor: 'rgb(9, 141, 97)',
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: 'bold'
                }}>
                  Customer Details
                </Box>
                <CardContent>
                  <TextField 
                    fullWidth 
                    placeholder="Name" 
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Contact No." 
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Email" 
                    margin="normal"
                    variant="outlined"
                    type="email"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Insurance Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                mt: 2
              }}>
                <Box sx={{ 
                  bgcolor: 'rgb(9, 141, 97)',
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: 'bold'
                }}>
                  Insurance Details
                </Box>
                <CardContent>
                  <TextField 
                    fullWidth 
                    placeholder="Company" 
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SecurityIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Number" 
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Type" 
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField 
                    fullWidth 
                    type="date"
                    label="Expiry"
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Reg. No." 
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Amount" 
                    margin="normal"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Engineer Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                mt: 2
              }}>
                <Box sx={{ 
                  bgcolor: 'rgb(9, 141, 97)',
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: 'bold'
                }}>
                  Engineer Details
                </Box>
                <CardContent>
                  <TextField 
                    fullWidth 
                    placeholder="Full Name" 
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EngineeringIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Speciality" 
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField 
                    fullWidth 
                    type="datetime-local"
                    label="Date & Time Assigned"
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Parts Used */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Parts Used
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: theme.shadows[3] }}>
              <TableContainer>
                <Table aria-label="parts table">
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Sr.No.
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Part Name
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Part Number
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Qty
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Price/Piece
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        GST %
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          bgcolor: 'rgb(9, 141, 97)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        Total Price
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell align="center">
                          {part.id}
                        </TableCell>
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            value={part.partName}
                            onChange={(e) => handlePartChange(part.id, 'partName', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            value={part.partNumber}
                            onChange={(e) => handlePartChange(part.id, 'partNumber', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            type="number"
                            value={part.qty}
                            onChange={(e) => handlePartChange(part.id, 'qty', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            type="number"
                            value={part.pricePerPiece}
                            onChange={(e) => handlePartChange(part.id, 'pricePerPiece', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            type="number"
                            value={part.gstPercent}
                            onChange={(e) => handlePartChange(part.id, 'gstPercent', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            type="number"
                            value={part.totalPrice}
                            onChange={(e) => handlePartChange(part.id, 'totalPrice', e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>

          {/* Additional Fields */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Labour Hours"
                variant="outlined" 
                value={laborHours}
                onChange={(e) => setLaborHours(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                variant="outlined"
              >
                <MenuItem value="">Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Remarks */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter Remarks"
            variant="outlined"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ mt: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <CommentIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => navigate('/Quality-Check')}
              sx={{ 
                px: 4, 
                py: 1.5, 
                width: '50%',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'uppercase',
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              SUBMIT REMARKS
            </Button>
          </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default WorkInProgress;