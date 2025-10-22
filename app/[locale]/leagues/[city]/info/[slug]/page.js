import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import League from '@/lib/models/League'
import { notFound } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import CityLeagueHero from '@/components/leagues/CityLeagueHero'
import LeagueInfoTab from '@/components/league/LeagueInfoTab'
import { homeContent } from '@/lib/content/homeContent'

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
  
  const league = {
    ...leagueRes,
    _id: leagueRes._id.toString()
  }
  
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
      <CityLeagueHero city={plainCity} locale={locale} leagueName={league.name} />
      
      {/* Content - just swap league cards for LeagueInfoTab */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* League name header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {league.name}
            </h2>
            {league.status === 'registration_open' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                {language === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
              </span>
            )}
            {league.status === 'coming_soon' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {language === 'es' ? 'Próximamente' : 'Coming Soon'}
              </span>
            )}
          </div>
          
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
