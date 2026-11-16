// Schreibinsel: Buchstaben/Zahlen nachspuren und Wörter aus Buchstaben-Plättchen bauen.
import { shuffle, shake, burst } from '../engine/util.js';
import { content, P, NUMWORDS } from '../engine/content.js';
import { sfx, speak } from '../engine/audio.js';
import { picture } from '../art/pictures.js';
import { STROKES } from '../content/strokes.js';
import { INK } from '../engine/util.js';

const STEP = 2.5;        // Abstand der Prüfpunkte entlang des Strichs (Raster-Einheiten)
const LOOKAHEAD = 5;     // so viele Prüfpunkte darf man „vorausgreifen"
const TOL = { touch: 15, mouse: 15, pen: 10 };  // erlaubter Abstand zur Linie

export const schreiben = {
  intro: opts => P(opts.kind === 'trace' ? 'trace_intro' : 'tiles_intro'),

  makeTasks({ kind, chars = '', minLen = 0, maxLen = 99, n }) {
    if (kind === 'trace') {
      return shuffle([...chars]).slice(0, n || 6).map(ch => ({ kind, ch }));
    }
    const pool = content.words.filter(w => w.w.length >= minLen && w.w.length <= maxLen);
    return shuffle(pool).slice(0, n || 6).map(w => ({ kind, w }));
  },

  mount(root, t, api) {
    return t.kind === 'trace' ? mountTrace(root, t, api) : mountTiles(root, t, api);
  },
};

/* ---------- Nachspuren ---------- */

