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
  const [savingOrder, setSavingOrder] = useState(false)
  
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

  // Archive a league (soft delete)
  const handleArchiveLeague = async (league) => {
    if (!confirm(`Archive "${league.name}"?\n\nThis will hide it from the main list. You can restore it later from the Archive tab.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/leagues/${league._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      })

      if (!response.ok) {
        throw new Error('Failed to archive league')
      }

      toast.success('League archived successfully!')
      await refreshLeagues()
    } catch (error) {
      console.error('Error archiving league:', error)
      toast.error('Failed to archive league. Please try again.')
    }
  }

  // Restore an archived league
  const handleRestoreLeague = async (league) => {
    if (!confirm(`Restore "${league.name}"?\n\nThis will bring it back to inactive status.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/leagues/${league._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' })
      })

      if (!response.ok) {
        throw new Error('Failed to restore league')
      }

      toast.success('League restored successfully!')
      await refreshLeagues()
    } catch (error) {
      console.error('Error restoring league:', error)
      toast.error('Failed to restore league. Please try again.')
    }
  }

  // Permanently delete a league (only from archive)
  const handlePermanentDelete = async (league) => {
    const confirmed = confirm(
      `⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete "${league.name}"?\n\nThis will remove:\n- All player registrations\n- All match history\n- All statistics\n\nThis action CANNOT be undone!\n\nType the league name to confirm.`
    )

    if (!confirmed) return

    // Double confirmation
    const leagueName = prompt(`Type "${league.name}" to confirm permanent deletion:`)
    if (leagueName !== league.name) {
      toast.error('League name did not match. Deletion cancelled.')
      return
    }

    try {
      const response = await fetch(`/api/admin/leagues/${league._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete league')
      }

      toast.success('League permanently deleted')
      await refreshLeagues()
    } catch (error) {
      console.error('Error deleting league:', error)
      toast.error('Failed to delete league. Please try again.')
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
      case 'archived':
        return 'bg-gray-100 text-gray-800'
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

  // Group leagues by city (exclude archived from main view)
  const activeLeagues = leagues.filter(league => league.status !== 'archived')
  const archivedLeagues = leagues.filter(league => league.status === 'archived')
  
  const groupedLeagues = activeLeagues.reduce((groups, league) => {
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

  // Save display order to database (for home page)
  const handleSaveDisplayOrder = async () => {
    setSavingOrder(true)
    try {
      // Build the orders array based on current custom order
      const orders = []
      let displayOrder = 0

      // Use custom city order if available, otherwise alphabetical
      const citiesToProcess = sortBy === 'custom' && customOrder.length > 0 
        ? customOrder 
        : sortedCities

      citiesToProcess.forEach(cityName => {
        const cityLeagues = groupedLeagues[cityName] || []
        
        // Use custom league order if available, otherwise current sort
        const leaguesToProcess = leagueSortBy === 'custom' && customLeagueOrder[cityName]
          ? customLeagueOrder[cityName].map(id => cityLeagues.find(l => l._id === id)).filter(Boolean)
          : getSortedLeagues(cityName)

        leaguesToProcess.forEach(league => {
          orders.push({
            leagueId: league._id,
            displayOrder: displayOrder++
          })
        })
      })

      const response = await fetch('/api/admin/leagues/display-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save order')
      }

      toast.success(`Display order saved! ${data.updatedCount} leagues updated. Home page will refresh shortly.`)
    } catch (error) {
      console.error('Error saving display order:', error)
      toast.error('Failed to save display order: ' + error.message)
    } finally {
      setSavingOrder(false)
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
  // IMPORTANT: Must initialize ALL cities in a single state update to avoid React batching issues
  useEffect(() => {
    if (leagueSortBy === 'custom' && Object.keys(groupedLeagues).length > 0) {
      setCustomLeagueOrder(prevOrder => {
        const newOrder = { ...prevOrder }
        let hasChanges = false
        
        Object.keys(groupedLeagues).forEach(cityName => {
          // Only initialize if this city doesn't have an order yet
          if (!newOrder[cityName]) {
            const cityLeagues = groupedLeagues[cityName] || []
            newOrder[cityName] = cityLeagues.map(l => l._id)
            hasChanges = true
          }
        })
        
        if (hasChanges) {
          localStorage.setItem('customLeagueOrder', JSON.stringify(newOrder))
        }
        
        return hasChanges ? newOrder : prevOrder
      })
    }
  }, [leagueSortBy, leagues.length]) // Re-run when leagues load

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
            onClick={() => setActiveTab('archive')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'archive'
                ? 'border-parque-purple text-parque-purple'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Archive
            {archivedLeagues.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {archivedLeagues.length}
              </span>
            )}
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
              <div className="text-2xl font-bold text-gray-900">{activeLeagues.length}</div>
              <div className="text-sm text-gray-600">Active Leagues</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{sortedCities.length}</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {activeLeagues.filter(l => l.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Running</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {activeLeagues.filter(l => l.status === 'registration_open').length}
              </div>
              <div className="text-sm text-gray-600">Open for Registration</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-600">{archivedLeagues.length}</div>
              <div className="text-sm text-gray-600">Archived</div>
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

              {/* Save Order Button */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Publish Order to Website:</span>
                  <span className="text-xs text-gray-500">(saves current order to home page)</span>
                </div>
                <button
                  onClick={handleSaveDisplayOrder}
                  disabled={savingOrder}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                    savingOrder
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {savingOrder ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Save Order to Site
                    </>
                  )}
                </button>
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
                        {/* Header Section - TWO ROWS */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100">
                          {/* ROW 1: Sort Arrows + Title */}
                          <div className="flex items-start gap-2 mb-3">
                            {leagueSortBy === 'custom' && (
                              <div className="flex flex-col space-y-1 flex-shrink-0">
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
                            
                            {/* League Name - FULL WIDTH */}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {league.name}
                              </h3>
                              {league.season && (
                                <div className="text-xs text-gray-600 mt-1 capitalize">
                                  {league.season.type} {league.season.year}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* ROW 2: All Badges & Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
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
                            
                            {/* Archive button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleArchiveLeague(league)
                              }}
                              className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                              title="Archive this league"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              Archive
                            </button>
                            
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

      {/* Archive Tab */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Archived Leagues:</strong> These leagues are hidden from the main view. You can restore them or permanently delete them.
                </p>
              </div>
            </div>
          </div>

          {archivedLeagues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No archived leagues</h3>
              <p className="mt-1 text-sm text-gray-500">Archived leagues will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedLeagues.map((league) => (
                <div 
                  key={league._id}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-start justify-between gap-3">
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
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                        ARCHIVED
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="space-y-3 text-sm mb-5">
                      <div className="flex items-center text-gray-600">
                        <span className="text-base mr-2">📍</span>
                        <span>{league.location?.city || 'Unknown'}</span>
                      </div>
                      
                      {league.skillLevel && (
                        <div className="flex items-center text-gray-600">
                          <span className="text-base mr-2">🏆</span>
                          <span>{getSkillLevelName(league.skillLevel)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <span className="text-base mr-2">👥</span>
                        <span>{league.stats?.registeredPlayers || 0} players</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => handleRestoreLeague(league)}
                        className="w-full px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restore League
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(league)}
                        className="w-full px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Permanently Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
