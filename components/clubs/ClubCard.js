import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { AREA_DISPLAY_NAMES, CITY_DISPLAY_NAMES } from '@/lib/utils/geographicBoundaries'

export default function ClubCard({ club, locale }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [googlePhotoError, setGooglePhotoError] = useState(false)
  
  // Helper function to check if URL is a Google Photos proxy URL
  const isGooglePhotoUrl = (url) => {
    if (!url) return false
    return String(url).includes('/api/clubs/photo') || String(url).includes('photo_reference=')
  }

  // Get the best available image
  // NOTE: We skip Google Photos proxy URLs because:
  // 1. Google Places photo_references expire after a few days/weeks
  // 2. Next.js Image optimization doesn't work well with dynamic API routes
  // 3. This causes 400 errors and blocking loops in the console
  const getClubImage = () => {
    // Priority: main image > first gallery image > fallback
    // NOTE: Google Photos are skipped due to Next.js Image optimization issues
    
    // Check main image (skip if it's a Google Photo URL)
    if (club.images?.main && !imageError && !isGooglePhotoUrl(club.images.main)) {
      return club.images.main
    }
    
    // Check gallery images (skip Google Photo URLs)
    if (club.images?.gallery?.length > 0 && !imageError) {
      const validGalleryImage = club.images.gallery.find(img => !isGooglePhotoUrl(img))
      if (validGalleryImage) {
        return validGalleryImage
      }
    }
    
    // NOTE: Skipping Google Photos - they cause Next.js Image optimization issues
    // and photo_references expire. Clubs should use uploaded images instead.
    
    // Return null to trigger fallback
    return null
  }

  // Handle image errors with better logging
  const handleImageError = (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[ClubCard] Image error for ${club.name}:`, error)
    }
    
    // If it was a Google Photo that failed, mark it as failed
    if (club.images?.googlePhotoReference && !club.images?.main && (!club.images?.gallery || club.images.gallery.length === 0)) {
      setGooglePhotoError(true)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ClubCard] Google Photo failed for ${club.name}, photo_reference: ${club.images.googlePhotoReference}`)
      }
    }
    
    setImageError(true)
    setImageLoading(false)
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

  // Check if there's meaningful pricing data to display
  const hasPricingData = () => {
    // Check various pricing structures that might exist
    const hourlyMin = club.pricing?.courtRental?.hourly?.min
    const hourlyMax = club.pricing?.courtRental?.hourly?.max
    const dailyRate = club.pricing?.courtRental?.daily
    const weeklyRate = club.pricing?.courtRental?.weekly
    const monthlyRate = club.pricing?.courtRental?.monthly
    
    // Return true only if we have actual numeric pricing values
    return (
      (hourlyMin && hourlyMin > 0) ||
      (hourlyMax && hourlyMax > 0) ||
      (dailyRate && dailyRate > 0) ||
      (weeklyRate && weeklyRate > 0) ||
      (monthlyRate && monthlyRate > 0)
    )
  }

  // Get the best price to display
  const getPriceDisplay = () => {
    if (!hasPricingData()) return null
    
    const hourlyMin = club.pricing?.courtRental?.hourly?.min
    const hourlyMax = club.pricing?.courtRental?.hourly?.max
    const dailyRate = club.pricing?.courtRental?.daily
    
    // Prefer hourly rates, then daily, then others
    if (hourlyMin && hourlyMin > 0) {
      return `${hourlyMin}€/h`
    }
    
    if (hourlyMax && hourlyMax > 0) {
      return `${hourlyMax}€/h`
    }
    
    if (dailyRate && dailyRate > 0) {
      return `${dailyRate}€/${locale === 'es' ? 'día' : 'day'}`
    }
    
    return null
  }

  const courtInfo = getCourtInfo()
  const priceDisplay = getPriceDisplay()
  
  // Get main amenities to display
  const mainAmenities = []
  if (club.amenities?.parking) mainAmenities.push({ key: 'parking', label: locale === 'es' ? 'Parking' : 'Parking' })
  if (club.amenities?.lighting) mainAmenities.push({ key: 'lighting', label: locale === 'es' ? 'Iluminación' : 'Lighting' })
  if (club.amenities?.restaurant) mainAmenities.push({ key: 'restaurant', label: locale === 'es' ? 'Restaurante' : 'Restaurant' })
  if (club.amenities?.proShop) mainAmenities.push({ key: 'proShop', label: locale === 'es' ? 'Tienda' : 'Pro Shop' })
  
  const description = club.description?.[locale] || club.description?.es || ''
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description

  // Get league assignment for URL generation
  const getLeagueForUrl = () => {
    // The league/zone assignment is stored in location.city
    // This determines which league section the club belongs to
    // and is used for URL organization: /clubs/[league]/[slug]
    return club.location?.city || 'marbella'
  }

  // Enhanced location display with GPS-based area support
  const getLocationDisplay = () => {
    const location = club.location
    
    // Use the league assignment for display consistency
    const leagueCity = getLeagueForUrl()
    const cityDisplayName = CITY_DISPLAY_NAMES[leagueCity] || leagueCity || ''
    
    // If club has area information, show area with city when they differ
    if (location?.area) {
      const areaDisplayName = AREA_DISPLAY_NAMES[location.area] || location.area
      const formattedCityName = cityDisplayName.charAt(0).toUpperCase() + cityDisplayName.slice(1)
      const formattedAreaName = areaDisplayName.charAt(0).toUpperCase() + areaDisplayName.slice(1)
      
      // Only show city if it's different from area and exists
      if (formattedCityName && formattedCityName.toLowerCase() !== formattedAreaName.toLowerCase()) {
        return `${formattedAreaName} - ${formattedCityName}`
      }
      
      // Show just area when city is same as area or not available
      return formattedAreaName
    }
    
    // Fallback to league city display
    return cityDisplayName.charAt(0).toUpperCase() + cityDisplayName.slice(1)
  }

  const clubImage = getClubImage()
  const leagueForUrl = getLeagueForUrl()

  // Fallback image component
  const FallbackImage = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-parque-purple via-parque-purple/80 to-parque-green flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-4xl font-bold mb-2">🎾</div>
        <span className="text-white/80 text-sm font-medium">
          {googlePhotoError ? 'Photo Unavailable' : 'Tennis Club'}
        </span>
      </div>
    </div>
  )

  return (
    <Link
      href={`/${locale}/${locale === 'es' ? 'clubes' : 'clubs'}/${leagueForUrl}/${club.slug}`}
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
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={75}
              className={`object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={handleImageError}
              onLoadingComplete={() => {
                setImageLoading(false)
                if (process.env.NODE_ENV === 'development' && club.images?.googlePhotoReference && !club.images?.main) {
                  console.log(`[ClubCard] Google Photo loaded successfully for ${club.name}`)
                }
              }}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
              {AREA_DISPLAY_NAMES[club.location.area] || club.location.area}
            </span>
          )}
          
          {/* Featured badge */}
          {club.featured && (
            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold ml-auto">
              {locale === 'es' ? 'Destacado' : 'Featured'}
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
                <span className="text-sm font-medium text-gray-700">
                  {locale === 'es' ? 'Tenis' : 'Tennis'}
                </span>
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
                <span className="text-sm font-medium text-gray-700">
                  {locale === 'es' ? 'Pádel' : 'Padel'}
                </span>
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
                <span className="text-sm font-medium text-gray-700">Pickleball</span>
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
           (courtInfo.padel > 0 && courtInfo.pickleball > 0) }
        </div>

        {/* Price and Amenities Row - Only show if price or amenities exist */}
        {(priceDisplay || mainAmenities.length > 0) && (
          <div className={`flex items-center ${priceDisplay && mainAmenities.length > 0 ? 'justify-between' : priceDisplay ? 'justify-start' : 'justify-end'}`}>
            {/* Price - Only show if meaningful pricing data exists */}
            {priceDisplay && (
              <div className="text-sm">
                <span className="text-gray-500">{locale === 'es' ? 'Desde' : 'From'} </span>
                <span className="font-bold text-gray-900">
                  {priceDisplay}
                </span>
              </div>
            )}
            
            {/* Amenities - Text only */}
            {mainAmenities.length > 0 && (
              <div className="flex items-center gap-1">
                {mainAmenities.slice(0, 2).map((amenity, idx) => (
                  <span key={idx} className="text-xs text-gray-600">
                    {amenity.label}
                    {idx < Math.min(1, mainAmenities.length - 1) && ','}
                  </span>
                ))}
                {mainAmenities.length > 2 && (
                  <span className="text-xs text-gray-500">+{mainAmenities.length - 2}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Call to action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-parque-purple font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            {locale === 'es' ? 'Ver detalles' : 'View details'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          
          {/* Access type indicator */}
          {club.pricing?.membershipRequired ? (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {locale === 'es' ? 'Solo socios' : 'Members only'}
            </span>
          ) : (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
              {locale === 'es' ? 'Acceso público' : 'Public access'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}