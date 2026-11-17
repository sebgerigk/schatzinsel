// Grafik der Programmierinsel: Seekarte, Felsen, Schiff (seitlich und von oben), Plättchen.
// Gleicher Stil wie world.js: dicke dunkle Kontur, flache Farben, runde Ecken.
import { INK } from '../engine/util.js';
import { shipSvg, chestParts, palm, SAILS, HULLS, DEFAULT_SHIP } from './world.js';
import { starPoints } from './icons.js';

export const CELL = 100;
const GOLD = '#ffcb3d', GOLD2 = '#e9a21f', WOOD = '#b0703f', WOOD2 = '#8a5530', CREAM = '#fff7e2';
export const PAINT = ['#f0553f', '#2f86d8', '#45b565'];   // Farbtöpfe beim Malen: rot, blau, grün
const FACE_DEG = { E: 0, S: 90, W: 180, N: 270 };

const g = inner => `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
export const cx = x => x * CELL + CELL / 2;

/* ---------- Dinge auf der Karte ---------- */

function rock(x, y) {
  const v = (x * 7 + y * 3) % 3;
  const shapes = [
    'M-32 16 Q-38 -8 -14 -24 Q8 -36 26 -20 Q40 -4 32 16 Q0 26 -32 16Z',
    'M-30 18 Q-34 -2 -20 -16 Q-10 -30 6 -24 Q30 -26 34 0 Q38 18 20 20 Q-6 26 -30 18Z',
    'M-34 18 Q-30 -10 -8 -18 Q2 -34 20 -24 Q36 -12 34 18 Q0 28 -34 18Z',
  ];
  return `<g transform="translate(${cx(x)} ${cx(y)})">
    <ellipse cx="0" cy="20" rx="42" ry="12" fill="#fff" stroke="none" opacity=".7"/>
    <path d="${shapes[v]}" fill="#8f8578"/>
    <path d="M-16 -12 Q-4 -22 10 -16" fill="none" stroke="#c4bcb0" stroke-width="5"/>
    <path d="M-8 6 q8 -6 16 0" fill="none" stroke="#6f665b" stroke-width="3"/>
  </g>`;
}

function isle(x, y) {
  return `<g transform="translate(${cx(x)} ${cx(y)})">
    <ellipse cx="0" cy="14" rx="46" ry="24" fill="#8fe3ec" stroke="none"/>
    <path d="M-40 18 Q-36 -10 0 -12 Q36 -10 40 18 Q0 32 -40 18Z" fill="#f8dc8e"/>
    ${palm(4, 14, 0.36)}
  </g>`;
}

const coinAt = (x, y) => `<g class="map-coin" data-k="${x},${y}" transform="translate(${cx(x)} ${cx(y)})"><g class="coin-anim">
  <circle r="17" fill="${GOLD}"/><circle r="10" fill="none" stroke="${GOLD2}" stroke-width="3"/>
  <polygon points="${starPoints(0, 0.5, 6, 2.6)}" fill="${GOLD2}" stroke="none"/></g></g>`;

const chestAt = (x, y, extra = '') => `<g class="map-chest" data-k="${x},${y}" transform="translate(${cx(x)} ${cx(y) + 4})">
  <g class="chest-anim"><circle class="chest-ring" r="44" fill="#fff7a8" stroke="none"/><g transform="translate(-40 -40) scale(0.4)" stroke-width="9">${chestParts()}</g></g>${extra}</g>`;

function waterTiles(w, h) {
  let s = '';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      s += `<rect x="${x * CELL + 3}" y="${y * CELL + 3}" width="${CELL - 6}" height="${CELL - 6}" rx="14" fill="${(x + y) % 2 ? '#5fcfe0' : '#7ad9e6'}"/>`;
      if ((x * 5 + y * 3) % 4 === 0) s += `<path d="M${x * CELL + 22} ${y * CELL + 66} q10 -8 20 0 t20 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>`;
    }
  }
  return s;
}

/* ---------- Das Schiff ---------- */

