'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../../lib/hooks/useLanguage'

export default function PlayerMatches() {
  const { language } = useLanguage()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, upcoming, completed, scheduled
  const [player, setPlayer] = useState(null)
  const [leaguePlayers, setLeaguePlayers] = useState([])
  const [showPlayers, setShowPlayers] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [resultForm, setResultForm] = useState({ myScore: '', opponentScore: '' })
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    venue: '',
    court: '',
    notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    fetchMatches()
    fetchPlayerData()
  }, [])

  const fetchLeaguePlayers = async () => {
    if (!player?.league?._id) return
    
    try {
      // For now, we'll extract players from matches - later we can create a dedicated API
      const allPlayers = new Map()
      
      matches.forEach(match => {
        if (match.players.player1 && match.players.player1._id !== player._id) {
          allPlayers.set(match.players.player1._id, match.players.player1)
        }
        if (match.players.player2 && match.players.player2._id !== player._id) {
          allPlayers.set(match.players.player2._id, match.players.player2)
        }
      })
      
      setLeaguePlayers(Array.from(allPlayers.values()))
    } catch (error) {
      console.error('Error fetching league players:', error)
    }
  }

  useEffect(() => {
    if (matches.length > 0 && player) {
      fetchLeaguePlayers()
    }
  }, [matches, player])

  const fetchPlayerData = async () => {
    try {
      const response = await fetch('/api/player/profile')
      if (response.ok) {
        const data = await response.json()
        setPlayer(data.player)
      }
    } catch (error) {
      console.error('Error fetching player data:', error)
    }
  }

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/player/matches')
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitResult = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/player/matches/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch._id,
          myScore: parseInt(resultForm.myScore),
          opponentScore: parseInt(resultForm.opponentScore)
        })
      })
      
      if (response.ok) {
        setShowResultModal(false)
        setResultForm({ myScore: '', opponentScore: '' })
        fetchMatches()
      }
    } catch (error) {
      console.error('Error submitting result:', error)
    }
  }

  const handleScheduleMatch = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/player/matches/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch._id,
          ...scheduleForm
        })
      })
      
      if (response.ok) {
        setShowScheduleModal(false)
        setScheduleForm({ date: '', time: '', venue: '', court: '', notes: '' })
        fetchMatches()
      }
    } catch (error) {
      console.error('Error scheduling match:', error)
    }
  }

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return match.status === 'scheduled' && (!match.result || !match.result.winner)
    if (filter === 'completed') return match.status === 'completed' || (match.result && match.result.winner)
    if (filter === 'scheduled') return match.status === 'scheduled'
    return true
  })

  const getMatchResult = (match) => {
    if (!player) return null
    
    if (match.result && match.result.winner) {
      const won = match.result.winner === player._id
      return won ? 'won' : 'lost'
    }
    return null
  }

  const getOpponent = (match) => {
    if (!player) return null
    return match.players.player1._id === player._id 
      ? match.players.player2 
      : match.players.player1
  }

  const formatScore = (match) => {
    if (!match.result || !match.result.score || !match.result.score.sets) {
      return 'Score not available'
    }
    
    return match.result.score.sets.map((set, index) => 
      `${set.player1}-${set.player2}`
    ).join(', ')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (match) => {
    const result = getMatchResult(match)
    
    if (result === 'won') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          ✓ Won
        </span>
      )
    } else if (result === 'lost') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          ✗ Lost
        </span>
      )
    } else if (match.status === 'scheduled') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          📅 Scheduled
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          ⏳ Pending
        </span>
      )
    }
  }

  const upcomingMatches = matches.filter(m => m.status === 'scheduled' && !m.result)
  const completedMatches = matches.filter(m => m.result)

  const tabs = [
    { id: 'upcoming', label: language === 'es' ? 'Próximos' : 'Upcoming', count: upcomingMatches.length },
    { id: 'completed', label: language === 'es' ? 'Completados' : 'Completed', count: completedMatches.length }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'es' ? 'Cargando partidos...' : 'Loading matches...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={fetchMatches}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Matches</h1>
          <p className="mt-2 text-gray-600">
            Track your tennis journey and match history
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => router.push('/player/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-parque-purple text-parque-purple'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-parque-purple/10 text-parque-purple'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Matches List */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <div key={match._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-parque-purple rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {match.round}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === 'es' ? 'vs' : 'vs'} {match.opponent?.name || 'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMatch(match)
                        setShowScheduleModal(true)
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      {language === 'es' ? 'Programar' : 'Schedule'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMatch(match)
                        setShowResultModal(true)
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      {language === 'es' ? 'Resultado' : 'Result'}
                    </button>
                  </div>
                </div>
                
                {match.schedule && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {match.schedule.date}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'es' ? 'Fecha' : 'Date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏟️</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {match.schedule.venue}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'es' ? 'Lugar' : 'Venue'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🎾</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {match.schedule.court}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'es' ? 'Cancha' : 'Court'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎾</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'es' ? 'No hay partidos programados' : 'No scheduled matches'}
              </h3>
              <p className="text-gray-500">
                {language === 'es' 
                  ? 'Los nuevos emparejamientos se crean cada domingo'
                  : 'New pairings are created every Sunday'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedMatches.length > 0 ? (
            completedMatches.map((match) => (
              <div key={match._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {match.round}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === 'es' ? 'vs' : 'vs'} {match.opponent?.name || 'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {match.result.myScore} - {match.result.opponentScore}
                    </div>
                    <div className={`text-sm font-medium ${
                      match.result.myScore > match.result.opponentScore 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {match.result.myScore > match.result.opponentScore 
                        ? (language === 'es' ? 'Victoria' : 'Win')
                        : (language === 'es' ? 'Derrota' : 'Loss')
                      }
                    </div>
                  </div>
                </div>
                
                {match.schedule && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {match.schedule.date}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'es' ? 'Fecha' : 'Date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏟️</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {match.schedule.venue}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'es' ? 'Lugar' : 'Venue'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🎾</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {match.schedule.court}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'es' ? 'Cancha' : 'Court'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'es' ? 'No hay partidos completados' : 'No completed matches'}
              </h3>
              <p className="text-gray-500">
                {language === 'es' 
                  ? 'Los partidos completados aparecerán aquí'
                  : 'Completed matches will appear here'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* League Players */}
      {leaguePlayers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">League Players</h3>
            <button
              onClick={() => setShowPlayers(!showPlayers)}
              className="text-sm text-parque-purple hover:text-parque-purple/80 font-medium"
            >
              {showPlayers ? 'Hide' : 'Show'} ({leaguePlayers.length})
            </button>
          </div>
          {showPlayers && (
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Contact other players for practice matches or to schedule your league games
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leaguePlayers.map((opponent) => (
                  <div key={opponent._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-parque-purple rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {opponent.name ? opponent.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {opponent.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          ELO: {opponent.stats?.eloRating || 1200}
                        </p>
                      </div>
                    </div>
                    {opponent.whatsapp && (
                      <div className="mt-3">
                        <a
                          href={`https://wa.me/${opponent.whatsapp.replace(/[\s\-\(\)]/g, '')}?text=Hi ${opponent.name}! I'm also in the tennis league. Would you like to play a practice match or schedule our league game?`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"/>
                          </svg>
                          Contact
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {matches.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
              <div className="text-sm text-gray-500">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {matches.filter(m => getMatchResult(m) === 'won').length}
              </div>
              <div className="text-sm text-gray-500">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {matches.filter(m => getMatchResult(m) === 'lost').length}
              </div>
              <div className="text-sm text-gray-500">Losses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {matches.filter(m => m.status === 'scheduled' && !getMatchResult(m)).length}
              </div>
              <div className="text-sm text-gray-500">Upcoming</div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'es' ? 'Reportar Resultado' : 'Report Result'}
            </h2>
            <form onSubmit={handleSubmitResult} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Mi Puntuación (Sets)' : 'My Score (Sets)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={resultForm.myScore}
                  onChange={(e) => setResultForm({...resultForm, myScore: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Puntuación del Oponente (Sets)' : 'Opponent Score (Sets)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={resultForm.opponentScore}
                  onChange={(e) => setResultForm({...resultForm, opponentScore: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {language === 'es' ? 'Reportar' : 'Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'es' ? 'Programar Partido' : 'Schedule Match'}
            </h2>
            <form onSubmit={handleScheduleMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Fecha' : 'Date'}
                </label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Hora' : 'Time'}
                </label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Lugar' : 'Venue'}
                </label>
                <input
                  type="text"
                  value={scheduleForm.venue}
                  onChange={(e) => setScheduleForm({...scheduleForm, venue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  placeholder={language === 'es' ? 'Ej: Club Deportivo' : 'Ex: Sports Club'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Cancha' : 'Court'}
                </label>
                <input
                  type="text"
                  value={scheduleForm.court}
                  onChange={(e) => setScheduleForm({...scheduleForm, court: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  placeholder={language === 'es' ? 'Ej: Cancha 1' : 'Ex: Court 1'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Notas' : 'Notes'}
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  rows="3"
                  placeholder={language === 'es' ? 'Información adicional...' : 'Additional information...'}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {language === 'es' ? 'Programar' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 