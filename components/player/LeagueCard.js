import Link from 'next/link'

export default function LeagueCard({ player, language }) {
  if (!player?.league) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all hover:shadow-xl animate-scale-in" style={{ animationDelay: '0.5s' }}>
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
              <p className="text-sm text-gray-600">{language === 'es' ? 'Temporada' : 'Season'}: {player.season}</p>
              
              {/* Stats Pills */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                  ELO: {player.stats?.eloRating || 1200}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                  {language === 'es' ? 'Nivel' : 'Level'}: {player.level}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Link
            href="/player/league"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/25"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {language === 'es' ? 'Ver Clasificación' : 'View Standings'}
          </Link>
        </div>
      </div>
    </div>
  )
} 