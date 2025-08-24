import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { AREA_DISPLAY_NAMES, CITY_DISPLAY_NAMES } from '@/lib/utils/areaMapping'

export default function ClubCard({ club, locale }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  
  // Get the best available image
  const getClubImage = () => {
    // Priority: main image > first gallery image > Google photo > fallback
    if (club.images?.main && !imageError) {
      return club.images.main
    }
    
    if (club.images?.gallery?.length > 0 && !imageError) {
      return club.images.gallery[0]
    }
    
    if (club.images?.googlePhotoReference && !imageError) {
      return `/api/clubs/photo?photo_reference=${club.images.googlePhotoReference}`
    }
    
    // Return null to trigger fallback
    return null
  }

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
  
  // Get main amenities to display
  const mainAmenities = []
  if (club.amenities?.parking) mainAmenities.push({ icon: '🚗', label: locale === 'es' ? 'Parking' : 'Parking' })
  if (club.amenities?.lighting) mainAmenities.push({ icon: '💡', label: locale === 'es' ? 'Iluminación' : 'Lighting' })
  if (club.amenities?.restaurant) mainAmenities.push({ icon: '🍽️', label: locale === 'es' ? 'Restaurante' : 'Restaurant' })
  if (club.amenities?.proShop) mainAmenities.push({ icon: '🎾', label: locale === 'es' ? 'Tienda' : 'Pro Shop' })
  
  const description = club.description?.[locale] || club.description?.es || ''
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + '...' 
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

  const clubImage = getClubImage()

  // Fallback image component
  const FallbackImage = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-parque-purple via-parque-purple/80 to-parque-green flex items-center justify-center">
      <div className="text-center">
        <span className="text-6xl mb-2 block">🎾</span>
        <span className="text-white/80 text-sm font-medium">Tennis Club</span>
      </div>
    </div>
  )

  return (
    <Link
      href={`/${locale}/clubs/${club.location?.city || 'marbella'}/${club.slug}`}
      className="group block bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full transform hover:-translate-y-1 cursor-pointer relative"
    >
      {/* Image Section - 40% of card height */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {clubImage ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">
                  <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            )}
            <Image
              src={clubImage}
              alt={club.name}
              fill
              className={`object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
              onLoadingComplete={() => setImageLoading(false)}
              unoptimized={clubImage.startsWith('data:') || clubImage.includes('blob.vercel-storage.com')}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <FallbackImage />
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Area badge */}
          {club.location?.area && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              📍 {AREA_DISPLAY_NAMES[club.location.area] || club.location.area}
            </span>
          )}
          
          {/* Featured badge */}
          {club.featured && (
            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold ml-auto">
              ⭐ {locale === 'es' ? 'Destacado' : 'Featured'}
            </span>
          )}
        </div>
        
        {/* Club name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg group-hover:translate-x-1 transition-transform">
            {club.name}
          </h3>
          <p className="text-white/90 text-sm font-medium">
            {getLocationDisplay()}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        {/* Description */}
        {truncatedDescription && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {truncatedDescription}
          </p>
        )}

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Courts */}
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{locale === 'es' ? 'Pistas' : 'Courts'}</span>
              <span className="text-sm font-semibold text-gray-700">{courtInfo.total}</span>
            </div>
            {courtInfo.indoor > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {courtInfo.indoor} {locale === 'es' ? 'cubiertas' : 'indoor'}
              </span>
            )}
          </div>
          
          {/* Price */}
          {club.pricing?.courtRental?.hourly && (
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{locale === 'es' ? 'Desde' : 'From'}</span>
                <span className="text-sm font-semibold text-gray-700">
                  {club.pricing.courtRental.hourly.min}€/h
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Court Types - Compact display */}
        {(courtInfo.tennis > 0 || courtInfo.padel > 0 || courtInfo.pickleball > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {courtInfo.tennis > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <span className="text-xs">🎾</span>
                <span>{courtInfo.tennis}</span>
              </span>
            )}
            {courtInfo.padel > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <span className="text-xs">🏸</span>
                <span>{courtInfo.padel}</span>
              </span>
            )}
            {courtInfo.pickleball > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                <span className="text-xs">🏓</span>
                <span>{courtInfo.pickleball}</span>
              </span>
            )}
          </div>
        )}

        {/* Amenities - Inline icons */}
        {mainAmenities.length > 0 && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            {mainAmenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1" title={amenity.label}>
                <span className="text-lg">{amenity.icon}</span>
              </div>
            ))}
          </div>
        )}

        {/* Call to action */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-parque-purple font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            {locale === 'es' ? 'Ver detalles' : 'View details'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          
          {/* Public/Private indicator */}
          {club.pricing?.membershipRequired && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {locale === 'es' ? 'Solo socios' : 'Members only'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}