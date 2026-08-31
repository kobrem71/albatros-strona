// ============================================================================
//  KONFIGURACJA FIREBASE
// ============================================================================
// Dopóki nie uzupełnisz poniższych danych, strona działa w TRYBIE DEMO —
// zapisy zapisują się tylko w Twojej przeglądarce i nikt inny ich nie widzi.
//
// Jak uzupełnić (ok. 10 minut, za darmo, bez karty płatniczej):
//   1. Wejdź na https://console.firebase.google.com i zaloguj się kontem Google.
//   2. Kliknij "Dodaj projekt" (Add project), nadaj nazwę np. "albatros-klub".
//   3. W lewym menu: Build → Firestore Database → "Create database"
//      → wybierz "Start in test mode" → wybierz region (np. europe-west) → Enable.
//   4. W lewym menu kliknij ikonę koła zębatego → "Project settings".
//   5. Zjedź do sekcji "Your apps" → kliknij ikonę "</>" (Web) → nadaj nazwę
//      → "Register app". Firebase pokaże obiekt firebaseConfig — skopiuj go
//      i wklej poniżej (podmień cały obiekt FIREBASE_CONFIG).
//   6. W Firestore Database → zakładka "Rules" wklej zawartość pliku
//      firestore.rules (jest w tym repo) i kliknij "Publish".
//   7. Zapisz ten plik, zrób commit + push — gotowe, zapisy są już wspólne
//      dla wszystkich graczy.
// ============================================================================

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCurDkDHUpQCluWVyyqnOsr4z_5zXBz1Fc",
  authDomain: "albatros-klub.firebaseapp.com",
  projectId: "albatros-klub",
  storageBucket: "albatros-klub.firebasestorage.app",
  messagingSenderId: "694831805050",
  appId: "1:694831805050:web:96ad97f10075c34a2381c3",
};

// Strona sama wykrywa, czy powyższe dane zostały uzupełnione.
export function isFirebaseConfigured() {
  return Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
}

// ============================================================================
//  POWIADOMIENIA PUSH (opcjonalne, RĘCZNE — patrz README, sekcja
//  "Powiadomienia push") — klucz publiczny "Web Push certificate", NIE jest
//  tajny (tak jak apiKey powyżej), bezpiecznie widoczny w kodzie strony.
//
// Jak uzupełnić (jednorazowo, ok. 2 minuty):
//   1. Firebase Console → koło zębate → Project settings → zakładka
//      "Cloud Messaging".
//   2. Sekcja "Web configuration" → "Web Push certificates" → "Generate key
//      pair" (jeśli jeszcze nie ma klucza).
//   3. Skopiuj wygenerowany klucz i wklej poniżej.
//   4. WAŻNE: te same wartości (apiKey/projectId/messagingSenderId/appId
//      z FIREBASE_CONFIG powyżej) trzeba też ręcznie wkleić do `sw.js`
//      (sekcja "POWIADOMIENIA PUSH" na górze tego pliku) — Service Worker to
//      osobny, "klasyczny" skrypt i nie może zaimportować tego pliku.
// ============================================================================
export const FIREBASE_VAPID_KEY = "";

export function isPushConfigured() {
  return Boolean(FIREBASE_VAPID_KEY) && isFirebaseConfigured();
}
