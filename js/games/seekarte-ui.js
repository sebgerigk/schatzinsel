// Bausteine für Seekarten-Bildschirme: Karte mit fahrendem Schiff, Plan-Leiste, Plättchen-Vorrat.
// Werden von der Programmierinsel (Runden) und vom Kartentisch (freies Spielen) benutzt.
import { wait, shake, burst } from '../engine/util.js';
import { sfx } from '../engine/audio.js';
import { settings } from '../engine/storage.js';
import { NUMWORDS } from '../engine/content.js';
import { ICON } from '../art/icons.js';
import { boardSvg, cx, faceDeg, ghostArrow, ghostTurn, opIcon, swirlSvg, PAINT } from '../art/sea.js';
import { key, tileCount } from './seekarte.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (name, attrs) => {
  const el = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};
export const stepMs = () => (settings().progSpeed === 'langsam' ? 700 : 430);

/* ---------- Die Karte ---------- */

export function createBoard(host, lv, { mode = 'abs', ship, chests = null, empty = false } = {}) {
  host.innerHTML = boardSvg(lv, { mode, ship, chests, empty });
  const svg = host.querySelector('.board-svg');
  const shipG = svg.querySelector('.ship');
  const turnG = svg.querySelector('.ship-turn');
  const flipG = svg.querySelector('.ship-flip');
  const trail = svg.querySelector('.trail');
  const paint = svg.querySelector('.paint');
  const ghost = svg.querySelector('.ghost');
  let pos = lv.start ? { ...lv.start } : { x: 0, y: 0 };
  let face = lv.face;
  let angle = faceDeg(face);
  let flipped = false;
  let atStart = true;

  const setSpeed = (f = 1) => svg.style.setProperty('--step', Math.round(stepMs() * f) + 'ms');
  setSpeed();

  function moveTo(x, y) { shipG.style.transform = `translate(${cx(x)}px, ${cx(y)}px)`; }
  function orient(f, turnOp) {
    if (mode === 'rel') {
      if (turnOp === 'tr') angle += 90;
      else if (turnOp === 'tl') angle -= 90;
      else angle = faceDeg(f);
      turnG.style.transform = `rotate(${angle}deg)`;
    } else {
      if (f === 'W') flipped = true;
      if (f === 'E') flipped = false;
      flipG.classList.toggle('flipped', flipped);
      turnG.classList.toggle('tilt-up', f === 'N');
      turnG.classList.toggle('tilt-down', f === 'S');
    }
    face = f;
  }

  function reset({ keepPaint = false } = {}) {
    svg.classList.add('instant');
    pos = lv.start ? { ...lv.start } : { x: 0, y: 0 };
    face = lv.face;
    angle = faceDeg(face);
    flipped = false;
    moveTo(pos.x, pos.y);
    orient(face);
    turnG.classList.remove('tilt-up', 'tilt-down');
    trail.innerHTML = '';
    if (!keepPaint) paint.innerHTML = '';
    ghost.innerHTML = '';
    svg.querySelectorAll('.map-coin').forEach(c => c.classList.remove('got'));
    svg.querySelectorAll('.map-chest').forEach(c => c.classList.remove('open', 'found', 'nope'));
    void svg.getBoundingClientRect();
    svg.classList.remove('instant');
    atStart = true;
  }

  /** Spielt die Schritte einer Fahrt ab. onStep(step, i) wird vor jedem Schritt aufgerufen. */
  async function play(steps, { onStep, alive = () => true, sound = true, speed = 1 } = {}) {
    setSpeed(speed);
    const ms = stepMs() * speed;
    atStart = false;
    for (let i = 0; i < steps.length; i++) {
      if (!alive()) return;
      const s = steps[i];
      if (onStep) onStep(s, i);
      if (s.kind === 'turn') {
        orient(s.face, s.turn);
        if (sound) sfx('swirl');
        await wait(ms * 0.8);
      } else if (s.kind === 'color') {
        if (sound) sfx('pop');
        await wait(ms * 0.5);
      } else if (s.kind === 'move') {
        orient(s.face);
        moveTo(s.x, s.y);
        if (sound) sfx('step');
        const seg = svgEl('line', { x1: cx(s.from.x), y1: cx(s.from.y), x2: cx(s.x), y2: cx(s.y) });
        if (s.color !== null && s.color !== undefined) {
          seg.setAttribute('class', 'paint-seg');
          seg.setAttribute('stroke', PAINT[s.color]);
          paint.appendChild(seg);
        } else {
          seg.setAttribute('class', 'trail-seg');
          trail.appendChild(seg);
        }
        pos = { x: s.x, y: s.y };
        await wait(ms);
        if (s.coin) {
          const c = svg.querySelector(`.map-coin[data-k="${key(s.x, s.y)}"]`);
          if (c) c.classList.add('got');
          if (sound) sfx('coin');
        }
      } else if (s.kind === 'rock' || s.kind === 'edge') {
        orient(s.face);
        const px = cx(s.x) + (cx(s.tx) - cx(s.x)) * 0.32, py = cx(s.y) + (cx(s.ty) - cx(s.y)) * 0.32;
        shipG.style.transform = `translate(${px}px, ${py}px)`;
        await wait(ms * 0.45);
        if (sound) sfx('bump');
        shipG.classList.add('bumped');
        moveTo(s.x, s.y);
        await wait(ms * 0.9);
        shipG.classList.remove('bumped');
      }
    }
  }

  return {
    el: svg,
    get pos() { return pos; },
    get face() { return face; },
    get atStart() { return atStart; },
    reset,
    play,
    openChest(p) {
      const c = svg.querySelector(`.map-chest[data-k="${key(p.x, p.y)}"]`);
      if (c) { c.classList.add('open'); burst(c, { n: 10, spread: 70 }); }
    },
    chestEl: p => svg.querySelector(`.map-chest[data-k="${key(p.x, p.y)}"]`),
    ghostMove(a, b) { ghost.innerHTML = ghostArrow(a, b); },
    ghostTurn(p, f, op) { ghost.innerHTML = ghostTurn(p, f, op); },
    clearGhost() { ghost.innerHTML = ''; },
    /** Umrechnung Bildschirm -> Feld (für den Rätsel-Baukasten). */
    cellAt(clientX, clientY) {
      const pt = svg.createSVGPoint();
      pt.x = clientX; pt.y = clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const x = Math.floor(p.x / 100), y = Math.floor(p.y / 100);
      return x >= 0 && y >= 0 && x < lv.w && y < lv.h ? { x, y } : null;
    },
  };
}

