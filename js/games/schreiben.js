// Schreibinsel: Wörter bauen, fehlende Laute finden, Groß-/Kleinschreibung, Diktat mit Plättchen und Tastatur.
// (Das Nachspuren einzelner Buchstaben gibt es weiterhin als Aufgabenart 'trace', es liegt aber nicht mehr auf dem Weg.)
import { shuffle, pick, shake } from '../engine/util.js';
import { content, P, NUMWORDS } from '../engine/content.js';
import { sfx, speak, stressed } from '../engine/audio.js';
import { ICON } from '../art/icons.js';
import { mountBuild } from './build.js';
import { picture } from '../art/pictures.js';
import { STROKES, isLower } from '../content/strokes.js';
import { markSeen, leastSeenFirst } from '../engine/storage.js';
import { INK } from '../engine/util.js';

const STEP = 2.5;        // Abstand der Prüfpunkte entlang des Strichs (Raster-Einheiten)
const LOOKAHEAD = 5;     // so viele Prüfpunkte darf man „vorausgreifen"
const TOL = { touch: 15, mouse: 15, pen: 10 };  // erlaubter Abstand zur Linie

/* ---------- Lücken: welcher Laut / wie viele Buchstaben fehlen? ---------- */

// Laute, die leicht verwechselt werden. [Muster, Auswahl]
const LAUTE = [[/sch/i, ['sch', 'ch']], [/(?<!s)ch/i, ['ch', 'sch']], [/ei|ie/i, ['ei', 'ie']], [/au|eu/i, ['au', 'eu']]];

/** Sucht in einem Wort einen dieser Laute und macht daraus eine Lücke. */
function lautGap(word) {
  const found = [];
  for (const [re, options] of LAUTE) {
    const m = re.exec(word);
    if (!m) continue;
    const fix = o => (m.index === 0 ? o[0].toUpperCase() + o.slice(1) : o);   // am Wortanfang groß
    found.push({ start: m.index, len: m[0].length, answer: m[0], options: options.map(fix) });
  }
  return found.length ? pick(found) : null;
}

/** Doppelter Mitlaut (Sonne, Schiff) oder ck. */
function doppelGap(word) {
  const m = /([bdfglmnprst])\1|ck/.exec(word);
  if (!m) return null;
  const single = m[0] === 'ck' ? 'k' : m[1];
  return { start: m.index, len: 2, answer: m[0], options: [m[0], single] };
}

// Wörter mit langem Selbstlaut: hier steht der Mitlaut nur einmal.
const EINFACH = { Hose: 's', Nase: 's', Vase: 's', Rose: 's', Dose: 's', Hase: 's', Blume: 'm', Krone: 'n', Schere: 'r', Igel: 'g', Raupe: 'p', Eule: 'l', Biene: 'n', Ziege: 'g' };
function einfachGap(word) {
  const c = EINFACH[word];
  return { start: word.lastIndexOf(c), len: 1, answer: c, options: [c + c, c] };
}

const INTRO = { trace: 'trace_intro', tiles: 'tiles_intro', gap: 'gap_intro', doppel: 'doppel_intro', hoeren: 'hoeren_intro', gross: 'gross_intro', tippen: 'tippen_intro', diktat: 'diktat_intro' };

