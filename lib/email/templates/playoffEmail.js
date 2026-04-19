// Playoff Qualification Email Template for Tennis League
// Clean, professional design matching the standard email style
// File: lib/email/templates/playoffEmail.js

export const playoffEmailTemplate = {
  es: {
    subject: 'Has clasificado para los playoffs — {leagueName}',
    
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
<tr><td align="center" style="padding: 16px 20px 20px 20px;">
  <img src="https://www.tenisdp.es/logo-horizontal-small.png" alt="Tenis del Parque" style="height: 64px; width: auto;" />
</td></tr>
<tr><td align="center" style="padding: 0 20px 20px 20px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

<!-- Header -->
<tr><td style="background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); padding: 28px 32px; text-align: center;">
  <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Top {topPlayers} clasificado</p>
  <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Felicidades, {playerName}</h1>
  <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 15px;">{leagueName}</p>
</td></tr>

<!-- Content -->
<tr><td style="padding: 32px;">

  <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
    Has clasificado para la fase de playoffs. A continuación tienes toda la información sobre tu primer partido.
  </p>

  <!-- Stats -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
    <tr>
      <td style="width: 33%; text-align: center; padding: 16px 8px; background: #f9fafb; border-radius: 8px 0 0 8px; border: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">#{position}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Posición</div>
      </td>
      <td style="width: 33%; text-align: center; padding: 16px 8px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">{points}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Puntos</div>
      </td>
      <td style="width: 33%; text-align: center; padding: 16px 8px; background: #f9fafb; border-radius: 0 8px 8px 0; border: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">#{seed}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Seed</div>
      </td>
    </tr>
  </table>

  <!-- Match Card -->
  <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <div style="background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
      <strong style="color: #1f2937; font-size: 14px;">Cuartos de Final</strong>
    </div>
    <div style="padding: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="text-align: center; width: 40%;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Seed #{seed}</div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937;">{playerName}</div>
          </td>
          <td style="text-align: center; width: 20%;">
            <span style="display: inline-block; padding: 4px 12px; background: #f3f4f6; border-radius: 20px; font-weight: 600; color: #6b7280; font-size: 13px;">vs</span>
          </td>
          <td style="text-align: center; width: 40%;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Seed #{opponentSeed}</div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937;">{opponentName}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Opponent Info -->
  <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 14px;">Información del rival</p>
    <p style="margin: 0 0 4px 0; color: #4b5563; font-size: 14px;">Partidos jugados: {opponentMatches} · Puntos: {opponentPoints}</p>
    <p style="margin: 0; color: #4b5563; font-size: 14px;">WhatsApp: <a href="https://wa.me/{opponentWhatsApp}" style="color: #7c3aed;">{opponentWhatsApp}</a></p>
  </div>

  <!-- Next Steps -->
  <div style="border-left: 3px solid #7c3aed; padding-left: 16px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 14px;">Próximos pasos</p>
    <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
      <li>Contacta a {opponentName} para acordar fecha y hora</li>
      <li>Reservad una pista (cada jugador paga la mitad)</li>
      <li>Jugad el partido — mejor de 3 sets (super tie-break en el 3o)</li>
      <li>El ganador reporta el resultado en la plataforma</li>
    </ol>
  </div>

  <!-- CTA Buttons -->
  <div style="text-align: center; margin-top: 28px;">
    <a href="https://wa.me/{opponentWhatsApp}?text={whatsappMessage}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 4px;">Contactar rival</a>
    <a href="{bracketUrl}" style="display: inline-block; background: linear-gradient(135deg, #563380, #7c3aed); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 4px;">Ver cuadro</a>
  </div>

</td></tr>

<!-- Footer -->
<tr><td style="padding: 20px 32px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
  <p style="color: #9ca3af; font-size: 12px; margin: 0;">Tenis del Parque &mdash; Liga de Tenis Amateur Costa del Sol</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>
    `
  },

  en: {
    subject: 'You have qualified for the playoffs — {leagueName}',
    
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
<tr><td align="center" style="padding: 16px 20px 20px 20px;">
  <img src="https://www.tenisdp.es/logo-horizontal-small.png" alt="Tenis del Parque" style="height: 64px; width: auto;" />
</td></tr>
<tr><td align="center" style="padding: 0 20px 20px 20px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

<!-- Header -->
<tr><td style="background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); padding: 28px 32px; text-align: center;">
  <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Top {topPlayers} qualified</p>
  <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Congratulations, {playerName}</h1>
  <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 15px;">{leagueName}</p>
</td></tr>

<!-- Content -->
<tr><td style="padding: 32px;">

  <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
    You have qualified for the playoff stage. Below you will find all the details about your first match.
  </p>

  <!-- Stats -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
    <tr>
      <td style="width: 33%; text-align: center; padding: 16px 8px; background: #f9fafb; border-radius: 8px 0 0 8px; border: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">#{position}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Position</div>
      </td>
      <td style="width: 33%; text-align: center; padding: 16px 8px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">{points}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Points</div>
      </td>
      <td style="width: 33%; text-align: center; padding: 16px 8px; background: #f9fafb; border-radius: 0 8px 8px 0; border: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">#{seed}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Seed</div>
      </td>
    </tr>
  </table>

  <!-- Match Card -->
  <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
    <div style="background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
      <strong style="color: #1f2937; font-size: 14px;">Quarterfinal</strong>
    </div>
    <div style="padding: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="text-align: center; width: 40%;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Seed #{seed}</div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937;">{playerName}</div>
          </td>
          <td style="text-align: center; width: 20%;">
            <span style="display: inline-block; padding: 4px 12px; background: #f3f4f6; border-radius: 20px; font-weight: 600; color: #6b7280; font-size: 13px;">vs</span>
          </td>
          <td style="text-align: center; width: 40%;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Seed #{opponentSeed}</div>
            <div style="font-size: 16px; font-weight: 600; color: #1f2937;">{opponentName}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Opponent Info -->
  <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 14px;">Opponent details</p>
    <p style="margin: 0 0 4px 0; color: #4b5563; font-size: 14px;">Matches played: {opponentMatches} · Points: {opponentPoints}</p>
    <p style="margin: 0; color: #4b5563; font-size: 14px;">WhatsApp: <a href="https://wa.me/{opponentWhatsApp}" style="color: #7c3aed;">{opponentWhatsApp}</a></p>
  </div>

  <!-- Next Steps -->
  <div style="border-left: 3px solid #7c3aed; padding-left: 16px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 14px;">Next steps</p>
    <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
      <li>Contact {opponentName} to arrange a date and time</li>
      <li>Book a court (each player pays half)</li>
      <li>Play the match — best of 3 sets (super tie-break in the 3rd)</li>
      <li>The winner reports the result on the platform</li>
    </ol>
  </div>

  <!-- CTA Buttons -->
  <div style="text-align: center; margin-top: 28px;">
    <a href="https://wa.me/{opponentWhatsApp}?text={whatsappMessage}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 4px;">Contact opponent</a>
    <a href="{bracketUrl}" style="display: inline-block; background: linear-gradient(135deg, #563380, #7c3aed); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 4px;">View bracket</a>
  </div>

</td></tr>

<!-- Footer -->
<tr><td style="padding: 20px 32px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
  <p style="color: #9ca3af; font-size: 12px; margin: 0;">Tenis del Parque &mdash; Amateur Tennis League Costa del Sol</p>
</td></tr>

</table>
</td></tr>
</table>
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

  const template = playoffEmailTemplate[language] || playoffEmailTemplate.es
  
  // Create WhatsApp message (no emojis)
  const whatsappMessage = language === 'es' 
    ? `Hola ${opponentName}, soy ${playerName}. Nos toca jugar en cuartos de final de los playoffs. Cuando te vendria bien? Un saludo`
    : `Hi ${opponentName}, this is ${playerName}. We are matched for the playoff quarterfinals. When would suit you? Cheers`
  
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
    '{opponentWhatsApp}': opponentWhatsApp ? opponentWhatsApp.replace(/\\D/g, '') : '',
    '{opponentMatches}': opponentMatches,
    '{opponentPoints}': opponentPoints,
    '{semifinalMatchup}': semifinalMatchup,
    '{bracketUrl}': bracketUrl,
    '{dashboardUrl}': dashboardUrl,
    '{whatsappMessage}': encodeURIComponent(whatsappMessage)
  }

  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\\\$&'), 'g')
    emailHtml = emailHtml.replace(regex, value || '')
    emailSubject = emailSubject.replace(regex, value || '')
  })

  return {
    subject: emailSubject,
    html: emailHtml,
    text: emailSubject + '\\n\\n' + whatsappMessage
  }
}
