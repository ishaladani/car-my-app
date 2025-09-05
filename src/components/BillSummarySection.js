import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const BillSummarySection = ({
  summary,
  gstSettings,
  handleDiscountChange,
  paymentMethod,
  isMobile,
  formatAmount,
  onLaborChange,
  laborServicesTotal,
  disabled = false,
  jobDetails: jobDetailsString = '[]',
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Parse jobDetails safely
  const jobDetails = React.useMemo(() => {
    try {
      const parsed = JSON.parse(jobDetailsString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse jobDetails:', e);
      return [];
    }
  }, [jobDetailsString]);

  // Auto-calculated labor from jobDetails
  const autoLaborTotal = jobDetails.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  // Use laborServicesTotal (which may be manually set) or fallback to auto
  const displayLaborCost = laborServicesTotal !== undefined ? laborServicesTotal : autoLaborTotal;

  // Parts subtotal (never taxed)
  const partsSubtotal = summary.totalPartsCost || 0;

  // 🔑 Only apply GST on Labour/Service (not on parts)
  const shouldApplyGst = gstSettings.includeGst && displayLaborCost > 0;

  // ✅ GST ONLY on Labour
  const laborGstAmount = shouldApplyGst ? (displayLaborCost * (gstSettings.gstPercentage / 100)) : 0;

  // ❌ NO GST on Parts
  const partsGstAmount = 0; // Always 0

  // Total GST = Only Labour GST
  const totalGstAmount = laborGstAmount;

  // Subtotal (Parts + Labour)
  const totalBeforeTax = partsSubtotal + displayLaborCost;

  // Final total: parts + labour + GST (only on labour) - discount
  const finalTotal = totalBeforeTax + totalGstAmount - (summary.discount || 0);

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <Card
      sx={{
        mb: 4,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: 3,
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.9) 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        bgcolor: 'background.paper',
      }}
    >
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
            borderColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(25, 118, 210, 0.2)',
          }}
        >
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {/* Left Column: Cost Breakdown */}
            <Grid item xs={12} lg={8}>
              {/* Parts & Materials */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  borderBottom: `1px dashed ${theme.palette.divider}`,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 0.5, sm: 0 },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.primary',
                  }}
                >
                  <span>🔧</span>
                  Parts & Materials Total:
                </Typography>
                <Typography variant="body1" fontWeight={500} color="text.primary">
                  {formatAmount(partsSubtotal)}
                </Typography>
              </Box>

              {/* Service/Labour Cost (Editable) */}
              <Box
                sx={{
                  py: 1.5,
                  borderBottom: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 },
                    textAlign: { xs: 'center', sm: 'left' }
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  >
                    <span>⚙️</span>
                    Service/Labour Cost:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      ₹
                    </Typography>
                    <TextField
                      type="number"
                      value={displayLaborCost || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                        if (onLaborChange) {
                          onLaborChange(value);
                        }
                      }}
                      size="small"
                      placeholder="0.00"
                      sx={{
                        width: isMobile ? '100%' : '120px',
                        '& .MuiInputBase-input': {
                          textAlign: 'right',
                          fontWeight: 600,
                          color: 'primary.main',
                        },
                      }}
                      inputProps={{
                        min: 0,
                        step: 0.01,
                        style: { textAlign: 'right' },
                      }}
                      disabled={disabled}
                    />
                  </Box>
                </Box>

                {/* GST on Labour Only */}
                {shouldApplyGst && laborGstAmount > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                      mt: 0.5,
                      pl: 4,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      <span>📋</span>
                      GST ({gstSettings.gstPercentage}%):
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      {formatAmount(laborGstAmount)}
                    </Typography>
                  </Box>
                )}

                {/* Expand Button if jobDetails exist */}
                {jobDetails.length > 0 && (
                  <Box sx={{ textAlign: 'right', mt: 0.5 }}>
                    <IconButton size="small" onClick={toggleExpand} sx={{ p: 0.5 }}>
                      {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                )}

                {/* Expanded Labor Details */}
                <Collapse in={expanded}>
                  <List dense sx={{ mt: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                    {jobDetails.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <span>🔧</span>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={500}>
                                {item.description || `Service ${idx + 1}`}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {item.hours
                                  ? `${item.hours} hrs × ₹${parseFloat(item.rate).toFixed(2)}/hr`
                                  : 'No time logged'}
                              </Typography>
                            }
                          />
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            ₹{formatAmount(parseFloat(item.amount) || 0)}
                          </Typography>
                        </ListItem>
                        {idx < jobDetails.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </Collapse>
              </Box>

              {/* Subtotal (Parts Only) */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  borderBottom: `1px dashed ${theme.palette.divider}`,
                  mt: 1,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  px: 2,
                  mx: -1,
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.primary',
                  }}
                >
                  <span>📦</span>
                  Subtotal (Parts Only):
                </Typography>
                <Typography variant="body1" fontWeight={600} color="primary.main">
                  {formatAmount(partsSubtotal)}
                </Typography>
              </Box>

              {/* Total Before Tax (Parts + Labour + Labour GST) */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  borderBottom: `1px dashed ${theme.palette.divider}`,
                  mt: 1,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(25, 118, 210, 0.1)'
                    : 'rgba(25, 118, 210, 0.05)',
                  borderRadius: 1,
                  px: 2,
                  mx: -1,
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'primary.main',
                  }}
                >
                  <span>💰</span>
                  Total (Parts + Labour + GST):
                </Typography>
                <Typography variant="body1" fontWeight={600} color="primary.main">
                  {formatAmount(totalBeforeTax + totalGstAmount)}
                </Typography>
              </Box>

              {/* GST Details - Only on Labour */}
              {shouldApplyGst && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(25, 118, 210, 0.15)'
                        : 'rgba(25, 118, 210, 0.1)',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.primary.main}20`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="primary.main"
                    sx={{ mb: 1 }}
                  >
                    📋 Tax Details (on Labour Only):
                  </Typography>
                  {gstSettings.isInterState ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" color="text.primary">
                        IGST ({gstSettings.gstPercentage}%):
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {formatAmount(laborGstAmount)}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="text.primary">
                          CGST ({gstSettings.cgstPercentage}%):
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {formatAmount(Math.round(laborGstAmount / 2))}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.primary">
                          SGST ({gstSettings.sgstPercentage}%):
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {formatAmount(Math.round(laborGstAmount / 2))}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              )}

              {/* Discount Applied */}
              {summary.discount > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: `1px dashed ${theme.palette.divider}`,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'rgba(76, 175, 80, 0.05)',
                    borderRadius: 1,
                    px: 2,
                    mx: -1,
                  }}
                >
                  <Typography
                    variant="body1"
                    color="success.main"
                    fontWeight={500}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    🎉 Discount Applied:
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="success.main">
                    - {formatAmount(summary.discount)}
                  </Typography>
                </Box>
              )}

              {/* Subtotal After Discount */}
              {summary.discount > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: `1px dashed ${theme.palette.divider}`,
                    mt: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight={600} color="text.primary">
                    Subtotal (After Discount):
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary.main">
                    {formatAmount(totalBeforeTax + totalGstAmount - summary.discount)}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Right Column: Grand Total & Summary */}
            <Grid item xs={12} lg={4}>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: 'primary.main',
                  borderRadius: 2,
                  textAlign: 'center',
                  color: 'primary.contrastText',
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(25, 118, 210, 0.3)'
                      : '0 4px 20px rgba(25, 118, 210, 0.15)',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
                  {shouldApplyGst ? 'GRAND TOTAL (Including GST)' : 'TOTAL (No GST)'}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatAmount(finalTotal)}
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

              {/* Cost Breakdown Summary */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" color="primary.main" fontWeight={600} gutterBottom>
                  💰 Cost Breakdown
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Parts: {formatAmount(partsSubtotal)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Labour: {formatAmount(displayLaborCost)}
                </Typography>
                {shouldApplyGst && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Labour GST: {formatAmount(laborGstAmount)}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" display="block">
                  Subtotal: {formatAmount(totalBeforeTax + totalGstAmount)}
                </Typography>
                {shouldApplyGst && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total GST: {formatAmount(totalGstAmount)}
                  </Typography>
                )}
                {summary.discount > 0 && (
                  <Typography variant="caption" color="success.main" display="block" fontWeight={500}>
                    Discount: -{formatAmount(summary.discount)}
                  </Typography>
                )}
                <Typography variant="caption" color="primary.main" display="block" fontWeight={600}>
                  Total: {formatAmount(finalTotal)}
                </Typography>
              </Box>

              {/* Discount Summary */}
              {summary.discount > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(76, 175, 80, 0.15)'
                        : 'rgba(76, 175, 80, 0.1)',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.success.main}30`,
                  }}
                >
                  <Typography variant="subtitle2" color="success.main" fontWeight={600} gutterBottom>
                    💸 Discount Summary
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Original Amount: {formatAmount(totalBeforeTax + totalGstAmount)}
                  </Typography>
                  <Typography variant="caption" color="success.main" display="block" fontWeight={500}>
                    Discount: -{formatAmount(summary.discount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Final Amount: {formatAmount(finalTotal)}
                  </Typography>
                </Box>
              )}

              {/* Payment Terms */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  💳 Payment Terms: Due on delivery
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  📅 Valid until:{' '}
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
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