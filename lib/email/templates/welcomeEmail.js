const LOGO_URL = 'https://www.tenisdp.es/email/logo.png'
const HERO_URL = 'https://www.tenisdp.es/email/welcome-hero.jpg'
const PURPLE = '#563380'
const PURPLE_DARK = '#3d2360'
const PURPLE_SOFT = '#f5f1fa'

const content = {
  es: {
    subject: (league) => `Bienvenido a ${league} 🎾`,
    preheader: (league) => `Ya estás dentro de ${league}. Aquí tienes todo lo que necesitas para empezar.`,
    badge: { waiting: 'Lista de espera', active: 'Inscripción confirmada' },
    title: (name) => `¡Bienvenido, ${name}!`,
    intro: (league) => `Ya estás dentro de <strong>${league}</strong>. Aquí tienes lo importante para empezar.`,
    summary: { league: 'Liga', level: 'Nivel', start: 'Empieza' },
    formatTitle: 'Cómo funciona',
    stats: [['8', 'Rondas'], ['1', 'Partido por semana'], ['~8', 'Semanas']],
    formatText: 'Cada ronda te emparejamos con un rival de nivel similar según tu ranking ELO. Vosotros acordáis día, hora y pista.',
    onTimeTitle: '⏰ Juega a tiempo',
    onTimeText: 'Los emparejamientos y el ranking funcionan mejor cuando todos jugamos a tiempo. Si te surge algo, tienes <strong>3 aplazamientos por temporada</strong>, cada uno da 1 semana más.',
    activationTitle: '🔐 Crea tu contraseña',
    activationText: 'Tu cuenta está lista. Solo falta crear tu contraseña para entrar. El enlace caduca en 72 horas.',
    stepsTitle: 'Próximos pasos',
    steps: {
      waiting: (date) => [['Ahora', 'Registro completado ✅'], ['Próximamente', 'Formamos los grupos por nivel'], [date, 'Empieza la liga, ronda 1'], ['Final', 'Playoffs y final 🏆']],
      active: (date) => [['Ahora', 'Registro completado ✅'], [date, 'Empieza la liga, ronda 1'], ['8 semanas', 'Un partido por semana'], ['Final', 'Playoffs y final 🏆']]
    },
    whatsappText: 'Únete al grupo de WhatsApp de la liga para estar al día.',
    whatsappCta: 'Unirme al grupo',
    ctaActivate: 'Crear mi contraseña',
    ctaLogin: 'Ir a mi cuenta',
    inviteTitle: '🤝 Invita a tus amigos',
    inviteText: '¿Conoces a alguien que querría jugar? Pásale este enlace:',
    helpTitle: '¿Alguna pregunta?',
    helpText: 'Escríbenos por WhatsApp al <a href="https://wa.me/34652714328" style="color: ' + PURPLE + ';">+34 652 714 328</a> o responde a este email.',
    signoff: 'Nos vemos en la pista. 🎾<br>Tenis del Parque. Tu dosis semanal de tenis.',
    footer: (league, url) => `Recibes este email porque te inscribiste en ${league}. <a href="${url}" style="color: #9ca3af;">Darme de baja</a>`,
    tbd: 'Por confirmar'
  },
  en: {
    subject: (league) => `Welcome to ${league} 🎾`,
    preheader: (league) => `You're in ${league}. Here's everything you need to get started.`,
    badge: { waiting: 'Waiting list', active: 'Registration confirmed' },
    title: (name) => `Welcome, ${name}!`,
    intro: (league) => `You're in <strong>${league}</strong>. Here's what you need to know to get started.`,
    summary: { league: 'League', level: 'Level', start: 'Starts' },
    formatTitle: 'How it works',
    stats: [['8', 'Rounds'], ['1', 'Match per week'], ['~8', 'Weeks']],
    formatText: 'Each round we pair you with a rival of similar level based on your ELO ranking. You two agree on the day, time and court.',
    onTimeTitle: '⏰ Play on time',
    onTimeText: 'Pairings and rankings work best when everyone plays on time. If something comes up, you have <strong>3 postponements per season</strong>, each gives you 1 extra week.',
    activationTitle: '🔐 Create your password',
    activationText: 'Your account is ready. You just need to create your password to log in. The link expires in 72 hours.',
    stepsTitle: 'Next steps',
    steps: {
      waiting: (date) => [['Now', 'Registration done ✅'], ['Soon', 'We form the groups by level'], [date, 'League starts, round 1'], ['End', 'Playoffs and final 🏆']],
      active: (date) => [['Now', 'Registration done ✅'], [date, 'League starts, round 1'], ['8 weeks', 'One match per week'], ['End', 'Playoffs and final 🏆']]
    },
    whatsappText: "Join the league's WhatsApp group to stay up to date.",
    whatsappCta: 'Join the group',
    ctaActivate: 'Create my password',
    ctaLogin: 'Go to my account',
    inviteTitle: '🤝 Invite your friends',
    inviteText: 'Know someone who would like to play? Send them this link:',
    helpTitle: 'Any questions?',
    helpText: 'Message us on WhatsApp at <a href="https://wa.me/34652714328" style="color: ' + PURPLE + ';">+34 652 714 328</a> or just reply to this email.',
    signoff: 'See you on court. 🎾<br>Tenis del Parque. Your weekly dose of tennis.',
    footer: (league, url) => `You get this email because you signed up for ${league}. <a href="${url}" style="color: #9ca3af;">Unsubscribe</a>`,
    tbd: 'To be confirmed'
  }
}

