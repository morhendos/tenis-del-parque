import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Calendar, Users, Trophy, Medal, Award } from 'lucide-react';

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

// Level descriptions matching LeagueInfoTab (FULL VERSION for info page)
const levelDescriptions = {
  es: {
    beginner: {
      description: '¿Nuevo en el tenis competitivo? Esta liga de nivel inicial ofrece competición estructurada donde cada punto importa. Perfecta para competidores primerizos listos para la experiencia de liga organizada.'
    },
    intermediate: {
      description: 'Para jugadores con experiencia competitiva listos para partidos desafiantes regulares. Un paso adelante del nivel inicial con juego más intenso contra oponentes de habilidad similar.'
    },
    advanced: {
      description: 'Para jugadores experimentados con técnica sólida y juego competitivo. Partidos intensos con alta calidad de juego.'
    },
    open: {
      description: 'Liga multi-nivel donde jugadores de diferentes habilidades compiten. El sistema ELO garantiza partidos equilibrados basados en tu nivel real.'
    }
  },
  en: {
    beginner: {
      description: 'New to competitive tennis? This entry-level league offers structured competition where every point matters. Perfect for first-time competitors ready to experience organized league play.'
    },
    intermediate: {
      description: 'For players with competitive experience ready for regular challenging matches. Step up from entry-level with more intense play against similarly skilled opponents.'
    },
    advanced: {
      description: 'For experienced players with solid technique and competitive play. Intense matches with high-quality tennis.'
    },
    open: {
      description: 'Multi-level league where players of different abilities compete. The ELO system ensures balanced matches based on your actual level.'
    }
  }
}

