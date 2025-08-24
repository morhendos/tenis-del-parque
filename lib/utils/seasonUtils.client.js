/**
 * Client-safe season utilities (no database dependencies)
 */

/**
 * Get season display name with fallback to legacy system
 * This version is safe for client-side use
 */
export function getSeasonDisplayName(seasonOrKey, language = 'en') {
  // If it's a season object with name property
  if (seasonOrKey && typeof seasonOrKey === 'object' && seasonOrKey.name) {
    return seasonOrKey.name
  }
  
  // Legacy fallback mapping for backward compatibility
  const legacyNames = {
    en: {
      'verano2025': 'Summer 2025',
      'summer2025': 'Summer 2025', 
      'invierno2025': 'Winter 2025',
      'winter2025': 'Winter 2025',
      'primavera2025': 'Spring 2025',
      'spring2025': 'Spring 2025',
      'otono2025': 'Autumn 2025',
      'autumn2025': 'Autumn 2025',
      'fall2025': 'Autumn 2025'
    },
    es: {
      'verano2025': 'Verano 2025',
      'summer2025': 'Verano 2025',
      'invierno2025': 'Invierno 2025', 
      'winter2025': 'Invierno 2025',
      'primavera2025': 'Primavera 2025',
      'spring2025': 'Primavera 2025',
      'otono2025': 'Otoño 2025',
      'autumn2025': 'Otoño 2025',
      'fall2025': 'Otoño 2025'
    }
  }
  
  return legacyNames[language]?.[seasonOrKey] || seasonOrKey
}

/**
 * Fetch season from API (client-side safe)
 */
export async function fetchSeason(slug, language = 'en') {
  try {
    const response = await fetch(`/api/seasons/${slug}?language=${language}`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching season:', error)
    return null
  }
}