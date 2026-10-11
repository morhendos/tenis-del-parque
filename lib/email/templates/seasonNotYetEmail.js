const HERO_URL = 'https://www.tenisdp.es/email/season-notyet.jpg'
const LOGO_URL = 'https://www.tenisdp.es/email/logo.png'

const content = {
  es: {
    subject: (city) => `Tu inscripción en la Liga de ${city}`,
    preheader: (city) => `Todavía no arrancamos en ${city}. Te hemos devuelto los 29€.`,
    top: (city) => `Liga de ${city}`,
    band: 'Próximamente',
    greeting: (name) => `Hola ${name},`,
    thanks: '¡Gracias por apuntarte a Tenis del Parque! Nos hace mucha ilusión.',
    refund: (city) => `Todavía no arrancamos la liga de ${city} este otoño, así que te hemos devuelto los <strong>29€ completos</strong>. Lo verás en tu tarjeta en 5-10 días.`,
    plan: (city) => `Queremos empezar en ${city} a <strong>principios de noviembre</strong>, y serás de los primeros en saberlo.`,
    friends: (city) => `Si conoces a alguien que quiera jugar, ¡tráetelo! Nos ayudará a arrancar antes en ${city}.`,
    help: '¿Alguna pregunta? Responde a este correo.',
    signoff: 'Un saludo,<br>Tom - Tenis del Parque',
    unsubscribe: '¿No quieres recibir estos emails? Responde a este correo y te damos de baja.'
  },
  en: {
    subject: (city) => `Your registration for the ${city} League`,
    preheader: (city) => `We're not starting in ${city} yet. Your 29€ has been refunded.`,
    top: (city) => `${city} League`,
    band: 'Coming soon',
    greeting: (name) => `Hi ${name},`,
    thanks: "Thanks for signing up to Tenis del Parque! We're really happy you joined.",
    refund: (city) => `We're not starting the ${city} league this autumn yet, so we've refunded your <strong>full 29€</strong>. You'll see it on your card in 5-10 days.`,
    plan: (city) => `We're aiming to start in ${city} in <strong>early November</strong>, and you'll be the first to know.`,
    friends: (city) => `If you know anyone who'd like to play, bring them along - it'll help us get ${city} going sooner.`,
    help: 'Any questions? Just reply to this email.',
    signoff: 'Best,<br>Tom - Tenis del Parque',
    unsubscribe: "Don't want these emails? Reply to this email and we'll remove you."
  }
}

export function generateSeasonNotYetEmail({ name, language = 'es', cityName = '', heroUrl = HERO_URL, logoUrl = LOGO_URL }) {
  const t = content[language] || content.es
  const firstName = (name || '').split(' ')[0] || (language === 'es' ? 'jugador' : 'player')
  const subject = t.subject(cityName)

  const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 28px 12px;">
  <div style="display: none; max-height: 0; overflow: hidden;">${t.preheader(cityName)}</div>
  <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; text-align: left;">

    <div style="padding: 18px 32px; text-align: center; background: #ffffff; border-radius: 16px 16px 0 0;">
      <img src="${logoUrl}" alt="Tenis del Parque" width="180" style="width: 180px; height: auto;">
    </div>

    <img src="${heroUrl}" alt="Tenis del Parque" width="600" style="width: 100%; max-width: 600px; height: auto; display: block;">

    <div style="background: linear-gradient(135deg, #563380, #3d2360); color: white; padding: 24px 32px; text-align: center;">
      <div style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">${t.top(cityName)}</div>
      <div style="font-size: 30px; font-weight: 700; margin-top: 4px;">${t.band}</div>
    </div>

    <div style="padding: 32px;">
      <p style="margin: 0 0 12px 0; font-size: 16px;">${t.greeting(firstName)}</p>
      <p style="margin: 0 0 12px 0; color: #4b5563;">${t.thanks}</p>
      <p style="margin: 0 0 20px 0; color: #4b5563;">${t.refund(cityName)}</p>

      <div style="background: #f5f1fa; border-radius: 12px; text-align: center; padding: 14px 16px; margin: 4px 0 20px 0; font-size: 16px; color: #3d2360;">📅 ${t.plan(cityName)}</div>

      <p style="margin: 0 0 12px 0; color: #4b5563;">🎾 ${t.friends(cityName)}</p>

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
    t.thanks, '',
    strip(t.refund(cityName)), '',
    strip(t.plan(cityName)), '',
    t.friends(cityName), '',
    t.help, '',
    strip(t.signoff), '',
    t.unsubscribe
  ].join('\n')

  return { subject, html, text }
}
