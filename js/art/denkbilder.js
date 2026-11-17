// Bilder für die Denkspiele: Bildfolgen (Was kommt zuerst?), Muster-Dinge, Schatzsäcke und Waage.
import { INK } from '../engine/util.js';
import { chestParts, palm } from './world.js';
import { starPoints } from './icons.js';

const SAND = '#f8dc8e', SAND2 = '#e9bf62', WOOD = '#b0703f', WOOD2 = '#8a5530', GOLD = '#ffcb3d', GOLD2 = '#e9a21f';
const CORAL = '#f0553f', BLUE = '#2f86d8', GREEN = '#45b565', PARCH = '#fdf1cf';
const pic = inner => `<svg class="seq-svg" viewBox="0 0 120 100" aria-hidden="true"><g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
const sea = `<path d="M0 78 Q30 72 60 78 T120 78 V100 H0Z" fill="#7ad9e6" stroke="none"/><path d="M8 86 q8 -5 16 0 M70 90 q8 -5 16 0" fill="none" stroke="#fff" stroke-width="3"/>`;
const beach = `<path d="M0 80 Q60 70 120 80 V100 H0Z" fill="${SAND}"/>`;

// ---------- Bildfolgen ----------
const hull = `<path d="M18 62 H102 Q98 84 82 88 H38 Q22 84 18 62Z" fill="${WOOD}"/><path d="M16 62 H104" stroke-width="6"/>`;
const mast = `<rect x="57" y="14" width="6" height="48" rx="2" fill="${WOOD2}"/>`;
const sail = `<path d="M34 20 Q60 26 86 20 Q90 38 86 56 Q60 50 34 56 Q30 38 34 20Z" fill="#fff7e2"/><path d="M33 32 Q60 38 87 32 M32 44 Q60 49 88 44" stroke="${CORAL}" stroke-width="5" fill="none"/><path d="M34 20 Q60 26 86 20 Q90 38 86 56 Q60 50 34 56 Q30 38 34 20Z" fill="none"/>`;
const flag = `<path d="M63 14 Q72 8 82 15 Q72 20 63 23Z" fill="${CORAL}"/>`;

const nest = `<path d="M30 74 Q60 96 90 74 Q86 64 60 66 Q34 64 30 74Z" fill="${WOOD}"/><path d="M36 76 q8 6 16 2 M60 80 q10 2 20 -4" stroke="${WOOD2}" stroke-width="2.5" fill="none"/>`;
const egg = `<ellipse cx="60" cy="56" rx="16" ry="21" fill="#fff7e2"/><circle cx="54" cy="50" r="3" fill="#e2d4b4" stroke="none"/><circle cx="66" cy="60" r="2.5" fill="#e2d4b4" stroke="none"/>`;
const crack = `<path d="M46 54 L52 48 L56 56 L62 47 L67 55 L74 50" fill="none" stroke-width="3"/>`;
const chick = `<circle cx="60" cy="52" r="17" fill="${GOLD}"/><circle cx="54" cy="48" r="2.6" fill="${INK}" stroke="none"/><circle cx="66" cy="48" r="2.6" fill="${INK}" stroke="none"/><path d="M56 55 L64 55 L60 61Z" fill="#f08a2c" stroke-width="2.5"/><path d="M52 36 q4 -6 8 0 q4 -6 8 0" fill="none" stroke-width="3"/>`;

const cloud = (x, y, s = 1, fill = '#fff') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 20 Q-10 20 -8 10 Q-6 2 4 4 Q8 -8 22 -4 Q32 -12 42 -2 Q56 -2 54 10 Q60 20 50 20Z" fill="${fill}"/>`;
const sun = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd23f"/><path d="M${x} ${y - r - 6} v-6 M${x} ${y + r + 6} v6 M${x - r - 6} ${y} h-6 M${x + r + 6} ${y} h6" stroke="#f5a623" stroke-width="3.5"/>`;
const sky = `<rect x="0" y="0" width="120" height="100" fill="#cdeffc" stroke="none"/>`;

