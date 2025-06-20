import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
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
  Switch,
  FormControlLabel,
} from "@mui/material";
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
  DarkMode,
  LightMode,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useThemeContext } from "../Layout/ThemeContext";
import ThemeToggle from "../Layout/ThemeToggle";
import axios from "axios";

const AppLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate(); // Navigate hook to handle redirects
  const roll = localStorage.getItem("userType");
  const userId = localStorage.getItem("userId");
  const garageId = localStorage.getItem("garageId");
  const { darkMode, toggleDarkMode } = useThemeContext();

  const isMobile = useMediaQuery("(max-width:599px)");
  const [profileData, setProfileData] = useState({
    name: "",
    image: "",
    email: "",
    phone: "",
    address: "",
    subscriptionType: "",
    isSubscribed: false,
  });

  const [userPermissions, setUserPermissions] = useState([]); // State for user permissions
  const [filteredNavItems, setFilteredNavItems] = useState([]); // Filtered nav items
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false); // Declare mobileOpen state
  const [userMenu, setUserMenu] = useState(null); // Declare userMenu state

  // All available nav items
  const allNavItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Create Job Cards", icon: <CarIcon />, path: "/jobs" },
    { text: "Manage Inventory", icon: <InventoryIcon />, path: "/inventory" },
    { text: "Reports & Records", icon: <AssignmentIcon />, path: "/reports" },
    {
      text: "Service Reminders",
      icon: <NotificationsIcon />,
      path: "/reminders",
    },
    { text: "Insurance", icon: <BuildIcon />, path: "/insurance" },
    { text: "User List", icon: <BuildIcon />, path: "/UserManagemt" },
  ];

  // Fetch garage profile data
  const fetchGarageProfile = async () => {
    if (!garageId) {
      console.error("No garageId found in localStorage");
      setProfileLoaded(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log("Fetching garage profile for ID:", garageId);
      
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/garage/getgaragebyid/${garageId}`,
        { headers }
      );
      
      console.log("Garage profile response:", response.data);
      
      if (response.data) {
        const garageData = response.data;
        setProfileData({
          name: garageData.name || "Garage",
          image: garageData.logo || "",
          email: garageData.email || "",
          phone: garageData.phone || "",
          address: garageData.address || "",
          subscriptionType: garageData.subscriptionType || "",
          isSubscribed: garageData.isSubscribed || false,
        });

        // Also update localStorage for backward compatibility
        localStorage.setItem("garageName", garageData.name || "Garage");
        if (garageData.logo) {
          localStorage.setItem("garageLogo", garageData.logo);
        }
      }
    } catch (error) {
      console.error("Error fetching garage profile:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Fallback to localStorage data
      const savedName = localStorage.getItem("garageName");
      const savedImage = localStorage.getItem("garageLogo");
      setProfileData(prev => ({
        ...prev,
        name: savedName || "Garage",
        image: savedImage || "",
      }));
    } finally {
      setProfileLoaded(true);
    }
  };

  // Fetch user permissions if role is "user"
  const fetchUserPermissions = async () => {
    if (roll === "user") {
      const token = localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '';
      try {
        const response = await axios.get(
          "https://garage-management-zi5z.onrender.com/api/garage/user/getpermission",
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            },
          }
        );
        
        if (response.data && response.data.permissions) {
          setUserPermissions(response.data.permissions);
          
          // Filter nav items based on permissions
          const filtered = allNavItems.filter(item => 
            response.data.permissions.includes(item.text)
          );
          setFilteredNavItems(filtered);
          
        } else {
          setFilteredNavItems([]);
        }
      } catch (error) {
        console.error("Error fetching user permissions:", error);
        setFilteredNavItems([]);
      }
    } else {
      setFilteredNavItems(allNavItems);
    }
    setPermissionsLoaded(true);
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load profile data from API
      await fetchGarageProfile();
      
      // Load permissions
      await fetchUserPermissions();
    };

    loadInitialData();

    // Redirect user to Dashboard if userType is 'user'
    if (roll === "user") {
      navigate("/");  // Default to the Dashboard page
    }

    // Listen for storage changes (for backward compatibility)
    const handleStorageChange = () => {
      if (localStorage.getItem("profileUpdated") === "true") {
        fetchGarageProfile();
        localStorage.removeItem("profileUpdated");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [garageId, roll, userId, navigate]);

  // Refresh permissions when role/userId changes
  useEffect(() => {
    if (permissionsLoaded) {
      fetchUserPermissions();
    }
  }, [roll, userId]);

  // Handle page visibility changes (optional)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && roll === "user") {
        fetchUserPermissions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [roll]);

  // Modern Theme Toggle Component
  const ThemeToggleSwitch = () => (
    <Tooltip title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.5,
          borderRadius: 20,
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-1px)',
            boxShadow: darkMode 
              ? '0 4px 12px rgba(255, 255, 255, 0.1)' 
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
          }
        }}
        onClick={toggleDarkMode}
      >
        {/* Light Mode Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: !darkMode ? '#FFA726' : 'transparent',
            color: !darkMode ? '#fff' : theme.palette.text.secondary,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: !darkMode ? 'scale(1.1)' : 'scale(0.9)',
          }}
        >
          <LightMode sx={{ fontSize: 14 }} />
        </Box>

        {/* Toggle Switch */}
        <Box
          sx={{
            position: 'relative',
            width: 32,
            height: 16,
            borderRadius: 8,
            backgroundColor: darkMode ? '#3f51b5' : '#e0e0e0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              left: darkMode ? 18 : 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          />
        </Box>

        {/* Dark Mode Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: darkMode ? '#3f51b5' : 'transparent',
            color: darkMode ? '#fff' : theme.palette.text.secondary,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: darkMode ? 'scale(1.1)' : 'scale(0.9)',
          }}
        >
          <DarkMode sx={{ fontSize: 14 }} />
        </Box>
      </Box>
    </Tooltip>
  );

  // Alternative Compact Toggle for Mobile
  const CompactThemeToggle = () => (
    <Tooltip title={`${darkMode ? 'Light' : 'Dark'} Mode`}>
      <IconButton
        onClick={toggleDarkMode}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
          color: darkMode ? '#3f51b5' : '#FFA726',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-1px) scale(1.05)',
            boxShadow: darkMode 
              ? '0 4px 12px rgba(255, 255, 255, 0.1)' 
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        {darkMode ? (
          <LightMode sx={{ fontSize: 20 }} />
        ) : (
          <DarkMode sx={{ fontSize: 20 }} />
        )}
      </IconButton>
    </Tooltip>
  );

  // Drawer content
  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo and Branding */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          src={profileData.image}
          alt="Garage Logo"
          sx={{ width: 40, height: 40, mr: 1, bgcolor: profileData.image ? 'transparent' : 'primary.main' }}
        >
          {!profileData.image && profileData.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ ml: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {profileData.name}
          </Typography>
          {profileData.isSubscribed && (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
              {profileData.subscriptionType?.replace('_', ' ').toUpperCase()} Plan
            </Typography>
          )}
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
        <List>
          {filteredNavItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Theme Toggle in Sidebar */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        {/* <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <ThemeToggleSwitch />
        </Box> */}
        
        <ListItemButton
          // onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            bgcolor: "error.light",
            color: "error.dark",
            "&:hover": {
              bgcolor: "error.main",
              color: "white",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        color="default"
        sx={{
          width: isMobile ? "100%" : `calc(100% - ${280}px)`,
          ml: isMobile ? 0 : `280px`,
          boxShadow: 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          {/* Mobile menu toggle */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)} // Toggle mobile drawer
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page title */}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {location.pathname === "/" ? "Dashboard" :""}
          </Typography>

          {/* Theme Toggle in App Bar (Mobile) */}
          {isMobile && (
            <Box sx={{ mr: 1 }}>
              <CompactThemeToggle />
            </Box>
          )}

          {/* Theme Toggle in App Bar (Desktop) */}
          {!isMobile && (
            <Box sx={{ mr: 2 }}>
              <ThemeToggleSwitch />
            </Box>
          )}

          {/* User Profile Section in App Bar */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="User Profile">
              <IconButton
                onClick={(event) => setUserMenu(event.currentTarget)} // Corrected event handling
                sx={{ p: 0 }}
              >
                <Avatar
                  src={profileData.image}
                  alt={profileData.name}
                  sx={{ width: 32, height: 32 }}
                >
                  {profileData.name.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={userMenu}
            open={Boolean(userMenu)}
            onClose={() => setUserMenu(null)}
            onClick={() => setUserMenu(null)}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 180,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1.5, gap: 1.5 }}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">Profile</Typography>
            </MenuItem>
            <Divider />
            <MenuItem 
              // onClick={handleLogout}
              sx={{ py: 1.5, gap: 1.5, color: 'error.main' }}
            >
              <LogoutIcon fontSize="small" />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: isMobile ? "block" : "none",
          "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Side Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: isMobile ? "none" : "block",
          "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" },
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
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          width: isMobile ? "100%" : `calc(100% - 280px)`,
          minHeight: "100vh",
          backgroundColor: "background.default",
          marginTop: "64px", // Height of AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;