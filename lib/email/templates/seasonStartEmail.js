const HERO_URL = 'https://www.tenisdp.es/email/season-start.jpg'
const LOGO_URL = 'https://www.tenisdp.es/email/logo.png'

const content = {
  es: {
    subject: '¡Comienza la temporada! Tu primer partido te espera',
    subjectBye: '¡Comienza la temporada! Descansas en la Ronda 1',
    preheader: (rival) => rival ? `Ronda 1: tú contra ${rival}. Escríbele y quedad para jugar.` : 'Ronda 1: descansas y sumas 3 puntos.',
    band: '¡Empieza la temporada!',
    greeting: (name) => `Hola ${name},`,
    intro: (league) => `Ha llegado el momento. La temporada de ${league} empieza hoy y tu primer partido ya está asignado.`,
    introBye: (league) => `Ha llegado el momento. La temporada de ${league} empieza hoy.`,
    round: 'Ronda 1',
    you: 'Tú',
    rival: 'Rival',
    deadline: (d) => `Jugad antes del <strong>${d}</strong>`,
    whatsapp: (rival) => `Escribir a ${rival} por WhatsApp`,
    account: 'Ver el partido en mi cuenta',
    stepsTitle: 'Cómo funciona',
    steps: ['Escribe a tu rival y quedad día, hora y pista', 'Jugad el partido antes de la fecha límite', 'Uno de los dos registra el resultado en su cuenta'],
    postpone: 'Tienes <strong>3 aplazamientos</strong> esta temporada. Cada uno da 7 días más. Úsalos solo si hace falta.',
    byeTitle: 'Descansas esta ronda',
    byePoints: '+3 puntos',
    byeText: 'Somos un número impar de jugadores, así que cada ronda uno descansa. Te llevas los puntos de una victoria 2-0. Es rotativo, a todos les toca.',
    byeNext: 'Tu primer partido será en la Ronda 2. Te avisamos cuando salgan los emparejamientos.',
    byeCta: 'Ver la clasificación',
    whatsappMsg: (rival, me) => `Hola ${rival}! Soy ${me} de la liga de Tenis del Parque. ¿Cuándo te viene bien jugar nuestro partido de la Ronda 1?`,
    help: '¿Alguna pregunta? Responde a este correo.',
    signoff: 'Tenis del Parque. Tu dosis semanal de tenis.'
  },
  en: {
    subject: 'The season begins! Your first match awaits',
    subjectBye: 'The season begins! You rest in Round 1',
    preheader: (rival) => rival ? `Round 1: you vs ${rival}. Message them and set up your match.` : 'Round 1: you rest and get 3 points.',
    band: 'The season starts!',
    greeting: (name) => `Hi ${name},`,
    intro: (league) => `The moment has arrived. The ${league} season starts today and your first match is set.`,
    introBye: (league) => `The moment has arrived. The ${league} season starts today.`,
    round: 'Round 1',
    you: 'You',
    rival: 'Rival',
    deadline: (d) => `Play before <strong>${d}</strong>`,
    whatsapp: (rival) => `Message ${rival} on WhatsApp`,
    account: 'See the match in my account',
    stepsTitle: 'How it works',
    steps: ['Message your rival and agree on day, time and court', 'Play the match before the deadline', 'One of you enters the result in your account'],
    postpone: 'You have <strong>3 postponements</strong> this season. Each one gives you 7 more days. Use them only if needed.',
    byeTitle: 'You rest this round',
    byePoints: '+3 points',
    byeText: "We have an odd number of players, so one player rests each round. You get the points of a 2-0 win. It rotates, everyone gets one.",
    byeNext: "Your first match will be in Round 2. We'll let you know when the pairings are out.",
    byeCta: 'See the standings',
    whatsappMsg: (rival, me) => `Hi ${rival}! I'm ${me} from the Tenis del Parque league. When would be a good time to play our Round 1 match?`,
    help: 'Any questions? Just reply to this email.',
    signoff: 'Tenis del Parque. Your weekly dose of tennis.'
  }
}

