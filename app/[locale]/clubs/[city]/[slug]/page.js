'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import ClubCard from '@/components/clubs/ClubCard'
import { homeContent } from '@/lib/content/homeContent'

export default function ClubDetailPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const city = params.city
  const slug = params.slug
  
  const [club, setClub] = useState(null)
  const [nearbyClubs, setNearbyClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  
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
          <Link href={`/${locale}/clubs/${city}`} className="text-parque-purple hover:underline">
            {locale === 'es' ? '← Volver a clubs' : '← Back to clubs'}
          </Link>
        </div>
      </div>
    )
  }

  const formatSchedule = (hours) => {
    if (!hours || !hours.open || !hours.close) return locale === 'es' ? 'Cerrado' : 'Closed'
    return `${hours.open} - ${hours.close}`
  }

  // Helper to check if any amenity exists
  const hasAmenities = Object.values(club.amenities || {}).some(v => v === true)
  
  // Helper to check if any service exists
  const hasServices = Object.values(club.services || {}).some(v => v === true)
  
  // Helper to check if courts data exists
  const hasCourtsData = club.courts?.total > 0
  
  // Helper to check if pricing exists
  const hasPricing = (club.pricing?.courtRental?.hourly?.min !== null && club.pricing?.courtRental?.hourly?.max !== null) ||
                     (club.pricing?.courtRental?.membership?.monthly !== null || club.pricing?.courtRental?.membership?.annual !== null)
  
  // Helper to check if schedule exists
  const hasSchedule = club.operatingHours && Object.values(club.operatingHours).some(hours => hours?.open || hours?.close)
  
  // Filter tabs based on available data
  const availableTabs = [
    { id: 'info', label: { es: 'Información', en: 'Information' }, show: true },
    { id: 'courts', label: { es: 'Pistas', en: 'Courts' }, show: hasCourtsData },
    { id: 'pricing', label: { es: 'Precios', en: 'Pricing' }, show: hasPricing },
    { id: 'schedule', label: { es: 'Horarios', en: 'Schedule' }, show: hasSchedule },
    { id: 'contact', label: { es: 'Contacto', en: 'Contact' }, show: true }
  ].filter(tab => tab.show)

  // Set initial tab to first available
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id)
    }
  }, [availableTabs])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation locale={locale} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        {/* Background image if available */}
        {club.images?.main && (
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={club.images.main} 
              alt={club.name}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/80 to-parque-green/80"></div>
          </div>
        )}
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-6xl">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm mb-4 text-white/80">
              <Link href={`/${locale}`} className="hover:text-white">
                {locale === 'es' ? 'Inicio' : 'Home'}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/clubs`} className="hover:text-white">
                {locale === 'es' ? 'Clubs' : 'Clubs'}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/clubs/${city}`} className="hover:text-white capitalize">
                {city}
              </Link>
              <span>/</span>
              <span className="text-white">{club.name}</span>
            </nav>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {club.name}
                </h1>
                {(club.description?.[locale] || club.description?.es) && (
                  <p className="text-xl text-white/90 mb-6">
                    {club.description[locale] || club.description.es}
                  </p>
                )}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    <span>{club.fullAddress}</span>
                  </div>
                  {club.featured && (
                    <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-semibold">
                      ⭐ {locale === 'es' ? 'Club Destacado' : 'Featured Club'}
                    </span>
                  )}
                  {club.googleData?.rating && (
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      ⭐ {club.googleData.rating} ({club.googleData.userRatingsTotal} {locale === 'es' ? 'reseñas' : 'reviews'})
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      {locale === 'es' ? 'Información Rápida' : 'Quick Info'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      {hasCourtsData && (
                        <>
                          <div className="flex justify-between">
                            <span>{locale === 'es' ? 'Pistas totales:' : 'Total courts:'}</span>
                            <span className="font-semibold">{club.courts.total}</span>
                          </div>
                          {club.courts.indoor > 0 && (
                            <div className="flex justify-between">
                              <span>{locale === 'es' ? 'Pistas cubiertas:' : 'Indoor courts:'}</span>
                              <span className="font-semibold">{club.courts.indoor}</span>
                            </div>
                          )}
                        </>
                      )}
                      {club.pricing?.publicAccess !== null && (
                        <div className="flex justify-between">
                          <span>{locale === 'es' ? 'Acceso:' : 'Access:'}</span>
                          <span className="font-semibold">
                            {club.pricing.publicAccess 
                              ? (locale === 'es' ? 'Público' : 'Public')
                              : (locale === 'es' ? 'Solo socios' : 'Members only')
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {club.contact.phone && (
                    <a 
                      href={`tel:${club.contact.phone}`}
                      className="block w-full bg-white text-parque-purple text-center py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      📞 {club.contact.phone}
                    </a>
                  )}
                  {club.contact.website && (
                    <a 
                      href={club.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-white/20 text-white text-center py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                    >
                      🌐 {locale === 'es' ? 'Visitar sitio web' : 'Visit website'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-parque-purple text-parque-purple'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label[locale]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'info' && (
                <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                  {/* Main image if available and no description */}
                  {club.images?.main && !club.description?.[locale] && !club.description?.es && (
                    <div className="mb-6">
                      <img 
                        src={club.images.main} 
                        alt={club.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {(club.description?.[locale] || club.description?.es) && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">
                        {locale === 'es' ? 'Acerca del Club' : 'About the Club'}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {club.description[locale] || club.description.es}
                      </p>
                    </div>
                  )}

                  {/* Amenities - only show if any exist */}
                  {hasAmenities && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        {locale === 'es' ? 'Instalaciones' : 'Facilities'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(club.amenities).filter(([_, value]) => value === true).map(([key]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="text-green-500">✓</span>
                            <span>
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

                  {/* Services - only show if any exist */}
                  {hasServices && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        {locale === 'es' ? 'Servicios Disponibles' : 'Available Services'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(club.services).filter(([_, value]) => value === true).map(([key]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="text-blue-500">✓</span>
                            <span>
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

                  {/* Show message if no information available */}
                  {!club.description?.[locale] && !club.description?.es && !hasAmenities && !hasServices && !club.images?.main && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">
                        {locale === 'es' 
                          ? 'Información adicional próximamente' 
                          : 'Additional information coming soon'}
                      </p>
                      <p className="text-sm">
                        {locale === 'es'
                          ? 'Estamos trabajando para completar la información de este club'
                          : 'We are working to complete the information for this club'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'courts' && hasCourtsData && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {locale === 'es' ? 'Pistas de Tenis' : 'Tennis Courts'}
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-parque-purple">{club.courts.total}</div>
                        <div className="text-sm text-gray-600">
                          {locale === 'es' ? 'Pistas totales' : 'Total courts'}
                        </div>
                      </div>
                      {club.courts.indoor > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">{club.courts.indoor}</div>
                          <div className="text-sm text-gray-600">
                            {locale === 'es' ? 'Pistas cubiertas' : 'Indoor courts'}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {club.courts.surfaces?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          {locale === 'es' ? 'Tipos de Superficie' : 'Surface Types'}
                        </h3>
                        <div className="space-y-2">
                          {club.courts.surfaces.map((surface, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <span className="font-medium">
                                {surface.type === 'clay' ? (locale === 'es' ? 'Tierra batida' : 'Clay') :
                                 surface.type === 'hard' ? (locale === 'es' ? 'Pista dura' : 'Hard court') :
                                 surface.type === 'grass' ? (locale === 'es' ? 'Césped' : 'Grass') :
                                 surface.type === 'synthetic' ? (locale === 'es' ? 'Sintética' : 'Synthetic') :
                                 surface.type === 'padel' ? 'Padel' :
                                 surface.type}
                              </span>
                              <span className="text-sm text-gray-600">
                                {surface.count} {locale === 'es' ? 'pistas' : 'courts'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && hasPricing && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {locale === 'es' ? 'Precios' : 'Pricing'}
                  </h2>
                  
                  {club.pricing?.courtRental?.hourly?.min !== null && club.pricing?.courtRental?.hourly?.max !== null && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">
                        {locale === 'es' ? 'Alquiler de Pistas' : 'Court Rental'}
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-parque-purple">
                          {club.pricing.courtRental.hourly.min}€ - {club.pricing.courtRental.hourly.max}€
                        </div>
                        <div className="text-sm text-gray-600">
                          {locale === 'es' ? 'por hora' : 'per hour'}
                        </div>
                      </div>
                    </div>
                  )}

                  {(club.pricing?.courtRental?.membership?.monthly !== null || club.pricing?.courtRental?.membership?.annual !== null) && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        {locale === 'es' ? 'Membresía' : 'Membership'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {club.pricing.courtRental.membership.monthly !== null && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-xl font-bold">
                              {club.pricing.courtRental.membership.monthly}€
                            </div>
                            <div className="text-sm text-gray-600">
                              {locale === 'es' ? 'Mensual' : 'Monthly'}
                            </div>
                          </div>
                        )}
                        {club.pricing.courtRental.membership.annual !== null && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-xl font-bold">
                              {club.pricing.courtRental.membership.annual}€
                            </div>
                            <div className="text-sm text-gray-600">
                              {locale === 'es' ? 'Anual' : 'Annual'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {club.pricing?.publicAccess !== null && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {club.pricing.publicAccess 
                          ? (locale === 'es' 
                            ? '✓ Este club permite acceso público para alquiler de pistas' 
                            : '✓ This club allows public access for court rental')
                          : (locale === 'es'
                            ? '⚠️ Se requiere membresía para jugar en este club'
                            : '⚠️ Membership required to play at this club')
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'schedule' && hasSchedule && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {locale === 'es' ? 'Horario de Apertura' : 'Opening Hours'}
                  </h2>
                  <div className="space-y-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const hours = club.operatingHours?.[day]
                      if (!hours || (!hours.open && !hours.close)) return null
                      
                      return (
                        <div key={day} className="flex justify-between py-2 border-b">
                          <span className="font-medium capitalize">
                            {locale === 'es' 
                              ? {monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', 
                                 thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', 
                                 sunday: 'Domingo'}[day]
                              : day}
                          </span>
                          <span className="text-gray-600">
                            {formatSchedule(hours)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {locale === 'es' ? 'Contacto' : 'Contact'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">
                        {locale === 'es' ? 'Dirección' : 'Address'}
                      </h3>
                      <p className="text-gray-600">{club.fullAddress}</p>
                      {club.location.googleMapsUrl && (
                        <a 
                          href={club.location.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-2 text-parque-purple hover:underline"
                        >
                          📍 {locale === 'es' ? 'Ver en Google Maps' : 'View on Google Maps'}
                        </a>
                      )}
                    </div>

                    {club.contact.phone && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          {locale === 'es' ? 'Teléfono' : 'Phone'}
                        </h3>
                        <a href={`tel:${club.contact.phone}`} className="text-parque-purple hover:underline">
                          {club.contact.phone}
                        </a>
                      </div>
                    )}

                    {club.contact.email && (
                      <div>
                        <h3 className="font-semibold mb-2">Email</h3>
                        <a href={`mailto:${club.contact.email}`} className="text-parque-purple hover:underline">
                          {club.contact.email}
                        </a>
                      </div>
                    )}

                    {club.contact.website && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          {locale === 'es' ? 'Sitio Web' : 'Website'}
                        </h3>
                        <a 
                          href={club.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-parque-purple hover:underline"
                        >
                          {club.contact.website}
                        </a>
                      </div>
                    )}

                    {(club.contact.facebook || club.contact.instagram) && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          {locale === 'es' ? 'Redes Sociales' : 'Social Media'}
                        </h3>
                        <div className="flex gap-4">
                          {club.contact.facebook && (
                            <a 
                              href={club.contact.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Facebook
                            </a>
                          )}
                          {club.contact.instagram && (
                            <a 
                              href={`https://instagram.com/${club.contact.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:underline"
                            >
                              Instagram
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Card */}
              <div className="bg-gradient-to-br from-parque-purple to-parque-green text-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold mb-3">
                  {locale === 'es' 
                    ? '¿Buscas compañeros de juego?'
                    : 'Looking for playing partners?'}
                </h3>
                <p className="mb-4">
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

              {/* Import Source Info */}
              {club.importSource === 'google' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">ℹ️</span>
                    <div>
                      <p className="text-blue-800 mb-1">
                        {locale === 'es' 
                          ? 'Información verificada de Google Maps' 
                          : 'Verified information from Google Maps'}
                      </p>
                      {club.googleData?.rating && (
                        <p className="text-blue-700">
                          ⭐ {club.googleData.rating}/5 ({club.googleData.userRatingsTotal} {locale === 'es' ? 'reseñas' : 'reviews'})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Nearby Clubs */}
              {nearbyClubs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {locale === 'es' ? 'Clubs Cercanos' : 'Nearby Clubs'}
                  </h3>
                  <div className="space-y-4">
                    {nearbyClubs.map(nearbyClub => (
                      <Link
                        key={nearbyClub._id}
                        href={`/${locale}/clubs/${city}/${nearbyClub.slug}`}
                        className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                      >
                        <h4 className="font-semibold text-gray-900 mb-1">{nearbyClub.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{nearbyClub.location.address}</p>
                        <div className="flex items-center justify-between text-sm">
                          {nearbyClub.courts?.total > 0 && (
                            <span className="text-gray-500">
                              {nearbyClub.courts.total} {locale === 'es' ? 'pistas' : 'courts'}
                            </span>
                          )}
                          <span className="text-parque-purple">→</span>
                        </div>
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