const banana = (peeled) => {
  const fruit = `<path d="M30 70 Q40 40 82 30 Q90 30 88 36 Q52 48 44 74 Q36 80 30 70Z" fill="#ffe27a"/>`;
  const peel1 = `<path d="M30 70 Q40 52 62 42 Q50 60 44 74 Q36 80 30 70Z" fill="#ffd23f"/><path d="M62 42 Q72 50 70 64 Q62 54 56 50Z" fill="#ffd23f"/><path d="M52 50 Q44 58 40 72" stroke="${GOLD2}" stroke-width="2.5" fill="none"/>`;
  const fruitHalf = `<path d="M58 44 Q70 34 82 30 Q90 30 88 36 Q74 42 64 52Z" fill="#fff4c4"/>`;
  if (peeled === 0) return `${fruit}<path d="M44 66 Q56 46 80 36" stroke="${GOLD2}" stroke-width="2.5" fill="none"/><path d="M86 31 l6 -4" stroke-width="4"/>`;
  if (peeled === 1) return `${fruitHalf}${peel1}<path d="M86 31 l6 -4" stroke-width="4"/>`;
  return `<path d="M26 76 Q36 62 54 58 Q46 70 44 80 Q34 84 26 76Z" fill="#ffd23f"/><path d="M54 58 Q70 60 74 76 Q62 70 50 70Z" fill="#ffd23f"/><path d="M54 58 Q58 74 52 84 Q46 76 48 64Z" fill="#f5c32a"/>`;
};

const castle = n => {
  let s = beach;
  if (n === 0) return s + `<path d="M30 82 Q40 50 60 48 Q80 50 90 82Z" fill="${SAND2}"/>`;
  s += `<path d="M24 82 H96" fill="none"/>`;
  if (n >= 1) s += `<rect x="50" y="40" width="22" height="42" fill="${SAND2}"/><path d="M50 40 v-6 h6 v6 M58 40 v-6 h6 v6 M66 40 v-6 h6 v6" fill="${SAND2}"/>`;
  if (n >= 2) s += `<rect x="26" y="56" width="18" height="26" fill="${SAND2}"/><rect x="78" y="56" width="18" height="26" fill="${SAND2}"/><rect x="44" y="64" width="34" height="18" fill="${SAND2}"/><path d="M55 82 v-10 q6 -6 12 0 v10" fill="${WOOD2}"/>`;
  if (n >= 3) s += `<path d="M61 34 V14" stroke-width="3"/><path d="M61 14 L76 19 L61 24Z" fill="${CORAL}"/>`;
  return s;
};

const coconut = `<circle cx="60" cy="72" r="12" fill="${WOOD2}"/><circle cx="56" cy="68" r="2" fill="${INK}" stroke="none"/><circle cx="63" cy="67" r="2" fill="${INK}" stroke="none"/>`;
const sprout = `<path d="M60 64 V44" stroke="#2c8f4b" stroke-width="4"/><path d="M60 46 Q46 36 40 44 Q50 48 60 46Z M60 46 Q74 36 80 44 Q70 48 60 46Z" fill="${GREEN}"/>`;

const fishShape = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 L-24 -8 V8Z" fill="#f08a2c"/><path d="M-14 0 Q0 -12 16 0 Q0 12 -14 0Z" fill="#ff9f43"/><circle cx="8" cy="-2" r="2" fill="${INK}" stroke="none"/></g>`;
const rod = `<path d="M14 18 L52 34" stroke="${WOOD2}" stroke-width="5"/><path d="M14 18 L52 34" stroke="${WOOD}" stroke-width="2.5"/>`;
const bucket = `<path d="M70 62 H104 L100 92 H74Z" fill="#cfd4dc"/><path d="M70 62 Q87 48 104 62" fill="none" stroke-width="2.5"/>`;

