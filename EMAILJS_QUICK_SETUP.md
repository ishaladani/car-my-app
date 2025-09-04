# 🚀 EmailJS Quick Setup Guide

## Option 1: Full Setup (Recommended)

### 1. Create EmailJS Account
- Go to: https://dashboard.emailjs.com/admin/account
- Sign up with your email
- Verify your account

### 2. Get Public Key
- Dashboard → Account → API Keys
- Copy your Public Key (starts with `user_`)

### 3. Add Email Service
- Dashboard → Email Services → Add New Service
- Choose Gmail/Outlook/Your Provider
- Follow setup instructions
- Copy Service ID (starts with `service_`)

### 4. Create Email Template
- Dashboard → Email Templates → Create New Template
- Use this template:

```html
Subject: {{subject}}

Dear {{customer_name}},

{{message}}

Invoice Details:
- Invoice Number: {{invoice_number}}
- Total Amount: ₹{{total_amount}}
- Service Provider: {{garage_name}}

Please find your professional invoice attached.

Best regards,
{{garage_name}} Team
```

- Add these template variables:
  - `to_email`
  - `subject`
  - `message`
  - `invoice_number`
  - `customer_name`
  - `total_amount`
  - `garage_name`
  - `attachment`
  - `attachment_name`

- Copy Template ID (starts with `template_`)

### 5. Update Configuration
Replace the values in `src/config/emailjs.js`:

```javascript
export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'your_actual_public_key_here',
  SERVICE_ID: 'your_actual_service_id_here',
  TEMPLATE_ID: 'your_actual_template_id_here'
};
```

## Option 2: Test with Default Service (Quick Test)

If you want to test quickly, EmailJS provides a default service:

1. Use these test values in `src/config/emailjs.js`:
```javascript
export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'your_public_key_from_dashboard',
  SERVICE_ID: 'default_service', // EmailJS default service
  TEMPLATE_ID: 'template_123456' // You'll need to create this template
};
```

2. Create a simple template with just basic variables:
   - `to_email`
   - `subject`
   - `message`
   - `attachment`

## 🔧 Troubleshooting

### "Public Key is invalid"
- Double-check your Public Key from EmailJS dashboard
- Ensure no extra spaces or characters

### "Service ID not found"
- Verify your Service ID in Email Services section
- Make sure the service is properly configured

### "Template ID not found"
- Check your Template ID in Email Templates section
- Ensure template includes all required variables

### Email not sending
- Check your email service configuration
- Verify template variables match what's being sent
- Check browser console for detailed error messages

## 📧 Template Variables Reference

The system sends these variables to your EmailJS template:

- `{{to_email}}` - Recipient email address
- `{{subject}}` - Email subject line
- `{{message}}` - Email message body
- `{{invoice_number}}` - Invoice number (e.g., "INV001")
- `{{customer_name}}` - Customer name
- `{{total_amount}}` - Total invoice amount
- `{{garage_name}}` - Garage/service provider name
- `{{attachment}}` - PDF attachment (base64 encoded)
- `{{attachment_name}}` - PDF filename (e.g., "Invoice_INV001.pdf")

## ✅ Testing Checklist

- [ ] EmailJS account created and verified
- [ ] Public Key copied from dashboard
- [ ] Email service configured and working
- [ ] Email template created with all variables
- [ ] Configuration updated in `src/config/emailjs.js`
- [ ] App restarted after configuration changes
- [ ] Test email sent successfully
- [ ] PDF attachment received properly

## 🆘 Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify all three credentials are correctly set
3. Test your EmailJS service independently
4. Ensure your email template includes all required variables
5. Check EmailJS dashboard for any service limits or issues

The most common issue is missing or incorrect credentials. Double-check all three values from your EmailJS dashboard.
