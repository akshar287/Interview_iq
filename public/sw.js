// Minimal Service Worker to enable PWA install prompt
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through for all requests
  event.respondWith(fetch(event.request));
});
