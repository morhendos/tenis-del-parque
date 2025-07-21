'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { homeContent } from '@/lib/content/homeContent'
import { i18n } from '@/lib/i18n/config'

export default function ClubsPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [clubs, setClubs] = useState([])
  const [cityStats, setCityStats] = useState({})
  const [loading, setLoading] = useState(true)
  
  const t = homeContent[locale] || homeContent['es']

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs')
      if (response.ok) {
        const data = await response.json()
        setClubs(data.clubs || [])
        setCityStats(data.cityStats || {})
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  const cities = [
    {
      id: 'malaga',
      name: 'Málaga',
      description: locale === 'es' 
        ? 'La capital de la Costa del Sol con más de 30 clubs de tenis'
        : 'The capital of Costa del Sol with over 30 tennis clubs',
      image: '/malaga-hero.jpg',
      count: cityStats.malaga || 0
    },
    {
      id: 'marbella',
      name: 'Marbella',
      description: locale === 'es'
        ? 'Destino de lujo con instalaciones de tenis de clase mundial'
        : 'Luxury destination with world-class tennis facilities',
      image: '/marbella-hero.jpg',
      count: cityStats.marbella || 0
    },
    {
      id: 'estepona',
      name: 'Estepona',
      description: locale === 'es'
        ? 'El jardín de la Costa del Sol con excelentes clubs de tenis'
        : 'The garden of Costa del Sol with excellent tennis clubs',
      image: '/estepona-hero.jpg',
      count: cityStats.estepona || 0
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation locale={locale} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-parque-purple mb-6">
            {locale === 'es' 
              ? 'Directorio de Clubs de Tenis'
              : 'Tennis Clubs Directory'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {locale === 'es'
              ? 'Descubre los mejores clubs de tenis en la Costa del Sol. Encuentra el club perfecto para tu nivel y únete a nuestra comunidad de jugadores.'
              : 'Discover the best tennis clubs in Costa del Sol. Find the perfect club for your level and join our community of players.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-lg">
            <div className="bg-white px-6 py-3 rounded-full shadow-md">
              <span className="font-semibold text-parque-purple">
                {clubs.length}+
              </span>{' '}
              {locale === 'es' ? 'Clubs' : 'Clubs'}
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow-md">
              <span className="font-semibold text-parque-purple">3</span>{' '}
              {locale === 'es' ? 'Ciudades' : 'Cities'}
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow-md">
              <span className="font-semibold text-parque-purple">100+</span>{' '}
              {locale === 'es' ? 'Pistas' : 'Courts'}
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'es' 
                ? 'Explora por Ciudad'
                : 'Explore by City'}
            </h2>
            <p className="text-lg text-gray-600">
              {locale === 'es'
                ? 'Selecciona una ciudad para ver todos sus clubs de tenis'
                : 'Select a city to see all its tennis clubs'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/${locale}/clubs/${city.id}`}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-parque-purple to-parque-green">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-4xl font-bold text-white">{city.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{city.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-700">{city.count}</span>{' '}
                      {locale === 'es' ? 'clubs disponibles' : 'clubs available'}
                    </div>
                    <div className="text-parque-purple group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use Our Directory */}
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
                {locale === 'es' ? 'Filtros Avanzados' : 'Advanced Filters'}
              </h3>
              <p className="text-gray-600">
                {locale === 'es'
                  ? 'Busca por ubicación, tipo de pista, servicios y más.'
                  : 'Search by location, court type, services and more.'}
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
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'es'
              ? '¿Listo para Jugar?'
              : 'Ready to Play?'}
          </h2>
          <p className="text-xl mb-8">
            {locale === 'es'
              ? 'Encuentra tu club ideal y únete a nuestra liga de tenis amateur'
              : 'Find your ideal club and join our amateur tennis league'}
          </p>
          <Link
            href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/malaga`}
            className="inline-block px-8 py-4 bg-white text-parque-purple rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
          >
            {locale === 'es' ? 'Únete a la Liga' : 'Join the League'}
          </Link>
        </div>
      </section>

      <Footer content={t.footer} />
    </div>
  )
}