const HERO_URL = 'https://www.tenisdp.es/email/season3-whatsnew.jpg'
const LOGO_URL = 'https://www.tenisdp.es/email/logo.png'

const content = {
  es: {
    subject: 'Novedades de la temporada de otoño 🎾',
    preheader: 'Perfiles de jugador, notificaciones en el móvil y 50% de descuento por jugarlo todo. Empezamos el 12 de octubre.',
    heroAlt: 'Novedades de Tenis del Parque',
    band: 'Novedades de la temporada',
    greeting: (name) => `Hola ${name},`,
    intro: 'Esta temporada la liga trae cosas nuevas:',
    features: [
      { icon: '👤', title: 'Tu perfil de jugador', text: 'Foto, bandera, estilo de juego y mejor golpe. Y puedes ver el de tu rival antes del partido.' },
      { icon: '🔔', title: 'Avisos en el móvil', text: 'Sabrás contra quién juegas cada ronda, te recordamos el plazo y ves los resultados de la liga al momento.' },
      { icon: '🏅', title: 'Juega todo, paga la mitad', text: 'Si juegas todos tus partidos, la próxima temporada tienes un 50% de descuento.' }
    ],
    deadline: (city) => `Empezamos el <strong>lunes 12 de octubre</strong>${city ? ` en ${city}` : ''}<br><span style="font-size: 14px;">Inscripción hasta el domingo 11 de octubre</span>`,
    cta: 'Me apunto',
    loyaltyTitle: '🎉 Tu 50% sigue esperándote',
    loyaltyText: 'Por jugar todos tus partidos la temporada pasada, tienes un 50% de descuento con tu código:',
    loyaltyNote: 'Se aplica automáticamente al pulsar el botón.',
    signoff: 'Tenis del Parque. Tu dosis semanal de tenis.',
    unsubscribe: '¿No quieres recibir estos emails? Responde a este correo y te damos de baja.'
  },
  en: {
    subject: "What's new this autumn season 🎾",
    preheader: 'Player profiles, phone notifications and 50% off for playing every match. We start October 12.',
    heroAlt: "What's new at Tenis del Parque",
    band: "What's new this season",
    greeting: (name) => `Hi ${name},`,
    intro: 'This season the league comes with a few new things:',
    features: [
      { icon: '👤', title: 'Your player profile', text: "Photo, flag, play style and best shot. And you can check your opponent's before the match." },
      { icon: '🔔', title: 'Phone alerts', text: 'Know who you play each round, get a reminder before the deadline, and see league results as they come in.' },
      { icon: '🏅', title: 'Play it all, pay half', text: 'Play all your matches and get 50% off next season.' }
    ],
    deadline: (city) => `We start <strong>Monday, October 12</strong>${city ? ` in ${city}` : ''}<br><span style="font-size: 14px;">Registration closes Sunday, October 11</span>`,
    cta: 'Count me in',
    loyaltyTitle: '🎉 Your 50% is still waiting',
    loyaltyText: 'For playing every match last season, you get 50% off with your code:',
    loyaltyNote: 'Applied automatically when you click the button.',
    signoff: 'Tenis del Parque. Your weekly dose of tennis.',
    unsubscribe: "Don't want these emails? Reply to this email and we'll remove you."
  }
}

export function generateSeasonWhatsNewEmail({ playerName, name, language = 'es', cityName = '', ctaUrl, discountCode = null, heroUrl = HERO_URL, logoUrl = LOGO_URL }) {
  const t = content[language] || content.es
  const firstName = (playerName || name || '').split(' ')[0] || (language === 'es' ? 'jugador' : 'player')
  const url = ctaUrl || 'https://www.tenisdp.es/' + (language === 'es' ? 'es' : 'en') + '/leagues'

  const featureRows = t.features.map((f) => `
        <tr>
          <td width="48" valign="top" style="padding: 12px 0; font-size: 26px; line-height: 1;">${f.icon}</td>
          <td valign="top" style="padding: 12px 0;">
            <div style="font-size: 16px; font-weight: 700; color: #563380;">${f.title}</div>
            <div style="font-size: 14px; color: #4b5563; margin-top: 2px;">${f.text}</div>
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
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 28px 12px;">
  <div style="display: none; max-height: 0; overflow: hidden;">${t.preheader}</div>
  <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; text-align: left;">

    <div style="padding: 18px 32px; text-align: center; background: #ffffff; border-radius: 16px 16px 0 0;">
      <img src="${logoUrl}" alt="Tenis del Parque" width="180" style="width: 180px; height: auto;">
    </div>

    <img src="${heroUrl}" alt="${t.heroAlt}" width="600" style="width: 100%; max-width: 600px; height: auto; display: block;">

    <div style="background: linear-gradient(135deg, #563380, #3d2360); color: white; padding: 24px 32px; text-align: center;">
      <div style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">${language === 'es' ? 'Temporada de Otoño 2026 · 12 oct - 20 dic' : 'Autumn Season 2026 · Oct 12 - Dec 20'}</div>
      <div style="font-size: 30px; font-weight: 700; margin-top: 4px;">${t.band}</div>
    </div>

    <div style="padding: 32px;">
      <p style="margin: 0 0 12px 0; font-size: 16px;">${t.greeting(firstName)}</p>
      <p style="margin: 0 0 8px 0; color: #4b5563;">${t.intro}</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 16px 0; border-top: 1px solid #eee7f5;">
        ${featureRows}
      </table>

      <div style="background: #f5f1fa; border-radius: 12px; text-align: center; padding: 14px 16px; margin: 4px 0 20px 0; font-size: 16px; color: #3d2360;">📅 ${t.deadline(cityName)}</div>

      ${discountCode ? `
      <div style="background: linear-gradient(135deg, #f5f1fa, #faf8fd); border: 1px dashed #a683cc; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0 8px 0;">
        <div style="font-size: 15px; font-weight: 600; color: #563380;">${t.loyaltyTitle}</div>
        <div style="font-size: 13px; color: #7a5ba3; margin: 4px 0 10px 0;">${t.loyaltyText}</div>
        <div style="display: inline-block; background: #563380; color: white; font-weight: 700; font-size: 18px; letter-spacing: 2px; padding: 8px 20px; border-radius: 8px;">${discountCode}</div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">${t.loyaltyNote}</div>
      </div>` : ''}

      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${url}" style="display: inline-block; background-color: #563380; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">${t.cta}</a>
      </div>

      <p style="margin: 28px 0 0 0; color: #4b5563;">${t.signoff}</p>
    </div>

    <div style="background-color: #f3f4f6; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
      <a href="https://www.tenisdp.es" style="color: #563380; text-decoration: none;">tenisdp.es</a><br>
      ${t.unsubscribe}
    </div>
  </div>
  <div style="height: 28px; line-height: 28px; font-size: 1px;">&nbsp;</div>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = [
    t.greeting(firstName),
    '',
    t.intro,
    ...t.features.map((f) => `- ${f.title}: ${f.text}`),
    '',
    t.deadline(cityName).replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''),
    ...(discountCode ? ['', `${t.loyaltyText} ${discountCode}`] : []),
    '',
    `${t.cta}: ${url}`,
    '',
    t.unsubscribe
  ].join('\n')

  return { subject: t.subject, html, text }
}