export const SEQUENCES = [
  { id: 'schiff', frames: [hull, hull + mast, hull + mast + sail, hull + mast + sail + flag].map(f => pic(sea + f)) },
  { id: 'sandburg', frames: [0, 1, 2, 3].map(n => pic(castle(n))) },
  { id: 'truhe', frames: [
    pic(`${beach}<path d="M40 70 L80 86 M80 70 L40 86" stroke="${CORAL}" stroke-width="6"/>`),
    pic(`${beach}<ellipse cx="60" cy="84" rx="40" ry="10" fill="${SAND2}"/><g transform="translate(26 36) scale(0.34)" stroke-width="10">${chestParts()}</g>`),
    pic(`${beach}<ellipse cx="60" cy="84" rx="40" ry="10" fill="${SAND2}"/><g class="open" transform="translate(26 36) scale(0.34)" stroke-width="10">${chestParts()}</g>`),
  ] },
  { id: 'banane', frames: [0, 1, 2].map(n => pic(banana(n))) },
  { id: 'palme', frames: [pic(beach + coconut), pic(beach + coconut + sprout), pic(beach + `<g>${palm(60, 84, 0.45)}</g>`)] },
  { id: 'ei', frames: [pic(nest + egg), pic(nest + egg + crack), pic(nest + chick)] },
  { id: 'wetter', frames: [
    pic(sky + cloud(30, 20, 1.2, '#cfd8e2') + `<path d="M36 52 l-4 10 M52 52 l-4 10 M68 52 l-4 10 M84 52 l-4 10" stroke="${BLUE}" stroke-width="4"/>`),
    pic(sky + sun(84, 34) + cloud(20, 36, 1.1)),
    pic(sky + sun(96, 22, 11) + ['#f0553f', '#ffcb3d', '#45b565', '#2f86d8'].map((c, i) => `<path d="M${14 + i * 7} 92 A${46 - i * 7} ${46 - i * 7} 0 0 1 ${106 - i * 7} 92" fill="none" stroke="${c}" stroke-width="7"/>`).join('')),
  ] },
  { id: 'angeln', frames: [
    pic(sea + rod + `<path d="M52 34 V80" stroke-width="1.8"/>`),
    pic(sea + rod + `<path d="M52 34 V62" stroke-width="1.8"/>` + `<g transform="rotate(-80 52 70)">${fishShape(52, 70)}</g>`),
    pic(beach + bucket + fishShape(87, 60, 0.8) + `<path d="M14 18 L40 60" stroke="${WOOD2}" stroke-width="5"/>`),
  ] },
];

