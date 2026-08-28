import { PLAYERS, slugify } from "./players.js";
import { RECURRING_RULES, EXTRA_EVENTS, TYPE_META } from "./schedule.js";
import { isFirebaseConfigured } from "./firebase-config.js";
import { getStore } from "./store.js";
import {
  LEAGUE_NAME,
  LEAGUE_SOURCE_URL,
  LEAGUE_UPDATED,
  LEAGUE_TABLE,
  ALBATROS_TEAM_NAME,
  ALBATROS_FIXTURES,
  PLAYER_STATS,
  PLAYER_STATS_UPDATED,
} from "./league-data.js";

// Gracze domyślnie zwinięci pod "Pokaż więcej" na liście zapisów i w statystykach
// (konta testowe / gracze grający rzadko) — nie znikają, tylko nie zaśmiecają
// głównego widoku. Można ich rozwinąć jednym kliknięciem.
const HIDDEN_NAMES = [
  "Zawodnik Testowany1",
  "Zawodnik Testowany2",
  "Stanisław Taczyński",
  "Krzysztof Taczyński",
  "Damian Pachołek",
  "Rafał Kanasiuk",
];
const HIDDEN_SLUGS = new Set(HIDDEN_NAMES.map(slugify));

// Bramkarze klubu — na trening bramkarski zapisują się tylko oni, więc lista
// (i licząca się z niej frekwencja treningu bramkarskiego) jest zawężona
// tylko do tej czwórki.
const GOALKEEPER_NAMES = ["Dawid Bubień", "Janusz Tkacz", "Brajan Kwiatkowski", "Marek Taczyński"];
const GOALKEEPER_SLUGS = new Set(GOALKEEPER_NAMES.map(slugify));

const WEEKDAY_NAMES = [
  "niedziela",
  "poniedziałek",
  "wtorek",
  "środa",
  "czwartek",
  "piątek",
  "sobota",
];
const STATUSES = [
  { key: "tak", label: "Tak" },
  { key: "nie", label: "Nie" },
  { key: "hgw", label: "HGW" },
];
const IDENTITY_KEY = "albatros_identity_slug_v1";

// ---------------------------------------------------------------------------
// 1. Wyznacz wydarzenia na najbliższe 7 dni (regularne + jednorazowe)
// ---------------------------------------------------------------------------
function pad(n) {
  return String(n).padStart(2, "0");
}
function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const EVENTS_TO_SHOW = 6;
const SEARCH_DAYS_AHEAD = 60; // wystarczająco daleko, żeby zawsze znaleźć 6 wydarzeń

export function buildUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < SEARCH_DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  const dayStrs = new Set(days.map(toDateStr));

  const events = [];

  for (const day of days) {
    const dateStr = toDateStr(day);
    for (const rule of RECURRING_RULES) {
      if (day.getDay() === rule.weekday) {
        events.push({
          id: `${rule.type}-${dateStr}`,
          type: rule.type,
          date: dateStr,
          dateObj: new Date(day),
          time: rule.time,
          defaultLocation: rule.location || "",
          label: rule.label || null,
        });
      }
    }
  }

  for (const ev of EXTRA_EVENTS) {
    if (dayStrs.has(ev.date)) {
      events.push({
        id: `${ev.type}-${ev.date}`,
        type: ev.type,
        date: ev.date,
        dateObj: new Date(ev.date + "T00:00:00"),
        time: ev.time,
        defaultLocation: ev.location || "",
        label: ev.label || null,
      });
    }
  }

  events.sort((a, b) => {
    const da = `${a.date} ${a.time}`;
    const db_ = `${b.date} ${b.time}`;
    return da.localeCompare(db_);
  });

  return events.slice(0, EVENTS_TO_SHOW);
}

function formatDateHuman(dateObj) {
  const weekday = WEEKDAY_NAMES[dateObj.getDay()];
  const day = pad(dateObj.getDate());
  const month = pad(dateObj.getMonth() + 1);
  return `${weekday}, ${day}.${month}`;
}

// ---------------------------------------------------------------------------
// 2. Avatary graczy
// ---------------------------------------------------------------------------
const PLAYER_PLACEHOLDER_SRC = "assets/img/player-placeholder.png";

