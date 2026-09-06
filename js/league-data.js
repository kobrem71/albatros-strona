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
export const LEAGUE_UPDATED = "2026-09-06"; // data ostatniego pobrania danych

// Pełna tabela grupy, po kolejce 4. Kolejność drużyn przepisana 1:1 ze źródła
// (przy równej liczbie punktów decyduje bezpośredni mecz, nie różnica bramek —
// dlatego np. Unia > Kolejarz > Miedź mimo lepszej różnicy Miedzi).
// pts = punkty, w/d/l = zwycięstwa/remisy/porażki, gf/ga = bramki zdobyte/stracone.
export const LEAGUE_TABLE = [
  { pos: 1, name: "Victoria Orzeszków", m: 4, pts: 12, w: 4, d: 0, l: 0, gf: 24, ga: 3 },
  { pos: 2, name: "Unia Rosochata", m: 4, pts: 9, w: 3, d: 0, l: 1, gf: 14, ga: 4 },
  { pos: 3, name: "Kolejarz Miłkowice", m: 4, pts: 9, w: 3, d: 0, l: 1, gf: 27, ga: 7 },
  { pos: 4, name: "Miedź III Legnica", m: 4, pts: 9, w: 3, d: 0, l: 1, gf: 41, ga: 3 },
  { pos: 5, name: "Korona Kawice", m: 3, pts: 7, w: 2, d: 1, l: 0, gf: 10, ga: 7 },
  { pos: 6, name: "Konfeks II Legnica", m: 4, pts: 6, w: 2, d: 0, l: 2, gf: 13, ga: 15 },
  { pos: 7, name: "KS Mierzowice", m: 4, pts: 6, w: 2, d: 0, l: 2, gf: 13, ga: 24 },
  { pos: 8, name: "Albatros Jaśkowice", m: 4, pts: 5, w: 1, d: 2, l: 1, gf: 9, ga: 29 },
  { pos: 9, name: "Dąb Stowarzyszenie II Siedliska", m: 4, pts: 3, w: 1, d: 0, l: 3, gf: 17, ga: 14 },
  { pos: 10, name: "Huzar Raszówka", m: 3, pts: 3, w: 1, d: 0, l: 2, gf: 11, ga: 9 },
  { pos: 11, name: "Błękitni II Kościelec", m: 3, pts: 1, w: 0, d: 1, l: 2, gf: 5, ga: 9 },
  { pos: 12, name: "Rycerz II Legnickie Pole", m: 3, pts: 0, w: 0, d: 0, l: 3, gf: 6, ga: 23 },
  { pos: 13, name: "Kaczawa II Bieniowice", m: 4, pts: 0, w: 0, d: 0, l: 4, gf: 2, ga: 45 },
];

export const ALBATROS_TEAM_NAME = "Albatros Jaśkowice";

