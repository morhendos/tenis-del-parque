// Season 3 announcement campaign email (ES + EN)
// Sent via scripts/send-season-announcement.js

const HERO_URL = 'https://www.tenisdp.es/email/season3-hero.jpg'
const LOGO_URL = 'https://www.tenisdp.es/email/logo.png'

const content = {
  es: {
    subject: 'Vuelve la liga 🎾 La Temporada 3 empieza el 12 de octubre',
    preheader: 'Un rival nuevo cada semana. Tú eliges la hora. Plazas limitadas.',
    heroAlt: 'Dos jugadores se saludan en la red al atardecer',
    greeting: (name) => `Hola ${name},`,
    intro: (city) => `La nueva temporada de Tenis del Parque ya está abierta${city ? ` en ${city}` : ''}. Empezamos el <strong>12 de octubre</strong> y jugamos hasta el 20 de diciembre.`,
    facts: [
      { icon: '🎾', title: 'Un rival cada semana', text: 'De tu nivel, gracias al ranking ELO. Tú eliges día y hora.' },
      { icon: '📈', title: 'Ranking y clasificación', text: 'Cada partido cuenta. Sigue tu progreso en la plataforma.' },
      { icon: '🏆', title: 'Playoffs', text: 'Los mejores de cada grupo se juegan el título al final.' }
    ],
    priceLabel: 'Toda la temporada',
    priceNote: 'IVA incluido',
    cta: 'Reserva tu plaza',
    spots: 'Las plazas son limitadas por nivel.',
    signoff: 'Nos vemos en la pista,<br>Tenis del Parque',
    unsubscribe: '¿No quieres recibir estos emails? Responde a este correo y te damos de baja.'
  },
  en: {
    subject: 'The league is back 🎾 Season 3 starts October 12',
    preheader: 'A new rival every week. You pick the time. Limited spots.',
    heroAlt: 'Two players shaking hands at the net at sunset',
    greeting: (name) => `Hi ${name},`,
    intro: (city) => `The new Tenis del Parque season is now open${city ? ` in ${city}` : ''}. We start on <strong>October 12</strong> and play until December 20.`,
    facts: [
      { icon: '🎾', title: 'A rival every week', text: 'At your level, thanks to the ELO ranking. You pick the day and time.' },
      { icon: '📈', title: 'Ranking and standings', text: 'Every match counts. Follow your progress on the platform.' },
      { icon: '🏆', title: 'Playoffs', text: 'The best of each group battle for the title at the end.' }
    ],
    priceLabel: 'Full season',
    priceNote: 'VAT included',
    cta: 'Claim your spot',
    spots: 'Spots are limited per level.',
    signoff: 'See you on court,<br>Tenis del Parque',
    unsubscribe: "Don't want these emails? Reply to this email and we'll remove you."
  }
}

export function generateSeasonAnnouncementEmail({ playerName, language = 'es', cityName = '', ctaUrl }) {
  const t = content[language] || content.es
  const firstName = (playerName || '').split(' ')[0] || (language === 'es' ? 'jugador' : 'player')
  const url = ctaUrl || 'https://www.tenisdp.es/' + (language === 'es' ? 'es' : 'en') + '/leagues'

  const factsHtml = t.facts.map(f => `
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 44px;">
            <div style="width: 36px; height: 36px; background: #e9f3de; border-radius: 8px; text-align: center; line-height: 36px; font-size: 18px;">${f.icon}</div>
          </td>
          <td style="padding: 8px 0 8px 12px;">
            <div style="font-weight: 600; color: #1f2937; font-size: 15px;">${f.title}</div>
            <div style="color: #4b5563; font-size: 14px;">${f.text}</div>
          </td>
        </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="display: none; max-height: 0; overflow: hidden;">${t.preheader}</div>
  <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

    <div style="padding: 18px 32px; text-align: center; background: #ffffff;">
      <img src="${LOGO_URL}" alt="Tenis del Parque" width="180" style="width: 180px; height: auto;">
    </div>

    <img src="${HERO_URL}" alt="${t.heroAlt}" width="600" style="width: 100%; max-width: 600px; height: auto; display: block;">

    <div style="background: linear-gradient(135deg, #563380, #3d2360); color: white; padding: 24px 32px; text-align: center;">
      <div style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">${language === 'es' ? 'Temporada 3' : 'Season 3'}</div>
      <div style="font-size: 26px; font-weight: 700; margin-top: 4px;">${language === 'es' ? '12 oct - 20 dic' : 'Oct 12 - Dec 20'}</div>
    </div>

    <div style="padding: 32px;">
      <p style="margin: 0 0 12px 0; font-size: 16px;">${t.greeting(firstName)}</p>
      <p style="margin: 0 0 20px 0; color: #4b5563;">${t.intro(cityName)}</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 8px 0 20px 0;">${factsHtml}
      </table>

      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${url}" style="display: inline-block; background-color: #563380; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">${t.cta}</a>
      </div>
      <p style="text-align: center; color: #6b7280; font-size: 13px; margin: 0;">${t.spots}</p>

      <p style="margin: 28px 0 0 0; color: #4b5563;">${t.signoff}</p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
      <a href="https://www.tenisdp.es" style="color: #563380; text-decoration: none;">tenisdp.es</a><br>
      ${t.unsubscribe}
    </div>
  </div>
</body>
</html>`

  const text = [
    t.greeting(firstName),
    '',
    t.intro(cityName).replace(/<[^>]+>/g, ''),
    '',
    ...t.facts.map(f => `- ${f.title}: ${f.text}`),
    '',
    `29€ (${t.priceNote}) | ${language === 'es' ? '12 oct - 20 dic' : 'Oct 12 - Dec 20'}`,
    '',
    `${t.cta}: ${url}`,
    '',
    t.unsubscribe
  ].join('\n')

  return { subject: t.subject, html, text }
}
