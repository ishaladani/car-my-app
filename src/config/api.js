// API Configuration
const API_CONFIG = {
  BASE_URL:
    process.env.REACT_APP_API_BASE_URL ||
    "https://garage-management-zi5z.onrender.com",
  ADMIN_PATH: process.env.REACT_APP_API_ADMIN_PATH || "/api/admin",
  GARAGE_PATH: process.env.REACT_APP_API_GARAGE_PATH || "/api/garage",
};

// Helper functions to get full API URLs
export const getAdminApiUrl = (endpoint = "") => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN_PATH}${endpoint}`;
};

export const getGarageApiUrl = (endpoint = "") => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.GARAGE_PATH}${endpoint}`;
};

export const getBaseApiUrl = (endpoint = "") => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;
