// TABELA, TERMINARZ I STATYSTYKI ZAWODNIKÓW — dane do panelu "Tabela i
// terminarz" (przycisk w nagłówku, obok "Losowy gif").
//
// Źródło tabeli: 90minut.pl. Źródło dokładnych godzin meczów Albatrosa
// (kolejki 3-13) i statystyk zawodników (mecze/minuty/gole/kartki): oficjalny
// system PZPN laczynaspilka.pl, strona drużyny — to najdokładniejsze źródło
// godzin (90minut.pl czasem podaje tylko domyślne "11:00", a rzeczywista
// godzina bywa inna, np. kolejka 10: 14:30) i jedyne źródło statystyk graczy.
//   https://www.90minut.pl/liga/1/liga14844.html
//   https://www.laczynaspilka.pl/rozgrywki/druzyna/5064cab8-7b3c-440a-9781-23cc71312dc6?tab=tab-zawodnicy&playDictionary=5f9440e8-3081-434b-a3f7-53ed07fb426b
//
// AKTUALIZACJA: strona jest statyczna (GitHub Pages) i nie potrafi sama
// pobrać na żywo danych z 90minut.pl / laczynaspilka.pl (brak publicznego,
// otwartego API — dane w PLAYER_STATS zostały ręcznie zebrane z profili
// zawodników w przeglądarce). Żeby odświeżyć tabelę, terminarz lub
// statystyki, napisz do Claude "zaktualizuj tabelę ligi" / "zaktualizuj
// statystyki zawodników" — pobierze aktualny stan i podmieni dane poniżej.

export const LEAGUE_NAME = 'Klasa B "Keeza", grupa Legnica III';
export const LEAGUE_SOURCE_URL = "https://www.90minut.pl/liga/1/liga14844.html";
export const LEAGUE_UPDATED = "2026-08-28"; // data ostatniego pobrania danych

// Pełna tabela grupy (kolumna "RAZEM" z 90minut.pl).
// pts = punkty, w/d/l = zwycięstwa/remisy/porażki, gf/ga = bramki zdobyte/stracone.
export const LEAGUE_TABLE = [
  { pos: 1, name: "Victoria Orzeszków", m: 2, pts: 6, w: 2, d: 0, l: 0, gf: 8, ga: 0 },
  { pos: 2, name: "Konfeks II Legnica", m: 2, pts: 6, w: 2, d: 0, l: 0, gf: 9, ga: 2 },
  { pos: 3, name: "Korona Kawice", m: 2, pts: 6, w: 2, d: 0, l: 0, gf: 8, ga: 5 },
  { pos: 4, name: "Miedź III Legnica", m: 2, pts: 3, w: 1, d: 0, l: 1, gf: 23, ga: 3 },
  { pos: 5, name: "Unia Rosochata", m: 2, pts: 3, w: 1, d: 0, l: 1, gf: 3, ga: 3 },
  { pos: 6, name: "KS Mierzowice", m: 2, pts: 3, w: 1, d: 0, l: 1, gf: 2, ga: 5 },
  { pos: 7, name: "Kolejarz Miłkowice", m: 2, pts: 3, w: 1, d: 0, l: 1, gf: 4, ga: 5 },
  { pos: 8, name: "Dąb Stowarzyszenie II Siedliska", m: 2, pts: 3, w: 1, d: 0, l: 1, gf: 17, ga: 4 },
  { pos: 9, name: "Albatros Jaśkowice", m: 2, pts: 3, w: 1, d: 0, l: 1, gf: 5, ga: 25 },
  { pos: 10, name: "Błękitni II Kościelec", m: 1, pts: 0, w: 0, d: 0, l: 1, gf: 2, ga: 3 },
  { pos: 11, name: "Rycerz II Legnickie Pole", m: 1, pts: 0, w: 0, d: 0, l: 1, gf: 2, ga: 5 },
  { pos: 12, name: "Huzar Raszówka", m: 2, pts: 0, w: 0, d: 0, l: 2, gf: 4, ga: 9 },
  { pos: 13, name: "Kaczawa II Bieniowice", m: 2, pts: 0, w: 0, d: 0, l: 2, gf: 1, ga: 19 },
];

