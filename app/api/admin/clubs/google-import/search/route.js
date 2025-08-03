import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Dynamically import to handle if package is not installed
let Client
try {
  const googleMapsModule = require('@googlemaps/google-maps-services-js')
  Client = googleMapsModule.Client
} catch (error) {
  console.warn('@googlemaps/google-maps-services-js not installed. Please run: npm install @googlemaps/google-maps-services-js')
}

const googleMapsClient = Client ? new Client({}) : null

// Helper function to extract place ID from Google Maps URL
function extractPlaceIdFromUrl(url) {
  // Handle different Google Maps URL formats
  const patterns = [
    /place_id[=:]([^&\s]+)/i,
    /data=.*!1s([^!]+)/,
    /maps\/place\/[^/]+\/([^/?]+)/,
    /\/@.*\/data=.*!1s([^!]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  // If no place ID found, try to extract coordinates
  const coordPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/
  const coordMatch = url.match(coordPattern)
  if (coordMatch) {
    return `${coordMatch[1]},${coordMatch[2]}`
  }
  
  return null
}

// Helper function to filter tennis-related places
function isTennisRelated(place) {
  const tennisKeywords = [
    'tennis', 'tenis', 'padel', 'pádel', 'racket', 'raqueta',
    'court', 'pista', 'club', 'sports', 'deportivo', 'deportes'
  ]
  
  const name = place.name?.toLowerCase() || ''
  const types = place.types || []
  
  // Check if name contains tennis-related keywords
  const nameHasTennis = tennisKeywords.some(keyword => name.includes(keyword))
  
  // Check if it's a sports or recreational facility
  const isSportsFacility = types.some(type => 
    ['gym', 'health', 'sports_complex', 'stadium'].includes(type)
  )
  
  return nameHasTennis || isSportsFacility
}

// Format place data to match frontend expectations
function formatPlaceData(place) {
  return {
    place_id: place.place_id,
    name: place.name,
    formatted_address: place.formatted_address || place.vicinity,
    rating: place.rating || null,
    user_ratings_total: place.user_ratings_total || 0,
    opening_hours: place.opening_hours || { open_now: null },
    geometry: place.geometry,
    formatted_phone_number: place.formatted_phone_number || null,
    website: place.website || null,
    photos: place.photos || [],
    price_level: place.price_level || null,
    types: place.types || []
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, type, radius } = await request.json()

    // Validate input
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Check if Google Maps client is available
    if (!googleMapsClient) {
      return NextResponse.json(
        { error: 'Google Maps integration not configured. Please install @googlemaps/google-maps-services-js' },
        { status: 500 }
      )
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('Google Maps API key not configured')
      return NextResponse.json(
        { error: 'Google Maps API key not configured. Please add GOOGLE_MAPS_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    console.log('Google Maps search request:', { query, type, radius })

    let searchParams = {
      key: apiKey,
      language: 'es', // Spanish language for better local results
    }

    let results = []

    try {
      if (type === 'city') {
        // Text search for tennis clubs in a city
        const searchQuery = `club de tenis en ${query}`
        console.log('Searching for:', searchQuery)
        
        const response = await googleMapsClient.textSearch({
          params: {
            ...searchParams,
            query: searchQuery,
            type: 'establishment'
          }
        })
        
        results = response.data.results || []
        
        // If not enough results, try with English
        if (results.length < 3) {
          const englishResponse = await googleMapsClient.textSearch({
            params: {
              ...searchParams,
              query: `tennis club in ${query}`,
              type: 'establishment'
            }
          })
          
          // Merge results, avoiding duplicates
          const existingIds = new Set(results.map(r => r.place_id))
          const newResults = (englishResponse.data.results || [])
            .filter(r => !existingIds.has(r.place_id))
          
          results = [...results, ...newResults]
        }
        
      } else if (type === 'coordinates') {
        // Parse coordinates
        const coords = query.split(',').map(coord => parseFloat(coord.trim()))
        if (coords.length !== 2 || coords.some(isNaN)) {
          throw new Error('Invalid coordinates format. Use: latitude,longitude')
        }
        
        const [lat, lng] = coords
        console.log('Searching around coordinates:', { lat, lng, radius })
        
        // Nearby search around coordinates
        const response = await googleMapsClient.placesNearby({
          params: {
            ...searchParams,
            location: { lat, lng },
            radius: radius || 5000,
            keyword: 'tennis club',
            type: 'establishment'
          }
        })
        
        results = response.data.results || []
        
      } else if (type === 'url') {
        // Extract place ID or coordinates from URL
        const extracted = extractPlaceIdFromUrl(query)
        
        if (!extracted) {
          throw new Error('Could not extract place information from URL')
        }
        
        // Check if it's coordinates
        if (extracted.includes(',')) {
          // It's coordinates, do a nearby search
          const [lat, lng] = extracted.split(',').map(parseFloat)
          const response = await googleMapsClient.placesNearby({
            params: {
              ...searchParams,
              location: { lat, lng },
              radius: 1000, // Small radius for URL-based search
              keyword: 'tennis',
              type: 'establishment'
            }
          })
          results = response.data.results || []
        } else {
          // It's a place ID, get details
          const response = await googleMapsClient.placeDetails({
            params: {
              ...searchParams,
              place_id: extracted,
              fields: [
                'place_id', 'name', 'formatted_address', 'geometry', 
                'rating', 'user_ratings_total', 'opening_hours', 
                'formatted_phone_number', 'website', 'photos', 
                'price_level', 'types', 'vicinity'
              ]
            }
          })
          
          if (response.data.result) {
            results = [response.data.result]
          }
        }
      }
      
      // Filter to only tennis-related places
      const tennisPlaces = results.filter(isTennisRelated)
      
      // If no tennis places found, include all results but warn
      const finalResults = tennisPlaces.length > 0 ? tennisPlaces : results
      
      console.log(`Found ${results.length} total places, ${tennisPlaces.length} tennis-related`)
      
      // Format results for frontend
      const formattedResults = finalResults.map(formatPlaceData)
      
      // Sort by rating and number of reviews
      formattedResults.sort((a, b) => {
        // First by rating (if available)
        if (a.rating && b.rating) {
          if (a.rating !== b.rating) {
            return b.rating - a.rating
          }
          // Then by number of reviews
          return b.user_ratings_total - a.user_ratings_total
        }
        // Places with ratings come first
        if (a.rating && !b.rating) return -1
        if (!a.rating && b.rating) return 1
        // Then by number of reviews
        return b.user_ratings_total - a.user_ratings_total
      })
      
      // Return formatted response
      return NextResponse.json({
        clubs: formattedResults,
        totalResults: formattedResults.length,
        query,
        type,
        radius,
        warning: tennisPlaces.length === 0 && results.length > 0 
          ? 'No tennis-specific venues found. Showing all sports facilities.'
          : null
      })

    } catch (apiError) {
      console.error('Google Maps API error:', apiError.response?.data || apiError)
      
      // Handle specific API errors
      if (apiError.response?.data?.error_message) {
        const errorMessage = apiError.response.data.error_message
        
        if (errorMessage.includes('API key')) {
          return NextResponse.json(
            { error: 'Invalid Google Maps API key. Please check your configuration.' },
            { status: 401 }
          )
        }
        
        if (errorMessage.includes('quota')) {
          return NextResponse.json(
            { error: 'Google Maps API quota exceeded. Please try again later.' },
            { status: 429 }
          )
        }
        
        return NextResponse.json(
          { error: `Google Maps API error: ${errorMessage}` },
          { status: 400 }
        )
      }
      
      throw apiError
    }

  } catch (error) {
    console.error('Error searching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to search clubs', details: error.message },
      { status: 500 }
    )
  }
}
