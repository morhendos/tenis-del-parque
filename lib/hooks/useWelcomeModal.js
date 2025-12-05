import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

const WELCOME_MODAL_KEY = 'tdp_welcome_modal_seen'

export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const { data: session, status } = useSession()
  
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    const checkWelcomeModalStatus = async () => {
      // Wait for auth
      if (status === 'loading') return
      if (status === 'unauthenticated') return
      if (hasCheckedRef.current) return
      hasCheckedRef.current = true
      
      try {
        // Check for testing flag first
        const testFlag = sessionStorage.getItem('showWelcome') === 'true'
        
        if (testFlag) {
          sessionStorage.removeItem('showWelcome')
          const response = await fetch('/api/player/profile', { credentials: 'include' })
          if (response.ok) {
            const data = await response.json()
            setPlayerName(data.player?.name || session?.user?.name || 'Player')
            setShowWelcome(true)
          }
          return
        }

        // FIRST: Check localStorage (instant, no flash)
        const localSeen = localStorage.getItem(WELCOME_MODAL_KEY)
        if (localSeen === 'true') {
          // Already seen, don't even bother with API
          return
        }

        // THEN: Check server preference
        const preferencesResponse = await fetch('/api/player/preferences')
        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json()
          const hasSeenModal = preferencesData.hasSeenWelcomeModal || false
          
          if (hasSeenModal) {
            // Sync to localStorage for future instant checks
            localStorage.setItem(WELCOME_MODAL_KEY, 'true')
            return
          }
          
          // User hasn't seen modal - show it
          const response = await fetch('/api/player/profile', { credentials: 'include' })
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
    
    checkWelcomeModalStatus()
  }, [status])

  const closeWelcome = async () => {
    setShowWelcome(false)
    
    // Save to localStorage immediately
    localStorage.setItem(WELCOME_MODAL_KEY, 'true')
    
    // Also save to server
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
