// Helper function for date formatting
const formatDate = (date, language) => {
  return new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export function RecentMatches({ matches, language }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-in-left" style={{ animationDelay: '0.6s' }}>
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-xl mr-2">📋</span>
          {language === 'es' ? 'Partidos Recientes' : 'Recent Matches'}
        </h3>
      </div>
      <div className="p-6">
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.slice(0, 3).map((match, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    match.result === 'won' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-red-500 to-pink-600'
                  }`}>
                    <span className="text-white text-lg">
                      {match.result === 'won' ? '✓' : '✗'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">vs {match.opponent}</p>
                    <p className="text-sm text-gray-600">{formatDate(match.date, language)}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  match.result === 'won' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {match.result === 'won' 
                    ? (language === 'es' ? 'Victoria' : 'Won')
                    : (language === 'es' ? 'Derrota' : 'Lost')
                  }
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 animate-bounce">🎾</div>
            <p className="text-gray-500">
              {language === 'es' 
                ? 'No hay partidos recientes'
                : 'No recent matches'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function UpcomingMatches({ matches, language }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-in-right" style={{ animationDelay: '0.7s' }}>
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-xl mr-2">📅</span>
          {language === 'es' ? 'Próximos Partidos' : 'Upcoming Matches'}
        </h3>
      </div>
      <div className="p-6">
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.slice(0, 3).map((match, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📅</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">vs {match.opponent}</p>
                    <p className="text-sm text-gray-600">{formatDate(match.date, language)}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {language === 'es' ? 'Programado' : 'Scheduled'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-gray-500">
              {language === 'es' 
                ? 'No hay partidos programados'
                : 'No upcoming matches'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 