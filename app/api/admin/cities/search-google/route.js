import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Dynamically import to handle if package is not installed
let Client
try {
  const googleMapsModule = require('@googlemaps/google-maps-services-js')
  Client = googleMapsModule.Client
} catch (error) {
  console.warn('@googlemaps/google-maps-services-js not installed. Using mock mode.')
}

const googleMapsClient = Client ? new Client({}) : null

// Helper function to normalize text for accent-insensitive comparison
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents/diacritics
    .trim()
}

// Helper function to generate search variations for better matching
function generateSearchVariations(query) {
  const baseQuery = query.toLowerCase().trim()
  const normalizedQuery = normalizeText(baseQuery)
  
  const variations = new Set([
    baseQuery,
    normalizedQuery
  ])
  
  // Generate common Spanish city patterns
  const commonPrefixes = ['', 'el ', 'la ', 'los ', 'las ']
  const commonSuffixes = ['', ' de la costa', ' del sol', ' de mar', ' de la concepcion', ' de la frontera']
  const commonMiddleParts = ['', ' de la ', ' del ', ' de los ', ' de las ']
  
  // Add variations with prefixes and suffixes
  commonPrefixes.forEach(prefix => {
    commonSuffixes.forEach(suffix => {
      variations.add(prefix + baseQuery + suffix)
      variations.add(prefix + normalizedQuery + suffix)
    })
  })
  
  // Handle multi-part city names (like "La Línea de la Concepción")
  commonMiddleParts.forEach(middle => {
    const withMiddle = baseQuery + middle + 'concepcion'
    const withMiddleNorm = normalizedQuery + middle + 'concepcion'
    variations.add(withMiddle)
    variations.add(withMiddleNorm)
  })
  
  // Add specific accent variations for common cases
  const accentVariations = {
    'malag': 'málaga',
    'cordoba': 'córdoba', 
    'cadiz': 'cádiz',
    'almeria': 'almería',
    'leon': 'león',
    'avila': 'ávila',
    'jaen': 'jaén',
    'linea': 'línea',
    'concepcion': 'concepción',
    'la linea': 'la línea de la concepción',
    'linea de la concepcion': 'línea de la concepción'
  }
  
  Object.entries(accentVariations).forEach(([without, with_]) => {
    if (normalizedQuery.includes(without.split(' ')[0])) {
      variations.add(with_)
      variations.add(without)
    }
  })
  
  return Array.from(variations).slice(0, 10) // Increased limit for complex names
}

