import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import Club from '@/lib/models/Club'
import League from '@/lib/models/League'
import ClubsPageSSG from '@/components/pages/ClubsPageSSG'

// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'es' },
    { locale: 'en' }
  ]
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const locale = params.locale || 'es'
  
  return {
    title: locale === 'es' 
      ? 'Clubs de Tenis en España - Directorio Completo | Tenis del Parque'
      : 'Tennis Clubs in Spain - Complete Directory | Tenis del Parque',
    description: locale === 'es'
      ? 'Descubre los mejores clubes de tenis en España. Encuentra instalaciones increíbles, compara precios y únete a nuestra comunidad de jugadores amateur.'
      : 'Discover the best tennis clubs in Spain. Find incredible facilities, compare prices, and join our amateur tennis community.',
    keywords: locale === 'es'
      ? ['clubs de tenis', 'España', 'tenis amateur', 'directorio clubs', 'instalaciones tenis']
      : ['tennis clubs', 'Spain', 'amateur tennis', 'club directory', 'tennis facilities'],
    openGraph: {
      title: locale === 'es' 
        ? 'Clubs de Tenis en España - Directorio Completo'
        : 'Tennis Clubs in Spain - Complete Directory',
      description: locale === 'es'
        ? 'Encuentra tu club de tenis ideal en España'
        : 'Find your ideal tennis club in Spain',
      type: 'website',
    },
  }
}

// Server-side data fetching function
async function getCitiesAndClubsData() {
  try {
    await dbConnect()
    
    // Get all active cities with complete data
    const cities = await City.find({ status: 'active' })
      .sort({ displayOrder: 1, 'name.es': 1 })
      .select('slug name clubCount province country coordinates images formattedAddress googlePlaceId googleData')
      .lean() // Convert to plain objects for serialization
    
    // Get all active clubs with their GPS-based league assignments
    const clubs = await Club.find({ status: 'active' })
      .select('assignedLeague location.city name')
      .lean()
    
    // Calculate real-time club count based on GPS assignments
    const citiesWithRealCounts = await Promise.all(
      cities.map(async (city) => {
        // Count active leagues in this city
        const leagueCount = await League.countDocuments({
          'location.city': city.slug,
          status: 'active'
        })
        
        // Count clubs assigned to this city via GPS coordinates
        const realClubCount = clubs.filter(club => 
          club.assignedLeague === city.slug || 
          (!club.assignedLeague && club.location?.city === city.slug) // Fallback to old method
        ).length
        
        return {
          ...city,
          leagueCount,
          clubCount: realClubCount, // Use real-time GPS-based count
          originalClubCount: city.clubCount, // Keep original for comparison
          displayName: city.name.es || city.name.en,
          hasCoordinates: !!(city.coordinates?.lat && city.coordinates?.lng),
          hasImages: !!(city.images?.main || (city.images?.gallery && city.images.gallery.length > 0)),
          isGoogleEnhanced: city.googlePlaceId && city.googleData
        }
      })
    )
    
    // Get limited clubs for area statistics (first 1000)
    const clubsForStats = await Club.find({ status: 'active' })
      .limit(1000)
      .select('name location assignedLeague')
      .lean()
    
    return {
      cities: citiesWithRealCounts,
      clubs: clubsForStats,
      total: citiesWithRealCounts.length,
      corrections: citiesWithRealCounts.filter(city => 
        city.clubCount !== city.originalClubCount
      ).length
    }
  } catch (error) {
    console.error('❌ Error fetching cities and clubs data:', error)
    return {
      cities: [],
      clubs: [],
      total: 0,
      corrections: 0,
      error: error.message
    }
  }
}

// Main page component - now server-side rendered
export default async function ClubsPage({ params }) {
  const { cities, clubs, total, corrections, error } = await getCitiesAndClubsData()
  
  // Pass the fetched data directly to the component
  return (
    <ClubsPageSSG 
      locale={params.locale || 'es'}
      initialCities={cities}
      initialClubs={clubs}
      total={total}
      corrections={corrections}
      error={error}
    />
  )
}

// Enable Incremental Static Regeneration
// Revalidate every hour (3600 seconds)
export const revalidate = 3600