export const ALBATROS_TEAM_NAME = "Albatros Jaśkowice";

// Terminarz WYŁĄCZNIE meczów Albatrosa, kolejka po kolejce (1-26).
// status: "played" (wynik znany), "scheduled" (data znana), "tbd" (termin
// jeszcze nieustalony przez ligę), "bye" (kolejka wolna, bez meczu).
// home: true = mecz u siebie, false = wyjazd.
export const ALBATROS_FIXTURES = [
  { round: 1, status: "played", date: "2026-08-16", home: false, opponent: "Miedź III Legnica", score: "0-23" },
  { round: 2, status: "played", date: "2026-08-23", home: true, opponent: "Rycerz II Legnickie Pole", score: "5-2" },
  { round: 3, status: "scheduled", date: "2026-08-30", time: "11:00", home: false, opponent: "Błękitni II Kościelec" },
  { round: 4, status: "scheduled", date: "2026-09-06", time: "11:00", home: true, opponent: "Korona Kawice" },
  { round: 5, status: "bye" },
  // Kolejka 6: termin jeszcze NIE jest oficjalnie potwierdzony (laczynaspilka.pl
  // pokazuje "-"), tylko przedział "19-20 września" z 90minut.pl. Wpisana
  // niedziela 20.09 to szacunek (wszystkie dotąd potwierdzone mecze wypadały
  // w niedzielę) — do zweryfikowania bliżej terminu.
  { round: 6, status: "tbd", estimatedDate: "2026-09-20", home: false, opponent: "Huzar Raszówka" },
  { round: 7, status: "scheduled", date: "2026-09-27", time: "11:00", home: true, opponent: "Unia Rosochata" },
  { round: 8, status: "scheduled", date: "2026-10-04", time: "17:15", home: false, opponent: "KS Mierzowice" },
  { round: 9, status: "scheduled", date: "2026-10-11", time: "11:00", home: true, opponent: "Dąb Stowarzyszenie II Siedliska" },
  { round: 10, status: "scheduled", date: "2026-10-18", time: "14:30", home: false, opponent: "Konfeks II Legnica" },
  { round: 11, status: "scheduled", date: "2026-10-25", time: "11:00", home: true, opponent: "Kaczawa II Bieniowice" },
  { round: 12, status: "scheduled", date: "2026-11-08", time: "11:00", home: false, opponent: "Kolejarz Miłkowice" },
  { round: 13, status: "scheduled", date: "2026-11-15", time: "11:00", home: true, opponent: "Victoria Orzeszków" },
  { round: 14, status: "tbd", home: true, opponent: "Miedź III Legnica" },
  { round: 15, status: "tbd", home: false, opponent: "Rycerz II Legnickie Pole" },
  { round: 16, status: "tbd", home: true, opponent: "Błękitni II Kościelec" },
  { round: 17, status: "tbd", home: false, opponent: "Korona Kawice" },
  { round: 18, status: "bye" },
  { round: 19, status: "tbd", home: true, opponent: "Huzar Raszówka" },
  { round: 20, status: "tbd", home: false, opponent: "Unia Rosochata" },
  { round: 21, status: "tbd", home: true, opponent: "KS Mierzowice" },
  { round: 22, status: "tbd", home: false, opponent: "Dąb Stowarzyszenie II Siedliska" },
  { round: 23, status: "tbd", home: true, opponent: "Konfeks II Legnica" },
  { round: 24, status: "tbd", home: false, opponent: "Kaczawa II Bieniowice" },
  { round: 25, status: "tbd", home: true, opponent: "Kolejarz Miłkowice" },
  { round: 26, status: "tbd", home: false, opponent: "Victoria Orzeszków" },
];

