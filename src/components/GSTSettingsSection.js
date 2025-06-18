import React from 'react';
import { 
  Box, Card, CardContent, FormControl, FormControlLabel, Grid, 
  InputLabel, MenuItem, Select, Switch, TextField, Typography ,InputAdornment,
} from '@mui/material';


const GSTSettingsSection = ({ 
  gstSettings, 
  handleGstIncludeChange,
  handleGstTypeChange,
  handleGstPercentageChange,
  handleGstAmountChange,
  handleCustomerGstChange,
  handleInterStateChange,
  summary,
  isMobile
}) => {
  return (
    <Card sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          GST & Tax Configuration
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={gstSettings.includeGst}
                  onChange={handleGstIncludeChange}
                  color="primary"
                />
              }
              label="Include GST in Bill"
            />
          </Grid>
          
          {gstSettings.includeGst && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Customer GST Number (Optional)"
                  value={gstSettings.customerGstNumber}
                  onChange={handleCustomerGstChange}
                  size={isMobile ? "small" : "medium"}
                  placeholder="24AAAAA0000A1Z5"
                  inputProps={{ maxLength: 15, style: { textTransform: 'uppercase' } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gstSettings.isInterState}
                      onChange={handleInterStateChange}
                      color="primary"
                    />
                  }
                  label="Inter-state Transaction"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>GST Type</InputLabel>
                  <Select
                    value={gstSettings.gstType}
                    onChange={handleGstTypeChange}
                    label="GST Type"
                  >
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="amount">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {gstSettings.gstType === 'percentage' ? (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="GST Percentage"
                    type="number"
                    value={gstSettings.gstPercentage}
                    onChange={handleGstPercentageChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Grid>
              ) : (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="GST Amount"
                    type="number"
                    value={gstSettings.gstAmount}
                    onChange={handleGstAmountChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: 'primary.light', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.5)' }}>
                  <Typography variant="body2" fontWeight={500} color="primary.contrastText">
                    {gstSettings.isInterState ? 
                      `Tax Breakdown: IGST (${gstSettings.gstPercentage}%) = ${gstSettings.gstPercentage}% Total` :
                      `Tax Breakdown: CGST (${gstSettings.cgstPercentage}%) + SGST (${gstSettings.sgstPercentage}%) = ${gstSettings.gstPercentage}% Total`
                    }
                  </Typography>
                  {gstSettings.customerGstNumber && (
                    <Typography variant="caption" color="primary.contrastText" display="block" sx={{ mt: 0.5 }}>
                      Customer GST: {gstSettings.customerGstNumber}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GSTSettingsSection;