import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Link,
  IconButton,
  Grid,
  Slide,
  useMediaQuery,
  useTheme,
  CssBaseline,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff, DarkMode, LightMode } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Styled components
const MainWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isMobile'
})(({ isActive, isMobile }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: '0.5s',
  flexWrap: 'wrap',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '20px' : '0',
}));

const FormSection = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isMobile'
})(({ isActive, isMobile, theme }) => ({
  width: '400px',
  padding: '30px',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  zIndex: 2,
  position: 'relative',
  transition: 'transform 0.5s ease, background-color 0.3s ease',
  transform: isActive && !isMobile ? 'translateX(-20px)' : 'translateX(0)',
  backgroundColor: theme.palette.background.paper,
  border: theme.palette.mode === 'dark' ? '1px solid #30363d' : 'none',
}));

const SubscriptionSection = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isMobile'
})(({ isActive, isMobile, theme }) => ({
  width: '400px',
  padding: '30px',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  position: isMobile ? 'relative' : isActive ? 'relative' : 'absolute',
  right: isMobile ? 'auto' : isActive ? 'auto' : 0,
  opacity: isMobile ? 1 : isActive ? 1 : 0,
  transform: isMobile ? 'scale(1)' : isActive ? 'scale(1)' : 'scale(0)',
  pointerEvents: isMobile ? 'auto' : isActive ? 'auto' : 'none',
  height: isMobile ? 'auto' : '420px',
  transition: 'transform 0.5s ease, opacity 0.5s ease, background-color 0.3s ease',
  marginLeft: isMobile ? 0 : isActive ? '40px' : 0,
  backgroundColor: theme.palette.background.paper,
  border: theme.palette.mode === 'dark' ? '1px solid #30363d' : 'none',
}));

const PlanCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isBlur'
})(({ isSelected, isBlur, theme }) => ({
  padding: '15px',
  border: isSelected 
    ? `2px solid ${theme.palette.mode === 'dark' ? '#3b82f6' : '#4f46e5'}`
    : `2px solid ${theme.palette.mode === 'dark' ? '#404040' : '#ccc'}`,
  borderRadius: '8px',
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  background: isSelected 
    ? theme.palette.mode === 'dark' ? '#1e3a8a' : '#dfe7ff'
    : theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff',
  transition: 'all 0.4s ease',
  minHeight: '100px',
  filter: isBlur ? 'blur(3px)' : 'none',
  opacity: isBlur ? 0.6 : 1,
  transform: isBlur ? 'scale(0.95)' : isSelected ? 'scale(1)' : 'scale(1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 12px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(79, 70, 229, 0.4)'}`,
    backgroundColor: theme.palette.mode === 'dark' ? '#1e3a8a' : '#f0f4ff',
  },
}));

const SelectedPlanDisplay = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})(({ isVisible, theme }) => ({
  background: theme.palette.mode === 'dark' ? '#1e3a8a' : '#dce3fa',
  border: `2px dotted ${theme.palette.mode === 'dark' ? '#3b82f6' : '#4f46e5'}`,
  borderRadius: '10px',
  padding: '10px 15px',
  marginTop: 0,
  marginBottom: '20px',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
  transition: 'all 0.5s ease',
  display: isVisible ? 'block' : 'none',
  position: 'relative',
  color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#001a66',
  textAlign: 'center',
  height: 'auto',
  minHeight: '60px',
}));

// Main component
function SignUpPage({ darkMode, toggleDarkMode }) {
  const theme = useTheme();
  const [showSubscription, setShowSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');
  const navigate = useNavigate();
  
  const plans = [
    { name: 'Basic', price: 'Free' },
    { name: 'Standard', price: '$9.99/mo' },
    { name: 'Premium', price: '$19.99/mo' }
  ];

  const handleShowSubscription = () => {
    setShowSubscription(true);
  };

  const handleHideSubscription = () => {
    setShowSubscription(false);
  };

  const handleCancelPlan = () => {
    setSelectedPlan(null);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      setShowSubscription(false);
    }, 300);
  };

  const handlePlanMouseOver = (plan) => {
    setHoveredPlan(plan);
  };

  const handlePlanMouseOut = () => {
    setHoveredPlan(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <CssBaseline />
      <Container 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          background: theme.palette.mode === 'dark' ? '#121212' : '#f0f2f5',
          transition: 'background-color 0.3s ease',
          position: 'relative'
        }}
      >
        {/* Theme Toggle Button */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20,
            display: 'flex',
            alignItems: 'center',
            zIndex: 1100
          }}
        >
          <IconButton 
            onClick={toggleDarkMode} 
            sx={{
              color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#08197B',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
            aria-label="toggle dark mode"
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>

        <MainWrapper isActive={showSubscription} isMobile={isMobile}>
          <FormSection isActive={showSubscription} isMobile={isMobile}>
            <Typography 
              variant="h5" 
              component="h2" 
              align="center" 
              sx={{ 
                color: theme.palette.mode === 'dark' ? '#a0c2ff' : '#001a66',
                mb: 2,
                fontWeight: 600
              }}
            >
              Create Account
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                id="fullname"
                placeholder="Your Name"
                InputLabelProps={{
                  sx: { 
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' 
                  }
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : '#F3F3F3',
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(0, 0, 0, 0.1)'
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? '#a0c2ff' 
                        : '#001a66'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? '#a0c2ff' 
                        : '#001a66'
                    }
                  }
                }}
              />
              
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                id="email"
                type="email"
                placeholder="Your Email"
                InputLabelProps={{
                  sx: { 
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' 
                  }
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : '#F3F3F3',
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(0, 0, 0, 0.1)'
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? '#a0c2ff' 
                        : '#001a66'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? '#a0c2ff' 
                        : '#001a66'
                    }
                  }
                }}
              />
              
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                margin="normal"
                required
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your Password"
                InputLabelProps={{
                  sx: { 
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' 
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{
                          color: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.7)' 
                            : 'rgba(0, 0, 0, 0.54)'
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : '#F3F3F3',
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(0, 0, 0, 0.1)'
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? '#a0c2ff' 
                        : '#001a66'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? '#a0c2ff' 
                        : '#001a66'
                    }
                  }
                }}
              />
              
              <SelectedPlanDisplay isVisible={!!selectedPlan}>
                <Typography 
                  variant="subtitle1" 
                  component="span"
                  sx={{ color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#001a66' }}
                >
                  {selectedPlan ? selectedPlan.name : 'No Plan Selected'}
                </Typography>
                <Typography 
                  variant="h6" 
                  component="strong" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#fcd34d' : '#fbbf24' 
                  }}
                >
                  {selectedPlan ? selectedPlan.price : ''}
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    bgcolor: theme.palette.mode === 'dark' ? '#ff6b6b' : '#ff4d4d',
                    color: 'white',
                    width: '26px',
                    height: '26px',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? '#ff8585' : '#ff6666',
                      transform: 'rotate(90deg) scale(1.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={handleCancelPlan}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </SelectedPlanDisplay>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleShowSubscription}
                sx={{ 
                  mb: 2, 
                  mt: 2,
                  height: 48,
                  backgroundColor: theme.palette.mode === 'dark' ? '#1a56db' : '#001a66',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#2563eb' : '#0d2b8c',
                  },
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Choose Subscription
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ 
                  mb: 2,
                  height: 48,
                  backgroundColor: theme.palette.mode === 'dark' ? '#1a56db' : '#001a66',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#2563eb' : '#0d2b8c',
                  },
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Sign Up
              </Button>
              
              <Box textAlign="center" mt={2}>
                <Typography 
                  variant="body2"
                  sx={{ color: theme.palette.mode === 'dark' ? '#e0e0e0' : 'inherit' }}
                >
                  Already have an account?{' '}
                  <Link 
                    component="button"
                    onClick={() => navigate('/login')} 
                    sx={{ 
                      fontWeight: 'bold',
                      color: theme.palette.mode === 'dark' ? '#a0c2ff' : '#001a66',
                      textDecoration: 'none',
                      '&:hover': {
                        color: theme.palette.mode === 'dark' ? '#3b82f6' : '#0d2b8c',
                        textDecoration: 'underline'
                      } 
                    }}
                  >
                    Login
                  </Link>
                </Typography>
              </Box>
            </Box>
          </FormSection>
          
          <Slide direction="left" in={showSubscription} mountOnEnter unmountOnExit={!isMobile}>
            <SubscriptionSection isActive={showSubscription} isMobile={isMobile}>
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  bgcolor: theme.palette.mode === 'dark' ? '#ff6b6b' : '#ff4d4d',
                  color: 'white',
                  width: '26px',
                  height: '26px',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? '#ff8585' : '#ff6666',
                    transform: 'rotate(90deg) scale(1.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={handleHideSubscription}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              
              <Typography 
                variant="h5" 
                component="h2" 
                align="center" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#a0c2ff' : '#001a66',
                  mb: 2,
                  fontWeight: 600  
                }}
              >
                Choose Plan
              </Typography>
              
              <Box mt={2}>
                <Grid container spacing={2} direction="column">
                  {plans.map((plan) => (
                    <Grid item key={plan.name}>
                      <PlanCard
                        isSelected={selectedPlan && selectedPlan.name === plan.name}
                        isBlur={hoveredPlan && hoveredPlan.name !== plan.name}
                        onClick={() => handleSelectPlan(plan)}
                        onMouseOver={() => handlePlanMouseOver(plan)}
                        onMouseOut={handlePlanMouseOut}
                      >
                        <CardContent sx={{ p: 1, textAlign: 'center', width: '100%' }}>
                          <Typography 
                            sx={{
                              fontSize: '16px',
                              color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#001a66',
                              textAlign: 'center',
                              display: 'block',
                            }}
                          >
                            {plan.name}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '24px',
                              color: theme.palette.mode === 'dark' ? '#fcd34d' : '#fbbf24',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              display: 'block',
                              marginTop: '10px',
                            }}
                          >
                            {plan.price}
                          </Typography>
                        </CardContent>
                      </PlanCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </SubscriptionSection>
          </Slide>
        </MainWrapper>
      </Container>
    </>
  );
}

export default SignUpPage;