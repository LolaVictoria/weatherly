importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Force waiting service worker to become active
workbox.core.self.skipWaiting();
workbox.core.clientsClaim();

if (workbox) {
  console.log('Workbox loaded successfully');

  // Precache critical files with revisions (update revisions when files change)
  workbox.precaching.precacheAndRoute([
    { url: '/index.html', revision: '29' },
    { url: '/style.css', revision:'38' },
    { url: '/app.js', revision: '70' },
    { url: '/images/logo.png', revision: '2' },
    { url: '/manifest.json', revision: '10' },
    { url: '/offline.html', revision: '1' },
  ]);

  // Cache API requests 
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://api.openweathermap.org',
    new workbox.strategies.NetworkFirst({
      cacheName: 'weather-api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60,
          maxEntries: 10,
        }),
      ],
    })
  );

  // Cache images
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'image-cache',
    })
  );

    // Serve Cached Resources 
  workbox.routing.registerRoute(
    ({url}) => url.origin === self.location.origin,  
    new workbox.strategies.CacheFirst({
      cacheName: 'static-cache',  
      plugins: [
        new workbox.expiration.Plugin({
          maxAgeSeconds: 7 * 24 * 60 * 60,  // Cache static resources for 7 days
        }),
      ],
    })
  );

  // Serve HTML pages with Network First and offline fallback
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    async ({ event }) => {
      try {
        return await workbox.strategies.networkFirst({
          cacheName: 'pages-cache',
        }).handle({ request: event.request });
      } catch (error) {
        return caches.match('/offline.html');
      }
    }
  );

  
} else {
  console.log('❌ Workbox failed to load');
}

// Clean up old/unused caches during activation
self.addEventListener('activate', event => {
  const currentCaches = [
    workbox.core.cacheNames.precache,
    'weather-api-cache',
    'image-cache',
    'pages-cache',
    'static-resources'
  ];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
