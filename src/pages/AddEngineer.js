import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  Container,
  Avatar,
  Chip,
  ListItemText,
  Alert,
  Paper,
  Divider,
  Stack,
  Badge,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  Groups as StaffIcon,
  Circle as CircleIcon,
  Engineering as EngineerIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AddEngineer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }

  // State - Only for engineers
  const [engineers, setEngineers] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addingEngineer, setAddingEngineer] = useState(false);
  const [engineerAddError, setEngineerAddError] = useState(null);
  const [engineerAddSuccess, setEngineerAddSuccess] = useState(false);
    
  const garageToken = localStorage.getItem('token');
    
  // Updated API URLs
  const API_BASE_URL = 'https://garage-management-zi5z.onrender.com/api'; 

  const token = localStorage.getItem("token")
    ? `Bearer ${localStorage.getItem("token")}`
    : "";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff', // Default to staff for engineers
    permissions: [],
    specialization: '',
    experience: ''
  });

  // New engineer state for the new add function
  const [newEngineer, setNewEngineer] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '', // Changed from specialization to specialty to match API
    experience: '',
    role: 'staff'
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '', // Changed from contact to phone to match API
    username: '',
    enabled: true,
    permissions: [],
    specialty: '', // Changed from specialization to specialty
    experience: ''
  });

  const availableRoles = [
    { value: 'staff', label: 'Engineer', icon: <EngineerIcon />, color: '#4caf50' },
    { value: 'manager', label: 'Senior Engineer', icon: <ManagerIcon />, color: '#ff9800' },
    { value: 'admin', label: 'Lead Engineer', icon: <AdminIcon />, color: '#f44336' }
  ];

  const availablePermissions = [
    { value: 'Create Job Cards', label: 'Create Job Cards', color: '#4caf50' },
    { value: 'Manage Inventory', label: 'Manage Inventory', color: '#ff9800' },
    { value: 'Reports & Records', label: 'Reports & Records', color: '#9c27b0' },
    { value: 'Service Reminders', label: 'Service Reminders', color: '#00bcd4' },
    { value: 'Insurance', label: 'Insurance', color: '#795548' },
    { value: 'Add Engineer', label: 'Add Engineer', color: '#e91e63' }
  ];

  // Utility API Call with Authorization
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': garageToken ? `Bearer ${garageToken}` : '',
          ...options.headers
        },
        ...options
      });
      return response;
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err);
      throw err;
    }
  }, [garageToken]);

   const fetchEngineers = useCallback(async () => {
      if (!garageId) {
        return;
      }
      
      try {
        setIsLoading(true);
        const res = await apiCall(`/garage/engineers/${garageId}`, { method: 'GET' });
        const engineersData = res.data?.engineers || res.data || [];
        
        // Map engineers data to include id field
        const engineersWithId = engineersData.map(engineer => ({
          ...engineer,
          id: engineer._id,
          permissions: engineer.permissions || []
        }));
        
        setEngineers(engineersWithId);
      } catch (err) {
        console.error('Failed to fetch engineers:', err);
        setError(err.response?.data?.message || 'Failed to load engineers');
      } finally {
        setIsLoading(false);
      }
    }, [garageId, apiCall]);

  // Effects
  useEffect(() => {
    if (!garageId) navigate("/login");
    fetchEngineers();
  }, [fetchEngineers, navigate, garageId]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const filteredEngineers = useMemo(() => {
    return (Array.isArray(engineers) ? engineers : []).filter(engineer => {
      if (!engineer) return false;
      const searchLower = (searchTerm || '').toLowerCase();
      return ['name', 'username', 'email', 'specialty', 'specialization'].some(field =>
        (engineer[field] || '').toLowerCase().includes(searchLower)
      );
    });
  }, [engineers, searchTerm]);

  const validateAddForm = () => {
    if (!newEngineer.name.trim()) {
      setEngineerAddError('Name is required');
      return false;
    }
    if (!newEngineer.email.trim()) {
      setEngineerAddError('Email is required');
      return false;
    }
    if (!newEngineer.phone.trim()) {
      setEngineerAddError('Phone is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEngineer.email)) {
      setEngineerAddError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleAddOpen = () => {
    setEngineerAddError(null);
    setEngineerAddSuccess(false);
    setOpenAddDialog(true);
  };

  const handleAddClose = () => {
    handleCloseAddEngineerDialog();
  };

  const handleEditOpen = (engineer) => {
    setError('');
    setSuccess('');
    setSelectedEngineer(engineer);
    setEditFormData({
      name: engineer.name || '',
      email: engineer.email || '',
      phone: engineer.phone || engineer.contact || '', // Handle both phone and contact
      username: engineer.username || '',
      enabled: engineer.enabled !== undefined ? engineer.enabled : true,
      permissions: engineer.permissions || [],
      specialty: engineer.specialty || engineer.specialization || '', // Handle both specialty and specialization
      experience: engineer.experience || ''
    });
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
    setSelectedEngineer(null);
    setError('');
    setSuccess('');
  };

  const handleAddEngineer = async () => {
    if (!validateAddForm()) {
      return;
    }

    if (!/^\d{10}$/.test(newEngineer.phone)) {
      setEngineerAddError('Phone number must be exactly 10 digits');
      return;
    }

    setAddingEngineer(true);
    setEngineerAddError(null);

    try {
      // Fixed API endpoint to match your specification
      const response = await fetch(`${API_BASE_URL}/garage/engineers/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          name: newEngineer.name,
          email: newEngineer.email,
          phone: newEngineer.phone,
          specialty: newEngineer.specialty,
          garageId: garageId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add engineer');
      }

      await fetchEngineers();

      setEngineerAddSuccess(true);
      setTimeout(() => {
        setEngineerAddSuccess(false);
        handleCloseAddEngineerDialog();
      }, 1500);
    } catch (err) {
      console.error('Add engineer error:', err);
      setEngineerAddError(err.message || 'Failed to add engineer');
    } finally {
      setAddingEngineer(false);
    }
  };

  const handleCloseAddEngineerDialog = () => {
    setOpenAddDialog(false);
    setNewEngineer({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      experience: '',
      role: 'staff'
    });
    setEngineerAddError(null);
    setEngineerAddSuccess(false);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedEngineer?.id) {
        throw new Error('No engineer selected');
      }

      // Updated to use new API endpoint
      const response = await fetch(`${API_BASE_URL}/engineers/${selectedEngineer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update engineer');
      }

      setSuccess('Engineer updated successfully!');
      setError('');
      await fetchEngineers();
      handleEditClose();

    } catch (error) {
      console.error('Error updating engineer:', error);
      setError(error.message || 'Failed to update engineer');
      setSuccess('');
    }
  };

  const handleDelete = async (engineerId) => {
    if (!window.confirm("Are you sure you want to delete this engineer?")) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Updated to use new API endpoint
      const response = await fetch(`${API_BASE_URL}/engineers/${engineerId}`, {
        method: "DELETE",
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess('Engineer deleted successfully!');
      await fetchEngineers();
    } catch (error) {
      console.error("Error deleting engineer:", error);
      setError(error.message || 'Failed to delete engineer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    return availableRoles.find(r => r.value === role) || availableRoles[0];
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'E';
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: { xs: 0, sm: 35 },
      overflow: 'auto',
      pt: 3
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 2
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Engineer Management
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Manage your engineering team and their specializations
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<AddIcon />} 
              onClick={handleAddOpen}
              disabled={loading || addingEngineer}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                borderRadius: 2,
                px: 3
              }}
            >
              Add Engineer
            </Button>
          </Box>
        </Paper>

        {/* Error and Success Messages */}
        {(error || engineerAddError) && (
          <Fade in={!!(error || engineerAddError)}>
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => {setError(''); setEngineerAddError(null);}}>
              {error || engineerAddError}
            </Alert>
          </Fade>
        )}
        {(success || engineerAddSuccess) && (
          <Fade in={!!(success || engineerAddSuccess)}>
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => {setSuccess(''); setEngineerAddSuccess(false);}}>
              {success || (engineerAddSuccess ? 'Engineer added successfully!' : '')}
            </Alert>
          </Fade>
        )}

        {/* Search Bar */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search engineers by name, email or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Paper>

        {/* Engineers Grid */}
        <Grid container spacing={3}>
          {filteredEngineers.map((engineer, index) => {
            const roleInfo = getRoleInfo(engineer.role);
            return (
              <Grid item xs={12} sm={6} lg={4} key={engineer.id}>
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Engineer Header */}
                      <Box display="flex" alignItems="center" mb={2}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <CircleIcon 
                              sx={{ 
                                color: engineer.enabled ? '#4caf50' : '#f44336',
                                fontSize: 12
                              }} 
                            />
                          }
                        >
                          <Avatar 
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              bgcolor: roleInfo.color,
                              fontSize: '1.2rem',
                              fontWeight: 600
                            }}
                          >
                            {getInitials(engineer.name)}
                          </Avatar>
                        </Badge>
                        <Box ml={2} flex={1}>
                          <Typography variant="h6" fontWeight={600} noWrap>
                            {engineer.name || 'Unknown Engineer'}
                          </Typography>
                          <Chip 
                            icon={roleInfo.icon}
                            label={roleInfo.label}
                            size="small"
                            sx={{ 
                              bgcolor: `${roleInfo.color}20`,
                              color: roleInfo.color,
                              fontWeight: 500
                            }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Engineer Details */}
                      <Stack spacing={1.5}>
                        <Box display="flex" alignItems="center">
                          <EmailIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {engineer.email || 'No email'}
                          </Typography>
                        </Box>
                        
                        {(engineer.phone || engineer.contact) && (
                          <Box display="flex" alignItems="center">
                            <PhoneIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">
                              {engineer.phone || engineer.contact}
                            </Typography>
                          </Box>
                        )}

                        {(engineer.specialty || engineer.specialization) && (
                          <Box display="flex" alignItems="center">
                            <EngineerIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">
                              {engineer.specialty || engineer.specialization}
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" alignItems="center">
                          <SecurityIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {engineer.permissions?.length || 0} permissions
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Permissions Preview */}
                      {engineer.permissions && engineer.permissions.length > 0 && (
                        <Box mt={2}>
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Permissions:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {engineer.permissions.slice(0, 2).map((permission) => {
                              const permInfo = availablePermissions.find(p => p.value === permission);
                              return (
                                <Chip
                                  key={permission}
                                  label={permInfo?.label || permission}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    height: 24,
                                    borderColor: permInfo?.color,
                                    color: permInfo?.color
                                  }}
                                />
                              );
                            })}
                            {engineer.permissions.length > 2 && (
                              <Chip
                                label={`+${engineer.permissions.length - 2} more`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      {/* Actions */}
                      <Box display="flex" justifyContent="space-between">
                        <Tooltip title="Edit Engineer">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditOpen(engineer)}
                            sx={{ 
                              bgcolor: `${theme.palette.primary.main}20`,
                              '&:hover': { bgcolor: `${theme.palette.primary.main}30` }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Engineer">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(engineer.id)}
                            sx={{ 
                              bgcolor: `${theme.palette.error.main}20`,
                              '&:hover': { bgcolor: `${theme.palette.error.main}30` }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>

        {/* Empty State */}
        {filteredEngineers.length === 0 && !isLoading && (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              borderRadius: 2,
              mt: 4
            }}
          >
            <EngineerIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No engineers found' : 'No engineers yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start by adding your first engineer'}
            </Typography>
          </Paper>
        )}

        {/* Add Engineer Dialog - FIXED */}
        <Dialog
          open={openAddDialog}
          onClose={handleAddClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              Add New Engineer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new engineer account
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  name="name" 
                  value={newEngineer.name} 
                  onChange={(e) => setNewEngineer({...newEngineer, name: e.target.value})} 
                  required 
                  error={!newEngineer.name.trim() && newEngineer.name !== ''}
                  helperText={!newEngineer.name.trim() && newEngineer.name !== '' ? 'Name is required' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Email Address" 
                  name="email" 
                  type="email"
                  value={newEngineer.email} 
                  onChange={(e) => setNewEngineer({...newEngineer, email: e.target.value})} 
                  required 
                  error={!newEngineer.email.trim() && newEngineer.email !== ''}
                  helperText={!newEngineer.email.trim() && newEngineer.email !== '' ? 'Email is required' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Phone Number" 
                  name="phone" 
                  value={newEngineer.phone} 
                  onChange={(e) => setNewEngineer({...newEngineer, phone: e.target.value})} 
                  required
                  error={!newEngineer.phone.trim() && newEngineer.phone !== ''}
                  helperText={!newEngineer.phone.trim() && newEngineer.phone !== '' ? 'Phone is required' : 'Enter 10-digit phone number'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Specialty" 
                  name="specialty" 
                  value={newEngineer.specialty} 
                  onChange={(e) => setNewEngineer({...newEngineer, specialty: e.target.value})} 
                  placeholder="e.g., Engine Specialist, Electrical Systems, etc."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EngineerIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleAddClose} disabled={addingEngineer} size="large">
              Cancel
            </Button>
            <Button 
              onClick={handleAddEngineer} 
              variant="contained" 
              disabled={addingEngineer}
              size="large"
              sx={{ minWidth: 120 }}
            >
              {addingEngineer ? 'Adding...' : 'Add Engineer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Engineer Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={handleEditClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              Edit Engineer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update engineer information
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  name="name" 
                  value={editFormData.name} 
                  onChange={handleEditInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Email Address" 
                  name="email" 
                  type="email"
                  value={editFormData.email} 
                  onChange={handleEditInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Phone Number" 
                  name="phone" 
                  value={editFormData.phone} 
                  onChange={handleEditInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Username" 
                  name="username" 
                  value={editFormData.username} 
                  onChange={handleEditInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Specialty" 
                  name="specialty" 
                  value={editFormData.specialty} 
                  onChange={handleEditInputChange}
                  placeholder="e.g., Engine Specialist, Electrical Systems, etc."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EngineerIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Experience" 
                  name="experience" 
                  value={editFormData.experience} 
                  onChange={handleEditInputChange}
                  placeholder="e.g., 5 years, Expert level, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editFormData.enabled}
                      onChange={(e) => setEditFormData({...editFormData, enabled: e.target.checked})}
                    />
                  }
                  label="Engineer Account Enabled"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Permissions</InputLabel>
                  <Select
                    multiple
                    value={editFormData.permissions || []}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditFormData({
                        ...editFormData,
                        permissions: typeof value === 'string' ? value.split(',') : value,
                      });
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const perm = availablePermissions.find(p => p.value === value);
                          return (
                            <Chip 
                              key={value} 
                              label={perm?.label || value} 
                              size="small" 
                              sx={{ 
                                bgcolor: `${perm?.color}20`,
                                color: perm?.color
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availablePermissions.map((permission) => (
                      <MenuItem key={permission.value} value={permission.value}>
                        <Checkbox checked={editFormData.permissions?.includes(permission.value) || false} />
                        <ListItemText primary={permission.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleEditClose} disabled={loading} size="large">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              variant="contained" 
              disabled={loading}
              size="large"
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Updating...' : 'Update Engineer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AddEngineer;