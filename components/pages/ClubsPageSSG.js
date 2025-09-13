'use client'

import { useState, useMemo } from 'react'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import CityCard from '@/components/cities/CityCard'
import { homeContent } from '@/lib/content/homeContent'
import { 
  AREA_DISPLAY_NAMES, 
  CITY_DISPLAY_NAMES,
  getAreasForCitySync
} from '@/lib/utils/geographicBoundaries'

export default function ClubsPageSSG({ 
  locale = 'es', 
  initialCities = [], 
  initialClubs = [], 
  total = 0, 
  corrections = 0,
  error = null 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAreaDetails, setShowAreaDetails] = useState(false)
  
  const t = homeContent[locale] || homeContent['es']

  // Enhanced search with area awareness - now using pre-fetched data
  const filteredCities = initialCities.filter(city => {
    if (!searchTerm.trim()) return true
    
    const search = searchTerm.toLowerCase()
    const cityMatches = 
      city.name.es.toLowerCase().includes(search) ||
      city.name.en.toLowerCase().includes(search) ||
      city.slug.toLowerCase().includes(search) ||
      city.province.toLowerCase().includes(search)
    
    // Also check if any areas in this city match the search
    const cityAreas = getAreasForCitySync(city.slug)
    const areaMatches = cityAreas.some(area => 
      (AREA_DISPLAY_NAMES[area] || area).toLowerCase().includes(search)
    )
    
    return cityMatches || areaMatches
  })

  // Only show cities with clubs
  const citiesWithClubs = filteredCities.filter(city => city.clubCount > 0)
  
  // Debug information - now shows SSG status
  console.log('ClubsPageSSG Debug:', {
    isSSG: true,
    citiesCount: initialCities.length,
    filteredCitiesCount: filteredCities.length,
    citiesWithClubsCount: citiesWithClubs.length,
    clubsCount: initialClubs.length,
    searchTerm,
    corrections,
    sampleCity: initialCities[0] ? {
      name: initialCities[0].name,
      clubCount: initialCities[0].clubCount
    } : null
  })

  // Show error state if data fetching failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation locale={locale} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {locale === 'es' ? 'Error de Conexión' : 'Connection Error'}
            </h2>
            <p className="text-gray-600 mb-8">
              {locale === 'es' 
                ? 'No pudimos cargar la información de las ciudades. Por favor, inténtalo de nuevo.'
                : 'We couldn\'t load city information. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-parque-purple text-white px-6 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
            >
              {locale === 'es' ? 'Reintentar' : 'Retry'}
            </button>
          </div>
        </div>
        <Footer content={t.footer} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation locale={locale} />
      
      {/* SSG Success Badge - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <div className="container mx-auto flex items-center">
            <div className="flex">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold">✅ SSG Active!</p>
                <p className="text-sm">This page is now statically generated with ISR (revalidates every hour). No client-side API calls needed!</p>
                <p className="text-xs mt-1">Cities: {initialCities.length} | Clubs: {initialClubs.length} | Corrections: {corrections}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Simplified Hero Section - More subtle background */}
      <section className="relative bg-gray-100 py-20 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 bg-parque-purple/10 rounded-full">
              <span className="text-parque-purple font-medium">
                🎾 {locale === 'es' ? 'Directorio de Clubes' : 'Club Directory'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {locale === 'es' ? 'Encuentra tu Club de Tenis' : 'Find Your Tennis Club'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {locale === 'es' 
                ? 'Descubre los mejores clubes de tenis en España. Encuentra instalaciones increíbles y únete a nuestra comunidad.'
                : 'Discover the best tennis clubs in Spain. Find incredible facilities and join our community.'}
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={locale === 'es' ? 'Buscar ciudades o áreas...' : 'Search cities or areas...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-parque-purple focus:ring-2 focus:ring-parque-purple/20 transition-all text-lg shadow-sm"
                />
                <svg className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="container mx-auto px-4 py-16">
        {citiesWithClubs.length > 0 ? (
          <>
            {searchTerm && (
              <p className="text-center text-gray-600 mb-8">
                {locale === 'es' 
                  ? `${citiesWithClubs.length} ciudades encontradas para "${searchTerm}"`
                  : `${citiesWithClubs.length} cities found for "${searchTerm}"`}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {citiesWithClubs.map((city) => (
                <CityCard
                  key={city._id}
                  city={city}
                  leagueCount={city.leagueCount}
                  className="w-full"
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 max-w-2xl mx-auto">
            {searchTerm ? (
              <>
                <div className="text-6xl mb-6">🔍</div>
                <h2 className="text-3xl font-light text-gray-900 mb-4">
                  {locale === 'es' ? 'Sin Resultados' : 'No Results'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {locale === 'es' 
                    ? `No encontramos ciudades o áreas que coincidan con "${searchTerm}".`
                    : `We couldn't find cities or areas matching "${searchTerm}".`}
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-block bg-parque-purple text-white px-6 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
                >
                  {locale === 'es' ? 'Ver Todas las Ciudades' : 'View All Cities'}
                </button>
              </>
            ) : initialCities.length === 0 ? (
              <>
                <div className="text-6xl mb-6">🏗️</div>
                <h2 className="text-3xl font-light text-gray-900 mb-4">
                  {locale === 'es' ? 'Construyendo el Directorio' : 'Building the Directory'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {locale === 'es' 
                    ? 'Estamos creando el directorio más completo de clubes de tenis en España.'
                    : 'We are creating the most complete tennis club directory in Spain.'}
                </p>
                <a 
                  href={`/${locale}/${locale === 'es' ? 'ligas' : 'leagues'}`}
                  className="inline-block bg-parque-purple text-white px-6 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
                >
                  {locale === 'es' ? 'Ver Ligas Disponibles' : 'View Available Leagues'}
                </a>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">🎾</div>
                <h2 className="text-3xl font-light text-gray-900 mb-4">
                  {locale === 'es' ? 'Ciudades en Desarrollo' : 'Cities in Development'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {locale === 'es' 
                    ? 'Tenemos ciudades registradas pero aún estamos añadiendo clubes. ¡Pronto tendrás más opciones disponibles!'
                    : 'We have cities registered but are still adding clubs. More options will be available soon!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href={`/${locale}/${locale === 'es' ? 'ligas' : 'leagues'}`}
                    className="inline-block bg-parque-purple text-white px-6 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
                  >
                    {locale === 'es' ? 'Ver Ligas Disponibles' : 'View Available Leagues'}
                  </a>
                  <a 
                    href={`/${locale}`}
                    className="inline-block border-2 border-parque-purple text-parque-purple px-6 py-3 rounded-full hover:bg-parque-purple hover:text-white transition-colors font-medium"
                  >
                    {locale === 'es' ? 'Lista de Espera' : 'Join Waiting List'}
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* CTA Section - Simplified */}
      <section className="py-16 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">
            {locale === 'es' 
              ? '¿Listo para Jugar?'
              : 'Ready to Play?'}
          </h2>
          <p className="text-lg mb-8 text-white/90">
            {locale === 'es'
              ? 'Únete a nuestras ligas de tenis amateur en toda España.'
              : 'Join our amateur tennis leagues across Spain.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}/${locale === 'es' ? 'ligas' : 'leagues'}`}
              className="inline-block px-6 py-3 bg-white text-parque-purple rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              {locale === 'es' ? 'Ver Ligas' : 'View Leagues'}
            </a>
            <a
              href={`/${locale}`}
              className="inline-block px-6 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-parque-purple transition-colors"
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
