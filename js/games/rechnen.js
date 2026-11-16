// Recheninsel: Plus und Minus mit Rechenschiffchen (Zehner-/Zwanzigerfeld) und Zahlentasten.
import { INK, rnd, wait } from '../engine/util.js';
import { P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { ICON } from '../art/icons.js';

const GEN = {
  plus10: () => { const a = rnd(1, 9); return { a, b: rnd(1, 10 - a), op: '+' }; },
  minus10: () => { const a = rnd(2, 10); return { a, b: rnd(1, a - 1), op: '-' }; },
  plus20: () => { const a = rnd(10, 18); return { a, b: rnd(1, Math.min(9, 20 - a)), op: '+' }; },
  cross10: () => { const a = rnd(3, 9); return { a, b: rnd(11 - a, 9), op: '+' }; },
  minus20: () => { const a = rnd(11, 20); return { a, b: rnd(1, 9), op: '-' }; },
};

// Bei den ersten Stationen sind die Münzen immer zu sehen, später nur als Hilfe.
const FRAME = { plus10: 'always', minus10: 'always', plus20: 'hint', cross10: 'always', minus20: 'hint' };

/** Rechenschiffchen: je Boot 10 Plätze (5 + 5). Gold = erste Zahl, Rubin = dazu, Kreuz = weg. */
function frameSvg({ a, b, op }) {
  const total = op === '+' ? a + b : a;
  const rows = total > 10 ? 2 : 1;
  let s = '';
  for (let r = 0; r < rows; r++) {
    const y = r * 74;
    s += `<path d="M10 ${y + 4} H468 Q500 ${y + 6} 520 ${y + 35} Q500 ${y + 64} 468 ${y + 66} H10 Q3 ${y + 66} 3 ${y + 58} V${y + 12} Q3 ${y + 4} 10 ${y + 4}Z" fill="#b0703f" stroke="${INK}" stroke-width="3.5"/>`;
  }
  for (let i = 0; i < rows * 10; i++) {
    const row = Math.floor(i / 10), col = i % 10;
    const x = 14 + col * 45 + (col >= 5 ? 14 : 0), y = 14 + row * 74;
    const cx = x + 21, cy = y + 21;
    s += `<rect x="${x}" y="${y}" width="42" height="42" rx="10" fill="#8a5530" stroke="${INK}" stroke-width="2.5"/>`;
    if (i >= total) continue;
    const gone = op === '-' && i >= a - b;
    const added = op === '+' && i >= a;
    const d = (i * 0.035).toFixed(2);
    if (added) {
      s += `<g class="chip" style="animation-delay:${d}s"><circle cx="${cx}" cy="${cy}" r="16" fill="#f0553f" stroke="${INK}" stroke-width="3"/>
        <path d="M${cx - 8} ${cy - 5} Q${cx - 5} ${cy - 10} ${cx + 1} ${cy - 10}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></g>`;
    } else {
      s += `<g class="chip${gone ? ' gone' : ''}" style="animation-delay:${d}s"><circle cx="${cx}" cy="${cy}" r="16" fill="#ffcb3d" stroke="${INK}" stroke-width="3"/>
        <circle cx="${cx}" cy="${cy}" r="9.5" fill="none" stroke="#e9a21f" stroke-width="2.5"/></g>`;
      if (gone) s += `<path d="M${cx - 13} ${cy - 13} L${cx + 13} ${cy + 13} M${cx + 13} ${cy - 13} L${cx - 13} ${cy + 13}" stroke="#d8372a" stroke-width="5" stroke-linecap="round"/>`;
    }
  }
  return `<svg class="frame-svg" viewBox="0 0 524 ${rows * 74 - 4}" aria-hidden="true">${s}</svg>`;
}

export const rechnen = {
  intro: () => P('calc_intro'),

  makeTasks({ kind, n = 8 }) {
    const seen = new Set();
    const out = [];
    for (let guard = 0; out.length < n && guard < 300; guard++) {
      const t = GEN[kind]();
      const key = t.a + t.op + t.b;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...t, frame: FRAME[kind] });
    }
    return out;
  },

  mount(root, t, api) {
    const answer = t.op === '+' ? t.a + t.b : t.a - t.b;
    let entry = '';
    let tries = 0;
    let locked = false;

    root.innerHTML = `<div class="calc">
      <div class="calc-left">
        <div class="frame panel${t.frame === 'always' ? '' : ' is-hidden'}">${frameSvg(t)}</div>
        <div class="equation panel">
          <span>${t.a}</span><span class="op">${t.op === '+' ? '+' : '−'}</span><span>${t.b}</span><span class="op">=</span><span class="slot"></span>
        </div>
        ${t.frame === 'hint' ? `<button class="hint-btn">${ICON.bulb}<span>Hilfe</span></button>` : ''}
      </div>
      <div class="numpad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-k="${n}">${n}</button>`).join('')}
        <button class="key key-del" data-k="del" aria-label="Löschen">${ICON.del}</button>
        <button class="key" data-k="0">0</button>
        <button class="key key-ok" data-k="ok" aria-label="Fertig" disabled>${ICON.check}</button>
      </div>
    </div>`;

    const slot = root.querySelector('.slot');
    const frame = root.querySelector('.frame');
    const ok = root.querySelector('.key-ok');
    const hintBtn = root.querySelector('.hint-btn');

    const render = () => {
      slot.textContent = entry;
      slot.classList.toggle('filled', entry !== '');
      ok.disabled = entry === '';
    };
    const showFrame = () => {
      frame.classList.remove('is-hidden');
      if (hintBtn) hintBtn.hidden = true;
    };

    if (hintBtn) hintBtn.addEventListener('click', () => { sfx('pop'); showFrame(); });

    async function submit() {
      if (entry === '' || locked) return;
      if (Number(entry) === answer) {
        locked = true;
        slot.classList.add('ok');
        await api.correct({ target: slot });
        api.done(tries === 0);
        return;
      }
      tries++;
      if (tries < 2) {
        showFrame();
        api.wrong({ target: slot, say: P('calc_hint') });
        entry = '';
        render();
      } else {
        locked = true;
        showFrame();
        sfx('wrong');
        slot.textContent = answer;
        slot.classList.add('filled', 'shown');
        await Promise.all([api.koko.say(P('solution')), wait(2200)]);
        api.done(false);
      }
    }

    root.querySelector('.numpad').addEventListener('click', e => {
      const key = e.target.closest('.key');
      if (!key || locked || key.disabled) return;
      const k = key.dataset.k;
      if (k === 'ok') return submit();
      sfx('tap');
      if (k === 'del') entry = entry.slice(0, -1);
      else if (entry.length < 2) entry = entry === '0' ? k : entry + k;
      render();
    });
  },
};