const AVATAR_PALETTE = [
  "#2f7dd1",
  "#d4a21b",
  "#a437c9",
  "#2ba876",
  "#e0653f",
  "#3f5fe0",
  "#c93f7a",
  "#4aa3c9",
];

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function initialsOf(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Wspólna logika ładowania zdjęcia gracza (próbuje kolejne rozszerzenia,
// potem wspólny placeholder, na końcu zostają inicjały) — używana zarówno
// przez mały okrągły awatar, jak i duże zdjęcie na karcie zawodnika.
function playerPhotoNode(player, wrapClassName) {
  const wrap = document.createElement("div");
  wrap.className = wrapClassName;
  const img = document.createElement("img");
  img.alt = player.name;
  // Uwaga: celowo BEZ loading="lazy" — w połączeniu z display:none (poniżej)
  // przeglądarka nigdy nie wie, czy obrazek "wszedł" w viewport (brak layoutu),
  // więc request o zdjęcie w ogóle się nie wysyła. Zdjęć jest niewiele, więc
  // eager-loading nie szkodzi wydajności.
  const fallback = document.createElement("span");
  fallback.className = "avatar-fallback";
  fallback.textContent = initialsOf(player.name);
  fallback.style.background = AVATAR_PALETTE[hashStr(player.slug) % AVATAR_PALETTE.length];

  wrap.appendChild(img);
  wrap.appendChild(fallback);

  let tried = 0;
  const exts = ["jpg", "jpeg", "png", "webp"];
  img.style.display = "none";
  function tryNext() {
    if (tried < exts.length) {
      img.src = `${player.photoBase}.${exts[tried]}`;
      tried++;
    } else if (tried === exts.length) {
      tried++;
      img.src = PLAYER_PLACEHOLDER_SRC; // brak własnego zdjęcia -> wspólny placeholder
    }
    // jeśli i placeholder się nie wczyta, zostają inicjały (fallback już w DOM)
  }
  img.onerror = tryNext;
  img.onload = () => {
    img.style.display = "block";
    fallback.style.display = "none";
  };
  tryNext();

  return wrap;
}

function avatarNode(player) {
  return playerPhotoNode(player, "avatar");
}

// ---------------------------------------------------------------------------
// 3. Render
// ---------------------------------------------------------------------------
export const state = {
  events: buildUpcomingEvents(),
  activeEventId: null,
  signups: {},
  eventMeta: {},
  identitySlug: localStorage.getItem(IDENTITY_KEY) || "",
};

function renderIdentityBar() {
  const bar = document.getElementById("identity-bar");
  bar.innerHTML = "";

  if (state.identitySlug) {
    const player = PLAYERS.find((p) => p.slug === state.identitySlug);
    const text = document.createElement("span");
    text.innerHTML = `Jesteś zalogowany jako <strong>${player ? player.name : state.identitySlug}</strong>`;
    const change = document.createElement("button");
    change.className = "link-btn";
    change.textContent = "Zmień";
    change.onclick = () => {
      state.identitySlug = "";
      localStorage.removeItem(IDENTITY_KEY);
      renderIdentityBar();
      renderRoster();
    };
    bar.appendChild(text);
    bar.appendChild(change);
  } else {
    const label = document.createElement("span");
    label.textContent = "Kim jesteś? ";
    const select = document.createElement("select");
    select.className = "identity-select";
    const empty = document.createElement("option");
    empty.textContent = "— wybierz swoje imię —";
    empty.value = "";
    select.appendChild(empty);
    for (const p of PLAYERS) {
      const opt = document.createElement("option");
      opt.value = p.slug;
      opt.textContent = p.name;
      select.appendChild(opt);
    }
    select.onchange = () => {
      if (select.value) {
        state.identitySlug = select.value;
        localStorage.setItem(IDENTITY_KEY, select.value);
        renderIdentityBar();
        renderRoster();
      }
    };
    bar.appendChild(label);
    bar.appendChild(select);
  }
}

// Gracze uprawnieni do zapisu na dane wydarzenie (trening bramkarski -> tylko
// bramkarze; reszta wydarzeń -> wszyscy). Używane zarówno do listy zapisów,
// jak i do liczników Tak/Nie/HGW na karcie — dzięki temu np. stary zapis
// sprzed wprowadzenia zawężenia do bramkarzy nie zawyży licznika.
function rosterPoolForEvent(ev) {
  return ev.type === "trening-bramkarski" ? PLAYERS.filter((p) => GOALKEEPER_SLUGS.has(p.slug)) : PLAYERS;
}

export function statusCounts(ev) {
  const players = state.signups[ev.id] || {};
  const pool = rosterPoolForEvent(ev);
  const eligibleSlugs = new Set(pool.map((p) => p.slug));
  const counts = { tak: 0, nie: 0, hgw: 0 };
  Object.entries(players).forEach(([slug, p]) => {
    if (!eligibleSlugs.has(slug)) return;
    if (counts[p.status] !== undefined) counts[p.status]++;
  });
  return counts;
}

function renderSchedule() {
  const wrap = document.getElementById("schedule-list");
  wrap.innerHTML = "";

  if (state.events.length === 0) {
    wrap.innerHTML = `<p class="muted">Brak zaplanowanych wydarzeń. Dodaj je w js/schedule.js.</p>`;
    return;
  }

  if (!state.activeEventId) state.activeEventId = state.events[0].id;

  for (const ev of state.events) {
    const meta = TYPE_META[ev.type] || { label: ev.type, color: "#666", colorSoft: "#eee" };
    const card = document.createElement("button");
    card.className = "event-card" + (ev.id === state.activeEventId ? " active" : "");
    card.style.setProperty("--accent", meta.color);
    card.style.setProperty("--accent-soft", meta.colorSoft);

    const counts = statusCounts(ev);
    const address = (state.eventMeta[ev.id] && state.eventMeta[ev.id].address) || ev.defaultLocation;

    card.innerHTML = `
      <span class="event-type-badge">${meta.label}</span>
      <span class="event-date">${formatDateHuman(ev.dateObj)} · ${ev.time}</span>
      ${ev.label ? `<span class="event-label">${escapeHtml(ev.label)}</span>` : ""}
      <span class="event-address">${address ? "📍 " + escapeHtml(address) : "📍 adres nieustalony"}</span>
      <span class="event-counts">
        <span class="ec-item c-tak">${counts.tak}<small>TAK</small></span><span class="ec-sep">/</span><span class="ec-item c-nie">${counts.nie}<small>NIE</small></span><span class="ec-sep">/</span><span class="ec-item c-hgw">${counts.hgw}<small>HGW</small></span>
      </span>
    `;
    card.onclick = () => {
      state.activeEventId = ev.id;
      renderSchedule();
      renderRoster();
    };
    wrap.appendChild(card);
  }
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

let store = null;

function renderRoster() {
  const container = document.getElementById("roster-panel");
  container.innerHTML = "";
  const ev = state.events.find((e) => e.id === state.activeEventId);
  if (!ev) {
    container.innerHTML = `<p class="muted">Wybierz wydarzenie powyżej.</p>`;
    return;
  }
  const meta = TYPE_META[ev.type] || { label: ev.type, color: "#666" };

  const header = document.createElement("div");
  header.className = "roster-header";
  header.style.setProperty("--accent", meta.color);
  const address = (state.eventMeta[ev.id] && state.eventMeta[ev.id].address) || ev.defaultLocation;

  header.innerHTML = `
    <div>
      <span class="event-type-badge">${meta.label}</span>
      <h3>${formatDateHuman(ev.dateObj)} · ${ev.time}</h3>
      ${ev.label ? `<p class="roster-event-label">${escapeHtml(ev.label)}</p>` : ""}
    </div>
  `;

  const addrRow = document.createElement("div");
  addrRow.className = "address-row";
  const addrText = document.createElement("span");
  addrText.textContent = address ? `📍 ${address}` : "📍 adres nieustalony";
  const addrBtn = document.createElement("button");
  addrBtn.className = "link-btn";
  addrBtn.textContent = "Ustaw adres";
  addrBtn.onclick = async () => {
    const val = prompt("Podaj adres treningu/meczu:", address || "");
    if (val !== null) {
      store = store || (await getStore());
      store.setEventAddress(ev.id, val.trim());
    }
  };
  addrRow.appendChild(addrText);
  addrRow.appendChild(addrBtn);
  header.appendChild(addrRow);
  container.appendChild(header);

  const playersData = state.signups[ev.id] || {};

  function buildRow(player) {
    const row = document.createElement("div");
    row.className = "roster-row";
    if (player.slug === state.identitySlug) row.classList.add("me");

    row.appendChild(avatarNode(player));

    const nameEl = document.createElement("span");
    nameEl.className = "roster-name";
    nameEl.textContent = player.name;
    makeNameClickable(nameEl, player);
    row.appendChild(nameEl);

    const currentStatus = playersData[player.slug]?.status;
    const btnGroup = document.createElement("div");
    btnGroup.className = "status-group";

    const canEdit = state.identitySlug === player.slug;

    for (const s of STATUSES) {
      const btn = document.createElement("button");
      btn.className = `status-btn status-${s.key}` + (currentStatus === s.key ? " selected" : "");
      btn.textContent = s.label;
      btn.disabled = !canEdit;
      if (!canEdit) btn.title = "Wybierz swoje imię u góry, żeby się zapisać";
      btn.onclick = async () => {
        store = store || (await getStore());
        store.setStatus(ev.id, player.slug, player.name, s.key);
      };
      btnGroup.appendChild(btn);
    }
    row.appendChild(btnGroup);
    return row;
  }

  const rosterPool = rosterPoolForEvent(ev);
  const { visible, hidden } = getOrderedPlayerGroups(rosterPool, playersData, state.identitySlug);

  const list = document.createElement("div");
  list.className = "roster-list";
  for (const player of visible) {
    list.appendChild(buildRow(player));
  }
  container.appendChild(list);

  if (hidden.length > 0) {
    const details = document.createElement("details");
    details.className = "roster-more";
    const summary = document.createElement("summary");
    summary.textContent = `Pokaż więcej (${hidden.length})`;
    details.appendChild(summary);
    const hiddenList = document.createElement("div");
    hiddenList.className = "roster-list";
    for (const player of hidden) {
      hiddenList.appendChild(buildRow(player));
    }
    details.appendChild(hiddenList);
    container.appendChild(details);
  }
}

// ---------------------------------------------------------------------------
// 3b. Statystyki frekwencji (na podstawie całej historii zapisów w Firestore)
// ---------------------------------------------------------------------------
const TYPE_KEYS_BY_LENGTH = Object.keys(TYPE_META).sort((a, b) => b.length - a.length);

function eventTypeFromId(eventId) {
  for (const key of TYPE_KEYS_BY_LENGTH) {
    if (eventId.startsWith(`${key}-`)) return key;
  }
  return null;
}

function categoryOfType(type) {
  if (type === "mecz") return "mecz";
  if (type === "trening" || type === "trening-bramkarski") return "trening";
  return null;
}

// eventId ma zawsze format "typ-RRRR-MM-DD" (np. "mecz-2026-09-06"), więc datę
// wydarzenia da się wyciągnąć wprost z eventId, bez dodatkowego zapytania.
function dateStrFromEventId(eventId, type) {
  return eventId.slice(type.length + 1); // odetnij "typ-"
}

function computeAttendanceStats(cutoffDateStr) {
  const stats = {};
  for (const p of PLAYERS) {
    stats[p.slug] = {
      trening: { tak: 0, total: 0 },
      mecz: { tak: 0, total: 0 },
    };
  }

  for (const [eventId, players] of Object.entries(state.signups)) {
    const type = eventTypeFromId(eventId);
    const category = categoryOfType(type);
    if (!category) continue;
    if (cutoffDateStr && dateStrFromEventId(eventId, type) >= cutoffDateStr) continue;
    for (const [slug, resp] of Object.entries(players || {})) {
      if (!stats[slug]) continue;
      stats[slug][category].total++;
      if (resp.status === "tak") stats[slug][category].tak++;
    }
  }

  return stats;
}

function formatPct(bucket) {
  if (!bucket || bucket.total === 0) return "—";
  const pct = Math.round((bucket.tak / bucket.total) * 100);
  return `${bucket.tak}/${bucket.total} (${pct}%)`;
}

// ---------------------------------------------------------------------------
// 3c. Kolejność graczy: wg frekwencji, ale przeliczana tylko co 2 tygodnie
// ---------------------------------------------------------------------------
// Bez backendu/crona nie da się "przeliczać co 2 tygodnie" dosłownie — zamiast
// tego kolejność jest funkcją bieżącej daty: liczymy ranking na podstawie
// zapisów sprzed początku aktualnego 14-dniowego okresu. Dzięki temu lista
// jest stabilna przez całe 2 tygodnie i sama, automatycznie, przesuwa się na
// kolejny okres — bez potrzeby czyjejkolwiek interwencji.
const SORT_PERIOD_ANCHOR = new Date("2026-08-24T00:00:00"); // poniedziałek
const SORT_PERIOD_DAYS = 14;

export function currentSortCutoffDateStr() {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSince = Math.floor((now - SORT_PERIOD_ANCHOR) / msPerDay);
  const periodIndex = Math.floor(daysSince / SORT_PERIOD_DAYS);
  const periodStart = new Date(SORT_PERIOD_ANCHOR.getTime() + periodIndex * SORT_PERIOD_DAYS * msPerDay);
  return toDateStr(periodStart);
}

function sortScore(stats, slug) {
  const t = stats[slug]?.trening || { tak: 0, total: 0 };
  const m = stats[slug]?.mecz || { tak: 0, total: 0 };
  const tak = t.tak + m.tak;
  const total = t.total + m.total;
  if (total === 0) return -1; // brak historii -> na koniec listy
  return tak / total;
}

// Kolejność odpowiedzi na danym wydarzeniu: Tak, potem Nie, potem HGW,
// na końcu brak odpowiedzi.
const STATUS_RANK = { tak: 0, nie: 1, hgw: 2 };
function statusRank(eventPlayersData, slug) {
  const status = eventPlayersData?.[slug]?.status;
  return STATUS_RANK[status] ?? 3;
}

// Zwraca graczy posortowanych: najpierw zalogowany zawodnik (jeśli podano
// `identitySlug` — żeby mógł od razu, bez szukania, zagłosować), potem wg
// odpowiedzi na TO wydarzenie (Tak -> Nie -> HGW -> brak odpowiedzi, jeśli
// podano `eventPlayersData`), a w obrębie tej samej odpowiedzi — wg
// frekwencji (zamrożonej na bieżący 2-tyg. okres). Podzieleni na widocznych
// i zwiniętych pod "Pokaż więcej" — zalogowany zawodnik zawsze widoczny,
// nawet jeśli normalnie byłby ukryty.
// `pool` pozwala zawęzić listę (np. do samych bramkarzy na trening bramkarski).
export function getOrderedPlayerGroups(pool = PLAYERS, eventPlayersData = null, identitySlug = null) {
  const cutoff = currentSortCutoffDateStr();
  const frozenStats = computeAttendanceStats(cutoff);

  const sorted = [...pool].sort((a, b) => {
    if (identitySlug) {
      if (a.slug === identitySlug && b.slug !== identitySlug) return -1;
      if (b.slug === identitySlug && a.slug !== identitySlug) return 1;
    }
    if (eventPlayersData) {
      const rankDiff = statusRank(eventPlayersData, a.slug) - statusRank(eventPlayersData, b.slug);
      if (rankDiff !== 0) return rankDiff;
    }
    return sortScore(frozenStats, b.slug) - sortScore(frozenStats, a.slug);
  });

  return {
    visible: sorted.filter((p) => !HIDDEN_SLUGS.has(p.slug) || p.slug === identitySlug),
    hidden: sorted.filter((p) => HIDDEN_SLUGS.has(p.slug) && p.slug !== identitySlug),
  };
}

function buildStatsTable(players, stats) {
  const table = document.createElement("table");
  table.className = "stats-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Gracz</th>
        <th>Frekwencja treningi</th>
        <th>Frekwencja mecze</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");

  for (const player of players) {
    const tr = document.createElement("tr");
    const tdPlayer = document.createElement("td");
    tdPlayer.className = "stats-player-cell";
    tdPlayer.appendChild(avatarNode(player));
    const nameSpan = document.createElement("span");
    nameSpan.textContent = player.name;
    makeNameClickable(nameSpan, player);
    tdPlayer.appendChild(nameSpan);

    const tdTrening = document.createElement("td");
    tdTrening.textContent = formatPct(stats[player.slug]?.trening);
    const tdMecz = document.createElement("td");
    tdMecz.textContent = formatPct(stats[player.slug]?.mecz);

    tr.appendChild(tdPlayer);
    tr.appendChild(tdTrening);
    tr.appendChild(tdMecz);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  return table;
}

function renderStats() {
  const container = document.getElementById("stats-panel");
  if (!container) return;
  container.innerHTML = "";

  const stats = computeAttendanceStats(); // pełna historia (bez zamrożenia) - do wyświetlenia liczb
  const { visible, hidden } = getOrderedPlayerGroups();

  container.appendChild(buildStatsTable(visible, stats));

  if (hidden.length > 0) {
    const details = document.createElement("details");
    details.className = "roster-more";
    const summary = document.createElement("summary");
    summary.textContent = `Pokaż więcej (${hidden.length})`;
    details.appendChild(summary);
    details.appendChild(buildStatsTable(hidden, stats));
    container.appendChild(details);
  }
}

// ---------------------------------------------------------------------------
// 4. Tło: mozaika małych "okienek" wideo wypełniająca cały ekran
// ---------------------------------------------------------------------------
const BG_VIDEOS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `assets/gifs/gif${n}.mp4`);
const BG_CELL_TARGET_W = 300; // px, orientacyjna szerokość jednego "okienka"
const BG_CELL_ASPECT = 4 / 3; // proporcje okienka (szerokość / wysokość)
const BG_MAX_COLUMNS = 7;
const BG_MAX_ROWS = 5;
const BG_MIN_COLUMNS = 2;
const BG_MIN_ROWS = 2;

function randomVideoSrc(excludeSrc) {
  let pick;
  do {
    pick = BG_VIDEOS[Math.floor(Math.random() * BG_VIDEOS.length)];
  } while (BG_VIDEOS.length > 1 && pick === excludeSrc);
  return pick;
}

function initBackground() {
  const grid = document.getElementById("bg-grid");
  let resizeTimer = null;

  function build() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    let columns = Math.round(w / BG_CELL_TARGET_W);
    columns = Math.max(BG_MIN_COLUMNS, Math.min(BG_MAX_COLUMNS, columns));
    const cellW = w / columns;
    const cellH = cellW / BG_CELL_ASPECT;
    let rows = Math.round(h / cellH);
    rows = Math.max(BG_MIN_ROWS, Math.min(BG_MAX_ROWS, rows));

    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    grid.innerHTML = "";

    const total = columns * rows;
    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.className = "bg-cell";
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.src = randomVideoSrc();
      video.play().catch(() => {});
      cell.appendChild(video);
      grid.appendChild(cell);
    }
  }

  // Co jakiś czas podmień losową część okienek na inny filmik, dla żywszego tła.
  function shuffleSome() {
    const cells = grid.querySelectorAll(".bg-cell video");
    if (cells.length === 0) return;
    const howMany = Math.max(1, Math.round(cells.length * 0.2));
    for (let i = 0; i < howMany; i++) {
      const video = cells[Math.floor(Math.random() * cells.length)];
      const newSrc = randomVideoSrc(video.getAttribute("src"));
      video.src = newSrc;
      video.play().catch(() => {});
    }
  }

  build();
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 400);
  });
  setInterval(shuffleSome, 9000);
}

