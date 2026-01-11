# Push Notifications Implementation Plan

## Overview

Implement web push notifications for the Tenis del Parque PWA to keep players engaged and informed about matches, results, and league updates.

## Use Cases

### High Priority
1. **New Match Assigned** - "You've been paired with [opponent] for Round [X]"
2. **Match Result Submitted** - "Your opponent submitted the result. Please confirm."
3. **Round Deadline Reminder** - "2 days left to complete your Round [X] match"
4. **Match Confirmed** - "Match result confirmed: You won/lost vs [opponent]"

### Medium Priority
5. **New Round Started** - "Round [X] has begun! Check your new opponent."
6. **Playoffs Qualified** - "Congratulations! You've qualified for the playoffs!"
7. **League Registration Open** - "Registration for [Season] is now open"

### Low Priority
8. **Weekly Standings Update** - "You're currently #[X] in the standings"
9. **New Player Joined** - "Welcome [player] to [league]!"

---

## Technical Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Device   │     │   Your Server    │     │   Push Service  │
│   (PWA + SW)    │     │   (Next.js API)  │     │   (FCM/VAPID)   │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         │ 1. Request Permission │                        │
         │──────────────────────>│                        │
         │                       │                        │
         │ 2. Generate Subscription                       │
         │<─────────────────────>│                        │
         │                       │                        │
         │ 3. Save Subscription  │                        │
         │──────────────────────>│ (store in MongoDB)     │
         │                       │                        │
         │                       │ 4. Event Occurs        │
         │                       │ (match created, etc)   │
         │                       │                        │
         │                       │ 5. Send Push Request   │
         │                       │───────────────────────>│
         │                       │                        │
         │                       │                   6. Deliver
         │<───────────────────────────────────────────────│
         │ 7. SW shows notification                       │
         │                       │                        │
```

---

## Implementation Steps

### Phase 1: Setup & Infrastructure (Day 1)

#### 1.1 Generate VAPID Keys
```bash
# Install web-push globally
npm install web-push -g

# Generate VAPID keys
web-push generate-vapid-keys
```

Store in `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgU...
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:info@tenisdelparque.com
```

#### 1.2 Install Dependencies
```bash
npm install web-push
```

#### 1.3 Create Push Subscription Model

```javascript
// lib/models/PushSubscription.js
import mongoose from 'mongoose'

const PushSubscriptionSchema = new mongoose.Schema({
  // Link to user/player
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    index: true
  },
  
  // The push subscription object from browser
  subscription: {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    }
  },
  
  // Device info
  deviceInfo: {
    userAgent: String,
    platform: String,  // 'android', 'ios', 'desktop'
    browser: String
  },
  
  // Notification preferences
  preferences: {
    newMatch: { type: Boolean, default: true },
    matchResult: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true }
  },
  
  // Status tracking
  isActive: { type: Boolean, default: true },
  lastUsed: { type: Date, default: Date.now },
  failedAttempts: { type: Number, default: 0 }
}, {
  timestamps: true
})

// Index for finding subscriptions by endpoint
PushSubscriptionSchema.index({ 'subscription.endpoint': 1 })

export default mongoose.models.PushSubscription || 
  mongoose.model('PushSubscription', PushSubscriptionSchema)
```

---

### Phase 2: Service Worker Updates (Day 1)

#### 2.1 Update Service Worker (`public/sw.js`)

```javascript
// Add to existing sw.js

// Handle push events
self.addEventListener('push', function(event) {
  console.log('[SW] Push received:', event)
  
  let data = {
    title: 'Tenis del Parque',
    body: 'Tienes una nueva notificación',
    icon: '/web-app-manifest-192x192.png',
    badge: '/apple-touch-icon.png',
    tag: 'general',
    data: {}
  }
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() }
    } catch (e) {
      data.body = event.data.text()
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/web-app-manifest-192x192.png',
    badge: data.badge || '/apple-touch-icon.png',
    tag: data.tag || 'general',
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.notification.tag)
  
  event.notification.close()
  
  // Get URL to open from notification data
  const urlToOpen = event.notification.data?.url || '/player/dashboard'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes('tenisdelparque.com') && 'focus' in client) {
            client.navigate(urlToOpen)
            return client.focus()
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Handle notification close (for analytics)
self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification closed:', event.notification.tag)
})
```

---

### Phase 3: Frontend Implementation (Day 1-2)

#### 3.1 Push Notification Hook

```javascript
// lib/hooks/usePushNotifications.js
import { useState, useEffect, useCallback } from 'react'

