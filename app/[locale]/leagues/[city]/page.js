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
  
  // Group by season status AND registration status
  const now = new Date()
  const grouped = {
    registrationOpen: [], // Leagues with open registration - TOP PRIORITY
    current: [],          // Active/in-progress leagues
    upcoming: [],         // Coming soon (not yet open)
    past: []              // Completed seasons
  }
  
  plainLeagues.forEach(league => {
    const start = league.seasonConfig?.startDate ? new Date(league.seasonConfig.startDate) : null
    const end = league.seasonConfig?.endDate ? new Date(league.seasonConfig.endDate) : null
    
    // First check: is registration open?
    if (league.status === 'registration_open') {
      grouped.registrationOpen.push(league)
      return
    }
    
    // Then check time-based status
    if (!start || !end) {
      if (league.status === 'coming_soon') {
        grouped.upcoming.push(league)
      } else if (league.status === 'active') {
        grouped.current.push(league)
      } else {
        grouped.past.push(league)
      }
    } else if (now >= start && now <= end) {
      grouped.current.push(league)
    } else if (now < start) {
      grouped.upcoming.push(league)
    } else {
      grouped.past.push(league)
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
      case 'registrationOpen':
        return locale === 'es' ? '¡Inscríbete Ahora!' : 'Join Now!'
      case 'current':
        return locale === 'es' ? 'Temporada en Curso' : 'Current Season'
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
        {/* Registration Open - TOP PRIORITY */}
        {grouped.registrationOpen.length > 0 && (
          <LeagueSeasonSection
            title={getSectionTitle('registrationOpen')}
            leagues={grouped.registrationOpen}
            locale={locale}
            status="upcoming"
          />
        )}
        
        {/* Current/Active Season */}
        {grouped.current.length > 0 && (
          <LeagueSeasonSection
            title={getSectionTitle('current')}
            leagues={grouped.current}
            locale={locale}
            status="current"
          />
        )}
        
        {/* Coming Soon */}
        {grouped.upcoming.length > 0 && (
          <LeagueSeasonSection
            title={getSectionTitle('upcoming')}
            leagues={grouped.upcoming}
            locale={locale}
            status="upcoming"
          />
        )}
        
        {/* Past Seasons - Collapsible */}
        {grouped.past.length > 0 && (
          <LeagueSeasonSection
            title={getSectionTitle('past')}
            leagues={grouped.past}
            locale={locale}
            status="past"
            collapsible
          />
        )}
        
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
