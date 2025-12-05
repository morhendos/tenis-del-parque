import Image from 'next/image'
import Link from 'next/link'

export default function CityLeagueHero({ city, locale, leagueName, league }) {
  const cityName = city.name[locale] || city.name.es
  
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
  
  return (
    <div className={`relative h-[200px] sm:h-[260px] md:h-[320px] lg:h-[380px] bg-gradient-to-r ${gradientClasses}`}>
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
      
      {/* Dark semi-transparent backdrop for better text readability - FULL WIDTH */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-14 sm:pt-16 z-10">
        {/* Breadcrumb - hidden on mobile, visible on sm+ */}
        <nav className="hidden sm:block mb-3 md:mb-4 text-sm md:text-base text-white/90">
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
        
        {/* Title - stacked on mobile, inline on desktop */}
        <div className="mb-2 sm:mb-3 md:mb-4">
          {/* Mobile layout: stacked */}
          <div className="md:hidden">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg leading-tight">
              {cityName}
            </h1>
            {league && leagueName && (
              <h2 className={`text-xl sm:text-2xl font-bold ${leagueNameColor} drop-shadow-lg mt-0.5`}>
                {leagueName}
              </h2>
            )}
          </div>
          
          {/* Desktop layout: inline with bullet */}
          <h1 className="hidden md:block text-4xl lg:text-5xl xl:text-6xl font-bold text-white drop-shadow-lg">
            {cityName}
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
        
        {/* Status Badge - compact on mobile */}
        {league && (
          <div className="mb-2 sm:mb-3 md:mb-4">
            {league.status === 'registration_open' && (
              <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold bg-white/30 backdrop-blur-md text-white border border-white/50 sm:border-2 shadow-lg">
                {locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
              </span>
            )}
            {league.status === 'coming_soon' && (
              <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold bg-white/30 backdrop-blur-md text-white border border-white/50 sm:border-2 shadow-lg">
                {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
              </span>
            )}
          </div>
        )}
        
        {/* Description - hidden on very small screens, smaller on mobile */}
        <p className="hidden sm:block text-sm sm:text-base md:text-lg lg:text-xl text-white/90 drop-shadow-md max-w-2xl leading-relaxed">
          {league ? (
            // Show league-specific description if on league page
            league.status === 'registration_open' ? (
              locale === 'es' 
                ? 'Únete a la liga ahora y comienza a jugar' 
                : 'Join the league now and start playing'
            ) : (
              locale === 'es' 
                ? 'Información de la liga y detalles de inscripción' 
                : 'League information and registration details'
            )
          ) : (
            // Show city description if on city leagues page
            locale === 'es' 
              ? 'Descubre nuestras ligas de tenis disponibles' 
              : 'Discover our available tennis leagues'
          )}
        </p>
      </div>
    </div>
  )
}
