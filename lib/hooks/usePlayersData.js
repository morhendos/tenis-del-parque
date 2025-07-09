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
    league: ''
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
      const res = await fetch('/api/admin/players', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch players')
      
      const data = await res.json()
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
  }, [])

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
    
    if (filters.league || leagueParam) {
      const leagueId = filters.league || leagueParam
      filtered = filtered.filter(player => player.league?._id === leagueId)
    }
    
    setFilteredPlayers(filtered)
  }, [filters, players, leagueParam])

  const handleStatusUpdate = async (playerId, newStatus) => {
    const loadingKey = `status-${playerId}`
    setUpdateLoading(prev => ({ ...prev, [loadingKey]: true }))
    
    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        setPlayers(players.map(p => 
          p._id === playerId ? { ...p, status: newStatus } : p
        ))
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
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: newLevel })
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
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete player')
      }
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Error deleting player')
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
    window.location.href = '/api/admin/players/export'
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
    handleImportCSV,
    exportCSV,
    refetch: fetchPlayers
  }
}
