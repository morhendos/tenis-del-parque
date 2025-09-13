'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import ClubCard from '@/components/clubs/ClubCard'
import { homeContent } from '@/lib/content/homeContent'

export default function CityClubsPageSSG({ locale, city, cityClubsData, searchParams }) {
  const [filteredClubs, setFilteredClubs] = useState(cityClubsData.clubs || [])
  const [filters, setFilters] = useState({
    surface: 'all',
    courtType: 'all',
    amenities: [],
    priceRange: 'all',
    publicAccess: 'all',
    area: searchParams.area || 'all'
  })
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  
  const t = homeContent[locale] || homeContent['es']
  const { clubs, city: cityInfo, debug: debugInfo, error } = cityClubsData

  // Helper function to convert city slug to league slug
  const getCityLeagueSlug = (citySlug) => {
    if (!citySlug) return null
    return `liga-de-${citySlug}`
  }

  // City information with fallback
  const getCityDisplayInfo = (citySlug, apiCityInfo) => {
    const baseInfo = {
      malaga: {
        name: 'Málaga',
        description: {
          es: 'Málaga, capital de la Costa del Sol, ofrece una vibrante escena tenística con clubs distribuidos por diferentes zonas de la ciudad y alrededores.',
          en: 'Málaga, capital of the Costa del Sol, offers a vibrant tennis scene with clubs distributed across different areas of the city and surroundings.'
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
          es: 'Conocida como el \"Jardín de la Costa del Sol\", Estepona ofrece una experiencia de tenis más tranquila y familiar.',
          en: 'Known as the \"Garden of the Costa del Sol\", Estepona offers a quieter, more family-friendly tennis experience.'
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

    const info = baseInfo[citySlug] || { 
      name: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      description: { 
        es: `Clubs de tenis en ${citySlug}`, 
        en: `Tennis clubs in ${citySlug}` 
      } 
    }
    
    if (apiCityInfo) {
      return {
        ...info,
        name: apiCityInfo.name || info.name,
        league: apiCityInfo.league,
        leagueSlug: getCityLeagueSlug(apiCityInfo.league || citySlug),
        color: apiCityInfo.color
      }
    }
    
    return {
      ...info,
      leagueSlug: getCityLeagueSlug(citySlug)
    }
  }

  useEffect(() => {
    applyFilters()
  }, [clubs, filters, searchTerm, sortBy])

  const applyFilters = () => {
    let filtered = [...clubs]

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(search) ||
        club.description?.es?.toLowerCase().includes(search) ||
        club.description?.en?.toLowerCase().includes(search) ||
        club.location?.address?.toLowerCase().includes(search) ||
        club.location?.displayName?.toLowerCase().includes(search) ||
        club.location?.area?.toLowerCase().includes(search)
      )
    }

    // Area filter
    if (filters.area !== 'all') {
      filtered = filtered.filter(club => 
        club.location?.area?.toLowerCase() === filters.area.toLowerCase()
      )
    }

    // Court type filter
    if (filters.courtType !== 'all') {
      filtered = filtered.filter(club => {
        if (filters.courtType === 'tennis') {
          return (club.courts?.tennis?.total > 0) || 
                 (club.courts?.total > 0 && !club.courts?.surfaces?.some(s => s.type === 'padel'))
        }
        if (filters.courtType === 'padel') {
          return (club.courts?.padel?.total > 0) || 
                 (club.courts?.surfaces?.some(s => s.type === 'padel'))
        }
        if (filters.courtType === 'pickleball') {
          return club.courts?.pickleball?.total > 0
        }
        return true
      })
    }

    // Surface filter
    if (filters.surface !== 'all') {
      filtered = filtered.filter(club => 
        club.courts?.surfaces?.some(s => s.type === filters.surface) ||
        club.courts?.tennis?.surfaces?.some(s => s.type === filters.surface)
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
          ? !club.pricing?.membershipRequired
          : club.pricing?.membershipRequired === true
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-low':
          return (a.pricing?.courtRental?.hourly?.min || 999) - (b.pricing?.courtRental?.hourly?.min || 999)
        case 'price-high':
          return (b.pricing?.courtRental?.hourly?.min || 0) - (a.pricing?.courtRental?.hourly?.min || 0)
        case 'courts':
          const aTotal = (a.courts?.tennis?.total || 0) + (a.courts?.padel?.total || 0) + (a.courts?.pickleball?.total || 0) + (a.courts?.total || 0)
          const bTotal = (b.courts?.tennis?.total || 0) + (b.courts?.padel?.total || 0) + (b.courts?.pickleball?.total || 0) + (b.courts?.total || 0)
          return bTotal - aTotal
        case 'featured':
        default:
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return (a.displayOrder || 0) - (b.displayOrder || 0)
      }
    })

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

  // Get unique areas from clubs for area filter
  const availableAreas = useMemo(() => {
    const areas = [...new Set(clubs
      .map(club => club.location?.area)
      .filter(Boolean))]
    return areas
  }, [clubs])

  // Helper to get area statistics
  const getAreaStats = () => {
    const areaStats = {}
    availableAreas.forEach(area => {
      areaStats[area] = clubs.filter(club => club.location?.area === area).length
    })
    return areaStats
  }

  const areaStats = getAreaStats()

  // Get current city display info
  const currentCity = getCityDisplayInfo(city, cityInfo)

  // Get court breakdown stats
  const stats = useMemo(() => {
    let tennisCourts = 0
    let padelCourts = 0
    let pickleballCourts = 0
    let clubsWithTennis = 0
    let clubsWithPadel = 0
    let clubsWithPickleball = 0
    
    clubs.forEach(club => {
      // New structure
      if (club.courts?.tennis?.total > 0) {
        tennisCourts += club.courts.tennis.total
        clubsWithTennis++
      }
      if (club.courts?.padel?.total > 0) {
        padelCourts += club.courts.padel.total
        clubsWithPadel++
      }
      if (club.courts?.pickleball?.total > 0) {
        pickleballCourts += club.courts.pickleball.total
        clubsWithPickleball++
      }
      
      // Legacy structure
      if (!club.courts?.tennis && !club.courts?.padel && !club.courts?.pickleball && club.courts?.total > 0) {
        const hasPadel = club.courts?.surfaces?.some(s => s.type === 'padel')
        if (hasPadel) {
          padelCourts += club.courts.total
          clubsWithPadel++
        } else {
          tennisCourts += club.courts.total
          clubsWithTennis++
        }
      }
    })
    
    const publicClubs = clubs.filter(club => !club.pricing?.membershipRequired).length
    const membersOnlyClubs = clubs.filter(club => club.pricing?.membershipRequired === true).length
    const totalCourts = tennisCourts + padelCourts + pickleballCourts
    
    return { 
      tennisCourts, 
      padelCourts, 
      pickleballCourts, 
      totalCourts,
      clubsWithTennis,
      clubsWithPadel,
      clubsWithPickleball,
      publicClubs,
      membersOnlyClubs
    }
  }, [clubs])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation locale={locale} />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'es' ? 'Error cargando clubs de la ciudad' : 'Error loading city clubs'}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href={`/${locale}/clubs`} className="text-parque-purple hover:underline">
            {locale === 'es' ? '← Volver a clubs' : '← Back to clubs'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation locale={locale} />
      
      {/* Enhanced Hero Section */}
      <section className="relative pt-32 pb-16 px-4 bg-gradient-to-br from-parque-purple via-parque-purple/90 to-parque-green text-white">
        <div className="container mx-auto">
          <div className="max-w-4xl">
            <nav className="flex items-center space-x-2 text-sm mb-4 text-white/80">
              <Link href={`/${locale}`} className="hover:text-white">
                {locale === 'es' ? 'Inicio' : 'Home'}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/${locale === 'es' ? 'clubes' : 'clubs'}`} className="hover:text-white">
                {locale === 'es' ? 'Clubs' : 'Clubs'}
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{currentCity.name}</span>
            </nav>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {locale === 'es' 
                ? `Clubs de Tenis en ${currentCity.name}`
                : `Tennis Clubs in ${currentCity.name}`}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {currentCity.description[locale]}
            </p>

            {/* Court Type Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.tennisCourts}</div>
                <div className="text-xs text-white/80 font-medium uppercase tracking-wide">
                  {locale === 'es' ? 'Pistas de tenis' : 'Tennis courts'}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {stats.clubsWithTennis} {locale === 'es' ? 'clubs' : 'clubs'}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.padelCourts}</div>
                <div className="text-xs text-white/80 font-medium uppercase tracking-wide">
                  {locale === 'es' ? 'Pistas de pádel' : 'Padel courts'}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {stats.clubsWithPadel} {locale === 'es' ? 'clubs' : 'clubs'}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.pickleballCourts}</div>
                <div className="text-xs text-white/80 font-medium uppercase tracking-wide">
                  Pickleball
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {stats.clubsWithPickleball} {locale === 'es' ? 'clubs' : 'clubs'}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.publicClubs}</div>
                <div className="text-xs text-white/80 font-medium uppercase tracking-wide">
                  {locale === 'es' ? 'Acceso público' : 'Public access'}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {stats.membersOnlyClubs} {locale === 'es' ? 'solo socios' : 'members only'}
                </div>
              </div>
            </div>

            {/* Dynamic Area Pills */}
            {availableAreas.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, area: 'all' }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.area === 'all'
                      ? 'bg-white text-parque-purple scale-105'
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.area === area
                          ? 'bg-white text-parque-purple scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {area}
                      <span className="ml-2 opacity-75">({areaStats[area]})</span>
                    </button>
                  )
                ))}
              </div>
            )}

            {/* Debug Info Toggle (for development) */}
            {debugInfo && process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="mt-4 px-3 py-1 bg-white/20 text-white/80 rounded text-sm hover:bg-white/30"
              >
                🔍 Debug Info
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Debug Info Panel (development only) */}
      {showDebugInfo && debugInfo && (
        <section className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="container mx-auto">
            <h3 className="font-bold text-yellow-800 mb-2">🔬 GPS Assignment Debug Info</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Total clubs queried:</strong> {debugInfo.totalClubsQueried}</p>
              <p><strong>Clubs with GPS assignments:</strong> {debugInfo.clubsWithGPSAssignments}</p>
              <p><strong>Clubs in this city:</strong> {debugInfo.clubsInThisCity}</p>
              <p><strong>Active clubs:</strong> {debugInfo.activeClubsInThisCity}</p>
              <p><strong>Inactive clubs:</strong> {debugInfo.inactiveClubsInThisCity}</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Club Assignments</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.clubAssignments, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter Bar */}
      <section className="sticky top-0 z-40 bg-white shadow-lg py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={locale === 'es' ? 'Buscar clubs, áreas, servicios...' : 'Search clubs, areas, services...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-parque-purple focus:ring-2 focus:ring-parque-purple/20 text-gray-700"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple text-gray-700"
            >
              <option value="featured">{locale === 'es' ? 'Destacados' : 'Featured'}</option>
              <option value="name">{locale === 'es' ? 'Nombre A-Z' : 'Name A-Z'}</option>
              <option value="price-low">{locale === 'es' ? 'Precio: Menor' : 'Price: Low to High'}</option>
              <option value="price-high">{locale === 'es' ? 'Precio: Mayor' : 'Price: High to Low'}</option>
              <option value="courts">{locale === 'es' ? 'Más pistas' : 'Most courts'}</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 ${
                showFilters ? 'bg-parque-purple text-white border-parque-purple' : 'border-gray-300 hover:border-parque-purple text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {locale === 'es' ? 'Filtros' : 'Filters'}
              {(filters.courtType !== 'all' || filters.surface !== 'all' || filters.priceRange !== 'all' || filters.publicAccess !== 'all' || filters.amenities.length > 0) && (
                <span className="bg-white text-parque-purple px-2 py-0.5 rounded-full text-xs font-bold">
                  {[filters.courtType !== 'all', filters.surface !== 'all', filters.priceRange !== 'all', filters.publicAccess !== 'all', filters.amenities.length > 0].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* View Mode */}
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-parque-purple text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-parque-purple text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-lg text-gray-900">{filteredClubs.length}</span> {locale === 'es' ? 'clubs encontrados' : 'clubs found'}
              {filters.area !== 'all' && (
                <span className="ml-1">
                  {locale === 'es' ? 'en' : 'in'} <span className="font-medium text-parque-purple">{filters.area}</span>
                </span>
              )}
            </div>
            
            {/* Clear All Filters */}
            {(filters.courtType !== 'all' || filters.surface !== 'all' || filters.priceRange !== 'all' || filters.publicAccess !== 'all' || filters.amenities.length > 0 || searchTerm) && (
              <button
                onClick={() => {
                  setFilters({
                    courtType: 'all',
                    surface: 'all',
                    amenities: [],
                    priceRange: 'all',
                    publicAccess: 'all',
                    area: filters.area
                  })
                  setSearchTerm('')
                }}
                className="text-sm text-parque-purple hover:text-parque-purple/80 underline"
              >
                {locale === 'es' ? 'Limpiar filtros' : 'Clear all filters'}
              </button>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Court Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'es' ? 'Tipo de pista' : 'Court type'}
                  </label>
                  <select
                    value={filters.courtType}
                    onChange={(e) => setFilters(prev => ({ ...prev, courtType: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
                  >
                    <option value="all">{locale === 'es' ? 'Todos' : 'All'}</option>
                    <option value="tennis">{locale === 'es' ? 'Tenis' : 'Tennis'}</option>
                    <option value="padel">{locale === 'es' ? 'Pádel' : 'Padel'}</option>
                    <option value="pickleball">Pickleball</option>
                  </select>
                </div>

                {/* Surface Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'es' ? 'Superficie' : 'Surface'}
                  </label>
                  <select
                    value={filters.surface}
                    onChange={(e) => setFilters(prev => ({ ...prev, surface: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
                  >
                    <option value="all">{locale === 'es' ? 'Todas' : 'All'}</option>
                    <option value="clay">{locale === 'es' ? 'Tierra batida' : 'Clay'}</option>
                    <option value="hard">{locale === 'es' ? 'Pista dura' : 'Hard court'}</option>
                    <option value="grass">{locale === 'es' ? 'Césped' : 'Grass'}</option>
                    <option value="synthetic">{locale === 'es' ? 'Sintética' : 'Synthetic'}</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'es' ? 'Precio' : 'Price'}
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
                  >
                    <option value="all">{locale === 'es' ? 'Todos' : 'All'}</option>
                    <option value="budget">{locale === 'es' ? '≤ 15€/hora' : '≤ €15/hour'}</option>
                    <option value="medium">{locale === 'es' ? '15-25€/hora' : '€15-25/hour'}</option>
                    <option value="premium">{locale === 'es' ? '> 25€/hora' : '> €25/hour'}</option>
                  </select>
                </div>

                {/* Access Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'es' ? 'Acceso' : 'Access'}
                  </label>
                  <select
                    value={filters.publicAccess}
                    onChange={(e) => setFilters(prev => ({ ...prev, publicAccess: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-parque-purple"
                  >
                    <option value="all">{locale === 'es' ? 'Todos' : 'All'}</option>
                    <option value="public">{locale === 'es' ? 'Público' : 'Public'}</option>
                    <option value="members">{locale === 'es' ? 'Solo socios' : 'Members only'}</option>
                  </select>
                </div>
              </div>

              {/* Amenities Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Servicios' : 'Amenities'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'parking', label: { es: 'Parking', en: 'Parking' } },
                    { key: 'lighting', label: { es: 'Iluminación', en: 'Lighting' } },
                    { key: 'restaurant', label: { es: 'Restaurante', en: 'Restaurant' } },
                    { key: 'proShop', label: { es: 'Tienda', en: 'Pro Shop' } },
                    { key: 'changingRooms', label: { es: 'Vestuarios', en: 'Changing Rooms' } },
                    { key: 'gym', label: { es: 'Gimnasio', en: 'Gym' } },
                    { key: 'swimming', label: { es: 'Piscina', en: 'Pool' } }
                  ].map(amenity => (
                    <button
                      key={amenity.key}
                      onClick={() => toggleAmenity(amenity.key)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        filters.amenities.includes(amenity.key)
                          ? 'bg-parque-purple text-white scale-105'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {amenity.label[locale]}
                    </button>
                  ))}
                </div>
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
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4 max-w-4xl mx-auto'
            }>
              {filteredClubs.map((club) => (
                <ClubCard key={club._id} club={club} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 max-w-md mx-auto">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {locale === 'es' 
                  ? 'No encontramos clubs'
                  : 'No clubs found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {locale === 'es' 
                  ? 'Prueba ajustando los filtros o busca en otra área'
                  : 'Try adjusting the filters or search in another area'}
              </p>
              <button
                onClick={() => {
                  setFilters({
                    courtType: 'all',
                    surface: 'all',
                    amenities: [],
                    priceRange: 'all',
                    publicAccess: 'all',
                    area: 'all'
                  })
                  setSearchTerm('')
                }}
                className="px-6 py-3 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors"
              >
                {locale === 'es' ? 'Limpiar todos los filtros' : 'Clear all filters'}
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
          <div className="flex gap-4 justify-center">
            <Link
              href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${currentCity.leagueSlug || getCityLeagueSlug(city)}`}
              className="inline-block px-8 py-4 bg-white text-parque-purple rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
            >
              {locale === 'es' ? 'Únete a la Liga' : 'Join the League'}
            </Link>
            <Link
              href={`/${locale}/ligas`}
              className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium text-lg hover:bg-white/30 transition-colors"
            >
              {locale === 'es' ? 'Ver Ligas' : 'View Leagues'}
            </Link>
          </div>
        </div>
      </section>

      <Footer content={t.footer} />
    </div>
  )
}
