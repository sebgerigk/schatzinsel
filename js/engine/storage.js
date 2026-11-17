// Spielstand – liegt ausschließlich lokal auf dem Gerät.
// Er wird doppelt gesichert: in localStorage und in einer IndexedDB. Beim Start gilt die neuere Fassung.
// So geht nichts verloren, wenn das Gerät einen der beiden Speicher leert oder nicht rechtzeitig schreibt.
const KEY = 'schatzinsel.v1';
const DB_NAME = 'schatzinsel';
let idbOk = false;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  });
}

async function dbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction('kv').objectStore('kv').get(key);
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function dbPut(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(value, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

const defaults = () => ({
  coins: 0, stars: {}, played: {}, seen: {}, settings: { caps: false },
  // Das Schiff des Kindes und was dafür schon gekauft wurde
  ship: { segel: 'rot', flagge: 'rot', rumpf: 'holz', figur: 'keine', extras: [] },
  owned: {},
});

function load() {
  try {
    return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {});
  } catch {
    return defaults();
  }
}

/** false, wenn der Browser nichts speichern darf (z. B. Safari mit blockierten Cookies). */
export const storageOk = (() => {
  try {
    localStorage.setItem(KEY + '.test', '1');
    localStorage.removeItem(KEY + '.test');
    return true;
  } catch {
    return false;
  }
})();

/** Bittet das Gerät, den Spielstand nicht von selbst aufzuräumen. */
export function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  } catch { /* nicht überall verfügbar */ }
}

let state = load();

/**
 * Muss vor dem ersten Bildschirm aufgerufen werden: gleicht beide Speicher ab
 * (die Fassung mit dem höheren Zähler „rev" gewinnt) und zählt den App-Start.
 */
export async function initStorage() {
  try {
    const fromDb = await Promise.race([dbGet('state'), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 2500))]);
    idbOk = true;
    if (fromDb && (fromDb.rev || 0) > (state.rev || 0)) state = Object.assign(defaults(), fromDb);
  } catch {
    idbOk = false;
  }
  state.launches = (state.launches || 0) + 1;
  save();
}

/** Für die kleine Statuszeile auf dem Startbildschirm und zur Fehlersuche. */
export const storageInfo = () => ({ local: storageOk, idb: idbOk, any: storageOk || idbOk, launches: state.launches || 0, coins: state.coins });

export function getState() {
  return state;
}

export function save() {
  state.rev = (state.rev || 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* privater Modus o. Ä. – Spiel läuft trotzdem */ }
  if (idbOk) dbPut('state', JSON.parse(JSON.stringify(state))).catch(() => {});
}

// Beim Verlassen der App noch einmal sichern – iPadOS beendet Web-Apps ohne Vorwarnung.
if (typeof document !== 'undefined') {
  const flush = () => { if (document.visibilityState === 'hidden') save(); };
  document.addEventListener('visibilitychange', flush);
  window.addEventListener('pagehide', () => save());
}

/** Trägt eine geschaffte Station ein. Jede Runde bringt Münzen, die beste Wertung bleibt. */
export function awardStation(id, stars) {
  state.coins += stars;
  state.played[id] = (state.played[id] || 0) + 1;
  if (stars > (state.stars[id] || 0)) state.stars[id] = stars;
  save();
}

/** Wie oft ein Buchstabe, eine Zahl oder ein Wort schon geübt wurde. */
export const seenCount = key => (state.seen && state.seen[key]) || 0;

export function markSeen(key) {
  state.seen = state.seen || {};
  state.seen[key] = (state.seen[key] || 0) + 1;
  save();
}

/** Mischt eine Liste und stellt das am seltensten Geübte nach vorn. */
export function leastSeenFirst(items, keyOf) {
  return items
    .map(item => ({ item, n: seenCount(keyOf(item)), r: Math.random() }))
    .sort((a, b) => a.n - b.n || a.r - b.r)
    .map(x => x.item);
}

/** Gehört dieses Schiffsteil schon dem Kind? Teile ohne Preis sind von Anfang an dabei. */
export const isOwned = (cat, item) => item.price === 0 || !!(state.owned && state.owned[cat + ':' + item.id]);

/** Teil anbringen. Bei Extras (multi) wird es an- oder abgebaut. */
export function equipPart(cat, id, multi) {
  state.ship = { ...defaults().ship, ...state.ship };
  if (multi) {
    const set = new Set(state.ship.extras || []);
    if (set.has(id)) set.delete(id); else set.add(id);
    state.ship.extras = [...set];
  } else {
    state.ship[cat] = id;
  }
  save();
}

/** Teil kaufen: Münzen abziehen, merken, gleich anbringen. false, wenn die Münzen nicht reichen. */
export function buyPart(cat, item, multi) {
  if (state.coins < item.price) return false;
  state.coins -= item.price;
  state.owned = state.owned || {};
  state.owned[cat + ':' + item.id] = true;
  if (multi && (state.ship.extras || []).includes(item.id)) { save(); return true; }
  equipPart(cat, item.id, multi);
  return true;
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
