import dbConnect from '@/lib/db/mongoose'
import Club from '@/lib/models/Club'
import CityClubsPageSSG from '@/components/pages/CityClubsPageSSG'

// Generate static params for all city pages
export async function generateStaticParams() {
  try {
    await dbConnect()
    
    // Get all unique cities from active clubs
    const clubs = await Club.find({ status: 'active' })
      .select('location.city')
      .lean()
    
    // Extract unique cities
    const cities = [...new Set(clubs
      .map(club => club.location?.city)
      .filter(city => city && typeof city === 'string')
    )]
    
    // Generate params for both locales for each city
    const params = []
    
    for (const city of cities) {
      // Add both Spanish and English versions
      params.push(
        { locale: 'es', city },
        { locale: 'en', city }
      )
    }
    
    console.log(`Generated ${params.length} static params for city club pages across ${cities.length} cities`)
    return params
    
  } catch (error) {
    console.error('Error generating static params for city clubs:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { locale, city } = params
  
  try {
    await dbConnect()
    
    // Get clubs count and basic info for this city
    const clubs = await Club.find({ 
      'location.city': city, 
      status: 'active' 
    }).select('name location courts').lean()
    
    if (!clubs.length) {
      return {
        title: locale === 'es' ? 'Ciudad no encontrada' : 'City not found',
        description: locale === 'es' 
          ? 'La ciudad que buscas no tiene clubs disponibles'
          : 'The city you are looking for has no available clubs'
      }
    }
    
    const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const clubCount = clubs.length
    
    // Calculate court statistics
    let totalCourts = 0
    let tennisCount = 0
    let padelCount = 0
    
    clubs.forEach(club => {
      if (club.courts?.tennis?.total) tennisCount += club.courts.tennis.total
      if (club.courts?.padel?.total) padelCount += club.courts.padel.total
      if (club.courts?.total && !club.courts.tennis && !club.courts.padel) {
        totalCourts += club.courts.total
      }
    })
    
    const totalCourtCount = tennisCount + padelCount + totalCourts
    
    return {
      title: locale === 'es' 
        ? `${clubCount} Clubs de Tenis en ${cityName} | Tenis del Parque`
        : `${clubCount} Tennis Clubs in ${cityName} | Tennis Park`,
      description: locale === 'es'
        ? `Descubre ${clubCount} clubs de tenis en ${cityName}${totalCourtCount > 0 ? ` con ${totalCourtCount} pistas` : ''}. Encuentra el club perfecto con instalaciones, precios y servicios detallados.`
        : `Discover ${clubCount} tennis clubs in ${cityName}${totalCourtCount > 0 ? ` with ${totalCourtCount} courts` : ''}. Find the perfect club with detailed facilities, pricing and services.`,
      keywords: locale === 'es'
        ? [`clubs tenis ${cityName}`, 'instalaciones tenis', 'pistas tenis', cityName, 'Costa del Sol', 'España']
        : [`tennis clubs ${cityName}`, 'tennis facilities', 'tennis courts', cityName, 'Costa del Sol', 'Spain'],
      openGraph: {
        title: `${clubCount} ${locale === 'es' ? 'Clubs de Tenis' : 'Tennis Clubs'} - ${cityName}`,
        description: locale === 'es'
          ? `Guía completa de clubs de tenis en ${cityName}`
          : `Complete guide to tennis clubs in ${cityName}`,
        type: 'website',
        locale: locale === 'es' ? 'es_ES' : 'en_US',
      },
      alternates: {
        canonical: `/${locale}/clubs/${city}`,
        languages: {
          'es': `/es/clubs/${city}`,
          'en': `/en/clubs/${city}`
        }
      }
    }
  } catch (error) {
    console.error('Error generating metadata for city clubs:', error)
    return {
      title: locale === 'es' ? 'Clubs de Tenis' : 'Tennis Clubs',
      description: locale === 'es' 
        ? 'Encuentra clubs de tenis'
        : 'Find tennis clubs'
    }
  }
}

// Server-side data fetching function
async function getCityClubsData(city) {
  try {
    await dbConnect()
    
    // Get all clubs in this city with full details
    const clubs = await Club.find({ 
      'location.city': city, 
      status: 'active' 
    }).lean()
    
    // Get city info (if we have a specific city configuration)
    const cityInfo = {
      name: city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      league: city, // Default league slug
      color: null // Will be determined by frontend
    }
    
    // Create debug info
    const debugInfo = {
      totalClubsQueried: await Club.countDocuments(),
      clubsWithGPSAssignments: await Club.countDocuments({ 'location.city': { $exists: true, $ne: null } }),
      clubsInThisCity: clubs.length,
      activeClubsInThisCity: clubs.length,
      inactiveClubsInThisCity: 0,
      clubAssignments: clubs.reduce((acc, club) => {
        acc[club.name] = {
          city: club.location?.city,
          area: club.location?.area,
          status: club.status
        }
        return acc
      }, {})
    }
    
    return {
      clubs,
      city: cityInfo,
      debug: debugInfo,
      lastUpdated: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('❌ Error fetching city clubs data:', error)
    return {
      clubs: [],
      city: null,
      debug: null,
      error: error.message,
      lastUpdated: new Date().toISOString()
    }
  }
}

// Main page component - now server-side rendered
export default async function CityClubsPage({ params, searchParams }) {
  const { locale, city } = params
  const cityClubsData = await getCityClubsData(city)
  
  return (
    <CityClubsPageSSG
      locale={locale || 'es'}
      city={city}
      cityClubsData={cityClubsData}
      searchParams={searchParams || {}}
    />
  )
}

// Enable Incremental Static Regeneration
// Revalidate every hour (3600 seconds) - city club listings change occasionally
export const revalidate = 3600
