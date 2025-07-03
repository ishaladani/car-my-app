import React from 'react';
import { Box, Card, CardContent, Grid, Paper, TextField, Typography, useTheme } from '@mui/material';
import { InputAdornment } from '@mui/material';

const BillSummarySection = ({ 
  summary, 
  gstSettings, 
  handleDiscountChange, 
  paymentMethod, 
  isMobile,
  formatAmount
}) => {
  const theme = useTheme();
  
  const summaryItems = [
    { label: "Parts & Materials Total:", value: formatAmount(summary.totalPartsCost), icon: "🔧" },
    { label: "Labor & Services Total:", value: formatAmount(summary.totalLaborCost), icon: "⚙️" },
    { label: "Subtotal (Before Tax):", value: formatAmount(summary.subtotal), bold: true },
  ];

  return (
    <Card sx={{ 
      mb: 4, 
      border: `2px solid ${theme.palette.primary.main}`, 
      borderRadius: 3, 
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.9) 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      bgcolor: 'background.paper'
    }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Professional Bill Summary
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: `1px solid ${theme.palette.divider}`,
            borderColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(25, 118, 210, 0.2)'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              {summaryItems.map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    py: 1.5, 
                    borderBottom: `1px dashed ${theme.palette.divider}`,
                    '&:last-of-type': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    fontWeight={item.bold ? 600 : 400} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: 'text.primary'
                    }}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight={item.bold ? 600 : 500} 
                    color={item.bold ? "primary.main" : "text.primary"}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}

              {gstSettings.includeGst && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(25, 118, 210, 0.15)' 
                    : 'rgba(25, 118, 210, 0.1)', 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.primary.main}20`
                }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={600} 
                    color="primary.main" 
                    sx={{ mb: 1 }}
                  >
                    📋 Tax Details:
                  </Typography>
                  {gstSettings.isInterState ? (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.primary">
                        IGST ({gstSettings.gstPercentage}%):
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {formatAmount(summary.gstAmount)}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="body2" color="text.primary">
                          CGST ({gstSettings.cgstPercentage}%):
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {formatAmount(Math.round(summary.gstAmount / 2))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.primary">
                          SGST ({gstSettings.sgstPercentage}%):
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {formatAmount(Math.round(summary.gstAmount / 2))}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              )}

              {/* Discount Section */}
              {/* <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                py: 1.5, 
                borderBottom: summary.discount > 0 ? `1px dashed ${theme.palette.divider}` : 'none',
                mt: 2
              }}>
                <Typography variant="body1" color="text.primary">💸 Discount:</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={summary.discount}
                    onChange={handleDiscountChange}
                    sx={{ 
                      width: 100,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper'
                      }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Box>
              </Box> */}

              {/* Show discount amount if discount is applied */}
              {summary.discount > 0 && (
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  py: 1.5, 
                  borderBottom: `1px dashed ${theme.palette.divider}`,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : 'rgba(76, 175, 80, 0.05)',
                  borderRadius: 1,
                  px: 2,
                  mx: -1
                }}>
                  <Typography 
                    variant="body1" 
                    color="success.main" 
                    fontWeight={500}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    🎉 Discount Applied:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight={600} 
                    color="success.main"
                  >
                    - {formatAmount(summary.discount)}
                  </Typography>
                </Box>
              )}

              {/* Subtotal after discount and before tax */}
              {summary.discount > 0 && (
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  py: 1.5, 
                  borderBottom: `1px dashed ${theme.palette.divider}`,
                  mt: 1
                }}>
                  <Typography 
                    variant="body1" 
                    fontWeight={600}
                    color="text.primary"
                  >
                    Subtotal (After Discount):
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight={600} 
                    color="primary.main"
                  >
                    {formatAmount(summary.subtotal - summary.discount)}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'primary.main', 
                borderRadius: 2, 
                textAlign: 'center', 
                color: 'primary.contrastText',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 20px rgba(25, 118, 210, 0.3)' 
                  : '0 4px 20px rgba(25, 118, 210, 0.15)'
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
                  {!gstSettings.includeGst ? "TOTAL (Excluding GST)" : "GRAND TOTAL (Including GST)"}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatAmount(summary.totalAmount)}
                </Typography>
                {summary.discount > 0 && (
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    💰 You saved: {formatAmount(summary.discount)}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  {paymentMethod && `Payment: ${paymentMethod}`}
                </Typography>
              </Box>

              {/* Discount Summary Box */}
              {summary.discount > 0 && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(76, 175, 80, 0.15)' 
                    : 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.success.main}30`
                }}>
                  <Typography variant="subtitle2" color="success.main" fontWeight={600} gutterBottom>
                    💸 Discount Summary
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Original Amount: {formatAmount(summary.subtotal + (gstSettings.includeGst ? summary.gstAmount : 0))}
                  </Typography>
                  <Typography variant="caption" color="success.main" display="block" fontWeight={500}>
                    Discount: -{formatAmount(summary.discount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Final Amount: {formatAmount(summary.totalAmount)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.04)', 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
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