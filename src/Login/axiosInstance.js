// src/utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://garage-management-zi5z.onrender.com/api/admin/', // Your API base URL
});

// Add a request interceptor to include the token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('garageToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;