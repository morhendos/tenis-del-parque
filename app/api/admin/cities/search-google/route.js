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
  
  // Common Spanish city name patterns and accent variations
  const accentVariations = {
    'a': ['a', 'á'],
    'e': ['e', 'é'],
    'i': ['i', 'í'],
    'o': ['o', 'ó'],
    'u': ['u', 'ú'],
    'n': ['n', 'ñ'],
    'c': ['c', 'ç']
  }
  
  const variations = new Set([
    baseQuery,
    normalizedQuery
  ])
  
  // Generate common Spanish city patterns
  const commonPrefixes = ['', 'el ', 'la ', 'los ', 'las ']
  const commonSuffixes = ['', ' de la costa', ' del sol', ' de mar']
  
  commonPrefixes.forEach(prefix => {
    commonSuffixes.forEach(suffix => {
      variations.add(prefix + baseQuery + suffix)
      variations.add(prefix + normalizedQuery + suffix)
    })
  })
  
  // Add specific accent variations for common cases
  if (normalizedQuery.includes('malag')) {
    variations.add('málaga')
    variations.add('malaga')
  }
  if (normalizedQuery.includes('cordoba')) {
    variations.add('córdoba')
  }
  if (normalizedQuery.includes('cadiz')) {
    variations.add('cádiz')
  }
  if (normalizedQuery.includes('almeria')) {
    variations.add('almería')
  }
  if (normalizedQuery.includes('leon')) {
    variations.add('león')
  }
  if (normalizedQuery.includes('avila')) {
    variations.add('ávila')
  }
  
  return Array.from(variations).slice(0, 5) // Limit to prevent too many API calls
}

// Enhanced mock data with more Spanish cities for testing
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
      types: ['locality', 'political']
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
      types: ['locality', 'political']
    },
    {
      name: 'Estepona',
      place_id: 'mock_estepona_789',
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
      types: ['locality', 'political']
    },
    {
      name: 'Benalmádena',
      place_id: 'mock_benalmadena_101',
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
      types: ['locality', 'political']
    },
    {
      name: 'Córdoba',
      place_id: 'mock_cordoba_102',
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
      types: ['locality', 'political']
    },
    {
      name: 'Cádiz',
      place_id: 'mock_cadiz_103',
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
      types: ['locality', 'political']
    }
  ]
}

// Improved fuzzy matching function
function fuzzyMatch(query, cityName, threshold = 0.6) {
  const normalizedQuery = normalizeText(query)
  const normalizedCity = normalizeText(cityName)
  
  // Exact match (highest score)
  if (normalizedCity === normalizedQuery) return 1.0
  
  // Starts with match (high score)
  if (normalizedCity.startsWith(normalizedQuery)) {
    return 0.9 - (normalizedCity.length - normalizedQuery.length) * 0.1
  }
  
  // Contains match (medium score)
  if (normalizedCity.includes(normalizedQuery)) {
    return 0.7 - Math.abs(normalizedCity.length - normalizedQuery.length) * 0.05
  }
  
  // Character-by-character similarity (low score)
  let matches = 0
  const maxLen = Math.max(normalizedQuery.length, normalizedCity.length)
  const minLen = Math.min(normalizedQuery.length, normalizedCity.length)
  
  for (let i = 0; i < minLen; i++) {
    if (normalizedQuery[i] === normalizedCity[i]) {
      matches++
    }
  }
  
  const similarity = matches / maxLen
  return similarity >= threshold ? similarity * 0.5 : 0
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, types = ['locality', 'administrative_area_level_2'] } = await request.json()

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