# WhatsApp Business API Setup Guide

## Overview
This guide will help you set up WhatsApp Business API integration to send PDF invoices directly via WhatsApp from your garage management application.

## Prerequisites
- A Facebook Developer Account
- A WhatsApp Business Account
- A verified business phone number
- Meta Business Account (optional but recommended)

## Step-by-Step Setup

### 1. Create Facebook Developer Account
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Get Started" and log in with your Facebook account
3. Complete the developer verification process

### 2. Create a WhatsApp Business App
1. In the Developer Console, click "Create App"
2. Select "Business" as the app type
3. Fill in your app details:
   - App Name: "Your Garage Name - WhatsApp Business"
   - App Contact Email: Your business email
   - Business Account: Select your business account (if you have one)

### 3. Add WhatsApp Product
1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Complete the setup process

### 4. Configure WhatsApp Business
1. Go to WhatsApp > Getting Started
2. Add your business phone number
3. Verify the phone number using the code sent via SMS
4. Set up your business profile:
   - Business Name
   - Business Description
   - Business Address
   - Business Category

### 5. Get API Credentials
1. In WhatsApp > Configuration, you'll find:
   - **Phone Number ID**: A long number (e.g., 123456789012345)
   - **Access Token**: A long string starting with "EAA..." (click "Generate" if needed)

### 6. Configure Webhook (Optional but Recommended)
1. In WhatsApp > Configuration > Webhook
2. Set Callback URL: `https://your-domain.com/api/whatsapp/webhook`
3. Set Verify Token: Create a random string
4. Subscribe to messages and message_deliveries

### 7. Configure in Your App
1. In your garage management app, click "Configure WhatsApp"
2. Enter your Phone Number ID and Access Token
3. Click "Save Configuration"

## API Limits and Pricing

### Free Tier (First 1000 messages/month)
- 1000 free conversations per month
- Messages must be initiated by the customer within 24 hours

### Business Tier
- $0.0050 per conversation after free tier
- Higher rate limits
- Priority support

## Message Types Supported

### Text Messages
- Basic text with formatting (bold, italic, etc.)
- Emojis and special characters

### Document Messages (PDF Invoices)
- File size: Up to 100 MB
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Caption: Up to 1024 characters

### Media Messages
- Images, videos, audio files
- File size: Up to 16 MB

## Testing Your Integration

### 1. Test with Your Own Number
- Add your personal WhatsApp number as a test contact
- Send a test invoice to yourself

### 2. Test with Business Contacts
- Send invoices to verified business contacts
- Monitor delivery status and responses

### 3. Check API Responses
- Monitor your app's console for API responses
- Verify message delivery status

## Troubleshooting

### Common Issues

#### "Invalid phone number format"
- Ensure phone numbers include country code (e.g., 91 for India)
- Remove any special characters or spaces

#### "Access token expired"
- Generate a new access token in Meta Developer Console
- Update your app configuration

#### "Message not delivered"
- Check if the recipient has blocked your business
- Verify your business account status
- Check API rate limits

#### "File too large"
- Ensure PDF files are under 100 MB
- Compress large files if necessary

### Error Codes
- `100`: Invalid parameter
- `102`: Invalid phone number
- `131`: Invalid access token
- `132`: Phone number not verified
- `133`: Business account not verified

## Security Best Practices

### 1. Secure Your Access Token
- Never expose your access token in client-side code
- Store tokens securely in environment variables
- Rotate tokens regularly

### 2. Validate Input
- Always validate phone numbers before sending
- Sanitize message content
- Implement rate limiting

### 3. Monitor Usage
- Track API calls and costs
- Set up alerts for unusual activity
- Monitor delivery success rates

## Support and Resources

### Official Documentation
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta for Developers](https://developers.facebook.com/)

### Community Support
- [Meta Developer Community](https://developers.facebook.com/community/)
- [WhatsApp Business API Forum](https://developers.facebook.com/community/groups/WhatsAppBusinessAPI/)

### Business Support
- [Meta Business Support](https://business.facebook.com/support/)
- [WhatsApp Business Support](https://business.whatsapp.com/support)

## Next Steps

After setting up WhatsApp Business API:

1. **Test thoroughly** with your own number first
2. **Train your team** on the new functionality
3. **Monitor performance** and delivery rates
4. **Collect feedback** from customers
5. **Optimize** message content and timing

## Need Help?

If you encounter issues during setup:

1. Check this guide first
2. Review Meta's official documentation
3. Contact Meta Business Support
4. Reach out to your development team

---

**Note**: WhatsApp Business API is a powerful tool that can significantly improve customer communication. Take time to set it up correctly and test thoroughly before going live with customers.
