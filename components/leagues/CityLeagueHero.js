'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trophy, Medal, Award, Clock } from 'lucide-react'

function HeroCountdown({ registrationEnd, locale, variant = 'line' }) {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!now || !registrationEnd) return null
  const diff = new Date(registrationEnd).getTime() - now
  if (diff <= 0) return null

  const days = Math.floor(diff / 86400000)
  const pad = (n) => String(n).padStart(2, '0')
  const hours = pad(Math.floor((diff % 86400000) / 3600000))
  const minutes = pad(Math.floor((diff % 3600000) / 60000))
  const seconds = pad(Math.floor((diff % 60000) / 1000))
  const time = `${days > 0 ? `${days}d ` : ''}${hours}:${minutes}:${seconds}`
  const label = locale === 'es' ? 'La inscripción cierra en' : 'Registration closes in'

  if (variant === 'blocks') {
    const units = [
      { v: days, l: locale === 'es' ? 'días' : 'days' },
      { v: hours, l: locale === 'es' ? 'horas' : 'hours' },
      { v: minutes, l: 'min' },
      { v: seconds, l: locale === 'es' ? 'seg' : 'sec' }
    ]
    return (
      <div className="text-right">
        <p className="flex items-center justify-end gap-1.5 text-sm text-white/90 mb-2">
          <Clock className="w-4 h-4" />
          {label}
        </p>
        <div className="flex gap-2">
          {units.map(u => (
            <div key={u.l} className="min-w-[68px] rounded-xl bg-white/15 border border-white/25 px-3 py-2 text-center backdrop-blur-sm">
              <div className="text-3xl font-bold text-white tabular-nums leading-none">{u.v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-white/75">{u.l}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <p className="flex items-center gap-1.5 text-sm text-white/90 mt-3">
      <Clock className="w-4 h-4" />
      {label}
      <span className="font-bold text-white tabular-nums">{time}</span>
    </p>
  )
}

export default function CityLeagueHero({ city, locale, leagueName, league, seasonName, registrationEnd }) {
  const router = useRouter()
  const cityName = city.name[locale] || city.name.es
  
  // Build the page title based on context
  const pageTitle = (league && leagueName) || seasonName
    ? cityName
    : locale === 'es' 
      ? `Ligas de ${cityName}` 
      : `${cityName} Leagues`
  
  // Detect league tier based on name/slug
  const leagueTier = league ? (() => {
    const nameOrSlug = (league.name?.toLowerCase() || '') + (league.slug?.toLowerCase() || '')
    if (nameOrSlug.includes('gold') || nameOrSlug.includes('oro')) return 'gold'
    if (nameOrSlug.includes('silver') || nameOrSlug.includes('plata')) return 'silver'
    if (nameOrSlug.includes('bronze') || nameOrSlug.includes('bronce')) return 'bronze'
    return 'default'
  })() : 'default'
  
  // Tier badge styling
  const tierBadge = {
    gold: { 
      bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', 
      text: 'text-white',
      icon: Trophy,
      label: locale === 'es' ? 'Liga Oro' : 'Gold League'
    },
    silver: { 
      bg: 'bg-gradient-to-r from-gray-300 to-slate-400', 
      text: 'text-white',
      icon: Medal,
      label: locale === 'es' ? 'Liga Plata' : 'Silver League'
    },
    bronze: { 
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600', 
      text: 'text-white',
      icon: Award,
      label: locale === 'es' ? 'Liga Bronce' : 'Bronze League'
    },
    default: { 
      bg: 'bg-gradient-to-r from-parque-purple to-violet-600', 
      text: 'text-white',
      icon: Trophy,
      label: ''
    }
  }[leagueTier]
  
  const TierIcon = tierBadge.icon

  // Determine where the back button should navigate
  const getBackDestination = () => {
    if (league && leagueName) {
      return `/${locale}/leagues/${city.slug}`
    }
    return `/${locale}/leagues`
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(getBackDestination())
    }
  }
  
  return (
    <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[300px]">
      {/* Background Image - full visibility */}
      {city.images?.main && (
        <div className="absolute inset-0">
          <Image
            src={city.images.main}
            alt={cityName}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      {/* Minimal vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      
      {/* Content */}
      <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[300px] container mx-auto px-4 pt-20 sm:pt-24 md:pt-28 lg:pt-24 pb-4 sm:pb-8 lg:pb-6 z-10 flex flex-col justify-end">
        
        {/* Mobile Back Button - glassmorphic */}
        <button
          onClick={handleBack}
          className="sm:hidden absolute top-20 left-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium border border-white/30 active:scale-95 transition-transform shadow-lg"
          aria-label={locale === 'es' ? 'Volver' : 'Go back'}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{locale === 'es' ? 'Volver' : 'Back'}</span>
        </button>
        
        {/* Glassmorphic content card */}
        <div className="w-full max-w-5xl mx-auto bg-black/15 backdrop-blur-[3px] rounded-2xl sm:rounded-3xl border border-white/25 p-4 sm:p-6 shadow-2xl [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
          
          {/* Breadcrumb - hidden on mobile */}
          <nav className="hidden sm:block mb-2 text-sm text-white/80">
            <Link href={`/${locale}/leagues`} className="hover:text-white transition-colors">
              {locale === 'es' ? 'Ciudades' : 'Cities'}
            </Link>
            <span className="mx-2 text-white/50">/</span>
            {leagueName ? (
              <>
                <Link href={`/${locale}/leagues/${city.slug}`} className="hover:text-white transition-colors">
                  {cityName}
                </Link>
                <span className="mx-2 text-white/50">/</span>
                <span className="text-white font-medium">{leagueName}</span>
              </>
            ) : (
              <span className="text-white font-medium">{cityName}</span>
            )}
          </nav>
          
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {pageTitle}
              </h1>
              
              {/* Description - City page only */}
              {!league && !seasonName && (
                <p className="text-sm sm:text-base text-white/70 mt-1">
                  {locale === 'es' 
                    ? 'Elige el nivel de competición que mejor se adapte a ti' 
                    : 'Choose the level of competition that suits you best'}
                </p>
              )}

              {seasonName && (
                <div className="hidden lg:flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-parque-purple to-violet-600 text-white font-bold text-sm shadow-lg">
                    {seasonName}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg">
                    {locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
                  </span>
                </div>
              )}
            </div>
            
            {seasonName && (
              <div className="flex lg:hidden flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-parque-purple to-violet-600 text-white font-bold text-sm shadow-lg">
                  {seasonName}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg">
                  {locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
                </span>
              </div>
            )}

            {/* Badges */}
            {league && leagueName && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Tier badge */}
                <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full ${tierBadge.bg} ${tierBadge.text} font-bold text-sm shadow-lg`}>
                  <TierIcon className="w-4 h-4" />
                  {tierBadge.label}
                </div>
                
                {/* Status badge - neutral */}
                {league.status === 'registration_open' && (
                  <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg">
                    {locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
                  </span>
                )}
                {league.status === 'coming_soon' && (
                  <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg">
                    {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
                  </span>
                )}
              </div>
            )}

            {seasonName && (
              <div className="hidden lg:block">
                <HeroCountdown registrationEnd={registrationEnd} locale={locale} variant="blocks" />
              </div>
            )}
          </div>
          {seasonName && (
            <div className="lg:hidden">
              <HeroCountdown registrationEnd={registrationEnd} locale={locale} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
