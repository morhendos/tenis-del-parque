import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Generic email sending function
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content
 * @param {string} params.text - Plain text content
 * @returns {Promise<Object>} - Email sending result
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Tenis del Parque <noreply@tenisdelparque.com>',
      to: [to],
      subject: subject,
      html: html,
      text: text
    })
    
    console.log('Email sent successfully:', result.id)
    return { success: true, id: result.id }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} locale - User's preferred language ('en' or 'es')
 * @returns {Promise<Object>} - Email sending result
 */
export async function sendPasswordResetEmail(email, resetToken, locale = 'en') {
  // Get the app domain from environment or fallback
  const appDomain = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
  const resetUrl = `${appDomain}/${locale}/reset-password?token=${resetToken}`
  
  // Get email content based on locale
  const content = getPasswordResetEmailContent(resetUrl, locale)
  
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@tenisdp.es',
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text
    })
    
    console.log('Password reset email sent successfully:', result)
    return { success: true, result }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}

/**
 * Get password reset email content based on locale
 * @param {string} resetUrl - Password reset URL
 * @param {string} locale - User's preferred language ('en' or 'es')
 * @returns {Object} - Email content with subject, html, and text
 */
function getPasswordResetEmailContent(resetUrl, locale) {
  const isSpanish = locale === 'es'
  
  return {
    subject: isSpanish 
      ? 'Restablecer tu contraseña - Tenis del Parque'
      : 'Reset your password - Tenis del Parque',
    
    html: `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isSpanish ? 'Restablecer Contraseña' : 'Reset Password'}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #563380, #8FBF60);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #563380, #8FBF60);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            color: #6b7280;
            font-size: 14px;
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #8FBF60;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${isSpanish ? 'Restablecer Contraseña' : 'Reset Password'}</h1>
          <p>${isSpanish ? 'Tenis del Parque' : 'Tenis del Parque'}</p>
        </div>
        
        <div class="content">
          <p>${isSpanish 
            ? 'Hemos recibido una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, puedes ignorar este email.'
            : 'We received a request to reset your password. If you didn\\'t request this change, you can safely ignore this email.'
          }</p>
          
          <p>${isSpanish 
            ? 'Para restablecer tu contraseña, haz clic en el siguiente botón:'
            : 'To reset your password, click the button below:'
          }</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">
              ${isSpanish ? 'Restablecer Contraseña' : 'Reset Password'}
            </a>
          </div>
          
          <div class="warning">
            <p><strong>${isSpanish ? 'Importante:' : 'Important:'}</strong></p>
            <p>${isSpanish 
              ? 'Este enlace expirará en 1 hora por motivos de seguridad. Si necesitas más tiempo, solicita un nuevo enlace de restablecimiento.'
              : 'This link will expire in 1 hour for security reasons. If you need more time, please request a new reset link.'
            }</p>
          </div>
          
          <p>${isSpanish 
            ? 'Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:'
            : 'If the button doesn\\'t work, copy and paste the following link into your browser:'
          }</p>
          
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">
            ${resetUrl}
          </p>
        </div>
        
        <div class="footer">
          <p>${isSpanish 
            ? 'Este email fue enviado automáticamente. Por favor no respondas a este mensaje.'
            : 'This email was sent automatically. Please do not reply to this message.'
          }</p>
          <p>${isSpanish 
            ? 'Si tienes problemas, contacta con nuestro soporte.'
            : 'If you have any issues, please contact our support team.'
          }</p>
        </div>
      </body>
      </html>
    `,
    
    text: isSpanish ? `
Restablecer Contraseña - Tenis del Parque

Hemos recibido una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, puedes ignorar este email.

Para restablecer tu contraseña, visita el siguiente enlace:
${resetUrl}

IMPORTANTE: Este enlace expirará en 1 hora por motivos de seguridad.

Si tienes problemas, contacta con nuestro soporte.

Este email fue enviado automáticamente. Por favor no respondas a este mensaje.
    ` : `
Reset Password - Tenis del Parque

We received a request to reset your password. If you didn't request this change, you can safely ignore this email.

To reset your password, visit the following link:
${resetUrl}

IMPORTANT: This link will expire in 1 hour for security reasons.

If you have any issues, please contact our support team.

This email was sent automatically. Please do not reply to this message.
    `
  }
}

export default resend