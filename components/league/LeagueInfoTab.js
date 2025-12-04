'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, CreditCard, TrendingUp, Award, Info, Trophy, Target, ChartLine, Shield, Sparkles, Heart, CheckCircle, Clock, Tag, Medal } from 'lucide-react'
import RegistrationCountdown from '@/components/ui/RegistrationCountdown'

// Level descriptions for different league types
const levelDescriptions = {
  es: {
    beginner: {
      title: 'Inicial',
      description: '¿Nuevo en el tenis competitivo? Esta liga de nivel inicial ofrece competición estructurada donde cada punto importa. Perfecta para competidores primerizos listos para la experiencia de liga organizada.',
      skills: [
        'Perfecta para competidores menos experimentados',
        'Partidos estructurados con organización clara',
        'Ambiente amigable con menos presión',
        'Desarrolla confianza en juego competitivo'
      ]
    },
    intermediate: {
      title: 'Intermedio',
      description: 'Para jugadores con experiencia competitiva listos para partidos desafiantes regulares. Un paso adelante del nivel inicial con juego más intenso contra oponentes de habilidad similar.',
      skills: [
        'Experiencia jugando partidos competitivos',
        'Base técnica sólida en la mayoría de golpes',
        'Preparado para oponentes equilibrados y desafiantes',
        'Busca mejorar a través de competición regular'
      ]
    },
    advanced: {
      title: 'Avanzado',
      description: 'Para jugadores con años de experiencia competitiva y técnica refinada. Partidos de alta intensidad donde la estrategia y la consistencia son esenciales para competir.',
      skills: [
        'Años de experiencia en competición',
        'Técnica refinada en todos los golpes',
        'Juego estratégico avanzado',
        'Alta intensidad física y mental'
      ]
    },
    open: {
      title: 'Abierta',
      description: 'Liga multi-nivel donde jugadores de diferentes habilidades compiten. El sistema ELO garantiza partidos equilibrados basados en tu nivel real.',
      skills: [
        'Todos los niveles bienvenidos',
        'Emparejamientos basados en ELO',
        'Oportunidad de jugar contra variedad de jugadores',
        'Ambiente inclusivo y competitivo'
      ]
    }
  },
  en: {
    beginner: {
      title: 'Beginner',
      description: 'New to competitive tennis? This entry-level league offers structured competition where every point matters. Perfect for first-time competitors ready to experience organized league play.',
      skills: [
        'Perfect for less experienced competitors',
        'Structured matches with clear organization',
        'Friendly atmosphere with less pressure',
        'Build confidence in competitive play'
      ]
    },
    intermediate: {
      title: 'Intermediate',
      description: 'For players with competitive experience ready for regular challenging matches. Step up from entry-level with more intense play against similarly skilled opponents.',
      skills: [
        'Experience playing competitive matches',
        'Solid technical foundation across most strokes',
        'Ready for balanced, challenging opponents',
        'Looking to improve through regular competition'
      ]
    },
    advanced: {
      title: 'Advanced',
      description: 'For players with years of competitive experience and refined technique. High-intensity matches where strategy and consistency are essential to compete.',
      skills: [
        'Years of competition experience',
        'Refined technique on all strokes',
        'Advanced strategic play',
        'High physical and mental intensity'
      ]
    },
    open: {
      title: 'Open',
      description: 'Multi-level league where players of different abilities compete. The ELO system ensures balanced matches based on your actual level.',
      skills: [
        'All levels welcome',
        'ELO-based matchmaking',
        'Opportunity to play against variety of players',
        'Inclusive and competitive environment'
      ]
    }
  }
}

