'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Trophy, Target, ChartLine, CheckCircle, Tag, Medal, Award, ArrowRight } from 'lucide-react'
import RegistrationCountdown from '@/components/ui/RegistrationCountdown'
import { extractSeasonInfo, getSkillLevel } from '@/lib/utils/leagueSiblings'
import { getRandomQuote } from '@/lib/content/tennisQuotes'

export default function LeagueInfoTab({ league, currentSeason, language, locale, citySlug }) {
  const [discountCode, setDiscountCode] = useState('')
  const [discountValid, setDiscountValid] = useState(false)
  const [discountDetails, setDiscountDetails] = useState(null)
  const [finalPrice, setFinalPrice] = useState(league.seasonConfig?.price?.amount || 0)
  const [siblingLeagues, setSiblingLeagues] = useState([])
  const [motivationQuote, setMotivationQuote] = useState(null)
  
  // Use citySlug prop or fallback to league.city.slug
  const effectiveCitySlug = citySlug || league.city?.slug || 'sotogrande'

  const t = {
    es: {
      registerNow: '¡Inscríbete Ahora!',
      free: 'Gratis',
      seasonRegistration: 'Inscripción temporada',
      promoCode: 'Código promo',
      regularSeason: 'Fase Regular',
      playoffsLabel: 'Playoffs',
      included: 'Todo Incluido',
      features: [
        { title: '8 Partidos', desc: 'Un rival nuevo cada semana' },
        { title: 'Ranking ELO', desc: 'Mide tu nivel real' },
        { title: 'Playoffs', desc: 'Compite por el título' },
        { title: 'Comunidad', desc: 'Conoce jugadores' }
      ],
      seasonJourney: 'Tu Temporada',
      journeySteps: [
        { week: 'Sem 1-8', title: 'Fase Regular', desc: 'Sistema suizo' },
        { week: 'Sem 9-10', title: 'Playoffs', desc: 'Cuartos a final' },
        { week: 'Fin', title: '¡Campeón!', desc: 'Gloria eterna' }
      ],
      chooseLevel: 'Elige Tu Nivel',
      currentLevel: 'Actual',
      levelDescriptions: {
        advanced: 'Alto nivel competitivo',
        intermediate: 'Nivel intermedio',
        beginner: 'Para empezar a competir'
      },
      levelDetails: {
        advanced: {
          title: 'Liga Oro',
          points: [
            'Dominas a nivel recreativo',
            'Múltiples temporadas competitivas',
            'Buscas partidos de alto nivel'
          ]
        },
        intermediate: {
          title: 'Liga Plata',
          points: [
            'Has jugado en ligas o torneos',
            'Juegas regularmente',
            'Tienes saques y golpes consistentes'
          ]
        },
        beginner: {
          title: 'Liga Bronce',
          points: [
            'Primera vez en una liga de tenis',
            'Juegas de forma recreativa',
            'Quieres mejorar y divertirte'
          ]
        }
      },
      thisLevelIsFor: 'Este nivel es para ti si...',
      whyJoin: '¿Por Qué Unirse?',
      benefits: [
        'Partidos justos con rivales de tu nivel',
        'Mejora constante con competición regular',
        'Estadísticas detalladas de tu progreso',
        'Ambiente competitivo pero amigable'
      ]
    },
    en: {
      registerNow: 'Register Now!',
      free: 'Free',
      seasonRegistration: 'Season registration',
      promoCode: 'Promo code',
      regularSeason: 'Regular Season',
      playoffsLabel: 'Playoffs',
      included: 'Everything Included',
      features: [
        { title: '8 Matches', desc: 'A new opponent every week' },
        { title: 'ELO Ranking', desc: 'Track your real level' },
        { title: 'Playoffs', desc: 'Compete for the title' },
        { title: 'Community', desc: 'Meet players' }
      ],
      seasonJourney: 'Your Season',
      journeySteps: [
        { week: 'Wk 1-8', title: 'Regular Season', desc: 'Swiss system' },
        { week: 'Wk 9-10', title: 'Playoffs', desc: 'Quarters to final' },
        { week: 'End', title: 'Champion!', desc: 'Eternal glory' }
      ],
      chooseLevel: 'Choose Your Level',
      currentLevel: 'Current',
      levelDescriptions: {
        advanced: 'High competitive level',
        intermediate: 'Intermediate level',
        beginner: 'Start competing'
      },
      levelDetails: {
        advanced: {
          title: 'Gold League',
          points: [
            'You dominate at recreational level',
            'Multiple competitive seasons',
            'Looking for high-level matches'
          ]
        },
        intermediate: {
          title: 'Silver League',
          points: [
            'You\'ve played in leagues or tournaments',
            'You play regularly',
            'You have consistent serves and groundstrokes'
          ]
        },
        beginner: {
          title: 'Bronze League',
          points: [
            'First time in a tennis league',
            'You play recreationally',
            'Looking to improve and have fun'
          ]
        }
      },
      thisLevelIsFor: 'This level is for you if...',
      whyJoin: 'Why Join?',
      benefits: [
        'Fair matches with opponents at your level',
        'Constant improvement with regular competition',
        'Detailed statistics of your progress',
        'Competitive but friendly atmosphere'
      ]
    }
  }

  const content = t[language]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const urlDiscount = urlParams.get('discount')
      if (urlDiscount) {
        setDiscountCode(urlDiscount.toUpperCase())
        validateDiscount(urlDiscount)
      }
      // Set motivation quote on mount
      setMotivationQuote(getRandomQuote(language, 'motivation'))
    }
  }, [])

  // Fetch sibling leagues (same city, same season, different levels)
  useEffect(() => {
    const fetchSiblings = async () => {
      const seasonInfo = extractSeasonInfo(league)
      
      if (!effectiveCitySlug || !seasonInfo) return
      
      try {
        const response = await fetch(
          `/api/leagues/siblings?city=${effectiveCitySlug}&season=${seasonInfo.seasonType}&year=${seasonInfo.seasonYear}`
        )
        if (response.ok) {
          const data = await response.json()
          setSiblingLeagues(data.leagues || [])
        }
      } catch (error) {
        console.error('Error fetching sibling leagues:', error)
      }
    }
    
    fetchSiblings()
  }, [effectiveCitySlug, league.season?.type, league.season?.year, league.slug])

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      })
      const data = await response.json()
      if (data.valid) {
        setDiscountValid(true)
        setDiscountDetails(data)
        setFinalPrice(data.finalPrice)
      } else {
        setDiscountValid(false)
        setDiscountDetails(null)
        setFinalPrice(league.seasonConfig?.price?.amount || 0)
      }
    } catch (error) {
      setDiscountValid(false)
      setDiscountDetails(null)
      setFinalPrice(league.seasonConfig?.price?.amount || 0)
    }
  }

  const leagueLevel = getSkillLevel(league)

  const formatDateShort = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate season phases
  const getSeasonPhases = () => {
    const startDate = league.seasonConfig?.startDate ? new Date(league.seasonConfig.startDate) : null
    if (!startDate) return null
    
    // Regular season: 8 weeks from start
    const regularEnd = new Date(startDate)
    regularEnd.setDate(regularEnd.getDate() + (8 * 7) - 1) // 8 weeks minus 1 day
    
    // Playoffs start right after
    const playoffsStart = new Date(regularEnd)
    playoffsStart.setDate(playoffsStart.getDate() + 1)
    
    // Playoffs end (use endDate or 2 weeks after regular)
    const playoffsEnd = league.seasonConfig?.endDate 
      ? new Date(league.seasonConfig.endDate)
      : new Date(playoffsStart)
    if (!league.seasonConfig?.endDate) {
      playoffsEnd.setDate(playoffsEnd.getDate() + 13) // ~2 weeks
    }
    
    return {
      regular: { start: startDate, end: regularEnd },
      playoffs: { start: playoffsStart, end: playoffsEnd }
    }
  }

  const seasonPhases = getSeasonPhases()

  const buildRegistrationUrl = () => {
    const baseUrl = `/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${league.slug}`
    if (discountCode && discountValid) {
      return `${baseUrl}?discount=${discountCode}`
    }
    return baseUrl
  }

  // Get the URL for a sibling league by skill level
  const getSiblingLeagueUrl = (targetSkillLevel) => {
    const sibling = siblingLeagues.find(l => l.skillLevel === targetSkillLevel)
    
    if (sibling) {
      // Use actual slug from database
      return `/${locale}/leagues/${effectiveCitySlug}/info/${sibling.slug}`
    }
    
    // Fallback: return null if no sibling found (button will be disabled)
    return null
  }

  const levels = [
    { key: 'advanced', slug: 'gold', label: language === 'es' ? 'Oro' : 'Gold', color: 'from-yellow-400 to-amber-500', borderColor: 'border-yellow-400', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', icon: Trophy },
    { key: 'intermediate', slug: 'silver', label: language === 'es' ? 'Plata' : 'Silver', color: 'from-gray-300 to-gray-400', borderColor: 'border-gray-400', bgColor: 'bg-gray-100', textColor: 'text-gray-600', icon: Medal },
    { key: 'beginner', slug: 'bronze', label: language === 'es' ? 'Bronce' : 'Bronze', color: 'from-amber-500 to-orange-600', borderColor: 'border-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: Award }
  ]

  const getFeatureIcon = (index) => {
    const icons = [Calendar, ChartLine, Trophy, Users]
    const Icon = icons[index]
    return <Icon className="w-5 h-5" />
  }

  return (
    <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-0">
      
      {/* Price + CTA Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mx-2 sm:mx-0">
        {/* Price + Dates row */}
        <div className="p-4 sm:p-6">
          <div className="mb-4">
            {/* Price label */}
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {content.seasonRegistration}
            </p>
            
            {/* Price display */}
            <div className="flex items-baseline gap-3">
              {league.seasonConfig?.price?.isFree ? (
                // League is inherently free (no discount needed)
                <span className="text-3xl sm:text-4xl font-bold text-parque-green">{content.free}</span>
              ) : discountValid && discountDetails ? (
                // Discount applied
                <>
                  <span className="text-xl sm:text-2xl text-gray-400 line-through">
                    {discountDetails.originalPrice}€
                  </span>
                  <span className="text-3xl sm:text-4xl font-bold text-parque-green">
                    {discountDetails.finalPrice}€
                  </span>
                </>
              ) : (
                // Regular price
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {league.seasonConfig?.price?.amount}€
                </span>
              )}
            </div>
            
            {/* Promo code badge */}
            {discountValid && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-parque-green/10 rounded-full">
                <Tag className="w-3.5 h-3.5 text-parque-green" />
                <span className="text-sm font-medium text-parque-green">
                  {content.promoCode}: <span className="uppercase">{discountCode}</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Season phases */}
          {seasonPhases && (
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 bg-parque-purple/5 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center gap-1.5 text-parque-purple mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">{content.regularSeason}</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  {formatDateShort(seasonPhases.regular.start)} - {formatDateShort(seasonPhases.regular.end)}
                </p>
              </div>
              <div className="flex-1 bg-parque-green/5 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center gap-1.5 text-parque-green mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">{content.playoffsLabel}</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  {formatDateShort(seasonPhases.playoffs.start)} - {formatDateShort(seasonPhases.playoffs.end)}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Countdown - Purple themed */}
        {league.status === 'registration_open' && league.seasonConfig?.registrationEnd && (
          <div className="mx-4 sm:mx-6 mb-4 p-3 bg-parque-purple/5 border border-parque-purple/20 rounded-xl">
            <RegistrationCountdown 
              registrationEnd={league.seasonConfig.registrationEnd} 
              language={language}
              compact={true}
              purple={true}
            />
          </div>
        )}
        
        {/* CTA - Purple gradient */}
        {league.status === 'registration_open' && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <a
              href={buildRegistrationUrl()}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-parque-purple to-violet-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
            >
              {content.registerNow}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>

      {/* Season Journey - Nice visual version */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-5 sm:p-6 mx-2 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 bg-parque-purple/10 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-parque-purple" />
          </div>
          {content.seasonJourney}
        </h3>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-5 left-[20px] right-[20px] sm:left-[24px] sm:right-[24px] h-0.5 bg-gradient-to-r from-parque-purple via-parque-green to-parque-yellow" />
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
            {content.journeySteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold z-10 shadow-lg ${
                  index === 0 ? 'bg-gradient-to-br from-parque-purple to-violet-600' :
                  index === 1 ? 'bg-gradient-to-br from-parque-green to-emerald-600' :
                  'bg-gradient-to-br from-parque-yellow to-amber-500'
                }`}>
                  {index === 2 ? <Trophy className="w-5 h-5 text-amber-900" /> : index + 1}
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-parque-purple mt-2">{step.week}</p>
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{step.title}</h4>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level Selector - Cards version */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm mx-2 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-parque-purple/10 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-parque-purple" />
          </div>
          {content.chooseLevel}
        </h3>
        
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {levels.map((level) => {
            const isCurrentLevel = leagueLevel === level.key
            const LevelIcon = level.icon
            const siblingUrl = getSiblingLeagueUrl(level.key)
            
            return isCurrentLevel ? (
              <div
                key={level.key}
                className={`relative p-3 sm:p-4 rounded-xl border-2 ${level.borderColor} ${level.bgColor}`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-parque-purple text-white text-[9px] sm:text-[10px] font-bold rounded-full whitespace-nowrap">
                  {content.currentLevel}
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-white mb-2`}>
                    <LevelIcon className="w-5 h-5" />
                  </div>
                  <span className={`font-bold ${level.textColor}`}>{level.label}</span>
                  <p className="text-[10px] text-gray-500 mt-1 hidden sm:block">{content.levelDescriptions[level.key]}</p>
                </div>
              </div>
            ) : siblingUrl ? (
              <a
                key={level.key}
                href={siblingUrl}
                className="p-3 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-parque-purple/40 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-white mb-2 opacity-60 group-hover:opacity-100 transition-opacity`}>
                    <LevelIcon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-600 group-hover:text-parque-purple transition-colors">{level.label}</span>
                  <p className="text-[10px] text-gray-500 mt-1 hidden sm:block">{content.levelDescriptions[level.key]}</p>
                </div>
              </a>
            ) : (
              // No sibling league exists for this level - show disabled state
              <div
                key={level.key}
                className="p-3 sm:p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-white mb-2 opacity-40`}>
                    <LevelIcon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-400">{level.label}</span>
                  <p className="text-[10px] text-gray-400 mt-1 hidden sm:block">{content.levelDescriptions[level.key]}</p>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Current level details */}
        {content.levelDetails[leagueLevel] && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-2">{content.thisLevelIsFor}</p>
            <ul className="space-y-1.5">
              {content.levelDetails[leagueLevel].points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-parque-green flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* What's Included - Links to How It Works */}
      <a 
        href={`/${locale}/#how-it-works`}
        className="block bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-parque-purple/30 transition-all group mx-2 sm:mx-0"
      >
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-parque-purple/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-parque-purple" />
          </div>
          {content.included}
          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-parque-purple group-hover:translate-x-1 transition-all" />
        </h3>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {content.features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gray-50"
            >
              <div className="w-10 h-10 rounded-lg bg-parque-purple/10 flex items-center justify-center text-parque-purple mb-2">
                {getFeatureIcon(index)}
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{feature.desc}</p>
            </div>
          ))}
        </div>
      </a>

      {/* Why Join - Clean version with quote */}
      <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-violet-600 to-purple-700 rounded-2xl mx-2 sm:mx-0 p-5 sm:p-6 text-white">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-parque-green/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          {/* Motivational Quote - centered */}
          {motivationQuote && (
            <div className="mb-5 pb-5 border-b border-white/20 text-center">
              <p className="text-lg sm:text-xl italic text-white/95 leading-relaxed">
                &ldquo;{motivationQuote.text}&rdquo;
              </p>
              <p className="text-sm text-white/60 mt-2">
                — {motivationQuote.author}
              </p>
            </div>
          )}
          
          {/* Benefits list with white icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/70 flex-shrink-0 mt-0.5" />
                <span className="text-white/90 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
          
          {league.status === 'registration_open' && (
            <a
              href={buildRegistrationUrl()}
              className="mt-5 flex items-center justify-center gap-2 w-full bg-white text-parque-purple px-6 py-3.5 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all"
            >
              {content.registerNow}
              <ArrowRight className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
