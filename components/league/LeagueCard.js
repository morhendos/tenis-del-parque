import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Calendar, Users, Trophy } from 'lucide-react';

// Helper function to generate consistent fallback images for leagues
const getGenericLeagueFallback = (cityName) => {
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
  
  const base64 = typeof window !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(svgContent)))
    : Buffer.from(svgContent, 'utf8').toString('base64')
    
  return 'data:image/svg+xml;base64,' + base64
}

export default function LeagueCard({ league, content, locale }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const isActive = league.status === 'active';
  const isComingSoon = league.status === 'coming_soon';
  const isRegistrationOpen = league.status === 'registration_open';
  
  // Get city slug
  const getCitySlug = () => {
    if (league.city?.slug) return league.city.slug;
    if (league.cityData?.slug) return league.cityData.slug;
    const leagueSlug = league.slug;
    if (leagueSlug && typeof leagueSlug === 'string') {
      if (leagueSlug.includes('sotogrande')) return 'sotogrande';
      if (leagueSlug.includes('marbella')) return 'marbella';
      if (leagueSlug.includes('estepona')) return 'estepona';
      if (leagueSlug.includes('malaga')) return 'malaga';
      return leagueSlug.split('-')[0];
    }
    return league.location?.city || 'unknown';
  };
  
  const citySlug = getCitySlug();
  
  // Get city name
  const getCityName = () => {
    if (typeof league.getCityName === 'function') {
      return league.getCityName()
    }
    if (league.cityData?.name) {
      if (typeof league.cityData.name === 'string') {
        return league.cityData.name
      } else if (typeof league.cityData.name === 'object') {
        return league.cityData.name.es || league.cityData.name.en || 'Unknown'
      }
    }
    if (league.location?.city) {
      return league.location.city
    }
    return league.name || 'Unknown'
  }
  
  const locationString = getCityName()
  
  // Get season name
  const getSeasonName = () => {
    if (typeof league.getSeasonName === 'function') {
      return league.getSeasonName(locale)
    }
    
    if (league.season) {
      const seasonNames = {
        es: {
          spring: 'Primavera',
          summer: 'Verano',
          autumn: 'Otoño',
          winter: 'Invierno',
          annual: 'Anual'
        },
        en: {
          spring: 'Spring',
          summer: 'Summer',
          autumn: 'Autumn',
          winter: 'Winter',
          annual: 'Annual'
        }
      }
      
      const seasonName = seasonNames[locale]?.[league.season.type] || league.season.type
      const seasonYear = league.season.year || 2025
      // DON'T show season number - it's confusing (there's only one autumn 2025)
      return `${seasonName} ${seasonYear}`
    }
    
    return ''
  }
  
  // Get skill level name
  const getSkillLevelName = () => {
    if (typeof league.getSkillLevelName === 'function') {
      return league.getSkillLevelName(locale)
    }
    
    const skillLevelNames = {
      es: {
        all: 'Todos los Niveles',
        beginner: 'Principiantes',
        intermediate: 'Intermedio',
        advanced: 'Avanzado'
      },
      en: {
        all: 'All Levels',
        beginner: 'Beginners',
        intermediate: 'Intermediate', 
        advanced: 'Advanced'
      }
    }
    
    return skillLevelNames[locale]?.[league.skillLevel] || skillLevelNames['es'][league.skillLevel] || 'All Levels'
  }
  
  const seasonName = getSeasonName()
  const skillLevelName = getSkillLevelName()
  
  // Get city image
  const getCityImage = () => {
    if (league.cityData?.images?.main && !imageError) {
      if (league.cityData.images.googlePhotoReference) {
        return `/api/cities/photo?photo_reference=${league.cityData.images.googlePhotoReference}&maxwidth=800`
      }
      return league.cityData.images.main
    }
    
    if (league.city?.images?.main && !imageError) {
      if (league.city.images.googlePhotoReference) {
        return `/api/cities/photo?photo_reference=${league.city.images.googlePhotoReference}&maxwidth=800`
      }
      return league.city.images.main
    }
    
    const hasCustomImage = ['liga-de-sotogrande', 'sotogrande', 'liga-de-malaga', 'liga-de-estepona', 'liga-de-marbella'].includes(citySlug);
    if (hasCustomImage && !imageError) {
      const imageMap = {
        'liga-de-sotogrande': 'sotogrande-01.jpg',
        'sotogrande': 'sotogrande-01.jpg',
        'liga-de-estepona': 'estepona-01.webp',
        'liga-de-malaga': 'malaga-01.avif',
        'liga-de-marbella': 'marbella-02.webp'
      }
      return `/${imageMap[citySlug] || 'sotogrande-01.jpg'}`
    }
    
    return getGenericLeagueFallback(locationString)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }
  
  // Get the appropriate button config and link
  const getButtonConfig = () => {
    if (isActive) {
      const seasonSlug = (league.season?.type && league.season?.year) ? 
        `${league.season.type}${league.season.year}` : 
        'verano2025';
      
      return {
        text: locale === 'es' ? 'Ver Liga' : 'View League',
        href: `/${locale}/${citySlug}/liga/${seasonSlug}`,
        className: 'bg-parque-purple text-white hover:bg-parque-purple/90'
      };
    } else if (isRegistrationOpen) {
      const registrationUrl = locale === 'es' ? 'registro' : 'signup'
      const safeSlug = league.slug || citySlug || 'unknown'
      const href = `/${locale}/${registrationUrl}/${safeSlug}`
      return {
        text: content?.cities?.joinLeague || (locale === 'es' ? 'Inscribirse' : 'Join League'),
        href: href,
        className: 'bg-parque-green text-white hover:bg-parque-green/90'
      };
    } else if (isComingSoon) {
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
  
  // Card content
  const cardContent = (
    <>
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
          isActive 
            ? 'bg-green-100/90 text-green-800' 
            : isRegistrationOpen
            ? 'bg-orange-100/90 text-orange-800'
            : isComingSoon
            ? 'bg-blue-100/90 text-blue-800'
            : 'bg-gray-100/90 text-gray-600'
        }`}>
          {isActive 
            ? (locale === 'es' ? 'Liga Activa' : 'Active League')
            : isRegistrationOpen
            ? (locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open')
            : isComingSoon 
            ? (locale === 'es' ? 'Próximamente' : 'Coming Soon')
            : (locale === 'es' ? 'Inactiva' : 'Inactive')
          }
        </span>
      </div>
      
      {/* City Image */}
      <div className="relative h-56 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-3xl font-bold text-white drop-shadow-lg text-center px-4">{league.name}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">{locationString}</span>
        </div>
        
        {/* Season and Skill Level Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Always show season - use fallback if not available */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
            <Calendar className="w-4 h-4" />
            <span>{seasonName || (locale === 'es' ? 'Verano 2025' : 'Summer 2025')}</span>
          </div>
          {/* Always show skill level - use fallback if not available */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <Trophy className="w-4 h-4" />
            <span>{skillLevelName}</span>
          </div>
        </div>
        
        {/* Description - always show something */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {league.description?.[locale] || 
           (locale === 'es' 
             ? `Liga de tenis en ${locationString}. Únete y compite con jugadores de tu nivel.`
             : `Tennis league in ${locationString}. Join and compete with players at your level.`
           )
          }
        </p>
        
        {/* Player count for active leagues */}
        {(isActive || isRegistrationOpen) && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{league.stats?.registeredPlayers || 0}</span>
              <span>{locale === 'es' ? 'jugadores' : 'players'}</span>
            </div>
          </div>
        )}
        
        {/* Action Button - Not clickable as whole card is clickable */}
        <div
          className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-colors ${buttonConfig.className}`}
          onClick={(e) => {
            if (!buttonConfig.href) {
              e.preventDefault()
            }
          }}
        >
          {buttonConfig.text}
        </div>
      </div>
    </>
  );
  
  // Wrap entire card in Link if there's a valid href
  if (buttonConfig.href) {
    return (
      <Link 
        href={buttonConfig.href}
        className={`block relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group w-full sm:w-[380px] ${
          !isActive && !isComingSoon && !isRegistrationOpen ? 'opacity-60' : ''
        }`}
      >
        {cardContent}
      </Link>
    );
  }
  
  // If no href, just render the div
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden w-full sm:w-[380px] ${
      !isActive && !isComingSoon && !isRegistrationOpen ? 'opacity-60' : ''
    }`}>
      {cardContent}
    </div>
  );
}
