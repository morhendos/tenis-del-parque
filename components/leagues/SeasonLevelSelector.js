'use client'
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
    // Purple theme - matches brand
    heroBg: 'bg-gray-800',
    imageOverlay: 'bg-gradient-to-t from-black/70 via-black/30 to-transparent',
    badgeOpen: 'bg-parque-purple text-white',
    badgeCurrent: 'bg-blue-500',
    badgeComingSoon: 'bg-gray-500',
    helpButton: 'text-parque-purple hover:text-purple-700',
    checkColor: 'text-parque-purple',
    tipBg: 'bg-purple-50 border-purple-200 text-purple-800',
    spotsColor: 'text-parque-purple',
    textColor: 'text-white',
    textMuted: 'text-white/80',
    // Card styling
    cardBg: 'bg-white',
    cardBorder: '',
    cardShadow: 'shadow-lg',
    sectionBg: '',
    headerText: 'text-gray-900',
    footerBorder: 'border-gray-100',
    footerText: 'text-gray-600',
    priceText: 'text-gray-900',
    isDark: false,
  },
  dark: {
    // Dark glassmorphism theme
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
    // Card styling - Dark glassmorphism
    cardBg: 'bg-white/10 backdrop-blur-md',
    cardBorder: 'border border-white/20',
    cardShadow: 'shadow-2xl',
    sectionBg: 'bg-white/5',
    headerText: 'text-white',
    footerBorder: 'border-white/10',
    footerText: 'text-gray-400',
    priceText: 'text-white',
    isDark: true,
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
    bgLight: 'bg-orange-100',
    border: 'border-orange-400',
    text: 'text-orange-700',
    ring: 'ring-orange-400',
    order: 3
  }
}

