import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

export default function usePlayersData() {
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [leagues, setLeagues] = useState([])
  const [updateLoading, setUpdateLoading] = useState({})
  const [invitationLoading, setInvitationLoading] = useState({})
  const [invitationResult, setInvitationResult] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    status: '',
    league: '',
    sortBy: 'name-asc'
  })
  
  const searchParams = useSearchParams()
  const leagueParam = searchParams.get('league')

  const fetchLeagues = async () => {
    try {
      const res = await fetch('/api/admin/leagues')
      if (res.ok) {
        const data = await res.json()
        setLeagues(data.leagues || [])
      }
    } catch (error) {
      console.error('Error fetching leagues:', error)
    }
  }

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      let url = '/api/admin/players'
      
      // Add league filter to API request if we have one
      const params = new URLSearchParams()
      if (leagueParam) {
        params.append('league', leagueParam)
      }
      if (params.toString()) {
        url += '?' + params.toString()
      }
      
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch players')
      
      const data = await res.json()
      console.log('Fetched players:', data)
      setPlayers(data.players || [])
      setFilteredPlayers(data.players || [])
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeagues()
    fetchPlayers()
  }, [leagueParam]) // Re-fetch when league parameter changes

  useEffect(() => {
    // Apply filters
    let filtered = [...players]
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(search) ||
        player.email.toLowerCase().includes(search) ||
        player.whatsapp.includes(search)
      )
    }
    
    if (filters.level) {
      filtered = filtered.filter(player => player.level === filters.level)
    }
    
    if (filters.status) {
      filtered = filtered.filter(player => player.status === filters.status)
    }
    
    // Note: League filtering is now handled server-side via URL parameter
    // The dropdown should update the URL rather than filter client-side
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
        case 'name-desc':
          return (b.name || '').toLowerCase().localeCompare((a.name || '').toLowerCase())
        case 'email-asc':
          return (a.email || '').toLowerCase().localeCompare((b.email || '').toLowerCase())
        case 'email-desc':
          return (b.email || '').toLowerCase().localeCompare((a.email || '').toLowerCase())
        case 'level-asc':
          const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
          return (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0)
        case 'level-desc':
          const levelOrderDesc = { 'beginner': 3, 'intermediate': 2, 'advanced': 1 }
          return (levelOrderDesc[a.level] || 0) - (levelOrderDesc[b.level] || 0)
        case 'status-asc':
          return (a.status || '').localeCompare(b.status || '')
        case 'status-desc':
          return (b.status || '').localeCompare(a.status || '')
        case 'elo-asc':
          return (a.stats?.eloRating || 1200) - (b.stats?.eloRating || 1200)
        case 'elo-desc':
          return (b.stats?.eloRating || 1200) - (a.stats?.eloRating || 1200)
        case 'created-asc':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        case 'created-desc':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        default:
          return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
      }
    })
    
    setFilteredPlayers(filtered)
  }, [filters, players, leagueParam])

  const handleStatusUpdate = async (playerId, newStatus) => {
    const loadingKey = `status-${playerId}`
    setUpdateLoading(prev => ({ ...prev, [loadingKey]: true }))
    
    try {
      // Get current league context
      const currentLeagueId = leagueParam || filters.league
      
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          leagueId: currentLeagueId // Pass league context to API
        })
      })
      
      if (res.ok) {
        // Update local state
        setPlayers(players.map(p => 
          p._id === playerId ? { ...p, status: newStatus } : p
        ))
        
        // Refresh data to get updated league counts
        setTimeout(() => {
          fetchPlayers()
        }, 500)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update player status')
      }
    } catch (error) {
      console.error('Error updating player:', error)
      alert('Error updating player status')
    } finally {
      setUpdateLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleLevelUpdate = async (playerId, newLevel) => {
    const loadingKey = `level-${playerId}`
    setUpdateLoading(prev => ({ ...prev, [loadingKey]: true }))
    
    try {
      // Get current league context
      const currentLeagueId = leagueParam || filters.league
      
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          level: newLevel,
          leagueId: currentLeagueId // Pass league context to API
        })
      })
      
      if (res.ok) {
        setPlayers(players.map(p => 
          p._id === playerId ? { ...p, level: newLevel } : p
        ))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update player level')
      }
    } catch (error) {
      console.error('Error updating player level:', error)
      alert('Error updating player level')
    } finally {
      setUpdateLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleInvitePlayer = async (playerId, forceReinvite = false) => {
    const loadingKey = `invite-${playerId}`
    setInvitationLoading(prev => ({ ...prev, [loadingKey]: true }))
    
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerIds: [playerId],
          forceReinvite: forceReinvite
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        setPlayers(players.map(p => 
          p._id === playerId ? { ...p, status: 'confirmed', userId: data.invitations?.[0]?.userId || 'pending' } : p
        ))
        setInvitationResult(data.invitations?.[0] || null)
      } else {
        alert(data.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error inviting player:', error)
      alert('Error sending invitation')
    } finally {
      setInvitationLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleDeletePlayer = async (playerId) => {
    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setPlayers(players.filter(p => p._id !== playerId))
        // Refresh to get updated league counts
        setTimeout(() => {
          fetchPlayers()
        }, 500)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete player')
      }
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Error deleting player')
    }
  }

  const handleRemoveFromLeague = async (playerId, leagueId, leagueName) => {
    if (!confirm(`Are you sure you want to remove this player from ${leagueName}? They will remain in other leagues.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/players/${playerId}/remove-from-league`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId })
      })
      
      if (res.ok) {
        // Refresh players list
        fetchPlayers()
        alert('Player removed from league successfully')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to remove player from league')
      }
    } catch (error) {
      console.error('Error removing player from league:', error)
      alert('Error removing player from league')
    }
  }

  const handleImportCSV = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    if (filters.league || leagueParam) {
      formData.append('leagueId', filters.league || leagueParam)
    }

    try {
      const res = await fetch('/api/admin/players/import', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        fetchPlayers() // Refresh players list
        return {
          success: true,
          message: data.message,
          created: data.created,
          updated: data.updated,
          errors: data.errors
        }
      } else {
        return {
          success: false,
          message: data.error || 'Import failed',
          errors: data.errors
        }
      }
    } catch (error) {
      console.error('Error importing players:', error)
      return {
        success: false,
        message: 'Error importing players',
        errors: []
      }
    }
  }

  const exportCSV = () => {
    let url = '/api/admin/players/export'
    if (leagueParam) {
      url += `?league=${leagueParam}`
    }
    window.location.href = url
  }

  return {
    players,
    filteredPlayers,
    loading,
    leagues,
    filters,
    setFilters,
    updateLoading,
    invitationLoading,
    invitationResult,
    setInvitationResult,
    leagueParam,
    handleStatusUpdate,
    handleLevelUpdate,
    handleInvitePlayer,
    handleDeletePlayer,
    handleRemoveFromLeague,
    handleImportCSV,
    exportCSV,
    refetch: fetchPlayers
  }
}
