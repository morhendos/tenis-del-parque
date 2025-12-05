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
      ? `Únete a las ligas de tenis en ${cityName}. Múltiples niveles disponibles.`
      : `Join tennis leagues in ${cityName}. Multiple skill levels available.`
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
  
  // Group by season status
  const now = new Date()
  const grouped = {
    current: [],
    upcoming: [],
    past: []
  }
  
  plainLeagues.forEach(league => {
    const start = league.seasonConfig?.startDate ? new Date(league.seasonConfig.startDate) : null
    const end = league.seasonConfig?.endDate ? new Date(league.seasonConfig.endDate) : null
    
    if (!start || !end) {
      if (league.status === 'coming_soon') {
        grouped.upcoming.push(league)
      } else {
        grouped.current.push(league)
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage="leagues" 
        language={locale}
        showLanguageSwitcher={true}
      />
      
      <CityLeagueHero city={plainCity} locale={locale} />
      
      {/* Content container - compact padding on mobile */}
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        {grouped.current.length > 0 && (
          <LeagueSeasonSection
            title={locale === 'es' ? 'Temporada Actual' : 'Current Season'}
            leagues={grouped.current}
            locale={locale}
            status="current"
          />
        )}
        
        {grouped.upcoming.length > 0 && (
          <LeagueSeasonSection
            title={locale === 'es' ? 'Próxima Temporada' : 'Upcoming Season'}
            leagues={grouped.upcoming}
            locale={locale}
            status="upcoming"
          />
        )}
        
        {grouped.past.length > 0 && (
          <LeagueSeasonSection
            title={locale === 'es' ? 'Temporadas Anteriores' : 'Past Seasons'}
            leagues={grouped.past}
            locale={locale}
            status="past"
            collapsible
          />
        )}
        
        {plainLeagues.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-600 text-base sm:text-lg">
              {locale === 'es' 
                ? 'No hay ligas disponibles en esta ciudad aún.' 
                : 'No leagues available in this city yet.'}
            </p>
          </div>
        )}
      </div>
      
      <Footer content={footerContent} />
    </div>
  )
}
