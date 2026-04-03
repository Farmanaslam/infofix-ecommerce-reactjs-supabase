self.addEventListener("install", (event) => {
  console.log("✅ SW installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("✅ SW activated");
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Skip OAuth redirects — let browser handle them natively
  if (url.includes("access_token") || url.includes("localhost:3000")) {
    return;
  }

  event.respondWith(fetch(event.request));
});