// Welcome Email Template for Tennis League Registration
// File: lib/email/templates/welcomeEmail.js

export const welcomeEmailTemplate = {
  es: {
    subject: '🎾 Bienvenido a {leagueName} - Información importante',
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a {leagueName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #563380, #8FBF60); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; }
        .info-box { background-color: #D5D3C3; padding: 20px; border-radius: 8px; margin: 15px 0; }
        .button { display: inline-block; background-color: #563380; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .emoji { font-size: 18px; margin-right: 8px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .highlight-box { background-color: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #563380; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎾 ¡Bienvenido a {leagueName}!</h1>
            <p>Gracias por registrarte, {playerName}</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Registration Summary -->
            <div class="section">
                <h2>📋 Resumen de tu registro:</h2>
                <div class="info-box">
                    <p><strong>Nombre:</strong> {playerName}</p>
                    <p><strong>Nivel:</strong> {playerLevel}</p>
                    <p><strong>Email:</strong> {playerEmail}</p>
                    <p><strong>WhatsApp:</strong> {playerWhatsApp}</p>
                    <p><strong>Liga:</strong> {leagueName}</p>
                </div>
            </div>

            <!-- What Happens Next -->
            <div class="section">
                <h2>🎯 ¿Qué pasa ahora?</h2>
                
                {waitingListContent}
                
                {activeLeagueContent}
            </div>

            <!-- Timeline -->
            <div class="section">
                <h2>📅 Timeline previsto:</h2>
                <ul>
                    {timelineItems}
                </ul>
            </div>

            <!-- Help Us Complete -->
            {helpSection}

            <!-- Contact Info -->
            <div class="section">
                <h2>📞 ¿Necesitas ayuda?</h2>
                <p>Si tienes cualquier pregunta, no dudes en contactarnos:</p>
                <ul>
                    <li>📧 Email: admin@tenisdelparque.com</li>
                    <li>📱 WhatsApp: +34-XXX-XXX-XXX</li>
                    <li>🌐 Web: tenisdelparque.com</li>
                </ul>
            </div>

            <!-- Call to Action -->
            <div class="section" style="text-align: center;">
                {ctaButtons}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>¡Nos vemos en las pistas! 🚀</p>
            <p><strong>Equipo Tenis del Parque</strong></p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #888;">
                Este email fue enviado porque te registraste en {leagueName}.<br>
                Si no deseas recibir más emails, <a href="{unsubscribeUrl}" style="color: #563380;">haz clic aquí</a>.
            </p>
        </div>
    </div>
</body>
</html>
    `,

    // Dynamic content templates
    waitingListContent: `
                <div class="info-box">
                    <h3>🎾 ¡Bienvenido a la comunidad!</h3>
                    <p>Te has registrado exitosamente. Estamos preparando una liga increíble:</p>
                    <ul>
                        <li><span class="emoji">🏆</span><strong>Liga profesional:</strong> Sistema Swiss + Playoffs</li>
                        <li><span class="emoji">📊</span><strong>Rankings ELO:</strong> Seguimiento de tu progreso</li>
                        <li><span class="emoji">👥</span><strong>Comunidad:</strong> Jugadores de tu nivel</li>
                    </ul>
                    <p>Te contactaremos por WhatsApp cuando todo esté listo para empezar.</p>
                </div>
    `,

    activeLeagueContent: `
                <div class="info-box">
                    <h3>✅ ¡Tu liga está confirmada!</h3>
                    <p>¡Genial! Todo está preparado para que empieces a jugar:</p>
                    <ul>
                        <li><span class="emoji">🎾</span><strong>Liga confirmada</strong> y lista para empezar</li>
                        <li><span class="emoji">📅</span><strong>Fecha de inicio:</strong> {startDate}</li>
                        <li><span class="emoji">📱</span><strong>Te contactaremos pronto</strong> por WhatsApp para crear tu cuenta</li>
                    </ul>
                </div>
    `,

    helpSection: `
            <div class="section">
                <div class="highlight-box">
                    <h3 style="margin-top: 0;">🤝 ¡Invita a tus amigos!</h3>
                    <p>¿Conoces otros jugadores que podrían estar interesados? ¡La liga será aún más divertida con más gente!</p>
                    <p><strong>Comparte este enlace:</strong></p>
                    <p><a href="{shareUrl}" style="color: #563380; word-break: break-all;">{shareUrl}</a></p>
                    <p style="margin-bottom: 0;"><em>Cuantos más seamos, ¡mejor será la experiencia para todos!</em></p>
                </div>
            </div>
    `
  },

  en: {
    subject: '🎾 Welcome to {leagueName} - Important information',
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {leagueName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #563380, #8FBF60); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; }
        .info-box { background-color: #D5D3C3; padding: 20px; border-radius: 8px; margin: 15px 0; }
        .button { display: inline-block; background-color: #563380; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .emoji { font-size: 18px; margin-right: 8px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .highlight-box { background-color: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #563380; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎾 Welcome to {leagueName}!</h1>
            <p>Thanks for signing up, {playerName}</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Registration Summary -->
            <div class="section">
                <h2>📋 Registration Summary:</h2>
                <div class="info-box">
                    <p><strong>Name:</strong> {playerName}</p>
                    <p><strong>Level:</strong> {playerLevel}</p>
                    <p><strong>Email:</strong> {playerEmail}</p>
                    <p><strong>WhatsApp:</strong> {playerWhatsApp}</p>
                    <p><strong>League:</strong> {leagueName}</p>
                </div>
            </div>

            <!-- What Happens Next -->
            <div class="section">
                <h2>🎯 What happens next?</h2>
                
                {waitingListContent}
                
                {activeLeagueContent}
            </div>

            <!-- Timeline -->
            <div class="section">
                <h2>📅 Expected Timeline:</h2>
                <ul>
                    {timelineItems}
                </ul>
            </div>

            <!-- Help Us Complete -->
            {helpSection}

            <!-- Contact Info -->
            <div class="section">
                <h2>📞 Need help?</h2>
                <p>If you have any questions, don't hesitate to contact us:</p>
                <ul>
                    <li>📧 Email: admin@tenisdelparque.com</li>
                    <li>📱 WhatsApp: +34-XXX-XXX-XXX</li>
                    <li>🌐 Web: tenisdelparque.com</li>
                </ul>
            </div>

            <!-- Call to Action -->
            <div class="section" style="text-align: center;">
                {ctaButtons}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>See you on the courts! 🚀</p>
            <p><strong>Tenis del Parque Team</strong></p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #888;">
                This email was sent because you registered for {leagueName}.<br>
                If you don't want to receive more emails, <a href="{unsubscribeUrl}" style="color: #563380;">click here</a>.
            </p>
        </div>
    </div>
</body>
</html>
    `,

    waitingListContent: `
                <div class="info-box">
                    <h3>🎾 Welcome to the community!</h3>
                    <p>You have successfully registered. We are preparing an amazing league:</p>
                    <ul>
                        <li><span class="emoji">🏆</span><strong>Professional league:</strong> Swiss system + Playoffs</li>
                        <li><span class="emoji">📊</span><strong>ELO Rankings:</strong> Track your progress</li>
                        <li><span class="emoji">👥</span><strong>Community:</strong> Players at your level</li>
                    </ul>
                    <p>We'll contact you via WhatsApp when everything is ready to start.</p>
                </div>
    `,

    activeLeagueContent: `
                <div class="info-box">
                    <h3>✅ Your league is confirmed!</h3>
                    <p>Great! Everything is ready for you to start playing:</p>
                    <ul>
                        <li><span class="emoji">🎾</span><strong>League confirmed</strong> and ready to start</li>
                        <li><span class="emoji">📅</span><strong>Start date:</strong> {startDate}</li>
                        <li><span class="emoji">📱</span><strong>We'll contact you soon</strong> via WhatsApp to create your account</li>
                    </ul>
                </div>
    `,

    helpSection: `
            <div class="section">
                <div class="highlight-box">
                    <h3 style="margin-top: 0;">🤝 Invite your friends!</h3>
                    <p>Do you know other players who might be interested? The league will be even more fun with more people!</p>
                    <p><strong>Share this link:</strong></p>
                    <p><a href="{shareUrl}" style="color: #563380; word-break: break-all;">{shareUrl}</a></p>
                    <p style="margin-bottom: 0;"><em>The more players we have, the better the experience for everyone!</em></p>
                </div>
            </div>
    `
  }
}

// Email generation function
export function generateWelcomeEmail(playerData, leagueData, options = {}) {
  const {
    playerName,
    playerEmail, 
    playerWhatsApp,
    playerLevel,
    language = 'es'
  } = playerData

  const {
    leagueName,
    leagueStatus,
    expectedStartDate,
    whatsappGroupLink,
    shareUrl
  } = leagueData

  const {
    unsubscribeUrl = '#',
    adminContact = '+34-XXX-XXX-XXX'
  } = options

  const template = welcomeEmailTemplate[language]
  const isWaitingList = leagueStatus === 'coming_soon'

  // Generate dynamic content based on league status
  let dynamicContent = {}
  
  if (isWaitingList) {
    dynamicContent.waitingListContent = template.waitingListContent
    dynamicContent.activeLeagueContent = ''
    dynamicContent.helpSection = template.helpSection
    
    dynamicContent.timelineItems = language === 'es' ? `
      <li>Estamos preparando todos los detalles de la liga</li>
      <li>Te contactaremos por WhatsApp cuando esté todo listo</li>
      <li>Recibirás enlace para crear tu cuenta</li>
      <li>Inicio estimado: ${formatDate(expectedStartDate, language)}</li>
      <li>¡Prepárate para una experiencia increíble!</li>
    ` : `
      <li>We're preparing all the league details</li>
      <li>We'll contact you via WhatsApp when everything is ready</li>
      <li>You'll receive link to create your account</li>
      <li>Estimated start: ${formatDate(expectedStartDate, language)}</li>
      <li>Get ready for an amazing experience!</li>
    `
    
  } else {
    dynamicContent.waitingListContent = ''
    dynamicContent.activeLeagueContent = template.activeLeagueContent  
    dynamicContent.helpSection = template.helpSection
    
    dynamicContent.timelineItems = language === 'es' ? `
      <li>Te contactaremos por WhatsApp en los próximos días</li>
      <li>Recibirás enlace para crear tu cuenta</li>
      <li>Podrás programar tus primeros partidos</li>
      <li>Inicio de liga: ${formatDate(expectedStartDate, language)}</li>
      <li>¡Que empiece la diversión!</li>
    ` : `
      <li>We'll contact you via WhatsApp in the next few days</li>
      <li>You'll receive link to create your account</li>
      <li>You'll be able to schedule your first matches</li>
      <li>League starts: ${formatDate(expectedStartDate, language)}</li>
      <li>Let the fun begin!</li>
    `
  }
  
  // Call to action buttons
  dynamicContent.ctaButtons = ''
  if (whatsappGroupLink) {
    dynamicContent.ctaButtons += `
      <a href="${whatsappGroupLink}" class="button">
        ${language === 'es' ? '💬 Únete al Grupo' : '💬 Join Group'}
      </a>
    `
  }
  if (shareUrl) {
    dynamicContent.ctaButtons += `
      <a href="${shareUrl}" class="button">
        ${language === 'es' ? '📤 Compartir con Amigos' : '📤 Share with Friends'}
      </a>
    `
  }

  // Replace all placeholders in the template
  let emailHtml = template.html
  let emailSubject = template.subject

  const replacements = {
    '{playerName}': playerName,
    '{playerEmail}': playerEmail,
    '{playerWhatsApp}': playerWhatsApp,
    '{playerLevel}': capitalizeFirst(playerLevel),
    '{leagueName}': leagueName,
    '{startDate}': formatDate(expectedStartDate, language),
    '{shareUrl}': shareUrl || '#',
    '{unsubscribeUrl}': unsubscribeUrl,
    '{adminContact}': adminContact,
    ...dynamicContent
  }

  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g')
    emailHtml = emailHtml.replace(regex, value || '')
    emailSubject = emailSubject.replace(regex, value || '')
  })

  return {
    subject: emailSubject,
    html: emailHtml,
    text: htmlToText(emailHtml) // Simple text version
  }
}

// Utility functions
function formatDate(dateString, language = 'es') {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function htmlToText(html) {
  // Simple HTML to text conversion for fallback
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}
