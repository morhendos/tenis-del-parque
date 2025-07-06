'use client'

import { useState, useEffect } from 'react'

export function useLanguage() {
  const [language, setLanguage] = useState('es')
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false)

  // Load language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      let finalLanguage = 'es' // default
      
      try {
        // First, try to get user's profile language preference if logged in
        const userRes = await fetch('/api/player/profile', {
          credentials: 'include'
        })
        
        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.user?.preferences?.language) {
            finalLanguage = userData.user.preferences.language
            // Sync with localStorage
            localStorage.setItem('tenis-del-parque-language', finalLanguage)
          } else {
            // User is logged in but has no language preference - set it to browser language
            const browserLang = navigator.language || navigator.languages[0]
            const detectedLang = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
            finalLanguage = detectedLang
            
            // Save to user profile
            try {
              await fetch('/api/player/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                  preferences: { language: detectedLang } 
                })
              })
            } catch (profileError) {
              console.log('Could not save language preference to profile')
            }
            
            // Also sync with localStorage
            localStorage.setItem('tenis-del-parque-language', finalLanguage)
          }
        }
      } catch (error) {
        // If profile fetch fails, fall back to localStorage and browser detection
        const savedLanguage = localStorage.getItem('tenis-del-parque-language')
        
        if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
          finalLanguage = savedLanguage
        } else {
          // Fall back to browser detection
          const browserLang = navigator.language || navigator.languages[0]
          finalLanguage = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
          // Save the detected language as initial preference
          localStorage.setItem('tenis-del-parque-language', finalLanguage)
        }
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
  }

  return {
    language,
    setLanguage: handleLanguageChange,
    isLanguageLoaded
  }
} 