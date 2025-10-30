'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, CreditCard, TrendingUp, Award, Info, Trophy, Target, ChartLine, Shield, Sparkles, Heart, CheckCircle, Clock, Tag } from 'lucide-react'

// Level descriptions for different league types
const levelDescriptions = {
  es: {
    beginner: {
      title: 'Liga Nivel Inicial',
      description: 'Liga diseñada para disfrutar del tenis en su máxima expresión. Juega a tu ritmo, mejora tu técnica y forma parte de una comunidad apasionada por este deporte.',
      skills: [
        'Partidos relajados y divertidos',
        'Énfasis en el juego social y recreativo',
        'Perfecto para retomar el tenis o jugar sin presión',
        'Comunidad acogedora y ambiente amistoso'
      ]
    },
    intermediate: {
      title: 'Nivel Intermedio',
      description: 'Ideal para jugadores con fundamentos sólidos que buscan mejorar su juego. Partidos competitivos pero amistosos con jugadores de nivel similar.',
      skills: [
        'Dominio de golpes básicos',
        'Capacidad de mantener rallies consistentes',
        'Conocimiento de estrategia básica',
        'Nivel competitivo moderado'
      ]
    },
    advanced: {
      title: 'Nivel Avanzado',
      description: 'Para jugadores experimentados con técnica sólida y juego competitivo. Partidos intensos con alta calidad de juego.',
      skills: [
        'Técnica refinada en todos los golpes',
        'Juego estratégico avanzado',
        'Experiencia en competición',
        'Alta intensidad y competitividad'
      ]
    },
    open: {
      title: 'Liga Abierta',
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
      title: 'Entry Level League',
      description: 'A league designed to enjoy tennis at its finest. Play at your own pace, improve your technique, and be part of a passionate tennis community.',
      skills: [
        'Relaxed and enjoyable matches',
        'Focus on social and recreational play',
        'Perfect for getting back into tennis or playing without pressure',
        'Welcoming community and friendly atmosphere'
      ]
    },
    intermediate: {
      title: 'Intermediate Level',
      description: 'Ideal for players with solid fundamentals looking to improve their game. Competitive yet friendly matches with similarly skilled players.',
      skills: [
        'Command of basic strokes',
        'Ability to maintain consistent rallies',
        'Basic strategy knowledge',
        'Moderate competitive level'
      ]
    },
    advanced: {
      title: 'Advanced Level',
      description: 'For experienced players with solid technique and competitive play. Intense matches with high-quality tennis.',
      skills: [
        'Refined technique on all strokes',
        'Advanced strategic play',
        'Competition experience',
        'High intensity and competitiveness'
      ]
    },
    open: {
      title: 'Open League',
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
    <div className="space-y-8">
      {/* Key Details Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* League Details Card */}
        <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 hover:border-parque-purple/20 transition-all duration-300 hover:shadow-lg">
          <h4 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
            <Info className="w-6 h-6 text-parque-purple" />
            {content.leagueDetails}
          </h4>
          
          <div className="space-y-5">
            {league.seasonConfig?.startDate && (
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-emerald-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{content.startDate}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(league.seasonConfig.startDate)}
                  </p>
                </div>
              </div>
            )}

            {league.seasonConfig?.endDate && (
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{content.endDate}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(league.seasonConfig.endDate)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{content.availableSpots}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {league.seasonConfig?.maxPlayers || 32}
                </p>
              </div>
            </div>

            {/* Price with discount logic */}
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-amber-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{content.price}</p>
                
                {league.seasonConfig?.price?.isFree || league.seasonConfig?.price?.amount === 0 ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {content.free}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {discountValid && discountDetails ? (
                      <>
                        {/* Discount badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <Tag className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">
                            {content.discountApplied}: {discountCode}
                          </span>
                        </div>
                        
                        {/* Original price struck through */}
                        <div className="flex items-baseline gap-3">
                          <p className="text-xl font-semibold text-gray-400 line-through">
                            {discountDetails.originalPrice}€
                          </p>
                          <p className="text-3xl font-bold text-emerald-600">
                            {discountDetails.finalPrice}€
                          </p>
                        </div>
                        
                        {/* Discount details */}
                        <p className="text-xs text-gray-600">
                          {content.discount}: {discountDetails.discountPercentage}%
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">
                        {league.seasonConfig?.price?.amount}€
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {league.status === 'registration_open' && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <a
                href={buildRegistrationUrl()}
                className="relative block w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {content.registerNow}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
            </div>
          )}
        </div>

        {/* League Level Card */}
        <div className="bg-gradient-to-br from-parque-purple/5 to-purple-50 border-2 border-purple-100 rounded-2xl p-6 hover:border-parque-purple/30 transition-all duration-300 hover:shadow-lg">
          <h4 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-parque-purple" />
            {content.leagueLevel}
          </h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-2xl font-bold text-parque-purple mb-2">
                {levelInfo.title}
              </h5>
              <p className="text-gray-700 leading-relaxed">
                {levelInfo.description}
              </p>
            </div>

            <div className="pt-4 border-t border-purple-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">{content.whatToExpect}</p>
              <ul className="space-y-2">
                {levelInfo.skills.map((skill, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* About League Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white/50 to-gray-50 border-2 border-gray-100 rounded-3xl p-6 md:p-8 transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-parque-purple to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-bold text-2xl text-gray-900">{content.aboutLeague}</h4>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Swiss Format */}
          <div className="space-y-3 group hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Target className="w-6 h-6 text-emerald-700" />
            </div>
            <h5 className="font-semibold text-lg text-gray-900">{content.swissFormat}</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              {content.swissDescription}
            </p>
            {league.config?.roundsPerSeason && (
              <p className="text-sm font-medium text-emerald-600">
                {league.config.roundsPerSeason} {content.rounds}
              </p>
            )}
          </div>

          {/* Playoff System */}
          <div className="space-y-3 group hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Trophy className="w-6 h-6 text-purple-700" />
            </div>
            <h5 className="font-semibold text-lg text-gray-900">{content.playoffSystem}</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              {content.playoffDescription}
            </p>
          </div>

          {/* ELO Ranking */}
          <div className="space-y-3 group hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <ChartLine className="w-6 h-6 text-blue-700" />
            </div>
            <h5 className="font-semibold text-lg text-gray-900">{content.eloRanking}</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              {content.eloDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Why Join Section */}
      <div className="relative bg-gradient-to-br from-parque-purple via-purple-600 to-purple-700 text-white rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-2xl">{content.whyJoin}</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-200">
                <div className="mt-1 w-6 h-6 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">{benefit}</p>
              </div>
            ))}
          </div>
          
          {league.status === 'registration_open' && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <a
                href={buildRegistrationUrl()}
                className="inline-block bg-white text-parque-purple px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
              >
                <span className="flex items-center gap-2">
                  {content.registerNow}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