// Statystyki zawodników Albatrosa w sezonie 2026/2027 (Klasa B), zebrane z
// profili graczy na laczynaspilka.pl (zakładka "Mecze" — mecze/minuty/gole/
// kartki). "matches" to liczba spotkań, w których zawodnik był w kadrze
// meczowej (0 minut = był w kadrze, ale nie wszedł na boisko). "cards" to
// łączna liczba kartek — źródło nie pozwoliło wiarygodnie odróżnić żółtej
// od czerwonej z samego tekstu strony, więc kolor nie jest rozróżniany.
// Zawodnicy z "matches: 0" nie mieli jeszcze zgłoszonego występu w meczu
// ligowym w tym sezonie (albo dopiero dołączyli, albo nie grali).
//
// matchLog: lista rozegranych meczów tego zawodnika (do karty zawodnika po
// kliknięciu w nazwisko) — data, przeciwnik, czy u siebie, wynik (z
// perspektywy Albatrosa), minuty na boisku, minuty goli i kartek.
//
// Uwzględnia też jeden mecz Pucharu Polski "Strefa Legnica" (09.08.2026,
// runda wstępna, Albatros odpadł 1:5 z Błękitnymi Koskowice) — więcej
// meczów pucharowych w tym sezonie już nie będzie (drużyna odpadła w 1.
// rundzie), więc przy kolejnych aktualizacjach statystyk wystarczy sprawdzać
// tylko ligę (Klasa B) na laczynaspilka.pl, bez zakładki Puchar Polski.
export const PLAYER_STATS_UPDATED = "2026-08-28";

// Rozegrane dotąd mecze — wspólne dane, żeby nie powtarzać ich przy każdym
// zawodniku. "competition" pokazuje się na karcie zawodnika tylko wtedy, gdy
// to nie liga (żeby nie zaśmiecać typowego przypadku).
const M1 = { date: "2026-08-16", opponent: "Miedź III Legnica", home: false, score: "0:23" };
const M2 = { date: "2026-08-23", opponent: "Rycerz II Legnickie Pole", home: true, score: "5:2" };
const CUP1 = {
  date: "2026-08-09",
  opponent: "Błękitni Koskowice",
  home: true,
  score: "1:5",
  competition: "Puchar Polski",
};
function m(matchInfo, minutes, goalMinutes = [], cardMinutes = []) {
  return { ...matchInfo, minutes, goalMinutes, cardMinutes };
}

