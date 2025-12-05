import Link from 'next/link'
import Image from 'next/image'

export default function CityCard({ city, leagueCount, locale }) {
  const cityName = city.name[locale] || city.name.es
  
  return (
    <Link
      href={`/${locale}/leagues/${city.slug}`}
      className="group block"
    >
      <div className="bg-white rounded-lg shadow-md sm:shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]">
        {/* City Image - Smaller on mobile */}
        <div className="relative h-36 sm:h-44 md:h-48">
          {city.images?.main ? (
            <Image
              src={city.images.main}
              alt={cityName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* City name overlay */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
              {cityName}
            </h2>
          </div>
        </div>
        
        {/* City Info - Compact padding on mobile */}
        <div className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs sm:text-sm">
                {leagueCount > 0 
                  ? `${leagueCount} ${locale === 'es' ? (leagueCount === 1 ? 'liga' : 'ligas') : (leagueCount === 1 ? 'league' : 'leagues')}`
                  : locale === 'es' ? 'Próximamente' : 'Coming soon'}
              </span>
            </div>
            
            {leagueCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-800">
                {locale === 'es' ? 'Activo' : 'Active'}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-emerald-600 font-semibold text-sm sm:text-base group-hover:gap-2 transition-all">
            {locale === 'es' ? 'Ver Ligas' : 'View Leagues'}
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
