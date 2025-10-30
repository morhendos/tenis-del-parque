import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import League from '@/lib/models/League'
import { notFound } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import CityLeagueHero from '@/components/leagues/CityLeagueHero'
import LeagueInfoTab from '@/components/league/LeagueInfoTab'
import { homeContent } from '@/lib/content/homeContent'
import { serializeLeague } from '@/lib/utils/serializeLeague'

export default async function LeagueInfoPage({ params }) {
  const { city: citySlug, locale, slug } = params
  const language = locale || 'es'
  const footerContent = homeContent[language]?.footer || homeContent['es']?.footer
  
  await dbConnect()
  
  // Fetch city - EXACTLY like city leagues page
  const city = await City.findOne({ slug: citySlug, status: 'active' }).lean()
  
  if (!city) {
    notFound()
  }
  
  // Fetch league by slug
  const leagueRes = await League.findOne({ slug: slug }).lean()
  
  if (!leagueRes) {
    notFound()
  }
  
  // Convert MongoDB objects to plain objects
  const plainCity = {
    ...city,
    _id: city._id.toString()
  }
  
  const league = serializeLeague(leagueRes)
  
  // Build season info for LeagueInfoTab
  const currentSeason = league.season ? {
    ...league.season,
    status: league.status,
    dbKey: `${league.season.type}-${league.season.year}`,
    displayName: league.season.type && league.season.year 
      ? `${league.season.type.charAt(0).toUpperCase() + league.season.type.slice(1)} ${league.season.year}`
      : (language === 'es' ? 'Temporada' : 'Season'),
    name: league.season.type && league.season.year 
      ? `${league.season.type.charAt(0).toUpperCase() + league.season.type.slice(1)} ${league.season.year}`
      : (language === 'es' ? 'Temporada' : 'Season')
  } : null
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage="leagues" 
        language={language}
        showLanguageSwitcher={true}
      />
      
      {/* SAME Hero component as city leagues page */}
      <CityLeagueHero city={plainCity} locale={locale} leagueName={league.name} league={league} />
      
      {/* Content - just swap league cards for LeagueInfoTab */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* League Info Tab */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <LeagueInfoTab 
              league={league}
              currentSeason={currentSeason}
              language={language}
              locale={locale}
            />
          </div>
        </div>
      </div>
      
      <Footer content={footerContent} />
    </div>
  )
}
