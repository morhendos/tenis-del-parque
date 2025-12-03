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
      description: 'Para jugadores experimentados con técnica sólida y juego competitivo. Partidos intensos con alta calidad de juego.',
      skills: [
        'Técnica refinada en todos los golpes',
        'Juego estratégico avanzado',
        'Experiencia en competición',
        'Alta intensidad y competitividad'
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
      description: 'For experienced players with solid technique and competitive play. Intense matches with high-quality tennis.',
      skills: [
        'Refined technique on all strokes',
        'Advanced strategic play',
        'Competition experience',
        'High intensity and competitiveness'
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
        <div className="bg-white sm:bg-gray-50 border-0 sm:border-2 sm:border-gray-100 rounded-none sm:rounded-xl px-4 sm:p-5 py-4 sm:hover:border-parque-purple/20 transition-all duration-300 sm:hover:shadow-lg">
          <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-parque-purple" />
            {content.leagueDetails}
          </h4>
          
          <div className="space-y-3">
            {league.seasonConfig?.startDate && (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-50 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{content.startDate}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(league.seasonConfig.startDate)}
                  </p>
                </div>
              </div>
            )}

            {league.seasonConfig?.endDate && (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{content.endDate}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(league.seasonConfig.endDate)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-purple-50 rounded-lg flex-shrink-0">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{content.availableSpots}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {league.seasonConfig?.maxPlayers || 32}
                </p>
              </div>
            </div>

            {/* Price with discount logic */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-amber-50 rounded-lg flex-shrink-0">
                <CreditCard className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{content.price}</p>
                
                {league.seasonConfig?.price?.isFree || league.seasonConfig?.price?.amount === 0 ? (
                  <p className="text-sm font-semibold text-gray-900">
                    {content.free}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {discountValid && discountDetails ? (
                      <>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-xs">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span className="font-medium text-emerald-700">
                            {discountCode} (-{discountDetails.discountPercentage}%)
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm text-gray-400 line-through">
                            {discountDetails.originalPrice}€
                          </p>
                          <p className="text-lg font-bold text-emerald-600">
                            {discountDetails.finalPrice}€
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {league.seasonConfig?.price?.amount}€
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Registration Countdown */}
            {league.status === 'registration_open' && league.seasonConfig?.registrationEnd && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <RegistrationCountdown 
                  registrationEnd={league.seasonConfig.registrationEnd} 
                  language={language}
                  compact={true}
                />
              </div>
            )}
          </div>

          {league.status === 'registration_open' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <a
                href={buildRegistrationUrl()}
                className="block w-full text-center bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-md"
              >
                {content.registerNow} →
              </a>
            </div>
          )}
        </div>

        {/* League Level Card */}
        <div className="bg-white sm:bg-gradient-to-br sm:from-parque-purple/5 sm:to-purple-50 border-0 sm:border-2 sm:border-purple-100 rounded-none sm:rounded-xl px-4 sm:p-5 py-4 sm:hover:border-parque-purple/30 transition-all duration-300 sm:hover:shadow-lg flex flex-col">
          <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-parque-purple" />
            {content.leagueLevel}
          </h4>
          
          <div className="flex-1 flex flex-col">
            <div className="space-y-3">
              <div>
                <h5 className="text-xl font-bold text-parque-purple mb-1">
                  {levelInfo.title}
                </h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {levelInfo.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 sm:border-purple-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">{content.whatToExpect}</p>
                <ul className="space-y-1.5">
                  {levelInfo.skills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Level Switcher */}
            <div className="pt-3 border-t border-gray-100 sm:border-purple-200 mt-3">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                {language === 'es' ? 'Otros Niveles' : 'Other Levels'}
              </p>
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  // Get city slug and season info from current league (DYNAMIC)
                  const citySlug = league.city?.slug || league.location?.city?.toLowerCase().replace(/\s+/g, '-') || 'sotogrande'
                  const seasonType = league.season?.type || 'winter' // Dynamic from current league
                  const seasonYear = league.season?.year || '2025' // Dynamic from current league
                  
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
                          className={`px-3 py-1.5 rounded-lg border ${level.bgColor} font-medium ${level.textColor} flex items-center gap-1.5 text-xs`}
                        >
                          {level.icon}
                          {level.label}
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                      )
                    }
                    
                    return (
                      <a
                        key={level.key}
                        href={`/${locale}/leagues/${citySlug}/info/${level.slug}`}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-parque-purple/40 hover:bg-purple-50 transition-all font-medium text-gray-600 hover:text-parque-purple flex items-center gap-1.5 text-xs"
                      >
                        {level.icon}
                        {level.label}
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
      <div className="bg-white sm:bg-gradient-to-br sm:from-gray-50 sm:via-white/50 sm:to-gray-50 border-0 sm:border-2 sm:border-gray-100 rounded-none sm:rounded-xl px-4 sm:p-5 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-parque-purple to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-bold text-lg text-gray-900">{content.aboutLeague}</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Swiss Format */}
          <div className="flex sm:flex-col gap-3 sm:gap-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="flex-1 sm:mt-2">
              <h5 className="font-semibold text-sm text-gray-900">{content.swissFormat}</h5>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                {content.swissDescription}
              </p>
            </div>
          </div>

          {/* Playoff System */}
          <div className="flex sm:flex-col gap-3 sm:gap-0">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-purple-700" />
            </div>
            <div className="flex-1 sm:mt-2">
              <h5 className="font-semibold text-sm text-gray-900">{content.playoffSystem}</h5>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                {content.playoffDescription}
              </p>
            </div>
          </div>

          {/* ELO Ranking */}
          <div className="flex sm:flex-col gap-3 sm:gap-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <ChartLine className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1 sm:mt-2">
              <h5 className="font-semibold text-sm text-gray-900">{content.eloRanking}</h5>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                {content.eloDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Section */}
      <div className="bg-gradient-to-br from-parque-purple via-purple-600 to-purple-700 text-white rounded-none sm:rounded-xl mx-0 sm:mx-0 px-4 sm:p-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-bold text-lg">{content.whyJoin}</h4>
        </div>
        <div className="space-y-2">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/90">{benefit}</p>
            </div>
          ))}
        </div>
        
        {league.status === 'registration_open' && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <a
              href={buildRegistrationUrl()}
              className="block sm:inline-block w-full sm:w-auto text-center bg-white text-parque-purple px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-gray-50 transition-colors"
            >
              {content.registerNow} →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
