'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useLeaguesData from '../../../lib/hooks/useLeaguesData'
import ImportCSVModal from '../../../components/admin/leagues/ImportCSVModal'
import LeagueFormModal from '../../../components/admin/leagues/LeagueFormModal'
import LeagueCityLinker from '../../../components/admin/leagues/LeagueCityLinker'
import LeagueSeasonEditor from '../../../components/admin/leagues/LeagueSeasonEditor'

export default function AdminLeaguesPage() {
  const router = useRouter()
  const [importModal, setImportModal] = useState({ show: false })
  const [importResult, setImportResult] = useState(null)
  const [formModal, setFormModal] = useState({ show: false, league: null })
  const [seasonEditor, setSeasonEditor] = useState({ show: false, league: null })
  const [activeTab, setActiveTab] = useState('overview')
  
  const {
    leagues,
    loading,
    error,
    handleImportCSV,
    exportCSV,
    refreshLeagues
  } = useLeaguesData()

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

  const handleImport = async (file) => {
    const result = await handleImportCSV(file)
    setImportResult(result)
    return result
  }

  const handleEditClick = (e, league) => {
    e.stopPropagation()
    setFormModal({ show: true, league })
  }

  const handleCreateNew = () => {
    setFormModal({ show: true, league: null })
  }

  // NEW: Navigate to create season page
  const handleCreateSeason = () => {
    router.push('/admin/leagues/seasons/create')
  }

  const handleFormSubmit = async (formData) => {
    try {
      const endpoint = formModal.league 
        ? `/api/admin/leagues/${formModal.league._id}`
        : '/api/admin/leagues'
      
      const method = formModal.league ? 'PUT' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to save league')
      }

      await refreshLeagues()
      setFormModal({ show: false, league: null })
    } catch (error) {
      console.error('Error saving league:', error)
      alert('Error saving league: ' + error.message)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'registration_open':
        return 'bg-blue-100 text-blue-800'
      case 'coming_soon':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // NEW: Get skill level badge color
  const getSkillLevelBadgeColor = (skillLevel) => {
    switch (skillLevel) {
      case 'beginner':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'intermediate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'advanced':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'all':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  // NEW: Get skill level display name
  const getSkillLevelName = (skillLevel) => {
    const names = {
      all: 'General',
      beginner: 'Principiantes',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    }
    return names[skillLevel] || skillLevel
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leagues Management</h2>
          <div className="mt-1">
            <p className="text-gray-600">Manage your tennis leagues, seasons, and skill levels</p>
            <p className="text-sm text-gray-500 mt-1">Create new seasons for existing leagues or start completely new leagues</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateSeason}
            className="px-4 py-2 bg-parque-green text-white rounded-lg hover:bg-parque-green/90"
          >
            🏆 Create Season
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90"
          >
            + Create League
          </button>
          <button
            onClick={() => setImportModal({ show: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Import CSV
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-parque-purple text-parque-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            League Overview
          </button>
          <button
            onClick={() => setActiveTab('city-links')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'city-links'
                ? 'border-parque-purple text-parque-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            City Connections
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Fix Registration URLs
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-parque-purple text-parque-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            League Settings
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Season Data
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* NEW: Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">{leagues.length}</div>
              <div className="text-sm text-gray-600">Total Leagues</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {leagues.filter(l => l.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">
                {leagues.filter(l => l.status === 'coming_soon').length}
              </div>
              <div className="text-sm text-gray-600">Coming Soon</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {leagues.filter(l => l.status === 'registration_open').length}
              </div>
              <div className="text-sm text-gray-600">Open for Registration</div>
            </div>
          </div>

          {/* Leagues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => {
              const currentSeason = league.seasons?.find(s => s.status === 'registration_open' || s.status === 'active') || league.seasons?.[0]
              const playerCount = league.stats?.registeredPlayers || league.playerCount || 0
              
              return (
                <div 
                  key={league._id} 
                  onClick={() => handleLeagueClick(league._id, league.name)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg hover:border-parque-purple hover:border transition-all cursor-pointer group relative"
                  title={`Click to manage ${league.name}`}
                >
                  {/* Edit button */}
                  <button
                    onClick={(e) => handleEditClick(e, league)}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                    title="Edit league settings"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-parque-purple transition-colors">
                          {league.name}
                        </h3>
                        {/* NEW: Season info */}
                        {league.season && (
                          <div className="text-sm text-gray-500 mt-1">
                            {league.season.type} {league.season.year}
                            {league.season.number > 1 && ` - T${league.season.number}`}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(league.status)}`}>
                          {league.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        {/* NEW: Skill level badge */}
                        {league.skillLevel && league.skillLevel !== 'all' && (
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getSkillLevelBadgeColor(league.skillLevel)}`}>
                            {getSkillLevelName(league.skillLevel)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <span className="text-lg mr-2">📍</span>
                        <span>{league.location?.city}, {league.location?.region}</span>
                      </div>
                      
                      {/* NEW: Expected launch date for coming soon leagues */}
                      {league.status === 'coming_soon' && league.expectedLaunchDate && (
                        <div className="flex items-center text-gray-600">
                          <span className="text-lg mr-2">🚀</span>
                          <span>Launch: {new Date(league.expectedLaunchDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {/* Season dates for active leagues */}
                      {league.seasonConfig?.startDate && (
                        <div className="flex items-center text-gray-600">
                          <span className="text-lg mr-2">📅</span>
                          <span>
                            {new Date(league.seasonConfig.startDate).toLocaleDateString()}
                            {league.seasonConfig.endDate && ` - ${new Date(league.seasonConfig.endDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <span className="text-lg mr-2">👥</span>
                        <span>{playerCount} players</span>
                        {league.seasonConfig?.maxPlayers && (
                          <span className="text-gray-400"> / {league.seasonConfig.maxPlayers} max</span>
                        )}
                      </div>
                      
                      {league.waitingListCount > 0 && (
                        <div className="flex items-center text-gray-600">
                          <span className="text-lg mr-2">⏳</span>
                          <span>{league.waitingListCount} on waiting list</span>
                        </div>
                      )}

                      {/* NEW: Pricing info */}
                      {league.seasonConfig?.price && (
                        <div className="flex items-center text-gray-600">
                          <span className="text-lg mr-2">💰</span>
                          <span>
                            {league.seasonConfig.price.isFree 
                              ? 'Free' 
                              : `${league.seasonConfig.price.amount}€`}
                          </span>
                        </div>
                      )}
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
              <p className="text-gray-600 mb-4">No leagues found. Create your first league to get started.</p>
              <div className="space-x-4">
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90"
                >
                  Create First League
                </button>
                <button
                  onClick={handleCreateSeason}
                  className="px-6 py-3 bg-parque-green text-white rounded-lg hover:bg-parque-green/90"
                >
                  Create Season
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* City Links Tab */}
      {activeTab === 'city-links' && (
        <LeagueCityLinker />
      )}

      {/* Import Modal */}
      <ImportCSVModal
        show={importModal.show}
        onClose={() => {
          setImportModal({ show: false })
          setImportResult(null)
        }}
        onImport={handleImport}
        importResult={importResult}
      />

      {/* League Form Modal */}
      <LeagueFormModal
        show={formModal.show}
        league={formModal.league}
        onClose={() => setFormModal({ show: false, league: null })}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