// ---------------------------------------------------------------------------
// 4b. Przycisk "Losowy gif" — pełnoekranowe odtworzenie, potem powrót
// ---------------------------------------------------------------------------
function initRandomGifButton() {
  const btn = document.getElementById("random-gif-btn");
  const overlay = document.getElementById("gif-overlay");
  const video = document.getElementById("gif-overlay-video");
  const closeBtn = document.getElementById("gif-overlay-close");
  if (!btn || !overlay || !video || !closeBtn) return;

  function closeOverlay() {
    overlay.hidden = true;
    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  function openOverlay() {
    video.src = randomVideoSrc();
    overlay.hidden = false;
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  btn.addEventListener("click", openOverlay);
  closeBtn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay(); // klik w tło poza filmikiem
  });
  video.addEventListener("ended", closeOverlay); // po odtworzeniu -> wraca na główną
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeOverlay();
  });
}

// ---------------------------------------------------------------------------
// 4c. Przycisk "Tabela i terminarz" — tabela ligi + mecze samego Albatrosa
// ---------------------------------------------------------------------------
function renderLeagueTable(container) {
  const rows = LEAGUE_TABLE.map((t) => {
    const isAlbatros = t.name === ALBATROS_TEAM_NAME;
    return `
      <tr class="${isAlbatros ? "is-albatros" : ""}">
        <td>${t.pos}.</td>
        <td>${t.name}</td>
        <td>${t.m}</td>
        <td class="pts">${t.pts}</td>
        <td>${t.w}</td>
        <td>${t.d}</td>
        <td>${t.l}</td>
        <td>${t.gf}-${t.ga}</td>
      </tr>`;
  }).join("");

  container.innerHTML = `
    <thead>
      <tr>
        <th>#</th><th>Drużyna</th><th>M</th><th>Pkt</th><th>Z</th><th>R</th><th>P</th><th>Bramki</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>`;
}

