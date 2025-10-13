import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'

// Dynamically import Google Maps client
let Client
try {
  const googleMapsModule = require('@googlemaps/google-maps-services-js')
  Client = googleMapsModule.Client
} catch (error) {
  console.warn('@googlemaps/google-maps-services-js not installed')
}

const googleMapsClient = Client ? new Client({}) : null

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clubId } = await request.json()

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 })
    }

    await dbConnect()

    // Get the club
    const club = await Club.findById(clubId)
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    // Check if club has a Google Place ID
    if (!club.googlePlaceId) {
      return NextResponse.json({ 
        error: 'This club does not have a Google Place ID. Only clubs imported from Google Maps can refresh photos.' 
      }, { status: 400 })
    }

    // Check if Google Maps client is available
    if (!googleMapsClient) {
      return NextResponse.json({
        error: 'Google Maps integration not configured'
      }, { status: 500 })
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        error: 'Google Maps API key not configured'
      }, { status: 500 })
    }

    console.log(`🔄 Refreshing Google Photos for club: ${club.name}`)
    console.log(`   Place ID: ${club.googlePlaceId}`)

    // Fetch fresh place details from Google Maps API
    let response
    try {
      response = await googleMapsClient.placeDetails({
        params: {
          key: apiKey,
          place_id: club.googlePlaceId,
          language: 'es',
          fields: ['photos', 'name']
        },
        timeout: 10000 // 10 second timeout
      })
    } catch (apiError) {
      console.error('Google Maps API error:', apiError)
      return NextResponse.json({
        error: `Google Maps API error: ${apiError.response?.data?.error_message || apiError.message}`
      }, { status: 500 })
    }

    if (!response.data.result) {
      return NextResponse.json({
        error: 'Could not fetch club details from Google Maps'
      }, { status: 500 })
    }

    const place = response.data.result

    // Extract photos
    const newPhotos = place.photos ? place.photos.slice(0, 10).map(photo => ({
      photo_reference: photo.photo_reference,
      height: photo.height,
      width: photo.width,
      html_attributions: photo.html_attributions
    })) : []

    console.log(`   Found ${newPhotos.length} photos from Google Maps`)

    // Update club with new photos
    club.googleData = club.googleData || {}
    club.googleData.photos = newPhotos
    club.googleData.photosRefreshedAt = new Date()

    await club.save()

    console.log(`✅ Successfully refreshed ${newPhotos.length} Google Photos for ${club.name}`)

    // Auto-revalidate the club page to clear cache
    try {
      const city = club.location?.city
      const slug = club.slug
      
      if (city && slug) {
        console.log(`🔄 Auto-revalidating club pages: ${city}/${slug}`)
        revalidatePath(`/es/clubs/${city}/${slug}`)
        revalidatePath(`/en/clubs/${city}/${slug}`)
        console.log('✅ Club pages revalidated')
      }
    } catch (revalidateError) {
      console.error('⚠️ Error revalidating club pages:', revalidateError)
      // Don't fail if revalidation fails
    }

    return NextResponse.json({
      success: true,
      club: club,
      photosCount: newPhotos.length,
      message: `Successfully refreshed ${newPhotos.length} photos from Google Maps`,
      revalidated: true
    })

  } catch (error) {
    console.error('Error refreshing Google Photos:', error)
    
    // Return detailed error message
    let errorMessage = 'Failed to refresh Google Photos'
    if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json({
      error: errorMessage,
      details: error.stack
    }, { status: 500 })
  }
}
