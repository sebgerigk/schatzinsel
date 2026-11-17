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
// Der Bretterstapel wird von Bild zu Bild kleiner – ein zweiter Hinweis auf die Reihenfolge.
const planks = n => Array.from({ length: n }, (_, i) => `<rect x="4" y="${88 - i * 5}" width="26" height="5" rx="1.5" fill="${WOOD}"/>`).join('');
const hammer = `<path d="M100 92 L110 78" stroke="${WOOD2}" stroke-width="3.5"/><rect x="104" y="72" width="12" height="6" rx="1.5" fill="#c5ccd6" transform="rotate(-36 110 75)"/>`;

const SCHIFF = [
  beach() + ink(trestle + hull + planks(3) + hammer),
  beach() + ink(trestle + mast + hull + planks(2) + hammer),
  beach() + ink(trestle + mast + sail + hull + planks(1)),
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

// Die Karte liegt beim Graben daneben – sie wird benutzt, nicht gefunden.
const smallMap = `<g transform="rotate(-10 18 86)"><rect x="4" y="78" width="26" height="18" rx="2" fill="${PARCH}" stroke-width="2"/>
  <path d="M8 92 Q14 84 22 86" fill="none" stroke="${WOOD2}" stroke-width="1.5" stroke-dasharray="1 3"/><path d="M22 82 l5 4 M27 82 l-5 4" stroke="${CORAL}" stroke-width="2"/></g>`;
const SCHATZ = [
  sky('#e9d3a8') + ink(`<path d="M18 16 H102 V84 H18Z" fill="${PARCH}" transform="rotate(-4 60 50)"/>
    <path d="M24 26 q6 -6 12 0 M88 72 q6 -6 12 0" fill="none" stroke="${WOOD2}" stroke-width="2"/>
    <path d="M30 70 Q44 70 50 58 T74 44 T86 30" fill="none" stroke="${WOOD2}" stroke-width="3" stroke-dasharray="1 6"/>
    <path d="M24 74 Q30 64 38 70Z" fill="${GREEN}" stroke-width="2"/>` + xMark(86, 30)),
  beach() + ink(xMark(60, 80, 1.3) + smallMap + digSpade),
  beach() + ink(`<ellipse cx="58" cy="82" rx="28" ry="10" fill="#b8893f"/>` + chest(38, 50, 0.22)
    + `<path d="M26 84 Q58 98 90 84 L94 100 H22Z" fill="${SAND}" stroke="none"/><path d="M86 78 Q96 70 102 80" fill="${SAND2}"/>` + smallMap + digSpade),
  beach() + ink(`<ellipse cx="60" cy="86" rx="34" ry="7" fill="#b8893f"/>` + chest(30, 36, 0.3, true)
    + [[22, 86], [96, 88], [104, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${GOLD}" stroke-width="2"/>`).join('')),
];

/* ---------- 4. Flaschenpost ---------- */
const bottle = (inside = true) => `<path d="M18 40 Q18 30 28 30 H64 Q70 30 74 34 L84 34 Q88 34 88 38 V46 Q88 50 84 50 L74 50 Q70 54 64 54 H28 Q18 54 18 44Z" fill="#bfe9e0" fill-opacity=".85"/>
  ${inside ? `<rect x="30" y="36" width="34" height="12" rx="4" fill="${PARCH}" stroke-width="2"/><path d="M47 36 V48" stroke="${CORAL}" stroke-width="2.5"/>` : ''}
  <path d="M24 36 Q30 34 36 34" stroke="#fff" stroke-width="2.5" fill="none"/>`;
const cork = `<rect x="88" y="37" width="8" height="10" rx="2" fill="${WOOD}"/>`;

// Erstes Bild: der Brief ist erst halb geschrieben, der Stift steht noch auf der Zeile.
// So kann die Folge nicht rückwärts als „Flaschenpost gefunden" gelesen werden.
const FLASCHENPOST = [
  sky('#e9d3a8') + ink(`<path d="M24 14 H90 V86 H24Z" fill="${PARCH}" transform="rotate(3 57 50)"/>
    <path d="M34 28 H78 M34 40 H58" stroke="${WOOD2}" stroke-width="2.5" fill="none"/>
    <path d="M34 52 H78 M34 64 H70" stroke="#e6d6b0" stroke-width="2" fill="none" stroke-dasharray="3 4"/>
    <path d="M60 40 L84 4" stroke="${GOLD}" stroke-width="7"/><path d="M62 37 L57 44 L60 34Z" fill="${INK}" stroke-width="1.5"/>`),
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

/* ---------- 9. Regen macht Pfützen, danach kommt der Regenbogen ---------- */
// Die Pfützen wachsen nur – rückwärts gelesen ergäbe die Folge keinen Sinn.
const rain = xs => xs.map(([x, y]) => `<path d="M${x} ${y} l-3 8" stroke="${BLUE}" stroke-width="3" stroke-linecap="round"/>`).join('');
const puddles = s => (s ? ink(`<ellipse cx="34" cy="88" rx="${12 * s}" ry="${3 * s}" fill="#7ab8e6"/><ellipse cx="84" cy="92" rx="${15 * s}" ry="${3.5 * s}" fill="#7ab8e6"/>`, 2) : '');
const WETTER = [
  meadow() + sunAt(96, 18, 10) + cloud(4, 12, 1.1, '#8d9cad') + `<path d="M64 24 h10 M66 30 h8" stroke="#8d9cad" stroke-width="2.5" stroke-linecap="round"/>`,
  meadow('#a9bfd1') + cloud(14, 10, 1.2, '#8d9cad') + cloud(60, 16, 1, '#a1aebd')
    + rain([[26, 42], [38, 50], [50, 42], [62, 50], [74, 44], [86, 52], [98, 46], [32, 60], [56, 62], [80, 60]]) + puddles(0.6),
  meadow() + sunAt(98, 18, 10) + ['#f0553f', '#ff9a3c', '#ffcb3d', '#45b565', '#2f86d8', '#7c5cd6']
    .map((c, i) => `<path d="M${12 + i * 5} 76 A${46 - i * 5} ${46 - i * 5} 0 0 1 ${104 - i * 5} 76" fill="none" stroke="${c}" stroke-width="5"/>`).join('') + puddles(1.3),
];

/* ---------- 10. Angeln ---------- */
const pier = `<rect x="-4" y="44" width="46" height="7" fill="${WOOD}"/><path d="M8 51 V100 M32 51 V100" stroke="${WOOD2}" stroke-width="5"/>`;
const water = `${sky()}<rect y="52" width="120" height="48" fill="${SEA}"/><path d="M42 52 H120" stroke="#fff" stroke-width="2.5"/>${wave(56, 66)}${wave(90, 74)}`;
const fish = (x, y, rot = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M10 0 L20 -7 V7Z" fill="#f08a2c"/><path d="M10 0 Q-2 -10 -14 0 Q-2 10 10 0Z" fill="#ff9f43"/><circle cx="-8" cy="-2" r="1.8" fill="${INK}" stroke="none"/></g>`;
// Der Eimer steht von Anfang an leer auf dem Steg und ist am Ende voll.
const emptyPail = `<path d="M6 26 H26 L23 44 H9Z" fill="#c5ccd6"/><path d="M6 26 Q16 14 26 26" fill="none" stroke-width="2"/>`;
const ANGELN = [
  water + ink(pier + emptyPail + `<path d="M30 44 L82 12" stroke="${WOOD2}" stroke-width="3.5"/><path d="M82 12 V80" stroke-width="1.4"/><path d="M82 80 q0 5 -4 4" fill="none" stroke-width="2"/>` + fish(98, 82)),
  water + ink(pier + emptyPail + `<path d="M30 44 L74 6" stroke="${WOOD2}" stroke-width="3.5"/><path d="M74 6 V30" stroke-width="1.4"/>` + fish(74, 40, -80))
    + `<path d="M64 52 q4 -8 8 0 M78 52 q4 -8 8 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  water + ink(pier + `<path d="M2 42 L40 34" stroke="${WOOD2}" stroke-width="3.5"/>`
    + fish(16, 18, -72, 1.15) + emptyPail + `<path d="M9 32 H23" stroke="#9aa5b2" stroke-width="2"/>`)
    + sunAt(100, 18, 9),
];

/* ---------- 11. Eine Blume gießen ---------- */
const flower = c => `${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 7).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 7).toFixed(1)}" r="6" fill="${c}"/>`).join('')}<circle r="5" fill="${GOLD}"/>`;
const pot = wet => `<path d="M46 70 H74 L70 92 H50Z" fill="#d9764a"/><path d="M44 65 H76 V71 H44Z" fill="#c4643c"/><ellipse cx="60" cy="66" rx="13" ry="2.4" fill="${wet ? '#5a3b22' : '#b88a5c'}" stroke="none"/>`;
const wilted = `<path d="M60 66 Q61 44 76 44 Q84 46 84 54" fill="none" stroke="#9aa86a" stroke-width="3.5"/>
  <path d="M60 60 Q50 60 46 70 Q54 66 60 64Z" fill="#b5c27a"/><g transform="translate(84 61)">${flower('#d9b6c0')}</g>`;
const upright = `<path d="M60 66 V30" stroke="${GREEN2}" stroke-width="3.5"/><path d="M60 54 Q46 42 40 50 Q50 56 60 56Z M60 48 Q74 36 80 44 Q70 50 60 50Z" fill="${GREEN}"/>
  <g transform="translate(60 24)">${flower('#ff7fa8')}</g>`;
const can = (x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="0" y="0" width="24" height="18" rx="4" fill="${BLUE}"/>
  <path d="M0 4 L-16 -6" stroke-width="4"/><path d="M24 4 Q34 8 24 14" fill="none" stroke-width="3"/></g>`;
const BLUME = [
  meadow() + sunAt(98, 16, 10) + ink(pot(false) + wilted),
  meadow() + ink(pot(true) + wilted + can(84, 22, -24)) + `<path d="M64 34 l-2 8 M70 40 l-2 8 M58 44 l-2 8" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/>`,
  meadow() + sunAt(98, 16, 10) + ink(pot(true) + upright + can(86, 76)),
];

/* ---------- 12. Eine Kerze brennt herunter ---------- */
const wall = sky('#efe3cf') + `<rect y="74" width="120" height="26" fill="${WOOD}"/><path d="M0 74 H120" stroke="${WOOD2}" stroke-width="3"/>`;
const candle = (top, lit = true) => `<ellipse cx="60" cy="84" rx="22" ry="5" fill="${GOLD}"/>
  <rect x="52" y="${top}" width="16" height="${82 - top}" rx="2" fill="${CREAM}"/>
  ${top < 70 ? `<path d="M52 ${top + 2} q-2 8 1 12 M68 ${top + 4} q2 6 -1 9" fill="${CREAM}" stroke-width="2"/>` : ''}
  <path d="M60 ${top} v-5" stroke-width="2"/>
  ${lit ? `<path d="M60 ${top - 22} Q68 ${top - 10} 60 ${top - 4} Q52 ${top - 10} 60 ${top - 22}Z" fill="#ffb02e" stroke-width="2"/><path d="M60 ${top - 14} Q63 ${top - 9} 60 ${top - 6} Q57 ${top - 9} 60 ${top - 14}Z" fill="#fff3a8" stroke="none"/>`
    : `<path d="M60 ${top - 6} q-6 -6 0 -12 q6 -6 0 -12" fill="none" stroke="#9aa5b2" stroke-width="2.5"/>`}`;
const KERZE = [
  wall + ink(candle(26)),
  wall + ink(candle(52)),
  wall + ink(candle(74, false)),
];

/* ---------- 13. Einen Apfel essen ---------- */
const APFEL = [
  table + ink(plate + `<path d="M60 40 Q40 28 33 52 Q32 78 54 84 Q60 82 66 84 Q88 78 87 52 Q80 28 60 40Z" fill="${CORAL}"/>
    <path d="M60 40 Q58 30 62 24" fill="none" stroke="${WOOD2}" stroke-width="3"/><path d="M62 30 Q72 22 78 28 Q70 34 62 30Z" fill="${GREEN}" stroke-width="2"/>
    <path d="M42 50 Q42 44 48 42" fill="none" stroke="#fff" stroke-width="3"/>`),
  table + ink(plate + `<path d="M60 40 Q40 28 33 52 Q32 78 54 84 Q60 82 66 84 Q80 80 85 70 Q73 68 72 58 Q72 48 85 44 Q78 30 60 40Z" fill="${CORAL}"/>
    <path d="M85 70 Q73 68 72 58 Q72 48 85 44 Q80 52 81 58 Q81 64 85 70Z" fill="#fff4c4"/>
    <path d="M60 40 Q58 30 62 24" fill="none" stroke="${WOOD2}" stroke-width="3"/><path d="M62 30 Q72 22 78 28 Q70 34 62 30Z" fill="${GREEN}" stroke-width="2"/>`),
  table + ink(plate + `<path d="M52 38 Q50 44 54 48 Q60 54 57 62 Q54 72 58 76 Q52 80 54 86 H66 Q68 80 62 76 Q66 72 63 62 Q60 54 66 48 Q70 44 68 38Z" fill="#fff4c4"/>
    <path d="M52 38 Q60 42 68 38 Q66 34 60 36 Q54 34 52 38Z M54 86 Q60 82 66 86Z" fill="${CORAL}" stroke-width="2"/>
    <path d="M60 36 Q58 28 62 22" fill="none" stroke="${WOOD2}" stroke-width="3"/><ellipse cx="58" cy="60" rx="1.5" ry="2.5" fill="${WOOD2}" stroke="none"/><ellipse cx="62" cy="64" rx="1.5" ry="2.5" fill="${WOOD2}" stroke="none"/>`),
];

/* ---------- 14. Einen Schneemann bauen ---------- */
const winter = sky('#dce9f2') + `<path d="M0 68 Q60 60 120 68 V100 H0Z" fill="#fff"/>`
  + [[14, 14], [40, 30], [76, 12], [100, 34], [24, 46], [88, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`).join('');
const ball = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><path d="M${x - r * 0.6} ${y + r * 0.5} Q${x} ${y + r * 0.9} ${x + r * 0.6} ${y + r * 0.5}" fill="none" stroke="#c9dceb" stroke-width="2"/>`;
const SCHNEEMANN = [
  winter + ink(ball(52, 84, 7)),
  winter + `<path d="M4 90 Q24 88 42 90" stroke="#c9dceb" stroke-width="8" stroke-linecap="round" fill="none"/>` + ink(ball(60, 78, 16)),
  winter + ink(ball(60, 78, 16) + ball(60, 52, 11)),
  winter + ink(ball(60, 78, 16) + ball(60, 52, 11) + ball(60, 34, 8)
    + `<path d="M50 50 L34 40 M70 50 L86 40" stroke="${WOOD2}" stroke-width="3"/><path d="M60 35 L70 37 L60 39Z" fill="#f08a2c" stroke-width="1.5"/>
    <circle cx="57" cy="32" r="1.4" fill="${INK}" stroke="none"/><circle cx="63" cy="32" r="1.4" fill="${INK}" stroke="none"/>
    <circle cx="60" cy="48" r="1.6" fill="${INK}" stroke="none"/><circle cx="60" cy="55" r="1.6" fill="${INK}" stroke="none"/>
    <path d="M51 27 H69 M54 27 V18 H66 V27" fill="#3b2a20" stroke-width="2.5"/>`),
];

/* ---------- 15. Pfannkuchen ---------- */
const PFANNKUCHEN = [
  table + ink(`<path d="M30 56 H90 Q88 84 60 86 Q32 84 30 56Z" fill="#cfe3f0"/><ellipse cx="60" cy="56" rx="30" ry="6" fill="#f3d58a"/>
    <path d="M70 52 L92 24" stroke-width="3"/><path d="M88 22 Q98 14 96 28 Q90 30 88 22Z" fill="#c5ccd6" stroke-width="2"/>
    <path d="M10 80 Q12 70 20 72 L18 80Z M22 80 Q24 72 30 74 L28 80Z" fill="${CREAM}" stroke-width="2"/>`),
  table + ink(`<ellipse cx="54" cy="70" rx="34" ry="10" fill="#3b3b44"/><path d="M86 68 L114 62" stroke-width="6"/>
    <ellipse cx="54" cy="68" rx="24" ry="6.5" fill="#f2c45c"/><circle cx="46" cy="67" r="1.5" fill="#d9a23c" stroke="none"/><circle cx="58" cy="69" r="1.5" fill="#d9a23c" stroke="none"/>
    <path d="M44 54 q-4 -6 0 -12 M56 52 q-4 -6 0 -12" fill="none" stroke="#9aa5b2" stroke-width="2.5"/>`),
  table + ink(plate + `<ellipse cx="60" cy="80" rx="28" ry="6" fill="#f2c45c"/><ellipse cx="60" cy="74" rx="28" ry="6" fill="#f2c45c"/><ellipse cx="60" cy="68" rx="28" ry="6" fill="#f2c45c"/>
    <path d="M40 68 Q60 62 80 68 Q76 74 70 72 L68 80 Q66 82 64 78 L62 72 Q50 74 40 68Z" fill="#b5651d" stroke-width="2"/>
    <circle cx="52" cy="66" r="3" fill="#7c5cd6" stroke-width="1.5"/><circle cx="66" cy="65" r="3" fill="${CORAL}" stroke-width="1.5"/>`),
];

/* ---------- 16. Einen Kuchen backen ---------- */
const bowl = inner => `<path d="M36 58 H84 Q82 82 60 84 Q38 82 36 58Z" fill="#cfe3f0"/>${inner}<path d="M36 58 H84" stroke-width="3"/>`;
const KUCHEN = [
  table + ink(bowl('') + `<path d="M8 74 L10 48 Q20 42 30 48 L32 74Z" fill="#fff"/><path d="M12 56 H28" stroke="#cfd8e2" stroke-width="2"/>
    <ellipse cx="98" cy="68" rx="7" ry="9" fill="${CREAM}"/><ellipse cx="110" cy="70" rx="6" ry="8" fill="${CREAM}"/><rect x="88" y="78" width="22" height="8" rx="2" fill="#ffe27a" stroke-width="2"/>`),
  table + ink(bowl(`<ellipse cx="60" cy="58" rx="24" ry="5" fill="#f3d58a"/>`) + `<path d="M64 56 L88 22" stroke="${WOOD}" stroke-width="5"/><ellipse cx="62" cy="58" rx="5" ry="3" fill="${WOOD}" stroke-width="2"/>`),
  table + ink(`<path d="M30 60 H90 L86 84 H34Z" fill="#c5ccd6"/><path d="M32 60 Q34 38 60 36 Q86 38 88 60Z" fill="#c98a3a"/>
    <path d="M48 30 q-4 -6 0 -12 M60 28 q-4 -6 0 -12 M72 30 q-4 -6 0 -12" fill="none" stroke="#9aa5b2" stroke-width="2.5"/>`),
  table + ink(plate + `<rect x="34" y="50" width="52" height="32" rx="4" fill="#c98a3a"/><path d="M34 54 Q34 46 60 46 Q86 46 86 54 V58 Q80 64 74 58 Q66 64 60 58 Q52 64 46 58 Q40 64 34 58Z" fill="#fff"/>
    ${[44, 60, 76].map(x => `<path d="M${x} 44 Q${x - 5} 40 ${x} 36 Q${x + 5} 40 ${x} 44Z" fill="${CORAL}" stroke-width="2"/>`).join('')}
    <rect x="57" y="22" width="6" height="16" rx="1.5" fill="#7fc0f0" stroke-width="2"/><path d="M60 10 Q64 16 60 20 Q56 16 60 10Z" fill="#ffb02e" stroke-width="1.5"/>`),
];

/* ---------- 17. Vom Ei zum Schmetterling ---------- */
const branch = `<path d="M-4 16 Q50 22 124 12" stroke="${WOOD2}" stroke-width="5" fill="none"/>`;
const leaf = holes => `<path d="M24 64 Q54 26 100 46 Q70 82 24 64Z" fill="${GREEN}"/><path d="M24 64 Q60 52 100 46 M60 18 Q62 34 64 42" fill="none" stroke="${GREEN2}" stroke-width="2.5"/>
  ${holes ? `<circle cx="46" cy="52" r="4" fill="#cdeccf" stroke-width="2"/><circle cx="78" cy="58" r="5" fill="#cdeccf" stroke-width="2"/><circle cx="64" cy="44" r="3" fill="#cdeccf" stroke-width="2"/>` : ''}`;
const butterfly = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 0 Q-16 -18 -20 -4 Q-16 6 0 2Z M0 0 Q16 -18 20 -4 Q16 6 0 2Z" fill="#ff8fb3"/>
  <path d="M0 2 Q-12 14 -8 18 Q-2 14 0 4Z M0 2 Q12 14 8 18 Q2 14 0 4Z" fill="#ffcb3d"/><path d="M0 -4 V12" stroke-width="3"/><path d="M0 -4 l-4 -6 M0 -4 l4 -6" fill="none" stroke-width="1.5"/></g>`;
const cocoon = open => `<path d="M64 18 V24" stroke-width="2"/><path d="M64 24 Q72 32 68 46 Q64 52 60 46 Q56 32 64 24Z" fill="${open ? '#e6d6b0' : '#b5945c'}"/>
  ${open ? '<path d="M60 46 L63 40 L66 46" fill="none" stroke-width="2"/>' : '<path d="M60 32 Q64 34 68 32 M60 38 Q64 40 68 38" fill="none" stroke-width="1.5"/>'}`;
const SCHMETTERLING = [
  meadow('#e3f6ea') + ink(branch + leaf(false) + [[58, 58], [64, 56], [61, 61], [67, 60], [70, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${CREAM}" stroke-width="1.5"/>`).join('')),
  meadow('#e3f6ea') + ink(branch + leaf(true) + [40, 47, 54, 61, 68].map((x, i) => `<circle cx="${x}" cy="${60 - (i % 2) * 3}" r="4.5" fill="#7fd36a" stroke-width="2"/>`).join('')
    + '<circle cx="72" cy="56" r="5" fill="#7fd36a" stroke-width="2"/><circle cx="73.5" cy="54.5" r="1" fill="#3b2a20" stroke="none"/>'),
  meadow('#e3f6ea') + ink(branch + leaf(true) + cocoon(false)),
  meadow('#e3f6ea') + ink(branch + leaf(true) + cocoon(true) + butterfly(94, 32)),
];

/* ---------- 18. Vom Laich zum Frosch ---------- */
const pond = `${sky()}<rect y="40" width="120" height="60" fill="#5fb8c9"/><path d="M0 40 H120" stroke="#fff" stroke-width="2.5"/>
  <path d="M8 40 V14 M14 40 V20 M108 40 V12" stroke="${GREEN2}" stroke-width="3"/><ellipse cx="8" cy="16" rx="2.5" ry="6" fill="${WOOD}"/><ellipse cx="108" cy="14" rx="2.5" ry="6" fill="${WOOD}"/>`;
const tadpole = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="0" rx="5" ry="4" fill="#3b2a20"/><path d="M4 0 Q12 -4 16 2" fill="none" stroke-width="2.5"/></g>`;
const FROSCH = [
  pond + ink(Array.from({ length: 11 }, (_, i) => {
    const x = 46 + (i % 4) * 9 + (i > 3 ? 4 : 0) - (i > 7 ? 4 : 0), y = 62 + Math.floor(i / 4) * 9;
    return `<circle cx="${x}" cy="${y}" r="5" fill="#d8f0f2" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="1.6" fill="${INK}" stroke="none"/>`;
  }).join('')),
  pond + ink(tadpole(40, 60, 10) + tadpole(70, 72, -20) + tadpole(54, 86, 5)),
  pond + ink(`<ellipse cx="60" cy="74" rx="30" ry="8" fill="${GREEN}"/><path d="M60 74 L84 70" stroke="${GREEN2}" stroke-width="2"/>
    <path d="M44 72 Q44 52 60 50 Q76 52 76 72Z" fill="#7fd36a"/><circle cx="52" cy="50" r="5" fill="#7fd36a"/><circle cx="68" cy="50" r="5" fill="#7fd36a"/>
    <circle cx="52" cy="50" r="2" fill="${INK}" stroke="none"/><circle cx="68" cy="50" r="2" fill="${INK}" stroke="none"/><path d="M52 60 Q60 66 68 60" fill="none" stroke-width="2"/>
    <path d="M44 70 L36 74 M76 70 L84 74" stroke-width="3"/>`),
];

/* ---------- 19. Ein Geschenk einpacken und auspacken ---------- */
const beachBall = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff"/><path d="M${x - 10} ${y} Q${x} ${y - 6} ${x + 10} ${y}" fill="none" stroke="${CORAL}" stroke-width="4"/><path d="M${x} ${y - 10} Q${x + 5} ${y} ${x} ${y + 10}" fill="none" stroke="${BLUE}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="10" fill="none"/>`;
const giftPaper = `#ffd6e4`;
const GESCHENK = [
  wall + ink(`<path d="M30 52 H66 V82 H30Z" fill="#d9a066"/><path d="M30 52 L22 44 M66 52 L74 44" fill="none" stroke-width="3"/>` + beachBall(48, 46)
    + `<rect x="78" y="62" width="34" height="14" rx="7" fill="${giftPaper}"/><path d="M86 62 V76 M96 62 V76 M106 62 V76" stroke="${CORAL}" stroke-width="2"/>`),
  wall + ink(`<rect x="34" y="44" width="52" height="38" rx="2" fill="${giftPaper}"/><path d="M42 44 V82 M54 44 V82 M66 44 V82 M78 44 V82" stroke="#ffb3c9" stroke-width="2"/>
    <path d="M60 44 V82 M34 60 H86" stroke="${CORAL}" stroke-width="5"/><path d="M60 44 Q48 30 46 40 Q50 46 60 44 Q72 30 74 40 Q70 46 60 44Z" fill="${CORAL}" stroke-width="2.5"/>`),
  wall + ink(`<path d="M30 56 H66 V82 H30Z" fill="#d9a066"/>` + beachBall(86, 72)
    + `<path d="M14 82 L22 70 L30 78 L24 86Z M70 50 L82 44 L84 56Z M34 44 L44 40 L42 50Z" fill="${giftPaper}" stroke-width="2"/>
    <path d="M10 40 l3 3 M100 36 l-3 3 M106 50 l-4 0" stroke="${GOLD2}" stroke-width="3"/>`),
];

/* ---------- 20. Eine Kokosnuss öffnen ---------- */
const coco = `<circle cx="56" cy="70" r="15" fill="${WOOD2}"/><circle cx="52" cy="65" r="2" fill="${INK}" stroke="none"/><circle cx="60" cy="64" r="2" fill="${INK}" stroke="none"/><circle cx="56" cy="70" r="2" fill="${INK}" stroke="none"/>`;
const KOKOSNUSS = [
  beach() + ink(coco + `<path d="M84 86 L104 74" stroke="${WOOD2}" stroke-width="4"/><rect x="98" y="66" width="14" height="8" rx="2" fill="#c5ccd6" transform="rotate(-30 105 70)"/>`),
  beach() + ink(coco + `<path d="M50 56 L56 66 L52 74 L58 84" fill="none" stroke="#f8dc8e" stroke-width="2.5"/>
    <path d="M100 30 L72 50" stroke="${WOOD2}" stroke-width="4"/><rect x="62" y="44" width="16" height="9" rx="2" fill="#c5ccd6" transform="rotate(-35 70 48)"/>
    <path d="M34 50 l-6 -4 M34 60 l-8 0 M78 64 l8 -2" stroke="${GOLD2}" stroke-width="3"/>`),
  beach() + ink(`<path d="M24 72 Q24 88 40 88 Q56 88 56 72Z" fill="${WOOD2}"/><ellipse cx="40" cy="72" rx="16" ry="5" fill="#fff"/>
    <path d="M64 72 Q64 88 80 88 Q96 88 96 72Z" fill="${WOOD2}"/><ellipse cx="80" cy="72" rx="16" ry="5" fill="#fff"/><ellipse cx="80" cy="72" rx="11" ry="3" fill="#e9f5f7" stroke="none"/>
    <path d="M82 72 L94 46 L100 48" fill="none" stroke="${CORAL}" stroke-width="3.5"/>`),
];

/* ---------- 21. Ein Puzzle legen ---------- */
// Bild aus sechs Teilen: oben Himmel mit Wolke und Sonne, unten Meer mit Schiffchen.
const PIECE = 18;
const pieceArt = [
  () => '', () => `<path d="M3 12 Q2 7 7 8 Q9 3 13 6 Q17 6 16 12Z" fill="#fff" stroke-width="1.5"/>`, () => `<circle cx="9" cy="9" r="5" fill="#ffd23f" stroke-width="1.5"/>`,
  () => `<path d="M2 8 q3 -3 6 0 t6 0" fill="none" stroke="#fff" stroke-width="1.8"/>`, () => `<path d="M3 7 H15 Q13 12 10 12 H7 Q4 12 3 7Z" fill="${WOOD}" stroke-width="1.5"/><path d="M9 7 V1 L14 5Z" fill="${CORAL}" stroke-width="1.2"/>`,
  () => `<path d="M4 12 q3 -3 6 0 t6 0" fill="none" stroke="#fff" stroke-width="1.8"/>`,
];
const piece = (i, x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot} 9 9)"><rect width="${PIECE}" height="${PIECE}" rx="2" fill="${i < 3 ? '#bfe6fb' : SEA}" stroke-width="2"/>${pieceArt[i]()}</g>`;
const boardAt = (done, loose) => `<rect x="31" y="22" width="58" height="40" rx="3" fill="#e9d3a8" stroke-width="2.5"/>`
  + done.map(i => piece(i, 33 + (i % 3) * PIECE, 24 + Math.floor(i / 3) * PIECE)).join('') + loose.map(([i, x, y, r]) => piece(i, x, y, r)).join('');
const PUZZLE = [
  table + ink(boardAt([], [[0, 6, 76, -14], [1, 30, 80, 10], [2, 56, 76, -6], [3, 80, 80, 18], [4, 98, 70, -20], [5, 12, 54, 8]])),
  table + ink(boardAt([0, 1, 2], [[3, 14, 78, 12], [4, 62, 78, -12], [5, 92, 74, 16]])),
  table + ink(boardAt([0, 1, 2, 3, 4, 5], [])) + `<path d="M98 30 l4 -4 M104 38 h6 M98 46 l4 4" stroke="${GOLD2}" stroke-width="3" stroke-linecap="round"/>`,
];

/* ---------- 22. Ein Lagerfeuer ---------- */
const evening = sky('#f8c79a') + `<circle cx="96" cy="40" r="12" fill="#ffb36b"/><rect y="52" width="120" height="16" fill="#4fa7c0"/><path d="M0 66 Q60 58 120 66 V100 H0Z" fill="${SAND}"/>`;
const stones = [34, 46, 60, 74, 86].map(x => `<ellipse cx="${x}" cy="86" rx="6" ry="4" fill="#9aa5b2"/>`).join('');
const logs = c => `<path d="M38 82 L82 66 M38 66 L82 82" stroke="${c}" stroke-width="7"/><path d="M60 62 V84" stroke="${c}" stroke-width="7"/>`;
const LAGERFEUER = [
  evening + ink(logs(WOOD2) + stones + `<rect x="96" y="80" width="14" height="9" rx="2" fill="${CORAL}" stroke-width="2"/>`),
  evening + ink(logs(WOOD2) + `<path d="M40 78 Q36 56 50 50 Q48 60 56 62 Q54 40 66 28 Q66 46 74 50 Q76 42 78 40 Q86 58 80 78Z" fill="#ff8a2c"/>
    <path d="M50 78 Q48 64 58 58 Q60 66 64 66 Q66 56 72 52 Q76 66 70 78Z" fill="#ffd23f"/>` + stones),
  evening + ink(logs('#3b3434') + `<ellipse cx="60" cy="80" rx="24" ry="5" fill="#b9b2aa"/><circle cx="54" cy="78" r="2" fill="${CORAL}" stroke="none"/>` + stones)
    + `<path d="M60 60 q-8 -8 0 -16 q8 -8 0 -16" fill="none" stroke="#9aa5b2" stroke-width="3" stroke-linecap="round"/>`,
];

/* ---------- 23. Wäsche waschen ---------- */
const shirt = (x, y, dirty, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-14 -12 L-6 -16 Q0 -12 6 -16 L14 -12 L20 -4 L13 0 L12 16 H-12 L-13 0 L-20 -4Z" fill="#7fc0f0"/>
  ${dirty ? `<ellipse cx="-4" cy="2" rx="5" ry="3.5" fill="#8a6440" stroke="none"/><ellipse cx="6" cy="10" rx="4" ry="3" fill="#8a6440" stroke="none"/><circle cx="8" cy="-6" r="2.5" fill="#8a6440" stroke="none"/>` : ''}</g>`;
const WAESCHE = [
  meadow() + ink(shirt(56, 78, true, -8) + `<ellipse cx="86" cy="90" rx="10" ry="3" fill="#8a6440" stroke="none"/>`),
  meadow() + ink(`<path d="M28 62 H92 L86 90 H34Z" fill="#c5ccd6"/><ellipse cx="60" cy="62" rx="32" ry="6" fill="#e9f5ff"/>
    ${[[42, 56], [52, 52], [66, 54], [78, 57], [60, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke-width="2"/>`).join('')}
    <path d="M70 60 L84 50 L90 56 L78 64Z" fill="#7fc0f0" stroke-width="2.5"/>`),
  meadow() + sunAt(98, 16, 9) + ink(`<path d="M14 90 V30 M106 90 V30" stroke="${WOOD2}" stroke-width="4"/><path d="M14 34 Q60 44 106 34" fill="none" stroke-width="1.8"/>`
    + shirt(60, 56, false) + `<rect x="48" y="35" width="3" height="8" fill="${WOOD}" stroke-width="1"/><rect x="69" y="35" width="3" height="8" fill="${WOOD}" stroke-width="1"/>`),
];

/* ---------- 24. Ein Brot belegen ---------- */
const slice = y => `<path d="M30 ${y} Q30 ${y - 22} 46 ${y - 24} Q60 ${y - 34} 74 ${y - 24} Q90 ${y - 22} 90 ${y} Z" fill="#e8b26a"/><path d="M34 ${y - 2} Q34 ${y - 18} 48 ${y - 20} Q60 ${y - 28} 72 ${y - 20} Q86 ${y - 18} 86 ${y - 2}Z" fill="#fbe3b5" stroke="none"/>`;
const BROT = [
  table + ink(plate + slice(82)),
  table + ink(plate + slice(82) + `<path d="M38 76 Q38 62 50 60 Q60 54 70 60 Q82 62 82 76Z" fill="#ffe680" stroke-width="2"/>`
    + `<path d="M92 82 L112 64" stroke="#c5ccd6" stroke-width="4"/>`),
  table + ink(plate + slice(82) + `<path d="M38 76 Q38 62 50 60 Q60 54 70 60 Q82 62 82 76Z" fill="#ffe680" stroke-width="2"/>
    <path d="M36 66 L58 56 L78 64 L64 74Z" fill="#ffc93c" stroke-width="2"/><circle cx="50" cy="68" r="6" fill="${CORAL}" stroke-width="2"/><circle cx="70" cy="66" r="6" fill="${CORAL}" stroke-width="2"/>`),
  table + ink(plate + slice(84) + `<path d="M32 76 H88" stroke="${CORAL}" stroke-width="4"/><path d="M34 72 H86" stroke="#ffc93c" stroke-width="3"/>` + slice(72)),
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
  { id: 'blume', frames: BLUME },
  { id: 'kerze', frames: KERZE },
  { id: 'apfel', frames: APFEL },
  { id: 'schneemann', frames: SCHNEEMANN },
  { id: 'pfannkuchen', frames: PFANNKUCHEN },
  { id: 'kuchen', frames: KUCHEN },
  { id: 'schmetterling', frames: SCHMETTERLING },
  { id: 'frosch', frames: FROSCH },
  { id: 'geschenk', frames: GESCHENK },
  { id: 'kokosnuss', frames: KOKOSNUSS },
  { id: 'puzzle', frames: PUZZLE },
  { id: 'lagerfeuer', frames: LAGERFEUER },
  { id: 'waesche', frames: WAESCHE },
  { id: 'brot', frames: BROT },
].map(s => ({ ...s, frames: s.frames.map(pic) }));
