importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
 
    
 // Check if Workbox is loaded
if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  // Precache essential files
  workbox.precaching.precacheAndRoute([
    {url: '/index.html', revision: '1'},  // HTML page
    {url: '/style.css', revision: '1'},  // CSS file
    {url: '/app.js', revision: '1'},  // JS file
    {url: '/offline.html', revision: '1'},  // fallback file
  ]);

  // Cache weather API responses (Caching API Requests)
  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://api.openweathermap.org',  
    new workbox.strategies.NetworkFirst({
      cacheName: 'weather-api-cache',  
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60,  // Cache expiration time (24 hours)
          maxEntries: 10,  // Max number of entries in the cache
        }),
      ],
    })
  );

  // Dynamic Caching: Cache other requests at runtime (What to Cache & When to Cache?)
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',  // Cache images
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'image-cache',  // Name of the cache
    })
  );

  
  //Precache the offline fallback page along with core files
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

// Serve Cached Resources (How to Serve Cached Resources?)
workbox.routing.registerRoute(
    ({url}) => url.origin === self.location.origin,  // Cache other static resources
    new workbox.strategies.CacheFirst({
      cacheName: 'static-cache',  // Static resources cache
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 7 * 24 * 60 * 60,  // Cache static resources for 7 days
        }),
      ],
    })
  );

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}