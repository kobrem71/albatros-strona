// "Symulator Gabrysia" — mini-gra rzutów wolnych, dostępna dla WSZYSTKICH
// (przycisk w nagłówku widoczny dla każdego — w odróżnieniu od "Wizyt", które
// zostają widoczne tylko dla Krzysztofa Obremskiego, patrz refreshVisitsButtonVisibility()
// w app.js). Statystyki (SPRAWDŹ STATYSTYKI) są wspólne dla całej drużyny.
//
// Zasady (jak uzgodnione): po wybraniu rodzaju strzału (patrz SHOT_TYPES)
// gracz widzi krótki fabularny ekran "zapowiedzi" (patrz pickShotType() i
// #gabryssim-flavor w index.html) z LOSOWĄ szansą na gola przy idealnym
// strzale — losowaną za każdym razem od nowa w przedziale [minChance,
// maxChance] danego rodzaju strzału. Ta wylosowana wartość podmienia
// mnożnik na czas tej próby (selectedShotType.multiplier = wylosowany% /
// 100). Potem trzeba przytrzymać piłkę na tle zdjęcia "1 wolny.png" — pasek
// mocy napełnia się w całości w 2000 ms. Im bliżej ŚRODKA paska (czyli
// ~1000 ms trzymania) tym większa BAZOWA szansa na gola: 100% dokładnie na
// środku, -3 punkty procentowe za każdy milisekund odchylenia w lewo albo w
// prawo — tę bazową szansę mnoży wylosowany mnożnik. Wynik losowany na tej
// podstawie, gif/wideo pokazuje efekt, a każdy strzał liczy się do
// wspólnych statystyk (patrz recordGabryssimShot w js/store.js).
import { getStore } from "./store.js?v=44";

const HOLD_MS = 2000; // ile trwa pełne napełnienie paska
const CENTER_MS = HOLD_MS / 2; // "środek" — idealny moment puszczenia
const PENALTY_PER_MS = 3; // -3% bazowej szansy na gola za każdy ms odchylenia od środka

// Rodzaje strzału do wyboru przed przytrzymaniem piłki. Zamiast stałego
// mnożnika, każdy ma przedział [minChance, maxChance] (w %) — szansa na
// gola PRZY IDEALNYM trzymaniu paska jest losowana z tego przedziału od
// nowa przy każdym wyborze (patrz pickShotType()) i pokazana graczowi na
// ekranie "zapowiedzi" razem z tekstem `flavor(pct)`. "Prawa noga" ma
// przedział 1-5% (nie 0) — Gabryś nią prawie nigdy nie trafia, ale
// teoretycznie mógłby. "Spytaj Janusza" daje najwyższą szansę (96-99%),
// ale to tylko fabularny żart (kontuzja nie ma wpływu na mechanikę gry).
const SHOT_TYPES = [
  {
    id: "petarda",
    label: "Petarda",
    minChance: 70,
    maxChance: 95,
    flavor: (pct) =>
      `Uderzasz w stary, sprawdzony sposób. Masz szansę na gola przy idealnym strzale: <strong>${pct}%</strong>.`,
  },
  {
    id: "techniczny",
    label: "Technicznie",
    minChance: 55,
    maxChance: 75,
    flavor: (pct) =>
      `Znów czujesz się, jakbyś miał 20 lat i 20 kg mniej. Masz szansę na gola przy idealnym strzale: <strong>${pct}%</strong>.`,
  },
  {
    id: "podcinka",
    label: "Podcinka",
    minChance: 25,
    maxChance: 35,
    flavor: (pct) =>
      `Na trybunach pojawiła się przepiękna kobita, którą chcesz zauroczyć strzałem podcinką. Niestety nie patrzy, a szansa na gola spada do <strong>${pct}%</strong>.`,
  },
  {
    id: "prawa-noga",
    label: "Prawa noga",
    minChance: 1,
    maxChance: 5,
    flavor: (pct) =>
      `Jesteś po nieprzespanej nocy i waliłeś bongo z Jonkiem. Nie doszedłeś do siebie i próbujesz strzelić prawą nogą. Szansa na gola spada do <strong>${pct}%</strong>.`,
  },
  {
    id: "janusz",
    label: "Spytaj Janusza",
    minChance: 96,
    maxChance: 99,
    flavor: (pct) =>
      `Szansa na kontuzję wzrasta do 95%, ale za to wiesz, jaki jest sens istnienia i wiesz, jak strzelić. Szansa na gola: <strong>${pct}%</strong>.`,
  },
];