// Enhanced mock data with more Spanish cities including complex names and photos
function getMockCities() {
  return [
    {
      name: 'Marbella',
      place_id: 'mock_marbella_123',
      formatted_address: 'Marbella, Málaga, Spain',
      geometry: {
        location: { lat: 36.5099, lng: -4.8863 },
        viewport: {
          northeast: { lat: 36.5500, lng: -4.8400 },
          southwest: { lat: 36.4700, lng: -4.9300 }
        }
      },
      address_components: [
        { long_name: 'Marbella', short_name: 'Marbella', types: ['locality'] },
        { long_name: 'Málaga', short_name: 'MA', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_marbella_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?marbella,costa,del,sol'
        },
        {
          photo_reference: 'mock_marbella_photo_2',
          width: 1600,
          height: 900,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1600x900/?marbella,beach,spain'
        }
      ]
    },
    {
      name: 'Málaga',
      place_id: 'mock_malaga_456',
      formatted_address: 'Málaga, Spain',
      geometry: {
        location: { lat: 36.7213, lng: -4.4214 },
        viewport: {
          northeast: { lat: 36.7600, lng: -4.3800 },
          southwest: { lat: 36.6800, lng: -4.4600 }
        }
      },
      address_components: [
        { long_name: 'Málaga', short_name: 'Málaga', types: ['locality'] },
        { long_name: 'Málaga', short_name: 'MA', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_malaga_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?malaga,cathedral,spain'
        },
        {
          photo_reference: 'mock_malaga_photo_2',
          width: 1600,
          height: 900,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1600x900/?malaga,port,city'
        }
      ]
    },
    {
      name: 'La Línea de la Concepción',
      place_id: 'mock_lalinea_789',
      formatted_address: 'La Línea de la Concepción, Cádiz, Spain',
      geometry: {
        location: { lat: 36.1661, lng: -5.3447 },
        viewport: {
          northeast: { lat: 36.2000, lng: -5.3000 },
          southwest: { lat: 36.1300, lng: -5.3900 }
        }
      },
      address_components: [
        { long_name: 'La Línea de la Concepción', short_name: 'La Línea', types: ['locality'] },
        { long_name: 'Cádiz', short_name: 'CA', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_lalinea_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?la,linea,gibraltar,border'
        }
      ]
    },
    {
      name: 'Estepona',
      place_id: 'mock_estepona_101',
      formatted_address: 'Estepona, Málaga, Spain',
      geometry: {
        location: { lat: 36.4272, lng: -5.1448 },
        viewport: {
          northeast: { lat: 36.4600, lng: -5.1000 },
          southwest: { lat: 36.3900, lng: -5.1900 }
        }
      },
      address_components: [
        { long_name: 'Estepona', short_name: 'Estepona', types: ['locality'] },
        { long_name: 'Málaga', short_name: 'MA', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_estepona_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?estepona,white,village,spain'
        }
      ]
    },
    {
      name: 'Benalmádena',
      place_id: 'mock_benalmadena_102',
      formatted_address: 'Benalmádena, Málaga, Spain',
      geometry: {
        location: { lat: 36.5994, lng: -4.5161 },
        viewport: {
          northeast: { lat: 36.6300, lng: -4.4800 },
          southwest: { lat: 36.5700, lng: -4.5500 }
        }
      },
      address_components: [
        { long_name: 'Benalmádena', short_name: 'Benalmádena', types: ['locality'] },
        { long_name: 'Málaga', short_name: 'MA', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_benalmadena_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?benalmadena,marina,costa,del,sol'
        }
      ]
    },
    {
      name: 'Córdoba',
      place_id: 'mock_cordoba_103',
      formatted_address: 'Córdoba, Spain',
      geometry: {
        location: { lat: 37.8882, lng: -4.7794 },
        viewport: {
          northeast: { lat: 37.9200, lng: -4.7400 },
          southwest: { lat: 37.8500, lng: -4.8200 }
        }
      },
      address_components: [
        { long_name: 'Córdoba', short_name: 'Córdoba', types: ['locality'] },
        { long_name: 'Córdoba', short_name: 'CO', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_cordoba_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?cordoba,mezquita,spain,cathedral'
        }
      ]
    },
    {
      name: 'Cádiz',
      place_id: 'mock_cadiz_104',
      formatted_address: 'Cádiz, Spain',
      geometry: {
        location: { lat: 36.5297, lng: -6.2921 },
        viewport: {
          northeast: { lat: 36.5600, lng: -6.2500 },
          southwest: { lat: 36.5000, lng: -6.3300 }
        }
      },
      address_components: [
        { long_name: 'Cádiz', short_name: 'Cádiz', types: ['locality'] },
        { long_name: 'Cádiz', short_name: 'CA', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_cadiz_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?cadiz,ocean,ancient,city'
        }
      ]
    },
    {
      name: 'Jerez de la Frontera',
      place_id: 'mock_jerez_105',
      formatted_address: 'Jerez de la Frontera, Cádiz, Spain',
      geometry: {
        location: { lat: 36.6866, lng: -6.1369 },
        viewport: {
          northeast: { lat: 36.7200, lng: -6.1000 },
          southwest: { lat: 36.6500, lng: -6.1700 }
        }
      },
      address_components: [
        { long_name: 'Jerez de la Frontera', short_name: 'Jerez', types: ['locality'] },
        { long_name: 'Cádiz', short_name: 'CA', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_jerez_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?jerez,sherry,vineyards,spain'
        }
      ]
    },
    {
      name: 'Algeciras',
      place_id: 'mock_algeciras_106',
      formatted_address: 'Algeciras, Cádiz, Spain',
      geometry: {
        location: { lat: 36.1322, lng: -5.4548 },
        viewport: {
          northeast: { lat: 36.1700, lng: -5.4100 },
          southwest: { lat: 36.0900, lng: -5.5000 }
        }
      },
      address_components: [
        { long_name: 'Algeciras', short_name: 'Algeciras', types: ['locality'] },
        { long_name: 'Cádiz', short_name: 'CA', types: ['administrative_area_level_2'] },
        { long_name: 'Andalusia', short_name: 'AN', types: ['administrative_area_level_1'] },
        { long_name: 'Spain', short_name: 'ES', types: ['country'] }
      ],
      types: ['locality', 'political'],
      photos: [
        {
          photo_reference: 'mock_algeciras_photo_1',
          width: 1920,
          height: 1080,
          html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
          url: 'https://images.unsplash.com/1920x1080/?algeciras,port,gibraltar,strait'
        }
      ]
    }
  ]
}

