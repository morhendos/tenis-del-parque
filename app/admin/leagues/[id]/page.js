'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import LeagueSeasonEditor from '../../../../components/admin/leagues/LeagueSeasonEditor'
import SeasonStartEmailModal from '../../../../components/admin/leagues/SeasonStartEmailModal'

const Svg = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const IC = {
  back: 'M15 19l-7-7 7-7',
  overview: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  players: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  matches: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  playoffs: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  euro: 'M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z',
  status: 'M13 10V3L4 14h7v7l9-11h-7z',
  tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
}

export default function LeagueManagementPage() {
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showSeasonEditor, setShowSeasonEditor] = useState(false)
  const [showSeasonStartEmail, setShowSeasonStartEmail] = useState(false)
  const [skillLevelEditing, setSkillLevelEditing] = useState(false)
  const [tempSkillLevel, setTempSkillLevel] = useState('')
  
  // Playoff configuration editing states
  const [playoffEditing, setPlayoffEditing] = useState(false)
  const [tempPlayoffConfig, setTempPlayoffConfig] = useState({})
  
  // Status editing states
  const [statusEditing, setStatusEditing] = useState(false)
  const [tempStatus, setTempStatus] = useState('')
  
  const params = useParams()
  const router = useRouter()
  const leagueId = params.id

  useEffect(() => {
    fetchLeague()
  }, [leagueId])

  const fetchLeague = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/leagues')
      if (!res.ok) throw new Error('Failed to fetch leagues')
      
      const data = await res.json()
      const foundLeague = data.leagues?.find(l => l._id === leagueId)
      
      if (!foundLeague) {
        setError('League not found')
        return
      }
      
      setLeague(foundLeague)
      
      // Store league in session for consistency with other pages
      sessionStorage.setItem('selectedLeague', JSON.stringify({ 
        id: foundLeague._id, 
        name: foundLeague.name,
        season: foundLeague.season
      }))
      
    } catch (error) {
      console.error('Error fetching league:', error)
      setError('Error loading league')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'players', name: 'Players', icon: '👥' },
    { id: 'matches', name: 'Matches', icon: '🎾' },
    { id: 'playoffs', name: 'Playoffs', icon: '🏆' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'players') {
      router.push(`/admin/players?league=${leagueId}`)
    } else if (tabId === 'matches') {
      router.push(`/admin/matches?league=${leagueId}`)
    } else if (tabId === 'playoffs') {
      router.push(`/admin/leagues/${leagueId}/playoffs`)
    }
  }

  // Skill level editing functions
  const handleSkillLevelEdit = () => {
    setTempSkillLevel(league.skillLevel || 'all')
    setSkillLevelEditing(true)
  }

  const handleSkillLevelCancel = () => {
    setSkillLevelEditing(false)
    setTempSkillLevel('')
  }

  const handleSkillLevelSave = async () => {
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillLevel: tempSkillLevel })
      })

      if (!response.ok) {
        throw new Error('Failed to update skill level')
      }

      const result = await response.json()
      setLeague(result.league)
      setSkillLevelEditing(false)
      setTempSkillLevel('')
      
      // Show success message
      alert('Skill level updated successfully!')
      
    } catch (error) {
      console.error('Error updating skill level:', error)
      alert('Error updating skill level: ' + error.message)
    }
  }

  // Playoff configuration editing functions
  const handlePlayoffEdit = () => {
    setTempPlayoffConfig({
      enabled: league?.playoffConfig?.enabled ?? true,
      numberOfGroups: league?.playoffConfig?.numberOfGroups ?? 1,
      groupAPlayers: league?.playoffConfig?.groupAPlayers ?? 8,
      groupBPlayers: league?.playoffConfig?.groupBPlayers ?? 8
    })
    setPlayoffEditing(true)
  }

  const handlePlayoffCancel = () => {
    setPlayoffEditing(false)
    setTempPlayoffConfig({})
  }

  const handlePlayoffSave = async () => {
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playoffConfig: {
            ...league.playoffConfig,
            ...tempPlayoffConfig
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update playoff configuration')
      }

      const result = await response.json()
      setLeague(result.league)
      setPlayoffEditing(false)
      setTempPlayoffConfig({})
      
      // Show success message
      alert('Playoff configuration updated successfully!')
      
    } catch (error) {
      console.error('Error updating playoff configuration:', error)
      alert('Error updating playoff configuration: ' + error.message)
    }
  }

  // Status editing functions
  const handleStatusEdit = () => {
    setTempStatus(league.status || 'active')
    setStatusEditing(true)
  }

  const handleStatusCancel = () => {
    setStatusEditing(false)
    setTempStatus('')
  }

  const handleStatusSave = async () => {
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: tempStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const result = await response.json()
      setLeague(result.league)
      setStatusEditing(false)
      setTempStatus('')
      
      alert('League status updated successfully!')
      
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status: ' + error.message)
    }
  }

  // Helper function for status display
  const getStatusInfo = (status) => {
    const statuses = {
      'active': { name: 'Active', color: 'bg-green-50 text-green-700 border-green-200', description: 'League is currently running' },
      'registration_open': { name: 'Registration Open', color: 'bg-purple-50 text-purple-700 border-purple-200', description: 'Accepting new player registrations' },
      'coming_soon': { name: 'Coming Soon', color: 'bg-blue-50 text-blue-700 border-blue-200', description: 'League announced but not yet open' },
      'completed': { name: 'Completed', color: 'bg-gray-50 text-gray-700 border-gray-200', description: 'Season has ended' },
      'archived': { name: 'Archived', color: 'bg-gray-50 text-gray-500 border-gray-200', description: 'Historical league, hidden from public' },
      'inactive': { name: 'Inactive', color: 'bg-red-50 text-red-700 border-red-200', description: 'League is paused or disabled' }
    }
    return statuses[status] || { name: status, color: 'bg-gray-50 text-gray-700 border-gray-200', description: '' }
  }

  // Helper functions for skill level display
  const getSkillLevelName = (skillLevel) => {
    const names = {
      'all': 'All Levels',
      'beginner': 'Beginner',
      'intermediate': 'Intermediate', 
      'advanced': 'Advanced'
    }
    return names[skillLevel] || skillLevel
  }

  const getSkillLevelBadgeColor = (skillLevel) => {
    switch (skillLevel) {
      case 'beginner':
        return 'bg-green-50 border-green-200'
      case 'intermediate':
        return 'bg-yellow-50 border-yellow-200'
      case 'advanced':
        return 'bg-red-50 border-red-200'
      case 'all':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  // Get playoff phase display
  const getPlayoffPhaseDisplay = () => {
    const phase = league?.playoffConfig?.currentPhase || 'regular_season'
    const phases = {
      'regular_season': { text: 'Regular Season', color: '' },
      'playoffs_groupA': { text: 'Playoffs - Group A', color: '' },
      'playoffs_groupB': { text: 'Playoffs - Group B', color: '' },
      'completed': { text: 'Season Completed', color: 'text-green-600' }
    }
    return phases[phase] || { text: phase, color: 'text-gray-600' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading league...</div>
      </div>
    )
  }

  if (error || !league) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'League not found'}</p>
        <button 
          onClick={() => router.push('/admin/leagues')}
          className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
        >
          Back to Leagues
        </button>
      </div>
    )
  }

  const currentSeason = league.seasons?.find(s => s.status === 'registration_open' || s.status === 'active') || league.seasons?.[0]
  const playoffPhase = getPlayoffPhaseDisplay()

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => router.push('/admin/leagues')}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-parque-purple transition-colors"
      >
        <Svg d={IC.back} className="w-4 h-4" />
        Leagues
      </button>

      {/* League Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 p-6 text-white shadow-lg shadow-purple-900/10">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-200">
              {[league.location?.city, league.location?.region].filter(Boolean).join(', ')}
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-tight">{league.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 ring-1 ring-white/25">
                {getStatusInfo(league.status).name}
              </span>
              {league.skillLevel && league.skillLevel !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 ring-1 ring-white/25">
                  {getSkillLevelName(league.skillLevel)}
                </span>
              )}
              {league.season && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 ring-1 ring-white/25 capitalize">
                  {league.season.type} {league.season.year}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold tabular-nums leading-none">{league.playerCount || 0}</p>
            <p className="mt-1 text-sm text-purple-200">players · {playoffPhase.text}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="border-b border-gray-100 px-2 sm:px-4 overflow-x-auto">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-3.5 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-parque-purple text-parque-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Svg d={IC[tab.id]} className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Players',
                    value: league.playerCount || 0,
                    sub: league.seasonConfig?.maxPlayers ? `of ${league.seasonConfig.maxPlayers} max` : null,
                    icon: IC.players
                  },
                  {
                    label: 'Price',
                    value: league.seasonConfig?.price?.isFree ? 'Free' : (league.seasonConfig?.price?.amount > 0 ? `${league.seasonConfig.price.amount}€` : '-'),
                    icon: IC.euro
                  },
                  { label: 'Status', value: getStatusInfo(league.status).name, small: true, icon: IC.status },
                  { label: 'Phase', value: playoffPhase.text, small: true, icon: IC.playoffs }
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-500">{s.label}</p>
                      <span className="text-parque-purple/60"><Svg d={s.icon} className="w-4 h-4" /></span>
                    </div>
                    <p className={`mt-1.5 font-bold text-gray-900 ${s.small ? 'text-base' : 'text-2xl tabular-nums'}`}>{s.value}</p>
                    {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { title: 'Players', desc: 'View and edit the player list', icon: IC.players, onClick: () => handleTabClick('players') },
                    { title: 'Matches', desc: 'Rounds, results and deadlines', icon: IC.matches, onClick: () => handleTabClick('matches') },
                    { title: 'Playoffs', desc: 'Bracket and settings', icon: IC.playoffs, onClick: () => router.push(`/admin/leagues/${leagueId}/playoffs`), dot: league?.playoffConfig?.currentPhase && league.playoffConfig.currentPhase !== 'regular_season' },
                    { title: 'Discount codes', desc: 'Promo and loyalty codes', icon: IC.tag, onClick: () => router.push(`/admin/leagues/${leagueId}/discounts`), count: league?.discountCodes?.filter(d => d.isActive).length || 0 },
                    { title: 'Season start email', desc: 'Notify players about Round 1', icon: IC.mail, onClick: () => setShowSeasonStartEmail(true) },
                    { title: 'Settings', desc: 'Status, levels and playoffs', icon: IC.settings, onClick: () => handleTabClick('settings') }
                  ].map(a => (
                    <button
                      key={a.title}
                      onClick={a.onClick}
                      className="group relative flex items-center gap-3 rounded-2xl border border-gray-100 p-4 text-left hover:border-purple-200 hover:shadow-sm transition"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 text-parque-purple flex items-center justify-center group-hover:bg-parque-purple group-hover:text-white transition-colors">
                        <Svg d={a.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-500 truncate">{a.desc}</p>
                      </div>
                      {a.count > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-parque-purple">{a.count}</span>
                      )}
                      {a.dot && <span className="ml-auto w-2 h-2 rounded-full bg-parque-purple animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* League Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">League details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 rounded-2xl border border-gray-100 px-5 py-1">
                  {[
                    ['Location', [league.location?.city, league.location?.region].filter(Boolean).join(', ')],
                    ['Skill level', getSkillLevelName(league.skillLevel || 'all')],
                    ['Season', league.seasonConfig?.startDate
                      ? `${new Date(league.seasonConfig.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}${league.seasonConfig.endDate ? ` - ${new Date(league.seasonConfig.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}`
                      : (currentSeason?.startDate ? new Date(currentSeason.startDate).toLocaleDateString('en-GB') : 'TBD')],
                    ['Registration closes', league.seasonConfig?.registrationEnd ? new Date(league.seasonConfig.registrationEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'],
                    ['Max players', league.seasonConfig?.maxPlayers || '-'],
                    ['Playoff groups', league?.playoffConfig?.numberOfGroups || 1],
                    ['Phase', playoffPhase.text],
                    ['Created', league.createdAt ? new Date(league.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-']
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0 md:[&:nth-last-child(2)]:border-0">
                      <dt className="text-sm text-gray-500">{k}</dt>
                      <dd className="text-sm font-medium text-gray-900 text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Discount Codes Summary */}
              {league?.discountCodes && league.discountCodes.filter(d => d.isActive).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Active promotions</h3>
                    <button
                      onClick={() => router.push(`/admin/leagues/${leagueId}/discounts`)}
                      className="text-sm font-medium text-parque-purple hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {league.discountCodes.filter(d => d.isActive).slice(0, 3).map((discount) => (
                      <div key={discount.code} className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-parque-purple bg-purple-50 px-2 py-0.5 rounded-lg border border-dashed border-purple-200">{discount.code}</span>
                          <span className="text-sm font-bold text-gray-900">-{discount.discountPercentage}%</span>
                        </div>
                        {discount.description && <p className="mt-2 text-xs text-gray-500 truncate">{discount.description}</p>}
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                          <span>Used {discount.usedCount || 0}{discount.maxUses ? ` / ${discount.maxUses}` : ''}</span>
                          {discount.validUntil && (
                            <span>Until {new Date(discount.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {league.discountCodes.filter(d => d.isActive).length > 3 && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      + {league.discountCodes.filter(d => d.isActive).length - 3} more active codes
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* League Status Management */}
              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">League Status</h3>
                  <p className="text-sm text-gray-600">Control the current status of this league</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                      {!statusEditing ? (
                        <div className="flex items-center gap-3">
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded border ${getStatusInfo(league.status).color}`}>
                            {getStatusInfo(league.status).name}
                          </span>
                          <p className="text-sm text-gray-600">
                            {getStatusInfo(league.status).description}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 flex-wrap">
                          <select
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-parque-purple"
                          >
                            <option value="coming_soon">Coming Soon</option>
                            <option value="registration_open">Registration Open</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleStatusSave}
                              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleStatusCancel}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!statusEditing && (
                      <button
                        onClick={handleStatusEdit}
                        className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Change Status
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h5 className="font-medium text-amber-900 mb-2">Status Guide</h5>
                    <div className="text-sm text-amber-800 space-y-1">
                      <p><strong>Coming Soon:</strong> League announced, not accepting registrations yet</p>
                      <p><strong>Registration Open:</strong> Accepting new player registrations</p>
                      <p><strong>Active:</strong> Season is in progress with matches being played</p>
                      <p><strong>Completed:</strong> Season has ended - use this to mark a finished league</p>
                      <p><strong>Archived:</strong> Historical record, hidden from public listings</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Season Management */}
              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Season Management</h3>
                  <p className="text-sm text-gray-600">Configure season information and dates</p>
                </div>
                <div className="p-6">
                  {/* Current Season Info */}
                  {league.season ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-green-800 mb-2">✅ Season Data Available</h4>
                      <div className="text-sm text-green-700 space-y-1">
                        <p><strong>Season:</strong> {league.season.type} {league.season.year}</p>
                        {league.seasonConfig?.startDate && (
                          <p><strong>Dates:</strong> {new Date(league.seasonConfig.startDate).toLocaleDateString()} - {new Date(league.seasonConfig.endDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-yellow-800 mb-2">⚠️ Missing Season Data</h4>
                      <p className="text-sm text-yellow-700">
                        This league doesn&apos;t have season information. Add season data to enable proper URL generation and functionality.
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowSeasonEditor(true)}
                    className="bg-parque-purple text-white px-6 py-3 rounded-lg hover:bg-parque-purple/90 transition-colors"
                  >
                    {league.season ? 'Edit Season Data' : 'Add Season Data'}
                  </button>
                </div>
              </div>
              
              {/* Skill Level Management */}
              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Skill Level Management</h3>
                  <p className="text-sm text-gray-600">Configure the target skill level for this league</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">Current Skill Level</h4>
                      {!skillLevelEditing ? (
                        <div className="flex items-center gap-3">
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded border ${getSkillLevelBadgeColor(league.skillLevel || 'all')}`}>
                            {getSkillLevelName(league.skillLevel || 'all')}
                          </span>
                          <p className="text-sm text-gray-600">
                            {league.skillLevel === 'all' || !league.skillLevel 
                              ? 'This league accepts players of all skill levels'
                              : `This league is targeted for ${getSkillLevelName(league.skillLevel).toLowerCase()} players`
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <select
                            value={tempSkillLevel}
                            onChange={(e) => setTempSkillLevel(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-parque-purple"
                          >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSkillLevelSave}
                              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleSkillLevelCancel}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!skillLevelEditing && (
                      <button
                        onClick={handleSkillLevelEdit}
                        className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Edit Skill Level
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">💡 Skill Level Guide</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>All Levels:</strong> Open to players of any skill level</p>
                      <p><strong>Beginner:</strong> New players or those learning the basics</p>
                      <p><strong>Intermediate:</strong> Players with solid fundamentals and some experience</p>
                      <p><strong>Advanced:</strong> Experienced players with strong technical skills</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Playoff Configuration */}
              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Playoff Configuration</h3>
                  <p className="text-sm text-gray-600">Configure playoff structure and settings</p>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-3">Current Playoff Settings</h4>
                      {!playoffEditing ? (
                        <div className="space-y-3">
                          {/* Playoff Status */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600">Status:</span>
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-lg ${
                              league?.playoffConfig?.enabled !== false
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {league?.playoffConfig?.enabled !== false ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          
                          {league?.playoffConfig?.enabled !== false && (
                            <>
                              {/* Number of Groups */}
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">Playoff Groups:</span>
                                <span className="text-sm text-gray-900">
                                  {league?.playoffConfig?.numberOfGroups === 2 ? 'Group A & Group B' : 'Group A Only'}
                                </span>
                              </div>
                              
                              {/* Group Sizes */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <span className="text-sm font-medium text-gray-600">Group A Players:</span>
                                  <div className="text-lg font-bold text-gray-900">
                                    {league?.playoffConfig?.groupAPlayers || 8}
                                  </div>
                                  <span className="text-xs text-gray-500">Top performers</span>
                                </div>
                                
                                {league?.playoffConfig?.numberOfGroups === 2 && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <span className="text-sm font-medium text-gray-600">Group B Players:</span>
                                    <div className="text-lg font-bold text-gray-900">
                                      {league?.playoffConfig?.groupBPlayers || 8}
                                    </div>
                                    <span className="text-xs text-gray-500">Middle tier players</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Enable/Disable Playoffs */}
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="playoffEnabled"
                              checked={tempPlayoffConfig.enabled}
                              onChange={(e) => setTempPlayoffConfig({ ...tempPlayoffConfig, enabled: e.target.checked })}
                              className="w-4 h-4 text-parque-purple focus:ring-parque-purple border-gray-300 rounded"
                            />
                            <label htmlFor="playoffEnabled" className="text-sm font-medium text-gray-700">
                              Enable Playoffs
                            </label>
                          </div>
                          
                          {tempPlayoffConfig.enabled && (
                            <>
                              {/* Number of Groups */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Playoff Structure
                                </label>
                                <select
                                  value={tempPlayoffConfig.numberOfGroups}
                                  onChange={(e) => setTempPlayoffConfig({ ...tempPlayoffConfig, numberOfGroups: parseInt(e.target.value) })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-parque-purple"
                                >
                                  <option value={1}>Single Group (Group A only)</option>
                                  <option value={2}>Two Groups (Group A & Group B)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                  {tempPlayoffConfig.numberOfGroups === 2 
                                    ? 'Two separate tournaments for different skill levels'
                                    : 'Single tournament for top players only'
                                  }
                                </p>
                              </div>
                              
                              {/* Group A Players */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Group A Players (Top Tier)
                                </label>
                                <input
                                  type="number"
                                  min="4"
                                  max="16"
                                  value={tempPlayoffConfig.groupAPlayers}
                                  onChange={(e) => setTempPlayoffConfig({ ...tempPlayoffConfig, groupAPlayers: parseInt(e.target.value) })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-parque-purple"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Number of top-ranked players qualifying for Group A playoffs
                                </p>
                              </div>
                              
                              {/* Group B Players (if enabled) */}
                              {tempPlayoffConfig.numberOfGroups === 2 && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Group B Players (Middle Tier)
                                  </label>
                                  <input
                                    type="number"
                                    min="4"
                                    max="16"
                                    value={tempPlayoffConfig.groupBPlayers}
                                    onChange={(e) => setTempPlayoffConfig({ ...tempPlayoffConfig, groupBPlayers: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-parque-purple"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Number of middle-ranked players qualifying for Group B playoffs
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Save/Cancel buttons */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={handlePlayoffSave}
                              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors text-sm"
                            >
                              Save Configuration
                            </button>
                            <button
                              onClick={handlePlayoffCancel}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!playoffEditing && (
                      <button
                        onClick={handlePlayoffEdit}
                        className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Edit Configuration
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-2">🏆 Playoff Configuration Guide</h5>
                    <div className="text-sm text-purple-800 space-y-1">
                      <p><strong>Single Group:</strong> Only the top players compete in playoffs (traditional format)</p>
                      <p><strong>Two Groups:</strong> Separate tournaments for different skill levels (more inclusive)</p>
                      <p><strong>Group A:</strong> Top-ranked players compete for the championship</p>
                      <p><strong>Group B:</strong> Middle-tier players compete in their own tournament</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Settings */}
              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Other Settings</h3>
                  <p className="text-sm text-gray-600">Additional league configuration options</p>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">
                      Additional settings like scoring system and other options coming soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Season Editor Modal */}
      {showSeasonEditor && (
        <LeagueSeasonEditor
          leagueId={leagueId}
          onClose={() => setShowSeasonEditor(false)}
          onUpdate={(updatedLeague) => {
            setLeague(updatedLeague)
            setShowSeasonEditor(false)
            // Refresh the page to show updated data
            fetchLeague()
          }}
        />
      )}

      {/* Season Start Email Modal */}
      <SeasonStartEmailModal
        isOpen={showSeasonStartEmail}
        onClose={() => setShowSeasonStartEmail(false)}
        leagueId={leagueId}
        leagueName={league?.name}
      />
    </div>
  )
} 