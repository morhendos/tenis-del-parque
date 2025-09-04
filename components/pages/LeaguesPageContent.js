'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { homeContent } from '@/lib/content/homeContent'
import { multiLeagueHomeContent } from '@/lib/content/multiLeagueHomeContent'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import LeagueCard from '@/components/league/LeagueCard'
import { TennisPreloaderFullScreen } from '@/components/ui/TennisPreloader'

export default function LeaguesPageContent({ locale: propLocale }) {
  const params = useParams()
  // Use prop locale first, fallback to params, then default
  const locale = propLocale || params?.locale || 'es'
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const t = homeContent[locale] || homeContent['es']
  const content = multiLeagueHomeContent[locale] || multiLeagueHomeContent['es']

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      console.log('🔄 Leagues page: Fetching leagues from API...');
      const response = await fetch('/api/leagues')
      const data = await response.json()
      
      console.log('📊 Leagues page API response:', data);
      
      if (response.ok && data.success) {
        console.log('✅ Leagues page: API success, using real database data');
        setLeagues(data.leagues || [])
        setError(null)
      } else {
        console.error('❌ Leagues page: API failed', data);
        setError(data.message || 'Failed to load leagues')
        setLeagues([])
      }
    } catch (err) {
      console.error('❌ Leagues page: Network error fetching leagues:', err)
      setError(err.message)
      setLeagues([])
    } finally {
      setLoading(false)
    }
  }

  // Organize leagues by status
  const activeLeagues = leagues.filter(league => league.status === 'active')
  const comingSoonLeagues = leagues.filter(league => league.status === 'coming_soon')
  const inactiveLeagues = leagues.filter(league => league.status === 'inactive')

  console.log('League counts:', {
    total: leagues.length,
    active: activeLeagues.length,
    comingSoon: comingSoonLeagues.length,
    inactive: inactiveLeagues.length
  })

  // 🎾 Use standardized TennisPreloader for loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation locale={locale} />
        <TennisPreloaderFullScreen 
          text={locale === 'es' ? 'Cargando ligas...' : 'Loading leagues...'} 
          locale={locale} 
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
      <Navigation locale={locale} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="text-5xl font-light text-parque-purple mb-4">
              {locale === 'es' ? 'Ligas de Tenis' : 'Tennis Leagues'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'es' 
                ? 'Encuentra tu liga perfecta y compite con jugadores de tu nivel en un ambiente divertido y competitivo.'
                : 'Find your perfect league and compete with players at your level in a fun and competitive environment.'}
            </p>
          </div>

          {/* Stats Section */}
          {leagues.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-parque-purple">{leagues.length}</div>
                <div className="text-gray-600">
                  {locale === 'es' ? 'Ligas' : 'Leagues'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-parque-green">
                  {leagues.reduce((sum, league) => sum + (league.playerCount || 0), 0)}
                </div>
                <div className="text-gray-600">
                  {locale === 'es' ? 'Jugadores' : 'Players'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">
                  {activeLeagues.length}
                </div>
                <div className="text-gray-600">
                  {locale === 'es' ? 'Ligas Activas' : 'Active Leagues'}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leagues Grid */}
      <section className="container mx-auto px-4 pb-16">
        {error ? (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {locale === 'es' ? 'Error cargando ligas' : 'Error loading leagues'}
            </h2>
            <p className="text-gray-600 mb-8">
              {error}
            </p>
            <button 
              onClick={fetchLeagues}
              className="bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
            >
              {locale === 'es' ? 'Reintentar' : 'Retry'}
            </button>
          </div>
        ) : leagues.length > 0 ? (
          <div className="space-y-12">
            {/* Active Leagues */}
            {activeLeagues.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {locale === 'es' ? 'Ligas Activas' : 'Active Leagues'}
                </h2>
                <div className="flex flex-wrap justify-center gap-8">
                  {activeLeagues.map((league) => (
                    <LeagueCard
                      key={league._id}
                      league={league}
                      content={content}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Coming Soon Leagues */}
            {comingSoonLeagues.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
                </h2>
                <div className="flex flex-wrap justify-center gap-8">
                  {comingSoonLeagues.map((league) => (
                    <LeagueCard
                      key={league._id}
                      league={league}
                      content={content}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Leagues */}
            {inactiveLeagues.length > 0 && (
              <div className="opacity-60">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {locale === 'es' ? 'Ligas Anteriores' : 'Past Leagues'}
                </h2>
                <div className="flex flex-wrap justify-center gap-8">
                  {inactiveLeagues.map((league) => (
                    <LeagueCard
                      key={league._id}
                      league={league}
                      content={content}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🎾</div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {locale === 'es' ? 'No hay ligas disponibles' : 'No leagues available'}
            </h2>
            <p className="text-gray-600 mb-8">
              {locale === 'es' 
                ? 'Actualmente no hay ligas en la base de datos. Estamos trabajando para agregar más.'
                : 'There are currently no leagues in the database. We are working to add more.'}
            </p>
            <a 
              href={`/${locale}`}
              className="inline-block bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
            >
              {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
            </a>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'es' 
              ? '¿No encuentras una liga en tu ciudad?'
              : "Can't find a league in your city?"}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Únete a nuestra lista de espera y te avisaremos cuando lancemos una liga cerca de ti.'
              : "Join our waiting list and we'll notify you when we launch a league near you."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}`}
              className="inline-block px-8 py-3 bg-white text-parque-purple rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {locale === 'es' ? 'Unirse a Lista de Espera' : 'Join Waiting List'}
            </a>
            <a
              href={`/${locale}/${locale === 'es' ? 'clubes' : 'clubs'}`}
              className="inline-block px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-parque-purple transition-colors"
            >
              {locale === 'es' ? 'Explorar Clubes' : 'Explore Clubs'}
            </a>
          </div>
        </div>
      </section>

      <Footer content={t.footer} />
    </div>
  )
}
