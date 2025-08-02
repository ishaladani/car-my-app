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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
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
  const navigate = useNavigate();
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
  const [userPermissions, setUserPermissions] = useState([]);
  const [filteredNavItems, setFilteredNavItems] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); // For confirmation dialog

  // Handle logout: Show confirmation first
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  // Confirm and perform logout
  const confirmLogout = async () => {
    setLogoutDialogOpen(false);
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let logoutId;
      if (roll === "garage") {
        logoutId = garageId;
        console.log("Logging out garage:", logoutId);
      } else if (roll === "user") {
        logoutId = userId;
        console.log("Logging out user:", logoutId);
      } else {
        logoutId = userId;
        console.log("Logging out (fallback to user):", logoutId);
      }

      if (!logoutId) {
        console.error("No valid ID found for logout");
        throw new Error("Unable to determine user/garage ID for logout");
      }

      await axios.post(
        `https://garage-management-zi5z.onrender.com/api/garage/logout/${logoutId}`,
        {},
        {
          headers,
          timeout: 10000,
        }
      );
      console.log("Logout API call successful");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("garageId");
      localStorage.removeItem("userType");
      localStorage.removeItem("garageName");
      localStorage.removeItem("garageLogo");
      localStorage.removeItem("profileUpdated");

      setUserMenu(null);
      setMobileOpen(false);
      navigate("/login");
      setIsLoggingOut(false);
    }
  };

  // All available nav items
  const allNavItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/",
      permission: "Dashboard",
    },
    {
      text: "Create Job Cards",
      icon: <CarIcon />,
      path: "/jobs",
      permission: "Create Job Cards",
    },
    {
      text: "Manage Inventory",
      icon: <InventoryIcon />,
      path: "/inventory",
      permission: "Manage Inventory",
    },
    {
      text: "Add Engineer",
      icon: <InventoryIcon />,
      path: "/add-Engineer",
      permission: "Add Engineer",
    },
    {
      text: "History",
      icon: <AssignmentIcon />,
      path: "/history",
      permission: "Reports & Records",
    },
    {
      text: "Reports And Report",
      icon: <BuildIcon />,
      path: "/reports",
      permission: "Reports & Records",
    },
    {
      text: "Inventory Dashboard",
      icon: <InventoryIcon />,
      path: "/inventory-dashboard",
      permission: "Reports & Records",
    },
    {
      text: "Service Reminders",
      icon: <NotificationsIcon />,
      path: "/reminders",
      permission: "Service Reminders",
    },
    {
      text: "Insurance",
      icon: <BuildIcon />,
      path: "/insurance",
      permission: "Insurance",
    },
    {
      text: "User List",
      icon: <PersonIcon />,
      path: "/UserManagemt",
      permission: "User List",
    },
  ];

  // Fetch garage profile
  const fetchGarageProfile = async () => {
    if (!garageId) {
      setProfileLoaded(true);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `https://garage-management-zi5z.onrender.com/api/garage/getgaragebyid/${garageId}`,
        { headers }
      );
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
        localStorage.setItem("garageName", garageData.name || "Garage");
        if (garageData.logo) {
          localStorage.setItem("garageLogo", garageData.logo);
        }
      }
    } catch (error) {
      console.error("Error fetching garage profile:", error);
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

  // Fetch user permissions
  const fetchUserPermissions = async () => {
    if (roll === "user") {
      const token = localStorage.getItem("token")
        ? `Bearer ${localStorage.getItem("token")}`
        : "";
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
        if (response.data && response.data.permissions) {
          const permissions = response.data.permissions;
          setUserPermissions(permissions);
          const filtered = allNavItems.filter((item) =>
            permissions.includes(item.permission) || permissions.includes(item.text)
          );
          setFilteredNavItems(filtered.length > 0 ? filtered : [allNavItems[0]]);
        } else {
          setFilteredNavItems([allNavItems[0]]);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setFilteredNavItems([allNavItems[0]]);
      }
    } else {
      setFilteredNavItems(allNavItems);
    }
    setPermissionsLoaded(true);
  };

  const hasPermissionForRoute = (pathname) => {
    if (roll !== "user") return true;
    if (!permissionsLoaded) return false;
    const navItem = allNavItems.find((item) => item.path === pathname);
    if (!navItem) return true;
    return (
      userPermissions.includes(navItem.permission) ||
      userPermissions.includes(navItem.text)
    );
  };

  useEffect(() => {
    if (initialLoadComplete && permissionsLoaded && roll === "user") {
      const currentPath = location.pathname;
      if (!hasPermissionForRoute(currentPath)) {
        const firstAvailableRoute = filteredNavItems.length > 0 ? filteredNavItems[0].path : "/";
        navigate(firstAvailableRoute, { replace: true });
      }
    }
  }, [
    initialLoadComplete,
    permissionsLoaded,
    userPermissions,
    roll,
    location.pathname,
    filteredNavItems,
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchGarageProfile();
      await fetchUserPermissions();
      setInitialLoadComplete(true);
    };
    loadInitialData();

    const handleStorageChange = () => {
      if (localStorage.getItem("profileUpdated") === "true") {
        fetchGarageProfile();
        localStorage.removeItem("profileUpdated");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [garageId, roll, userId]);

  useEffect(() => {
    if (initialLoadComplete) {
      fetchUserPermissions();
    }
  }, [roll, userId, initialLoadComplete]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && roll === "user" && initialLoadComplete) {
        fetchUserPermissions();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [roll, initialLoadComplete]);

  // Theme Toggle Components
  const ThemeToggleSwitch = () => (
    <Tooltip title={`Switch to ${darkMode ? "Light" : "Dark"} Mode`}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.5,
          borderRadius: 20,
          backgroundColor: darkMode
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.04)",
          border: `1px solid ${
            darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"
          }`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: darkMode
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(0, 0, 0, 0.08)",
            transform: "translateY(-1px)",
            boxShadow: darkMode
              ? "0 4px 12px rgba(255, 255, 255, 0.1)"
              : "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        }}
        onClick={toggleDarkMode}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: !darkMode ? "#FFA726" : "transparent",
            color: !darkMode ? "#fff" : theme.palette.text.secondary,
            transition: "all 0.3s",
            transform: !darkMode ? "scale(1.1)" : "scale(0.9)",
          }}
        >
          <LightMode sx={{ fontSize: 14 }} />
        </Box>
        <Box
          sx={{
            position: "relative",
            width: 32,
            height: 16,
            borderRadius: 8,
            backgroundColor: darkMode ? "#3f51b5" : "#e0e0e0",
            transition: "all 0.3s",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: darkMode ? 18 : 2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#fff",
              transition: "all 0.3s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: darkMode ? "#3f51b5" : "transparent",
            color: darkMode ? "#fff" : theme.palette.text.secondary,
            transition: "all 0.3s",
            transform: darkMode ? "scale(1.1)" : "scale(0.9)",
          }}
        >
          <DarkMode sx={{ fontSize: 14 }} />
        </Box>
      </Box>
    </Tooltip>
  );

  const CompactThemeToggle = () => (
    <Tooltip title={`${darkMode ? "Light" : "Dark"} Mode`}>
      <IconButton
        onClick={toggleDarkMode}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          backgroundColor: darkMode
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.04)",
          border: `1px solid ${
            darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"
          }`,
          color: darkMode ? "#3f51b5" : "#FFA726",
          "&:hover": {
            transform: "translateY(-1px) scale(1.05)",
            boxShadow: darkMode
              ? "0 4px 12px rgba(255,255,255,0.1)"
              : "0 4px 12px rgba(0,0,0,0.15)",
          },
        }}
      >
        {darkMode ? <LightMode sx={{ fontSize: 20 }} /> : <DarkMode sx={{ fontSize: 20 }} />}
      </IconButton>
    </Tooltip>
  );

  // Loading state
  if (!initialLoadComplete || !permissionsLoaded || !profileLoaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {!profileLoaded
            ? "Loading profile..."
            : !permissionsLoaded
            ? "Loading permissions..."
            : "Initializing..."}
        </Typography>
      </Box>
    );
  }

  // Drawer content
  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {profileData.name}
          </Typography>
          {profileData.isSubscribed && (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
              {profileData.subscriptionType?.replace("_", " ").toUpperCase()} Plan
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
        <List>
          {filteredNavItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{ borderRadius: 2, py: 1.5 }}
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

      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <ListItemButton
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          sx={{
            borderRadius: 2,
            py: 1.5,
            bgcolor: "error.light",
            color: "error.dark",
            "&:hover": { bgcolor: "error.main", color: "white" },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {isLoggingOut ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <LogoutIcon />
            )}
          </ListItemIcon>
          <ListItemText
            primary={isLoggingOut ? "Logging out..." : "Logout"}
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
          ml: isMobile ? 0 : 280,
          boxShadow: 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {location.pathname === "/"
              ? "Dashboard"
              : filteredNavItems.find((item) => item.path === location.pathname)?.text || ""}
          </Typography>

          {isMobile && <CompactThemeToggle />}
          {!isMobile && <ThemeToggleSwitch />}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="User Profile">
              <IconButton onClick={(event) => setUserMenu(event.currentTarget)} sx={{ p: 0 }}>
                <Avatar src={profileData.image} alt={profileData.name} sx={{ width: 32, height: 32 }}>
                  {profileData.name.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={userMenu}
            open={Boolean(userMenu)}
            onClose={() => setUserMenu(null)}
            onClick={() => setUserMenu(null)}
            PaperProps={{ sx: { mt: 1, borderRadius: 2, minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } }}
          >
            <MenuItem onClick={() => navigate("/profile")} sx={{ py: 1.5, gap: 1.5 }}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">Profile</Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              sx={{ py: 1.5, gap: 1.5, color: "error.main" }}
            >
              {isLoggingOut ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <LogoutIcon fontSize="small" />
              )}
              <Typography variant="body2">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Typography>
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
          "& .MuiDrawer-paper": { width: 280 },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: isMobile ? "none" : "block",
          "& .MuiDrawer-paper": { width: 280 },
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
          marginTop: "64px",
        }}
      >
        <Outlet />
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out? You will be redirected to the login page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmLogout} color="error" autoFocus disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out..." : "Yes, Logout"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppLayout;