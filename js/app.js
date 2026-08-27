import { PLAYERS } from "./players.js";
import { RECURRING_RULES, EXTRA_EVENTS, TYPE_META } from "./schedule.js";
import { isFirebaseConfigured } from "./firebase-config.js";
import { getStore } from "./store.js";

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

export function buildUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

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
        });
      }
    }
  }

  for (const ev of EXTRA_EVENTS) {
    const evDate = new Date(ev.date + "T00:00:00");
    const inWindow = days.some((d) => toDateStr(d) === ev.date);
    if (inWindow) {
      events.push({
        id: `${ev.type}-${ev.date}`,
        type: ev.type,
        date: ev.date,
        dateObj: evDate,
        time: ev.time,
        defaultLocation: ev.location || "",
      });
    }
  }

  events.sort((a, b) => {
    const da = `${a.date} ${a.time}`;
    const db_ = `${b.date} ${b.time}`;
    return da.localeCompare(db_);
  });

  return events;
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

function avatarNode(player) {
  const wrap = document.createElement("div");
  wrap.className = "avatar";
  const img = document.createElement("img");
  img.alt = player.name;
  img.loading = "lazy";
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
    if (tried >= exts.length) return; // brak zdjęcia -> zostaje placeholder
    img.src = `${player.photoBase}.${exts[tried]}`;
    tried++;
  }
  img.onerror = tryNext;
  img.onload = () => {
    img.style.display = "block";
    fallback.style.display = "none";
  };
  tryNext();

  return wrap;
}

// ---------------------------------------------------------------------------
// 3. Render
// ---------------------------------------------------------------------------
const state = {
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

function statusCounts(eventId) {
  const players = state.signups[eventId] || {};
  const counts = { tak: 0, nie: 0, hgw: 0 };
  Object.values(players).forEach((p) => {
    if (counts[p.status] !== undefined) counts[p.status]++;
  });
  return counts;
}

function renderSchedule() {
  const wrap = document.getElementById("schedule-list");
  wrap.innerHTML = "";

  if (state.events.length === 0) {
    wrap.innerHTML = `<p class="muted">Brak zaplanowanych wydarzeń w najbliższym tygodniu. Dodaj je w js/schedule.js.</p>`;
    return;
  }

  if (!state.activeEventId) state.activeEventId = state.events[0].id;

  for (const ev of state.events) {
    const meta = TYPE_META[ev.type] || { label: ev.type, color: "#666", colorSoft: "#eee" };
    const card = document.createElement("button");
    card.className = "event-card" + (ev.id === state.activeEventId ? " active" : "");
    card.style.setProperty("--accent", meta.color);
    card.style.setProperty("--accent-soft", meta.colorSoft);

    const counts = statusCounts(ev.id);
    const address = (state.eventMeta[ev.id] && state.eventMeta[ev.id].address) || ev.defaultLocation;

    card.innerHTML = `
      <span class="event-type-badge">${meta.label}</span>
      <span class="event-date">${formatDateHuman(ev.dateObj)}</span>
      <span class="event-time">${ev.time}</span>
      <span class="event-address">${address ? "📍 " + escapeHtml(address) : "📍 adres nieustalony"}</span>
      <span class="event-counts">
        <b class="c-tak">${counts.tak}</b> Tak ·
        <b class="c-nie">${counts.nie}</b> Nie ·
        <b class="c-hgw">${counts.hgw}</b> HGW
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

  const list = document.createElement("div");
  list.className = "roster-list";

  const playersData = state.signups[ev.id] || {};

  for (const player of PLAYERS) {
    const row = document.createElement("div");
    row.className = "roster-row";
    if (player.slug === state.identitySlug) row.classList.add("me");

    row.appendChild(avatarNode(player));

    const nameEl = document.createElement("span");
    nameEl.className = "roster-name";
    nameEl.textContent = player.name;
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
    list.appendChild(row);
  }

  container.appendChild(list);
}

// ---------------------------------------------------------------------------
// 4. Tło z losowymi filmikami (dawne gify -> mp4, dużo lżejsze)
// ---------------------------------------------------------------------------
const BG_VIDEOS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `assets/gifs/gif${n}.mp4`);

function initBackground() {
  const a = document.getElementById("bg-video-a");
  const b = document.getElementById("bg-video-b");
  let showingA = true;
  let pool = [];

  function nextSrc() {
    if (pool.length === 0) pool = [...BG_VIDEOS].sort(() => Math.random() - 0.5);
    return pool.pop();
  }

  function swap() {
    const incoming = showingA ? b : a;
    const outgoing = showingA ? a : b;
    incoming.src = nextSrc();
    incoming.play().catch(() => {});
    incoming.classList.add("visible");
    outgoing.classList.remove("visible");
    showingA = !showingA;
  }

  a.src = nextSrc();
  a.play().catch(() => {});
  a.classList.add("visible");
  setInterval(swap, 22000);
}

// ---------------------------------------------------------------------------
// 5. Start
// ---------------------------------------------------------------------------
async function init() {
  document.getElementById("logo-img").src = "assets/img/logo.png";
  initBackground();
  renderIdentityBar();
  renderSchedule();
  renderRoster();

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
