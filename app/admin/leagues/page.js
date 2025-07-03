'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/leagues')
      if (!res.ok) throw new Error('Failed to fetch leagues')
      
      const data = await res.json()
      setLeagues(data.leagues || [])
    } catch (error) {
      console.error('Error fetching leagues:', error)
      setError('Error loading leagues')
    } finally {
      setLoading(false)
    }
  }

  const handleLeagueClick = (leagueId, leagueName) => {
    sessionStorage.setItem('selectedLeague', JSON.stringify({ id: leagueId, name: leagueName }))
    router.push(`/admin/leagues/${leagueId}`)
  }

  const handlePlayersClick = (e, leagueId, leagueName) => {
    e.stopPropagation()
    sessionStorage.setItem('selectedLeague', JSON.stringify({ id: leagueId, name: leagueName }))
    router.push(`/admin/players?league=${leagueId}`)
  }

  const handleMatchesClick = (e, leagueId, leagueName) => {
    e.stopPropagation()
    sessionStorage.setItem('selectedLeague', JSON.stringify({ id: leagueId, name: leagueName }))
    router.push(`/admin/matches?league=${leagueId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading leagues...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Leagues</h2>
        <div className="mt-1">
          <p className="text-gray-600">Click on a league card to access its management dashboard</p>
          <p className="text-sm text-gray-500 mt-1">Or use the quick action buttons to jump directly to Players or Matches</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Leagues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => {
          const currentSeason = league.seasons?.find(s => s.status === 'registration_open' || s.status === 'active') || league.seasons?.[0]
          const playerCount = league.playerCount || 0
          
          return (
            <div 
              key={league._id} 
              onClick={() => handleLeagueClick(league._id, league.name)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg hover:border-parque-purple hover:border transition-all cursor-pointer group"
              title={`Click to manage ${league.name}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-parque-purple transition-colors flex items-center">
                    {league.name}
                    <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    currentSeason?.status === 'active' ? 'bg-green-100 text-green-800' :
                    currentSeason?.status === 'registration_open' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentSeason?.status?.replace('_', ' ').toUpperCase() || 'INACTIVE'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="text-lg mr-2">📍</span>
                    <span>{league.location?.city}, {league.location?.region}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-lg mr-2">📅</span>
                    <span>{currentSeason?.name || 'No active season'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-lg mr-2">👥</span>
                    <span>{playerCount} players</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => handleMatchesClick(e, league._id, league.name)}
                    className="px-4 py-2 bg-parque-purple text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Matches
                  </button>
                  <button
                    onClick={(e) => handlePlayersClick(e, league._id, league.name)}
                    className="px-4 py-2 bg-parque-green text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Players
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {leagues.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No leagues found. Create leagues using the seed script.</p>
        </div>
      )}
    </div>
  )
}
