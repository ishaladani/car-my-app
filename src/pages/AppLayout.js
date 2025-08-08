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
import axios from "axios";

const AppLayout = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const location = useLocation();
  const navigate = useNavigate();
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

  const [userPermissions, setUserPermissions] = useState([]);
  const [filteredNavItems, setFilteredNavItems] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);

  // All available nav items
  const allNavItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Create Job Cards", icon: <CarIcon />, path: "/jobs" },
    { text: "Manage Inventory", icon: <InventoryIcon />, path: "/inventory" },
      {
          text: "Add Engineer",
          icon: <InventoryIcon />,
          path: "/add-Engineer",
          permission: "Add Engineer",
        },
    { text: "History", icon: <InventoryIcon />, path: "/history" },
    { text: "Reports & Records", icon: <AssignmentIcon />, path: "/reports" },
    { text: "Service Reminders", icon: <NotificationsIcon />, path: "/reminders" },
    { text: "Insurance", icon: <BuildIcon />, path: "/insurance" },
    { text: "User List", icon: <PersonIcon />, path: "/UserManagemt" },
  ];

  // Debug function to log navigation attempts
  const handleNavigationClick = (item) => {
    console.log("Navigation clicked:", item);
    console.log("Current location:", location.pathname);
    console.log("Target path:", item.path);
    
    // Close mobile drawer
    if (isMobile) {
      setMobileOpen(false);
    }
    
    // Force navigation using navigate instead of Link
    navigate(item.path);
  };

  // Fetch garage profile data
  const fetchGarageProfile = async () => {
    if (!garageId) {
      console.error("No garageId found in localStorage");
      setProfileLoaded(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
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

        // Update localStorage for consistency
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
        data: error.response?.data,
      });

      // Fallback to saved data
      const savedName = localStorage.getItem("garageName");
      const savedImage = localStorage.getItem("garageLogo");
      setProfileData((prev) => ({
        ...prev,
        name: savedName || "Garage",
        image: savedImage || "",
      }));
    } finally {
      setProfileLoaded(true);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // Fetch user permissions if role is "user"
  const fetchUserPermissions = async () => {
    console.log("Fetching permissions for role:", roll);
    
    if (roll === "user") {
      const token = localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "";
      try {
        const response = await axios.get(
          "https://garage-management-zi5z.onrender.com/api/garage/user/getpermission",
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Permissions response:", response.data);

        if (response.data && Array.isArray(response.data.permissions)) {
          setUserPermissions(response.data.permissions);

          // Filter nav items based on permissions
          let allowedItems = allNavItems.filter((item) => {
            // Always allow Dashboard
            if (item.path === "/") return true;
            // Check if user has permission for this item
            return response.data.permissions.includes(item.text);
          });

          console.log("Filtered nav items:", allowedItems);
          setFilteredNavItems(allowedItems);
        } else {
          console.warn("No valid permissions found, showing only Dashboard");
          // Fallback: Show only Dashboard
          const dashboard = allNavItems.find((item) => item.path === "/");
          setFilteredNavItems(dashboard ? [dashboard] : []);
        }
      } catch (error) {
        console.error("Error fetching user permissions:", error);
        // On error, show only Dashboard
        const dashboard = allNavItems.find((item) => item.path === "/");
        setFilteredNavItems(dashboard ? [dashboard] : []);
      }
    } else {
      // For non-user roles (admin, owner, etc.), show all items
      console.log("Non-user role detected, showing all nav items");
      setFilteredNavItems(allNavItems);
    }
    setPermissionsLoaded(true);
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchGarageProfile();
      await fetchUserPermissions();
    };

    loadInitialData();

    // Listen for profile updates from other components
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

  // Refresh permissions when role or user changes
  useEffect(() => {
    if (permissionsLoaded) {
      fetchUserPermissions();
    }
  }, [roll, userId]);

  // Debug current state
  useEffect(() => {
    console.log("Current state debug:");
    console.log("- User role:", roll);
    console.log("- Permissions loaded:", permissionsLoaded);
    console.log("- User permissions:", userPermissions);
    console.log("- Filtered nav items:", filteredNavItems);
    console.log("- Current location:", location.pathname);
  }, [roll, permissionsLoaded, userPermissions, filteredNavItems, location.pathname]);

  // Drawer Content
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
            bgcolor: profileData.image ? "transparent" : "primary.main",
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
              {profileData.subscriptionType?.replace("_", " ").toUpperCase()} Plan
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
                onClick={() => handleNavigationClick(item)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
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

      {/* Bottom Actions - Logout */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <ListItemButton
          onClick={handleLogout}
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
          width: isMobile ? "100%" : `calc(100% - 280px)`,
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
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page title */}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {location.pathname === "/"
              ? "Dashboard"
              : (() => {
                  const item = allNavItems.find((i) => i.path === location.pathname);
                  return item ? item.text : "Page";
                })()}
          </Typography>

          {/* User Profile in App Bar */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
            <Tooltip title="User Profile">
              <IconButton
                onClick={(e) => setUserMenu(e.currentTarget)}
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
          >
            <MenuItem onClick={() => {
              setUserMenu(null);
              navigate("/profile");
            }}>
              <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => {
              setUserMenu(null);
              handleLogout();
            }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
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

      {/* Desktop Drawer */}
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