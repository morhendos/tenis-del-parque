import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}

// Helper function to extract city from address
function extractCity(address) {
  const cities = ['malaga', 'marbella', 'estepona', 'sotogrande']
  const addressLower = address.toLowerCase()
  
  for (const city of cities) {
    if (addressLower.includes(city)) {
      return city
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
    featured: place.rating >= 4.5,
    displayOrder: 0,
    
    // Location
    location: {
      address: place.formatted_address.split(',')[0], // Get street address only
      city: city,
      postalCode: postalCode,
      coordinates: {
        lat: place.geometry?.location?.lat || null,
        lng: place.geometry?.location?.lng || null
      },
      googleMapsUrl: `https://maps.google.com/?q=place_id:${place.place_id}`
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
    
    // Amenities (estimated based on price level)
    amenities: {
      parking: true,
      lighting: true,
      proShop: isPremium,
      restaurant: place.price_level >= 2,
      changingRooms: true,
      showers: true,
      lockers: place.price_level >= 2,
      wheelchair: place.price_level >= 3,
      swimming: isPremium && place.price_level >= 3,
      gym: isPremium && place.price_level >= 3,
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
      phone: place.formatted_phone_number || '',
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
      isPremium ? 'private' : 'social-club'
    ].filter(Boolean),
    
    // Images
    images: {
      main: '', // Would need to fetch from Google Photos API
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
    googleRating: place.rating || null,
    googleUserRatingsTotal: place.user_ratings_total || 0,
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

    // TODO: In production, fetch actual details from Google Places API
    // For now, return mock detailed data

    // Mock Google Places data (same as search results but with full details)
    const mockPlaces = {
      'ChIJ1234567890': {
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
      'ChIJ0987654321': {
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
      'ChIJ2468135790': {
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
      },
      'ChIJ9876543210': {
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
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get details for requested places and map to club format
    const clubs = placeIds
      .map(placeId => mockPlaces[placeId])
      .filter(Boolean)
      .map(place => mapGooglePlaceToClub(place))

    return NextResponse.json({
      clubs,
      requested: placeIds.length,
      found: clubs.length
    })

  } catch (error) {
    console.error('Error getting club details:', error)
    return NextResponse.json(
      { error: 'Failed to get club details', details: error.message },
      { status: 500 }
    )
  }
}