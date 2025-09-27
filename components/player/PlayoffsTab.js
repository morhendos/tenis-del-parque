import React from 'react'
import TournamentBracket from '@/components/league/TournamentBracket'

export default function PlayoffsTab({ playoffConfig, matches, language = 'es' }) {
  if (!playoffConfig || !playoffConfig.enabled) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language === 'es' ? 'Playoffs no iniciados' : 'Playoffs not started'}
        </h3>
        <p className="text-gray-500">
          {language === 'es' 
            ? 'Los playoffs comenzarán cuando termine la temporada regular.' 
            : 'Playoffs will begin when the regular season ends.'}
        </p>
      </div>
    )
  }

  const currentPhase = playoffConfig.currentPhase
  const isPlayoffsActive = currentPhase !== 'regular_season' && currentPhase !== 'completed'

  if (!isPlayoffsActive) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language === 'es' ? 'Esperando playoffs' : 'Waiting for playoffs'}
        </h3>
        <p className="text-gray-500">
          {language === 'es' 
            ? 'Los playoffs están configurados pero aún no han comenzado.' 
            : 'Playoffs are configured but have not started yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Group A Bracket */}
      {(currentPhase === 'playoffs_groupA' || currentPhase === 'playoffs_groupB' || currentPhase === 'completed') && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
            {language === 'es' ? 'Grupo A - Top 8' : 'Group A - Top 8'}
          </h3>
          <TournamentBracket
            bracket={playoffConfig.bracket?.groupA}
            qualifiedPlayers={playoffConfig.qualifiedPlayers?.groupA}
            matches={matches.filter(m => m.playoffInfo?.group === 'A')}
            group="A"
            language={language}
            hideTitle={true}  // Hide title since we already have one
            hideLegend={playoffConfig.numberOfGroups === 2} // Hide legend if we have Group B
          />
        </div>
      )}

      {/* Group B Bracket (if enabled) */}
      {playoffConfig.numberOfGroups === 2 && 
       (currentPhase === 'playoffs_groupB' || currentPhase === 'completed') && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
            {language === 'es' ? 'Grupo B - Posiciones 9-16' : 'Group B - Positions 9-16'}
          </h3>
          <TournamentBracket
            bracket={playoffConfig.bracket?.groupB}
            qualifiedPlayers={playoffConfig.qualifiedPlayers?.groupB}
            matches={matches.filter(m => m.playoffInfo?.group === 'B')}
            group="B"
            language={language}
            hideTitle={true}   // Hide title
            hideLegend={false}  // Show legend on last bracket
          />
        </div>
      )}

      {/* Completed Status */}
      {currentPhase === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mt-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            {language === 'es' ? '¡Playoffs Completados!' : 'Playoffs Completed!'}
          </h3>
          <p className="text-green-700">
            {language === 'es' 
              ? 'Felicitaciones a todos los participantes.' 
              : 'Congratulations to all participants.'}
          </p>
        </div>
      )}
    </div>
  )
}