function mountTrace(root, t, api) {
  const strokes = STROKES[t.ch];
  root.innerHTML = `<div class="trace panel">
    <svg class="trace-svg" viewBox="0 0 100 140">
      <g class="lines"><line x1="3" x2="97" y1="20" y2="20"/><line class="mid" x1="3" x2="97" y1="70" y2="70"/><line x1="3" x2="97" y1="120" y2="120"/></g>
      <g class="ghost">${strokes.map(d => `<path d="${d}"/>`).join('')}</g>
      <g class="ink">${strokes.map(d => `<path d="${d}"/>`).join('')}</g>
      <path class="guide"/>
      <g class="demo"></g>
      <g class="handle">
        <circle class="ring" r="8.5"/>
        <circle r="8.5" fill="#ffcb3d" stroke="${INK}" stroke-width="1.6"/>
        <circle r="6" fill="none" stroke="#e9a21f" stroke-width="1"/>
        <text y="3.2" text-anchor="middle">1</text>
      </g>
    </svg>
  </div>`;

  const svg = root.querySelector('.trace-svg');
  const inkPaths = [...root.querySelectorAll('.ink path')];
  const ghostPaths = [...root.querySelectorAll('.ghost path')];
  const guide = root.querySelector('.guide');
  const demo = root.querySelector('.demo');
  const handle = root.querySelector('.handle');
  const ring = handle.querySelector('.ring');
  const label = handle.querySelector('text');

  let cur = -1, samples = [], idx = 0, len = 0;
  let active = false, finished = false;
  let offCount = 0, moveCount = 0;

  inkPaths.forEach(p => {
    const l = p.getTotalLength();
    p.style.strokeDasharray = l + ' ' + l;
    p.style.strokeDashoffset = l;
  });

  function setStroke(k) {
    cur = k;
    const path = inkPaths[k];
    len = path.getTotalLength();
    samples = [];
    for (let l = 0; l < len; l += STEP) samples.push(path.getPointAtLength(l));
    samples.push(path.getPointAtLength(len));
    idx = 0;
    active = false;
    ghostPaths.forEach((g, i) => g.classList.toggle('now', i === k));
    guide.setAttribute('d', strokes[k]);
    label.textContent = k + 1;
    ring.style.display = '';
    demo.innerHTML = `<circle r="3.2"><animateMotion dur="${Math.max(1.1, len / 70).toFixed(2)}s" repeatCount="indefinite" path="${strokes[k]}"/></circle>`;
    moveHandle();
  }

  function moveHandle() {
    const p = samples[idx];
    handle.setAttribute('transform', `translate(${p.x} ${p.y})`);
    const path = inkPaths[cur];
    path.classList.toggle('on', idx > 0);
    path.style.strokeDashoffset = Math.max(0, len - idx * STEP);
  }

  function toSvg(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function track(e) {
    const p = toSvg(e);
    const tol = TOL[e.pointerType] || TOL.touch;
    if (!active) {
      if (dist(p, samples[idx]) > tol * 1.7) return;
      active = true;
      ring.style.display = 'none';
      demo.innerHTML = '';
    }
    moveCount++;
    if (dist(p, samples[idx]) > tol * 1.8) offCount++;
    let moved = false;
    for (;;) {
      let best = -1;
      const max = Math.min(idx + LOOKAHEAD, samples.length - 1);
      for (let j = idx + 1; j <= max; j++) if (dist(p, samples[j]) <= tol) best = j;
      if (best < 0) break;
      idx = best;
      moved = true;
    }
    if (!moved) return;
    moveHandle();
    if (idx >= samples.length - 1) strokeDone();
  }

  async function strokeDone() {
    inkPaths[cur].style.strokeDashoffset = 0;
    inkPaths[cur].classList.add('done');
    active = false;
    if (cur + 1 < strokes.length) {
      sfx('pop');
      setStroke(cur + 1);
      return;
    }
    finished = true;
    svg.classList.add('complete');
    const clean = moveCount === 0 || offCount / moveCount < 0.3;
    const spoken = /\d/.test(t.ch) ? NUMWORDS[Number(t.ch)] : t.ch;
    await api.correct({ target: svg, say: spoken });
    api.done(clean);
  }

  let down = false;
  svg.addEventListener('pointerdown', e => {
    if (finished) return;
    e.preventDefault();
    down = true;
    try { svg.setPointerCapture(e.pointerId); } catch { /* ok */ }
    track(e);
  });
  svg.addEventListener('pointermove', e => {
    if (finished || !down) return;
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    if (list.length) { for (const c of list) { if (!finished) track(c); } } else track(e);
  });
  const lift = () => { down = false; active = false; };
  svg.addEventListener('pointerup', lift);
  svg.addEventListener('pointercancel', lift);

  setStroke(0);
}

/* ---------- Wörter bauen ---------- */

function mountTiles(root, t, api) {
  const word = t.w.w;
  const letters = [...word];
  const extra = shuffle([...'aeinrstlmoubdkh'].filter(c => !word.toLowerCase().includes(c))).slice(0, 2);
  const tiles = shuffle([...letters.map((c, i) => ({ c, i })), ...extra.map(c => ({ c, i: -1 }))]);

  root.innerHTML = `<div class="build">
    <button class="pic-card panel build-pic" aria-label="Wort anhören">${picture(t.w.pic)}</button>
    <div class="slots">${letters.map(() => '<span class="slot-l"></span>').join('')}</div>
    <div class="tiles">${tiles.map(tl => `<button class="tile" data-c="${tl.c}">${tl.c}</button>`).join('')}</div>
  </div>`;

  const slots = [...root.querySelectorAll('.slot-l')];
  let pos = 0, mistakes = 0, missHere = 0, locked = false;
  slots[0].classList.add('next');

  api.ready.then(() => { if (api.alive() && pos === 0) speak(word); });
  root.querySelector('.build-pic').addEventListener('click', () => { if (!locked) speak(word); });

  root.querySelector('.tiles').addEventListener('click', async e => {
    const tile = e.target.closest('.tile');
    if (!tile || locked || tile.classList.contains('used')) return;
    if (tile.dataset.c === letters[pos]) {
      sfx('pop');
      tile.classList.add('used');
      root.querySelectorAll('.tile.hint').forEach(n => n.classList.remove('hint'));
      slots[pos].textContent = letters[pos];
      slots[pos].classList.remove('next');
      slots[pos].classList.add('set');
      burst(slots[pos], { n: 5, spread: 40 });
      pos++;
      missHere = 0;
      if (pos < letters.length) {
        slots[pos].classList.add('next');
        return;
      }
      locked = true;
      root.querySelector('.slots').classList.add('ok');
      await api.correct({ target: root.querySelector('.slots'), say: word });
      api.done(mistakes === 0);
    } else {
      mistakes++;
      missHere++;
      sfx('wrong');
      shake(tile);
      if (missHere >= 2) {
        // Nach zwei Fehlversuchen zeigt Koko den richtigen Buchstaben.
        const right = [...root.querySelectorAll('.tile:not(.used)')].find(n => n.dataset.c === letters[pos]);
        if (right) right.classList.add('hint');
      }
    }
  });
}
