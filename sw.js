// Minimalny Service Worker — potrzebny tylko po to, żeby telefon (głównie
// Android/Chrome) traktował stronę jako "prawdziwą" instalowalną aplikację
// (ikona na ekranie głównym, otwiera się bez paska adresu).
//
// Strategia: ZAWSZE najpierw sieć (network-first). Cache służy wyłącznie
// jako zapasowa wersja offline — dzięki temu nikt nigdy nie utknie na
// starej, zbuforowanej wersji strony, gdy jest internet (to był kiedyś
// prawdziwy problem na tej stronie, więc celowo NIE cache'ujemy agresywnie).

const CACHE_NAME = "albatros-sw-cache-v1";

// ============================================================================
//  POWIADOMIENIA PUSH (opcjonalne) — pokazuje powiadomienie systemowe, gdy
//  Krzysztof ręcznie wyśle wiadomość z Firebase Console (Messaging -> New
//  campaign), a strona nie jest akurat otwarta na wierzchu. Service Worker
//  to osobny, "klasyczny" skrypt (nie moduł ES) i NIE MOŻE zaimportować
//  js/firebase-config.js — dlatego te same wartości co w FIREBASE_CONFIG
//  tam są tu ręcznie powtórzone. Jeśli kiedyś zmienisz projekt Firebase,
//  zaktualizuj obie kopie.
// ============================================================================
const PUSH_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCurDkDHUpQCluWVyyqnOsr4z_5zXBz1Fc",
  authDomain: "albatros-klub.firebaseapp.com",
  projectId: "albatros-klub",
  storageBucket: "albatros-klub.firebasestorage.app",
  messagingSenderId: "694831805050",
  appId: "1:694831805050:web:96ad97f10075c34a2381c3",
};

try {
  if (PUSH_FIREBASE_CONFIG.apiKey) {
    importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");
    firebase.initializeApp(PUSH_FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    // Powiadomienie, gdy przeglądarka jest zamknięta/w tle — gdy strona jest
    // aktywnie otwarta na wierzchu, przeglądarka i tak zwykle pokazuje takie
    // wiadomości sama (to standardowe zachowanie web push, nic tu nie trzeba
    // dodatkowo obsługiwać).
    messaging.onBackgroundMessage((payload) => {
      const title = (payload.notification && payload.notification.title) || "Albatros Jaśkowice";
      const body = (payload.notification && payload.notification.body) || "";
      self.registration.showNotification(title, {
        body,
        icon: "assets/img/icons/icon-192.png",
        badge: "assets/img/icons/icon-192.png",
      });
    });
  }
} catch (err) {
  // Brak wsparcia dla powiadomień push (stara przeglądarka, offline przy
  // pierwszej instalacji itp.) — reszta Service Workera (cache/offline)
  // ma działać dalej bez zmian, więc celowo tylko logujemy błąd.
  console.error("Push notifications: init failed", err);
}

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
