// Die Piratenwelt: Schiff, Inseln, Palmen, Schatztruhe, Kompass, Strand-Szene.
import { INK } from '../engine/util.js';
import { starPoints } from './icons.js';

const SAND = '#f8dc8e', SAND2 = '#e9bf62';
const G1 = '#45b565', G2 = '#2c8f4b', G3 = '#5fcc7c';
const WOOD = '#b0703f', WOOD2 = '#8a5530';
const GOLD = '#ffcb3d', GOLD2 = '#e9a21f', CORAL = '#f0553f', PARCH = '#fdf1cf';
let uid = 0;

const group = inner => `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;

export function palm(x, y, s = 1, flip = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s * flip} ${s})" stroke="${INK}" stroke-width="${(4 / s).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">
    <path d="M0 0 Q-16 -46 6 -94" fill="none" stroke-width="${(4 / s + 13).toFixed(2)}"/>
    <path d="M0 0 Q-16 -46 6 -94" fill="none" stroke="${WOOD}" stroke-width="13"/>
    <path d="M-12 -24 l13 -3 M-12 -46 l13 -1 M-8 -68 l13 2" stroke="${WOOD2}" stroke-width="3" fill="none"/>
    <g class="palm-leaves">
      <path d="M6 -94 Q-42 -98 -62 -56 Q-32 -84 6 -94Z" fill="${G2}"/>
      <path d="M6 -94 Q54 -98 74 -56 Q44 -84 6 -94Z" fill="${G2}"/>
      <path d="M6 -94 Q-36 -134 -74 -98 Q-38 -106 6 -94Z" fill="${G1}"/>
      <path d="M6 -94 Q48 -134 86 -98 Q50 -106 6 -94Z" fill="${G1}"/>
      <path d="M6 -94 Q2 -142 30 -154 Q24 -120 6 -94Z" fill="${G3}"/>
      <circle cx="-1" cy="-89" r="7.5" fill="${WOOD2}"/>
      <circle cx="13" cy="-87" r="7.5" fill="${WOOD2}"/>
    </g>
  </g>`;
}

// ---------- Das Schiff des Kindes: Segel, Flagge, Rumpf, Bug und Extras sind austauschbar ----------
const RAINBOW = ['#f0553f', '#ffcb3d', '#45b565', '#2f86d8', '#7c5cd6'];
const NIGHT = '#2f2a3d';
const SAILS = {
  rot: { base: '#fff7e2', stripe: CORAL },
  blau: { base: '#fff7e2', stripe: '#2f86d8' },
  sonne: { base: '#ffe58a', emblem: 'sonne' },
  regenbogen: { rainbow: true },
  pirat: { base: NIGHT, emblem: 'stern' },
  gold: { base: GOLD, stripe: GOLD2, emblem: 'stern' },
};
const FLAGS = { rot: CORAL, blau: '#2f86d8', gruen: G1, regenbogen: 'rainbow', stern: NIGHT };
const HULLS = {
  holz: { fill: WOOD, line: WOOD2, rail: GOLD },
  dunkel: { fill: '#7b4a2a', line: '#58321a', rail: GOLD },
  rot: { fill: '#d8453a', line: '#fff7e2', rail: '#fff7e2' },
  blau: { fill: '#2f6fb8', line: '#fff7e2', rail: GOLD },
  koenig: { fill: '#3a2f5b', line: GOLD, rail: GOLD },
};
export const DEFAULT_SHIP = { segel: 'rot', flagge: 'rot', rumpf: 'holz', figur: 'keine', extras: [] };