function renderAlbatrosFixtures(container) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Pierwszy jeszcze nierozegrany mecz z ustaloną datą — podświetlamy go.
  const nextIndex = ALBATROS_FIXTURES.findIndex(
    (f) => f.status === "scheduled" && new Date(f.date + "T00:00:00") >= today
  );

  container.innerHTML = ALBATROS_FIXTURES.map((f, i) => {
    if (f.status === "bye") {
      return `
        <div class="league-fixture is-bye">
          <span class="league-fixture-round">${f.round}.</span>
          <span class="league-fixture-match">kolejka wolna — pauza</span>
        </div>`;
    }

    const matchLabel = f.home
      ? `Albatros Jaśkowice – ${f.opponent}`
      : `${f.opponent} – Albatros Jaśkowice`;

    if (f.status === "played") {
      const dateObj = new Date(f.date + "T00:00:00");
      return `
        <div class="league-fixture">
          <span class="league-fixture-round">${f.round}.</span>
          <span class="league-fixture-date">${formatDateHuman(dateObj)}</span>
          <span class="league-fixture-match">${matchLabel}</span>
          <span class="league-fixture-score">${f.score}</span>
        </div>`;
    }

    if (f.status === "scheduled") {
      const dateObj = new Date(f.date + "T00:00:00");
      return `
        <div class="league-fixture${i === nextIndex ? " is-next" : ""}">
          <span class="league-fixture-round">${f.round}.</span>
          <span class="league-fixture-date">${formatDateHuman(dateObj)} · ${f.time}</span>
          <span class="league-fixture-match">${matchLabel}</span>
        </div>`;
    }

    // status "tbd" — termin jeszcze nieustalony przez ligę (opcjonalnie
    // przybliżona data w f.estimatedDate, do potwierdzenia bliżej terminu)
    const dateLabel = f.estimatedDate
      ? `ok. ${formatDateHuman(new Date(f.estimatedDate + "T00:00:00"))} (niepotwierdzone)`
      : "termin nieznany";
    return `
      <div class="league-fixture">
        <span class="league-fixture-round">${f.round}.</span>
        <span class="league-fixture-date">${dateLabel}</span>
        <span class="league-fixture-match">${matchLabel}</span>
      </div>`;
  }).join("");
}

