'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { homeContent } from '@/lib/content/homeContent'

export default function ClubDetailPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const city = params.city
  const slug = params.slug
  
  const [club, setClub] = useState(null)
  const [nearbyClubs, setNearbyClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [imageError, setImageError] = useState({})
  const [imageLoading, setImageLoading] = useState({})
  
  const t = homeContent[locale] || homeContent['es']

  // Helper function to convert city slug to league slug
  const getCityLeagueSlug = (citySlug) => {
    if (!citySlug) return null
    return `liga-de-${citySlug}`
  }

  useEffect(() => {
    fetchClubDetails()
  }, [city, slug])

  const fetchClubDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/clubs/${city}/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setClub(data.club)
        setNearbyClubs(data.nearbyClubs || [])
      }
    } catch (error) {
      console.error('Error fetching club details:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format price display - UPDATED to show single prices without prefix
  const formatPriceRange = (min, max, locale) => {
    // Check if we have valid values
    const hasMin = min !== null && min !== undefined && min !== ''
    const hasMax = max !== null && max !== undefined && max !== ''
    
    if (hasMin && hasMax && min !== max) {
      // Both values exist and are different - show range
      return `${min}€ - ${max}€`
    } else if (hasMin) {
      // Only minimum value exists OR both values are the same - show single price per hour
      return `${min}€ ${locale === 'es' ? 'por hora' : 'per hour'}`
    } else if (hasMax) {
      // Only maximum value exists (rare case) - show single price per hour
      return `${max}€ ${locale === 'es' ? 'por hora' : 'per hour'}`
    }
    // No valid values
    return null
  }

  // Helper function to get court info from both old and new structures
  const getCourtInfo = (courts) => {
    if (!courts) {
      return { total: 0, indoor: 0, outdoor: 0, surfaces: [], sports: {} }
    }

    // New structure (from refactored editor)
    if (courts.tennis || courts.padel || courts.pickleball) {
      const tennisTotal = courts.tennis?.total || 0
      const padelTotal = courts.padel?.total || 0
      const pickleballTotal = courts.pickleball?.total || 0
      
      const tennisIndoor = courts.tennis?.indoor || 0
      const padelIndoor = courts.padel?.indoor || 0
      const pickleballIndoor = courts.pickleball?.indoor || 0
      
      return {
        total: tennisTotal + padelTotal + pickleballTotal,
        indoor: tennisIndoor + padelIndoor + pickleballIndoor,
        outdoor: (tennisTotal - tennisIndoor) + (padelTotal - padelIndoor) + (pickleballTotal - pickleballIndoor),
        surfaces: [],
        sports: {
          tennis: tennisTotal,
          padel: padelTotal,
          pickleball: pickleballTotal
        }
      }
    }
    
    // Old structure (legacy)
    return {
      total: courts.total || 0,
      indoor: courts.indoor || 0,
      outdoor: courts.outdoor || 0,
      surfaces: courts.surfaces || [],
      sports: {}
    }
  }

  // Initialize Google Map
  useEffect(() => {
    if (!club?.location?.coordinates || mapLoaded) return

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      const mapElement = document.getElementById('club-map')
      if (!mapElement) return

      const courtInfo = getCourtInfo(club.courts)

      const map = new window.google.maps.Map(mapElement, {
        center: { 
          lat: club.location.coordinates.lat, 
          lng: club.location.coordinates.lng 
        },
        zoom: 17,
        mapTypeId: 'satellite',
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ['satellite', 'hybrid', 'terrain', 'roadmap']
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        },
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      })

      const marker = new window.google.maps.Marker({
        position: { 
          lat: club.location.coordinates.lat, 
          lng: club.location.coordinates.lng 
        },
        map: map,
        title: club.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#7C3AED',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; color: #7C3AED; font-weight: bold;">${club.name}</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">${club.location.address}</p>
            ${courtInfo.total > 0 ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 13px;">${courtInfo.total} ${locale === 'es' ? 'pistas' : 'courts'}</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      setMapLoaded(true)
    }

    loadGoogleMaps()
  }, [club, mapLoaded, locale])

  // Helper function to normalize URLs for better duplicate detection
  const normalizeImageUrl = (url) => {
    if (!url) return null
    
    // Convert to string and trim
    let normalized = String(url).trim()
    
    // Remove trailing slashes
    normalized = normalized.replace(/\/+$/, '')
    
    // Normalize query parameters order for Google Photos
    if (normalized.includes('photo_reference=')) {
      try {
        const urlObj = new URL(normalized, window.location.origin)
        const photoRef = urlObj.searchParams.get('photo_reference')
        if (photoRef) {
          // Create a consistent format for Google Photo URLs
          normalized = `/api/clubs/photo?photo_reference=${photoRef}`
        }
      } catch (e) {
        // If URL parsing fails, use original
      }
    }
    
    return normalized.toLowerCase()
  }

  // Collect all images with enhanced deduplication
  const allImages = useMemo(() => {
    if (!club) return []
    
    const imageMap = new Map() // Use Map to maintain insertion order and allow metadata
    const images = []
    
    // Helper to add image with deduplication
    const addImage = (url, source = 'unknown') => {
      if (!url) return
      
      const normalizedUrl = normalizeImageUrl(url)
      if (!normalizedUrl) return
      
      // Check for duplicates using normalized URL
      if (!imageMap.has(normalizedUrl)) {
        imageMap.set(normalizedUrl, {
          original: url,
          source,
          index: images.length
        })
        images.push(url)
      } else {
        // Log for debugging - this helps us understand what duplicates we're catching
        console.log(`🔍 Duplicate image detected from ${source}:`, url, 'normalized to:', normalizedUrl)
      }
    }
    
    // Add main image first (highest priority)
    if (club.images?.main) {
      addImage(club.images.main, 'main')
    }
    
    // Add gallery images (skip duplicates)
    if (club.images?.gallery && Array.isArray(club.images.gallery)) {
      club.images.gallery.forEach((img, idx) => {
        addImage(img, `gallery[${idx}]`)
      })
    }
    
    // Add Google photos (skip duplicates)
    if (club.googleData?.photos && Array.isArray(club.googleData.photos)) {
      club.googleData.photos.forEach((photo, idx) => {
        const googlePhotoUrl = `/api/clubs/photo?photo_reference=${photo.photo_reference}`
        addImage(googlePhotoUrl, `google[${idx}]`)
      })
    }
    
    // Add legacy Google photo reference if it exists
    if (club.images?.googlePhotoReference) {
      const legacyGoogleUrl = `/api/clubs/photo?photo_reference=${club.images.googlePhotoReference}`
      addImage(legacyGoogleUrl, 'legacy_google')
    }
    
    // Log final results for debugging
    console.log(`📸 Final image gallery for ${club.name}:`, images.length, 'unique images out of', 
      (club.images?.gallery?.length || 0) + 
      (club.googleData?.photos?.length || 0) + 
      (club.images?.main ? 1 : 0) + 
      (club.images?.googlePhotoReference ? 1 : 0), 'total potential images')
    
    return images
  }, [club])

  // Helper functions for checking data availability
  const hasAmenities = useMemo(() => 
    Object.values(club?.amenities || {}).some(v => v === true), 
    [club?.amenities]
  )
  
  const hasServices = useMemo(() => 
    Object.values(club?.services || {}).some(v => v === true), 
    [club?.services]
  )

  // Image error and loading handlers
  const handleMainImageError = () => {
    setImageError(prev => ({ ...prev, [selectedImage]: true }))
    setImageLoading(prev => ({ ...prev, [selectedImage]: false }))
  }

  const handleMainImageLoad = () => {
    setImageLoading(prev => ({ ...prev, [selectedImage]: false }))
  }

  const handleThumbnailError = (idx) => {
    setImageError(prev => ({ ...prev, [`thumb_${idx}`]: true }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation locale={locale} />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {locale === 'es' ? 'Cargando club...' : 'Loading club...'}
          </p>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation locale={locale} />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'es' ? 'Club no encontrado' : 'Club not found'}
          </h1>
          <Link href={`/${locale}/clubs`} className="text-parque-purple hover:underline">
            {locale === 'es' ? '← Volver a clubs' : '← Back to clubs'}
          </Link>
        </div>
      </div>
    )
  }

  const courtInfo = getCourtInfo(club.courts)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation locale={locale} />
      
      {/* Mobile-Optimized Hero Section with Image Gallery */}
      <section className="relative pt-16 lg:pt-20">
        <div className="lg:container lg:mx-auto lg:px-4">
          {/* Mobile Breadcrumb */}
          <nav className="flex items-center space-x-1 text-xs lg:text-sm py-2 lg:py-4 text-gray-600 px-4 lg:px-0">
            <Link href={`/${locale}`} className="hover:text-gray-900 whitespace-nowrap flex-shrink-0">
              {locale === 'es' ? 'Inicio' : 'Home'}
            </Link>
            <span className="flex-shrink-0">/</span>
            <Link href={`/${locale}/clubs`} className="hover:text-gray-900 whitespace-nowrap flex-shrink-0">
              {locale === 'es' ? 'Clubs' : 'Clubs'}
            </Link>
            <span className="hidden sm:inline flex-shrink-0">/</span>
            <Link href={`/${locale}/clubs/${city}`} className="hidden sm:inline hover:text-gray-900 capitalize whitespace-nowrap flex-shrink-0">
              {city.replace(/-/g, ' ')}
            </Link>
            <span className="flex-shrink-0">/</span>
            <span className="text-gray-900 font-medium min-w-0 break-words">{club.name}</span>
          </nav>

          {/* Main Content Grid */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 pb-12">
            {/* Left Column - Images & Info */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Enhanced Image Gallery */}
              {allImages.length > 0 ? (
                <div className="bg-white lg:rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative aspect-[16/12] lg:aspect-[16/10]">
                    {imageLoading[selectedImage] && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
                        <div className="text-gray-400">
                          <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <Image 
                      src={allImages[selectedImage]} 
                      alt={club.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 67vw, 50vw"
                      quality={90}
                      className={`object-cover ${imageLoading[selectedImage] ? 'opacity-0' : 'opacity-100'}`}
                      onError={handleMainImageError}
                      onLoadingComplete={handleMainImageLoad}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      priority={selectedImage === 0}
                    />
                    {club.featured && (
                      <div className="absolute top-2 left-2 lg:top-4 lg:left-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-semibold shadow-lg backdrop-blur-sm">
                        ⭐ {locale === 'es' ? 'Club Destacado' : 'Featured Club'}
                      </div>
                    )}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                          className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-2 lg:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center backdrop-blur-sm"
                        >
                          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                          className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-2 lg:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center backdrop-blur-sm"
                        >
                          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex p-4 lg:p-5 gap-3 overflow-x-auto bg-gradient-to-r from-gray-50 to-gray-100/50">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 relative ${
                            selectedImage === idx 
                              ? 'border-parque-purple ring-3 ring-parque-purple/30 shadow-md scale-105' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-102'
                          }`}
                        >
                          <Image 
                            src={img} 
                            alt={`${club.name} ${idx + 1}`}
                            fill
                            sizes="80px"
                            quality={70}
                            className="object-cover"
                            onError={() => handleThumbnailError(idx)}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-parque-purple to-parque-green lg:rounded-2xl shadow-lg h-64 lg:h-96 flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg lg:text-xl">{club.name}</p>
                  </div>
                </div>
              )}

              {/* Enhanced Club Information Card */}
              <div className="bg-white lg:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* Club Header - Removed location icon */}
                <div className="p-6 lg:p-8 border-b border-gray-100">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">{club.name}</h1>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 text-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{club.fullAddress}</span>
                    </div>
                    {club.googleData?.rating && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                        <span className="text-yellow-500 text-lg">⭐</span>
                        <span className="font-bold text-yellow-800">{club.googleData.rating}</span>
                        <span className="text-yellow-700 text-sm">({club.googleData.userRatingsTotal} {locale === 'es' ? 'reseñas' : 'reviews'})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Courts & Stats Section */}
                {courtInfo.total > 0 && (
                  <div className="p-6 lg:p-8 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      {locale === 'es' ? 'Instalaciones Deportivas' : 'Sports Facilities'}
                    </h3>
                    
                    {/* Display sports breakdown for new structure */}
                    {(courtInfo.sports.tennis > 0 || courtInfo.sports.padel > 0 || courtInfo.sports.pickleball > 0) ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="text-3xl font-bold text-slate-700 mb-1">{courtInfo.total}</div>
                          <div className="text-sm font-medium text-slate-600">{locale === 'es' ? 'Pistas totales' : 'Total courts'}</div>
                        </div>
                        {courtInfo.sports.tennis > 0 && (
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                            <div className="text-3xl font-bold text-green-600 mb-1">{courtInfo.sports.tennis}</div>
                            <div className="text-sm font-medium text-green-700">{locale === 'es' ? 'Tenis' : 'Tennis'}</div>
                          </div>
                        )}
                        {courtInfo.sports.padel > 0 && (
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{courtInfo.sports.padel}</div>
                            <div className="text-sm font-medium text-blue-700">{locale === 'es' ? 'Pádel' : 'Padel'}</div>
                          </div>
                        )}
                        {courtInfo.sports.pickleball > 0 && (
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                            <div className="text-3xl font-bold text-orange-600 mb-1">{courtInfo.sports.pickleball}</div>
                            <div className="text-sm font-medium text-orange-700">Pickleball</div>
                          </div>
                        )}
                        {courtInfo.indoor > 0 && (
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                            <div className="text-3xl font-bold text-purple-600 mb-1">{courtInfo.indoor}</div>
                            <div className="text-sm font-medium text-purple-700">{locale === 'es' ? 'Cubiertas' : 'Indoor'}</div>
                          </div>
                        )}
                        {club.pricing?.publicAccess !== null && (
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="text-3xl font-bold text-gray-700 mb-1">
                              {club.pricing.publicAccess ? '✓' : '✗'}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                              {club.pricing.publicAccess ? (locale === 'es' ? 'Público' : 'Public') : (locale === 'es' ? 'Privado' : 'Private')}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback for old structure
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="text-3xl font-bold text-slate-700 mb-1">{courtInfo.total}</div>
                          <div className="text-sm font-medium text-slate-600">{locale === 'es' ? 'Pistas totales' : 'Total courts'}</div>
                        </div>
                        {courtInfo.indoor > 0 && (
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{courtInfo.indoor}</div>
                            <div className="text-sm font-medium text-blue-700">{locale === 'es' ? 'Cubiertas' : 'Indoor'}</div>
                          </div>
                        )}
                        {club.pricing?.publicAccess !== null && (
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="text-3xl font-bold text-gray-700 mb-1">
                              {club.pricing.publicAccess ? '✓' : '✗'}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                              {club.pricing.publicAccess ? (locale === 'es' ? 'Público' : 'Public') : (locale === 'es' ? 'Privado' : 'Private')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Tab Navigation */}
                <div className="lg:hidden border-b sticky top-16 bg-white z-10">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`flex-1 px-6 py-4 font-semibold text-sm border-b-3 transition-all !mb-0 ${
                        activeTab === 'info' 
                          ? 'border-parque-purple text-parque-purple bg-parque-purple/5' 
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      style={{ marginBottom: '0' }}
                    >
                      {locale === 'es' ? 'Información' : 'Information'}
                    </button>
                    <button
                      onClick={() => setActiveTab('amenities')}
                      className={`flex-1 px-6 py-4 font-semibold text-sm border-b-3 transition-all !mb-0 ${
                        activeTab === 'amenities' 
                          ? 'border-parque-purple text-parque-purple bg-parque-purple/5' 
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      style={{ marginBottom: '0' }}
                    >
                      {locale === 'es' ? 'Servicios' : 'Services'}
                    </button>
                  </div>
                </div>

                {/* Mobile Tab Content */}
                <div className="lg:hidden">
                  {/* Info Tab */}
                  {activeTab === 'info' && (
                    <div className="p-6 space-y-6">
                      {/* Description */}
                      {(club.description?.[locale] || club.description?.es) && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3">{locale === 'es' ? 'Acerca del Club' : 'About the Club'}</h3>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                            {club.description[locale] || club.description.es}
                          </p>
                        </div>
                      )}

                      {/* Toned Down Pricing Section - Mobile */}
                      {(club.pricing?.courtRental?.hourly?.min !== null || club.pricing?.courtRental?.membership?.monthly !== null) && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            {locale === 'es' ? 'Tarifas' : 'Pricing'}
                          </h3>
                          <div className="space-y-3">
                            {club.pricing?.courtRental?.hourly && (() => {
                              const formattedPrice = formatPriceRange(
                                club.pricing.courtRental.hourly.min,
                                club.pricing.courtRental.hourly.max,
                                locale
                              )
                              return formattedPrice ? (
                                <div className="bg-gray-50 p-5 rounded-xl">
                                  <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm font-medium text-emerald-800">{locale === 'es' ? 'Alquiler de pista' : 'Court rental'}</div>
                                  </div>
                                  <div className="text-lg font-semibold text-emerald-700">
                                    {formattedPrice}
                                  </div>
                                </div>
                              ) : null
                            })()}
                            {club.pricing?.courtRental?.membership?.monthly !== null && club.pricing?.courtRental?.membership?.monthly !== undefined && (
                              <div className="bg-gray-50 p-5 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <div className="text-sm font-medium text-blue-800">{locale === 'es' ? 'Membresía mensual' : 'Monthly membership'}</div>
                                </div>
                                <div className="text-lg font-semibold text-blue-700">
                                  {club.pricing.courtRental.membership.monthly}€
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amenities Tab */}
                  {activeTab === 'amenities' && (
                    <div className="p-6 space-y-6">
                      {hasAmenities && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4">{locale === 'es' ? 'Instalaciones' : 'Facilities'}</h3>
                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(club.amenities).filter(([_, value]) => value === true).map(([key]) => (
                              <div key={key} className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-gray-800 font-medium">
                                  {key === 'parking' ? (locale === 'es' ? 'Parking' : 'Parking') :
                                   key === 'lighting' ? (locale === 'es' ? 'Iluminación' : 'Lighting') :
                                   key === 'proShop' ? (locale === 'es' ? 'Tienda Pro' : 'Pro Shop') :
                                   key === 'restaurant' ? (locale === 'es' ? 'Restaurante' : 'Restaurant') :
                                   key === 'changingRooms' ? (locale === 'es' ? 'Vestuarios' : 'Changing Rooms') :
                                   key === 'wheelchair' ? (locale === 'es' ? 'Acceso silla de ruedas' : 'Wheelchair Access') :
                                   key === 'swimming' ? (locale === 'es' ? 'Piscina' : 'Swimming Pool') :
                                   key === 'gym' ? (locale === 'es' ? 'Gimnasio' : 'Gym') :
                                   key}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasServices && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4">{locale === 'es' ? 'Servicios' : 'Services'}</h3>
                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(club.services).filter(([_, value]) => value === true).map(([key]) => (
                              <div key={key} className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <span className="text-gray-800 font-medium">
                                  {key === 'lessons' ? (locale === 'es' ? 'Clases' : 'Lessons') :
                                   key === 'coaching' ? (locale === 'es' ? 'Entrenamiento' : 'Coaching') :
                                   key === 'stringing' ? (locale === 'es' ? 'Encordado' : 'Stringing') :
                                   key === 'tournaments' ? (locale === 'es' ? 'Torneos' : 'Tournaments') :
                                   key === 'summerCamps' ? (locale === 'es' ? 'Campus de verano' : 'Summer Camps') :
                                   key}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Desktop Content */}
                <div className="hidden lg:block">
                  {/* Description */}
                  {(club.description?.[locale] || club.description?.es) && (
                    <div className="p-8 border-b border-gray-100">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">{locale === 'es' ? 'Acerca del Club' : 'About the Club'}</h2>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                        {club.description[locale] || club.description.es}
                      </p>
                    </div>
                  )}

                  {/* Amenities & Services - Desktop */}
                  {(hasAmenities || hasServices) && (
                    <div className="p-8 border-b border-gray-100">
                      {hasAmenities && (
                        <div className="mb-8">
                          <h3 className="text-xl font-bold text-gray-800 mb-5">{locale === 'es' ? 'Instalaciones' : 'Facilities'}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(club.amenities).filter(([_, value]) => value === true).map(([key]) => (
                              <div key={key} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-gray-800 font-medium">
                                  {key === 'parking' ? (locale === 'es' ? 'Parking' : 'Parking') :
                                   key === 'lighting' ? (locale === 'es' ? 'Iluminación' : 'Lighting') :
                                   key === 'proShop' ? (locale === 'es' ? 'Tienda Pro' : 'Pro Shop') :
                                   key === 'restaurant' ? (locale === 'es' ? 'Restaurante' : 'Restaurant') :
                                   key === 'changingRooms' ? (locale === 'es' ? 'Vestuarios' : 'Changing Rooms') :
                                   key === 'wheelchair' ? (locale === 'es' ? 'Acceso silla de ruedas' : 'Wheelchair Access') :
                                   key === 'swimming' ? (locale === 'es' ? 'Piscina' : 'Swimming Pool') :
                                   key === 'gym' ? (locale === 'es' ? 'Gimnasio' : 'Gym') :
                                   key}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasServices && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-5">{locale === 'es' ? 'Servicios' : 'Services'}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(club.services).filter(([_, value]) => value === true).map(([key]) => (
                              <div key={key} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <span className="text-gray-800 font-medium">
                                  {key === 'lessons' ? (locale === 'es' ? 'Clases' : 'Lessons') :
                                   key === 'coaching' ? (locale === 'es' ? 'Entrenamiento' : 'Coaching') :
                                   key === 'stringing' ? (locale === 'es' ? 'Encordado' : 'Stringing') :
                                   key === 'tournaments' ? (locale === 'es' ? 'Torneos' : 'Tournaments') :
                                   key === 'summerCamps' ? (locale === 'es' ? 'Campus de verano' : 'Summer Camps') :
                                   key}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toned Down Pricing Section - Desktop */}
                  {(club.pricing?.courtRental?.hourly?.min !== null || club.pricing?.courtRental?.membership?.monthly !== null) && (
                    <div className="p-8 bg-gray-50/50">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        {locale === 'es' ? 'Tarifas' : 'Pricing'}
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {club.pricing?.courtRental?.hourly && (() => {
                          const formattedPrice = formatPriceRange(
                            club.pricing.courtRental.hourly.min,
                            club.pricing.courtRental.hourly.max,
                            locale
                          )
                          return formattedPrice ? (
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-emerald-800">{locale === 'es' ? 'Alquiler de pista' : 'Court rental'}</div>
                                  <div className="text-xs text-emerald-600">{locale === 'es' ? 'Tarifa por hora' : 'Hourly rate'}</div>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-emerald-700">
                                {formattedPrice}
                              </div>
                            </div>
                          ) : null
                        })()}
                        {club.pricing?.courtRental?.membership?.monthly !== null && club.pricing?.courtRental?.membership?.monthly !== undefined && (
                          <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-blue-800">{locale === 'es' ? 'Membresía mensual' : 'Monthly membership'}</div>
                                <div className="text-xs text-blue-600">{locale === 'es' ? 'Pago mensual' : 'Monthly payment'}</div>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-blue-700">
                              {club.pricing.courtRental.membership.monthly}€
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Map Section */}
              {club.location?.coordinates && (
                <div className="bg-white lg:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="p-6 lg:p-8 border-b border-gray-100">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      {locale === 'es' ? 'Ubicación' : 'Location'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      {locale === 'es' ? 'Vista satélite con controles interactivos' : 'Satellite view with interactive controls'}
                    </p>
                  </div>
                  <div id="club-map" className="h-64 lg:h-96"></div>
                  <div className="p-4 lg:p-6 bg-gray-50 border-t border-gray-100">
                    <a 
                      href={club.location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${club.location.coordinates.lat},${club.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-parque-purple hover:text-parque-purple/80 font-medium transition-colors group"
                    >
                      <div className="w-8 h-8 bg-parque-purple/10 rounded-lg flex items-center justify-center group-hover:bg-parque-purple/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      {locale === 'es' ? 'Abrir en Google Maps' : 'Open in Google Maps'}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact & Actions (Desktop) */}
            <div className="hidden lg:block space-y-6">
              {/* More Subtle Contact Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  {locale === 'es' ? 'Contacto' : 'Contact'}
                </h3>
                
                <div className="space-y-4">
                  {club.contact?.phone && (
                    <a 
                      href={`tel:${club.contact.phone}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">{locale === 'es' ? 'Teléfono' : 'Phone'}</div>
                        <div className="font-bold text-gray-800">{club.contact.phone}</div>
                      </div>
                    </a>
                  )}

                  {club.contact?.email && (
                    <a 
                      href={`mailto:${club.contact.email}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Email</div>
                        <div className="font-bold text-gray-800 text-sm break-all">{club.contact.email}</div>
                      </div>
                    </a>
                  )}

                  {club.contact?.website && (
                    <a 
                      href={club.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9m-9 9a9 9 0 919-9" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">{locale === 'es' ? 'Sitio web' : 'Website'}</div>
                        <div className="font-bold text-gray-800 text-sm">
                          {locale === 'es' ? 'Visitar sitio web' : 'Visit website'}
                        </div>
                      </div>
                    </a>
                  )}

                  {/* Added Google Maps quick link in contact section */}
                  {club.location?.coordinates && (
                    <a 
                      href={club.location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${club.location.coordinates.lat},${club.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">{locale === 'es' ? 'Ver en Google Maps' : 'View on Google Maps'}</div>
                        <div className="font-bold text-gray-800 text-sm">
                          {locale === 'es' ? 'Abrir dirección' : 'Open directions'}
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Operating Hours */}
              {club.operatingHours && Object.values(club.operatingHours).some(h => h?.open) && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {locale === 'es' ? 'Horario' : 'Hours'}
                  </h3>
                  <div className="space-y-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const hours = club.operatingHours?.[day]
                      if (!hours || !hours.open || hours.open === 'closed') return null
                      
                      return (
                        <div key={day} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">
                            {locale === 'es' 
                              ? {monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', 
                                 thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', 
                                 sunday: 'Dom'}[day]
                              : day.slice(0, 3)}
                          </span>
                          <span className="font-bold text-gray-800">
                            {hours.open} - {hours.close}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Enhanced CTA Card */}
              <div className="bg-gradient-to-br from-parque-purple via-purple-600 to-parque-green text-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-4">
                    {locale === 'es' 
                      ? '¿Buscas compañeros de juego?'
                      : 'Looking for playing partners?'}
                  </h3>
                  <p className="mb-6 text-white/90 text-lg leading-relaxed">
                    {locale === 'es'
                      ? 'Únete a nuestra liga amateur y encuentra jugadores de tu nivel'
                      : 'Join our amateur league and find players at your level'}
                  </p>
                  <Link
                    href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${getCityLeagueSlug(city)}`}
                    className="block w-full bg-white text-parque-purple text-center py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
                  >
                    {locale === 'es' ? 'Únete a la Liga' : 'Join the League'}
                  </Link>
                </div>
              </div>

              {/* Nearby Clubs */}
              {nearbyClubs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    {locale === 'es' ? 'Clubs Cercanos' : 'Nearby Clubs'}
                  </h3>
                  <div className="space-y-4">
                    {nearbyClubs.slice(0, 3).map(nearbyClub => {
                      const nearbyCourtInfo = getCourtInfo(nearbyClub.courts)
                      return (
                        <Link
                          key={nearbyClub._id}
                          href={`/${locale}/clubs/${city}/${nearbyClub.slug}`}
                          className="block p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 hover:border-gray-200 hover:shadow-md group"
                        >
                          <h4 className="font-bold text-gray-900 group-hover:text-parque-purple transition-colors">{nearbyClub.name}</h4>
                          <p className="text-sm text-gray-600 mt-2">{nearbyClub.location?.address}</p>
                          {nearbyCourtInfo.total > 0 && (
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {nearbyCourtInfo.total} {locale === 'es' ? 'pistas' : 'courts'}
                              </span>
                              <span className="text-parque-purple group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50 pb-safe">
        <div className="grid grid-cols-2 gap-3 p-4">
          {club.contact?.phone && (
            <a 
              href={`tel:${club.contact.phone}`}
              className="flex items-center justify-center gap-2 bg-parque-purple text-white py-4 px-4 rounded-xl font-semibold shadow-lg hover:bg-parque-purple/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{locale === 'es' ? 'Llamar' : 'Call'}</span>
            </a>
          )}
          <button
            onClick={() => setShowContactModal(true)}
            className={`flex items-center justify-center gap-2 ${
              club.contact?.phone 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-parque-purple text-white col-span-2 hover:bg-parque-purple/90'
            } py-4 px-4 rounded-xl font-semibold shadow-lg transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{locale === 'es' ? 'Más info' : 'More info'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Contact Modal - More Subtle */}
      {showContactModal && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto pb-safe shadow-lg">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center rounded-t-3xl">
              <h3 className="text-xl font-bold text-gray-800">{locale === 'es' ? 'Contacto e información' : 'Contact & Information'}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              {(club.contact?.phone || club.contact?.email || club.contact?.website) && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-4">{locale === 'es' ? 'Contacto' : 'Contact'}</h4>
                  <div className="space-y-4">
                    {club.contact?.phone && (
                      <a 
                        href={`tel:${club.contact.phone}`}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">{locale === 'es' ? 'Teléfono' : 'Phone'}</div>
                          <div className="font-bold text-gray-800">{club.contact.phone}</div>
                        </div>
                      </a>
                    )}
                    {club.contact?.email && (
                      <a 
                        href={`mailto:${club.contact.email}`}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">Email</div>
                          <div className="font-bold text-gray-800 text-sm break-all">{club.contact.email}</div>
                        </div>
                      </a>
                    )}
                    {club.contact?.website && (
                      <a 
                        href={club.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9m-9 9a9 9 0 919-9" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">{locale === 'es' ? 'Sitio web' : 'Website'}</div>
                          <div className="font-bold text-gray-800 text-sm">
                            {locale === 'es' ? 'Visitar sitio web' : 'Visit website'}
                          </div>
                        </div>
                      </a>
                    )}
                    {club.location?.coordinates && (
                      <a 
                        href={club.location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${club.location.coordinates.lat},${club.location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">{locale === 'es' ? 'Ver en Google Maps' : 'View on Google Maps'}</div>
                          <div className="font-bold text-gray-800 text-sm">
                            {locale === 'es' ? 'Abrir dirección' : 'Open directions'}
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Operating Hours */}
              {club.operatingHours && Object.values(club.operatingHours).some(h => h?.open) && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-4">{locale === 'es' ? 'Horario' : 'Hours'}</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const hours = club.operatingHours?.[day]
                      if (!hours || !hours.open || hours.open === 'closed') return null
                      
                      return (
                        <div key={day} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                          <span className="text-gray-700 font-medium">
                            {locale === 'es' 
                              ? {monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', 
                                 thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', 
                                 sunday: 'Domingo'}[day]
                              : day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                          <span className="font-bold text-gray-800">
                            {hours.open} - {hours.close}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="pt-4 border-t">
                <Link
                  href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${getCityLeagueSlug(city)}`}
                  className="block w-full bg-parque-purple text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg"
                >
                  {locale === 'es' ? 'Únete a la Liga' : 'Join the League'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer content={t.footer} />
    </div>
  )
}