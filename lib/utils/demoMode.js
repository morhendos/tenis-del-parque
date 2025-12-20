/**
 * Demo Mode Utility
 * 
 * Masks real player names with fake Spanish names for screenshots and marketing.
 * Activate by adding ?demo=true to any URL.
 * 
 * Usage:
 *   const { isDemoMode, maskName } = useDemoMode()
 *   const displayName = isDemoMode ? maskName(realName) : realName
 */

const FAKE_NAMES = [
  'Juan Rodríguez',
  'Carlos Martínez',
  'Adriano Vega',
  'Pablo Ruiz',
  'Javier Torres',
  'Diego Fernández',
  'Roberto Jiménez',
  'Miguel Álvarez',
  'Antonio Navarro',
  'Fernando Muñoz',
  'Alejandro Castro',
  'Daniel Vega',
  'Ana García', 
  'María López',
  'Elena Sánchez',
  'Lucía Moreno',
  'Carmen Díaz',
  'Laura Romero',
  'Isabel Gutiérrez',
  'Patricia Serrano',
  'Sofía Ortega',
  'Raúl Delgado'
]

// Simple hash function to consistently map a name to the same fake name
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Get a consistent fake name for a real name
 * Same real name always returns same fake name
 */
export function getMaskedName(realName) {
  if (!realName) return realName
  const index = hashString(realName) % FAKE_NAMES.length
  return FAKE_NAMES[index]
}

/**
 * Get a fake name by index (useful for standings where position matters)
 */
export function getMaskedNameByIndex(index) {
  return FAKE_NAMES[index % FAKE_NAMES.length]
}

/**
 * Check if demo mode is active from URL search params
 */
export function isDemoModeActive(searchParams) {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    return params.get('demo') === 'true'
  }
  // For server-side or when searchParams object is passed
  if (searchParams?.get) {
    return searchParams.get('demo') === 'true'
  }
  if (searchParams?.demo) {
    return searchParams.demo === 'true'
  }
  return false
}
