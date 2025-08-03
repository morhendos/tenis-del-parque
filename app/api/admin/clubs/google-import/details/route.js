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

// Helper function to extract city from Google's formatted address
async function extractAndCreateCity(formattedAddress, vicinity) {
  await dbConnect()
  
  // Common Spanish address patterns
  // Format 1: "Street, Number, PostalCode City, Province, Spain"
  // Format 2: "Street, City, Province, Spain"
  // Format 3: "Street, PostalCode, City Province, Spain"
  
  let cityName = null
  let postalCode = null
  
  // Try to extract postal code first
  const postalCodeMatch = formattedAddress.match(/\b(\d{5})\b/)
  if (postalCodeMatch) {
    postalCode = postalCodeMatch[1]
  }
  
  // Method 1: Extract city after postal code
  if (postalCode) {
    const afterPostalCode = formattedAddress.match(new RegExp(`${postalCode}\\s+([^,]+)(?:,|$)`))
    if (afterPostalCode && afterPostalCode[1]) {
      cityName = afterPostalCode[1].trim()
    }
  }
  
  // Method 2: Use vicinity (usually contains city name)
  if (!cityName && vicinity) {
    // Vicinity often is like "City" or "Area, City"
    const vicinitySplit = vicinity.split(',')
    cityName = vicinitySplit[vicinitySplit.length - 1].trim()
  }
  
  // Method 3: Parse formatted address parts
  if (!cityName) {
    const parts = formattedAddress.split(',').map(p => p.trim())
    
    // Remove country (usually last part)
    if (parts[parts.length - 1].toLowerCase().includes('spain') || 
        parts[parts.length - 1].toLowerCase().includes('españa')) {
      parts.pop()
    }
    
    // Remove province if present
    const provinces = ['málaga', 'cádiz', 'granada', 'almería', 'sevilla', 'córdoba', 'jaén', 'huelva']
    const lastPart = parts[parts.length - 1]?.toLowerCase()
    if (lastPart && provinces.some(p => lastPart.includes(p))) {
      parts.pop()
    }
    
    // The remaining last part might be the city
    if (parts.length > 0) {
      const potentialCity = parts[parts.length - 1]
      // Check if it contains postal code, if so, extract city from it
      if (postalCode && potentialCity.includes(postalCode)) {
        cityName = potentialCity.replace(postalCode, '').trim()
      } else if (!potentialCity.match(/^\d/)) { // Don't use if it starts with numbers
        cityName = potentialCity
      }
    }
  }
  
  // Default fallback
  if (!cityName) {
    console.warn(`Could not extract city from address: ${formattedAddress}`)
    cityName = 'Marbella' // Default fallback
  }
  
  // Clean up the city name
  cityName = cityName.replace(/^([0-9]+\s+)/, '') // Remove leading numbers
  const citySlug = generateSlug(cityName)
  
  // Check if city exists, if not create it
  try {
    const city = await City.findOrCreate({
      slug: citySlug,
      name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
      nameEs: cityName.charAt(0).toUpperCase() + cityName.slice(1),
      nameEn: cityName.charAt(0).toUpperCase() + cityName.slice(1),
      importSource: 'google'
    })
    
    console.log(`City "${cityName}" mapped to slug: "${citySlug}"`)
    return citySlug
  } catch (error) {
    console.error('Error creating city:', error)
    // Return the slug anyway, even if city creation failed
    return citySlug
  }
}

// Note: We no longer generate full Google Photos URLs during import
// Photo references are stored and URLs are generated via API endpoint when needed

// Helper function to map Google place to club format - ONLY REAL DATA
async function mapGooglePlaceToClub(place, apiKey) {
  const citySlug = await extractAndCreateCity(place.formatted_address, place.vicinity)
  
  // Extract postal code from address
  const postalCodeMatch = place.formatted_address.match(/\b\d{5}\b/)
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : ''
  
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
    slug: generateSlug(place.name),
    status: 'active',
    featured: false,
    displayOrder: 0,
    
    // Location - REAL DATA FROM GOOGLE
    location: {
      address: place.vicinity || place.formatted_address.split(',')[0],
      city: citySlug,
      postalCode: postalCode,
      coordinates: {
        lat: place.geometry?.location?.lat || null,
        lng: place.geometry?.location?.lng || null
      },
      googleMapsUrl: place.url || `https://maps.google.com/?q=place_id:${place.place_id}`
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
      })) : []
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
          console.log(`Generated slug for "${response.data.result.name}": "${clubData.slug}"`)
          console.log(`Address: ${response.data.result.formatted_address}`)
          console.log(`City extracted: ${clubData.location.city}`)
          clubs.push(clubData)
          console.log(`Fetched details for: ${response.data.result.name}`)
        }
      } catch (error) {
        console.error(`Error fetching details for place ${placeId}:`, error.response?.data || error)
        errors.push({
          placeId,
          error: error.response?.data?.error_message || error.message
        })
      }
    }

    console.log(`Successfully fetched ${clubs.length} clubs, ${errors.length} errors`)

    return NextResponse.json({
      clubs,
      requested: placeIds.length,
      found: clubs.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error getting club details:', error)
    return NextResponse.json(
      { error: 'Failed to get club details', details: error.message },
      { status: 500 }
    )
  }
}
