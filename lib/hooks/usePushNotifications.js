'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for managing Web Push Notifications in the PWA.
 * 
 * Usage:
 *   const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState('default')
  const [subscription, setSubscription] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const supported = typeof window !== 'undefined' &&
                      'serviceWorker' in navigator && 
                      'PushManager' in window &&
                      'Notification' in window
    setIsSupported(supported)
    
    if (supported) {
      setPermission(Notification.permission)
      checkExistingSubscription()
    }
  }, [])

  const checkExistingSubscription = async () => {
    try {
      // Only check if there's an active SW
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return
      
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (err) {
      console.error('[Push] Error checking subscription:', err)
    }
  }

  /**
   * Ensure the service worker is registered and active.
   * Returns the registration, or null if it fails.
   */
  const ensureServiceWorker = async () => {
    // Check if already registered
    let registration = await navigator.serviceWorker.getRegistration()
    
    if (!registration) {
      console.log('[Push] No service worker found, registering...')
      registration = await navigator.serviceWorker.register('/sw.js')
      console.log('[Push] Service worker registered')
    }
    
    // Wait for it to be active (with a timeout)
    if (registration.active) {
      return registration
    }
    
    // Wait for installing/waiting SW to activate
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Service worker activation timed out'))
      }, 10000) // 10 second timeout
      
      const sw = registration.installing || registration.waiting
      if (!sw) {
        clearTimeout(timeout)
        // It might have activated between our checks
        if (registration.active) {
          resolve(registration)
        } else {
          reject(new Error('No service worker to wait for'))
        }
        return
      }
      
      sw.addEventListener('statechange', () => {
        if (sw.state === 'activated') {
          clearTimeout(timeout)
          resolve(registration)
        }
      })
    })
  }

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported on this device')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Request permission
      const perm = await Notification.requestPermission()
      setPermission(perm)
      
      if (perm !== 'granted') {
        setError(perm === 'denied' ? 'notifications_blocked' : 'notifications_dismissed')
        return false
      }

      // 2. Ensure service worker is registered and active
      const registration = await ensureServiceWorker()
      
      // 3. Subscribe to push service
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setError('Push notification configuration missing (VAPID key)')
        console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
        return false
      }

      console.log('[Push] Subscribing to push manager...')
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })

      setSubscription(sub)
      console.log('[Push] Got subscription, saving to server...')

      // 4. Send subscription to our server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: getPlatform(),
            browser: getBrowser()
          }
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Server returned ${response.status}`)
      }

      console.log('[Push] Subscribed successfully!')
      return true
    } catch (err) {
      console.error('[Push] Subscribe error:', err)
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return true

    setIsLoading(true)
    setError(null)
    
    try {
      await subscription.unsubscribe()
      
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      })

      setSubscription(null)
      console.log('[Push] Unsubscribed successfully')
      return true
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err)
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [subscription])

  /**
   * Send a test notification (via server)
   */
  const sendTest = useCallback(async () => {
    if (!subscription) return false
    
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      return res.ok
    } catch {
      return false
    }
  }, [subscription])

  return {
    isSupported,
    permission,
    subscription,
    isSubscribed: !!subscription,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTest
  }
}

// ============================================================
// Helper utilities
// ============================================================

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function getPlatform() {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  return 'desktop'
}

function getBrowser() {
  const ua = navigator.userAgent
  if (ua.includes('Chrome') && !ua.includes('Edge')) return 'chrome'
  if (ua.includes('Firefox')) return 'firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari'
  if (ua.includes('Edge') || ua.includes('Edg/')) return 'edge'
  return 'unknown'
}
