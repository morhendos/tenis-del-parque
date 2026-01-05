// Tenis del Parque - Minimal Service Worker
// Required for PWA install prompt, but no caching (data must always be fresh)

const CACHE_NAME = 'tenisdp-v4';

// Install - just activate immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate - clean up any old caches from previous versions
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

// Fetch - do nothing, let browser handle everything normally
// No caching, always fresh from network
self.addEventListener('fetch', () => {
  // Intentionally empty - browser handles all requests normally
});
