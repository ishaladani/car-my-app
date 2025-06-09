import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
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
} from "@mui/icons-material";
import { useThemeContext } from "../Layout/ThemeContext";
import ThemeToggle from "../Layout/ThemeToggle";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AppLayout = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const location = useLocation();
  const roll = localStorage.getItem("userType");
  const userId = localStorage.getItem("userId");
  const garageId = localStorage.getItem("garageId");

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

  // State for permissions and filtered nav items
  const [userPermissions, setUserPermissions] = useState([]);
  const [filteredNavItems, setFilteredNavItems] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

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
      console.log("user", roll, token)
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
        // On error, show empty navigation for security
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
  }, [garageId, roll, userId]);

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

  // State for drawer and menus
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);

  // Notification count
  const [notificationCount] = useState(3);
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("=== LOGOUT BUTTON CLICKED ===");
    
    try {
      // Get userId and token from localStorage
      const storedUserId = localStorage.getItem("garageId");
      const token = localStorage.getItem("token");
      
      console.log("Stored userId:", storedUserId);
      console.log("Stored token:", token ? "Token exists" : "No token found");
      
      if (!storedUserId) {
        console.error("No userId found in localStorage");
        return;
      }
      
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      
      console.log("Making API call to logout...");
      
      // Call the logout API with Authorization header
      const response = await axios.post(
        `https://garage-management-zi5z.onrender.com/api/garage/logout/${storedUserId}`,
        {}, // Empty body since it's a POST request
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Logout API response:", response.data);
      console.log("Logout API called successfully");
      
    } catch (error) {
      console.error("Error calling logout API:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // Continue with logout even if API call fails
    } finally {
      console.log("Clearing localStorage and redirecting...");
      
      // Clear all items from localStorage regardless of API call result
      localStorage.clear();
      
      // Navigate to login page
      navigate("/login");
    }
  };

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

  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get the current page title
  const getPageTitle = () => {
    return filteredNavItems.find((item) => isActive(item.path))?.text || "Dashboard";
  };

  const drawerWidth = 280;

  // Show loading while data is loading
  if (!permissionsLoaded || !profileLoaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

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
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 1,
            bgcolor: profileData.image ? 'transparent' : 'primary.main'
          }}
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
                selected={isActive(item.path)}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? "primary.main" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Show message if user has no permissions */}
        {roll === "user" && filteredNavItems.length === 0 && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No menu permissions assigned
            </Typography>
          </Box>
        )}
      </Box>

      {/* Bottom Actions - Logout */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <ListItemButton
          onClick={() => {
            console.log("Logout button clicked!");
            handleLogout();
          }}
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
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
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
          width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
          ml: isMobile ? 0 : `${drawerWidth}px`,
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
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page title */}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {getPageTitle()}
          </Typography>

          {/* User Profile Section in App Bar */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
            <Tooltip title="User Profile">
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar
                  src={profileData.image}
                  alt={profileData.name}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: profileData.image ? 'transparent' : 'primary.main'
                  }}
                >
                  {!profileData.image && profileData.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={userMenu}
            open={Boolean(userMenu)}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {profileData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.email}
              </Typography>
              {profileData.isSubscribed && (
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                  {profileData.subscriptionType?.replace('_', ' ').toUpperCase()} Plan
                </Typography>
              )}
            </Box>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon onClick={() => navigate("/profile")}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            {/* <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem> */}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          {/* Theme toggle */}
          <Box sx={{ mx: 0.5 }}>
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: isMobile ? "block" : "none",
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Side Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: isMobile ? "none" : "block",
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
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
          width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
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