// Simple EmailJS Configuration for Frontend-Only Email
// This uses EmailJS's default service for quick testing

export const EMAILJS_SIMPLE_CONFIG = {
  // Use EmailJS's default service (no setup required)
  SERVICE_ID: 'default_service', // EmailJS provides this by default
  TEMPLATE_ID: 'template_123456', // You'll get this when you create a template
  PUBLIC_KEY: 'your_public_key_here' // Get this from EmailJS dashboard
};

// Initialize EmailJS with the public key
export const initSimpleEmailJS = () => {
  if (typeof window !== 'undefined' && window.emailjs) {
    window.emailjs.init(EMAILJS_SIMPLE_CONFIG.PUBLIC_KEY);
  }
}; 