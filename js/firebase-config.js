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
