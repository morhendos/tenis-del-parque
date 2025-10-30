import Image from 'next/image'
import Link from 'next/link'

export default function CityLeagueHero({ city, locale, leagueName, league }) {
  const cityName = city.name[locale] || city.name.es
  
  // Detect if this is a Gold league
  const isGoldLeague = league && (
    league.name?.toLowerCase().includes('gold') || 
    league.slug?.toLowerCase().includes('gold')
  )
  
  // Choose gradient colors based on league type (darker for better contrast)
  const gradientClasses = isGoldLeague
    ? 'from-amber-600 via-yellow-600 to-amber-700'
    : 'from-emerald-600 to-teal-600'
  
  return (
    <div className={`relative h-[400px] bg-gradient-to-r ${gradientClasses}`}>
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
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-16 z-10">
        {/* Breadcrumb */}
        <nav className="mb-4 text-white/90">
          <Link href={`/${locale}/leagues`} className="hover:text-white">
            {locale === 'es' ? 'Ciudades' : 'Cities'}
          </Link>
          <span className="mx-2">/</span>
          {leagueName ? (
            <>
              <Link href={`/${locale}/leagues/${city.slug}`} className="hover:text-white">
                {cityName}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{leagueName}</span>
            </>
          ) : (
            <span className="text-white">{cityName}</span>
          )}
        </nav>
        
        {/* Title with Status Badge */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            {cityName}
            {league && leagueName && (
              <>
                <span className="mx-4 text-white/70">•</span>
                <span className={isGoldLeague ? 'text-amber-50' : 'text-emerald-50'}>
                  {leagueName}
                </span>
              </>
            )}
          </h1>
          
          {/* Status Badge - only show on league pages */}
          {league && (
            <>
              {league.status === 'registration_open' && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-semibold bg-white/30 backdrop-blur-md text-white border-2 border-white/50 shadow-lg">
                  {locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
                </span>
              )}
              {league.status === 'coming_soon' && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-semibold bg-white/30 backdrop-blur-md text-white border-2 border-white/50 shadow-lg">
                  {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
                </span>
              )}
            </>
          )}
        </div>
        
        <p className="text-xl text-white drop-shadow-md max-w-2xl">
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
