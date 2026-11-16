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
