// PLAN ZAJĘĆ — tu edytujesz harmonogram klubu.
//
// 1) REGULARNE ZAJĘCIA (co tydzień, automatycznie):
//    weekday: 0 = niedziela, 1 = poniedziałek, ... 6 = sobota
//    Treningi (śr/pt) powtarzają się same, co tydzień, bez potrzeby edycji.
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
};

// Domyślny adres domowych treningów i meczów klubu.
export const HOME_ADDRESS = "Jaśkowice Legnickie 45A";

// Regularne, powtarzające się co tydzień treningi.
export const RECURRING_RULES = [
  { type: "trening", weekday: 3, time: "18:00", location: HOME_ADDRESS }, // środa
  { type: "trening", weekday: 5, time: "18:00", location: HOME_ADDRESS }, // piątek
];

// Wydarzenia jednorazowe: mecze wg terminarza ligi (kolejki 3-13) + inne dodatkowe zajęcia.
//
// Adresy wyjazdowe: dla Kwiatkowic i Mierzowic nie udało się znaleźć dokładnego
// adresu z numerem (małe boiska wiejskie, brak oficjalnego adresu w sieci) —
// wpisana jest nazwa miejscowości. Popraw przyciskiem "Ustaw adres" na stronie,
// jeśli znasz dokładniejszy adres.
export const EXTRA_EVENTS = [
  {
    type: "trening-bramkarski",
    date: "2026-08-27", // czwartek
    time: "16:00",
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
  // Kolejka 5
  {
    type: "mecz",
    date: "2026-09-13",
    time: "11:00",
    location: "Kwiatkowice, gm. Prochowice",
    label: "Krokus Kwiatkowice – Albatros Jaśkowice",
  },
  // Kolejka 6: PAUZA - kolejka wolna, brak meczu

  // Kolejka 7
  {
    type: "mecz",
    date: "2026-09-27",
    time: "11:00",
    location: HOME_ADDRESS,
    label: "Albatros Jaśkowice – Mała Unia Rosochata",
  },
  // Kolejka 8
  {
    type: "mecz",
    date: "2026-10-04",
    time: "17:15",
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
  // Kolejka 10
  {
    type: "mecz",
    date: "2026-10-18",
    time: "11:00",
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
