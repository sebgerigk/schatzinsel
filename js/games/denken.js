// Denkspiele der Programmierinsel (ohne Schiff):
//   ablauf – Bilder in die richtige Reihenfolge bringen (ein Ablauf aus dem Alltag)
//   muster – Was kommt als Nächstes?
//   waage  – Schatzsäcke sortieren, wenn man immer nur zwei vergleichen kann
import { P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { shuffle, shake, wait, pick, burst, rnd } from '../engine/util.js';
import { ICON } from '../art/icons.js';
import { THINGS, sackSvg, scaleSvg, featherSvg, anchorSvg } from '../art/denkbilder.js';
import { SEQUENCES } from '../art/bildfolgen.js';

const INTRO = { ablauf: 'prog_ablauf_intro', muster: 'prog_muster_intro', waage: 'prog_waage_intro' };

export const denken = {
  intro: opts => P(INTRO[opts.kind]),
  hasMedal: opts => opts.kind === 'waage',

  makeTasks({ kind, n = 6 }) {
    if (kind === 'ablauf') {
      // Erst vier Folgen mit drei Bildern, zum Schluss zwei mit vier Bildern.
      const three = shuffle(SEQUENCES.filter(s => s.frames.length === 3)).slice(0, n - 2);
      const four = shuffle(SEQUENCES.filter(s => s.frames.length === 4)).slice(0, 2);
      return [...three, ...four].map(seq => ({ kind, seq }));
    }
    if (kind === 'muster') {
      const shapes = ['AB', 'AB', 'AAB', 'ABB', 'ABC', 'AABB'];
      return shapes.slice(0, n).map((shape, i) => makePattern(shape, i));
    }
    return Array.from({ length: n }, (_, i) => {
      const count = i < 3 ? 3 : 4;
      let weights;
      do { weights = shuffle(Array.from({ length: count }, (_, k) => k + 1)); } while (weights.every((w, k) => w === k + 1));
      return { kind, weights, visible: i < 2 };
    });
  },

  mount(root, t, api) {
    if (t.kind === 'ablauf') return mountAblauf(root, t, api);
    if (t.kind === 'muster') return mountMuster(root, t, api);
    return mountWaage(root, t, api);
  },
};

/* ---------- Was kommt zuerst? ---------- */

function mountAblauf(root, t, api) {
  const frames = t.seq.frames;
  let order;
  do { order = shuffle(frames.map((_, i) => i)); } while (order.every((v, k) => v === k));
  root.innerHTML = `<div class="seq">
    <div class="seq-frames">${frames.map((_, k) => `<div class="seq-frame panel${k === 0 ? ' next' : ''}"><span class="seq-num">${k + 1}</span></div>`).join('')}</div>
    <div class="seq-cards">${order.map(i => `<button class="seq-card panel" data-i="${i}">${frames[i]}</button>`).join('')}</div>
  </div>`;
  const slots = [...root.querySelectorAll('.seq-frame')];
  let pos = 0, mistakes = 0, missHere = 0, locked = false;

  root.querySelector('.seq-cards').addEventListener('click', async e => {
    const card = e.target.closest('.seq-card');
    if (!card || locked || card.classList.contains('used')) return;
    if (Number(card.dataset.i) === pos) {
      sfx('pop');
      card.classList.add('used');
      root.querySelectorAll('.seq-card.hint').forEach(c => c.classList.remove('hint'));
      slots[pos].insertAdjacentHTML('beforeend', frames[pos]);
      slots[pos].classList.remove('next');
      slots[pos].classList.add('set');
      burst(slots[pos], { n: 6, spread: 50 });
      pos++;
      missHere = 0;
      if (pos < frames.length) { slots[pos].classList.add('next'); return; }
      locked = true;
      // Der Ablauf „spielt" einmal von vorn nach hinten.
      for (const s of slots) { s.classList.add('play'); sfx('tap'); await wait(380); s.classList.remove('play'); }
      await api.correct({ target: root.querySelector('.seq-frames') });
      api.done(mistakes === 0);
    } else {
      mistakes++;
      missHere++;
      api.wrong({ target: card, say: P(pos === 0 ? 'prog_ablauf_first' : 'prog_ablauf_next') });
      if (missHere >= 2) root.querySelector(`.seq-card[data-i="${pos}"]`).classList.add('hint');
    }
  });
}

/* ---------- Was kommt dann? ---------- */

function makePattern(shape, i) {
  const letters = [...new Set(shape)];
  // Erst nur Bojen in verschiedenen Farben, später auch Muscheln, Seesterne und Fische.
  const pool = i < 3 ? ['rot', 'blau', 'gelb', 'gruen'] : Object.keys(THINGS);
  const things = shuffle(pool).slice(0, letters.length + 1);
  const map = Object.fromEntries(letters.map((l, k) => [l, things[k]]));
  const period = shape.length;
  const len = period * 2 + rnd(1, period);
  const row = Array.from({ length: len + 1 }, (_, k) => map[shape[k % period]]);
  const answer = row.pop();
  const options = shuffle([...new Set([answer, ...letters.map(l => map[l]), things[letters.length]])]).slice(0, 3);
  if (!options.includes(answer)) options[0] = answer;
  return { kind: 'muster', row, answer, options: shuffle(options) };
}

function mountMuster(root, t, api) {
  root.innerHTML = `<div class="muster">
    <div class="muster-row panel">${t.row.map(th => `<span class="m-cell">${THINGS[th].svg}</span>`).join('')}<span class="m-cell ask">?</span></div>
    <div class="choices">${t.options.map(th => `<button class="choice panel m-choice" data-t="${th}">${THINGS[th].svg}</button>`).join('')}</div>
  </div>`;
  const ask = root.querySelector('.ask');
  let mistakes = 0, locked = false;

  async function chant() {
    const cells = [...root.querySelectorAll('.m-cell:not(.ask)')];
    for (let k = 0; k < cells.length && api.alive(); k++) {
      cells[k].classList.add('say');
      await api.koko.talk(P(THINGS[t.row[k]].say));
      cells[k].classList.remove('say');
    }
  }

  root.querySelector('.choices').addEventListener('click', async e => {
    const btn = e.target.closest('.m-choice');
    if (!btn || locked) return;
    if (btn.dataset.t === t.answer) {
      locked = true;
      btn.classList.add('ok');
      ask.innerHTML = THINGS[t.answer].svg;
      ask.classList.add('filled');
      await api.correct({ target: ask });
      api.done(mistakes === 0);
      return;
    }
    mistakes++;
    btn.classList.add('no');
    if (mistakes >= 2) {
      locked = true;
      api.wrong({ target: btn, silent: true });
      ask.innerHTML = THINGS[t.answer].svg;
      ask.classList.add('shown');
      await Promise.all([api.koko.say(P('solution')), wait(2000)]);
      api.done(false);
      return;
    }
    locked = true;
    api.wrong({ target: btn, silent: true });
    await api.koko.say(P('prog_muster_hint'));
    await chant();
    locked = false;
  });
}

/* ---------- Schätze sortieren ---------- */

function mountWaage(root, t, api) {
  const n = t.weights.length;
  let row = t.weights.map((_, i) => i);   // row[Platz] = Sack-Nummer; t.weights[Sack] = Gewicht
  let weighed = null;                       // Platz k: die Säcke auf k und k+1 liegen gerade auf der Waage
  let count = 0, mistakes = 0, locked = false;
  const size = i => (t.visible ? 0.72 + t.weights[i] * 0.11 : 1);

  root.innerHTML = `<div class="waage">
    <div class="scale-box">${scaleSvg()}</div>
    <div class="shelf-wrap"><span class="shelf-end">${featherSvg()}</span><div class="shelf"></div><span class="shelf-end">${anchorSvg()}</span></div>
    <button class="btn green waage-ok" aria-label="Fertig">${ICON.check}</button>
  </div>`;
  const shelf = root.querySelector('.shelf');
  const beam = root.querySelector('.scale-beam');
  const pans = [...root.querySelectorAll('.pan')];
  const loads = [...root.querySelectorAll('.pan-load')];

  function render() {
    shelf.innerHTML = row.map((s, k) => `<div class="sack${weighed !== null && (k === weighed || k === weighed + 1) ? ' on-scale' : ''}" data-k="${k}">${sackSvg(s, size(s))}</div>`
      + (k < n - 1 ? `<button class="gap${weighed === k ? ' swap' : ''}" data-k="${k}" aria-label="${weighed === k ? 'Tauschen' : 'Wiegen'}">${weighed === k ? swapIcon : scaleIcon}</button>` : '')).join('');
  }

  function tilt(a, b) {
    const d = a === null ? 0 : Math.sign(t.weights[b] - t.weights[a]) * 12;   // rechts schwerer -> rechts runter
    beam.style.transform = `rotate(${d}deg)`;
    pans.forEach(p => { p.style.transform = `rotate(${-d}deg)`; });
    loads[0].innerHTML = a === null ? '' : `<g transform="translate(-24 -50) scale(0.6)">${sackInner(a)}</g>`;
    loads[1].innerHTML = b === null ? '' : `<g transform="translate(-24 -50) scale(0.6)">${sackInner(b)}</g>`;
  }
  const sackInner = s => sackSvg(s, size(s)).replace('<svg class="sack-svg" viewBox="-40 -48 80 96"', '<svg width="80" height="96" viewBox="-40 -48 80 96"');

  shelf.addEventListener('click', async e => {
    const gap = e.target.closest('.gap');
    if (!gap || locked) return;
    const k = Number(gap.dataset.k);
    if (weighed === k) {
      // Tauschen
      sfx('pop');
      [row[k], row[k + 1]] = [row[k + 1], row[k]];
      weighed = null;
      tilt(null, null);
      render();
      return;
    }
    count++;
    weighed = k;
    sfx('scale');
    tilt(null, null);
    render();
    await wait(80);
    tilt(row[k], row[k + 1]);
  });

  root.querySelector('.waage-ok').addEventListener('click', async e => {
    if (locked) return;
    const firstWrong = row.findIndex((s, k) => k < n - 1 && t.weights[s] > t.weights[row[k + 1]]);
    if (firstWrong < 0) {
      locked = true;
      weighed = null;
      tilt(null, null);
      render();
      await api.correct({ target: shelf });
      api.done(mistakes === 0, { best: count <= (n * (n - 1)) / 2 });
      return;
    }
    mistakes++;
    const sacks = shelf.querySelectorAll('.sack');
    shake(sacks[firstWrong]);
    shake(sacks[firstWrong + 1]);
    if (mistakes >= 2) {
      locked = true;
      api.wrong({ target: e.currentTarget, silent: true });
      await api.koko.say(P('solution'));
      row = row.slice().sort((a, b) => t.weights[a] - t.weights[b]);
      weighed = null;
      tilt(null, null);
      render();
      await wait(2000);
      api.done(false, { best: false });
      return;
    }
    api.wrong({ target: e.currentTarget, say: P('prog_waage_hint') });
  });

  render();
}

const scaleIcon = `<svg class="op-svg" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#3b2a20" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M24 8 V40 M14 40 H34 M8 14 H40"/><path d="M8 14 L3 28 H13Z M40 14 L35 28 H45Z" fill="#cfd4dc"/></g></svg>`;
const swapIcon = `<svg class="op-svg" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#3b2a20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 18 H38 M30 10 L38 18 L30 26"/><path d="M40 32 H10 M18 24 L10 32 L18 40"/></g></svg>`;
