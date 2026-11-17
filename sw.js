// Service Worker: macht die Schatzinsel offline nutzbar.
// Strategie: alles aus dem Cache beantworten und im Hintergrund auffrischen –
// so startet die App sofort und holt sich Updates beim nächsten Öffnen mit Netz.
const CACHE = 'schatzinsel-v5';

const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js',
  'js/engine/util.js', 'js/engine/storage.js', 'js/engine/content.js', 'js/engine/audio.js', 'js/engine/router.js', 'js/engine/playtime.js',
  'js/art/koko.js', 'js/art/icons.js', 'js/art/world.js', 'js/art/pictures.js',
  'js/content/stations.js', 'js/content/strokes.js', 'js/content/shipyard.js',
  'js/games/rechnen.js', 'js/games/lesen.js', 'js/games/schreiben.js', 'js/games/build.js',
  'js/screens/title.js', 'js/screens/map.js', 'js/screens/island.js', 'js/screens/round.js', 'js/screens/gallery.js', 'js/screens/werft.js', 'js/screens/eltern.js', 'js/screens/pause.js', 'js/screens/gate.js',
  'content/words.json', 'content/sentences.json', 'content/phrases.json', 'content/stories.json', 'content/extras.json',
  'assets/audio/index.json',
  'assets/icons/icon-180.png', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    // Alle Sprach-Clips mitnehmen, damit Koko auch ohne Netz spricht.
    try {
      const index = await (await fetch('assets/audio/index.json')).json();
      const files = [...new Set(Object.values(index))].map(f => 'assets/audio/' + f);
      await cache.addAll(files);
    } catch { /* Clips werden sonst beim ersten Abspielen nachgeladen */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const refresh = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) {
      event.waitUntil(refresh);
      return cached;
    }
    const fresh = await refresh;
    if (fresh) return fresh;
    if (req.mode === 'navigate') return cache.match('index.html');
    return new Response('', { status: 504 });
  })());
});
