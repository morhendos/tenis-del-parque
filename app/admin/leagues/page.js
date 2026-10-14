'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useLeaguesData from '../../../lib/hooks/useLeaguesData'
import ImportCSVModal from '../../../components/admin/leagues/ImportCSVModal'
import LeagueFormModal from '../../../components/admin/leagues/LeagueFormModal'
import LeagueCityLinker from '../../../components/admin/leagues/LeagueCityLinker'
import LeagueSeasonEditor from '../../../components/admin/leagues/LeagueSeasonEditor'
import { toast } from '@/components/ui/Toast'

const Svg = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const ICONS = {
  plus: 'M12 4v16m8-8H4',
  upload: 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12',
  download: 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 12l4 4m0 0l4-4m-4 4V4',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  pin: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  up: 'M5 15l7-7 7 7',
  down: 'M19 9l-7 7-7-7',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  archive: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  euro: 'M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  rocket: 'M13 10V3L4 14h7v7l9-11h-7z',
  cloud: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
}

const btnSecondary = 'inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors'
const iconBtn = 'p-1.5 rounded-lg text-gray-400 hover:text-parque-purple hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors'

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
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      case 'registration_open':
        return 'bg-purple-50 text-parque-purple ring-purple-200'
      case 'coming_soon':
        return 'bg-amber-50 text-amber-700 ring-amber-200'
      case 'completed':
        return 'bg-indigo-50 text-indigo-700 ring-indigo-200'
      case 'archived':
        return 'bg-gray-50 text-gray-600 ring-gray-200'
      case 'inactive':
        return 'bg-gray-50 text-gray-600 ring-gray-200'
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-200'
    }
  }

  // NEW: Get skill level badge color
  const getSkillLevelBadgeColor = (skillLevel) => {
    switch (skillLevel) {
      case 'beginner':
        return 'bg-orange-50 text-orange-700 ring-orange-200'
      case 'intermediate':
        return 'bg-slate-50 text-slate-700 ring-slate-200'
      case 'advanced':
        return 'bg-amber-50 text-amber-700 ring-amber-200'
      case 'all':
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-200'
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

  // Reconcile stored custom city order with the actual city list:
  // drop cities that no longer exist, append new ones alphabetically
  const cityNames = Object.keys(groupedLeagues)
  const reconciledCityOrder = [
    ...customOrder.filter(n => cityNames.includes(n)),
    ...cityNames.filter(n => !customOrder.includes(n)).sort((a, b) => a.localeCompare(b))
  ]

  // Reconcile stored custom league order for a city with its actual leagues
  const getReconciledLeagueOrder = (cityName) => {
    const ids = (groupedLeagues[cityName] || []).map(l => l._id)
    const stored = customLeagueOrder[cityName] || []
    const kept = stored.filter(id => ids.includes(id))
    const missing = ids.filter(id => !kept.includes(id))
    return [...kept, ...missing]
  }

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
        return reconciledCityOrder.indexOf(a) - reconciledCityOrder.indexOf(b)
      
      default:
        return a.localeCompare(b)
    }
  })

  // Move city up in custom order
  const moveCityUp = (cityName) => {
    const newOrder = [...reconciledCityOrder]
    const currentIndex = newOrder.indexOf(cityName)
    if (currentIndex > 0) {
      newOrder[currentIndex] = newOrder[currentIndex - 1]
      newOrder[currentIndex - 1] = cityName
      setCustomOrder(newOrder)
      localStorage.setItem('leaguesCustomOrder', JSON.stringify(newOrder))
    }
  }

  // Move city down in custom order
  const moveCityDown = (cityName) => {
    const newOrder = [...reconciledCityOrder]
    const currentIndex = newOrder.indexOf(cityName)
    if (currentIndex !== -1 && currentIndex < newOrder.length - 1) {
      newOrder[currentIndex] = newOrder[currentIndex + 1]
      newOrder[currentIndex + 1] = cityName
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

      // Save exactly what is rendered: sortedCities and getSortedLeagues
      // already reflect custom order (reconciled) or whatever sort is active
      sortedCities.forEach(cityName => {
        getSortedLeagues(cityName).forEach(league => {
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
        
        case 'custom': {
          const order = getReconciledLeagueOrder(cityName)
          return order.indexOf(a._id) - order.indexOf(b._id)
        }
        
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }

  // Move league up within city
  const moveLeagueUp = (cityName, leagueId) => {
    const newCityOrder = getReconciledLeagueOrder(cityName)
    const currentIndex = newCityOrder.indexOf(leagueId)
    if (currentIndex > 0) {
      newCityOrder[currentIndex] = newCityOrder[currentIndex - 1]
      newCityOrder[currentIndex - 1] = leagueId
      const newOrder = { ...customLeagueOrder, [cityName]: newCityOrder }
      setCustomLeagueOrder(newOrder)
      localStorage.setItem('customLeagueOrder', JSON.stringify(newOrder))
    }
  }

  // Move league down within city
  const moveLeagueDown = (cityName, leagueId) => {
    const newCityOrder = getReconciledLeagueOrder(cityName)
    const currentIndex = newCityOrder.indexOf(leagueId)
    if (currentIndex !== -1 && currentIndex < newCityOrder.length - 1) {
      newCityOrder[currentIndex] = newCityOrder[currentIndex + 1]
      newCityOrder[currentIndex + 1] = leagueId
      const newOrder = { ...customLeagueOrder, [cityName]: newCityOrder }
      setCustomLeagueOrder(newOrder)
      localStorage.setItem('customLeagueOrder', JSON.stringify(newOrder))
    }
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'archive', label: 'Archive', count: archivedLeagues.length },
            { id: 'city-links', label: 'City connections' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-white text-parque-purple shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] px-1.5 rounded-full text-[11px] font-semibold bg-gray-200 text-gray-700">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setImportModal({ show: true })} className={btnSecondary}>
            <Svg d={ICONS.upload} className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={exportCSV} className={btnSecondary}>
            <Svg d={ICONS.download} className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={handleCreateSeason} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-purple-50 text-parque-purple hover:bg-purple-100 transition-colors">
            <Svg d={ICONS.calendar} className="w-4 h-4" /> Create season
          </button>
          <button onClick={handleCreateNew} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-parque-purple text-white hover:bg-parque-purple/90 shadow-sm transition-colors">
            <Svg d={ICONS.plus} className="w-4 h-4" /> Create league
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Active leagues', value: activeLeagues.length, dot: 'bg-parque-purple' },
              { label: 'Cities', value: sortedCities.length, dot: 'bg-indigo-400' },
              { label: 'Running', value: activeLeagues.filter(l => l.status === 'active').length, dot: 'bg-emerald-500' },
              { label: 'Registration open', value: activeLeagues.filter(l => l.status === 'registration_open').length, dot: 'bg-purple-400' },
              { label: 'Archived', value: archivedLeagues.length, dot: 'bg-gray-300' }
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5">
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Grouped Leagues by City */}
          <div className="space-y-6">
            {/* Sort Options */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 w-14">Cities</span>
                <div className="inline-flex rounded-xl bg-gray-100 p-1">
                  {[['alphabetical', 'A-Z'], ['leagues', 'Leagues'], ['players', 'Players'], ['custom', 'Custom']].map(([key, label]) => (
                    <button key={key} onClick={() => handleSortChange(key)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${sortBy === key ? 'bg-white text-parque-purple shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 w-14">Leagues</span>
                <div className="inline-flex rounded-xl bg-gray-100 p-1">
                  {[['name', 'Name'], ['players', 'Players'], ['status', 'Status'], ['custom', 'Custom']].map(([key, label]) => (
                    <button key={key} onClick={() => handleLeagueSortChange(key)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${leagueSortBy === key ? 'bg-white text-parque-purple shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{label}</button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSaveDisplayOrder}
                disabled={savingOrder}
                title="Saves the current order to the home page"
                className="lg:ml-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl border border-parque-purple/30 text-parque-purple hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingOrder ? (
                  <span className="w-4 h-4 rounded-full border-2 border-parque-purple border-t-transparent animate-spin" />
                ) : (
                  <Svg d={ICONS.cloud} className="w-4 h-4" />
                )}
                {savingOrder ? 'Saving...' : 'Publish order to site'}
              </button>
            </div>

            {/* Cities and Leagues */}
            <div className="space-y-8">
            {sortedCities.map((cityName, index) => (
              <div key={cityName} className="space-y-3">
                {/* City Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-parque-purple flex items-center justify-center">
                      <Svg d={ICONS.pin} className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{cityName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {groupedLeagues[cityName].length} {groupedLeagues[cityName].length === 1 ? 'league' : 'leagues'}
                    </span>
                  </div>
                  {sortBy === 'custom' && (
                    <div className="flex gap-1">
                      <button onClick={() => moveCityUp(cityName)} disabled={index === 0} className={iconBtn} title="Move up">
                        <Svg d={ICONS.up} className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveCityDown(cityName)} disabled={index === sortedCities.length - 1} className={iconBtn} title="Move down">
                        <Svg d={ICONS.down} className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Leagues Grid for this City */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSortedLeagues(cityName).map((league, leagueIndex) => {
                    const playerCount = league.stats?.registeredPlayers || league.playerCount || 0
                    const maxPlayers = league.seasonConfig?.maxPlayers
                    const sortedLeagues = getSortedLeagues(cityName)
                    const fill = maxPlayers ? Math.min(100, Math.round(playerCount / maxPlayers * 100)) : 0

                    return (
                      <div
                        key={league._id}
                        onClick={() => handleLeagueClick(league._id, league.name)}
                        title={`Manage ${league.name}`}
                        className="group bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer flex flex-col"
                      >
                        <div className="p-5 flex-1">
                          <div className="flex items-start gap-2">
                            {leagueSortBy === 'custom' && (
                              <div className="flex flex-col -ml-1 flex-shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); moveLeagueUp(cityName, league._id) }} disabled={leagueIndex === 0} className="p-0.5 rounded text-gray-400 hover:text-parque-purple hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent" title="Move league up">
                                  <Svg d={ICONS.up} className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); moveLeagueDown(cityName, league._id) }} disabled={leagueIndex === sortedLeagues.length - 1} className="p-0.5 rounded text-gray-400 hover:text-parque-purple hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent" title="Move league down">
                                  <Svg d={ICONS.down} className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-bold text-gray-900 leading-tight truncate">{league.name}</h4>
                              {league.season && (
                                <p className="text-xs text-gray-500 mt-0.5 capitalize">{league.season.type} {league.season.year}</p>
                              )}
                            </div>
                            <div className="flex gap-0.5 -mr-1.5 -mt-1">
                              <button onClick={(e) => { e.stopPropagation(); handleEditClick(e, league) }} className={iconBtn} title="Edit league settings">
                                <Svg d={ICONS.edit} className="w-4 h-4" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleArchiveLeague(league) }} className={iconBtn} title="Archive this league">
                                <Svg d={ICONS.archive} className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ring-1 whitespace-nowrap ${getStatusBadgeColor(league.status)}`}>
                              {league.status === 'registration_open' ? 'Registration open' :
                               league.status === 'coming_soon' ? 'Coming soon' :
                               (league.status || '').replace('_', ' ').replace(/^./, c => c.toUpperCase())}
                            </span>
                            {league.skillLevel && league.skillLevel !== 'all' && (
                              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ring-1 whitespace-nowrap ${getSkillLevelBadgeColor(league.skillLevel)}`}>
                                {getSkillLevelName(league.skillLevel)}
                              </span>
                            )}
                          </div>

                          <div className="mt-4 space-y-2.5 text-sm text-gray-600">
                            {league.status === 'coming_soon' && league.expectedLaunchDate && (
                              <div className="flex items-center gap-2.5">
                                <Svg d={ICONS.rocket} className="w-4 h-4 text-gray-400" />
                                <span>Launch {new Date(league.expectedLaunchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                            )}
                            {league.seasonConfig?.startDate && (
                              <div className="flex items-center gap-2.5">
                                <Svg d={ICONS.calendar} className="w-4 h-4 text-gray-400" />
                                <span className="truncate">
                                  {new Date(league.seasonConfig.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  {league.seasonConfig.endDate && ` - ${new Date(league.seasonConfig.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                </span>
                              </div>
                            )}
                            {(league.status === 'active' || league.status === 'registration_open') && (
                              <div className="flex items-center gap-2.5">
                                <Svg d={ICONS.euro} className="w-4 h-4 text-gray-400" />
                                {league.seasonConfig?.price?.isFree ? (
                                  <span className="text-emerald-600 font-medium">Free</span>
                                ) : league.seasonConfig?.price?.amount > 0 ? (
                                  <span className="font-medium text-gray-900">{league.seasonConfig.price.amount}€</span>
                                ) : (
                                  <span className="text-gray-400">Price not set</span>
                                )}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2.5">
                                <Svg d={ICONS.users} className="w-4 h-4 text-gray-400" />
                                <span>
                                  <span className="font-semibold text-gray-900">{playerCount}</span> players
                                  {maxPlayers && <span className="text-gray-400"> / {maxPlayers}</span>}
                                </span>
                              </div>
                              {maxPlayers > 0 && (
                                <div className="mt-2 ml-[1.625rem] h-1 rounded-full bg-gray-100 overflow-hidden">
                                  <div className="h-full rounded-full bg-parque-purple/70" style={{ width: `${fill}%` }} />
                                </div>
                              )}
                            </div>
                            {league.waitingListCount > 0 && (
                              <div className="flex items-center gap-2.5 text-amber-700">
                                <Svg d={ICONS.clock} className="w-4 h-4" />
                                <span className="font-medium">{league.waitingListCount} on waiting list</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMatchesClick(e, league._id, league.name) }}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl bg-parque-purple text-white hover:bg-parque-purple/90 transition-colors"
                          >
                            <Svg d={ICONS.calendar} className="w-4 h-4" /> Matches
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePlayersClick(e, league._id, league.name) }}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl bg-purple-50 text-parque-purple hover:bg-purple-100 transition-colors"
                          >
                            <Svg d={ICONS.users} className="w-4 h-4" /> Players
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
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