export function generateSeasonStartEmail(data) {
  const {
    playerName,
    opponentName,
    opponentWhatsApp,
    leagueName,
    city,
    season,
    deadline,
    isBye = false,
    language = 'es',
    heroUrl = HERO_URL,
    logoUrl = LOGO_URL
  } = data

  const t = content[language] || content.es
  const firstName = (playerName || '').split(' ')[0] || playerName
  const rivalFirst = (opponentName || '').split(' ')[0] || opponentName
  const dashboardLink = 'https://www.tenisdp.es/login'
  const leagueLabel = [leagueName, city].filter(Boolean).join(' · ')

  let whatsappLink = null
  if (opponentWhatsApp) {
    let cleaned = opponentWhatsApp.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('00')) cleaned = cleaned.substring(2)
    whatsappLink = `https://wa.me/${cleaned}?text=${encodeURIComponent(t.whatsappMsg(rivalFirst, firstName))}`
  }

  const formattedDeadline = formatDeadline(deadline, language)
  const subject = isBye ? t.subjectBye : t.subject

  const matchBlock = `
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 4px 0 20px 0;">
        <div style="background: #f5f1fa; padding: 10px 16px; text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #563380;">${t.round}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="42%" align="center" style="padding: 20px 8px;">
              <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">${t.you}</div>
              <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-top: 4px;">${playerName}</div>
            </td>
            <td width="16%" align="center" style="padding: 20px 0; font-size: 14px; font-weight: 700; color: #563380;">VS</td>
            <td width="42%" align="center" style="padding: 20px 8px;">
              <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">${t.rival}</div>
              <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-top: 4px;">${opponentName || ''}</div>
            </td>
          </tr>
        </table>
        <div style="border-top: 1px solid #e5e7eb; padding: 12px 16px; text-align: center; font-size: 15px; color: #3d2360;">📅 ${t.deadline(formattedDeadline)}</div>
      </div>

      ${whatsappLink ? `<div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="${whatsappLink}" style="display: inline-block; background-color: #22c55e; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">${t.whatsapp(rivalFirst)}</a>
      </div>` : ''}
      <div style="text-align: center; margin: 0 0 24px 0;">
        <a href="${dashboardLink}" style="color: #563380; font-size: 14px; text-decoration: underline;">${t.account}</a>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 18px 20px; margin: 0 0 16px 0;">
        <div style="font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 8px;">${t.stepsTitle}</div>
        ${t.steps.map((s, i) => `<div style="color: #4b5563; font-size: 14px; padding: 4px 0;"><span style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 11px; background: #563380; color: white; font-size: 12px; font-weight: 700; margin-right: 8px;">${i + 1}</span>${s}</div>`).join('')}
      </div>
      <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px;">${t.postpone}</p>`

  const byeBlock = `
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 4px 0 20px 0; text-align: center;">
        <div style="background: #f5f1fa; padding: 10px 16px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #563380;">${t.round}</div>
        <div style="padding: 20px 16px;">
          <div style="font-size: 18px; font-weight: 700; color: #1f2937;">${t.byeTitle}</div>
          <div style="font-size: 28px; font-weight: 700; color: #16a34a; margin-top: 6px;">${t.byePoints}</div>
        </div>
      </div>
      <p style="margin: 0 0 12px 0; color: #4b5563;">${t.byeText}</p>
      <p style="margin: 0 0 12px 0; color: #4b5563;">${t.byeNext}</p>
      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${dashboardLink}" style="display: inline-block; background-color: #563380; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">${t.byeCta}</a>
      </div>`

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
  <div style="display: none; max-height: 0; overflow: hidden;">${t.preheader(isBye ? null : rivalFirst)}</div>
  <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; text-align: left;">

    <div style="padding: 14px 32px; text-align: center; background: #ffffff; border-radius: 16px 16px 0 0;">
      <img src="${logoUrl}" alt="Tenis del Parque" width="130" style="width: 130px; height: auto;">
    </div>

    <img src="${heroUrl}" alt="Tenis del Parque" width="600" style="width: 100%; max-width: 600px; height: auto; display: block;">

    <div style="background: linear-gradient(135deg, #563380, #3d2360); color: white; padding: 24px 32px; text-align: center;">
      <div style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">${leagueLabel}${season ? ` · ${formatSeason(season, language)}` : ''}</div>
      <div style="font-size: 30px; font-weight: 700; margin-top: 4px;">${t.band}</div>
    </div>

    <div style="padding: 32px;">
      <p style="margin: 0 0 12px 0; font-size: 16px;">${t.greeting(firstName)}</p>
      <p style="margin: 0 0 20px 0; color: #4b5563;">${isBye ? t.introBye(leagueName) : t.intro(leagueName)}</p>
      ${isBye ? byeBlock : matchBlock}
      <p style="margin: 24px 0 0 0; color: #4b5563;">${t.help}</p>
      <p style="margin: 16px 0 0 0; color: #4b5563;">${t.signoff}</p>
    </div>

    <div style="background-color: #f3f4f6; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
      <a href="https://www.tenisdp.es" style="color: #563380; text-decoration: none;">tenisdp.es</a>
    </div>
  </div>
  <div style="height: 28px; line-height: 28px; font-size: 1px;">&nbsp;</div>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html, text: htmlToText(html) }
}

function formatDeadline(dateString, language) {
  if (!dateString) return language === 'es' ? '7 días' : '7 days'
  return new Date(dateString).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Madrid'
  })
}

function formatSeason(season, language) {
  if (!season) return ''
  const [type, year] = season.split('-')
  const names = {
    winter: { es: 'Invierno', en: 'Winter' },
    spring: { es: 'Primavera', en: 'Spring' },
    summer: { es: 'Verano', en: 'Summer' },
    fall: { es: 'Otoño', en: 'Autumn' },
    autumn: { es: 'Otoño', en: 'Autumn' }
  }
  return `${names[type]?.[language] || type} ${year}`
}

function htmlToText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}
