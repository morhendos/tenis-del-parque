# Resend Email Setup for Password Reset

This document explains how to set up the Resend email functionality for the "forgot password" feature in the Tenis del Parque application.

## Overview

The password reset system allows users to reset their forgotten passwords through email verification. The system includes:

- Forgot password request (sends email with reset link)
- Password reset form (validates token and updates password)
- Email templates in both English and Spanish
- Security features to prevent enumeration attacks

## Files Added/Modified

### New Files
- `lib/email/resend.js` - Resend email configuration and templates
- `lib/content/passwordResetContent.js` - UI content for forgot/reset password pages
- `app/[locale]/forgot-password/page.js` - Forgot password page UI
- `app/[locale]/reset-password/page.js` - Reset password page UI
- `app/api/auth/forgot-password/route.js` - API endpoint for password reset requests
- `app/api/auth/reset-password/route.js` - API endpoint for password updates

### Modified Files
- `app/api/admin/users/[id]/route.js` - Updated admin reset password to use Resend emails
- `package.json` - Added Resend dependency

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@tenisdp.es

# Required for generating reset URLs
NEXTAUTH_URL=https://tenisdp.es
# or for development:
# NEXTAUTH_URL=http://localhost:3000
```

## Getting Started with Resend

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Verify your domain**: Add and verify `tenisdp.es` as your sending domain in the Resend dashboard
3. **Get API Key**: Generate an API key from the Resend dashboard
4. **Configure environment**: Add the required environment variables

## Features

### Security Features
- **Token expiration**: Reset tokens expire after 1 hour
- **No email enumeration**: Always returns success regardless of whether email exists
- **Account status check**: Only sends emails to active accounts
- **Token uniqueness**: Reset tokens are generated with collision prevention

### Internationalization
- **Bilingual emails**: Email templates support both English and Spanish
- **User language preference**: Uses user's preferred language from their profile
- **Fallback locale**: Defaults to English if no preference is set

### Email Templates
- **Responsive design**: HTML emails work on all devices
- **Professional styling**: Clean, modern design with gradients and proper typography
- **Clear CTAs**: Prominent buttons for password reset actions
- **Security warnings**: Clear messaging about token expiration

## User Flow

1. **Forgot Password Request**:
   - User clicks "Forgot Password" on login page
   - Enters email address on forgot password page
   - System generates reset token and sends email
   - User sees success message (regardless of whether email exists)

2. **Password Reset**:
   - User clicks link in email
   - Redirected to reset password page with token
   - Enters new password (with confirmation)
   - Password is updated and user can log in

3. **Error Handling**:
   - Invalid/expired tokens show appropriate error messages
   - Password validation errors are clearly displayed
   - Fallback options provided for all error states

## API Endpoints

### POST /api/auth/forgot-password
Request password reset email.

**Body:**
```json
{
  "email": "user@example.com",
  "locale": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with this email exists, you will receive a password reset link within a few minutes."
}
```

### POST /api/auth/reset-password
Reset password with token.

**Body:**
```json
{
  "token": "RESET_TOKEN",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

## Testing

1. **Development Testing**: 
   - Use development environment variables
   - Test with real email addresses
   - Check spam folder for emails

2. **Production Deployment**:
   - Verify domain is properly configured in Resend
   - Test with real users
   - Monitor Resend dashboard for delivery stats

## Monitoring

- **Resend Dashboard**: Monitor email delivery, bounces, and complaints
- **Server Logs**: Check console logs for email sending errors
- **User Feedback**: Monitor support requests related to password reset issues

## Troubleshooting

### Common Issues

1. **Emails not being sent**:
   - Check RESEND_API_KEY is correct
   - Verify domain is verified in Resend dashboard
   - Check server logs for error messages

2. **Reset links not working**:
   - Verify NEXTAUTH_URL is correctly set
   - Check if tokens are expiring (1 hour limit)
   - Ensure URL encoding is handled properly

3. **Wrong language in emails**:
   - Check user preferences in database
   - Verify locale parameter is being passed correctly
   - Ensure fallback to English is working

### Debug Mode

In development, the admin password reset endpoint will include the reset token in the response for debugging purposes. This is automatically disabled in production.

## Next Steps

- Consider implementing rate limiting for password reset requests
- Add email analytics and tracking
- Consider implementing password reset history/audit logging
- Add email templates for other notifications (welcome, match reminders, etc.)