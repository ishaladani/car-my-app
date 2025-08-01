import React, { createContext, useState, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material";

// Create a context for the theme
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProviderWrapper = ({ children }) => {
  // Get the initial dark mode state from localStorage
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Create the theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
        dark: "#115293",
        light: "#4791db",
      },
      secondary: {
        main: "#f50057",
        dark: "#c51162",
        light: "#ff4081",
      },
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
      error: {
        main: "#f44336",
      },
      warning: {
        main: "#ff9800",
      },
      info: {
        main: "#2196f3",
      },
      success: {
        main: "#4caf50",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#212121",
        secondary: darkMode ? "#b0b0b0" : "#757575",
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontSize: "2.2rem",
        fontWeight: 600,
        marginBottom: "1rem",
      },
      h2: {
        fontSize: "1.8rem",
        fontWeight: 500,
        marginTop: "1.5rem",
        marginBottom: "1rem",
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: 500,
        margin: "0.8rem 0",
      },
      h4: {
        fontSize: "1.2rem",
        fontWeight: 500,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: darkMode ? "#1e1e1e" : "#f5f5f5",
            fontWeight: "bold",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 500,
          },
          containedPrimary: {
            "&:hover": {
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: "2px 8px",
            transition: "all 0.2s ease",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: "none",
          },
        },
      },
    },
  });

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  // The context value that will be provided
  const themeContextValue = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
