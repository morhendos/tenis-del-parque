import React from 'react'

// Compact SVG Icons
const TrophyIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 15c-1.95 0-3.74-.77-5.07-2.03A6.972 6.972 0 015 8V4h14v4c0 1.87-.74 3.57-1.93 4.97A7.024 7.024 0 0112 15zm-5-9v2c0 2.76 2.24 5 5 5s5-2.24 5-5V6H7zm5 11c.34 0 .68-.02 1-.07v2.07h3v2H8v-2h3v-2.07c.32.05.66.07 1 .07z"/>
  </svg>
)

const ChartIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const StarIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const TargetIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

export default function PlayoffExplanation({ language, playoffConfig }) {
  const numberOfGroups = playoffConfig?.numberOfGroups || 1
  const groupAPlayers = playoffConfig?.groupAPlayers || 8
  const groupBPlayers = playoffConfig?.groupBPlayers || 8
  const showPlayoffB = numberOfGroups === 2

  return (
    <div className="mt-6 space-y-4">
      {/* Playoff System - Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <TrophyIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {language === 'es' ? 'Sistema de Playoffs' : 'Playoff System'}
            </h3>
          </div>
        </div>
        
        <div className={`grid grid-cols-1 ${showPlayoffB ? 'sm:grid-cols-2' : ''} gap-3`}>
          {/* Playoff A / Playoffs */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-800">
                {showPlayoffB ? 'Playoff A' : 'Playoffs'}
              </h4>
            </div>
            <p className="text-xs text-gray-600">
              {language === 'es' ? (
                <>Top {groupAPlayers} clasifican a playoffs (indicados con línea azul en la tabla).</>
              ) : (
                <>Top {groupAPlayers} qualify for playoffs (marked with blue line in table).</>
              )}
            </p>
          </div>
          
          {/* Playoff B - Only if 2 groups */}
          {showPlayoffB && (
            <div className="bg-white rounded-lg p-3 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-gray-800">Playoff B</h4>
              </div>
              <p className="text-xs text-gray-600">
                {language === 'es' ? (
                  <>Posiciones {groupAPlayers + 1}-{groupAPlayers + groupBPlayers} clasifican al Playoff B (línea verde).</>
                ) : (
                  <>Positions {groupAPlayers + 1}-{groupAPlayers + groupBPlayers} qualify for Playoff B (green line).</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Swiss System - Detailed but smaller */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-parque-purple rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3c-2.5 3-2.5 6 0 9s2.5 6 0 9" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {language === 'es' ? 'Sistema Suizo' : 'Swiss System'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'es' ? 'Cómo funciona la temporada regular' : 'How the regular season works'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <ChartIcon className="w-3.5 h-3.5 text-purple-600" />
              {language === 'es' ? 'Emparejamientos' : 'Pairings'}
            </h4>
            <p className="text-xs text-gray-600">
              {language === 'es' ? 
                'Los jugadores se emparejan según su ranking ELO y resultados de la temporada, asegurando partidos equilibrados y competitivos.' :
                'Players are paired based on their ELO ranking and season results, ensuring balanced and competitive matches.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <StarIcon className="w-3.5 h-3.5 text-purple-600" />
              {language === 'es' ? 'Puntuación' : 'Scoring'}
            </h4>
            <p className="text-xs text-gray-600">
              {language === 'es' ? 
                '2-0 = 3 pts, 2-1 = 2 pts, 1-2 = 1 pt, 0-2 = 0 pts. Tu ELO sube más al vencer rivales fuertes.' :
                '2-0 = 3 pts, 2-1 = 2 pts, 1-2 = 1 pt, 0-2 = 0 pts. Your ELO rises more when beating stronger opponents.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <TargetIcon className="w-3.5 h-3.5 text-purple-600" />
              {language === 'es' ? 'Objetivo' : 'Objective'}
            </h4>
            <p className="text-xs text-gray-600">
              {language === 'es' ? (
                showPlayoffB 
                  ? `Clasifica en el top ${groupAPlayers + groupBPlayers} para playoffs. Juega mínimo 8 partidos en TDP League para entrar en el OpenRank global.`
                  : `Clasifica en el top ${groupAPlayers} para playoffs. Juega mínimo 8 partidos en TDP League para entrar en el OpenRank global.`
              ) : (
                showPlayoffB
                  ? `Reach top ${groupAPlayers + groupBPlayers} for playoffs. Play at least 8 matches in TDP League to enter the global OpenRank.`
                  : `Reach top ${groupAPlayers} for playoffs. Play at least 8 matches in TDP League to enter the global OpenRank.`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
