'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import CityCard from '@/components/cities/CityCard'
import { homeContent } from '@/lib/content/homeContent'
import { 
  CITY_AREAS_MAPPING, 
  AREA_DISPLAY_NAMES, 
  CITY_DISPLAY_NAMES,
  getAreasForCity
} from '@/lib/utils/areaMapping'

export default function ClubsPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [cities, setCities] = useState([])
  const [clubs, setClubs] = useState([]) // For area stats
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAreaDetails, setShowAreaDetails] = useState(false)
  
  const t = homeContent[locale] || homeContent['es']

  useEffect(() => {
    fetchCities()
    fetchClubs() // Fetch clubs for area statistics
  }, [])

  const fetchCities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cities')
      if (response.ok) {
        const data = await response.json()
        setCities(data.cities || [])
      } else {
        // Enhanced demo cities with area context
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
            hasImages: false,
            hasAreas: true,
            areaCount: 4
          },
          {
            _id: 'demo-marbella',
            slug: 'marbella',
            name: { es: 'Marbella', en: 'Marbella' },
            province: 'Málaga',
            clubCount: 15,
            leagueCount: 0,
            coordinates: { lat: 36.5101, lng: -4.8824 },
            images: { main: '', googlePhotoReference: null },
            hasCoordinates: true,
            hasImages: false,
            hasAreas: true,
            areaCount: 13
          },
          {
            _id: 'demo-estepona',
            slug: 'estepona',
            name: { es: 'Estepona', en: 'Estepona' },
            province: 'Málaga',
            clubCount: 8,
            leagueCount: 0,
            coordinates: { lat: 36.4285, lng: -5.1450 },
            images: { main: '', googlePhotoReference: null },
            hasCoordinates: true,
            hasImages: false,
            hasAreas: true,
            areaCount: 6
          },
          {
            _id: 'demo-malaga',
            slug: 'malaga',
            name: { es: 'Málaga', en: 'Málaga' },
            province: 'Málaga',
            clubCount: 12,
            leagueCount: 0,
            coordinates: { lat: 36.7213, lng: -4.4214 },
            images: { main: '', googlePhotoReference: null },
            hasCoordinates: true,
            hasImages: false,
            hasAreas: true,
            areaCount: 8
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

  // Fetch clubs for area statistics
  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs?limit=1000') // Get all clubs for stats
      if (response.ok) {
        const data = await response.json()
        setClubs(data.clubs || [])
      }
    } catch (error) {
      console.error('Error fetching clubs for stats:', error)
    }
  }

  // Calculate area statistics
  const getAreaStatistics = () => {
    const stats = {
      totalAreas: 0,
      areasWithClubs: 0,
      citiesWithAreas: 0,
      topAreas: []
    }

    Object.entries(CITY_AREAS_MAPPING).forEach(([city, areas]) => {
      stats.totalAreas += areas.length
      stats.citiesWithAreas++
      
      areas.forEach(area => {
        const areaClubs = clubs.filter(club => 
          club.location?.city === city && club.location?.area === area
        )
        
        if (areaClubs.length > 0) {
          stats.areasWithClubs++
          stats.topAreas.push({
            area,
            city,
            count: areaClubs.length,
            displayName: AREA_DISPLAY_NAMES[area] || area,
            cityDisplayName: CITY_DISPLAY_NAMES[city] || city
          })
        }
      })
    })

    // Sort top areas by club count
    stats.topAreas.sort((a, b) => b.count - a.count)
    
    return stats
  }

  const areaStats = getAreaStatistics()

  // Enhanced search with area awareness
  const filteredCities = cities.filter(city => {
    if (!searchTerm.trim()) return true
    
    const search = searchTerm.toLowerCase()
    const cityMatches = 
      city.name.es.toLowerCase().includes(search) ||
      city.name.en.toLowerCase().includes(search) ||
      city.slug.toLowerCase().includes(search) ||
      city.province.toLowerCase().includes(search)
    
    // Also check if any areas in this city match the search
    const cityAreas = getAreasForCity(city.slug)
    const areaMatches = cityAreas.some(area => 
      (AREA_DISPLAY_NAMES[area] || area).toLowerCase().includes(search)
    )
    
    return cityMatches || areaMatches
  })

  // Organize cities by club availability
  const citiesWithClubs = filteredCities.filter(city => city.clubCount > 0)
  const citiesComingSoon = filteredCities.filter(city => city.clubCount === 0)

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
      
      {/* Enhanced Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🎾</div>
            <h1 className="text-5xl font-light text-parque-purple mb-4">
              {locale === 'es' ? 'Clubes de Tenis' : 'Tennis Clubs'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              {locale === 'es' 
                ? 'Descubre los mejores clubes de tenis en España organizados por ciudades y áreas. Encuentra instalaciones increíbles y únete a una comunidad apasionada.'
                : 'Discover the best tennis clubs in Spain organized by cities and areas. Find incredible facilities and join a passionate community.'}
            </p>

            {/* Enhanced Search with Area Context */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder={locale === 'es' ? 'Buscar ciudades o áreas...' : 'Search cities or areas...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent text-lg"
                />
                <svg className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Area Highlights Section */}
          {areaStats.topAreas.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setShowAreaDetails(!showAreaDetails)}
                className="mb-6 flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <span>
                  {locale === 'es' ? 'Áreas Destacadas' : 'Featured Areas'}
                </span>
                <svg className={`w-4 h-4 transition-transform ${showAreaDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAreaDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {areaStats.topAreas.slice(0, 6).map((area, index) => (
                    <div key={`${area.city}-${area.area}`} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{area.displayName}</h4>
                        <span className="bg-parque-purple text-white px-2 py-1 rounded-full text-sm">
                          {area.count} {locale === 'es' ? 'clubs' : 'clubs'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {area.cityDisplayName.charAt(0).toUpperCase() + area.cityDisplayName.slice(1)}, España
                      </p>
                      <a
                        href={`/${locale}/clubs/${area.city}/area/${area.area}`}
                        className="text-parque-purple hover:underline text-sm font-medium"
                      >
                        {locale === 'es' ? 'Ver clubs en la zona →' : 'View clubs in area →'}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cities Grid */}
      <section className="container mx-auto px-4 pb-16">
        {filteredCities.length > 0 ? (
          <div className="space-y-16">
            {/* Cities Grid - No header needed */}
            {citiesWithClubs.length > 0 && (
              <div>
                {searchTerm && (
                  <p className="text-center text-gray-600 mb-6">
                    {locale === 'es' 
                      ? `Mostrando ${citiesWithClubs.length} ciudades que coinciden con "${searchTerm}"`
                      : `Showing ${citiesWithClubs.length} cities matching "${searchTerm}"`}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {citiesWithClubs.map((city) => (
                    <CityCard
                      key={city._id}
                      city={city}
                      leagueCount={city.leagueCount}
                      className="w-full"
                      showAreaInfo={true}
                      areaCount={getAreasForCity(city.slug).length}
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
                      showAreaInfo={true}
                      areaCount={getAreasForCity(city.slug).length}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
                    ? `No encontramos ciudades o áreas que coincidan con "${searchTerm}". Intenta con otros términos.`
                    : `We couldn't find cities or areas matching "${searchTerm}". Try different terms.`}
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-block bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
                >
                  {locale === 'es' ? 'Ver Todas las Ciudades' : 'View All Cities'}
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">🏗️</div>
                <h2 className="text-3xl font-light text-gray-900 mb-4">
                  {locale === 'es' ? 'Construyendo el Directorio' : 'Building the Directory'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {locale === 'es' 
                    ? 'Estamos creando el directorio más completo de clubes de tenis en España por ciudades y áreas. ¡Pronto tendrás acceso a cientos de clubes!'
                    : 'We are creating the most complete tennis club directory in Spain by cities and areas. Soon you will have access to hundreds of clubs!'}
                </p>
                <a 
                  href={`/${locale}/ligas`}
                  className="inline-block bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
                >
                  {locale === 'es' ? 'Ver Ligas Disponibles' : 'View Available Leagues'}
                </a>
              </>
            )}
          </div>
        )}
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
              ? 'Encuentra tu club ideal por área y únete a nuestras ligas de tenis amateur organizadas geográficamente en toda España.'
              : 'Find your ideal club by area and join our geographically organized amateur tennis leagues across Spain.'}
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
