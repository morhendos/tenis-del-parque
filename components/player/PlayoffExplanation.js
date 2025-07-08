import React from 'react'

export default function PlayoffExplanation({ language }) {
  return (
    <div className="mt-8 space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-xl">ℹ️</span>
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
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                🏆 <strong>{language === 'es' ? 'Premio:' : 'Prize:'}</strong> {language === 'es' ? 'Campeón de Liga + Mayor puntuación ELO' : 'League Champion + Higher ELO Rating'}
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
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-700">
                🥉 <strong>{language === 'es' ? 'Premio:' : 'Prize:'}</strong> {language === 'es' ? 'Campeón Playoff B + Puntos ELO adicionales' : 'Playoff B Champion + Additional ELO Points'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Swiss System Explanation */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-parque-purple rounded-xl flex items-center justify-center">
            <span className="text-xl">🎾</span>
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
            <h4 className="font-semibold text-gray-900 mb-2">
              📊 {language === 'es' ? 'Emparejamientos' : 'Pairings'}
            </h4>
            <p className="text-sm text-gray-600">
              {language === 'es' ? 
                'Los jugadores se emparejan según su ranking ELO, asegurando partidos equilibrados y competitivos.' :
                'Players are paired according to their ELO ranking, ensuring balanced and competitive matches.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              🏆 {language === 'es' ? 'Puntuación' : 'Scoring'}
            </h4>
            <p className="text-sm text-gray-600">
              {language === 'es' ? 
                'Los puntos se asignan por victorias, y el ranking ELO se actualiza tras cada partido jugado.' :
                'Points are awarded for wins, and the ELO ranking is updated after each match played.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              🎯 {language === 'es' ? 'Objetivo' : 'Objective'}
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