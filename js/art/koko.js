// Koko, der Papagei – Begleiter des Kindes. Reine SVG-Zeichnung, per CSS animiert.
import { INK, h } from '../engine/util.js';
import { speak, sfx } from '../engine/audio.js';

const R = '#ea4630', BELLY = '#ff8a66', B = '#2f86d8', B2 = '#1f66b3';
const Y = '#ffcb3d', Y2 = '#f0a020', CREAM = '#fff4dc';

export function kokoSvg() {
  return `<svg class="koko-svg" viewBox="0 0 200 252" aria-hidden="true">
  <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g class="koko-tail">
      <path d="M86 196 Q72 228 70 248 Q88 238 96 210Z" fill="${B}"/>
      <path d="M114 196 Q128 228 130 248 Q112 238 104 210Z" fill="${B}"/>
      <path d="M93 198 Q94 234 100 250 Q106 234 107 198Z" fill="${Y}"/>
    </g>
    <ellipse cx="100" cy="234" rx="70" ry="7" fill="#3b2a20" opacity=".16" stroke="none"/>
    <rect x="30" y="212" width="140" height="15" rx="7.5" fill="#b0703f"/>
    <path d="M44 219 H70 M120 219 H150" stroke="#8a5530" stroke-width="3"/>
    <g class="koko-body">
      <g class="koko-wing koko-wing-l">
        <path d="M62 130 Q24 152 30 202 Q56 196 70 168Z" fill="${B}"/>
        <path d="M40 176 Q46 184 44 196 M50 170 Q57 180 56 192" stroke="${B2}" stroke-width="3" fill="none"/>
      </g>
      <g class="koko-wing koko-wing-r">
        <path d="M138 130 Q176 152 170 202 Q144 196 130 168Z" fill="${B}"/>
        <path d="M160 176 Q154 184 156 196 M150 170 Q143 180 144 192" stroke="${B2}" stroke-width="3" fill="none"/>
      </g>
      <ellipse cx="100" cy="164" rx="45" ry="53" fill="${R}"/>
      <path d="M66 140 Q70 122 84 116" fill="none" stroke="#ff8f7d" stroke-width="6"/>
      <ellipse cx="100" cy="178" rx="27" ry="31" fill="${BELLY}" stroke="none"/>
      <path d="M88 168 q5 5 10 0 M102 168 q5 5 10 0 M95 182 q5 5 10 0" stroke="${R}" stroke-width="3" fill="none"/>
      <g fill="${Y2}">
        <ellipse cx="84" cy="217" rx="11" ry="7.5"/>
        <ellipse cx="116" cy="217" rx="11" ry="7.5"/>
      </g>
      <g class="koko-head">
        <circle cx="100" cy="90" r="50" fill="${R}"/>
        <path d="M60 70 Q72 48 98 44" fill="none" stroke="#ff8f7d" stroke-width="7"/>
        <ellipse cx="77" cy="94" rx="23" ry="25" fill="${CREAM}" stroke="none"/>
        <ellipse cx="123" cy="94" rx="23" ry="25" fill="${CREAM}" stroke="none"/>
        <g class="koko-eye">
          <circle cx="79" cy="90" r="11.5" fill="${INK}" stroke="none"/>
          <circle cx="83.5" cy="85.5" r="4.2" fill="#fff" stroke="none"/>
          <circle cx="75.5" cy="94" r="2" fill="#fff" stroke="none" opacity=".7"/>
        </g>
        <g class="koko-eye">
          <circle cx="121" cy="90" r="11.5" fill="${INK}" stroke="none"/>
          <circle cx="125.5" cy="85.5" r="4.2" fill="#fff" stroke="none"/>
          <circle cx="117.5" cy="94" r="2" fill="#fff" stroke="none" opacity=".7"/>
        </g>
        <circle cx="58" cy="110" r="7" fill="#ff9d8a" stroke="none" opacity=".9"/>
        <circle cx="142" cy="110" r="7" fill="#ff9d8a" stroke="none" opacity=".9"/>
        <path class="koko-beak-low" d="M89 118 Q100 142 111 118Z" fill="#6b4630"/>
        <path d="M82 102 Q100 86 118 102 Q118 122 100 134 Q82 122 82 102Z" fill="${Y}"/>
        <path d="M92 102 Q100 97 108 102" fill="none" stroke="${Y2}" stroke-width="3"/>
        <path d="M38 60 Q58 8 100 5 Q142 8 162 60 Q130 43 100 43 Q70 43 38 60Z" fill="#2f2a3d"/>
        <path d="M47 53 Q73 39.5 100 39.5 Q127 39.5 153 53" fill="none" stroke="${Y}" stroke-width="4.5"/>
        <path d="M100 11 l3.6 7.6 8.3 1 -6.1 5.7 1.6 8.2 -7.4 -4.1 -7.4 4.1 1.6 -8.2 -6.1 -5.7 8.3 -1Z" fill="${Y}" stroke-width="2.5"/>
      </g>
    </g>
  </g>
</svg>`;
}

/**
 * Koko mit Sprechblase. say() zeigt den Text und spricht ihn,
 * show() zeigt ihn nur. Antippen wiederholt den letzten Text.
 */
export function createKoko() {
  const el = h(`<div class="koko">
    <button class="koko-bird" aria-label="Koko wiederholt">${kokoSvg()}</button>
    <div class="bubble" hidden><span></span></div>
  </div>`);
  const bird = el.querySelector('.koko-bird');
  const bubble = el.querySelector('.bubble');
  const span = bubble.querySelector('span');
  let last = '';
  let talkId = 0;

  function show(text) {
    last = text;
    span.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('pop');
    void bubble.offsetWidth;
    bubble.classList.add('pop');
  }

  async function say(text) {
    show(text);
    await talk(text);
  }

  /** Spricht, ohne die Sprechblase zu ändern – z. B. ein Wort, das das Kind gerade schreibt. */
  async function talk(text) {
    const id = ++talkId;
    el.classList.add('talking');
    await speak(text);
    if (id === talkId) el.classList.remove('talking');
  }

  function cheer() {
    el.classList.remove('cheer');
    void el.offsetWidth;
    el.classList.add('cheer');
  }

  bird.addEventListener('click', () => {
    sfx('tap');
    if (last) say(last);
  });

  return { el, say, talk, show, cheer };
}
