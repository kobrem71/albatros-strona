// Warstwa danych: jeśli Firebase jest skonfigurowany -> Firestore (wspólne dla
// wszystkich). Jeśli nie -> localStorage (tryb demo, tylko na tym urządzeniu).

import { FIREBASE_CONFIG, isFirebaseConfigured } from "./firebase-config.js?v=36";

const DEMO_SIGNUPS_KEY = "albatros_demo_signups_v1";
const DEMO_EVENTS_KEY = "albatros_demo_events_v1";
const DEMO_PLAYER_CARD_STATS_KEY = "albatros_demo_player_card_stats_v1";
const DEMO_TACTIC_KEY = "albatros_demo_tactic_v1";
const DEMO_MESSAGES_KEY = "albatros_demo_messages_v1";
const DEMO_VISITS_KEY = "albatros_demo_visits_v1";
const DEMO_GABRYSSIM_KEY = "albatros_demo_gabryssim_v1";

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
  const tacticListeners = new Set();
  const messageListeners = new Set();
  const visitListeners = new Set();
  const gabryssimListeners = new Set();

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
  function notifyTactic() {
    const data = readLocal(DEMO_TACTIC_KEY);
    tacticListeners.forEach((cb) => cb({ slots: data.slots || {}, published: !!data.published }));
  }
  function notifyMessages() {
    const data = readLocal(DEMO_MESSAGES_KEY);
    const list = Array.isArray(data.list) ? data.list : [];
    messageListeners.forEach((cb) => cb(list));
  }
  function notifyVisits() {
    const data = readLocal(DEMO_VISITS_KEY);
    visitListeners.forEach((cb) => cb(data));
  }
  function notifyGabryssim() {
    const data = readLocal(DEMO_GABRYSSIM_KEY);
    gabryssimListeners.forEach((cb) => cb({ attempts: data.attempts || 0, goals: data.goals || 0 }));
  }

  window.addEventListener("storage", (e) => {
    if (e.key === DEMO_SIGNUPS_KEY) notifySignups();
    if (e.key === DEMO_EVENTS_KEY) notifyEvents();
    if (e.key === DEMO_PLAYER_CARD_STATS_KEY) notifyPlayerCardStats();
    if (e.key === DEMO_TACTIC_KEY) notifyTactic();
    if (e.key === DEMO_MESSAGES_KEY) notifyMessages();
    if (e.key === DEMO_VISITS_KEY) notifyVisits();
    if (e.key === DEMO_GABRYSSIM_KEY) notifyGabryssim();
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
    subscribeTacticSlots(cb) {
      const data = readLocal(DEMO_TACTIC_KEY);
      cb({ slots: data.slots || {}, published: !!data.published });
      tacticListeners.add(cb);
      return () => tacticListeners.delete(cb);
    },
    // Cała plansza (jedna, wspólna dla wszystkich) — zapisujemy zawsze pełną
    // mapę pozycja -> slug gracza, żeby każdy widział to samo. Flaga
    // "published" (patrz setTacticPublished) zostaje przy tym nietknięta.
    async setTacticSlots(slots) {
      const data = readLocal(DEMO_TACTIC_KEY);
      writeLocal(DEMO_TACTIC_KEY, { slots, published: !!data.published, ts: Date.now() });
      notifyTactic();
    },
    // Widoczność planszy dla zwykłych użytkowników — dopóki trener/kierownik/
    // Krzysztof Obremski tego nie włączą, oni widzą pustą planszę (patrz
    // visibleTacticSlots() w app.js), niezależnie od tego, co jest w "slots".
    async setTacticPublished(published) {
      const data = readLocal(DEMO_TACTIC_KEY);
      writeLocal(DEMO_TACTIC_KEY, { slots: data.slots || {}, published, ts: Date.now() });
      notifyTactic();
    },
    // Wiadomości od trenera/kierownika do wszystkich — lista rośnie tylko
    // przez dopisywanie (nikt nic nie kasuje ani nie edytuje), więc kolejność
    // wg clientTs = kolejność wg indeksu w tablicy.
    subscribeMessages(cb) {
      const data = readLocal(DEMO_MESSAGES_KEY);
      cb(Array.isArray(data.list) ? data.list : []);
      messageListeners.add(cb);
      return () => messageListeners.delete(cb);
    },
    async sendMessage(author, text) {
      const data = readLocal(DEMO_MESSAGES_KEY);
      const list = Array.isArray(data.list) ? data.list : [];
      list.push({
        id: `m${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author,
        text,
        clientTs: Date.now(),
      });
      writeLocal(DEMO_MESSAGES_KEY, { list });
      notifyMessages();
    },
    subscribeVisitCounts(cb) {
      cb(readLocal(DEMO_VISITS_KEY));
      visitListeners.add(cb);
      return () => visitListeners.delete(cb);
    },
    // Zlicza jedną wizytę danego gracza — rosnący licznik, nigdy nie resetowany.
    async recordVisit(slug, name) {
      const data = readLocal(DEMO_VISITS_KEY);
      const prevCount = data[slug]?.count || 0;
      data[slug] = { name, count: prevCount + 1, lastVisit: Date.now() };
      writeLocal(DEMO_VISITS_KEY, data);
      notifyVisits();
    },
    subscribeGabryssimStats(cb) {
      const data = readLocal(DEMO_GABRYSSIM_KEY);
      cb({ attempts: data.attempts || 0, goals: data.goals || 0 });
      gabryssimListeners.add(cb);
      return () => gabryssimListeners.delete(cb);
    },
    // Zlicza jeden strzał w "Symulatorze Gabrysia" — rosnące liczniki, nigdy
    // nie resetowane (patrz recordGabryssimShot w js/gabryssim.js).
    async recordGabryssimShot(isGoal) {
      const data = readLocal(DEMO_GABRYSSIM_KEY);
      const attempts = (data.attempts || 0) + 1;
      const goals = (data.goals || 0) + (isGoal ? 1 : 0);
      writeLocal(DEMO_GABRYSSIM_KEY, { attempts, goals });
      notifyGabryssim();
    },
    // Powiadomienia push wymagają prawdziwego Firebase (wysyłka idzie przez
    // Firebase Console — patrz README) — w trybie demo nie ma czego włączać.
    async getMessagingToken() {
      return null;
    },
    async savePushToken() {
      /* no-op w trybie demo */
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
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    increment,
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
    subscribeTacticSlots(cb) {
      return onSnapshot(doc(db, "tactic", "current"), (snap) => {
        const d = snap.exists() ? snap.data() : {};
        cb({ slots: d.slots || {}, published: !!d.published });
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
    // merge:true celowo — nadpisuje tylko "slots", flaga "published" (patrz
    // setTacticPublished) zostaje bez zmian.
    async setTacticSlots(slots) {
      await setDoc(doc(db, "tactic", "current"), { slots, updatedAt: serverTimestamp() }, { merge: true });
    },
    async setTacticPublished(published) {
      await setDoc(doc(db, "tactic", "current"), { published, updatedAt: serverTimestamp() }, { merge: true });
    },
    // Wiadomości od trenera/kierownika do wszystkich. clientTs (liczba, zegar
    // urządzenia nadawcy) służy do sortowania i wyświetlania godziny od razu —
    // serverTimestamp() dopisuje się dopiero po synchronizacji z serwerem.
    subscribeMessages(cb) {
      const q = query(collection(db, "messages"), orderBy("clientTs", "asc"));
      return onSnapshot(q, (snap) => {
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        cb(list);
      });
    },
    async sendMessage(author, text) {
      await addDoc(collection(db, "messages"), {
        author,
        text,
        clientTs: Date.now(),
        ts: serverTimestamp(),
      });
    },
    subscribeVisitCounts(cb) {
      return onSnapshot(collection(db, "visits"), (snap) => {
        const data = {};
        snap.forEach((d) => (data[d.id] = d.data()));
        cb(data);
      });
    },
    // Zlicza jedną wizytę danego gracza — increment() jest atomowy po stronie
    // serwera, więc wielu graczy odświeżających stronę naraz nie "zjada"
    // sobie nawzajem zliczeń.
    async recordVisit(slug, name) {
      await setDoc(
        doc(db, "visits", slug),
        { name, count: increment(1), lastVisit: serverTimestamp() },
        { merge: true }
      );
    },
    // Statystyki "Symulatora Gabrysia" — jeden wspólny dokument, liczniki
    // rosną atomowo (increment()), tak jak wizyty powyżej.
    subscribeGabryssimStats(cb) {
      return onSnapshot(doc(db, "gabryssim", "stats"), (snap) => {
        const d = snap.exists() ? snap.data() : {};
        cb({ attempts: d.attempts || 0, goals: d.goals || 0 });
      });
    },
    async recordGabryssimShot(isGoal) {
      await setDoc(
        doc(db, "gabryssim", "stats"),
        { attempts: increment(1), goals: increment(isGoal ? 1 : 0), lastShot: serverTimestamp() },
        { merge: true }
      );
    },
    // Rejestruje TO urządzenie do odbierania powiadomień push — zwraca token
    // FCM (albo null, jeśli przeglądarka odmówiła/nie wspiera). Samo
    // wysyłanie push jest RĘCZNE, z poziomu Firebase Console (patrz README),
    // więc ten token zapisujemy tylko do wglądu/debugowania (savePushToken
    // niżej) — Firebase Console sam wie, do jakich urządzeń wysyłać "wszystkim".
    async getMessagingToken(vapidKey, swRegistration) {
      const { getMessaging, getToken } = await import(
        "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging.js"
      );
      const messaging = getMessaging(app);
      return getToken(messaging, { vapidKey, serviceWorkerRegistration: swRegistration });
    },
    async savePushToken(token, info) {
      await setDoc(doc(db, "pushTokens", token), { ...info, updatedAt: serverTimestamp() }, { merge: true });
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
