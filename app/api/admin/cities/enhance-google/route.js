import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import City from '@/lib/models/City'
import dbConnect from '@/lib/db/mongoose'

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

    await dbConnect()

    const { type = 'missing' } = await request.json()

    // Create a ReadableStream for streaming progress updates
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let query = {}
          
          // Determine which cities to enhance
          if (type === 'missing') {
            query = {
              $or: [
                { 'coordinates.lat': { $exists: false } },
                { 'coordinates.lng': { $exists: false } },
                { 'coordinates.lat': null },
                { 'coordinates.lng': null }
              ]
            }
          }
          // type === 'all' means no query filter

          const cities = await City.find(query).sort({ displayOrder: 1, 'name.es': 1 })
          
          const results = {
            enhanced: 0,
            skipped: 0,
            errors: 0,
            apiCalls: 0,
            enhancedCities: []
          }

          // Send initial progress
          controller.enqueue(new TextEncoder().encode(JSON.stringify({
            type: 'progress',
            current: 0,
            total: cities.length,
            currentCity: ''
          }) + '\n'))

          for (let i = 0; i < cities.length; i++) {
            const city = cities[i]
            
            try {
              // Send progress update
              controller.enqueue(new TextEncoder().encode(JSON.stringify({
                type: 'progress',
                current: i + 1,
                total: cities.length,
                currentCity: city.name.es
              }) + '\n'))

              // Check if Google Maps API is available
              if (!googleMapsClient || !process.env.GOOGLE_MAPS_API_KEY) {
                console.log(`Mock enhancement for: ${city.name.es}`)
                
                // Mock enhancement for testing
                if (!city.coordinates?.lat || !city.coordinates?.lng) {
                  await City.findByIdAndUpdate(city._id, {
                    $set: {
                      coordinates: {
                        lat: 36.5 + Math.random() * 0.5, // Mock coordinates around Costa del Sol
                        lng: -4.5 - Math.random() * 0.5
                      },
                      formattedAddress: `${city.name.es}, ${city.province}, Spain`,
                      googlePlaceId: `mock_place_id_${city.slug}`,
                      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(city.name.es + ', ' + city.province)}`,
                      importSource: 'google',
                      enhancedAt: new Date()
                    }
                  })
                  
                  results.enhanced++
                  results.enhancedCities.push(city.name.es)
                } else {
                  results.skipped++
                }
              } else {
                // Real Google Maps API enhancement
                try {
                  const geocodeResponse = await googleMapsClient.geocode({
                    params: {
                      address: `${city.name.es}, ${city.province}, Spain`,
                      key: process.env.GOOGLE_MAPS_API_KEY
                    }
                  })

                  results.apiCalls++

                  if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
                    const result = geocodeResponse.data.results[0]
                    const location = result.geometry.location
                    
                    await City.findByIdAndUpdate(city._id, {
                      $set: {
                        coordinates: {
                          lat: location.lat,
                          lng: location.lng
                        },
                        formattedAddress: result.formatted_address,
                        googlePlaceId: result.place_id,
                        googleMapsUrl: `https://maps.google.com/?q=${location.lat},${location.lng}`,
                        googleData: {
                          types: result.types,
                          addressComponents: result.address_components,
                          viewport: result.geometry.viewport
                        },
                        importSource: 'google',
                        enhancedAt: new Date()
                      }
                    })

                    results.enhanced++
                    results.enhancedCities.push(city.name.es)
                    console.log(`Enhanced ${city.name.es} with Google data`)
                  } else {
                    console.log(`No Google results for ${city.name.es}`)
                    results.skipped++
                  }
                } catch (geocodeError) {
                  console.error(`Geocoding failed for ${city.name.es}:`, geocodeError.message)
                  results.errors++
                }
              }

              // Add delay to respect rate limits (Google allows 50 QPS)
              if (i < cities.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100))
              }

            } catch (cityError) {
              console.error(`Error enhancing city ${city.name.es}:`, cityError.message)
              results.errors++
            }
          }

          // Send final results
          controller.enqueue(new TextEncoder().encode(JSON.stringify({
            type: 'result',
            ...results
          }) + '\n'))

          console.log('City enhancement complete:', results)
          
        } catch (error) {
          console.error('Enhancement error:', error)
          controller.enqueue(new TextEncoder().encode(JSON.stringify({
            type: 'error',
            message: error.message
          }) + '\n'))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('Error in city enhancement:', error)
    return NextResponse.json(
      { error: 'Failed to enhance cities', details: error.message },
      { status: 500 }
    )
  }
}
