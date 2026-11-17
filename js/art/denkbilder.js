// Bilder für die Denkspiele: Muster-Dinge, Schatzsäcke und Waage.
// Die Bildfolgen für „Was kommt zuerst?" stehen in bildfolgen.js.
import { INK } from '../engine/util.js';
import { starPoints } from './icons.js';

const WOOD = '#b0703f', WOOD2 = '#8a5530', GOLD = '#ffcb3d', GOLD2 = '#e9a21f';
const CORAL = '#f0553f', BLUE = '#2f86d8', GREEN = '#45b565', PARCH = '#fdf1cf';

const fishShape = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 L-24 -8 V8Z" fill="#f08a2c"/><path d="M-14 0 Q0 -12 16 0 Q0 12 -14 0Z" fill="#ff9f43"/><circle cx="8" cy="-2" r="2" fill="${INK}" stroke="none"/></g>`;

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
