import React, { useState, useEffect } from 'react';
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
    alpha,
    useMediaQuery,
    Chip,
    ListItemText
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    Devices as DevicesIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { green, red, orange } from '@mui/material/colors';
// import Swal from 'sweetalert2';

import { useThemeContext } from "../Layout/ThemeContext";

const StyledCard = styled(Card)(({ theme }) => ({
    margin: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
}));

const HeaderCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    background: theme.palette.mode === 'dark'
    ? `linear-gradient(45deg, ${alpha(theme.palette.primary.dark, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.6)} 100%)`
    : `linear-gradient(45deg, #e0e0e0 0%, #f5f5f5 100%)`, // Softer light background
    padding: theme.spacing(2),
}));

// Action button for mobile view
const ActionButton = styled(Button)(({ theme }) => ({
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.75rem',
        padding: '4px 8px',
    },
}));

const UserManagement = () => {
    const { darkMode } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [users, setUsers] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openSiteDialog, setOpenSiteDialog] = useState(false);
    const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(false);
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [sites, setSites] = useState([]);
    const [devices, setDevices] = useState([]);
    const [selectedSites, setSelectedSites] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');


    const token = localStorage.getItem("token") 
  ? `Bearer ${localStorage.getItem("token")}` 
  : "";

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'manager', // default role
        permissions: [] // Fixed: Initialize as empty array
    });

    const availableRoles = [
        { value: 'admin', label: 'Administrator' },
        { value: 'manager', label: 'Manager' },
        { value: 'staff', label: 'Staff' }
    ];

    const availablePermissions = [
        { value: 'Dashboard', label: 'Dashboard' },
        { value: 'Create Job Cards', label: 'Create Job Cards' },
        { value: 'Manage Inventory', label: 'Manage Inventory' },
        { value: 'Reports & Records', label: 'Reports & Records' },
         { value: 'Service Reminders', label: 'Service Reminders' },
          { value: 'Insurance', label: 'Insurance' },
        // Add more permissions as needed
    ];

    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        contact: '',
        username: '',
        enabled: true,
        permissions: [] // Fixed: Initialize as empty array
    });

    const [passwordForm, setPasswordForm] = useState({
        editadmin: '',
        newpass: '',
        repass: ''
    });

    // Responsive columns for DataGrid
    const getColumns = () => {
        const baseColumns = [
            {
                field: 'id',
                headerName: 'ID',
                width: isMobile ? 60 : 100,
                flex: isMobile ? 0 : 0.5
            },
            {
                field: 'username',
                headerName: 'Username',
                width: 150,
                flex: 1
            },
            {
                field: 'name',
                headerName: 'Name',
                width: 150,
                flex: 1,
                hide: isMobile
            },
            {
                field: 'email',
                headerName: 'Email',
                width: 200,
                flex: 1.5,
                hide: isMobile
            },
            {
                field: 'contact',
                headerName: 'Contact',
                width: 150,
                flex: 1,
                hide: isMobile && isTablet
            },
            {
                field: 'actions',
                headerName: 'Actions',
                width: isMobile ? 100 : 400,
                flex: isMobile ? 0.8 : 2,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{
                        display: 'flex',
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                        gap: 0.5
                    }}>
                        {isMobile ? (
                            // Compact mobile layout
                            <>
                                <IconButton
                                    color="primary"
                                    onClick={() => handleEditOpen(params.row)}
                                    size="small"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    color="error"
                                    onClick={() => handleDelete(params.row._id)}
                                    size="small"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    color="info"
                                    onClick={(e) => {
                                        setSelectedUser(params.row);
                                        setActionMenuAnchor(e.currentTarget);
                                        setOpenActionMenu(true);
                                    }}
                                    size="small"
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </>
                        ) : (
                            // Full desktop layout
                            <>
                                <IconButton
                                    color="primary"
                                    onClick={() => handleEditOpen(params.row)}
                                    size="small"
                                    sx={{ mr: 0.5 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    color="error"
                                    onClick={() => handleDelete(params.row.id)}
                                    size="small"
                                    sx={{ mr: 0.5 }}
                                >
                                    <DeleteIcon />
                                    
                                </IconButton>

                                {/* <IconButton
                                    color="warning"
                                    onClick={() => handlePasswordOpen(params.row)}
                                    size="small"
                                    sx={{ mr: 0.5 }}
                                >
                                    <LockIcon />
                                </IconButton> */}
                            </>
                        )}
                    </Box>
                ),
            },
        ];

        return baseColumns;
    };

    // Function to render mobile action menu
    const renderMobileActionMenu = () => {
        // This would be implemented using MUI Menu if importing it
        // For now, we'll use a Dialog as a replacement
        return (
            <Dialog
                open={openActionMenu}
                onClose={() => setOpenActionMenu(false)}
                PaperProps={{
                    sx: { width: '80%', maxWidth: '300px', p: 1 }
                }}
            >
                <DialogTitle sx={{ p: 2 }}>Actions</DialogTitle>
                <DialogContent sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {selectedUser?.enabled ? (
                            <ActionButton
                                color="error"
                                onClick={() => {
                                    handleDeactivate(selectedUser.id);
                                    setOpenActionMenu(false);
                                }}
                                variant="outlined"
                                startIcon={<CloseIcon />}
                                fullWidth
                            >
                                Deactivate
                            </ActionButton>
                        ) : (
                            <ActionButton
                                color="success"
                                onClick={() => {
                                    handleActivate(selectedUser.id);
                                    setOpenActionMenu(false);
                                }}
                                variant="outlined"
                                startIcon={<CheckIcon />}
                                fullWidth
                            >
                                Activate
                            </ActionButton>
                        )}
                        <ActionButton
                            color="info"
                            onClick={() => {
                                handleAssignSiteOpen(selectedUser);
                                setOpenActionMenu(false);
                            }}
                            variant="outlined"
                            startIcon={<BusinessIcon />}
                            fullWidth
                        >
                            Assign Sites
                        </ActionButton>
                        <ActionButton
                            color="info"
                            onClick={() => {
                                handleAssignDeviceOpen(selectedUser);
                                setOpenActionMenu(false);
                            }}
                            variant="outlined"
                            startIcon={<DevicesIcon />}
                            fullWidth
                        >
                            Assign Devices
                        </ActionButton>
                        <ActionButton
                            color="warning"
                            onClick={() => {
                                handlePasswordOpen(selectedUser);
                                setOpenActionMenu(false);
                            }}
                            variant="outlined"
                            startIcon={<LockIcon />}
                            fullWidth
                        >
                            Change Password
                        </ActionButton>
                    </Box>
                </DialogContent>
            </Dialog>
        );
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYXJhZ2VJZCI6IjY4MWU0NDZjMzk3MzMyYmY0MjE1MTdiZSIsImlhdCI6MTc0Nzk5MDY3NywiZXhwIjoxNzQ4NTk1NDc3fQ.ZhG48y8wkgsBt2qrQiJpCZtYjeDi6at1U_uetK8CbL4`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Add id field to each user object and ensure permissions exists
            const usersWithId = data.map(user => ({
                ...user,
                id: user._id, // Use the _id as id
                permissions: user.permissions || [] // Ensure permissions is an array
            }));
            setUsers(usersWithId);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    const filteredUsers = (Array.isArray(users) ? users : [])
        .filter(user => {
            if (!user) return false;
            const searchLower = (searchTerm || '').toLowerCase();
            return [
                user.name,
                user.username,
                user.email
            ].some(field =>
                (field || '').toLowerCase().includes(searchLower)
            );
        });
    const fetchSites = async (userId) => {
        // Implement API call here
        // For now, using mock data
        setSites([
            { siteId: 1, siteName: 'Main Office' },
            { siteId: 2, siteName: 'Branch A' },
            { siteId: 3, siteName: 'Branch B' },
        ]);
        setSelectedSites([1]); // Mocked assigned sites
    };

   

    function ErrorBoundary({ children }) {
        const [hasError, setHasError] = useState(false);

        // useEffect(() => {
        //     const errorHandler = (error) => {
        //         console.error('Error caught:', error);
        //         setHasError(true);
        //     };
        //     window.addEventListener('error', errorHandler);
        //     return () => window.removeEventListener('error', errorHandler);
        // }, []);

        if (hasError) return <div>Something went wrong.</div>;
        return children;
    }

    const fetchDevices = async (userId) => {
        // Implement API call here
        // For now, using mock data
        setDevices([
            { id: 1, devicename: 'Device A' },
            { id: 2, devicename: 'Device B' },
            { id: 3, devicename: 'Device C' },
        ]);
        setSelectedDevices([1]); // Mocked assigned devices
    };

    const handleAddOpen = () => {
        setOpenAddDialog(true);
    };

    const handleAddClose = () => {
        setOpenAddDialog(false);
        // Fixed: Reset formData with permissions array included
        setFormData({
            name: '',
            email: '',
            contact: '',
            username: '',
            password: '',
            role: 'manager',
            enabled: true,
            permissions: [] // Fixed: Include permissions array
        });
    };

    const handleEditOpen = (user) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            contact: user.contact,
            username: user.username,
            enabled: user.enabled,
            permissions: user.permissions || [] // Ensure permissions is an array
        });
        setOpenEditDialog(true);
    };

    const handleEditClose = () => {
        setOpenEditDialog(false);
        setSelectedUser(null);
    };

    const handlePasswordOpen = (user) => {
        setSelectedUserId(user.id);
        setSelectedUser(user);
        setOpenPasswordDialog(true);
    };

    const handlePasswordClose = () => {
        setOpenPasswordDialog(false);
        setPasswordForm({
            editadmin: '',
            newpass: '',
            repass: ''
        });
        setSelectedUserId(null);
    };

    const handleAssignSiteOpen = (user) => {
        setSelectedUserId(user.id);
        setSelectedUser(user);
        fetchSites(user.id);
        setOpenSiteDialog(true);
    };

    const handleAssignSiteClose = () => {
        setOpenSiteDialog(false);
        setSelectedSites([]);
        setSelectedUserId(null);
    };

    const handleAssignDeviceOpen = (user) => {
        setSelectedUserId(user.id);
        setSelectedUser(user);
        fetchDevices(user.id);
        setOpenDeviceDialog(true);
    };

    const handleAssignDeviceClose = () => {
        setOpenDeviceDialog(false);
        setSelectedDevices([]);
        setSelectedUserId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({
            ...passwordForm,
            [name]: value
        });
    };

    const handleSiteChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedSites(typeof value === 'string' ? value.split(',') : value);
    };

    const handleDeviceChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedDevices(typeof value === 'string' ? value.split(',') : value);
    };



    const handleSubmit = async () => {
        try {
            const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/create-user', {
                method: 'POST',
                headers: {
                    'Authorization': token, // Your Bearer token
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    permissions: formData.permissions
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            const data = await response.json();
            console.log('User created successfully:', data);

            // Refresh the users list
            fetchUsers();

            // Close the dialog
            handleAddClose();

            // Optionally show a success message (e.g., using a toast or alert)
            // alert('User created successfully!');
        } catch (error) {
            console.error('Error creating user:', error);
            // Optionally show an error message
            // alert(error.message || 'Failed to create user');
        }
    };

    const handleUpdate = async () => {
        try {
            if (!selectedUser?.id) {
                throw new Error('No user selected');
            }

            const response = await fetch(`https://garage-management-zi5z.onrender.com/api/garage/update-permissions/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    permissions: editFormData.permissions
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user permissions');
            }

            const data = await response.json();
            console.log('User permissions updated successfully:', data);

            // Refresh the users list
            fetchUsers();
            handleEditClose();

            // Optionally show success message
            // setSuccessMessage('User permissions updated successfully!');
        } catch (error) {
            console.error('Error updating user permissions:', error);
            // Optionally show error message to user
            // setErrorMessage(error.message || 'Failed to update user permissions');
        }
    };

    const handlePasswordUpdate = async () => {
        // Implement password update logic here
        console.log('Updating password:', passwordForm);
        // Mock successful password update
        handlePasswordClose();
    };

    const handleAssignSites = async () => {
        // Implement site assignment logic here
        console.log('Assigning sites:', selectedSites);
        // Mock successful site assignment
        handleAssignSiteClose();
    };

    const handleAssignDevices = async () => {
        // Implement device assignment logic here
        console.log('Assigning devices:', selectedDevices);
        // Mock successful device assignment
        handleAssignDeviceClose();
    };
