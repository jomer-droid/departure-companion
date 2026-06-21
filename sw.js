self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("departure-companion-demo-v2").then(function (cache) {
      return cache.addAll(["./", "./index.html", "./style.css", "./app.js", "./manifest.json"]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
