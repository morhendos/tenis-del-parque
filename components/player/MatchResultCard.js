import { useEffect, useState } from 'react'

export default function MatchResultCard({ 
  match, 
  player, 
  language, 
  isWinner,
  onClose
}) {
  const [showConfetti, setShowConfetti] = useState(false)
  
  const getOpponent = () => {
    if (!player || !match) return null
    return match.players.player1._id === player._id 
      ? match.players.player2 
      : match.players.player1
  }

  const opponent = getOpponent()

  // Check if this is the player's match
  const isPlayerMatch = player && (
    match.players.player1._id === player._id || 
    match.players.player2._id === player._id
  )

  // Calculate final score and determine actual winner for player matches
  let myScore = 0, opponentScore = 0
  if (match.result?.score?.sets && isPlayerMatch) {
    const isPlayer1 = match.players.player1._id === player._id
    match.result.score.sets.forEach(set => {
      if (isPlayer1) {
        if (set.player1 > set.player2) myScore++
        else opponentScore++
      } else {
        if (set.player2 > set.player1) myScore++
        else opponentScore++
      }
    })
  }

  // Determine actual winner: for player matches, use calculated score; otherwise use prop
  const actualIsWinner = isPlayerMatch && match.result?.score?.sets 
    ? myScore > opponentScore 
    : isWinner

  useEffect(() => {
    if (isPlayerMatch && actualIsWinner) {
      setShowConfetti(true)
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isPlayerMatch, actualIsWinner])

  // For non-player matches, calculate scores differently
  let p1Score = 0, p2Score = 0
  if (match.result?.score?.sets) {
    match.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) p1Score++
      else p2Score++
    })
  }

  const isPlayer1Winner = match.result?.winner === match.players.player1._id

  return (
    <>
      {/* Confetti Animation - Only for player's winning matches */}
      {showConfetti && isPlayerMatch && actualIsWinner && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 6)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result Card Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-scale-in">
          {/* Header */}
          <div className={`p-6 text-center ${
            isPlayerMatch && actualIsWinner 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-gray-500 to-gray-600'
          } text-white`}>
            <div className="text-6xl mb-3">
              {isPlayerMatch && actualIsWinner ? '🏆' : '🎾'}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {isPlayerMatch 
                ? (actualIsWinner 
                  ? (language === 'es' ? '¡Victoria!' : 'Victory!') 
                  : (language === 'es' ? 'Partido Completado' : 'Match Complete'))
                : (language === 'es' ? 'Resultado del Partido' : 'Match Result')}
            </h2>
            <p className="text-lg opacity-90">
              {language === 'es' ? 'Ronda' : 'Round'} {match.round}
            </p>
          </div>

          {/* Match Details */}
          <div className="p-6">
            {/* Players and Score */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                {isPlayerMatch ? (
                  <>
                    <div className={`text-center ${actualIsWinner ? 'order-1' : 'order-3'}`}>
                      <div className="text-sm text-gray-600 mb-1">
                        {player?.name}
                      </div>
                      <div className={`text-3xl font-bold ${actualIsWinner ? 'text-green-600' : 'text-gray-700'}`}>
                        {myScore}
                      </div>
                    </div>
                    <div className="text-2xl text-gray-400 order-2">vs</div>
                    <div className={`text-center ${actualIsWinner ? 'order-3' : 'order-1'}`}>
                      <div className="text-sm text-gray-600 mb-1">
                        {opponent?.name}
                      </div>
                      <div className={`text-3xl font-bold ${!actualIsWinner ? 'text-green-600' : 'text-gray-700'}`}>
                        {opponentScore}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-center ${isPlayer1Winner ? 'order-1' : 'order-3'}`}>
                      <div className="text-sm text-gray-600 mb-1">
                        {match.players.player1.name}
                      </div>
                      <div className={`text-3xl font-bold ${isPlayer1Winner ? 'text-green-600' : 'text-gray-700'}`}>
                        {p1Score}
                      </div>
                    </div>
                    <div className="text-2xl text-gray-400 order-2">vs</div>
                    <div className={`text-center ${!isPlayer1Winner ? 'order-1' : 'order-3'}`}>
                      <div className="text-sm text-gray-600 mb-1">
                        {match.players.player2.name}
                      </div>
                      <div className={`text-3xl font-bold ${!isPlayer1Winner ? 'text-green-600' : 'text-gray-700'}`}>
                        {p2Score}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Set Details */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Detalle de Sets' : 'Set Details'}
                </h4>
                <div className="flex gap-3 justify-center">
                  {match.result?.score?.sets?.map((set, index) => {
                    let wonSet, mySetScore, oppSetScore
                    
                    if (isPlayerMatch) {
                      const isPlayer1 = match.players.player1._id === player._id
                      mySetScore = isPlayer1 ? set.player1 : set.player2
                      oppSetScore = isPlayer1 ? set.player2 : set.player1
                      wonSet = mySetScore > oppSetScore
                    } else {
                      mySetScore = set.player1
                      oppSetScore = set.player2
                      wonSet = isPlayer1Winner ? set.player1 > set.player2 : set.player2 > set.player1
                    }
                    
                    return (
                      <div 
                        key={index} 
                        className={`text-center px-3 py-2 rounded-lg ${
                          isPlayerMatch 
                            ? (wonSet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="text-lg font-bold">
                          {mySetScore}-{oppSetScore}
                        </div>
                        <div className="text-xs opacity-75">
                          {index === 2 ? 'Super TB' : `Set ${index + 1}`}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-5">📅</span>
                <span className="ml-2">
                  {new Date(match.result?.playedAt || new Date()).toLocaleDateString(
                    language === 'es' ? 'es-ES' : 'en-US',
                    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
              </div>
              {match.schedule?.venue && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-5">📍</span>
                  <span className="ml-2">{match.schedule.venue}</span>
                </div>
              )}
              {match.schedule?.court && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-5">🎾</span>
                  <span className="ml-2">{match.schedule.court}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isPlayerMatch && actualIsWinner && (
                <button
                  onClick={() => {
                    const text = language === 'es' 
                      ? `¡Acabo de ganar mi partido de tenis ${myScore}-${opponentScore} en la ronda ${match.round}! 🎾🏆`
                      : `Just won my tennis match ${myScore}-${opponentScore} in round ${match.round}! 🎾🏆`
                    
                    if (navigator.share) {
                      navigator.share({ text })
                    } else {
                      // Fallback to copying to clipboard
                      navigator.clipboard.writeText(text)
                      alert(language === 'es' ? 'Copiado al portapapeles' : 'Copied to clipboard')
                    }
                  }}
                  className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9 9 0 10-13.432 0m13.432 0A9 9 0 0112 21m0 0a8.997 8.997 0 01-7.716-4.374m15.432 0a9 9 0 00-7.716 4.374M12 12a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                  {language === 'es' ? 'Compartir' : 'Share'}
                </button>
              )}
              <button
                onClick={onClose}
                className={`${!isPlayerMatch || !actualIsWinner ? 'flex-1' : ''} bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors`}
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>

            {/* Motivational Message - Only for player's own losing matches */}
            {isPlayerMatch && !actualIsWinner && (
              <p className="text-center text-sm text-gray-500 mt-4">
                {language === 'es' 
                  ? '¡Sigue practicando! La próxima victoria está cerca 💪'
                  : 'Keep practicing! Your next victory is just around the corner 💪'}
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s linear forwards;
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(calc(100vh + 10px)) rotate(360deg);
          }
        }

        .confetti:nth-child(even) {
          width: 8px;
          height: 8px;
          animation-duration: 4s;
        }

        .confetti:nth-child(3n) {
          width: 6px;
          height: 6px;
          animation-duration: 2.5s;
        }
      `}</style>
    </>
  )
}