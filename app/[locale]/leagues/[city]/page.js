import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import League from '@/lib/models/League'
import Player from '@/lib/models/Player'
import { notFound } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import CityLeagueHero from '@/components/leagues/CityLeagueHero'
import LeagueSeasonSection from '@/components/leagues/LeagueSeasonSection'
import { homeContent } from '@/lib/content/homeContent'
import { serializeLeague } from '@/lib/utils/serializeLeague'

export async function generateStaticParams() {
  await dbConnect()
  const cities = await City.find({ status: 'active' }).select('slug')
  
  const locales = ['en', 'es']
  const params = []
  
  cities.forEach(city => {
    locales.forEach(locale => {
      params.push({ locale, city: city.slug })
    })
  })
  
  return params
}

export async function generateMetadata({ params }) {
  const { city: citySlug, locale } = params
  
  await dbConnect()
  const city = await City.findOne({ slug: citySlug, status: 'active' })
  
  if (!city) return {}
  
  const cityName = city.name[locale] || city.name.es
  
  return {
    title: `${cityName} ${locale === 'es' ? 'Ligas de Tenis' : 'Tennis Leagues'} | Tenis del Parque`,
    description: locale === 'es' 
      ? `Únete a las ligas de tenis en ${cityName}. Múltiples niveles disponibles: Oro, Plata y Bronce.`
      : `Join tennis leagues in ${cityName}. Multiple skill levels available: Gold, Silver and Bronze.`
  }
}

export default async function CityLeaguePage({ params }) {
  const { city: citySlug, locale } = params
  const footerContent = homeContent[locale]?.footer || homeContent['es']?.footer
  
  await dbConnect()
  
  // Fetch city
  const city = await City.findOne({ slug: citySlug, status: 'active' }).lean()
  
  if (!city) {
    notFound()
  }
  
  // Fetch leagues for this city
  const leagues = await League.find({ 
    city: city._id,
    status: { $in: ['active', 'coming_soon', 'registration_open', 'completed'] }
  })
  .populate('city', 'slug name images')
  .sort({ 
    'season.year': -1,
    'season.type': 1,
    displayOrder: 1,
    skillLevel: 1
  })
  .lean()
  
  // Calculate actual player counts for each league
  const leaguesWithPlayerCounts = await Promise.all(
    leagues.map(async (league) => {
      // Count players with active/confirmed status for this league
      const playerCount = await Player.countDocuments({
        'registrations': {
          $elemMatch: {
            league: league._id,
            status: { $in: ['confirmed', 'active'] }
          }
        }
      })
      
      // Update the stats object with actual player count
      return {
        ...league,
        stats: {
          ...league.stats,
          registeredPlayers: playerCount
        }
      }
    })
  )
  
  // Convert MongoDB objects to plain objects and handle dates
  const plainLeagues = leaguesWithPlayerCounts.map(league => serializeLeague(league))
  
  // Group leagues by season (year + type), keeping all skill levels together
  const seasonGroups = {}
  
  plainLeagues.forEach(league => {
    const seasonKey = `${league.season?.year || 'unknown'}-${league.season?.type || 'unknown'}`
    
    if (!seasonGroups[seasonKey]) {
      seasonGroups[seasonKey] = {
        year: league.season?.year,
        type: league.season?.type,
        leagues: [],
        // Determine overall status for the season group
        hasRegistrationOpen: false,
        hasActive: false,
        hasComingSoon: false
      }
    }
    
    seasonGroups[seasonKey].leagues.push(league)
    
    // Track statuses within this season
    if (league.status === 'registration_open') seasonGroups[seasonKey].hasRegistrationOpen = true
    if (league.status === 'active') seasonGroups[seasonKey].hasActive = true
    if (league.status === 'coming_soon') seasonGroups[seasonKey].hasComingSoon = true
  })
  
  // Convert to array and sort by year/type
  const sortedSeasons = Object.values(seasonGroups).sort((a, b) => {
    // Sort by year descending, then by season type
    if (b.year !== a.year) return b.year - a.year
    const seasonOrder = { spring: 1, summer: 2, autumn: 3, winter: 4 }
    return (seasonOrder[a.type] || 0) - (seasonOrder[b.type] || 0)
  })
  
  // Group seasons into current/upcoming/past based on their overall status
  const grouped = {
    current: [],    // Seasons with registration open or active leagues
    upcoming: [],   // Seasons that are coming soon
    past: []        // Completed seasons
  }
  
  sortedSeasons.forEach(seasonGroup => {
    // Determine if this season group should be in current, upcoming, or past
    if (seasonGroup.hasRegistrationOpen || seasonGroup.hasActive) {
      grouped.current.push(seasonGroup)
    } else if (seasonGroup.hasComingSoon) {
      grouped.upcoming.push(seasonGroup)
    } else {
      grouped.past.push(seasonGroup)
    }
  })
  
  // Convert city _id to string
  const plainCity = {
    ...city,
    _id: city._id.toString()
  }
  
  // Determine section titles based on what's available
  const getSectionTitle = (type) => {
    switch(type) {
      case 'current':
        // Check if any season has registration open
        const hasAnyRegistrationOpen = grouped.current.some(s => s.hasRegistrationOpen)
        if (hasAnyRegistrationOpen) {
          return locale === 'es' ? 'Temporada Actual' : 'Current Season'
        }
        return locale === 'es' ? 'Temporada en Curso' : 'Season in Progress'
      case 'upcoming':
        return locale === 'es' ? 'Próximamente' : 'Coming Soon'
      case 'past':
        return locale === 'es' ? 'Temporadas Anteriores' : 'Past Seasons'
      default:
        return ''
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage="leagues" 
        language={locale}
        showLanguageSwitcher={true}
      />
      
      <CityLeagueHero city={plainCity} locale={locale} />
      
      {/* Content container */}
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        {/* Current Season (includes registration open and active) */}
        {grouped.current.length > 0 && grouped.current.map((seasonGroup, idx) => (
          <LeagueSeasonSection
            key={`current-${idx}`}
            title={getSectionTitle('current')}
            leagues={seasonGroup.leagues}
            locale={locale}
            status="active"
          />
        ))}
        
        {/* Coming Soon */}
        {grouped.upcoming.length > 0 && grouped.upcoming.map((seasonGroup, idx) => (
          <LeagueSeasonSection
            key={`upcoming-${idx}`}
            title={getSectionTitle('upcoming')}
            leagues={seasonGroup.leagues}
            locale={locale}
            status="upcoming"
          />
        ))}
        
        {/* Past Seasons - Collapsible */}
        {grouped.past.length > 0 && grouped.past.map((seasonGroup, idx) => (
          <LeagueSeasonSection
            key={`past-${idx}`}
            title={getSectionTitle('past')}
            leagues={seasonGroup.leagues}
            locale={locale}
            status="past"
            collapsible
          />
        ))}
        
        {/* Empty State */}
        {plainLeagues.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
            </h3>
            <p className="text-gray-600">
              {locale === 'es' 
                ? 'Estamos preparando ligas para esta ciudad. ¡Vuelve pronto!' 
                : 'We are preparing leagues for this city. Check back soon!'}
            </p>
          </div>
        )}
      </div>
      
      <Footer content={footerContent} />
    </div>
  )
}
