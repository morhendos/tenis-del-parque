import Link from 'next/link'
import { Trophy, Medal, Award } from 'lucide-react'

const skillLevelColors = {
  advanced: 'bg-yellow-50 text-yellow-700 border-yellow-300', // Gold
  intermediate: 'bg-gray-100 text-gray-700 border-gray-300', // Silver
  beginner: 'bg-amber-50 text-amber-700 border-amber-200', // Bronze
  all: 'bg-blue-100 text-blue-800 border-blue-300'
}

const skillLevelIcons = {
  advanced: Trophy,
  intermediate: Medal,
  beginner: Award,
  all: Trophy
}

const skillLevelNames = {
  es: {
    advanced: 'Oro',
    intermediate: 'Plata',
    beginner: 'Bronce',
    all: 'Todos los niveles'
  },
  en: {
    advanced: 'Gold',
    intermediate: 'Silver',
    beginner: 'Bronze',
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

const skillLevelDescriptions = {
  es: {
    beginner: 'Para competidores primerizos listos para la experiencia de liga.',
    intermediate: 'Para jugadores con experiencia competitiva.',
    advanced: 'Para jugadores experimentados con técnica sólida.',
    all: 'Liga multi-nivel para todas las habilidades.'
  },
  en: {
    beginner: 'For first-time competitors ready for league play.',
    intermediate: 'For players with competitive experience.',
    advanced: 'For experienced players with solid technique.',
    all: 'Multi-level league for all abilities.'
  }
}

export default function LeagueLevelCard({ league, locale, status }) {
  const citySlug = league.city?.slug || 'unknown'
  const skillName = skillLevelNames[locale][league.skillLevel] || league.skillLevel
  const colorClass = skillLevelColors[league.skillLevel] || skillLevelColors.all
  const LevelIcon = skillLevelIcons[league.skillLevel] || Trophy
  const description = skillLevelDescriptions[locale][league.skillLevel] || ''
  
  // Build season name
  const seasonType = seasonTypeNames[locale][league.season?.type] || league.season?.type
  const seasonName = `${seasonType} ${league.season?.year || ''}`
  
  // Registration status
  const isRegistrationOpen = league.status === 'registration_open'
  const isFull = league.stats?.registeredPlayers >= league.seasonConfig?.maxPlayers
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden active:scale-[0.99]">
      {/* Header with skill level */}
      <div className="p-4 sm:p-5 md:p-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold border flex items-center gap-1.5 sm:gap-2 ${colorClass}`}>
            <LevelIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {skillName}
          </span>
          {status === 'current' && (
            <span className="text-[10px] sm:text-xs font-medium text-emerald-600">
              {locale === 'es' ? 'En Curso' : 'Active'}
            </span>
          )}
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-2 sm:mt-3">
          {league.name}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 capitalize">
          {seasonName}
        </p>
        
        {/* Description - shorter on mobile */}
        <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
      
      {/* Stats - more compact */}
      <div className="p-4 sm:p-5 md:p-6 bg-gray-50">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-gray-500">{locale === 'es' ? 'Jugadores' : 'Players'}</p>
            <p className="font-bold text-gray-900 mt-0.5">
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
            <p className="text-gray-500">{locale === 'es' ? 'Precio' : 'Price'}</p>
            <p className="font-bold text-gray-900 mt-0.5">
              {league.seasonConfig?.price?.isFree 
                ? (locale === 'es' ? 'Gratis' : 'Free')
                : league.seasonConfig?.price?.amount > 0
                ? `${league.seasonConfig.price.amount}€`
                : (locale === 'es' ? 'Gratis' : 'Free')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions - compact button */}
      <div className="p-4 sm:p-5 md:p-6 pt-3 sm:pt-4">
        <Link
          href={`/${locale}/leagues/${citySlug}/info/${league.slug}`}
          className="block w-full text-center py-2.5 sm:py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors font-medium text-sm sm:text-base"
        >
          {isRegistrationOpen
            ? (locale === 'es' ? 'Ver Info e Inscribirse' : 'View Info & Join')
            : status === 'current' 
            ? (locale === 'es' ? 'Abrir Liga' : 'Open League')
            : (locale === 'es' ? 'Ver Información' : 'View Info')
          }
        </Link>
        
        {isFull && isRegistrationOpen && (
          <p className="text-xs sm:text-sm text-center text-amber-600 mt-1.5 sm:mt-2 font-medium">
            {locale === 'es' ? 'Liga Completa' : 'League Full'}
          </p>
        )}
      </div>
    </div>
  )
}
