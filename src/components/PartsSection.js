import React from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Divider
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon
} from '@mui/icons-material';

const PartsSection = ({
  parts,
  removePart,
  openEditPrice,
  setShowNewPartDialog,
  isMobile,
  tableCellStyle
}) => {
  return (
    <Card sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", mb: 2, gap: isMobile ? 2 : 0 }}>
          <Typography variant="h6" color="primary" sx={{ display: "flex", alignItems: "center" }}>
            Parts & Materials ({parts.length} items)
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setShowNewPartDialog(true)}>
            Add Part
          </Button>
        </Box>

        {parts.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, overflowX: "auto", borderRadius: 2 }}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow sx={{ background: '#1976d2', '& .MuiTableCell-head': { color: 'white', fontWeight: 600 } }}>
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
                  <TableRow key={part.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell sx={{ ...tableCellStyle, fontWeight: 500 }}>{index + 1}</TableCell>
                    <TableCell sx={tableCellStyle}>
                      <Typography variant="body2" fontWeight={500}>{part.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <Chip label={part.quantity} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'flex-end' }}>
                        <Typography variant="body2" fontWeight={500}>₹{part.pricePerUnit}</Typography>
                        <IconButton size="small" color="primary" onClick={() => openEditPrice(part.id, "part", "pricePerUnit", part.pricePerUnit)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600} color="primary">₹{part.total}</Typography>
                    </TableCell>
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <IconButton size="small" color="error" onClick={() => removePart(part.id)}>
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
              No parts data available. Click "Add Part" to add manually.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PartsSection;
