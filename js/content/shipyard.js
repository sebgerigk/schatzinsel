// Die Werft: was es für das Schiff zu kaufen gibt. Preise in Goldmünzen.
// Eine Runde an einer Station bringt 1 bis 3 Münzen.
// Teile, die früher bei den Schätzen standen: wer sie dort gekauft hat, behält sie
// (Spielstand-Umzug in js/engine/storage.js) und bekommt den Preisunterschied zurück.
export const MOVED_TO_EXTRAS = { moewe: 40, rettungsboot: 50, katze: 60, aeffchen: 60, schildkroete: 60 };

export const SHIPYARD = [
  {
    cat: 'segel', title: 'Segel',
    items: [
      { id: 'rot', name: 'Rot-weiß', price: 0 },
      { id: 'blau', name: 'Blau-weiß', price: 5 },
      { id: 'sonne', name: 'Sonnensegel', price: 8 },
      { id: 'regenbogen', name: 'Regenbogen', price: 15 },
      { id: 'pirat', name: 'Piratensegel', price: 20 },
      { id: 'gold', name: 'Goldsegel', price: 30 },
    ],
  },
  {
    cat: 'flagge', title: 'Flagge',
    items: [
      { id: 'rot', name: 'Rot', price: 0 },
      { id: 'blau', name: 'Blau', price: 3 },
      { id: 'gruen', name: 'Grün', price: 3 },
      { id: 'regenbogen', name: 'Regenbogen', price: 8 },
      { id: 'stern', name: 'Sternenflagge', price: 10 },
    ],
  },
  {
    cat: 'rumpf', title: 'Rumpf',
    items: [
      { id: 'holz', name: 'Holz', price: 0 },
      { id: 'dunkel', name: 'Dunkles Holz', price: 5 },
      { id: 'rot', name: 'Rot', price: 10 },
      { id: 'blau', name: 'Blau', price: 10 },
      { id: 'koenig', name: 'Königsschiff', price: 25 },
    ],
  },
  {
    cat: 'figur', title: 'Bug',
    items: [
      { id: 'keine', name: 'Ohne', price: 0 },
      { id: 'stern', name: 'Goldstern', price: 8 },
      { id: 'fisch', name: 'Fisch', price: 12 },
    ],
  },
  {
    // multi: mehrere gleichzeitig möglich, antippen baut an oder ab
    cat: 'extras', title: 'Extras', multi: true,
    items: [
      { id: 'laterne', name: 'Laterne', price: 6 },
      { id: 'anker', name: 'Anker', price: 8 },
      { id: 'ausguck', name: 'Ausguck', price: 10 },
      { id: 'moewe', name: 'Möwe', price: 12 },
      { id: 'schildkroete', name: 'Schildkröte', price: 12 },
      { id: 'wimpel', name: 'Wimpel', price: 12 },
      { id: 'rettungsboot', name: 'Rettungsboot', price: 14 },
      { id: 'schatz', name: 'Schatzkiste', price: 15 },
      { id: 'katze', name: 'Schiffskatze', price: 18 },
      { id: 'aeffchen', name: 'Äffchen', price: 18 },
      { id: 'koko', name: 'Koko an Bord', price: 20 },
    ],
  },
  {
    // Teure Schätze zum Sparen. thumb: eigenes Vorschaubild (für Dinge, die nicht am Schiff sind).
    // needs: Leistung aus js/content/schaetze.js, die zusätzlich zu den Münzen nötig ist.
    cat: 'schaetze', title: 'Schätze', multi: true, special: true,
    items: [
      // Am Schiff (kleine Tiere und Teile stehen bei den Extras – Schätze sollen deutlich zu sehen sein)
      { id: 'drache', name: 'Drachenkopf', price: 70 },
      { id: 'konfetti', name: 'Konfettikanone', price: 70 },
      { id: 'sternensegel', name: 'Sternensegel', price: 80 },
      { id: 'zweimaster', name: 'Zweimaster', price: 100 },
      // Auf der Schatzkarte
      { id: 'delfin', name: 'Delfin', price: 80, thumb: 'delfin' },
      { id: 'wal', name: 'Wal', price: 120, thumb: 'wal' },
      { id: 'regenbogen', name: 'Regenbogen', price: 60, thumb: 'regenbogen' },
      { id: 'schnee', name: 'Schnee', price: 60, thumb: 'schnee' },
      { id: 'feuerwerk', name: 'Feuerwerk', price: 80, thumb: 'feuerwerk' },
      { id: 'nacht', name: 'Nachtfahrt', price: 90, thumb: 'nacht' },
      // Klänge: das Schiff antippen
      { id: 'glocke', name: 'Schiffsglocke', price: 30, thumb: 'glocke' },
      { id: 'nebelhorn', name: 'Nebelhorn', price: 40, thumb: 'nebelhorn' },
      { id: 'shanty', name: 'Seemannslied', price: 50, thumb: 'shanty' },
      // Ehren-Schätze: Münzen und eine Leistung
      { id: 'steuerrad', name: 'Steuerrad', price: 40, needs: 'meister' },
      { id: 'weltflagge', name: 'Weltumsegler-Flagge', price: 60, needs: 'weltumsegler' },
      { id: 'kompassrose', name: 'Kompassrose', price: 60, needs: 'kompass5' },
      { id: 'nordstern', name: 'Nordstern', price: 70, needs: 'tage7' },
      { id: 'perlenreling', name: 'Perlenreling', price: 100, needs: 'sterne100' },
      { id: 'goldschiff', name: 'Goldenes Schatzschiff', price: 150, needs: 'inselmeister' },
    ],
  },
];