// Enhanced fuzzy matching function for multi-part names
function fuzzyMatch(query, cityName, threshold = 0.5) {
  const normalizedQuery = normalizeText(query)
  const normalizedCity = normalizeText(cityName)
  
  // Exact match (highest score)
  if (normalizedCity === normalizedQuery) return 1.0
  
  // Starts with match (high score)
  if (normalizedCity.startsWith(normalizedQuery)) {
    return Math.max(0.8, 0.95 - (normalizedCity.length - normalizedQuery.length) * 0.02)
  }
  
  // Contains match (medium-high score)
  if (normalizedCity.includes(normalizedQuery)) {
    return Math.max(0.7, 0.85 - Math.abs(normalizedCity.length - normalizedQuery.length) * 0.01)
  }
  
  // For multi-part names, check if query matches beginning of any word
  const cityWords = normalizedCity.split(/\s+/)
  const queryWords = normalizedQuery.split(/\s+/)
  
  // Check if any query word starts any city word
  for (const queryWord of queryWords) {
    for (const cityWord of cityWords) {
      if (cityWord.startsWith(queryWord) && queryWord.length >= 2) {
        return Math.max(0.6, 0.8 - (cityWord.length - queryWord.length) * 0.03)
      }
    }
  }
  
  // Check if query matches the first significant words
  const significantCityWords = cityWords.filter(word => 
    !['de', 'la', 'del', 'las', 'los', 'el'].includes(word) && word.length > 2
  )
  
  for (const queryWord of queryWords) {
    for (const cityWord of significantCityWords) {
      if (cityWord.includes(queryWord) && queryWord.length >= 3) {
        return 0.6
      }
    }
  }
  
  // Character-by-character similarity (fallback)
  let matches = 0
  const maxLen = Math.max(normalizedQuery.length, normalizedCity.length)
  const minLen = Math.min(normalizedQuery.length, normalizedCity.length)
  
  for (let i = 0; i < minLen; i++) {
    if (normalizedQuery[i] === normalizedCity[i]) {
      matches++
    }
  }
  
  const similarity = matches / maxLen
  return similarity >= threshold ? similarity * 0.4 : 0
}

