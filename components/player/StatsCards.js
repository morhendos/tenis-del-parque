export default function StatsCards({ player, language }) {
  // Calculate aggregated stats across all leagues if player has multiple registrations
  const getAggregatedStats = () => {
    const registrations = player?.registrations || []
    
    // Use the calculated stats from player.stats (calculated in usePlayerDashboard)
    // This is the single source of truth from actual match data
    if (player?.stats) {
      return {
        eloRating: player.stats.eloRating || player.eloRating || 1200,
        matchesPlayed: player.stats.matchesPlayed || 0,
        matchesWon: player.stats.matchesWon || 0,
        leagueCount: registrations.length
      }
    }
    
    // Fallback: try to aggregate from registrations if stats not available
    if (registrations.length > 0) {
      const aggregated = {
        eloRating: player.eloRating || 1200,
        matchesPlayed: 0,
        matchesWon: 0,
        leagueCount: registrations.length
      }
      
      // Sum stats from all league registrations
      registrations.forEach(reg => {
        if (reg.stats) {
          aggregated.matchesPlayed += reg.stats.matchesPlayed || 0
          aggregated.matchesWon += reg.stats.matchesWon || 0
        }
      })
      
      return aggregated
    }
    
    // Final fallback
    return {
      eloRating: player?.eloRating || 1200,
      matchesPlayed: 0,
      matchesWon: 0,
      leagueCount: 0
    }
  }
  
  const aggregatedStats = getAggregatedStats()
  
  const stats = [
    {
      key: 'elo',
      label: 'ELO Rating',
      value: aggregatedStats.eloRating,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-100',
      shadowColor: 'shadow-blue-500/20',
      delay: '0.1s'
    },
    {
      key: 'matches',
      label: language === 'es' ? 'Partidos' : 'Matches',
      value: aggregatedStats.matchesPlayed,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          <circle cx="6" cy="6" r="2" fill="currentColor"/>
          <circle cx="18" cy="18" r="2" fill="currentColor"/>
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      shadowColor: 'shadow-green-500/20',
      delay: '0.2s',
      // Show across all leagues indicator if > 1
      sublabel: aggregatedStats.leagueCount > 1 
        ? (language === 'es' ? `en ${aggregatedStats.leagueCount} ligas` : `in ${aggregatedStats.leagueCount} leagues`)
        : null
    },
    {
      key: 'wins',
      label: language === 'es' ? 'Victorias' : 'Wins',
      value: aggregatedStats.matchesWon,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12c0-7-5-7-7-9-2 2-7 2-7 9s5 10 7 10 7-3 7-10z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2"/>
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      border: 'border-purple-100',
      shadowColor: 'shadow-purple-500/20',
      delay: '0.3s'
    },
    {
      key: 'winrate',
      label: language === 'es' ? 'Ratio' : 'Win Rate',
      value: aggregatedStats.matchesPlayed > 0 
        ? `${Math.round((aggregatedStats.matchesWon / aggregatedStats.matchesPlayed) * 100)}%`
        : '0%',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      border: 'border-yellow-100',
      shadowColor: 'shadow-yellow-500/20',
      delay: '0.4s'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Multi-league indicator banner */}
      {aggregatedStats.leagueCount > 1 && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-3 text-white text-center shadow-lg">
          <p className="text-sm font-medium flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            {language === 'es' 
              ? `Estás compitiendo en ${aggregatedStats.leagueCount} ligas` 
              : `You are competing in ${aggregatedStats.leagueCount} leagues`}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </p>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.key}
            className={`stat-card bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-sm p-5 sm:p-6 border ${stat.border} hover:shadow-lg transition-shadow`}
            style={{ animationDelay: stat.delay }}
          >
            <div className="flex flex-col">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg ${stat.shadowColor}`}>
                {stat.icon}
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
              {stat.sublabel && (
                <p className="text-xs text-gray-500 mt-1">{stat.sublabel}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
