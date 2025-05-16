import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon,
  ListItemText, Avatar, Container, Grid, Paper, Box, Button, FormControl,
  Select, MenuItem, InputLabel, Divider, CssBaseline, useTheme, useMediaQuery,
  ListSubheader, ListItemButton, Collapse, Card, CardHeader, CardContent, CardActions
} from '@mui/material';
// import TransferList from './TransferList'; // We'll create this component separately
import TransferList from './TransferList'



const drawerWidth = 240;

function MenuManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(!isMobile);
  const [nestedMenus, setNestedMenus] = useState({
    layout: false,
    charts: false,
    ui: false,
    forms: false,
    tables: false,
    examples: false,
    multilevel: false,
    levelTwo: false
  });

  const [selectedUser, setSelectedUser] = useState('0');
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [assignItems, setAssignItems] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);

  

  useEffect(() => {
      const fetchUsers = async () => {
        // try {
        //   const key = Cookies.get('KEY');
        //   const uid = Cookies.get('UID');
          
        //   if (!key || !uid) {
        //     throw new Error('Authentication cookies are missing');
        //   }
    
        //   const response = await axios.get(
        //     `${GLOBALS.apiBaseUrl}/api/getuserList/${key}/${uid}`,
        //     {
        //       params: {
        //         // userid: uid, // Use the UID from cookies instead of hardcoded value
        //         allocated: [] // Empty array or default value as needed
        //       }
        //     }
        //   );
    
        //   if (response.data && Array.isArray(response.data)) {
        //     setUsers(response.data);
        //   } else {
        //     console.warn('Unexpected API response format:', response.data);
        //     setUsers([]);
        //   }
        // } catch (error) {
        //   console.error('Error fetching users:', error);
        //   setUsers([]);
        // }
      };
    
      fetchUsers();
    }, []);
  
    const handleUserChange = async (event) => {
      const userId = event.target.value;
      setSelectedUser(userId);
    
      if (userId === '0') {
        setMenuItems([]);
        setSelectedMenus([]);
        return;
      }
    
      // try {
      //   const response = await axios.get(
      //     `${GLOBALS.apiBaseUrl}/api/getUsermenu/${userId}`,
      //     {
      //       params: {
      //         // userid: userId, // Pass the selected user ID
      //         allocated: selectedMenus // Pass current selected menus
      //       }
      //     }
      //   );
    
      //   const formattedMenus = response.data.map((menu) => ({
      //     id: menu.id.toString(),
      //     menuname: menu.menuname
      //   }));
        
      //   setMenuItems(formattedMenus);
      // } catch (error) {
      //   console.error("Error fetching menus:", error);
      // }
    };
  
    // const handleAssignMenu = async () => {
    //   if (!selectedUser || selectedUser === '0') {
    //     alert('Please select a user first');
    //     return;
    //   }
    
    //   try {
    //     // Using URLSearchParams to format the data as form-urlencoded
    //     const params = new URLSearchParams();
    //     params.append('userid', selectedUser);
        
    //     // Add each selected menu with allocated[] key
    //     selectedMenus.forEach(menuId => {
    //       params.append('allocated[]', menuId);
    //     });
    
    //     // If no menus selected, default to [0]
    //     if (selectedMenus.length === 0) {
    //       params.append('allocated[]', '0');
    //     }
    
    //     const response = await axios.post(
    //       `${GLOBALS.apiBaseUrl}/api/allocatemenu`,
          
    //       params.toString(), // Send as form-urlencoded string
    //       {
    //         headers: {
    //           'Content-Type': 'application/x-www-form-urlencoded',
    //         },
    //       }
    //     );
    
    //     setAssignItems(response.data);
    //     alert("Menus assigned successfully");
        
    //     // Refresh the menu list after assignment
    //     handleUserChange({ target: { value: selectedUser } });
    //   } catch (error) {
    //     console.error("Error assigning menus:", error.response ? error.response.data : error.message);
    //     alert("Failed to assign menus");
    //   }
    // };

    const handleAssignMenu = async () => {
      if (!selectedUser || selectedUser === '0') {
        alert('Please select a user first');
        return;
      }
    
      try {
        // Create form data with the required format
        const formData = new FormData();
        formData.append('userid', selectedUser);
        
        // Append each selected menu ID
        selectedMenus.forEach(menuId => {
          formData.append('allocated[]', menuId);
        });
    
        // If no menus selected, send [0] as default
        if (selectedMenus.length === 0) {
          formData.append('allocated[]', '0');
        }
    
        // const response = await axios.post(
        //   `${GLOBALS.apiBaseUrl}/api/allocateUsermenu`,
        //   formData,
        //   {
        //     headers: {
        //       'Content-Type': 'multipart/form-data',
        //     },
        //   }
        // );
    
        
        // setAssignItems(response.data);
        alert("Menus assigned successfully");
        
        // Refresh the menu list after assignment
        handleUserChange({ target: { value: selectedUser } });
      } catch (error) {
        console.error("Error assigning menus:", error.response ? error.response.data : error.message);
        alert("Failed to assign menus");
      }
    };
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNestedMenuClick = (menu) => {
    setNestedMenus({
      ...nestedMenus,
      [menu]: !nestedMenus[menu]
    });
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out');
  };

  const handleMenuChange = (newSelectedMenus) => {
    setSelectedMenus(newSelectedMenus);
    console.log("menu",newSelectedMenus);
  };

  return (
    <>
       <Box sx={{ 
      flexGrow: 1,
      mb: 4,
      ml: {xs: 0, sm: 35},
      overflow: 'auto',
      pt: 3
    }}>
      <Card>
      <CardContent >
         <Box
                  mb={4}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
          <Typography variant="h5" component="h2" align="center" fontWeight={500}>
            Menu Management
          </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height:400 }}>
                  <Avatar
                    src="/static/images/avatar/5.jpg"
                    sx={{ width: 100, height: 100, mb: 2 }}
                  />
                  <Typography variant="h6" align="center" gutterBottom>
                    Manager List
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="user-select-label">Select User</InputLabel>
                    <Select
                      labelId="user-select-label"
                      id="user-select"
                      value={selectedUser}
                      label="Select User"
                      onChange={handleUserChange}
                    >
                      <MenuItem value="0">Select User</MenuItem>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <MenuItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.username})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No users available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleAssignMenu}
                    disabled={selectedUser === '0'}
                  >
                    Assign Menu
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={9}>
              <Card>
                <CardContent>
                  <Typography variant="h5" align="center" gutterBottom mb={2} mt={0}>
                    Menu List
                  </Typography>

                  <TransferList
                    items={menuItems}
                    selectedItems={selectedMenus}
                    onChange={handleMenuChange}
                    leftTitle="Non-Allocated Menus"
                    rightTitle="Allocated Menus"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          </CardContent>
          </Card>
      </Box>
    </>
  );
}

export default MenuManagement;