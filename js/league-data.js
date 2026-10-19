// TABELA, TERMINARZ I STATYSTYKI ZAWODNIKÓW — dane do panelu "Tabela i
// terminarz" (przycisk w nagłówku, obok "Losowy gif").
//
// Źródło tabeli: 90minut.pl. Źródło dokładnych godzin meczów Albatrosa
// (kolejki 3-13) i statystyk zawodników (mecze/minuty/gole/kartki): oficjalny
// system PZPN laczynaspilka.pl, strona drużyny — to najdokładniejsze źródło
// godzin (90minut.pl czasem podaje tylko domyślne "11:00", a rzeczywista
// godzina bywa inna, np. kolejka 10: 10:00) i jedyne źródło statystyk graczy.
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
export const LEAGUE_UPDATED = "2026-10-19"; // data ostatniego pobrania danych

// Pełna tabela grupy, po kolejce 10. Kolejność drużyn przepisana 1:1 ze źródła
// (przy równej liczbie punktów decyduje bezpośredni mecz, nie różnica bramek).
// pts = punkty, w/d/l = zwycięstwa/remisy/porażki, gf/ga = bramki zdobyte/stracone.
export const LEAGUE_TABLE = [
  { pos: 1, name: "Miedź III Legnica", m: 10, pts: 27, w: 9, d: 0, l: 1, gf: 121, ga: 7 },
  { pos: 2, name: "Kolejarz Miłkowice", m: 10, pts: 24, w: 8, d: 0, l: 2, gf: 79, ga: 19 },
  { pos: 3, name: "Unia Rosochata", m: 9, pts: 24, w: 8, d: 0, l: 1, gf: 43, ga: 10 },
  { pos: 4, name: "Victoria Orzeszków", m: 9, pts: 21, w: 7, d: 0, l: 2, gf: 55, ga: 12 },
  { pos: 5, name: "Konfeks II Legnica", m: 9, pts: 18, w: 6, d: 0, l: 3, gf: 46, ga: 40 },
  { pos: 6, name: "Dąb Stowarzyszenie II Siedliska", m: 9, pts: 15, w: 5, d: 0, l: 4, gf: 56, ga: 27 },
  { pos: 7, name: "KS Mierzowice", m: 9, pts: 15, w: 5, d: 0, l: 4, gf: 27, ga: 35 },
  { pos: 8, name: "Korona Kawice", m: 9, pts: 10, w: 3, d: 1, l: 5, gf: 24, ga: 46 },
  { pos: 9, name: "Albatros Jaśkowice", m: 9, pts: 8, w: 2, d: 2, l: 5, gf: 20, ga: 52 },
  { pos: 10, name: "Huzar Raszówka", m: 9, pts: 6, w: 2, d: 0, l: 7, gf: 19, ga: 62 },
  { pos: 11, name: "Błękitni II Kościelec", m: 8, pts: 4, w: 1, d: 1, l: 6, gf: 15, ga: 39 },
  { pos: 12, name: "Rycerz II Legnickie Pole", m: 9, pts: 3, w: 1, d: 0, l: 8, gf: 23, ga: 85 },
  { pos: 13, name: "Kaczawa II Bieniowice", m: 9, pts: 0, w: 0, d: 0, l: 9, gf: 10, ga: 104 },
];

export const ALBATROS_TEAM_NAME = "Albatros Jaśkowice";

