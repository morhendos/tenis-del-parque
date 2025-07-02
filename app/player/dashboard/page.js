'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PlayerDashboard() {
  const [player, setPlayer] = useState(null)
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchPlayerData()
  }, [])

  const fetchPlayerData = async () => {
    try {
      setLoading(true)
      
      // Get player data
      const playerRes = await fetch('/api/player/profile')
      if (!playerRes.ok) throw new Error('Failed to fetch player data')
      const playerData = await playerRes.json()
      setPlayer(playerData.player)

      // Get matches
      const matchesRes = await fetch('/api/player/matches')
      if (!matchesRes.ok) throw new Error('Failed to fetch matches')
      const matchesData = await matchesRes.json()
      
      // Separate upcoming and recent matches
      const now = new Date()
      const upcoming = matchesData.matches.filter(match => 
        match.status === 'scheduled' && 
        (!match.schedule?.confirmedDate || new Date(match.schedule.confirmedDate) > now)
      )
      const recent = matchesData.matches.filter(match => 
        match.status === 'completed'
      ).slice(0, 5) // Last 5 matches

      setUpcomingMatches(upcoming)
      setRecentMatches(recent)
      
    } catch (error) {
      console.error('Error fetching player data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchPlayerData}
          className="mt-4 px-4 py-2 bg-parque-green text-white rounded hover:bg-opacity-90"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No player data found</p>
      </div>
    )
  }

  const winRate = player.stats?.matchesPlayed > 0 
    ? Math.round((player.stats.matchesWon / player.stats.matchesPlayed) * 100)
    : 0

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {player.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here&apos;s your tennis journey at a glance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ELO Rating</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {player.stats?.eloRating || 1200}
              </p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Matches Played</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {player.stats?.matchesPlayed || 0}
              </p>
            </div>
            <div className="text-3xl">🎾</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {winRate}%
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Level</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 capitalize">
                {player.level}
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Matches */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Matches</h2>
          </div>
          <div className="p-6">
            {upcomingMatches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming matches scheduled</p>
            ) : (
              <div className="space-y-4">
                {upcomingMatches.map((match) => {
                  const opponent = match.players.player1._id === player._id 
                    ? match.players.player2 
                    : match.players.player1
                  
                  return (
                    <div key={match._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            vs {opponent.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Round {match.round} • {opponent.level}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {match.schedule?.confirmedDate 
                              ? new Date(match.schedule.confirmedDate).toLocaleString()
                              : 'Date TBD'}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Scheduled
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Results</h2>
          </div>
          <div className="p-6">
            {recentMatches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No matches played yet</p>
            ) : (
              <div className="space-y-4">
                {recentMatches.map((match) => {
                  const opponent = match.players.player1._id === player._id 
                    ? match.players.player2 
                    : match.players.player1
                  const won = match.result?.winner === player._id
                  const score = match.result?.score?.sets?.map(set => 
                    match.players.player1._id === player._id 
                      ? `${set.player1}-${set.player2}`
                      : `${set.player2}-${set.player1}`
                  ).join(', ')
                  
                  return (
                    <div key={match._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            vs {opponent.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {score || 'Score not available'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(match.result.playedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {won ? 'Won' : 'Lost'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-parque-bg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/player/matches')}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">📅</span>
              <div>
                <p className="font-medium text-gray-900">View All Matches</p>
                <p className="text-sm text-gray-600">See your full match history</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/player/profile')}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">✏️</span>
              <div>
                <p className="font-medium text-gray-900">Update Profile</p>
                <p className="text-sm text-gray-600">Change your contact info</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/standings')}
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏅</span>
              <div>
                <p className="font-medium text-gray-900">League Standings</p>
                <p className="text-sm text-gray-600">See the current rankings</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