// Sortowanie tabeli statystyk — klik w nagłówek kolumny sortuje po niej
// (domyślnie malejąco po minutach; ponowny klik w tę samą kolumnę odwraca
// kierunek). Stan trzymany w module, więc przetrwa ponowne otwarcie okienka.
const STATS_COLUMNS = [
  { key: "matches", label: "M" },
  { key: "minutes", label: "Min" },
  { key: "goals", label: "Gole" },
  { key: "yellowCards", label: "ŻK" },
  { key: "redCards", label: "CK" },
];
let playerStatsSort = { key: "minutes", dir: "desc" };

function renderPlayerStats(tableEl, benchEl) {
  const bench = PLAYER_STATS.filter((p) => p.matches === 0).map((p) => p.name);
  const played = PLAYER_STATS.filter((p) => p.matches > 0).sort((a, b) => {
    const diff = b[playerStatsSort.key] - a[playerStatsSort.key];
    return playerStatsSort.dir === "desc" ? diff : -diff;
  });

  const headCells = STATS_COLUMNS.map((col) => {
    const active = col.key === playerStatsSort.key;
    const arrow = active ? (playerStatsSort.dir === "desc" ? " ▼" : " ▲") : "";
    return `<th class="sortable-th${active ? " active" : ""}" data-sort-key="${col.key}">${col.label}${arrow}</th>`;
  }).join("");

  const rows = played.map((p) => `
      <tr>
        <td class="league-stats-name player-name-link" data-slug="${slugify(p.name)}">${escapeHtml(p.name)}</td>
        <td>${p.matches}</td>
        <td>${p.minutes}'</td>
        <td>${p.goals}</td>
        <td>${p.yellowCards}</td>
        <td>${p.redCards}</td>
      </tr>`).join("");

  tableEl.innerHTML = `
    <thead>
      <tr><th>Zawodnik</th>${headCells}</tr>
    </thead>
    <tbody>${rows}</tbody>`;

  tableEl.querySelectorAll("th.sortable-th").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sortKey;
      if (playerStatsSort.key === key) {
        playerStatsSort = { key, dir: playerStatsSort.dir === "desc" ? "asc" : "desc" };
      } else {
        playerStatsSort = { key, dir: "desc" };
      }
      renderPlayerStats(tableEl, benchEl);
    });
  });

  tableEl.querySelectorAll("td.player-name-link").forEach((td) => {
    const player = PLAYERS.find((p) => p.slug === td.dataset.slug);
    if (player) td.addEventListener("click", () => openPlayerCard(player));
  });

  benchEl.textContent = bench.length
    ? `Bez występu w tym sezonie: ${bench.join(", ")}.`
    : "";
}

