import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as CarIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useThemeContext} from '../Layout/ThemeContext'
import ThemeToggle from '../Layout/ThemeToggle';

const AppLayout = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for drawer and menus
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  // const [notificationMenu, setNotificationMenu] = useState(null);
  
  // Notification count
  const [notificationCount] = useState(3);
  
  // Nav items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Create Job Cards', icon: <CarIcon />, path: '/jobs' },
    { text: 'Manage Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Reports & Records', icon: <AssignmentIcon />, path: '/reports' },
    { text: 'Service Reminders', icon: <NotificationsIcon />, path: '/reminders' },
    { text: 'Engineers', icon: <BuildIcon />, path: '/Assign-Engineer' },
  ];
  
  // Sample notifications
  // const notifications = [
  //   { id: 1, title: 'New Job', message: 'Engine repair job assigned', time: '10 min ago' },
  //   { id: 2, title: 'Low Stock', message: 'Brake pads below threshold', time: '1 hour ago' },
  //   { id: 3, title: 'Reminder Due', message: 'Service reminder for XYZ-456', time: '2 hours ago' },
  // ];
  
  // Handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenu(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenu(null);
  };
  
  // const handleNotificationMenuOpen = (event) => {
  //   setNotificationMenu(event.currentTarget);
  // };
  
  // const handleNotificationMenuClose = () => {
  //   setNotificationMenu(null);
  // };
  
  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Get the current page title
  const getPageTitle = () => {
    return navItems.find(item => isActive(item.path))?.text || 'Dashboard';
  };
  
  const drawerWidth = 280;
  
  // Drawer content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Branding */}
      <Box sx={{ 
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <CarIcon sx={{ color: 'primary.main', fontSize: 30, mr: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          AutoServe
        </Typography>
      </Box>
      
      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive(item.path) ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* Bottom Actions - Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          sx={{
            borderRadius: 2,
            py: 1.5,
            bgcolor: 'error.light',
            color: 'error.dark',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'white',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        color="default"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {/* Mobile menu toggle */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Page title */}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {getPageTitle()}
          </Typography>
          
          {/* Search button */}
          {/* <IconButton sx={{ mx: 0.5 }}>
            <SearchIcon />
          </IconButton> */}
          
          {/* Theme toggle */}
          <Box sx={{ mx: 0.5 }}>
            <ThemeToggle />
          </Box>
          
          {/* Notifications */}
          {/* <IconButton
            sx={{ mx: 0.5 }}
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton> */}
          
          {/* User menu */}
          <IconButton
            onClick={handleUserMenuOpen}
            sx={{ 
              ml: 1,
              border: '2px solid',
              borderColor: 'primary.main',
              p: 0.5,
            }}
          >
            <Avatar
              sx={{ 
                bgcolor: 'primary.main',
                width: 32,
                height: 32,
              }}
            >
              A
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Side Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Side Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          marginTop: '64px', // Height of AppBar
        }}
      >
        <Outlet />
      </Box>
      
      {/* User Menu */}
      <Menu
        anchorEl={userMenu}
        open={Boolean(userMenu)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: 4,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
            },
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Admin User</Typography>
          <Typography variant="body2" color="text.secondary">admin@autoserve.com</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleUserMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      {/* <Menu
        anchorEl={notificationMenu}
        open={Boolean(notificationMenu)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 320,
            maxHeight: 380,
            borderRadius: 2,
            boxShadow: 4,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
            },
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Notifications</Typography>
          <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>
            Mark all as read
          </Typography>
        </Box>
        <Divider />
        {notifications.map((notification) => (
          <MenuItem key={notification.id} sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {notification.message}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Typography variant="button" color="primary" sx={{ cursor: 'pointer' }}>
            View All Notifications
          </Typography>
        </Box>
      </Menu> */}
    </Box>
  );
};

export default AppLayout;