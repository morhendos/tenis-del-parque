'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to fetch player achievements
 * @returns {Object} { achievements, loading, error, refetch }
 */
export function usePlayerAchievements() {
  const [achievements, setAchievements] = useState(null)
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/player/achievements')
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements')
      }

      const data = await response.json()
      setAchievements(data.achievements)
      setPlayer(data.player)
    } catch (err) {
      console.error('Error fetching achievements:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  return {
    achievements,
    player,
    loading,
    error,
    refetch: fetchAchievements
  }
}

export default usePlayerAchievements
