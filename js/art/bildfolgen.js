// Bildfolgen für „Was kommt zuerst?" (Programmierinsel): kleine Abläufe aus dem Alltag.
// Jede Karte ist eine ganze kleine Szene mit Hintergrund; von Bild zu Bild ändert sich deutlich nur ein Schritt.
// Format 120 × 100. Hintergründe ohne Kontur, Dinge mit dicker Kontur wie im Rest der App.
import { INK } from '../engine/util.js';
import { chestParts, palm } from './world.js';

const SAND = '#f8dc8e', SAND2 = '#e9bf62', WOOD = '#b0703f', WOOD2 = '#8a5530', GOLD = '#ffcb3d', GOLD2 = '#e9a21f';
const CORAL = '#f0553f', BLUE = '#2f86d8', GREEN = '#45b565', GREEN2 = '#2c8f4b', PARCH = '#fdf1cf', CREAM = '#fff7e2';
const SKY = '#d4f1fd', SEA = '#5fcfe0';

const pic = inner => `<svg class="seq-svg" viewBox="0 0 120 100" aria-hidden="true">${inner}</svg>`;
const ink = (inner, w = 3) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;

/* ---------- Hintergründe ---------- */
const sky = (c = SKY) => `<rect width="120" height="100" fill="${c}"/>`;
const wave = (x, y) => `<path d="M${x} ${y} q5 -4 10 0 t10 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`;
/** Strand mit einem Streifen Meer dahinter */
const beach = () => `${sky()}<rect y="48" width="120" height="22" fill="${SEA}"/>${wave(8, 58)}${wave(84, 56)}
  <path d="M0 68 Q60 58 120 68 V100 H0Z" fill="${SAND}"/><path d="M14 88 q4 -2 8 0 M96 92 q4 -2 8 0" stroke="${SAND2}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
/** offenes Meer; Wasseroberfläche bei y */
const sea = (y = 64) => `${sky()}<path d="M0 ${y} Q30 ${y - 5} 60 ${y} T120 ${y} V100 H0Z" fill="${SEA}"/>${wave(10, y + 14)}${wave(70, y + 24)}${wave(92, y + 10)}`;
/** Wiese (für Nest und Wetter) */
const meadow = (c = SKY) => `${sky(c)}<path d="M0 74 Q40 64 120 72 V100 H0Z" fill="#8fd6a0"/><path d="M0 84 Q60 76 120 86 V100 H0Z" fill="#6cc283"/>`;

const sunAt = (x, y, r = 10) => ink(`<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd23f"/>`, 2.5)
  + `<path d="M${x} ${y - r - 4} v-5 M${x} ${y + r + 4} v5 M${x - r - 4} ${y} h-5 M${x + r + 4} ${y} h5 M${x - r} ${y - r} l-3 -3 M${x + r} ${y - r} l3 -3 M${x - r} ${y + r} l-3 3 M${x + r} ${y + r} l3 3" stroke="#f5a623" stroke-width="2.5" stroke-linecap="round"/>`;
const cloud = (x, y, s = 1, fill = '#fff') => ink(`<path transform="translate(${x} ${y}) scale(${s})" d="M0 20 Q-10 20 -8 10 Q-6 2 4 4 Q8 -8 22 -4 Q32 -12 42 -2 Q56 -2 54 10 Q60 20 50 20Z" fill="${fill}"/>`, 2.5 / s);

/* ---------- 1. Ein Schiff bauen ---------- */
const hull = `<path d="M22 54 H98 Q94 72 80 76 H40 Q26 72 22 54Z" fill="${WOOD}"/><path d="M28 64 H92" stroke="${WOOD2}" stroke-width="2.5"/>
  <path d="M20 54 H100" stroke-width="6"/><path d="M20 54 H100" stroke="${GOLD}" stroke-width="2.5"/>
  <circle cx="46" cy="68" r="3.2" fill="#9fdcf0"/><circle cx="60" cy="68" r="3.2" fill="#9fdcf0"/><circle cx="74" cy="68" r="3.2" fill="#9fdcf0"/>`;
