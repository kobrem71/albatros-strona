// Lista zawodników klubu. Żeby dodać / usunąć gracza, po prostu edytuj tę listę.
// Zdjęcie: wrzuć plik do assets/img/players/ o nazwie równej "slug" gracza (np. maksym-dobryvoda.jpg)
// Obsługiwane rozszerzenia: .jpg .jpeg .png .webp — jeśli pliku nie ma, pokazuje się awatar z inicjałami.

export const RAW_NAMES = [
  "Maksym Dobryvoda",
  "Vladyslav Didenko",
  "Dominik Duchnicki",
  "Remigiusz Dubaniewicz",
  "Bartosz Fudali",
  "Kamil Felsztyński",
  "Maciej Gdaniec",
  "Bartosz Gresiuk",
  "Mateusz Gresiuk",
  "Maksym Hlibichuk",
  "Rafał Kanasiuk",
  "Oleksandr Kolvakh",
  "Kacper Malinowski",
  "Krzysztof Obremski",
  "Damian Pachołek",
  "Michał Papaj",
  "Paweł Pęczkowski",
  "Marcin Rozpędowski",
  "Filip Siwak",
  "Mateusz Styrcz",
  "Marcin Świtoń",
  "Gabriel Świerbutowicz",
  "Bartłomiej Taczyński",
  "Krzysztof Taczyński",
  "Marek Taczyński",
  "Stanisław Taczyński",
  "Mateusz Taraciński",
  "Janusz Tkacz",
  "Patryk Wątroba",
  "Jonatan Wyporkiewicz",
  "Hubert Zdziech",
  "Konrad Zębacki",
  "Yevhen Borblik",
  "Artur Borysenko",
  "Dawid Bubień",
  "Filip Kubiak",
  "Jakub Cofór",
  "Alan Lichman",
  "Brajan Kwiatkowski",
  "Jakub Behrendt",
  "Zawodnik Testowany1",
  "Zawodnik Testowany2",
];

export function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // usuń akcenty (ż, ń, ą, ó się zmapują)
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const PLAYERS = RAW_NAMES.map((name) => ({
  name,
  slug: slugify(name),
  photoBase: `assets/img/players/${slugify(name)}`,
}));
