// Winziger Bildschirm-Wechsler: jeder Bildschirm ist eine Funktion (el, params) -> cleanup?
import { stopSpeech } from './audio.js';

const screens = {};
let cleanup = null;

export function register(name, fn) {
  screens[name] = fn;
}

export function go(name, params = {}) {
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
  cleanup = screens[name](el, params) || null;
}
