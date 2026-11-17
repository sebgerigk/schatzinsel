// Bilder der Werft-Schätze, die nicht am Schiff hängen: Tiere und Wetter auf der Schatzkarte, Klänge.
// Jeweils ein Vorschaubild für den Laden (gleiches Format wie die Schiffsbilder) und die Teile für die Karte.
import { INK } from '../engine/util.js';
import { starPoints } from './icons.js';

const GOLD = '#ffcb3d', GOLD2 = '#e9a21f', BLUE = '#2f86d8';
const g = inner => `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
const card = (bg, inner) => `<svg class="ship-svg thumb-svg" viewBox="0 0 280 216" aria-hidden="true"><rect x="8" y="8" width="264" height="200" rx="26" fill="${bg}"/>${g(inner)}</svg>`;
const waves = `<path d="M8 160 Q60 146 112 160 T216 160 T272 156 V182 Q272 208 246 208 H34 Q8 208 8 182Z" fill="#49c4d8" stroke="none"/>
  <path d="M30 176 q12 -8 24 0 t24 0 M170 186 q12 -8 24 0 t24 0" fill="none" stroke="#fff" stroke-width="4"/>`;

export const dolphinShape = () => g(`<path d="M10 52 Q40 6 98 20 Q112 24 120 32 Q108 34 100 32 Q86 46 58 50 L50 66 L42 52 Q24 56 10 52Z" fill="#7ab8e6"/>
  <path d="M60 22 Q66 6 78 4 Q74 14 76 22Z" fill="#5d9fd6"/><path d="M12 52 Q2 44 0 36 Q8 42 14 44 Q12 34 16 28 Q18 42 20 50Z" fill="#5d9fd6"/>
  <path d="M30 46 Q64 44 96 30" fill="none" stroke="#d6ecfb" stroke-width="4"/><circle cx="96" cy="25" r="2.6" fill="${INK}" stroke="none"/>`);

export const whaleShape = () => g(`<path d="M8 60 Q4 18 60 14 Q120 10 150 36 Q164 26 176 14 Q178 34 170 44 Q178 52 186 64 Q164 60 156 56 Q140 76 80 78 Q20 80 8 60Z" fill="#4f7fc2"/>
  <path d="M14 62 Q60 74 140 58" fill="none" stroke="#a9c7ee" stroke-width="5"/><circle cx="36" cy="40" r="3.6" fill="${INK}" stroke="none"/>
  <path d="M22 54 Q30 58 38 54" fill="none" stroke-width="3"/>`);

export const spoutShape = () => g(`<path d="M0 30 Q-4 10 -18 4 M0 30 Q0 6 0 -4 M0 30 Q4 10 18 4" fill="none" stroke="#bfe9ff" stroke-width="6"/>`);

export function rainbowShape() {
  return `<svg class="map-rainbow-svg" viewBox="0 0 400 200" aria-hidden="true">${['#f0553f', '#ff9a3c', GOLD, '#45b565', BLUE, '#7c5cd6']
    .map((c, i) => `<path d="M${20 + i * 14} 200 A${180 - i * 14} ${180 - i * 14} 0 0 1 ${380 - i * 14} 200" fill="none" stroke="${c}" stroke-width="14"/>`).join('')}</svg>`;
}

export function burstShape(color) {
  return `<svg class="firework-svg" viewBox="-50 -50 100 100" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6;
    return `<line x1="${(Math.cos(a) * 12).toFixed(1)}" y1="${(Math.sin(a) * 12).toFixed(1)}" x2="${(Math.cos(a) * 40).toFixed(1)}" y2="${(Math.sin(a) * 40).toFixed(1)}" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`;
  }).join('')}<circle r="6" fill="#fff"/></svg>`;
}

const snowflake = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#fff" stroke-width="4"><path d="M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7" fill="none"/></g>`;

export const THUMBS = {
  delfin: () => card('#cdeffc', `${waves}<g transform="translate(70 70) rotate(-12)">${dolphinShape()}</g>`),
  wal: () => card('#cdeffc', `${waves}<g transform="translate(46 96)">${whaleShape()}</g><g transform="translate(86 90)">${spoutShape()}</g>`),
  regenbogen: () => card('#cdeffc', `<g transform="translate(40 40) scale(0.5)">${rainbowShape().replace(/<\/?svg[^>]*>/g, '')}</g>
    <circle cx="226" cy="58" r="20" fill="#ffd23f"/>${waves}`),
  schnee: () => card('#9cc8e8', `${waves}${[[60, 50, 1], [140, 34, 0.8], [210, 70, 1.1], [100, 110, 0.7], [190, 126, 0.8], [40, 120, 0.6]].map(([x, y, s]) => snowflake(x, y, s)).join('')}`),
  feuerwerk: () => card('#2b2f63', `${[[80, 70, '#f0553f'], [180, 56, GOLD], [140, 120, '#45b565']].map(([x, y, c]) => `<g transform="translate(${x} ${y}) scale(0.9)" stroke="none">${burstShape(c).replace(/<\/?svg[^>]*>/g, '')}</g>`).join('')}`),
  nacht: () => card('#2b2f63', `<circle cx="206" cy="58" r="26" fill="#ffe9a8"/><circle cx="218" cy="50" r="22" fill="#2b2f63" stroke="none"/>
    ${[[50, 40], [96, 70], [140, 34], [70, 110], [240, 110]].map(([x, y]) => `<polygon points="${starPoints(x, y, 7, 3)}" fill="#fff" stroke="none"/>`).join('')}
    <path d="M8 168 Q140 140 272 168 V182 Q272 208 246 208 H34 Q8 208 8 182Z" fill="#1d4f7a" stroke="none"/>
    <path d="M110 160 L118 104 H138 L146 160Z" fill="#fff"/><path d="M114 132 H142" stroke="#f0553f" stroke-width="7"/>
    <path d="M138 108 L200 88 L200 128Z" fill="#fff6b0" stroke="none" opacity=".7"/><rect x="116" y="92" width="24" height="14" rx="3" fill="#ffe07a"/>`),
  glocke: () => card('#fdf1cf', `<path d="M140 30 V48" stroke-width="6"/><path d="M100 140 Q100 60 140 50 Q180 60 180 140 Z" fill="${GOLD}"/>
    <path d="M90 140 H190" stroke-width="10"/><path d="M90 140 H190" stroke="${GOLD2}" stroke-width="5"/><circle cx="140" cy="158" r="10" fill="${GOLD2}"/>
    <path d="M200 80 q14 14 0 30 M214 70 q24 24 0 50" fill="none" stroke-width="5"/>`),
  nebelhorn: () => card('#fdf1cf', `<path d="M60 96 H120 L200 60 V156 L120 120 H60Z" fill="#c5ccd6"/><rect x="40" y="92" width="24" height="32" rx="6" fill="#f0553f"/>
    <path d="M216 88 q16 20 0 40 M230 76 q28 32 0 64" fill="none" stroke-width="5"/>`),
  shanty: () => card('#fdf1cf', `<path d="M110 150 V64 L190 48 V134" fill="none" stroke-width="7"/><path d="M110 64 L190 48 V64 L110 80Z" fill="${INK}"/>
    <ellipse cx="96" cy="152" rx="18" ry="13" fill="${BLUE}"/><ellipse cx="176" cy="136" rx="18" ry="13" fill="${BLUE}"/>
    <path d="M40 70 Q50 60 60 70 T80 70" fill="none" stroke="${GOLD2}" stroke-width="4"/>`),
};
