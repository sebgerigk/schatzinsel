// Schatzinsel – Einstieg. Lädt Inhalte, meldet die Bildschirme an und startet.
import { go, setGuard, onScreen } from './engine/router.js';
import { startPlaytime, setScreen, timeIsUp } from './engine/playtime.js';
import { loadContent } from './engine/content.js';
import { initAudio } from './engine/audio.js';
import { applySettings, requestPersistence, initStorage } from './engine/storage.js';
import './screens/title.js';
import './screens/map.js';
import './screens/island.js';
import './screens/round.js';
import './screens/werft.js';
import './screens/eltern.js';
import './screens/pause.js';
import './screens/gallery.js';

async function boot() {
  requestPersistence();
  await Promise.all([loadContent(), initAudio(), initStorage()]);
  applySettings();
  // Spielzeit zählen und nach Erreichen des Tageslimits freundlich verabschieden.
  // Eine laufende Runde wird nicht unterbrochen: geprüft wird nur beim Wechsel des Bildschirms.
  onScreen(setScreen);
  setGuard(name => (['map', 'island', 'round', 'werft'].includes(name) && timeIsUp() ? 'pause' : name));
  startPlaytime();
  go(location.hash === '#galerie' ? 'gallery' : 'title');
}

// Kein Zoomen, kein Kontextmenü, kein Gummiband-Scrollen – die App soll sich wie eine App anfühlen.
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('touchmove', e => {
  if (!e.target.closest('.gallery, .stations, .shop-items, .eltern-body, textarea')) e.preventDefault();
}, { passive: false });

// Offline-Betrieb (nur über https bzw. localhost möglich).
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

boot();
