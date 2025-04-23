import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeContext } from './ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useThemeContext();

  return (
    <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton 
        color="inherit" 
        onClick={toggleDarkMode}
        sx={{
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          '&:hover': {
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;