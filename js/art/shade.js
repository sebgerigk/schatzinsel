// Licht und Umrisse für alle Zeichnungen – an einer Stelle, für die ganze App (wie in Burg Funkelstein).
// Jede gefüllte Form (Pfad, Rechteck, Kreis, Ellipse) bekommt statt der flachen Farbe einen sanften
// Verlauf (oben links heller, unten dunkler) und einen Umriss im dunkleren Ton der eigenen Farbe
// statt überall derselben dunklen Linie. So wirken die Bilder plastischer, ohne dass jede Zeichnung
// einzeln angepasst werden muss. Ausgenommen: Weiß, die Umrissfarbe selbst, Glanzlichter und
// Schattierungen (stroke="none") sowie halbdurchsichtige Formen (Schatten).
const NS = 'http://www.w3.org/2000/svg';
const INK = '#3b2a20';
const SKIP = new Set(['#ffffff', '#fff', INK]);
const SHAPES = 'path,rect,circle,ellipse,polygon';
const made = new Set();
let defs = null;

const hex = h => (h.length === 4 ? '#' + [...h.slice(1)].map(c => c + c).join('') : h).toLowerCase();
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
/** t > 0: Richtung Weiß, t < 0: Richtung Ink (nicht Schwarz – das wirkt weicher). */
function mix(h, t) {
  const c = rgb(h);
  const to = t > 0 ? [255, 255, 255] : rgb(INK);
  const k = Math.abs(t);
  return toHex(c.map((v, i) => v + (to[i] - v) * k));
}

function ensureDefs() {
  if (defs) return defs;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  // Nicht display:none – sonst zeigen manche Browser die Verläufe nicht an.
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs);
  document.body.prepend(svg);
  return defs;
}

function gradient(color) {
  const id = 'sh-' + color.slice(1);
  if (!made.has(id)) {
    made.add(id);
    const g = document.createElementNS(NS, 'linearGradient');
    g.setAttribute('id', id);
    g.setAttribute('x1', '0'); g.setAttribute('y1', '0'); g.setAttribute('x2', '.35'); g.setAttribute('y2', '1');
    g.innerHTML = `<stop offset="0" stop-color="${mix(color, 0.28)}"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="${mix(color, -0.14)}"/>`;
    ensureDefs().appendChild(g);
  }
  return `url(#${id})`;
}

function shadeEl(el) {
  if (el.dataset.sh) return;
  el.dataset.sh = '1';
  const f = el.getAttribute('fill');
  if (!f || f[0] !== '#' || el.getAttribute('stroke') === 'none' || el.hasAttribute('opacity')) return;
  const c = hex(f);
  if (SKIP.has(c) || c.length !== 7) return;
  // Nur gezeichnete Dinge mit Umriss – Flächen ohne Umriss (Himmel, Wiese, Wände) bleiben ruhig und eben.
  const holder = el.closest('[stroke]');
  const stroke = holder && holder.getAttribute('stroke');
  if (!stroke || stroke === 'none') return;
  el.setAttribute('fill', gradient(c));
  // Umriss im eigenen, dunkleren Ton – nur wo sonst die allgemeine dunkle Linie wäre.
  if (hex(stroke) === INK) el.setAttribute('stroke', mix(c, -0.62));
}

/** Alle Formen in einem Bereich schattieren. */
export function shadeAll(root) {
  if (root.nodeType !== 1) return;
  if (root.matches && root.matches(SHAPES)) shadeEl(root);
  root.querySelectorAll && root.querySelectorAll(SHAPES).forEach(shadeEl);
}

/** Beobachtet die App: alles, was neu gezeichnet wird, bekommt Licht und Umriss. */
export function startShading(app) {
  shadeAll(app);
  new MutationObserver(list => {
    for (const m of list) m.addedNodes.forEach(n => shadeAll(n));
  }).observe(app, { childList: true, subtree: true });
}
