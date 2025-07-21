'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import ClubCard from '@/components/clubs/ClubCard'
import { homeContent } from '@/lib/content/homeContent'

export default function CityClubsPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const city = params.city
  
  const [clubs, setClubs] = useState([])
  const [filteredClubs, setFilteredClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    surface: 'all',
    amenities: [],
    priceRange: 'all',
    publicAccess: 'all'
  })
  const [viewMode, setViewMode] = useState('grid') // grid or list
  
  const t = homeContent[locale] || homeContent['es']

  // City information
  const cityInfo = {
    malaga: {
      name: 'Málaga',
      description: {
        es: 'Málaga, capital de la Costa del Sol, ofrece una vibrante escena tenística con más de 30 clubs. Desde instalaciones municipales asequibles hasta clubs privados exclusivos, hay opciones para todos los niveles y presupuestos. El clima mediterráneo permite jugar al tenis durante todo el año.',
        en: 'Málaga, capital of the Costa del Sol, offers a vibrant tennis scene with over 30 clubs. From affordable municipal facilities to exclusive private clubs, there are options for all levels and budgets. The Mediterranean climate allows year-round tennis playing.'
      }
    },
    marbella: {
      name: 'Marbella',
      description: {
        es: 'Marbella es sinónimo de lujo y excelencia deportiva. Sus clubs de tenis atraen a jugadores de todo el mundo, ofreciendo instalaciones de primer nivel, academias profesionales y torneos internacionales. Un destino perfecto para combinar vacaciones y tenis.',
        en: 'Marbella is synonymous with luxury and sporting excellence. Its tennis clubs attract players from around the world, offering top-level facilities, professional academies, and international tournaments. A perfect destination to combine vacation and tennis.'
      }
    },
    estepona: {
      name: 'Estepona',
      description: {
        es: 'Conocida como el "Jardín de la Costa del Sol", Estepona ofrece una experiencia de tenis más tranquila y familiar. Sus clubs combinan excelentes instalaciones con un ambiente acogedor, perfectos para jugadores que buscan mejorar su juego en un entorno relajado.',
        en: 'Known as the "Garden of the Costa del Sol", Estepona offers a quieter, more family-friendly tennis experience. Its clubs combine excellent facilities with a welcoming atmosphere, perfect for players looking to improve their game in a relaxed environment.'
      }
    }
  }

  const currentCity = cityInfo[city] || cityInfo.malaga

  useEffect(() => {
    fetchClubs()
  }, [city])

  useEffect(() => {
    applyFilters()
  }, [clubs, filters])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/clubs?city=${city}`)
      if (response.ok) {
        const data = await response.json()
        setClubs(data.clubs || [])
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...clubs]

    // Surface filter
    if (filters.surface !== 'all') {
      filtered = filtered.filter(club => 
        club.courts.surfaces.some(s => s.type === filters.surface)
      )
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(club => 
        filters.amenities.every(amenity => club.amenities[amenity])
      )
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(club => {
        const price = club.pricing?.courtRental?.hourly?.min
        if (!price) return false
        
        switch (filters.priceRange) {
          case 'budget': return price <= 15
          case 'medium': return price > 15 && price <= 25
          case 'premium': return price > 25
          default: return true
        }
      })
    }

    // Public access filter
    if (filters.publicAccess !== 'all') {
      filtered = filtered.filter(club => 
        filters.publicAccess === 'public' 
          ? club.pricing?.publicAccess === true
          : club.pricing?.membershipRequired === true
      )
    }

    setFilteredClubs(filtered)
  }

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

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
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto">
          <div className="max-w-4xl">
            <nav className="flex items-center space-x-2 text-sm mb-4 text-white/80">
              <Link href={`/${locale}`} className="hover:text-white">
                {locale === 'es' ? 'Inicio' : 'Home'}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/clubs`} className="hover:text-white">
                {locale === 'es' ? 'Clubs' : 'Clubs'}
              </Link>
              <span>/</span>
              <span className="text-white">{currentCity.name}</span>
            </nav>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {locale === 'es' 
                ? `Clubs de Tenis en ${currentCity.name}`
                : `Tennis Clubs in ${currentCity.name}`}
            </h1>
            <p className="text-xl text-white/90">
              {currentCity.description[locale]}
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-0 z-40 bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {/* Surface Filter */}
              <select
                value={filters.surface}
                onChange={(e) => setFilters(prev => ({ ...prev, surface: e.target.value }))}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
              >
                <option value="all">{locale === 'es' ? 'Todas las superficies' : 'All surfaces'}</option>
                <option value="clay">{locale === 'es' ? 'Tierra batida' : 'Clay'}</option>
                <option value="hard">{locale === 'es' ? 'Pista dura' : 'Hard court'}</option>
                <option value="grass">{locale === 'es' ? 'Césped' : 'Grass'}</option>
                <option value="synthetic">{locale === 'es' ? 'Sintética' : 'Synthetic'}</option>
              </select>

              {/* Price Range Filter */}
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
              >
                <option value="all">{locale === 'es' ? 'Todos los precios' : 'All prices'}</option>
                <option value="budget">{locale === 'es' ? '≤ 15€/hora' : '≤ €15/hour'}</option>
                <option value="medium">{locale === 'es' ? '15-25€/hora' : '€15-25/hour'}</option>
                <option value="premium">{locale === 'es' ? '> 25€/hora' : '> €25/hour'}</option>
              </select>

              {/* Access Type Filter */}
              <select
                value={filters.publicAccess}
                onChange={(e) => setFilters(prev => ({ ...prev, publicAccess: e.target.value }))}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
              >
                <option value="all">{locale === 'es' ? 'Todo acceso' : 'All access'}</option>
                <option value="public">{locale === 'es' ? 'Acceso público' : 'Public access'}</option>
                <option value="members">{locale === 'es' ? 'Solo socios' : 'Members only'}</option>
              </select>
            </div>

            {/* View Mode & Results Count */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredClubs.length} {locale === 'es' ? 'clubs encontrados' : 'clubs found'}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-parque-purple text-white' : 'bg-gray-200'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-parque-purple text-white' : 'bg-gray-200'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Amenities Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">
              {locale === 'es' ? 'Servicios:' : 'Amenities:'}
            </span>
            {[
              { key: 'parking', label: { es: 'Parking', en: 'Parking' }, icon: '🚗' },
              { key: 'lighting', label: { es: 'Iluminación', en: 'Lighting' }, icon: '💡' },
              { key: 'restaurant', label: { es: 'Restaurante', en: 'Restaurant' }, icon: '🍽️' },
              { key: 'proShop', label: { es: 'Tienda', en: 'Pro Shop' }, icon: '🎾' },
              { key: 'showers', label: { es: 'Duchas', en: 'Showers' }, icon: '🚿' },
              { key: 'gym', label: { es: 'Gimnasio', en: 'Gym' }, icon: '🏋️' }
            ].map(amenity => (
              <button
                key={amenity.key}
                onClick={() => toggleAmenity(amenity.key)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
                  filters.amenities.includes(amenity.key)
                    ? 'bg-parque-purple text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>{amenity.icon}</span>
                <span>{amenity.label[locale]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          {filteredClubs.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredClubs.map((club) => (
                <ClubCard key={club._id} club={club} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg mb-4">
                {locale === 'es' 
                  ? 'No se encontraron clubs con los filtros seleccionados.'
                  : 'No clubs found with the selected filters.'}
              </p>
              <button
                onClick={() => setFilters({
                  surface: 'all',
                  amenities: [],
                  priceRange: 'all',
                  publicAccess: 'all'
                })}
                className="text-parque-purple hover:underline"
              >
                {locale === 'es' ? 'Limpiar filtros' : 'Clear filters'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">
            {locale === 'es'
              ? '¿Has encontrado tu club ideal?'
              : 'Found your ideal club?'}
          </h2>
          <p className="text-xl mb-8">
            {locale === 'es'
              ? 'Únete a nuestra liga amateur y encuentra jugadores de tu nivel'
              : 'Join our amateur league and find players at your level'}
          </p>
          <Link
            href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${city}`}
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