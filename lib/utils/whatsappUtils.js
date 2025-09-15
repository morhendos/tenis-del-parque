// WhatsApp utilities for Tennis League community building
// File: lib/utils/whatsappUtils.js

/**
 * Simple WhatsApp utilities for community building
 * Focus: Keep it simple, no complex automation
 */

export const WhatsAppUtils = {
  
  /**
   * Create a WhatsApp message URL for direct messaging
   * @param {string} phoneNumber - Clean phone number (e.g., "34612345678")
   * @param {string} message - Message text
   * @returns {string} WhatsApp URL
   */
  createMessageUrl: (phoneNumber, message) => {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '')
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
  },

  /**
   * Create a WhatsApp group invite link
   * @param {string} groupInviteCode - WhatsApp group invite code from group link
   * @returns {string} WhatsApp group URL
   */
  createGroupUrl: (groupInviteCode) => {
    return `https://chat.whatsapp.com/${groupInviteCode}`
  },

  /**
   * Generate welcome message for new league registrant
   * @param {Object} params - Message parameters
   * @returns {Object} Message object with text and url
   */
  generateWelcomeMessage: ({ 
    playerName, 
    leagueName, 
    isWaitingList = false,
    groupInviteCode = null,
    language = 'es' 
  }) => {
    
    const messages = {
      es: {
        waitingList: `🎾 ¡Hola ${playerName}!

Bienvenido a ${leagueName}.

✅ Tu registro ha sido confirmado
⏳ Estás en la lista de espera

${groupInviteCode ? `Únete a nuestro grupo para conocer otros jugadores y recibir actualizaciones:` : 'Te mantendremos informado por email cuando la liga esté lista.'}

¡Nos vemos pronto en las pistas!`,

        active: `🎾 ¡Hola ${playerName}!

Bienvenido a ${leagueName}.

✅ Tu registro ha sido confirmado
🚀 Te contactaremos pronto para crear tu cuenta

${groupInviteCode ? `Únete a nuestro grupo de jugadores:` : 'Te enviaremos más detalles muy pronto.'}

¡Nos vemos en las pistas!`
      },

      en: {
        waitingList: `🎾 Hi ${playerName}!

Welcome to ${leagueName}.

✅ Your registration is confirmed
⏳ You're on the waiting list

${groupInviteCode ? `Join our group to meet other players and get updates:` : 'We\'ll keep you informed by email when the league is ready.'}

See you on the courts soon!`,

        active: `🎾 Hi ${playerName}!

Welcome to ${leagueName}.

✅ Your registration is confirmed
🚀 We'll contact you soon to create your account

${groupInviteCode ? `Join our players group:` : 'We\'ll send you more details very soon.'}

See you on the courts!`
      }
    }

    const messageText = isWaitingList 
      ? messages[language].waitingList
      : messages[language].active

    return {
      message: messageText,
      groupUrl: groupInviteCode ? WhatsAppUtils.createGroupUrl(groupInviteCode) : null,
      canSendDirect: true
    }
  },

  /**
   * Generate sharing message for referrals
   * @param {Object} params - Sharing parameters
   * @returns {Object} Sharing message object
   */
  generateShareMessage: ({ 
    playerName, 
    leagueName, 
    signupUrl, 
    language = 'es' 
  }) => {
    
    const messages = {
      es: `¡Hola! 👋

Me he apuntado a ${leagueName} y creo que te podría interesar.

Es una liga de tenis bien organizada con:
🎾 Sistema Swiss + Playoffs
📊 Rankings ELO
📱 Plataforma digital
🏆 Ambiente competitivo pero divertido

¿Te animas a jugar conmigo?

Apúntate aquí: ${signupUrl}

¡Será genial tenerte en la liga!
${playerName}`,

      en: `Hi there! 👋

I just signed up for ${leagueName} and thought you might be interested.

It's a well-organized tennis league with:
🎾 Swiss system + Playoffs  
📊 ELO rankings
📱 Digital platform
🏆 Competitive but fun atmosphere

Want to play with me?

Sign up here: ${signupUrl}

Would be great to have you in the league!
${playerName}`
    }

    const shareText = messages[language]
    
    return {
      text: shareText,
      encodedText: encodeURIComponent(shareText),
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      canUseWebShare: typeof navigator !== 'undefined' && navigator.share
    }
  },

  /**
   * Create admin contact WhatsApp URL
   * @param {string} adminPhone - Admin phone number
   * @param {Object} params - Contact parameters
   * @returns {string} WhatsApp URL
   */
  createAdminContactUrl: (adminPhone, { 
    playerName, 
    leagueName, 
    issue = 'general',
    language = 'es' 
  }) => {
    
    const messages = {
      es: {
        general: `Hola, soy ${playerName}. Me registré en ${leagueName} y tengo una consulta.`,
        technical: `Hola, soy ${playerName}. Tengo un problema técnico con mi registro en ${leagueName}.`,
        payment: `Hola, soy ${playerName}. Tengo una consulta sobre el pago de ${leagueName}.`,
        schedule: `Hola, soy ${playerName}. Necesito información sobre horarios de ${leagueName}.`
      },
      en: {
        general: `Hi, I'm ${playerName}. I registered for ${leagueName} and have a question.`,
        technical: `Hi, I'm ${playerName}. I have a technical issue with my registration for ${leagueName}.`,
        payment: `Hi, I'm ${playerName}. I have a payment question about ${leagueName}.`,
        schedule: `Hi, I'm ${playerName}. I need information about ${leagueName} schedules.`
      }
    }

    const message = messages[language][issue] || messages[language].general
    return WhatsAppUtils.createMessageUrl(adminPhone, message)
  },

  /**
   * Simple phone number validation for WhatsApp
   * @param {string} phone - Phone number
   * @returns {boolean} Is valid for WhatsApp
   */
  isValidWhatsAppNumber: (phone) => {
    const cleanPhone = phone.replace(/[^\d]/g, '')
    // Basic validation: 8-15 digits (international format)
    return cleanPhone.length >= 8 && cleanPhone.length <= 15
  },

  /**
   * Format phone number for display
   * @param {string} phone - Raw phone number
   * @param {string} countryCode - Default country code (e.g., "34" for Spain)
   * @returns {string} Formatted phone number
   */
  formatPhoneForDisplay: (phone, countryCode = '34') => {
    let cleanPhone = phone.replace(/[^\d]/g, '')
    
    // Add country code if missing
    if (!cleanPhone.startsWith(countryCode) && cleanPhone.length < 12) {
      cleanPhone = countryCode + cleanPhone
    }
    
    // Format for Spanish numbers (+34 XXX XXX XXX)
    if (cleanPhone.startsWith('34') && cleanPhone.length === 11) {
      return `+${cleanPhone.substr(0, 2)} ${cleanPhone.substr(2, 3)} ${cleanPhone.substr(5, 3)} ${cleanPhone.substr(8, 3)}`
    }
    
    // Generic international format
    return `+${cleanPhone}`
  }
}

