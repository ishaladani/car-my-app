// Authentication utility functions
import { useNavigate } from 'react-router-dom';

/**
 * Handles token validation and automatic logout
 * @param {Object} error - The error object from API response
 * @param {Function} navigate - React Router navigate function
 * @returns {boolean} - Returns true if token error was handled, false otherwise
 */
export const handleTokenError = (error, navigate) => {
  // Check if the error is related to token issues
  const errorMessage = error?.response?.data?.message || error?.message || '';
  const statusCode = error?.response?.status;
  
  // Check for token-related error messages
  const isTokenError = 
    errorMessage.toLowerCase().includes('token missing') ||
    errorMessage.toLowerCase().includes('invalid token') ||
    errorMessage.toLowerCase().includes('unauthorized') ||
    errorMessage.toLowerCase().includes('token expired') ||
    statusCode === 401 ||
    statusCode === 403;

  if (isTokenError) {
    console.warn('Token error detected:', errorMessage);
    
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('garageId');
    localStorage.removeItem('name');
    localStorage.removeItem('userType');
    localStorage.removeItem('garageToken');
    localStorage.removeItem('authToken');
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    // Clear any cookies (if any)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Show user-friendly message
    alert('Your session has expired. Please log in again.');
    
    // Redirect to login page
    if (navigate) {
      navigate('/login', { replace: true });
    } else {
      // Fallback: redirect using window.location
      window.location.href = '/login';
    }
    
    return true; // Token error was handled
  }
  
  return false; // Not a token error
};

/**
 * Wrapper function for API calls that automatically handles token errors
 * @param {Function} apiCall - The API function to call
 * @param {Function} navigate - React Router navigate function
 * @returns {Promise} - The API call result
 */
export const withTokenValidation = async (apiCall, navigate) => {
  try {
    return await apiCall();
  } catch (error) {
    // Check if it's a token error and handle it
    const tokenErrorHandled = handleTokenError(error, navigate);
    
    if (!tokenErrorHandled) {
      // If it's not a token error, re-throw the error
      throw error;
    }
    
    // If token error was handled, return a rejected promise
    return Promise.reject(new Error('Session expired'));
  }
};

/**
 * Creates an axios interceptor for automatic token validation
 * @param {Function} navigate - React Router navigate function
 * @returns {Object} - Axios interceptor configuration
 */
export const createTokenValidationInterceptor = (navigate) => {
  return {
    response: {
      onRejected: (error) => {
        handleTokenError(error, navigate);
        return Promise.reject(error);
      }
    }
  };
};
