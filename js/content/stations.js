// Die vier Inseln und ihre Stationen. Reihenfolge = Lernweg.
// Die ids sind sprechend und bleiben stabil, damit der Spielstand erhalten bleibt,
// wenn später Stationen dazwischen eingefügt werden.
export const ISLANDS = {
  lesen: {
    name: 'Leseinsel',
    welcome: 'welcome_lesen',
    stations: [
      { id: 'lesen-wortbild', title: 'Wort und Bild', game: 'lesen', opts: { kind: 'wortbild', maxLen: 5 } },
      { id: 'lesen-bildwort', title: 'Bild und Wort', game: 'lesen', opts: { kind: 'bildwort', maxLen: 5 } },
      { id: 'lesen-anlaut', title: 'Wie fängt es an?', game: 'lesen', opts: { kind: 'anlaut' } },
      { id: 'lesen-silben', title: 'Silben bauen', game: 'lesen', opts: { kind: 'silben' } },
      { id: 'lesen-reim', title: 'Reimwörter', game: 'lesen', opts: { kind: 'reim' } },
      // match: nur Wörter, in denen dieser Laut vorkommt
      { id: 'lesen-sch', title: 'Wörter mit Sch', game: 'lesen', opts: { kind: 'mix', match: 'sch' } },
      { id: 'lesen-ei-ie', title: 'Ei und ie', game: 'lesen', opts: { kind: 'mix', match: 'ei|ie' } },
      { id: 'lesen-au-eu', title: 'Au und Eu', game: 'lesen', opts: { kind: 'mix', match: 'au|eu' } },
      { id: 'lesen-lang', title: 'Lange Wörter', game: 'lesen', opts: { kind: 'mix', minLen: 6 } },
      { id: 'lesen-satz', title: 'Stimmt das?', game: 'lesen', opts: { kind: 'satz' } },
      { id: 'lesen-satzbau', title: 'Sätze bauen', game: 'lesen', opts: { kind: 'satzbau' } },
      { id: 'lesen-post', title: 'Flaschenpost', game: 'lesen', opts: { kind: 'post' } },
    ],
  },
  schreiben: {
    name: 'Schreibinsel',
    welcome: 'welcome_schreiben',
    stations: [
      { id: 'schreiben-woerter', title: 'Wörter bauen', game: 'schreiben', opts: { kind: 'tiles', maxLen: 4 } },
      { id: 'schreiben-lang', title: 'Lange Wörter', game: 'schreiben', opts: { kind: 'tiles', minLen: 5 } },
      { id: 'schreiben-luecke', title: 'Welcher Laut fehlt?', game: 'schreiben', opts: { kind: 'gap' } },
      { id: 'schreiben-doppelt', title: 'Einer oder zwei?', game: 'schreiben', opts: { kind: 'doppel' } },
      { id: 'schreiben-hoeren', title: 'Hören und bauen', game: 'schreiben', opts: { kind: 'hoeren', maxLen: 5 } },
      // lower: true -> wird ausgeblendet, wenn „nur Großbuchstaben" eingeschaltet ist
      { id: 'schreiben-grossklein', title: 'Groß oder klein?', lower: true, game: 'schreiben', opts: { kind: 'gross' } },
      { id: 'schreiben-tippen', title: 'Wörter schreiben', game: 'schreiben', opts: { kind: 'tippen', maxLen: 5 } },
      { id: 'schreiben-diktat', title: 'Diktat', game: 'schreiben', opts: { kind: 'diktat', maxLen: 7 } },
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
  programmieren: {
    name: 'Programmierinsel',
    welcome: 'welcome_programmieren',
    stations: [
      // Teil 1 – Bildschirm-Pfeile (erste Klasse). set: Kartensatz aus content/seekarten.json
      { id: 'prog-ablauf', title: 'Was kommt zuerst?', game: 'denken', opts: { kind: 'ablauf' } },
      { id: 'prog-planen', title: 'Erst planen', game: 'programmieren', opts: { kind: 'planen', set: 'planen', probe: true } },
      { id: 'prog-reise', title: 'Lange Reise', game: 'programmieren', opts: { kind: 'planen', set: 'reise' } },
      { id: 'prog-vorhersage', title: 'Wo landet es?', game: 'programmieren', opts: { kind: 'vorher', set: 'reise' } },
      { id: 'prog-fehler', title: 'Fehler finden', game: 'programmieren', opts: { kind: 'fehler', set: 'reise' } },
      { id: 'prog-muster', title: 'Was kommt dann?', game: 'denken', opts: { kind: 'muster' } },
      { id: 'prog-strudel', title: 'Wiederholen', game: 'programmieren', opts: { kind: 'planen', set: 'strudel' } },
      { id: 'prog-treppe', title: 'Treppen', game: 'programmieren', opts: { kind: 'planen', set: 'treppe' } },
      { id: 'prog-waage', title: 'Schätze sortieren', game: 'denken', opts: { kind: 'waage' } },
      // Teil 2 – Steuerrad (später). part: 2 -> im Elternbereich ausblendbar
      { id: 'prog-steuerrad', title: 'Steuerrad', part: 2, game: 'programmieren', opts: { kind: 'planen', set: 'drehen' } },
      { id: 'prog-kurven', title: 'Kurvenfahrt', part: 2, game: 'programmieren', opts: { kind: 'planen', set: 'kurven' } },
      { id: 'prog-rundfahrt', title: 'Rund um die Insel', part: 2, game: 'programmieren', opts: { kind: 'planen', set: 'rund' } },
      { id: 'prog-ausguck', title: 'Der Ausguck', part: 2, game: 'programmieren', opts: { kind: 'regel' } },
      { id: 'prog-meister', title: 'Meisterprüfung', part: 2, game: 'programmieren', opts: { kind: 'mix' } },
    ],
  },
};

export const ISLAND_ORDER = ['lesen', 'schreiben', 'rechnen', 'programmieren'];

/** Stationen, die mit den aktuellen Einstellungen gezeigt werden (idx = Platz in der vollen Liste). */
export function visibleStations(isl, state) {
  const caps = !!(state.settings && state.settings.caps);
  const part2 = part2Visible(state);
  return isl.stations.map((s, idx) => ({ ...s, idx })).filter(s => !(caps && s.lower) && !(s.part === 2 && !part2));
}

/** Teil 2 der Programmierinsel: von den Eltern ein- oder ausgeschaltet, sonst sichtbar, sobald Teil 1 geschafft ist. */
export function part2Visible(state) {
  const s = state.settings || {};
  if (s.progPart2 === true || s.progPart2 === false) return s.progPart2;
  return !!s.unlockAll || (state.stars && state.stars['prog-waage'] > 0);
}
