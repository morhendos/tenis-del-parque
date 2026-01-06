import React from 'react'

// SVG Icons
const InfoIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const TrophyIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 15c-1.95 0-3.74-.77-5.07-2.03A6.972 6.972 0 015 8V4h14v4c0 1.87-.74 3.57-1.93 4.97A7.024 7.024 0 0112 15zm-5-9v2c0 2.76 2.24 5 5 5s5-2.24 5-5V6H7zm5 11c.34 0 .68-.02 1-.07v2.07h3v2H8v-2h3v-2.07c.32.05.66.07 1 .07zM5 5V4H2v4c0 1.76.96 3.29 2.38 4.11-.24-.74-.38-1.53-.38-2.35V5zm14 0h3v4c0 .82-.14 1.61-.38 2.35C23.04 10.29 24 8.76 24 7V3h-5v2z"/>
  </svg>
)

const MedalIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C9.24 2 7 4.24 7 7c0 1.94 1.1 3.62 2.71 4.46L7.57 17H6v2h5v-2H9.43l2.14-5.35.43.18.43-.18 2.14 5.35H13v2h5v-2h-1.57l-2.14-5.54C15.9 10.62 17 8.94 17 7c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3z"/>
  </svg>
)

const TennisIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c-2.5 3-2.5 6 0 9s2.5 6 0 9" />
    <path d="M3 12c3-2.5 6-2.5 9 0s6 2.5 9 0" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const TargetIcon = () => (
  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

export default function PlayoffExplanation({ language }) {
  return (
    <div className="mt-8 space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <InfoIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {language === 'es' ? 'Sistema de Playoffs' : 'Playoff System'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'es' ? 'Clasificación para la fase final' : 'Qualification for the final phase'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h4 className="text-lg font-semibold text-blue-800">Playoff A</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {language === 'es' ? (
                <>
                  <strong>Posiciones 1-8:</strong> Los 8 mejores jugadores clasifican al Playoff A, 
                  donde compiten por el título de campeón de la liga.
                </>
              ) : (
                <>
                  <strong>Positions 1-8:</strong> The top 8 players qualify for Playoff A, 
                  where they compete for the league championship title.
                </>
              )}
            </p>
            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
              <TrophyIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                <strong>{language === 'es' ? 'Premio:' : 'Prize:'}</strong> {language === 'es' ? 'Campeón de Liga + Mayor puntuación ELO' : 'League Champion + Higher ELO Rating'}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h4 className="text-lg font-semibold text-green-800">Playoff B</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {language === 'es' ? (
                <>
                  <strong>Posiciones 9-16:</strong> Los siguientes 8 jugadores clasifican al Playoff B, 
                  una competición paralela con sus propios premios.
                </>
              ) : (
                <>
                  <strong>Positions 9-16:</strong> The next 8 players qualify for Playoff B, 
                  a parallel competition with its own prizes.
                </>
              )}
            </p>
            <div className="bg-green-50 rounded-lg p-3 flex items-start gap-2">
              <MedalIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-700">
                <strong>{language === 'es' ? 'Premio:' : 'Prize:'}</strong> {language === 'es' ? 'Campeón Playoff B + Puntos ELO adicionales' : 'Playoff B Champion + Additional ELO Points'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Swiss System Explanation */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-parque-purple rounded-xl flex items-center justify-center">
            <TennisIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {language === 'es' ? 'Sistema Suizo' : 'Swiss System'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'es' ? 'Cómo funciona la temporada regular' : 'How the regular season works'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <ChartIcon />
              {language === 'es' ? 'Emparejamientos' : 'Pairings'}
            </h4>
            <p className="text-sm text-gray-600">
              {language === 'es' ? 
                'Los jugadores se emparejan según su ranking ELO, asegurando partidos equilibrados y competitivos.' :
                'Players are paired according to their ELO ranking, ensuring balanced and competitive matches.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <StarIcon />
              {language === 'es' ? 'Puntuación' : 'Scoring'}
            </h4>
            <p className="text-sm text-gray-600">
              {language === 'es' ? 
                'Los puntos se asignan por victorias, y el ranking ELO se actualiza tras cada partido jugado.' :
                'Points are awarded for wins, and the ELO ranking is updated after each match played.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TargetIcon />
              {language === 'es' ? 'Objetivo' : 'Objective'}
            </h4>
            <p className="text-sm text-gray-600">
              {language === 'es' ? 
                'Alcanza las primeras 16 posiciones para clasificar a los playoffs y competir por el título.' :
                'Reach the top 16 positions to qualify for the playoffs and compete for the title.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
