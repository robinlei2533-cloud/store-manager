const CACHE_NAME = "uwell-crm-v2";
const PRECACHE_URLS = ["/", "/index.html"];

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1"];

const isSupabaseApi = (url) => url.includes("/rest/v1/") || url.includes("/auth/v1/");
const isStaticAsset = (url) => {
  const parsed = new URL(url);
  if (LOCAL_HOSTS.includes(parsed.hostname)) return false;
  if (parsed.pathname.startsWith("/src/") || parsed.pathname.startsWith("/@vite/")) return false;

  const ext = url.split("?").shift().split(".").pop();
  return ["js", "css", "png", "jpg", "jpeg", "gif", "svg", "webp", "woff", "woff2", "ttf"].includes(ext);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Auth and realtime: never cache.
  if (url.includes("/auth/") || url.includes("/realtime/")) {
    return;
  }

  // Supabase API: network first, fallback to cache.
  if (isSupabaseApi(url)) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache first in production only.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      }))
    );
    return;
  }

  // Navigation: network first, fallback to index.html.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }
});
