import React from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Divider
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const PartsSection = ({
  parts,
  removePart,
  openEditPrice,
  setShowNewPartDialog,
  isMobile,
  tableCellStyle,
}) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      mb: 4, 
      border: `1px solid ${theme.palette.divider}`, 
      borderRadius: 3,
      bgcolor: 'background.paper'
    }}>
      <CardContent>
        <Box sx={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row", 
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center", 
          mb: 2, 
          gap: isMobile ? 2 : 0 
        }}>
          <Typography 
            variant="h6" 
            color="primary"
            sx={{ 
              display: "flex", 
              alignItems: "center",
              fontWeight: 600,
              fontSize: '1.25rem'
            }}
          >
            Parts & Materials ({parts.length} items)
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AddIcon />} 
            onClick={() => setShowNewPartDialog(true)}
          >
            Add Part
          </Button>
        </Box>

        {parts.length > 0 ? (
          <TableContainer 
            component={Paper} 
            variant="outlined" 
            sx={{ 
              mb: 2, 
              overflowX: "auto", 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper'
            }}
          >
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow 
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '& .MuiTableCell-head': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer',
                      '&:first-of-type': {
                        borderTopLeftRadius: theme.shape.borderRadius,
                      },
                      '&:last-of-type': {
                        borderTopRightRadius: theme.shape.borderRadius,
                      }
                    }
                  }}
                >
                  <TableCell>S.No</TableCell>
                  <TableCell>Part Description</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Rate (₹)</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parts.map((part, index) => (
                  <TableRow 
                    key={part.id} 
                    hover 
                    sx={{ 
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <TableCell sx={{ 
                      ...tableCellStyle, 
                      fontWeight: 500,
                      color: 'text.primary'
                    }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{
                      ...tableCellStyle,
                      color: 'text.primary'
                    }}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {part.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      ...tableCellStyle, 
                      textAlign: 'center' 
                    }}>
                      <Chip 
                        label={part.quantity} 
                        size="small" 
                        color="info"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      ...tableCellStyle, 
                      textAlign: 'right' 
                    }}>
                      <Box sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: 'flex-end' 
                      }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={600} 
                          color="primary"
                        >
                          ₹{part.pricePerUnit}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => openEditPrice(part.id, "part", "pricePerUnit", part.pricePerUnit)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      ...tableCellStyle, 
                      textAlign: 'right' 
                    }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={700} 
                        color="success.main"
                      >
                        ₹{part.total}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      ...tableCellStyle, 
                      textAlign: 'center' 
                    }}>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => removePart(part.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.03)', 
            borderRadius: 2, 
            border: `1px dashed ${theme.palette.divider}` 
          }}>
            <Typography variant="body2" color="text.secondary">
              No parts data available. Click "Add Part" to add manually.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PartsSection;