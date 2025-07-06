import { useState, useEffect } from 'react'

export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    checkWelcomeModalStatus()
  }, [])

  const checkWelcomeModalStatus = async () => {
    try {
      // Check for testing flag first (for the test button)
      const testFlag = sessionStorage.getItem('showWelcome') === 'true'
      
      if (testFlag) {
        // For testing - show modal and clear flag
        const response = await fetch('/api/player/profile', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setPlayerName(data.player?.name || 'Player')
          setShowWelcome(true)
          sessionStorage.removeItem('showWelcome')
        }
        return
      }

      // Check user's profile to see if they've seen the welcome modal
      const response = await fetch('/api/player/profile', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const hasSeenModal = data.user?.preferences?.hasSeenWelcomeModal
        
        // Show modal only if user hasn't seen it before
        if (!hasSeenModal) {
          setPlayerName(data.player?.name || 'Player')
          setShowWelcome(true)
        }
      }
    } catch (error) {
      console.error('Error checking welcome modal status:', error)
    }
  }

  const closeWelcome = async () => {
    setShowWelcome(false)
    
    // Mark user as having seen the welcome modal
    try {
      await fetch('/api/player/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferences: { hasSeenWelcomeModal: true }
        })
      })
    } catch (error) {
      console.error('Error updating welcome modal status:', error)
    }
  }

  return {
    showWelcome,
    playerName,
    closeWelcome
  }
} 