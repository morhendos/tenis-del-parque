// Tenis del Parque - Service Worker
// Handles PWA install + Push Notifications

const CACHE_NAME = 'tenisdp-v5';

// Install - just activate immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate - clean up any old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch - no caching, always fresh from network
self.addEventListener('fetch', () => {
  // Intentionally empty - browser handles all requests normally
});

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================

// Handle incoming push notifications
self.addEventListener('push', function(event) {
  console.log('[SW] Push received');
  
  let data = {
    title: 'Tenis del Parque',
    body: 'Tienes una nueva notificación',
    icon: '/web-app-manifest-192x192.png',
    badge: '/notification-badge.png',
    tag: 'general',
    data: {}
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/web-app-manifest-192x192.png',
    badge: data.badge || '/notification-badge.png',
    tag: data.tag || 'general',
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click — open app to the right page
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Get URL to open from notification data
  const urlToOpen = event.notification.data?.url || '/player/dashboard';
  // Build full URL (works for both localhost and production)
  const fullUrl = new URL(urlToOpen, self.location.origin).href;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If there's already a window open, navigate it
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(fullUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// Handle notification close (for future analytics)
self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification dismissed:', event.notification.tag);
});
