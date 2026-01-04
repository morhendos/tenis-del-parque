'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trophy, Medal, Award } from 'lucide-react'

export default function CityLeagueHero({ city, locale, leagueName, league }) {
  const router = useRouter()
  const cityName = city.name[locale] || city.name.es
  
  // Build the page title based on context
  const pageTitle = league && leagueName 
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
    <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px]">
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
      <div className="relative h-full container mx-auto px-4 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 z-10 flex flex-col justify-end">
        
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
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-6 shadow-2xl">
          
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
              {!league && (
                <p className="text-sm sm:text-base text-white/70 mt-1">
                  {locale === 'es' 
                    ? 'Elige el nivel de competición que mejor se adapte a ti' 
                    : 'Choose the level of competition that suits you best'}
                </p>
              )}
            </div>
            
            {/* Badges */}
            {league && leagueName && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Tier badge */}
                <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full ${tierBadge.bg} ${tierBadge.text} font-bold text-sm shadow-lg`}>
                  <TierIcon className="w-4 h-4" />
                  {tierBadge.label}
                </div>
                
                {/* Status badge */}
                {league.status === 'registration_open' && (
                  <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-semibold bg-parque-green text-white shadow-lg">
                    {locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
                  </span>
                )}
                {league.status === 'coming_soon' && (
                  <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-semibold bg-white/30 backdrop-blur-sm text-white border border-white/40 shadow-lg">
                    {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
