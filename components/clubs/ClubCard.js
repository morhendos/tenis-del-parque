import Link from 'next/link'
import { AREA_DISPLAY_NAMES, CITY_DISPLAY_NAMES } from '@/lib/utils/areaMapping'

export default function ClubCard({ club, locale }) {
  // Handle both old and new court structures
  const getCourtInfo = () => {
    if (!club.courts) {
      return { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
    }

    // New structure (from refactored editor)
    if (club.courts.tennis || club.courts.padel || club.courts.pickleball) {
      const tennisTotal = club.courts.tennis?.total || 0
      const padelTotal = club.courts.padel?.total || 0
      const pickleballTotal = club.courts.pickleball?.total || 0
      
      const tennisIndoor = club.courts.tennis?.indoor || 0
      const padelIndoor = club.courts.padel?.indoor || 0
      const pickleballIndoor = club.courts.pickleball?.indoor || 0
      
      return {
        total: tennisTotal + padelTotal + pickleballTotal,
        indoor: tennisIndoor + padelIndoor + pickleballIndoor,
        outdoor: (tennisTotal - tennisIndoor) + (padelTotal - padelIndoor) + (pickleballTotal - pickleballIndoor),
        surfaces: [],
        tennis: tennisTotal,
        padel: padelTotal,
        pickleball: pickleballTotal
      }
    }
    
    // Old structure (legacy)
    return {
      total: club.courts.total || 0,
      indoor: club.courts.indoor || 0,
      outdoor: club.courts.outdoor || 0,
      surfaces: club.courts.surfaces || []
    }
  }

  const courtInfo = getCourtInfo()
  const hasMultipleSurfaces = courtInfo.surfaces.length > 1
  
  // Get main amenities to display
  const mainAmenities = []
  if (club.amenities?.parking) mainAmenities.push({ icon: '🚗', label: locale === 'es' ? 'Parking' : 'Parking' })
  if (club.amenities?.lighting) mainAmenities.push({ icon: '💡', label: locale === 'es' ? 'Iluminación' : 'Lighting' })
  if (club.amenities?.restaurant) mainAmenities.push({ icon: '🍽️', label: locale === 'es' ? 'Restaurante' : 'Restaurant' })
  if (club.amenities?.proShop) mainAmenities.push({ icon: '🎾', label: locale === 'es' ? 'Tienda' : 'Pro Shop' })
  
  const description = club.description?.[locale] || club.description?.es || ''
  const truncatedDescription = description.length > 150 
    ? description.substring(0, 150) + '...' 
    : description

  // Enhanced location display with area support
  const getLocationDisplay = () => {
    const location = club.location
    
    // If club has area information, show area hierarchy
    if (location?.area && location?.displayName) {
      return location.displayName // e.g., "El Paraíso (Marbella)"
    }
    
    // Fallback to city display
    const cityName = CITY_DISPLAY_NAMES[location?.city] || location?.city || ''
    return cityName.charAt(0).toUpperCase() + cityName.slice(1)
  }

  // Enhanced address display
  const getAddressDisplay = () => {
    const location = club.location
    
    // Show full address or location hierarchy
    if (location?.address) {
      return location.address
    }
    
    // Fallback: construct from location data
    const parts = []
    if (location?.area) {
      parts.push(AREA_DISPLAY_NAMES[location.area] || location.area)
    }
    if (location?.city) {
      const cityName = CITY_DISPLAY_NAMES[location.city] || location.city
      parts.push(cityName.charAt(0).toUpperCase() + cityName.slice(1))
    }
    
    return parts.join(', ') || 'Location details'
  }

  return (
    <Link
      href={`/${locale}/clubs/${club.location?.city || 'marbella'}/${club.slug}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Enhanced Header with Area Information */}
      <div className="relative bg-gradient-to-br from-parque-purple to-parque-green p-6 text-white">
        {club.featured && (
          <span className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
            ⭐ {locale === 'es' ? 'Destacado' : 'Featured'}
          </span>
        )}
        
        {/* Area badge for area-based clubs */}
        {club.location?.area && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              📍 {AREA_DISPLAY_NAMES[club.location.area] || club.location.area}
            </span>
          </div>
        )}

        <div className={club.location?.area ? 'mt-6' : ''}>
          <h3 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
            {club.name}
          </h3>
          
          {/* Enhanced location display */}
          <div className="space-y-1">
            <p className="text-white/90 text-sm font-medium">
              {getLocationDisplay()}
            </p>
            <p className="text-white/75 text-xs">
              {getAddressDisplay()}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 mb-4 flex-1">{truncatedDescription}</p>

        {/* Courts Info */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {courtInfo.total} {locale === 'es' ? 'pistas' : 'courts'}
            </span>
            {courtInfo.indoor > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {courtInfo.indoor} {locale === 'es' ? 'cubiertas' : 'indoor'}
              </span>
            )}
          </div>
          
          {/* Display court types for new structure */}
          {(courtInfo.tennis > 0 || courtInfo.padel > 0 || courtInfo.pickleball > 0) && (
            <div className="flex flex-wrap gap-2">
              {courtInfo.tennis > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  🎾 {courtInfo.tennis} {locale === 'es' ? 'tenis' : 'tennis'}
                </span>
              )}
              {courtInfo.padel > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  🏸 {courtInfo.padel} {locale === 'es' ? 'pádel' : 'padel'}
                </span>
              )}
              {courtInfo.pickleball > 0 && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  🏓 {courtInfo.pickleball} pickleball
                </span>
              )}
            </div>
          )}
          
          {/* Display surfaces for old structure */}
          {courtInfo.surfaces.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {courtInfo.surfaces.map((surface, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {surface.count} {
                    surface.type === 'clay' ? (locale === 'es' ? 'tierra batida' : 'clay') :
                    surface.type === 'hard' ? (locale === 'es' ? 'dura' : 'hard') :
                    surface.type === 'grass' ? (locale === 'es' ? 'césped' : 'grass') :
                    surface.type === 'synthetic' ? (locale === 'es' ? 'sintética' : 'synthetic') :
                    surface.type === 'padel' ? 'padel' :
                    surface.type
                  }
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-3">
            {mainAmenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1 text-sm text-gray-600">
                <span>{amenity.icon}</span>
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        {club.pricing?.courtRental?.hourly && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              {locale === 'es' ? 'Desde' : 'From'}{' '}
              <span className="font-semibold text-gray-700">
                {club.pricing.courtRental.hourly.min}€
              </span>
              {locale === 'es' ? '/hora' : '/hour'}
            </span>
          </div>
        )}

        {/* Enhanced Tags with Area Context */}
        {club.tags && club.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {club.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="text-xs bg-parque-purple/10 text-parque-purple px-2 py-1 rounded"
              >
                {
                  tag === 'family-friendly' ? (locale === 'es' ? 'Familiar' : 'Family Friendly') :
                  tag === 'professional' ? (locale === 'es' ? 'Profesional' : 'Professional') :
                  tag === 'beginner-friendly' ? (locale === 'es' ? 'Principiantes' : 'Beginners') :
                  tag === 'tournaments' ? (locale === 'es' ? 'Torneos' : 'Tournaments') :
                  tag === 'academy' ? (locale === 'es' ? 'Academia' : 'Academy') :
                  tag === 'municipal' ? (locale === 'es' ? 'Municipal' : 'Municipal') :
                  tag === 'private' ? (locale === 'es' ? 'Privado' : 'Private') :
                  tag === 'hotel-club' ? (locale === 'es' ? 'Hotel Club' : 'Hotel Club') :
                  tag === 'costa-del-sol' ? 'Costa del Sol' :
                  tag === 'luxury' ? (locale === 'es' ? 'Lujo' : 'Luxury') :
                  tag
                }
              </span>
            ))}
          </div>
        )}

        {/* Enhanced CTA with Area Context */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-parque-purple font-medium group-hover:translate-x-1 transition-transform">
              {locale === 'es' ? 'Ver detalles' : 'View details'} →
            </span>
            <div className="flex items-center gap-2">
              {club.pricing?.membershipRequired && (
                <span className="text-xs text-gray-500">
                  {locale === 'es' ? 'Socios' : 'Members only'}
                </span>
              )}
              {club.location?.area && (
                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                  {AREA_DISPLAY_NAMES[club.location.area] || club.location.area}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}