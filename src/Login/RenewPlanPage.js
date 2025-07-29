// RenewPlanPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  CssBaseline,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const RenewPlanPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Extract data from navigation state
  const {
    garageId,
    garageName = 'Your Garage',
    garageEmail,
    message = 'Your subscription has expired. Please renew your plan.',
  } = state || {};

  // Log the values
  console.log('RenewPlanPage:', { garageId, garageName, garageEmail, message });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('64f8a1b2c3d4e5f678901235'); // default plan id

  const BASE_URL = 'https://garage-management-zi5z.onrender.com';

  // Theme colors
  const colors = {
    primary: '#08197B',
    secondary: '#364ab8',
    accent: '#2196F3',
  };

  // Validate required data on mount
  useEffect(() => {
    if (!state || !garageId) {
      setError('Access denied. Please log in again.');
    }
  }, [state, garageId]);

  // Fetch all plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      setFetchingPlans(true);
      try {
        const response = await fetch(`${BASE_URL}/api/plans/all`);
        const data = await response.json();
        // The API returns { success: true, data: [...] }
        const plansArr = data?.data || [];
        setPlans(plansArr);
        if (Array.isArray(plansArr) && plansArr.length > 0) {
          setSelectedPlanId(plansArr[0]._id); // select first plan by default
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setFetchingPlans(false);
      }
    };
    fetchPlans();
  }, [BASE_URL]);

  // Step 1: Create Renewal Order
  const handleCreateOrder = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!garageId) {
      setError('Garage ID is missing. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/plans/renew`,
        {
          garageId,
          planId: selectedPlanId, // use selected plan
          paymentMethod: 'razorpay',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const { orderId } = response.data;
      setOrderId(orderId);
      setSuccess('Order created successfully! Proceed to payment.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create renewal order.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Simulate Payment & Complete Renewal
  const handleCompleteRenewal = async () => {
    setError('');
    setLoading(true);

    // Simulate Razorpay payment IDs
    const mockPaymentId = 'pay_mock_' + Math.random().toString(36).substr(2, 9);
    const mockSignature = 'mock_signature_' + Math.random().toString(36).substr(2, 12);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/plans/complete-renewal`,
        {
          garageId,
          planId: '64f8a1b2c3d4e5f678901235',
          orderId,
          paymentId: mockPaymentId,
          signature: mockSignature,
          paymentMethod: 'razorpay',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      setSuccess(response.data.message || 'Subscription renewed successfully!');
      setCompleted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate Razorpay checkout
  const handlePayment = () => {
    if (!orderId) return;
    setTimeout(() => {
      handleCompleteRenewal();
    }, 2000);
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
          backgroundColor: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${colors.primary}25 0%, ${colors.accent}15 100%)`
            : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}10 100%)`,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ mb: 2, fontWeight: 700, color: colors.primary }}
            >
              🔁 Renew Subscription
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
              {message}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            {/* Display Garage Info */}
            <List sx={{ mb: 3, textAlign: 'left' }}>
              <ListItem>
                <ListItemIcon>
                  <strong>🆔</strong>
                </ListItemIcon>
                <ListItemText primary="Garage ID" secondary={garageId || 'Not available'} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <strong>🏢</strong>
                </ListItemIcon>
                <ListItemText primary="Garage Name" secondary={garageName} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <strong>📧</strong>
                </ListItemIcon>
                <ListItemText primary="Email" secondary={garageEmail} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <strong>📋</strong>
                </ListItemIcon>
                <ListItemText primary="Plan" secondary="Standard Monthly Plan" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <strong>💰</strong>
                </ListItemIcon>
                <ListItemText primary="Amount" secondary="₹999/month" />
              </ListItem>
            </List>

            {/* Plan selection */}
            {fetchingPlans ? (
              <Box sx={{ mb: 3 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>Loading plans...</Typography>
              </Box>
            ) : (
              plans.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Select a Plan
                  </Typography>
                  <List>
                    {plans.map(plan => (
                      <ListItem
                        key={plan._id}
                        button
                        selected={selectedPlanId === plan._id}
                        onClick={() => setSelectedPlanId(plan._id)}
                        sx={{
                          border: selectedPlanId === plan._id ? `2px solid ${colors.primary}` : '1px solid #eee',
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: selectedPlanId === plan._id ? `${colors.primary}10` : 'transparent'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {plan.name}
                              </Typography>
                              {plan.popular && (
                                <Box
                                  component="span"
                                  sx={{
                                    ml: 1,
                                    px: 1,
                                    py: 0.2,
                                    background: '#ffe082',
                                    color: '#b28704',
                                    borderRadius: 1,
                                    fontSize: '0.8em',
                                    fontWeight: 700,
                                  }}
                                >
                                  Popular
                                </Box>
                              )}
                              <Typography variant="body2" sx={{ ml: 2 }}>
                                ₹{plan.amount}/{plan.durationInMonths > 1 ? `${plan.durationInMonths} months` : 'month'}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              {plan.features && plan.features.length > 0 && (
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                  {plan.features.map((f, idx) => (
                                    <li key={idx} style={{ fontSize: 13 }}>{f}</li>
                                  ))}
                                </ul>
                              )}
                              {plan.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {plan.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  {/* Show selected plan summary */}
                  {plans.find(p => p._id === selectedPlanId) && (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      Selected Plan: <strong>{plans.find(p => p._id === selectedPlanId).name}</strong> - ₹
                      {plans.find(p => p._id === selectedPlanId).amount}/
                      {plans.find(p => p._id === selectedPlanId).durationInMonths > 1
                        ? `${plans.find(p => p._id === selectedPlanId).durationInMonths} months`
                        : 'month'}
                    </Alert>
                  )}
                </Box>
              )
            )}

            <Divider sx={{ my: 3 }} />

            {!state ? (
              // Safety fallback
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                fullWidth
                sx={{
                  height: 48,
                  fontWeight: 600,
                  borderRadius: 2,
                  backgroundColor: '#9c27b0',
                  '&:hover': { backgroundColor: '#7b1fa2' },
                }}
              >
                Go to Login
              </Button>
            ) : !orderId ? (
              <Button
                variant="contained"
                onClick={handleCreateOrder}
                disabled={loading}
                fullWidth
                sx={{
                  height: 48,
                  fontWeight: 600,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
                  '&:hover': { backgroundColor: colors.secondary },
                  '&:disabled': { opacity: 0.7 },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Renewal Order'}
              </Button>
            ) : !completed ? (
              <Button
                variant="contained"
                onClick={handlePayment}
                disabled={loading}
                fullWidth
                sx={{
                  height: 48,
                  fontWeight: 600,
                  borderRadius: 2,
                  backgroundColor: colors.accent,
                  '&:hover': { backgroundColor: '#1976D2' },
                  '&:disabled': { opacity: 0.7 },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay Now (Razorpay)'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                fullWidth
                sx={{
                  height: 48,
                  fontWeight: 600,
                  borderRadius: 2,
                  backgroundColor: '#2E7D32',
                  '&:hover': { backgroundColor: '#1B5E20' },
                }}
              >
                Go to Dashboard
              </Button>
            )}

            {orderId && !completed && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Order ID: <strong>{orderId}</strong>
              </Typography>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default RenewPlanPage;