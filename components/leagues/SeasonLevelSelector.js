'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Medal, Award, MapPin, Calendar, Users, ChevronRight, HelpCircle, X, Check } from 'lucide-react'

/**
 * =============================================================================
 * UNIFIED SEASON CARD - Shows ONE season with multiple skill levels to choose
 * =============================================================================
 * 
 * Props:
 * - variant: "default" (emerald/teal) | "home" (purple/yellow with winter feel)
 * - showSpots: boolean - show available spots
 * - showPrice: boolean - show price
 */

// Color schemes for different variants
const colorSchemes = {
  default: {
    // Emerald/Teal - for city league pages
    heroBg: 'bg-gradient-to-br from-emerald-600 to-teal-600',
    imageOverlay: 'bg-gradient-to-t from-black/60 to-transparent',
    badgeOpen: 'bg-emerald-500 text-white',
    badgeCurrent: 'bg-blue-500',
    badgeComingSoon: 'bg-gray-500',
    helpButton: 'text-emerald-600 hover:text-emerald-700',
    checkColor: 'text-emerald-500',
    tipBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    spotsColor: 'text-emerald-600',
    textColor: 'text-white',
    textMuted: 'text-white/80',
  },
  home: {
    // Clean dark theme for home page - minimal purple, let the photo shine
    heroBg: 'bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900',
    imageOverlay: 'bg-gradient-to-t from-black/50 via-black/20 to-transparent',
    badgeOpen: 'bg-parque-yellow text-parque-purple',
    badgeCurrent: 'bg-blue-500',
    badgeComingSoon: 'bg-gray-500',
    helpButton: 'text-parque-purple hover:text-purple-700',
    checkColor: 'text-parque-purple',
    tipBg: 'bg-purple-50 border-purple-200 text-purple-800',
    spotsColor: 'text-parque-purple',
    textColor: 'text-white',
    textMuted: 'text-white/80',
  }
}

const skillLevelConfig = {
  advanced: {
    icon: Trophy,
    name: { es: 'Oro', en: 'Gold' },
    subtitle: { es: 'Avanzado', en: 'Advanced' },
    gradient: 'from-yellow-400 to-amber-500',
    bgLight: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    ring: 'ring-yellow-400',
    order: 1
  },
  intermediate: {
    icon: Medal,
    name: { es: 'Plata', en: 'Silver' },
    subtitle: { es: 'Intermedio', en: 'Intermediate' },
    gradient: 'from-gray-300 to-gray-400',
    bgLight: 'bg-gray-100',
    border: 'border-gray-400',
    text: 'text-gray-700',
    ring: 'ring-gray-400',
    order: 2
  },
  beginner: {
    icon: Award,
    name: { es: 'Bronce', en: 'Bronze' },
    subtitle: { es: 'Principiante', en: 'Entry-Level' },
    gradient: 'from-amber-600 to-amber-700',
    bgLight: 'bg-amber-50',
    border: 'border-amber-600',
    text: 'text-amber-700',
    ring: 'ring-amber-600',
    order: 3
  }
}

const seasonTypeNames = {
  es: { spring: 'Primavera', summer: 'Verano', autumn: 'Otoño', winter: 'Invierno', annual: 'Anual' },
  en: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter', annual: 'Annual' }
}

// Format date for display
function formatDate(dateString, locale) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'short'
  })
}

// Format date range
function formatDateRange(startDate, endDate, locale) {
  const start = formatDate(startDate, locale)
  const end = formatDate(endDate, locale)
  
  if (!start && !end) return null
  if (start && end) return `${start} - ${end}`
  if (start) return `${locale === 'es' ? 'Desde' : 'From'} ${start}`
  return `${locale === 'es' ? 'Hasta' : 'Until'} ${end}`
}

