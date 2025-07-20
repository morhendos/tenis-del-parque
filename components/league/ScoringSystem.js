// Scoring System Component
export default function ScoringSystem({ language, totalPlayers, currentRound }) {
  return (
    <div className="mt-8 text-center">
      {/* Enhanced league stats */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-parque-purple/10 flex items-center justify-center">
            <span className="text-parque-purple font-bold">👥</span>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{totalPlayers}</div>
            <div className="text-xs text-gray-500">
              {language === 'es' ? 'jugadores' : 'players'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">🎯</span>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{currentRound || 0}</div>
            <div className="text-xs text-gray-500">
              {language === 'es' ? 'ronda actual' : 'current round'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced scoring system */}
      <div className="bg-gradient-to-r from-parque-bg to-white rounded-lg p-4 border border-parque-purple/20">
        <div className="text-xs font-semibold text-parque-purple mb-2">
          {language === 'es' ? 'Sistema de Puntuación' : 'Scoring System'}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-gray-600">
              {language === 'es' ? 'Victoria 2-0' : 'Win 2-0'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-gray-600">
              {language === 'es' ? 'Victoria 2-1' : 'Win 2-1'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-gray-600">
              {language === 'es' ? 'Derrota 1-2' : 'Loss 1-2'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">0</div>
            <span className="text-gray-600">
              {language === 'es' ? 'Derrota 0-2' : 'Loss 0-2'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}