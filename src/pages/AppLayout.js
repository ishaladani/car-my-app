// import React, { useState } from 'react';
// import { Outlet, useLocation, Link } from 'react-router-dom';
// import {
//   AppBar,
//   Box,
//   Toolbar,
//   Drawer,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Typography,
//   IconButton,
//   Avatar,
//   Menu,
//   MenuItem,
//   Divider,
//   Badge,
//   Tooltip,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   Dashboard as DashboardIcon,
//   DirectionsCar as CarIcon,
//   Inventory as InventoryIcon,
//   Assignment as AssignmentIcon,
//   Notifications as NotificationsIcon,
//   Build as BuildIcon,
//   Person as PersonIcon,
//   Settings as SettingsIcon,
//   Logout as LogoutIcon,
//   Search as SearchIcon,
// } from '@mui/icons-material';
// import { useThemeContext } from '../Layout/ThemeContext'
// import ThemeToggle from '../Layout/ThemeToggle';
// import { useNavigate } from 'react-router-dom';

// const AppLayout = () => {
//   const theme = useTheme();
//   const { darkMode } = useThemeContext();
//   const location = useLocation();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   // State for drawer and menus
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [userMenu, setUserMenu] = useState(null);
//   // const [notificationMenu, setNotificationMenu] = useState(null);

//   // Notification count
//   const [notificationCount] = useState(3);
//     const navigate = useNavigate();
  
//   const handleLogout = () => {
//     // Clear all items from localStorage
//     localStorage.clear();
    
//     // Alternatively, if you only want to clear specific items:
//     // localStorage.removeItem('authToken');
//     // localStorage.removeItem('garageId');
    
//     console.log('User logged out, localStorage cleared');
    
//     // Navigate to login page
//     navigate('/login');
//   };

//   // Nav items
//   const navItems = [
//     { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
//     { text: 'Create Job Cards', icon: <CarIcon />, path: '/jobs' },
//     { text: 'Manage Inventory', icon: <InventoryIcon />, path: '/inventory' },
//     { text: 'Reports & Records', icon: <AssignmentIcon />, path: '/reports' },
//     { text: 'Service Reminders', icon: <NotificationsIcon />, path: '/reminders' },
//     // { text: 'Engineers', icon: <BuildIcon />, path: '/Assign-Engineer' },
//   ];


//   // Handlers
//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   const handleUserMenuOpen = (event) => {
//     setUserMenu(event.currentTarget);
//   };

//   const handleUserMenuClose = () => {
//     setUserMenu(null);
//   };

//  const isActive = (path) => {
//     return location.pathname === path;
//   };

//   // Get the current page title
//   const getPageTitle = () => {
//     return navItems.find(item => isActive(item.path))?.text || 'Dashboard';
//   };

//   const drawerWidth = 280;

//   // Drawer content
//   const drawerContent = (
//     <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//       {/* Logo and Branding */}
//       <Box sx={{
//         p: 3,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderBottom: '1px solid',
//         borderColor: 'divider',
//       }}>
//         <CarIcon sx={{ color: 'primary.main', fontSize: 30, mr: 1 }} />
//         <Typography variant="h5" sx={{ fontWeight: 700 }}>
//           AutoServe
//         </Typography>
//       </Box>

//       {/* Navigation Items */}
//       <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
//         <List>
//           {navItems.map((item) => (
//             <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
//               <ListItemButton
//                 component={Link}
//                 to={item.path}
//                 selected={isActive(item.path)}
//                 onClick={() => isMobile && setMobileOpen(false)}
//                 sx={{
//                   borderRadius: 2,
//                   py: 1.5,
//                 }}
//               >
//                 <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
//                   {item.icon}
//                 </ListItemIcon>
//                 <ListItemText
//                   primary={item.text}
//                   primaryTypographyProps={{
//                     fontWeight: isActive(item.path) ? 600 : 400
//                   }}
//                 />
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//       </Box>

//       {/* Bottom Actions - Logout */}
//       <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
//         <ListItemButton
//          onClick={handleLogout}
//           sx={{
//             borderRadius: 2,
//             py: 1.5,
//             bgcolor: 'error.light',
//             color: 'error.dark',
//             '&:hover': {
//               bgcolor: 'error.main',
//               color: 'white',
//             }
//           }}
//         >
//           <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
//             <LogoutIcon />
//           </ListItemIcon>
//           <ListItemText
//             primary="Logout"
//             primaryTypographyProps={{ fontWeight: 600 }}
//           />
//         </ListItemButton>
//       </Box>
//     </Box>
//   );

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//       {/* App Bar */}
//       <AppBar
//         position="fixed"
//         color="default"
//         sx={{
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           ml: { md: `${drawerWidth}px` },
//           boxShadow: 1,
//           bgcolor: 'background.paper',
//           borderBottom: '1px solid',
//           borderColor: 'divider',
//         }}
//       >
//         <Toolbar>
//           {/* Mobile menu toggle */}
//           <IconButton
//             color="inherit"
//             edge="start"
//             onClick={handleDrawerToggle}
//             sx={{ mr: 2, display: { md: 'none' } }}
//           >
//             <MenuIcon />
//           </IconButton>

//           {/* Page title */}
//           <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
//             {getPageTitle()}
//           </Typography>

//           {/* Search button */}
//           {/* <IconButton sx={{ mx: 0.5 }}>
//             <SearchIcon />
//           </IconButton> */}

//           {/* Theme toggle */}
//           <Box sx={{ mx: 0.5 }}>
//             <ThemeToggle />
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* Side Drawer - Mobile */}
//       <Drawer
//         variant="temporary"
//         open={mobileOpen}
//         onClose={handleDrawerToggle}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           display: { xs: 'block', md: 'none' },
//           '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
//         }}
//       >
//         {drawerContent}
//       </Drawer>

//       {/* Side Drawer - Desktop */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           display: { xs: 'none', md: 'block' },
//           '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
//         }}
//         open
//       >
//         {drawerContent}
//       </Drawer>

//       {/* Main Content */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: 3,
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           minHeight: '100vh',
//           backgroundColor: 'background.default',
//           marginTop: '64px', // Height of AppBar
//         }}
//       >
//         <Outlet />
//       </Box>


//     </Box>
//   );
// };

// export default AppLayout;
import React, { useState } from "react";
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
import { useEffect } from "react";
import axios from "axios";

const AppLayout = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [profileData, setProfileData] = useState({
    name: "",
    image: "",
  });

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


  // State for drawer and menus
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  // const [notificationMenu, setNotificationMenu] = useState(null);

  // Notification count
  const [notificationCount] = useState(3);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all items from localStorage
    localStorage.clear();

    // Alternatively, if you only want to clear specific items:
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('garageId');

    console.log("User logged out, localStorage cleared");

    // Navigate to login page
    navigate("/login");
  };

  // Nav items
  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Create Job Cards", icon: <CarIcon />, path: "/jobs" },
    { text: "Manage Inventory", icon: <InventoryIcon />, path: "/inventory" },
    { text: "Reports & Records", icon: <AssignmentIcon />, path: "/reports" },
    {
      text: "Service Reminders",
      icon: <NotificationsIcon />,
      path: "/reminders",
    },
    { text: 'Insurance', icon: <BuildIcon />, path: '/insurance' },
  ];

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
    return navItems.find((item) => isActive(item.path))?.text || "Dashboard";
  };

  const drawerWidth = 280;

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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          {/* Mobile menu toggle */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
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
        </Toolbar>
      </AppBar>

      {/* Side Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Side Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
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
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
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