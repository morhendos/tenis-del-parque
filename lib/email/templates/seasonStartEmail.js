// Season Start Email Template
// Professional design with platform colors (purple #563380, yellow #E6E94E)
// Sent to all active players when Round 1 begins

export const seasonStartEmailTemplate = {
  es: {
    subject: '¡Comienza la temporada! Tu primer partido te espera',
    subjectBye: '¡Comienza la temporada! Tienes BYE en la Ronda 1',
    
    // Regular match email
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Comienza la temporada!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); color: white; padding: 40px 32px; text-align: center; }
        .header-badge { display: inline-block; background: #E6E94E; color: #563380; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 12px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 32px; }
        .greeting { font-size: 18px; color: #374151; margin-bottom: 24px; }
        .match-card { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #563380; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .match-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e9d5ff; }
        .round-badge { background: #563380; color: white; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; }
        .deadline { color: #7c3aed; font-size: 14px; font-weight: 500; }
        .vs-section { display: flex; align-items: center; justify-content: space-between; }
        .player-box { flex: 1; }
        .player-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .player-name { font-size: 18px; font-weight: 600; color: #1f2937; }
        .vs-divider { padding: 0 20px; font-size: 14px; color: #9ca3af; font-weight: 500; }
        .action-buttons { margin-top: 24px; }
        .button { display: inline-block; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; margin: 6px; }
        .button-primary { background: #563380; color: white !important; }
        .button-whatsapp { background: #22c55e; color: white !important; }
        .button-secondary { background: white; color: #563380 !important; border: 2px solid #563380; }
        .info-section { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .info-section h3 { margin: 0 0 12px 0; font-size: 16px; color: #1f2937; }
        .info-section p { margin: 0; color: #4b5563; font-size: 14px; }
        .checklist { list-style: none; padding: 0; margin: 16px 0; }
        .checklist li { padding: 8px 0; padding-left: 28px; position: relative; color: #4b5563; }
        .checklist li::before { content: ''; position: absolute; left: 0; top: 12px; width: 16px; height: 16px; background: #E6E94E; border-radius: 50%; }
        .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; color: #6b7280; font-size: 13px; }
        .footer a { color: #563380; }
        .social-link { display: inline-block; margin: 0 8px; color: #563380; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-badge">Temporada {season}</div>
            <h1>¡Comienza la competición!</h1>
            <p>{leagueName}</p>
        </div>

        <div class="content">
            <p class="greeting">Hola <strong>{playerName}</strong>,</p>
            
            <p>Ha llegado el momento. La temporada {season} de {leagueName} comienza oficialmente y tu primer partido ya está programado.</p>

            <div class="match-card">
                <div class="match-header">
                    <span class="round-badge">Ronda 1</span>
                    <span class="deadline">Fecha límite: {deadline}</span>
                </div>
                <div class="vs-section">
                    <div class="player-box">
                        <div class="player-label">Tú</div>
                        <div class="player-name">{playerName}</div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="player-box" style="text-align: right;">
                        <div class="player-label">Rival</div>
                        <div class="player-name">{opponentName}</div>
                    </div>
                </div>
                <div class="action-buttons" style="text-align: center;">
                    <a href="{whatsappLink}" class="button button-whatsapp">Contactar por WhatsApp</a>
                    <a href="{dashboardLink}" class="button button-secondary">Ver en mi cuenta</a>
                </div>
            </div>

            <div class="info-section">
                <h3>Próximos pasos</h3>
                <ul class="checklist">
                    <li>Contacta con tu rival para acordar día, hora y pista</li>
                    <li>Jugad el partido antes de la fecha límite</li>
                    <li>Registra el resultado en tu cuenta</li>
                </ul>
            </div>

            <div class="info-section">
                <h3>Recuerda</h3>
                <p>Tienes <strong>3 aplazamientos</strong> disponibles esta temporada. Cada uno extiende tu fecha límite 7 días adicionales. Úsalos solo cuando sea necesario.</p>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="{dashboardLink}" class="button button-primary">Acceder a mi cuenta</a>
            </div>
        </div>

        <div class="footer">
            <p style="margin-bottom: 12px;"><strong>Tenis del Parque</strong></p>
            <p>¿Preguntas? Escríbenos por <a href="https://wa.me/34652714328">WhatsApp</a> o visita <a href="https://tenisdp.es">tenisdp.es</a></p>
        </div>
    </div>
</body>
</html>
    `,

    // BYE match email
    htmlBye: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Comienza la temporada!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); color: white; padding: 40px 32px; text-align: center; }
        .header-badge { display: inline-block; background: #E6E94E; color: #563380; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 12px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 32px; }
        .greeting { font-size: 18px; color: #374151; margin-bottom: 24px; }
        .bye-card { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
        .bye-badge { display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
        .bye-title { font-size: 20px; font-weight: 600; color: #065f46; margin: 0 0 8px 0; }
        .bye-points { font-size: 32px; font-weight: 700; color: #10b981; margin: 16px 0; }
        .bye-points span { font-size: 16px; font-weight: 500; color: #065f46; }
        .bye-explanation { color: #047857; font-size: 14px; margin: 0; }
        .info-section { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .info-section h3 { margin: 0 0 12px 0; font-size: 16px; color: #1f2937; }
        .info-section p { margin: 0; color: #4b5563; font-size: 14px; }
        .button { display: inline-block; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; }
        .button-primary { background: #563380; color: white !important; }
        .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; color: #6b7280; font-size: 13px; }
        .footer a { color: #563380; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-badge">Temporada {season}</div>
            <h1>¡Comienza la competición!</h1>
            <p>{leagueName}</p>
        </div>

        <div class="content">
            <p class="greeting">Hola <strong>{playerName}</strong>,</p>
            
            <p>Ha llegado el momento. La temporada {season} de {leagueName} comienza oficialmente.</p>
            
            <p>En esta primera ronda tienes asignado un <strong>BYE</strong>, lo que significa que avanzas automáticamente sin necesidad de jugar partido.</p>

            <div class="bye-card">
                <div class="bye-badge">Ronda 1 - BYE</div>
                <h2 class="bye-title">Avance automático</h2>
                <div class="bye-points">+3 <span>puntos</span></div>
                <p class="bye-explanation">Recibes los puntos equivalentes a una victoria 2-0</p>
            </div>

            <div class="info-section">
                <h3>¿Por qué tengo un BYE?</h3>
                <p>Cuando hay un número impar de jugadores en la liga, el sistema asigna un BYE a un jugador cada ronda para que todos puedan participar. Es rotativo y justo para todos.</p>
            </div>

            <div class="info-section">
                <h3>¿Qué sigue?</h3>
                <p>Tu próximo partido será en la <strong>Ronda 2</strong>. Te notificaremos cuando se publiquen los emparejamientos. Mientras tanto, puedes seguir la clasificación y los resultados de otros partidos desde tu cuenta.</p>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="{dashboardLink}" class="button button-primary">Ver clasificación</a>
            </div>
        </div>

        <div class="footer">
            <p style="margin-bottom: 12px;"><strong>Tenis del Parque</strong></p>
            <p>¿Preguntas? Escríbenos por <a href="https://wa.me/34652714328">WhatsApp</a> o visita <a href="https://tenisdp.es">tenisdp.es</a></p>
        </div>
    </div>
</body>
</html>
    `
  },

  en: {
    subject: 'The season begins! Your first match awaits',
    subjectBye: 'The season begins! You have a BYE in Round 1',
    
    // Regular match email
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The season begins!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); color: white; padding: 40px 32px; text-align: center; }
        .header-badge { display: inline-block; background: #E6E94E; color: #563380; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 12px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 32px; }
        .greeting { font-size: 18px; color: #374151; margin-bottom: 24px; }
        .match-card { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #563380; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .match-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e9d5ff; }
        .round-badge { background: #563380; color: white; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; }
        .deadline { color: #7c3aed; font-size: 14px; font-weight: 500; }
        .vs-section { display: flex; align-items: center; justify-content: space-between; }
        .player-box { flex: 1; }
        .player-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .player-name { font-size: 18px; font-weight: 600; color: #1f2937; }
        .vs-divider { padding: 0 20px; font-size: 14px; color: #9ca3af; font-weight: 500; }
        .action-buttons { margin-top: 24px; }
        .button { display: inline-block; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; margin: 6px; }
        .button-primary { background: #563380; color: white !important; }
        .button-whatsapp { background: #22c55e; color: white !important; }
        .button-secondary { background: white; color: #563380 !important; border: 2px solid #563380; }
        .info-section { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .info-section h3 { margin: 0 0 12px 0; font-size: 16px; color: #1f2937; }
        .info-section p { margin: 0; color: #4b5563; font-size: 14px; }
        .checklist { list-style: none; padding: 0; margin: 16px 0; }
        .checklist li { padding: 8px 0; padding-left: 28px; position: relative; color: #4b5563; }
        .checklist li::before { content: ''; position: absolute; left: 0; top: 12px; width: 16px; height: 16px; background: #E6E94E; border-radius: 50%; }
        .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; color: #6b7280; font-size: 13px; }
        .footer a { color: #563380; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-badge">Season {season}</div>
            <h1>Game on!</h1>
            <p>{leagueName}</p>
        </div>

        <div class="content">
            <p class="greeting">Hi <strong>{playerName}</strong>,</p>
            
            <p>The moment has arrived. The {season} season of {leagueName} officially begins and your first match is ready.</p>

            <div class="match-card">
                <div class="match-header">
                    <span class="round-badge">Round 1</span>
                    <span class="deadline">Deadline: {deadline}</span>
                </div>
                <div class="vs-section">
                    <div class="player-box">
                        <div class="player-label">You</div>
                        <div class="player-name">{playerName}</div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="player-box" style="text-align: right;">
                        <div class="player-label">Opponent</div>
                        <div class="player-name">{opponentName}</div>
                    </div>
                </div>
                <div class="action-buttons" style="text-align: center;">
                    <a href="{whatsappLink}" class="button button-whatsapp">Contact via WhatsApp</a>
                    <a href="{dashboardLink}" class="button button-secondary">View in my account</a>
                </div>
            </div>

            <div class="info-section">
                <h3>Next steps</h3>
                <ul class="checklist">
                    <li>Contact your opponent to agree on day, time, and court</li>
                    <li>Play the match before the deadline</li>
                    <li>Record the result in your account</li>
                </ul>
            </div>

            <div class="info-section">
                <h3>Remember</h3>
                <p>You have <strong>3 postponements</strong> available this season. Each one extends your deadline by 7 additional days. Use them only when necessary.</p>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="{dashboardLink}" class="button button-primary">Access my account</a>
            </div>
        </div>

        <div class="footer">
            <p style="margin-bottom: 12px;"><strong>Tenis del Parque</strong></p>
            <p>Questions? Contact us on <a href="https://wa.me/34652714328">WhatsApp</a> or visit <a href="https://tenisdp.es">tenisdp.es</a></p>
        </div>
    </div>
</body>
</html>
    `,

    // BYE match email
    htmlBye: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The season begins!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); color: white; padding: 40px 32px; text-align: center; }
        .header-badge { display: inline-block; background: #E6E94E; color: #563380; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 12px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 32px; }
        .greeting { font-size: 18px; color: #374151; margin-bottom: 24px; }
        .bye-card { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
        .bye-badge { display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
        .bye-title { font-size: 20px; font-weight: 600; color: #065f46; margin: 0 0 8px 0; }
        .bye-points { font-size: 32px; font-weight: 700; color: #10b981; margin: 16px 0; }
        .bye-points span { font-size: 16px; font-weight: 500; color: #065f46; }
        .bye-explanation { color: #047857; font-size: 14px; margin: 0; }
        .info-section { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .info-section h3 { margin: 0 0 12px 0; font-size: 16px; color: #1f2937; }
        .info-section p { margin: 0; color: #4b5563; font-size: 14px; }
        .button { display: inline-block; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; }
        .button-primary { background: #563380; color: white !important; }
        .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; color: #6b7280; font-size: 13px; }
        .footer a { color: #563380; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-badge">Season {season}</div>
            <h1>Game on!</h1>
            <p>{leagueName}</p>
        </div>

        <div class="content">
            <p class="greeting">Hi <strong>{playerName}</strong>,</p>
            
            <p>The moment has arrived. The {season} season of {leagueName} officially begins.</p>
            
            <p>In this first round you have been assigned a <strong>BYE</strong>, which means you advance automatically without needing to play a match.</p>

            <div class="bye-card">
                <div class="bye-badge">Round 1 - BYE</div>
                <h2 class="bye-title">Automatic advance</h2>
                <div class="bye-points">+3 <span>points</span></div>
                <p class="bye-explanation">You receive points equivalent to a 2-0 victory</p>
            </div>

            <div class="info-section">
                <h3>Why do I have a BYE?</h3>
                <p>When there is an odd number of players in the league, the system assigns a BYE to one player each round so everyone can participate. It rotates and is fair for all.</p>
            </div>

            <div class="info-section">
                <h3>What&apos;s next?</h3>
                <p>Your next match will be in <strong>Round 2</strong>. We will notify you when the pairings are published. Meanwhile, you can follow the standings and other match results from your account.</p>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="{dashboardLink}" class="button button-primary">View standings</a>
            </div>
        </div>

        <div class="footer">
            <p style="margin-bottom: 12px;"><strong>Tenis del Parque</strong></p>
            <p>Questions? Contact us on <a href="https://wa.me/34652714328">WhatsApp</a> or visit <a href="https://tenisdp.es">tenisdp.es</a></p>
        </div>
    </div>
</body>
</html>
    `
  }
}

/**
 * Generate season start email for a player
 * @param {Object} data - Email data
 * @returns {Object} - { subject, html, text }
 */
export function generateSeasonStartEmail(data) {
  const {
    playerName,
    playerEmail,
    opponentName,
    opponentWhatsApp,
    leagueName,
    season,
    deadline,
    isBye = false,
    language = 'es'
  } = data

  const template = seasonStartEmailTemplate[language]
  const dashboardLink = 'https://tenisdp.es/login'
  
  // Generate WhatsApp link for opponent
  let whatsappLink = '#'
  if (opponentWhatsApp) {
    let cleaned = opponentWhatsApp.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2)
    }
    const message = language === 'es'
      ? `Hola ${opponentName}! Soy ${playerName} de la liga TDP. ¿Cuándo te viene bien para jugar nuestro partido de la Ronda 1?`
      : `Hi ${opponentName}! I'm ${playerName} from the TDP league. When would be a good time to play our Round 1 match?`
    whatsappLink = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
  }

  // Format deadline date
  const formattedDeadline = formatDeadline(deadline, language)

  // Select appropriate template (regular or BYE)
  const subject = isBye ? template.subjectBye : template.subject
  let html = isBye ? template.htmlBye : template.html

  // Replace placeholders
  const replacements = {
    '{playerName}': playerName,
    '{opponentName}': opponentName || '',
    '{leagueName}': leagueName,
    '{season}': formatSeason(season, language),
    '{deadline}': formattedDeadline,
    '{whatsappLink}': whatsappLink,
    '{dashboardLink}': dashboardLink
  }

  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g')
    html = html.replace(regex, value || '')
  })

  return {
    subject,
    html,
    text: htmlToText(html)
  }
}

// Utility functions
function formatDeadline(dateString, language) {
  if (!dateString) return language === 'es' ? '7 días' : '7 days'
  const date = new Date(dateString)
  return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

function formatSeason(season, language) {
  if (!season) return ''
  // Convert "winter-2026" to "Winter 2026" or "Invierno 2026"
  const [type, year] = season.split('-')
  const seasonNames = {
    winter: { es: 'Invierno', en: 'Winter' },
    spring: { es: 'Primavera', en: 'Spring' },
    summer: { es: 'Verano', en: 'Summer' },
    fall: { es: 'Otoño', en: 'Fall' },
    autumn: { es: 'Otoño', en: 'Autumn' }
  }
  const seasonName = seasonNames[type]?.[language] || type
  return `${seasonName} ${year}`
}

function htmlToText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
