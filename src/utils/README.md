# Authentication Utilities

This directory contains utility functions for handling authentication and token validation across the application.

## Files

- `authUtils.js` - Main authentication utility functions
- `__tests__/authUtils.test.js` - Test file demonstrating usage

## Functions

### `handleTokenError(error, navigate)`

Handles token-related errors and automatically logs out the user.

**Parameters:**
- `error` - The error object from API response
- `navigate` - React Router navigate function

**Returns:** `boolean` - Returns `true` if token error was handled, `false` otherwise

**What it does:**
- Detects token-related errors (Token missing, Invalid token, 401, 403)
- Clears all authentication data from localStorage and sessionStorage
- Shows user-friendly message
- Redirects to login page

### `withTokenValidation(apiCall, navigate)`

Wrapper function for API calls that automatically handles token errors.

**Parameters:**
- `apiCall` - The API function to call (should return a Promise)
- `navigate` - React Router navigate function

**Returns:** `Promise` - The API call result

**What it does:**
- Executes the API call
- If token error occurs, handles it automatically
- Re-throws non-token errors for normal error handling

## Usage Examples

### Basic API Call with Token Validation

```javascript
import { withTokenValidation } from '../utils/authUtils';

const fetchUserData = async () => {
  const apiCall = async () => {
    return await axios.get('/api/user', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  };

  try {
    const response = await withTokenValidation(apiCall, navigate);
    // Handle successful response
    setUserData(response.data);
  } catch (error) {
    // Only non-token errors reach here
    console.error('Error:', error);
  }
};
```

### Manual Token Error Handling

```javascript
import { handleTokenError } from '../utils/authUtils';

const handleApiError = (error) => {
  const tokenErrorHandled = handleTokenError(error, navigate);
  
  if (!tokenErrorHandled) {
    // Handle non-token errors
    setError(error.message);
  }
  // Token errors are automatically handled
};
```

### In JobCards Component

The JobCards component now uses these utilities for all API calls:

```javascript
// Fetch job card data
const apiCall = async () => {
  return await axios.get(`/api/garage/jobCards/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

const response = await withTokenValidation(apiCall, navigate);
```

## Error Detection

The utility detects the following as token errors:
- Error messages containing: "token missing", "invalid token", "unauthorized", "token expired"
- HTTP status codes: 401, 403

## Automatic Cleanup

When a token error is detected, the utility automatically:
1. Removes all authentication tokens from localStorage
2. Clears sessionStorage
3. Clears authentication cookies
4. Shows user-friendly message
5. Redirects to login page

## Integration

To use these utilities in other components:

1. Import the functions:
   ```javascript
   import { withTokenValidation, handleTokenError } from '../utils/authUtils';
   ```

2. Wrap your API calls:
   ```javascript
   const response = await withTokenValidation(apiCall, navigate);
   ```

3. Or handle errors manually:
   ```javascript
   const tokenErrorHandled = handleTokenError(error, navigate);
   ```

This ensures consistent token validation and automatic logout across the entire application.
