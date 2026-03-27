'use client'

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

/**
 * A lightweight banner that prompts players to enable push notifications.
 * Clicking "Enable" triggers the browser permission prompt directly.
 * Shows once per session, dismissible, and remembers if user dismissed it permanently.
 */
export default function PushNotificationPrompt({ language = 'es' }) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const { subscribe, isSubscribed, isLoading, permission } = usePushNotifications()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Don't show if dismissed permanently (X button) or already subscribed
    if (localStorage.getItem('push-prompt-dismissed-permanent')) return

    // Don't show if dismissed this session ("Not now")
    if (sessionStorage.getItem('push-prompt-dismissed')) return

    // Show after a short delay so it doesn't compete with other modals
    const timer = setTimeout(() => setShow(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-hide if user got subscribed (e.g. from settings page in another tab)
  useEffect(() => {
    if (isSubscribed) {
      setShow(false)
      localStorage.setItem('push-prompt-dismissed-permanent', 'true')
    }
  }, [isSubscribed])

  const handleEnable = async () => {
    setFeedback(null)
    const success = await subscribe()
    if (success) {
      // Subscribed! Hide the banner permanently
      setShow(false)
      setDismissed(true)
      localStorage.setItem('push-prompt-dismissed-permanent', 'true')
    } else if (permission === 'denied') {
      // Browser blocked it — show a hint
      setFeedback(language === 'es'
        ? 'Notificaciones bloqueadas. Actívalas en los ajustes de tu navegador.'
        : 'Notifications blocked. Enable them in your browser settings.')
    }
    // If user just dismissed the browser prompt, do nothing — banner stays
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    sessionStorage.setItem('push-prompt-dismissed', 'true')
  }

  const handleDontShowAgain = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('push-prompt-dismissed-permanent', 'true')
  }

  if (!show || dismissed) return null

  const content = {
    es: {
      title: 'Activa las notificaciones',
      text: 'Recibe avisos de nuevos partidos, recordatorios y resultados directamente en tu dispositivo.',
      enable: 'Activar',
      enabling: 'Activando...',
      later: 'Ahora no',
      never: 'No volver a mostrar'
    },
    en: {
      title: 'Enable notifications',
      text: 'Get alerts for new matches, reminders and results directly on your device.',
      enable: 'Enable',
      enabling: 'Enabling...',
      later: 'Not now',
      never: "Don't show again"
    }
  }

  const t = content[language] || content.es

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        {/* Bell icon */}
        <div className="w-10 h-10 rounded-full bg-parque-purple/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
          <p className="text-xs text-gray-600 mt-0.5">{t.text}</p>
          
          {/* Feedback message (e.g. blocked) */}
          {feedback && (
            <p className="text-xs text-orange-600 mt-1.5">{feedback}</p>
          )}
          
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="px-4 py-1.5 text-xs font-medium bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? t.enabling : t.enable}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {t.later}
            </button>
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={handleDontShowAgain}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          title={t.never}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