// Level Helper Modal
function LevelHelperModal({ isOpen, onClose, locale, colors, leagues }) {
  if (!isOpen) return null
  
  // Create a map of skillLevel to league for easy lookup
  const leaguesByLevel = {}
  leagues?.forEach(league => {
    leaguesByLevel[league.skillLevel] = league
  })
  
  const content = {
    es: {
      title: '¿Qué nivel elegir?',
      intro: 'Elige según tu experiencia en tenis competitivo:',
      levels: {
        beginner: {
          title: 'Bronce - Principiante',
          points: [
            'Primera vez en una liga de tenis',
            'Juegas de forma recreativa',
            'Quieres mejorar y divertirte'
          ]
        },
        intermediate: {
          title: 'Plata - Intermedio',
          points: [
            'Has jugado en ligas o torneos',
            'Juegas regularmente',
            'Tienes saques y golpes de fondo consistentes'
          ]
        },
        advanced: {
          title: 'Oro - Avanzado',
          points: [
            'Dominas a nivel recreativo',
            'Múltiples temporadas competitivas',
            'Buscas partidos de alto nivel'
          ]
        }
      },
      tip: '💡 Si tienes dudas, empieza en el nivel inferior. ¡Siempre puedes subir en la siguiente temporada!'
    },
    en: {
      title: 'Which level to choose?',
      intro: 'Choose based on your competitive tennis experience:',
      levels: {
        beginner: {
          title: 'Bronze - Entry-Level',
          points: [
            'First time in a tennis league',
            'You play recreationally',
            'Looking to improve and have fun'
          ]
        },
        intermediate: {
          title: 'Silver - Intermediate',
          points: [
            'You\'ve played in leagues or tournaments',
            'You play regularly',
            'You have consistent serves and groundstrokes'
          ]
        },
        advanced: {
          title: 'Gold - Advanced',
          points: [
            'You dominate at recreational level',
            'Multiple competitive seasons',
            'Looking for high-level matches'
          ]
        }
      },
      tip: '💡 If unsure, start at the lower level. You can always move up next season!'
    }
  }
  
  const c = content[locale]
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-2xl max-h-[85vh] overflow-hidden shadow-xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-60px)]">
          <p className="text-gray-600 text-sm">{c.intro}</p>
          
          {/* Level descriptions */}
          {['beginner', 'intermediate', 'advanced'].map((level) => {
            const config = skillLevelConfig[level]
            const LevelIcon = config.icon
            const league = leaguesByLevel[level]
            const citySlug = league?.city?.slug || 'unknown'
            const leagueSlug = league?.slug
            
            const content = (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    <LevelIcon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className={`font-semibold ${config.text}`}>
                    {c.levels[level].title}
                  </h4>
                  {league && (
                    <ChevronRight className={`w-4 h-4 ${config.text} opacity-50 ml-auto`} />
                  )}
                </div>
                <ul className="space-y-1.5 ml-10">
                  {c.levels[level].points.map((point, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <Check className={`w-4 h-4 ${colors.checkColor} flex-shrink-0 mt-0.5`} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </>
            )
            
            // If we have a league, make it clickable
            if (league && leagueSlug) {
              return (
                <Link
                  key={level}
                  href={`/${locale}/leagues/${citySlug}/info/${leagueSlug}`}
                  onClick={onClose}
                  className={`${config.bgLight} rounded-xl p-4 border ${config.border} block hover:shadow-md active:scale-[0.99] transition-all`}
                >
                  {content}
                </Link>
              )
            }
            
            // Otherwise just render as a div
            return (
              <div key={level} className={`${config.bgLight} rounded-xl p-4 border ${config.border}`}>
                {content}
              </div>
            )
          })}
          
          {/* Tip */}
          <div className={`${colors.tipBg} border rounded-xl p-4 text-sm`}>
            {c.tip}
          </div>
        </div>
      </div>
    </div>
  )
}

// Individual Level Option (clickable)
function LevelOption({ league, locale, isRegistrationOpen, showSpots = false, colors }) {
  const config = skillLevelConfig[league.skillLevel] || skillLevelConfig.intermediate
  const LevelIcon = config.icon
  const levelName = config.name[locale]
  const levelSubtitle = config.subtitle[locale]
  const citySlug = league.city?.slug || 'unknown'
  
  const playerCount = league.stats?.registeredPlayers || 0
  const maxPlayers = league.seasonConfig?.maxPlayers || 32
  const spotsLeft = maxPlayers - playerCount
  const isFull = spotsLeft <= 0
  
  return (
    <Link
      href={`/${locale}/leagues/${citySlug}/info/${league.slug}`}
      className={`
        relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 
        transition-all duration-200 
        ${isFull 
          ? 'bg-gray-50 border-gray-200 opacity-60' 
          : `${config.bgLight} ${config.border} hover:shadow-md active:scale-[0.98]`
        }
      `}
    >
      {/* Level Icon */}
      <div className={`
        w-12 h-12 sm:w-14 sm:h-14 rounded-full 
        bg-gradient-to-br ${config.gradient} 
        flex items-center justify-center mb-2 shadow-md
      `}>
        <LevelIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
      
      {/* Level Name */}
      <span className={`font-bold text-base sm:text-lg ${config.text}`}>
        {levelName}
      </span>
      
      {/* Subtitle */}
      <span className="text-xs text-gray-500 mt-0.5">
        {levelSubtitle}
      </span>
      
      {/* Spots indicator - only shown if showSpots is true */}
      {showSpots && isRegistrationOpen && (
        <div className="mt-2 text-xs">
          {isFull ? (
            <span className="text-red-600 font-medium">
              {locale === 'es' ? 'Completo' : 'Full'}
            </span>
          ) : playerCount > 0 ? (
            <span className={`${colors.spotsColor} font-medium`}>
              {spotsLeft} {locale === 'es' ? 'plazas' : 'spots'}
            </span>
          ) : (
            <span className={`${colors.spotsColor} font-medium`}>
              {maxPlayers} {locale === 'es' ? 'plazas' : 'spots'}
            </span>
          )}
        </div>
      )}
      
      {/* Arrow indicator - hidden on mobile */}
      <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${config.text} opacity-50 hidden sm:block`} />
    </Link>
  )
}

// Main Unified Season Card Component
export default function SeasonLevelSelector({ 
  leagues, 
  locale, 
  status, 
  showSpots = false, 
  showPrice = false,
  variant = 'default'
}) {
  const [showHelper, setShowHelper] = useState(false)
  
  // Get color scheme based on variant
  const colors = colorSchemes[variant] || colorSchemes.default
  
  if (!leagues || leagues.length === 0) return null
  
  // Get season info from first league (they all share the same season)
  const firstLeague = leagues[0]
  const seasonType = seasonTypeNames[locale][firstLeague.season?.type] || firstLeague.season?.type
  const seasonYear = firstLeague.season?.year || ''
  const seasonName = `${seasonType} ${seasonYear}`
  const cityName = firstLeague.city?.name?.[locale] || firstLeague.city?.name?.es || ''
  const isRegistrationOpen = leagues.some(l => l.status === 'registration_open')
  
  // Get dates from first league (shared across all levels)
  const startDate = firstLeague.seasonConfig?.startDate
  const endDate = firstLeague.seasonConfig?.endDate
  const dateRange = formatDateRange(startDate, endDate, locale)
  
  // Sort leagues by skill level order (Gold, Silver, Bronze)
  const sortedLeagues = [...leagues].sort((a, b) => {
    const orderA = skillLevelConfig[a.skillLevel]?.order || 99
    const orderB = skillLevelConfig[b.skillLevel]?.order || 99
    return orderA - orderB
  })
  
  // Get city image
  const cityImage = firstLeague.city?.images?.hero || firstLeague.city?.images?.main || null
  
  // Calculate total spots available
  const totalSpots = leagues.reduce((sum, l) => sum + (l.seasonConfig?.maxPlayers || 32), 0)
  const totalRegistered = leagues.reduce((sum, l) => sum + (l.stats?.registeredPlayers || 0), 0)
  
  // Get price (assuming same across levels)
  const price = firstLeague.seasonConfig?.price?.amount || 0
  const isFree = firstLeague.seasonConfig?.price?.isFree || price === 0
  
  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Hero Image with Season Info */}
        <div className={`relative h-32 sm:h-40 ${colors.heroBg}`}>
          {cityImage && (
            <Image
              src={cityImage}
              alt={cityName}
              fill
              className={`object-cover ${variant === 'home' ? 'opacity-80' : 'opacity-40'}`}
            />
          )}
          <div className={`absolute inset-0 ${colors.imageOverlay}`} />
          
          {/* Season Badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            {isRegistrationOpen ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.badgeOpen} text-xs sm:text-sm font-semibold rounded-full shadow-lg`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${variant === 'home' ? 'bg-parque-purple' : 'bg-white'}`} />
                {locale === 'es' ? 'Inscripción Abierta' : 'Registration Open'}
              </span>
            ) : status === 'current' ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.badgeCurrent} text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg`}>
                {locale === 'es' ? 'En Curso' : 'In Progress'}
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.badgeComingSoon} text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg`}>
                {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
              </span>
            )}
          </div>
          
          {/* Season Title */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
            <div className={`flex items-center gap-2 ${colors.textMuted} text-xs sm:text-sm mb-1`}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{cityName}</span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${colors.textColor}`}>
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              {seasonName}
            </h3>
          </div>
        </div>
        
        {/* Level Selection Area */}
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {locale === 'es' ? 'Elige tu nivel' : 'Choose your level'}
            </h4>
            <button
              onClick={() => setShowHelper(true)}
              className={`flex items-center gap-1 text-sm ${colors.helpButton} transition-colors`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="sm:hidden text-xs">
                {locale === 'es' ? '¿Cuál?' : 'Which?'}
              </span>
              <span className="hidden sm:inline">
                {locale === 'es' ? '¿Cuál elegir?' : 'Which one?'}
              </span>
            </button>
          </div>
          
          {/* Level Options Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {sortedLeagues.map(league => (
              <LevelOption 
                key={league._id}
                league={league}
                locale={locale}
                isRegistrationOpen={isRegistrationOpen}
                showSpots={showSpots}
                colors={colors}
              />
            ))}
          </div>
          
          {/* Footer info - dates, spots, price */}
          {(dateRange || showSpots || showPrice) && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-600">
                {dateRange && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{dateRange}</span>
                  </div>
                )}
                {showSpots && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>
                      {isRegistrationOpen 
                        ? `${totalSpots - totalRegistered} ${locale === 'es' ? 'plazas' : 'spots'}`
                        : `${totalRegistered} ${locale === 'es' ? 'jugadores' : 'players'}`
                      }
                    </span>
                  </div>
                )}
              </div>
              {showPrice && (
                <div className="font-semibold text-gray-900">
                  {isFree 
                    ? (locale === 'es' ? 'Gratis' : 'Free')
                    : `${price}€`
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Helper Modal */}
      <LevelHelperModal 
        isOpen={showHelper} 
        onClose={() => setShowHelper(false)} 
        locale={locale}
        colors={colors}
        leagues={sortedLeagues}
      />
    </>
  )
}
