// Geographic boundary utilities for league assignment
// These functions determine which league a club belongs to based on its GPS coordinates

// Define league boundaries using polygons
export const LEAGUE_POLYGONS = {
  marbella: {
    bounds: [
      { lat: 36.6200, lng: -5.1000 }, // Northwest (includes San Pedro, Guadalmina)
      { lat: 36.6200, lng: -4.7500 }, // Northeast (includes Las Chapas)
      { lat: 36.4300, lng: -4.7500 }, // Southeast (includes Elviria)
      { lat: 36.4300, lng: -5.1000 }, // Southwest (includes El Paraiso)
    ],
    color: '#8B5CF6',
    name: 'Marbella',
    center: { lat: 36.5101, lng: -4.8824 }
  },
  malaga: {
    bounds: [
      { lat: 36.8500, lng: -4.7000 }, // Northwest
      { lat: 36.8500, lng: -4.2000 }, // Northeast
      { lat: 36.5000, lng: -4.2000 }, // Southeast
      { lat: 36.5000, lng: -4.7000 }, // Southwest (includes Torremolinos, Benalmadena, Fuengirola)
    ],
    color: '#10B981',
    name: 'Málaga',
    center: { lat: 36.7213, lng: -4.4214 }
  },
  estepona: {
    bounds: [
      { lat: 36.5500, lng: -5.3500 }, // Northwest (includes Benahavís)
      { lat: 36.5500, lng: -5.0500 }, // Northeast
      { lat: 36.3800, lng: -5.0500 }, // Southeast
      { lat: 36.3800, lng: -5.3500 }, // Southwest (includes Manilva, Sabinillas)
    ],
    color: '#F59E0B',
    name: 'Estepona',
    center: { lat: 36.4285, lng: -5.1450 }
  },
  sotogrande: {
    bounds: [
      { lat: 36.3500, lng: -5.4000 }, // Northwest
      { lat: 36.3500, lng: -5.1500 }, // Northeast
      { lat: 36.1500, lng: -5.1500 }, // Southeast
      { lat: 36.1500, lng: -5.4000 }, // Southwest (includes San Roque)
    ],
    color: '#EF4444',
    name: 'Sotogrande',
    center: { lat: 36.2847, lng: -5.2558 }
  }
}

// Improved function to check if point is inside polygon using ray casting algorithm
export function isPointInPolygon(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) {
    console.warn('Invalid polygon - minimum 3 points required')
    return false
  }

  let inside = false
  const x = lat
  const y = lng
  
  // Ray casting algorithm - cast a ray from the point to infinity and count intersections
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat
    const yi = polygon[i].lng
    const xj = polygon[j].lat
    const yj = polygon[j].lng
    
    // Check if ray crosses edge
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

// Enhanced function to handle both static and Google Maps LatLng objects
export function isPointInPolygonEnhanced(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) {
    console.warn('Invalid polygon - minimum 3 points required')
    return false
  }

  let inside = false
  const x = lat
  const y = lng
  
  // Handle different polygon formats (static bounds vs Google Maps LatLng objects)
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi, yi, xj, yj
    
    // Check if polygon points are Google Maps LatLng objects or plain objects
    if (typeof polygon[i].lat === 'function') {
      // Google Maps LatLng objects
      xi = polygon[i].lat()
      yi = polygon[i].lng()
      xj = polygon[j].lat()
      yj = polygon[j].lng()
    } else {
      // Plain objects with lat/lng properties
      xi = polygon[i].lat
      yi = polygon[i].lng
      xj = polygon[j].lat
      yj = polygon[j].lng
    }
    
    // Check if ray crosses edge
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

// Determine league based on polygon boundaries with enhanced logging
export function determineLeagueByLocation(lat, lng) {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    console.warn('Invalid coordinates:', { lat, lng })
    return null
  }

  console.log(`🔍 Checking location: ${lat}, ${lng}`)
  
  for (const [league, data] of Object.entries(LEAGUE_POLYGONS)) {
    const isInside = isPointInPolygon(lat, lng, data.bounds)
    console.log(`  - ${league}: ${isInside ? '✅ INSIDE' : '❌ outside'}`)
    
    if (isInside) {
      console.log(`🎯 Location assigned to league: ${league}`)
      return league
    }
  }
  
  console.log('❓ Location not in any league area')
  return null // Outside all boundaries
}