const handleDelete = async (userId) => {
  if (!window.confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
  

    const response = await fetch(
      `https://garage-management-zi5z.onrender.com/api/garage/delete-user/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete user");
    }

    // Successfully deleted
    console.log("User deleted successfully");
    fetchUsers(); // Refresh the list
  } catch (error) {
    console.error("Error deleting user:", error);
    alert(error.message || "An error occurred while deleting the user.");
  }
};

    const handleActivate = (userId) => {
        // Implement activate logic here
        console.log('Activating user:', userId);
        // Mock successful activation
        fetchUsers();
    };

    const handleDeactivate = (userId) => {
        // Implement deactivate logic here
        console.log('Deactivating user:', userId);
        // Mock successful deactivation
        fetchUsers();
    };


    return (
        <ErrorBoundary>
            {/* <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    mb: 4,
                    overflow: 'auto',
                    px: { xs: 1, sm: 2, md: 3 }, // Responsive padding
                    width: '100%', // Ensure full width
                    maxWidth: '100%' // Prevent overflow
                }}
            > */}
            <Box sx={{
                flexGrow: 1,
                mb: 4,
                ml: { xs: 0, sm: 35 },
                overflow: 'auto',
                pt: 3
            }}>
                <Card elevation={3} sx={{ borderRadius: 1 }}>
                    <CardContent sx={{ p: { xs: 1, sm: 2 } }}> {/* Responsive padding */}
                        <Box
                            display="flex"
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            mb={2}
                            gap={1}
                        >
                            <Typography variant="h5" fontWeight={500} sx={{ mb: { xs: 1, sm: 0 } }}>
                                User List
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddOpen}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                    alignSelf: { xs: 'flex-end', sm: 'auto' },
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                New User
                            </Button>
                        </Box>

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search users by name, username or email"
                            margin="normal"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                            size={isMobile ? "small" : "medium"}
                        />

                        <Box sx={{ height: { xs: 400, sm: 500, md: 600 }, width: '100%' }}>
                          <DataGrid
    rows={filteredUsers}
    columns={getColumns()}
    pageSize={isMobile ? 5 : 10}
    rowsPerPageOptions={[5, 10, 25, 50]}
    disableSelectionOnClick
    density={isMobile ? "compact" : "standard"}
    getRowId={(row) => row._id}
    sx={{
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.dark, 0.8)
                : alpha(theme.palette.primary.light, 0.6),
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            fontWeight: 600,
        },
        '& .MuiDataGrid-cell': {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
        },
        width: '100%',
        border: 'none',
        '& .MuiDataGrid-virtualScroller': {
            overflowX: 'auto',
        }
    }}
/>
                        </Box>

                        {/* Mobile Action Menu */}
                        {renderMobileActionMenu()}

                        {/* Add User Dialog */}
                        {/* Add User Dialog */}
                        <Dialog
                            open={openAddDialog}
                            onClose={handleAddClose}
                            maxWidth="sm"
                            fullWidth
                            fullScreen={isMobile}
                        >
                            <DialogTitle>New User</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            size={isMobile ? "small" : "medium"}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            size={isMobile ? "small" : "medium"}
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
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            required
                                            size={isMobile ? "small" : "medium"}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Role</InputLabel>
                                            <Select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                label="Role"
                                                size={isMobile ? "small" : "medium"}
                                            >
                                                {availableRoles.map((role) => (
                                                    <MenuItem key={role.value} value={role.value}>
                                                        {role.label}
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
                                                value={formData.permissions || []} // Fixed: Ensure it's always an array
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
                                                            return <Chip key={value} label={perm?.label || value} size="small" />;
                                                        })}
                                                    </Box>
                                                )}
                                                size={isMobile ? "small" : "medium"}
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
                            <DialogActions sx={{ p: 2, gap: 1 }}>
                                <Button onClick={handleAddClose} size={isMobile ? "small" : "medium"}>Cancel</Button>
                                <Button
                                    onClick={handleSubmit}
                                    color="primary"
                                    variant="contained"
                                    size={isMobile ? "small" : "medium"}
                                    disabled={!formData.name || !formData.email || !formData.password}
                                >
                                    Save User
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Edit User Dialog */}
                        {/* Edit User Dialog */}
                        <Dialog
                            open={openEditDialog}
                            onClose={handleEditClose}
                            maxWidth="sm"
                            fullWidth
                            fullScreen={isMobile}
                        >
                            <DialogTitle>Modify User Permissions</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditInputChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            disabled
                                            size={isMobile ? "small" : "medium"}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={editFormData.email}
                                            onChange={handleEditInputChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            disabled
                                            size={isMobile ? "small" : "medium"}
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
                                                            return <Chip key={value} label={perm?.label || value} size="small" />;
                                                        })}
                                                    </Box>
                                                )}
                                                size={isMobile ? "small" : "medium"}
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
                            <DialogActions sx={{ p: 2, gap: 1 }}>
                                <Button onClick={handleEditClose} size={isMobile ? "small" : "medium"}>Cancel</Button>
                                <Button
                                    onClick={handleUpdate}
                                    color="primary"
                                    variant="contained"
                                    size={isMobile ? "small" : "medium"}
                                >
                                    Save Changes
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Change Password Dialog */}
                        <Dialog
                            open={openPasswordDialog}
                            onClose={handlePasswordClose}
                            maxWidth="sm"
                            fullWidth
                            fullScreen={isMobile}
                        >
                            <DialogTitle>Modify Password</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Master Password"
                                            name="editadmin"
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordForm.editadmin}
                                            onChange={handlePasswordChange}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                            size={isMobile ? "small" : "medium"}
                                                        >
                                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            required
                                            size={isMobile ? "small" : "medium"}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="New Password"
                                            name="newpass"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordForm.newpass}
                                            onChange={handlePasswordChange}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            edge="end"
                                                        >
                                                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Re-enter Password"
                                            name="repass"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.repass}
                                            onChange={handlePasswordChange}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            edge="end"
                                                        >
                                                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            required
                                            error={passwordForm.newpass !== passwordForm.repass && passwordForm.repass !== ''}
                                            helperText={
                                                passwordForm.newpass !== passwordForm.repass && passwordForm.repass !== ''
                                                    ? 'Passwords do not match'
                                                    : ''
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handlePasswordClose}>Cancel</Button>
                                <Button
                                    onClick={handlePasswordUpdate}
                                    color="primary"
                                    variant="contained"
                                    disabled={
                                        !passwordForm.editadmin ||
                                        !passwordForm.newpass ||
                                        !passwordForm.repass ||
                                        passwordForm.newpass !== passwordForm.repass
                                    }
                                >
                                    Change Password
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Assign Sites Dialog */}
                        <Dialog open={openSiteDialog} onClose={handleAssignSiteClose} maxWidth="sm" fullWidth>
                            <DialogTitle>Assign Site To User</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Username"
                                            value={selectedUser?.username || ''}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Select Site</InputLabel>
                                            <Select
                                                multiple
                                                value={selectedSites}
                                                onChange={handleSiteChange}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const site = sites.find((s) => s.siteId === value);
                                                            return <Typography key={value}>{site?.siteName || value}</Typography>;
                                                        })}
                                                    </Box>
                                                )}
                                            >
                                                {sites.map((site) => (
                                                    <MenuItem key={site.siteId} value={site.siteId}>
                                                        {site.siteName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleAssignSiteClose}>Cancel</Button>
                                <Button onClick={handleAssignSites} color="primary" variant="contained">
                                    Assign
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Assign Devices Dialog */}
                        <Dialog open={openDeviceDialog} onClose={handleAssignDeviceClose} maxWidth="sm" fullWidth>
                            <DialogTitle>Assign Device To User</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Username"
                                            value={selectedUser?.username || ''}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Select Device</InputLabel>
                                            <Select
                                                multiple
                                                value={selectedDevices}
                                                onChange={handleDeviceChange}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const device = devices.find((d) => d.id === value);
                                                            return <Typography key={value}>{device?.devicename || value}</Typography>;
                                                        })}
                                                    </Box>
                                                )}
                                            >
                                                {devices.map((device) => (
                                                    <MenuItem key={device.id} value={device.id}>
                                                        {device.devicename}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleAssignDeviceClose}>Cancel</Button>
                                <Button onClick={handleAssignDevices} color="primary" variant="contained">
                                    Assign
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </CardContent>
                </Card>
            </Box>
        </ErrorBoundary >
    );
};

export default UserManagement;