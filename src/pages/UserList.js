import React, { useState, useEffect, useMemo } from 'react';
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
  Circle as CircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  let garageId = localStorage.getItem("garageId");
  if (!garageId) {
    garageId = localStorage.getItem("garage_id");
  }

  // State
  const [users, setUsers] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem("token")
    ? `Bearer ${localStorage.getItem("token")}`
    : "";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    permissions: []
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    contact: '',
    username: '',
    enabled: true,
    permissions: []
  });

  const availableRoles = [
    { value: 'admin', label: 'Administrator', icon: <AdminIcon />, color: '#f44336' },
    { value: 'manager', label: 'Manager', icon: <ManagerIcon />, color: '#ff9800' },
    { value: 'staff', label: 'Staff', icon: <StaffIcon />, color: '#4caf50' }
  ];

  const availablePermissions = [
    // { value: 'Dashboard', label: 'Dashboard', color: '#2196f3' },
    { value: 'Create Job Cards', label: 'Create Job Cards', color: '#4caf50' },
    { value: 'Manage Inventory', label: 'Manage Inventory', color: '#ff9800' },
    { value: 'Reports & Records', label: 'Reports & Records', color: '#9c27b0' },
    { value: 'Service Reminders', label: 'Service Reminders', color: '#00bcd4' },
    { value: 'Insurance', label: 'Insurance', color: '#795548' },
    { value: 'Add Engineer', label: 'Add Engineer', color: '#e91e63' }
  ];

  // Effects
  useEffect(() => {
    if (!garageId) navigate("/login");
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/getusersbygarage', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const usersWithId = data.map(user => ({
        ...user,
        id: user._id,
        permissions: user.permissions || []
      }));
      setUsers(usersWithId);
    } catch (error) {
      // console.error('Error fetching users:', error);
      // setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return (Array.isArray(users) ? users : []).filter(user => {
      if (!user) return false;
      const searchLower = (searchTerm || '').toLowerCase();
      return ['name', 'username', 'email'].some(field =>
        (user[field] || '').toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchTerm]);

  const validateAddForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleAddOpen = () => {
    setError('');
    setSuccess('');
    setOpenAddDialog(true);
  };

  const handleAddClose = () => {
    setOpenAddDialog(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'manager',
      permissions: []
    });
    setError('');
    setSuccess('');
  };

  const handleEditOpen = (user) => {
    setError('');
    setSuccess('');
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      contact: user.contact || '',
      username: user.username || '',
      enabled: user.enabled !== undefined ? user.enabled : true,
      permissions: user.permissions || []
    });
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    if (!validateAddForm()) return;

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        permissions: formData.permissions || []
      };

      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/create-user', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess('User created successfully!');
      await fetchUsers();
      handleAddClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedUser?.id) {
        throw new Error('No user selected');
      }

      let garageId = localStorage.getItem("garageId");
      if (!garageId) {
        garageId = localStorage.getItem("garage_id");
      }

      if (!garageId) {
        throw new Error('Garage ID not found. Please log in again.');
      }

      const response = await fetch(`https://garage-management-zi5z.onrender.com/api/garage/update-permissions/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: editFormData.permissions,
          garageId: garageId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user permissions');
      }

      setSuccess('User permissions updated successfully!');
      setError('');
      await fetchUsers();
      handleEditClose();

    } catch (error) {
      console.error('Error updating user permissions:', error);
      setError(error.message || 'Failed to update user permissions');
      setSuccess('');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`https://garage-management-zi5z.onrender.com/api/garage/delete-user/${userId}`, {
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

      setSuccess('User deleted successfully!');
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message || 'Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    return availableRoles.find(r => r.value === role) || availableRoles[1];
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
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
                User Management
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Manage your team members and their permissions
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<AddIcon />} 
              onClick={handleAddOpen}
              disabled={loading}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                borderRadius: 2,
                px: 3
              }}
            >
              Add User
            </Button>
          </Box>
        </Paper>

        {/* Error and Success Messages */}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Fade>
        )}

        {/* Search Bar */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, username or email..."
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

        {/* Users Grid */}
        <Grid container spacing={3}>
          {filteredUsers.map((user, index) => {
            const roleInfo = getRoleInfo(user.role);
            return (
              <Grid item xs={12} sm={6} lg={4} key={user.id}>
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
                      {/* User Header */}
                      <Box display="flex" alignItems="center" mb={2}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <CircleIcon 
                              sx={{ 
                                color: user.enabled ? '#4caf50' : '#f44336',
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
                            {getInitials(user.name)}
                          </Avatar>
                        </Badge>
                        <Box ml={2} flex={1}>
                          <Typography variant="h6" fontWeight={600} noWrap>
                            {user.name || 'Unknown User'}
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

                      {/* User Details */}
                      <Stack spacing={1.5}>
                        <Box display="flex" alignItems="center">
                          <EmailIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {user.email || 'No email'}
                          </Typography>
                        </Box>
                        
                        {user.contact && (
                          <Box display="flex" alignItems="center">
                            <PhoneIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">
                              {user.contact}
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" alignItems="center">
                          <SecurityIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {user.permissions?.length || 0} permissions
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Permissions Preview */}
                      {user.permissions && user.permissions.length > 0 && (
                        <Box mt={2}>
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Permissions:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {user.permissions.slice(0, 2).map((permission) => {
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
                            {user.permissions.length > 2 && (
                              <Chip
                                label={`+${user.permissions.length - 2} more`}
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
                        <Tooltip title="Edit User">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditOpen(user)}
                            sx={{ 
                              bgcolor: `${theme.palette.primary.main}20`,
                              '&:hover': { bgcolor: `${theme.palette.primary.main}30` }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete User">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(user.id)}
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
        {filteredUsers.length === 0 && !loading && (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              borderRadius: 2,
              mt: 4
            }}
          >
            <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No users found' : 'No users yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start by adding your first team member'}
            </Typography>
          </Paper>
        )}

        {/* Add User Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={handleAddClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1,  }}>
            <Typography variant="h5" fontWeight={600}>
              Add New User
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new team member account
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2, mt:2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ pt: 2, mt:2 }}>
                <TextField 
                
                  fullWidth 
                  label="Full Name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  error={!formData.name.trim() && formData.name !== ''}
                  helperText={!formData.name.trim() && formData.name !== '' ? 'Name is required' : ''}
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
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  error={!formData.email.trim() && formData.email !== ''}
                  helperText={!formData.email.trim() && formData.email !== '' ? 'Email is required' : ''}
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
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  error={!formData.password.trim() && formData.password !== ''}
                  helperText={!formData.password.trim() && formData.password !== '' ? 'Password is required' : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    label="Role"
                  >
                    {availableRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Box display="flex" alignItems="center">
                          {role.icon}
                          <Box ml={1}>{role.label}</Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Permissions</InputLabel>
                  <Select
                    multiple
                    value={formData.permissions || []}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
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
                        <Checkbox checked={(formData.permissions || []).indexOf(permission.value) > -1} />
                        <ListItemText primary={permission.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleAddClose} disabled={loading} size="large">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={loading}
              size="large"
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
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
              Edit User
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update user information and permissions
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
                  required
                  error={!editFormData.name.trim() && editFormData.name !== ''}
                  helperText={!editFormData.name.trim() && editFormData.name !== '' ? 'Name is required' : ''}
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
                  value={editFormData.email} 
                  onChange={handleEditInputChange}
                  required
                  error={!editFormData.email.trim() && editFormData.email !== ''}
                  helperText={!editFormData.email.trim() && editFormData.email !== '' ? 'Email is required' : ''}
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
                  label="Contact Number" 
                  name="contact" 
                  value={editFormData.contact} 
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editFormData.enabled}
                      onChange={(e) => setEditFormData({...editFormData, enabled: e.target.checked})}
                    />
                  }
                  label="User Account Enabled"
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
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserManagement;