'use client'

import { useState, useEffect } from 'react'

export function useLanguage() {
  const [language, setLanguage] = useState('es')
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false)

  // Load language preference on mount
  useEffect(() => {
    // First check if user has a saved preference
    const savedLanguage = localStorage.getItem('tenis-del-parque-language')
    
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      // Use saved preference
      setLanguage(savedLanguage)
    } else {
      // Fall back to browser detection
      const browserLang = navigator.language || navigator.languages[0]
      const detectedLang = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
      setLanguage(detectedLang)
      // Save the detected language as initial preference
      localStorage.setItem('tenis-del-parque-language', detectedLang)
    }
    
    setIsLanguageLoaded(true)
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