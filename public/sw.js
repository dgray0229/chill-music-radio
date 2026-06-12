// Minimal service worker for PWA installability.
// Network-first: the app requires connectivity for live radio streaming.

const CACHE_NAME = 'chillradio-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