// ---------- Muster-Dinge ----------
const thing = inner => `<svg class="thing-svg" viewBox="0 0 60 60" aria-hidden="true"><g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
const buoy = c => thing(`<path d="M16 48 L22 18 H38 L44 48Z" fill="${c}"/><path d="M19 34 H41" stroke="#fff" stroke-width="6"/><path d="M19 34 H41" fill="none" stroke-width="0"/>
  <path d="M30 18 V8" stroke-width="3"/><circle cx="30" cy="7" r="4" fill="${GOLD}"/><path d="M8 50 q11 -6 22 0 t22 0" fill="none" stroke="#2f86d8" stroke-width="3.5"/>`);

export const THINGS = {
  rot: { svg: buoy(CORAL), say: 'w_rot' },
  blau: { svg: buoy(BLUE), say: 'w_blau' },
  gelb: { svg: buoy(GOLD), say: 'w_gelb' },
  gruen: { svg: buoy(GREEN), say: 'w_gruen' },
  muschel: { svg: thing(`<path d="M30 50 L10 24 Q30 2 50 24Z" fill="#ffc2d1"/><path d="M30 50 L20 16 M30 50 V10 M30 50 L40 16" fill="none" stroke-width="2.5"/><path d="M24 50 H36 L30 56Z" fill="#ffc2d1"/>`), say: 'w_muschel' },
  stern: { svg: thing(`<polygon points="${starPoints(30, 32, 24, 10)}" fill="#ff8a66"/><circle cx="26" cy="30" r="2" fill="${INK}" stroke="none"/><circle cx="34" cy="30" r="2" fill="${INK}" stroke="none"/>`), say: 'w_seestern' },
  fisch: { svg: thing(fishShape(32, 30, 1.25)), say: 'w_fisch' },
};

// ---------- Schatzsäcke und Waage ----------
export const SACK_COLORS = ['#f0553f', '#2f86d8', '#45b565', '#7c5cd6'];
const SACK_SIGNS = [
  c => `<polygon points="${starPoints(0, 2, 9, 4)}" fill="${c}" stroke-width="2.5"/>`,
  c => `<circle cx="0" cy="2" r="8" fill="${c}" stroke-width="2.5"/>`,
  c => `<path d="M-8 9 L0 -7 L8 9Z" fill="${c}" stroke-width="2.5"/>`,
  c => `<path d="M0 -7 Q9 -7 9 2 Q9 10 0 10 Q-9 10 -9 2 Q-9 -7 0 -7Z M0 -1 L0 5" fill="${c}" stroke-width="2.5"/>`,
];

/** Ein Leinensack mit farbigem Zeichen. size 0.7 … 1.15 (zum Sehen, wer schwerer ist). */
export function sackSvg(i, size = 1) {
  const c = SACK_COLORS[i];
  return `<svg class="sack-svg" viewBox="-40 -48 80 96" aria-hidden="true"><g transform="scale(${size}) translate(0 ${(1 - size) * 30})" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M-10 -26 Q-30 -10 -30 16 Q-30 40 0 40 Q30 40 30 16 Q30 -10 10 -26Z" fill="#e8cf9c"/>
    <path d="M-12 -26 Q0 -34 12 -26 L14 -36 Q0 -42 -14 -36Z" fill="#d9b37a"/><path d="M-12 -27 H12" stroke="${GOLD2}" stroke-width="5"/>
    <g transform="translate(0 12)">${SACK_SIGNS[i](c)}</g></g></svg>`;
}

/** Die Waage. tilt: -1 links schwerer, 1 rechts schwerer, 0 gleich / leer. */
export function scaleSvg() {
  return `<svg class="scale-svg" viewBox="0 0 300 170" aria-hidden="true"><g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M120 164 H180 L170 150 H130Z" fill="${WOOD}"/><rect x="144" y="40" width="12" height="112" rx="4" fill="${WOOD2}"/>
    <g class="scale-beam">
      <rect x="40" y="34" width="220" height="12" rx="6" fill="${WOOD}"/><circle cx="150" cy="40" r="9" fill="${GOLD}"/>
      <g class="pan pan-l"><path d="M60 46 L40 96 M60 46 L80 96" fill="none" stroke-width="3"/><path d="M28 96 H92 Q86 112 60 112 Q34 112 28 96Z" fill="#cfd4dc"/><g class="pan-load" transform="translate(60 84)"></g></g>
      <g class="pan pan-r"><path d="M240 46 L220 96 M240 46 L260 96" fill="none" stroke-width="3"/><path d="M208 96 H272 Q266 112 240 112 Q214 112 208 96Z" fill="#cfd4dc"/><g class="pan-load" transform="translate(240 84)"></g></g>
    </g></g></svg>`;
}

/** Feder (leicht) und Anker (schwer) an den Enden des Regals. */
export const featherSvg = () => `<svg class="end-svg" viewBox="0 0 40 40" aria-hidden="true"><g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M8 34 Q10 14 30 6 Q32 22 14 30Z" fill="#fff"/><path d="M8 34 L24 14" fill="none"/></g></svg>`;
export const anchorSvg = () => `<svg class="end-svg" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round">
  <path d="M20 8 V34 M12 15 H28 M8 26 Q10 36 20 36 Q30 36 32 26"/></g><circle cx="20" cy="7" r="4" fill="none" stroke="${INK}" stroke-width="3"/></svg>`;
export { PARCH };