/** Das Werft-Schiff von der Seite, mittig auf (0, 0). */
export function sideShip(cfg) {
  return shipSvg(cfg).replace('<svg class="ship-svg"', '<svg class="ship-svg" x="-50" y="-58" width="100" height="77"');
}

/** Das Schiff von oben, Bug nach rechts: rotes Licht links (Backbord), grünes rechts (Steuerbord). */
export function topShip(cfg) {
  const c = { ...DEFAULT_SHIP, ...(cfg || {}) };
  const hull = HULLS[c.rumpf] || HULLS.holz;
  const sail = SAILS[c.segel] || SAILS.rot;
  const sailFill = sail.rainbow ? '#ffcb3d' : sail.base;
  return g(`
    <path class="bow-arrow" d="M50 -11 L64 0 L50 11Z" fill="${GOLD}" stroke-width="3"/>
    <path d="M44 0 Q24 -26 -28 -24 Q-44 -22 -44 0 Q-44 22 -28 24 Q24 26 44 0Z" fill="${hull.fill}"/>
    <path d="M32 0 Q16 -16 -24 -15 Q-34 -13 -34 0 Q-34 13 -24 15 Q16 16 32 0Z" fill="#d9a066" stroke-width="3"/>
    <path d="M-28 -6 H16 M-28 6 H16" stroke="${WOOD2}" stroke-width="2.5"/>
    <path d="M-8 -34 Q16 0 -8 34 Q2 0 -8 -34Z" fill="${sailFill}" stroke-width="3.5"/>
    ${sail.stripe ? `<path d="M-2 -18 Q4 0 -2 18" fill="none" stroke="${sail.stripe}" stroke-width="4"/>` : ''}
    <circle cx="-8" cy="0" r="6" fill="${WOOD2}" stroke-width="3"/>
    <circle cx="14" cy="-19" r="5.5" fill="#f0553f" stroke-width="2.5"/>
    <circle cx="14" cy="19" r="5.5" fill="#45b565" stroke-width="2.5"/>`);
}

/**
 * Die ganze Seekarte als SVG. opts.mode: 'abs' (Seitenansicht) oder 'rel' (von oben).
 * opts.chests: Liste von Feldern für „Wo landet es?" statt des einen Schatzes.
 */
export function boardSvg(lv, { mode = 'abs', ship = DEFAULT_SHIP, chests = null, empty = false } = {}) {
  const W = lv.w * CELL, H = lv.h * CELL;
  const things = [
    ...lv.rocks.map(p => rock(p.x, p.y)),
    ...lv.isles.map(p => isle(p.x, p.y)),
    ...lv.coins.map(p => coinAt(p.x, p.y)),
    ...(chests ? chests.map(p => chestAt(p.x, p.y)) : lv.goal ? [chestAt(lv.goal.x, lv.goal.y)] : []),
  ].join('');
  const start = lv.start || { x: 0, y: 0 };
  return `<svg class="board-svg${mode === 'rel' ? ' rel' : ''}" viewBox="-16 -16 ${W + 32} ${H + 32}" aria-hidden="true">
    <rect x="-14" y="-14" width="${W + 28}" height="${H + 28}" rx="22" fill="${WOOD}" stroke="${INK}" stroke-width="5"/>
    <rect x="-2" y="-2" width="${W + 4}" height="${H + 4}" rx="14" fill="#3fb0c8" stroke="${INK}" stroke-width="3"/>
    ${[[-6, -6], [W + 6, -6], [-6, H + 6], [W + 6, H + 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>`).join('')}
    <g class="water">${waterTiles(lv.w, lv.h)}</g>
    <g class="paint"></g>
    <g class="trail"></g>
    ${g(`<g class="things">${things}</g>`)}
    <g class="ghost"></g>
    <g class="ship"${empty || !lv.start ? ' visibility="hidden"' : ''} style="transform: translate(${cx(start.x)}px, ${cx(start.y)}px)">
      <g class="ship-turn" style="transform: rotate(${mode === 'rel' ? FACE_DEG[lv.face] : 0}deg)">
        <g class="ship-flip"><g class="ship-wobble">${mode === 'rel' ? topShip(ship) : sideShip(ship)}</g></g>
      </g>
    </g>
  </svg>`;
}

/** Heller Geisterpfeil auf der Karte: von Feld a nach Feld b. */
export function ghostArrow(a, b) {
  const x1 = cx(a.x), y1 = cx(a.y), x2 = cx(b.x), y2 = cx(b.y);
  const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return `<g transform="translate(${x1} ${y1}) rotate(${ang})" opacity=".8">
    <path d="M14 0 H${len - 26} M${len - 46} -20 L${len - 18} 0 L${len - 46} 20" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 0 H${len - 26} M${len - 46} -20 L${len - 18} 0 L${len - 46} 20" fill="none" stroke="#ffcb3d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