const rainbowGradient = id => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${RAINBOW.map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/><stop offset="${(i + 1) / 5}" stop-color="${c}"/>`).join('')}</linearGradient>`;

const SHIP_EXTRAS = {
  ausguck: () => `<path d="M115 36 H151 L147 49 H119Z" fill="${WOOD}"/><path d="M119 42 H147" stroke="${WOOD2}" stroke-width="2.5"/>`,
  laterne: () => `<path d="M44 150 V126"/><circle cx="44" cy="118" r="14" fill="#fff3a8" stroke="none" opacity=".6"/>
    <rect x="37" y="110" width="14" height="17" rx="3" fill="#ffe07a" stroke-width="3"/><path d="M36 110 L44 102 L52 110Z" fill="${WOOD2}" stroke-width="3"/>`,
  wimpel: () => `<path d="M134 24 Q200 70 258 138" fill="none" stroke-width="2.5"/>
    ${[[160, 43], [185.5, 64], [210, 87], [234.5, 112]].map(([x, y], i) => `<path d="M${x - 7} ${y - 3} L${x + 7} ${y + 3} L${x - 2} ${y + 15}Z" fill="${RAINBOW[i]}" stroke-width="2.5"/>`).join('')}`,
  anker: () => `<path d="M214 160 V187 M206 169 H222 M203 180 Q205 191 214 191 Q223 191 225 180" fill="none" stroke-width="7"/>
    <path d="M214 160 V187 M206 169 H222 M203 180 Q205 191 214 191 Q223 191 225 180" fill="none" stroke="#c5ccd6" stroke-width="3"/>`,
  schatz: () => `<path d="M188 138 Q188 124 201 124 Q214 124 214 138Z" fill="#b97a45" stroke-width="3"/>
    <rect x="188" y="136" width="26" height="14" rx="2" fill="#a3642f" stroke-width="3"/><rect x="197.5" y="132" width="7" height="8" rx="1.5" fill="${GOLD}" stroke-width="2"/>`,
  koko: () => `<g transform="translate(84 124)" stroke-width="2.5">
    <ellipse cx="0" cy="15" rx="9.5" ry="12" fill="#ea4630"/><path d="M-9 12 Q-17 20 -11 28Z" fill="#2f86d8"/>
    <circle cx="0" cy="0" r="10" fill="#ea4630"/>
    <circle cx="-3.5" cy="-1" r="2" fill="${INK}" stroke="none"/><circle cx="3.5" cy="-1" r="2" fill="${INK}" stroke="none"/>
    <path d="M-3.5 3 Q0 10 3.5 3Z" fill="${GOLD}" stroke-width="2"/>
    <path d="M-11 -5 Q0 -19 11 -5 Q0 -9 -11 -5Z" fill="${NIGHT}"/></g>`,
};
const SHIP_FIGURES = {
  keine: () => '',
  stern: () => `<polygon points="${starPoints(263, 134, 12, 5.2)}" fill="${GOLD}" stroke-width="3"/>`,
  fisch: () => `<path d="M236 160 L227 153 V167Z" fill="#f08a2c" stroke-width="3"/>
    <path d="M236 160 Q250 148 266 160 Q250 172 236 160Z" fill="#ff9f43" stroke-width="3"/><circle cx="257" cy="158" r="1.8" fill="${INK}" stroke="none"/>`,
};

export function shipSvg(cfg) {
  const c = { ...DEFAULT_SHIP, ...(cfg || {}) };
  const sailStyle = SAILS[c.segel] || SAILS.rot;
  const hull = HULLS[c.rumpf] || HULLS.holz;
  const flag = FLAGS[c.flagge] || FLAGS.rot;
  const extras = c.extras || [];
  const n = ++uid;
  const sail = 'M72 50 Q133 64 194 50 Q204 94 194 134 Q133 122 72 134 Q62 94 72 50Z';
  const stripes = sailStyle.stripe ? `<g clip-path="url(#sail${n})" stroke="none" fill="${sailStyle.stripe}">
      <path d="M60 70 Q133 82 206 70 V85 Q133 97 60 85Z"/><path d="M60 100 Q133 110 206 100 V115 Q133 123 60 115Z"/></g>` : '';
  const emblem = sailStyle.emblem === 'stern' ? `<polygon points="${starPoints(133, 93, 21, 9)}" fill="${sailStyle.stripe ? '#fff7e2' : GOLD}" stroke-width="3"/>`
    : sailStyle.emblem === 'sonne' ? `<circle cx="133" cy="93" r="16" fill="#f5a623" stroke-width="3"/>` : '';
  return `<svg class="ship-svg" viewBox="0 0 280 216" aria-hidden="true">
  <defs><clipPath id="sail${n}"><path d="${sail}"/></clipPath>${rainbowGradient('rb' + n)}</defs>
  ${group(`
    <rect x="128" y="16" width="10" height="142" rx="4" fill="${WOOD2}"/>
    ${extras.includes('ausguck') ? SHIP_EXTRAS.ausguck() : ''}
    <path class="ship-flag" d="M138 18 Q157 7 178 20 Q158 31 138 37Z" fill="${flag === 'rainbow' ? `url(#rb${n})` : flag}"/>
    ${c.flagge === 'stern' ? `<polygon points="${starPoints(154, 22, 6, 2.6)}" fill="${GOLD}" stroke="none"/>` : ''}
    <path d="${sail}" fill="${sailStyle.rainbow ? `url(#rb${n})` : sailStyle.base}"/>
    ${stripes}${emblem}
    <path d="${sail}" fill="none"/>
    <path d="M236 150 L262 136"/>
    <path d="M30 150 H236 Q230 196 198 206 H74 Q42 196 30 150Z" fill="${hull.fill}"/>
    <path d="M38 170 H228" stroke="${hull.line}" stroke-width="4"/>
    <path d="M26 150 H240" stroke-width="11"/>
    <path d="M26 150 H240" stroke="${hull.rail}" stroke-width="4.5"/>
    <g fill="#9fdcf0"><circle cx="92" cy="187" r="8"/><circle cx="134" cy="187" r="8"/><circle cx="176" cy="187" r="8"/></g>
    ${(SHIP_FIGURES[c.figur] || SHIP_FIGURES.keine)()}
    ${['laterne', 'wimpel', 'anker', 'schatz', 'koko'].filter(e => extras.includes(e)).map(e => SHIP_EXTRAS[e]()).join('')}
  `)}
  </svg>`;
}

function chestParts() {
  return `
    <ellipse class="chest-glow" cx="100" cy="80" rx="84" ry="50" fill="#fff3a8" stroke="none"/>
    <g class="chest-gold">
      <path d="M38 98 Q100 40 162 98Z" fill="${GOLD}"/>
      <circle cx="76" cy="82" r="10" fill="#ffe07a"/>
      <circle cx="104" cy="70" r="10" fill="#ffe07a"/>
      <circle cx="128" cy="84" r="10" fill="#ffe07a"/>
    </g>
    <g class="chest-lid">
      <path d="M30 94 Q30 44 100 44 Q170 44 170 94Z" fill="#b97a45"/>
      <g stroke-linecap="butt"><path d="M62 54 V94 M138 54 V94" stroke-width="16"/><path d="M62 56 V94 M138 56 V94" stroke="${GOLD}" stroke-width="8"/></g>
      <path d="M30 94 H170" />
    </g>
    <rect x="30" y="94" width="140" height="62" rx="7" fill="#a3642f"/>
    <g stroke-linecap="butt"><path d="M62 94 V156 M138 94 V156" stroke-width="16"/><path d="M62 96 V154 M138 96 V154" stroke="${GOLD}" stroke-width="8"/></g>
    <rect x="87" y="84" width="26" height="30" rx="6" fill="${GOLD}"/>
    <circle cx="100" cy="96" r="4" fill="${INK}" stroke="none"/>
    <path d="M100 97 V106" stroke-width="4"/>`;
}

export function chestSvg() {
  return `<svg class="chest-svg" viewBox="0 0 200 170" aria-hidden="true">${group(chestParts())}</svg>`;
}

const coin = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}"/><circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="none" stroke="${GOLD2}" stroke-width="2.5"/>`;

