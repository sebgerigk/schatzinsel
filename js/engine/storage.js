// Spielstand – liegt ausschließlich lokal auf dem Gerät.
const KEY = 'schatzinsel.v1';

const defaults = () => ({ coins: 0, stars: {}, played: {}, settings: { caps: false } });

function load() {
  try {
    return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {});
  } catch {
    return defaults();
  }
}

let state = load();

export function getState() {
  return state;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* privater Modus o. Ä. – Spiel läuft trotzdem */ }
}

/** Trägt eine geschaffte Station ein. Jede Runde bringt Münzen, die beste Wertung bleibt. */
export function awardStation(id, stars) {
  state.coins += stars;
  state.played[id] = (state.played[id] || 0) + 1;
  if (stars > (state.stars[id] || 0)) state.stars[id] = stars;
  save();
}

/** Einstellung ändern, z. B. setSetting('caps', true) für „nur Großbuchstaben". */
export function setSetting(key, value) {
  state.settings = { ...defaults().settings, ...state.settings, [key]: value };
  save();
}

/** Überträgt die Einstellungen auf die Seite (CSS-Klassen am <html>-Element). */
export function applySettings() {
  document.documentElement.classList.toggle('caps', !!(state.settings && state.settings.caps));
}

export function resetState() {
  state = defaults();
  save();
}
