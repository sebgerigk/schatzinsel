// Die Werft: was es für das Schiff zu kaufen gibt. Preise in Goldmünzen.
// Eine Runde an einer Station bringt 1 bis 3 Münzen.
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
      { id: 'wimpel', name: 'Wimpel', price: 12 },
      { id: 'schatz', name: 'Schatzkiste', price: 15 },
      { id: 'koko', name: 'Koko an Bord', price: 20 },
      // needs: erst kaufbar, wenn diese Station geschafft ist
      { id: 'steuerrad', name: 'Steuerrad', price: 12, needs: 'prog-meister' },
    ],
  },
];
