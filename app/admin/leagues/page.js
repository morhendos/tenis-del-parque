'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchLeagues()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/check')
      if (!res.ok) {
        router.push('/admin')
      }
    } catch (error) {
      router.push('/admin')
    }
  }

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

  const handleManageLeague = (leagueId, leagueName) => {
    // Store selected league in session storage for other pages to reference
    sessionStorage.setItem('selectedLeague', JSON.stringify({ id: leagueId, name: leagueName }))
    router.push(`/admin/leagues/${leagueId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parque-bg flex items-center justify-center">
        <div className="text-xl text-parque-purple">Loading leagues...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parque-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-parque-purple">League Management</h1>
            <p className="text-gray-600 mt-2">Select a league to manage matches and players</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-parque-green text-white rounded-lg hover:bg-opacity-90"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Leagues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => {
            const currentSeason = league.seasons?.find(s => s.status === 'registration_open' || s.status === 'active') || league.seasons?.[0]
            const playerCount = league.playerCount || 0
            
            return (
              <div key={league._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-parque-purple mb-2">
                    {league.name}
                  </h2>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Location:</span> {league.location?.city}, {league.location?.region}
                    </p>
                    <p>
                      <span className="font-medium">Current Season:</span> {currentSeason?.name || 'No active season'}
                    </p>
                    <p>
                      <span className="font-medium">Players:</span> {playerCount}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        currentSeason?.status === 'active' ? 'bg-green-100 text-green-800' :
                        currentSeason?.status === 'registration_open' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {currentSeason?.status?.replace('_', ' ').toUpperCase() || 'INACTIVE'}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleManageLeague(league._id, league.name)}
                      className="w-full px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      Manage League
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          sessionStorage.setItem('selectedLeague', JSON.stringify({ id: league._id, name: league.name }))
                          router.push(`/admin/matches?league=${league._id}`)
                        }}
                        className="px-3 py-1.5 bg-parque-green text-white text-sm rounded hover:bg-opacity-90"
                      >
                        Matches
                      </button>
                      <button
                        onClick={() => {
                          sessionStorage.setItem('selectedLeague', JSON.stringify({ id: league._id, name: league.name }))
                          router.push(`/admin/players?league=${league._id}`)
                        }}
                        className="px-3 py-1.5 bg-parque-yellow text-parque-purple text-sm rounded hover:bg-opacity-90"
                      >
                        Players
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {leagues.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No leagues found. Create leagues using the seed script.</p>
          </div>
        )}
      </div>
    </div>
  )
}
