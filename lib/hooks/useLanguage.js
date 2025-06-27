'use client'

import { useState, useEffect } from 'react'

export function useLanguage() {
  const [language, setLanguage] = useState('es')

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0]
    const detectedLang = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
    setLanguage(detectedLang)
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
  }

  return {
    language,
    setLanguage: handleLanguageChange
  }
} 