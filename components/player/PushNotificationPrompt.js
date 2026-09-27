'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

const SNOOZE_KEY = 'push-prompt-snoozed-until'
const SNOOZE_DAYS = 7

/**
 * Sticky bottom bar prompting players to enable push notifications.
 *
 * Variants:
 * - Supported browsers: "Enable" button that triggers the permission flow.
 * - iOS Safari (not installed as PWA): install instructions, since iOS only
 *   allows web push for apps added to the home screen.
 *
 * X snoozes the prompt for 7 days. Subscribed players never see it.
 */
export default function PushNotificationPrompt({ language = 'es' }) {
  const [show, setShow] = useState(false)
  const [variant, setVariant] = useState('enable') // 'enable' | 'ios-install'
  const [iosBrowser, setIosBrowser] = useState('safari') // 'safari' | 'chrome' | 'inapp'
  const [feedback, setFeedback] = useState(null)
  const { subscribe, isSubscribed, isSupported, isLoading, permission } = usePushNotifications()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Clean up the old permanent-dismiss flag so previously dismissed
    // players get one more chance with the new prompt
    localStorage.removeItem('push-prompt-dismissed-permanent')

    const snoozedUntil = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10)
    if (Date.now() < snoozedUntil) return

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (isIOS && !isStandalone) {
      // iOS without home-screen install: push is impossible,
      // so ask them to install the PWA first
      const ua = navigator.userAgent
      if (/Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok/i.test(ua)) {
        setIosBrowser('inapp')
      } else if (/CriOS|EdgiOS/.test(ua)) {
        setIosBrowser('chrome')
      } else {
        setIosBrowser('safari')
      }
      setVariant('ios-install')
    } else if (isSupported) {
      setVariant('enable')
    } else {
      return // unsupported and not the iOS case: show nothing
    }

    // Before showing, ask the browser directly for an existing
    // subscription. The hook's isSubscribed can resolve before this
    // timer fires, which made the prompt reappear for players who
    // were already subscribed.
    const timer = setTimeout(async () => {
      if (isSupported) {
        try {
          const reg = await navigator.serviceWorker.getRegistration()
          const sub = reg && await reg.pushManager.getSubscription()
          if (sub) return // already subscribed - never show
        } catch (e) {}
      }
      setShow(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [isSupported])

  // Already subscribed - just hide
  useEffect(() => {
    if (isSubscribed) setShow(false)
  }, [isSubscribed])

  const handleEnable = async () => {
    setFeedback(null)
    const success = await subscribe()
    if (success) {
      setShow(false)
    } else if (permission === 'denied') {
      setFeedback(language === 'es'
        ? 'Notificaciones bloqueadas en tu navegador. Activalas en Ajustes.'
        : 'Notifications blocked in your browser. Enable them in Settings.')
    }
  }

  const handleDismiss = () => {
    setShow(false)
    const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(SNOOZE_KEY, String(until))
  }

  if (!show) return null

  const t = language === 'es' ? {
    enableText: 'Enterate al momento de los resultados y novedades de tu liga',
    enable: 'Activar',
    enabling: 'Activando...',
    iosTitle: 'Instala la app para recibir los resultados de tu liga',
    stepShare: iosBrowser === 'chrome'
      ? 'Pulsa Compartir (arriba, en la barra de direcciones)'
      : 'Pulsa Compartir (abajo, en el centro)',
    stepAdd: 'Elige "Añadir a pantalla de inicio"',
    inapp: 'Abre tenisdp.es en Safari para poder instalar la app'
  } : {
    enableText: 'Get league results and updates the moment they happen',
    enable: 'Enable',
    enabling: 'Enabling...',
    iosTitle: 'Install the app to get your league results',
    stepShare: iosBrowser === 'chrome'
      ? 'Tap Share (top right, in the address bar)'
      : 'Tap Share (bottom center)',
    stepAdd: 'Choose "Add to Home Screen"',
    inapp: 'Open tenisdp.es in Safari to install the app'
  }

  // Portal to <body>: the dashboard wrapper has a CSS transform
  // (animate-fade-in-up) which breaks position:fixed for descendants,
  // pushing the bar below the fold until the user scrolls.
  return createPortal(
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-50 animate-slideUp">
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" style={{ padding: '16px' }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-parque-purple/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {variant === 'ios-install' ? (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium leading-tight">{t.iosTitle}</p>
              {iosBrowser === 'inapp' ? (
                <p className="text-xs text-gray-600 leading-tight mt-1.5">{t.inapp}</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-parque-purple/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-parque-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M12 3v13m0-13L8 7m4-4l4 4" />
                      </svg>
                    </span>
                    <p className="text-xs text-gray-600 leading-tight"><span className="font-semibold text-gray-800">1.</span> {t.stepShare}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-parque-purple/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-parque-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" rx="3" />
                        <path strokeLinecap="round" d="M12 9v6m-3-3h6" />
                      </svg>
                    </span>
                    <p className="text-xs text-gray-600 leading-tight"><span className="font-semibold text-gray-800">2.</span> {t.stepAdd}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="flex-1 min-w-0 text-sm text-gray-700 leading-tight">{feedback || t.enableText}</p>
              <button
                onClick={handleEnable}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-semibold bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {isLoading ? t.enabling : t.enable}
              </button>
            </>
          )}

          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
