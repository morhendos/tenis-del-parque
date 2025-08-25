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

  // Get court breakdown
  const getCourtInfo = () => {
    if (!club.courts) {
      return { tennis: 0, padel: 0, pickleball: 0, total: 0 }
    }

    // New structure (from refactored editor)
    if (club.courts.tennis || club.courts.padel || club.courts.pickleball) {
      const tennis = club.courts.tennis?.total || 0
      const padel = club.courts.padel?.total || 0
      const pickleball = club.courts.pickleball?.total || 0
      
      return {
        tennis,
        padel,
        pickleball,
        total: tennis + padel + pickleball,
        tennisIndoor: club.courts.tennis?.indoor || 0,
        padelIndoor: club.courts.padel?.indoor || 0,
        pickleballIndoor: club.courts.pickleball?.indoor || 0
      }
    }
    
    // Old structure (legacy) - try to determine court type from surfaces
    const surfaces = club.courts.surfaces || []
    const hasPadel = surfaces.some(s => s.type === 'padel')
    
    if (hasPadel) {
      return {
        tennis: 0,
        padel: club.courts.total || 0,
        pickleball: 0,
        total: club.courts.total || 0,
        tennisIndoor: 0,
        padelIndoor: club.courts.indoor || 0,
        pickleballIndoor: 0
      }
    } else {
      // Default to tennis for legacy data
      return {
        tennis: club.courts.total || 0,
        padel: 0,
        pickleball: 0,
        total: club.courts.total || 0,
        tennisIndoor: club.courts.indoor || 0,
        padelIndoor: 0,
        pickleballIndoor: 0
      }
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

        {/* Court Types Display - Clear breakdown */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            {locale === 'es' ? 'Pistas' : 'Courts'}
          </div>
          
          <div className="space-y-1.5">
            {courtInfo.tennis > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎾</span>
                  <span className="text-sm font-medium text-gray-700">
                    {locale === 'es' ? 'Tenis' : 'Tennis'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{courtInfo.tennis}</span>
                  {courtInfo.tennisIndoor > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      {courtInfo.tennisIndoor} {locale === 'es' ? 'cub.' : 'ind.'}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {courtInfo.padel > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏸</span>
                  <span className="text-sm font-medium text-gray-700">
                    {locale === 'es' ? 'Pádel' : 'Padel'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{courtInfo.padel}</span>
                  {courtInfo.padelIndoor > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      {courtInfo.padelIndoor} {locale === 'es' ? 'cub.' : 'ind.'}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {courtInfo.pickleball > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏓</span>
                  <span className="text-sm font-medium text-gray-700">Pickleball</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{courtInfo.pickleball}</span>
                  {courtInfo.pickleballIndoor > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      {courtInfo.pickleballIndoor} {locale === 'es' ? 'cub.' : 'ind.'}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {courtInfo.total === 0 && (
              <div className="text-sm text-gray-500 italic">
                {locale === 'es' ? 'Información no disponible' : 'Information not available'}
              </div>
            )}
          </div>
          
          {/* Total summary if multiple types */}
          {(courtInfo.tennis > 0 && courtInfo.padel > 0) || 
           (courtInfo.tennis > 0 && courtInfo.pickleball > 0) || 
           (courtInfo.padel > 0 && courtInfo.pickleball > 0) ? (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase">Total</span>
                <span className="text-sm font-bold text-gray-900">{courtInfo.total}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Price and Amenities Row */}
        <div className="flex items-center justify-between">
          {/* Price */}
          {club.pricing?.courtRental?.hourly && (
            <div className="text-sm">
              <span className="text-gray-500">{locale === 'es' ? 'Desde' : 'From'} </span>
              <span className="font-bold text-gray-900">
                {club.pricing.courtRental.hourly.min}€/h
              </span>
            </div>
          )}
          
          {/* Amenities - Inline icons */}
          {mainAmenities.length > 0 && (
            <div className="flex items-center gap-2">
              {mainAmenities.slice(0, 3).map((amenity, idx) => (
                <span key={idx} className="text-lg" title={amenity.label}>
                  {amenity.icon}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Call to action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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