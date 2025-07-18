'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import StandingsTable from '@/components/player/StandingsTable'
import PlayoffExplanation from '@/components/player/PlayoffExplanation'

export default function LeaguePage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [loading, setLoading] = useState(true)
  const [leagueData, setLeagueData] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('standings')

  useEffect(() => {
    fetchLeagueData()
  }, [])

  const fetchLeagueData = async () => {
    try {
      // Get player profile first to get their league
      const profileRes = await fetch('/api/player/profile')
      if (!profileRes.ok) {
        throw new Error('Failed to fetch player profile')
      }
      const profileData = await profileRes.json()
      
      if (!profileData.player?.league) {
        throw new Error('Player not assigned to a league')
      }

      // Fetch league standings using league ID
      const leagueId = profileData.player.league._id || profileData.player.league
      const standingsRes = await fetch(`/api/leagues/${leagueId}/standings`)
      if (!standingsRes.ok) {
        throw new Error('Failed to fetch league standings')
      }
      const standingsData = await standingsRes.json()
      
      setLeagueData({
        league: profileData.player.league,
        standings: standingsData.unifiedStandings || standingsData.standings || [],
        player: profileData.player
      })
    } catch (error) {
      console.error('Error fetching league data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-parque-purple rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">
            {locale === 'es' ? 'Cargando datos de la liga...' : 'Loading league data...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {locale === 'es' ? 'Error al cargar la liga' : 'Error loading league'}
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (!leagueData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          {locale === 'es' ? 'No hay datos de liga disponibles' : 'No league data available'}
        </p>
      </div>
    )
  }

  const { standings, player } = leagueData

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {locale === 'es' ? 'Mi Liga' : 'My League'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {locale === 'es' 
            ? `Clasificación y estadísticas de ${leagueData.league.name || leagueData.league}`
            : `Standings and statistics for ${leagueData.league.name || leagueData.league}`}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('standings')}
            className={`${
              activeTab === 'standings'
                ? 'border-parque-purple text-parque-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            {locale === 'es' ? 'Clasificación' : 'Standings'}
          </button>
          <button
            onClick={() => setActiveTab('playoffs')}
            className={`${
              activeTab === 'playoffs'
                ? 'border-parque-purple text-parque-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            {locale === 'es' ? 'Sistema de Playoffs' : 'Playoff System'}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'standings' ? (
          <StandingsTable 
            players={standings} 
            currentPlayerId={player._id}
            language={locale}
          />
        ) : (
          <PlayoffExplanation language={locale} />
        )}
      </div>
    </div>
  )
}