// ---------------------------------------------------------------------------
// 4d. Karta zawodnika — klik w nazwisko otwiera okienko z jego statystykami
// ---------------------------------------------------------------------------
const PLAYER_STATS_BY_SLUG = new Map(PLAYER_STATS.map((p) => [slugify(p.name), p]));

function makeNameClickable(el, player) {
  el.classList.add("player-name-link");
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.onclick = () => openPlayerCard(player);
  el.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPlayerCard(player);
    }
  };
}

// Kraj zawodnika -> flaga na karcie (domyślnie polska; kilku zawodników gra
// dla klubu spoza Polski — flaga ukraińska; jeden żartobliwy wyjątek).
const UKRAINIAN_SLUGS = new Set([
  "maksym-dobryvoda",
  "maksym-hlibichuk",
  "artur-borysenko",
  "vladyslav-didenko",
  "oleksandr-kolvakh",
]);
function flagFor(slug) {
  if (UKRAINIAN_SLUGS.has(slug)) return "🇺🇦";
  if (slug === "filip-kubiak") return "🇪🇸";
  return "🇵🇱";
}

// "Karta FIFA" — 6 fikcyjnych statystyk (0-30) i ocena ogólna, losowane raz
// na zawodnika (deterministycznie, na podstawie sluga), żeby karta pokazywała
// zawsze te same liczby przy każdym otwarciu, a nie nowe za każdym razem.
const FUT_STAT_KEYS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];
function futStatsFor(slug) {
  const stats = {};
  for (const key of FUT_STAT_KEYS) {
    stats[key] = hashStr(`${slug}::${key}`) % 31; // 0-30
  }
  const ovr = Math.round(FUT_STAT_KEYS.reduce((sum, k) => sum + stats[k], 0) / FUT_STAT_KEYS.length);
  return { stats, ovr };
}