const ASSET_BASE = "assets/gabryssim/";
const GOAL_GIF = ASSET_BASE + "goal%20gif.gif";
const NO_GOAL_GIF = ASSET_BASE + "no%20goal.gif";
const CHEER_VIDEO = ASSET_BASE + "cheering%20after%20goal.mp4";

// Te same filmiki co w mozaice tła na stronie głównej (patrz BG_VIDEOS w
// js/app.js) — puszczone też na ekranie ładowania Symulatora Gabrysia, żeby
// czekanie na duże gify/wideo wyniku nie wyglądało na zawieszenie strony.
const LOADING_BG_VIDEOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `assets/gifs/gif${n}.mp4`);
const LOADING_GRID_COLUMNS = 4;
const LOADING_GRID_ROWS = 3;

const NO_GOAL_CAPTION = "Zabłotny broni - Kolejarz wygrywa";
const NO_GOAL_CAPTION_DELAY_MS = 2500; // ile MINIMUM pokazujemy "no goal.gif" zanim wejdzie plansza z napisem
const NO_GOAL_AUTO_RETURN_MS = 5000; // ile plansza z napisem stoi, zanim sama wróci do menu
const GOAL_CHEER_DELAY_MS = 2500; // ile MINIMUM pokazujemy "goal gif.gif" zanim wejdzie wideo z celebracją
const MEDIA_READY_TIMEOUT_MS = 8000; // maks. czas czekania na doładowanie się pojedynczego gifa/wideo, zanim przejdziemy dalej mimo wszystko (żeby nigdy nie zostać na czarnym ekranie w nieskończoność)

// Moduł trzyma swój własny mały stan (nie wchodzi do wspólnego state w
// app.js — statystyki wolnych i tak przychodzą osobno, z bazy).
let store = null;
let stats = { attempts: 0, goals: 0 };
// Domyślna wartość na wypadek (nie powinno się zdarzyć), gdyby ktoś strzelił
// bez przejścia przez ekran wyboru — realnie zawsze nadpisywane przez
// pickShotType() z wylosowanym mnożnikiem, patrz niżej.
let selectedShotType = { ...SHOT_TYPES[0], multiplier: 1 };

// Preload assetów wyniku — trzymane w zmiennych modułu (NIE lokalnie w
// funkcji!), bo anonimowy `new Image()`/`document.createElement("video")`
// bez żadnej referencji bywa w niektórych przeglądarkach wcześniej
// odśmiecany przez GC w trakcie ładowania, co po cichu przerywa pobieranie —
// to był realny powód, dla którego gif/wideo czasem w ogóle się nie
// pojawiały. Patrz ensurePreloadStarted() niżej.
let preload = null; // { goalImg, noGoalImg, video, goalP, noGoalP, videoP }

let holdStartTs = 0;
let isHolding = false;
let autoReturnTimer = null; // timer "po 5 sekundach wróć do menu" (i jego ewentualne anulowanie przy X)
let resultTransitionTimer = null; // timer "minimalny czas pokazania gifa" przed próbą przejścia dalej
let loadingAdvanceTimer = null; // timer "mały poślizg po dopełnieniu paska ładowania", żeby zdążyło się to zobaczyć na 100%
let resultToken = 0; // rośnie przy każdym showMenu/closeOverlay/startGame/showResult — pozwala ignorować "spóźnione" async-callbacki z poprzedniego strzału (np. gdy ktoś kliknie X w trakcie ładowania wideo)

