import Link from 'next/link'

const skillLevelColors = {
  advanced: 'bg-amber-100 text-amber-800 border-amber-300',
  intermediate: 'bg-gray-100 text-gray-800 border-gray-300',
  beginner: 'bg-orange-100 text-orange-800 border-orange-300',
  all: 'bg-blue-100 text-blue-800 border-blue-300'
}

const skillLevelNames = {
  es: {
    advanced: 'Avanzado',
    intermediate: 'Intermedio',
    beginner: 'Principiantes',
    all: 'Todos los niveles'
  },
  en: {
    advanced: 'Advanced',
    intermediate: 'Intermediate',
    beginner: 'Beginners',
    all: 'All Levels'
  }
}

const seasonTypeNames = {
  es: {
    spring: 'Primavera',
    summer: 'Verano',
    autumn: 'Otoño',
    winter: 'Invierno',
    annual: 'Anual'
  },
  en: {
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter',
    annual: 'Annual'
  }
}

export default function LeagueLevelCard({ league, locale, status }) {
  const citySlug = league.city?.slug || 'unknown'
  const skillName = skillLevelNames[locale][league.skillLevel] || league.skillLevel
  const colorClass = skillLevelColors[league.skillLevel] || skillLevelColors.all
  
  // Build season name
  const seasonType = seasonTypeNames[locale][league.season?.type] || league.season?.type
  const seasonName = `${seasonType} ${league.season?.year || ''}`
  
  // Registration status
  const isRegistrationOpen = league.status === 'registration_open'
  const isFull = league.stats?.registeredPlayers >= league.seasonConfig?.maxPlayers
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header with skill level */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${colorClass}`}>
            {skillName}
          </span>
          {status === 'current' && (
            <span className="text-xs font-medium text-emerald-600">
              {locale === 'es' ? 'En Curso' : 'Active'}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mt-3">
          {league.name}
        </h3>
        
        <p className="text-sm text-gray-600 mt-1 capitalize">
          {seasonName}
        </p>
      </div>
      
      {/* Stats */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">{locale === 'es' ? 'Jugadores' : 'Players'}</p>
            <p className="font-bold text-gray-900">
              {status === 'current' ? (
                // Only show actual count for active leagues
                `${league.stats?.registeredPlayers || 0} / ${league.seasonConfig?.maxPlayers || 32}`
              ) : league.status === 'registration_open' ? (
                // For registration open, NEVER show 0 - be encouraging!
                league.stats?.registeredPlayers > 0 ? (
                  <span className="text-emerald-600">
                    {`${league.stats.registeredPlayers} / ${league.seasonConfig?.maxPlayers || 32}`}
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold">
                    {locale === 'es' ? `${league.seasonConfig?.maxPlayers || 32} plazas` : `${league.seasonConfig?.maxPlayers || 32} spots`}
                  </span>
                )
              ) : league.status === 'coming_soon' ? (
                // For coming soon, show max capacity only
                <span className="text-blue-600">
                  {`${league.seasonConfig?.maxPlayers || 32} ${locale === 'es' ? 'plazas' : 'spots'}`}
                </span>
              ) : (
                // Completed/inactive - show final count
                `${league.stats?.registeredPlayers || 0} / ${league.seasonConfig?.maxPlayers || 32}`
              )}
            </p>
          </div>
          <div>
            <p className="text-gray-600">{locale === 'es' ? 'Precio' : 'Price'}</p>
            <p className="font-bold text-gray-900">
              {league.seasonConfig?.price?.isFree 
                ? (locale === 'es' ? 'Gratis' : 'Free')
                : league.seasonConfig?.price?.amount > 0
                ? `${league.seasonConfig.price.amount}€`
                : (locale === 'es' ? 'Gratis' : 'Free')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-6 pt-4">
        <div className="flex gap-3">
          <Link
            href={`/${locale}/${citySlug}/liga/${league.slug}`}
            className="flex-1 text-center py-2 px-4 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
          >
            {status === 'current' 
              ? (locale === 'es' ? 'Abrir Liga' : 'Open League')
              : status === 'upcoming'
              ? (locale === 'es' ? 'Ver Información' : 'View Info')
              : (locale === 'es' ? 'Ver Liga' : 'View League')
            }
          </Link>
          
          {isRegistrationOpen && !isFull && (
            <Link
              href={`/${locale}/registro/${league.slug}`}
              className="flex-1 text-center py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              {locale === 'es' ? 'Inscribirse' : 'Register'}
            </Link>
          )}
        </div>
        
        {isFull && isRegistrationOpen && (
          <p className="text-sm text-center text-amber-600 mt-2 font-medium">
            {locale === 'es' ? 'Liga Completa' : 'League Full'}
          </p>
        )}
      </div>
    </div>
  )
}
