// PLAN ZAJĘĆ — tu edytujesz harmonogram klubu.
//
// 1) REGULARNE ZAJĘCIA (co tydzień, automatycznie):
//    weekday: 0 = niedziela, 1 = poniedziałek, ... 6 = sobota
//    Treningi (śr/czw) powtarzają się same, co tydzień, bez potrzeby edycji.
//
// 2) WYDARZENIA JEDNORAZOWE (mecze wg terminarza, trening bramkarski itp.):
//    dopisz obiekt do EXTRA_EVENTS z konkretną datą (RRRR-MM-DD).
//    Gdy minie, możesz go usunąć albo zostawić — stare wydarzenia się nie pokazują
//    (widoczne jest tylko najbliższe 7 dni).
//
// Adres można też ustawić/zmienić bezpośrednio na stronie (przycisk „Ustaw adres”
// przy wydarzeniu) — zapisze się on dla wszystkich, jeśli Firebase jest skonfigurowany.
// To najlepszy sposób, żeby poprawić adres, jeśli poniższy okaże się nieaktualny.

export const TYPE_META = {
  trening: { label: "Trening", color: "#3fb6f0", colorSoft: "rgba(63,182,240,0.22)" },
  mecz: { label: "Mecz", color: "#e0b23a", colorSoft: "rgba(224,178,58,0.22)" },
  "trening-bramkarski": {
    label: "Trening bramkarski",
    color: "#a879f5",
    colorSoft: "rgba(168,121,245,0.24)",
  },
  "sparing-wewnetrzny": {
    label: "Sparing wewnętrzny",
    color: "#8b3ff0",
    colorSoft: "rgba(139,63,240,0.24)",
  },
  "sparing-iskra": {
    label: "Sparing z Iskra Kochlice U16",
    color: "#2fd07a",
    colorSoft: "rgba(47,208,122,0.24)",
  },
  turniej: {
    label: "Turniej",
    color: "#f2d024",
    colorSoft: "rgba(242,208,36,0.24)",
  },
};

// Domyślny adres domowych treningów i meczów klubu.
export const HOME_ADDRESS = "Jaśkowice Legnickie 45A";

// Regularne, powtarzające się co tydzień treningi.
//
// Reguły można ograniczyć zakresem dat polami `from` / `until` (RRRR-MM-DD,
// obie GRANICE WŁĄCZNIE) — obsługa w buildUpcomingEvents (js/app.js). Bez tych
// pól reguła obowiązuje bezterminowo.
export const RECURRING_RULES = [
  // Do meczu z Huzarem Raszówka (kolejka 6, 2026-09-20) obowiązuje jeszcze
  // stary harmonogram śr/czw.
  { type: "trening", weekday: 3, time: "18:00", location: HOME_ADDRESS, until: "2026-09-20" }, // środa (do meczu z Raszówką)
  { type: "trening", weekday: 4, time: "17:25", location: HOME_ADDRESS, until: "2026-09-20" }, // czwartek (do meczu z Raszówką)

  // Od tygodnia po meczu z Raszówką do końca rundy jesiennej (ostatni mecz:
  // kolejka 13, 2026-11-15) treningi przenoszą się na wt/czw 17:15.
  { type: "trening", weekday: 2, time: "17:15", location: HOME_ADDRESS, from: "2026-09-21", until: "2026-11-15" }, // wtorek
  { type: "trening", weekday: 4, time: "17:15", location: HOME_ADDRESS, from: "2026-09-21", until: "2026-11-15" }, // czwartek
];

// Odwołane pojedyncze wystąpienia cotygodniowych treningów (RRRR-MM-DD).
// Wpisz tu datę, żeby jednorazowo odwołać regularny trening w danym dniu
// (np. gdy przenosisz go na inny dzień) — cotygodniowa reguła zostaje bez zmian.
export const CANCELLED_RECURRING = [
  // np. "2026-09-11" — wpisz datę, by jednorazowo odwołać regularny trening.
  "2026-09-24", // czwartkowy trening zamieniony na sparing z Iskra Kochlice U16
];

