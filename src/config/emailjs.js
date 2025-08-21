// EmailJS Configuration
// Replace these values with your actual EmailJS credentials from https://dashboard.emailjs.com/admin/account

export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'YOUR_ACTUAL_PUBLIC_KEY', // Replace with your actual public key from EmailJS dashboard
  SERVICE_ID: 'YOUR_ACTUAL_SERVICE_ID', // Replace with your actual service ID from EmailJS dashboard
  TEMPLATE_ID: 'YOUR_ACTUAL_TEMPLATE_ID' // Replace with your actual template ID from EmailJS dashboard
};

// Initialize EmailJS
export const initEmailJS = () => {
  if (typeof window !== 'undefined' && window.emailjs) {
    window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }
}; 