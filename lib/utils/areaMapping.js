/**
 * Geographic Areas to Main Cities Mapping Configuration
 * 
 * This file defines the mapping between specific areas/neighborhoods
 * and their main cities for league organization purposes.
 * 
 * Example: El Paraíso clubs → Marbella League
 */

// Main area-to-city mapping for league organization
export const AREA_CITY_MAPPING = {
  // Costa del Sol - Marbella League
  'el-paraiso': 'marbella',
  'nueva-andalucia': 'marbella',
  'san-pedro-de-alcantara': 'marbella',
  'puerto-banus': 'marbella',
  'aloha': 'marbella',
  'guadalmina': 'marbella',
  'las-chapas': 'marbella',
  'artola': 'marbella',
  'elviria': 'marbella',
  'marbella': 'marbella', // Central Marbella
  'golden-mile': 'marbella',
  'sierra-blanca': 'marbella',
  'nagüeles': 'marbella',
  
  // Estepona Region
  'cancelada': 'estepona',
  'sabinillas': 'estepona',
  'manilva': 'estepona',
  'duquesa': 'estepona',
  'estepona': 'estepona', // Central Estepona
  'benahavís': 'estepona', // Close to Estepona
  
  // Sotogrande Region
  'sotogrande': 'sotogrande',
  'san-roque': 'sotogrande',
  'la-alcaidesa': 'sotogrande',
  'torreguadiaro': 'sotogrande',
  
  // Málaga Region
  'malaga': 'malaga',
  'pedregalejo': 'malaga',
  'el-palo': 'malaga',
  'churriana': 'malaga',
  'torremolinos': 'malaga',
  'benalmádena': 'malaga',
  'fuengirola': 'malaga',
  'mijas': 'malaga',
  
  // Add more areas as needed
}

// Reverse mapping: main city → areas
export const CITY_AREAS_MAPPING = {
  'marbella': [
    'marbella',
    'el-paraiso', 
    'nueva-andalucia',
    'san-pedro-de-alcantara',
    'puerto-banus',
    'aloha',
    'guadalmina',
    'las-chapas',
    'artola',
    'elviria',
    'golden-mile',
    'sierra-blanca',
    'nagüeles'
  ],
  'estepona': [
    'estepona',
    'cancelada',
    'sabinillas', 
    'manilva',
    'duquesa',
    'benahavís'
  ],
  'sotogrande': [
    'sotogrande',
    'san-roque',
    'la-alcaidesa',
    'torreguadiaro'
  ],
  'malaga': [
    'malaga',
    'pedregalejo',
    'el-palo', 
    'churriana',
    'torremolinos',
    'benalmádena',
    'fuengirola',
    'mijas'
  ]
}

// Display names for areas (properly formatted)
export const AREA_DISPLAY_NAMES = {
  'el-paraiso': 'El Paraíso',
  'nueva-andalucia': 'Nueva Andalucía',
  'san-pedro-de-alcantara': 'San Pedro de Alcántara',
  'puerto-banus': 'Puerto Banús',
  'aloha': 'Aloha',
  'guadalmina': 'Guadalmina',
  'las-chapas': 'Las Chapas',
  'artola': 'Artola',
  'elviria': 'Elviria',
  'marbella': 'Marbella',
  'golden-mile': 'Golden Mile',
  'sierra-blanca': 'Sierra Blanca',
  'nagüeles': 'Nagüeles',
  'cancelada': 'Cancelada',
  'sabinillas': 'Sabinillas',
  'manilva': 'Manilva',
  'duquesa': 'Duquesa',
  'estepona': 'Estepona',
  'benahavís': 'Benahavís',
  'sotogrande': 'Sotogrande',
  'san-roque': 'San Roque',
  'la-alcaidesa': 'La Alcaidesa',
  'torreguadiaro': 'Torreguadiaro',
  'malaga': 'Málaga',
  'pedregalejo': 'Pedregalejo',
  'el-palo': 'El Palo',
  'churriana': 'Churriana',
  'torremolinos': 'Torremolinos',
  'benalmádena': 'Benalmádena',
  'fuengirola': 'Fuengirola',
  'mijas': 'Mijas'
}

// Display names for main cities
export const CITY_DISPLAY_NAMES = {
  'marbella': 'Marbella',
  'estepona': 'Estepona', 
  'sotogrande': 'Sotogrande',
  'malaga': 'Málaga'
}

/**
 * Determine the main city for league organization based on area
 * @param {string} area - The specific area/neighborhood
 * @param {string} fallbackCity - Fallback city if area not mapped
 * @returns {string} Main city for league organization
 */
export function determineMainCity(area, fallbackCity = null) {
  if (!area) return fallbackCity || 'unknown'
  
  const normalizedArea = area.toLowerCase().trim()
  
  // Check our mapping first
  if (AREA_CITY_MAPPING[normalizedArea]) {
    return AREA_CITY_MAPPING[normalizedArea]
  }
  
  // Fallback to the area itself or provided fallback
  return fallbackCity || normalizedArea
}

