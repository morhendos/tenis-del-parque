import Link from 'next/link'
import Image from 'next/image'

export default function CityCard({ city, leagueCount, locale }) {
  const cityName = city.name[locale] || city.name.es
  
  return (
    <Link
      href={`/${locale}/leagues/${city.slug}`}
      className="group block"
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* City Image */}
        <div className="relative h-48">
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
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {cityName}
            </h2>
          </div>
        </div>
        
        {/* City Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm">
                {leagueCount > 0 
                  ? `${leagueCount} ${locale === 'es' ? (leagueCount === 1 ? 'liga activa' : 'ligas activas') : (leagueCount === 1 ? 'active league' : 'active leagues')}`
                  : locale === 'es' ? 'Próximamente' : 'Coming soon'}
              </span>
            </div>
            
            {leagueCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                {locale === 'es' ? 'Disponible' : 'Available'}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-2 transition-all">
            {locale === 'es' ? 'Ver Ligas' : 'View Leagues'}
            <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
