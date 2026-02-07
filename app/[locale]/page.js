import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import City from '@/lib/models/City' // Import City model for population
import HomePageSSG from '@/components/pages/HomePageSSG'
import { applyEffectiveStatuses } from '@/lib/utils/leagueStatusUtils'

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
      ? 'Tenis del Parque - Ligas Amateur de Tenis en España'
      : 'Tennis Park - Amateur Tennis Leagues in Spain',
    description: locale === 'es'
      ? 'Únete a la mejor liga amateur de tenis. Sistema suizo, rankings ELO y ambiente competitivo pero relajado. Encuentra tu liga perfecta.'
      : 'Join the best amateur tennis league. Swiss system, ELO rankings and competitive but relaxed atmosphere. Find your perfect league.',
    keywords: locale === 'es'
      ? ['tenis amateur', 'liga de tenis', 'rankings ELO', 'sistema suizo', 'tenis España']
      : ['amateur tennis', 'tennis league', 'ELO rankings', 'swiss system', 'tennis Spain'],
    openGraph: {
      title: locale === 'es' 
        ? 'Tenis del Parque - Ligas Amateur de Tenis'
        : 'Tennis Park - Amateur Tennis Leagues',
      description: locale === 'es'
        ? 'La mejor experiencia de tenis amateur en España'
        : 'The best amateur tennis experience in Spain',
      type: 'website',
      url: locale === 'es' ? '/es' : '/en',
    },
    alternates: {
      canonical: locale === 'es' ? '/es' : '/en',
      languages: {
        'es': '/es',
        'en': '/en'
      }
    }
  }
}

// Server-side data fetching function
async function getLeaguesData() {
  try {
    await dbConnect()
    
    // Get all leagues with city data for images - FIXED: Added city population and image fields
    // Sort by displayOrder first (admin control), then by status and other fields
    const leagues = await League.find({})
      .populate('city', 'slug name images coordinates googleData province')
      .sort({ displayOrder: 1, status: 1, 'season.year': -1, name: 1 })
      .select('name slug status location season seasonConfig currentSeason playerCount maxPlayers description city cityData skillLevel displayOrder stats')
      .lean() // Convert to plain objects for serialization
    
    // Serialize data properly for client components (remove Mongoose ObjectIds)
    const serializedLeagues = leagues.map(league => ({
      ...league,
      _id: league._id.toString(),
      city: league.city ? {
        ...league.city,
        _id: league.city._id.toString(),
        // Clean up googleData photos to remove ObjectId buffers
        googleData: league.city.googleData ? {
          ...league.city.googleData,
          photos: league.city.googleData.photos?.map(photo => ({
            photo_reference: photo.photo_reference,
            width: photo.width,
            height: photo.height,
            html_attributions: photo.html_attributions
            // Remove _id field that contains buffer
          })) || []
        } : undefined
      } : null,
      cityData: league.cityData ? {
        ...league.cityData,
        _id: league.cityData._id?.toString()
      } : null
    }))
    
    // Apply date-aware effective statuses (fixes stale 'registration_open' when dates have passed)
    const effectiveLeagues = applyEffectiveStatuses(serializedLeagues)
    
    // Organize leagues by priority
    // Priority 1: Current seasons (mix of registration_open and active)
    // Priority 2: Coming soon seasons
    const currentSeasonLeagues = effectiveLeagues.filter(league => 
      league.status === 'registration_open' || league.status === 'active'
    )
    const comingSoonLeagues = effectiveLeagues.filter(league => league.status === 'coming_soon')
    
    return {
      leagues: effectiveLeagues,
      currentSeasonLeagues,
      comingSoonLeagues,
      total: serializedLeagues.length,
      currentCount: currentSeasonLeagues.length
    }
  } catch (error) {
    console.error('❌ Error fetching leagues data:', error)
    return {
      leagues: [],
      currentSeasonLeagues: [],
      comingSoonLeagues: [],
      total: 0,
      currentCount: 0,
      error: error.message
    }
  }
}

// Main page component - now server-side rendered
export default async function HomePage({ params }) {
  const leaguesData = await getLeaguesData()
  
  // Pass the fetched data directly to the component
  return (
    <HomePageSSG 
      locale={params.locale || 'es'}
      leaguesData={leaguesData}
    />
  )
}

// Enable Incremental Static Regeneration
// Revalidate every 30 minutes (1800 seconds) for fresh league data
export const revalidate = 1800