// Function to get the closest league if point is not in any polygon (fallback)
export function getClosestLeague(lat, lng) {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return null
  }

  let closestLeague = null
  let minDistance = Infinity
  
  for (const [league, data] of Object.entries(LEAGUE_POLYGONS)) {
    const distance = Math.sqrt(
      Math.pow(lat - data.center.lat, 2) + Math.pow(lng - data.center.lng, 2)
    )
    
    if (distance < minDistance) {
      minDistance = distance
      closestLeague = league
    }
  }
  
  console.log(`📍 Closest league for (${lat}, ${lng}): ${closestLeague} (distance: ${minDistance.toFixed(4)})`)
  return closestLeague
}

// Enhanced function that tries exact match first, then closest match
export function determineLeagueByLocationWithFallback(lat, lng) {
  // First try exact polygon matching
  const exactMatch = determineLeagueByLocation(lat, lng)
  if (exactMatch) {
    return exactMatch
  }
  
  // If no exact match, find the closest league as fallback
  console.log('🔄 No exact match found, using closest league as fallback')
  return getClosestLeague(lat, lng)
}

// League display names
export const LEAGUE_NAMES = {
  'marbella': 'Marbella',
  'malaga': 'Málaga', 
  'estepona': 'Estepona',
  'sotogrande': 'Sotogrande'
}

// City display names (for backward compatibility)
export const CITY_DISPLAY_NAMES = {
  'marbella': 'Marbella',
  'estepona': 'Estepona', 
  'sotogrande': 'Sotogrande',
  'malaga': 'Málaga'
}

// Area display names for common areas (GPS-based system will detect areas dynamically)
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

// GPS-based function to get areas for a city (fetches from database)
export async function getAreasForCity(citySlug) {
  try {
    const response = await fetch(`/api/clubs?city=${citySlug}&limit=1000`)
    const data = await response.json()
    
    if (data.areaStats && data.areaStats[citySlug]) {
      return Object.keys(data.areaStats[citySlug])
    }
    
    return []
  } catch (error) {
    console.error('Error fetching areas for city:', error)
    return []
  }
}

// Synchronous version using static mappings (for compatibility)
export function getAreasForCitySync(citySlug) {
  console.warn('Using static area mapping. Consider using getAreasForCity() for dynamic GPS-based areas.')
  
  // Basic static mapping based on league polygons
  const staticMappings = {
    'marbella': [
      'marbella', 'el-paraiso', 'nueva-andalucia', 'san-pedro-de-alcantara', 
      'puerto-banus', 'aloha', 'guadalmina', 'las-chapas', 'artola', 
      'elviria', 'golden-mile', 'sierra-blanca', 'nagüeles'
    ],
    'estepona': [
      'estepona', 'cancelada', 'sabinillas', 'manilva', 'duquesa', 'benahavís'
    ],
    'sotogrande': [
      'sotogrande', 'san-roque', 'la-alcaidesa', 'torreguadiaro'
    ],
    'malaga': [
      'malaga', 'pedregalejo', 'el-palo', 'churriana', 'torremolinos', 
      'benalmádena', 'fuengirola', 'mijas'
    ]
  }
  
  return staticMappings[citySlug] || []
}

// Generate display name for area and city combination
export function generateDisplayName(area, mainCity) {
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

// Get city options for forms
export function getCityOptions() {
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

// Debug function to validate polygon boundaries
export function validatePolygonBoundaries() {
  console.log('🔧 Validating polygon boundaries...')
  
  for (const [league, data] of Object.entries(LEAGUE_POLYGONS)) {
    console.log(`  ${league}:`)
    console.log(`    - Points: ${data.bounds.length}`)
    console.log(`    - Color: ${data.color}`)
    console.log(`    - Center: ${data.center.lat}, ${data.center.lng}`)
    
    // Check if polygon is valid (minimum 3 points, closed shape)
    if (data.bounds.length < 3) {
      console.error(`    ❌ Invalid: Less than 3 points`)
    } else if (data.bounds.length < 4) {
      console.warn(`    ⚠️  Warning: Only ${data.bounds.length} points (consider adding more for accuracy)`)
    } else {
      console.log(`    ✅ Valid polygon`)
    }
  }
}
