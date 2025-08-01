import { useState } from 'react'

export default function PlatformPreviewSection({ content, mockData, language }) {
  const [activePreview, setActivePreview] = useState(0)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [hoveredPlayer, setHoveredPlayer] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState('Rafael M.')

  const handleTabChange = (index) => {
    setActivePreview(index)
  }

  const PlayerCard = ({ player }) => {
    if (!hoveredPlayer || hoveredPlayer !== player) return null
    
    return (
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-2xl z-50 min-w-64 animate-fadeIn">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-parque-purple to-parque-purple/70 rounded-xl flex items-center justify-center text-white font-medium">
            {player.charAt(0)}
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{player}</h4>
            <p className="text-sm text-gray-500">Intermediate Player</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-parque-purple font-medium">1247</p>
            <p className="text-gray-500 text-xs">Current Elo</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-parque-green font-medium">12</p>
            <p className="text-gray-500 text-xs">Matches Won</p>
          </div>
        </div>
      </div>
    )
  }

  const renderPreviewContent = () => {
    const activeTab = content.tabs[activePreview].id
    
    switch (activeTab) {
      case 'standings':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-2 text-gray-600 font-medium">{language === 'es' ? 'Pos.' : 'Pos.'}</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-medium">{language === 'es' ? 'Jugador' : 'Player'}</th>
                  <th className="text-center py-4 px-4 text-gray-600 font-medium">{language === 'es' ? 'Pts' : 'Pts'}</th>
                  <th className="text-center py-4 px-4 text-gray-600 font-medium">{language === 'es' ? 'J' : 'P'}</th>
                  <th className="text-center py-4 px-4 text-gray-600 font-medium">{language === 'es' ? 'G' : 'W'}</th>
                  <th className="text-center py-4 px-4 text-gray-600 font-medium">{language === 'es' ? 'P' : 'L'}</th>
                  <th className="text-center py-4 px-4 text-gray-600 font-medium">Sets</th>
                  <th className="text-center py-4 px-4 text-gray-600 font-medium">WR%</th>
                  <th className="text-center py-4 px-4 text-gray-600 font-medium">{language === 'es' ? 'Forma' : 'Form'}</th>
                </tr>
              </thead>
              <tbody>
                {mockData.standings.map((player, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-parque-purple/5 hover:to-transparent transition-all duration-300">
                    <td className="py-4 px-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm ${
                        player.position <= 3 
                          ? 'bg-gradient-to-br from-parque-purple to-parque-purple/70 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {player.position}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative">
                        <span className="font-medium text-gray-800 cursor-pointer hover:text-parque-purple transition-colors"
                              onMouseEnter={() => setHoveredPlayer(player.name)}
                              onMouseLeave={() => setHoveredPlayer(null)}>
                          {player.name}
                        </span>
                        <PlayerCard player={player.name} />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold text-parque-purple text-lg">{player.points}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{player.played}</td>
                    <td className="py-4 px-4 text-center text-green-600 font-medium">{player.wins}</td>
                    <td className="py-4 px-4 text-center text-red-500">{player.losses}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-700 font-mono text-sm">{player.sets}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-parque-green to-parque-green/80 h-2 rounded-full transition-all duration-500" 
                            style={{width: player.winRate}}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">{player.winRate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex space-x-1 justify-center">
                        {player.form.split('').map((result, formIndex) => (
                          <div key={formIndex} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            result === 'W' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {result}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      
      case 'rankings':
        return (
          <div className="space-y-3">
            {mockData.rankings.map((player, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-medium transform transition-all duration-300 ${
                      player.position <= 3 
                        ? 'bg-gradient-to-br from-parque-purple to-parque-purple/70 text-white shadow-lg scale-110' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {player.position}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-lg cursor-pointer hover:text-parque-purple transition-colors relative"
                          onMouseEnter={() => setHoveredPlayer(player.name)}
                          onMouseLeave={() => setHoveredPlayer(null)}>
                        {player.name}
                        <PlayerCard player={player.name} />
                      </h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-gray-500">Elo: <span className="font-medium text-gray-700">{player.elo}</span></p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-400">{language === 'es' ? 'Máx:' : 'Peak:'} {player.peakElo}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`text-lg font-medium flex items-center space-x-1 ${
                        player.trend === 'up' ? 'text-green-600' : player.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        <span>{player.change}</span>
                        {player.trend === 'up' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        )}
                        {player.trend === 'down' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{player.matches} {language === 'es' ? 'partidos' : 'matches'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'results': 
        return (
          <div className="space-y-4">
            {mockData.results.map((match, index) => (
              <div key={index} 
                   className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group"
                   onClick={() => setSelectedMatch(match)}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{match.date}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{match.duration}</span>
                  </div>
                  <span className="text-sm text-parque-purple font-medium flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{match.court}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-lg mb-1">{match.player1}</p>
                    <p className="text-gray-600">{match.player2}</p>
                  </div>
                  <div className="px-8 py-4 bg-gradient-to-br from-parque-purple/10 to-parque-purple/5 rounded-2xl border border-parque-purple/20 group-hover:from-parque-purple/20 group-hover:to-parque-purple/10 transition-all">
                    <p className="font-semibold text-parque-purple text-center text-lg">{match.score}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>{language === 'es' ? 'Aces:' : 'Aces:'} {match.aces.p1} - {match.aces.p2}</span>
                  <span>{language === 'es' ? 'Winners:' : 'Winners:'} {match.winners.p1} - {match.winners.p2}</span>
                </div>
              </div>
            ))}
          </div>
        )

      case 'upcoming':
        return (
          <div className="space-y-4">
            {mockData.upcoming.map((match, index) => (
              <div key={index} className="bg-gradient-to-r from-parque-purple/5 to-parque-green/5 rounded-2xl p-6 border border-parque-purple/20 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] hover:border-parque-purple/40">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-parque-purple bg-parque-purple/10 px-3 py-1 rounded-full">
                    {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{language === 'es' ? 'Fecha límite:' : 'Deadline:'} {match.deadline}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-gray-800 text-lg mb-1">{match.player1}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">H2H: {match.headToHead}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-light text-gray-400">vs</span>
                    <span className="text-xs text-gray-400 mt-2">{language === 'es' ? 'Último:' : 'Last:'} {match.lastMeeting}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-800 text-lg mb-1">{match.player2}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <button className="bg-parque-purple/10 text-parque-purple px-3 py-1 rounded-full hover:bg-parque-purple/20 transition-colors">
                        {language === 'es' ? 'Contactar' : 'Contact'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'statistics':
        // Player Statistics View
        return (
          <div className="space-y-6">
            {/* Player Selector */}
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-light text-gray-800">
                {language === 'es' ? 'Estadísticas del Jugador' : 'Player Statistics'}
              </h4>
              <select 
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-parque-purple"
              >
                {mockData.standings.map((player) => (
                  <option key={player.name} value={player.name}>{player.name}</option>
                ))}
              </select>
            </div>

            {/* Player Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-parque-purple/10 to-transparent rounded-2xl p-6 border border-parque-purple/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{language === 'es' ? 'Ranking ELO' : 'ELO Ranking'}</span>
                  <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-3xl font-light text-parque-purple">1452</p>
                <p className="text-xs text-gray-500 mt-1">+15 {language === 'es' ? 'esta semana' : 'this week'}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-transparent rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{language === 'es' ? 'Partidos Ganados' : 'Matches Won'}</span>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-light text-green-600">24</p>
                <p className="text-xs text-gray-500 mt-1">{language === 'es' ? 'de 32 partidos' : 'of 32 matches'}</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-transparent rounded-2xl p-6 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{language === 'es' ? 'Partidos Perdidos' : 'Matches Lost'}</span>
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-light text-red-600">8</p>
                <p className="text-xs text-gray-500 mt-1">75% {language === 'es' ? 'tasa de victoria' : 'win rate'}</p>
              </div>

              <div className="bg-gradient-to-br from-parque-yellow/10 to-transparent rounded-2xl p-6 border border-parque-yellow/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{language === 'es' ? 'Racha Actual' : 'Current Streak'}</span>
                  <svg className="w-5 h-5 text-parque-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-3xl font-light text-parque-yellow">W4</p>
                <p className="text-xs text-gray-500 mt-1">{language === 'es' ? '4 victorias seguidas' : '4 wins in a row'}</p>
              </div>
            </div>

            {/* Recent Performance */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h5 className="text-lg font-medium text-gray-800 mb-4">
                {language === 'es' ? 'Rendimiento Reciente' : 'Recent Performance'}
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-medium">W</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">vs James W.</p>
                      <p className="text-sm text-gray-500">6-4, 6-3</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">22 Jun</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-medium">W</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">vs María L.</p>
                      <p className="text-sm text-gray-500">7-5, 6-2</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">15 Jun</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-700 font-medium">L</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">vs Rafael M.</p>
                      <p className="text-sm text-gray-500">4-6, 5-7</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">8 Jun</span>
                </div>
              </div>
            </div>

            {/* Head to Head Records */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h5 className="text-lg font-medium text-gray-800 mb-4">
                {language === 'es' ? 'Cara a Cara' : 'Head to Head'}
              </h5>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-700">vs Rafael M.</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-600">0-3</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '0%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-700">vs Ana G.</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">2-1</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '66%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'bracket':
        return (
          <div className="overflow-x-auto pb-8">
            <div className="min-w-[1000px] p-8">
              {/* Tournament Title */}
              <div className="text-center mb-8">
                <h4 className="text-2xl font-light text-parque-purple mb-2">
                  {language === 'es' ? 'Cuadro de Playoffs' : 'Playoff Bracket'}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === 'es' ? 'Top 8 jugadores clasificados' : 'Top 8 qualified players'}
                </p>
              </div>

              <div className="relative">
                {/* SVG for connecting lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 1}}>
                  {/* Quarterfinals to Semifinals connections */}
                  <path d="M 280 100 L 320 100 L 320 175 L 360 175" stroke="#e5e7eb" strokeWidth="2" fill="none" />
                  <path d="M 280 200 L 320 200 L 320 175 L 360 175" stroke="#e5e7eb" strokeWidth="2" fill="none" />
                  <path d="M 280 350 L 320 350 L 320 425 L 360 425" stroke="#e5e7eb" strokeWidth="2" fill="none" />
                  <path d="M 280 450 L 320 450 L 320 425 L 360 425" stroke="#e5e7eb" strokeWidth="2" fill="none" />
                  
                  {/* Semifinals to Final connections */}
                  <path d="M 600 175 L 640 175 L 640 300 L 680 300" stroke="#e5e7eb" strokeWidth="2" fill="none" />
                  <path d="M 600 425 L 640 425 L 640 300 L 680 300" stroke="#e5e7eb" strokeWidth="2" fill="none" />
                </svg>

                <div className="flex justify-between items-start relative" style={{zIndex: 2}}>
                  {/* Quarterfinals */}
                  <div className="flex-1 max-w-[280px]">
                    <h5 className="text-center font-medium text-parque-purple mb-6 text-lg">
                      {language === 'es' ? 'Cuartos de Final' : 'Quarterfinals'}
                    </h5>
                    <div className="space-y-6">
                      {mockData.bracket[0].matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:border-parque-purple/50 transition-all duration-300 transform hover:scale-105">
                          <div className="bg-gradient-to-r from-parque-purple/10 to-parque-purple/5 px-4 py-2 text-center">
                            <span className="text-xs font-medium text-parque-purple">
                              {language === 'es' ? `Partido ${matchIndex + 1}` : `Match ${matchIndex + 1}`}
                            </span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                              match.winner === match.p1 ? 'bg-green-50 ring-2 ring-green-200' : 'bg-gray-50'
                            }`}>
                              <span className={`font-medium ${match.winner === match.p1 ? 'text-green-700' : 'text-gray-600'}`}>
                                {match.p1}
                              </span>
                              {match.winner === match.p1 && (
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="h-px bg-gray-200"></div>
                            <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                              match.winner === match.p2 ? 'bg-green-50 ring-2 ring-green-200' : 'bg-gray-50'
                            }`}>
                              <span className={`font-medium ${match.winner === match.p2 ? 'text-green-700' : 'text-gray-600'}`}>
                                {match.p2}
                              </span>
                              {match.winner === match.p2 && (
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Semifinals */}
                  <div className="flex-1 max-w-[280px] mx-8">
                    <h5 className="text-center font-medium text-parque-purple mb-6 text-lg">
                      {language === 'es' ? 'Semifinales' : 'Semifinals'}
                    </h5>
                    <div className="space-y-32 mt-20">
                      {mockData.bracket[1].matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:border-parque-purple/50 transition-all duration-300 transform hover:scale-105">
                          <div className="bg-gradient-to-r from-parque-purple/10 to-parque-purple/5 px-4 py-2 text-center">
                            <span className="text-xs font-medium text-parque-purple">
                              {language === 'es' ? `Semifinal ${matchIndex + 1}` : `Semifinal ${matchIndex + 1}`}
                            </span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                              match.winner === match.p1 ? 'bg-green-50 ring-2 ring-green-200' : 'bg-gray-50'
                            }`}>
                              <span className={`font-medium ${match.winner === match.p1 ? 'text-green-700' : 'text-gray-600'}`}>
                                {match.p1}
                              </span>
                              {match.winner === match.p1 && (
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="h-px bg-gray-200"></div>
                            <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                              match.winner === match.p2 ? 'bg-green-50 ring-2 ring-green-200' : 'bg-gray-50'
                            }`}>
                              <span className={`font-medium ${match.winner === match.p2 ? 'text-green-700' : 'text-gray-600'}`}>
                                {match.p2}
                              </span>
                              {match.winner === match.p2 && (
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final */}
                  <div className="flex-1 max-w-[280px]">
                    <h5 className="text-center font-medium text-parque-purple mb-6 text-lg">
                      {language === 'es' ? 'Final' : 'Final'}
                    </h5>
                    <div className="mt-52">
                      {mockData.bracket[2].matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="bg-gradient-to-br from-parque-yellow/20 to-parque-yellow/10 rounded-2xl shadow-xl border-2 border-parque-yellow/30 overflow-hidden hover:border-parque-yellow/50 transition-all duration-300 transform hover:scale-105">
                          <div className="bg-gradient-to-r from-parque-yellow/30 to-parque-yellow/20 px-4 py-3 text-center">
                            <span className="text-sm font-medium text-gray-800">
                              🏆 {language === 'es' ? 'Gran Final' : 'Grand Final'} 🏆
                            </span>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                              match.winner === match.p1 ? 'bg-green-50 ring-2 ring-green-300' : 'bg-white/70'
                            }`}>
                              <span className={`font-semibold text-lg ${match.winner === match.p1 ? 'text-green-700' : 'text-gray-700'}`}>
                                {match.p1}
                              </span>
                              {match.winner === match.p1 && (
                                <span className="text-2xl">🏆</span>
                              )}
                            </div>
                            <div className="relative">
                              <div className="h-px bg-gray-300"></div>
                              <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-gray-400 font-light text-2xl">VS</span>
                            </div>
                            <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                              match.winner === match.p2 ? 'bg-green-50 ring-2 ring-green-300' : 'bg-white/70'
                            }`}>
                              <span className={`font-semibold text-lg ${match.winner === match.p2 ? 'text-green-700' : 'text-gray-700'}`}>
                                {match.p2}
                              </span>
                              {match.winner === match.p2 && (
                                <span className="text-2xl">🏆</span>
                              )}
                            </div>
                          </div>
                          {!match.winner && (
                            <div className="bg-parque-purple/10 px-4 py-3 text-center">
                              <span className="text-sm text-parque-purple font-medium">
                                {language === 'es' ? 'Pendiente' : 'Pending'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-12 flex justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">{language === 'es' ? 'Ganador' : 'Winner'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">{language === 'es' ? 'Eliminado' : 'Eliminated'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-parque-yellow/20 rounded"></div>
                  <span className="text-gray-600">{language === 'es' ? 'Final' : 'Final'}</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-white/70 to-transparent">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-parque-yellow/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-parque-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">{content.subtitle}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-12 gap-3">
            {content.tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(index)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform ${
                  activePreview === index
                    ? 'bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white shadow-lg scale-105'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md hover:scale-105'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Preview Content */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 animate-fadeIn min-h-[500px]">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-light text-parque-purple">
                {content.tabs[activePreview].name}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">{language === 'es' ? 'En vivo' : 'Live'}</span>
              </div>
            </div>
            
            {renderPreviewContent()}
          </div>
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMatch(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-light text-parque-purple">{language === 'es' ? 'Detalles del partido' : 'Match Details'}</h3>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <p className="text-2xl font-medium text-gray-800 mb-2">{selectedMatch.player1}</p>
                  <p className="text-4xl font-light text-parque-purple">{selectedMatch.aces.p1}</p>
                  <p className="text-sm text-gray-500 mt-1">Aces</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-light text-gray-400 mb-2">vs</p>
                  <p className="text-2xl font-medium text-parque-purple">{selectedMatch.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-medium text-gray-800 mb-2">{selectedMatch.player2}</p>
                  <p className="text-4xl font-light text-parque-purple">{selectedMatch.aces.p2}</p>
                  <p className="text-sm text-gray-500 mt-1">Aces</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-parque-purple/5 rounded-xl p-4">
                  <p className="text-2xl font-light text-parque-purple">{selectedMatch.winners.p1}</p>
                  <p className="text-sm text-gray-600">Winners</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-lg font-medium text-gray-800">{selectedMatch.duration}</p>
                  <p className="text-sm text-gray-600">{language === 'es' ? 'Duración' : 'Duration'}</p>
                </div>
                <div className="bg-parque-purple/5 rounded-xl p-4">
                  <p className="text-2xl font-light text-parque-purple">{selectedMatch.winners.p2}</p>
                  <p className="text-sm text-gray-600">Winners</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
                <span>{selectedMatch.date}</span>
                <span>{selectedMatch.court}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}