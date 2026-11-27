export const INK = '#3b2a20';

/** Baut ein DOM-Element aus einem HTML-String. */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const wait = ms => new Promise(r => setTimeout(r, ms));

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Wartet auf ein Promise, aber höchstens ms Millisekunden. */
export function withTimeout(promise, ms) {
  return Promise.race([promise, wait(ms)]);
}

/** Lässt ein Element kurz wackeln (falsche Antwort). */
export function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

/** Sternchen-Explosion rund um ein Element (richtige Antwort). */
export function burst(el, { n = 12, spread = 110 } = {}) {
  if (!el) return;
  const colors = ['#ffc93c', '#f0553f', '#45b565', '#2f86d8', '#ffffff', '#ff8fb3'];
  const r = el.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'burst';
  layer.style.left = (r.left + r.width / 2) + 'px';
  layer.style.top = (r.top + r.height / 2) + 'px';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const d = spread * (0.55 + Math.random() * 0.6) + Math.max(r.width, r.height) * 0.25;
    s.style.setProperty('--dx', Math.cos(a) * d + 'px');
    s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = (Math.random() * 0.08) + 's';
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 1200);
}

/** Konfetti-Regen über den ganzen Bildschirm (Station geschafft). */
export function confetti(n = 60) {
  const colors = ['#ffc93c', '#f0553f', '#45b565', '#2f86d8', '#ff8fb3', '#ffffff'];
  const layer = document.createElement('div');
  layer.className = 'confetti';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.9 + 's';
    s.style.animationDuration = 2.2 + Math.random() * 1.6 + 's';
    s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    s.style.setProperty('--sway', (Math.random() * 120 - 60) + 'px');
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4800);
  return layer;
}

/**
 * Verteilt n gleich große Kacheln so auf eine Fläche w × h, dass alle ohne Wischen hineinpassen.
 * aspect = Breite / Höhe einer Kachel. Liefert die Zahl der Spalten und die Kachelbreite (px).
 */
export function fitGrid(n, w, h, gap, aspect) {
  let best = { cols: 1, size: 0 };
  for (let cols = 1; cols <= Math.max(1, n); cols++) {
    const rows = Math.ceil(n / cols);
    const size = Math.min((w - gap * (cols - 1)) / cols, ((h - gap * (rows - 1)) / rows) * aspect);
    if (size > best.size) best = { cols, size };
  }
  return best;
}

/**
 * Hält die Kacheln in einem Raster-Kasten passend: setzt --cols und --tile (Kachelbreite in px)
 * und rechnet neu, wenn sich die Größe ändert (iPad drehen) oder update() gerufen wird.
 */
export function fitTiles(box, aspect) {
  const apply = () => {
    const n = box.children.length;
    const cs = getComputedStyle(box);
    const w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (!n || w <= 0 || h <= 0) return;
    const { cols, size } = fitGrid(n, w, h, parseFloat(cs.columnGap) || 0, aspect);
    box.style.setProperty('--cols', cols);
    box.style.setProperty('--tile', Math.floor(size) + 'px');
  };
  const ro = new ResizeObserver(apply);
  ro.observe(box);
  apply();
  return { update: apply, stop: () => ro.disconnect() };
}
