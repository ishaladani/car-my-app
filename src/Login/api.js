// src/services/api.js
import axios from 'axios';

const API_URL = 'https://garage-management-system-cr4w.onrender.com/api/garage';

export const loginGarage = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/garage/login`, {
      email,
      password
    }, {
      withCredentials: true, // Important for cookie storage
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      // Something happened in setting up the request
      throw { message: 'Error setting up request: ' + error.message };
    }
  }
};