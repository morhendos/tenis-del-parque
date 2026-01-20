import { useEffect, useState } from 'react'
import Image from 'next/image'
import confetti from 'canvas-confetti'
import { getRandomQuote } from '@/lib/content/tennisQuotes'

export default function MatchResultCard({ 
  match, 
  player, 
  language, 
  isWinner,
  onClose
}) {
  const [quote, setQuote] = useState(null)
  
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
    // Get a random tennis quote for winning matches
    if (isPlayerMatch && actualIsWinner && !isWalkover) {
      setQuote(getRandomQuote(language))
    }
    
    if (isPlayerMatch && actualIsWinner && !isWalkover) {
      // Trigger spectacular confetti celebration!
      const triggerConfetti = () => {
        // First burst - center with gold/purple colors
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#A855F7', '#7C3AED', '#F59E0B', '#10B981', '#EC4899']
        })
        
        // Second burst - left side (delayed)
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#FFD700', '#A855F7', '#7C3AED', '#F59E0B', '#10B981']
          })
        }, 150)
        
        // Third burst - right side (delayed)
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#FFD700', '#A855F7', '#7C3AED', '#F59E0B', '#10B981']
          })
        }, 300)
        
        // Extra celebration burst from top
        setTimeout(() => {
          confetti({
            particleCount: 30,
            spread: 100,
            origin: { y: 0.2 },
            colors: ['#FFD700', '#FCD34D', '#FBBF24']
          })
        }, 500)
      }
      
      // Small delay to let the modal render first
      const timer = setTimeout(triggerConfetti, 200)
      
      return () => clearTimeout(timer)
    }
  }, [isPlayerMatch, actualIsWinner, isWalkover, language])

  // Get venue/location info
  const venue = match.schedule?.venue || match.schedule?.club
  const court = match.schedule?.court

  return (
    <>
      {/* Result Card Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-scale-in max-h-[calc(100vh-8rem)] overflow-y-auto shadow-2xl">
          {/* Header - Compact purple gradient */}
          <div className={`relative overflow-hidden p-4 sm:p-5 text-center ${
            isWalkover 
              ? 'bg-gradient-to-br from-gray-500 to-gray-600'
              : 'bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600'
          } text-white`}>
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-white rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white rounded-full" />
            </div>
            
            <div className="relative z-10">
              {/* Logo - Compact */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center p-1.5">
                <Image 
                  src="/logo-big.png" 
                  alt="Tenis del Parque" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold mb-0.5">
                {isWalkover 
                  ? 'Walkover'
                  : (isPlayerMatch 
                    ? (actualIsWinner 
                      ? (language === 'es' ? '¡Victoria!' : 'Victory!') 
                      : (language === 'es' ? 'Partido Completado' : 'Match Complete'))
                    : (language === 'es' ? 'Resultado del Partido' : 'Match Result'))}
              </h2>
              <p className="text-xs sm:text-sm opacity-80">
                {language === 'es' ? 'Ronda' : 'Round'} {match.round}
              </p>
            </div>
          </div>

          {/* Match Details */}
          <div className="p-4 sm:p-5">
            {/* Players and Score */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                {isPlayerMatch ? (
                  <>
                    {/* Show in natural order: player1 vs player2 */}
                    {match.players.player1._id === player._id ? (
                      <>
                        <div className="text-center flex-1">
                          <div className="text-xs sm:text-sm text-gray-600 mb-0.5">
                            {player?.name}
                          </div>
                          <div className={`text-3xl sm:text-4xl font-bold ${
                            isWalkover 
                              ? 'text-gray-400'
                              : (actualIsWinner ? 'text-emerald-600' : 'text-gray-700')
                          }`}>
                            {isWalkover ? '–' : myScore}
                          </div>
                          {/* ELO Change for player */}
                          {match.eloChanges?.player1?.change !== undefined && !isWalkover && (
                            <div className={`text-xs font-medium mt-0.5 ${
                              match.eloChanges.player1.change >= 0 ? 'text-teal-600/70' : 'text-gray-400'
                            }`}>
                              {match.eloChanges.player1.change >= 0 ? '+' : ''}{match.eloChanges.player1.change} ELO
                            </div>
                          )}
                        </div>
                        <div className="text-base sm:text-lg text-gray-300 font-medium px-2 sm:px-3">vs</div>
                        <div className="text-center flex-1">
                          <div className="text-xs sm:text-sm text-gray-600 mb-0.5">
                            {opponent?.name}
                          </div>
                          <div className={`text-3xl sm:text-4xl font-bold ${
                            isWalkover 
                              ? 'text-gray-400'
                              : (!actualIsWinner ? 'text-emerald-600' : 'text-gray-700')
                          }`}>
                            {isWalkover ? '–' : opponentScore}
                          </div>
                          {/* ELO Change for opponent */}
                          {match.eloChanges?.player2?.change !== undefined && !isWalkover && (
                            <div className={`text-xs font-medium mt-0.5 ${
                              match.eloChanges.player2.change >= 0 ? 'text-teal-600/70' : 'text-gray-400'
                            }`}>
                              {match.eloChanges.player2.change >= 0 ? '+' : ''}{match.eloChanges.player2.change} ELO
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center flex-1">
                          <div className="text-xs sm:text-sm text-gray-600 mb-0.5">
                            {opponent?.name}
                          </div>
                          <div className={`text-3xl sm:text-4xl font-bold ${
                            isWalkover 
                              ? 'text-gray-400'
                              : (!actualIsWinner ? 'text-emerald-600' : 'text-gray-700')
                          }`}>
                            {isWalkover ? '–' : opponentScore}
                          </div>
                          {/* ELO Change for opponent (player1) */}
                          {match.eloChanges?.player1?.change !== undefined && !isWalkover && (
                            <div className={`text-xs font-medium mt-0.5 ${
                              match.eloChanges.player1.change >= 0 ? 'text-teal-600/70' : 'text-gray-400'
                            }`}>
                              {match.eloChanges.player1.change >= 0 ? '+' : ''}{match.eloChanges.player1.change} ELO
                            </div>
                          )}
                        </div>
                        <div className="text-base sm:text-lg text-gray-300 font-medium px-2 sm:px-3">vs</div>
                        <div className="text-center flex-1">
                          <div className="text-xs sm:text-sm text-gray-600 mb-0.5">
                            {player?.name}
                          </div>
                          <div className={`text-3xl sm:text-4xl font-bold ${
                            isWalkover 
                              ? 'text-gray-400'
                              : (actualIsWinner ? 'text-emerald-600' : 'text-gray-700')
                          }`}>
                            {isWalkover ? '–' : myScore}
                          </div>
                          {/* ELO Change for player (player2) */}
                          {match.eloChanges?.player2?.change !== undefined && !isWalkover && (
                            <div className={`text-xs font-medium mt-0.5 ${
                              match.eloChanges.player2.change >= 0 ? 'text-teal-600/70' : 'text-gray-400'
                            }`}>
                              {match.eloChanges.player2.change >= 0 ? '+' : ''}{match.eloChanges.player2.change} ELO
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center flex-1">
                      <div className="text-xs sm:text-sm text-gray-600 mb-0.5">
                        {match.players.player1.name}
                      </div>
                      <div className={`text-3xl sm:text-4xl font-bold ${
                        isWalkover 
                          ? 'text-gray-400'
                          : (isPlayer1Winner ? 'text-emerald-600' : 'text-gray-700')
                      }`}>
                        {isWalkover ? '–' : p1Score}
                      </div>
                      {/* ELO Change for player1 */}
                      {match.eloChanges?.player1?.change !== undefined && !isWalkover && (
                        <div className={`text-xs font-medium mt-0.5 ${
                          match.eloChanges.player1.change >= 0 ? 'text-teal-600/70' : 'text-gray-400'
                        }`}>
                          {match.eloChanges.player1.change >= 0 ? '+' : ''}{match.eloChanges.player1.change} ELO
                        </div>
                      )}
                    </div>
                    <div className="text-base sm:text-lg text-gray-300 font-medium px-2 sm:px-3">vs</div>
                    <div className="text-center flex-1">
                      <div className="text-xs sm:text-sm text-gray-600 mb-0.5">
                        {match.players.player2.name}
                      </div>
                      <div className={`text-3xl sm:text-4xl font-bold ${
                        isWalkover 
                          ? 'text-gray-400'
                          : (isPlayer2Winner ? 'text-emerald-600' : 'text-gray-700')
                      }`}>
                        {isWalkover ? '–' : p2Score}
                      </div>
                      {/* ELO Change for player2 */}
                      {match.eloChanges?.player2?.change !== undefined && !isWalkover && (
                        <div className={`text-xs font-medium mt-0.5 ${
                          match.eloChanges.player2.change >= 0 ? 'text-teal-600/70' : 'text-gray-400'
                        }`}>
                          {match.eloChanges.player2.change >= 0 ? '+' : ''}{match.eloChanges.player2.change} ELO
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Set Details - Only show for non-walkover matches */}
              {!isWalkover && match.result?.score?.sets && match.result.score.sets.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
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
                              ? (wonSet ? 'bg-teal-50/60 text-teal-700' : 'bg-gray-100 text-gray-500')
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

            {/* Motivational Quote - Only for player's own WINNING matches (NOT walkovers) */}
            {isPlayerMatch && actualIsWinner && !isWalkover && quote && (
              <div className="text-center mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-600 italic text-sm">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  — {quote.author}
                </p>
              </div>
            )}

            {/* Encouraging Message - Only for player's own LOSING matches (NOT walkovers) */}
            {isPlayerMatch && !actualIsWinner && !isWalkover && (
              <p className="text-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 italic">
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
      `}</style>
    </>
  )
}