// Terminarz WYŁĄCZNIE meczów Albatrosa, kolejka po kolejce (1-26).
// status: "played" (wynik znany), "scheduled" (data znana), "tbd" (termin
// jeszcze nieustalony przez ligę), "bye" (kolejka wolna, bez meczu).
// home: true = mecz u siebie, false = wyjazd.
export const ALBATROS_FIXTURES = [
  { round: 1, status: "played", date: "2026-08-16", home: false, opponent: "Miedź III Legnica", score: "0-23" },
  { round: 2, status: "played", date: "2026-08-23", home: true, opponent: "Rycerz II Legnickie Pole", score: "5-2" },
  // Kolejka 3: 90minut.pl zna ten klub jako "Błękitni II Kościelec", ale
  // oficjalny system PZPN (laczynaspilka.pl) prowadzi go pod nazwą "Legsad II
  // Kościelec" — to ta sama drużyna, dwie różne nazwy w dwóch źródłach.
  { round: 3, status: "played", date: "2026-08-30", home: false, opponent: "Błękitni II Kościelec", score: "2-2" },
  { round: 4, status: "played", date: "2026-09-06", home: true, opponent: "Korona Kawice", score: "2-2" },
  { round: 5, status: "bye" },
  // Kolejka 6: termin potwierdzony przez Krzysztofa (2026-08-30) — godzina
  // 11:00 na razie orientacyjna (jak reszta domyślnych godzin), do poprawy,
  // jeśli się zmieni.
  { round: 6, status: "scheduled", date: "2026-09-20", time: "11:00", home: false, opponent: "Huzar Raszówka" },
  { round: 7, status: "scheduled", date: "2026-09-27", time: "14:00", home: true, opponent: "Unia Rosochata" },
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
// meczowej (0 minut = był w kadrze, ale nie wszedł na boisko).
// "yellowCards"/"redCards" — kolor kartki rozpoznany po kolorze ikonki na
// laczynaspilka.pl (żółta #F2B336, czerwona #DF0021); dwie żółte w tym samym
// meczu liczą się osobno, a wynikająca z nich czerwona jest dodatkowym,
// osobnym wpisem (tak pokazuje to źródło).
// Zawodnicy z "matches: 0" nie mieli jeszcze zgłoszonego występu w meczu
// ligowym w tym sezonie (albo dopiero dołączyli, albo nie grali).
//
// "assists" — w odróżnieniu od reszty kolumn NIE pochodzi z laczynaspilka.pl
// (ten serwis nie pokazuje asyst w statystykach drużyny) — to ręczna,
// klubowa notatka "kto komu podał", prowadzona na bieżąco. Dopisuj po
// każdym meczu, razem z ewentualnym wpisem w matchLog (patrz niżej).
//
// matchLog: lista rozegranych meczów tego zawodnika (do karty zawodnika po
// kliknięciu w nazwisko) — data, przeciwnik, czy u siebie, wynik (z
// perspektywy Albatrosa), minuty na boisku, minuty goli i kartek (osobno
// żółte/czerwone) oraz liczba asyst w tym meczu.
//
// Uwzględnia też jeden mecz Pucharu Polski "Strefa Legnica" (09.08.2026,
// runda wstępna, Albatros odpadł 1:5 z Błękitnymi Koskowice) — więcej
// meczów pucharowych w tym sezonie już nie będzie (drużyna odpadła w 1.
// rundzie), więc przy kolejnych aktualizacjach statystyk wystarczy sprawdzać
// tylko ligę (Klasa B) na laczynaspilka.pl, bez zakładki Puchar Polski.
export const PLAYER_STATS_UPDATED = "2026-09-06";

// Rozegrane dotąd mecze — wspólne dane, żeby nie powtarzać ich przy każdym
// zawodniku. "competition" pokazuje się na karcie zawodnika tylko wtedy, gdy
// to nie liga (żeby nie zaśmiecać typowego przypadku).
const M1 = { date: "2026-08-16", opponent: "Miedź III Legnica", home: false, score: "0:23" };
const M2 = { date: "2026-08-23", opponent: "Rycerz II Legnickie Pole", home: true, score: "5:2" };
// Kolejka 3 — jak w ALBATROS_FIXTURES: 90minut.pl nazywa ten klub "Błękitni II
// Kościelec", laczynaspilka.pl (PZPN) prowadzi go jako "Legsad II Kościelec".
const M3 = { date: "2026-08-30", opponent: "Błękitni II Kościelec", home: false, score: "2:2" };
// Kolejka 4 — mecz u siebie z Koroną Kawice, remis 2:2 (do przerwy 2:0).
// Składy, minuty, gole i kartki wg match center laczynaspilka.pl. Asyst w tym
// meczu na razie nie wpisano (laczynaspilka nie pokazuje asyst — dopisz ręcznie
// "kto komu podał", jak przy poprzednich meczach).
const M4 = { date: "2026-09-06", opponent: "Korona Kawice", home: true, score: "2:2" };
const CUP1 = {
  date: "2026-08-09",
  opponent: "Błękitni Koskowice",
  home: true,
  score: "1:5",
  competition: "Puchar Polski",
};
function m(matchInfo, minutes, goalMinutes = [], yellowMinutes = [], redMinutes = [], assists = 0) {
  return { ...matchInfo, minutes, goalMinutes, yellowMinutes, redMinutes, assists };
}

export const PLAYER_STATS = [
  { name: "Maksym Dobryvoda", matches: 5, minutes: 318, goals: 4, assists: 1, yellowCards: 0, redCards: 0, matchLog: [m(M4, 79, ["40'"]), m(M3, 44), m(M2, 74, ["30'", "35'", "55'"], [], [], 1), m(M1, 60), m(CUP1, 61)] },
  { name: "Vladyslav Didenko", matches: 4, minutes: 178, goals: 0, assists: 0, yellowCards: 2, redCards: 1, matchLog: [m(M4, 72), m(M3, 0), m(M1, 50), m(CUP1, 56, [], ["15'", "56'"], ["56'"])] },
  { name: "Dominik Duchnicki", matches: 3, minutes: 158, goals: 0, assists: 1, yellowCards: 0, redCards: 0, matchLog: [m(M3, 46), m(M2, 83, [], [], [], 1), m(CUP1, 29)] },
  { name: "Remigiusz Dubaniewicz", matches: 3, minutes: 20, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 20), m(M3, 0), m(M1, 0)] },
  { name: "Bartosz Fudali", matches: 5, minutes: 106, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 0), m(M3, 46), m(M2, 13), m(M1, 24), m(CUP1, 23)] },
  { name: "Kamil Felsztyński", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Maciej Gdaniec", matches: 5, minutes: 382, goals: 0, assists: 0, yellowCards: 1, redCards: 0, matchLog: [m(M4, 90, [], ["85'"]), m(M3, 90), m(M2, 90), m(M1, 40), m(CUP1, 72)] },
  { name: "Bartosz Gresiuk", matches: 2, minutes: 145, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M1, 66), m(CUP1, 79)] },
  { name: "Mateusz Gresiuk", matches: 5, minutes: 450, goals: 2, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 90), m(M3, 90, ["28'"]), m(M2, 90), m(M1, 90), m(CUP1, 90, ["50'"])] },
  // 2 asysty w meczu z Legsadem II Kościelec (kolejka 3, M3) — dopisane
  // ręcznie od razu po meczu (laczynaspilka.pl nie pokazuje asyst).
  { name: "Maksym Hlibichuk", matches: 3, minutes: 270, goals: 0, assists: 2, yellowCards: 0, redCards: 0, matchLog: [m(M4, 90), m(M3, 90), m(M2, 90)] },
  { name: "Rafał Kanasiuk", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Oleksandr Kolvakh", matches: 1, minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M1, 90)] },
  { name: "Kacper Malinowski", matches: 5, minutes: 55, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 0), m(M3, 27), m(M2, 7), m(M1, 10), m(CUP1, 11)] },
  { name: "Krzysztof Obremski", matches: 4, minutes: 20, goals: 0, assists: 0, yellowCards: 1, redCards: 0, matchLog: [m(M4, 0), m(M3, 0), m(M2, 20, [], ["83'"]), m(CUP1, 0)] },
  { name: "Damian Pachołek", matches: 1, minutes: 60, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(CUP1, 60)] },
  { name: "Michał Papaj", matches: 2, minutes: 46, goals: 1, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 46, ["41'"]), m(M3, 0)] },
  { name: "Paweł Pęczkowski", matches: 2, minutes: 94, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 24), m(M2, 70)] },
  { name: "Marcin Rozpędowski", matches: 4, minutes: 189, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 70), m(M3, 44), m(M1, 45), m(CUP1, 30)] },
  { name: "Filip Siwak", matches: 5, minutes: 181, goals: 1, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 44), m(M3, 44, ["70'"]), m(M2, 45), m(M1, 30), m(CUP1, 18)] },
  { name: "Mateusz Styrcz", matches: 3, minutes: 223, goals: 1, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M2, 66, ["38'"]), m(M1, 90), m(CUP1, 67)] },
  { name: "Marcin Świtoń", matches: 4, minutes: 204, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 90), m(M3, 90), m(M2, 24), m(M1, 0)] },
  { name: "Gabriel Świerbutowicz", matches: 5, minutes: 16, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 0), m(M3, 0), m(M2, 16), m(M1, 0), m(CUP1, 0)] },
  { name: "Bartłomiej Taczyński", matches: 3, minutes: 225, goals: 0, assists: 1, yellowCards: 0, redCards: 0, matchLog: [m(M3, 90), m(M2, 45, [], [], [], 1), m(CUP1, 90)] },
  { name: "Krzysztof Taczyński", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Marek Taczyński", matches: 1, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M2, 0)] },
  { name: "Stanisław Taczyński", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Mateusz Taraciński", matches: 3, minutes: 233, goals: 1, assists: 1, yellowCards: 1, redCards: 0, matchLog: [m(M4, 66), m(M3, 90, [], ["80'"]), m(M2, 77, ["42'"], [], [], 1)] },
  { name: "Janusz Tkacz", matches: 2, minutes: 150, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M1, 60), m(CUP1, 90)] },
  { name: "Patryk Wątroba", matches: 4, minutes: 323, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 90), m(M3, 63), m(M2, 90), m(M1, 80)] },
  { name: "Jonatan Wyporkiewicz", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Hubert Zdziech", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Konrad Zębacki", matches: 2, minutes: 108, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 18), m(M1, 90)] },
  { name: "Yevhen Borblik", matches: 4, minutes: 237, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 11), m(M3, 46), m(M1, 90), m(CUP1, 90)] },
  { name: "Artur Borysenko", matches: 3, minutes: 135, goals: 0, assists: 0, yellowCards: 1, redCards: 0, matchLog: [m(M2, 0), m(M1, 45, [], ["65'"]), m(CUP1, 90)] },
  { name: "Dawid Bubień", matches: 5, minutes: 300, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 90), m(M3, 90), m(M2, 90), m(M1, 30), m(CUP1, 0)] },
  // Poniżsi nie mieli jeszcze zgłoszonego profilu/występu w kadrze meczowej
  // na laczynaspilka.pl w tym sezonie (być może dopiero dołączyli do klubu):
  { name: "Filip Kubiak", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Jakub Cofór", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Alan Lichman", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Brajan Kwiatkowski", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Jakub Behrendt", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
];

// "Gracz meczu" wybrany klubowo (nieoficjalnie) dla rozegranych dotąd meczów
// — wykorzystywane przez losową mini-animację w tle strony ("gracz meczu" z
// kręcącymi się zdjęciami i fajerwerkami). Nazwa przeciwnika ujednolicona z
// ALBATROS_FIXTURES/LEAGUE_TABLE (90minut.pl); zdjęcie brane po slug-u z
// assets/img/players/. Dopisuj kolejne wpisy po każdym meczu.
export const MATCH_MVPS = [
  { opponent: "Miedź III Legnica", playerName: "Dawid Bubień" },
  { opponent: "Rycerz II Legnickie Pole", playerName: "Maksym Dobryvoda" },
  { opponent: "Błękitni II Kościelec", playerName: "Maksym Hlibichuk" },
  { opponent: "Korona Kawice", playerName: "Maciej Gdaniec" },
];
