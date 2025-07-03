<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
  <Grid container spacing={2}>
    {/* Insurance Company */}
    <Grid item xs={12} sm={6}>
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e2e8f0'}`,
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SecurityIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Insurance Company
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {insuranceDetails.company || 'Not specified'}
        </Typography>
      </Box>
    </Grid>

    {/* Policy Number */}
    <Grid item xs={12} sm={6}>
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e2e8f0'}`,
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AssignmentIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Policy Number
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {insuranceDetails.number || 'Not specified'}
        </Typography>
      </Box>
    </Grid>

    {/* Policy Type */}
    <Grid item xs={12} sm={6}>
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e2e8f0'}`,
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <InventoryIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Policy Type
          </Typography>
        </Box>
        {insuranceDetails.type ? (
          <Chip
            label={insuranceDetails.type}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        ) : (
          <Typography variant="body1" fontWeight={600} color="text.primary">
            Not specified
          </Typography>
        )}
      </Box>
    </Grid>

    {/* Expiry Date */}
    <Grid item xs={12} sm={6}>
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e2e8f0'}`,
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TimerIcon sx={{ fontSize: 18, color: theme.palette.warning.main, mr: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Expiry Date
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {insuranceDetails.expiry ? new Date(insuranceDetails.expiry).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'Not specified'}
        </Typography>
        {insuranceDetails.expiry && (
          <Typography variant="caption" color={
            new Date(insuranceDetails.expiry) < new Date()
              ? 'error.main'
              : new Date(insuranceDetails.expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? 'warning.main'
                : 'success.main'
          }>
            {new Date(insuranceDetails.expiry) < new Date()
              ? '⚠ Expired'
              : new Date(insuranceDetails.expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? '⚠ Expires Soon'
                : '✅ Valid'}
          </Typography>
        )}
      </Box>
    </Grid>
  </Grid>

  {/* Summary Section */}
  {(insuranceDetails.company || insuranceDetails.number) && (
    <Box sx={{
      mt: 3,
      p: 2,
      bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#eff6ff',
      borderRadius: 2,
      border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#bfdbfe'}`
    }}>
      <Typography variant="body2" color="primary" fontWeight={600} gutterBottom>
        📦 Insurance Summary
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {insuranceDetails.company && (
          <Chip
            label={`Company: ${insuranceDetails.company}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
        {insuranceDetails.type && (
          <Chip
            label={`Type: ${insuranceDetails.type}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
        {insuranceDetails.expiry && (
          <Chip
            label={`Expires: ${new Date(insuranceDetails.expiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
            size="small"
            variant="outlined"
            color={new Date(insuranceDetails.expiry) < new Date() ? 'error' : 'primary'}
          />
        )}
      </Box>
    </Box>
  )}
</CardContent>