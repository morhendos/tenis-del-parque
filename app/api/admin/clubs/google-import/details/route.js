import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import City from '@/lib/models/City'
import dbConnect from '@/lib/db/mongoose'
import { 
  extractAreaFromGoogle, 
  determineMainCity, 
  generateDisplayName 
} from '@/lib/utils/areaMapping'

// Dynamically import to handle if package is not installed
let Client
try {
  const googleMapsModule = require('@googlemaps/google-maps-services-js')
  Client = googleMapsModule.Client
} catch (error) {
  console.warn('@googlemaps/google-maps-services-js not installed. Please run: npm install @googlemaps/google-maps-services-js')
}

const googleMapsClient = Client ? new Client({}) : null

// Helper function to generate slug from name and area
function generateSlug(name, area = null) {
  const baseName = name
    .toLowerCase()
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  // Include area in slug for better uniqueness
  if (area && area !== 'unknown') {
    return `${baseName}-${area}`
  }
  
  return baseName
}

// Enhanced function to extract and process location data using our area mapping
async function processLocationFromGoogle(place) {
  await dbConnect()
  
  console.log('Processing place:', place.name)
  console.log('Formatted address:', place.formatted_address)
  console.log('Address components:', place.address_components)
  
  // Extract area information using our new system
  const areaInfo = extractAreaFromGoogle(place.address_components)
  console.log('Extracted area info:', areaInfo)
  
  // Determine main city for league organization
  const mainCity = determineMainCity(areaInfo.area, areaInfo.city)
  console.log('Determined main city:', mainCity)
  
  // Generate display name
  const displayName = generateDisplayName(areaInfo.area, mainCity)
  console.log('Generated display name:', displayName)
  
  // Extract postal code from address
  const postalCodeMatch = place.formatted_address.match(/\b\d{5}\b/)
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : ''
  
  // Create or ensure main city exists
  try {
    const city = await City.findOrCreate({
      slug: mainCity,
      name: mainCity.charAt(0).toUpperCase() + mainCity.slice(1),
      nameEs: mainCity.charAt(0).toUpperCase() + mainCity.slice(1),
      nameEn: mainCity.charAt(0).toUpperCase() + mainCity.slice(1),
      importSource: 'google'
    })
    
    console.log(`City "${mainCity}" ensured in database`)
  } catch (error) {
    console.error('Error creating city:', error)
  }
  
  return {
    area: areaInfo.area,
    city: mainCity,
    administrativeCity: areaInfo.city,
    displayName: displayName,
    address: place.vicinity || place.formatted_address.split(',')[0],
    postalCode: postalCode,
    coordinates: {
      lat: place.geometry?.location?.lat || null,
      lng: place.geometry?.location?.lng || null
    },
    googleMapsUrl: place.url || `https://maps.google.com/?q=place_id:${place.place_id}`,
    // Keep original data for debugging
    originalData: {
      formattedAddress: place.formatted_address,
      vicinity: place.vicinity,
      extractedArea: areaInfo.originalArea,
      extractedCity: areaInfo.originalCity
    }
  }
}

// Enhanced function to map Google place to club format with area support
async function mapGooglePlaceToClub(place, apiKey) {
  // Process location with our enhanced area mapping
  const locationData = await processLocationFromGoogle(place)
  
  // Generate slug with area for better uniqueness
  const slug = generateSlug(place.name, locationData.area)
  
  console.log(`Generated slug for "${place.name}": "${slug}"`)
  console.log(`Location mapping: ${locationData.area} → ${locationData.city}`)
  console.log(`Display name: ${locationData.displayName}`)
  
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
      // Parse format like "Monday: 8:00 AM – 10:00 PM" or "Lunes: 8:00–22:00"
      const match = dayText.match(/^(\w+):\s*(.+)/)
      if (match) {
        const dayName = match[1]
        const hours = match[2]
        const dayKey = dayMapping[dayName]
        
        if (dayKey) {
          if (hours.toLowerCase().includes('closed') || hours.toLowerCase().includes('cerrado')) {
            operatingHours[dayKey] = { open: null, close: null, closed: true }
          } else {
            // Try to parse hours - just store the string for now
            operatingHours[dayKey] = { 
              open: '08:00', // Default fallback
              close: '22:00', // Default fallback
              originalText: hours 
            }
          }
        }
      }
    })
  }
  
  // Get first photo reference if available (don't store full URL with API key)
  let mainPhotoReference = null
  if (place.photos && place.photos.length > 0 && place.photos[0].photo_reference) {
    mainPhotoReference = place.photos[0].photo_reference
  }
  
  return {
    // Basic Information - ONLY FROM GOOGLE
    name: place.name,
    slug: slug,
    status: 'active',
    featured: false,
    displayOrder: 0,
    
    // Enhanced Location with Area Support
    location: {
      address: locationData.address,
      area: locationData.area,
      city: locationData.city,
      administrativeCity: locationData.administrativeCity,
      displayName: locationData.displayName,
      postalCode: locationData.postalCode,
      coordinates: locationData.coordinates,
      googleMapsUrl: locationData.googleMapsUrl,
      // Store original data for debugging/reference
      _debug: locationData.originalData
    },
    
    // Description - LEAVE EMPTY FOR MANUAL ENTRY
    description: {
      es: '',
      en: ''
    },
    
    // Courts - Use default values to pass validation
    courts: {
      total: 6, // Default estimate
      surfaces: [{ type: 'clay', count: 6 }], // Default to clay courts
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
    
    // Operating Hours - ONLY IF AVAILABLE FROM GOOGLE
    operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    },
    
    // Pricing - LEAVE EMPTY FOR MANUAL ENTRY
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
    
    // Tags - EMPTY UNTIL MANUALLY ADDED
    tags: [],
    
    // Images - Store Google photo reference, not full URL with API key
    images: {
      main: '', // Leave empty for Google photos, will be generated via API endpoint
      gallery: [],
      googlePhotoReference: mainPhotoReference
    },
    
    // SEO - LEAVE EMPTY FOR MANUAL ENTRY
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
    
    // Google data - STORE ACTUAL GOOGLE DATA
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
          console.log(`   → Area: ${clubData.location.area}`)
          console.log(`   → City: ${clubData.location.city}`)
          console.log(`   → Display: ${clubData.location.displayName}`)
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

    console.log(`🎉 Successfully processed ${clubs.length} clubs with area mapping!`)

    return NextResponse.json({
      clubs,
      requested: placeIds.length,
      found: clubs.length,
      errors: errors.length > 0 ? errors : undefined,
      mappingInfo: {
        areasProcessed: clubs.map(club => ({
          name: club.name,
          area: club.location.area,
          city: club.location.city,
          displayName: club.location.displayName
        }))
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
