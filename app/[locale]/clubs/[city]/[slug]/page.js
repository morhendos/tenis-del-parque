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

  // Helper function to format price display
  const formatPriceRange = (min, max, locale) => {
    // Check if we have valid values
    const hasMin = min !== null && min !== undefined && min !== ''
    const hasMax = max !== null && max !== undefined && max !== ''
    
    if (hasMin && hasMax) {
      // Both values exist - show range
      return `${min}€ - ${max}€`
    } else if (hasMin) {
      // Only minimum value exists - show single price
      return locale === 'es' ? `Desde ${min}€` : `From ${min}€`
    } else if (hasMax) {
      // Only maximum value exists (rare case)
      return locale === 'es' ? `Hasta ${max}€` : `Up to ${max}€`
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
            ${courtInfo.total > 0 ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 13px;">🎾 ${courtInfo.total} ${locale === 'es' ? 'pistas' : 'courts'}</p>` : ''}
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

  // Collect all images with proper deduplication
  const allImages = useMemo(() => {
    if (!club) return []
    const imageSet = new Set()
    const images = []
    
    // Add main image first
    if (club.images?.main) {
      imageSet.add(club.images.main)
      images.push(club.images.main)
    }
    
    // Add gallery images (skip duplicates)
    if (club.images?.gallery && Array.isArray(club.images.gallery)) {
      club.images.gallery.forEach(img => {
        if (!imageSet.has(img)) {
          imageSet.add(img)
          images.push(img)
        }
      })
    }
    
    // Add Google photos (skip duplicates)
    if (club.googleData?.photos && Array.isArray(club.googleData.photos)) {
      club.googleData.photos.forEach(photo => {
        const googlePhotoUrl = `/api/admin/clubs/google-photo?photo_reference=${photo.photo_reference}`
        if (!imageSet.has(googlePhotoUrl)) {
          imageSet.add(googlePhotoUrl)
          images.push(googlePhotoUrl)
        }
      })
    }
    
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
          {/* Mobile Breadcrumb - Fixed truncation issue */}
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

          {/* Main Content Grid - Mobile First */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 pb-12">
            {/* Left Column - Images & Info */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Mobile-First Image Gallery */}
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
                      quality={85}
                      className={`object-cover ${imageLoading[selectedImage] ? 'opacity-0' : 'opacity-100'}`}
                      onError={handleMainImageError}
                      onLoadingComplete={handleMainImageLoad}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      priority={selectedImage === 0}
                    />
                    {club.featured && (
                      <div className="absolute top-2 left-2 lg:top-4 lg:left-4 bg-yellow-400 text-gray-900 px-2 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-base font-semibold shadow-lg">
                        ⭐ {locale === 'es' ? 'Club Destacado' : 'Featured Club'}
                      </div>
                    )}
                    {allImages.length > 1 && (
                      <>
                        {/* Mobile-optimized navigation buttons - FIXED CENTERING */}
                        <button
                          onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                          className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 lg:p-2 rounded-full shadow-lg transition-colors flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                          className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 lg:p-2 rounded-full shadow-lg transition-colors flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnail strip - Now visible on ALL screen sizes */}
                  {allImages.length > 1 && (
                    <div className="flex p-3 lg:p-4 gap-2 overflow-x-auto bg-gray-50">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                            selectedImage === idx ? 'border-parque-purple ring-2 ring-parque-purple/20' : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <Image 
                            src={img} 
                            alt={`${club.name} ${idx + 1}`}
                            fill
                            sizes="80px"
                            quality={60}
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

              {/* Mobile-optimized Club Information */}
              <div className="bg-white lg:rounded-2xl shadow-lg overflow-hidden">
                {/* Club Header - Mobile Optimized */}
                <div className="p-4 lg:p-6 border-b">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-gray-600 text-sm lg:text-base">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="break-words">{club.fullAddress}</span>
                    </div>
                    {club.googleData?.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{club.googleData.rating}</span>
                        <span className="text-gray-500">({club.googleData.userRatingsTotal} {locale === 'es' ? 'reseñas' : 'reviews'})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Tab Navigation - FIXED ALIGNMENT with override for global margin */}
                <div className="lg:hidden border-b sticky top-16 bg-white z-10">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors !mb-0 ${
                        activeTab === 'info' 
                          ? 'border-parque-purple text-parque-purple' 
                          : 'border-transparent text-gray-600'
                      }`}
                      style={{ marginBottom: '0' }}
                    >
                      {locale === 'es' ? 'Información' : 'Information'}
                    </button>
                    <button
                      onClick={() => setActiveTab('courts')}
                      className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors !mb-0 ${
                        activeTab === 'courts' 
                          ? 'border-parque-purple text-parque-purple' 
                          : 'border-transparent text-gray-600'
                      }`}
                      style={{ marginBottom: '0' }}
                    >
                      {locale === 'es' ? 'Pistas' : 'Courts'}
                    </button>
                    <button
                      onClick={() => setActiveTab('amenities')}
                      className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors !mb-0 ${
                        activeTab === 'amenities' 
                          ? 'border-parque-purple text-parque-purple' 
                          : 'border-transparent text-gray-600'
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
                    <div className="p-4 space-y-4">
                      {/* Quick Stats - Mobile Grid */}
                      {courtInfo.total > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-parque-purple">{courtInfo.total}</div>
                            <div className="text-xs text-gray-600">{locale === 'es' ? 'Pistas totales' : 'Total courts'}</div>
                          </div>
                          {courtInfo.indoor > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-2xl font-bold text-blue-600">{courtInfo.indoor}</div>
                              <div className="text-xs text-gray-600">{locale === 'es' ? 'Cubiertas' : 'Indoor'}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Description */}
                      {(club.description?.[locale] || club.description?.es) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{locale === 'es' ? 'Acerca del Club' : 'About the Club'}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                            {club.description[locale] || club.description.es}
                          </p>
                        </div>
                      )}

                      {/* Pricing - Using the new formatPriceRange function */}
                      {(club.pricing?.courtRental?.hourly?.min !== null || club.pricing?.courtRental?.membership?.monthly !== null) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">{locale === 'es' ? 'Precios' : 'Pricing'}</h3>
                          <div className="space-y-2">
                            {club.pricing?.courtRental?.hourly && (() => {
                              const formattedPrice = formatPriceRange(
                                club.pricing.courtRental.hourly.min,
                                club.pricing.courtRental.hourly.max,
                                locale
                              )
                              return formattedPrice ? (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-600 mb-1">{locale === 'es' ? 'Alquiler por hora' : 'Hourly rental'}</div>
                                  <div className="text-xl font-bold text-parque-purple">
                                    {formattedPrice}
                                  </div>
                                </div>
                              ) : null
                            })()}
                            {club.pricing?.courtRental?.membership?.monthly !== null && club.pricing?.courtRental?.membership?.monthly !== undefined && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-600 mb-1">{locale === 'es' ? 'Membresía mensual' : 'Monthly membership'}</div>
                                <div className="text-xl font-bold text-parque-purple">
                                  {club.pricing.courtRental.membership.monthly}€
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Courts Tab */}
                  {activeTab === 'courts' && courtInfo.total > 0 && (
                    <div className="p-4 space-y-4">
                      {/* Sport breakdown */}
                      {(courtInfo.sports.tennis > 0 || courtInfo.sports.padel > 0 || courtInfo.sports.pickleball > 0) && (
                        <div className="space-y-2">
                          {courtInfo.sports.tennis > 0 && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🎾</span>
                                <div>
                                  <div className="font-medium">{locale === 'es' ? 'Tenis' : 'Tennis'}</div>
                                  <div className="text-sm text-gray-600">
                                    {courtInfo.sports.tennis} {locale === 'es' ? 'pistas' : 'courts'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {courtInfo.sports.padel > 0 && (
                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🏸</span>
                                <div>
                                  <div className="font-medium">{locale === 'es' ? 'Pádel' : 'Padel'}</div>
                                  <div className="text-sm text-gray-600">
                                    {courtInfo.sports.padel} {locale === 'es' ? 'pistas' : 'courts'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {courtInfo.sports.pickleball > 0 && (
                            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🏓</span>
                                <div>
                                  <div className="font-medium">Pickleball</div>
                                  <div className="text-sm text-gray-600">
                                    {courtInfo.sports.pickleball} {locale === 'es' ? 'pistas' : 'courts'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Surfaces */}
                      {courtInfo.surfaces.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">{locale === 'es' ? 'Superficies' : 'Surfaces'}</h3>
                          <div className="space-y-2">
                            {courtInfo.surfaces.map((surface, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium">
                                  {surface.type === 'clay' ? (locale === 'es' ? 'Tierra batida' : 'Clay') :
                                   surface.type === 'hard' ? (locale === 'es' ? 'Pista dura' : 'Hard court') :
                                   surface.type === 'grass' ? (locale === 'es' ? 'Césped' : 'Grass') :
                                   surface.type === 'synthetic' ? (locale === 'es' ? 'Sintética' : 'Synthetic') :
                                   surface.type}
                                </span>
                                <span className="bg-parque-purple/10 text-parque-purple px-2 py-1 rounded font-bold">
                                  {surface.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amenities Tab */}
                  {activeTab === 'amenities' && (
                    <div className="p-4 space-y-4">
                      {hasAmenities && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">{locale === 'es' ? 'Instalaciones' : 'Facilities'}</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(club.amenities).filter(([_, value]) => value === true).map(([key]) => (
                              <div key={key} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700 text-sm">
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
                          <h3 className="text-lg font-semibold mb-3">{locale === 'es' ? 'Servicios' : 'Services'}</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(club.services).filter(([_, value]) => value === true).map(([key]) => (
                              <div key={key} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700 text-sm">
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

                {/* Desktop Content - Hidden on Mobile */}
                <div className="hidden lg:block">
                  {/* Quick Stats */}
                  {courtInfo.total > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-parque-purple">{courtInfo.total}</div>
                        <div className="text-sm text-gray-600">{locale === 'es' ? 'Pistas totales' : 'Total courts'}</div>
                      </div>
                      {courtInfo.indoor > 0 && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{courtInfo.indoor}</div>
                          <div className="text-sm text-gray-600">{locale === 'es' ? 'Cubiertas' : 'Indoor'}</div>
                        </div>
                      )}
                      {courtInfo.surfaces.length > 0 && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{courtInfo.surfaces.length}</div>
                          <div className="text-sm text-gray-600">{locale === 'es' ? 'Superficies' : 'Surfaces'}</div>
                        </div>
                      )}
                      {club.pricing?.publicAccess !== null && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {club.pricing.publicAccess ? '✓' : '✗'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {club.pricing.publicAccess ? (locale === 'es' ? 'Público' : 'Public') : (locale === 'es' ? 'Privado' : 'Private')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {(club.description?.[locale] || club.description?.es) && (
                    <div className="p-6 border-t">
                      <h2 className="text-xl font-semibold mb-3">{locale === 'es' ? 'Acerca del Club' : 'About the Club'}</h2>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {club.description[locale] || club.description.es}
                      </p>
                    </div>
                  )}

                  {/* Courts Information - Desktop */}
                  {courtInfo.total > 0 && (
                    <div className="p-6 border-t">
                      <h2 className="text-xl font-semibold mb-4">{locale === 'es' ? 'Pistas y Superficies' : 'Courts & Surfaces'}</h2>
                      
                      {/* Display sports for new structure */}
                      {(courtInfo.sports.tennis > 0 || courtInfo.sports.padel > 0 || courtInfo.sports.pickleball > 0) && (
                        <div className="grid md:grid-cols-3 gap-3 mb-4">
                          {courtInfo.sports.tennis > 0 && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🎾</span>
                                <div>
                                  <div className="font-medium">{locale === 'es' ? 'Tenis' : 'Tennis'}</div>
                                  <div className="text-sm text-gray-600">
                                    {courtInfo.sports.tennis} {locale === 'es' ? 'pistas' : 'courts'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {courtInfo.sports.padel > 0 && (
                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🏸</span>
                                <div>
                                  <div className="font-medium">{locale === 'es' ? 'Pádel' : 'Padel'}</div>
                                  <div className="text-sm text-gray-600">
                                    {courtInfo.sports.padel} {locale === 'es' ? 'pistas' : 'courts'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {courtInfo.sports.pickleball > 0 && (
                            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🏓</span>
                                <div>
                                  <div className="font-medium">Pickleball</div>
                                  <div className="text-sm text-gray-600">
                                    {courtInfo.sports.pickleball} {locale === 'es' ? 'pistas' : 'courts'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Display surfaces for old structure */}
                      {courtInfo.surfaces.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-3">
                          {courtInfo.surfaces.map((surface, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-parque-purple/10 flex items-center justify-center">
                                  <span className="text-parque-purple font-bold">{surface.count}</span>
                                </div>
                                <span className="font-medium">
                                  {surface.type === 'clay' ? (locale === 'es' ? 'Tierra batida' : 'Clay') :
                                   surface.type === 'hard' ? (locale === 'es' ? 'Pista dura' : 'Hard court') :
                                   surface.type === 'grass' ? (locale === 'es' ? 'Césped' : 'Grass') :
                                   surface.type === 'synthetic' ? (locale === 'es' ? 'Sintética' : 'Synthetic') :
                                   surface.type === 'padel' ? 'Pádel' :
                                   surface.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amenities & Services - Desktop */}
                  {(hasAmenities || hasServices) && (
                    <div className="p-6 border-t">
                      {hasAmenities && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3">{locale === 'es' ? 'Instalaciones' : 'Facilities'}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(club.amenities).filter(([_, value]) => value === true).map(([key]) => (
                              <div key={key} className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">
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
                          <h3 className="text-lg font-semibold mb-3">{locale === 'es' ? 'Servicios' : 'Services'}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(club.services).filter(([_, value]) => value === true).map(([key]) => (
                              <div key={key} className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700">
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

                  {/* Pricing - Desktop - Using the new formatPriceRange function */}
                  {(club.pricing?.courtRental?.hourly?.min !== null || club.pricing?.courtRental?.membership?.monthly !== null) && (
                    <div className="p-6 border-t bg-gray-50">
                      <h2 className="text-xl font-semibold mb-4">{locale === 'es' ? 'Precios' : 'Pricing'}</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {club.pricing?.courtRental?.hourly && (() => {
                          const formattedPrice = formatPriceRange(
                            club.pricing.courtRental.hourly.min,
                            club.pricing.courtRental.hourly.max,
                            locale
                          )
                          return formattedPrice ? (
                            <div className="bg-white p-4 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">{locale === 'es' ? 'Alquiler por hora' : 'Hourly rental'}</div>
                              <div className="text-2xl font-bold text-parque-purple">
                                {formattedPrice}
                              </div>
                            </div>
                          ) : null
                        })()}
                        {club.pricing?.courtRental?.membership?.monthly !== null && club.pricing?.courtRental?.membership?.monthly !== undefined && (
                          <div className="bg-white p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">{locale === 'es' ? 'Membresía mensual' : 'Monthly membership'}</div>
                            <div className="text-2xl font-bold text-parque-purple">
                              {club.pricing.courtRental.membership.monthly}€
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Section - NOW VISIBLE ON MOBILE TOO */}
              {club.location?.coordinates && (
                <div className="bg-white lg:rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-4 lg:p-6 border-b">
                    <h2 className="text-lg lg:text-xl font-semibold">{locale === 'es' ? 'Ubicación' : 'Location'}</h2>
                    <p className="text-xs lg:text-sm text-gray-600 mt-1">
                      {locale === 'es' ? 'Vista satélite con controles de zoom' : 'Satellite view with zoom controls'}
                    </p>
                  </div>
                  <div id="club-map" className="h-64 lg:h-96"></div>
                  <div className="p-3 lg:p-4 bg-gray-50">
                    <a 
                      href={club.location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${club.location.coordinates.lat},${club.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-parque-purple hover:underline text-sm"
                    >
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {locale === 'es' ? 'Ver en Google Maps' : 'View on Google Maps'}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact & Actions (Desktop) */}
            <div className="hidden lg:block space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">{locale === 'es' ? 'Contacto' : 'Contact'}</h3>
                
                <div className="space-y-4">
                  {club.contact?.phone && (
                    <a 
                      href={`tel:${club.contact.phone}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-parque-purple/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">{locale === 'es' ? 'Teléfono' : 'Phone'}</div>
                        <div className="font-semibold">{club.contact.phone}</div>
                      </div>
                    </a>
                  )}

                  {club.contact?.email && (
                    <a 
                      href={`mailto:${club.contact.email}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-parque-purple/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-semibold text-sm break-all">{club.contact.email}</div>
                      </div>
                    </a>
                  )}

                  {club.contact?.website && (
                    <a 
                      href={club.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-parque-purple/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">{locale === 'es' ? 'Sitio web' : 'Website'}</div>
                        <div className="font-semibold text-sm text-parque-purple">
                          {locale === 'es' ? 'Visitar sitio' : 'Visit website'}
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Operating Hours */}
              {club.operatingHours && Object.values(club.operatingHours).some(h => h?.open) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">{locale === 'es' ? 'Horario' : 'Hours'}</h3>
                  <div className="space-y-2 text-sm">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const hours = club.operatingHours?.[day]
                      if (!hours || !hours.open || hours.open === 'closed') return null
                      
                      return (
                        <div key={day} className="flex justify-between py-1">
                          <span className="text-gray-600">
                            {locale === 'es' 
                              ? {monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', 
                                 thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', 
                                 sunday: 'Dom'}[day]
                              : day.slice(0, 3)}
                          </span>
                          <span className="font-medium">
                            {hours.open} - {hours.close}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-parque-purple to-parque-green text-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-3">
                  {locale === 'es' 
                    ? '¿Buscas compañeros de juego?'
                    : 'Looking for playing partners?'}
                </h3>
                <p className="mb-4 text-white/90">
                  {locale === 'es'
                    ? 'Únete a nuestra liga amateur y encuentra jugadores de tu nivel'
                    : 'Join our amateur league and find players at your level'}
                </p>
                <Link
                  href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${city}`}
                  className="block w-full bg-white text-parque-purple text-center py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {locale === 'es' ? 'Únete a la Liga' : 'Join the League'}
                </Link>
              </div>

              {/* Nearby Clubs */}
              {nearbyClubs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {locale === 'es' ? 'Clubs Cercanos' : 'Nearby Clubs'}
                  </h3>
                  <div className="space-y-3">
                    {nearbyClubs.slice(0, 3).map(nearbyClub => {
                      const nearbyCourtInfo = getCourtInfo(nearbyClub.courts)
                      return (
                        <Link
                          key={nearbyClub._id}
                          href={`/${locale}/clubs/${city}/${nearbyClub.slug}`}
                          className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <h4 className="font-semibold text-gray-900">{nearbyClub.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{nearbyClub.location?.address}</p>
                          {nearbyCourtInfo.total > 0 && (
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {nearbyCourtInfo.total} {locale === 'es' ? 'pistas' : 'courts'}
                              </span>
                              <span className="text-parque-purple">→</span>
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

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 pb-safe">
        <div className="grid grid-cols-2 gap-2 p-3">
          {club.contact?.phone && (
            <a 
              href={`tel:${club.contact.phone}`}
              className="flex items-center justify-center gap-2 bg-parque-purple text-white py-3 px-4 rounded-lg font-medium"
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
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-parque-purple text-white col-span-2'
            } py-3 px-4 rounded-lg font-medium`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{locale === 'es' ? 'Más info' : 'More info'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Contact Modal */}
      {showContactModal && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto pb-safe">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{locale === 'es' ? 'Contacto e información' : 'Contact & Information'}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Contact Information */}
              {(club.contact?.phone || club.contact?.email || club.contact?.website) && (
                <div>
                  <h4 className="font-medium mb-3">{locale === 'es' ? 'Contacto' : 'Contact'}</h4>
                  <div className="space-y-3">
                    {club.contact?.phone && (
                      <a 
                        href={`tel:${club.contact.phone}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-parque-purple/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">{locale === 'es' ? 'Teléfono' : 'Phone'}</div>
                          <div className="font-medium">{club.contact.phone}</div>
                        </div>
                      </a>
                    )}
                    {club.contact?.email && (
                      <a 
                        href={`mailto:${club.contact.email}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-parque-purple/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Email</div>
                          <div className="font-medium text-sm break-all">{club.contact.email}</div>
                        </div>
                      </a>
                    )}
                    {club.contact?.website && (
                      <a 
                        href={club.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-parque-purple/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">{locale === 'es' ? 'Sitio web' : 'Website'}</div>
                          <div className="font-medium text-sm text-parque-purple">
                            {locale === 'es' ? 'Visitar sitio' : 'Visit website'}
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
                  <h4 className="font-medium mb-3">{locale === 'es' ? 'Horario' : 'Hours'}</h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const hours = club.operatingHours?.[day]
                      if (!hours || !hours.open || hours.open === 'closed') return null
                      
                      return (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {locale === 'es' 
                              ? {monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', 
                                 thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', 
                                 sunday: 'Domingo'}[day]
                              : day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                          <span className="font-medium">
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
                  href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${city}`}
                  className="block w-full bg-parque-purple text-white text-center py-3 rounded-lg font-semibold"
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
