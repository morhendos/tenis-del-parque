'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import CityCard from '@/components/cities/CityCard'
import { homeContent } from '@/lib/content/homeContent'

export default function ClubsPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const t = homeContent[locale] || homeContent['es']

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
          },
          {
            _id: 'demo-malaga',
            slug: 'malaga',
            name: { es: 'Málaga', en: 'Málaga' },
            province: 'Málaga',
            clubCount: 20,
            leagueCount: 0,
            coordinates: { lat: 36.7213, lng: -4.4214 },
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

  // Organize cities by club availability
  const citiesWithClubs = cities.filter(city => city.clubCount > 0)
  const citiesComingSoon = cities.filter(city => city.clubCount === 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation locale={locale} />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {locale === 'es' ? 'Cargando clubes...' : 'Loading clubs...'}
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
            <div className="text-6xl mb-6">🎾</div>
            <h1 className="text-5xl font-light text-parque-purple mb-4">
              {locale === 'es' ? 'Clubes de Tenis' : 'Tennis Clubs'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'es' 
                ? 'Descubre los mejores clubes de tenis en España. Encuentra instalaciones increíbles y únete a una comunidad apasionada.'
                : 'Discover the best tennis clubs in Spain. Find incredible facilities and join a passionate community.'}
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
            {/* Cities with Clubs */}
            {citiesWithClubs.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {locale === 'es' ? '🏟️ Ciudades con Clubes' : '🏟️ Cities with Clubs'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {citiesWithClubs.map((city) => (
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
                    ? 'Estas ciudades tendrán clubes de tenis registrados muy pronto. ¡Mantente atento!'
                    : 'These cities will have tennis clubs registered very soon. Stay tuned!'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {citiesComingSoon.map((city) => (
                    <CityCard
                      key={city._id}
                      city={city}
                      leagueCount={city.leagueCount}
                      className="w-full opacity-75"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🏗️</div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {locale === 'es' ? 'Construyendo el Directorio' : 'Building the Directory'}
            </h2>
            <p className="text-gray-600 mb-8">
              {locale === 'es' 
                ? 'Estamos creando el directorio más completo de clubes de tenis en España. ¡Pronto tendrás acceso a cientos de clubes!'
                : 'We are creating the most complete tennis club directory in Spain. Soon you will have access to hundreds of clubs!'}
            </p>
            <a 
              href={`/${locale}/ligas`}
              className="inline-block bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
            >
              {locale === 'es' ? 'Ver Ligas Disponibles' : 'View Available Leagues'}
            </a>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'es'
                ? '¿Por Qué Usar Nuestro Directorio?'
                : 'Why Use Our Directory?'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'es' ? 'Información Completa' : 'Complete Information'}
              </h3>
              <p className="text-gray-600">
                {locale === 'es'
                  ? 'Detalles sobre pistas, precios, servicios y horarios de cada club.'
                  : 'Details about courts, prices, services and opening hours for each club.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'es' ? 'Encuentra Tu Liga' : 'Find Your League'}
              </h3>
              <p className="text-gray-600">
                {locale === 'es'
                  ? 'Conecta con jugadores de tu nivel y únete a nuestras ligas amateur.'
                  : 'Connect with players at your level and join our amateur leagues.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'es' ? 'Fotos de Google Maps' : 'Google Maps Photos'}
              </h3>
              <p className="text-gray-600">
                {locale === 'es'
                  ? 'Imágenes reales de ciudades directamente desde Google Maps.'
                  : 'Real city images directly from Google Maps.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'es' ? 'Comunidad Activa' : 'Active Community'}
              </h3>
              <p className="text-gray-600">
                {locale === 'es'
                  ? 'Lee opiniones y consejos de otros jugadores de tenis.'
                  : 'Read reviews and tips from other tennis players.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'es' 
              ? '¿Listo para Jugar?'
              : 'Ready to Play?'}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Encuentra tu club ideal y únete a nuestras ligas de tenis amateur en toda España.'
              : 'Find your ideal club and join our amateur tennis leagues across Spain.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}/ligas`}
              className="inline-block px-8 py-3 bg-white text-parque-purple rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {locale === 'es' ? 'Ver Ligas' : 'View Leagues'}
            </a>
            <a
              href={`/${locale}`}
              className="inline-block px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-parque-purple transition-colors"
            >
              {locale === 'es' ? 'Unirse a Lista de Espera' : 'Join Waiting List'}
            </a>
          </div>
        </div>
      </section>

      <Footer content={t.footer} />
    </div>
  )
}
