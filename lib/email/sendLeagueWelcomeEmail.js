import User from '../models/User'
import { generateWelcomeEmail } from './templates/welcomeEmail'
import { sendEmail } from './resend'

export async function sendLeagueWelcomeEmail({ player, league, registration, language = 'es' }) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'
  const lang = language === 'en' ? 'en' : 'es'

  let activationLink = null
  let hasUserAccount = false
  const user = await User.findOne({ email: player.email.toLowerCase() })
  if (user?.emailVerified) {
    hasUserAccount = true
  } else if (user) {
    const token = await user.generateActivationToken()
    await user.save()
    activationLink = `${baseUrl}/activate?token=${encodeURIComponent(token)}`
  }

  const whatsappGroupInfo = league.getWhatsAppGroupInfo ? league.getWhatsAppGroupInfo() : null
  const isExistingPlayer = (player.registrations || []).some(r => String(r.league) !== String(league._id))

  const emailData = generateWelcomeEmail(
    {
      playerName: player.name,
      playerEmail: player.email,
      playerWhatsApp: player.whatsapp,
      playerLevel: registration.level,
      language: lang,
      hasUserAccount,
      activationLink,
      isExistingPlayer,
      discountCode: registration.discountCode || null,
      discountApplied: registration.discountApplied || 0,
      originalPrice: registration.originalPrice,
      finalPrice: registration.finalPrice
    },
    {
      leagueName: league.name,
      leagueStatus: league.status,
      expectedStartDate: league.seasonConfig?.startDate || league.expectedLaunchDate,
      whatsappGroupLink: whatsappGroupInfo?.inviteLink || null,
      shareUrl: `${baseUrl}/${lang === 'en' ? 'en/signup' : 'es/registro'}/${league.slug}`
    },
    {
      unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(player.email)}`,
      loginUrl: `${baseUrl}/login`
    }
  )

  return sendEmail({
    to: player.email,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text
  })
}
