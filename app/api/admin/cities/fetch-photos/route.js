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

// Mock photos for development/testing
function getMockCityPhotos(cityName) {
  const baseUrl = "https://images.unsplash.com"
  const mockPhotos = [
    {
      photo_reference: `mock_photo_${cityName}_1`,
      width: 1920,
      height: 1080,
      html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
      url: `${baseUrl}/1920x1080/?city,${cityName.toLowerCase()},spain`
    },
    {
      photo_reference: `mock_photo_${cityName}_2`, 
      width: 1600,
      height: 900,
      html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
      url: `${baseUrl}/1600x900/?landscape,${cityName.toLowerCase()},architecture`
    },
    {
      photo_reference: `mock_photo_${cityName}_3`,
      width: 1440,
      height: 960,
      html_attributions: ['<a href="https://unsplash.com">Unsplash</a>'],
      url: `${baseUrl}/1440x960/?${cityName.toLowerCase()},town,view`
    }
  ]
  
  return mockPhotos
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { placeId, cityName } = await request.json()

    if (!placeId && !cityName) {
      return NextResponse.json({ error: 'Place ID or city name is required' }, { status: 400 })
    }

    // Check if Google Maps API is available
    if (!googleMapsClient || !process.env.GOOGLE_MAPS_API_KEY) {
      console.log('Google Maps API not configured, using mock photo data')
      
      const mockPhotos = getMockCityPhotos(cityName || 'city')
      
      return NextResponse.json({
        photos: mockPhotos,
        mockData: true
      })
    }

    try {
      // Get place details including photos
      const response = await googleMapsClient.placeDetails({
        params: {
          place_id: placeId,
          key: process.env.GOOGLE_MAPS_API_KEY,
          fields: 'photos,name'
        }
      })

      const placeDetails = response.data.result
      
      if (!placeDetails.photos || placeDetails.photos.length === 0) {
        // Return mock photos if no Google photos available
        const mockPhotos = getMockCityPhotos(cityName || placeDetails.name || 'city')
        
        return NextResponse.json({
          photos: mockPhotos,
          mockData: true,
          message: 'No Google Photos found, using placeholder images'
        })
      }

      // Process Google Photos
      const photos = placeDetails.photos.map(photo => ({
        photo_reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        html_attributions: photo.html_attributions || [],
        // Generate Google Photos URL
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      }))

      console.log(`Found ${photos.length} photos for place: ${placeDetails.name}`)

      return NextResponse.json({
        photos: photos,
        mockData: false
      })

    } catch (apiError) {
      console.error('Google Places API error:', apiError.message)
      
      // Fallback to mock data on API error
      const mockPhotos = getMockCityPhotos(cityName || 'city')
      
      return NextResponse.json({
        photos: mockPhotos,
        mockData: true,
        fallback: true,
        message: 'Using fallback images due to API error'
      })
    }

  } catch (error) {
    console.error('Error fetching city photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos', details: error.message },
      { status: 500 }
    )
  }
}
