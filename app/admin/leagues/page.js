'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useLeaguesData from '../../../lib/hooks/useLeaguesData'
import ImportCSVModal from '../../../components/admin/leagues/ImportCSVModal'
import LeagueFormModal from '../../../components/admin/leagues/LeagueFormModal'
import LeagueCityLinker from '../../../components/admin/leagues/LeagueCityLinker'
import LeagueSeasonEditor from '../../../components/admin/leagues/LeagueSeasonEditor'
import { toast } from '@/components/ui/Toast'

export default function AdminLeaguesPage() {
  const router = useRouter()
  const [importModal, setImportModal] = useState({ show: false })
  const [importResult, setImportResult] = useState(null)
  const [formModal, setFormModal] = useState({ show: false, league: null })
  const [seasonEditor, setSeasonEditor] = useState({ show: false, league: null })
  const [activeTab, setActiveTab] = useState('overview')
  const [sortBy, setSortBy] = useState('alphabetical') // alphabetical, leagues, players, custom
  const [customOrder, setCustomOrder] = useState([])
  const [leagueSortBy, setLeagueSortBy] = useState('name') // name, players, status, custom
  const [customLeagueOrder, setCustomLeagueOrder] = useState({}) // { cityName: [leagueId1, leagueId2, ...] }
  
  const {
    leagues,
    loading,
    error,
    handleImportCSV,
    exportCSV,
    refreshLeagues
  } = useLeaguesData()

  // Load sorting preference from localStorage
  useEffect(() => {
    const savedSortBy = localStorage.getItem('leaguesSortBy')
    const savedCustomOrder = localStorage.getItem('leaguesCustomOrder')
    const savedLeagueSortBy = localStorage.getItem('leagueSortBy')
    const savedCustomLeagueOrder = localStorage.getItem('customLeagueOrder')
    
    if (savedSortBy) {
      setSortBy(savedSortBy)
    }
    if (savedCustomOrder) {
      try {
        setCustomOrder(JSON.parse(savedCustomOrder))
      } catch (e) {
        console.error('Error parsing custom order:', e)
      }
    }
    if (savedLeagueSortBy) {
      setLeagueSortBy(savedLeagueSortBy)
    }
    if (savedCustomLeagueOrder) {
      try {
        setCustomLeagueOrder(JSON.parse(savedCustomLeagueOrder))
      } catch (e) {
        console.error('Error parsing custom league order:', e)
      }
    }
  }, [])

  // Save sorting preference when it changes
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy)
    localStorage.setItem('leaguesSortBy', newSortBy)
  }

  // Save league sorting preference
  const handleLeagueSortChange = (newSortBy) => {
    setLeagueSortBy(newSortBy)
    localStorage.setItem('leagueSortBy', newSortBy)
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
      
      const method = formModal.league ? 'PATCH' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      // Get the response data to access error details
      const data = await response.json()

      if (!response.ok) {
        // Show the exact error message from the API
        toast.error(data.error || 'Failed to save league. Please check all required fields.')
        return
      }

      // Success!
      toast.success(formModal.league ? 'League updated successfully!' : 'League created successfully!')
      await refreshLeagues()
      setFormModal({ show: false, league: null })
    } catch (error) {
      console.error('Error saving league:', error)
      toast.error('An unexpected error occurred. Please try again.')
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

  // Group leagues by city
  const groupedLeagues = leagues.reduce((groups, league) => {
    const cityName = league.location?.city || 'Unknown City'
    if (!groups[cityName]) {
      groups[cityName] = []
    }
    groups[cityName].push(league)
    return groups
  }, {})

  // Sort cities based on selected option
  const sortedCities = Object.keys(groupedLeagues).sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.localeCompare(b)
      
      case 'leagues':
        // Sort by number of leagues (descending)
        return groupedLeagues[b].length - groupedLeagues[a].length
      
      case 'players':
        // Sort by total players (descending)
        const playersA = groupedLeagues[a].reduce((sum, league) => 
          sum + (league.stats?.registeredPlayers || league.playerCount || 0), 0
        )
        const playersB = groupedLeagues[b].reduce((sum, league) => 
          sum + (league.stats?.registeredPlayers || league.playerCount || 0), 0
        )
        return playersB - playersA
      
      case 'custom':
        // Use custom order if available
        if (customOrder.length > 0) {
          return customOrder.indexOf(a) - customOrder.indexOf(b)
        }
        return a.localeCompare(b)
      
      default:
        return a.localeCompare(b)
    }
  })

  // Initialize custom order if not set
  useEffect(() => {
    if (sortBy === 'custom' && customOrder.length === 0 && sortedCities.length > 0) {
      const initialOrder = [...sortedCities].sort((a, b) => a.localeCompare(b))
      setCustomOrder(initialOrder)
      localStorage.setItem('leaguesCustomOrder', JSON.stringify(initialOrder))
    }
  }, [sortBy, customOrder.length, sortedCities.length])

  // Move city up in custom order
  const moveCityUp = (cityName) => {
    const currentIndex = customOrder.indexOf(cityName)
    if (currentIndex > 0) {
      const newOrder = [...customOrder]
      const temp = newOrder[currentIndex - 1]
      newOrder[currentIndex - 1] = cityName
      newOrder[currentIndex] = temp
      setCustomOrder(newOrder)
      localStorage.setItem('leaguesCustomOrder', JSON.stringify(newOrder))
    }
  }

  // Move city down in custom order
  const moveCityDown = (cityName) => {
    const currentIndex = customOrder.indexOf(cityName)
    if (currentIndex < customOrder.length - 1) {
      const newOrder = [...customOrder]
      const temp = newOrder[currentIndex + 1]
      newOrder[currentIndex + 1] = cityName
      newOrder[currentIndex] = temp
      setCustomOrder(newOrder)
      localStorage.setItem('leaguesCustomOrder', JSON.stringify(newOrder))
    }
  }

  // Sort leagues within a city
  const getSortedLeagues = (cityName) => {
    const cityLeagues = groupedLeagues[cityName] || []
    
    return [...cityLeagues].sort((a, b) => {
      switch (leagueSortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        
        case 'players':
          const playersA = a.stats?.registeredPlayers || a.playerCount || 0
          const playersB = b.stats?.registeredPlayers || b.playerCount || 0
          return playersB - playersA
        
        case 'status':
          const statusOrder = { 'active': 1, 'registration_open': 2, 'coming_soon': 3, 'completed': 4, 'inactive': 5 }
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
        
        case 'custom':
          // Use custom order if available for this city
          if (customLeagueOrder[cityName]) {
            const indexA = customLeagueOrder[cityName].indexOf(a._id)
            const indexB = customLeagueOrder[cityName].indexOf(b._id)
            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB
            }
          }
          return a.name.localeCompare(b.name)
        
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }

  // Initialize custom league order for a city
  const initializeCustomLeagueOrder = (cityName) => {
    if (!customLeagueOrder[cityName]) {
      const cityLeagues = groupedLeagues[cityName] || []
      const leagueIds = cityLeagues.map(l => l._id)
      const newOrder = { ...customLeagueOrder, [cityName]: leagueIds }
      setCustomLeagueOrder(newOrder)
      localStorage.setItem('customLeagueOrder', JSON.stringify(newOrder))
    }
  }

  // Move league up within city
  const moveLeagueUp = (cityName, leagueId) => {
    const cityOrder = customLeagueOrder[cityName] || []
    const currentIndex = cityOrder.indexOf(leagueId)
    if (currentIndex > 0) {
      const newCityOrder = [...cityOrder]
      const temp = newCityOrder[currentIndex - 1]
      newCityOrder[currentIndex - 1] = leagueId
      newCityOrder[currentIndex] = temp
      const newOrder = { ...customLeagueOrder, [cityName]: newCityOrder }
      setCustomLeagueOrder(newOrder)
      localStorage.setItem('customLeagueOrder', JSON.stringify(newOrder))
    }
  }

  // Move league down within city
  const moveLeagueDown = (cityName, leagueId) => {
    const cityOrder = customLeagueOrder[cityName] || []
    const currentIndex = cityOrder.indexOf(leagueId)
    if (currentIndex < cityOrder.length - 1) {
      const newCityOrder = [...cityOrder]
      const temp = newCityOrder[currentIndex + 1]
      newCityOrder[currentIndex + 1] = leagueId
      newCityOrder[currentIndex] = temp
      const newOrder = { ...customLeagueOrder, [cityName]: newCityOrder }
      setCustomLeagueOrder(newOrder)
      localStorage.setItem('customLeagueOrder', JSON.stringify(newOrder))
    }
  }

  // Initialize custom league order when switching to custom mode
  useEffect(() => {
    if (leagueSortBy === 'custom') {
      Object.keys(groupedLeagues).forEach(cityName => {
        initializeCustomLeagueOrder(cityName)
      })
    }
  }, [leagueSortBy])

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
          
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">{leagues.length}</div>
              <div className="text-sm text-gray-600">Total Leagues</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{sortedCities.length}</div>
              <div className="text-sm text-gray-600">Cities</div>
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

          {/* Grouped Leagues by City */}
          <div className="space-y-6">
            {/* Sort Options */}
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
              {/* City Sort Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Sort Cities:</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSortChange('alphabetical')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      sortBy === 'alphabetical'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔤 A-Z
                  </button>
                  <button
                    onClick={() => handleSortChange('leagues')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      sortBy === 'leagues'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏆 Most Leagues
                  </button>
                  <button
                    onClick={() => handleSortChange('players')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      sortBy === 'players'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👥 Most Players
                  </button>
                  <button
                    onClick={() => handleSortChange('custom')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      sortBy === 'custom'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✨ Custom
                  </button>
                </div>
              </div>

              {/* League Sort Options */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Sort Leagues:</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLeagueSortChange('name')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      leagueSortBy === 'name'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔤 Name
                  </button>
                  <button
                    onClick={() => handleLeagueSortChange('players')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      leagueSortBy === 'players'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👥 Players
                  </button>
                  <button
                    onClick={() => handleLeagueSortChange('status')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      leagueSortBy === 'status'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📊 Status
                  </button>
                  <button
                    onClick={() => handleLeagueSortChange('custom')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      leagueSortBy === 'custom'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✨ Custom
                  </button>
                </div>
              </div>
            </div>

            {/* Cities and Leagues */}
            <div className="space-y-8">
            {sortedCities.map((cityName, index) => (
              <div key={cityName} className="space-y-4">
                {/* City Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl shadow-md">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold">{cityName}</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Custom sort arrows */}
                    {sortBy === 'custom' && (
                      <div className="flex space-x-1 mr-2">
                        <button
                          onClick={() => moveCityUp(cityName)}
                          disabled={index === 0}
                          className={`p-2 rounded-lg transition-all ${
                            index === 0
                              ? 'opacity-30 cursor-not-allowed'
                              : 'hover:bg-white/20 active:scale-95'
                          }`}
                          title="Move up"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveCityDown(cityName)}
                          disabled={index === sortedCities.length - 1}
                          className={`p-2 rounded-lg transition-all ${
                            index === sortedCities.length - 1
                              ? 'opacity-30 cursor-not-allowed'
                              : 'hover:bg-white/20 active:scale-95'
                          }`}
                          title="Move down"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {groupedLeagues[cityName].length} {groupedLeagues[cityName].length === 1 ? 'League' : 'Leagues'}
                    </span>
                  </div>
                </div>

                {/* Leagues Grid for this City */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getSortedLeagues(cityName).map((league, leagueIndex) => {
                    const currentSeason = league.seasons?.find(s => s.status === 'registration_open' || s.status === 'active') || league.seasons?.[0]
                    const playerCount = league.stats?.registeredPlayers || league.playerCount || 0
                    const sortedLeagues = getSortedLeagues(cityName)
                    
                    return (
                      <div 
                        key={league._id} 
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all relative overflow-hidden border-2 border-transparent hover:border-emerald-400"
                      >
                        {/* Header Section with Better Layout */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100">
                          <div className="flex items-center justify-between gap-3">
                            {/* Left: Sort Arrows (only in custom mode) */}
                            {leagueSortBy === 'custom' && (
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveLeagueUp(cityName, league._id)
                                  }}
                                  disabled={leagueIndex === 0}
                                  className={`p-1.5 bg-teal-600 rounded-md shadow transition-all ${
                                    leagueIndex === 0
                                      ? 'opacity-30 cursor-not-allowed'
                                      : 'hover:bg-teal-700 active:scale-95'
                                  }`}
                                  title="Move league up"
                                >
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveLeagueDown(cityName, league._id)
                                  }}
                                  disabled={leagueIndex === sortedLeagues.length - 1}
                                  className={`p-1.5 bg-teal-600 rounded-md shadow transition-all ${
                                    leagueIndex === sortedLeagues.length - 1
                                      ? 'opacity-30 cursor-not-allowed'
                                      : 'hover:bg-teal-700 active:scale-95'
                                  }`}
                                  title="Move league down"
                                >
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            
                            {/* Center: League Name & Season */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {league.name}
                              </h3>
                              {league.season && (
                                <div className="text-xs text-gray-600 mt-1 capitalize">
                                  {league.season.type} {league.season.year}
                                </div>
                              )}
                            </div>
                            
                            {/* Right: Badges & Edit Button */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Status Badge */}
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusBadgeColor(league.status)}`}>
                                {league.status === 'registration_open' ? 'REG OPEN' : 
                                 league.status === 'coming_soon' ? 'COMING' :
                                 league.status?.replace('_', ' ').toUpperCase()}
                              </span>
                              
                              {/* Skill Level Badge */}
                              {league.skillLevel && league.skillLevel !== 'all' && (
                                <span className={`px-2 py-1 text-xs font-medium rounded border whitespace-nowrap ${getSkillLevelBadgeColor(league.skillLevel)}`}>
                                  {getSkillLevelName(league.skillLevel)}
                                </span>
                              )}
                              
                              {/* Edit button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditClick(e, league)
                                }}
                                className="p-2 bg-white/60 rounded-lg hover:bg-white transition-colors"
                                title="Edit league settings"
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Content Section - Clickable */}
                        <div 
                          onClick={() => handleLeagueClick(league._id, league.name)}
                          className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                          title={`Click to manage ${league.name}`}
                        >
                          <div className="space-y-3 text-sm">
                            {/* Expected launch date for coming soon leagues */}
                            {league.status === 'coming_soon' && league.expectedLaunchDate && (
                              <div className="flex items-center text-gray-600">
                                <span className="text-base mr-2">🚀</span>
                                <span>Launch: {new Date(league.expectedLaunchDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {/* Season dates for active leagues */}
                            {league.seasonConfig?.startDate && (
                              <div className="flex items-center text-gray-600">
                                <span className="text-base mr-2">📅</span>
                                <span className="truncate">
                                  {new Date(league.seasonConfig.startDate).toLocaleDateString('en-GB')}
                                  {league.seasonConfig.endDate && ` - ${new Date(league.seasonConfig.endDate).toLocaleDateString('en-GB')}`}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-gray-600">
                              <span className="text-base mr-2">👥</span>
                              <span>
                                <span className="font-semibold text-gray-900">{playerCount}</span> players
                                {league.seasonConfig?.maxPlayers && (
                                  <span className="text-gray-400"> / {league.seasonConfig.maxPlayers} max</span>
                                )}
                              </span>
                            </div>
                            
                            {league.waitingListCount > 0 && (
                              <div className="flex items-center text-amber-600">
                                <span className="text-base mr-2">⏳</span>
                                <span className="font-medium">{league.waitingListCount} on waiting list</span>
                              </div>
                            )}

                            {/* Pricing info - Always show for active/registration_open leagues */}
                            {(league.status === 'active' || league.status === 'registration_open') && (
                              <div className="flex items-center text-gray-600">
                                <span className="text-base mr-2">💰</span>
                                <span className="font-medium">
                                  {league.seasonConfig?.price?.isFree ? (
                                    <span className="text-green-600">Free</span>
                                  ) : league.seasonConfig?.price?.amount > 0 ? (
                                    `${league.seasonConfig.price.amount}€`
                                  ) : (
                                    <span className="text-gray-400">Price not set</span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-gray-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMatchesClick(e, league._id, league.name)
                              }}
                              className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                            >
                              ⚔️ Matches
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayersClick(e, league._id, league.name)
                              }}
                              className="px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 active:scale-95 transition-all shadow-sm"
                            >
                              👥 Players
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}            </div>

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
          </div>
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