// Terminarz WYŁĄCZNIE meczów Albatrosa, kolejka po kolejce (1-26).
// status: "played" (wynik znany), "scheduled" (data znana), "tbd" (termin
// jeszcze nieustalony przez ligę), "bye" (kolejka wolna, bez meczu).
// home: true = mecz u siebie, false = wyjazd.
// score: ZAWSZE w kolejności gospodarz-gość (tak jak wyświetla się para
// drużyn), czyli na wyjeździe najpierw gole rywala, potem Albatrosa.
export const ALBATROS_FIXTURES = [
  { round: 1, status: "played", date: "2026-08-16", home: false, opponent: "Miedź III Legnica", score: "23-0" },
  { round: 2, status: "played", date: "2026-08-23", home: true, opponent: "Rycerz II Legnickie Pole", score: "5-2" },
  // Kolejka 3: 90minut.pl zna ten klub jako "Błękitni II Kościelec", ale
  // oficjalny system PZPN (laczynaspilka.pl) prowadzi go pod nazwą "Legsad II
  // Kościelec" — to ta sama drużyna, dwie różne nazwy w dwóch źródłach.
  { round: 3, status: "played", date: "2026-08-30", home: false, opponent: "Błękitni II Kościelec", score: "2-2" },
  { round: 4, status: "played", date: "2026-09-06", home: true, opponent: "Korona Kawice", score: "2-2" },
  { round: 5, status: "bye" },
  // Kolejka 6: wyjazd do Huzara Raszówka, wygrana 2:1 (gole: Bartosz Gresiuk 65',
  // Mateusz Gresiuk 79'; Huzar — Rudnicki 56'). Do przerwy 0:0.
  { round: 6, status: "played", date: "2026-09-20", home: false, opponent: "Huzar Raszówka", score: "1-2" },
  { round: 7, status: "played", date: "2026-09-27", home: true, opponent: "Unia Rosochata", score: "1-4" },
  // Kolejka 8: wyjazd do KS Mierzowice, porażka 1:4 (do przerwy 3:1). Gol
  // Albatrosa: Bartosz Gresiuk 34' (bez asysty).
  { round: 8, status: "played", date: "2026-10-04", home: false, opponent: "KS Mierzowice", score: "4-1" },
  // Kolejka 9: u siebie z Dębem Stowarzyszenie II Siedliska, porażka 3:8 (do
  // przerwy 1:4). Gole Albatrosa: Damian Róg 6', 66' + samobójczy Łukasza
  // Poradowskiego (Dąb) 52'.
  { round: 9, status: "played", date: "2026-10-11", home: true, opponent: "Dąb Stowarzyszenie II Siedliska", score: "3-8" },
  // Kolejka 10: wyjazd do Konfeksu II Legnica, porażka 4:6 (do przerwy 4:2 dla
  // Konfeksu). Gole Albatrosa: Bartosz Gresiuk 5', 41', 60' + Artur Borysenko 48'.
  { round: 10, status: "played", date: "2026-10-18", home: false, opponent: "Konfeks II Legnica", score: "6-4" },
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
// kliknięciu w nazwisko) — data, przeciwnik, czy u siebie, wynik (w
// kolejności gospodarz:gość, jak para drużyn na karcie), minuty na boisku, minuty goli i kartek (osobno
// żółte/czerwone) oraz liczba asyst w tym meczu.
//
// Uwzględnia też jeden mecz Pucharu Polski "Strefa Legnica" (09.08.2026,
// runda wstępna, Albatros odpadł 1:5 z Błękitnymi Koskowice) — więcej
// meczów pucharowych w tym sezonie już nie będzie (drużyna odpadła w 1.
// rundzie), więc przy kolejnych aktualizacjach statystyk wystarczy sprawdzać
// tylko ligę (Klasa B) na laczynaspilka.pl, bez zakładki Puchar Polski.
export const PLAYER_STATS_UPDATED = "2026-10-19";

// Rozegrane dotąd mecze — wspólne dane, żeby nie powtarzać ich przy każdym
// zawodniku. "competition" pokazuje się na karcie zawodnika tylko wtedy, gdy
// to nie liga (żeby nie zaśmiecać typowego przypadku).
const M1 = { date: "2026-08-16", opponent: "Miedź III Legnica", home: false, score: "23:0" };
const M2 = { date: "2026-08-23", opponent: "Rycerz II Legnickie Pole", home: true, score: "5:2" };
// Kolejka 3 — jak w ALBATROS_FIXTURES: 90minut.pl nazywa ten klub "Błękitni II
// Kościelec", laczynaspilka.pl (PZPN) prowadzi go jako "Legsad II Kościelec".
const M3 = { date: "2026-08-30", opponent: "Błękitni II Kościelec", home: false, score: "2:2" };
// Kolejka 4 — mecz u siebie z Koroną Kawice, remis 2:2 (do przerwy 2:0).
// Składy, minuty, gole i kartki wg match center laczynaspilka.pl. Asyst w tym
// meczu na razie nie wpisano (laczynaspilka nie pokazuje asyst — dopisz ręcznie
// "kto komu podał", jak przy poprzednich meczach).
const M4 = { date: "2026-09-06", opponent: "Korona Kawice", home: true, score: "2:2" };
// Kolejka 6 — wyjazd do Huzara Raszówka, wygrana 2:1 (do przerwy 0:0). Gole
// Albatrosa: Bartosz Gresiuk 65', Mateusz Gresiuk 79'. Składy i minuty wg match
// center laczynaspilka.pl. Asyst na razie nie wpisano (laczynaspilka nie pokazuje
// asyst — dopisz ręcznie "kto komu podał", jak przy poprzednich meczach).
const M6 = { date: "2026-09-20", opponent: "Huzar Raszówka", home: false, score: "1:2" };
// Kolejka 7 — u siebie z Unią Rosochatą (w PZPN: "Mała Unia Rosochata"),
// porażka 1:4 (do przerwy 1:1). Gol Albatrosa: Patryk Wątroba 25'. Bez kartek.
// Składy i minuty wg match center laczynaspilka.pl. Asyst na razie nie wpisano.
const M7 = { date: "2026-09-27", opponent: "Unia Rosochata", home: true, score: "1:4" };
// Kolejka 8 — wyjazd do KS Mierzowice, porażka 1:4 (do przerwy 3:1). Gol
// Albatrosa: Bartosz Gresiuk 34' — bez asysty. Żółta: Maksym Hlibichuk 60'.
// Składy i minuty wg match center laczynaspilka.pl. Debiut ligowy Damiana Roga.
// Uwaga: zmiana Zębacki -> Fudali (83') nie została wpisana do protokołu przez
// sędziego — dopisana ręcznie wg relacji klubu.
const M8 = { date: "2026-10-04", opponent: "KS Mierzowice", home: false, score: "4:1" };
// Kolejka 9 — u siebie z Dębem Stowarzyszenie II Siedliska, porażka 3:8 (do
// przerwy 1:4). Gole Albatrosa: Damian Róg 6' i 66', trzeci gol to samobój
// Łukasza Poradowskiego (Dąb) w 52' — nie liczy się żadnemu z naszych
// zawodników (dlatego suma goli w PLAYER_STATS jest mniejsza niż suma bramek
// drużyny). Asysty (ręcznie, wg klubu): Bartosz Gresiuk i Marcin Rozpędowski
// — po jednej. Żółte: Dawid Bubień 10', Vladyslav Didenko 42'. Zmiany: 46'
// Fudali -> Papaj, 72' Róg -> Dubaniewicz, 80' Dobryvoda -> Malinowski.
// Składy i minuty wg match center laczynaspilka.pl.
const M9 = { date: "2026-10-11", opponent: "Dąb Stowarzyszenie II Siedliska", home: true, score: "3:8" };
// Kolejka 10 — wyjazd do Konfeksu II Legnica, porażka 4:6 (do przerwy 2:4).
// Gole Albatrosa: Bartosz Gresiuk 5', 41', 60' (hat-trick) i Artur Borysenko
// 48'. Asysty (ręcznie, wg klubu): Vladyslav Didenko 2, Bartłomiej Taczyński 1,
// Bartosz Gresiuk 1. Bez kartek po naszej stronie. Zmiany: 46' Malinowski ->
// Borysenko, 59' Duchnicki -> Wątroba, 73' Didenko -> Obremski, 90' B. Taczyński
// -> Fudali (na laczynaspilka 0 min, liczone 1', jak przy podobnej zmianie w M6).
// Mateusz Gresiuk, Kamil Felsztyński i Yevhen Borblik byli w protokole jako
// rezerwowi, ale nie przyjechali na mecz, więc nie liczymy im występu (wg klubu).
// Składy i minuty wg match center laczynaspilka.pl.
const M10 = { date: "2026-10-18", opponent: "Konfeks II Legnica", home: false, score: "6:4" };
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
  { name: "Maksym Dobryvoda", matches: 8, minutes: 578, goals: 4, assists: 1, yellowCards: 0, redCards: 0, matchLog: [m(M9, 80), m(M7, 90), m(M6, 90), m(M4, 79, ["40'"]), m(M3, 44), m(M2, 74, ["30'", "35'", "55'"], [], [], 1), m(M1, 60), m(CUP1, 61)] },
  { name: "Vladyslav Didenko", matches: 9, minutes: 611, goals: 0, assists: 2, yellowCards: 3, redCards: 1, matchLog: [m(M10, 73, [], [], [], 2), m(M9, 90, [], ["42'"]), m(M8, 90), m(M7, 90), m(M6, 90), m(M4, 72), m(M3, 0), m(M1, 50), m(CUP1, 56, [], ["15'", "56'"], ["56'"])] },
  { name: "Dominik Duchnicki", matches: 6, minutes: 290, goals: 0, assists: 1, yellowCards: 0, redCards: 0, matchLog: [m(M10, 59), m(M7, 73), m(M6, 0), m(M3, 46), m(M2, 83, [], [], [], 1), m(CUP1, 29)] },
  { name: "Remigiusz Dubaniewicz", matches: 6, minutes: 64, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M9, 18), m(M8, 7), m(M7, 19), m(M4, 20), m(M3, 0), m(M1, 0)] },
  { name: "Bartosz Fudali", matches: 10, minutes: 170, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M10, 1), m(M9, 46), m(M8, 7), m(M7, 9), m(M6, 1), m(M4, 0), m(M3, 46), m(M2, 13), m(M1, 24), m(CUP1, 23)] },
  { name: "Kamil Felsztyński", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Maciej Gdaniec", matches: 9, minutes: 742, goals: 0, assists: 0, yellowCards: 1, redCards: 0, matchLog: [m(M10, 90), m(M8, 90), m(M7, 90), m(M6, 90), m(M4, 90, [], ["85'"]), m(M3, 90), m(M2, 90), m(M1, 40), m(CUP1, 72)] },
  { name: "Bartosz Gresiuk", matches: 7, minutes: 586, goals: 5, assists: 2, yellowCards: 0, redCards: 0, matchLog: [m(M10, 90, ["5'", "41'", "60'"], [], [], 1), m(M9, 90, [], [], [], 1), m(M8, 90, ["34'"]), m(M7, 81), m(M6, 90, ["65'"]), m(M1, 66), m(CUP1, 79)] },
  { name: "Mateusz Gresiuk", matches: 6, minutes: 540, goals: 3, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M6, 90, ["79'"]), m(M4, 90), m(M3, 90, ["28'"]), m(M2, 90), m(M1, 90), m(CUP1, 90, ["50'"])] },
  // 2 asysty w meczu z Legsadem II Kościelec (kolejka 3, M3) — dopisane
  // ręcznie od razu po meczu (laczynaspilka.pl nie pokazuje asyst).
  { name: "Maksym Hlibichuk", matches: 7, minutes: 630, goals: 0, assists: 3, yellowCards: 1, redCards: 0, matchLog: [m(M10, 90), m(M9, 90), m(M8, 90, [], ["60'"]), m(M6, 90), m(M4, 90, [], [], [], 1), m(M3, 90, [], [], [], 2), m(M2, 90)] },
  { name: "Rafał Kanasiuk", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Oleksandr Kolvakh", matches: 1, minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M1, 90)] },
  { name: "Kacper Malinowski", matches: 10, minutes: 141, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M10, 46), m(M9, 10), m(M8, 13), m(M7, 17), m(M6, 0), m(M4, 0), m(M3, 27), m(M2, 7), m(M1, 10), m(CUP1, 11)] },
  { name: "Krzysztof Obremski", matches: 8, minutes: 202, goals: 0, assists: 0, yellowCards: 1, redCards: 0, matchLog: [m(M10, 17), m(M9, 90), m(M8, 9), m(M7, 66), m(M4, 0), m(M3, 0), m(M2, 20, [], ["83'"]), m(CUP1, 0)] },
  { name: "Damian Pachołek", matches: 1, minutes: 60, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(CUP1, 60)] },
  { name: "Michał Papaj", matches: 5, minutes: 161, goals: 1, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M9, 44), m(M7, 71), m(M6, 0), m(M4, 46, ["41'"]), m(M3, 0)] },
  { name: "Paweł Pęczkowski", matches: 3, minutes: 94, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M9, 0), m(M4, 24), m(M2, 70)] },
  { name: "Marcin Rozpędowski", matches: 8, minutes: 487, goals: 0, assists: 1, yellowCards: 0, redCards: 0, matchLog: [m(M10, 90), m(M9, 90, [], [], [], 1), m(M7, 28), m(M6, 90), m(M4, 70), m(M3, 44), m(M1, 45), m(CUP1, 30)] },
  { name: "Damian Róg", matches: 3, minutes: 243, goals: 2, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M10, 90), m(M9, 72, ["6'", "66'"]), m(M8, 81)] },
  { name: "Filip Siwak", matches: 5, minutes: 181, goals: 1, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M4, 44), m(M3, 44, ["70'"]), m(M2, 45), m(M1, 30), m(CUP1, 18)] },
  { name: "Mateusz Styrcz", matches: 3, minutes: 223, goals: 1, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M2, 66, ["38'"]), m(M1, 90), m(CUP1, 67)] },
  { name: "Marcin Świtoń", matches: 9, minutes: 654, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M10, 90), m(M9, 90), m(M8, 90), m(M7, 90), m(M6, 90), m(M4, 90), m(M3, 90), m(M2, 24), m(M1, 0)] },
  // Czerwona kartka z meczu z Koroną Kawice (M4) — dostał ją po końcowym
  // gwizdku, ale figuruje w protokole meczowym, więc liczy się do statystyk.
  { name: "Gabriel Świerbutowicz", matches: 7, minutes: 16, goals: 0, assists: 0, yellowCards: 0, redCards: 1, matchLog: [m(M9, 0), m(M8, 0), m(M4, 0, [], [], ["po meczu"]), m(M3, 0), m(M2, 16), m(M1, 0), m(CUP1, 0)] },
  { name: "Bartłomiej Taczyński", matches: 8, minutes: 609, goals: 0, assists: 2, yellowCards: 0, redCards: 0, matchLog: [m(M10, 90, [], [], [], 1), m(M9, 90), m(M8, 90), m(M7, 24), m(M6, 90), m(M3, 90), m(M2, 45, [], [], [], 1), m(CUP1, 90)] },
  { name: "Krzysztof Taczyński", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Marek Taczyński", matches: 1, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M2, 0)] },
  { name: "Stanisław Taczyński", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Mateusz Taraciński", matches: 6, minutes: 233, goals: 1, assists: 1, yellowCards: 1, redCards: 0, matchLog: [m(M8, 0), m(M7, 0), m(M6, 0), m(M4, 66), m(M3, 90, [], ["80'"]), m(M2, 77, ["42'"], [], [], 1)] },
  { name: "Janusz Tkacz", matches: 6, minutes: 150, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M10, 0), m(M9, 0), m(M8, 0), m(M6, 0), m(M1, 60), m(CUP1, 90)] },
  { name: "Patryk Wątroba", matches: 8, minutes: 583, goals: 1, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M10, 31), m(M8, 77), m(M7, 62, ["25'"]), m(M6, 90), m(M4, 90), m(M3, 63), m(M2, 90), m(M1, 80)] },
  { name: "Jonatan Wyporkiewicz", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Hubert Zdziech", matches: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [] },
  { name: "Konrad Zębacki", matches: 5, minutes: 191, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M8, 83), m(M7, 0), m(M6, 0), m(M4, 18), m(M1, 90)] },
  { name: "Yevhen Borblik", matches: 8, minutes: 410, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchLog: [m(M9, 0), m(M8, 83), m(M7, 90), m(M6, 0), m(M4, 11), m(M3, 46), m(M1, 90), m(CUP1, 90)] },
  { name: "Artur Borysenko", matches: 4, minutes: 179, goals: 1, assists: 0, yellowCards: 1, redCards: 0, matchLog: [m(M10, 44, ["48'"]), m(M2, 0), m(M1, 45, [], ["65'"]), m(CUP1, 90)] },
  { name: "Dawid Bubień", matches: 10, minutes: 750, goals: 0, assists: 0, yellowCards: 1, redCards: 0, matchLog: [m(M10, 90), m(M9, 90, [], ["10'"]), m(M8, 90), m(M7, 90), m(M6, 90), m(M4, 90), m(M3, 90), m(M2, 90), m(M1, 30), m(CUP1, 0)] },
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
  { opponent: "Huzar Raszówka", playerName: "Mateusz Gresiuk" },
  { opponent: "Unia Rosochata", playerName: "Patryk Wątroba" },
  { opponent: "KS Mierzowice", playerName: "Vladyslav Didenko" },
  { opponent: "Dąb Stowarzyszenie II Siedliska", playerName: "Damian Róg" },
  { opponent: "Konfeks II Legnica", playerName: "Bartosz Gresiuk" },
];
