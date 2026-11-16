// Wortbilder: jede Zeichnung im 100×100-Raster, gleicher Strich, gleiche Farbwelt.
import { INK } from '../engine/util.js';
import { starPoints } from './icons.js';

const RED = '#ea4630', GOLD = '#ffcb3d', GOLD2 = '#f0a020', YEL = '#ffd23f';
const WOOD = '#b0703f', WOOD2 = '#8a5530', G1 = '#45b565', G2 = '#2c8f4b';
const BLUE = '#2f86d8', GLASS = '#9fdcf0', PINK = '#ff7e9d', CREAM = '#fff4dc';
const SEA = '#2f9fd0';
const SKIN = '#f5c9a3', GREY = '#aab3bf', DARK = '#4a4a55';

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

  // ---------- Erweiterung: weitere Wortbilder ----------
  schuh: () => `<path d="M12 64 Q14 48 26 48 L40 42 Q52 58 70 60 Q88 62 88 76 V78 H12Z" fill="${RED}"/>
    <path d="M10 78 H90 V87 H10Z" fill="#fff"/>
    <path d="M42 52 L50 46 M49 58 L57 53" stroke="#fff" stroke-width="3"/>`,
  schaf: () => `<path d="M40 76 V92 M64 76 V92" stroke-width="6"/>
    <path d="M30 74 Q14 72 18 58 Q14 44 30 44 Q34 30 50 34 Q62 24 72 36 Q88 34 88 50 Q96 60 86 70 Q82 80 68 76 Q56 84 46 76 Q36 82 30 74Z" fill="#fff"/>
    <ellipse cx="24" cy="54" rx="12" ry="14" fill="${DARK}"/>
    <circle cx="20" cy="50" r="2.6" fill="#fff" stroke="none"/><circle cx="29" cy="50" r="2.6" fill="#fff" stroke="none"/>`,
  schere: () => `${tube('M32 14 L64 62 M68 14 L36 62', '#c5ccd6', 6)}
    <circle cx="30" cy="76" r="11" stroke-width="11"/><circle cx="70" cy="76" r="11" stroke-width="11"/>
    <circle cx="30" cy="76" r="11" stroke="${RED}" stroke-width="5"/><circle cx="70" cy="76" r="11" stroke="${RED}" stroke-width="5"/>
    ${eye(50, 41, 3)}`,
  schal: () => `<path d="M56 34 H76 V82 H56Z" fill="${RED}"/>
    <path d="M56 82 V92 M63 82 V92 M70 82 V92 M76 82 V92" stroke-width="3"/>
    <path d="M16 26 Q50 12 84 26 V44 Q50 30 16 44Z" fill="${RED}"/>
    <path d="M56 50 H76 M56 66 H76 M34 20 V36 M64 20 V34" stroke="#fff" stroke-width="4"/>`,
  schnecke: () => `<path d="M22 60 L16 44 M30 60 L32 44"/>
    <path d="M10 84 Q8 62 24 60 Q36 60 36 72 L88 76 Q94 86 84 86 H16 Q10 88 10 84Z" fill="#f5c98a"/>
    <circle cx="60" cy="54" r="25" fill="${WOOD}"/>
    <path d="M60 54 m-13 0 a13 13 0 1 1 13 13 a7 7 0 1 1 -7 -7" stroke="${WOOD2}" stroke-width="3.5"/>
    ${eye(16, 43, 3)}${eye(32, 43, 3)}<path d="M16 76 Q20 79 24 76" stroke-width="2.5"/>`,
  schwein: () => `<path d="M24 36 L18 14 L42 26Z" fill="#ff9dbb"/><path d="M76 36 L82 14 L58 26Z" fill="#ff9dbb"/>
    <circle cx="50" cy="56" r="33" fill="#ffb9cf"/>
    <ellipse cx="50" cy="64" rx="15" ry="11" fill="#ff8fb3"/>
    ${eye(45, 64, 2.6)}${eye(55, 64, 2.6)}${eye(37, 47, 3.4)}${eye(63, 47, 3.4)}`,
  schirm: () => `<path d="M50 14 V6"/>
    ${tube('M50 50 V82 Q50 92 41 92 Q34 92 34 84', WOOD2, 4)}
    <path d="M8 54 Q8 14 50 14 Q92 14 92 54 Q81 44 71 54 Q60 44 50 54 Q40 44 29 54 Q19 44 8 54Z" fill="${RED}"/>
    <path d="M50 14 Q38 30 29 54 M50 14 Q62 30 71 54" stroke-width="2.5"/>`,
  tasche: () => `${tube('M34 40 Q34 16 50 16 Q66 16 66 40', WOOD2, 5)}
    <rect x="16" y="38" width="68" height="50" rx="9" fill="${WOOD}"/>
    <path d="M16 54 H84" stroke="${WOOD2}" stroke-width="3"/>
    <rect x="42" y="48" width="16" height="14" rx="3" fill="${GOLD}"/>`,
  flasche: () => `<rect x="42" y="4" width="16" height="9" rx="2" fill="${WOOD}"/>
    <path d="M42 12 H58 V30 Q72 38 72 54 V86 Q72 92 66 92 H34 Q28 92 28 86 V54 Q28 38 42 30Z" fill="#8fd9b6"/>
    <rect x="34" y="56" width="32" height="22" rx="3" fill="#fff"/>
    ${shine('M36 44 Q34 48 34 52')}`,
  leiter: () => `${tube('M32 6 V94 M68 6 V94 M32 22 H68 M32 40 H68 M32 58 H68 M32 76 H68', '#d9a066', 6)}`,
  stein: () => `<path d="M10 80 Q6 56 26 44 Q42 22 66 36 Q92 44 92 70 Q92 84 78 86 H22 Q12 86 10 80Z" fill="${GREY}"/>
    <path d="M40 40 L48 54 L42 64 M66 50 L60 62" stroke="#7d8794" stroke-width="2.5"/>
    ${shine('M24 58 Q26 50 34 46')}`,
  kleid: () => `<path d="M38 10 L44 22 H56 L62 10 L72 18 L62 40 L84 88 H16 L38 40 L28 18Z" fill="#ff8fb8"/>
    <path d="M38 40 H62" stroke-width="4"/>
    <g fill="#fff" stroke="none"><circle cx="40" cy="60" r="3"/><circle cx="58" cy="56" r="3"/><circle cx="50" cy="74" r="3"/><circle cx="68" cy="76" r="3"/><circle cx="30" cy="78" r="3"/></g>`,
  eimer: () => `<path d="M22 36 Q50 -2 78 36"/>
    <path d="M20 36 H80 L71 88 H29Z" fill="${BLUE}"/>
    <ellipse cx="50" cy="36" rx="30" ry="7.5" fill="#7fb6ea"/>
    ${shine('M32 50 L35 74')}`,
  biene: () => `<ellipse cx="40" cy="27" rx="13" ry="17" fill="#e3f4fb"/><ellipse cx="62" cy="25" rx="13" ry="17" fill="#e3f4fb"/>
    <path d="M80 58 L93 58"/>
    <ellipse cx="50" cy="58" rx="31" ry="23" fill="${YEL}"/>
    <path d="M46 36 Q40 58 46 80 M62 37 Q56 58 62 79" stroke-width="7"/>
    ${eye(28, 54, 3.2)}<path d="M23 63 Q28 67 33 63" stroke-width="2.5"/>`,
  ziege: () => `${tube('M38 26 Q32 8 22 10 M62 26 Q68 8 78 10', '#b9a37a', 4)}
    <path d="M30 38 L10 44 L30 50Z" fill="#e6dbc4"/><path d="M70 38 L90 44 L70 50Z" fill="#e6dbc4"/>
    <path d="M44 74 Q50 98 56 74Z" fill="#f3ead8"/>
    <path d="M30 34 Q30 20 50 20 Q70 20 70 34 L66 68 Q50 84 34 68Z" fill="#f3ead8"/>
    ${eye(41, 42, 3.2)}${eye(59, 42, 3.2)}
    <path d="M45 64 H55 L50 69Z" fill="${PINK}"/>`,
  fliege: () => `<path d="M38 50 L24 44 M38 60 L22 62 M40 70 L28 80 M62 50 L76 44 M62 60 L78 62 M60 70 L72 80" stroke-width="2.5"/>
    <ellipse cx="29" cy="58" rx="20" ry="10" transform="rotate(-32 29 58)" fill="#e3f4fb"/>
    <ellipse cx="71" cy="58" rx="20" ry="10" transform="rotate(32 71 58)" fill="#e3f4fb"/>
    <ellipse cx="50" cy="62" rx="14" ry="22" fill="${DARK}"/>
    <circle cx="50" cy="34" r="11" fill="${DARK}"/>
    <circle cx="44" cy="31" r="5" fill="${RED}"/><circle cx="56" cy="31" r="5" fill="${RED}"/>`,
  brief: () => `<rect x="8" y="24" width="84" height="56" rx="4" fill="#fff"/>
    <path d="M8 26 L50 56 L92 26"/>
    <path d="M50 74 Q40 66 42 60 Q44 55 50 60 Q56 55 58 60 Q60 66 50 74Z" fill="${RED}" stroke-width="2.5"/>`,
  stiefel: () => `<path d="M30 8 H58 V56 Q84 58 88 74 V84 H30Z" fill="${YEL}"/>
    <path d="M28 84 H90 V92 H28Z" fill="${WOOD2}"/>
    <path d="M30 20 H58" stroke="${GOLD2}" stroke-width="4"/>
    ${shine('M38 30 V52')}`,
  zwiebel: () => `<path d="M50 26 Q46 12 38 8 M50 26 Q54 12 62 8" stroke="${G2}" stroke-width="5"/>
    <path d="M50 24 Q86 40 86 64 Q86 90 50 90 Q14 90 14 64 Q14 40 50 24Z" fill="#e9a36a"/>
    <path d="M50 30 Q34 58 44 88 M50 30 Q66 58 56 88" stroke="#c9824a" stroke-width="2.6"/>`,
  auge: () => `<path d="M22 34 L16 24 M36 26 L33 14 M50 23 V11 M64 26 L67 14 M78 34 L84 24" stroke-width="3"/>
    <path d="M6 54 Q50 16 94 54 Q50 92 6 54Z" fill="#fff"/>
    <circle cx="50" cy="54" r="18" fill="${BLUE}"/><circle cx="50" cy="54" r="8.5" fill="${INK}" stroke="none"/>
    <circle cx="56" cy="48" r="4" fill="#fff" stroke="none"/>`,
  zaun: () => `<rect x="6" y="44" width="88" height="9" fill="${WOOD}"/><rect x="6" y="68" width="88" height="9" fill="${WOOD}"/>
    ${[10, 32, 54, 76].map(x => `<path d="M${x} 90 V34 L${x + 7} 20 L${x + 14} 34 V90Z" fill="#e2b47a"/>`).join('')}`,
  raupe: () => `<path d="M80 36 L76 22 M88 38 L92 24"/>
    ${[[18, 68], [34, 58], [50, 64], [66, 58]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="14" fill="${G1}"/>`).join('')}
    <circle cx="83" cy="50" r="15" fill="#7fd893"/>
    ${eye(79, 47, 2.8)}${eye(89, 47, 2.8)}<path d="M79 56 Q84 60 89 56" stroke-width="2.5"/>
    <circle cx="76" cy="21" r="3" fill="${RED}" stroke-width="2"/><circle cx="92" cy="23" r="3" fill="${RED}" stroke-width="2"/>`,
  eule: () => `<path d="M26 30 L22 10 L42 24Z" fill="${WOOD2}"/><path d="M74 30 L78 10 L58 24Z" fill="${WOOD2}"/>
    <ellipse cx="50" cy="56" rx="30" ry="36" fill="${WOOD}"/>
    <ellipse cx="50" cy="68" rx="17" ry="20" fill="#f1d3a3" stroke="none"/>
    <path d="M42 62 q4 4 8 0 M50 62 q4 4 8 0 M46 72 q4 4 8 0" stroke="${WOOD}" stroke-width="2.5"/>
    <circle cx="37" cy="42" r="13" fill="#fff"/><circle cx="63" cy="42" r="13" fill="#fff"/>
    ${eye(38, 43, 5)}${eye(62, 43, 5)}
    <path d="M45 52 H55 L50 60Z" fill="${GOLD2}"/>`,
  feuer: () => `${tube('M20 92 L80 82 M20 82 L80 92', WOOD, 6)}
    <path d="M50 6 Q76 32 70 50 Q86 44 82 64 Q82 86 50 86 Q18 86 18 64 Q16 48 34 38 Q36 54 44 50 Q36 28 50 6Z" fill="#ff7a2e"/>
    <path d="M50 40 Q64 54 62 66 Q62 80 50 80 Q38 80 38 68 Q38 60 44 54 Q46 62 50 60 Q46 50 50 40Z" fill="${YEL}" stroke="none"/>`,
  kreuz: () => `<path d="M37 10 H63 V37 H90 V63 H63 V90 H37 V63 H10 V37 H37Z" fill="${RED}"/>
    ${shine('M43 18 H56')}`,
  stuhl: () => `<rect x="26" y="56" width="9" height="36" fill="${WOOD2}"/><rect x="65" y="56" width="9" height="36" fill="${WOOD2}"/>
    <rect x="28" y="8" width="44" height="38" rx="5" fill="#b97a45"/>
    <path d="M40 14 V40 M50 14 V40 M60 14 V40" stroke="${WOOD2}" stroke-width="3"/>
    <rect x="20" y="46" width="60" height="12" rx="4" fill="${WOOD}"/>`,
  stift: () => `<g transform="rotate(38 50 50)">
      <rect x="39" y="2" width="22" height="12" rx="4" fill="#ff8fa3"/>
      <rect x="39" y="14" width="22" height="8" fill="#cfd4dc"/>
      <rect x="39" y="22" width="22" height="50" fill="${YEL}"/>
      <path d="M39 72 H61 L50 96Z" fill="#f6dcae"/><path d="M45.5 86 H54.5 L50 96Z" fill="${INK}"/>
    </g>`,
  spinne: () => `<path d="M50 26 V4" stroke-width="2.5"/>
    <path d="M36 50 Q20 38 10 50 M34 58 Q16 58 8 72 M38 66 Q26 78 20 92 M40 44 Q28 26 14 28 M64 50 Q80 38 90 50 M66 58 Q84 58 92 72 M62 66 Q74 78 80 92 M60 44 Q72 26 86 28" stroke-width="3"/>
    <circle cx="50" cy="60" r="19" fill="${DARK}"/><circle cx="50" cy="36" r="11" fill="${DARK}"/>
    <circle cx="46" cy="34" r="3" fill="#fff" stroke="none"/><circle cx="54" cy="34" r="3" fill="#fff" stroke="none"/>`,
  dach: () => `<rect x="62" y="14" width="12" height="26" fill="${WOOD}"/>
    <rect x="18" y="70" width="64" height="18" fill="#fde9bd"/>
    <path d="M4 72 L50 18 L96 72Z" fill="${RED}"/>
    <path d="M30 46 H70 M20 58 H80 M40 34 H60" stroke="#c9321f" stroke-width="2.6"/>`,
  kuchen: () => `<ellipse cx="50" cy="86" rx="44" ry="7" fill="#fff"/>
    <rect x="14" y="48" width="72" height="36" rx="6" fill="#f6c88a"/>
    <path d="M14 56 Q14 44 24 44 H76 Q86 44 86 56 Q78 66 70 57 Q62 67 54 57 Q46 67 38 57 Q30 67 22 57Q16 60 14 56Z" fill="#ff8fb8"/>
    <rect x="47" y="24" width="6" height="20" fill="${BLUE}"/>
    <path d="M50 10 Q56 18 50 24 Q44 18 50 10Z" fill="${GOLD2}" stroke-width="2.5"/>`,
  milch: () => `<path d="M30 30 L50 10 L70 30 V90 H30Z" fill="#fff"/>
    <path d="M30 30 H70 M50 10 V30"/>
    <rect x="30" y="48" width="40" height="22" fill="${BLUE}" stroke-width="2.5"/>
    <path d="M50 52 Q57 61 50 66 Q43 61 50 52Z" fill="#fff" stroke="none"/>`,
  becher: () => `<path d="M58 28 L70 4" stroke="${RED}" stroke-width="5"/>
    <path d="M24 24 H76 L69 90 H31Z" fill="${BLUE}"/>
    <path d="M26 38 H74" stroke="#fff" stroke-width="4" opacity=".8"/>`,
  puppe: () => `<path d="M36 50 L18 64 M64 50 L82 64" stroke-width="6"/><path d="M36 50 L18 64 M64 50 L82 64" stroke="${SKIN}" stroke-width="3"/>
    <path d="M36 44 H64 L80 90 H20Z" fill="#ff8fb8"/>
    <path d="M32 30 Q22 44 30 50 M68 30 Q78 44 70 50" stroke="${WOOD2}" stroke-width="8"/>
    <circle cx="50" cy="28" r="18" fill="${SKIN}"/>
    <path d="M33 24 Q40 8 50 10 Q62 8 67 24 Q58 16 50 18 Q42 16 33 24Z" fill="${WOOD2}"/>
    ${eye(43, 30, 2.6)}${eye(57, 30, 2.6)}<path d="M44 37 Q50 42 56 37" stroke-width="2.5"/>`,
  tasse: () => `<path d="M38 22 q-6 -6 0 -12 M52 22 q-6 -6 0 -12" stroke="#9aa7b5" stroke-width="3"/>
    <ellipse cx="46" cy="88" rx="38" ry="6" fill="#fff"/>
    <path d="M68 44 Q90 42 90 58 Q90 72 66 72" stroke-width="5"/>
    <path d="M16 34 H72 V62 Q72 84 52 84 H36 Q16 84 16 62Z" fill="${BLUE}"/>
    ${shine('M24 44 V62')}`,
  kanne: () => `<path d="M24 54 Q8 50 10 32 L20 32 Q20 44 30 46Z" fill="#fff"/>
    <path d="M74 44 Q94 44 92 60 Q90 74 72 74" stroke-width="5"/>
    <ellipse cx="50" cy="60" rx="29" ry="26" fill="#fff"/>
    <path d="M30 40 Q50 28 70 40" fill="${BLUE}"/><circle cx="50" cy="29" r="5" fill="${BLUE}"/>
    <path d="M26 66 Q50 76 74 66" stroke="${BLUE}" stroke-width="5"/>`,
  loeffel: () => `${tube('M50 44 V92', '#c5ccd6', 6)}
    <ellipse cx="50" cy="26" rx="17" ry="21" fill="#d9dfe6"/>
    ${shine('M42 18 Q40 26 43 34')}`,
  koffer: () => `<path d="M38 32 V20 H62 V32"  stroke-width="5"/>
    <rect x="10" y="30" width="80" height="56" rx="8" fill="${WOOD}"/>
    <g stroke-linecap="butt"><path d="M30 30 V86 M70 30 V86" stroke-width="11"/><path d="M30 32 V84 M70 32 V84" stroke="${GOLD}" stroke-width="5"/></g>
    <rect x="44" y="50" width="12" height="10" rx="2" fill="${GOLD}"/>`,
  hammer: () => `<rect x="44" y="34" width="12" height="60" rx="3" fill="${WOOD}"/>
    <path d="M18 12 H70 Q84 14 86 26 Q84 38 70 38 H18Z" fill="${GREY}"/>
    ${shine('M26 20 H56')}`,
  brille: () => `<path d="M10 54 L2 44 M90 54 L98 44 M43 52 Q50 44 57 52" stroke-width="4"/>
    <circle cx="27" cy="56" r="17" fill="${GLASS}" stroke-width="5"/><circle cx="73" cy="56" r="17" fill="${GLASS}" stroke-width="5"/>
    ${shine('M18 50 Q20 44 26 43')}${shine('M64 50 Q66 44 72 43')}`,
  bett: () => `<rect x="8" y="24" width="11" height="66" rx="3" fill="${WOOD2}"/><rect x="82" y="46" width="10" height="44" rx="3" fill="${WOOD2}"/>
    <rect x="19" y="58" width="63" height="18" fill="#fff"/>
    <ellipse cx="32" cy="54" rx="13" ry="8" fill="#fff"/>
    <rect x="42" y="50" width="40" height="26" rx="5" fill="${BLUE}"/>
    <path d="M52 50 V76 M62 50 V76 M72 50 V76" stroke="#7fb6ea" stroke-width="2.5"/>`,
  hose: () => `<path d="M26 10 H74 L82 90 H56 L50 40 L44 90 H18Z" fill="${BLUE}"/>
    <path d="M26 20 H74" stroke-width="3"/>
    <path d="M32 26 Q36 34 42 28 M68 26 Q64 34 58 28" stroke="#7fb6ea" stroke-width="2.5"/>`,
  dose: () => `<path d="M22 26 V78 Q22 90 50 90 Q78 90 78 78 V26Z" fill="#d9dfe6"/>
    <path d="M22 42 Q50 54 78 42 V66 Q50 78 22 66Z" fill="${RED}"/>
    <ellipse cx="50" cy="26" rx="28" ry="10" fill="#eef1f5"/>
    <ellipse cx="50" cy="26" rx="14" ry="4.5" fill="none" stroke-width="2.5"/>`,
  rose: () => `${tube('M50 50 V94', G2, 4)}
    <path d="M50 74 Q34 62 26 74 Q36 86 50 74Z" fill="${G1}"/>
    <path d="M50 62 L58 58 M50 82 L42 78" stroke-width="2.5"/>
    <circle cx="50" cy="30" r="22" fill="${RED}"/>
    <path d="M50 30 m-9 0 a9 9 0 1 1 9 9 a5 5 0 1 1 -5 -5 M34 22 Q40 34 36 42 M66 22 Q60 34 64 42" stroke="#b5251a" stroke-width="2.6"/>`,
  hase: () => `<path d="M34 42 Q24 4 38 4 Q48 6 45 42Z" fill="#eadfce"/><path d="M66 42 Q76 4 62 4 Q52 6 55 42Z" fill="#eadfce"/>
    <path d="M36 34 Q32 14 38 12 Q42 14 41 34Z" fill="#ffb3c7" stroke="none"/><path d="M64 34 Q68 14 62 12 Q58 14 59 34Z" fill="#ffb3c7" stroke="none"/>
    <circle cx="50" cy="62" r="27" fill="#eadfce"/>
    ${eye(40, 56, 3.4)}${eye(60, 56, 3.4)}
    <rect x="46" y="72" width="8" height="9" rx="2" fill="#fff"/>
    <path d="M46 66 H54 L50 71Z" fill="${PINK}"/>
    <path d="M30 66 L14 62 M30 71 L14 76 M70 66 L86 62 M70 71 L86 76" stroke-width="2.5"/>`,
  nase: () => `<path d="M52 8 Q50 42 30 62 Q22 80 44 82 Q54 82 58 76 Q66 82 78 74 Q86 64 74 50 Q66 34 68 8Z" fill="${SKIN}"/>
    <path d="M40 72 Q44 66 50 72 M64 72 Q70 68 74 70" stroke-width="3"/>`,
  vase: () => `<path d="M38 8 H62 Q58 24 66 38 Q82 62 66 84 Q62 92 50 92 Q38 92 34 84 Q18 62 34 38 Q42 24 38 8Z" fill="${BLUE}"/>
    <path d="M27 56 L35 48 L43 56 L50 48 L57 56 L65 48 L73 56" stroke="${YEL}" stroke-width="3.5"/>
    ${shine('M34 68 Q36 78 40 82')}`,
  hand: () => `<rect x="10" y="48" width="12" height="30" rx="6" transform="rotate(-38 16 63)" fill="${SKIN}"/>
    <rect x="27" y="20" width="11" height="40" rx="5.5" fill="${SKIN}"/><rect x="39" y="10" width="11" height="48" rx="5.5" fill="${SKIN}"/>
    <rect x="51" y="14" width="11" height="44" rx="5.5" fill="${SKIN}"/><rect x="63" y="26" width="11" height="34" rx="5.5" fill="${SKIN}"/>
    <path d="M26 52 H75 V74 Q75 92 50 92 Q26 92 26 74Z" fill="${SKIN}"/>
    <path d="M27 54 H74" stroke="${SKIN}" stroke-width="5"/>`,
  topf: () => `<rect x="6" y="46" width="14" height="8" rx="3" fill="${DARK}"/><rect x="80" y="46" width="14" height="8" rx="3" fill="${DARK}"/>
    <rect x="18" y="38" width="64" height="48" rx="7" fill="${GREY}"/>
    <path d="M16 38 Q50 16 84 38Z" fill="#c5ccd6"/>
    <circle cx="50" cy="22" r="5.5" fill="${DARK}"/>
    ${shine('M28 48 V72')}`,
  tonne: () => `<path d="M26 12 H74 Q88 50 74 88 H26 Q12 50 26 12Z" fill="${WOOD}"/>
    <path d="M40 12 Q36 50 40 88 M60 12 Q64 50 60 88" stroke="${WOOD2}" stroke-width="2.6"/>
    <path d="M21 30 H79 M21 70 H79" stroke-width="9"/><path d="M21 30 H79 M21 70 H79" stroke="#8c9bab" stroke-width="4.5"/>`,
  tanne: () => `<rect x="44" y="78" width="12" height="16" fill="${WOOD}"/>
    <path d="M50 6 L72 34 H61 L81 58 H66 L90 82 H10 L34 58 H19 L39 34 H28Z" fill="${G2}"/>
    <path d="M44 28 L50 20 M38 52 L46 44 M30 76 L40 66" stroke="#5fcc7c" stroke-width="3"/>`,
  kuh: () => `<path d="M32 20 Q24 8 16 12 M68 20 Q76 8 84 12" stroke-width="5"/>
    <path d="M28 34 L8 30 L24 46Z" fill="#fff"/><path d="M72 34 L92 30 L76 46Z" fill="#fff"/>
    <path d="M28 32 Q28 16 50 16 Q72 16 72 32 L68 62 Q66 88 50 88 Q34 88 32 62Z" fill="#fff"/>
    <path d="M30 26 Q40 20 44 30 Q42 44 32 42Z" fill="${DARK}" stroke="none"/><path d="M62 18 Q72 22 71 34 Q64 36 60 28Z" fill="${DARK}" stroke="none"/>
    <ellipse cx="50" cy="72" rx="19" ry="13" fill="#ffb9cf"/>
    ${eye(43, 72, 2.6)}${eye(57, 72, 2.6)}${eye(40, 46, 3.2)}${eye(60, 46, 3.2)}`,
  mund: () => `<path d="M8 50 Q30 24 44 34 Q50 38 56 34 Q70 24 92 50 Q70 82 50 82 Q30 82 8 50Z" fill="${RED}"/>
    <path d="M18 50 Q50 40 82 50 Q50 68 18 50Z" fill="#fff"/>
    <path d="M34 47 V58 M50 45 V61 M66 47 V58" stroke-width="2.2"/>`,
  baer: () => `<circle cx="24" cy="30" r="13" fill="${WOOD}"/><circle cx="76" cy="30" r="13" fill="${WOOD}"/>
    <circle cx="24" cy="30" r="6" fill="#e2b47a" stroke="none"/><circle cx="76" cy="30" r="6" fill="#e2b47a" stroke="none"/>
    <circle cx="50" cy="56" r="33" fill="${WOOD}"/>
    <ellipse cx="50" cy="66" rx="16" ry="13" fill="#e2b47a" stroke="none"/>
    ${eye(38, 50, 3.4)}${eye(62, 50, 3.4)}
    <ellipse cx="50" cy="60" rx="6" ry="4.5" fill="${INK}" stroke="none"/>
    <path d="M50 64 V70 M43 71 Q50 77 57 71"/>`,
  frosch: () => `<circle cx="30" cy="34" r="14" fill="${G1}"/><circle cx="70" cy="34" r="14" fill="${G1}"/>
    <ellipse cx="50" cy="60" rx="40" ry="28" fill="${G1}"/>
    <circle cx="30" cy="33" r="8" fill="#fff" stroke-width="2.5"/><circle cx="70" cy="33" r="8" fill="#fff" stroke-width="2.5"/>
    ${eye(31, 34, 3.6)}${eye(69, 34, 3.6)}
    <path d="M24 62 Q50 84 76 62"/>${eye(45, 54, 1.8)}${eye(55, 54, 1.8)}
    <ellipse cx="50" cy="78" rx="14" ry="6" fill="#bfeecb" stroke="none"/>`,
  igel: () => `<path d="M30 86 V92 M64 86 V92" stroke-width="5"/>
    <path d="M22 82 Q14 62 26 50 L22 36 L36 42 L40 26 L50 36 L58 22 L64 36 L78 28 L76 44 L90 44 L82 56 Q94 70 86 82Z" fill="${WOOD2}"/>
    <path d="M24 82 Q4 80 6 68 Q14 54 34 58 Q42 72 36 82Z" fill="#f5d9b0"/>
    <circle cx="7" cy="68" r="3.6" fill="${INK}" stroke="none"/>${eye(22, 64, 3)}`,
};

export const PIC_NAMES = Object.keys(PICS);

export function picture(name) {
  const draw = PICS[name];
  return `<svg class="pic" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">${draw ? draw() : ''}</g></svg>`;
}