function el(id) {
  return document.getElementById(id);
}

function clearTimers() {
  if (autoReturnTimer) {
    clearTimeout(autoReturnTimer);
    autoReturnTimer = null;
  }
  if (resultTransitionTimer) {
    clearTimeout(resultTransitionTimer);
    resultTransitionTimer = null;
  }
  if (loadingAdvanceTimer) {
    clearTimeout(loadingAdvanceTimer);
    loadingAdvanceTimer = null;
  }
}

function showScreen(id) {
  [
    "gabryssim-menu",
    "gabryssim-loading",
    "gabryssim-shottype",
    "gabryssim-flavor",
    "gabryssim-game",
    "gabryssim-result",
    "gabryssim-stats",
  ].forEach((screenId) => {
    const screen = el(screenId);
    if (screen) screen.hidden = screenId !== id;
  });
}

function stopResultMedia() {
  const video = el("gabryssim-result-video");
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.hidden = true;
  }
  const img = el("gabryssim-result-img");
  if (img) {
    img.removeAttribute("src");
    img.hidden = true;
  }
  const caption = el("gabryssim-result-caption");
  if (caption) caption.hidden = true;
}

function showMenu() {
  resultToken++; // unieważnij ewentualne oczekujące promisy z poprzedniego strzału
  clearTimers();
  stopResultMedia();
  resetBar();
  showScreen("gabryssim-menu");
}

// --------------------------------------------------------------------------
// Preload gifów/wideo wyniku — zaczyna się od razu po otwarciu gry (patrz
// openOverlay), a ekran ładowania (showLoadingScreen) czeka aż się skończy
// (albo upłynie MEDIA_READY_TIMEOUT_MS na sztukę), zanim odblokuje wybór
// strzału. Referencje do img/video trzymamy w module (`preload`), żeby
// przeglądarka nie ubiła pobierania przez GC w trakcie ładowania.
// --------------------------------------------------------------------------
function makeImageReadyPromise(url) {
  const img = new Image();
  const promise = new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
    setTimeout(finish, MEDIA_READY_TIMEOUT_MS);
  });
  img.src = url;
  return { el: img, promise };
}

function makeVideoReadyPromise(url) {
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  const promise = new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    video.addEventListener("canplay", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    setTimeout(finish, MEDIA_READY_TIMEOUT_MS);
  });
  video.src = url;
  video.load();
  return { el: video, promise };
}

function ensurePreloadStarted() {
  if (preload) return preload;
  try {
    const goal = makeImageReadyPromise(GOAL_GIF);
    const noGoal = makeImageReadyPromise(NO_GOAL_GIF);
    const video = makeVideoReadyPromise(CHEER_VIDEO);
    preload = {
      goalImg: goal.el,
      noGoalImg: noGoal.el,
      video: video.el,
      goalP: goal.promise,
      noGoalP: noGoal.promise,
      videoP: video.promise,
    };
  } catch (err) {
    console.error("Nie udało się podgrzać cache'u assetów Symulatora Gabrysia:", err);
    preload = {
      goalImg: null,
      noGoalImg: null,
      video: null,
      goalP: Promise.resolve(),
      noGoalP: Promise.resolve(),
      videoP: Promise.resolve(),
    };
  }
  return preload;
}

// Buduje raz mozaikę wideo w tle ekranu ładowania — te same pliki co na
// stronie głównej (patrz LOADING_BG_VIDEOS), losowo porozstawiane w siatce.
function buildLoadingGrid() {
  const grid = el("gabryssim-loading-grid");
  if (!grid || grid.childElementCount > 0) return;
  grid.style.gridTemplateColumns = `repeat(${LOADING_GRID_COLUMNS}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${LOADING_GRID_ROWS}, 1fr)`;
  for (let i = 0; i < LOADING_GRID_COLUMNS * LOADING_GRID_ROWS; i++) {
    const cell = document.createElement("div");
    cell.className = "bg-cell";
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.src = LOADING_BG_VIDEOS[Math.floor(Math.random() * LOADING_BG_VIDEOS.length)];
    video.play().catch(() => {});
    cell.appendChild(video);
    grid.appendChild(cell);
  }
}

