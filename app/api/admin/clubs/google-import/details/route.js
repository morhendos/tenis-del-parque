import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import City from '@/lib/models/City'
import dbConnect from '@/lib/db/mongoose'
// FIX: Import from shared utility instead of client component
import { determineLeagueByLocation, LEAGUE_NAMES } from '@/lib/utils/geographicBoundaries'

// Dynamically import to handle if package is not installed
let Client
try {
  const googleMapsModule = require('@googlemaps/google-maps-services-js')
  Client = googleMapsModule.Client
} catch (error) {
  console.warn('@googlemaps/google-maps-services-js not installed. Please run: npm install @googlemaps/google-maps-services-js')
}

const googleMapsClient = Client ? new Client({}) : null

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Process location data using geographic boundaries
async function processLocationFromGoogle(place) {
  await dbConnect()
  
  console.log('Processing place:', place.name)
  console.log('Coordinates:', place.geometry?.location)
  
  // Determine league based on coordinates
  let league = null
  let leagueName = null
  
  if (place.geometry?.location?.lat && place.geometry?.location?.lng) {
    league = determineLeagueByLocation(
      place.geometry.location.lat,
      place.geometry.location.lng
    )
    leagueName = league ? LEAGUE_NAMES[league] : null
    console.log('Auto-assigned to league:', league || 'UNASSIGNED')
  }
  
  // Extract postal code from address
  const postalCodeMatch = place.formatted_address?.match(/\b\d{5}\b/)
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : ''
  
  // Extract locality from address components
  let locality = null
  if (place.address_components) {
    const localityComponent = place.address_components.find(comp => 
      comp.types.includes('locality')
    )
    locality = localityComponent?.long_name
  }
  
  // Create or ensure league city exists if assigned
  if (league) {
    try {
      const city = await City.findOrCreate({
        slug: league,
        name: LEAGUE_NAMES[league],
        nameEs: LEAGUE_NAMES[league],
        nameEn: LEAGUE_NAMES[league],
        importSource: 'google'
      })
      console.log(`League city "${league}" ensured in database`)
    } catch (error) {
      console.error('Error creating city:', error)
    }
  }
  
  return {
    address: place.vicinity || place.formatted_address?.split(',')[0] || '',
    city: league || locality?.toLowerCase() || 'unassigned',
    leagueName: leagueName,
    locality: locality,
    postalCode: postalCode,
    coordinates: {
      lat: place.geometry?.location?.lat || null,
      lng: place.geometry?.location?.lng || null
    },
    googleMapsUrl: place.url || `https://maps.google.com/?q=place_id:${place.place_id}`,
    autoAssigned: !!league,
    // Keep original data for debugging
    originalData: {
      formattedAddress: place.formatted_address,
      vicinity: place.vicinity,
      locality: locality
    }
  }
}

