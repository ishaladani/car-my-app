// Test file for authUtils.js
// This demonstrates how the token validation utility works

import { handleTokenError, withTokenValidation } from '../authUtils';

// Mock navigate function
const mockNavigate = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock sessionStorage
const mockSessionStorage = {
  clear: jest.fn()
};

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
});

// Mock window.location
delete window.location;
window.location = { href: '' };

// Mock alert
global.alert = jest.fn();

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });
  });

  describe('handleTokenError', () => {
    it('should handle "Token missing" error', () => {
      const error = {
        response: {
          data: {
            message: 'Token missing'
          },
          status: 401
        }
      };

      const result = handleTokenError(error, mockNavigate);

      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('garageId');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('name');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userType');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('garageToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockSessionStorage.clear).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Your session has expired. Please log in again.');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('should handle "Invalid token" error', () => {
      const error = {
        response: {
          data: {
            message: 'Invalid token'
          },
          status: 401
        }
      };

      const result = handleTokenError(error, mockNavigate);

      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('should handle 401 status code', () => {
      const error = {
        response: {
          status: 401
        }
      };

      const result = handleTokenError(error, mockNavigate);

      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('should handle 403 status code', () => {
      const error = {
        response: {
          status: 403
        }
      };

      const result = handleTokenError(error, mockNavigate);

      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('should not handle non-token errors', () => {
      const error = {
        response: {
          data: {
            message: 'Network error'
          },
          status: 500
        }
      };

      const result = handleTokenError(error, mockNavigate);

      expect(result).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('withTokenValidation', () => {
    it('should return API result when no error occurs', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'success' });

      const result = await withTokenValidation(mockApiCall, mockNavigate);

      expect(result).toEqual({ data: 'success' });
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should handle token errors and redirect', async () => {
      const tokenError = {
        response: {
          data: {
            message: 'Token missing'
          },
          status: 401
        }
      };
      const mockApiCall = jest.fn().mockRejectedValue(tokenError);

      await expect(withTokenValidation(mockApiCall, mockNavigate)).rejects.toThrow('Session expired');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('should re-throw non-token errors', async () => {
      const networkError = new Error('Network error');
      const mockApiCall = jest.fn().mockRejectedValue(networkError);

      await expect(withTokenValidation(mockApiCall, mockNavigate)).rejects.toThrow('Network error');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

// Example usage demonstration
console.log(`
Example usage in a React component:

import { withTokenValidation, handleTokenError } from '../utils/authUtils';

const MyComponent = () => {
  const navigate = useNavigate();

  const fetchData = async () => {
    const apiCall = async () => {
      return await axios.get('/api/data', {
        headers: {
          Authorization: \`Bearer \${localStorage.getItem('token')}\`
        }
      });
    };

    try {
      const response = await withTokenValidation(apiCall, navigate);
      // Handle successful response
      console.log(response.data);
    } catch (error) {
      // Error is already handled by withTokenValidation
      // Only non-token errors reach here
      console.error('Non-token error:', error);
    }
  };

  return <div>My Component</div>;
};
`);