export default function LeagueInfoTab({ league, currentSeason, language, locale }) {
  const [discountCode, setDiscountCode] = useState('')
  const [discountValid, setDiscountValid] = useState(false)
  const [discountDetails, setDiscountDetails] = useState(null)
  const [finalPrice, setFinalPrice] = useState(league.seasonConfig?.price?.amount || 0)

  const t = {
    es: {
      upcomingTitle: '¡Próximamente!',
      upcomingSubtitle: 'Esta liga comenzará pronto',
      registrationOpenTitle: '¡Inscripciones Abiertas!',
      registrationOpenSubtitle: 'Únete a la liga ahora',
      registrationClosing: 'Las inscripciones cierran',
      spotsRemaining: 'plazas disponibles',
      leagueDetails: 'Detalles de la Liga',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      availableSpots: 'Plazas Disponibles',
      price: 'Precio',
      free: 'Gratis',
      registerNow: '¡Inscríbete Ahora!',
      leagueLevel: 'Nivel de la Liga',
      whatToExpect: '¿Qué Esperar?',
      aboutLeague: 'Sobre Esta Liga',
      tournamentFormat: 'Formato del Torneo',
      rounds: 'rondas',
      swissFormat: 'Sistema Suizo',
      swissDescription: 'El sistema suizo empareja jugadores de nivel similar en cada ronda, garantizando partidos competitivos y equilibrados.',
      playoffSystem: 'Sistema de Playoffs',
      playoffDescription: 'Los mejores jugadores de la fase regular clasifican para los playoffs finales.',
      eloRanking: 'Ranking ELO',
      eloDescription: 'Tu clasificación se actualiza después de cada partido basándose en el resultado y el nivel de tu oponente.',
      whyJoin: '¿Por Qué Unirse?',
      benefits: [
        'Conoce a otros jugadores apasionados por el tenis',
        'Mejora tu juego con partidos competitivos regulares',
        'Sistema de emparejamiento justo basado en habilidad',
        'Seguimiento detallado de tu progreso y estadísticas'
      ],
      discountApplied: 'Código de descuento aplicado',
      originalPrice: 'Precio original',
      discount: 'Descuento'
    },
    en: {
      upcomingTitle: 'Coming Soon!',
      upcomingSubtitle: 'This league will start soon',
      registrationOpenTitle: 'Registration Open!',
      registrationOpenSubtitle: 'Join the league now',
      registrationClosing: 'Registration closes',
      spotsRemaining: 'spots remaining',
      leagueDetails: 'League Details',
      startDate: 'Start Date',
      endDate: 'End Date',
      availableSpots: 'Available Spots',
      price: 'Price',
      free: 'Free',
      registerNow: 'Register Now!',
      leagueLevel: 'League Level',
      whatToExpect: 'What to Expect?',
      aboutLeague: 'About This League',
      tournamentFormat: 'Tournament Format',
      rounds: 'rounds',
      swissFormat: 'Swiss System',
      swissDescription: 'The Swiss system pairs players of similar level in each round, ensuring competitive and balanced matches.',
      playoffSystem: 'Playoff System',
      playoffDescription: 'Top players from the regular season qualify for the final playoffs.',
      eloRanking: 'ELO Ranking',
      eloDescription: 'Your rating is updated after each match based on the result and your opponent&apos;s level.',
      whyJoin: 'Why Join?',
      benefits: [
        'Meet other passionate tennis players',
        'Improve your game with regular competitive matches',
        'Fair skill-based matchmaking system',
        'Detailed tracking of your progress and statistics'
      ],
      discountApplied: 'Discount code applied',
      originalPrice: 'Original price',
      discount: 'Discount'
    }
  }

  const content = t[language]

  // Check for discount code in URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const urlDiscount = urlParams.get('discount')
      
      console.log('[LeagueInfo Discount Debug] URL:', window.location.href)
      console.log('[LeagueInfo Discount Debug] Query params:', window.location.search)
      console.log('[LeagueInfo Discount Debug] Discount param:', urlDiscount)
      
      if (urlDiscount) {
        console.log('[LeagueInfo Discount Debug] Applying discount code:', urlDiscount)
        setDiscountCode(urlDiscount.toUpperCase())
        validateDiscount(urlDiscount)
      }
    }
  }, [])

  const validateDiscount = async (code) => {
    if (!code || code.trim() === '') {
      setDiscountValid(false)
      setDiscountDetails(null)
      setFinalPrice(league.seasonConfig?.price?.amount || 0)
      return
    }

    try {
      const response = await fetch(`/api/leagues/${league.slug}/discount/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase()
        }),
      })

      const data = await response.json()

      if (data.valid) {
        setDiscountValid(true)
        setDiscountDetails(data)
        setFinalPrice(data.finalPrice)
        console.log('[LeagueInfo Discount Debug] Valid discount applied. Final price:', data.finalPrice)
      } else {
        setDiscountValid(false)
        setDiscountDetails(null)
        setFinalPrice(league.seasonConfig?.price?.amount || 0)
        console.log('[LeagueInfo Discount Debug] Invalid discount code')
      }
    } catch (error) {
      console.error('[LeagueInfo Discount Debug] Error validating discount:', error)
      setDiscountValid(false)
      setDiscountDetails(null)
      setFinalPrice(league.seasonConfig?.price?.amount || 0)
    }
  }
  
  // Determine league level from the skillLevel field or fallback to name/slug detection
  const getLeagueLevel = () => {
    // First, check if league has a skillLevel field
    if (league.skillLevel) {
      // Map 'all' to 'open' for display purposes
      if (league.skillLevel === 'all') return 'open'
      return league.skillLevel // 'beginner', 'intermediate', or 'advanced'
    }
    
    // Fallback: try to detect from name/slug
    const name = league.name?.toLowerCase() || league.slug?.toLowerCase() || ''
    if (name.includes('beginner') || name.includes('principiante')) return 'beginner'
    if (name.includes('advanced') || name.includes('avanzado')) return 'advanced'
    if (name.includes('open') || name.includes('abierta') || name.includes('general')) return 'open'
    
    // Default to intermediate if we can't determine
    return 'intermediate'
  }

  const leagueLevel = getLeagueLevel()
  const levelInfo = levelDescriptions[language][leagueLevel]

  // Get icon and color for each level
  const getLevelIcon = () => {
    switch (leagueLevel) {
      case 'advanced':
        return <Trophy className="w-8 h-8 text-yellow-500" />
      case 'intermediate':
        return <Medal className="w-8 h-8 text-gray-500" />
      case 'beginner':
        return <Award className="w-8 h-8 text-amber-600" />
      case 'open':
        return <Trophy className="w-8 h-8 text-parque-purple" />
      default:
        return <Award className="w-8 h-8 text-parque-purple" />
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Build registration URL with discount code if present
  const buildRegistrationUrl = () => {
    const baseUrl = `/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${league.slug}`
    if (discountCode && discountValid) {
      return `${baseUrl}?discount=${discountCode}`
    }
    return baseUrl
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Key Details Cards */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* League Details Card */}
        <div className="bg-white sm:bg-gray-50 border-0 sm:border-2 sm:border-gray-100 rounded-none sm:rounded-xl md:rounded-2xl px-4 sm:p-5 md:p-6 py-4 sm:hover:border-parque-purple/20 transition-all duration-300 sm:hover:shadow-lg">
          <h4 className="font-bold text-lg md:text-xl text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 md:w-6 md:h-6 text-parque-purple" />
            {content.leagueDetails}
          </h4>
          
          <div className="space-y-3 md:space-y-5">
            {league.seasonConfig?.startDate && (
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-1.5 md:p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-500 md:text-gray-600 md:mb-1">{content.startDate}</p>
                  <p className="text-sm md:text-lg font-semibold text-gray-900">
                    {formatDate(league.seasonConfig.startDate)}
                  </p>
                </div>
              </div>
            )}

            {league.seasonConfig?.endDate && (
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-500 md:text-gray-600 md:mb-1">{content.endDate}</p>
                  <p className="text-sm md:text-lg font-semibold text-gray-900">
                    {formatDate(league.seasonConfig.endDate)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-1.5 md:p-2 bg-purple-50 rounded-lg flex-shrink-0">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-500 md:text-gray-600 md:mb-1">{content.availableSpots}</p>
                <p className="text-sm md:text-lg font-semibold text-gray-900">
                  {league.seasonConfig?.maxPlayers || 32}
                </p>
              </div>
            </div>

            {/* Price with discount logic */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-1.5 md:p-2 bg-amber-50 rounded-lg flex-shrink-0">
                <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-500 md:text-gray-600 md:mb-1">{content.price}</p>
                
                {league.seasonConfig?.price?.isFree || league.seasonConfig?.price?.amount === 0 ? (
                  <p className="text-sm md:text-lg font-semibold text-gray-900">
                    {content.free}
                  </p>
                ) : (
                  <div className="space-y-1 md:space-y-2">
                    {discountValid && discountDetails ? (
                      <>
                        <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 bg-emerald-50 border border-emerald-200 rounded md:rounded-lg text-xs md:text-sm">
                          <Tag className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
                          <span className="font-medium text-emerald-700">
                            {discountCode} (-{discountDetails.discountPercentage}%)
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 md:gap-3">
                          <p className="text-sm md:text-xl font-semibold text-gray-400 line-through">
                            {discountDetails.originalPrice}€
                          </p>
                          <p className="text-lg md:text-3xl font-bold text-emerald-600">
                            {discountDetails.finalPrice}€
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm md:text-lg font-semibold text-gray-900">
                        {league.seasonConfig?.price?.amount}€
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Registration Countdown */}
            {league.status === 'registration_open' && league.seasonConfig?.registrationEnd && (
              <div className="pt-3 md:pt-5 mt-3 border-t border-gray-100 md:border-gray-200">
                <RegistrationCountdown 
                  registrationEnd={league.seasonConfig.registrationEnd} 
                  language={language}
                  compact={true}
                />
              </div>
            )}
          </div>

          {league.status === 'registration_open' && (
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100">
              <a
                href={buildRegistrationUrl()}
                className="relative block w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 font-semibold text-base md:text-lg shadow-md md:shadow-lg md:hover:shadow-xl md:transform md:hover:-translate-y-0.5 overflow-hidden group"
              >
                <span className="hidden md:block absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {content.registerNow}
                  <svg className="w-5 h-5 md:group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
            </div>
          )}
        </div>

        {/* League Level Card */}
        <div className="bg-white sm:bg-gradient-to-br sm:from-parque-purple/5 sm:to-purple-50 border-0 sm:border-2 sm:border-purple-100 rounded-none sm:rounded-xl md:rounded-2xl px-4 sm:p-5 md:p-6 py-4 sm:hover:border-parque-purple/30 transition-all duration-300 sm:hover:shadow-lg flex flex-col">
          <h4 className="font-bold text-lg md:text-xl text-gray-900 mb-3 md:mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 md:w-6 md:h-6 text-parque-purple" />
            {content.leagueLevel}
          </h4>
          
          <div className="flex-1 flex flex-col">
            <div className="space-y-3 md:space-y-4">
              <div>
                <h5 className="text-xl md:text-2xl font-bold text-parque-purple mb-1 md:mb-2">
                  {levelInfo.title}
                </h5>
                <p className="text-sm md:text-base text-gray-600 md:text-gray-700 leading-relaxed">
                  {levelInfo.description}
                </p>
              </div>

              <div className="pt-3 md:pt-4 border-t border-gray-100 sm:border-purple-200">
                <p className="text-xs md:text-sm font-semibold text-gray-700 md:text-gray-900 mb-2 md:mb-3">{content.whatToExpect}</p>
                <ul className="space-y-1.5 md:space-y-2">
                  {levelInfo.skills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-gray-600 md:text-gray-700">
                      <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Level Switcher */}
            <div className="pt-3 md:pt-4 border-t border-gray-100 sm:border-purple-200 mt-3 md:mt-auto">
              <p className="text-xs font-semibold text-gray-500 md:text-gray-600 mb-2 md:mb-3 uppercase tracking-wide">
                {language === 'es' ? 'Otros Niveles' : 'Other Levels'}
              </p>
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  // Get city slug and season info from current league (DYNAMIC)
                  const citySlug = league.city?.slug || league.location?.city?.toLowerCase().replace(/\s+/g, '-') || 'sotogrande'
                  
                  // ALWAYS extract season info from slug - it's the source of truth for URLs
                  // Slug format: {level}-league-{city}-{season}-{year}
                  let seasonType = null
                  let seasonYear = null
                  
                  // Find year (4-digit number at the end)
                  const yearMatch = league.slug?.match(/-(\d{4})$/)
                  if (yearMatch) {
                    seasonYear = yearMatch[1]
                  }
                  // Find season type (word before year)
                  const seasonMatch = league.slug?.match(/-(winter|summer|spring|fall|autumn)-(\d{4})$/i)
                  if (seasonMatch) {
                    seasonType = seasonMatch[1].toLowerCase()
                  }
                  
                  // Fallback to league.season only if slug parsing failed
                  if (!seasonType) seasonType = league.season?.type || 'winter'
                  if (!seasonYear) seasonYear = league.season?.year || '2025'
                  
                  // Define levels with their slugs and colors (Gold, Silver, Bronze order)
                  const levels = [
                    { 
                      key: 'advanced', 
                      label: language === 'es' ? 'Oro' : 'Gold',
                      slug: `gold-league-${citySlug}-${seasonType}-${seasonYear}`,
                      color: 'from-yellow-500 to-yellow-600',
                      bgColor: 'bg-yellow-50 border-yellow-300',
                      textColor: 'text-yellow-700',
                      icon: <Trophy className="w-4 h-4" />
                    },
                    { 
                      key: 'intermediate', 
                      label: language === 'es' ? 'Plata' : 'Silver',
                      slug: `silver-league-${citySlug}-${seasonType}-${seasonYear}`,
                      color: 'from-gray-400 to-gray-500',
                      bgColor: 'bg-gray-100 border-gray-300',
                      textColor: 'text-gray-700',
                      icon: <Medal className="w-4 h-4" />
                    },
                    { 
                      key: 'beginner', 
                      label: language === 'es' ? 'Bronce' : 'Bronze',
                      slug: `bronze-league-${citySlug}-${seasonType}-${seasonYear}`,
                      color: 'from-amber-600 to-orange-600',
                      bgColor: 'bg-amber-50 border-amber-200',
                      textColor: 'text-amber-700',
                      icon: <Award className="w-4 h-4" />
                    }
                  ]
                  
                  return levels.map((level) => {
                    const isCurrentLevel = leagueLevel === level.key
                    
                    if (isCurrentLevel) {
                      return (
                        <div
                          key={level.key}
                          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border-2 ${level.bgColor} font-medium md:font-semibold ${level.textColor} flex items-center gap-1.5 md:gap-2 text-xs md:text-sm`}
                        >
                          {level.icon}
                          {level.label}
                          <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </div>
                      )
                    }
                    
                    return (
                      <a
                        key={level.key}
                        href={`/${locale}/leagues/${citySlug}/info/${level.slug}`}
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg border-2 border-gray-200 bg-white hover:border-parque-purple/40 hover:bg-purple-50 transition-all duration-200 font-medium text-gray-600 md:text-gray-700 hover:text-parque-purple flex items-center gap-1.5 md:gap-2 text-xs md:text-sm group"
                      >
                        <span className="md:text-gray-400 md:group-hover:text-parque-purple transition-colors">
                          {level.icon}
                        </span>
                        {level.label}
                        <svg className="hidden md:block w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )
                  })
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About League Section */}
      <div className="bg-white sm:bg-gradient-to-br sm:from-gray-50 sm:via-white/50 sm:to-gray-50 border-0 sm:border-2 sm:border-gray-100 rounded-none sm:rounded-xl md:rounded-3xl px-4 sm:p-5 md:p-6 lg:p-8 py-4 md:transition-all md:duration-300 md:hover:scale-[1.01]">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-parque-purple to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center md:shadow-lg">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h4 className="font-bold text-lg md:text-2xl text-gray-900">{content.aboutLeague}</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {/* Swiss Format */}
          <div className="flex sm:flex-col gap-3 sm:gap-0 md:group md:hover:scale-105 md:transition-transform md:duration-300">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 md:mb-3 md:shadow-md md:group-hover:shadow-lg md:transition-shadow md:duration-300">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-emerald-700" />
            </div>
            <div className="flex-1 sm:mt-2 md:mt-0 md:space-y-2">
              <h5 className="font-semibold text-sm md:text-lg text-gray-900">{content.swissFormat}</h5>
              <p className="text-gray-500 md:text-gray-600 text-xs md:text-sm leading-relaxed mt-0.5 md:mt-0">
                {content.swissDescription}
              </p>
            </div>
          </div>

          {/* Playoff System */}
          <div className="flex sm:flex-col gap-3 sm:gap-0 md:group md:hover:scale-105 md:transition-transform md:duration-300">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 md:mb-3 md:shadow-md md:group-hover:shadow-lg md:transition-shadow md:duration-300">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-purple-700" />
            </div>
            <div className="flex-1 sm:mt-2 md:mt-0 md:space-y-2">
              <h5 className="font-semibold text-sm md:text-lg text-gray-900">{content.playoffSystem}</h5>
              <p className="text-gray-500 md:text-gray-600 text-xs md:text-sm leading-relaxed mt-0.5 md:mt-0">
                {content.playoffDescription}
              </p>
            </div>
          </div>

          {/* ELO Ranking */}
          <div className="flex sm:flex-col gap-3 sm:gap-0 md:group md:hover:scale-105 md:transition-transform md:duration-300">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 md:mb-3 md:shadow-md md:group-hover:shadow-lg md:transition-shadow md:duration-300">
              <ChartLine className="w-5 h-5 md:w-6 md:h-6 text-blue-700" />
            </div>
            <div className="flex-1 sm:mt-2 md:mt-0 md:space-y-2">
              <h5 className="font-semibold text-sm md:text-lg text-gray-900">{content.eloRanking}</h5>
              <p className="text-gray-500 md:text-gray-600 text-xs md:text-sm leading-relaxed mt-0.5 md:mt-0">
                {content.eloDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Section */}
      <div className="relative bg-gradient-to-br from-parque-purple via-purple-600 to-purple-700 text-white rounded-none sm:rounded-xl md:rounded-3xl mx-0 px-4 sm:p-5 md:p-6 lg:p-8 py-5 md:shadow-2xl overflow-hidden">
        {/* Animated background pattern - desktop only */}
        <div className="hidden md:block absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="w-7 h-7 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h4 className="font-bold text-lg md:text-2xl">{content.whyJoin}</h4>
          </div>
          <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2 md:gap-3 md:group md:hover:translate-x-1 md:transition-transform md:duration-200">
                <div className="mt-0.5 md:mt-1 w-4 h-4 md:w-6 md:h-6 md:bg-gradient-to-br md:from-white/30 md:to-white/10 md:backdrop-blur-sm md:rounded-full flex items-center justify-center flex-shrink-0 md:group-hover:scale-110 md:transition-transform md:duration-200">
                  <Shield className="w-4 h-4 md:w-3 md:h-3 text-white/70 md:text-white" />
                </div>
                <p className="text-sm md:text-base text-white/90 md:group-hover:text-white md:transition-colors md:duration-200">{benefit}</p>
              </div>
            ))}
          </div>
          
          {league.status === 'registration_open' && (
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/20">
              <a
                href={buildRegistrationUrl()}
                className="block sm:inline-block w-full sm:w-auto text-center bg-white text-parque-purple px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-base md:text-lg shadow-md md:shadow-lg md:hover:shadow-xl md:transform md:hover:-translate-y-0.5 group"
              >
                <span className="flex items-center justify-center gap-2">
                  {content.registerNow}
                  <svg className="w-4 h-4 md:w-5 md:h-5 md:group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