// Map Google place to club format
async function mapGooglePlaceToClub(place, apiKey) {
  // Process location with automatic league assignment
  const locationData = await processLocationFromGoogle(place)
  
  // Generate slug
  const slug = generateSlug(place.name)
  
  console.log(`📍 "${place.name}" → League: ${locationData.leagueName || 'Unassigned'}`)
  console.log(`   Coordinates: ${locationData.coordinates.lat}, ${locationData.coordinates.lng}`)
  console.log(`   Auto-assigned: ${locationData.autoAssigned ? 'YES' : 'NO'}`)
  
  // Parse operating hours if available
  const operatingHours = {}
  
  // Process opening hours if available
  if (place.opening_hours?.weekday_text) {
    const dayMapping = {
      'Monday': 'monday',
      'Tuesday': 'tuesday',
      'Wednesday': 'wednesday',
      'Thursday': 'thursday',
      'Friday': 'friday',
      'Saturday': 'saturday',
      'Sunday': 'sunday',
      'Lunes': 'monday',
      'Martes': 'tuesday',
      'Miércoles': 'wednesday',
      'Jueves': 'thursday',
      'Viernes': 'friday',
      'Sábado': 'saturday',
      'Domingo': 'sunday'
    }
    
    place.opening_hours.weekday_text.forEach(dayText => {
      const match = dayText.match(/^(\w+):\s*(.+)/)
      if (match) {
        const dayName = match[1]
        const hours = match[2]
        const dayKey = dayMapping[dayName]
        
        if (dayKey) {
          if (hours.toLowerCase().includes('closed') || hours.toLowerCase().includes('cerrado')) {
            operatingHours[dayKey] = { open: null, close: null, closed: true }
          } else {
            operatingHours[dayKey] = { 
              open: '08:00',
              close: '22:00',
              originalText: hours 
            }
          }
        }
      }
    })
  }
  
  // Get first photo reference if available
  let mainPhotoReference = null
  if (place.photos && place.photos.length > 0 && place.photos[0].photo_reference) {
    mainPhotoReference = place.photos[0].photo_reference
  }
  
  return {
    // Basic Information
    name: place.name,
    slug: slug,
    status: 'active',
    featured: false,
    displayOrder: 0,
    
    // Location with automatic league assignment
    location: {
      address: locationData.address,
      city: locationData.city, // This is now the league (marbella, malaga, etc.)
      postalCode: locationData.postalCode,
      coordinates: locationData.coordinates,
      googleMapsUrl: locationData.googleMapsUrl,
      // Additional metadata
      autoAssigned: locationData.autoAssigned,
      leagueName: locationData.leagueName,
      locality: locationData.locality,
      _debug: locationData.originalData
    },
    
    // Description - LEAVE EMPTY FOR MANUAL ENTRY
    description: {
      es: '',
      en: ''
    },
    
    // Courts - Default values
    courts: {
      total: 6,
      surfaces: [{ type: 'clay', count: 6 }],
      indoor: 0,
      outdoor: 6
    },
    
    // Amenities - LEAVE EMPTY FOR MANUAL ENTRY
    amenities: {
      parking: null,
      lighting: null,
      proShop: null,
      restaurant: null,
      changingRooms: null,
      showers: null,
      lockers: null,
      wheelchair: place.wheelchair_accessible_entrance || null,
      swimming: null,
      gym: null,
      sauna: null,
      physio: null
    },
    
    // Services - LEAVE EMPTY FOR MANUAL ENTRY
    services: {
      lessons: null,
      coaching: null,
      stringing: null,
      tournaments: null,
      summerCamps: null
    },
    
    // Contact - ONLY REAL DATA FROM GOOGLE
    contact: {
      phone: place.international_phone_number || place.formatted_phone_number || '',
      email: '',
      website: place.website || '',
      facebook: '',
      instagram: ''
    },
    
    // Operating Hours
    operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    },
    
    // Pricing - LEAVE EMPTY
    pricing: {
      courtRental: {
        hourly: {
          min: null,
          max: null,
          currency: 'EUR'
        },
        membership: {
          monthly: null,
          annual: null,
          currency: 'EUR'
        }
      },
      publicAccess: null,
      membershipRequired: null
    },
    
    // Tags - EMPTY
    tags: [],
    
    // Images
    images: {
      main: '',
      gallery: [],
      googlePhotoReference: mainPhotoReference
    },
    
    // SEO - EMPTY
    seo: {
      metaTitle: {
        es: '',
        en: ''
      },
      metaDescription: {
        es: '',
        en: ''
      },
      keywords: {
        es: [],
        en: []
      }
    },
    
    // Google data
    googlePlaceId: place.place_id,
    googleData: {
      rating: place.rating || null,
      userRatingsTotal: place.user_ratings_total || 0,
      priceLevel: place.price_level || null,
      types: place.types || [],
      url: place.url || null,
      openingHours: place.opening_hours || null,
      photos: place.photos ? place.photos.slice(0, 5).map(photo => ({
        photo_reference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
        html_attributions: photo.html_attributions
      })) : [],
      lastSynced: new Date()
    },
    importSource: 'google',
    importedAt: new Date()
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { placeIds } = await request.json()

    // Validate input
    if (!placeIds || !Array.isArray(placeIds) || placeIds.length === 0) {
      return NextResponse.json(
        { error: 'Place IDs are required' },
        { status: 400 }
      )
    }

    console.log('Getting details for places:', placeIds)

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

    const clubs = []
    const errors = []

    // Fetch details for each place ID
    for (const placeId of placeIds) {
      try {
        const response = await googleMapsClient.placeDetails({
          params: {
            key: apiKey,
            place_id: placeId,
            language: 'es',
            fields: [
              'place_id', 
              'name', 
              'formatted_address',
              'address_components',
              'vicinity',
              'geometry', 
              'rating', 
              'user_ratings_total', 
              'opening_hours', 
              'formatted_phone_number',
              'international_phone_number',
              'website', 
              'photos', 
              'price_level', 
              'types',
              'url',
              'wheelchair_accessible_entrance'
            ]
          }
        })

        if (response.data.result) {
          const clubData = await mapGooglePlaceToClub(response.data.result, apiKey)
          clubs.push(clubData)
          console.log(`✅ Processed: ${response.data.result.name}`)
          console.log(`   → League: ${clubData.location.leagueName || 'Unassigned'}`)
          console.log(`   → City: ${clubData.location.city}`)
          console.log(`   → Auto-assigned: ${clubData.location.autoAssigned ? 'YES' : 'NO'}`)
          console.log(`   → Slug: ${clubData.slug}`)
        }
      } catch (error) {
        console.error(`Error fetching details for place ${placeId}:`, error.response?.data || error)
        errors.push({
          placeId,
          error: error.response?.data?.error_message || error.message
        })
      }
    }

    console.log(`🎉 Successfully processed ${clubs.length} clubs with automatic league assignment!`)

    // Summary of league assignments
    const leagueAssignments = {}
    clubs.forEach(club => {
      const league = club.location.city
      if (!leagueAssignments[league]) {
        leagueAssignments[league] = []
      }
      leagueAssignments[league].push(club.name)
    })

    console.log('\n📊 League Assignment Summary:')
    Object.entries(leagueAssignments).forEach(([league, clubNames]) => {
      console.log(`   ${LEAGUE_NAMES[league] || league}: ${clubNames.length} clubs`)
    })

    return NextResponse.json({
      clubs,
      requested: placeIds.length,
      found: clubs.length,
      errors: errors.length > 0 ? errors : undefined,
      assignmentInfo: {
        summary: leagueAssignments,
        autoAssigned: clubs.filter(c => c.location.autoAssigned).length,
        unassigned: clubs.filter(c => c.location.city === 'unassigned').length
      }
    })

  } catch (error) {
    console.error('Error getting club details:', error)
    return NextResponse.json(
      { error: 'Failed to get club details', details: error.message },
      { status: 500 }
    )
  }
}
