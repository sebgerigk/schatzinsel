// Recheninsel: Plus, Minus, Zehnerfreunde, Verdoppeln, Halbieren und Lücken-Aufgaben –
// immer mit Rechenschiffchen (Zehner-/Zwanzigerfeld) als Anschauung und Zahlentasten.
import { INK, rnd, pick, wait } from '../engine/util.js';
import { P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { ICON } from '../art/icons.js';

// Jede Aufgabe: a (op) b = c. „hide" sagt, welche Zahl das Kind finden soll.
const GEN = {
  plus10: () => { const a = rnd(1, 9); return { a, b: rnd(1, 10 - a), op: '+', hide: 'c' }; },
  minus10: () => { const a = rnd(2, 10); return { a, b: rnd(1, a - 1), op: '-', hide: 'c' }; },
  plus20: () => { const a = rnd(10, 18); return { a, b: rnd(1, Math.min(9, 20 - a)), op: '+', hide: 'c' }; },
  cross10: () => { const a = rnd(3, 9); return { a, b: rnd(11 - a, 9), op: '+', hide: 'c' }; },
  minus20: () => { const a = rnd(11, 20); return { a, b: rnd(1, 9), op: '-', hide: 'c' }; },
  // Zehnerfreunde: 7 + _ = 10
  bonds10: () => { const a = rnd(1, 9); return { a, b: 10 - a, op: '+', hide: 'b' }; },
  // Verdoppeln: 6 + 6 = _
  double: () => { const a = rnd(1, 10); return { a, b: a, op: '+', hide: 'c', layout: 'double' }; },
  // Halbieren: Die Hälfte von 12 = _
  half: () => { const a = rnd(1, 10); return { a, b: a, op: '+', hide: 'half', layout: 'double' }; },
  // Welche Zahl fehlt? 8 + _ = 13 oder _ + 5 = 13
  missing20: () => {
    const c = rnd(6, 20);
    const x = rnd(Math.max(1, c - 10), Math.min(10, c - 1)); // die gesuchte Zahl (höchstens 10)
    return pick([{ a: c - x, b: x, op: '+', hide: 'b' }, { a: x, b: c - x, op: '+', hide: 'a' }]);
  },
};

// Bei den ersten Stationen sind die Münzen immer zu sehen, später nur als Hilfe.
const FRAME = {
  plus10: 'always', minus10: 'always', plus20: 'hint', cross10: 'always', minus20: 'hint',
  bonds10: 'always', double: 'always', half: 'always', missing20: 'hint',
};

const result = t => (t.op === '+' ? t.a + t.b : t.a - t.b);
const answerOf = t => (t.hide === 'c' ? result(t) : t.hide === 'half' ? t.a : t[t.hide]);

function chip(cx, cy, kind, delay) {
  const style = `style="animation-delay:${delay.toFixed(2)}s"`;
  if (kind === 'red') {
    return `<g class="chip" ${style}><circle cx="${cx}" cy="${cy}" r="16" fill="#f0553f" stroke="${INK}" stroke-width="3"/>
      <path d="M${cx - 8} ${cy - 5} Q${cx - 5} ${cy - 10} ${cx + 1} ${cy - 10}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></g>`;
  }
  let s = `<g class="chip${kind === 'gone' ? ' gone' : ''}" ${style}><circle cx="${cx}" cy="${cy}" r="16" fill="#ffcb3d" stroke="${INK}" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="9.5" fill="none" stroke="#e9a21f" stroke-width="2.5"/></g>`;
  if (kind === 'gone') s += `<path d="M${cx - 13} ${cy - 13} L${cx + 13} ${cy + 13} M${cx + 13} ${cy - 13} L${cx - 13} ${cy + 13}" stroke="#d8372a" stroke-width="5" stroke-linecap="round"/>`;
  return s;
}

/**
 * Rechenschiffchen: je Boot 10 Plätze (5 + 5).
 * Gold = erste Zahl, Rubin = dazu, Kreuz = weg, heller Platz = „hier fehlt noch etwas".
 */
function frameSvg(t) {
  // Für jeden der 20 Plätze festlegen, was dort liegt.
  const cells = new Array(20).fill(null);
  let rows;
  if (t.layout === 'double') {
    // Verdoppeln/Halbieren: oben und unten gleich viele.
    rows = 2;
    for (let i = 0; i < t.a; i++) { cells[i] = 'gold'; cells[10 + i] = t.hide === 'half' ? 'gold' : 'red'; }
  } else if (t.hide === 'a' || t.hide === 'b') {
    // Lücke: bekannte Zahl als Münzen, der Rest bis zum Ergebnis als leere, helle Plätze.
    const c = result(t), known = t.hide === 'b' ? t.a : t.b;
    rows = c > 10 ? 2 : 1;
    for (let i = 0; i < c; i++) cells[i] = i < known ? 'gold' : 'want';
  } else {
    const total = t.op === '+' ? t.a + t.b : t.a;
    rows = total > 10 ? 2 : 1;
    for (let i = 0; i < total; i++) {
      cells[i] = t.op === '+' ? (i < t.a ? 'gold' : 'red') : (i >= t.a - t.b ? 'gone' : 'gold');
    }
  }

  let s = '';
  for (let r = 0; r < rows; r++) {
    const y = r * 74;
    s += `<path d="M10 ${y + 4} H468 Q500 ${y + 6} 520 ${y + 35} Q500 ${y + 64} 468 ${y + 66} H10 Q3 ${y + 66} 3 ${y + 58} V${y + 12} Q3 ${y + 4} 10 ${y + 4}Z" fill="#b0703f" stroke="${INK}" stroke-width="3.5"/>`;
  }
  let shown = 0;
  for (let i = 0; i < rows * 10; i++) {
    const row = Math.floor(i / 10), col = i % 10;
    const x = 14 + col * 45 + (col >= 5 ? 14 : 0), y = 14 + row * 74;
    const want = cells[i] === 'want';
    s += `<rect x="${x}" y="${y}" width="42" height="42" rx="10" fill="${want ? '#f6dcae' : '#8a5530'}" stroke="${INK}" stroke-width="2.5"${want ? ' stroke-dasharray="5 4"' : ''}/>`;
    if (cells[i] && !want) s += chip(x + 21, y + 21, cells[i], shown++ * 0.035);
  }
  return `<svg class="frame-svg" viewBox="0 0 524 ${rows * 74 - 4}" aria-hidden="true">${s}</svg>`;
}

function equationHtml(t) {
  const slot = '<span class="slot"></span>';
  if (t.hide === 'half') {
    return `<span class="eq-text">Die Hälfte von</span><span>${t.a + t.b}</span><span class="op">=</span>${slot}`;
  }
  const part = (key, value) => (t.hide === key ? slot : `<span>${value}</span>`);
  return `${part('a', t.a)}<span class="op">${t.op === '+' ? '+' : '−'}</span>${part('b', t.b)}<span class="op">=</span>${part('c', result(t))}`;
}

const INTRO = { bonds10: 'missing_intro', missing20: 'missing_intro', double: 'double_intro', half: 'half_intro' };
const HINT = { bonds10: 'calc_hint_missing', missing20: 'calc_hint_missing', half: 'calc_hint_half' };

export const rechnen = {
  intro: opts => P(INTRO[opts.kind] || 'calc_intro'),

  makeTasks({ kind, n = 8 }) {
    const seen = new Set();
    const out = [];
    for (let guard = 0; out.length < n && guard < 400; guard++) {
      const t = GEN[kind]();
      const key = t.a + t.op + t.b + t.hide;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...t, kind, frame: FRAME[kind] });
    }
    return out;
  },

  mount(root, t, api) {
    const answer = answerOf(t);
    let entry = '';
    let tries = 0;
    let locked = false;

    root.innerHTML = `<div class="calc">
      <div class="calc-left">
        <div class="frame panel${t.frame === 'always' ? '' : ' is-hidden'}">${frameSvg(t)}</div>
        <div class="equation panel">${equationHtml(t)}</div>
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
        api.wrong({ target: slot, say: P(HINT[t.kind] || 'calc_hint') });
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
