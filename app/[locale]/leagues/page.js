import { Suspense } from 'react'
import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import City from '@/lib/models/City' // Import City model for population
import LeaguesPageSSG from '@/components/pages/LeaguesPageSSG'
import { TennisPreloaderFullScreen } from '@/components/ui/TennisPreloader'

// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'es' },
    { locale: 'en' }
  ]
}

// Generate metadata for both English and Spanish routes
export function generateMetadata({ params }) {
  const locale = params?.locale || 'es'
  
  if (locale === 'es') {
    return {
      title: 'Ligas de Tenis Amateur - Encuentra tu Liga Perfecta | Tenis del Parque',
      description: 'Descubre todas nuestras ligas de tenis amateur. Sistema suizo, rankings ELO y ambiente competitivo pero relajado en España.',
      keywords: ['ligas tenis', 'tenis amateur', 'competición tenis', 'rankings ELO', 'sistema suizo'],
      openGraph: {
        title: 'Ligas de Tenis Amateur - Encuentra tu Liga Perfecta',
        description: 'Todas las ligas de tenis amateur en España',
        type: 'website',
      },
      alternates: {
        canonical: '/es/ligas',
        languages: {
          'es': '/es/ligas',
          'en': '/en/leagues'
        }
      }
    }
  } else {
    return {
      title: 'Amateur Tennis Leagues - Find Your Perfect League | Tennis Park',
      description: 'Discover all our amateur tennis leagues. Swiss system, ELO rankings and competitive but relaxed atmosphere in Spain.',
      keywords: ['tennis leagues', 'amateur tennis', 'tennis competition', 'ELO rankings', 'swiss system'],
      openGraph: {
        title: 'Amateur Tennis Leagues - Find Your Perfect League',
        description: 'All amateur tennis leagues in Spain',
        type: 'website',
      },
      alternates: {
        canonical: '/en/leagues',
        languages: {
          'es': '/es/ligas', 
          'en': '/en/leagues'
        }
      }
    }
  }
}

// Server-side data fetching function
async function getLeaguesData() {
  try {
    await dbConnect()
    
    // Get all leagues with detailed information including city data - FIXED: Added city population and image fields
    const leagues = await League.find({})
      .populate('city', 'slug name images coordinates googleData province')
      .sort({ status: 1, 'location.city': 1, name: 1 })
      .select('name slug status location currentSeason playerCount maxPlayers description registrationOpen city cityData season skillLevel seasons stats')
      .lean() // Convert to plain objects for serialization
    
    // Serialize data properly for client components
    // Use JSON.parse(JSON.stringify()) to ensure complete serialization and remove all methods/functions
    const serializedLeagues = JSON.parse(JSON.stringify(leagues))
    
    // Get statistics
    const stats = {
      total: serializedLeagues.length,
      active: serializedLeagues.filter(l => l.status === 'active').length,
      registrationOpen: serializedLeagues.filter(l => l.status === 'registration_open').length,
      comingSoon: serializedLeagues.filter(l => l.status === 'coming_soon').length,
      cities: [...new Set(serializedLeagues.map(l => l.location?.city).filter(Boolean))].length
    }
    
    return {
      leagues: serializedLeagues,
      stats,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Error fetching leagues data:', error)
    return {
      leagues: [],
      stats: {
        total: 0,
        active: 0,
        registrationOpen: 0,
        comingSoon: 0,
        cities: 0
      },
      error: error.message,
      lastUpdated: new Date().toISOString()
    }
  }
}

// Main page component - now server-side rendered
export default async function LeaguesPage({ params }) {
  const locale = params?.locale || 'es'
  const leaguesData = await getLeaguesData()
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <TennisPreloaderFullScreen 
          text={locale === 'es' ? 'Cargando ligas...' : 'Loading leagues...'} 
          locale={locale} 
        />
      </div>
    }>
      <LeaguesPageSSG 
        locale={locale} 
        leaguesData={leaguesData}
      />
    </Suspense>
  )
}

// Enable Incremental Static Regeneration
// Revalidate every hour (3600 seconds) for fresh league data
export const revalidate = 3600
