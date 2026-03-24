'use client'

import { useState } from 'react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

/**
 * Push notification toggle for the player profile/settings page.
 * Shows enable/disable button, handles iOS PWA instructions, and test notification.
 */
export default function NotificationSettings({ locale = 'es' }) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTest
  } = usePushNotifications()

  const [testSending, setTestSending] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleSubscribe = async () => {
    setTestResult(null)
    const success = await subscribe()
    if (success) {
      setTestResult(locale === 'es' ? '¡Notificaciones activadas!' : 'Notifications enabled!')
    }
  }

  const handleUnsubscribe = async () => {
    setTestResult(null)
    await unsubscribe()
  }

  const handleTest = async () => {
    setTestSending(true)
    setTestResult(null)
    const success = await sendTest()
    setTestResult(
      success 
        ? (locale === 'es' ? '¡Notificación de prueba enviada!' : 'Test notification sent!')
        : (locale === 'es' ? 'Error al enviar la prueba' : 'Failed to send test')
    )
    setTestSending(false)
  }

  // Check if running as installed PWA on iOS
  const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isStandalone = typeof window !== 'undefined' && window.navigator.standalone === true
  const isIOSButNotInstalled = isIOSDevice && !isStandalone

  // Not supported at all (very old browser)
  if (!isSupported) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {locale === 'es' ? 'Notificaciones Push' : 'Push Notifications'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {locale === 'es' 
                ? 'Tu navegador no soporta notificaciones push. Intenta con Chrome o Safari.' 
                : 'Your browser does not support push notifications. Try Chrome or Safari.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // iOS but not installed as PWA
  if (isIOSButNotInstalled) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {locale === 'es' ? 'Notificaciones Push' : 'Push Notifications'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {locale === 'es' 
                ? 'Para recibir notificaciones en iPhone, primero instala la app:' 
                : 'To receive notifications on iPhone, first install the app:'}
            </p>
            <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm text-blue-800 space-y-1">
              <p className="font-medium">
                {locale === 'es' ? 'Cómo instalar:' : 'How to install:'}
              </p>
              <p>1. {locale === 'es' ? 'Toca el botón Compartir' : 'Tap the Share button'} 
                <span className="inline-block ml-1">
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </span>
              </p>
              <p>2. {locale === 'es' ? 'Selecciona "Añadir a pantalla de inicio"' : 'Select "Add to Home Screen"'}</p>
              <p>3. {locale === 'es' ? 'Abre la app desde tu pantalla de inicio' : 'Open the app from your home screen'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isSubscribed ? 'bg-green-50' : 'bg-gray-100'
        }`}>
          <svg className={`w-5 h-5 ${isSubscribed ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {locale === 'es' ? 'Notificaciones Push' : 'Push Notifications'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {isSubscribed 
                  ? (locale === 'es' ? 'Recibirás avisos de partidos y plazos' : 'You\'ll receive match and deadline alerts')
                  : (locale === 'es' ? 'Recibe recordatorios de partidos y resultados' : 'Get match reminders and result alerts')
                }
              </p>
            </div>
            
            {isSubscribed ? (
              <button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {isLoading 
                  ? (locale === 'es' ? 'Cargando...' : 'Loading...') 
                  : (locale === 'es' ? 'Desactivar' : 'Disable')}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={isLoading || permission === 'denied'}
                className="px-4 py-2 bg-parque-purple text-white text-sm font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
              >
                {isLoading 
                  ? (locale === 'es' ? 'Cargando...' : 'Loading...') 
                  : (locale === 'es' ? 'Activar' : 'Enable')}
              </button>
            )}
          </div>

          {/* Permission denied warning */}
          {permission === 'denied' && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg text-sm text-orange-700">
              {locale === 'es' 
                ? 'Las notificaciones están bloqueadas. Actívalas en los ajustes de tu navegador.' 
                : 'Notifications are blocked. Enable them in your browser settings.'}
            </div>
          )}

          {/* Error display */}
          {error && error !== 'notifications_blocked' && error !== 'notifications_dismissed' && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Test button (when subscribed) */}
          {isSubscribed && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleTest}
                disabled={testSending}
                className="text-sm text-parque-purple hover:underline disabled:opacity-50"
              >
                {testSending 
                  ? (locale === 'es' ? 'Enviando...' : 'Sending...') 
                  : (locale === 'es' ? 'Enviar notificación de prueba' : 'Send test notification')}
              </button>
            </div>
          )}

          {/* Result message */}
          {testResult && (
            <div className="mt-2 text-sm text-green-600">
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