function islandBase() {
  return `
    <ellipse cx="170" cy="226" rx="166" ry="46" fill="#e2f8fb" stroke="none" opacity=".75"/>
    <ellipse cx="170" cy="224" rx="152" ry="38" fill="#8fe3ec" stroke="none"/>
    <path d="M34 216 Q28 178 96 166 Q170 142 244 166 Q312 178 306 216 Q300 242 170 244 Q40 242 34 216Z" fill="${SAND}"/>
    <path d="M50 226 Q170 252 290 226 Q276 238 170 240 Q64 238 50 226Z" fill="${SAND2}" stroke="none"/>
    <path d="M92 186 q8 -4 16 0 M226 204 q8 -4 16 0 M150 214 q8 -4 16 0" stroke="${SAND2}" stroke-width="3" fill="none"/>`;
}

const ISLAND_ART = {
  lesen: () => `
    ${palm(262, 190, 0.82)}
    <path class="beam" d="M174 50 L300 14 L300 86Z" fill="#fff6b0" stroke="none"/>
    <path class="beam" d="M140 50 L14 14 L14 86Z" fill="#fff6b0" stroke="none"/>
    <path d="M124 186 L136 70 H178 L190 186Z" fill="#fff"/>
    <path d="M134.2 92 H179.8 L181.8 114 H132.2Z" fill="${CORAL}" stroke="none"/>
    <path d="M130 136 H184 L186.2 158 H127.8Z" fill="${CORAL}" stroke="none"/>
    <path d="M124 186 L136 70 H178 L190 186Z" fill="none"/>
    <path d="M148 186 V164 Q157 152 166 164 V186Z" fill="${WOOD2}"/>
    <rect x="128" y="60" width="58" height="11" rx="4" fill="#5b4636"/>
    <rect x="140" y="34" width="34" height="26" rx="3" fill="#ffe07a"/>
    <path d="M157 34 V60" stroke-width="3"/>
    <path d="M132 36 L157 10 L182 36Z" fill="${CORAL}"/>
    <g transform="translate(74 198)">
      <path d="M-34 -6 H34 V22 H-34Z" fill="#2f86d8"/>
      <path d="M0 -10 Q-16 -18 -30 -12 V16 Q-16 10 0 18Z" fill="#fff"/>
      <path d="M0 -10 Q16 -18 30 -12 V16 Q16 10 0 18Z" fill="#fff"/>
      <path d="M-24 -4 Q-14 -8 -6 -4 M-24 4 Q-14 0 -6 4 M6 -4 Q14 -8 24 -4 M6 4 Q14 0 24 4" stroke="#9aa7b5" stroke-width="2.5" fill="none"/>
    </g>`,
  schreiben: () => `
    ${palm(82, 190, 0.82, -1)}
    <path d="M150 214 q10 -12 20 0 t20 0 t20 0" fill="none" stroke="${WOOD2}" stroke-width="5"/>
    <g transform="rotate(-24 150 212)">
      <path d="M132 176 H168 L150 214Z" fill="#f6dcae"/>
      <path d="M143 199 H157 L150 214Z" fill="${INK}"/>
      <rect x="132" y="64" width="36" height="112" fill="${GOLD}"/>
      <path d="M144 64 V176 M156 64 V176" stroke="${GOLD2}" stroke-width="3"/>
      <rect x="132" y="50" width="36" height="15" fill="#cfd4dc"/>
      <path d="M132 50 V38 Q132 26 150 26 Q168 26 168 38 V50Z" fill="#ff8fa3"/>
    </g>
    <g transform="rotate(8 236 186)">
      <rect x="200" y="158" width="74" height="50" rx="7" fill="${PARCH}"/>
      <text x="237" y="194" text-anchor="middle" font-size="30" font-weight="700" fill="${INK}" stroke="none" font-family="Futura, 'Century Gothic', sans-serif">Abc</text>
    </g>`,
  rechnen: () => `
    ${palm(266, 190, 0.82)}
    <rect x="68" y="150" width="9" height="52" rx="3" fill="${WOOD2}"/>
    <g transform="rotate(-6 72 138)">
      <rect x="38" y="116" width="70" height="42" rx="7" fill="${PARCH}"/>
      <text x="73" y="147" text-anchor="middle" font-size="27" font-weight="700" fill="${INK}" stroke="none" font-family="Futura, 'Century Gothic', sans-serif">1+2</text>
    </g>
    <g transform="translate(96 78) scale(0.74)" stroke-width="5.4">${chestParts()}</g>
    ${coin(118, 206)}${coin(232, 204)}${coin(248, 216, 9)}${coin(104, 220, 9)}
    <polygon class="twinkle" points="${starPoints(236, 96, 12, 4.5, 4)}" fill="#fff" stroke="none"/>
    <polygon class="twinkle t2" points="${starPoints(110, 108, 9, 3.5, 4)}" fill="#fff" stroke="none"/>`,
};

