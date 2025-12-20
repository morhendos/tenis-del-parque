import Link from 'next/link'

export default function OpenRankAchievement({ player, language, locale }) {
  const MATCHES_REQUIRED = 8
  
  // Get matches played from player stats, cap at required amount for display
  const matchesPlayed = player?.stats?.matchesPlayed || 0
  const matchesDisplayed = Math.min(matchesPlayed, MATCHES_REQUIRED)
  const isUnlocked = matchesPlayed >= MATCHES_REQUIRED
  const progress = Math.min((matchesPlayed / MATCHES_REQUIRED) * 100, 100)
  const matchesRemaining = Math.max(MATCHES_REQUIRED - matchesPlayed, 0)
  
  const content = {
    es: {
      title: 'OpenRank',
      subtitle: 'Ranking Global ELO',
      unlocked: '¡Desbloqueado!',
      locked: 'Bloqueado',
      matchesPlayed: 'partidos jugados',
      matchesNeeded: `${matchesRemaining} partido${matchesRemaining !== 1 ? 's' : ''} más para desbloquear`,
      description: 'Juega 8 partidos para obtener tu posición en el ranking global.',
      unlockedDescription: '¡Ya puedes ver tu posición en el ranking global!',
      viewRanking: 'Ver OpenRank',
      keepPlaying: '¡Sigue jugando!'
    },
    en: {
      title: 'OpenRank',
      subtitle: 'Global ELO Ranking',
      unlocked: 'Unlocked!',
      locked: 'Locked',
      matchesPlayed: 'matches played',
      matchesNeeded: `${matchesRemaining} more match${matchesRemaining !== 1 ? 'es' : ''} to unlock`,
      description: 'Play 8 matches to get your position in the global ranking.',
      unlockedDescription: 'You can now see your position in the global ranking!',
      viewRanking: 'View OpenRank',
      keepPlaying: 'Keep playing!'
    }
  }
  
  const t = content[language] || content.es

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${
      isUnlocked 
        ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-yellow-300' 
        : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-gray-200'
    } p-5 sm:p-6 shadow-sm`}>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" fill="currentColor" className={isUnlocked ? 'text-yellow-500' : 'text-gray-400'}>
          <path d="M50 5 L61 39 L97 39 L68 61 L79 95 L50 73 L21 95 L32 61 L3 39 L39 39 Z" />
        </svg>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Trophy/Lock Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isUnlocked 
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-yellow-500/30' 
                : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-500/20'
            }`}>
              {isUnlocked ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{t.title}</h3>
              <p className="text-sm text-gray-500">{t.subtitle}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isUnlocked 
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {isUnlocked ? t.unlocked : t.locked}
          </span>
        </div>
        
        {/* Progress Section */}
        <div className="mb-4">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">
              {matchesDisplayed} / {MATCHES_REQUIRED} {t.matchesPlayed}
            </span>
            <span className={`font-semibold ${isUnlocked ? 'text-yellow-600' : 'text-gray-500'}`}>
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                isUnlocked 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Matches remaining hint */}
          {!isUnlocked && (
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.matchesNeeded}
            </p>
          )}
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          {isUnlocked ? t.unlockedDescription : t.description}
        </p>
        
        {/* Action Button */}
        {isUnlocked ? (
          <Link
            href={`/${locale}/player/openrank`}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-xl hover:from-yellow-500 hover:to-yellow-600 font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            {t.viewRanking}
          </Link>
        ) : (
          <div className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium border border-gray-200">
            <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.keepPlaying}
          </div>
        )}
      </div>
    </div>
  )
}
