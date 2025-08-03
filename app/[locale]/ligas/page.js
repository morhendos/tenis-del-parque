'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { homeContent } from '@/lib/content/homeContent'
import { multiLeagueHomeContent } from '@/lib/content/multiLeagueHomeContent'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import CityCard from '@/components/cities/CityCard'

export default function LeaguesPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const t = homeContent[locale] || homeContent['es']
  const content = multiLeagueHomeContent[locale] || multiLeagueHomeContent['es']

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cities')
      if (response.ok) {
        const data = await response.json()
        setCities(data.cities || [])
      } else {
        // If API fails, show demo cities
        setCities([
          {
            _id: 'demo-sotogrande',
            slug: 'sotogrande',
            name: { es: 'Sotogrande', en: 'Sotogrande' },
            province: 'Cádiz',
            clubCount: 5,
            leagueCount: 1,
            coordinates: { lat: 36.2847, lng: -5.2558 },
            images: { main: '', googlePhotoReference: null },
            hasCoordinates: true,
            hasImages: false
          },
          {
            _id: 'demo-marbella',
            slug: 'marbella',
            name: { es: 'Marbella', en: 'Marbella' },
            province: 'Málaga',
            clubCount: 12,
            leagueCount: 0,
            coordinates: { lat: 36.5101, lng: -4.8824 },
            images: { main: '', googlePhotoReference: null },
            hasCoordinates: true,
            hasImages: false
          }
        ])
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Organize cities by league availability
  const citiesWithLeagues = cities.filter(city => city.leagueCount > 0)
  const citiesComingSoon = cities.filter(city => city.leagueCount === 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation locale={locale} />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {locale === 'es' ? 'Cargando ciudades...' : 'Loading cities...'}
          </p>
        </div>
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
            <div className="text-6xl mb-6">🏙️</div>
            <h1 className="text-5xl font-light text-parque-purple mb-4">
              {locale === 'es' ? 'Ciudades con Tenis' : 'Tennis Cities'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'es' 
                ? 'Descubre las mejores ciudades para jugar al tenis. Ligas amateur, clubes increíbles y una comunidad apasionada te esperan.'
                : 'Discover the best cities to play tennis. Amateur leagues, incredible clubs and a passionate community await you.'}
            </p>
          </div>

          {/* Stats Section */}
          {cities.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-parque-purple">{cities.length}</div>
                <div className="text-gray-600">
                  {locale === 'es' ? 'Ciudades' : 'Cities'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-parque-green">
                  {cities.reduce((sum, city) => sum + (city.clubCount || 0), 0)}
                </div>
                <div className="text-gray-600">
                  {locale === 'es' ? 'Clubes' : 'Clubs'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">
                  {cities.reduce((sum, city) => sum + (city.leagueCount || 0), 0)}
                </div>
                <div className="text-gray-600">
                  {locale === 'es' ? 'Ligas Activas' : 'Active Leagues'}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cities Grid */}
      <section className="container mx-auto px-4 pb-16">
        {cities.length > 0 ? (
          <div className="space-y-16">
            {/* Cities with Active Leagues */}
            {citiesWithLeagues.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {locale === 'es' ? '🏆 Ligas Activas' : '🏆 Active Leagues'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {citiesWithLeagues.map((city) => (
                    <CityCard
                      key={city._id}
                      city={city}
                      leagueCount={city.leagueCount}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cities Coming Soon */}
            {citiesComingSoon.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {locale === 'es' ? '🚀 Próximamente' : '🚀 Coming Soon'}
                </h2>
                <p className="text-center text-gray-600 mb-8">
                  {locale === 'es' 
                    ? 'Estas ciudades tendrán ligas de tenis muy pronto. ¡Mantente atento!'
                    : 'These cities will have tennis leagues very soon. Stay tuned!'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {citiesComingSoon.map((city) => (
                    <CityCard
                      key={city._id}
                      city={city}
                      leagueCount={city.leagueCount}
                      className="w-full"
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
              {locale === 'es' ? 'Expandiendo por España' : 'Expanding across Spain'}
            </h2>
            <p className="text-gray-600 mb-8">
              {locale === 'es' 
                ? 'Estamos trabajando para traerte tenis amateur a más ciudades españolas. ¡La revolución del tenis está en camino!'
                : 'We are working to bring you amateur tennis to more Spanish cities. The tennis revolution is on its way!'}
            </p>
            <a 
              href={`/${locale}/sotogrande`}
              className="inline-block bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
            >
              {locale === 'es' ? 'Ver Liga Disponible' : 'View Available League'}
            </a>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'es' 
              ? '¿Tu ciudad no está en la lista?'
              : "Your city isn't on the list?"}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Únete a nuestra lista de espera y te avisaremos cuando lancemos una liga en tu ciudad. ¡Cuantos más seamos, antes llegamos!'
              : 'Join our waiting list and we\\'ll notify you when we launch a league in your city. The more we are, the sooner we arrive!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}`}
              className="inline-block px-8 py-3 bg-white text-parque-purple rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {locale === 'es' ? 'Unirse a Lista de Espera' : 'Join Waiting List'}
            </a>
            <a
              href={`/${locale}/clubs`}
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
