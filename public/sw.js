// SERVICE WORKER — tells the browser "this app can be installed as PWA"
// No caching — just pass all requests through normally

self.addEventListener("install", (event) => {
  console.log("✅ SW installed");
  self.skipWaiting(); // Activate immediately, don't wait
});

self.addEventListener("activate", (event) => {
  console.log("✅ SW activated");
  event.waitUntil(
    // Clear any old caches from previous versions
    caches
      .keys()
      .then((names) => Promise.all(names.map((name) => caches.delete(name)))),
  );
  self.clients.claim(); // Take control of all open tabs immediately
});

// Pass every request straight to the network — no caching
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
