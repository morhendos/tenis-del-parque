'use client'

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

/**
 * Sticky bottom bar that prompts players to enable push notifications.
 * Much more visible than an inline banner — sits at the bottom of the screen.
 * Shows on every visit until enabled or permanently dismissed.
 */
export default function PushNotificationPrompt({ language = 'es' }) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const { subscribe, isSubscribed, isSupported, isLoading, permission } = usePushNotifications()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isSupported) return

    // Don't show if permanently dismissed
    if (localStorage.getItem('push-prompt-dismissed-permanent')) return

    // Show after a brief delay to let the page settle
    const timer = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(timer)
  }, [isSupported])

  // Auto-hide if user got subscribed
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
      setShow(false)
      setDismissed(true)
      localStorage.setItem('push-prompt-dismissed-permanent', 'true')
    } else if (permission === 'denied') {
      setFeedback(language === 'es'
        ? 'Notificaciones bloqueadas en tu navegador. Actívalas en Ajustes.'
        : 'Notifications blocked in your browser. Enable them in Settings.')
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('push-prompt-dismissed-permanent', 'true')
  }

  if (!show || dismissed) return null

  const t = language === 'es' ? {
    text: 'Activa las notificaciones para recibir avisos de tus partidos',
    enable: 'Activar',
    enabling: 'Activando...',
  } : {
    text: 'Enable notifications to get match alerts',
    enable: 'Enable',
    enabling: 'Enabling...',
  }

  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-50 animate-slideUp">
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Bell icon */}
          <div className="w-9 h-9 rounded-full bg-parque-purple/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-tight">{feedback || t.text}</p>
          </div>

          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            {isLoading ? t.enabling : t.enable}
          </button>
          
          {/* X dismiss */}
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
