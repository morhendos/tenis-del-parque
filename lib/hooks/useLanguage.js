'use client'

import { useState, useEffect } from 'react'

// Browser language detection function
function getBrowserLanguage() {
  if (typeof window === 'undefined') return 'es'
  
  const browserLang = navigator.language || navigator.languages[0]
  return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function useLanguage() {
  const [language, setLanguage] = useState('es')
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false)

  // Load language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      let finalLanguage = 'es' // Default
      
      try {
        // First, try to get language from user profile (logged in user)
        try {
          const userRes = await fetch('/api/player/profile', {
            credentials: 'include'
          })
          
          if (userRes.ok) {
            const userData = await userRes.json()
            
            // Check user preferences first (set via settings)
            if (userData.user?.preferences?.language) {
              finalLanguage = userData.user.preferences.language
              console.log('[useLanguage] Using user preferences language:', finalLanguage)
            } 
            // Then check player preferences (set during registration)
            else if (userData.player?.preferences?.preferredLanguage) {
              finalLanguage = userData.player.preferences.preferredLanguage
              console.log('[useLanguage] Using player registration language:', finalLanguage)
              
              // Sync player preference to user preferences for consistency
              await fetch('/api/player/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                  preferences: { language: finalLanguage } 
                })
              })
            }
            // Otherwise check localStorage for manual preference
            else {
              const savedLanguage = localStorage.getItem('tenis-del-parque-language')
              const hasManualPreference = localStorage.getItem('tenis-del-parque-manual-language')
              
              if (hasManualPreference === 'true' && savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
                finalLanguage = savedLanguage
                console.log('[useLanguage] Using localStorage manual preference:', finalLanguage)
              } else {
                // Fall back to browser detection
                finalLanguage = getBrowserLanguage()
                console.log('[useLanguage] Using browser detection:', finalLanguage)
              }
            }
          } else {
            // Not logged in - use localStorage or browser detection
            const savedLanguage = localStorage.getItem('tenis-del-parque-language')
            const hasManualPreference = localStorage.getItem('tenis-del-parque-manual-language')
            
            if (hasManualPreference === 'true' && savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
              finalLanguage = savedLanguage
            } else {
              finalLanguage = getBrowserLanguage()
            }
          }
        } catch (profileError) {
          console.log('[useLanguage] Could not fetch profile, using localStorage/browser')
          const savedLanguage = localStorage.getItem('tenis-del-parque-language')
          const hasManualPreference = localStorage.getItem('tenis-del-parque-manual-language')
          
          if (hasManualPreference === 'true' && savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
            finalLanguage = savedLanguage
          } else {
            finalLanguage = getBrowserLanguage()
          }
        }
        
        // Save to localStorage
        localStorage.setItem('tenis-del-parque-language', finalLanguage)
        
      } catch (error) {
        console.error('[useLanguage] Error loading language preference:', error)
        finalLanguage = getBrowserLanguage()
        localStorage.setItem('tenis-del-parque-language', finalLanguage)
      }
      
      setLanguage(finalLanguage)
      setIsLanguageLoaded(true)
    }
    
    loadLanguagePreference()
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    // Save user's manual selection to localStorage
    localStorage.setItem('tenis-del-parque-language', lang)
    // Mark as manually set
    localStorage.setItem('tenis-del-parque-manual-language', 'true')
    
    // Try to save to user profile
    try {
      fetch('/api/player/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          preferences: { language: lang } 
        })
      })
    } catch (error) {
      console.log('Could not save language preference to profile')
    }
  }

  return {
    language,
    setLanguage: handleLanguageChange,
    isLanguageLoaded
  }
}
