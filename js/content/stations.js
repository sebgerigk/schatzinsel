// Die drei Inseln und ihre Stationen. Reihenfolge = Lernweg.
// Die ids sind sprechend und bleiben stabil, damit der Spielstand erhalten bleibt,
// wenn später Stationen dazwischen eingefügt werden.
export const ISLANDS = {
  lesen: {
    name: 'Leseinsel',
    welcome: 'welcome_lesen',
    stations: [
      { id: 'lesen-wortbild', title: 'Wort und Bild', game: 'lesen', opts: { kind: 'wortbild', maxLen: 5 } },
      { id: 'lesen-bildwort', title: 'Bild und Wort', game: 'lesen', opts: { kind: 'bildwort', maxLen: 5 } },
      { id: 'lesen-lang', title: 'Lange Wörter', game: 'lesen', opts: { kind: 'mix', minLen: 5 } },
      { id: 'lesen-satz', title: 'Stimmt das?', game: 'lesen', opts: { kind: 'satz' } },
    ],
  },
  schreiben: {
    name: 'Schreibinsel',
    welcome: 'welcome_schreiben',
    stations: [
      { id: 'schreiben-zahlen', title: 'Zahlen schreiben', game: 'schreiben', opts: { kind: 'trace', chars: '0123456789' } },
      { id: 'schreiben-gross-am', title: 'Von A bis M', game: 'schreiben', opts: { kind: 'trace', chars: 'ABCDEFGHIJKLM' } },
      { id: 'schreiben-gross-nz', title: 'Von N bis Z', game: 'schreiben', opts: { kind: 'trace', chars: 'NOPQRSTUVWXYZÄÖÜ' } },
      // lower: true -> wird ausgeblendet, wenn „nur Großbuchstaben" eingeschaltet ist
      { id: 'schreiben-klein-am', title: 'Von a bis m', lower: true, game: 'schreiben', opts: { kind: 'trace', chars: 'abcdefghijklm' } },
      { id: 'schreiben-klein-nz', title: 'Von n bis z', lower: true, game: 'schreiben', opts: { kind: 'trace', chars: 'nopqrstuvwxyzäöüß' } },
      { id: 'schreiben-woerter', title: 'Wörter bauen', game: 'schreiben', opts: { kind: 'tiles', maxLen: 4 } },
      { id: 'schreiben-lang', title: 'Lange Wörter', game: 'schreiben', opts: { kind: 'tiles', minLen: 5 } },
    ],
  },
  rechnen: {
    name: 'Recheninsel',
    welcome: 'welcome_rechnen',
    stations: [
      { id: 'rechnen-plus10', title: 'Plus bis 10', game: 'rechnen', opts: { kind: 'plus10' } },
      { id: 'rechnen-minus10', title: 'Minus bis 10', game: 'rechnen', opts: { kind: 'minus10' } },
      { id: 'rechnen-zehnerfreunde', title: 'Zehnerfreunde', game: 'rechnen', opts: { kind: 'bonds10' } },
      { id: 'rechnen-doppelt', title: 'Verdoppeln', game: 'rechnen', opts: { kind: 'double' } },
      { id: 'rechnen-plus20', title: 'Plus bis 20', game: 'rechnen', opts: { kind: 'plus20' } },
      { id: 'rechnen-ueber10', title: 'Über die 10', game: 'rechnen', opts: { kind: 'cross10' } },
      { id: 'rechnen-minus20', title: 'Minus bis 20', game: 'rechnen', opts: { kind: 'minus20' } },
      { id: 'rechnen-haelfte', title: 'Halbieren', game: 'rechnen', opts: { kind: 'half' } },
      { id: 'rechnen-luecke', title: 'Welche Zahl fehlt?', game: 'rechnen', opts: { kind: 'missing20' } },
    ],
  },
};

export const ISLAND_ORDER = ['lesen', 'schreiben', 'rechnen'];

/** Stationen, die mit den aktuellen Einstellungen gezeigt werden (idx = Platz in der vollen Liste). */
export function visibleStations(isl, state) {
  const caps = !!(state.settings && state.settings.caps);
  return isl.stations.map((s, idx) => ({ ...s, idx })).filter(s => !(caps && s.lower));
}
