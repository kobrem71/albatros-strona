// Minimalny Service Worker — potrzebny tylko po to, żeby telefon (głównie
// Android/Chrome) traktował stronę jako "prawdziwą" instalowalną aplikację
// (ikona na ekranie głównym, otwiera się bez paska adresu).
//
// Strategia: ZAWSZE najpierw sieć (network-first). Cache służy wyłącznie
// jako zapasowa wersja offline — dzięki temu nikt nigdy nie utknie na
// starej, zbuforowanej wersji strony, gdy jest internet (to był kiedyś
// prawdziwy problem na tej stronie, więc celowo NIE cache'ujemy agresywnie).

const CACHE_NAME = "albatros-sw-cache-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
