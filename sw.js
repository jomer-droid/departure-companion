self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open("departure-companion-demo-v3").then(function (cache) {
      return cache.addAll(["./", "./index.html", "./style.css?v=3", "./app.js?v=3", "./manifest.json"]);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== "departure-companion-demo-v3") return caches.delete(key);
      }));
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
