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

export const normalizePhoneForStorage = (phone) => {
  if (!phone || !String(phone).trim()) return { phone: '', error: null }
  const raw = String(phone).trim()
  let digits = raw.replace(/[^0-9]/g, '')

  if (!raw.startsWith('+')) {
    if (digits.startsWith('00')) {
      digits = digits.substring(2)
    } else if (digits.length === 9 && /^[6789]/.test(digits)) {
      digits = '34' + digits
    } else if (!(digits.length === 11 && /^34[6789]/.test(digits))) {
      return { phone: raw, error: 'missing_country_code' }
    }
  }

  if (digits.length < 8 || digits.length > 15) return { phone: raw, error: 'invalid' }
  return { phone: '+' + digits, error: null }
}

export const phoneErrorMessage = (error, lang = 'es') => {
  if (error === 'missing_country_code') {
    return lang === 'es'
      ? 'Añade el prefijo de tu país, por ejemplo +34, +44 o +1'
      : 'Please add your country code, e.g. +34, +44 or +1'
  }
  return lang === 'es' ? 'Número de teléfono no válido' : 'Invalid phone number'
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