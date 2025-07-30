self.addEventListener("install", event => {
    console.log("Service Worker: Installing...");
    event.waitUntil(
        caches.open("workout-log-cache-v2").then(cache => {
            console.log("Service Worker: Caching files");
            return cache.addAll([
                "/",
                "/index.html",
                "/manifest.json",
                "/icon-192x192.png",
                "/icon-512x512.png",
                "/icon-180x180.png",
                "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.3/chart.umd.min.js"
            ]).catch(err => {
                console.error("Service Worker: Cache failed:", err);
            });
        }).catch(err => {
            console.error("Service Worker: Cache open failed:", err);
        })
    );
});

self.addEventListener("activate", event => {
    console.log("Service Worker: Activating...");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== "workout-log-cache-v2").map(name => caches.delete(name))
            );
        }).then(() => {
            console.log("Service Worker: Old caches cleared");
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", event => {
    console.log("Service Worker: Fetching", event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log("Service Worker: Cache hit for", event.request.url);
                return response;
            }
            return fetch(event.request).catch(err => {
                console.error("Service Worker: Fetch failed:", err);
                return caches.match("/index.html");
            });
        })
    );
});