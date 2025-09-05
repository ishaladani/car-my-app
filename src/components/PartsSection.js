import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Build as BuildIcon,
  LibraryAdd as LibraryAddIcon,
} from "@mui/icons-material";

const PartsSection = ({
  parts,
  setShowNewPartDialog,
  isMobile,
  tableCellStyle,
  disabled,
  gstSettings
}) => {
  console.log('gstSettings:', gstSettings);
  
  return (
    <Card
      elevation={0}
      sx={{ mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
    >
      <Box
        sx={{
          background: "#1976d2",
          color: "white",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
            <BuildIcon />
          </Avatar>
          <Typography variant="h6" fontWeight={600}>
            Parts Used
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Add New Part">
            {/* <Button
              variant="contained"
              size="small"
              onClick={() => setShowNewPartDialog(true)}
              startIcon={<LibraryAddIcon />}
              disabled={disabled}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              Create New
            </Button> */}
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {parts.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <BuildIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No parts added yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "Create New" to add parts to the bill
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ 
              border: 1, 
              borderColor: "divider",
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.5)',
                },
              },
            }}
          >
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: "#475569",
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}>
                    Part Name
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: "#475569",
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}>
                    HSN Code
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: "#475569",
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: "#475569",
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}>
                    Price/Unit
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: "#475569",
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}>
                    Total Price + Tax
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell sx={{
                      ...tableCellStyle,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 }
                    }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {part.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{
                      ...tableCellStyle,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 }
                    }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {part.hsnNumber || "8708"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{
                      ...tableCellStyle,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 }
                    }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {part.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{
                      ...tableCellStyle,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 }
                    }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        ₹{part.pricePerUnit?.toFixed(2) || "0.00"}
                      </Typography>
                    </TableCell>
                   <TableCell sx={{
                      ...tableCellStyle,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 }
                    }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        ₹{part.totalPrice?.toFixed(2) || part.total?.toFixed(2) || "0.00"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Parts Total */}
        {parts.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "success.main", borderRadius: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="success.contrastText"
            >
              Total Parts Cost: ₹
              {gstSettings?.includeGst === false 
                ? parts
                    .reduce((sum, part) => sum + ((part.pricePerUnit || 0) * (part.quantity || 0)), 0)
                    .toFixed(2)
                : parts
                    .reduce((sum, part) => sum + (part.total || 0), 0)
                    .toFixed(2)
              }
            </Typography>
          </Box>
        )}

        {/* API Data Summary */}
        {/* {parts.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary.dark"
              sx={{ mb: 1 }}
            >
              📊 API Data Summary - HSN Numbers & Tax Details:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {parts.map((part, index) => (
                <Box key={part.id} sx={{ 
                  p: 1, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body2" fontWeight={500} color="primary">
                    Part {index + 1}: {part.name}
                  </Typography>
                                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                     <Typography variant="caption" color="text.secondary">
                       HSN: {part.hsnNumber || 'N/A'}
                     </Typography>
                     <Typography variant="caption" color="text.secondary">
                       Price/Unit: ₹{part.pricePerUnit?.toFixed(2) || '0.00'}
                     </Typography>
                     <Typography variant="caption" color="info.main" fontWeight={500}>
                       Tax: {part.taxPercentage || 0}%
                     </Typography>
                     <Typography variant="caption" color="success.main" fontWeight={500}>
                       Tax Amount: ₹{part.taxAmount?.toFixed(2) || '0.00'}
                     </Typography>
                     <Typography variant="caption" color="primary" fontWeight={600}>
                       Total Price: ₹{part.totalPrice?.toFixed(2) || part.total?.toFixed(2) || '0.00'}
                     </Typography>
                   </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.main', borderRadius: 1 }}>
              <Typography variant="caption" color="white" fontWeight={600}>
                💡 Console Log: Check browser console for detailed API data breakdown
              </Typography>
            </Box>
          </Box>
        )} */}
      </CardContent>
    </Card>
  );
};

export default PartsSection;