// Wydarzenia jednorazowe: mecze wg terminarza ligi (kolejki 3-13) + inne dodatkowe zajęcia.
//
// Adresy wyjazdowe: dla Kwiatkowic i Mierzowic nie udało się znaleźć dokładnego
// adresu z numerem (małe boiska wiejskie, brak oficjalnego adresu w sieci) —
// wpisana jest nazwa miejscowości. Popraw przyciskiem "Ustaw adres" na stronie,
// jeśli znasz dokładniejszy adres.
export const EXTRA_EVENTS = [
  // Czwartek 24.09 — zamiast regularnego treningu sparing z Iskra Kochlice U16,
  // ta sama godzina (17:15). `id` jest celowo przypięte do "trening-2026-09-24",
  // żeby zapisy osób, które zapisały się jeszcze na trening, zostały zachowane.
  {
    type: "sparing-iskra",
    id: "trening-2026-09-24",
    date: "2026-09-24", // czwartek
    time: "17:15",
    location: HOME_ADDRESS,
    label: "Sparing z Iskra Kochlice U16",
  },
  {
    type: "turniej",
    date: "2026-09-12", // sobota
    time: "09:00",
    location: "Tartan przy szkole na Mazowieckiej",
    label: "Turniej o Puchar Piotra Żabki Żabickiego",
  },
  {
    type: "trening-bramkarski",
    date: "2026-08-27", // czwartek
    time: "16:00",
    location: HOME_ADDRESS,
  },
  {
    type: "trening-bramkarski",
    date: "2026-09-07", // poniedziałek
    time: "18:00",
    location: HOME_ADDRESS,
  },

  // Kolejka 3
  {
    type: "mecz",
    date: "2026-08-30",
    time: "11:00",
    location: "Witosa, 59-223 Krotoszyce",
    label: "Błękitni II Kościelec – Albatros Jaśkowice",
  },
  // Kolejka 4
  {
    type: "mecz",
    date: "2026-09-06",
    time: "11:00",
    location: HOME_ADDRESS,
    label: "Albatros Jaśkowice – Korona Kawice",
  },
  // Kolejka 5: PAUZA - kolejka wolna, brak meczu (wg oficjalnego terminarza
  // 90minut.pl / laczynaspilka.pl; poprzednio było tu błędnie wpisane
  // "Krokus Kwiatkowice", drużyna spoza tej grupy).
  // W wolny weekend (kolejka 5) — sparing wewnętrzny.
  {
    type: "sparing-wewnetrzny",
    date: "2026-09-13", // niedziela
    time: "17:00",
    location: HOME_ADDRESS,
    label: "Sparing wewnętrzny",
  },

  // Kolejka 6 — UWAGA: termin jeszcze NIE jest oficjalnie potwierdzony przez
  // ligę (na laczynaspilka.pl widnieje jako "-"), tylko przedział "19-20
  // września" na 90minut.pl. Niedziela 20.09 to szacunek wg wzorca innych
  // kolejek — sprawdź bliżej terminu i popraw datę/godzinę, jeśli się zmieni.
  {
    type: "mecz",
    date: "2026-09-20",
    time: "11:00",
    location: "ul. Sportowa, 59-307 Raszówka",
    label: "Huzar Raszówka – Albatros Jaśkowice",
  },
  // Kolejka 7
  {
    type: "mecz",
    date: "2026-09-27",
    time: "15:30", // zbiórka automatycznie 14:30 (godzina przed meczem)
    location: HOME_ADDRESS,
    label: "Albatros Jaśkowice – Mała Unia Rosochata",
  },
  // Kolejka 8
  {
    type: "mecz",
    date: "2026-10-04",
    time: "15:30",
    location: "Mierzowice",
    label: "KS Mierzowice – Albatros Jaśkowice",
  },
  // Kolejka 9
  {
    type: "mecz",
    date: "2026-10-11",
    time: "11:00",
    location: HOME_ADDRESS,
    label: "Albatros Jaśkowice – Dąb Stow. II Siedliska",
  },
  // Kolejka 10 — godzina 14:30 potwierdzona na stronie drużyny laczynaspilka.pl
  // (nie domyślne 11:00, jak na 90minut.pl)
  {
    type: "mecz",
    date: "2026-10-18",
    time: "14:30",
    location: "ul. Władysława Grabskiego 24, Legnica",
    label: "Konfeks II Legnica – Albatros Jaśkowice",
  },
  // Kolejka 11
  {
    type: "mecz",
    date: "2026-10-25",
    time: "11:00",
    location: HOME_ADDRESS,
    label: "Albatros Jaśkowice – Kaczawa II Bieniowice",
  },
  // Kolejka 12
  {
    type: "mecz",
    date: "2026-11-08",
    time: "11:00",
    location: "ul. II Armii Wojska Polskiego 79, Miłkowice",
    label: "Kolejarz Miłkowice – Albatros Jaśkowice",
  },
  // Kolejka 13
  {
    type: "mecz",
    date: "2026-11-15",
    time: "11:00",
    location: HOME_ADDRESS,
    label: "Albatros Jaśkowice – Victoria Orzeszków",
  },
];
