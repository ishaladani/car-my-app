import React from 'react';
import { Box, Card, CardContent, Grid, Paper, TextField, Typography } from '@mui/material';
import { InputAdornment } from '@mui/material';

const BillSummarySection = ({ 
  summary, 
  gstSettings, 
  handleDiscountChange, 
  paymentMethod, 
  isMobile,
  formatAmount
}) => {
  const summaryItems = [
    { label: "Parts & Materials Total:", value: formatAmount(summary.totalPartsCost), icon: "🔧" },
    { label: "Labor & Services Total:", value: formatAmount(summary.totalLaborCost), icon: "⚙️" },
    { label: "Subtotal (Before Tax):", value: formatAmount(summary.subtotal), bold: true },
  ];

  return (
    <Card sx={{ mb: 4, border: '2px solid #2196F3', borderRadius: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Professional Bill Summary
        </Typography>
        <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.2)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              {summaryItems.map((item, index) => (
                <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: '1px dashed rgba(0,0,0,0.1)' }}>
                  <Typography variant="body1" fontWeight={item.bold ? 600 : 400} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </Typography>
                  <Typography variant="body1" fontWeight={item.bold ? 600 : 500} color={item.bold ? "primary.main" : "inherit"}>
                    {item.value}
                  </Typography>
                </Box>
              ))}

              {gstSettings.includeGst && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'primary.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.contrastText" sx={{ mb: 1 }}>
                    📋 Tax Details:
                  </Typography>
                  {gstSettings.isInterState ? (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="primary.contrastText">
                        IGST ({gstSettings.gstPercentage}%):
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.contrastText">
                        {formatAmount(summary.gstAmount)}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="body2" color="primary.contrastText">
                          CGST ({gstSettings.cgstPercentage}%):
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.contrastText">
                          {formatAmount(Math.round(summary.gstAmount / 2))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="primary.contrastText">
                          SGST ({gstSettings.sgstPercentage}%):
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.contrastText">
                          {formatAmount(Math.round(summary.gstAmount / 2))}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: '1px dashed rgba(0,0,0,0.1)' }}>
                <Typography variant="body1">💸 Discount Applied:</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={summary.discount}
                    onChange={handleDiscountChange}
                    sx={{ width: 100 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, backgroundColor: 'primary.main', borderRadius: 2, textAlign: 'center', color: 'white' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
                  {!gstSettings.includeGst ? "TOTAL (Excluding GST)" : "GRAND TOTAL (Including GST)"}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatAmount(summary.totalAmount)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  {paymentMethod && `Payment: ${paymentMethod}`}
                </Typography>
              </Box>

              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  💳 Payment Terms: Due on delivery
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  📅 Valid until: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-IN')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default BillSummarySection;