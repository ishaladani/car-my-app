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
}) => {
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
            sx={{ border: 1, borderColor: "divider" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                    Part Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                    HSN Code
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                    Price/Unit
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                    Total
                  </TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell {...tableCellStyle}>
                      <Typography variant="body2" fontWeight={500}>
                        {part.name}
                      </Typography>
                    </TableCell>
                    <TableCell {...tableCellStyle}>
                      <Typography variant="body2" color="text.secondary">
                        {part.hsnNumber || "8708"}
                      </Typography>
                    </TableCell>
                    <TableCell {...tableCellStyle}>
                      <Typography variant="body2" color="text.secondary">
                        {part.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell {...tableCellStyle}>
                      <Typography variant="body2" color="text.secondary">
                        ₹{part.pricePerUnit?.toFixed(2) || "0.00"}
                      </Typography>
                    </TableCell>
                    <TableCell {...tableCellStyle}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary"
                      >
                        ₹{part.total?.toFixed(2) || "0.00"}
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
              {parts
                .reduce((sum, part) => sum + (part.total || 0), 0)
                .toFixed(2)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PartsSection;
