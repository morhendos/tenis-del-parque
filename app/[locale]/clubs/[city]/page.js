'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import ClubCard from '@/components/clubs/ClubCard'
import { homeContent } from '@/lib/content/homeContent'
import { 
  CITY_AREAS_MAPPING, 
  AREA_DISPLAY_NAMES, 
  CITY_DISPLAY_NAMES,
  getAreasForCity
} from '@/lib/utils/areaMapping'

export default function CityClubsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale || 'es'
  const city = params.city
  
  const [clubs, setClubs] = useState([])
  const [filteredClubs, setFilteredClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    surface: 'all',
    amenities: [],
    priceRange: 'all',
    publicAccess: 'all',
    area: searchParams.get('area') || 'all'
  })
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)
  
  const t = homeContent[locale] || homeContent['es']

  // City information with area context
  const cityInfo = {
    malaga: {
      name: 'Málaga',
      description: {
        es: 'Málaga, capital de la Costa del Sol, ofrece una vibrante escena tenística con más de 30 clubs distribuidos por diferentes zonas de la ciudad y alrededores.',
        en: 'Málaga, capital of the Costa del Sol, offers a vibrant tennis scene with over 30 clubs distributed across different areas of the city and surroundings.'
      }
    },
    marbella: {
      name: 'Marbella',
      description: {
        es: 'Marbella y su área metropolitana ofrecen la mayor concentración de clubs de tenis de lujo en la Costa del Sol.',
        en: 'Marbella and its metropolitan area offer the highest concentration of luxury tennis clubs on the Costa del Sol.'
      }
    },
    estepona: {
      name: 'Estepona',
      description: {
        es: 'Conocida como el "Jardín de la Costa del Sol", Estepona ofrece una experiencia de tenis más tranquila y familiar.',
        en: 'Known as the "Garden of the Costa del Sol", Estepona offers a quieter, more family-friendly tennis experience.'
      }
    },
    sotogrande: {
      name: 'Sotogrande',
      description: {
        es: 'Sotogrande es conocida por sus exclusivos clubs de tenis y su ambiente internacional.',
        en: 'Sotogrande is known for its exclusive tennis clubs and international atmosphere.'
      }
    }
  }

  const currentCity = cityInfo[city] || cityInfo.malaga
  const availableAreas = getAreasForCity(city)

  useEffect(() => {
    fetchClubs()
  }, [city])

  useEffect(() => {
    applyFilters()
  }, [clubs, filters, searchTerm])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ city })
      const response = await fetch(`/api/clubs?${params}`)
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

    // Search filter - enhanced to include area names
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(search) ||
        club.description?.es?.toLowerCase().includes(search) ||
        club.description?.en?.toLowerCase().includes(search) ||
        club.location?.address?.toLowerCase().includes(search) ||
        club.location?.displayName?.toLowerCase().includes(search) ||
        (club.location?.area && (AREA_DISPLAY_NAMES[club.location.area] || club.location.area).toLowerCase().includes(search))
      )
    }

    // Area filter
    if (filters.area !== 'all') {
      filtered = filtered.filter(club => club.location?.area === filters.area)
    }

    // Surface filter
    if (filters.surface !== 'all') {
      filtered = filtered.filter(club => 
        club.courts?.surfaces?.some(s => s.type === filters.surface)
      )
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(club => 
        filters.amenities.every(amenity => club.amenities?.[amenity])
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

  // Helper to get area statistics for the current city
  const getAreaStats = () => {
    const areaStats = {}
    availableAreas.forEach(area => {
      areaStats[area] = clubs.filter(club => club.location?.area === area).length
    })
    return areaStats
  }

  const areaStats = getAreaStats()

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
      
      {/* Hero Section - Simplified */}
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
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'es' 
                ? `Clubs de Tenis en ${currentCity.name}`
                : `Tennis Clubs in ${currentCity.name}`}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {currentCity.description[locale]}
            </p>

            {/* Area Pills for cities with multiple areas */}
            {availableAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, area: 'all' }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.area === 'all'
                      ? 'bg-white text-parque-purple'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {locale === 'es' ? 'Todas las áreas' : 'All areas'}
                  <span className="ml-2 opacity-75">({clubs.length})</span>
                </button>
                {availableAreas.map(area => (
                  areaStats[area] > 0 && (
                    <button
                      key={area}
                      onClick={() => setFilters(prev => ({ ...prev, area }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filters.area === area
                          ? 'bg-white text-parque-purple'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {AREA_DISPLAY_NAMES[area] || area}
                      <span className="ml-2 opacity-75">({areaStats[area]})</span>
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Simplified Search & Filter Bar */}
      <section className="sticky top-0 z-40 bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={locale === 'es' ? 'Buscar clubs...' : 'Search clubs...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-parque-purple"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showFilters ? 'bg-parque-purple text-white border-parque-purple' : 'border-gray-300 hover:border-parque-purple'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {locale === 'es' ? 'Filtros' : 'Filters'}
            </button>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{filteredClubs.length}</span> {locale === 'es' ? 'clubs encontrados' : 'clubs found'}
              {filters.area !== 'all' && (
                <span className="ml-1">
                  {locale === 'es' ? 'en' : 'in'} <span className="font-medium text-parque-purple">{AREA_DISPLAY_NAMES[filters.area] || filters.area}</span>
                </span>
              )}
            </div>

            {/* View Mode */}
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-parque-purple text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-parque-purple text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                aria-label="List view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4">
                {/* Surface Filter */}
                <select
                  value={filters.surface}
                  onChange={(e) => setFilters(prev => ({ ...prev, surface: e.target.value }))}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
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
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
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
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
                >
                  <option value="all">{locale === 'es' ? 'Todo acceso' : 'All access'}</option>
                  <option value="public">{locale === 'es' ? 'Acceso público' : 'Public access'}</option>
                  <option value="members">{locale === 'es' ? 'Solo socios' : 'Members only'}</option>
                </select>

                {/* Clear Filters */}
                {(filters.surface !== 'all' || filters.priceRange !== 'all' || filters.publicAccess !== 'all' || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilters({
                        surface: 'all',
                        amenities: [],
                        priceRange: 'all',
                        publicAccess: 'all',
                        area: filters.area
                      })
                      setSearchTerm('')
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    {locale === 'es' ? 'Limpiar filtros' : 'Clear filters'}
                  </button>
                )}
              </div>

              {/* Amenities Filter - Simplified */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { key: 'parking', label: { es: 'Parking', en: 'Parking' }, icon: '🚗' },
                  { key: 'lighting', label: { es: 'Iluminación', en: 'Lighting' }, icon: '💡' },
                  { key: 'restaurant', label: { es: 'Restaurante', en: 'Restaurant' }, icon: '🍽️' },
                  { key: 'proShop', label: { es: 'Tienda', en: 'Pro Shop' }, icon: '🎾' }
                ].map(amenity => (
                  <button
                    key={amenity.key}
                    onClick={() => toggleAmenity(amenity.key)}
                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
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
          )}
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
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg mb-4">
                {locale === 'es' 
                  ? 'No se encontraron clubs con los filtros seleccionados.'
                  : 'No clubs found with the selected filters.'}
              </p>
              <button
                onClick={() => {
                  setFilters({
                    surface: 'all',
                    amenities: [],
                    priceRange: 'all',
                    publicAccess: 'all',
                    area: 'all'
                  })
                  setSearchTerm('')
                }}
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