export const PLAYER_STATS = [
  { name: "Maksym Dobryvoda", matches: 3, minutes: 195, goals: 3, cards: 0, matchLog: [m(M2, 74, ["30'", "35'", "55'"]), m(M1, 60), m(CUP1, 61)] },
  { name: "Vladyslav Didenko", matches: 2, minutes: 106, goals: 0, cards: 3, matchLog: [m(M1, 50), m(CUP1, 56, [], ["15'", "56'", "56'"])] },
  { name: "Dominik Duchnicki", matches: 2, minutes: 112, goals: 0, cards: 0, matchLog: [m(M2, 83), m(CUP1, 29)] },
  { name: "Remigiusz Dubaniewicz", matches: 1, minutes: 0, goals: 0, cards: 0, matchLog: [m(M1, 0)] },
  { name: "Bartosz Fudali", matches: 3, minutes: 60, goals: 0, cards: 0, matchLog: [m(M2, 13), m(M1, 24), m(CUP1, 23)] },
  { name: "Kamil Felsztyński", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Maciej Gdaniec", matches: 3, minutes: 202, goals: 0, cards: 0, matchLog: [m(M2, 90), m(M1, 40), m(CUP1, 72)] },
  { name: "Bartosz Gresiuk", matches: 2, minutes: 145, goals: 0, cards: 0, matchLog: [m(M1, 66), m(CUP1, 79)] },
  { name: "Mateusz Gresiuk", matches: 3, minutes: 270, goals: 1, cards: 0, matchLog: [m(M2, 90), m(M1, 90), m(CUP1, 90, ["50'"])] },
  { name: "Maksym Hlibichuk", matches: 1, minutes: 90, goals: 0, cards: 0, matchLog: [m(M2, 90)] },
  { name: "Rafał Kanasiuk", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Oleksandr Kolvakh", matches: 1, minutes: 90, goals: 0, cards: 0, matchLog: [m(M1, 90)] },
  { name: "Kacper Malinowski", matches: 3, minutes: 28, goals: 0, cards: 0, matchLog: [m(M2, 7), m(M1, 10), m(CUP1, 11)] },
  { name: "Krzysztof Obremski", matches: 2, minutes: 20, goals: 0, cards: 1, matchLog: [m(M2, 20, [], ["83'"]), m(CUP1, 0)] },
  { name: "Damian Pachołek", matches: 1, minutes: 60, goals: 0, cards: 0, matchLog: [m(CUP1, 60)] },
  { name: "Michał Papaj", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Paweł Pęczkowski", matches: 1, minutes: 70, goals: 0, cards: 0, matchLog: [m(M2, 70)] },
  { name: "Marcin Rozpędowski", matches: 2, minutes: 75, goals: 0, cards: 0, matchLog: [m(M1, 45), m(CUP1, 30)] },
  { name: "Filip Siwak", matches: 3, minutes: 93, goals: 0, cards: 0, matchLog: [m(M2, 45), m(M1, 30), m(CUP1, 18)] },
  { name: "Mateusz Styrcz", matches: 3, minutes: 223, goals: 1, cards: 0, matchLog: [m(M2, 66, ["38'"]), m(M1, 90), m(CUP1, 67)] },
  { name: "Marcin Świtoń", matches: 2, minutes: 24, goals: 0, cards: 0, matchLog: [m(M2, 24), m(M1, 0)] },
  { name: "Gabriel Świerbutowicz", matches: 3, minutes: 16, goals: 0, cards: 0, matchLog: [m(M2, 16), m(M1, 0), m(CUP1, 0)] },
  { name: "Bartłomiej Taczyński", matches: 2, minutes: 135, goals: 0, cards: 0, matchLog: [m(M2, 45), m(CUP1, 90)] },
  { name: "Krzysztof Taczyński", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Marek Taczyński", matches: 1, minutes: 0, goals: 0, cards: 0, matchLog: [m(M2, 0)] },
  { name: "Stanisław Taczyński", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Mateusz Taraciński", matches: 1, minutes: 77, goals: 1, cards: 0, matchLog: [m(M2, 77, ["42'"])] },
  { name: "Janusz Tkacz", matches: 2, minutes: 150, goals: 0, cards: 0, matchLog: [m(M1, 60), m(CUP1, 90)] },
  { name: "Patryk Wątroba", matches: 2, minutes: 170, goals: 0, cards: 0, matchLog: [m(M2, 90), m(M1, 80)] },
  { name: "Jonatan Wyporkiewicz", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Hubert Zdziech", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Konrad Zębacki", matches: 1, minutes: 90, goals: 0, cards: 0, matchLog: [m(M1, 90)] },
  { name: "Yevhen Borblik", matches: 2, minutes: 180, goals: 0, cards: 0, matchLog: [m(M1, 90), m(CUP1, 90)] },
  { name: "Artur Borysenko", matches: 3, minutes: 135, goals: 0, cards: 1, matchLog: [m(M2, 0), m(M1, 45, [], ["65'"]), m(CUP1, 90)] },
  { name: "Dawid Bubień", matches: 3, minutes: 120, goals: 0, cards: 0, matchLog: [m(M2, 90), m(M1, 30), m(CUP1, 0)] },
  // Poniżsi nie mieli jeszcze zgłoszonego profilu/występu w kadrze meczowej
  // na laczynaspilka.pl w tym sezonie (być może dopiero dołączyli do klubu):
  { name: "Filip Kubiak", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Jakub Cofór", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Alan Lichman", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Brajan Kwiatkowski", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
  { name: "Jakub Behrendt", matches: 0, minutes: 0, goals: 0, cards: 0, matchLog: [] },
];
