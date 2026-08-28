// Warstwa danych: jeśli Firebase jest skonfigurowany -> Firestore (wspólne dla
// wszystkich). Jeśli nie -> localStorage (tryb demo, tylko na tym urządzeniu).

import { FIREBASE_CONFIG, isFirebaseConfigured } from "./firebase-config.js?v=20";

const DEMO_SIGNUPS_KEY = "albatros_demo_signups_v1";
const DEMO_EVENTS_KEY = "albatros_demo_events_v1";
const DEMO_PLAYER_CARD_STATS_KEY = "albatros_demo_player_card_stats_v1";

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}
function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// ---- Tryb demo (localStorage) ----------------------------------------------
function createLocalStore() {
  const signupListeners = new Set();
  const eventListeners = new Set();
  const playerCardStatsListeners = new Set();

  function notifySignups() {
    const data = readLocal(DEMO_SIGNUPS_KEY);
    signupListeners.forEach((cb) => cb(data));
  }
  function notifyEvents() {
    const data = readLocal(DEMO_EVENTS_KEY);
    eventListeners.forEach((cb) => cb(data));
  }
  function notifyPlayerCardStats() {
    const data = readLocal(DEMO_PLAYER_CARD_STATS_KEY);
    playerCardStatsListeners.forEach((cb) => cb(data));
  }

  window.addEventListener("storage", (e) => {
    if (e.key === DEMO_SIGNUPS_KEY) notifySignups();
    if (e.key === DEMO_EVENTS_KEY) notifyEvents();
    if (e.key === DEMO_PLAYER_CARD_STATS_KEY) notifyPlayerCardStats();
  });

  return {
    mode: "demo",
    subscribeSignups(cb) {
      cb(readLocal(DEMO_SIGNUPS_KEY));
      signupListeners.add(cb);
      return () => signupListeners.delete(cb);
    },
    subscribeEventMeta(cb) {
      cb(readLocal(DEMO_EVENTS_KEY));
      eventListeners.add(cb);
      return () => eventListeners.delete(cb);
    },
    subscribePlayerCardStats(cb) {
      cb(readLocal(DEMO_PLAYER_CARD_STATS_KEY));
      playerCardStatsListeners.add(cb);
      return () => playerCardStatsListeners.delete(cb);
    },
    async setStatus(eventId, slug, name, status) {
      const data = readLocal(DEMO_SIGNUPS_KEY);
      data[eventId] = data[eventId] || {};
      data[eventId][slug] = { status, name, ts: Date.now() };
      writeLocal(DEMO_SIGNUPS_KEY, data);
      notifySignups();
    },
    async setEventAddress(eventId, address) {
      const data = readLocal(DEMO_EVENTS_KEY);
      data[eventId] = { ...(data[eventId] || {}), address };
      writeLocal(DEMO_EVENTS_KEY, data);
      notifyEvents();
    },
    // Jednorazowy przydział 90 punktów na karcie zawodnika. Zapisuje się tylko
    // raz — jeśli w bazie już jest wpis dla tego slug, kolejne wywołanie jest
    // ignorowane (blokada po stronie store'a, niezależnie od UI).
    async setPlayerCardStats(slug, stats) {
      const data = readLocal(DEMO_PLAYER_CARD_STATS_KEY);
      if (data[slug]) return; // już zablokowane
      data[slug] = { stats, ts: Date.now() };
      writeLocal(DEMO_PLAYER_CARD_STATS_KEY, data);
      notifyPlayerCardStats();
    },
  };
}

// ---- Tryb Firebase (Firestore) ---------------------------------------------
async function createFirebaseStore() {
  const { initializeApp } = await import(
    "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js"
  );
  const {
    getFirestore,
    collection,
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    serverTimestamp,
  } = await import(
    "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"
  );

  const app = initializeApp(FIREBASE_CONFIG);
  const db = getFirestore(app);

  return {
    mode: "firebase",
    subscribeSignups(cb) {
      return onSnapshot(collection(db, "signups"), (snap) => {
        const data = {};
        snap.forEach((d) => (data[d.id] = d.data().players || {}));
        cb(data);
      });
    },
    subscribeEventMeta(cb) {
      return onSnapshot(collection(db, "events"), (snap) => {
        const data = {};
        snap.forEach((d) => (data[d.id] = d.data()));
        cb(data);
      });
    },
    subscribePlayerCardStats(cb) {
      return onSnapshot(collection(db, "playerCardStats"), (snap) => {
        const data = {};
        snap.forEach((d) => (data[d.id] = d.data()));
        cb(data);
      });
    },
    async setStatus(eventId, slug, name, status) {
      await setDoc(
        doc(db, "signups", eventId),
        { players: { [slug]: { status, name, ts: serverTimestamp() } } },
        { merge: true }
      );
    },
    // Jednorazowy przydział 90 punktów na karcie zawodnika — blokada po
    // stronie store'a: jeśli dokument już istnieje, nic nie nadpisuje (nawet
    // gdyby ktoś ominął blokadę w UI).
    async setPlayerCardStats(slug, stats) {
      const ref = doc(db, "playerCardStats", slug);
      const existing = await getDoc(ref);
      if (existing.exists()) return;
      await setDoc(ref, { stats, updatedAt: serverTimestamp() });
    },
    async setEventAddress(eventId, address) {
      await setDoc(
        doc(db, "events", eventId),
        { address, updatedAt: serverTimestamp() },
        { merge: true }
      );
    },
  };
}

let storePromise = null;
export function getStore() {
  if (!storePromise) {
    storePromise = isFirebaseConfigured()
      ? createFirebaseStore().catch((err) => {
          console.error("Firebase init failed, falling back to demo store:", err);
          return createLocalStore();
        })
      : Promise.resolve(createLocalStore());
  }
  return storePromise;
}