const trestle = `<path d="M38 76 L32 92 M38 76 L44 92 M82 76 L76 92 M82 76 L88 92" stroke="${WOOD2}" stroke-width="4"/>`;
const mast = `<rect x="57.5" y="8" width="5" height="46" rx="2" fill="${WOOD2}"/>`;
const sail = `<path d="M36 12 Q60 18 84 12 Q88 30 84 48 Q60 42 36 48 Q32 30 36 12Z" fill="${CREAM}"/>
  <path d="M34 24 Q60 30 86 24 M34 36 Q60 41 86 36" stroke="${CORAL}" stroke-width="5" fill="none"/>
  <path d="M36 12 Q60 18 84 12 Q88 30 84 48 Q60 42 36 48 Q32 30 36 12Z" fill="none"/>`;
const flag = `<path d="M62.5 9 Q71 3 80 10 Q71 15 62.5 18Z" fill="${CORAL}"/>`;
const planks = `<rect x="4" y="82" width="26" height="5" rx="1.5" fill="${WOOD}"/><rect x="6" y="77" width="24" height="5" rx="1.5" fill="${WOOD}" transform="rotate(-6 18 80)"/>`;
const hammer = `<path d="M100 92 L110 78" stroke="${WOOD2}" stroke-width="3.5"/><rect x="104" y="72" width="12" height="6" rx="1.5" fill="#c5ccd6" transform="rotate(-36 110 75)"/>`;

const SCHIFF = [
  beach() + ink(trestle + hull + planks + hammer),
  beach() + ink(trestle + mast + hull + hammer),
  beach() + ink(trestle + mast + sail + hull),
  sea(70) + ink(mast + sail + flag + hull) + `<path d="M24 76 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
];

/* ---------- 2. Eine Sandburg bauen ---------- */
const bucketFull = `<path d="M24 52 H48 L45 80 H27Z" fill="${CORAL}"/><path d="M24 52 Q36 44 48 52Z" fill="${SAND2}"/><path d="M24 54 Q36 34 48 54" fill="none" stroke-width="2.5"/>`;
const bucketDown = `<path d="M18 86 L21 66 H39 L42 86Z" fill="${CORAL}" transform="rotate(-70 30 76)"/>`;
const spade = `<path d="M96 46 L99 76" stroke="${WOOD2}" stroke-width="4"/><path d="M92 74 H106 L104 88 H95Z" fill="${GOLD}"/>`;
const tower = (x, y, w, h) => `<path d="M${x} ${y + h} V${y} h${w / 5} v-5 h${w / 5} v5 h${w / 5} v-5 h${w / 5} v5 h${w / 5} V${y + h}Z" fill="${SAND2}"/>`;
const shells = `<path d="M18 92 L12 84 Q18 78 24 84Z" fill="#ffc2d1" stroke-width="2"/><path d="M104 94 L98 86 Q104 80 110 86Z" fill="#ffc2d1" stroke-width="2"/>`;

const SANDBURG = [
  beach() + ink(`<path d="M54 84 Q66 70 80 84Z" fill="${SAND2}"/>` + bucketFull + spade),
  beach() + ink(tower(50, 52, 22, 32) + bucketDown + spade),
  beach() + ink(tower(26, 60, 16, 24) + tower(78, 60, 16, 24) + `<rect x="40" y="66" width="40" height="18" fill="${SAND2}"/>` + tower(50, 44, 20, 40) + spade),
  beach() + ink(tower(26, 60, 16, 24) + tower(78, 60, 16, 24) + `<rect x="40" y="66" width="40" height="18" fill="${SAND2}"/>` + tower(50, 44, 20, 40)
    + `<path d="M55 84 V74 Q60 68 65 74 V84Z" fill="${WOOD2}"/><path d="M60 39 V20" stroke-width="2.5"/><path d="M60 20 L74 25 L60 30Z" fill="${CORAL}"/>` + shells),
];

/* ---------- 3. Einen Schatz finden ---------- */
const chest = (x, y, s, open = false) => `<g${open ? ' class="open"' : ''} transform="translate(${x} ${y}) scale(${s})" stroke-width="${(3 / s).toFixed(1)}">${chestParts()}</g>`;
const xMark = (x, y, s = 1) => `<path d="M${x - 9 * s} ${y - 6 * s} L${x + 9 * s} ${y + 6 * s} M${x + 9 * s} ${y - 6 * s} L${x - 9 * s} ${y + 6 * s}" stroke="${CORAL}" stroke-width="${5 * s}"/>`;
const digSpade = `<path d="M90 40 L82 74" stroke="${WOOD2}" stroke-width="4"/><path d="M76 72 L90 76 L86 88 L76 85Z" fill="#c5ccd6"/>`;

const SCHATZ = [
  sky('#e9d3a8') + ink(`<path d="M18 16 H102 V84 H18Z" fill="${PARCH}" transform="rotate(-4 60 50)"/>
    <path d="M24 26 q6 -6 12 0 M88 72 q6 -6 12 0" fill="none" stroke="${WOOD2}" stroke-width="2"/>
    <path d="M30 70 Q44 70 50 58 T74 44 T86 30" fill="none" stroke="${WOOD2}" stroke-width="3" stroke-dasharray="1 6"/>
    <path d="M24 74 Q30 64 38 70Z" fill="${GREEN}" stroke-width="2"/>` + xMark(86, 30)),
  beach() + ink(xMark(56, 80, 1.3) + `<path d="M84 66 Q96 56 108 66" fill="none" stroke-width="2"/>` + digSpade),
  beach() + ink(`<ellipse cx="56" cy="82" rx="30" ry="10" fill="#b8893f"/>` + chest(34, 50, 0.22)
    + `<path d="M22 84 Q56 98 90 84 L94 100 H18Z" fill="${SAND}" stroke="none"/><path d="M14 80 Q18 70 28 78 M86 78 Q96 70 102 80" fill="${SAND2}"/>` + digSpade),
  beach() + ink(`<ellipse cx="60" cy="86" rx="34" ry="7" fill="#b8893f"/>` + chest(30, 36, 0.3, true)
    + [[22, 86], [96, 88], [104, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${GOLD}" stroke-width="2"/>`).join('')),
];

