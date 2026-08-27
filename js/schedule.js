// PLAN ZAJĘĆ — tu edytujesz harmonogram klubu.
//
// 1) REGULARNE ZAJĘCIA (co tydzień, automatycznie):
//    weekday: 0 = niedziela, 1 = poniedziałek, ... 6 = sobota
//    typ "trening" i "mecz" powtarzają się same, co tydzień, bez potrzeby edycji.
//
// 2) WYDARZENIA JEDNORAZOWE (np. trening bramkarski w konkretnym tygodniu):
//    dopisz obiekt do EXTRA_EVENTS z konkretną datą (RRRR-MM-DD).
//    Gdy minie, możesz go usunąć albo zostawić — stare wydarzenia się nie pokazują.
//
// Adres można też ustawić/zmienić bezpośrednio na stronie (przycisk „Ustaw adres”
// przy wydarzeniu) — zapisze się on dla wszystkich, jeśli Firebase jest skonfigurowany.

export const TYPE_META = {
  trening: { label: "Trening", color: "#2f7dd1", colorSoft: "rgba(47,125,209,0.14)" },
  mecz: { label: "Mecz", color: "#d4a21b", colorSoft: "rgba(212,162,27,0.16)" },
  "trening-bramkarski": {
    label: "Trening bramkarski",
    color: "#a437c9",
    colorSoft: "rgba(164,55,201,0.15)",
  },
};

// Regularne, powtarzające się co tydzień zajęcia.
export const RECURRING_RULES = [
  { type: "trening", weekday: 3, time: "18:00", location: "" }, // środa
  { type: "trening", weekday: 5, time: "18:00", location: "" }, // piątek
  { type: "mecz", weekday: 0, time: "11:00", location: "" }, // niedziela
];

// Wydarzenia jednorazowe / dodatkowe w konkretnym tygodniu.
export const EXTRA_EVENTS = [
  {
    type: "trening-bramkarski",
    date: "2026-08-27", // czwartek
    time: "16:00",
    location: "",
  },
];
