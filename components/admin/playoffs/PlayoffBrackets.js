'use client'

import TournamentBracket from '@/components/league/TournamentBracket'

export default function PlayoffBrackets({ 
  playoffConfig,
  playoffMatches,
  onCreateNextRound,
  onMatchClick,
  onResetPlayoffs,
  onOpenNotifications,
  onOpenFinalistEmails,
  onCompletePlayoffs,
  allPlayoffsComplete
}) {
  // Check if playoffs can be completed (all finals done)
  const bracketA = playoffConfig?.bracket?.groupA
  const bracketB = playoffConfig?.bracket?.groupB
  
  const groupAComplete = bracketA?.final?.winner && bracketA?.thirdPlace?.winner
  const groupBComplete = playoffConfig?.numberOfGroups === 2 
    ? (bracketB?.final?.winner && bracketB?.thirdPlace?.winner)
    : true
  
  const canComplete = groupAComplete && groupBComplete && playoffConfig?.currentPhase !== 'completed'
  
  return (
    <>
      {/* Action Buttons */}
      <div className="mb-4 space-y-4">
        {/* Complete Playoffs Button - Show when all matches done */}
        {canComplete && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
              <span>🏆</span>
              All Playoff Matches Complete!
            </h3>
            <p className="text-sm text-green-800 mb-3">
              All finals and 3rd place matches have been played. You can now mark the playoffs as completed.
            </p>
            <button
              onClick={onCompletePlayoffs}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 font-semibold shadow-lg text-lg"
            >
              <span>✓</span>
              Complete Playoffs
            </button>
          </div>
        )}
        
        {/* Playoff Notifications */}
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <button
              onClick={() => onOpenNotifications('A')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 inline-flex"
            >
              <span>📧</span>
              Send Group A Notifications
            </button>
            {playoffConfig?.numberOfGroups === 2 && (
              <button
                onClick={() => onOpenNotifications('B')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 inline-flex"
              >
                <span>📧</span>
                Send Group B Notifications
              </button>
            )}
          </div>
          <button
            onClick={onResetPlayoffs}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset &amp; Recalculate Playoffs
          </button>
        </div>
        
        {/* Finalist Emails Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <span>🏆</span>
            Finalist Congratulations Emails
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            Send exciting congratulatory emails to finalists once semifinals are complete
          </p>
          <div className="space-x-2">
            <button
              onClick={() => onOpenFinalistEmails('A')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded hover:from-yellow-600 hover:to-orange-600 flex items-center gap-2 inline-flex font-semibold shadow-md"
            >
              <span>🌟</span>
              Send Group A Finalist Emails
            </button>
            {playoffConfig?.numberOfGroups === 2 && (
              <button
                onClick={() => onOpenFinalistEmails('B')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2 inline-flex font-semibold shadow-md"
              >
                <span>🌟</span>
                Send Group B Finalist Emails
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Locked Players Notice */}
      {playoffConfig?.qualifiedPlayers?.groupA?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-blue-800 font-semibold mb-2">🔒 Playoff Players Locked In</h3>
          <p className="text-sm text-blue-700 mb-2">
            The following players qualified for playoffs and are locked into the bracket:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-blue-800">Group A:</p>
              <ol className="list-decimal list-inside text-blue-700">
                {playoffConfig.qualifiedPlayers.groupA.map((qp, idx) => (
                  <li key={idx}>
                    Seed {qp.seed}: {qp.player?.name || 'Loading...'}
                  </li>
                ))}
              </ol>
            </div>
            {playoffConfig.qualifiedPlayers.groupB?.length > 0 && (
              <div>
                <p className="font-semibold text-blue-800">Group B:</p>
                <ol className="list-decimal list-inside text-blue-700">
                  {playoffConfig.qualifiedPlayers.groupB.map((qp, idx) => (
                    <li key={idx}>
                      Seed {qp.seed}: {qp.player?.name || 'Loading...'}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Group A Bracket */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Group A Tournament</h2>
          <div className="space-x-2">
            <button
              onClick={() => onCreateNextRound('A', 'semifinal')}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Create Semifinals
            </button>
            <button
              onClick={() => onCreateNextRound('A', 'final')}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Create Finals
            </button>
          </div>
        </div>
        
        <TournamentBracket
          bracket={playoffConfig?.bracket?.groupA}
          qualifiedPlayers={playoffConfig?.qualifiedPlayers?.groupA}
          matches={playoffMatches.filter(m => m.playoffInfo?.group === 'A')}
          group="A"
          language="es"
          onMatchClick={onMatchClick}
        />
      </div>
      
      {/* Group B Bracket (if enabled) */}
      {playoffConfig?.numberOfGroups === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Group B Tournament</h2>
            <div className="space-x-2">
              <button
                onClick={() => onCreateNextRound('B', 'semifinal')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Create Semifinals
              </button>
              <button
                onClick={() => onCreateNextRound('B', 'final')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Create Finals
              </button>
            </div>
          </div>
          
          <TournamentBracket
            bracket={playoffConfig?.bracket?.groupB}
            qualifiedPlayers={playoffConfig?.qualifiedPlayers?.groupB}
            matches={playoffMatches.filter(m => m.playoffInfo?.group === 'B')}
            group="B"
            language="es"
            onMatchClick={onMatchClick}
          />
        </div>
      )}
    </>
  )
}
