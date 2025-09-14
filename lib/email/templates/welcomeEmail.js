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
        .progress-bar { background-color: #e0e0e0; height: 20px; border-radius: 10px; margin: 10px 0; }
        .progress-fill { background: linear-gradient(90deg, #8FBF60, #563380); height: 100%; border-radius: 10px; transition: width 0.3s ease; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .emoji { font-size: 18px; margin-right: 8px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
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

            <!-- League Progress (for waiting list) -->
            {progressSection}

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
                    <h3>⏳ Tu liga está en desarrollo</h3>
                    <p>Te has registrado exitosamente, pero necesitamos más jugadores para confirmar la liga:</p>
                    <ul>
                        <li><span class="emoji">🎯</span><strong>Objetivo:</strong> {targetPlayers} jugadores</li>
                        <li><span class="emoji">📊</span><strong>Registrados:</strong> {currentPlayers} jugadores</li>
                        <li><span class="emoji">⭐</span><strong>Necesitamos:</strong> {playersNeeded} jugadores más</li>
                    </ul>
                </div>
    `,

    activeLeagueContent: `
                <div class="info-box">
                    <h3>✅ Tu liga está confirmada</h3>
                    <p>¡Genial! Ya tenemos suficientes jugadores registrados:</p>
                    <ul>
                        <li><span class="emoji">👥</span><strong>Jugadores registrados:</strong> {currentPlayers}</li>
                        <li><span class="emoji">📅</span><strong>Fecha de inicio:</strong> {startDate}</li>
                        <li><span class="emoji">📱</span><strong>Te contactaremos pronto</strong> por WhatsApp para crear tu cuenta</li>
                    </ul>
                </div>
    `,

    progressSection: `
            <div class="section">
                <h3>📈 Progreso de la liga:</h3>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                    <span>Jugadores registrados</span>
                    <span><strong>{currentPlayers}/{targetPlayers}</strong></span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {progressPercentage}%;"></div>
                </div>
                <p style="font-size: 14px; color: #666;">Faltan {playersNeeded} jugadores para confirmar la liga</p>
            </div>
    `,

    helpSection: `
            <div class="section">
                <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #563380;">
                    <h3 style="margin-top: 0;">🤝 ¡Ayúdanos a completar la liga!</h3>
                    <p>¿Conoces otros jugadores de tu nivel que podrían estar interesados?</p>
                    <p><strong>Comparte este enlace con tus amigos:</strong></p>
                    <p><a href="{shareUrl}" style="color: #563380; word-break: break-all;">{shareUrl}</a></p>
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
        .progress-bar { background-color: #e0e0e0; height: 20px; border-radius: 10px; margin: 10px 0; }
        .progress-fill { background: linear-gradient(90deg, #8FBF60, #563380); height: 100%; border-radius: 10px; transition: width 0.3s ease; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .emoji { font-size: 18px; margin-right: 8px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
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

            <!-- League Progress (for waiting list) -->
            {progressSection}

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
                    <h3>⏳ Your league is in development</h3>
                    <p>You have successfully registered, but we need more players to confirm the league:</p>
                    <ul>
                        <li><span class="emoji">🎯</span><strong>Target:</strong> {targetPlayers} players</li>
                        <li><span class="emoji">📊</span><strong>Registered:</strong> {currentPlayers} players</li>
                        <li><span class="emoji">⭐</span><strong>We need:</strong> {playersNeeded} more players</li>
                    </ul>
                </div>
    `,

    activeLeagueContent: `
                <div class="info-box">
                    <h3>✅ Your league is confirmed</h3>
                    <p>Great! We already have enough registered players:</p>
                    <ul>
                        <li><span class="emoji">👥</span><strong>Registered players:</strong> {currentPlayers}</li>
                        <li><span class="emoji">📅</span><strong>Start date:</strong> {startDate}</li>
                        <li><span class="emoji">📱</span><strong>We'll contact you soon</strong> via WhatsApp to create your account</li>
                    </ul>
                </div>
    `,

    helpSection: `
            <div class="section">
                <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #563380;">
                    <h3 style="margin-top: 0;">🤝 Help us complete the league!</h3>
                    <p>Do you know other players of your level who might be interested?</p>
                    <p><strong>Share this link with your friends:</strong></p>
                    <p><a href="{shareUrl}" style="color: #563380; word-break: break-all;">{shareUrl}</a></p>
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
    currentPlayerCount = 0,
    targetPlayerCount = 40,
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
  const playersNeeded = Math.max(0, targetPlayerCount - currentPlayerCount)
  const progressPercentage = Math.round((currentPlayerCount / targetPlayerCount) * 100)

  // Generate dynamic content based on league status
  let dynamicContent = {}
  
  if (isWaitingList) {
    dynamicContent.waitingListContent = template.waitingListContent
    dynamicContent.activeLeagueContent = ''
    dynamicContent.progressSection = template.progressSection
    dynamicContent.helpSection = template.helpSection
    
    dynamicContent.timelineItems = language === 'es' ? `
      <li>Esperamos reunir ${targetPlayerCount} jugadores</li>
      <li>Te contactaremos por WhatsApp cuando esté confirmado</li>
      <li>Recibirás enlace para crear tu cuenta</li>
      <li>Inicio estimado: ${formatDate(expectedStartDate, language)}</li>
    ` : `
      <li>We're waiting to gather ${targetPlayerCount} players</li>
      <li>We'll contact you via WhatsApp when confirmed</li>
      <li>You'll receive link to create your account</li>
      <li>Estimated start: ${formatDate(expectedStartDate, language)}</li>
    `
    
    dynamicContent.ctaButtons = whatsappGroupLink ? `
      <a href="${whatsappGroupLink}" class="button">
        ${language === 'es' ? '💬 Únete al Grupo' : '💬 Join Group'}
      </a>
      <a href="${shareUrl}" class="button">
        ${language === 'es' ? '📤 Compartir' : '📤 Share'}
      </a>
    ` : ''
    
  } else {
    dynamicContent.waitingListContent = ''
    dynamicContent.activeLeagueContent = template.activeLeagueContent  
    dynamicContent.progressSection = ''
    dynamicContent.helpSection = ''
    
    dynamicContent.timelineItems = language === 'es' ? `
      <li>Te contactaremos por WhatsApp en los próximos días</li>
      <li>Recibirás enlace para crear tu cuenta</li>
      <li>Podrás programar tus primeros partidos</li>
      <li>Inicio de liga: ${formatDate(expectedStartDate, language)}</li>
    ` : `
      <li>We'll contact you via WhatsApp in the next few days</li>
      <li>You'll receive link to create your account</li>
      <li>You'll be able to schedule your first matches</li>
      <li>League starts: ${formatDate(expectedStartDate, language)}</li>
    `
    
    dynamicContent.ctaButtons = whatsappGroupLink ? `
      <a href="${whatsappGroupLink}" class="button">
        ${language === 'es' ? '💬 Únete al Grupo' : '💬 Join Group'}
      </a>
    ` : ''
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
    '{currentPlayers}': currentPlayerCount,
    '{targetPlayers}': targetPlayerCount,
    '{playersNeeded}': playersNeeded,
    '{progressPercentage}': progressPercentage,
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
