'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import LeagueSeasonEditor from '../../../../components/admin/leagues/LeagueSeasonEditor'

export default function LeagueManagementPage() {
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showSeasonEditor, setShowSeasonEditor] = useState(false)
  const [skillLevelEditing, setSkillLevelEditing] = useState(false)
  const [tempSkillLevel, setTempSkillLevel] = useState('')
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
        name: foundLeague.name 
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
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'players') {
      router.push(`/admin/players?league=${leagueId}`)
    } else if (tabId === 'matches') {
      router.push(`/admin/matches?league=${leagueId}`)
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
        method: 'PUT',
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

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => router.push('/admin/leagues')}
          className="flex items-center text-gray-600 hover:text-parque-purple transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Leagues
        </button>
      </div>

      {/* League Header */}
      <div className="bg-gradient-to-r from-parque-purple to-parque-green rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{league.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-parque-bg opacity-90">
                {league.location?.city}, {league.location?.region}
              </p>
              {league.skillLevel && league.skillLevel !== 'all' && (
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getSkillLevelBadgeColor(league.skillLevel)} bg-white bg-opacity-20 border-white border-opacity-30`}>
                  {getSkillLevelName(league.skillLevel)}
                </span>
              )}
            </div>
            {currentSeason && (
              <p className="mt-1 text-parque-bg opacity-90">
                {currentSeason.name} • {currentSeason.status.replace('_', ' ').toUpperCase()}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{league.playerCount || 0}</div>
            <div className="text-sm opacity-90">Players</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-parque-purple text-parque-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👥</span>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Players</p>
                      <p className="text-2xl font-bold text-gray-900">{league.playerCount || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎾</span>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Matches</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏆</span>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Round</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Season Status</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">
                        {currentSeason?.status?.replace('_', ' ') || 'No Season'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleTabClick('players')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl mr-3">👥</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Manage Players</p>
                      <p className="text-sm text-gray-600">View and edit player list</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTabClick('matches')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl mr-3">🎾</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Manage Matches</p>
                      <p className="text-sm text-gray-600">Schedule and track matches</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push(`/admin/matches/generate-round?league=${leagueId}`)}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl mr-3">🎯</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Generate Round</p>
                      <p className="text-sm text-gray-600">Create new match round</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTabClick('settings')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl mr-3">⚙️</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">League Settings</p>
                      <p className="text-sm text-gray-600">Configure league options</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* League Information */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">League Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Basic Details</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Name:</dt>
                        <dd className="font-medium">{league.name}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Location:</dt>
                        <dd className="font-medium">{league.location?.city}, {league.location?.region}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Skill Level:</dt>
                        <dd className="font-medium">{getSkillLevelName(league.skillLevel || 'all')}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Created:</dt>
                        <dd className="font-medium">{new Date(league.createdAt).toLocaleDateString()}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  {currentSeason && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current Season</h4>
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-gray-600">Season:</dt>
                          <dd className="font-medium">{currentSeason.name}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Status:</dt>
                          <dd className="font-medium capitalize">{currentSeason.status.replace('_', ' ')}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Start Date:</dt>
                          <dd className="font-medium">
                            {currentSeason.startDate ? new Date(currentSeason.startDate).toLocaleDateString() : 'TBD'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
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
                        <p><strong>Type:</strong> {league.season.type} {league.season.year}</p>
                        <p><strong>Number:</strong> Season {league.season.number}</p>
                        {league.seasonConfig?.startDate && (
                          <p><strong>Dates:</strong> {new Date(league.seasonConfig.startDate).toLocaleDateString()} - {new Date(league.seasonConfig.endDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-yellow-800 mb-2">⚠️ Missing Season Data</h4>
                      <p className="text-sm text-yellow-700">
                        This league doesn't have season information. Add season data to enable proper URL generation and functionality.
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
              
              {/* Other Settings */}
              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Other Settings</h3>
                  <p className="text-sm text-gray-600">Additional league configuration options</p>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">
                      Additional settings like scoring system, playoff configuration, and other options coming soon.
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
    </div>
  )
} 