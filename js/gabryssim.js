// "Symulator Gabrysia" — mini-gra rzutów wolnych, widoczna wyłącznie dla
// Krzysztofa Obremskiego (przycisk w nagłówku jest ukryty dla reszty, patrz
// refreshGabryssimButtonVisibility niżej i canGabryssim() wołane z app.js
// przez refreshPermissionUI()).
//
// Zasady (jak uzgodnione): na tle zdjęcia "1 wolny.png" trzeba przytrzymać
// piłkę — pasek mocy napełnia się w całości w 2000 ms. Im bliżej ŚRODKA
// paska (czyli ~1000 ms trzymania) tym większa szansa na gola: 100% dokładnie
// na środku, -3 punkty procentowe za każdy milisekund odchylenia w lewo albo
// w prawo. Wynik losowany na tej podstawie, gif/wideo pokazuje efekt, a każdy
// strzał liczy się do wspólnych statystyk (patrz recordGabryssimShot w
// js/store.js).
import { getStore } from "./store.js?v=34";

const HOLD_MS = 2000; // ile trwa pełne napełnienie paska
const CENTER_MS = HOLD_MS / 2; // "środek" — idealny moment puszczenia
const PENALTY_PER_MS = 3; // -3% szansy na gola za każdy ms odchylenia od środka

const ASSET_BASE = "assets/gabryssim/";
const GOAL_GIF = ASSET_BASE + "goal%20gif.gif";
const NO_GOAL_GIF = ASSET_BASE + "no%20goal.gif";
const CHEER_VIDEO = ASSET_BASE + "cheering%20after%20goal.mp4";

const NO_GOAL_CAPTION = "Zabłotny broni - Kolejarz wygrywa";
const NO_GOAL_CAPTION_DELAY_MS = 1000; // ile pokazujemy "no goal.gif" zanim wejdzie plansza z napisem
const NO_GOAL_AUTO_RETURN_MS = 5000; // ile plansza z napisem stoi, zanim sama wróci do menu
const GOAL_CHEER_DELAY_MS = 1000; // ile pokazujemy "goal gif.gif" zanim wejdzie wideo z celebracją

// Moduł trzyma swój własny mały stan (nie wchodzi do wspólnego state w
// app.js — statystyki wolnych i tak przychodzą osobno, z bazy).
let state = null;
let superuserSlug = "";
let store = null;
let stats = { attempts: 0, goals: 0 };

let holdTimer = null; // pointerdown -> pointerup timing
let holdStartTs = 0;
let isHolding = false;
let autoReturnTimer = null; // timer "po 5 sekundach wróć do menu" (i jego ewentualne anulowanie przy X)
let resultTransitionTimer = null; // timer "po 1 sekundzie pokaż celebrację/planszę"

function el(id) {
  return document.getElementById(id);
}

function isSuperuser() {
  return !!state && state.identitySlug === superuserSlug;
}

// Wołane z refreshPermissionUI() w app.js po każdej zmianie tożsamości —
// dokładnie ten sam mechanizm co przycisk "Wizyty".
export function refreshGabryssimButtonVisibility() {
  const btn = el("gabryssim-btn");
  if (btn) btn.hidden = !isSuperuser();
  // Jeśli w trakcie gry ktoś traci uprawnienia (np. zmiana tożsamości na
  // innym urządzeniu zsynchronizowała się tutaj) — zamknij grę, żeby nie
  // zostać w środku z ukrytym przyciskiem powrotu.
  if (!isSuperuser()) closeOverlay();
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
}

function showScreen(id) {
  ["gabryssim-menu", "gabryssim-game", "gabryssim-result", "gabryssim-stats"].forEach((screenId) => {
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
  clearTimers();
  stopResultMedia();
  resetBar();
  showScreen("gabryssim-menu");
}

function openOverlay() {
  if (!isSuperuser()) return; // zabezpieczenie — przycisk i tak jest ukryty
  const overlay = el("gabryssim-overlay");
  if (!overlay) return;
  overlay.hidden = false;
  showMenu();
}

function closeOverlay() {
  const overlay = el("gabryssim-overlay");
  if (!overlay || overlay.hidden) return;
  clearTimers();
  cancelShotInProgress();
  stopResultMedia();
  overlay.hidden = true;
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
  const chance = Math.max(0, 100 - PENALTY_PER_MS * deviationMs);
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
// Ekran wyniku: gol -> "goal gif.gif", po 1 s wideo z celebracją (w pętli,
// bo nie ma automatycznego powrotu — wraca się przez X). Brak gola ->
// "no goal.gif", po 1 s plansza z napisem, która sama wraca do menu po 5 s
// (albo wcześniej, jeśli kliknięto X).
// --------------------------------------------------------------------------
function showResult(isGoal) {
  clearTimers();
  showScreen("gabryssim-result");

  const img = el("gabryssim-result-img");
  const video = el("gabryssim-result-video");
  const caption = el("gabryssim-result-caption");
  if (video) {
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
    resultTransitionTimer = setTimeout(() => {
      if (img) img.hidden = true;
      if (video) {
        video.src = CHEER_VIDEO;
        video.loop = true; // brak automatycznego powrotu do menu, więc niech gra dalej zamiast zastygnąć na ostatniej klatce
        video.hidden = false;
        video.play().catch(() => {});
      }
    }, GOAL_CHEER_DELAY_MS);
  } else {
    if (img) {
      img.src = NO_GOAL_GIF;
      img.alt = "Brak gola";
      img.hidden = false;
    }
    resultTransitionTimer = setTimeout(() => {
      if (img) img.hidden = true;
      if (caption) {
        caption.textContent = NO_GOAL_CAPTION;
        caption.hidden = false;
      }
      autoReturnTimer = setTimeout(showMenu, NO_GOAL_AUTO_RETURN_MS);
    }, NO_GOAL_CAPTION_DELAY_MS);
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
  clearTimers();
  showScreen("gabryssim-stats");
  renderStats();
}

// --------------------------------------------------------------------------
// Start gry: pokaż ekran "gra" i wyzeruj pasek.
// --------------------------------------------------------------------------
function startGame() {
  clearTimers();
  stopResultMedia();
  resetBar();
  showScreen("gabryssim-game");
}

export function initGabryssim(appState, superuserSlugArg) {
  state = appState;
  superuserSlug = superuserSlugArg;

  const btn = el("gabryssim-btn");
  if (!btn) return; // strona bez tego bloku HTML (np. stara wersja z cache) — nic do zrobienia

  btn.addEventListener("click", openOverlay);

  el("gabryssim-menu-exit")?.addEventListener("click", closeOverlay);
  el("gabryssim-exit-btn")?.addEventListener("click", closeOverlay);
  el("gabryssim-play-btn")?.addEventListener("click", startGame);
  el("gabryssim-stats-btn")?.addEventListener("click", openStats);
  el("gabryssim-stats-close")?.addEventListener("click", showMenu);
  el("gabryssim-stats-back")?.addEventListener("click", showMenu);
  el("gabryssim-game-exit")?.addEventListener("click", closeOverlay);
  // Po strzale X wraca do menu GRY (nie zamyka całej apki) — tak uzgodnione
  // dla planszy "brak gola", ten sam przycisk robi to samo po golu.
  el("gabryssim-result-close")?.addEventListener("click", showMenu);

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

  refreshGabryssimButtonVisibility();
}