/* ---------- Plättchen ---------- */

/** Aus einem Vorrats-Namen wird ein Plättchen im Plan. */
export function nodeFor(name) {
  if (name.startsWith('loop')) return { op: 'loop', size: Number(name.slice(4)), n: 2, body: [] };
  if (name.startsWith('color')) return { op: 'color', c: Number(name.slice(5)) };
  return { op: name };
}
export const nameOf = node => (node.op === 'loop' ? 'loop' + node.size : node.op === 'color' ? 'color' + node.c : node.op);

const tileInner = node => opIcon(node.op, node);
const tileClass = node => `op-${node.op}${node.op === 'color' ? ' c' + node.c : ''}`;

function loopBadge(n, iter = 0) {
  return `<span class="loop-badge" role="button" aria-label="Wie oft">
    <span class="loop-dots">${Array.from({ length: n }, (_, k) => `<i class="${k < iter ? 'on' : ''}"></i>`).join('')}</span><b>${n}</b></span>`;
}

/** Vorrat: die Plättchen, die das Kind antippen kann. */
export function createPalette(host, names, onPick) {
  host.innerHTML = names.map(name => {
    if (name.startsWith('loop')) {
      const size = Number(name.slice(4));
      return `<button class="ptile big op-loop" data-name="${name}" aria-label="Strudel">${swirlSvg()}<span class="loop-holes">${'<i></i>'.repeat(size)}</span></button>`;
    }
    const node = nodeFor(name);
    return `<button class="ptile big ${tileClass(node)}" data-name="${name}">${tileInner(node)}</button>`;
  }).join('');
  host.addEventListener('click', e => {
    const b = e.target.closest('.ptile');
    if (b && !host.classList.contains('locked')) onPick(b.dataset.name, b);
  });
  return {
    hint(name) {
      host.querySelectorAll('.ptile').forEach(b => b.classList.toggle('hint', b.dataset.name === name));
    },
    clearHint() { host.querySelectorAll('.ptile.hint').forEach(b => b.classList.remove('hint')); },
    lock(on) { host.classList.toggle('locked', on); },
    el: host,
  };
}