const levels = {
  beginner: { es: 'Principiante', en: 'Beginner' },
  intermediate: { es: 'Intermedio', en: 'Intermediate' },
  advanced: { es: 'Avanzado', en: 'Advanced' }
}

function formatDate(dateString, language, tbd) {
  if (!dateString) return tbd
  const date = new Date(dateString)
  if (isNaN(date)) return tbd
  return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Madrid'
  })
}

function levelName(level, language) {
  if (!level) return ''
  return levels[level]?.[language] || level.charAt(0).toUpperCase() + level.slice(1)
}

function button(href, label) {
  return `<a href="${href}" style="display: inline-block; background-color: ${PURPLE}; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">${label}</a>`
}

export function generateWelcomeEmail(playerData, leagueData, options = {}) {
  const {
    playerName,
    playerLevel,
    language = 'es',
    activationLink = null
  } = playerData

  const {
    leagueName = '',
    leagueStatus,
    expectedStartDate,
    whatsappGroupLink,
    shareUrl
  } = leagueData

  const {
    unsubscribeUrl = '#',
    loginUrl = 'https://www.tenisdp.es/login'
  } = options

  const lang = language === 'en' ? 'en' : 'es'
  const t = content[lang]
  const isWaitingList = leagueStatus === 'coming_soon'
  const firstName = (playerName || '').split(' ')[0] || (lang === 'es' ? 'jugador' : 'player')
  const startDate = formatDate(expectedStartDate, lang, t.tbd)
  const steps = (isWaitingList ? t.steps.waiting : t.steps.active)(startDate)

  const summaryRows = [
    [t.summary.league, leagueName],
    [t.summary.level, levelName(playerLevel, lang)],
    [t.summary.start, startDate]
  ].filter(([, v]) => v).map(([k, v]) => `
          <tr>
            <td style="padding: 6px 0; color: #7a5ba3; font-size: 14px;" width="35%">${k}</td>
            <td style="padding: 6px 0; font-weight: 600; color: ${PURPLE_DARK}; font-size: 15px;">${v}</td>
          </tr>`).join('')

  const statCells = t.stats.map(([n, label]) => `
          <td width="33%" align="center" style="padding: 0 4px;">
            <div style="background: ${PURPLE_SOFT}; border-radius: 10px; padding: 12px 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: ${PURPLE};">${n}</div>
              <div style="font-size: 11px; color: #7a5ba3; text-transform: uppercase; letter-spacing: 1px;">${label}</div>
            </div>
          </td>`).join('')

  const stepRows = steps.map(([when, what], i) => `
          <tr>
            <td width="24" valign="top" style="padding: 8px 0;">
              <div style="width: 12px; height: 12px; border-radius: 6px; background: ${i === 0 ? PURPLE : '#d9cbe9'}; margin-top: 5px;"></div>
            </td>
            <td valign="top" style="padding: 8px 0;">
              <div style="font-size: 15px; font-weight: 600; color: #1f2937;">${when}</div>
              <div style="font-size: 14px; color: #6b7280;">${what}</div>
            </td>
          </tr>`).join('')

  const activationBox = activationLink ? `
      <div style="background: ${PURPLE_SOFT}; border: 1px dashed #a683cc; border-radius: 12px; text-align: center; padding: 20px; margin: 0 0 24px 0;">
        <div style="font-size: 16px; font-weight: 700; color: ${PURPLE};">${t.activationTitle}</div>
        <div style="font-size: 14px; color: #4b5563; margin: 6px 0 16px 0;">${t.activationText}</div>
        ${button(activationLink, t.ctaActivate)}
      </div>` : ''

  const whatsappBox = whatsappGroupLink ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; text-align: center; padding: 18px; margin: 0 0 24px 0;">
        <div style="font-size: 14px; color: #166534; margin-bottom: 12px;">💬 ${t.whatsappText}</div>
        <a href="${whatsappGroupLink}" style="display: inline-block; background-color: #16a34a; color: white !important; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">${t.whatsappCta}</a>
      </div>` : ''

  const mainCta = activationLink ? '' : `
      <div style="text-align: center; margin: 8px 0 28px 0;">
        ${button(loginUrl, t.ctaLogin)}
      </div>`

  const inviteBox = shareUrl ? `
      <div style="border-top: 1px solid #eee7f5; padding-top: 20px; margin-top: 4px;">
        <div style="font-size: 16px; font-weight: 700; color: ${PURPLE};">${t.inviteTitle}</div>
        <div style="font-size: 14px; color: #4b5563; margin: 4px 0 8px 0;">${t.inviteText}</div>
        <a href="${shareUrl}" style="color: ${PURPLE}; font-size: 14px; word-break: break-all;">${shareUrl}</a>
      </div>` : ''

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t.subject(leagueName)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9fafb" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 28px 12px;">
  <div style="display: none; max-height: 0; overflow: hidden;">${t.preheader(leagueName)}</div>
  <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; text-align: left;">
    <div style="padding: 18px 32px; text-align: center; background: #ffffff; border-radius: 16px 16px 0 0;">
      <img src="${LOGO_URL}" alt="Tenis del Parque" width="180" style="width: 180px; height: auto;">
    </div>
    <img src="${HERO_URL}" alt="Tenis del Parque" width="600" style="width: 100%; max-width: 600px; height: auto; display: block;">
    <div style="background: linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK}); background-color: ${PURPLE}; color: white; padding: 28px 32px; text-align: center;">
      <div style="display: inline-block; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.4); border-radius: 20px; padding: 4px 14px;">${isWaitingList ? t.badge.waiting : t.badge.active}</div>
      <div style="font-size: 30px; font-weight: 700; margin-top: 12px; line-height: 1.2;">${t.title(firstName)}</div>
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">${t.intro(leagueName)}</p>

      <div style="background: ${PURPLE_SOFT}; border-radius: 12px; padding: 12px 20px; margin: 0 0 24px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${summaryRows}
        </table>
      </div>
${activationBox}${mainCta}
      <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">${t.formatTitle}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 12px 0;">
        <tr>${statCells}
        </tr>
      </table>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563;">${t.formatText}</p>

      <div style="border-left: 4px solid ${PURPLE}; background: #faf8fd; border-radius: 0 12px 12px 0; padding: 14px 18px; margin: 0 0 24px 0;">
        <div style="font-size: 15px; font-weight: 700; color: ${PURPLE_DARK};">${t.onTimeTitle}</div>
        <div style="font-size: 14px; color: #4b5563; margin-top: 4px;">${t.onTimeText}</div>
      </div>

      <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 4px 0;">${t.stepsTitle}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">${stepRows}
      </table>
${whatsappBox}${inviteBox}
      <div style="margin-top: 24px;">
        <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${t.helpTitle}</div>
        <div style="font-size: 14px; color: #4b5563; margin-top: 4px;">${t.helpText}</div>
      </div>

      <p style="margin: 28px 0 0 0; color: #4b5563;">${t.signoff}</p>
    </div>
    <div style="background-color: #f3f4f6; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
      <a href="https://www.tenisdp.es" style="color: ${PURPLE}; text-decoration: none;">tenisdp.es</a><br>
      ${t.footer(leagueName, unsubscribeUrl)}
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
    strip(t.title(firstName)),
    '',
    strip(t.intro(leagueName)),
    '',
    `${t.summary.league}: ${leagueName}`,
    `${t.summary.level}: ${levelName(playerLevel, lang)}`,
    `${t.summary.start}: ${startDate}`,
    '',
    ...(activationLink ? [`${strip(t.activationTitle)}: ${activationLink}`, ''] : [`${t.ctaLogin}: ${loginUrl}`, '']),
    t.formatTitle,
    strip(t.formatText),
    '',
    strip(t.onTimeTitle),
    strip(t.onTimeText),
    '',
    t.stepsTitle,
    ...steps.map(([when, what]) => `- ${when}: ${what}`),
    ...(whatsappGroupLink ? ['', `${t.whatsappText} ${whatsappGroupLink}`] : []),
    ...(shareUrl ? ['', `${strip(t.inviteTitle)}: ${shareUrl}`] : []),
    '',
    strip(t.helpText),
    '',
    strip(t.signoff),
    '',
    strip(t.footer(leagueName, unsubscribeUrl)) + ' ' + unsubscribeUrl
  ].join('\n')

  return { subject: t.subject(leagueName), html, text }
}
