# Albatros — strona z zapisami na treningi

Prosta strona klubowa: plan zajęć na najbliższy tydzień (treningi, mecze,
trening bramkarski — każde innym kolorem), lista graczy ze zdjęciami
(placeholder gdy brak zdjęcia) i zapisy **Tak / Nie / HGW**. W tle losowo
lecą klubowe filmiki (dawne gify, przekonwertowane na dużo lżejsze mp4).

Działa jako zwykła statyczna strona — bez serwera, bez backendu do
utrzymywania. Do "wspólnej pamięci" zapisów (żeby każdy widział te same
zapisy) używa Firebase Firestore (darmowe).

## Zanim wrzucisz na GitHub — działa od razu w trybie demo

Możesz otworzyć `index.html` już teraz (patrz niżej "Podgląd lokalnie") —
strona działa od razu, tylko zapisy będą widoczne tylko w Twojej
przeglądarce, dopóki nie skonfigurujesz Firebase (patrz krok 2 poniżej).
Zobaczysz wtedy żółty pasek "Tryb demo" na górze strony.

## Podgląd lokalnie

Najprościej: w tym folderze uruchom mały serwer, bo przeglądarka blokuje
moduły JS otwierane bezpośrednio z dysku (`file://`):

```
python3 -m http.server 8000
```

i wejdź na `http://localhost:8000`.

## 1. Wrzucenie na Twojego GitHuba (kobrem71)

W terminalu, w tym folderze:

```bash
git init
git add .
git commit -m "Strona Albatros - zapisy na treningi"
git branch -M main
git remote add origin https://github.com/kobrem71/albatros-strona.git
git push -u origin main
```

Jeśli repo `albatros-strona` jeszcze nie istnieje na GitHubie — najpierw
utwórz je na https://github.com/new (bez README, bez .gitignore, puste),
dokładnie pod tą nazwą (albo zmień nazwę w komendzie `git remote add`
powyżej na taką, jaką wybierzesz).

### Włączenie GitHub Pages

1. Wejdź w repo na GitHubie → **Settings** → **Pages**.
2. W "Build and deployment" → Source: **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → Save.
4. Po chwili strona będzie pod adresem:
   `https://kobrem71.github.io/albatros-strona/`

## 2. Konfiguracja Firebase (żeby zapisy były wspólne dla wszystkich)

Bez tego kroku strona działa, ale każdy widzi zapisy tylko na swoim
urządzeniu. Zajmuje to ok. 10 minut, jest darmowe (plan Spark, bez karty
płatniczej) i w zupełności wystarcza dla kilkudziesięciu graczy.

1. Wejdź na https://console.firebase.google.com i zaloguj się kontem Google.
2. **Add project** → nazwa np. `albatros-klub` → dalej, dalej, Create project.
3. Menu z lewej: **Build → Firestore Database → Create database**
   → "Start in test mode" → wybierz region (np. `eur3 / europe-west`) → Enable.
4. Ikona koła zębatego (u góry po lewej) → **Project settings**.
5. Sekcja "Your apps" → kliknij ikonę `</>` (Web) → nadaj nazwę np. "strona"
   → **Register app**. Pokaże się obiekt `firebaseConfig`.
6. Skopiuj wartości z `firebaseConfig` do pliku **`js/firebase-config.js`**
   (podmień puste stringi w `FIREBASE_CONFIG`).
7. W Firestore Database → zakładka **Rules** — wklej całą zawartość pliku
   **`firestore.rules`** (jest w tym folderze) i kliknij **Publish**.
8. Zapisz zmiany, zrób `git add . && git commit -m "Firebase config" && git push`.

Po tym kroku żółty baner "Tryb demo" zniknie, a zapisy będą wspólne dla
wszystkich graczy, w czasie rzeczywistym.

> Klucz `apiKey` w konfiguracji Firebase **nie jest tajny** — to normalne,
> że jest widoczny w kodzie strony (tak działa każda strona na Firebase).
> Bezpieczeństwo zapewniają reguły w `firestore.rules`.

## 3. Edycja planu zajęć

Otwórz `js/schedule.js`:

- **Treningi (śr, pt 18:00, adres domyślny `HOME_ADDRESS`)** są w sekcji
  `RECURRING_RULES` — powtarzają się same, co tydzień. Nic nie trzeba robić.
- **Mecze** są w `EXTRA_EVENTS` jako osobne wpisy z konkretną datą — bo w
  lidze nie każda niedziela jest meczowa (są kolejki-pauzy) i różne są adresy
  (dom/wyjazd). Obecnie wpisany jest terminarz do kolejki 13 (15.11.2026).
  Gdy sezon pójdzie dalej, dopisz kolejne mecze w tym samym formacie:
  ```js
  {
    type: "mecz",
    date: "RRRR-MM-DD",
    time: "11:00",
    location: HOME_ADDRESS, // u siebie — albo adres przeciwnika na wyjeździe
    label: "Albatros Jaśkowice – Nazwa Przeciwnika",
  },
  ```
- **Inne jednorazowe wydarzenia** (jak trening bramkarski) dopisujesz do
  `EXTRA_EVENTS` tak samo, z konkretną datą `RRRR-MM-DD`.
- Po edycji: `git add . && git commit -m "Aktualizacja planu"` (osobno `git
  commit`), potem `git push` — GitHub Pages sam zaktualizuje stronę po ok.
  minucie.

Adres treningu/meczu **nie musi** być w kodzie — każdy może go ustawić
bezpośrednio na stronie, przyciskiem "Ustaw adres" przy danym wydarzeniu
(zapisze się dla wszystkich, jeśli Firebase jest skonfigurowany). Przyda się
to zwłaszcza tam, gdzie w kodzie wpisana jest tylko nazwa miejscowości
(Kościelec, Kwiatkowice, Mierzowice) — nie udało mi się znaleźć dokładnych
adresów tych boisk w sieci.

## 4. Dodawanie / usuwanie graczy

Edytuj listę `RAW_NAMES` w pliku **`js/players.js`**.

## 5. Dodawanie zdjęć graczy

Wrzuć plik do `assets/img/players/`, o nazwie **dokładnie takiej jak "slug"
gracza** (małe litery, bez polskich znaków, spacje jako `-`). Np. dla
"Krzysztof Obremski" plik powinien nazywać się:

```
assets/img/players/krzysztof-obremski.jpg
```

(obsługiwane rozszerzenia: `.jpg`, `.jpeg`, `.png`, `.webp`). Jeśli pliku
nie ma, gracz dostaje kolorowy awatar z inicjałami — automatycznie, nic nie
trzeba konfigurować.

## Jak działają zapisy (Tak / Nie / HGW)

Przy pierwszej wizycie gracz wybiera swoje imię i nazwisko z listy u góry
strony (zapamiętywane w przeglądarce). Wtedy w tabeli graczy tylko jego
własny wiersz ma aktywne przyciski **Tak / Nie / HGW** — to zabezpieczenie
przed przypadkowym kliknięciem czyjegoś zapisu. Wiersze innych graczy są
widoczne, ale nieklikalne.

## Struktura projektu

```
index.html              strona główna
css/style.css            wygląd
js/players.js             lista graczy
js/schedule.js            plan zajęć (edytuj co tydzień)
js/firebase-config.js     dane Twojego projektu Firebase
js/store.js               logika zapisu (Firebase albo tryb demo)
js/app.js                 cała logika strony
assets/img/logo.png       logo klubu
assets/img/players/       zdjęcia graczy (dorzucasz sam)
assets/gifs/*.mp4         filmiki tła (losowane)
firestore.rules           reguły bezpieczeństwa bazy (wklej w Firebase)
```