// Ekran ładowania — pokazywany po kliknięciu "Strzel se wolnego", zanim
// odblokuje się wybór rodzaju strzału. Pasek pokazuje realny postęp (0/3 ->
// 3/3 gotowych assetów), nie animację na niby — jeśli assety są już gotowe
// z wcześniejszego preloadu, pasek po prostu od razu skacze w okolice 100%.
function showLoadingScreen() {
  resultToken++;
  clearTimers();
  showScreen("gabryssim-loading");
  buildLoadingGrid();

  const fill = el("gabryssim-loading-fill");
  if (fill) {
    fill.style.transition = "none";
    fill.style.width = "0%";
  }

  const p = ensurePreloadStarted();
  const myToken = resultToken;
  let readyCount = 0;
  const bump = () => {
    if (myToken !== resultToken) return; // gracz zdążył wyjść/pominąć — nie dotykaj już niczego
    readyCount++;
    if (fill) {
      fill.style.transition = "width 300ms ease-out";
      fill.style.width = `${Math.round((readyCount / 3) * 100)}%`;
    }
  };
  p.goalP.then(bump);
  p.noGoalP.then(bump);
  p.videoP.then(bump);

  Promise.all([p.goalP, p.noGoalP, p.videoP]).then(() => {
    if (myToken !== resultToken) return;
    // Mała pauza, żeby pasek zdążył wizualnie dojechać do 100%, zanim
    // przełączymy ekran.
    loadingAdvanceTimer = setTimeout(() => {
      if (myToken !== resultToken) return;
      showShotTypeScreen();
    }, 250);
  });
}

function openOverlay() {
  const overlay = el("gabryssim-overlay");
  if (!overlay) return;
  overlay.hidden = false;
  ensurePreloadStarted(); // zacznij ładować już teraz, żeby ekran ładowania miał jak najmniej do czekania
  showMenu();
}

function closeOverlay() {
  const overlay = el("gabryssim-overlay");
  if (!overlay || overlay.hidden) return;
  resultToken++;
  clearTimers();
  cancelShotInProgress();
  stopResultMedia();
  overlay.hidden = true;
}

// --------------------------------------------------------------------------
// Ekran wyboru rodzaju strzału (przed przytrzymaniem piłki) — patrz
// SHOT_TYPES na górze pliku.
// --------------------------------------------------------------------------
function showShotTypeScreen() {
  resultToken++;
  clearTimers();
  showScreen("gabryssim-shottype");
}

// --------------------------------------------------------------------------
// Wybór rodzaju strzału -> losujemy szansę na gola z przedziału tego rodzaju
// (SHOT_TYPES[].minChance..maxChance), pokazujemy ją graczowi na ekranie
// "zapowiedzi" (razem z fabularnym tekstem) i zapisujemy jako mnożnik do
// selectedShotType — dokładnie ta wylosowana wartość zostaje użyta w
// resolveShot() po przytrzymaniu piłki, więc to co gracz widzi na tym
// ekranie to naprawdę jego szansa "na idealnym środku paska".
// --------------------------------------------------------------------------
function rollChanceInRange(min, max) {
  return min + Math.random() * (max - min);
}

function pickShotType(shotType) {
  resultToken++;
  clearTimers();
  const rolledPercent = rollChanceInRange(shotType.minChance, shotType.maxChance);
  const displayPercent = Math.round(rolledPercent);
  selectedShotType = { ...shotType, multiplier: rolledPercent / 100, rolledPercent: displayPercent };

  const textEl = el("gabryssim-flavor-text");
  if (textEl) textEl.innerHTML = shotType.flavor(displayPercent);

  showScreen("gabryssim-flavor");
}

