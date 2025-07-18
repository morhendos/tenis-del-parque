import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const { data: session, status, update } = useSession()

  useEffect(() => {
    checkWelcomeModalStatus()
  }, [session, status])

  const checkWelcomeModalStatus = async () => {
    try {
      // Wait for session to load
      if (status === 'loading') return
      if (status === 'unauthenticated') return
      
      // Check for testing flag first (for the test button)
      const testFlag = sessionStorage.getItem('showWelcome') === 'true'
      
      if (testFlag) {
        // For testing - show modal and clear flag
        const response = await fetch('/api/player/profile', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setPlayerName(data.player?.name || session?.user?.name || 'Player')
          setShowWelcome(true)
          sessionStorage.removeItem('showWelcome')
        }
        return
      }

      // Check if user has seen the welcome modal
      const hasSeenModal = session?.user?.hasSeenWelcomeModal
      
      // Show modal only if user hasn't seen it before
      if (!hasSeenModal && session) {
        // Get player data
        const response = await fetch('/api/player/profile', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setPlayerName(data.player?.name || session?.user?.name || 'Player')
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
      const response = await fetch('/api/player/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferences: { hasSeenWelcomeModal: true }
        })
      })
      
      if (response.ok) {
        // Update NextAuth session
        await update({
          hasSeenWelcomeModal: true
        })
      }
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
