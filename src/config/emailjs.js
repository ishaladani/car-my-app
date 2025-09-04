// EmailJS Configuration
// Replace these values with your actual EmailJS credentials from https://dashboard.emailjs.com/admin/account

export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'YOUR_ACTUAL_PUBLIC_KEY', // Replace with your actual public key from EmailJS dashboard (e.g., 'user_xxxxxxxxxxxxxxxx')
  SERVICE_ID: 'YOUR_ACTUAL_SERVICE_ID', // Replace with your actual service ID from EmailJS dashboard (e.g., 'service_xxxxxxxx')
  TEMPLATE_ID: 'YOUR_ACTUAL_TEMPLATE_ID' // Replace with your actual template ID from EmailJS dashboard (e.g., 'template_xxxxxxxx')
};

// Example of what it should look like after configuration:
// export const EMAILJS_CONFIG = {
//   PUBLIC_KEY: 'user_abc123def456ghi789',
//   SERVICE_ID: 'service_xyz789uvw456rst123',
//   TEMPLATE_ID: 'template_mno456pqr789stu123'
// };

// Check if EmailJS is properly configured
export const isEmailJSConfigured = () => {
  return EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_ACTUAL_PUBLIC_KEY' &&
         EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_ACTUAL_SERVICE_ID' &&
         EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_ACTUAL_TEMPLATE_ID';
};

// Initialize EmailJS
export const initEmailJS = () => {
  if (typeof window !== 'undefined' && window.emailjs && isEmailJSConfigured()) {
    try {
      window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
  } else if (!isEmailJSConfigured()) {
    console.warn('EmailJS not configured. Please update EMAILJS_CONFIG in src/config/emailjs.js');
  }
}; 