/**
 * React hook for WhatsApp sharing functionality
 * @param {Object} shareData - Data to share
 * @returns {Object} Sharing functions and state
 */
export const useWhatsAppShare = (shareData) => {
  const [isSharing, setIsSharing] = React.useState(false)
  
  const shareViaWhatsApp = async () => {
    setIsSharing(true)
    
    try {
      const shareMessage = WhatsAppUtils.generateShareMessage(shareData)
      
      // Try native sharing first (mobile)
      if (shareMessage.canUseWebShare) {
        await navigator.share({
          title: shareData.leagueName,
          text: shareMessage.text
        })
      } else {
        // Fallback to WhatsApp direct
        window.open(shareMessage.whatsappUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Final fallback - copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage.text)
        alert(shareData.language === 'es' 
          ? 'Enlace copiado al portapapeles' 
          : 'Link copied to clipboard'
        )
      }
    } finally {
      setIsSharing(false)
    }
  }
  
  return {
    shareViaWhatsApp,
    isSharing
  }
}

/**
 * League-specific WhatsApp group management
 * Store group invite codes in League model
 */
export const LeagueWhatsAppGroups = {
  
  /**
   * Add WhatsApp group field to League schema (documentation)
   * Add this to your League model:
   * 
   * whatsappGroup: {
   *   inviteCode: String,      // The invite code from group link
   *   name: String,            // Group display name
   *   isActive: Boolean,       // Whether group is currently active
   *   createdAt: Date,         // When group was created
   *   adminPhone: String       // Group admin contact
   * }
   */
  
  /**
   * Generate group invite data for league
   * @param {Object} league - League document
   * @returns {Object} Group invite information
   */
  getGroupInviteData: (league) => {
    if (!league.whatsappGroup?.inviteCode || !league.whatsappGroup?.isActive) {
      return null
    }
    
    return {
      groupUrl: WhatsAppUtils.createGroupUrl(league.whatsappGroup.inviteCode),
      groupName: league.whatsappGroup.name || `${league.name} - Jugadores`,
      adminContact: league.whatsappGroup.adminPhone || null
    }
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WhatsAppUtils, LeagueWhatsAppGroups }
}

/**
 * Usage Examples:
 * 
 * // Generate welcome message
 * const welcome = WhatsAppUtils.generateWelcomeMessage({
 *   playerName: 'Carlos',
 *   leagueName: 'Liga de Sotogrande',
 *   isWaitingList: true,
 *   groupInviteCode: 'ABC123DEF456',
 *   language: 'es'
 * })
 * 
 * // Create sharing message
 * const share = WhatsAppUtils.generateShareMessage({
 *   playerName: 'Carlos',
 *   leagueName: 'Liga de Sotogrande', 
 *   signupUrl: 'https://tenisdelparque.com/signup/sotogrande',
 *   language: 'es'
 * })
 * 
 * // Use in React component:
 * const { shareViaWhatsApp, isSharing } = useWhatsAppShare({
 *   playerName: 'Carlos',
 *   leagueName: 'Liga de Sotogrande',
 *   signupUrl: window.location.href,
 *   language: 'es'
 * })
 * 
 * // Admin contact
 * const adminUrl = WhatsAppUtils.createAdminContactUrl('+34612345678', {
 *   playerName: 'Carlos',
 *   leagueName: 'Liga de Sotogrande',
 *   issue: 'technical',
 *   language: 'es'
 * })
 */