export function usePushNotifications() {
  const [permission, setPermission] = useState('default')
  const [subscription, setSubscription] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if push is supported
    const supported = 'serviceWorker' in navigator && 
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
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (err) {
      console.error('Error checking subscription:', err)
    }
  }

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request permission
      const perm = await Notification.requestPermission()
      setPermission(perm)
      
      if (perm !== 'granted') {
        setError('Notification permission denied')
        return false
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        )
      })

      setSubscription(sub)

      // Send subscription to server
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
        throw new Error('Failed to save subscription')
      }

      return true
    } catch (err) {
      console.error('Error subscribing:', err)
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return true

    setIsLoading(true)
    try {
      await subscription.unsubscribe()
      
      // Remove from server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      })

      setSubscription(null)
      return true
    } catch (err) {
      console.error('Error unsubscribing:', err)
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
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
    unsubscribe
  }
}

// Helper functions
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
  if (ua.includes('Chrome')) return 'chrome'
  if (ua.includes('Firefox')) return 'firefox'
  if (ua.includes('Safari')) return 'safari'
  if (ua.includes('Edge')) return 'edge'
  return 'unknown'
}
```

#### 3.2 Notification Settings Component

```javascript
// components/player/NotificationSettings.js
'use client'

import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

export default function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe
  } = usePushNotifications()

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">
          Push notifications are not supported in this browser.
          For the best experience, install the app on your home screen.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🔔 Notifications
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-gray-500">
              Receive alerts about matches and results
            </p>
          </div>
          
          {isSubscribed ? (
            <button
              onClick={unsubscribe}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Disable'}
            </button>
          ) : (
            <button
              onClick={subscribe}
              disabled={isLoading || permission === 'denied'}
              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Enable'}
            </button>
          )}
        </div>

        {permission === 'denied' && (
          <p className="text-sm text-orange-600">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}

        {isSubscribed && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Notify me about:
            </p>
            {/* Add preference toggles here */}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### Phase 4: Backend API Routes (Day 2)

#### 4.1 Subscribe Endpoint

```javascript
// app/api/push/subscribe/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import PushSubscription from '@/lib/models/PushSubscription'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { subscription, deviceInfo } = await request.json()

    // Upsert subscription
    await PushSubscription.findOneAndUpdate(
      { 'subscription.endpoint': subscription.endpoint },
      {
        userId: session.user.id,
        playerId: session.user.playerId,
        subscription,
        deviceInfo,
        isActive: true,
        lastUsed: new Date(),
        failedAttempts: 0
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
```

#### 4.2 Unsubscribe Endpoint

```javascript
// app/api/push/unsubscribe/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import PushSubscription from '@/lib/models/PushSubscription'

export async function POST(request) {
  try {
    await dbConnect()
    const { endpoint } = await request.json()

    await PushSubscription.findOneAndUpdate(
      { 'subscription.endpoint': endpoint },
      { isActive: false }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
```

#### 4.3 Push Notification Service

```javascript
// lib/services/pushNotificationService.js
import webpush from 'web-push'
import dbConnect from '@/lib/db/mongoose'
import PushSubscription from '@/lib/models/PushSubscription'

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

/**
 * Send push notification to a specific player
 */
export async function sendToPlayer(playerId, notification) {
  await dbConnect()
  
  const subscriptions = await PushSubscription.find({
    playerId,
    isActive: true
  })

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPush(sub, notification))
  )

  return results
}

/**
 * Send push notification to multiple players
 */
export async function sendToPlayers(playerIds, notification) {
  await dbConnect()
  
  const subscriptions = await PushSubscription.find({
    playerId: { $in: playerIds },
    isActive: true
  })

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPush(sub, notification))
  )

  return results
}

/**
 * Send push notification to all subscribers in a league
 */
export async function sendToLeague(leagueId, notification) {
  // Implementation: Find all players in league, get their subscriptions
}

/**
 * Internal function to send push
 */
async function sendPush(subscriptionDoc, notification) {
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: notification.icon || '/web-app-manifest-192x192.png',
    badge: '/apple-touch-icon.png',
    tag: notification.tag || 'general',
    data: {
      url: notification.url || '/player/dashboard',
      ...notification.data
    },
    actions: notification.actions || []
  })

  try {
    await webpush.sendNotification(subscriptionDoc.subscription, payload)
    
    // Update last used
    await PushSubscription.findByIdAndUpdate(subscriptionDoc._id, {
      lastUsed: new Date(),
      failedAttempts: 0
    })
    
    return { success: true, endpoint: subscriptionDoc.subscription.endpoint }
  } catch (error) {
    console.error('Push failed:', error)
    
    // Handle expired/invalid subscriptions
    if (error.statusCode === 404 || error.statusCode === 410) {
      await PushSubscription.findByIdAndUpdate(subscriptionDoc._id, {
        isActive: false
      })
    } else {
      // Increment failed attempts
      await PushSubscription.findByIdAndUpdate(subscriptionDoc._id, {
        $inc: { failedAttempts: 1 }
      })
    }
    
    return { success: false, error: error.message }
  }
}
```

---

### Phase 5: Integration Points (Day 2-3)

#### 5.1 Match Creation Hook

```javascript
// In /api/admin/matches/route.js POST handler
// After successfully creating match:

import { sendToPlayers } from '@/lib/services/pushNotificationService'

// ... after match is created ...

// Notify both players
await sendToPlayers(
  [match.players.player1._id, match.players.player2._id],
  {
    title: '🎾 New Match Assigned!',
    body: `Round ${match.round}: You've been paired with your opponent`,
    tag: `match-${match._id}`,
    url: '/player/matches',
    data: { matchId: match._id.toString() }
  }
)
```

#### 5.2 Result Submission Hook

```javascript
// In /api/player/matches/result/route.js
// After result is submitted:

