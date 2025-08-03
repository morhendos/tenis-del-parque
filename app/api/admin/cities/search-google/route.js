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

    // Check if Google Maps API is available
    if (!googleMapsClient || !process.env.GOOGLE_MAPS_API_KEY) {
      console.log('Google Maps API not configured, returning mock data')
      
      // Return mock Spanish cities for testing
      const mockCities = [
        {
          name: 'Marbella',
          place_id: 'mock_marbella_123',
          formatted_address: 'Marbella, Málaga, Spain',
          geometry: {
            location: {
              lat: 36.5099,
              lng: -4.8863
            },
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
          name: 'Estepona',
          place_id: 'mock_estepona_456',
          formatted_address: 'Estepona, Málaga, Spain',
          geometry: {
            location: {
              lat: 36.4272,
              lng: -5.1448
            },
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
          place_id: 'mock_benalmadena_789',
          formatted_address: 'Benalmádena, Málaga, Spain',
          geometry: {
            location: {
              lat: 36.5994,
              lng: -4.5161
            },
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
        }
      ]

      // Filter mock results based on query
      const filteredResults = mockCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase().replace(', spain', ''))
      )

      return NextResponse.json({
        results: filteredResults,
        mockData: true
      })
    }

    // Real Google Maps API call
    try {
      console.log(`Searching for cities: "${query}"`)

      const response = await googleMapsClient.geocode({
        params: {
          address: query,
          key: process.env.GOOGLE_MAPS_API_KEY,
          components: 'country:ES', // Restrict to Spain
          types: types.join('|') // locality or administrative_area_level_2
        }
      })

      const results = response.data.results || []
      
      // Filter and format results to only include Spanish cities
      const spanishCities = results
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
            types: result.types
          }
        })
        .slice(0, 10) // Limit to 10 results

      console.log(`Found ${spanishCities.length} Spanish cities`)

      return NextResponse.json({
        results: spanishCities,
        mockData: false
      })

    } catch (apiError) {
      console.error('Google Maps API error:', apiError.message)
      
      // Return fallback mock data on API error
      return NextResponse.json({
        results: [
          {
            name: query.replace(', Spain', '').trim(),
            place_id: `mock_${Date.now()}`,
            formatted_address: `${query}, Spain`,
            geometry: {
              location: {
                lat: 36.5 + Math.random() * 0.5,
                lng: -4.5 - Math.random() * 0.5
              }
            },
            address_components: [
              { long_name: query.replace(', Spain', '').trim(), types: ['locality'] },
              { long_name: 'Málaga', types: ['administrative_area_level_2'] },
              { long_name: 'Spain', types: ['country'] }
            ],
            types: ['locality', 'political']
          }
        ],
        mockData: true,
        fallback: true,
        message: 'Using fallback data due to API error'
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
