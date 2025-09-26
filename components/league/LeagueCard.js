import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// Helper function to generate consistent fallback images for leagues
const getGenericLeagueFallback = (cityName) => {
  // Use a consistent gradient background for all leagues without images
  const svgContent = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leagueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#leagueGrad)"/>
      <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white" opacity="0.9">🏆</text>
      <text x="400" y="340" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="white" opacity="0.8">${cityName}</text>
    </svg>
  `.trim()
  
  // Fix btoa Latin1 error by properly encoding UTF-8 strings
  const base64 = typeof window !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(svgContent))) // Client-side: Convert UTF-8 to Latin1
    : Buffer.from(svgContent, 'utf8').toString('base64') // Server-side: Properly handle UTF-8
    
  return 'data:image/svg+xml;base64,' + base64
}

export default function LeagueCard({ league, content, locale }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const isActive = league.status === 'active';
  const isComingSoon = league.status === 'coming_soon';
  const isRegistrationOpen = league.status === 'registration_open';
  
  // Get the actual city slug from the league's city data
  const getCitySlug = () => {
    // Method 1: From populated city data
    if (league.city?.slug) {
      return league.city.slug;
    }
    // Method 2: From cityData
    if (league.cityData?.slug) {
      return league.cityData.slug;
    }
    // Method 3: Try to extract from league slug (fallback) - FIXED: Add safety check
    const leagueSlug = league.slug;
    if (leagueSlug && typeof leagueSlug === 'string') {
      if (leagueSlug.includes('sotogrande')) return 'sotogrande';
      if (leagueSlug.includes('marbella')) return 'marbella';
      if (leagueSlug.includes('estepona')) return 'estepona';
      if (leagueSlug.includes('malaga')) return 'malaga';
      // Default fallback
      return leagueSlug.split('-')[0];
    }
    // Final fallback if no slug is available
    return league.location?.city || 'unknown';
  };
  
  const citySlug = getCitySlug();
  const cityContent = content?.cities?.cityDescriptions?.[citySlug];
  
  // FIXED: Properly extract city name as string
  const getCityName = () => {
    // Method 1: Use league's getCityName if available
    if (typeof league.getCityName === 'function') {
      return league.getCityName()
    }
    
    // Method 2: From cityData (handle both string and object)
    if (league.cityData?.name) {
      if (typeof league.cityData.name === 'string') {
        return league.cityData.name
      } else if (typeof league.cityData.name === 'object') {
        return league.cityData.name.es || league.cityData.name.en || 'Unknown'
      }
    }
    
    // Method 3: From location object
    if (league.location?.city) {
      return league.location.city
    }
    
    // Method 4: Fallback to league name
    return league.name || 'Unknown'
  }
  
  const locationString = getCityName()
  const regionString = league.location?.region || 'España';
  
  // Check if registration is open for active leagues
  const hasOpenRegistration = league.seasons?.some(season => 
    season.status === 'registration_open'
  );

  // Get active season for the league link
  const activeSeason = league.seasons?.find(season => 
    season.status === 'active' || season.status === 'registration_open'
  );
  
  // Format launch date if available
  const launchDate = league.expectedLaunchDate ? new Date(league.expectedLaunchDate) : null;
  const formattedDate = launchDate ? launchDate.toLocaleDateString(locale, { 
    month: 'long', 
    year: 'numeric' 
  }) : null;
  
  // FIXED: Get city image with better fallback logic and updated slug mapping
  const getCityImage = () => {
    // Priority 1: City photos from Google Maps (via cityData)
    if (league.cityData?.images?.main && !imageError) {
      // If it's a Google photo reference, use the public proxy
      if (league.cityData.images.googlePhotoReference) {
        return `/api/cities/photo?photo_reference=${league.cityData.images.googlePhotoReference}&maxwidth=800`
      }
      // Otherwise use the direct image URL
      return league.cityData.images.main
    }
    
    // Priority 2: Check if populated city has images
    if (league.city?.images?.main && !imageError) {
      if (league.city.images.googlePhotoReference) {
        return `/api/cities/photo?photo_reference=${league.city.images.googlePhotoReference}&maxwidth=800`
      }
      return league.city.images.main
    }
    
    // Priority 3: Legacy static images (for backward compatibility) - UPDATED mapping
    const hasCustomImage = ['liga-de-sotogrande', 'sotogrande', 'liga-de-malaga', 'liga-de-estepona', 'liga-de-marbella'].includes(citySlug);
    if (hasCustomImage && !imageError) {
      console.log('Using legacy static image for:', citySlug)
      const imageMap = {
        'liga-de-sotogrande': 'sotogrande-01.jpg',
        'sotogrande': 'sotogrande-01.jpg',
        'liga-de-estepona': 'estepona-01.webp',
        'liga-de-malaga': 'malaga-01.avif',
        'liga-de-marbella': 'marbella-02.webp'
      }
      return `/${imageMap[citySlug] || 'sotogrande-01.jpg'}`
    }
    
    // Priority 4: Fallback to consistent gradient with league trophy
    console.log('Using fallback gradient for:', locationString)
    return getGenericLeagueFallback(locationString)
  }

  const handleImageError = () => {
    console.log('Image failed to load for league:', league.name)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }
  
  // FIXED: Get the appropriate button text and link with proper Spanish URLs
  const getButtonConfig = () => {
    if (isActive) {
      // For active leagues, use the SEO-friendly URL: /{locale}/{location}/liga/{season}
      const seasonSlug = (league.season?.type && league.season?.year) ? 
        `${league.season.type}${league.season.year}` : 
        'verano2025'; // fallback for leagues without season data
      
      
      return {
        text: locale === 'es' ? 'Ver Liga' : 'View League',
        href: `/${locale}/${citySlug}/liga/${seasonSlug}`,
        className: 'bg-parque-purple text-white hover:bg-parque-purple/90'
      };
    } else if (isRegistrationOpen) {
      // Registration is open - show join/register button
      // Use the league slug for specific league registration - FIXED: Add safety check
      const registrationUrl = locale === 'es' ? 'registro' : 'signup'
      const safeSlug = league.slug || citySlug || 'unknown'
      const href = `/${locale}/${registrationUrl}/${safeSlug}`
      return {
        text: content?.cities?.joinLeague || (locale === 'es' ? 'Inscribirse' : 'Join League'),
        href: href,
        className: 'bg-parque-green text-white hover:bg-parque-green/90'
      };
    } else if (isComingSoon) {
      // Use proper Spanish URL for registration - FIXED: Add safety check
      const registrationUrl = locale === 'es' ? 'registro' : 'signup'
      const safeSlug = league.slug || citySlug || 'unknown'
      return {
        text: content?.cities?.preRegister || (locale === 'es' ? 'Pre-registro' : 'Pre-register'),
        href: `/${locale}/${registrationUrl}/${safeSlug}`,
        className: 'bg-parque-green text-white hover:bg-parque-green/90'
      };
    } else {
      return {
        text: locale === 'es' ? 'No disponible' : 'Not available',
        href: null,
        className: 'bg-gray-200 text-gray-500 cursor-not-allowed'
      };
    }
  };

  const buttonConfig = getButtonConfig();
  
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 w-full max-w-sm ${
      !isActive && !isComingSoon && !isRegistrationOpen ? 'opacity-60' : ''
    }`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : isRegistrationOpen
            ? 'bg-orange-100 text-orange-800'
            : isComingSoon
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isActive 
            ? (content?.cities?.available || (locale === 'es' ? 'Activa' : 'Active'))
            : isRegistrationOpen
            ? (content?.cities?.registrationOpen || (locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'))
            : isComingSoon 
            ? (content?.cities?.comingSoon || (locale === 'es' ? 'Próximamente' : 'Coming Soon'))
            : (locale === 'es' ? 'Inactiva' : 'Inactive')
          }
        </span>
      </div>
      
      {/* City Image */}
      <div className="relative h-48 overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parque-purple"></div>
          </div>
        )}

        <Image
          src={getCityImage()}
          alt={`${league.name} - ${locationString}`}
          fill
          className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-parque-purple/80 via-parque-purple/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-3xl font-bold text-white drop-shadow-lg text-center px-4">{league.name}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Description */}
        {(cityContent || league.description?.[locale] || league.description?.es) && (
          <p className="text-gray-600 mb-4">
            {cityContent || league.description?.[locale] || league.description?.es}
          </p>
        )}
        
        {/* Show player count for active and registration open leagues */}
        {(isActive || isRegistrationOpen) && league.playerCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{league.playerCount}</span> {
                content?.cities?.playersCount || (locale === 'es' ? 'jugadores' : 'players')
              }
            </div>
            <div className="text-sm text-gray-500">
              {regionString}
            </div>
          </div>
        )}
        
        {/* Show season info for active and registration open leagues */}
        {(isActive || isRegistrationOpen) && activeSeason && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">🏆 {activeSeason.name}</span>
              {activeSeason.price && (
                <span className="font-semibold text-parque-purple">
                  {activeSeason.price.isFree 
                    ? (locale === 'es' ? 'Gratis' : 'Free')
                    : `${activeSeason.price.amount || 0}${activeSeason.price.currency || '€'}`
                  }
                </span>
              )}
            </div>
            {activeSeason.startDate && (
              <div className="text-sm text-gray-500">
                📅 {locale === 'es' ? 'Inicio:' : 'Start:'} {
                  new Date(activeSeason.startDate).toLocaleDateString(
                    locale === 'es' ? 'es-ES' : 'en-US',
                    { day: 'numeric', month: 'short', year: 'numeric' }
                  )
                }
              </div>
            )}
          </div>
        )}
        
        {/* Show launch date for coming soon leagues - REMOVED interested count */}
        {isComingSoon && formattedDate && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {content?.cities?.startsIn || (locale === 'es' ? 'Lanzamiento' : 'Launch')}: {' '}
              <span className="font-semibold text-gray-700">{formattedDate}</span>
            </p>
          </div>
        )}
        
        {/* Action Button */}
        {buttonConfig.href ? (
          <Link
            href={buttonConfig.href}
            className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-colors ${buttonConfig.className}`}
          >
            {buttonConfig.text}
          </Link>
        ) : (
          <button
            disabled
            className={`block w-full text-center px-6 py-3 rounded-lg font-medium ${buttonConfig.className}`}
          >
            {buttonConfig.text}
          </button>
        )}
      </div>
    </div>
  );
}
