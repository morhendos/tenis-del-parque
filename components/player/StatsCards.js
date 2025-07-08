export default function StatsCards({ player, language }) {
  const stats = [
    {
      key: 'elo',
      label: 'ELO Rating',
      value: player.stats?.eloRating || 1200,
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
      value: player.stats?.matchesPlayed || 0,
      icon: '⚔️',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      shadowColor: 'shadow-green-500/20',
      delay: '0.2s'
    },
    {
      key: 'wins',
      label: language === 'es' ? 'Victorias' : 'Wins',
      value: player.stats?.matchesWon || 0,
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
      value: player.stats?.totalPoints || 0,
      icon: '⭐',
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      border: 'border-yellow-100',
      shadowColor: 'shadow-yellow-500/20',
      delay: '0.4s'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => (
        <div 
          key={stat.key}
          className={`stat-card bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-sm p-5 sm:p-6 border ${stat.border}`}
          style={{ animationDelay: stat.delay }}
        >
          <div className="flex flex-col">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg ${stat.shadowColor}`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 