'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { playerFetch } from '@/lib/utils/playerApi'

const STORAGE_KEY = 'tenis-del-parque-language'
const MANUAL_KEY = 'tenis-del-parque-manual-language'

function getBrowserLanguage() {
  if (typeof window === 'undefined') return 'es'

  const browserLang = navigator.language || navigator.languages[0]
  return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
}

function getStoredOrBrowserLanguage() {
  const savedLanguage = localStorage.getItem(STORAGE_KEY)
  const hasManualPreference = localStorage.getItem(MANUAL_KEY)

  if (hasManualPreference === 'true' && (savedLanguage === 'es' || savedLanguage === 'en')) {
    return savedLanguage
  }
  return getBrowserLanguage()
}

function saveLanguageToProfile(language) {
  return playerFetch('/api/player/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ preferences: { language } })
  })
}

export function useLanguage() {
  const [language, setLanguage] = useState('es')
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false)
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { data: profileData, error: profileError } = useSWR(isAuthenticated ? '/api/player/profile' : null)
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    if (isAuthenticated && !profileData && !profileError) return

    let finalLanguage
    try {
      const userLanguage = profileData?.user?.preferences?.language
      const registrationLanguage = profileData?.player?.preferences?.preferredLanguage

      if (userLanguage) {
        finalLanguage = userLanguage
      } else if (registrationLanguage) {
        finalLanguage = registrationLanguage
        if (!hasSyncedRef.current) {
          hasSyncedRef.current = true
          saveLanguageToProfile(finalLanguage).catch(() => {})
        }
      } else {
        finalLanguage = getStoredOrBrowserLanguage()
      }

      localStorage.setItem(STORAGE_KEY, finalLanguage)
    } catch (error) {
      console.error('[useLanguage] Error loading language preference:', error)
      finalLanguage = getBrowserLanguage()
    }

    setLanguage(finalLanguage)
    setIsLanguageLoaded(true)
  }, [status, isAuthenticated, profileData, profileError])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    localStorage.setItem(MANUAL_KEY, 'true')

    if (isAuthenticated) {
      saveLanguageToProfile(lang).catch(() => {})
    }
  }

  return {
    language,
    setLanguage: handleLanguageChange,
    isLanguageLoaded
  }
}
