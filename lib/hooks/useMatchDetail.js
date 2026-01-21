import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function useMatchDetail(matchId) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession()

  const checkAuth = useCallback(() => {
    if (status === 'loading') return null // Still checking
    if (status !== 'authenticated' || session?.user?.role !== 'admin') {
      router.push('/admin')
      return false
    }
    return true
  }, [status, session, router])

  const fetchMatch = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const res = await fetch(`/api/admin/matches/${matchId}`)
      if (!res.ok) throw new Error('Failed to fetch match')
      
      const data = await res.json()
      setMatch(data.match)
    } catch (error) {
      console.error('Error fetching match:', error)
      setError('Error loading match')
    } finally {
      setLoading(false)
    }
  }, [matchId])

  const updateSchedule = async (schedule) => {
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schedule })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update schedule')
      }

      setSuccess('Schedule updated successfully!')
      await fetchMatch()
      return data
    } catch (error) {
      setError(error.message || 'Failed to update schedule')
      throw error
    }
  }

  const updateResult = async (result) => {
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update match')
      }

      setSuccess('Match result saved successfully!')
      await fetchMatch()
      return data
    } catch (error) {
      setError(error.message || 'Failed to submit result')
      throw error
    }
  }

  const updatePlayers = async (players) => {
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ players })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update players')
      }

      setSuccess('Players updated successfully!')
      await fetchMatch()
      return data
    } catch (error) {
      setError(error.message || 'Failed to update players')
      throw error
    }
  }

  const resetToUnplayed = async () => {
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'resetToUnplayed' })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset match')
      }

      setSuccess('Match reset to unplayed successfully! All player stats have been reversed.')
      await fetchMatch()
      return data
    } catch (error) {
      setError(error.message || 'Failed to reset match')
      throw error
    }
  }

  const updateStatus = async (status) => {
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      setSuccess(`Match status updated to ${status}!`)
      await fetchMatch()
      return data
    } catch (error) {
      setError(error.message || 'Failed to update status')
      throw error
    }
  }

  const deleteMatch = async (recalculateStats = true) => {
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recalculateStats })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete match')
      }

      setSuccess('Match deleted successfully!')
      return data
    } catch (error) {
      setError(error.message || 'Failed to delete match')
      throw error
    }
  }

  useEffect(() => {
    const authResult = checkAuth()
    if (authResult === null) return // Still loading auth
    if (authResult === true) {
      fetchMatch()
    }
    // If authResult is false, checkAuth already handled the redirect
  }, [checkAuth, fetchMatch])

  return {
    match,
    loading,
    error,
    success,
    setError,
    setSuccess,
    updateSchedule,
    updateResult,
    updatePlayers,
    updateStatus,
    resetToUnplayed,
    deleteMatch,
    refetch: fetchMatch
  }
}