// --------------------------------------------------------------------------
// Ekran gry: pasek mocy napełniający się przez HOLD_MS, dopóki gracz
// trzyma piłkę.
// --------------------------------------------------------------------------
function resetBar() {
  isHolding = false;
  const ball = el("gabryssim-ball");
  const fill = el("gabryssim-bar-fill");
  if (ball) ball.classList.remove("is-holding");
  if (fill) {
    fill.style.transition = "none";
    fill.style.width = "0%";
  }
}

function cancelShotInProgress() {
  if (!isHolding) return;
  isHolding = false;
  resetBar();
}

function startHold() {
  if (isHolding) return;
  isHolding = true;
  holdStartTs = performance.now();
  const ball = el("gabryssim-ball");
  const fill = el("gabryssim-bar-fill");
  if (ball) ball.classList.add("is-holding");
  if (fill) {
    fill.style.transition = "none";
    fill.style.width = "0%";
    // Wymuś reflow, żeby przeglądarka na pewno zarejestrowała width:0% przed
    // dołożeniem transition — inaczej czasem animacja startuje od razu ze
    // 100%, jeśli poprzedni strzał skończył pasek w tym miejscu.
    // eslint-disable-next-line no-unused-expressions
    fill.offsetWidth;
    fill.style.transition = `width ${HOLD_MS}ms linear`;
    fill.style.width = "100%";
  }
}

function releaseHold() {
  if (!isHolding) return;
  isHolding = false;
  const elapsedMs = Math.min(performance.now() - holdStartTs, HOLD_MS);

  const ball = el("gabryssim-ball");
  const fill = el("gabryssim-bar-fill");
  if (ball) ball.classList.remove("is-holding");
  if (fill) {
    // Zatrzymaj pasek dokładnie w miejscu, w którym puszczono piłkę (zamiast
    // dokańczać animację do 100%).
    const pct = (elapsedMs / HOLD_MS) * 100;
    fill.style.transition = "none";
    fill.style.width = `${pct}%`;
  }

  resolveShot(elapsedMs);
}

function resolveShot(elapsedMs) {
  const deviationMs = Math.abs(elapsedMs - CENTER_MS);
  const baseChance = Math.max(0, 100 - PENALTY_PER_MS * deviationMs);
  const chance = Math.max(0, Math.min(100, baseChance * selectedShotType.multiplier));
  const isGoal = Math.random() * 100 < chance;

  recordShot(isGoal);
  showResult(isGoal);
}

async function recordShot(isGoal) {
  try {
    store = store || (await getStore());
    await store.recordGabryssimShot(isGoal);
  } catch (err) {
    console.error("Nie udało się zapisać statystyki strzału:", err);
  }
}

// --------------------------------------------------------------------------
// Pomocnicze: poczekaj aż obrazek/wideo faktycznie ma co pokazać (albo
// upłynie timeout) — zamiast na sztywno przełączać ekran po stałym czasie
// niezależnie od tego, czy duży plik zdążył się już załadować.
// --------------------------------------------------------------------------
function waitForImageReady(img, timeoutMs) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      img.removeEventListener("load", finish);
      img.removeEventListener("error", finish);
      resolve();
    };
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
    setTimeout(finish, timeoutMs);
  });
}

function waitForVideoReady(video, timeoutMs) {
  if (!video) return Promise.resolve();
  if (video.readyState >= 2) return Promise.resolve(); // HAVE_CURRENT_DATA — jest co narysować
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener("canplay", finish);
      video.removeEventListener("error", finish);
      resolve();
    };
    video.addEventListener("canplay", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    setTimeout(finish, timeoutMs);
  });
}

function minDelay(ms) {
  return new Promise((resolve) => {
    resultTransitionTimer = setTimeout(resolve, ms);
  });
}

