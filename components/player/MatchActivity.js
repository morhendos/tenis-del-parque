import React from 'react'
import { useRouter } from 'next/navigation'

export function RecentMatches({ matches, language }) {
  const router = useRouter()
  
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          ⏰ {language === 'es' ? 'Actividad Reciente' : 'Recent Activity'}
        </h3>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎾</div>
          <p className="text-gray-500 text-sm">
            {language === 'es' 
              ? 'No hay partidos recientes' 
              : 'No recent matches'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          ⏰ {language === 'es' ? 'Actividad Reciente' : 'Recent Activity'}
        </h3>
        <button
          onClick={() => router.push('/player/matches')}
          className="text-sm text-parque-purple hover:text-purple-700 font-medium transition-colors"
        >
          {language === 'es' ? 'Ver todos' : 'View all'} →
        </button>
      </div>
      <div className="space-y-3">
        {matches.slice(0, 3).map((match) => {
          const isWin = match.result === 'won'
          const resultText = isWin 
            ? (language === 'es' ? 'Victoria' : 'Win') 
            : (language === 'es' ? 'Derrota' : 'Loss')
          const resultColor = isWin ? 'text-green-600' : 'text-red-600'
          const bgColor = isWin ? 'bg-green-50' : 'bg-red-50'
          
          return (
            <div 
              key={match._id} 
              className={`${bgColor} rounded-xl p-4 hover:bg-opacity-80 transition-all cursor-pointer`}
              onClick={() => router.push('/player/matches')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isWin ? 'bg-green-500' : 'bg-red-500'
                  } text-white font-bold shadow-sm`}>
                    {match.round}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {match.opponent}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${resultColor}`}>
                    {resultText}
                  </p>
                  {match.eloChange && (
                    <p className="text-sm text-gray-600">
                      ELO {match.eloChange > 0 ? '+' : ''}{match.eloChange}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function UpcomingMatches({ matches, language }) {
  const router = useRouter()
  
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          📅 {language === 'es' ? 'Próximos Partidos' : 'Upcoming Matches'}
        </h3>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🗓️</div>
          <p className="text-gray-500 text-sm">
            {language === 'es' 
              ? 'No hay partidos programados' 
              : 'No scheduled matches'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          📅 {language === 'es' ? 'Próximos Partidos' : 'Upcoming Matches'}
        </h3>
        <button
          onClick={() => router.push('/player/matches')}
          className="text-sm text-parque-purple hover:text-purple-700 font-medium transition-colors"
        >
          {language === 'es' ? 'Gestionar' : 'Manage'} →
        </button>
      </div>
      <div className="space-y-3">
        {matches.slice(0, 3).map((match) => (
          <div 
            key={match._id} 
            className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-all cursor-pointer"
            onClick={() => router.push('/player/matches')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-parque-purple to-purple-700 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {match.round}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {match.opponent}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {match.scheduled ? (
                  <>
                    <p className="font-medium text-green-600">
                      {language === 'es' ? 'Confirmado' : 'Confirmed'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {match.date}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                      {language === 'es' ? 'Por programar' : 'To schedule'}
                    </span>
                    <button className="text-xs text-parque-purple hover:text-purple-700 font-medium">
                      {language === 'es' ? 'Contactar →' : 'Contact →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {matches.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/player/matches')}
            className="text-sm text-parque-purple hover:text-purple-700 font-medium"
          >
            {language === 'es' 
              ? `Ver ${matches.length - 3} más` 
              : `View ${matches.length - 3} more`}
          </button>
        </div>
      )}
    </div>
  )
}
