import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Build the from address with display name
function getFromAddress() {
  const email = process.env.RESEND_FROM_EMAIL || 'noreply@tenisdp.es'
  return 'Tenis del Parque <' + email + '>'
}

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
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [to],
      subject: subject,
      html: html,
      text: text
    })

    if (error) {
      console.error('[Email] Resend API error for ' + to + ':', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }
    
    console.log('[Email] Sent to ' + to + ':', data?.id)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[Email] Network/unexpected error for ' + to + ':', err)
    return { success: false, error: err.message }
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
  const resetUrl = appDomain + '/' + locale + '/reset-password?token=' + resetToken
  
  // Get email content based on locale
  const content = getPasswordResetEmailContent(resetUrl, locale)
  
  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text
    })
    
    if (error) {
      console.error('[Email] Password reset Resend API error:', error)
      return { success: false, error }
    }

    console.log('[Email] Password reset sent to ' + email + ':', data?.id)
    return { success: true, result: data }
  } catch (err) {
    console.error('[Email] Password reset network error:', err)
    return { success: false, error: err }
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
  
  const subject = isSpanish 
    ? 'Restablecer tu contrase\u00f1a - Tenis del Parque'
    : 'Reset your password - Tenis del Parque'
  
  const title = isSpanish ? 'Restablecer Contrase\u00f1a' : 'Reset Password'
  const intro = isSpanish
    ? 'Hemos recibido una solicitud para restablecer tu contrase\u00f1a. Si no solicitaste este cambio, puedes ignorar este email.'
    : "We received a request to reset your password. If you didn't request this change, you can safely ignore this email."
  const instruction = isSpanish
    ? 'Para restablecer tu contrase\u00f1a, haz clic en el siguiente bot\u00f3n:'
    : 'To reset your password, click the button below:'
  const buttonText = isSpanish ? 'Restablecer Contrase\u00f1a' : 'Reset Password'
  const importantLabel = isSpanish ? 'Importante:' : 'Important:'
  const importantText = isSpanish
    ? 'Este enlace expirar\u00e1 en 1 hora por motivos de seguridad. Si necesitas m\u00e1s tiempo, solicita un nuevo enlace de restablecimiento.'
    : 'This link will expire in 1 hour for security reasons. If you need more time, please request a new reset link.'
  const fallbackText = isSpanish
    ? 'Si el bot\u00f3n no funciona, copia y pega el siguiente enlace en tu navegador:'
    : "If the button doesn't work, copy and paste the following link into your browser:"
  const autoText = isSpanish
    ? 'Este email fue enviado autom\u00e1ticamente. Por favor no respondas a este mensaje.'
    : 'This email was sent automatically. Please do not reply to this message.'
  const supportText = isSpanish
    ? 'Si tienes problemas, contacta con nuestro soporte.'
    : 'If you have any issues, please contact our support team.'
  
  const html = [
    '<!DOCTYPE html>',
    '<html lang="' + locale + '">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>' + title + '</title>',
    '  <style>',
    '    body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }',
    '    .header { background: linear-gradient(135deg, #563380, #8FBF60); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }',
    '    .content { background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }',
    '    .button { display: inline-block; background: linear-gradient(135deg, #563380, #8FBF60); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; text-align: center; }',
    '    .footer { color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }',
    '    .warning { background: #fef3c7; border-left: 4px solid #8FBF60; padding: 15px; margin: 20px 0; border-radius: 4px; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <div class="header">',
    '    <h1>' + title + '</h1>',
    '    <p>Tenis del Parque</p>',
    '  </div>',
    '  <div class="content">',
    '    <p>' + intro + '</p>',
    '    <p>' + instruction + '</p>',
    '    <div style="text-align: center;">',
    '      <a href="' + resetUrl + '" class="button">' + buttonText + '</a>',
    '    </div>',
    '    <div class="warning">',
    '      <p><strong>' + importantLabel + '</strong></p>',
    '      <p>' + importantText + '</p>',
    '    </div>',
    '    <p>' + fallbackText + '</p>',
    '    <p style="word-break: break-all; color: #6b7280; font-size: 14px;">' + resetUrl + '</p>',
    '  </div>',
    '  <div class="footer">',
    '    <p>' + autoText + '</p>',
    '    <p>' + supportText + '</p>',
    '  </div>',
    '</body>',
    '</html>'
  ].join('\n')
  
  const textContent = isSpanish
    ? 'Restablecer Contrase\u00f1a - Tenis del Parque\n\n' + intro + '\n\nPara restablecer tu contrase\u00f1a, visita el siguiente enlace:\n' + resetUrl + '\n\nIMPORTANTE: ' + importantText + '\n\n' + supportText + '\n\n' + autoText
    : 'Reset Password - Tenis del Parque\n\n' + intro + '\n\nTo reset your password, visit the following link:\n' + resetUrl + '\n\nIMPORTANT: ' + importantText + '\n\n' + supportText + '\n\n' + autoText
  
  return { subject, html, text: textContent }
}

export default resend
