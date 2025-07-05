import { useState, useEffect } from 'react'

export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    // Check for welcome modal flag (for testing - remove this condition when implementing real first-time logic)
    const shouldShowWelcome = sessionStorage.getItem('showWelcome') === 'true'
    
    if (shouldShowWelcome) {
      try {
        const userData = localStorage.getItem('user')
        
        if (userData) {
          const user = JSON.parse(userData)
          const name = user.player?.name || user.email.split('@')[0]
          setPlayerName(name)
          setShowWelcome(true)
          
          // Clear the flag so it doesn't show again this session
          sessionStorage.removeItem('showWelcome')
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const closeWelcome = () => {
    setShowWelcome(false)
  }

  return {
    showWelcome,
    playerName,
    closeWelcome
  }
} 