function buildFutCard(player) {
  const { stats, ovr } = futStatsFor(player.slug);
  const pos = GOALKEEPER_SLUGS.has(player.slug) ? "BR" : "ZAW";
  const flag = flagFor(player.slug);
  const firstName = player.name.trim().split(/\s+/)[0].toUpperCase();

  const card = document.createElement("div");
  card.className = "fut-card";
  card.innerHTML = `
    <div class="fut-card-face">
      <div class="fut-card-top">
        <div class="fut-card-rating">
          <span class="fut-ovr">${ovr}</span>
          <span class="fut-pos">${pos}</span>
        </div>
        <div class="fut-card-badges">
          <span class="fut-flag">${flag}</span>
          <img class="fut-crest" src="assets/img/logo.png" alt="" />
        </div>
      </div>
      <div class="fut-card-photo-wrap"></div>
      <div class="fut-card-name">${escapeHtml(firstName)}</div>
      <div class="fut-card-stats">
        <div class="fut-stat"><b>${stats.PAC}</b> PAC</div>
        <div class="fut-stat"><b>${stats.DRI}</b> DRI</div>
        <div class="fut-stat"><b>${stats.SHO}</b> SHO</div>
        <div class="fut-stat"><b>${stats.DEF}</b> DEF</div>
        <div class="fut-stat"><b>${stats.PAS}</b> PAS</div>
        <div class="fut-stat"><b>${stats.PHY}</b> PHY</div>
      </div>
    </div>
  `;
  card.querySelector(".fut-card-photo-wrap").appendChild(playerPhotoNode(player, "fut-card-photo-img"));
  return card;
}

