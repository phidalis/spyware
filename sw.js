// sw.js - Service worker for the Secure Operations Center PWA
// Provides offline caching for the app shell. No external data is fetched.

const CACHE_NAME = 'soc-console-v1';

const PRECACHE = [
  './',
  'index.html',
  'dashboard.html',
  'about.html',
  'offline.html',
  'whatsapp.html',
  'instagram.html',
  'facebook.html',
  'tiktok.html',
  'telegram.html',
  'snapchat.html',
  'location.html',
  'parental.html',
  'appusage.html',
  'notifications.html',
  'gallery.html',
  'style.css',
  'dashboard.css',
  'main.js',
  'dashboard.js',
  'platform.js',
  'modules.js',
  'pwa.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-192.png',
  'icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add items individually so a single miss cannot fail the whole install.
      return Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch(() => {
            /* ignore missing entries */
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigations: network-first, fall back to cache, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) =>
            cached || caches.match('offline.html')
          )
        )
    );
    return;
  }

  // Same-origin static assets: cache-first, refresh in background.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Cross-origin assets (e.g. Font Awesome): stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
