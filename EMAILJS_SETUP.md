# EmailJS Setup Guide

## How to Fix the "Public Key is invalid" Error

The error you're seeing occurs because EmailJS is not properly configured with your actual credentials. Follow these steps to fix it:

### Step 1: Get Your EmailJS Credentials

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin/account)
2. Sign in to your EmailJS account (or create one if you don't have it)
3. From the dashboard, you'll need to get:
   - **Public Key** (found in Account > API Keys)
   - **Service ID** (found in Email Services)
   - **Template ID** (found in Email Templates)

### Step 2: Update the Configuration

Open the file `src/config/emailjs.js` and replace the placeholder values:

```javascript
export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'your_actual_public_key_here',     // Replace this
  SERVICE_ID: 'your_actual_service_id_here',     // Replace this  
  TEMPLATE_ID: 'your_actual_template_id_here'    // Replace this
};
```

### Step 3: Create EmailJS Service

1. In EmailJS Dashboard, go to "Email Services"
2. Add a new service (Gmail, Outlook, etc.)
3. Note down the Service ID

### Step 4: Create Email Template

1. In EmailJS Dashboard, go to "Email Templates"
2. Create a new template with variables:
   - `{{to_email}}` - recipient email
   - `{{subject}}` - email subject
   - `{{message}}` - email message
   - `{{attachment}}` - PDF attachment (base64)
3. Note down the Template ID

### Step 5: Test the Email Function

After updating the credentials, restart your development server and test the email functionality.

## Example Email Template

Here's an example of what your EmailJS template might look like:

```html
Subject: {{subject}}

Dear Customer,

{{message}}

Please find your invoice attached.

Best regards,
Your Service Team

[PDF attachment will be automatically included]
```

## Troubleshooting

- **"Public Key is invalid"**: Make sure you've copied the correct public key from your EmailJS dashboard
- **"Service ID not found"**: Verify your service ID in the Email Services section
- **"Template ID not found"**: Check your template ID in the Email Templates section
- **Email not sending**: Ensure your email service (Gmail, etc.) is properly configured

## Security Note

Never commit your actual EmailJS credentials to version control. Consider using environment variables for production deployments. 