// Ehren-Schätze: Werft-Teile, die es erst nach einer Leistung gibt – zusätzlich zu den Münzen.
// Gezählt wird nur echtes Lernen und Spielen (Sterne, Medaillen, Spieltage), nie Münzen.
// Bewusst keine Tage „am Stück": verpasste Tage sollen keinen Druck machen.
import { ISLANDS, ISLAND_ORDER, visibleStations } from './stations.js';
import { settings } from '../engine/storage.js';

const shownIslands = () => ISLAND_ORDER.filter(id => settings().islands[id]);
const starsOf = (state, id) => (state.stars || {})[id] || 0;

export const ACHIEVEMENTS = {
  // Alle Stationen einer Insel mit drei Sternen (die beste Insel zählt).
  inselmeister: {
    icon: 'stern', say: 'schatz_need_insel',
    progress(state) {
      let best = null;
      for (const id of shownIslands()) {
        const list = visibleStations(ISLANDS[id], state);
        if (!list.length) continue;
        const have = list.filter(s => starsOf(state, s.id) >= 3).length;
        if (!best || have / list.length > best.have / best.want) best = { have, want: list.length };
      }
      return best || { have: 0, want: 1 };
    },
  },
  // Auf jeder Insel mindestens drei Stationen geschafft.
  weltumsegler: {
    icon: 'insel', say: 'schatz_need_welt',
    progress(state) {
      const shown = shownIslands();
      const have = shown.filter(id => visibleStations(ISLANDS[id], state).filter(s => starsOf(state, s.id) > 0).length >= 3).length;
      return { have, want: shown.length };
    },
  },
  kompass5: {
    icon: 'medaille', say: 'schatz_need_kompass',
    progress: state => ({ have: Object.keys(state.medals || {}).length, want: 5 }),
  },
  // An sieben verschiedenen Tagen gespielt (mindestens eine Minute).
  tage7: {
    icon: 'sonne', say: 'schatz_need_tage',
    progress: state => ({ have: Object.values(state.history || {}).filter(min => min >= 1).length, want: 7 }),
  },
  sterne100: {
    icon: 'stern', say: 'schatz_need_sterne',
    progress: state => ({ have: Object.values(state.stars || {}).reduce((a, b) => a + b, 0), want: 100 }),
  },
  meister: {
    icon: 'steuerrad', say: 'werft_locked',
    progress: state => ({ have: starsOf(state, 'prog-meister') > 0 ? 1 : 0, want: 1 }),
  },
};

/** Fortschritt einer Leistung: { have, want, done } (have höchstens want). */
export function achievement(key, state) {
  const a = ACHIEVEMENTS[key];
  const p = a.progress(state);
  return { ...a, have: Math.min(p.have, p.want), want: p.want, done: p.have >= p.want };
}