// SHORT descriptions for home page cards
const shortLevelDescriptions = {
  es: {
    beginner: 'Liga de nivel inicial para competidores primerizos. Competición estructurada en ambiente amigable.',
    intermediate: 'Para jugadores con experiencia competitiva. Partidos desafiantes contra oponentes similares.',
    advanced: 'Para jugadores experimentados con técnica sólida. Partidos intensos de alta calidad.',
    open: 'Liga multi-nivel con emparejamiento ELO para partidos equilibrados.'
  },
  en: {
    beginner: 'Entry-level league for first-time competitors. Structured competition in a friendly atmosphere.',
    intermediate: 'For players with competitive experience. Challenging matches against similar opponents.',
    advanced: 'For experienced players with solid technique. Intense, high-quality matches.',
    open: 'Multi-level league with ELO-based matchmaking for balanced play.'
  }
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
    
    // Fallback: try to detect from slug
    const slug = league.slug?.toLowerCase() || ''
    const name = league.name?.toLowerCase() || ''
    
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
    
    // Try to detect season from slug/name
    if (slug.includes('winter') || slug.includes('invierno') || name.includes('winter') || name.includes('invierno')) {
      const year = slug.match(/(20\d{2})/) ? slug.match(/(20\d{2})/)[1] : '2025'
      return `${seasonNames[locale].winter} ${year}`
    }
    if (slug.includes('summer') || slug.includes('verano') || name.includes('summer') || name.includes('verano')) {
      const year = slug.match(/(20\d{2})/) ? slug.match(/(20\d{2})/)[1] : '2025'
      return `${seasonNames[locale].summer} ${year}`
    }
    if (slug.includes('spring') || slug.includes('primavera') || name.includes('spring') || name.includes('primavera')) {
      const year = slug.match(/(20\d{2})/) ? slug.match(/(20\d{2})/)[1] : '2025'
      return `${seasonNames[locale].spring} ${year}`
    }
    if (slug.includes('autumn') || slug.includes('otoño') || slug.includes('otono') || name.includes('autumn') || name.includes('otoño')) {
      const year = slug.match(/(20\d{2})/) ? slug.match(/(20\d{2})/)[1] : '2025'
      return `${seasonNames[locale].autumn} ${year}`
    }
    
    return ''
  }
  
  // Get skill level name, icon, and color
  const getSkillLevelInfo = () => {
    const skillLevelData = {
      es: {
        all: { name: 'Todos los Niveles', icon: Trophy, color: 'bg-blue-50 text-blue-700' },
        beginner: { name: 'Nivel Inicial', icon: Award, color: 'bg-amber-50 text-amber-700' },
        intermediate: { name: 'Intermedio', icon: Medal, color: 'bg-gray-100 text-gray-700' },
        advanced: { name: 'Avanzado', icon: Trophy, color: 'bg-yellow-50 text-yellow-700' }
      },
      en: {
        all: { name: 'All Levels', icon: Trophy, color: 'bg-blue-50 text-blue-700' },
        beginner: { name: 'Entry-Level', icon: Award, color: 'bg-amber-50 text-amber-700' },
        intermediate: { name: 'Intermediate', icon: Medal, color: 'bg-gray-100 text-gray-700' },
        advanced: { name: 'Advanced', icon: Trophy, color: 'bg-yellow-50 text-yellow-700' }
      }
    }
    
    // Try to detect skill level from multiple sources
    let detectedLevel = league.skillLevel || 'all'
    
    // Fallback: detect from name/slug if skillLevel not set
    if (detectedLevel === 'all') {
      const name = league.name?.toLowerCase() || ''
      const slug = league.slug?.toLowerCase() || ''
      
      if (name.includes('gold') || name.includes('oro') || slug.includes('gold')) {
        detectedLevel = 'advanced'
      } else if (name.includes('silver') || name.includes('plata') || slug.includes('silver')) {
        detectedLevel = 'intermediate'
      } else if (name.includes('bronze') || name.includes('bronce') || slug.includes('bronze')) {
        detectedLevel = 'beginner'
      }
    }
    
    return skillLevelData[locale]?.[detectedLevel] || skillLevelData['es'][detectedLevel] || skillLevelData['es']['all']
  }
  
  // Get skill level description (SHORT version for cards)
  const getSkillLevelDescription = () => {
    // Try to detect skill level from multiple sources
    let skillLevel = league.skillLevel || 'all'
    
    // Fallback: detect from name/slug if skillLevel not set
    if (skillLevel === 'all') {
      const name = league.name?.toLowerCase() || ''
      const slug = league.slug?.toLowerCase() || ''
      
      if (name.includes('gold') || name.includes('oro') || slug.includes('gold')) {
        skillLevel = 'advanced'
      } else if (name.includes('silver') || name.includes('plata') || slug.includes('silver')) {
        skillLevel = 'intermediate'
      } else if (name.includes('bronze') || name.includes('bronce') || slug.includes('bronze')) {
        skillLevel = 'beginner'
      }
    }
    
    // Map 'all' to 'open' for descriptions
    const descKey = skillLevel === 'all' ? 'open' : skillLevel
    return shortLevelDescriptions[locale]?.[descKey] || shortLevelDescriptions['es'][descKey] || ''
  }
  
  // Get gradient overlay color based on skill level
  const getGradientOverlay = () => {
    const skillLevel = league.skillLevel || 'all'
    const name = league.name?.toLowerCase() || ''
    const slug = league.slug?.toLowerCase() || ''
    
    // Detect Gold league
    if (skillLevel === 'advanced' || name.includes('gold') || name.includes('oro') || slug.includes('gold')) {
      return 'bg-gradient-to-t from-yellow-900/90 via-yellow-700/50 to-transparent'
    }
    
    // Detect Silver league
    if (skillLevel === 'intermediate' || name.includes('silver') || name.includes('plata') || slug.includes('silver')) {
      return 'bg-gradient-to-t from-gray-900/90 via-gray-600/50 to-transparent'
    }
    
    // Detect Bronze league
    if (skillLevel === 'beginner' || name.includes('bronze') || name.includes('bronce') || slug.includes('bronze')) {
      return 'bg-gradient-to-t from-amber-900/90 via-orange-700/50 to-transparent'
    }
    
    // Default gradient for open/all levels
    return 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
  }
  
  // Get localized league name
  const getLeagueName = () => {
    const name = league.name || ''
    
    if (locale === 'es') {
      // Translate English league names to Spanish on the fly
      return name
        .replace(/Gold League/gi, 'Liga de Oro')
        .replace(/Silver League/gi, 'Liga de Plata')
        .replace(/Bronze League/gi, 'Liga de Bronce')
        .replace(/League/gi, 'Liga')
    }
    
    return name
  }
  
  const seasonName = getSeasonName()
  const skillLevelInfo = getSkillLevelInfo()
  const skillLevelDescription = getSkillLevelDescription()
  const gradientOverlay = getGradientOverlay()
  const SkillIcon = skillLevelInfo.icon
  
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
  
  // Get the appropriate button config and link - ALL link to info page
  const getButtonConfig = () => {
    const infoUrl = `/${locale}/leagues/${citySlug}/info/${league.slug}`
    
    if (isActive) {
      return {
        text: locale === 'es' ? 'Ver Liga' : 'View League',
        href: infoUrl,
        className: 'bg-parque-purple text-white hover:bg-parque-purple/90'
      };
    } else if (isRegistrationOpen) {
      return {
        text: locale === 'es' ? 'Más Información' : 'Learn More',
        href: infoUrl,
        className: 'bg-parque-green text-white hover:bg-parque-green/90'
      };
    } else if (isComingSoon) {
      return {
        text: locale === 'es' ? 'Próximamente' : 'Coming Soon',
        href: infoUrl,
        className: 'bg-blue-600 text-white hover:bg-blue-700'
      };
    } else {
      return {
        text: locale === 'es' ? 'Ver Detalles' : 'View Details',
        href: infoUrl,
        className: 'bg-gray-600 text-white hover:bg-gray-700'
      };
    }
  };

  const buttonConfig = getButtonConfig();
  
  // Card content
  const cardContent = (
    <>
      {/* Skill Level Medal Badge - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-xl border-3 border-white/80 ${
          skillLevelInfo.color === 'bg-yellow-50 text-yellow-700'
            ? 'bg-yellow-500'
            : skillLevelInfo.color === 'bg-gray-100 text-gray-700'
            ? 'bg-gray-400'
            : skillLevelInfo.color === 'bg-amber-50 text-amber-700'
            ? 'bg-amber-600'
            : 'bg-blue-500'
        }`}>
          <SkillIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Status Badge - Top Right */}
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

        {/* Gradient overlay - color based on league level */}
        <div className={`absolute inset-0 ${gradientOverlay}`}></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-3xl font-bold text-white drop-shadow-lg text-center px-4">{getLeagueName()}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 pb-5 flex flex-col">
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
          {/* Always show season - detect from league data or slug */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
            <Calendar className="w-4 h-4" />
            <span>{seasonName}</span>
          </div>
          {/* Always show skill level - use fallback if not available */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${skillLevelInfo.color}`}>
            <SkillIcon className="w-4 h-4" />
            <span>{skillLevelInfo.name}</span>
          </div>
        </div>
        
        {/* Description - use level descriptions matching info page */}
        <p className="text-gray-600 line-clamp-3">
          {skillLevelDescription || 
           league.description?.[locale] || 
           (locale === 'es' 
             ? `Liga de tenis en ${locationString}. Únete y compite con jugadores de tu nivel.`
             : `Tennis league in ${locationString}. Join and compete with players at your level.`
           )
          }
        </p>
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
