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

  // Only show cities with clubs
  const citiesWithClubs = filteredCities.filter(city => city.clubCount > 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation locale={locale} />
      
      {/* Simplified Hero Section */}
      <section className="relative bg-gradient-to-br from-parque-purple to-parque-green text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'es' ? 'Encuentra tu Club de Tenis' : 'Find Your Tennis Club'}
            </h1>
            <p className="text-lg text-white/90 mb-8">
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
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all text-lg"
                />
                <svg className="absolute left-4 top-3.5 h-6 w-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-3.5 text-white/70 hover:text-white"
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

      {/* Popular Areas Section - Only show if there are areas with clubs */}
      {areaStats.topAreas.length > 0 && !searchTerm && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {locale === 'es' ? 'Áreas Populares' : 'Popular Areas'}
              </h2>
              <p className="text-gray-600">
                {locale === 'es' ? 'Explora clubes por zonas específicas' : 'Explore clubs by specific areas'}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {areaStats.topAreas.slice(0, 8).map((area) => (
                <a
                  key={`${area.city}-${area.area}`}
                  href={`/${locale}/clubs/${area.city}/area/${area.area}`}
                  className="group inline-flex items-center gap-2 bg-gray-50 hover:bg-parque-purple hover:text-white px-4 py-2 rounded-full transition-all border border-gray-200 hover:border-parque-purple"
                >
                  <span className="font-medium">{area.displayName}</span>
                  <span className="text-sm opacity-75">({area.count})</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

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
            ) : (
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
                  href={`/${locale}/ligas`}
                  className="inline-block bg-parque-purple text-white px-6 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
                >
                  {locale === 'es' ? 'Ver Ligas Disponibles' : 'View Available Leagues'}
                </a>
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
              href={`/${locale}/ligas`}
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
