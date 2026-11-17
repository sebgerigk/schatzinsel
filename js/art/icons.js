// Kleine Symbole für Knöpfe. Farbe kommt über currentColor aus dem CSS.
import { INK } from '../engine/util.js';

const wrap = inner => `<svg class="icon" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;

export const ICON = {
  back: wrap('<path d="M27 10 L13 24 L27 38"/><path d="M14 24 H38"/>'),
  check: wrap('<path d="M9 26 L20 37 L39 12"/>'),
  cross: wrap('<path d="M12 12 L36 36 M36 12 L12 36"/>'),
  del: wrap('<path d="M19 11 H41 V37 H19 L6 24Z" stroke-width="5"/><path d="M25 19 L34 29 M34 19 L25 29" stroke-width="4.5"/>'),
  lock: wrap('<path d="M16 22 V16 a8 8 0 0 1 16 0 V22" stroke-width="5"/><rect x="10" y="22" width="28" height="20" rx="5" fill="currentColor" stroke-width="3"/>'),
  play: wrap('<path d="M17 10 L38 24 L17 38Z" fill="currentColor"/>'),
  bulb: wrap('<path d="M24 6 a12 12 0 0 1 7 21.6 V32 H17 v-4.4 A12 12 0 0 1 24 6Z" stroke-width="4.5"/><path d="M19 40 h10" stroke-width="5"/>'),
  gear: wrap('<circle cx="24" cy="24" r="12" stroke-width="5"/><circle cx="24" cy="24" r="4" fill="currentColor" stroke-width="2"/><path d="M24 5 v6 M24 37 v6 M5 24 h6 M37 24 h6 M10.6 10.6 l4.2 4.2 M33.2 33.2 l4.2 4.2 M10.6 37.4 l4.2 -4.2 M33.2 14.8 l4.2 -4.2" stroke-width="5.5"/>'),
  sound: wrap('<path d="M7 19 h8 l11 -9 v28 l-11 -9 h-8Z" fill="currentColor" stroke-width="4"/><path d="M33 17 q6 7 0 14 M38 11 q11 13 0 26" stroke-width="4.5"/>'),
  again: wrap('<path d="M38 24 a14 14 0 1 1 -5 -10.8" stroke-width="5.5"/><path d="M35 4 V14 H25" stroke-width="5.5"/>'),
};

export function starPoints(cx, cy, R, r, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + i * Math.PI / n;
    pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
  }
  return pts.join(' ');
}

export const coinSvg = () => `<svg class="coin-svg" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="17" fill="#ffcb3d" stroke="${INK}" stroke-width="3.5"/>
  <circle cx="20" cy="20" r="11.5" fill="none" stroke="#e9a21f" stroke-width="2.5"/>
  <polygon points="${starPoints(20, 20.5, 7.5, 3.3)}" fill="#e9a21f"/>
  <path d="M10 14 Q13 9 19 8" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
</svg>`;

export const starSvg = (on = true) => `<svg class="star-svg ${on ? 'on' : 'off'}" viewBox="0 0 40 40" aria-hidden="true">
  <polygon points="${starPoints(20, 21.5, 17, 7.6)}" fill="${on ? '#ffcb3d' : '#e8dcc0'}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
</svg>`;
