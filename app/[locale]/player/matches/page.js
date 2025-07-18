'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import MatchCard from '@/components/player/MatchCard'
import ScheduleTab from '@/components/player/ScheduleTab'
import ResultsTab from '@/components/player/ResultsTab'

export default function MatchesPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [activeTab, setActiveTab] = useState('schedule')
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/player/matches')
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      const data = await response.json()
      setMatches(data.matches || [])  // Extract matches array from response
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const upcomingMatches = matches?.filter(match => match.status === 'scheduled') || []
  const completedMatches = matches?.filter(match => match.status === 'completed') || []

  const handleResultSubmit = async (matchId, result) => {
    try {
      const response = await fetch('/api/player/matches/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, result })
      })

      if (!response.ok) {
        throw new Error('Failed to submit result')
      }

      // Refresh matches
      await fetchMatches()
      
      // Show success notification
      alert(locale === 'es' ? 'Resultado enviado correctamente' : 'Result submitted successfully')
    } catch (error) {
      console.error('Error submitting result:', error)
      alert(locale === 'es' ? 'Error al enviar el resultado' : 'Error submitting result')
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
            {locale === 'es' ? 'Cargando partidos...' : 'Loading matches...'}
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
          {locale === 'es' ? 'Error al cargar partidos' : 'Error loading matches'}
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {locale === 'es' ? 'Mis Partidos' : 'My Matches'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {locale === 'es' 
            ? 'Gestiona tu calendario y resultados de partidos'
            : 'Manage your match schedule and results'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`${
              activeTab === 'schedule'
                ? 'border-parque-purple text-parque-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            {locale === 'es' ? 'Próximos Partidos' : 'Upcoming Matches'}
            {upcomingMatches.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {upcomingMatches.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`${
              activeTab === 'results'
                ? 'border-parque-purple text-parque-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            {locale === 'es' ? 'Resultados' : 'Results'}
            {completedMatches.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {completedMatches.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'schedule' ? (
          <ScheduleTab 
            schedule={upcomingMatches} 
            language={locale}
            onResultSubmit={handleResultSubmit}
          />
        ) : (
          <ResultsTab 
            matches={completedMatches} 
            language={locale}
          />
        )}
      </div>
    </div>
  )
}