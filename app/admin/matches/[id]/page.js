'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function MatchDetailPage() {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditingResult, setIsEditingResult] = useState(false)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [resultForm, setResultForm] = useState({
    sets: [{ player1: '', player2: '' }],
    winner: '',
    walkover: false,
    retiredPlayer: ''
  })
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    court: ''
  })
  
  const router = useRouter()
  const params = useParams()
  const matchId = params.id

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/check')
      if (!res.ok) {
        router.push('/admin')
      }
    } catch (error) {
      router.push('/admin')
    }
  }, [router])

  const fetchMatch = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/matches/${matchId}`)
      if (!res.ok) throw new Error('Failed to fetch match')
      
      const data = await res.json()
      setMatch(data.match)
      
      // Initialize forms with existing data
      if (data.match.result) {
        setResultForm({
          sets: data.match.result.score?.sets || [{ player1: '', player2: '' }],
          winner: data.match.result.winner || '',
          walkover: data.match.result.score?.walkover || false,
          retiredPlayer: data.match.result.score?.retiredPlayer || ''
        })
      }

      // Initialize schedule form
      const scheduleDate = data.match.schedule?.confirmedDate
      if (scheduleDate) {
        const date = new Date(scheduleDate)
        setScheduleForm({
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().slice(0, 5),
          court: data.match.schedule?.court || ''
        })
      } else {
        setScheduleForm({
          date: '',
          time: '',
          court: data.match.schedule?.court || ''
        })
      }
    } catch (error) {
      console.error('Error fetching match:', error)
      setError('Error loading match')
    } finally {
      setLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    checkAuth()
    fetchMatch()
  }, [checkAuth, fetchMatch])

  const handleAddSet = () => {
    setResultForm({
      ...resultForm,
      sets: [...resultForm.sets, { player1: '', player2: '' }]
    })
  }

  const handleRemoveSet = (index) => {
    const newSets = resultForm.sets.filter((_, i) => i !== index)
    setResultForm({
      ...resultForm,
      sets: newSets.length > 0 ? newSets : [{ player1: '', player2: '' }]
    })
  }

  const handleSetChange = (index, player, value) => {
    const newSets = [...resultForm.sets]
    newSets[index][player] = value
    setResultForm({ ...resultForm, sets: newSets })
    
    // Auto-determine winner if all sets are filled
    if (value !== '') {
      const completeSets = newSets.filter(set => set.player1 !== '' && set.player2 !== '')
      if (completeSets.length >= 2) {
        const player1Wins = completeSets.filter(set => parseInt(set.player1) > parseInt(set.player2)).length
        const player2Wins = completeSets.filter(set => parseInt(set.player2) > parseInt(set.player1)).length
        
        if (player1Wins > player2Wins) {
          setResultForm(prev => ({ ...prev, winner: match.players.player1._id }))
        } else if (player2Wins > player1Wins) {
          setResultForm(prev => ({ ...prev, winner: match.players.player2._id }))
        }
      }
    }
  }

  const handleSubmitResult = async () => {
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      // Validate form
      if (!resultForm.winner) {
        throw new Error('Please select a winner')
      }

      // Prepare result data
      const result = {
        winner: resultForm.winner,
        score: {
          sets: resultForm.sets.filter(set => set.player1 !== '' && set.player2 !== ''),
          walkover: resultForm.walkover
        }
      }

      if (resultForm.retiredPlayer) {
        result.score.retiredPlayer = resultForm.retiredPlayer
      }

      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update match')
      }

      setSuccess('Match result saved successfully!')
      // Refresh match data
      await fetchMatch()
      setIsEditingResult(false)
    } catch (error) {
      console.error('Error submitting result:', error)
      setError(error.message || 'Failed to submit result')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitSchedule = async () => {
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const scheduledDate = scheduleForm.date && scheduleForm.time 
        ? new Date(`${scheduleForm.date}T${scheduleForm.time}`)
        : null

      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          schedule: {
            confirmedDate: scheduledDate,
            court: scheduleForm.court
          }
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update schedule')
      }

      setSuccess('Schedule updated successfully!')
      await fetchMatch()
      setIsEditingSchedule(false)
    } catch (error) {
      console.error('Error updating schedule:', error)
      setError(error.message || 'Failed to update schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const getPlayerAvatar = (playerName) => {
    const initials = playerName.split(' ').map(n => n[0]).join('').toUpperCase()
    return (
      <div className="w-16 h-16 bg-gradient-to-br from-parque-purple to-parque-green rounded-full flex items-center justify-center text-white font-bold text-lg">
        {initials}
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'postponed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'schedule', name: 'Schedule', icon: '📅' },
    { id: 'result', name: 'Result', icon: '🎾' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading match details...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎾</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Match not found</h2>
          <p className="text-gray-600 mb-4">The match you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push(`/admin/matches?league=${match.league._id}`)}
              className="flex items-center text-gray-600 hover:text-parque-purple transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Matches
            </button>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(match.status)}`}>
              {match.status.toUpperCase()}
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Round {match.round}</h1>
            <p className="text-gray-600">{match.league?.name || 'Unknown League'}</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Players Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-parque-purple to-parque-green p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Player 1 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  {getPlayerAvatar(match.players.player1.name)}
                  <h3 className="text-xl font-bold mt-3 mb-1">{match.players.player1.name}</h3>
                  <div className="flex items-center space-x-2 text-sm opacity-90">
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                      {match.players.player1.level}
                    </span>
                    <span>ELO: {match.players.player1.stats?.eloRating || 1200}</span>
                  </div>
                </div>
              </div>

              {/* VS/Score Section */}
              <div className="text-center">
                {match.status === 'completed' && match.result ? (
                  <div className="space-y-3">
                    {/* Simple Completed Match Display */}
                    <div className="text-sm opacity-90 font-medium">MATCH COMPLETED</div>
                    <div className="text-4xl font-bold opacity-80">
                      {(() => {
                        const player1Sets = match.result.score?.sets?.filter(set => 
                          parseInt(set.player1) > parseInt(set.player2)
                        ).length || 0
                        const player2Sets = match.result.score?.sets?.filter(set => 
                          parseInt(set.player2) > parseInt(set.player1)
                        ).length || 0
                        return `${player1Sets} - ${player2Sets}`
                      })()}
                    </div>
                    
                    {/* Special cases */}
                    {match.result.score?.walkover && (
                      <div className="text-sm bg-yellow-500 bg-opacity-20 rounded-full px-3 py-1">
                        WALKOVER
                      </div>
                    )}
                    {match.result.score?.retiredPlayer && (
                      <div className="text-sm bg-yellow-500 bg-opacity-20 rounded-full px-3 py-1">
                        RETIREMENT
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-4xl font-bold opacity-80">VS</div>
                    {match.status === 'scheduled' && match.schedule?.confirmedDate && (
                      <div className="bg-white bg-opacity-10 rounded-lg p-3">
                        <div className="text-sm opacity-75 font-medium mb-1">SCHEDULED FOR</div>
                        <div className="text-lg font-semibold">
                          {new Date(match.schedule.confirmedDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm opacity-90">
                          {new Date(match.schedule.confirmedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {match.schedule.court && ` • ${match.schedule.court}`}
                        </div>
                      </div>
                    )}
                    {match.status === 'scheduled' && !match.schedule?.confirmedDate && (
                      <div className="bg-white bg-opacity-10 rounded-lg p-3">
                        <div className="text-sm opacity-75 font-medium">AWAITING SCHEDULE</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Player 2 */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  {getPlayerAvatar(match.players.player2.name)}
                  <h3 className="text-xl font-bold mt-3 mb-1">{match.players.player2.name}</h3>
                  <div className="flex items-center space-x-2 text-sm opacity-90">
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                      {match.players.player2.level}
                    </span>
                    <span>ELO: {match.players.player2.stats?.eloRating || 1200}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Result Banner */}
          {match.status === 'completed' && match.result?.winner && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-6 py-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <span className="text-lg font-bold text-green-800">
                    {match.result.winner === match.players.player1._id 
                      ? match.players.player1.name 
                      : match.players.player2.name} WINS!
                  </span>
                  <span className="text-2xl">🏆</span>
                </div>
                
                {/* Detailed Score Summary */}
                {match.result.score?.sets && match.result.score.sets.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-green-700">
                      Sets Won: {(() => {
                        const player1Sets = match.result.score.sets.filter(set => 
                          parseInt(set.player1) > parseInt(set.player2)
                        ).length
                        const player2Sets = match.result.score.sets.filter(set => 
                          parseInt(set.player2) > parseInt(set.player1)
                        ).length
                        return match.result.winner === match.players.player1._id 
                          ? `${player1Sets}-${player2Sets}` 
                          : `${player2Sets}-${player1Sets}`
                      })()}
                    </div>
                    
                    {/* Exact Score Display */}
                    <div className="flex justify-center">
                      <div className="bg-white bg-opacity-50 rounded-lg p-3 max-w-sm">
                        <div className="text-sm text-green-800 font-medium mb-2 text-center">Match Score:</div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center font-semibold">{match.players.player1.name.split(' ')[0]}</div>
                          <div className="text-center">vs</div>
                          <div className="text-center font-semibold">{match.players.player2.name.split(' ')[0]}</div>
                          {match.result.score.sets.map((set, index) => (
                            <React.Fragment key={index}>
                              <div className={`text-center font-bold ${
                                parseInt(set.player1) > parseInt(set.player2) ? 'text-green-700' : 'text-green-600'
                              }`}>
                                {set.player1}
                              </div>
                              <div className="text-center text-green-600">-</div>
                              <div className={`text-center font-bold ${
                                parseInt(set.player2) > parseInt(set.player1) ? 'text-green-700' : 'text-green-600'
                              }`}>
                                {set.player2}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Match details */}
                <div className="flex items-center justify-center space-x-4 text-xs text-green-600">
                  {match.result.playedAt && (
                    <>
                      <span>📅 {new Date(match.result.playedAt).toLocaleDateString()}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>Round {match.round}</span>
                  {match.result.score?.walkover && (
                    <>
                      <span>•</span>
                      <span className="font-medium">WALKOVER</span>
                    </>
                  )}
                  {match.result.score?.retiredPlayer && (
                    <>
                      <span>•</span>
                      <span className="font-medium">RETIREMENT</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-parque-purple text-parque-purple'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Player Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Player 1 Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{match.players.player1.name}</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Email:</dt>
                        <dd className="font-medium text-gray-900">{match.players.player1.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Phone:</dt>
                        <dd className="font-medium text-gray-900">{match.players.player1.whatsapp}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Level:</dt>
                        <dd className="font-medium text-gray-900 capitalize">{match.players.player1.level}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Current ELO:</dt>
                        <dd className="font-medium text-gray-900">{match.players.player1.stats?.eloRating || 1200}</dd>
                      </div>
                      {match.eloChanges?.player1 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">ELO Change:</dt>
                          <dd className={`font-medium ${
                            match.eloChanges.player1.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {match.eloChanges.player1.change > 0 ? '+' : ''}{match.eloChanges.player1.change}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Player 2 Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{match.players.player2.name}</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Email:</dt>
                        <dd className="font-medium text-gray-900">{match.players.player2.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Phone:</dt>
                        <dd className="font-medium text-gray-900">{match.players.player2.whatsapp}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Level:</dt>
                        <dd className="font-medium text-gray-900 capitalize">{match.players.player2.level}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Current ELO:</dt>
                        <dd className="font-medium text-gray-900">{match.players.player2.stats?.eloRating || 1200}</dd>
                      </div>
                      {match.eloChanges?.player2 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">ELO Change:</dt>
                          <dd className={`font-medium ${
                            match.eloChanges.player2.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {match.eloChanges.player2.change > 0 ? '+' : ''}{match.eloChanges.player2.change}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Match
                    </button>
                    <button
                      onClick={() => setActiveTab('result')}
                      className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Enter Result
                    </button>
                    <button
                      onClick={() => window.open(`mailto:${match.players.player1.email},${match.players.player2.email}?subject=Tennis Match - Round ${match.round}`)}
                      className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Match Schedule</h3>
                  {!isEditingSchedule && (
                    <button
                      onClick={() => setIsEditingSchedule(true)}
                      className="text-sm text-parque-purple hover:underline"
                    >
                      Edit Schedule
                    </button>
                  )}
                </div>

                {!isEditingSchedule ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-2xl mb-2">📅</div>
                        <p className="text-sm text-gray-600 mb-1">Date</p>
                        <p className="font-semibold text-gray-900">
                          {match.schedule?.confirmedDate
                            ? new Date(match.schedule.confirmedDate).toLocaleDateString()
                            : 'To be determined'}
                        </p>
                      </div>
                      <div>
                        <div className="text-2xl mb-2">⏰</div>
                        <p className="text-sm text-gray-600 mb-1">Time</p>
                        <p className="font-semibold text-gray-900">
                          {match.schedule?.confirmedDate
                            ? new Date(match.schedule.confirmedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'To be determined'}
                        </p>
                      </div>
                      <div>
                        <div className="text-2xl mb-2">🎾</div>
                        <p className="text-sm text-gray-600 mb-1">Court</p>
                        <p className="font-semibold text-gray-900">
                          {match.schedule?.court || 'To be assigned'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          value={scheduleForm.time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Court
                      </label>
                      <input
                        type="text"
                        value={scheduleForm.court}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, court: e.target.value })}
                        placeholder="e.g., Court 1, Center Court"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setIsEditingSchedule(false)
                          // Reset form
                          const scheduleDate = match.schedule?.confirmedDate
                          if (scheduleDate) {
                            const date = new Date(scheduleDate)
                            setScheduleForm({
                              date: date.toISOString().split('T')[0],
                              time: date.toTimeString().slice(0, 5),
                              court: match.schedule?.court || ''
                            })
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitSchedule}
                        disabled={submitting}
                        className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                      >
                        {submitting ? 'Saving...' : 'Save Schedule'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Result Tab */}
            {activeTab === 'result' && (
              <div className="space-y-6">
                {match.status === 'completed' && match.result && !isEditingResult ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Match Result</h3>
                      <button
                        onClick={() => setIsEditingResult(true)}
                        className="text-sm text-parque-purple hover:underline"
                      >
                        Edit Result
                      </button>
                    </div>
                    
                    {/* Winner Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 text-center mb-6 border border-green-200">
                      <div className="text-4xl mb-4">🏆</div>
                      <h4 className="text-2xl font-bold text-green-800 mb-4">
                        {match.result.winner === match.players.player1._id 
                          ? match.players.player1.name 
                          : match.players.player2.name} Wins!
                      </h4>
                      
                      {/* Set Score Summary */}
                      {match.result.score?.sets && match.result.score.sets.length > 0 && (
                        <div className="text-lg font-semibold text-green-700 mb-2">
                          Sets Won: {(() => {
                            const player1Sets = match.result.score.sets.filter(set => 
                              parseInt(set.player1) > parseInt(set.player2)
                            ).length
                            const player2Sets = match.result.score.sets.filter(set => 
                              parseInt(set.player2) > parseInt(set.player1)
                            ).length
                            return match.result.winner === match.players.player1._id 
                              ? `${player1Sets}-${player2Sets}` 
                              : `${player2Sets}-${player1Sets}`
                          })()}
                        </div>
                      )}
                      
                      {/* Special Cases */}
                      {match.result.score?.walkover && (
                        <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Walkover
                        </div>
                      )}
                      {match.result.score?.retiredPlayer && (
                        <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          {match.result.score.retiredPlayer === match.players.player1._id 
                            ? match.players.player1.name 
                            : match.players.player2.name} retired
                        </div>
                      )}
                    </div>

                    {/* Detailed Score Breakdown */}
                    {match.result.score?.sets && match.result.score.sets.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">Set by Set Breakdown</h4>
                        </div>
                        
                        {/* Score Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Player
                                </th>
                                {match.result.score.sets.map((_, index) => (
                                  <th key={index} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Set {index + 1}
                                  </th>
                                ))}
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sets Won
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* Player 1 Row */}
                              <tr className={match.result.winner === match.players.player1._id ? 'bg-green-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {match.result.winner === match.players.player1._id && (
                                      <span className="text-green-600 mr-2">🏆</span>
                                    )}
                                    <span className="font-medium text-gray-900">
                                      {match.players.player1.name}
                                    </span>
                                  </div>
                                </td>
                                {match.result.score.sets.map((set, index) => (
                                  <td key={index} className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`text-lg font-bold ${
                                      parseInt(set.player1) > parseInt(set.player2) 
                                        ? 'text-green-600' 
                                        : 'text-gray-500'
                                    }`}>
                                      {set.player1}
                                    </span>
                                  </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="text-lg font-bold text-green-600">
                                    {match.result.score.sets.filter(set => 
                                      parseInt(set.player1) > parseInt(set.player2)
                                    ).length}
                                  </span>
                                </td>
                              </tr>
                              
                              {/* Player 2 Row */}
                              <tr className={match.result.winner === match.players.player2._id ? 'bg-green-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {match.result.winner === match.players.player2._id && (
                                      <span className="text-green-600 mr-2">🏆</span>
                                    )}
                                    <span className="font-medium text-gray-900">
                                      {match.players.player2.name}
                                    </span>
                                  </div>
                                </td>
                                {match.result.score.sets.map((set, index) => (
                                  <td key={index} className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`text-lg font-bold ${
                                      parseInt(set.player2) > parseInt(set.player1) 
                                        ? 'text-green-600' 
                                        : 'text-gray-500'
                                    }`}>
                                      {set.player2}
                                    </span>
                                  </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="text-lg font-bold text-green-600">
                                    {match.result.score.sets.filter(set => 
                                      parseInt(set.player2) > parseInt(set.player1)
                                    ).length}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Match Statistics */}
                    {match.result.playedAt && (
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Match Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date Played:</span>
                            <div className="font-medium">{new Date(match.result.playedAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <div className="font-medium">{new Date(match.result.playedAt).toLocaleTimeString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Court:</span>
                            <div className="font-medium">{match.schedule?.court || 'Not specified'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      {isEditingResult ? 'Edit Match Result' : 'Enter Match Result'}
                    </h3>

                    <div className="space-y-6">
                      {/* Score Entry */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Score (Sets)
                        </label>
                        <div className="space-y-3">
                          {resultForm.sets.map((set, index) => (
                            <div key={index} className="flex items-center justify-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700 w-24 text-right">
                                  {match.players.player1.name}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max="7"
                                  value={set.player1}
                                  onChange={(e) => handleSetChange(index, 'player1', e.target.value)}
                                  className="w-16 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                                  disabled={resultForm.walkover}
                                />
                              </div>
                              <div className="text-xl font-bold text-gray-400">-</div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="7"
                                  value={set.player2}
                                  onChange={(e) => handleSetChange(index, 'player2', e.target.value)}
                                  className="w-16 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                                  disabled={resultForm.walkover}
                                />
                                <span className="text-sm font-medium text-gray-700 w-24">
                                  {match.players.player2.name}
                                </span>
                              </div>
                              {resultForm.sets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSet(index)}
                                  className="ml-4 text-red-500 hover:text-red-700"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {!resultForm.walkover && resultForm.sets.length < 5 && (
                          <div className="text-center mt-4">
                            <button
                              type="button"
                              onClick={handleAddSet}
                              className="text-sm text-parque-purple hover:underline"
                            >
                              + Add Set
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Winner Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Winner <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setResultForm({ ...resultForm, winner: match.players.player1._id })}
                            className={`p-4 border-2 rounded-lg text-left transition-colors ${
                              resultForm.winner === match.players.player1._id
                                ? 'border-parque-purple bg-parque-purple bg-opacity-10'
                                : 'border-gray-300 hover:border-parque-purple'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                resultForm.winner === match.players.player1._id
                                  ? 'border-parque-purple bg-parque-purple'
                                  : 'border-gray-300'
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{match.players.player1.name}</p>
                                <p className="text-sm text-gray-600">{match.players.player1.level}</p>
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setResultForm({ ...resultForm, winner: match.players.player2._id })}
                            className={`p-4 border-2 rounded-lg text-left transition-colors ${
                              resultForm.winner === match.players.player2._id
                                ? 'border-parque-purple bg-parque-purple bg-opacity-10'
                                : 'border-gray-300 hover:border-parque-purple'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                resultForm.winner === match.players.player2._id
                                  ? 'border-parque-purple bg-parque-purple'
                                  : 'border-gray-300'
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{match.players.player2.name}</p>
                                <p className="text-sm text-gray-600">{match.players.player2.level}</p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Special Cases */}
                      <div className="space-y-4">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={resultForm.walkover}
                            onChange={(e) => setResultForm({ ...resultForm, walkover: e.target.checked })}
                            className="mr-3 h-4 w-4 text-parque-purple focus:ring-parque-purple border-gray-300 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Walkover</span>
                            <p className="text-xs text-gray-600">One player didn&apos;t show up</p>
                          </div>
                        </label>

                        {!resultForm.walkover && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Retirement (optional)
                            </label>
                            <select
                              value={resultForm.retiredPlayer}
                              onChange={(e) => setResultForm({ ...resultForm, retiredPlayer: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                            >
                              <option value="">No retirement</option>
                              <option value={match.players.player1._id}>{match.players.player1.name} retired</option>
                              <option value={match.players.player2._id}>{match.players.player2.name} retired</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end space-x-4 pt-6">
                        {isEditingResult && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingResult(false)
                              // Reset form to original result
                              if (match.result) {
                                setResultForm({
                                  sets: match.result.score?.sets || [{ player1: '', player2: '' }],
                                  winner: match.result.winner || '',
                                  walkover: match.result.score?.walkover || false,
                                  retiredPlayer: match.result.score?.retiredPlayer || ''
                                })
                              }
                            }}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={handleSubmitResult}
                          disabled={submitting || !resultForm.winner}
                          className="px-8 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 font-medium"
                        >
                          {submitting ? 'Saving...' : 'Save Result'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