/**
 * Generate display name for area and city combination
 * @param {string} area - The specific area
 * @param {string} mainCity - The main city for leagues
 * @returns {string} Formatted display name
 */
export function generateDisplayName(area, mainCity) {
  if (!area || !mainCity) return mainCity || area || 'Unknown'
  
  const normalizedArea = area.toLowerCase().trim()
  const normalizedCity = mainCity.toLowerCase().trim()
  
  // If area is same as main city, just show city
  if (normalizedArea === normalizedCity) {
    return CITY_DISPLAY_NAMES[normalizedCity] || 
           (normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1))
  }
  
  // Show "Area (City)" format
  const areaDisplay = AREA_DISPLAY_NAMES[normalizedArea] || 
                     normalizedArea.split('-').map(word => 
                       word.charAt(0).toUpperCase() + word.slice(1)
                     ).join(' ')
  
  const cityDisplay = CITY_DISPLAY_NAMES[normalizedCity] || 
                     (normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1))
  
  return `${areaDisplay} (${cityDisplay})`
}

/**
 * Get all areas for a specific main city
 * @param {string} mainCity - The main city
 * @returns {string[]} Array of areas for that city
 */
export function getAreasForCity(mainCity) {
  const normalizedCity = mainCity.toLowerCase().trim()
  return CITY_AREAS_MAPPING[normalizedCity] || []
}

/**
 * Check if an area belongs to a specific main city
 * @param {string} area - The area to check
 * @param {string} mainCity - The main city
 * @returns {boolean} True if area belongs to main city
 */
export function areabelongsToCity(area, mainCity) {
  const normalizedArea = area.toLowerCase().trim()
  const mappedCity = AREA_CITY_MAPPING[normalizedArea]
  return mappedCity === mainCity.toLowerCase().trim()
}

/**
 * Get city options for admin interface
 * @returns {Array} Array of city options with their areas
 */
export function getCityOptions() {
  return [
    {
      value: 'marbella',
      label: 'Marbella',
      description: 'Costa del Sol - Main league city',
      areas: CITY_AREAS_MAPPING.marbella.map(area => ({
        value: area,
        label: AREA_DISPLAY_NAMES[area] || area
      }))
    },
    {
      value: 'estepona',
      label: 'Estepona', 
      description: 'Western Costa del Sol',
      areas: CITY_AREAS_MAPPING.estepona.map(area => ({
        value: area,
        label: AREA_DISPLAY_NAMES[area] || area
      }))
    },
    {
      value: 'sotogrande',
      label: 'Sotogrande',
      description: 'Premium resort area',
      areas: CITY_AREAS_MAPPING.sotogrande.map(area => ({
        value: area,
        label: AREA_DISPLAY_NAMES[area] || area
      }))
    },
    {
      value: 'malaga',
      label: 'Málaga',
      description: 'Eastern Costa del Sol',
      areas: CITY_AREAS_MAPPING.malaga.map(area => ({
        value: area,
        label: AREA_DISPLAY_NAMES[area] || area
      }))
    }
  ]
}

/**
 * Normalize area name from Google Maps data
 * @param {string} googleArea - Area name from Google Maps
 * @returns {string} Normalized area name for our system
 */
export function normalizeGoogleArea(googleArea) {
  if (!googleArea) return null
  
  return googleArea
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[áàâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Extract area information from Google Maps address components
 * @param {Array} addressComponents - Google Maps address components
 * @returns {Object} Extracted area information
 */
export function extractAreaFromGoogle(addressComponents) {
  if (!addressComponents || !Array.isArray(addressComponents)) {
    return { area: null, city: null, administrative: null }
  }
  
  let locality = null
  let sublocality = null
  let administrative = null
  
  // Extract different location types from Google Maps
  addressComponents.forEach(component => {
    if (component.types.includes('locality')) {
      locality = component.long_name
    } else if (component.types.includes('sublocality') || 
               component.types.includes('sublocality_level_1')) {
      sublocality = component.long_name
    } else if (component.types.includes('administrative_area_level_2')) {
      administrative = component.long_name
    }
  })
  
  // Prefer sublocality as the specific area, fallback to locality
  const specificArea = sublocality || locality
  const normalizedArea = normalizeGoogleArea(specificArea)
  
  return {
    area: normalizedArea,
    city: locality ? normalizeGoogleArea(locality) : null,
    administrative: administrative ? normalizeGoogleArea(administrative) : null,
    originalArea: specificArea,
    originalCity: locality
  }
}

// Export all mappings and functions
export default {
  AREA_CITY_MAPPING,
  CITY_AREAS_MAPPING,
  AREA_DISPLAY_NAMES,
  CITY_DISPLAY_NAMES,
  determineMainCity,
  generateDisplayName,
  getAreasForCity,
  areabelongsToCity,
  getCityOptions,
  normalizeGoogleArea,
  extractAreaFromGoogle
}
