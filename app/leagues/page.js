'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../../lib/hooks/useLanguage'
import { homeContent } from '../../lib/content/homeContent'
import Navigation from '../../components/common/Navigation'
import Footer from '../../components/common/Footer'

export default function LeaguesPage() {
  const { language, setLanguage } = useLanguage()
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const t = homeContent[language]

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/leagues')
      if (response.ok) {
        const data = await response.json()
        setLeagues(data.leagues || [])
      } else {
        // If admin API fails, show demo leagues
        setLeagues([
          {
            _id: 'demo-sotogrande',
            name: 'Liga de Sotogrande',
            slug: 'sotogrande',
            location: {
              city: 'Sotogrande',
              region: 'Andalucía',
              country: 'España'
            },
            description: {
              es: 'La primera liga amateur de tenis en Sotogrande. Sistema suizo, rankings ELO y ambiente competitivo pero relajado.',
              en: 'The first amateur tennis league in Sotogrande. Swiss system, ELO rankings and competitive but relaxed atmosphere.'
            },
                         seasons: [
               {
                 name: 'Verano 2025',
                 status: 'active',
                 startDate: '2025-07-07',
                 price: { isFree: true }
               }
             ],
            playerCount: 12,
            status: 'active'
          }
        ])
      }
    } catch (err) {
      console.error('Error fetching leagues:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSeasonUrl = (league, season) => {
    // Convert Spanish season names to URL slugs
    const seasonSlug = season.name.toLowerCase()
      .replace(/\s+/g, '') // Remove spaces: "Verano 2025" -> "verano2025"
    return `/${league.slug}/liga/${seasonSlug}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'registration_open': return 'bg-blue-100 text-blue-800'
      case 'upcoming': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      es: {
        active: '🎾 Liga Activa',
        registration_open: '✅ Inscripciones Abiertas',
        upcoming: '⏳ Próximamente',
        completed: '🏁 Finalizada'
      },
      en: {
        active: '🎾 League Active',
        registration_open: '✅ Registration Open',
        upcoming: '⏳ Coming Soon',
        completed: '🏁 Completed'
      }
    }
    return statusMap[language][status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation currentPage="leagues" language={language} onLanguageChange={setLanguage} />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'es' ? 'Cargando ligas...' : 'Loading leagues...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
      <Navigation currentPage="leagues" language={language} onLanguageChange={setLanguage} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="text-5xl font-light text-parque-purple mb-4">
              {language === 'es' ? 'Ligas de Tenis' : 'Tennis Leagues'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'es' 
                ? 'Encuentra tu liga perfecta y compite con jugadores de tu nivel en un ambiente divertido y competitivo.'
                : 'Find your perfect league and compete with players at your level in a fun and competitive environment.'}
            </p>
          </div>
        </div>
      </section>

      {/* Leagues Grid */}
      <section className="container mx-auto px-4 pb-16">
        {leagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {leagues.map((league) => (
              <div key={league._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* League Header */}
                <div className="bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white p-6">
                  <h3 className="text-2xl font-bold mb-2">{league.name}</h3>
                  <div className="flex items-center space-x-2 text-sm opacity-90">
                    <span>📍</span>
                    <span>{league.location?.city}, {league.location?.region}</span>
                  </div>
                </div>

                {/* League Info */}
                <div className="p-6">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {league.description?.[language] || league.description?.es || 
                     'Liga amateur de tenis con sistema suizo y rankings ELO'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-parque-purple">
                        {league.playerCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        {language === 'es' ? 'Jugadores' : 'Players'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-parque-purple">
                        {league.seasons?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        {language === 'es' ? 'Temporadas' : 'Seasons'}
                      </div>
                    </div>
                  </div>

                  {/* Active Seasons */}
                  {league.seasons && league.seasons.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">
                        {language === 'es' ? 'Temporadas' : 'Seasons'}
                      </h4>
                      {league.seasons.map((season, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">{season.name}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(season.status)}`}>
                              {getStatusText(season.status)}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            {season.startDate && (
                              <div className="flex items-center space-x-2">
                                <span>📅</span>
                                <span>
                                  {language === 'es' ? 'Inicio:' : 'Start:'} {' '}
                                  {new Date(season.startDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                                </span>
                              </div>
                            )}
                            {season.price && (
                              <div className="flex items-center space-x-2">
                                <span>💰</span>
                                <span>
                                  {season.price.isFree 
                                    ? (language === 'es' ? 'Gratis' : 'Free')
                                    : `${season.price.amount || 0}${season.price.currency || 'EUR'}`
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Season Action Button */}
                          <div className="mt-4">
                            <a
                              href={getSeasonUrl(league, season)}
                              className="block w-full bg-parque-purple text-white text-center py-2 px-4 rounded-lg hover:bg-parque-purple/90 transition-colors font-medium"
                            >
                              {language === 'es' ? 'Ver Liga' : 'View League'}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🎾</div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {language === 'es' ? 'Próximamente más ligas' : 'More leagues coming soon'}
            </h2>
            <p className="text-gray-600 mb-8">
              {language === 'es' 
                ? 'Estamos trabajando para traerte más ligas en diferentes ubicaciones. ¡Mantente atento!'
                : 'We are working to bring you more leagues in different locations. Stay tuned!'}
            </p>
            <a 
              href="/sotogrande"
              className="inline-block bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
            >
              {language === 'es' ? 'Ver Liga Disponible' : 'View Available League'}
            </a>
          </div>
        )}
      </section>

      <Footer content={t.footer} />
    </div>
  )
} 