// Spielstand – liegt ausschließlich lokal auf dem Gerät.
// Er wird doppelt gesichert: in localStorage und in einer IndexedDB. Beim Start gilt die neuere Fassung.
// So geht nichts verloren, wenn das Gerät einen der beiden Speicher leert oder nicht rechtzeitig schreibt.
import { SHIPYARD, MOVED_TO_EXTRAS } from '../content/shipyard.js';

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
  coins: 0, stars: {}, played: {}, seen: {}, last: {},
  // Einstellungen aus dem Elternbereich
  settings: {
    caps: false, limitMin: 0, unlockAll: false, islands: { lesen: true, schreiben: true, rechnen: true, programmieren: true },
    // Programmierinsel: Teil 2 (Steuerrad) 'auto' = sichtbar, sobald Teil 1 geschafft ist; Fahrtempo des Schiffs
    progPart2: 'auto', progSpeed: 'normal',
  },
  // Spielzeit: heute (Sekunden, Bonus) und Minuten der letzten Tage
  playtime: { date: '', sec: 0, bonus: 0 }, history: {},
  // Das Schiff des Kindes und was dafür schon gekauft wurde
  ship: { segel: 'rot', flagge: 'rot', rumpf: 'holz', figur: 'keine', extras: [] },
  owned: {},
  // Kompass-Medaillen (Station -> true) und was am Kartentisch entstanden ist
  medals: {},
  werkstatt: { bilder: [], raetsel: [] },
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
  migrate(state);
  state.launches = (state.launches || 0) + 1;
  save();
}

/**
 * Bringt ältere Spielstände auf den neuesten Stand. Darf beliebig oft laufen.
 * Teile, die von den Schätzen zu den Extras umgezogen sind, bleiben gekauft;
 * der Preisunterschied kommt als Münzen zurück.
 */
function migrate(st) {
  const owned = st.owned || {};
  const extras = SHIPYARD.find(c => c.cat === 'extras').items;
  for (const [id, oldPrice] of Object.entries(MOVED_TO_EXTRAS)) {
    if (!owned['schaetze:' + id]) continue;
    delete owned['schaetze:' + id];
    if (owned['extras:' + id]) continue;
    owned['extras:' + id] = true;
    st.coins += Math.max(0, oldPrice - extras.find(x => x.id === id).price);
  }
  st.owned = owned;
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

/** Heutiges Datum als JJJJ-MM-TT (Ortszeit). */
export function todayKey() {
  const d = new Date();
  const two = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** Alle Einstellungen, ergänzt um Vorgaben für alles, was in einem älteren Spielstand noch fehlt. */
export function settings() {
  const base = defaults().settings;
  const own = state.settings || {};
  return { ...base, ...own, islands: { ...base.islands, ...(own.islands || {}) } };
}

/** Trägt eine geschaffte Station ein. Jede Runde bringt Münzen (zurückgegeben), die beste Wertung bleibt. */
export function awardStation(id, stars, medal = false) {
  // Eine Station, die schon drei Sterne hat, bringt beim Wiederholen höchstens noch eine Münze.
  const coins = (state.stars[id] || 0) >= 3 ? Math.min(stars, 1) : stars;
  state.coins += coins;
  celebrate = true;
  if (medal) { state.medals = state.medals || {}; state.medals[id] = true; }
  state.played[id] = (state.played[id] || 0) + 1;
  state.last = state.last || {};
  state.last[id] = todayKey();
  if (stars > (state.stars[id] || 0)) state.stars[id] = stars;
  save();
  return coins;
}

/** Kleine Merker, z. B. setFlag('schatzGesehen', 'goldschiff'). */
export const hasFlag = (group, id) => !!(state[group] && state[group][id]);
export function setFlag(group, id) {
  if (hasFlag(group, id)) return;
  state[group] = { ...(state[group] || {}), [id]: true };
  save();
}

// Nach einer Runde mit Münzen feuert die Konfettikanone auf der Schatzkarte (einmal).
let celebrate = false;
export function takeCelebration() {
  const c = celebrate;
  celebrate = false;
  return c;
}

/** Bilder und Rätsel vom Kartentisch: höchstens 12 je Art, das älteste fällt heraus. */
export function werkstatt() {
  state.werkstatt = { bilder: [], raetsel: [], ...(state.werkstatt || {}) };
  return state.werkstatt;
}
export function saveWerk(kind, item) {
  const w = werkstatt();
  w[kind] = [item, ...w[kind]].slice(0, 12);
  save();
}
export function removeWerk(kind, index) {
  const w = werkstatt();
  w[kind].splice(index, 1);
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
  state.settings = { ...settings(), [key]: value };
  save();
}

/** Überträgt die Einstellungen auf die Seite (CSS-Klassen am <html>-Element). */
export function applySettings() {
  document.documentElement.classList.toggle('caps', !!(state.settings && state.settings.caps));
}

/** Fortschritt löschen; die Einstellungen der Eltern bleiben erhalten. */
export function resetProgress() {
  const keep = { settings: settings(), launches: state.launches, rev: state.rev };
  state = Object.assign(defaults(), keep);
  save();
}

const BACKUP_PREFIX = 'SCHATZINSEL1:';

/** Spielstand als Text zum Aufbewahren (z. B. in den Notizen). */
export function exportState() {
  const json = JSON.stringify(state);
  return BACKUP_PREFIX + btoa(unescape(encodeURIComponent(json)));
}

/** Spielstand aus einer Sicherung laden. Gibt false zurück, wenn der Text keine gültige Sicherung ist. */
export function importState(text) {
  try {
    const clean = String(text).trim();
    if (!clean.startsWith(BACKUP_PREFIX)) return false;
    const data = JSON.parse(decodeURIComponent(escape(atob(clean.slice(BACKUP_PREFIX.length).replace(/\s+/g, '')))));
    if (!data || typeof data !== 'object' || typeof data.coins !== 'number' || typeof data.stars !== 'object') return false;
    data.rev = Math.max(data.rev || 0, state.rev || 0) + 1;   // damit die Sicherung beim nächsten Start gewinnt
    state = Object.assign(defaults(), data);
    migrate(state);
    save();
    return true;
  } catch {
    return false;
  }
}
