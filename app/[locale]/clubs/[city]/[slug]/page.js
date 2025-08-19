'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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

      const map = new window.google.maps.Map(mapElement, {
        center: { 
          lat: club.location.coordinates.lat, 
          lng: club.location.coordinates.lng 
        },
        zoom: 17, // Close zoom to see the club clearly
        mapTypeId: 'satellite', // Satellite view by default for better visualization
        zoomControl: true, // Enable zoom controls
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER // Position zoom controls on the right
        },
        mapTypeControl: true, // Allow switching between map types
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ['satellite', 'hybrid', 'terrain', 'roadmap']
        },
        streetViewControl: true, // Enable street view
        streetViewControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        },
        fullscreenControl: true, // Enable fullscreen button
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

      // Add marker for the club with a nice bounce animation
      const marker = new window.google.maps.Marker({
        position: { 
          lat: club.location.coordinates.lat, 
          lng: club.location.coordinates.lng 
        },
        map: map,
        title: club.name,
        animation: window.google.maps.Animation.DROP, // Drop animation when marker appears
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#7C3AED',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      })

      // Add info window that opens when clicking the marker
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; color: #7C3AED; font-weight: bold;">${club.name}</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">${club.location.address}</p>
            ${club.courts?.total ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 13px;">🎾 ${club.courts.total} ${locale === 'es' ? 'pistas' : 'courts'}</p>` : ''}
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

  // Collect all images
  const allImages = useMemo(() => {
    if (!club) return []
    const images = []
    
    if (club.images?.main) {
      images.push(club.images.main)
    }
    
    if (club.images?.gallery && Array.isArray(club.images.gallery)) {
      images.push(...club.images.gallery)
    }
    
    if (club.googleData?.photos && Array.isArray(club.googleData.photos)) {
      images.push(...club.googleData.photos.map(photo => 
        `/api/admin/clubs/google-photo?photo_reference=${photo.photo_reference}`
      ))
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation locale={locale} />
      
      {/* Hero Section with Image Gallery */}
      <section className="relative pt-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm py-4 text-gray-600">
            <Link href={`/${locale}`} className="hover:text-gray-900">
              {locale === 'es' ? 'Inicio' : 'Home'}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/clubs`} className="hover:text-gray-900">
              {locale === 'es' ? 'Clubs' : 'Clubs'}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/clubs/${city}`} className="hover:text-gray-900 capitalize">
              {city.replace(/-/g, ' ')}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{club.name}</span>
          </nav>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 pb-12">
            {/* Left Column - Images & Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              {allImages.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <img 
                      src={allImages[selectedImage]} 
                      alt={club.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/800/500'
                      }}
                    />
                    {club.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-semibold shadow-lg">
                        ⭐ {locale === 'es' ? 'Club Destacado' : 'Featured Club'}
                      </div>
                    )}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div className="p-4 flex gap-2 overflow-x-auto">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === idx ? 'border-parque-purple' : 'border-transparent'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`${club.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/80/80'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-parque-purple to-parque-green rounded-2xl shadow-lg h-96 flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xl">{club.name}</p>
                  </div>
                </div>
              )}

              {/* Club Information Tabs */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Club Header */}
                <div className="p-6 border-b">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{club.fullAddress}</span>
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

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
                  {club.courts?.total > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-parque-purple">{club.courts.total}</div>
                      <div className="text-sm text-gray-600">{locale === 'es' ? 'Pistas totales' : 'Total courts'}</div>
                    </div>
                  )}
                  {club.courts?.indoor > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{club.courts.indoor}</div>
                      <div className="text-sm text-gray-600">{locale === 'es' ? 'Cubiertas' : 'Indoor'}</div>
                    </div>
                  )}
                  {club.courts?.surfaces?.length > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{club.courts.surfaces.length}</div>
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

                {/* Description */}
                {(club.description?.[locale] || club.description?.es) && (
                  <div className="p-6 border-t">
                    <h2 className="text-xl font-semibold mb-3">{locale === 'es' ? 'Acerca del Club' : 'About the Club'}</h2>
                    <p className="text-gray-600 leading-relaxed">
                      {club.description[locale] || club.description.es}
                    </p>
                  </div>
                )}

                {/* Courts Information */}
                {club.courts?.surfaces?.length > 0 && (
                  <div className="p-6 border-t">
                    <h2 className="text-xl font-semibold mb-4">{locale === 'es' ? 'Pistas y Superficies' : 'Courts & Surfaces'}</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                      {club.courts.surfaces.map((surface, idx) => (
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
                  </div>
                )}

                {/* Amenities & Services */}
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
                                 key === 'showers' ? (locale === 'es' ? 'Duchas' : 'Showers') :
                                 key === 'lockers' ? (locale === 'es' ? 'Taquillas' : 'Lockers') :
                                 key === 'wheelchair' ? (locale === 'es' ? 'Acceso silla de ruedas' : 'Wheelchair Access') :
                                 key === 'swimming' ? (locale === 'es' ? 'Piscina' : 'Swimming Pool') :
                                 key === 'gym' ? (locale === 'es' ? 'Gimnasio' : 'Gym') :
                                 key === 'sauna' ? (locale === 'es' ? 'Sauna' : 'Sauna') :
                                 key === 'physio' ? (locale === 'es' ? 'Fisioterapia' : 'Physiotherapy') :
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

                {/* Pricing */}
                {(club.pricing?.courtRental?.hourly?.min !== null || club.pricing?.courtRental?.membership?.monthly !== null) && (
                  <div className="p-6 border-t bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4">{locale === 'es' ? 'Precios' : 'Pricing'}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {club.pricing?.courtRental?.hourly?.min !== null && (
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">{locale === 'es' ? 'Alquiler por hora' : 'Hourly rental'}</div>
                          <div className="text-2xl font-bold text-parque-purple">
                            {club.pricing.courtRental.hourly.min}€ - {club.pricing.courtRental.hourly.max}€
                          </div>
                        </div>
                      )}
                      {club.pricing?.courtRental?.membership?.monthly !== null && (
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

              {/* Map Section */}
              {club.location?.coordinates && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">{locale === 'es' ? 'Ubicación' : 'Location'}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {locale === 'es' ? 'Vista satélite con controles de zoom' : 'Satellite view with zoom controls'}
                    </p>
                  </div>
                  <div id="club-map" className="h-96"></div>
                  <div className="p-4 bg-gray-50">
                    <a 
                      href={club.location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${club.location.coordinates.lat},${club.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-parque-purple hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {locale === 'es' ? 'Ver en Google Maps' : 'View on Google Maps'}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact & Actions */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">{locale === 'es' ? 'Contacto' : 'Contact'}</h3>
                
                <div className="space-y-4">
                  {club.contact.phone && (
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

                  {club.contact.email && (
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

                  {club.contact.website && (
                    <a 
                      href={club.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-parque-purple/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
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

                  {(club.contact.facebook || club.contact.instagram) && (
                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-600 mb-2">{locale === 'es' ? 'Redes sociales' : 'Social media'}</div>
                      <div className="flex gap-2">
                        {club.contact.facebook && (
                          <a 
                            href={club.contact.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                          >
                            <span className="text-blue-600 font-bold">f</span>
                          </a>
                        )}
                        {club.contact.instagram && (
                          <a 
                            href={`https://instagram.com/${club.contact.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors"
                          >
                            <span className="text-pink-600 font-bold">ig</span>
                          </a>
                        )}
                      </div>
                    </div>
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
                      if (!hours || !hours.open) return null
                      
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
                    {nearbyClubs.slice(0, 3).map(nearbyClub => (
                      <Link
                        key={nearbyClub._id}
                        href={`/${locale}/clubs/${city}/${nearbyClub.slug}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-semibold text-gray-900">{nearbyClub.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{nearbyClub.location.address}</p>
                        {nearbyClub.courts?.total > 0 && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {nearbyClub.courts.total} {locale === 'es' ? 'pistas' : 'courts'}
                            </span>
                            <span className="text-parque-purple">→</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer content={t.footer} />
    </div>
  )
}