function openPlayerCard(player) {
  const overlay = document.getElementById("player-overlay");
  const head = document.getElementById("player-card-head");
  const matchesEl = document.getElementById("player-card-matches");
  if (!overlay || !head || !matchesEl) return;

  const stats = PLAYER_STATS_BY_SLUG.get(player.slug);

  head.innerHTML = "";
  head.appendChild(buildFutCard(player));

  const summary = document.createElement("p");
  summary.className = "player-card-summary";
  summary.innerHTML =
    stats && stats.matches > 0
      ? `Sezon 2026/2027: <strong>${stats.matches}</strong> mecze · <strong>${stats.minutes}'</strong> minut · <strong>${stats.goals}</strong> goli · <strong>${stats.yellowCards}</strong> żółtych · <strong>${stats.redCards}</strong> czerwonych`
      : `Brak jeszcze występu w tym sezonie (wg laczynaspilka.pl).`;
  head.appendChild(summary);

  if (stats && stats.matchLog.length > 0) {
    matchesEl.innerHTML = stats.matchLog.map((match) => {
      const dateObj = new Date(match.date + "T00:00:00");
      const label = match.home
        ? `Albatros Jaśkowice – ${match.opponent}`
        : `${match.opponent} – Albatros Jaśkowice`;
      const events = [
        ...match.goalMinutes.map((t) => `⚽ ${t}`),
        ...match.yellowMinutes.map((t) => `🟨 ${t}`),
        ...match.redMinutes.map((t) => `🟥 ${t}`),
      ].join(" ");
      const competitionTag = match.competition ? ` <em>(${escapeHtml(match.competition)})</em>` : "";
      return `
        <div class="league-fixture">
          <span class="league-fixture-date">${formatDateHuman(dateObj)}</span>
          <span class="league-fixture-match">${escapeHtml(label)} <span class="league-fixture-score">${match.score}</span>${competitionTag}</span>
          <span class="league-fixture-round">${match.minutes}'${events ? " · " + events : ""}</span>
        </div>`;
    }).join("");
  } else {
    matchesEl.innerHTML = `<p class="muted">Brak rozegranych meczów w tym sezonie.</p>`;
  }

  overlay.hidden = false;
}

function initPlayerOverlay() {
  const overlay = document.getElementById("player-overlay");
  const closeBtn = document.getElementById("player-overlay-close");
  if (!overlay || !closeBtn) return;

  function closeOverlay() {
    overlay.hidden = true;
  }

  closeBtn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeOverlay();
  });
}

function initLeagueButton() {
  const btn = document.getElementById("league-btn");
  const overlay = document.getElementById("league-overlay");
  const closeBtn = document.getElementById("league-overlay-close");
  if (!btn || !overlay || !closeBtn) return;

  let rendered = false;
  function renderOnce() {
    if (rendered) return;
    rendered = true;
    document.getElementById("league-name").textContent = LEAGUE_NAME;
    const updatedEl = document.querySelector(".league-updated");
    const updatedDate = formatDateHuman(new Date(LEAGUE_UPDATED + "T00:00:00"));
    updatedEl.innerHTML = `Stan na ${updatedDate} · źródło: <a href="${LEAGUE_SOURCE_URL}" target="_blank" rel="noopener">90minut.pl</a>`;
    renderLeagueTable(document.getElementById("league-table"));
    renderAlbatrosFixtures(document.getElementById("league-fixtures"));
    renderPlayerStats(
      document.getElementById("league-stats-table"),
      document.getElementById("league-stats-bench")
    );
  }

  function closeOverlay() {
    overlay.hidden = true;
  }
  function openOverlay() {
    renderOnce();
    overlay.hidden = false;
  }

  btn.addEventListener("click", openOverlay);
  closeBtn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeOverlay();
  });
}

// ---------------------------------------------------------------------------
// 5. Start
// ---------------------------------------------------------------------------
async function init() {
  document.getElementById("logo-img").src = "assets/img/logo.png";
  initBackground();
  initRandomGifButton();
  initLeagueButton();
  initPlayerOverlay();
  renderIdentityBar();
  renderSchedule();
  renderRoster();
  renderStats();

  const banner = document.getElementById("demo-banner");
  if (!isFirebaseConfigured()) {
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }

  store = await getStore();
  store.subscribeSignups((data) => {
    state.signups = data;
    renderSchedule();
    renderRoster();
    renderStats();
  });
  store.subscribeEventMeta((data) => {
    state.eventMeta = data;
    renderSchedule();
    renderRoster();
  });
}

if (typeof document !== "undefined") {
  init();
}
