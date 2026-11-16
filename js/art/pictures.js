// Wortbilder: jede Zeichnung im 100×100-Raster, gleicher Strich, gleiche Farbwelt.
import { INK } from '../engine/util.js';
import { starPoints } from './icons.js';

const RED = '#ea4630', GOLD = '#ffcb3d', GOLD2 = '#f0a020', YEL = '#ffd23f';
const WOOD = '#b0703f', WOOD2 = '#8a5530', G1 = '#45b565', G2 = '#2c8f4b';
const BLUE = '#2f86d8', GLASS = '#9fdcf0', PINK = '#ff7e9d', CREAM = '#fff4dc';
const SEA = '#2f9fd0';

const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" stroke="none"/>`;
const shine = d => `<path d="${d}" stroke="#fff" stroke-width="3" opacity=".75"/>`;
const waves = y => `<path d="M4 ${y} q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t12 0" stroke="${SEA}"/>`;
/** Dicke Linie mit Umriss (z. B. Anker, Schlüssel). */
const tube = (d, color, w = 6) => `<path d="${d}" stroke-width="${w + 6.5}"/><path d="${d}" stroke="${color}" stroke-width="${w}"/>`;

const PICS = {
  sonne: () => {
    let rays = '';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
      rays += `M${(50 + 32 * c).toFixed(1)} ${(50 + 32 * s).toFixed(1)} L${(50 + 43 * c).toFixed(1)} ${(50 + 43 * s).toFixed(1)} `;
    }
    return `${tube(rays, GOLD2, 5)}<circle cx="50" cy="50" r="25" fill="${YEL}"/>${eye(42, 46)}${eye(58, 46)}<path d="M41 55 Q50 64 59 55"/>`;
  },
  mond: () => `<path d="M62 14 A38 38 0 1 0 86 62 A30 30 0 1 1 62 14Z" fill="#ffe58a"/>
    <polygon points="${starPoints(78, 26, 8, 3.2, 4)}" fill="${YEL}" stroke-width="2.5"/>
    <polygon points="${starPoints(66, 46, 5.5, 2.2, 4)}" fill="${YEL}" stroke-width="2.5"/>`,
  stern: () => `<polygon points="${starPoints(50, 54, 43, 19)}" fill="${YEL}"/>${eye(43, 52)}${eye(57, 52)}<path d="M43 60 Q50 66 57 60"/>`,
  haus: () => `<rect x="62" y="18" width="11" height="22" fill="${WOOD}"/>
    <rect x="22" y="48" width="56" height="40" fill="#fde9bd"/>
    <path d="M10 50 L50 15 L90 50Z" fill="${RED}"/>
    <rect x="44" y="62" width="15" height="26" rx="2" fill="${WOOD}"/>${eye(55, 76, 1.8)}
    <rect x="27" y="58" width="12" height="12" fill="${GLASS}"/><rect x="64" y="58" width="10" height="12" fill="${GLASS}"/>`,
  baum: () => {
    const cs = [[50, 36, 25], [30, 49, 17], [70, 49, 17]];
    return `<path d="M43 90 V58 H57 V90Z" fill="${WOOD}"/>
      ${cs.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${G1}"/>`).join('')}
      ${cs.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${G1}" stroke="none"/>`).join('')}
      <path d="M36 30 Q42 20 52 20 M24 46 Q26 40 32 38" stroke="#8fe0a4" stroke-width="3"/>`;
  },
  ball: () => `<circle cx="50" cy="50" r="36" fill="${YEL}"/>
    <path d="M50 14 A36 36 0 0 0 50 86 Q28 50 50 14Z" fill="${RED}"/>
    <path d="M50 14 A36 36 0 0 1 50 86 Q72 50 50 14Z" fill="${BLUE}"/>
    ${shine('M30 30 Q36 22 44 20')}`,
  fisch: () => `<path d="M38 32 Q50 14 62 34Z" fill="#f08a2c"/>
    <path d="M68 50 L92 30 Q86 50 92 70Z" fill="#f08a2c"/>
    <ellipse cx="44" cy="50" rx="32" ry="21" fill="#ff9f43"/>
    <path d="M56 33 Q63 50 56 67" stroke="#fff" stroke-width="4" opacity=".7"/>
    <path d="M44 52 Q54 57 47 64"/>
    <circle cx="28" cy="45" r="6.5" fill="#fff"/>${eye(27, 45, 3)}
    <path d="M15 56 Q19 59 23 56"/>`,
  hut: () => `<ellipse cx="50" cy="68" rx="42" ry="13" fill="${WOOD2}"/>
    <path d="M27 66 Q24 24 50 24 Q76 24 73 66 Q50 75 27 66Z" fill="${WOOD}"/>
    <path d="M27 55 Q50 64 73 55 L73 66 Q50 75 27 66Z" fill="${RED}"/>`,
  boot: () => `<path d="M50 12 V64"/>
    <path d="M55 18 L84 58 H55Z" fill="#fff"/>
    <path d="M45 28 L22 58 H45Z" fill="${RED}"/>
    <path d="M12 64 H88 L76 82 H24Z" fill="${WOOD}"/>
    ${waves(91)}`,
  blume: () => {
    let petals = '';
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 - Math.PI / 2;
      petals += `<circle cx="${(50 + 16 * Math.cos(a)).toFixed(1)}" cy="${(36 + 16 * Math.sin(a)).toFixed(1)}" r="11.5" fill="#ff8fb8"/>`;
    }
    return `${tube('M50 50 V92', G2, 4)}
      <path d="M50 78 Q34 64 26 76 Q36 90 50 78Z" fill="${G1}"/>
      <path d="M50 70 Q64 58 72 68 Q64 80 50 70Z" fill="${G1}"/>
      ${petals}<circle cx="50" cy="36" r="10" fill="${YEL}"/>`;
  },
  apfel: () => `<path d="M50 36 Q34 22 22 38 Q12 60 30 82 Q40 92 50 86 Q60 92 70 82 Q88 60 78 38 Q66 22 50 36Z" fill="${RED}"/>
    <path d="M50 36 Q50 24 55 16"/>
    <path d="M56 24 Q70 10 82 20 Q70 34 56 24Z" fill="${G1}"/>
    ${shine('M29 46 Q25 56 29 64')}`,
  wolke: () => `<path d="M24 76 Q6 76 9 58 Q10 44 26 44 Q28 24 48 24 Q64 22 70 38 Q92 36 92 58 Q92 76 74 76Z" fill="#eef8ff"/>
    ${eye(40, 54)}${eye(58, 54)}<path d="M43 62 Q49 67 55 62"/>`,
  pilz: () => `<path d="M38 54 Q32 84 40 88 H60 Q68 84 62 54Z" fill="${CREAM}"/>
    <path d="M10 56 Q10 14 50 14 Q90 14 90 56 Q50 66 10 56Z" fill="${RED}"/>
    <g fill="#fff" stroke="none"><circle cx="32" cy="36" r="7"/><circle cx="56" cy="27" r="6"/><circle cx="72" cy="44" r="7"/><circle cx="48" cy="48" r="4.5"/></g>`,
  eis: () => `<path d="M31 52 L50 95 L69 52Z" fill="#e8b25e"/>
    <path d="M38 62 L57 78 M62 62 L45 82" stroke="#c98a3a" stroke-width="2.5"/>
    <circle cx="50" cy="38" r="23" fill="#ff9ec4"/>
    <path d="M27 42 Q33 56 40 50 Q50 60 60 50 Q67 56 73 42" fill="#ff9ec4"/>
    <circle cx="57" cy="13" r="6.5" fill="${RED}"/>
    ${shine('M35 32 Q39 23 47 21')}`,
  uhr: () => `<circle cx="27" cy="20" r="9" fill="${GOLD}"/><circle cx="73" cy="20" r="9" fill="${GOLD}"/>
    <path d="M28 82 L21 92 M72 82 L79 92"/>
    <circle cx="50" cy="54" r="36" fill="${RED}"/><circle cx="50" cy="54" r="27" fill="#fff"/>
    <path d="M50 31 V35 M50 73 V77 M27 54 H31 M69 54 H73" stroke-width="3"/>
    <path d="M50 54 V38 M50 54 L62 60" stroke-width="4.5"/>${eye(50, 54, 3.2)}`,
  buch: () => `<path d="M7 30 H93 V84 H7Z" fill="${BLUE}"/>
    <path d="M50 28 Q32 16 12 24 V76 Q32 68 50 80Z" fill="#fff"/>
    <path d="M50 28 Q68 16 88 24 V76 Q68 68 50 80Z" fill="#fff"/>
    <path d="M20 36 Q32 31 42 36 M20 47 Q32 42 42 47 M20 58 Q32 53 42 58 M58 36 Q68 31 80 36 M58 47 Q68 42 80 47 M58 58 Q68 53 80 58" stroke="#9aa7b5" stroke-width="2.6"/>`,
  anker: () => `${tube('M50 27 V86 M32 42 H68 M18 58 Q22 87 50 87 Q78 87 82 58', '#93a3b5')}
    <circle cx="50" cy="18" r="8" stroke-width="11"/><circle cx="50" cy="18" r="8" stroke="#93a3b5" stroke-width="4.5"/>
    <path d="M9 64 L18 50 L28 63Z" fill="#93a3b5"/><path d="M72 63 L82 50 L91 64Z" fill="#93a3b5"/>`,
  krone: () => `<path d="M14 78 L9 32 L32 52 L50 20 L68 52 L91 32 L86 78Z" fill="${GOLD}"/>
    <rect x="14" y="66" width="72" height="13" rx="2" fill="${GOLD2}"/>
    <circle cx="50" cy="20" r="5.5" fill="${RED}"/><circle cx="9" cy="32" r="4.5" fill="${BLUE}"/><circle cx="91" cy="32" r="4.5" fill="${BLUE}"/>
    <circle cx="50" cy="55" r="5.5" fill="${RED}"/>`,
  kiste: () => `<path d="M12 50 Q12 20 50 20 Q88 20 88 50Z" fill="#b97a45"/>
    <rect x="12" y="50" width="76" height="38" rx="4" fill="#a3642f"/>
    <g stroke-linecap="butt"><path d="M30 26 V88 M70 26 V88" stroke-width="11"/><path d="M30 28 V86 M70 28 V86" stroke="${GOLD}" stroke-width="5"/></g>
    <rect x="42" y="42" width="16" height="18" rx="4" fill="${GOLD}"/>${eye(50, 50, 2.4)}`,
  palme: () => `<path d="M20 92 Q50 78 80 92Z" fill="#f8dc8e"/>
    ${tube('M46 88 Q38 60 54 36', WOOD, 7)}
    <path d="M54 36 Q26 36 14 60 Q32 44 54 36Z" fill="${G2}"/>
    <path d="M54 36 Q82 38 92 62 Q74 44 54 36Z" fill="${G2}"/>
    <path d="M54 36 Q30 12 6 32 Q30 28 54 36Z" fill="${G1}"/>
    <path d="M54 36 Q78 12 98 34 Q76 28 54 36Z" fill="${G1}"/>
    <path d="M54 36 Q50 12 66 5 Q64 22 54 36Z" fill="#5fcc7c"/>`,
  insel: () => `${waves(88)}
    <path d="M8 82 Q50 44 92 82Z" fill="#f8dc8e"/>
    ${tube('M58 64 Q52 48 60 32', WOOD, 5)}
    <path d="M60 32 Q42 30 34 46 Q46 36 60 32Z" fill="${G2}"/>
    <path d="M60 32 Q78 30 86 46 Q74 36 60 32Z" fill="${G2}"/>
    <path d="M60 32 Q44 14 28 28 Q44 26 60 32Z" fill="${G1}"/>
    <path d="M60 32 Q76 14 92 28 Q76 26 60 32Z" fill="${G1}"/>`,
  fahne: () => `${tube('M24 12 V92', WOOD, 5)}
    <path d="M27 16 Q42 6 57 17 Q72 28 88 18 V52 Q72 62 57 51 Q42 40 27 50Z" fill="${RED}"/>
    <circle cx="24" cy="9" r="5.5" fill="${GOLD}"/>`,
  herz: () => `<path d="M50 86 Q8 56 14 32 Q20 12 38 16 Q47 18 50 30 Q53 18 62 16 Q80 12 86 32 Q92 56 50 86Z" fill="${RED}"/>
    ${shine('M24 34 Q25 25 34 23')}`,
  katze: () => `<path d="M24 42 L20 12 L46 28Z" fill="#f5a54a"/><path d="M76 42 L80 12 L54 28Z" fill="#f5a54a"/>
    <path d="M26 31 L25 20 L35 26Z" fill="#ffb3c7" stroke="none"/><path d="M74 31 L75 20 L65 26Z" fill="#ffb3c7" stroke="none"/>
    <ellipse cx="50" cy="57" rx="33" ry="28" fill="#f5a54a"/>
    <path d="M43 31 V39 M50 30 V40 M57 31 V39" stroke="#d9822b" stroke-width="3"/>
    ${eye(38, 52, 3.6)}${eye(62, 52, 3.6)}
    <path d="M46 62 H54 L50 67Z" fill="${PINK}"/>
    <path d="M50 67 Q46 75 40 71 M50 67 Q54 75 60 71"/>
    <path d="M25 62 L8 58 M25 68 L8 73 M75 62 L92 58 M75 68 L92 73" stroke-width="2.5"/>`,
  hund: () => `<path d="M27 30 Q6 32 11 62 Q22 68 31 50Z" fill="${WOOD2}"/><path d="M73 30 Q94 32 89 62 Q78 68 69 50Z" fill="${WOOD2}"/>
    <ellipse cx="50" cy="52" rx="28" ry="31" fill="#dba56b"/>
    <ellipse cx="61" cy="44" rx="10" ry="11" fill="${WOOD}" stroke="none"/>
    <ellipse cx="50" cy="67" rx="17" ry="13" fill="#fbe9cf" stroke="none"/>
    ${eye(39, 45, 3.6)}${eye(61, 45, 3.6)}
    <path d="M46 75 Q50 88 54 75Z" fill="${PINK}"/>
    <path d="M50 64 V70 M41 70 Q50 79 59 70"/>
    <ellipse cx="50" cy="61" rx="6.5" ry="5" fill="${INK}" stroke="none"/>`,
  maus: () => `<circle cx="25" cy="33" r="18" fill="#bcc3cd"/><circle cx="75" cy="33" r="18" fill="#bcc3cd"/>
    <circle cx="25" cy="33" r="10" fill="#ffb3c7" stroke="none"/><circle cx="75" cy="33" r="10" fill="#ffb3c7" stroke="none"/>
    <ellipse cx="50" cy="60" rx="29" ry="27" fill="#bcc3cd"/>
    ${eye(39, 55, 3.6)}${eye(61, 55, 3.6)}
    <rect x="45.5" y="74" width="9" height="8" rx="2" fill="#fff"/>
    <path d="M42 74 Q50 79 58 74"/>
    <circle cx="50" cy="68" r="5" fill="${PINK}"/>
    <path d="M30 66 L12 62 M30 71 L12 76 M70 66 L88 62 M70 71 L88 76" stroke-width="2.5"/>`,
  ente: () => `<path d="M16 60 L5 50 L22 54Z" fill="${YEL}"/>
    <ellipse cx="44" cy="68" rx="31" ry="18" fill="${YEL}"/>
    <path d="M82 36 L97 41 L82 48Z" fill="#f08a2c"/>
    <circle cx="68" cy="38" r="17" fill="${YEL}"/>
    ${eye(73, 34, 3.2)}
    <path d="M30 66 Q43 54 56 66 Q43 77 30 66Z" fill="#f5b82e"/>
    ${waves(90)}`,
  kerze: () => `<path d="M50 6 Q64 24 57 35 Q50 42 43 35 Q36 24 50 6Z" fill="#ffb02e"/>
    <path d="M50 22 Q55 30 50 36 Q45 30 50 22Z" fill="#fff3a8" stroke="none"/>
    <rect x="37" y="46" width="26" height="38" rx="3" fill="${RED}"/>
    <path d="M50 38 V46"/>
    <path d="M40 52 Q44 58 48 52 Q52 60 56 52" stroke="#fff" stroke-width="3" opacity=".75"/>
    <ellipse cx="50" cy="86" rx="28" ry="7.5" fill="${GOLD}"/>`,
  banane: () => `<path d="M18 20 L28 22 Q36 58 84 56 Q92 62 84 70 Q28 84 18 20Z" fill="${YEL}"/>
    <path d="M27 36 Q40 68 80 64" stroke="${GOLD2}" stroke-width="2.6"/>
    <path d="M18 20 L28 22" stroke-width="7"/>`,
  schiff: () => `<path d="M50 8 V62"/>
    <path d="M50 8 Q62 3 72 10 Q62 16 50 18Z" fill="${RED}"/>
    <path d="M22 24 Q50 31 78 24 Q83 42 78 58 Q50 52 22 58 Q17 42 22 24Z" fill="#fff7e2"/>
    <path d="M8 62 H92 Q88 82 74 86 H26 Q12 82 8 62Z" fill="${WOOD}"/>
    <path d="M5 62 H95" stroke-width="6.5"/>
    <g fill="${GLASS}"><circle cx="34" cy="74" r="4.5"/><circle cx="50" cy="74" r="4.5"/><circle cx="66" cy="74" r="4.5"/></g>
    ${waves(94)}`,
  tisch: () => `<rect x="17" y="44" width="10" height="46" rx="2" fill="${WOOD2}"/><rect x="73" y="44" width="10" height="46" rx="2" fill="${WOOD2}"/>
    <rect x="6" y="32" width="88" height="14" rx="4" fill="#b97a45"/>
    <path d="M16 39 H40 M56 39 H82" stroke="${WOOD2}" stroke-width="2.5"/>`,
  kaese: () => `<path d="M8 72 H92 V86 H8Z" fill="#f5b82e"/>
    <path d="M8 72 L76 30 Q94 48 92 72Z" fill="${YEL}"/>
    <g fill="${GOLD2}"><circle cx="58" cy="58" r="6.5"/><circle cx="77" cy="50" r="4"/><circle cx="36" cy="66" r="3.5"/><circle cx="26" cy="80" r="3"/><circle cx="70" cy="80" r="3.5"/></g>`,
  brot: () => `<path d="M10 70 Q6 34 50 32 Q94 34 90 70 Q90 82 78 82 H22 Q10 82 10 70Z" fill="#d99a52"/>
    <path d="M30 44 L38 62 M47 40 L55 60 M64 44 L72 62" stroke="#fbe3b0" stroke-width="4.5"/>`,
  lampe: () => `${tube('M50 54 V84', WOOD2, 4)}
    <ellipse cx="50" cy="87" rx="22" ry="6.5" fill="${WOOD2}"/>
    <path d="M34 14 H66 L82 56 H18Z" fill="${YEL}"/>
    ${shine('M36 24 L30 44')}`,
  auto: () => `<path d="M7 68 V54 Q9 47 24 45 L34 27 H66 L78 45 Q93 47 93 58 V68Z" fill="${RED}"/>
    <path d="M38 33 H49 V45 H31Z" fill="${GLASS}"/><path d="M55 33 H63 L71 45 H55Z" fill="${GLASS}"/>
    <circle cx="28" cy="70" r="11.5" fill="#4a4a55"/><circle cx="72" cy="70" r="11.5" fill="#4a4a55"/>
    <circle cx="28" cy="70" r="4.5" fill="#d0d4da" stroke="none"/><circle cx="72" cy="70" r="4.5" fill="#d0d4da" stroke="none"/>
    <circle cx="88" cy="56" r="3.2" fill="${YEL}" stroke-width="2.5"/>`,
  tuer: () => `<rect x="25" y="8" width="50" height="84" rx="4" fill="#b97a45"/>
    <rect x="32" y="16" width="36" height="28" rx="3" fill="#a3642f"/><rect x="32" y="52" width="36" height="32" rx="3" fill="#a3642f"/>
    <circle cx="68" cy="48" r="4.5" fill="${GOLD}"/>`,
  ei: () => `<path d="M50 10 Q72 32 72 56 Q72 72 50 72 Q28 72 28 56 Q28 32 50 10Z" fill="${CREAM}"/>
    ${shine('M38 34 Q40 26 46 20')}
    <path d="M26 58 Q26 84 50 84 Q74 84 74 58Z" fill="${BLUE}"/>
    <path d="M42 84 L38 93 H62 L58 84" fill="${BLUE}"/>`,
  rakete: () => `<path d="M40 76 Q50 102 60 76Z" fill="#ffb02e"/>
    <path d="M34 52 L16 80 L36 72Z" fill="${RED}"/><path d="M66 52 L84 80 L64 72Z" fill="${RED}"/>
    <path d="M50 6 Q74 30 66 76 H34 Q26 30 50 6Z" fill="#fff"/>
    <path d="M50 6 Q61 17 64.5 30 H35.5 Q39 17 50 6Z" fill="${RED}"/>
    <circle cx="50" cy="48" r="9.5" fill="${GLASS}"/>`,
  schluessel: () => `<path d="M40 50 H90 M74 50 V64 M87 50 V61" stroke-width="12.5"/><circle cx="25" cy="50" r="14" stroke-width="12.5"/>
    <path d="M40 50 H90 M74 50 V64 M87 50 V61" stroke="${GOLD}" stroke-width="6"/><circle cx="25" cy="50" r="14" stroke="${GOLD}" stroke-width="6"/>`,
};

export const PIC_NAMES = Object.keys(PICS);

export function picture(name) {
  const draw = PICS[name];
  return `<svg class="pic" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">${draw ? draw() : ''}</g></svg>`;
}