// --------------------------------------------------------------------------
// Ekran wyniku: gol -> "goal gif.gif", po (co najmniej) 1 s wideo z
// celebracją (w pętli, bo nie ma automatycznego powrotu — wraca się przez
// X). Brak gola -> "no goal.gif", po (co najmniej) 1 s plansza z napisem,
// która sama wraca do menu po 5 s (albo wcześniej, jeśli kliknięto X).
// "Co najmniej" — jeśli duży plik jeszcze się ładuje, czekamy na niego (do
// MEDIA_READY_TIMEOUT_MS), żeby nigdy nie zostać na czarnym/pustym ekranie.
// --------------------------------------------------------------------------
async function showResult(isGoal) {
  const myToken = ++resultToken;
  clearTimers();
  showScreen("gabryssim-result");

  const img = el("gabryssim-result-img");
  const video = el("gabryssim-result-video");
  const caption = el("gabryssim-result-caption");
  if (video) {
    video.pause();
    video.hidden = true;
    video.loop = false;
  }
  if (caption) caption.hidden = true;

  if (isGoal) {
    if (img) {
      img.src = GOAL_GIF;
      img.alt = "Gol!";
      img.hidden = false;
    }
    if (video) {
      video.src = CHEER_VIDEO; // zacznij ładować wideo od razu, równolegle z pokazywaniem gifa
      video.load();
    }
    await Promise.all([waitForImageReady(img, MEDIA_READY_TIMEOUT_MS), minDelay(GOAL_CHEER_DELAY_MS)]);
    if (myToken !== resultToken) return; // w międzyczasie zamknięto grę/kliknięto X/zaczęto nowy strzał
    await waitForVideoReady(video, MEDIA_READY_TIMEOUT_MS);
    if (myToken !== resultToken) return;
    if (img) img.hidden = true;
    if (video) {
      video.loop = true; // brak automatycznego powrotu do menu, więc niech gra dalej zamiast zastygnąć na ostatniej klatce
      video.hidden = false;
      video.play().catch(() => {});
    }
  } else {
    if (img) {
      img.src = NO_GOAL_GIF;
      img.alt = "Brak gola";
      img.hidden = false;
    }
    await Promise.all([waitForImageReady(img, MEDIA_READY_TIMEOUT_MS), minDelay(NO_GOAL_CAPTION_DELAY_MS)]);
    if (myToken !== resultToken) return;
    if (img) img.hidden = true;
    if (caption) {
      caption.textContent = NO_GOAL_CAPTION;
      caption.hidden = false;
    }
    autoReturnTimer = setTimeout(showMenu, NO_GOAL_AUTO_RETURN_MS);
  }
}

// --------------------------------------------------------------------------
// Ekran statystyk.
// --------------------------------------------------------------------------
function renderStats() {
  const body = el("gabryssim-stats-body");
  if (!body) return;
  const { attempts, goals } = stats;
  const misses = Math.max(0, attempts - goals);
  const pct = attempts > 0 ? Math.round((goals / attempts) * 100) : 0;

  body.innerHTML = `
    <div class="gabryssim-stat-box">
      <span class="gabryssim-stat-value">${attempts}</span>
      <span class="gabryssim-stat-label">Wolne</span>
    </div>
    <div class="gabryssim-stat-box">
      <span class="gabryssim-stat-value">${goals}</span>
      <span class="gabryssim-stat-label">Gole</span>
    </div>
    <div class="gabryssim-stat-box">
      <span class="gabryssim-stat-value">${misses}</span>
      <span class="gabryssim-stat-label">Obrony/pudła</span>
    </div>
  `;
  const hint = body.parentElement ? body.parentElement.querySelector(".gabryssim-stats-pct") : null;
  if (hint) hint.remove();
  const pctLine = document.createElement("p");
  pctLine.className = "muted gabryssim-stats-pct";
  pctLine.textContent = attempts > 0 ? `Skuteczność: ${pct}%` : "Jeszcze żadnego strzału.";
  body.after(pctLine);
}

function openStats() {
  resultToken++;
  clearTimers();
  showScreen("gabryssim-stats");
  renderStats();
}

