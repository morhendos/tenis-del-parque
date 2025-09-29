// Playoff Qualification Email Template for Tennis League
// Based on the beautiful welcome email design
// File: lib/email/templates/playoffEmail.js

export const playoffEmailTemplate = {
  es: {
    subject: '🏆 ¡Felicidades! Has clasificado para los playoffs - {leagueName}',
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Clasificado para Playoffs!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 32px; text-align: center; position: relative; overflow: hidden; }
        .header::before { content: '🏆'; position: absolute; font-size: 120px; opacity: 0.1; top: -20px; right: -20px; transform: rotate(15deg); }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); margin-bottom: 20px; }
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .info-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .golden-card { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #fbbf24; }
        .button { display: inline-block; background-color: #7c3aed; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin: 8px 4px; font-weight: 500; text-align: center; }
        .button-gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        .button-secondary { background-color: #10b981; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        h1 { margin: 0 0 8px 0; font-size: 32px; font-weight: 700; }
        h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; }
        h3 { color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
        .bracket-preview { background: white; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 16px 0; }
        .match-card { background: #f9fafb; padding: 16px; border-radius: 8px; margin: 12px 0; border-left: 4px solid #fbbf24; }
        .seed-badge { display: inline-block; background: #7c3aed; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 8px; }
        .feature-grid { display: flex; gap: 12px; margin: 16px 0; }
        .feature-item { flex: 1; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center; }
        .vs-separator { display: inline-block; padding: 4px 12px; background: #f3f4f6; border-radius: 20px; font-weight: 600; color: #6b7280; margin: 0 12px; }
        .trophy-icon { font-size: 48px; margin: 16px 0; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        a { color: #7c3aed; }
        .highlight-box { background: linear-gradient(135deg, #f3f4f6, #fafafa); padding: 20px; border-radius: 12px; border-left: 4px solid #fbbf24; margin: 20px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
        .stat-item { text-align: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
        .stat-value { font-size: 24px; font-weight: 700; color: #7c3aed; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="status-badge">
                ⭐ TOP {topPlayers} CLASIFICADO
            </div>
            <h1>¡FELICIDADES {playerName}!</h1>
            <p style="margin: 8px 0; font-size: 20px; font-weight: 600;">Has clasificado para los Playoffs</p>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">{leagueName} - Grupo {playoffGroup}</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Qualification Summary -->
            <div class="section">
                <h2>🏆 Tu Clasificación</h2>
                <div class="info-card golden-card">
                    <div class="trophy-icon" style="text-align: center;">🥇</div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">#{position}</div>
                            <div class="stat-label">Posición Liga</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{points}</div>
                            <div class="stat-label">Puntos</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">#{seed}</div>
                            <div class="stat-label">Seed Playoffs</div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 16px;">
                        <p style="margin: 0; color: #92400e; font-weight: 600;">
                            ¡Eres uno de los mejores {topPlayers} jugadores de la temporada!
                        </p>
                    </div>
                </div>
            </div>

            <!-- First Match -->
            <div class="section">
                <h2>⚔️ Tu Primer Partido - Cuartos de Final</h2>
                <div class="match-card">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <span class="seed-badge">Seed #{seed}</span>
                            <strong style="font-size: 18px;">{playerName}</strong>
                        </div>
                        <span class="vs-separator">VS</span>
                        <div style="text-align: right;">
                            <span class="seed-badge">Seed #{opponentSeed}</span>
                            <strong style="font-size: 18px;">{opponentName}</strong>
                        </div>
                    </div>
                    <div class="info-card" style="background: white;">
                        <p style="margin: 0 0 8px 0;"><strong>Información del oponente:</strong></p>
                        <ul style="margin: 0;">
                            <li>WhatsApp: <a href="https://wa.me/{opponentWhatsApp}">{opponentWhatsApp}</a></li>
                            <li>Partidos jugados: {opponentMatches}</li>
                            <li>Puntos en liga regular: {opponentPoints}</li>
                        </ul>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 12px;">
                        <p style="margin: 0; color: #92400e;">
                            <strong>📅 Importante:</strong> Ponte en contacto con tu oponente lo antes posible para programar el partido.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Tournament Bracket -->
            <div class="section">
                <h2>📊 Cuadro del Torneo</h2>
                <div class="bracket-preview">
                    <p style="margin: 0 0 12px 0;">Tu camino hacia el campeonato:</p>
                    <div style="text-align: center;">
                        <div style="display: inline-block; text-align: left;">
                            <div style="margin: 8px 0;">
                                <strong>Cuartos de Final:</strong> vs {opponentName} (Seed #{opponentSeed})
                            </div>
                            <div style="margin: 8px 0; opacity: 0.6;">
                                <strong>Semifinales:</strong> Ganador de partido {semifinalMatchup}
                            </div>
                            <div style="margin: 8px 0; opacity: 0.6;">
                                <strong>Final:</strong> Por determinar
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 16px;">
                        <a href="{bracketUrl}" class="button button-gold" style="color: white;">Ver Cuadro Completo</a>
                    </div>
                </div>
            </div>

            <!-- Rules & Info -->
            <div class="section">
                <h2>📋 Información Importante</h2>
                <div class="highlight-box">
                    <h3 style="margin-top: 0;">Formato de los Playoffs</h3>
                    <ul style="margin: 8px 0;">
                        <li>Sistema de eliminación directa</li>
                        <li>Formato: Mejor de 3 sets (con super tie-break en el 3er set)</li>
                        <li>Los partidos NO afectan tu puntuación de liga regular</li>
                        <li>Tienes que coordinar con tu oponente para jugar el partido</li>
                        <li>Plazo recomendado: 1 semana por ronda</li>
                    </ul>
                </div>
            </div>

            <!-- WhatsApp Contact -->
            <div class="section">
                <h2>💬 Contacta a tu oponente</h2>
                <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                    <p style="margin: 0 0 12px 0;">Mensaje sugerido para WhatsApp:</p>
                    <div style="background: white; padding: 12px; border-radius: 8px; margin: 12px 0; border-left: 3px solid #10b981;">
                        <p style="margin: 0; font-style: italic; color: #4b5563;">
                            "¡Hola {opponentName}! Soy {playerName}. Nos toca jugar en cuartos de final de los playoffs. 
                            ¿Cuándo te vendría bien jugar? Yo puedo [días/horarios]. ¡Que gane el mejor! 🎾"
                        </p>
                    </div>
                    <div style="text-align: center;">
                        <a href="https://wa.me/{opponentWhatsApp}?text={whatsappMessage}" class="button button-secondary" style="color: white;">
                            Enviar WhatsApp a {opponentName}
                        </a>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="section" style="text-align: center; margin-top: 32px;">
                <a href="{dashboardUrl}" class="button" style="color: white;">
                    📊 Ver Mi Dashboard
                </a>
                <a href="{bracketUrl}" class="button button-gold" style="color: white;">
                    🏆 Ver Cuadro de Playoffs
                </a>
            </div>

            <!-- Good Luck -->
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 24px; border-radius: 12px; text-align: center;">
                <h2 style="margin: 0 0 8px 0;">¡Mucha suerte en los playoffs! 🌟</h2>
                <p style="margin: 0; color: #92400e;">
                    Has trabajado duro para llegar hasta aquí. ¡Ahora es el momento de brillar!
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937; font-weight: 600;">¡Que empiece el torneo! 🎾</p>
            <p style="margin: 0 0 16px 0;"><strong>Equipo Tenis del Parque</strong></p>
            <hr style="margin: 16px auto; width: 60px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Este email fue enviado porque clasificaste para los playoffs de {leagueName}.<br>
                Si tienes alguna pregunta, contacta con <a href="mailto:info@tenisdp.es">info@tenisdp.es</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
  },

  en: {
    subject: '🏆 Congratulations! You have qualified for the playoffs - {leagueName}',
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Qualified for Playoffs!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 32px; text-align: center; position: relative; overflow: hidden; }
        .header::before { content: '🏆'; position: absolute; font-size: 120px; opacity: 0.1; top: -20px; right: -20px; transform: rotate(15deg); }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); margin-bottom: 20px; }
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .info-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .golden-card { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #fbbf24; }
        .button { display: inline-block; background-color: #7c3aed; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin: 8px 4px; font-weight: 500; text-align: center; }
        .button-gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        .button-secondary { background-color: #10b981; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        h1 { margin: 0 0 8px 0; font-size: 32px; font-weight: 700; }
        h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; }
        h3 { color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
        .bracket-preview { background: white; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 16px 0; }
        .match-card { background: #f9fafb; padding: 16px; border-radius: 8px; margin: 12px 0; border-left: 4px solid #fbbf24; }
        .seed-badge { display: inline-block; background: #7c3aed; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 8px; }
        .feature-grid { display: flex; gap: 12px; margin: 16px 0; }
        .feature-item { flex: 1; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center; }
        .vs-separator { display: inline-block; padding: 4px 12px; background: #f3f4f6; border-radius: 20px; font-weight: 600; color: #6b7280; margin: 0 12px; }
        .trophy-icon { font-size: 48px; margin: 16px 0; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        a { color: #7c3aed; }
        .highlight-box { background: linear-gradient(135deg, #f3f4f6, #fafafa); padding: 20px; border-radius: 12px; border-left: 4px solid #fbbf24; margin: 20px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
        .stat-item { text-align: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
        .stat-value { font-size: 24px; font-weight: 700; color: #7c3aed; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="status-badge">
                ⭐ TOP {topPlayers} QUALIFIED
            </div>
            <h1>CONGRATULATIONS {playerName}!</h1>
            <p style="margin: 8px 0; font-size: 20px; font-weight: 600;">You have qualified for the Playoffs</p>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">{leagueName} - Group {playoffGroup}</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Qualification Summary -->
            <div class="section">
                <h2>🏆 Your Qualification</h2>
                <div class="info-card golden-card">
                    <div class="trophy-icon" style="text-align: center;">🥇</div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">#{position}</div>
                            <div class="stat-label">League Position</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{points}</div>
                            <div class="stat-label">Points</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">#{seed}</div>
                            <div class="stat-label">Playoff Seed</div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 16px;">
                        <p style="margin: 0; color: #92400e; font-weight: 600;">
                            You are one of the top {topPlayers} players of the season!
                        </p>
                    </div>
                </div>
            </div>

            <!-- First Match -->
            <div class="section">
                <h2>⚔️ Your First Match - Quarterfinals</h2>
                <div class="match-card">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div>
                            <span class="seed-badge">Seed #{seed}</span>
                            <strong style="font-size: 18px;">{playerName}</strong>
                        </div>
                        <span class="vs-separator">VS</span>
                        <div style="text-align: right;">
                            <span class="seed-badge">Seed #{opponentSeed}</span>
                            <strong style="font-size: 18px;">{opponentName}</strong>
                        </div>
                    </div>
                    <div class="info-card" style="background: white;">
                        <p style="margin: 0 0 8px 0;"><strong>Opponent information:</strong></p>
                        <ul style="margin: 0;">
                            <li>WhatsApp: <a href="https://wa.me/{opponentWhatsApp}">{opponentWhatsApp}</a></li>
                            <li>Matches played: {opponentMatches}</li>
                            <li>Regular season points: {opponentPoints}</li>
                        </ul>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 12px;">
                        <p style="margin: 0; color: #92400e;">
                            <strong>📅 Important:</strong> Contact your opponent as soon as possible to schedule the match.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Tournament Bracket -->
            <div class="section">
                <h2>📊 Tournament Bracket</h2>
                <div class="bracket-preview">
                    <p style="margin: 0 0 12px 0;">Your path to the championship:</p>
                    <div style="text-align: center;">
                        <div style="display: inline-block; text-align: left;">
                            <div style="margin: 8px 0;">
                                <strong>Quarterfinals:</strong> vs {opponentName} (Seed #{opponentSeed})
                            </div>
                            <div style="margin: 8px 0; opacity: 0.6;">
                                <strong>Semifinals:</strong> Winner of {semifinalMatchup}
                            </div>
                            <div style="margin: 8px 0; opacity: 0.6;">
                                <strong>Final:</strong> To be determined
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 16px;">
                        <a href="{bracketUrl}" class="button button-gold" style="color: white;">View Full Bracket</a>
                    </div>
                </div>
            </div>

            <!-- Rules & Info -->
            <div class="section">
                <h2>📋 Important Information</h2>
                <div class="highlight-box">
                    <h3 style="margin-top: 0;">Playoff Format</h3>
                    <ul style="margin: 8px 0;">
                        <li>Single elimination system</li>
                        <li>Format: Best of 3 sets (with super tie-break as a 3rd set)</li>
                        <li>Matches DO NOT affect your regular season rating</li>
                        <li>You must coordinate with your opponent to play</li>
                        <li>Recommended deadline: 1 week per round</li>
                    </ul>
                </div>
            </div>

            <!-- WhatsApp Contact -->
            <div class="section">
                <h2>💬 Contact Your Opponent</h2>
                <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                    <p style="margin: 0 0 12px 0;">Suggested WhatsApp message:</p>
                    <div style="background: white; padding: 12px; border-radius: 8px; margin: 12px 0; border-left: 3px solid #10b981;">
                        <p style="margin: 0; font-style: italic; color: #4b5563;">
                            "Hi {opponentName}! This is {playerName}. We're matched up for the quarterfinals of the playoffs. 
                            When would be good for you to play? I'm available [days/times]. May the best player win! 🎾"
                        </p>
                    </div>
                    <div style="text-align: center;">
                        <a href="https://wa.me/{opponentWhatsApp}?text={whatsappMessage}" class="button button-secondary" style="color: white;">
                            Send WhatsApp to {opponentName}
                        </a>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="section" style="text-align: center; margin-top: 32px;">
                <a href="{dashboardUrl}" class="button" style="color: white;">
                    📊 View My Dashboard
                </a>
                <a href="{bracketUrl}" class="button button-gold" style="color: white;">
                    🏆 View Playoff Bracket
                </a>
            </div>

            <!-- Good Luck -->
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 24px; border-radius: 12px; text-align: center;">
                <h2 style="margin: 0 0 8px 0;">Good luck in the playoffs! 🌟</h2>
                <p style="margin: 0; color: #92400e;">
                    You've worked hard to get here. Now it's time to shine!
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937; font-weight: 600;">Let the tournament begin! 🎾</p>
            <p style="margin: 0 0 16px 0;"><strong>Tenis del Parque Team</strong></p>
            <hr style="margin: 16px auto; width: 60px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This email was sent because you qualified for the playoffs of {leagueName}.<br>
                If you have any questions, contact <a href="mailto:info@tenisdp.es">info@tenisdp.es</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
  }
}

// Email generation function
export function generatePlayoffEmail(data) {
  const {
    playerName,
    playerEmail,
    language = 'es',
    position,
    points,
    seed,
    playoffGroup,
    topPlayers,
    leagueName,
    opponentName,
    opponentSeed,
    opponentWhatsApp,
    opponentMatches,
    opponentPoints,
    semifinalMatchup,
    bracketUrl,
    dashboardUrl
  } = data

  const template = playoffEmailTemplate[language]
  
  // Create WhatsApp message
  const whatsappMessage = language === 'es' 
    ? `¡Hola ${opponentName}! Soy ${playerName}. Nos toca jugar en cuartos de final de los playoffs. ¿Cuándo te vendría bien jugar? ¡Que gane el mejor! 🎾`
    : `Hi ${opponentName}! This is ${playerName}. We're matched up for the quarterfinals of the playoffs. When would be good for you to play? May the best player win! 🎾`
  
  // Replace all placeholders in the template
  let emailHtml = template.html
  let emailSubject = template.subject

  const replacements = {
    '{playerName}': playerName,
    '{playerEmail}': playerEmail,
    '{position}': position,
    '{points}': points,
    '{seed}': seed,
    '{playoffGroup}': playoffGroup,
    '{topPlayers}': topPlayers,
    '{leagueName}': leagueName,
    '{opponentName}': opponentName,
    '{opponentSeed}': opponentSeed,
    '{opponentWhatsApp}': opponentWhatsApp ? opponentWhatsApp.replace(/\D/g, '') : '',
    '{opponentMatches}': opponentMatches,
    '{opponentPoints}': opponentPoints,
    '{semifinalMatchup}': semifinalMatchup,
    '{bracketUrl}': bracketUrl,
    '{dashboardUrl}': dashboardUrl,
    '{whatsappMessage}': encodeURIComponent(whatsappMessage)
  }

  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g')
    emailHtml = emailHtml.replace(regex, value || '')
    emailSubject = emailSubject.replace(regex, value || '')
  })

  return {
    subject: emailSubject,
    html: emailHtml,
    text: emailSubject + '\n\n' + whatsappMessage
  }
}
