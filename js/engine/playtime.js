// Spielzeit: zählt, wie lange heute gespielt wurde, und kennt das Tageslimit der Eltern.
// Gezählt wird nur, solange die App sichtbar ist und das Kind wirklich spielt
// (nicht auf dem Startbildschirm, im Elternbereich oder auf dem Abschiedsbildschirm).
import { getState, save, settings, todayKey } from './storage.js';

const TICK = 5;            // Sekunden zwischen zwei Messungen
let counting = false;
let lastTick = 0;
let sinceSave = 0;

function today() {
  const st = getState();
  const key = todayKey();
  if (!st.playtime || st.playtime.date !== key) st.playtime = { date: key, sec: 0, bonus: 0 };
  return st.playtime;
}

function tick() {
  const now = Date.now();
  const visible = document.visibilityState === 'visible';
  if (counting && visible && lastTick) {
    const st = getState();
    const pt = today();
    pt.sec += Math.min(TICK * 2, (now - lastTick) / 1000);   // Pausen (Gerät gesperrt) zählen nicht mit
    st.history = st.history || {};
    st.history[pt.date] = Math.round(pt.sec / 60);
    const days = Object.keys(st.history).sort();
    while (days.length > 60) delete st.history[days.shift()];
    sinceSave += TICK;
    if (sinceSave >= 20) { sinceSave = 0; save(); }
  }
  lastTick = visible ? now : 0;
}

export function startPlaytime() {
  setInterval(tick, TICK * 1000);
  document.addEventListener('visibilitychange', () => { lastTick = document.visibilityState === 'visible' ? Date.now() : 0; });
}

/** Der Router meldet, welcher Bildschirm gerade gezeigt wird. */
export function setScreen(name) {
  const play = ['map', 'island', 'round', 'werft', 'kartentisch'].includes(name);
  if (play && !counting) lastTick = Date.now();
  counting = play;
}

export const minutesToday = () => Math.floor(today().sec / 60);

/** true, wenn das Tageslimit erreicht ist (0 = kein Limit). */
export function timeIsUp() {
  const limit = settings().limitMin;
  if (!limit) return false;
  const pt = today();
  return pt.sec >= limit * 60 + (pt.bonus || 0);
}

/** Eltern schenken für heute zusätzliche Minuten. */
export function addBonus(minutes) {
  const pt = today();
  // Mindestens so viel, dass ab jetzt wirklich die geschenkte Zeit bleibt.
  const limit = settings().limitMin * 60;
  pt.bonus = Math.max(pt.bonus || 0, pt.sec - limit) + minutes * 60;
  save();
}

/** Minuten der letzten Tage, ältester zuerst: [{ key, label, min }]. */
export function lastDays(n = 7) {
  const st = getState();
  const names = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const two = x => String(x).padStart(2, '0');
    const key = `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
    const min = key === todayKey() ? minutesToday() : ((st.history || {})[key] || 0);
    out.push({ key, label: names[d.getDay()], min });
  }
  return out;
}