// --------------------------------------------------------------------------
// Start gry: pokaż ekran "gra" i wyzeruj pasek. Wołane po kliknięciu
// "Strzelaj!" na ekranie zapowiedzi (gabryssim-flavor) — selectedShotType
// jest już wtedy ustawiony przez pickShotType(), razem z wylosowanym
// mnożnikiem.
// --------------------------------------------------------------------------
function startGame() {
  resultToken++;
  clearTimers();
  stopResultMedia();
  resetBar();
  const hint = el("gabryssim-hint");
  if (hint) hint.textContent = `${selectedShotType.label} — przytrzymaj piłkę i puść dokładnie w środku paska`;
  showScreen("gabryssim-game");
}

export function initGabryssim() {
  const btn = el("gabryssim-btn");
  if (!btn) return; // strona bez tego bloku HTML (np. stara wersja z cache) — nic do zrobienia

  btn.addEventListener("click", openOverlay);

  el("gabryssim-menu-exit")?.addEventListener("click", closeOverlay);
  el("gabryssim-exit-btn")?.addEventListener("click", closeOverlay);
  el("gabryssim-play-btn")?.addEventListener("click", showLoadingScreen);
  el("gabryssim-loading-exit")?.addEventListener("click", closeOverlay);
  el("gabryssim-loading-skip")?.addEventListener("click", showShotTypeScreen);
  el("gabryssim-shottype-exit")?.addEventListener("click", closeOverlay);
  el("gabryssim-flavor-exit")?.addEventListener("click", closeOverlay);
  el("gabryssim-flavor-continue")?.addEventListener("click", startGame);
  el("gabryssim-stats-btn")?.addEventListener("click", openStats);
  el("gabryssim-stats-close")?.addEventListener("click", showMenu);
  el("gabryssim-stats-back")?.addEventListener("click", showMenu);
  el("gabryssim-game-exit")?.addEventListener("click", closeOverlay);
  // Po strzale X wraca do menu GRY (nie zamyka całej apki) — tak uzgodnione
  // dla planszy "brak gola", ten sam przycisk robi to samo po golu.
  el("gabryssim-result-close")?.addEventListener("click", showMenu);

  // Przyciski wyboru rodzaju strzału — każdy ma data-shot z id z SHOT_TYPES.
  // Kliknięcie NIE startuje gry od razu — najpierw losuje szansę i pokazuje
  // ekran zapowiedzi (patrz pickShotType()); gra startuje dopiero po
  // "Strzelaj!" na tamtym ekranie.
  document.querySelectorAll("#gabryssim-shottype [data-shot]").forEach((shotBtn) => {
    const shotType = SHOT_TYPES.find((s) => s.id === shotBtn.dataset.shot);
    if (!shotType) return;
    shotBtn.addEventListener("click", () => pickShotType(shotType));
  });

  const ball = el("gabryssim-ball");
  if (ball) {
    // Pointer Events obsługują mysz i dotyk jednym API. touch-action:none w
    // CSS wyłącza scrollowanie/przybliżanie strony podczas trzymania piłki.
    ball.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      try {
        ball.setPointerCapture(e.pointerId);
      } catch {
        /* ignore — niektóre przeglądarki i tak dostarczą pointerup */
      }
      startHold();
    });
    ball.addEventListener("pointerup", releaseHold);
    ball.addEventListener("pointercancel", cancelShotInProgress);
    // Gdyby palec/kursor zjechał poza piłkę bez pointerup (rzadkie, ale
    // bezpieczniej to obsłużyć) — traktuj jak puszczenie w tym momencie.
    ball.addEventListener("pointerleave", (e) => {
      if (isHolding && e.buttons === 0) releaseHold();
    });
  }

  getStore()
    .then((s) => {
      store = s;
      store.subscribeGabryssimStats((data) => {
        stats = data;
        const statsScreen = el("gabryssim-stats");
        if (statsScreen && !statsScreen.hidden) renderStats();
      });
    })
    .catch((err) => console.error("Nie udało się połączyć ze statystykami Symulatora Gabrysia:", err));
}
