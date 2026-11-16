// Schatzinsel – Einstieg. Lädt Inhalte, meldet die Bildschirme an und startet.
import { go } from './engine/router.js';
import { loadContent } from './engine/content.js';
import { initAudio } from './engine/audio.js';
import { applySettings, requestPersistence } from './engine/storage.js';
import './screens/title.js';
import './screens/map.js';
import './screens/island.js';
import './screens/round.js';
import './screens/gallery.js';

async function boot() {
  applySettings();
  requestPersistence();
  await Promise.all([loadContent(), initAudio()]);
  go(location.hash === '#galerie' ? 'gallery' : 'title');
}

// Kein Zoomen, kein Kontextmenü, kein Gummiband-Scrollen – die App soll sich wie eine App anfühlen.
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('touchmove', e => {
  if (!e.target.closest('.gallery, .stations')) e.preventDefault();
}, { passive: false });

// Offline-Betrieb (nur über https bzw. localhost möglich).
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

boot();
