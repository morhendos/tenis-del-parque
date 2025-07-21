import Link from 'next/link'

export default function ClubCard({ club, locale }) {
  const courtTypes = club.courts.surfaces.map(s => s.type)
  const hasMultipleSurfaces = courtTypes.length > 1
  
  // Get main amenities to display
  const mainAmenities = []
  if (club.amenities.parking) mainAmenities.push({ icon: '🚗', label: locale === 'es' ? 'Parking' : 'Parking' })
  if (club.amenities.lighting) mainAmenities.push({ icon: '💡', label: locale === 'es' ? 'Iluminación' : 'Lighting' })
  if (club.amenities.restaurant) mainAmenities.push({ icon: '🍽️', label: locale === 'es' ? 'Restaurante' : 'Restaurant' })
  if (club.amenities.proShop) mainAmenities.push({ icon: '🎾', label: locale === 'es' ? 'Tienda' : 'Pro Shop' })
  
  const description = club.description[locale] || club.description.es
  const truncatedDescription = description.length > 150 
    ? description.substring(0, 150) + '...' 
    : description

  return (
    <Link
      href={`/${locale}/clubs/${club.location.city}/${club.slug}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-parque-purple to-parque-green p-6 text-white">
        {club.featured && (
          <span className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
            ⭐ {locale === 'es' ? 'Destacado' : 'Featured'}
          </span>
        )}
        <h3 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
          {club.name}
        </h3>
        <p className="text-white/90 text-sm">
          📍 {club.location.address}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 mb-4 flex-1">{truncatedDescription}</p>

        {/* Courts Info */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {club.courts.total} {locale === 'es' ? 'pistas' : 'courts'}
            </span>
            {club.courts.indoor > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {club.courts.indoor} {locale === 'es' ? 'cubiertas' : 'indoor'}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {club.courts.surfaces.map((surface, idx) => (
              <span 
                key={idx}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {surface.count} {
                  surface.type === 'clay' ? (locale === 'es' ? 'tierra batida' : 'clay') :
                  surface.type === 'hard' ? (locale === 'es' ? 'dura' : 'hard') :
                  surface.type === 'grass' ? (locale === 'es' ? 'césped' : 'grass') :
                  surface.type === 'synthetic' ? (locale === 'es' ? 'sintética' : 'synthetic') :
                  surface.type === 'padel' ? 'padel' :
                  surface.type
                }
              </span>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-3">
            {mainAmenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1 text-sm text-gray-600">
                <span>{amenity.icon}</span>
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        {club.pricing?.courtRental?.hourly && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              {locale === 'es' ? 'Desde' : 'From'}{' '}
              <span className="font-semibold text-gray-700">
                {club.pricing.courtRental.hourly.min}€
              </span>
              {locale === 'es' ? '/hora' : '/hour'}
            </span>
          </div>
        )}

        {/* Tags */}
        {club.tags && club.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {club.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="text-xs bg-parque-purple/10 text-parque-purple px-2 py-1 rounded"
              >
                {
                  tag === 'family-friendly' ? (locale === 'es' ? 'Familiar' : 'Family Friendly') :
                  tag === 'professional' ? (locale === 'es' ? 'Profesional' : 'Professional') :
                  tag === 'beginner-friendly' ? (locale === 'es' ? 'Principiantes' : 'Beginners') :
                  tag === 'tournaments' ? (locale === 'es' ? 'Torneos' : 'Tournaments') :
                  tag === 'academy' ? (locale === 'es' ? 'Academia' : 'Academy') :
                  tag === 'municipal' ? (locale === 'es' ? 'Municipal' : 'Municipal') :
                  tag === 'private' ? (locale === 'es' ? 'Privado' : 'Private') :
                  tag === 'hotel-club' ? (locale === 'es' ? 'Hotel Club' : 'Hotel Club') :
                  tag
                }
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-parque-purple font-medium group-hover:translate-x-1 transition-transform">
              {locale === 'es' ? 'Ver detalles' : 'View details'} →
            </span>
            {club.pricing?.membershipRequired && (
              <span className="text-xs text-gray-500">
                {locale === 'es' ? 'Socios' : 'Members only'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}