// Notify opponent to confirm
await sendToPlayer(opponentId, {
  title: '📝 Match Result Submitted',
  body: `${submitterName} submitted the result. Please confirm.`,
  tag: `result-${match._id}`,
  url: '/player/matches',
  data: { matchId: match._id.toString() }
})
```

#### 5.3 Deadline Reminder (Cron Job)

```javascript
// Could be implemented as a Vercel Cron job
// /api/cron/match-reminders/route.js

export async function GET(request) {
  // Verify cron secret
  // Find matches with deadlines in 2 days
  // Send reminders to players
}
```

---

## Notification Content Templates

### Spanish (Primary)
```javascript
const templates = {
  newMatch: {
    title: '🎾 ¡Nuevo Partido Asignado!',
    body: 'Ronda {round}: Te toca jugar contra {opponent}'
  },
  resultSubmitted: {
    title: '📝 Resultado Enviado',
    body: '{player} ha enviado el resultado. Por favor, confírmalo.'
  },
  resultConfirmed: {
    title: '✅ Resultado Confirmado',
    body: '{result} vs {opponent} - {score}'
  },
  reminder: {
    title: '⏰ Recordatorio de Partido',
    body: 'Te quedan {days} días para jugar contra {opponent}'
  },
  playoffsQualified: {
    title: '🏆 ¡Has Clasificado!',
    body: '¡Felicidades! Te has clasificado para los playoffs'
  },
  newRound: {
    title: '🚀 Nueva Ronda',
    body: 'La Ronda {round} ha comenzado. ¡Revisa tu rival!'
  }
}
```

---

## iOS Considerations

### Requirements
- iOS 16.4+ required
- PWA must be installed to home screen
- User must enable notifications in iOS Settings

### Implementation Notes
```javascript
// Check if running as installed PWA on iOS
const isIOSPWA = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    window.navigator.standalone === true
  )
}

// Show iOS-specific instructions if not installed
if (isIOS() && !isIOSPWA()) {
  // Show "Add to Home Screen" instructions
}
```

---

## Testing Plan

### Manual Testing
1. ✅ Subscribe to notifications on desktop Chrome
2. ✅ Subscribe on Android Chrome
3. ✅ Subscribe on iOS Safari (installed PWA)
4. ✅ Receive notification when match created
5. ✅ Click notification opens correct page
6. ✅ Unsubscribe removes notifications
7. ✅ Multiple devices for same user

### Test Endpoint
```javascript
// /api/push/test/route.js (admin only)
export async function POST(request) {
  // Send test notification to requesting user
}
```

---

## Monitoring & Analytics

Track these metrics:
- Subscription rate (% of users who enable)
- Delivery success rate
- Click-through rate
- Unsubscribe rate
- Failed deliveries by platform

---

## Estimated Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Setup & Infrastructure | 3-4 hours |
| 2 | Service Worker Updates | 1-2 hours |
| 3 | Frontend Implementation | 4-5 hours |
| 4 | Backend API Routes | 3-4 hours |
| 5 | Integration Points | 4-5 hours |
| 6 | Testing & Polish | 3-4 hours |
| **Total** | | **~2-3 days** |

---

## Future Enhancements

1. **Rich notifications** - Include player photos, scores
2. **Notification preferences** - Granular control over what to receive
3. **Quiet hours** - Don't send at night
4. **Notification history** - View past notifications in app
5. **Email fallback** - If push fails, send email
6. **Admin broadcast** - Send announcements to all players

---

## Resources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [web-push npm package](https://github.com/web-push-libs/web-push)
- [VAPID explained](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)
- [iOS PWA Push Support](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
