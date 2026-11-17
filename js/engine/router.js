// Winziger Bildschirm-Wechsler: jeder Bildschirm ist eine Funktion (el, params) -> cleanup?
import { stopSpeech } from './audio.js';

const screens = {};
let cleanup = null;
let guard = null;      // darf einen Bildschirmwechsel umleiten (z. B. Tageslimit erreicht)
let listener = null;   // erfährt, welcher Bildschirm gerade gezeigt wird

export function setGuard(fn) { guard = fn; }
export function onScreen(fn) { listener = fn; }

export function register(name, fn) {
  screens[name] = fn;
}

export function go(name, params = {}) {
  if (guard) name = guard(name, params) || name;
  if (cleanup) {
    try { cleanup(); } catch { /* egal */ }
    cleanup = null;
  }
  stopSpeech();
  document.querySelectorAll('.burst, .confetti').forEach(n => n.remove());
  const root = document.getElementById('app');
  root.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'screen screen-' + name;
  root.appendChild(el);
  if (listener) listener(name);
  cleanup = screens[name](el, params) || null;
}
