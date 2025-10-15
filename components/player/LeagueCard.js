import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LeagueCard({ player, language }) {
  const params = useParams()
  const locale = params?.locale || 'es'
  if (!player?.league) {
    return null
  }

  // Function to get season display name
  const getSeasonDisplayName = () => {
    // If league has season information, use it to create a proper name
    if (player.league?.season) {
      const seasonNames = {
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
      
      const season = player.league.season
      const seasonType = season.type || 'summer'
      const seasonYear = season.year || 2025
      
      const localizedSeasonName = seasonNames[language || 'es'][seasonType] || seasonType
      return `${localizedSeasonName} ${seasonYear}`
    }
    
    // Fallback: If we have a string that looks like a season name, use it
    if (player.season && typeof player.season === 'string') {
      // Check if it's an ObjectId (24 hex characters) or a proper season name
      if (/^[0-9a-f]{24}$/i.test(player.season)) {
        // It's an ObjectId, show a default season
        return language === 'es' ? 'Verano 2025' : 'Summer 2025'
      }
      // It might be a proper season name, return it
      return player.season
    }
    
    // Default fallback
    return language === 'es' ? 'Temporada Actual' : 'Current Season'
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all hover:shadow-xl animate-scale-in" 
      style={{ 
        animationDelay: '0.5s',
        animationFillMode: 'both',
        opacity: 0,
        transform: 'scale(0.9)'
      }}
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <span className="text-2xl mr-2">🏆</span>
          {language === 'es' ? 'Mi Liga' : 'My League'}
        </h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* League Info */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-parque-purple to-purple-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-2xl">🎾</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{player.league.name}</h3>
              <p className="text-sm text-gray-600">
                {language === 'es' ? 'Temporada' : 'Season'}: {getSeasonDisplayName()}
              </p>
              
              {/* Stats Pills */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                  ELO: {player.eloRating || 1200}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                  {language === 'es' ? 'Nivel' : 'Level'}: {
                    player.level === 'beginner' ? (language === 'es' ? 'Principiante' : 'Beginner') :
                    player.level === 'intermediate' ? (language === 'es' ? 'Intermedio' : 'Intermediate') :
                    player.level === 'advanced' ? (language === 'es' ? 'Avanzado' : 'Advanced') :
                    player.level
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href={`/${locale}/player/league`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/25"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {language === 'es' ? 'Ver Clasificación' : 'View Standings'}
            </Link>
            <Link
              href={`/${locale}/player/league?tab=playoffs`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {language === 'es' ? 'Ver Playoffs' : 'View Playoffs'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}