export function islandSvg(kind) {
  return `<svg class="island-svg" viewBox="0 0 340 262" aria-hidden="true">${group(islandBase() + ISLAND_ART[kind]())}</svg>`;
}

export function compassSvg() {
  return `<svg class="compass-svg" viewBox="0 0 120 120" aria-hidden="true">
  <g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">
    <circle cx="60" cy="60" r="54" fill="${PARCH}"/>
    <circle cx="60" cy="60" r="43" fill="none" stroke="${WOOD}" stroke-width="2.5" stroke-dasharray="2 8" stroke-linecap="round"/>
    <path d="M22 60 L60 51 L98 60 L60 69Z" fill="#2f86d8"/>
    <path d="M60 16 L70 60 L60 104 L50 60Z" fill="#fff"/>
    <path d="M60 16 L70 60 H50Z" fill="${CORAL}"/>
    <circle cx="60" cy="60" r="6.5" fill="${GOLD}"/>
  </g></svg>`;
}

const cloud = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M4 40 Q-12 40 -8 24 Q-6 10 12 12 Q18 -8 42 -4 Q60 -18 78 0 Q104 -4 104 20 Q116 34 98 40Z" fill="#fff"/>`;

/** Strand-Hintergrund für den Stationen-Bildschirm. */
export function sceneSvg() {
  return `<svg class="scene-svg" viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd6f5"/><stop offset="1" stop-color="#e6f9ff"/></linearGradient>
    <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1fa3c4"/><stop offset="1" stop-color="#7fe3e8"/></linearGradient>
    <linearGradient id="sandG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fce9a8"/><stop offset="1" stop-color="#f0c770"/></linearGradient>
  </defs>
  <rect width="1024" height="240" fill="url(#skyG)"/>
  <circle cx="850" cy="92" r="70" fill="#fff3a8" opacity=".55"/>
  <circle cx="850" cy="92" r="44" fill="#ffd23f"/>
  <g class="clouds" opacity=".95">
    <g class="cloud-a">${cloud(150, 96, 1.2)}</g>
    <g class="cloud-b">${cloud(520, 108, 0.9)}</g>
  </g>
  <rect y="196" width="1024" height="200" fill="url(#seaG)"/>
  <path d="M330 198 Q390 150 470 198Z" fill="#74cf93"/>
  <path d="M402 170 q-4 -22 4 -34 m0 0 q-16 -8 -26 4 m26 -4 q16 -8 26 4 m-26 -4 q-2 -14 8 -18" fill="none" stroke="#3f9b5c" stroke-width="5" stroke-linecap="round"/>
  <g class="sea-lines" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55">
    <path d="M90 232 q14 -10 28 0 t28 0"/><path d="M600 224 q14 -10 28 0 t28 0"/>
    <path d="M300 268 q14 -10 28 0 t28 0 t28 0"/><path d="M780 262 q14 -10 28 0 t28 0"/>
    <path d="M140 300 q14 -10 28 0 t28 0"/><path d="M560 296 q14 -10 28 0 t28 0 t28 0"/>
  </g>
  <path class="foam" d="M0 338 Q250 292 520 324 Q790 358 1024 310 V370 H0Z" fill="#fff" opacity=".85"/>
  <path d="M0 350 Q250 304 520 336 Q790 370 1024 322 V768 H0Z" fill="url(#sandG)"/>
  <g fill="#e2b45c" opacity=".7">
    <ellipse cx="240" cy="410" rx="16" ry="5"/><ellipse cx="610" cy="640" rx="20" ry="6"/>
    <ellipse cx="820" cy="420" rx="14" ry="5"/><ellipse cx="420" cy="590" rx="22" ry="6"/><ellipse cx="930" cy="610" rx="18" ry="5"/>
  </g>
  ${palm(52, 452, 2.1)}
  ${palm(982, 430, 1.9, -1)}
  <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <polygon points="${starPoints(930, 690, 26, 11)}" fill="#ff8a66"/>
    <g transform="translate(690 734)">
      <path d="M-22 10 Q-26 -18 0 -20 Q26 -18 22 10Z" fill="#ffd6e4"/>
      <path d="M0 -20 V10 M-12 -16 L-9 10 M12 -16 L9 10" stroke-width="3" fill="none"/>
    </g>
    <g class="crab" transform="translate(820 722)">
      <path d="M-26 -4 l-12 -10 M26 -4 l12 -10 M-22 8 l-12 6 M22 8 l12 6" fill="none"/>
      <circle cx="-40" cy="-18" r="7" fill="${CORAL}"/><circle cx="40" cy="-18" r="7" fill="${CORAL}"/>
      <ellipse cx="0" cy="0" rx="26" ry="17" fill="${CORAL}"/>
      <circle cx="-8" cy="-4" r="3" fill="${INK}" stroke="none"/><circle cx="8" cy="-4" r="3" fill="${INK}" stroke="none"/>
      <path d="M-6 6 Q0 11 6 6" fill="none" stroke-width="3"/>
    </g>
  </g>
  </svg>`;
}

/** Himmel mit Sonne und Wolken für Titel- und Spielbildschirm. */
export function skySvg() {
  return `<svg class="sky-svg" viewBox="0 0 1024 500" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <circle cx="925" cy="200" r="80" fill="#fff3a8" opacity=".55"/>
    <circle cx="925" cy="200" r="50" fill="#ffd23f"/>
    <g opacity=".95">
      <g class="cloud-a">${cloud(90, 70, 1.4)}</g>
      <g class="cloud-b">${cloud(470, 40, 1)}</g>
      <g class="cloud-a">${cloud(640, 210, 1.2)}</g>
      <g class="cloud-b">${cloud(240, 230, 0.8)}</g>
    </g>
  </svg>`;
}
