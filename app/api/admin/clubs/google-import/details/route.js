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

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\\w-]+/g, '')
}

// Helper function to extract city from address
function extractCity(address) {
  const cities = ['malaga', 'marbella', 'estepona', 'sotogrande', 'benalmadena', 'fuengirola', 'mijas']
  const addressLower = address.toLowerCase()
  
  // Try to find city in address
  for (const city of cities) {
    if (addressLower.includes(city)) {
      return city
    }
  }
  
  // Try to extract from Spanish address format (city usually after postal code)
  const spanishCityMatch = address.match(/\d{5}\s+([^,]+),?\s*(?:Málaga|Cádiz)?/i)
  if (spanishCityMatch && spanishCityMatch[1]) {
    const extractedCity = spanishCityMatch[1].toLowerCase().trim()
    // Check if it's one of our known cities
    for (const city of cities) {
      if (extractedCity.includes(city)) {
        return city
      }
    }
  }
  
  // Default to marbella if city not found
  return 'marbella'
}

// Helper function to map Google place to club format
function mapGooglePlaceToClub(place) {
  const city = extractCity(place.formatted_address)
  const isPremium = place.price_level >= 3
  
  // Extract postal code from address
  const postalCodeMatch = place.formatted_address.match(/\b\d{5}\b/)
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : ''
  
  // Generate descriptions based on available data
  const descriptionEs = `${place.name} es un ${isPremium ? 'prestigioso' : 'acogedor'} club de tenis ubicado en ${city.charAt(0).toUpperCase() + city.slice(1)}. ` +
    `${place.rating ? `Con una valoración de ${place.rating} estrellas basada en ${place.user_ratings_total} reseñas, ` : ''}` +
    `ofrecemos instalaciones ${isPremium ? 'de primera clase' : 'modernas'} y una experiencia de tenis excepcional para jugadores de todos los niveles.`
  
  const descriptionEn = `${place.name} is ${isPremium ? 'a prestigious' : 'a welcoming'} tennis club located in ${city.charAt(0).toUpperCase() + city.slice(1)}. ` +
    `${place.rating ? `With a ${place.rating} star rating based on ${place.user_ratings_total} reviews, ` : ''}` +
    `we offer ${isPremium ? 'world-class' : 'modern'} facilities and an exceptional tennis experience for players of all levels.`
  
  // Parse operating hours if available
  const defaultHours = { open: '08:00', close: isPremium ? '23:00' : '22:00' }
  const operatingHours = {
    monday: defaultHours,
    tuesday: defaultHours,
    wednesday: defaultHours,
    thursday: defaultHours,
    friday: defaultHours,
    saturday: { open: '08:00', close: isPremium ? '23:00' : '21:00' },
    sunday: { open: '08:00', close: isPremium ? '22:00' : '20:00' }
  }
  
  // Process opening hours if available
  if (place.opening_hours?.weekday_text) {
    const dayMapping = {
      'Monday': 'monday',
      'Tuesday': 'tuesday',
      'Wednesday': 'wednesday',
      'Thursday': 'thursday',
      'Friday': 'friday',
      'Saturday': 'saturday',
      'Sunday': 'sunday'
    }
    
    place.opening_hours.weekday_text.forEach(dayText => {
      // Parse format like "Monday: 8:00 AM – 10:00 PM"
      const match = dayText.match(/^(\w+):\s*(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*(\d{1,2}:\d{2}\s*[AP]M)/i)
      if (match) {
        const dayName = match[1]
        const dayKey = dayMapping[dayName]
        if (dayKey) {
          // Convert to 24h format (simplified - you might want a more robust converter)
          const convertTo24h = (time) => {
            const [hourMin, period] = time.split(/\s+/)
            let [hour, min] = hourMin.split(':').map(Number)
            if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12
            if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0
            return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
          }
          
          try {
            operatingHours[dayKey] = {
              open: convertTo24h(match[2]),
              close: convertTo24h(match[3])
            }
          } catch (e) {
            // Keep default hours if parsing fails
          }
        }
      }
    })
  }
  
  // Estimate pricing based on price level
  const basePrices = {
    0: 10,
    1: 15,
    2: 20,
    3: 30,
    4: 50
  }
  const basePrice = basePrices[place.price_level || 2]
  
  return {
    // Basic Information
    name: place.name,
    slug: generateSlug(place.name),
    status: 'active',
    featured: place.rating >= 4.5 && place.user_ratings_total >= 50,
    displayOrder: 0,
    
    // Location
    location: {
      address: place.vicinity || place.formatted_address.split(',')[0], // Get street address only
      city: city,
      postalCode: postalCode,
      coordinates: {
        lat: place.geometry?.location?.lat || null,
        lng: place.geometry?.location?.lng || null
      },
      googleMapsUrl: place.url || `https://maps.google.com/?q=place_id:${place.place_id}`
    },
    
    // Description
    description: {
      es: descriptionEs,
      en: descriptionEn
    },
    
    // Courts (default values - admin must update)
    courts: {
      total: 6, // Default estimate
      surfaces: [{ type: 'clay', count: 6 }], // Default to clay courts
      indoor: 0,
      outdoor: 6
    },
    
    // Amenities (estimated based on price level and types)
    amenities: {
      parking: true,
      lighting: true,
      proShop: isPremium,
      restaurant: place.price_level >= 2 || place.types?.includes('restaurant'),
      changingRooms: true,
      showers: true,
      lockers: place.price_level >= 2,
      wheelchair: place.price_level >= 3 || place.wheelchair_accessible_entrance,
      swimming: isPremium && place.price_level >= 3,
      gym: isPremium && place.price_level >= 3 || place.types?.includes('gym'),
      sauna: place.price_level >= 4,
      physio: place.price_level >= 4
    },
    
    // Services (estimated)
    services: {
      lessons: true,
      coaching: place.price_level >= 2,
      stringing: place.price_level >= 2,
      tournaments: place.price_level >= 2,
      summerCamps: place.price_level >= 1
    },
    
    // Contact
    contact: {
      phone: place.international_phone_number || place.formatted_phone_number || '',
      email: '', // Not available from Google
      website: place.website || '',
      facebook: '', // Not available from Google
      instagram: '' // Not available from Google
    },
    
    // Operating Hours
    operatingHours: operatingHours,
    
    // Pricing (estimated)
    pricing: {
      courtRental: {
        hourly: {
          min: basePrice,
          max: basePrice + 15,
          currency: 'EUR'
        },
        membership: {
          monthly: null,
          annual: null,
          currency: 'EUR'
        }
      },
      publicAccess: place.price_level <= 3,
      membershipRequired: false
    },
    
    // Tags (based on available data)
    tags: [
      place.price_level <= 2 ? 'family-friendly' : 'professional',
      place.rating >= 4 ? 'beginner-friendly' : null,
      isPremium ? 'private' : 'social-club',
      place.types?.includes('school') ? 'academy' : null
    ].filter(Boolean),
    
    // Images
    images: {
      main: '', // Would need to fetch from Google Photos API separately
      gallery: []
    },
    
    // SEO
    seo: {
      metaTitle: {
        es: `${place.name} - Club de Tenis en ${city.charAt(0).toUpperCase() + city.slice(1)}`,
        en: `${place.name} - Tennis Club in ${city.charAt(0).toUpperCase() + city.slice(1)}`
      },
      metaDescription: {
        es: `Descubre ${place.name} en ${city.charAt(0).toUpperCase() + city.slice(1)}. ${place.rating ? `Valoración: ${place.rating} estrellas.` : ''} Reserva tu pista ahora.`,
        en: `Discover ${place.name} in ${city.charAt(0).toUpperCase() + city.slice(1)}. ${place.rating ? `Rating: ${place.rating} stars.` : ''} Book your court now.`
      },
      keywords: {
        es: [`tenis ${city}`, `club tenis ${city}`, place.name.toLowerCase()],
        en: [`tennis ${city}`, `tennis club ${city}`, place.name.toLowerCase()]
      }
    },
    
    // Google data (for reference)
    googlePlaceId: place.place_id,
    googleData: {
      rating: place.rating || null,
      userRatingsTotal: place.user_ratings_total || 0,
      priceLevel: place.price_level || null,
      types: place.types || [],
      url: place.url || null
    },
    importSource: 'google'
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
          const clubData = mapGooglePlaceToClub(response.data.result)
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
