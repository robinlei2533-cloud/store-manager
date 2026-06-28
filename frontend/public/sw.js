const CACHE_NAME = "uwell-crm-v1";
const PRECACHE_URLS = ["/", "/index.html"];

const isSupabaseApi = (url) => url.includes("/rest/v1/") || url.includes("/auth/v1/");
const isStaticAsset = (url) => {
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

  // Auth & realtime — never cache
  if (url.includes("/auth/") || url.includes("/realtime/")) {
    return;
  }

  // Supabase API — Network First, fallback to cache
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

  // Static assets — Cache First
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

  // Navigation — Network First, fallback to index.html
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }
});