/**
 * Die Plan-Leiste. slots: wie viele Plätze. choices: was im Auswahlfenster zum Austauschen angeboten wird.
 * editable: false für Kokos fertige Pläne (zum Lesen).
 */
export function createPlan(host, { slots = 10, choices = [], editable = true, onChange = () => {}, onCount = () => {} } = {}) {
  let prog = [];
  let locked = !editable;
  host.classList.add('plan');
  host.innerHTML = '<div class="plan-slots"></div><div class="chooser" hidden></div>';
  const box = host.querySelector('.plan-slots');
  const chooser = host.querySelector('.chooser');

  function render() {
    let html = '';
    prog.forEach((node, i) => {
      if (node.op === 'loop') {
        const inner = Array.from({ length: node.size }, (_, j) => {
          const b = node.body[j];
          return b ? `<button class="ptile ${tileClass(b)}" data-p="${i}.${j}">${tileInner(b)}</button>` : '<span class="pslot inner"></span>';
        }).join('');
        html += `<div class="ploop${node.body.length < node.size ? ' open' : ''}" data-p="${i}">${swirlSvg()}<div class="ploop-body">${inner}</div>${loopBadge(node.n)}</div>`;
      } else {
        html += `<button class="ptile ${tileClass(node)}" data-p="${i}">${tileInner(node)}</button>`;
      }
    });
    for (let k = prog.length; k < slots; k++) html += `<span class="pslot${k === prog.length && editable ? ' next' : ''}"></span>`;
    box.innerHTML = html;
  }

  const lastOpenLoop = () => {
    const last = prog[prog.length - 1];
    return last && last.op === 'loop' && last.body.length < last.size ? last : null;
  };

  function changed() { closeChooser(); render(); onChange(prog); }

  function add(name) {
    const node = nodeFor(name);
    const open = lastOpenLoop();
    if (open && node.op !== 'loop') { open.body.push(node); changed(); return true; }
    if (open && node.op === 'loop') return false;     // Strudel im Strudel gibt es nicht
    if (prog.length >= slots) return false;
    prog.push(node);
    changed();
    return true;
  }

  function undo() {
    const last = prog[prog.length - 1];
    if (!last) return false;
    if (last.op === 'loop' && last.body.length) last.body.pop();
    else prog.pop();
    changed();
    return true;
  }

  function elFor(path) {
    return box.querySelector(`[data-p="${path.join('.')}"]`);
  }

  function closeChooser() { chooser.hidden = true; chooser.innerHTML = ''; }

  function openChooser(target, path) {
    const inLoop = path.length === 2;
    const node = inLoop ? prog[path[0]].body[path[1]] : prog[path[0]];
    const opts = node.op === 'loop' ? [] : choices.filter(c => !c.startsWith('loop') && c !== nameOf(node));
    const trash = !inLoop;
    chooser.innerHTML = opts.map(c => { const n = nodeFor(c); return `<button class="ptile ${tileClass(n)}" data-c="${c}">${tileInner(n)}</button>`; }).join('')
      + (trash ? `<button class="ptile op-trash" data-c="trash" aria-label="Wegwerfen">${opIcon('trash')}</button>` : '');
    chooser.dataset.p = path.join('.');
    chooser.hidden = false;
    const hr = host.getBoundingClientRect(), tr = target.getBoundingClientRect();
    const w = chooser.offsetWidth;
    chooser.style.left = Math.max(0, Math.min(hr.width - w, tr.left - hr.left + tr.width / 2 - w / 2)) + 'px';
  }

  host.addEventListener('click', e => {
    if (locked) return;
    const choice = e.target.closest('.chooser [data-c]');
    if (choice) {
      const path = chooser.dataset.p.split('.').map(Number);
      sfx('pop');
      if (choice.dataset.c === 'trash') prog.splice(path[0], 1);
      else if (path.length === 2) prog[path[0]].body[path[1]] = nodeFor(choice.dataset.c);
      else prog[path[0]] = nodeFor(choice.dataset.c);
      changed();
      return;
    }
    const badge = e.target.closest('.loop-badge');
    if (badge) {
      const i = Number(badge.closest('.ploop').dataset.p);
      prog[i].n = prog[i].n >= 4 ? 2 : prog[i].n + 1;
      sfx('swirl');
      onCount(NUMWORDS[prog[i].n]);
      changed();
      return;
    }
    const t = e.target.closest('.ptile[data-p], .ploop[data-p]');
    if (t) {
      const path = t.dataset.p.split('.').map(Number);
      if (!chooser.hidden && chooser.dataset.p === t.dataset.p) { closeChooser(); return; }
      sfx('tap');
      openChooser(t, path);
      return;
    }
    closeChooser();
  });

  render();
  return {
    el: host,
    get program() { return prog; },
    set(p) { prog = JSON.parse(JSON.stringify(p)); closeChooser(); render(); },
    add,
    undo,
    full: () => prog.length >= slots && !lastOpenLoop(),
    tiles: () => tileCount(prog),
    lock(on) { locked = on || !editable; host.classList.toggle('locked', locked); closeChooser(); },
    /** Das gerade ausgeführte Plättchen aufleuchten lassen. */
    highlight(path, iter) {
      box.querySelectorAll('.run').forEach(n => n.classList.remove('run'));
      if (!path) return;
      const top = elFor([path[0]]);
      if (top && top.classList.contains('ploop')) {
        top.querySelectorAll('.loop-dots i').forEach((d, k) => d.classList.toggle('on', k <= iter));
        top.classList.add('run');
      }
      const el = elFor(path);
      if (el) el.classList.add('run');
    },
    clearRun() {
      box.querySelectorAll('.run').forEach(n => n.classList.remove('run'));
      box.querySelectorAll('.loop-dots i.on').forEach(n => n.classList.remove('on'));
    },
    dimAfter(last) {
      box.querySelectorAll('.plan-slots > [data-p]').forEach(n => n.classList.toggle('unused', Number(n.dataset.p) > last));
    },
    mark(path, cls) { const el = path && elFor(path); if (el) { el.classList.add(cls); if (cls === 'blame') shake(el); } },
    clearMarks() { box.querySelectorAll('.blame, .hint, .unused').forEach(n => n.classList.remove('blame', 'hint', 'unused')); },
    nextSlot: () => box.querySelector('.pslot.next') || box.querySelector('.ploop.open .pslot.inner'),
  };
}

/** Rückgängig- und Segel-Knöpfe neben der Leiste. */
export function controlsHtml({ undo = true, sail = true } = {}) {
  return `${undo ? `<button class="round-btn plan-undo" aria-label="Rückgängig">${ICON.del}</button>` : ''}
    ${sail ? `<button class="btn green sail" aria-label="Segel setzen">${sailIcon()}</button>` : ''}`;
}

export const sailIcon = () => `<svg class="sail-icon" viewBox="0 0 56 48" aria-hidden="true"><g stroke="#3b2a20" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M26 4 V36" /><path d="M28 6 Q48 16 46 34 H28Z" fill="#fff7e2"/><path d="M33 15 L42 23 L33 31Z" fill="#3fb563" stroke-width="2.5"/>
  <path d="M8 36 H50 Q46 46 38 46 H18 Q10 46 8 36Z" fill="#b0703f"/></g></svg>`;
