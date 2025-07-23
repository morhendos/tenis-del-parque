import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Mock data for development - replace with actual Google Places API
const MOCK_CLUBS = [
  {
    place_id: 'ChIJ1234567890',
    name: 'Club de Tenis Marbella',
    formatted_address: 'Calle del Mar 15, 29600 Marbella, Málaga, Spain',
    rating: 4.5,
    user_ratings_total: 127,
    opening_hours: { open_now: true },
    geometry: {
      location: {
        lat: 36.5099,
        lng: -4.8863
      }
    },
    formatted_phone_number: '+34 952 123 456',
    website: 'https://www.clubdetenismarbella.com',
    photos: [
      { photo_reference: 'photo1' },
      { photo_reference: 'photo2' }
    ],
    price_level: 3
  },
  {
    place_id: 'ChIJ0987654321',
    name: 'Real Club de Tenis Costa del Sol',
    formatted_address: 'Avenida del Golf 23, 29602 Marbella, Málaga, Spain',
    rating: 4.2,
    user_ratings_total: 89,
    opening_hours: { open_now: false },
    geometry: {
      location: {
        lat: 36.5150,
        lng: -4.8900
      }
    },
    formatted_phone_number: '+34 952 789 012',
    website: 'https://www.rctcostadelsol.es',
    photos: [
      { photo_reference: 'photo3' }
    ],
    price_level: 4
  },
  {
    place_id: 'ChIJ2468135790',
    name: 'Tennis Academy Marbella',
    formatted_address: 'Urbanización Las Brisas, 29660 Marbella, Málaga, Spain',
    rating: 4.8,
    user_ratings_total: 234,
    opening_hours: { open_now: true },
    geometry: {
      location: {
        lat: 36.5020,
        lng: -4.9100
      }
    },
    formatted_phone_number: '+34 952 456 789',
    website: 'https://www.tennisacademymarbella.com',
    photos: [
      { photo_reference: 'photo4' },
      { photo_reference: 'photo5' },
      { photo_reference: 'photo6' }
    ],
    price_level: 2
  }
]

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

    console.log('Google Maps search request:', { query, type, radius })

    // TODO: Implement actual Google Places API call
    // For now, return mock data
    
    // In production, you would:
    // 1. Initialize Google Places client with API key from env
    // 2. Search for tennis clubs based on query type
    // 3. Filter results to only include tennis-related places
    // 4. Return formatted results

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Filter mock data based on search query
    let results = MOCK_CLUBS
    
    if (type === 'city' && query.toLowerCase().includes('estepona')) {
      // Return different mock data for Estepona
      results = [
        {
          place_id: 'ChIJ9876543210',
          name: 'Club de Tenis Estepona',
          formatted_address: 'Calle Deportes 10, 29680 Estepona, Málaga, Spain',
          rating: 4.3,
          user_ratings_total: 67,
          opening_hours: { open_now: true },
          geometry: {
            location: {
              lat: 36.4276,
              lng: -5.1463
            }
          },
          formatted_phone_number: '+34 952 111 222',
          website: 'https://www.tenisestepona.es',
          photos: [{ photo_reference: 'photo7' }],
          price_level: 2
        }
      ]
    }

    // Return formatted response
    return NextResponse.json({
      clubs: results,
      totalResults: results.length,
      query,
      type,
      radius
    })

  } catch (error) {
    console.error('Error searching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to search clubs', details: error.message },
      { status: 500 }
    )
  }
}

// Example of actual Google Places API implementation (commented out)
/*
import { Client } from '@googlemaps/google-maps-services-js'

const googleMapsClient = new Client({})

async function searchGooglePlaces(query, type, radius) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured')
  }

  let searchParams = {
    key: apiKey,
    language: 'es',
  }

  if (type === 'city') {
    // Text search for tennis clubs in a city
    const response = await googleMapsClient.textSearch({
      params: {
        ...searchParams,
        query: `tennis clubs in ${query}`,
        type: 'establishment',
        radius: radius || 5000
      }
    })
    return response.data.results
  } else if (type === 'coordinates') {
    // Nearby search around coordinates
    const [lat, lng] = query.split(',').map(coord => parseFloat(coord.trim()))
    const response = await googleMapsClient.placesNearby({
      params: {
        ...searchParams,
        location: { lat, lng },
        radius: radius || 5000,
        keyword: 'tennis club',
        type: 'establishment'
      }
    })
    return response.data.results
  } else if (type === 'url') {
    // Extract place ID from URL and get details
    const placeId = extractPlaceIdFromUrl(query)
    const response = await googleMapsClient.placeDetails({
      params: {
        ...searchParams,
        place_id: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 
                 'opening_hours', 'formatted_phone_number', 'website', 'photos', 'price_level']
      }
    })
    return [response.data.result]
  }
}
*/