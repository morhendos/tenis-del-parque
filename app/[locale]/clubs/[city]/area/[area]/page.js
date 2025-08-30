'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import ClubCard from '@/components/clubs/ClubCard'
import { homeContent } from '@/lib/content/homeContent'
import { 
  AREA_DISPLAY_NAMES, 
  CITY_DISPLAY_NAMES,
  getAreasForCitySync
} from '@/lib/utils/geographicBoundaries'

export default function AreaClubsPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const city = params.city
  const area = params.area
  
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const t = homeContent[locale] || homeContent['es']

  // Area-specific content and SEO information
  const areaInfo = {
    'el-paraiso': {
      name: { es: 'El Paraíso', en: 'El Paraíso' },
      description: {
        es: 'El Paraíso es una exclusiva zona residencial en la Costa del Sol, conocida por sus lujosos clubs de tenis y campos de golf. Esta área ofrece instalaciones deportivas de primer nivel en un entorno natural privilegiado, siendo el destino perfecto para los amantes del tenis que buscan calidad y distinción.',
        en: 'El Paraíso is an exclusive residential area on the Costa del Sol, known for its luxury tennis clubs and golf courses. This area offers top-level sports facilities in a privileged natural environment, being the perfect destination for tennis lovers seeking quality and distinction.'
      },
      highlights: {
        es: ['Clubs de lujo con instalaciones premium', 'Entorno natural privilegiado', 'Cerca de Marbella y Estepona', 'Ambiente exclusivo y tranquilo'],
        en: ['Luxury clubs with premium facilities', 'Privileged natural environment', 'Close to Marbella and Estepona', 'Exclusive and tranquil atmosphere']
      }
    },
    'nueva-andalucia': {
      name: { es: 'Nueva Andalucía', en: 'Nueva Andalucía' },
      description: {
        es: 'Nueva Andalucía, conocida como el "Valle del Golf", es una de las zonas más prestigiosas de Marbella. Sus clubs de tenis combinan tradición y modernidad, ofreciendo instalaciones de élite en un ambiente cosmopolita y vibrante.',
        en: 'Nueva Andalucía, known as the "Golf Valley", is one of the most prestigious areas of Marbella. Its tennis clubs combine tradition and modernity, offering elite facilities in a cosmopolitan and vibrant atmosphere.'
      },
      highlights: {
        es: ['Zona prestigiosa de Marbella', 'Ambiente cosmopolita internacional', 'Clubs con historia y tradición', 'Cerca de Puerto Banús'],
        en: ['Prestigious Marbella area', 'International cosmopolitan atmosphere', 'Clubs with history and tradition', 'Close to Puerto Banús']
      }
    },
    'san-pedro-de-alcantara': {
      name: { es: 'San Pedro de Alcántara', en: 'San Pedro de Alcántara' },
      description: {
        es: 'San Pedro de Alcántara ofrece una experiencia de tenis más auténtica y local, con clubs que mantienen el espíritu tradicional del tenis español. Esta zona combina la cercanía a Marbella con un ambiente más relajado y familiar.',
        en: 'San Pedro de Alcántara offers a more authentic and local tennis experience, with clubs that maintain the traditional spirit of Spanish tennis. This area combines proximity to Marbella with a more relaxed and familiar atmosphere.'
      },
      highlights: {
        es: ['Ambiente local auténtico', 'Clubs tradicionales españoles', 'Cerca del centro de Marbella', 'Precios más accesibles'],
        en: ['Authentic local atmosphere', 'Traditional Spanish clubs', 'Close to Marbella center', 'More accessible prices']
      }
    },
    'puerto-banus': {
      name: { es: 'Puerto Banús', en: 'Puerto Banús' },
      description: {
        es: 'Puerto Banús es sinónimo de lujo y glamour en la Costa del Sol. Los clubs de tenis en esta área ofrecen una experiencia premium con las mejores instalaciones y servicios, frecuentados por celebridades y deportistas de élite.',
        en: 'Puerto Banús is synonymous with luxury and glamour on the Costa del Sol. Tennis clubs in this area offer a premium experience with the best facilities and services, frequented by celebrities and elite athletes.'
      },
      highlights: {
        es: ['Lujo y glamour internacional', 'Instalaciones premium', 'Frecuentado por celebridades', 'Ambiente exclusivo único'],
        en: ['International luxury and glamour', 'Premium facilities', 'Frequented by celebrities', 'Unique exclusive atmosphere']
      }
    }
    // Add more areas as needed
  }

  const currentArea = areaInfo[area] || {
    name: { es: AREA_DISPLAY_NAMES[area] || area, en: AREA_DISPLAY_NAMES[area] || area },
    description: {
      es: `Descubre los mejores clubs de tenis en ${AREA_DISPLAY_NAMES[area] || area}, una zona destacada de ${CITY_DISPLAY_NAMES[city] || city}.`,
      en: `Discover the best tennis clubs in ${AREA_DISPLAY_NAMES[area] || area}, a standout area of ${CITY_DISPLAY_NAMES[city] || city}.`
    },
    highlights: {
      es: ['Clubs de calidad', 'Instalaciones modernas', 'Ambiente profesional'],
      en: ['Quality clubs', 'Modern facilities', 'Professional atmosphere']
    }
  }

  const cityName = CITY_DISPLAY_NAMES[city] || city
  const areaName = currentArea.name[locale]

  useEffect(() => {
    fetchAreaClubs()
  }, [city, area])

  const fetchAreaClubs = async () => {
    try {
      setLoading(true)
      // Fetch clubs for the specific area
      const params = new URLSearchParams({ city, area })
      const response = await fetch(`/api/clubs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setClubs(data.clubs || [])
      }
    } catch (error) {
      console.error('Error fetching area clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter clubs by search term
  const filteredClubs = clubs.filter(club => {
    if (!searchTerm.trim()) return true
    const search = searchTerm.toLowerCase()
    return (
      club.name.toLowerCase().includes(search) ||
      club.description?.es?.toLowerCase().includes(search) ||
      club.description?.en?.toLowerCase().includes(search) ||
      club.location?.address?.toLowerCase().includes(search)
    )
  })

  // Get other areas in the same city for navigation
  const otherAreas = getAreasForCitySync(city).filter(a => a !== area)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation locale={locale} />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {locale === 'es' ? 'Cargando clubs...' : 'Loading clubs...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation locale={locale} />
      
      {/* SEO-Optimized Hero Section */}
      <section className="relative pt-32 pb-12 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto">
          <div className="max-w-4xl">
            {/* Enhanced Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm mb-6 text-white/80">
              <Link href={`/${locale}`} className="hover:text-white">
                {locale === 'es' ? 'Inicio' : 'Home'}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/clubs`} className="hover:text-white">
                {locale === 'es' ? 'Clubs' : 'Clubs'}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/clubs/${city}`} className="hover:text-white">
                {cityName.charAt(0).toUpperCase() + cityName.slice(1)}
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{areaName}</span>
            </nav>
            
            {/* SEO-Optimized Headlines */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {locale === 'es' 
                  ? `Clubs de Tenis en ${areaName}`
                  : `Tennis Clubs in ${areaName}`}
              </h1>
              <p className="text-xl text-white/90 mb-2">
                {locale === 'es' 
                  ? `${areaName}, ${cityName.charAt(0).toUpperCase() + cityName.slice(1)}`
                  : `${areaName}, ${cityName.charAt(0).toUpperCase() + cityName.slice(1)}`}
              </p>
              <p className="text-lg text-white/80">
                {currentArea.description[locale]}
              </p>
            </div>

            {/* Area Highlights */}
            {currentArea.highlights && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {locale === 'es' ? '¿Por qué elegir' : 'Why choose'} {areaName}?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentArea.highlights[locale].map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-yellow-300">✓</span>
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {clubs.length > 0 && (
              <div className="flex flex-wrap gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold">{clubs.length}</div>
                  <div className="text-white/80 text-sm">
                    {locale === 'es' ? 'Clubs en la zona' : 'Clubs in area'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {clubs.reduce((sum, club) => sum + (club.courts?.total || 0), 0)}
                  </div>
                  <div className="text-white/80 text-sm">
                    {locale === 'es' ? 'Pistas disponibles' : 'Courts available'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {Math.round(clubs.reduce((sum, club) => sum + (club.pricing?.courtRental?.hourly?.min || 0), 0) / clubs.length) || '–'}€
                  </div>
                  <div className="text-white/80 text-sm">
                    {locale === 'es' ? 'Precio promedio/hora' : 'Average price/hour'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search & Navigation */}
      <section className="sticky top-0 z-40 bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={locale === 'es' ? `Buscar clubs en ${areaName}...` : `Search clubs in ${areaName}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-parque-purple"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Area Navigation */}
            {otherAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 mr-2">
                  {locale === 'es' ? 'Otras áreas:' : 'Other areas:'}
                </span>
                {otherAreas.slice(0, 4).map(otherArea => (
                  <Link
                    key={otherArea}
                    href={`/${locale}/clubs/${city}/area/${otherArea}`}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {AREA_DISPLAY_NAMES[otherArea] || otherArea}
                  </Link>
                ))}
                {otherAreas.length > 4 && (
                  <Link
                    href={`/${locale}/clubs/${city}`}
                    className="px-3 py-1 text-sm text-parque-purple hover:underline"
                  >
                    +{otherAreas.length - 4} {locale === 'es' ? 'más' : 'more'}
                  </Link>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="text-sm text-gray-600">
              {filteredClubs.length} {locale === 'es' ? 'clubs encontrados' : 'clubs found'}
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Results */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          {filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <ClubCard key={club._id} club={club} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎾</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm ? (
                  locale === 'es' 
                    ? `No se encontraron clubs con "${searchTerm}"`
                    : `No clubs found with "${searchTerm}"`
                ) : (
                  locale === 'es' 
                    ? `Pronto habrá clubs en ${areaName}`
                    : `Clubs coming soon to ${areaName}`
                )}
              </h2>
              <p className="text-gray-600 mb-8">
                {searchTerm ? (
                  locale === 'es' 
                    ? 'Intenta con otros términos de búsqueda o explora las áreas cercanas.'
                    : 'Try different search terms or explore nearby areas.'
                ) : (
                  locale === 'es' 
                    ? `Estamos trabajando para traer los mejores clubs de tenis a ${areaName}. Mientras tanto, puedes explorar clubs en otras áreas de ${cityName}.`
                    : `We're working to bring the best tennis clubs to ${areaName}. Meanwhile, you can explore clubs in other areas of ${cityName}.`
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/${locale}/clubs/${city}`}
                  className="inline-block px-6 py-3 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors"
                >
                  {locale === 'es' ? `Ver todos los clubs en ${cityName}` : `See all clubs in ${cityName}`}
                </Link>
                <Link
                  href={`/${locale}/clubs`}
                  className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {locale === 'es' ? 'Explorar otras ciudades' : 'Explore other cities'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Area-Specific CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">
            {locale === 'es'
              ? `¿Quieres jugar tenis en ${areaName}?`
              : `Want to play tennis in ${areaName}?`}
          </h2>
          <p className="text-xl mb-8">
            {locale === 'es'
              ? `Únete a nuestra liga amateur y conecta con jugadores locales en ${areaName} y alrededores`
              : `Join our amateur league and connect with local players in ${areaName} and surroundings`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${city}?area=${area}`}
              className="inline-block px-8 py-4 bg-white text-parque-purple rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
            >
              {locale === 'es' ? 'Únete a la Liga' : 'Join the League'}
            </Link>
            <Link
              href={`/${locale}/clubs/${city}`}
              className="inline-block px-8 py-4 border-2 border-white text-white rounded-lg font-medium text-lg hover:bg-white hover:text-parque-purple transition-colors"
            >
              {locale === 'es' ? `Ver más clubs en ${cityName}` : `See more clubs in ${cityName}`}
            </Link>
          </div>
        </div>
      </section>

      <Footer content={t.footer} />
    </div>
  )
}