/** Geisterpfeil für eine Drehung auf der Stelle. */
export function ghostTurn(p, face, op) {
  const ang = FACE_DEG[face];
  const d = op === 'tl' ? 'M24 30 Q30 -10 0 -30 M2 -46 L-10 -28 L10 -20' : 'M24 -30 Q30 10 0 30 M2 46 L-10 28 L10 20';
  return `<g transform="translate(${cx(p.x)} ${cx(p.y)}) rotate(${ang})" opacity=".85">
    <path d="${d}" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${op === 'tl' ? '#f0553f' : '#45b565'}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

export const faceDeg = f => FACE_DEG[f];

/* ---------- Plättchen-Symbole ---------- */

const icon = (inner, cls = '') => `<svg class="op-svg ${cls}" viewBox="0 0 48 48" aria-hidden="true">${inner}</svg>`;
const twice = (d, color = CREAM, w = 11, w2 = 5) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${color}" stroke-width="${w2}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ROT = { right: 0, down: 90, left: 180, up: 270 };

function miniBoat(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M0 -10 Q8 -2 7 9 Q0 12 -7 9 Q-8 -2 0 -10Z" fill="${WOOD}"/>
    <circle cx="-5.2" cy="2" r="2.2" fill="#f0553f" stroke-width="1.2"/><circle cx="5.2" cy="2" r="2.2" fill="#45b565" stroke-width="1.2"/></g>`;
}