// Helper function to fetch photos for a place
async function fetchPhotosForPlace(placeId, cityName) {
  try {
    if (!googleMapsClient || !process.env.GOOGLE_MAPS_API_KEY) {
      // Return mock photos for development
      return getMockCities().find(city => city.name.toLowerCase().includes(cityName.toLowerCase()))?.photos || []
    }

    const response = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY,
        fields: 'photos'
      }
    })

    const placeDetails = response.data.result
    
    if (!placeDetails.photos || placeDetails.photos.length === 0) {
      return []
    }

    // Process Google Photos
    return placeDetails.photos.slice(0, 5).map(photo => ({
      photo_reference: photo.photo_reference,
      width: photo.width,
      height: photo.height,
      html_attributions: photo.html_attributions || [],
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    }))

  } catch (error) {
    console.error('Error fetching photos:', error)
    return []
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, types = ['locality', 'administrative_area_level_2'], includePhotos = false } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    // Clean the query (remove ", Spain" if present)
    const cleanQuery = query.replace(/,?\s*spain\s*$/i, '').trim()

    // Check if Google Maps API is available
    if (!googleMapsClient || !process.env.GOOGLE_MAPS_API_KEY) {
      console.log('Google Maps API not configured, using enhanced mock data')
      
      const mockCities = getMockCities()
      
      // Enhanced filtering with fuzzy matching
      const scoredResults = mockCities
        .map(city => ({
          ...city,
          score: fuzzyMatch(cleanQuery, city.name)
        }))
        .filter(city => city.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
      
      // Remove score from final results
      const filteredResults = scoredResults.map(({ score, ...city }) => city)

      console.log(`Mock search for "${cleanQuery}" found ${filteredResults.length} results`)
      if (filteredResults.length > 0) {
        console.log('Top result:', filteredResults[0].name, 'Score:', scoredResults[0].score)
      }

      return NextResponse.json({
        results: filteredResults,
        mockData: true,
        searchVariations: generateSearchVariations(cleanQuery)
      })
    }

    // Real Google Maps API call with multiple search variations
    try {
      console.log(`Searching for cities: "${cleanQuery}"`)

      const searchVariations = generateSearchVariations(cleanQuery)
      console.log('Search variations:', searchVariations)

      let allResults = new Map() // Use Map to avoid duplicates by place_id
      
      // Try each search variation
      for (const searchTerm of searchVariations) {
        try {
          const response = await googleMapsClient.geocode({
            params: {
              address: searchTerm + ', Spain',
              key: process.env.GOOGLE_MAPS_API_KEY,
              components: 'country:ES', // Restrict to Spain
              types: types.join('|'), // locality or administrative_area_level_2
              region: 'es' // Prefer Spanish results
            }
          })

          const results = response.data.results || []
          
          // Add results to our map, avoiding duplicates
          results.forEach(result => {
            if (!allResults.has(result.place_id)) {
              allResults.set(result.place_id, result)
            }
          })

          // Early exit if we have enough results
          if (allResults.size >= 10) break
          
        } catch (variationError) {
          console.warn(`Search variation "${searchTerm}" failed:`, variationError.message)
          // Continue with next variation
        }
      }

      const combinedResults = Array.from(allResults.values())
      
      // Filter and format results to only include Spanish cities
      const spanishCities = combinedResults
        .filter(result => {
          // Must have Spain in address components
          const hasSpain = result.address_components?.some(
            comp => comp.types.includes('country') && comp.short_name === 'ES'
          )
          
          // Must be a locality or administrative area
          const isCity = result.types?.some(
            type => ['locality', 'administrative_area_level_2', 'administrative_area_level_3'].includes(type)
          )
          
          return hasSpain && isCity
        })
        .map(result => {
          // Extract city name from address components or use formatted name
          let cityName = result.name
          
          // Try to get the locality name from address components
          const localityComponent = result.address_components?.find(
            comp => comp.types.includes('locality')
          )
          
          if (localityComponent) {
            cityName = localityComponent.long_name
          }

          return {
            name: cityName,
            place_id: result.place_id,
            formatted_address: result.formatted_address,
            geometry: result.geometry,
            address_components: result.address_components,
            types: result.types,
            score: fuzzyMatch(cleanQuery, cityName) // Add fuzzy matching score
          }
        })
        .sort((a, b) => b.score - a.score) // Sort by relevance
        .slice(0, 10) // Limit to 10 results

      // Fetch photos for each city if requested
      if (includePhotos) {
        for (let i = 0; i < spanishCities.length; i++) {
          const city = spanishCities[i]
          try {
            const photos = await fetchPhotosForPlace(city.place_id, city.name)
            city.photos = photos
          } catch (photoError) {
            console.warn(`Failed to fetch photos for ${city.name}:`, photoError.message)
            city.photos = []
          }
        }
      }

      // Remove score from final results
      const finalResults = spanishCities.map(({ score, ...city }) => city)

      console.log(`Found ${finalResults.length} Spanish cities with enhanced search`)

      return NextResponse.json({
        results: finalResults,
        mockData: false,
        searchVariations: searchVariations
      })

    } catch (apiError) {
      console.error('Google Maps API error:', apiError.message)
      
      // Fallback to enhanced mock data on API error
      const mockCities = getMockCities()
      
      const scoredResults = mockCities
        .map(city => ({
          ...city,
          score: fuzzyMatch(cleanQuery, city.name)
        }))
        .filter(city => city.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
      
      const fallbackResults = scoredResults.map(({ score, ...city }) => city)
      
      return NextResponse.json({
        results: fallbackResults,
        mockData: true,
        fallback: true,
        message: 'Using enhanced fallback data due to API error',
        searchVariations: generateSearchVariations(cleanQuery)
      })
    }

  } catch (error) {
    console.error('Error in city search:', error)
    return NextResponse.json(
      { error: 'Failed to search cities', details: error.message },
      { status: 500 }
    )
  }
}
