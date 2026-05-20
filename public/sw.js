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

  // Skip OAuth redirects and special cases
  if (
    url.includes("access_token") ||
    url.includes("localhost:3000") ||
    url.includes("yt-proxy")
  ) {
    return;
  }

  // Skip ALL external origins — only intercept same-origin requests
  // This fixes CORS errors for Supabase, YouTube, allorigins, etc.
  const requestOrigin = new URL(url).origin;
  if (requestOrigin !== self.location.origin) {
    return; // Let browser handle external requests natively
  }

  event.respondWith(fetch(event.request));
});
