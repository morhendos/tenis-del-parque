const HERO_URL = 'https://www.tenisdp.es/email/season3-finish.jpg'
const LOGO_URL = 'https://www.tenisdp.es/email/logo.png'

const content = {
  es: {
    subject: 'Tu plaza te espera 🎾',
    preheader: 'Te falta un paso para estar en la liga. Empezamos el lunes 12 de octubre.',
    heroAlt: 'Tenis del Parque',
    band: 'Te falta un paso',
    greeting: (name) => `Hola ${name},`,
    intro: (league) => `Empezaste tu inscripción en la liga${league ? ` <strong>${league}</strong>` : ''}, pero el pago no se completó, así que tu plaza aún no está confirmada.`,
    how: 'Es un minuto: entra en tu cuenta y pulsa "Terminar inscripción" en tu panel. ¿Elegiste mal el nivel o la ciudad? Desde ahí también puedes cambiarlo.',
    deadline: `Empezamos el <strong>lunes 12 de octubre</strong><br><span style="font-size: 14px;">Inscripción hasta el domingo 11 de octubre</span>`,
    cta: 'Terminar inscripción',
    help: '¿Algún problema con el pago? Responde a este correo y lo solucionamos.',
    signoff: 'Tenis del Parque. Tu dosis semanal de tenis.',
    unsubscribe: '¿No quieres recibir estos emails? Responde a este correo y te damos de baja.'
  },
  en: {
    subject: 'Your spot is waiting 🎾',
    preheader: "One step left to join the league. We start Monday, October 12.",
    heroAlt: 'Tenis del Parque',
    band: 'One step left',
    greeting: (name) => `Hi ${name},`,
    intro: (league) => `You started your registration for the${league ? ` <strong>${league}</strong>` : ''} league, but the payment wasn't completed, so your spot isn't confirmed yet.`,
    how: 'It only takes a minute: log in and tap "Finish registration" on your dashboard. Picked the wrong level or city? You can change it there too.',
    deadline: `We start <strong>Monday, October 12</strong><br><span style="font-size: 14px;">Registration closes Sunday, October 11</span>`,
    cta: 'Finish registration',
    help: 'Any problem with the payment? Just reply to this email and we will sort it out.',
    signoff: 'Tenis del Parque. Your weekly dose of tennis.',
    unsubscribe: "Don't want these emails? Reply to this email and we'll remove you."
  }
}

export function generateSeasonFinishRegistrationEmail({ name, language = 'es', leagueLabel = '', ctaUrl, heroUrl = HERO_URL, logoUrl = LOGO_URL }) {
  const t = content[language] || content.es
  const firstName = (name || '').split(' ')[0] || (language === 'es' ? 'jugador' : 'player')
  const url = ctaUrl || `https://www.tenisdp.es/${language}/player/dashboard`

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
      <p style="margin: 0 0 12px 0; color: #4b5563;">${t.intro(leagueLabel)}</p>
      <p style="margin: 0 0 20px 0; color: #4b5563;">${t.how}</p>

      <div style="background: #f5f1fa; border-radius: 12px; text-align: center; padding: 14px 16px; margin: 4px 0 20px 0; font-size: 16px; color: #3d2360;">📅 ${t.deadline}</div>

      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${url}" style="display: inline-block; background-color: #563380; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">${t.cta}</a>
      </div>

      <p style="margin: 24px 0 0 0; color: #4b5563;">${t.help}</p>
      <p style="margin: 16px 0 0 0; color: #4b5563;">${t.signoff}</p>
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

  const strip = (s) => s.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '')
  const text = [
    t.greeting(firstName), '',
    strip(t.intro(leagueLabel)), t.how, '',
    strip(t.deadline), '',
    `${t.cta}: ${url}`, '',
    t.help, '', t.unsubscribe
  ].join('\n')

  return { subject: t.subject, html, text }
}
