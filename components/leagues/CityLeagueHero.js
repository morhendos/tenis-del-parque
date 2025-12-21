import Image from 'next/image'
import Link from 'next/link'

export default function CityLeagueHero({ city, locale, leagueName, league }) {
  const cityName = city.name[locale] || city.name.es
  
  // Build the page title based on context
  const pageTitle = league && leagueName 
    ? cityName  // On league info page, show just city name (league name shown separately)
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
  
  // Choose gradient colors based on league tier
  const gradientClasses = {
    gold: 'from-amber-600 via-yellow-600 to-amber-700',
    silver: 'from-slate-500 via-gray-400 to-slate-600',
    bronze: 'from-orange-600 via-amber-700 to-orange-800',
    default: 'from-emerald-600 to-teal-600'
  }[leagueTier]
  
  // League name color
  const leagueNameColor = {
    gold: 'text-amber-50',
    silver: 'text-slate-100',
    bronze: 'text-orange-100',
    default: 'text-emerald-100'
  }[leagueTier]
  
  // Description based on context
  const getDescription = () => {
    if (league) {
      // On league info page
      return league.status === 'registration_open' 
        ? (locale === 'es' ? 'Únete a la liga ahora y comienza a jugar' : 'Join the league now and start playing')
        : (locale === 'es' ? 'Información de la liga y detalles de inscripción' : 'League information and registration details')
    }
    // On city leagues page - emphasize level selection
    return locale === 'es' 
      ? 'Elige el nivel de competición que mejor se adapte a ti' 
      : 'Choose the level of competition that suits you best'
  }
  
  return (
    <div className={`relative h-[160px] sm:h-[220px] md:h-[280px] lg:h-[340px] bg-gradient-to-r ${gradientClasses}`}>
      {/* Background Image */}
      {city.images?.main && (
        <div className="absolute inset-0 opacity-30">
          <Image
            src={city.images.main}
            alt={cityName}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      {/* Dark semi-transparent backdrop for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-14 sm:pt-16 z-10">
        {/* Breadcrumb - hidden on mobile, visible on sm+ */}
        <nav className="hidden sm:block mb-2 md:mb-3 text-sm md:text-base text-white/90">
          <Link href={`/${locale}/leagues`} className="hover:text-white transition-colors">
            {locale === 'es' ? 'Ciudades' : 'Cities'}
          </Link>
          <span className="mx-2">/</span>
          {leagueName ? (
            <>
              <Link href={`/${locale}/leagues/${city.slug}`} className="hover:text-white transition-colors">
                {cityName}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white font-medium">{leagueName}</span>
            </>
          ) : (
            <span className="text-white font-medium">{cityName}</span>
          )}
        </nav>
        
        {/* Title */}
        <div className="mb-1 sm:mb-2 md:mb-3">
          {/* Mobile layout: stacked */}
          <div className="md:hidden">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg leading-tight">
              {pageTitle}
            </h1>
            {league && leagueName && (
              <h2 className={`text-lg sm:text-xl font-bold ${leagueNameColor} drop-shadow-lg mt-0.5`}>
                {leagueName}
              </h2>
            )}
          </div>
          
          {/* Desktop layout: inline with bullet */}
          <h1 className="hidden md:block text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-lg">
            {pageTitle}
            {league && leagueName && (
              <>
                <span className="mx-3 lg:mx-4 text-white/70">•</span>
                <span className={leagueNameColor}>
                  {leagueName}
                </span>
              </>
            )}
          </h1>
        </div>
        
        {/* Status Badge - only on league page */}
        {league && (
          <div className="mb-1 sm:mb-2 md:mb-3">
            {league.status === 'registration_open' && (
              <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-xs sm:text-sm font-semibold bg-white/30 backdrop-blur-md text-white border border-white/50 shadow-lg">
                {locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
              </span>
            )}
            {league.status === 'coming_soon' && (
              <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-xs sm:text-sm font-semibold bg-white/30 backdrop-blur-md text-white border border-white/50 shadow-lg">
                {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
              </span>
            )}
          </div>
        )}
        
        {/* Description - hidden on very small screens */}
        <p className="hidden sm:block text-sm md:text-base lg:text-lg text-white/90 drop-shadow-md max-w-xl leading-relaxed">
          {getDescription()}
        </p>
      </div>
    </div>
  )
}
