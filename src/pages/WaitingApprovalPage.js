import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  useTheme
} from '@mui/material';
import { CheckCircleOutline, Email, Home } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

export default function WaitingApprovalPage() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data passed from signup page
  const { garageName, email, planName } = location.state || {};

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff'
        }}
      >
        {/* Success Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress
              size={80}
              thickness={2}
              sx={{
                color: theme.palette.primary.main,
                animationDuration: '2s'
              }}
            />
            <CheckCircleOutline
              sx={{
                position: 'absolute',
                fontSize: 40,
                color: theme.palette.success.main
              }}
            />
          </Box>
        </Box>

        {/* Main Message */}
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          Account Created Successfully!
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Waiting for Admin Approval
        </Typography>

        {/* Details */}
        {garageName && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Garage Name:</strong> {garageName}
            </Typography>
            {email && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {email}
              </Typography>
            )}
            {planName && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Selected Plan:</strong> {planName}
              </Typography>
            )}
          </Box>
        )}

        {/* Information Box */}
        <Box
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? '#263238' : '#f5f5f5',
            p: 3,
            borderRadius: 2,
            mb: 3,
            border: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your garage account has been created and is currently under review.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Our admin team will review your application and approve it within 24-48 hours.
            You will receive an email notification once your account is approved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please check your email regularly for updates.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={() => window.open('mailto:' + (email || 'support@example.com'))}
          >
            Check Email
          </Button> */}
          
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{ minWidth: '120px' }}
          >
            Go to Home
          </Button>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: theme.palette.divider }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team
          </Typography>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
            support@garagemanagement.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}