export const schreiben = {
  intro: opts => P(INTRO[opts.kind]),

  makeTasks({ kind, chars = '', minLen = 0, maxLen = 99, n }) {
    const words = content.words.filter(w => w.w.length >= minLen && w.w.length <= maxLen);
    // Selten Geübtes kommt zuerst dran.
    const take = (pool, prefix, count) => shuffle(leastSeenFirst(pool, w => prefix + w.w).slice(0, count));
    switch (kind) {
      case 'trace':
        return shuffle(leastSeenFirst([...chars], ch => 'z:' + ch).slice(0, n || 6)).map(ch => ({ kind, ch }));
      case 'gap':
        return take(words.filter(w => lautGap(w.w)), 'k:', n || 8).map(w => ({ kind, w, gap: lautGap(w.w) }));
      case 'doppel': {
        const two = take(words.filter(w => doppelGap(w.w)), 'k:', 5).map(w => ({ kind, w, gap: doppelGap(w.w) }));
        const one = take(words.filter(w => EINFACH[w.w]), 'k:', 3).map(w => ({ kind, w, gap: einfachGap(w.w) }));
        return shuffle([...two, ...one]);
      }
      case 'gross': {
        const nouns = take(words, 'n:', 4).map(w => ({ kind, text: w.w, noun: true }));
        const others = shuffle(content.extras.nichtNomen).slice(0, 4).map(text => ({ kind, text, noun: false }));
        return shuffle([...nouns, ...others]);
      }
      case 'hoeren': return take(words, 'h:', n || 6).map(w => ({ kind, w }));
      case 'tippen': return take(words, 't:', n || 6).map(w => ({ kind, w }));
      case 'diktat': return take(words, 'd:', n || 6).map(w => ({ kind, w }));
      default: return take(words, 'w:', n || 6).map(w => ({ kind, w }));
    }
  },

  mount(root, t, api) {
    switch (t.kind) {
      case 'trace': return mountTrace(root, t, api);
      case 'gap': case 'doppel': return mountGap(root, t, api);
      case 'gross': return mountGross(root, t, api);
      case 'tippen': return mountType(root, t, api, true);
      case 'diktat': return mountType(root, t, api, false);
      case 'hoeren': return mountTiles(root, t, api, false);
      default: return mountTiles(root, t, api, true);
    }
  },
};

/* ---------- Nachspuren ---------- */

