import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function useMatchDetail(matchId) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/check')
      if (!res.ok) {
        router.push('/admin')
        return false
      }
      return true
    } catch (error) {
      router.push('/admin')
      return false
    }
  }, [router])

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

  useEffect(() => {
    const init = async () => {
      const isAuthed = await checkAuth()
      if (isAuthed) {
        fetchMatch()
      }
    }
    init()
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
    refetch: fetchMatch
  }
}