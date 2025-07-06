/**
 * Normalize phone number for WhatsApp links
 * Handles common international phone number formats
 */
export const normalizePhoneForWhatsApp = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digit characters first
  let cleaned = phone.replace(/[^0-9]/g, '')
  
  // Handle common prefixes
  if (cleaned.startsWith('00')) {
    // Remove "00" prefix (international dialing format from Europe)
    cleaned = cleaned.substring(2)
  }
  // Note: We don't handle single "0" prefix because it's often a national prefix
  // and removing it incorrectly could break valid numbers
  
  return cleaned
}

/**
 * Create WhatsApp link with normalized phone number
 */
export const createWhatsAppLink = (phone, message = '') => {
  const normalizedPhone = normalizePhoneForWhatsApp(phone)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${normalizedPhone}${message ? `?text=${encodedMessage}` : ''}`
}

/**
 * Validate if a phone number is likely valid for WhatsApp
 */
export const isValidWhatsAppNumber = (phone) => {
  const normalized = normalizePhoneForWhatsApp(phone)
  // Basic validation: should be at least 7 digits (shortest international numbers)
  // and no more than 15 digits (ITU-T recommendation)
  return normalized.length >= 7 && normalized.length <= 15
} 