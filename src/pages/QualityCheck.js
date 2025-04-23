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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QualityCheck = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for parts table and final inspection remarks
  const [parts, setParts] = useState([
    { id: 1, partName: '', qty: '', pricePerPiece: '', totalPrice: '' },
    { id: 2, partName: '', qty: '', pricePerPiece: '', totalPrice: '' }
  ]);
  
  const [finalInspection, setFinalInspection] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Quality check approved');
    // Add your submission logic here
  };

  // Engineer and timestamp details (would normally come from props or context)
  const engineerName = "Michael Smith";
  const dateTime = "05/03/2025 - 10:30 AM";

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
            Quality Check
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
              {/* Engineer and Date/Time info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <BuildIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body1">
                      Done By Engineer: {' '}
                      <Typography 
                        component="span" 
                        fontWeight={600}
                        color={theme.palette.primary.main}
                      >
                        {engineerName}
                      </Typography>
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'flex-start', md: 'flex-end' }
                    }}
                  >
                    <CalendarIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body1">
                      Date & Time: {' '}
                      <Typography 
                        component="span" 
                        fontWeight={600}
                        color={theme.palette.primary.main}
                      >
                        {dateTime}
                      </Typography>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Vehicle, Customer and Insurance Details */}
              <Paper
                elevation={0}
                sx={{
                  mb: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Grid container>
                  <Grid item xs={12} md={4}>
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        p: 1.5,
                        textAlign: 'center',
                        fontWeight: 600
                      }}
                    >
                      Car Details
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        p: 1.5,
                        textAlign: 'center',
                        fontWeight: 600,
                        borderLeft: { xs: 0, md: `1px solid ${theme.palette.primary.dark}` },
                        borderRight: { xs: 0, md: `1px solid ${theme.palette.primary.dark}` },
                        borderTop: { xs: `1px solid ${theme.palette.primary.dark}`, md: 0 },
                        borderBottom: { xs: `1px solid ${theme.palette.primary.dark}`, md: 0 }
                      }}
                    >
                      Customer Details
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        p: 1.5,
                        textAlign: 'center',
                        fontWeight: 600,
                        borderTop: { xs: `1px solid ${theme.palette.primary.dark}`, md: 0 }
                      }}
                    >
                      Insurance Details
                    </Box>
                  </Grid>
                </Grid>

                <Grid container sx={{ p: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ pr: { xs: 0, md: 2 } }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '80px' }}>Company:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '80px' }}>Model:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', mb: { xs: 2, md: 0 } }}>
                        <Typography variant="body1" sx={{ minWidth: '80px' }}>Car No.:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ px: { xs: 0, md: 2 }, mt: { xs: 2, md: 0 } }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Name:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Contact No.:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', mb: { xs: 2, md: 0 } }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Email:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ pl: { xs: 0, md: 2 }, mt: { xs: 2, md: 0 } }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Company:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Number:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Typography variant="body1" sx={{ minWidth: '100px' }}>Expiry Date:</Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            ml: 1,
                            minHeight: '24px'
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Parts Used */}
              <Box sx={{ mt: 4, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Parts Used
                </Typography>
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: theme.shadows[2] }}>
                  <TableContainer>
                    <Table aria-label="parts table">
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Sr.No.
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Part Name
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Qty
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            Price/Piece
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
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
                            <TableCell align="center">{part.id}</TableCell>
                            <TableCell align="center">
                              <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small"
                                value={part.partName}
                                onChange={(e) => {
                                  const updatedParts = parts.map(p => 
                                    p.id === part.id ? {...p, partName: e.target.value} : p
                                  );
                                  setParts(updatedParts);
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small"
                                type="number"
                                value={part.qty}
                                onChange={(e) => {
                                  const updatedParts = parts.map(p => 
                                    p.id === part.id ? {...p, qty: e.target.value} : p
                                  );
                                  setParts(updatedParts);
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small"
                                type="number"
                                value={part.pricePerPiece}
                                onChange={(e) => {
                                  const updatedParts = parts.map(p => 
                                    p.id === part.id ? {...p, pricePerPiece: e.target.value} : p
                                  );
                                  setParts(updatedParts);
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small"
                                type="number"
                                value={part.totalPrice}
                                onChange={(e) => {
                                  const updatedParts = parts.map(p => 
                                    p.id === part.id ? {...p, totalPrice: e.target.value} : p
                                  );
                                  setParts(updatedParts);
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>

              {/* Final Inspection */}
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Final Inspection......"
                variant="outlined"
                value={finalInspection}
                onChange={(e) => setFinalInspection(e.target.value)}
                sx={{ mb: 3 }}
              />

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
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
                  Approve Bill
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default QualityCheck;