function mountTrace(root, t, api) {
  const strokes = STROKES[t.ch];
  const lower = isLower(t.ch);
  const height = lower ? 180 : 140;   // Kleinbuchstaben: zusätzliche Unterlinie für g, j, p, q, y
  root.innerHTML = `<div class="trace panel">
    <svg class="trace-svg${lower ? ' lower' : ''}" viewBox="0 0 100 ${height}" style="aspect-ratio:100/${height}">
      <g class="lines"><line x1="3" x2="97" y1="20" y2="20"/><line class="mid" x1="3" x2="97" y1="70" y2="70"/><line x1="3" x2="97" y1="120" y2="120"/>${lower ? '<line class="low" x1="3" x2="97" y1="170" y2="170"/>' : ''}</g>
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
    const spoken = /\d/.test(t.ch) ? NUMWORDS[Number(t.ch)] : t.ch === 'ß' ? 'Eszett' : t.ch.toUpperCase();
    markSeen('z:' + t.ch);
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

/* ---------- Wörter bauen (mit Bild oder nur nach Gehör) ---------- */

function mountTiles(root, t, api, withPicture) {
  const word = t.w.w;
  // Fremde Buchstaben dazumischen, die im Wort nicht vorkommen – nach Gehör einen mehr.
  const extras = shuffle([...'aeinrstlmoubdkh'].filter(c => !word.toLowerCase().includes(c))).slice(0, withPicture ? 2 : 3);
  mountBuild(root, {
    parts: [...word], extras, pic: withPicture ? picture(t.w.pic) : null, say: word,
    onSolved: () => markSeen((withPicture ? 'w:' : 'h:') + word),
    // Falscher Buchstabe: Koko spricht das Wort noch einmal und dehnt den Laut an dieser Stelle.
    stress: i => stressed(word, i),
  }, api);
}

/* ---------- Lückenwort ---------- */

function mountGap(root, t, api) {
  const word = t.w.w, g = t.gap;
  root.innerHTML = `<div class="read gap">
    <button class="prompt panel pic-word listen" aria-label="Anhören">${picture(t.w.pic)}
      <span>${word.slice(0, g.start)}<span class="gap-slot">__</span>${word.slice(g.start + g.len)}</span>
    </button>
    <div class="choices">${shuffle(g.options).map(o => `<button class="choice panel choice-word" data-o="${o}">${o}</button>`).join('')}</div>
  </div>`;
  let tries = 0, locked = false;
  api.ready.then(() => { if (api.alive() && !locked) speak(word); });
  root.querySelector('.listen').addEventListener('click', () => { if (!locked) speak(word); });
  root.querySelector('.choices').addEventListener('click', async e => {
    const btn = e.target.closest('.choice');
    if (!btn || locked || btn.disabled) return;
    if (btn.dataset.o === g.answer) {
      locked = true;
      markSeen('k:' + word);
      btn.classList.add('ok');
      const slot = root.querySelector('.gap-slot');
      slot.textContent = g.answer;
      slot.classList.add('filled');
      await api.correct({ target: root.querySelector('.pic-word'), say: word });
      api.done(tries === 0);
    } else {
      tries++;
      btn.disabled = true;
      btn.classList.add('no');
      // Koko spricht das Wort mit Betonung auf der Lücke. Steht dort nur ein Mitlaut (Hose),
      // wird der lange Selbstlaut davor gedehnt – genau den soll das Kind hören.
      const at = g.len === 1 && g.start > 0 ? g.start - 1 : g.start;
      api.wrong({ target: btn, silent: true });
      api.koko.talk(stressed(word, at));
    }
  });
}

/* ---------- Groß oder klein? ---------- */

function mountGross(root, t, api) {
  const upper = t.text[0].toUpperCase() + t.text.slice(1);
  const lower = t.text.toLowerCase();
  const right = t.noun ? upper : lower;
  root.innerHTML = `<div class="read gross">
    <button class="listen-btn listen big">${ICON.sound}<span>Anhören</span></button>
    <div class="choices">${shuffle([upper, lower]).map(o => `<button class="choice panel choice-word" data-o="${o}">${o}</button>`).join('')}</div>
  </div>`;
  let locked = false;
  api.ready.then(() => { if (api.alive() && !locked) speak(t.text); });
  root.querySelector('.listen').addEventListener('click', () => { if (!locked) speak(t.text); });
  root.querySelector('.choices').addEventListener('click', async e => {
    const btn = e.target.closest('.choice');
    if (!btn || locked) return;
    locked = true;
    const ok = btn.dataset.o === right;
    [...root.querySelectorAll('.choice')].find(b => b.dataset.o === right).classList.add('ok');
    if (ok) {
      if (t.noun) markSeen('n:' + t.text);
      await api.correct({ target: btn, say: t.text });
    } else {
      sfx('wrong');
      btn.classList.add('no');
      await api.koko.say(P('solution'));
    }
    api.done(ok);
  });
}

/* ---------- Wort mit der Buchstaben-Tastatur schreiben ---------- */

const TASTEN = [...'abcdefghijklmnopqrstuvwxyzäöüß'];

function mountType(root, t, api, withPicture) {
  const word = t.w.w;
  const letters = [...word];
  root.innerHTML = `<div class="typing">
    ${withPicture
      ? `<button class="pic-card panel build-pic listen" aria-label="Anhören">${picture(t.w.pic)}</button>`
      : `<button class="listen-btn listen">${ICON.sound}<span>Anhören</span></button>`}
    <div class="slots">${letters.map(() => '<span class="slot-l"></span>').join('')}</div>
    <div class="kb">${TASTEN.map(c => `<button class="kb-key" data-c="${c}">${c}</button>`).join('')}</div>
  </div>`;
  const slots = [...root.querySelectorAll('.slot-l')];
  const keys = [...root.querySelectorAll('.kb-key')];
  let pos = 0, mistakes = 0, missHere = 0, locked = false;
  slots[0].classList.add('next');
  api.ready.then(() => { if (api.alive() && pos === 0) speak(word); });
  root.querySelector('.listen').addEventListener('click', () => { if (!locked) speak(word); });

  root.querySelector('.kb').addEventListener('click', async e => {
    const key = e.target.closest('.kb-key');
    if (!key || locked) return;
    if (key.dataset.c === letters[pos].toLowerCase()) {
      sfx('pop');
      keys.forEach(k => k.classList.remove('hint'));
      slots[pos].textContent = letters[pos];   // Großbuchstabe am Wortanfang kommt von selbst
      slots[pos].classList.remove('next');
      slots[pos].classList.add('set');
      pos++;
      missHere = 0;
      if (pos < letters.length) { slots[pos].classList.add('next'); return; }
      locked = true;
      markSeen((withPicture ? 't:' : 'd:') + word);
      root.querySelector('.slots').classList.add('ok');
      await api.correct({ target: root.querySelector('.slots'), say: word });
      api.done(mistakes === 0);
    } else {
      mistakes++;
      missHere++;
      sfx('wrong');
      shake(key);
      api.koko.talk(stressed(word, pos));
      if (missHere >= 2) keys.find(k => k.dataset.c === letters[pos].toLowerCase()).classList.add('hint');
    }
  });
}
