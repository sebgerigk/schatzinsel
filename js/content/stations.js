// Die drei Inseln und ihre Stationen. Reihenfolge = Lernweg.
export const ISLANDS = {
  lesen: {
    name: 'Leseinsel',
    welcome: 'welcome_lesen',
    stations: [
      { id: 'lesen-1', title: 'Wort und Bild', game: 'lesen', opts: { kind: 'wortbild', maxLen: 5 } },
      { id: 'lesen-2', title: 'Bild und Wort', game: 'lesen', opts: { kind: 'bildwort', maxLen: 5 } },
      { id: 'lesen-3', title: 'Lange Wörter', game: 'lesen', opts: { kind: 'mix', minLen: 5 } },
      { id: 'lesen-4', title: 'Stimmt das?', game: 'lesen', opts: { kind: 'satz' } },
    ],
  },
  schreiben: {
    name: 'Schreibinsel',
    welcome: 'welcome_schreiben',
    stations: [
      { id: 'schreiben-1', title: 'Zahlen schreiben', game: 'schreiben', opts: { kind: 'trace', chars: '0123456789' } },
      { id: 'schreiben-2', title: 'Von A bis M', game: 'schreiben', opts: { kind: 'trace', chars: 'ABCDEFGHIJKLM' } },
      { id: 'schreiben-3', title: 'Von N bis Z', game: 'schreiben', opts: { kind: 'trace', chars: 'NOPQRSTUVWXYZ' } },
      { id: 'schreiben-4', title: 'Wörter bauen', game: 'schreiben', opts: { kind: 'tiles', maxLen: 4 } },
      { id: 'schreiben-5', title: 'Lange Wörter', game: 'schreiben', opts: { kind: 'tiles', minLen: 5 } },
    ],
  },
  rechnen: {
    name: 'Recheninsel',
    welcome: 'welcome_rechnen',
    stations: [
      { id: 'rechnen-1', title: 'Plus bis 10', game: 'rechnen', opts: { kind: 'plus10' } },
      { id: 'rechnen-2', title: 'Minus bis 10', game: 'rechnen', opts: { kind: 'minus10' } },
      { id: 'rechnen-3', title: 'Plus bis 20', game: 'rechnen', opts: { kind: 'plus20' } },
      { id: 'rechnen-4', title: 'Über die 10', game: 'rechnen', opts: { kind: 'cross10' } },
      { id: 'rechnen-5', title: 'Minus bis 20', game: 'rechnen', opts: { kind: 'minus20' } },
    ],
  },
};

export const ISLAND_ORDER = ['lesen', 'schreiben', 'rechnen'];