export function opIcon(op, extra = {}) {
  if (op in ROT) return icon(`<g transform="rotate(${ROT[op]} 24 24)">${twice('M8 24 H35 M25 13 L37 24 L25 35')}</g>`);
  if (op === 'fwd') return icon(`${twice('M24 34 V8 M14 17 L24 7 L34 17')}${miniBoat(24, 39, 0.75)}`);
  if (op === 'tl') return icon(`${twice('M30 40 V27 Q30 14 17 14 H9 M16 6 L8 14 L16 22', '#ff8a70')}${miniBoat(30, 40, 0.6)}`);
  if (op === 'tr') return icon(`${twice('M18 40 V27 Q18 14 31 14 H39 M32 6 L40 14 L32 22', '#7fdc93')}${miniBoat(18, 40, 0.6)}`);
  if (op === 'color') {
    const c = PAINT[extra.c || 0];
    return icon(`<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
      <path d="M10 18 H38 L35 42 H13Z" fill="#cfd4dc"/><ellipse cx="24" cy="18" rx="14" ry="5" fill="${c}"/>
      <path d="M17 18 Q16 28 19 30 Q22 28 21 19" fill="${c}"/><path d="M14 18 Q24 2 34 18" fill="none" stroke-width="2.5"/></g>`);
  }
  if (op === 'pen') {
    return icon(`<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path d="M8 42 H20 M26 42 H32 M38 42 H42" stroke-width="3.5" stroke-dasharray="1 0" opacity=".5"/>
      <rect x="21" y="4" width="8" height="18" rx="3" fill="${WOOD}" transform="rotate(20 25 13)"/>
      <path d="M18 22 L28 25 L24 34 Q18 36 16 30Z" fill="#cfd4dc" transform="rotate(20 22 28)"/>
      <path d="M37 8 V20 M32 13 L37 8 L42 13" fill="none" stroke-width="3"/></g>`);
  }
  if (op === 'look') {
    return icon(`<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
      <path d="M6 30 L32 14 L37 22 L11 38Z" fill="${GOLD}"/><path d="M14 25 L19 33 M22 20 L27 28" stroke="${GOLD2}" stroke-width="3"/>
      <ellipse cx="35" cy="18" rx="5" ry="6" transform="rotate(-32 35 18)" fill="#9fdcf0"/></g>`);
  }
  if (op === 'rock') return icon(`<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M8 34 Q6 20 18 14 Q26 8 34 14 Q42 22 40 34 Q24 40 8 34Z" fill="#8f8578"/><path d="M16 20 Q22 15 28 18" fill="none" stroke="#c4bcb0" stroke-width="3"/></g>`);
  if (op === 'coin') return icon(`<circle cx="24" cy="24" r="15" fill="${GOLD}" stroke="${INK}" stroke-width="3.5"/><circle cx="24" cy="24" r="9" fill="none" stroke="${GOLD2}" stroke-width="2.5"/>`);
  if (op === 'chest') return icon(`<g transform="translate(4 7) scale(0.2)" stroke="${INK}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round">${chestParts()}</g>`);
  if (op === 'ship') return icon(`<g transform="translate(24 26) scale(0.42)">${sideShip()}</g>`);
  if (op === 'erase') return icon(`<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M8 30 L24 12 L40 26 L26 42 H16Z" fill="#ffb3c4"/><path d="M16 22 L32 36" fill="none"/><path d="M8 44 H40" stroke-width="3.5"/></g>`);
  if (op === 'trash') return icon(`<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M12 15 H36 L33 42 H15Z" fill="#ffd9cf"/><path d="M9 15 H39 M19 15 V9 H29 V15 M20 22 V35 M28 22 V35" fill="none"/></g>`);
  return icon('');
}

/** Die Seilspirale des Strudels (im Vorrat). */
export const swirlSvg = () => `<svg class="swirl-svg" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M24 24 m0 -3 a3 3 0 1 1 -3 3 a7 7 0 1 1 7 7 a11 11 0 1 1 -11 -11 a15 15 0 1 1 15 15" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M24 24 m0 -3 a3 3 0 1 1 -3 3 a7 7 0 1 1 7 7 a11 11 0 1 1 -11 -11 a15 15 0 1 1 15 15" fill="none" stroke="#d9b37a" stroke-width="3" stroke-linecap="round"/></svg>`;

/** Kleines Tisch-Symbol für den Kartentisch-Knopf. */
export const tableSvg = () => `<svg class="table-svg" viewBox="0 0 64 56" aria-hidden="true">${g(`
  <path d="M8 26 L56 26 L52 34 H12Z" fill="${WOOD}"/><path d="M14 34 V52 M50 34 V52" stroke-width="5"/>
  <path d="M14 8 H46 L50 26 H12Z" fill="#fdf1cf" stroke-width="3"/><path d="M20 14 q6 6 12 2 t10 4" fill="none" stroke="${WOOD2}" stroke-width="2.5" stroke-dasharray="2 4"/>
  <path d="M38 12 l5 5 M43 12 l-5 5" stroke="#f0553f" stroke-width="3"/>`)}</svg>`;

/** Kompass-Medaille. */
export const medalSvg = () => `<svg class="medal-svg" viewBox="0 0 40 40" aria-hidden="true">${g(`
  <circle cx="20" cy="20" r="16.5" fill="${GOLD}" stroke-width="3"/><circle cx="20" cy="20" r="11.5" fill="#fdf1cf" stroke-width="2.5"/>
  <path d="M20 9 L24 20 L20 31 L16 20Z" fill="#fff" stroke-width="2.5"/><path d="M20 9 L24 20 H16Z" fill="#f0553f" stroke-width="2.5"/>
  <circle cx="20" cy="20" r="2.5" fill="${INK}" stroke="none"/>`)}</svg>`;
