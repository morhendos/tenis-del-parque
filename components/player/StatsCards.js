export default function StatsCards({ player, language }) {
  // Calculate aggregated stats across all leagues if player has multiple registrations
  const getAggregatedStats = () => {
    const registrations = player?.registrations || []
    
    // If player has new multi-league structure
    if (registrations.length > 0) {
      const aggregated = {
        eloRating: player.eloRating || 1200, // Global ELO
        matchesPlayed: 0,
        matchesWon: 0,
        totalPoints: 0,
        leagueCount: registrations.length
      }
      
      // Sum stats from all league registrations
      registrations.forEach(reg => {
        if (reg.stats) {
          aggregated.matchesPlayed += reg.stats.matchesPlayed || 0
          aggregated.matchesWon += reg.stats.matchesWon || 0
          aggregated.totalPoints += reg.stats.totalPoints || 0
        }
      })
      
      return aggregated
    }
    
    // Fallback to old structure for backward compatibility
    return {
      eloRating: player.stats?.eloRating || player.eloRating || 1200,
      matchesPlayed: player.stats?.matchesPlayed || 0,
      matchesWon: player.stats?.matchesWon || 0,
      totalPoints: player.stats?.totalPoints || 0,
      leagueCount: player.league ? 1 : 0
    }
  }
  
  const aggregatedStats = getAggregatedStats()
  
  const stats = [
    {
      key: 'elo',
      label: 'ELO Rating',
      value: aggregatedStats.eloRating,
      icon: '🎯',
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
      icon: '⚔️',
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
      icon: '🏅',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      border: 'border-purple-100',
      shadowColor: 'shadow-purple-500/20',
      delay: '0.3s'
    },
    {
      key: 'points',
      label: language === 'es' ? 'Puntos' : 'Points',
      value: aggregatedStats.totalPoints,
      icon: '⭐',
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      border: 'border-yellow-100',
      shadowColor: 'shadow-yellow-500/20',
      delay: '0.4s',
      // Show total indicator if > 1 league
      sublabel: aggregatedStats.leagueCount > 1 
        ? (language === 'es' ? 'total' : 'total')
        : null
    }
  ]

  return (
    <div className="space-y-4">
      {/* Multi-league indicator banner */}
      {aggregatedStats.leagueCount > 1 && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-3 text-white text-center shadow-lg">
          <p className="text-sm font-medium flex items-center justify-center">
            <span className="mr-2 text-lg">🏆</span>
            {language === 'es' 
              ? `Estás compitiendo en ${aggregatedStats.leagueCount} ligas` 
              : `You are competing in ${aggregatedStats.leagueCount} leagues`}
            <span className="ml-2 text-lg">🏆</span>
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
                <span className="text-2xl">{stat.icon}</span>
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