const seasonTypeNames = {
  es: { spring: 'Primavera', summer: 'Verano', autumn: 'Oto\u00f1o', winter: 'Invierno', annual: 'Anual' },
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

// Level Helper Bottom Sheet
function LevelHelperModal({ isOpen, onClose, locale, colors, leagues, status }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [isAnimatingIn, setIsAnimatingIn] = useState(true)
  const [isMobile, setIsMobile] = useState(true) // Default to mobile for SSR
  const sheetRef = useRef(null)
  const startYRef = useRef(0)
  
  // Check if this is a past or active season
  const isActivePastSeason = status === 'active' || status === 'past'
  
  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Create a map of skillLevel to league for easy lookup
  const leaguesByLevel = {}
  leagues?.forEach(league => {
    leaguesByLevel[league.skillLevel] = league
  })
  
  const content = {
    es: {
      title: '\u00bfQu\u00e9 nivel elegir?',
      intro: 'Elige seg\u00fan tu experiencia en tenis competitivo:',
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
            'M\u00faltiples temporadas competitivas',
            'Buscas partidos de alto nivel'
          ]
        }
      },
      tip: '\ud83d\udca1 Si tienes dudas, empieza en el nivel inferior. \u00a1Siempre puedes subir en la siguiente temporada!'
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
            "You've played in leagues or tournaments",
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
      tip: '\ud83d\udca1 If unsure, start at the lower level. You can always move up next season!'
    }
  }
  
  const c = content[locale]
  
  // Handle touch/mouse drag
  const handleDragStart = (e) => {
    if (isClosing) return
    setIsDragging(true)
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    startYRef.current = clientY - dragY
  }
  
  const handleDragMove = (e) => {
    if (!isDragging || isClosing) return
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
    const newDragY = Math.max(0, clientY - startYRef.current)
    setDragY(newDragY)
  }
  
  // Animate close - slide down and fade out
  const closeWithAnimation = () => {
    setIsClosing(true)
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      setIsClosing(false)
      setDragY(0)
      onClose()
    }, 300)
  }
  
  const handleDragEnd = () => {
    setIsDragging(false)
    // If dragged more than 100px, close with animation
    if (dragY > 100) {
      closeWithAnimation()
    } else {
      setDragY(0)
    }
  }
  
  // Handle backdrop click
  const handleBackdropClick = () => {
    closeWithAnimation()
  }
  
  // Handle X button click
  const handleCloseClick = () => {
    closeWithAnimation()
  }
  
  // Reset drag when closing & prevent body scroll
  useEffect(() => {
    if (!isOpen) {
      setDragY(0)
      setIsAnimatingIn(true) // Reset for next open
    } else {
      // Trigger opening animation
      requestAnimationFrame(() => {
        setIsAnimatingIn(false)
      })
    }
    
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  // Use portal to render at document.body level to avoid z-index stacking issues
  if (typeof document === 'undefined') return null
  
  return createPortal(
    <div className=\"fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4\">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isClosing || isAnimatingIn ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Bottom Sheet (mobile) / Modal (desktop) */}
      <div 
        ref={sheetRef}
        className={`relative bg-white w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl
          ${isMobile ? 'rounded-t-3xl' : 'rounded-2xl'}
          ${!isMobile && 'transition-all duration-300 ease-out'}
          ${!isMobile && (isClosing || isAnimatingIn) ? 'opacity-0 scale-95' : ''}
          ${!isMobile && !(isClosing || isAnimatingIn) ? 'opacity-100 scale-100' : ''}
        `}
        style={isMobile ? { 
          transform: `translateY(${isClosing || isAnimatingIn ? '100%' : `${dragY}px`})`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        } : undefined}
        onMouseMove={isMobile ? handleDragMove : undefined}
        onMouseUp={isMobile ? handleDragEnd : undefined}
        onMouseLeave={isMobile ? handleDragEnd : undefined}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Drag Handle - mobile only */}
        {isMobile && (
          <div 
            className=\"sticky top-0 bg-white pt-3 pb-2 cursor-grab active:cursor-grabbing z-10\"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className=\"w-10 h-1 bg-gray-300 rounded-full mx-auto\" />
          </div>
        )}
        
        {/* Header */}
        <div className={`px-5 pb-3 flex items-center justify-between border-b border-gray-100 ${!isMobile ? 'pt-5' : ''}`}>
          <h3 className=\"text-lg font-bold text-gray-900\">{c.title}</h3>
          <button 
            onClick={handleCloseClick}
            className=\"p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100\"
          >
            <X className=\"w-5 h-5\" />
          </button>
        </div>
        
        {/* Content */}
        <div className=\"p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-80px)]\">
          <p className=\"text-gray-600 text-sm\">{c.intro}</p>
          
          {/* Level descriptions */}
          {['beginner', 'intermediate', 'advanced'].map((level) => {
            const config = skillLevelConfig[level]
            const LevelIcon = config.icon
            const league = leaguesByLevel[level]
            const citySlug = league?.city?.slug || 'unknown'
            const leagueSlug = league?.slug
            
            const cardContent = (
              <>
                <div className=\"flex items-center gap-2 mb-2\">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    <LevelIcon className=\"w-4 h-4 text-white\" />
                  </div>
                  <h4 className={`font-semibold ${config.text}`}>
                    {c.levels[level].title}
                  </h4>
                  {league && (
                    <ChevronRight className={`w-4 h-4 ${config.text} opacity-50 ml-auto`} />
                  )}
                </div>
                <ul className=\"space-y-1.5 ml-10\">
                  {c.levels[level].points.map((point, i) => (
                    <li key={i} className=\"text-sm text-gray-600 flex items-start gap-2\">
                      <Check className={`w-4 h-4 ${colors.checkColor} flex-shrink-0 mt-0.5`} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </>
            )
            
            // If we have a league, make it clickable
            if (league && leagueSlug) {
              // Determine link based on status
              // Active/past leagues go to public league page
              // Registration open leagues go to info/registration page
              const linkHref = isActivePastSeason
                ? `/${locale}/${citySlug}/liga/${leagueSlug}`
                : `/${locale}/leagues/${citySlug}/info/${leagueSlug}`
              
              return (
                <Link
                  key={level}
                  href={linkHref}
                  onClick={handleCloseClick}
                  className={`${config.bgLight} rounded-xl p-4 border ${config.border} block hover:shadow-md active:scale-[0.99] transition-all`}
                >
                  {cardContent}
                </Link>
              )
            }
            
            // Otherwise just render as a div
            return (
              <div key={level} className={`${config.bgLight} rounded-xl p-4 border ${config.border}`}>
                {cardContent}
              </div>
            )
          })}
          
          {/* Tip */}
          <div className=\"bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600\">
            {c.tip}
          </div>
        </div>
        
        {/* Safe area padding for iOS - mobile only */}
        {isMobile && <div className=\"h-safe-area-inset-bottom bg-white\" />}
      </div>
    </div>,
    document.body
  )
}

// Individual Level Option (clickable)
function LevelOption({ league, locale, isRegistrationOpen, showSpots = false, colors, status }) {
  const config = skillLevelConfig[league.skillLevel] || skillLevelConfig.intermediate
  const LevelIcon = config.icon
  const levelName = config.name[locale]
  const levelSubtitle = config.subtitle[locale]
  const citySlug = league.city?.slug || 'unknown'
  
  const playerCount = league.stats?.registeredPlayers || 0
  const maxPlayers = league.seasonConfig?.maxPlayers || 32
  const spotsLeft = maxPlayers - playerCount
  const isFull = spotsLeft <= 0
  
  // Dark mode specific styles
  const isDark = colors.isDark
  
  // Determine the correct link based on status
  // Active/past/completed leagues go to public league page
  // Registration open leagues go to info/registration page
  const isActivePastOrCompleted = status === 'active' || status === 'past' || league.status === 'completed' || league.status === 'active'
  const linkHref = isActivePastOrCompleted
    ? `/${locale}/${citySlug}/liga/${league.slug}`
    : `/${locale}/leagues/${citySlug}/info/${league.slug}`
  
  return (
    <Link
      href={linkHref}
      className={`
        relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 
        transition-all duration-200 
        ${isFull 
          ? isDark 
            ? 'bg-white/5 border-white/10 opacity-60' 
            : 'bg-gray-50 border-gray-200 opacity-60'
          : isDark
            ? `bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 active:scale-[0.98]`
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
        <LevelIcon className=\"w-6 h-6 sm:w-7 sm:h-7 text-white\" />
      </div>
      
      {/* Level Name */}
      <span className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : config.text}`}>
        {levelName}
      </span>
      
      {/* Subtitle */}
      <span className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {levelSubtitle}
      </span>
      
      {/* Spots indicator - only shown if showSpots is true */}
      {showSpots && isRegistrationOpen && (
        <div className=\"mt-2 text-xs\">
          {isFull ? (
            <span className=\"text-red-400 font-medium\">
              {locale === 'es' ? 'Completo' : 'Full'}
            </span>
          ) : playerCount > 0 ? (
            <span className={`${isDark ? 'text-parque-green' : colors.spotsColor} font-medium`}>
              {spotsLeft} {locale === 'es' ? 'plazas' : 'spots'}
            </span>
          ) : (
            <span className={`${isDark ? 'text-parque-green' : colors.spotsColor} font-medium`}>
              {maxPlayers} {locale === 'es' ? 'plazas' : 'spots'}
            </span>
          )}
        </div>
      )}
      
      {/* Arrow indicator - hidden on mobile */}
      <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 hidden sm:block ${isDark ? 'text-white' : config.text}`} />
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
      <div className={`${colors.cardBg} ${colors.cardBorder} ${colors.cardShadow} rounded-2xl overflow-hidden`}>
        {/* Hero Image with Season Info */}
        <div className={`relative h-32 sm:h-40 ${colors.heroBg}`}>
          {cityImage && (
            <Image
              src={cityImage}
              alt={cityName}
              fill
              className=\"object-cover\"
            />
          )}
          <div className={`absolute inset-0 ${colors.imageOverlay}`} />
          
          {/* Season Badge */}
          <div className=\"absolute top-3 left-3 sm:top-4 sm:left-4\">
            {isRegistrationOpen ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.badgeOpen} text-xs sm:text-sm font-semibold rounded-full shadow-lg`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${variant === 'home' ? 'bg-parque-purple' : 'bg-white'}`} />
                {locale === 'es' ? 'Inscripci\u00f3n Abierta' : 'Registration Open'}
              </span>
            ) : status === 'current' ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.badgeCurrent} text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg`}>
                {locale === 'es' ? 'En Curso' : 'In Progress'}
              </span>
            ) : status === 'past' ? (
              <span className=\"inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg\">
                {locale === 'es' ? 'Temporada Pasada' : 'Past Season'}
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.badgeComingSoon} text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg`}>
                {locale === 'es' ? 'Pr\u00f3ximamente' : 'Coming Soon'}
              </span>
            )}
          </div>
          
          {/* Season Title */}
          <div className=\"absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4\">
            <div className={`flex items-center gap-2 ${colors.textMuted} text-xs sm:text-sm mb-1`}>
              <MapPin className=\"w-3.5 h-3.5\" />
              <span>{cityName}</span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${colors.textColor}`}>
              <Calendar className=\"w-5 h-5 sm:w-6 sm:h-6\" />
              {seasonName}
            </h3>
          </div>
        </div>
        
        {/* Level Selection Area */}
        <div className={`p-4 sm:p-5 ${colors.sectionBg}`}>
          {/* Header */}
          <div className=\"flex items-center justify-between mb-4\">
            <h4 className={`font-semibold ${colors.headerText}`}>
              {locale === 'es' ? 'Elige tu nivel' : 'Choose your level'}
            </h4>
            <button
              onClick={() => setShowHelper(true)}
              className={`flex items-center gap-1 text-sm ${colors.isDark ? 'text-gray-400 hover:text-white' : colors.helpButton} transition-colors`}
            >
              <HelpCircle className=\"w-4 h-4\" />
              <span>
                {locale === 'es' ? '\u00bfCu\u00e1l elegir?' : 'Which one?'}
              </span>
            </button>
          </div>
          
          {/* Level Options Grid */}
          <div className=\"grid grid-cols-3 gap-2 sm:gap-3\">
            {sortedLeagues.map(league => (
              <LevelOption 
                key={league._id}
                league={league}
                locale={locale}
                isRegistrationOpen={isRegistrationOpen}
                showSpots={showSpots}
                colors={colors}
                status={status}
              />
            ))}
          </div>
          
          {/* Footer info - dates, spots, price */}
          {(dateRange || showSpots || showPrice) && (
            <div className={`mt-4 pt-4 border-t ${colors.footerBorder} flex items-center justify-between text-sm`}>
              <div className={`flex items-center gap-4 ${colors.footerText}`}>
                {dateRange && (
                  <div className=\"flex items-center gap-1.5\">
                    <Calendar className=\"w-4 h-4\" />
                    <span>{dateRange}</span>
                  </div>
                )}
                {showSpots && (
                  <div className=\"flex items-center gap-1.5\">
                    <Users className=\"w-4 h-4\" />
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
                <div className={`font-semibold ${colors.priceText}`}>
                  {isFree 
                    ? (locale === 'es' ? 'Gratis' : 'Free')
                    : `${price}\u20ac`
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
        status={status}
      />
    </>
  )
}