/* ---------- 4. Flaschenpost ---------- */
const bottle = (inside = true) => `<path d="M18 40 Q18 30 28 30 H64 Q70 30 74 34 L84 34 Q88 34 88 38 V46 Q88 50 84 50 L74 50 Q70 54 64 54 H28 Q18 54 18 44Z" fill="#bfe9e0" fill-opacity=".85"/>
  ${inside ? `<rect x="30" y="36" width="34" height="12" rx="4" fill="${PARCH}" stroke-width="2"/><path d="M47 36 V48" stroke="${CORAL}" stroke-width="2.5"/>` : ''}
  <path d="M24 36 Q30 34 36 34" stroke="#fff" stroke-width="2.5" fill="none"/>`;
const cork = `<rect x="88" y="37" width="8" height="10" rx="2" fill="${WOOD}"/>`;

const FLASCHENPOST = [
  sky('#e9d3a8') + ink(`<path d="M24 14 H90 V86 H24Z" fill="${PARCH}" transform="rotate(3 57 50)"/>
    <path d="M34 28 H78 M34 40 H74 M34 52 H78 M34 64 H60" stroke="${WOOD2}" stroke-width="2.5" fill="none"/>
    <path d="M72 74 q4 -6 8 0 q4 -6 8 0 l-8 8Z" fill="${CORAL}" stroke-width="2"/>
    <path d="M86 18 L108 60" stroke="${GOLD}" stroke-width="7"/><path d="M106 56 L110 66 L102 62Z" fill="${INK}" stroke-width="1.5"/>`),
  beach() + ink(`<g transform="translate(4 30)">${bottle(false)}</g>`
    + `<g transform="rotate(-12 96 64)"><rect x="80" y="58" width="28" height="12" rx="5" fill="${PARCH}"/><path d="M94 58 V70" stroke="${CORAL}" stroke-width="2.5"/></g>`
    + `<rect x="98" y="84" width="8" height="10" rx="2" fill="${WOOD}"/>`),
  sea(56) + ink(`<g transform="rotate(-14 54 52) translate(2 6)">${bottle(true)}${cork}</g>`)
    + `<path d="M14 66 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
];

/* ---------- 5. Eis in der Sonne ---------- */
const cone = `<path d="M48 54 H72 L60 92Z" fill="#e8b26a"/><path d="M52 62 L66 76 M58 56 L69 66 M68 62 L54 76 M62 56 L51 66" stroke="#c98a3a" stroke-width="2" fill="none"/><path d="M48 54 H72 L60 92Z" fill="none"/>`;
const scoops = `<circle cx="60" cy="44" r="13" fill="#ff9fc0"/><circle cx="60" cy="24" r="12" fill="#9b6a3e"/><circle cx="60" cy="10" r="4" fill="${CORAL}"/><path d="M60 6 q2 -5 6 -6" fill="none" stroke-width="2"/>`;
const melting = `<path d="M44 54 Q44 38 60 38 Q76 38 76 54 L74 66 Q72 70 70 64 L68 56 L64 72 Q62 76 60 70 L56 58 L50 68 Q48 72 46 64Z" fill="#ff9fc0"/>
  <path d="M50 40 Q50 28 60 28 Q70 28 70 40 L67 46 L62 44 L56 48Z" fill="#9b6a3e"/>`;
const EIS = [
  sky() + sunAt(98, 18) + `<path d="M0 82 Q60 76 120 82 V100 H0Z" fill="${SAND}"/>` + ink(cone + scoops),
  sky() + sunAt(98, 18) + `<path d="M0 82 Q60 76 120 82 V100 H0Z" fill="${SAND}"/>` + ink(cone + melting + `<ellipse cx="74" cy="94" rx="6" ry="2.5" fill="#ff9fc0" stroke-width="2"/>`),
  sky() + sunAt(98, 18) + `<path d="M0 82 Q60 76 120 82 V100 H0Z" fill="${SAND}"/>` + ink(`<path d="M30 92 Q32 84 48 86 Q62 80 78 86 Q94 86 92 94 Q60 100 30 92Z" fill="#ff9fc0"/><path d="M50 88 Q60 84 70 88" fill="#9b6a3e" stroke-width="2"/>`
    + `<g transform="rotate(68 60 70)">${cone}</g>`),
];

/* ---------- 6. Banane essen ---------- */
const plate = `<ellipse cx="60" cy="86" rx="46" ry="10" fill="#fff"/><ellipse cx="60" cy="85" rx="32" ry="6" fill="none" stroke="#cfd8e2" stroke-width="2.5"/>`;
const table = sky('#f6e2c4') + `<rect y="74" width="120" height="26" fill="${WOOD}"/><path d="M0 74 H120" stroke="${WOOD2}" stroke-width="3"/>`;
const BANANE = [
  table + ink(plate + `<path d="M54 84 Q42 54 58 20 Q62 14 67 18 Q56 48 68 84Z" fill="#ffe066"/><path d="M58 20 L60 12 L65 14 L64 19" fill="${WOOD2}" stroke-width="2"/>
    <path d="M58 78 Q52 54 60 30" fill="none" stroke="${GOLD2}" stroke-width="2.5"/><path d="M54 84 Q60 87 68 84" fill="none" stroke="${WOOD2}" stroke-width="3"/>`),
  table + ink(plate + `<path d="M55 56 Q50 38 58 22 Q62 16 66 22 Q61 38 66 56Z" fill="#fff4c4"/>
    <path d="M54 84 Q50 68 54 56 H67 Q70 68 68 84Z" fill="#ffe066"/>
    <path d="M54 58 Q38 52 32 66 Q44 60 54 66Z" fill="#ffe066"/><path d="M67 58 Q84 52 90 66 Q78 60 67 66Z" fill="#ffe066"/>
    <path d="M58 58 Q60 44 64 40 Q66 50 63 58Z" fill="#ffd23f"/>`),
  table + ink(plate + `<path d="M60 82 Q40 80 24 72 Q36 70 58 78Z" fill="#ffe066"/><path d="M60 82 Q82 82 98 74 Q86 70 62 78Z" fill="#ffe066"/>
    <path d="M60 82 Q58 70 64 58 Q70 66 64 80Z" fill="#ffd23f"/><circle cx="60" cy="81" r="3" fill="${WOOD2}" stroke-width="1.5"/>
    <path d="M24 72 l-3 -1 M98 74 l3 -1" stroke="${WOOD2}" stroke-width="3"/>`),
];

/* ---------- 7. Aus einer Kokosnuss wird eine Palme ---------- */
const coconut = `<circle cx="60" cy="74" r="11" fill="${WOOD2}"/><circle cx="56" cy="70" r="1.8" fill="${INK}" stroke="none"/><circle cx="63" cy="69" r="1.8" fill="${INK}" stroke="none"/><circle cx="60" cy="75" r="1.8" fill="${INK}" stroke="none"/>`;
const PALME = [
  beach() + ink(coconut),
  beach() + ink(`<path d="M62 64 Q64 50 60 38" fill="none" stroke="${GREEN2}" stroke-width="4"/><path d="M60 42 Q46 30 38 40 Q50 44 60 42Z M61 44 Q76 34 84 44 Q72 48 61 44Z" fill="${GREEN}"/>` + coconut),
  beach() + palm(62, 86, 0.6) + ink(`<circle cx="44" cy="86" r="7" fill="${WOOD2}"/>`),
];

/* ---------- 8. Aus dem Ei schlüpft ein Küken ---------- */
const nest = `<path d="M26 76 Q60 100 94 76 Q88 64 60 66 Q32 64 26 76Z" fill="${WOOD}"/><path d="M32 78 q8 6 16 2 M60 82 q12 2 24 -4 M40 72 q8 -4 16 0" stroke="${WOOD2}" stroke-width="2.5" fill="none"/>`;
const egg = `<ellipse cx="60" cy="52" rx="17" ry="22" fill="${CREAM}"/><circle cx="53" cy="44" r="3" fill="#e2d4b4" stroke="none"/><circle cx="66" cy="58" r="2.5" fill="#e2d4b4" stroke="none"/>`;
const EI = [
  meadow() + ink(egg + nest),
  meadow() + ink(egg + `<path d="M43 50 L50 44 L55 52 L60 42 L65 51 L71 44 L77 50" fill="none" stroke-width="2.5"/><path d="M57 46 L60 38 L64 46Z" fill="#f08a2c" stroke-width="2"/>` + nest
    + `<path d="M84 46 L88 40 L92 46Z M28 44 L32 40 L34 46Z" fill="${CREAM}" stroke-width="2"/>`),
  meadow() + ink(`<circle cx="60" cy="48" r="16" fill="${GOLD}"/><circle cx="54" cy="44" r="2.6" fill="${INK}" stroke="none"/><circle cx="66" cy="44" r="2.6" fill="${INK}" stroke="none"/>
    <path d="M56 51 L64 51 L60 57Z" fill="#f08a2c" stroke-width="2"/><path d="M52 32 q4 -6 8 0 q4 -6 8 0" fill="none" stroke-width="2.5"/>
    <path d="M44 52 Q38 56 42 62 M76 52 Q82 56 78 62" fill="${GOLD}" stroke-width="2.5"/>` + nest
    + `<path d="M84 80 Q84 70 94 70 Q104 70 104 80 L100 76 L96 80 L92 76 L88 80Z" fill="${CREAM}" stroke-width="2.5"/>
    <path d="M10 82 Q10 74 18 74 Q26 74 26 82 L22 78 L18 82 L14 78Z" fill="${CREAM}" stroke-width="2.5"/>`),
];

/* ---------- 9. Nach dem Regen kommt der Regenbogen ---------- */
const rain = xs => xs.map(([x, y]) => `<path d="M${x} ${y} l-3 8" stroke="${BLUE}" stroke-width="3" stroke-linecap="round"/>`).join('');
const WETTER = [
  meadow('#a9bfd1') + cloud(18, 14, 1.2, '#8d9cad') + cloud(62, 22, 1, '#a1aebd')
    + rain([[26, 46], [38, 52], [50, 46], [62, 54], [74, 48], [86, 56], [98, 50], [32, 64], [56, 66], [80, 66]]),
  meadow('#c6dfee') + sunAt(28, 26, 11) + cloud(52, 16, 1.1, '#c7d2dd') + rain([[64, 46], [80, 50], [94, 46]]),
  meadow() + sunAt(98, 18, 10) + ['#f0553f', '#ff9a3c', '#ffcb3d', '#45b565', '#2f86d8', '#7c5cd6']
    .map((c, i) => `<path d="M${12 + i * 5} 78 A${46 - i * 5} ${46 - i * 5} 0 0 1 ${104 - i * 5} 78" fill="none" stroke="${c}" stroke-width="5"/>`).join('') + cloud(6, 64, 0.6),
];

/* ---------- 10. Angeln ---------- */
const pier = `<rect x="-4" y="44" width="46" height="7" fill="${WOOD}"/><path d="M8 51 V100 M32 51 V100" stroke="${WOOD2}" stroke-width="5"/>`;
const water = `${sky()}<rect y="52" width="120" height="48" fill="${SEA}"/><path d="M42 52 H120" stroke="#fff" stroke-width="2.5"/>${wave(56, 66)}${wave(90, 74)}`;
const fish = (x, y, rot = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M10 0 L20 -7 V7Z" fill="#f08a2c"/><path d="M10 0 Q-2 -10 -14 0 Q-2 10 10 0Z" fill="#ff9f43"/><circle cx="-8" cy="-2" r="1.8" fill="${INK}" stroke="none"/></g>`;
const ANGELN = [
  water + ink(pier + `<path d="M26 44 L82 12" stroke="${WOOD2}" stroke-width="3.5"/><path d="M82 12 V80" stroke-width="1.4"/><path d="M82 80 q0 5 -4 4" fill="none" stroke-width="2"/>` + fish(98, 82)),
  water + ink(pier + `<path d="M26 44 L74 6" stroke="${WOOD2}" stroke-width="3.5"/><path d="M74 6 V30" stroke-width="1.4"/>` + fish(74, 40, -80))
    + `<path d="M64 52 q4 -8 8 0 M78 52 q4 -8 8 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  water + ink(pier + `<path d="M2 42 L40 34" stroke="${WOOD2}" stroke-width="3.5"/>`
    + fish(24, 14, -72, 1.15) + `<path d="M10 22 H38 L34 44 H14Z" fill="#c5ccd6"/><path d="M10 22 Q24 8 38 22" fill="none" stroke-width="2"/><path d="M14 30 H34" stroke="#9aa5b2" stroke-width="2"/>`)
    + sunAt(100, 18, 9),
];

/** Alle Bildfolgen, jede Karte schon als fertiges SVG. */
export const SEQUENCES = [
  { id: 'schiff', frames: SCHIFF },
  { id: 'sandburg', frames: SANDBURG },
  { id: 'schatz', frames: SCHATZ },
  { id: 'flaschenpost', frames: FLASCHENPOST },
  { id: 'eis', frames: EIS },
  { id: 'banane', frames: BANANE },
  { id: 'palme', frames: PALME },
  { id: 'ei', frames: EI },
  { id: 'wetter', frames: WETTER },
  { id: 'angeln', frames: ANGELN },
].map(s => ({ ...s, frames: s.frames.map(pic) }));
