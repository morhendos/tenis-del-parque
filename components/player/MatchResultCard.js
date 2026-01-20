import { useEffect, useState } from 'react'
import Image from 'next/image'

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

  // Check if this is a walkover match
  const isWalkover = match.result?.score?.walkover === true

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

  // For non-player matches, calculate scores differently
  let p1Score = 0, p2Score = 0
  if (match.result?.score?.sets) {
    match.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) p1Score++
      else p2Score++
    })
  }

  // Use the same winner logic as ResultsTab - always use API winner
  const isPlayer1Winner = match.result?.winner?._id === match.players.player1._id
  const isPlayer2Winner = match.result?.winner?._id === match.players.player2._id
  
  // For player matches, determine if current player won
  const actualIsWinner = isPlayerMatch 
    ? (match.players.player1._id === player._id ? isPlayer1Winner : isPlayer2Winner)
    : isWinner

  // For walkover matches, we don't show confetti or treat it as a "real" win
  useEffect(() => {
    if (isPlayerMatch && actualIsWinner && !isWalkover) {
      setShowConfetti(true)
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isPlayerMatch, actualIsWinner, isWalkover])

  // Get venue/location info
  const venue = match.schedule?.venue || match.schedule?.club
  const court = match.schedule?.court

  return (
    <>
      {/* Confetti Animation - Only for player's winning matches (NOT walkovers) */}
      {showConfetti && isPlayerMatch && actualIsWinner && !isWalkover && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FFD700', '#A855F7', '#7C3AED', '#F59E0B', '#10B981', '#EC4899'][Math.floor(Math.random() * 6)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result Card Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-scale-in max-h-[calc(100vh-8rem)] overflow-y-auto shadow-2xl">
          {/* Header - Purple gradient like league header */}
          <div className={`relative overflow-hidden p-6 text-center ${
            isWalkover 
              ? 'bg-gradient-to-br from-gray-500 to-gray-600'
              : (isPlayerMatch && actualIsWinner 
                ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600' 
                : 'bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600')
          } text-white`}>
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-white rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white rounded-full" />
            </div>
            
            <div className="relative z-10">
              {/* Logo */}
              <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2">
                {isPlayerMatch && actualIsWinner && !isWalkover ? (
                  // Trophy icon for wins
                  <svg className="w-10 h-10 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V10C18 11.1 17.1 12 16 12H14V13.5C14 14.33 14.67 15 15.5 15H16V17H15.5C13.57 17 12 15.43 12 13.5V12H12C10.9 12 10 11.1 10 10V8C10 6.9 10.9 6 12 6V4C12 2.9 12.9 2 14 2H12ZM6 8H8V10H6V8ZM16 8H18V10H16V8ZM7 17H17V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V17Z"/>
                  </svg>
                ) : (
                  <Image 
                    src="/logo-big.png" 
                    alt="Tenis del Parque" 
                    width={48} 
                    height={48}
                    className="object-contain"
                  />
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-1">
                {isWalkover 
                  ? 'Walkover'
                  : (isPlayerMatch 
                    ? (actualIsWinner 
                      ? (language === 'es' ? '¡Victoria!' : 'Victory!') 
                      : (language === 'es' ? 'Partido Completado' : 'Match Complete'))
                    : (language === 'es' ? 'Resultado del Partido' : 'Match Result'))}
              </h2>
              <p className="text-sm opacity-80">
                {language === 'es' ? 'Ronda' : 'Round'} {match.round}
              </p>
            </div>
          </div>

          {/* Match Details */}
          <div className="p-5">
            {/* Players and Score */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                {isPlayerMatch ? (
                  <>
                    {/* Show in natural order: player1 vs player2 */}
                    {match.players.player1._id === player._id ? (
                      <>
                        <div className="text-center flex-1">
                          <div className="text-sm text-gray-600 mb-1">
                            {player?.name}
                          </div>
                          <div className={`text-4xl font-bold ${
                            isWalkover 
                              ? 'text-gray-400'
                              : (actualIsWinner ? 'text-emerald-600' : 'text-gray-700')
                          }`}>
                            {isWalkover ? '–' : myScore}
                          </div>
                        </div>
                        <div className="text-lg text-gray-300 font-medium px-3">vs</div>
                        <div className="text-center flex-1">
                          <div className="text-sm text-gray-600 mb-1">
                            {opponent?.name}
                          </div>
                          <div className={`text-4xl font-bold ${
                            isWalkover 
                              ? 'text-gray-400'
                              : (!actualIsWinner ? 'text-emerald-600' : 'text-gray-700')
                          }`}>
                            {isWalkover ? '–' : opponentScore}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center flex-1">
                          <div className="text-sm text-gray-600 mb-1">
                            {opponent?.name}
                          </div>
                          <div className={`text-4xl font-bold ${
                            isWalkover 
                              ? 'text-gray-400'
                              : (!actualIsWinner ? 'text-emerald-600' : 'text-gray-700')
                          }`}>
                            {isWalkover ? '–' : opponentScore}
                          </div>
                        </div>
                        <div className="text-lg text-gray-300 font-medium px-3">vs</div>
                        <div className="text-center flex-1">
                          <div className="text-sm text-gray-600 mb-1">
                            {player?.name}
                          </div>
                          <div className={`text-4xl font-bold ${
                            isWalkover 
                              ? 'text-gray-400'
                              : (actualIsWinner ? 'text-emerald-600' : 'text-gray-700')
                          }`}>
                            {isWalkover ? '–' : myScore}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        {match.players.player1.name}
                      </div>
                      <div className={`text-4xl font-bold ${
                        isWalkover 
                          ? 'text-gray-400'
                          : (isPlayer1Winner ? 'text-emerald-600' : 'text-gray-700')
                      }`}>
                        {isWalkover ? '–' : p1Score}
                      </div>
                    </div>
                    <div className="text-lg text-gray-300 font-medium px-3">vs</div>
                    <div className="text-center flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        {match.players.player2.name}
                      </div>
                      <div className={`text-4xl font-bold ${
                        isWalkover 
                          ? 'text-gray-400'
                          : (isPlayer2Winner ? 'text-emerald-600' : 'text-gray-700')
                      }`}>
                        {isWalkover ? '–' : p2Score}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Set Details - Only show for non-walkover matches */}
              {!isWalkover && match.result?.score?.sets && match.result.score.sets.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    {language === 'es' ? 'Detalle de Sets' : 'Set Details'}
                  </h4>
                  <div className="flex gap-2 justify-center">
                    {match.result.score.sets.map((set, index) => {
                      const leftScore = set.player1
                      const rightScore = set.player2
                      
                      let wonSet
                      if (isPlayerMatch) {
                        const isPlayer1 = match.players.player1._id === player._id
                        wonSet = isPlayer1 
                          ? set.player1 > set.player2
                          : set.player2 > set.player1
                      } else {
                        wonSet = isPlayer1Winner ? set.player1 > set.player2 : set.player2 > set.player1
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className={`text-center px-4 py-2 rounded-lg ${
                            isPlayerMatch 
                              ? (wonSet ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="text-lg font-bold">
                            {leftScore}-{rightScore}
                          </div>
                          <div className="text-[10px] font-medium opacity-70">
                            {index === 2 ? 'Super TB' : `Set ${index + 1}`}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Walkover explanation */}
              {isWalkover && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg py-2 px-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {language === 'es' 
                        ? 'Un jugador no se presentó'
                        : 'One player did not show up'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Match Info */}
            <div className="space-y-2 mb-5">
              {/* Date */}
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>
                  {new Date(match.result?.playedAt || new Date()).toLocaleDateString(
                    language === 'es' ? 'es-ES' : 'en-US',
                    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
              </div>
              
              {/* Venue & Court */}
              {(venue || court) && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>
                    {[venue, court].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {language === 'es' ? 'Cerrar' : 'Close'}
            </button>

            {/* Motivational Message - Only for player's own losing matches (NOT walkovers) */}
            {isPlayerMatch && !actualIsWinner && !isWalkover && (
              <p className="text-center text-sm text-gray-500 mt-4">
                {(() => {
                  const motivationalMessages = {
                    es: [
                      '¡Sigue practicando! La próxima victoria está cerca.',
                      'Cada partido es una lección — ¡te estás fortaleciendo!',
                      'Los campeones se forjan con derrotas como estas.',
                      '¡Gran esfuerzo! Los mejores jugadores también pierden.',
                      '¡Tu historia de remontada empieza ahora!',
                      'Los partidos difíciles hacen mejores jugadores.',
                      'Jugaste con el corazón — eso es lo que cuenta.',
                      'Todos los profesionales han estado donde estás ahora.',
                      '¡El próximo partido es un nuevo comienzo!',
                      'Los retrocesos son preparación para las remontadas.'
                    ],
                    en: [
                      'Keep practicing! Your next victory is just around the corner.',
                      'Every match is a lesson — you\'re getting stronger!',
                      'Champions are made through defeats like these.',
                      'Great effort! The best players lose matches too.',
                      'Your comeback story starts now!',
                      'Tough matches make better players.',
                      'You played your heart out — that\'s what counts.',
                      'Every pro has been where you are right now.',
                      'The next match is a fresh start!',
                      'Setbacks are setups for comebacks.'
                    ]
                  }
                  
                  const messages = motivationalMessages[language === 'es' ? 'es' : 'en']
                  const randomIndex = Math.floor(Math.random() * messages.length)
                  return messages[randomIndex]
                })()}
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
