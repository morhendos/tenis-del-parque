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
      let finalLanguage = getBrowserLanguage() // Start with browser detection
      
      try {
        // Check if user has manually set a language preference
        const savedLanguage = localStorage.getItem('tenis-del-parque-language')
        const hasManualPreference = localStorage.getItem('tenis-del-parque-manual-language')
        
        if (hasManualPreference === 'true' && savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
          // User has manually set language, use their preference
          finalLanguage = savedLanguage
        } else {
          // No manual preference, use browser detection
          finalLanguage = getBrowserLanguage()
          
          // Try to sync with user profile if logged in
          try {
            const userRes = await fetch('/api/player/profile', {
              credentials: 'include'
            })
            
            if (userRes.ok) {
              const userData = await userRes.json()
              
              // If user has a profile preference and it matches browser, keep it
              // If user has no profile preference, save browser detection to profile
              if (!userData.user?.preferences?.language) {
                await fetch('/api/player/profile', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ 
                    preferences: { language: finalLanguage } 
                  })
                })
              }
            }
          } catch (profileError) {
            console.log('Could not sync language preference with profile')
          }
          
          // Save browser detection to localStorage (but not as manual preference)
          localStorage.setItem('tenis-del-parque-language', finalLanguage)
        }
      } catch (error) {
        // If anything fails, fall back to browser detection
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