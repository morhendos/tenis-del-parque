import Image from 'next/image'
import Link from 'next/link'

export default function CityLeagueHero({ city, locale }) {
  const cityName = city.name[locale] || city.name.es
  
  return (
    <div className="relative h-[400px] bg-gradient-to-r from-emerald-600 to-teal-600">
      {/* Background Image */}
      {city.images?.main && (
        <div className="absolute inset-0 opacity-40">
          <Image
            src={city.images.main}
            alt={cityName}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-16">
        {/* Breadcrumb */}
        <nav className="mb-4 text-white/80">
          <Link href={`/${locale}/leagues`} className="hover:text-white">
            {locale === 'es' ? 'Ciudades' : 'Cities'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{cityName}</span>
        </nav>
        
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          {cityName}
        </h1>
        <p className="text-xl text-white/90 max-w-2xl">
          {locale === 'es' 
            ? 'Descubre nuestras ligas de tenis disponibles' 
            : 'Discover our available tennis leagues'}
        </p>
      </div>
    </div>
  )
}
