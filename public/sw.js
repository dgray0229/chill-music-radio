// Minimal service worker for PWA installability.
// This app is a live radio stream, so aggressive offline caching
// is intentionally avoided — the app needs a network connection to function.

const CACHE_NAME = 'easylistening-v1';

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim all open clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy: always try network, no offline fallback
  event.respondWith(fetch(event.request));
});
