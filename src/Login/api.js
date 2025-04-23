// src/api.js
import axiosInstance from './axiosInstance'

export const loginGarage = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login', {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Assuming your API returns data in the format:
    // { token: string, garage: object }
    return response.data;
    
  } catch (error) {
    // Enhanced error handling
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Check your connection.';
    }
    
    throw new Error(errorMessage);
  }
};

// Other API methods...