/**
 * DEPRECATED - This file is no longer used
 * 
 * The manual area-to-city mapping has been replaced with GPS-based polygon areas.
 * League assignment is now handled automatically through geographic polygons
 * defined in the Areas Map Editor (/admin/areas/map).
 * 
 * For GPS-based area functionality, see:
 * - /components/admin/areas/ - Area management components
 * - /lib/utils/geographicBoundaries.js - League polygon definitions
 * 
 * This file is kept temporarily for reference but should be removed once
 * all dependencies have been updated.
 * 
 * @deprecated Since implementation of GPS polygon areas
 */

// ==================== DEPRECATED CODE BELOW ====================
// This code is no longer actively used but kept for reference

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
  'marbella': 'marbella',
  'golden-mile': 'marbella',
  'sierra-blanca': 'marbella',
  'nagüeles': 'marbella',
  
  // Estepona Region
  'cancelada': 'estepona',
  'sabinillas': 'estepona',
  'manilva': 'estepona',
  'duquesa': 'estepona',
  'estepona': 'estepona',
  'benahavís': 'estepona',
  
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
 * @deprecated Use GPS polygon-based area detection instead
 */
export function determineMainCity(area, fallbackCity = null) {
  console.warn('areaMapping.determineMainCity is deprecated. Use GPS-based area detection.')
  if (!area) return fallbackCity || 'unknown'
  
  const normalizedArea = area.toLowerCase().trim()
  
  if (AREA_CITY_MAPPING[normalizedArea]) {
    return AREA_CITY_MAPPING[normalizedArea]
  }
  
  return fallbackCity || normalizedArea
}

/**
 * @deprecated No longer needed with GPS-based areas
 */
export function generateDisplayName(area, mainCity) {
  console.warn('areaMapping.generateDisplayName is deprecated.')
  if (!area || !mainCity) return mainCity || area || 'Unknown'
  
  const normalizedArea = area.toLowerCase().trim()
  const normalizedCity = mainCity.toLowerCase().trim()
  
  if (normalizedArea === normalizedCity) {
    return CITY_DISPLAY_NAMES[normalizedCity] || 
           (normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1))
  }
  
  const areaDisplay = AREA_DISPLAY_NAMES[normalizedArea] || 
                     normalizedArea.split('-').map(word => 
                       word.charAt(0).toUpperCase() + word.slice(1)
                     ).join(' ')
  
  const cityDisplay = CITY_DISPLAY_NAMES[normalizedCity] || 
                     (normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1))
  
  return `${areaDisplay} (${cityDisplay})`
}

/**
 * @deprecated Use GPS-based area queries instead
 */
export function getAreasForCity(mainCity) {
  console.warn('areaMapping.getAreasForCity is deprecated. Use GPS-based area detection.')
  const normalizedCity = mainCity.toLowerCase().trim()
  return CITY_AREAS_MAPPING[normalizedCity] || []
}

/**
 * @deprecated Use GPS polygon containment check instead
 */
export function areabelongsToCity(area, mainCity) {
  console.warn('areaMapping.areabelongsToCity is deprecated. Use GPS-based area detection.')
  const normalizedArea = area.toLowerCase().trim()
  const mappedCity = AREA_CITY_MAPPING[normalizedArea]
  return mappedCity === mainCity.toLowerCase().trim()
}

/**
 * @deprecated City options should be simple without area mapping
 */
export function getCityOptions() {
  console.warn('areaMapping.getCityOptions is deprecated.')
  return [
    {
      value: 'marbella',
      label: 'Marbella',
      description: 'Costa del Sol - Main league city'
    },
    {
      value: 'estepona',
      label: 'Estepona', 
      description: 'Western Costa del Sol'
    },
    {
      value: 'sotogrande',
      label: 'Sotogrande',
      description: 'Premium resort area'
    },
    {
      value: 'malaga',
      label: 'Málaga',
      description: 'Eastern Costa del Sol'
    }
  ]
}

/**
 * @deprecated Normalization should be done differently
 */
export function normalizeGoogleArea(googleArea) {
  console.warn('areaMapping.normalizeGoogleArea is deprecated.')
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
 * @deprecated Google area extraction no longer needed
 */
export function extractAreaFromGoogle(addressComponents) {
  console.warn('areaMapping.extractAreaFromGoogle is deprecated.')
  if (!addressComponents || !Array.isArray(addressComponents)) {
    return { area: null, city: null, administrative: null }
  }
  
  let locality = null
  let sublocality = null
  let administrative = null
  
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

// Export all deprecated functions
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
