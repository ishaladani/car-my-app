import React from 'react';
import { 
  Box, Button, Card, CardContent, Chip, IconButton, 
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography 
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const ServicesSection = ({ 
  services, 
  removeService, 
  openEditPrice, 
  setShowNewServiceDialog, 
  isMobile,
  tableCellStyle,
  getStatusColor
}) => {
  return (
    <Card sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", mb: 2, gap: isMobile ? 2 : 0 }}>
          <Typography variant="h6" color="primary" sx={{ display: "flex", alignItems: "center" }}>
            Services Provided ({services.length} services)
          </Typography>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setShowNewServiceDialog(true)}>
            Add Service
          </Button>
        </Box>
        
        {services.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, overflowX: "auto", borderRadius: 2 }}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', '& .MuiTableCell-head': { color: 'white', fontWeight: 600 } }}>
                  <TableCell>S.No</TableCell>
                  <TableCell>Service Description</TableCell>
                  <TableCell>Engineer</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Labor Cost (₹)</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service, index) => (
                  <TableRow key={service.id} hover>
                    <TableCell sx={{ ...tableCellStyle, fontWeight: 500 }}>{index + 1}</TableCell>
                    <TableCell sx={tableCellStyle}>
                      <Typography variant="body2" fontWeight={500}>{service.name}</Typography>
                    </TableCell>
                    <TableCell sx={tableCellStyle}>
                      <Typography variant="body2">{service.engineer}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <Chip label={service.status} color={getStatusColor(service.status)} size="small" sx={{ fontWeight: 500 }} />
                    </TableCell>
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'flex-end' }}>
                        <Typography variant="body2" fontWeight={600} color="primary">₹{service.laborCost}</Typography>
                        <IconButton size="small" color="primary" onClick={() => openEditPrice(service.id, "service", "laborCost", service.laborCost)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <IconButton size="small" color="error" onClick={() => removeService(service.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'grey.50', borderRadius: 2, border: '1px dashed #ccc' }}>
            <Typography variant="body2" color="text.secondary">
              No services data available. Click "Add Service" to add manually.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesSection;