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

  const isMobile = useMediaQuery("(max-width:599px)");
  const [profileData, setProfileData] = useState({
    name: "",
    image: "",
  });

  // State for permissions and filtered nav items
  const [userPermissions, setUserPermissions] = useState([]);
  const [filteredNavItems, setFilteredNavItems] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

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

  // Fetch user permissions if role is "user"
  const fetchUserPermissions = async () => {
    if (roll === "user") {
      const token = localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '';
       console.log("user", roll, token)
      try {
        // FIXED: Correct API call format
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
        // On error, show empty navigation for security
        setFilteredNavItems([]);
      }
    } else {
      setFilteredNavItems(allNavItems);
    }
    setPermissionsLoaded(true);
  };

  useEffect(() => {
    const loadProfile = () => {
      const savedName = localStorage.getItem("garageName");
      const savedImage = localStorage.getItem("garageLogo");
      setProfileData({
        name: savedName || "Garage",
        image: savedImage || "",
      });
    };

    // Load initially
    loadProfile();

    // Also listen for storage changes
    const handleStorageChange = () => {
      if (localStorage.getItem("profileUpdated") === "true") {
        loadProfile();
        localStorage.removeItem("profileUpdated"); // reset flag
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fetch permissions on mount, page refresh, and when roll/userId changes
  useEffect(() => {
    fetchUserPermissions();
  }, [roll, userId]);

  // Additional effect to handle page visibility changes (optional)
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

  // Show loading or empty state while permissions are loading
  if (!permissionsLoaded) {
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
        {profileData.image && (
          <Avatar
            src={profileData.image}
            alt="Garage Logo"
            sx={{ width: 40, height: 40, mr: 1 }}
          />
        )}
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {profileData.name || "Garage"}
        </Typography>
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