// Der Kartentisch auf der Programmierinsel: freies Spielen ohne Sterne.
//   Malen  – das Schiff zieht eine Farbspur; Vorlagen zum Nachfahren
//   Bauen  – selbst ein Rätsel setzen, prüfen lassen, ob es lösbar ist, und in die Truhe legen
//   Truhe  – gespeicherte Rätsel lösen (z. B. Mama oder Papa) und gemalte Bilder wieder abspielen
import { register, go } from '../engine/router.js';
import { getState, werkstatt, saveWerk, removeWerk } from '../engine/storage.js';
import { P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { shake, wait, pick } from '../engine/util.js';
import { skySvg } from '../art/world.js';
import { createKoko } from '../art/koko.js';
import { ICON, coinSvg } from '../art/icons.js';
import { opIcon, PAINT, boardSvg, CELL } from '../art/sea.js';
import { parseLevel, levelRows, run, analyse, ABS, REL, key } from '../games/seekarte.js';
import { createBoard, createPalette, createPlan, controlsHtml } from '../games/seekarte-ui.js';
import { mountPlan, planTask } from '../games/programmieren.js';

let visited = false;
const PAINT_W = 10, PAINT_H = 6, BUILD_W = 6, BUILD_H = 5;

// Vorlagen: Wege aus Feldern, die beim Malen nachgefahren werden können (Start oben links in der Vorlage).
const TEMPLATES = [
  { id: 'viereck', start: [2, 1], path: 'RRRDDDLLLUUU' },
  { id: 'treppe', start: [1, 4], path: 'URURURUR' },
  { id: 'L', start: [2, 0], path: 'DDDDRRR' },
  { id: 'zickzack', start: [1, 1], path: 'DDRUURDDRUURDD' },
];
const STEP = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
const edgeKey = (a, b) => (a.x < b.x || (a.x === b.x && a.y < b.y) ? `${a.x},${a.y}-${b.x},${b.y}` : `${b.x},${b.y}-${a.x},${a.y}`);
function templateEdges(tp) {
  let p = { x: tp.start[0], y: tp.start[1] };
  const edges = [];
  for (const c of tp.path) {
    const q = { x: p.x + STEP[c][0], y: p.y + STEP[c][1] };
    edges.push([p, q]);
    p = q;
  }
  return edges;
}

register('kartentisch', (el, { view = 'start' } = {}) => {
  const state = getState();
  const steering = !!(state.settings && state.settings.unlockAll) || state.stars['prog-kurven'] > 0;
  el.innerHTML = `
    <div class="sky">${skySvg()}</div>
    <header class="hud">
      <button class="round-btn back" aria-label="Zurück">${ICON.back}</button>
      <div class="plank">Kartentisch</div>
      <div class="coins">${coinSvg()}<b>${state.coins}</b></div>
    </header>
    <main class="tisch"></main>`;
  const main = el.querySelector('.tisch');
  const koko = createKoko();
  el.appendChild(koko.el);
  let alive = true;
  const back = el.querySelector('.back');
  let backTo = () => go('island', { island: 'programmieren' });
  back.addEventListener('click', () => { sfx('tap'); backTo(); });

  const views = { start: showStart, malen: showMalen, bauen: showBauen, truhe: showTruhe };
  views[view]();

  /* ---------- Auswahl ---------- */
  function showStart() {
    backTo = () => go('island', { island: 'programmieren' });
    main.innerHTML = `<div class="tisch-start">
      <button class="tisch-choice panel" data-v="malen">${miniPaint()}<span>Malen</span></button>
      <button class="tisch-choice panel" data-v="bauen">${miniBuild()}<span>Rätsel bauen</span></button>
      <button class="tisch-choice panel" data-v="truhe">${opIcon('chest')}<span>Meine Truhe</span></button>
    </div>`;
    main.querySelector('.tisch-start').addEventListener('click', e => {
      const b = e.target.closest('.tisch-choice');
      if (!b) return;
      sfx('pop');
      views[b.dataset.v]();
    });
    if (!visited) { visited = true; koko.say(P('tisch_intro')); } else koko.show(P('tisch_intro'));
  }

  /* ---------- Malen ---------- */
  function showMalen({ mode = 'abs', program = null } = {}) {
    backTo = () => showStart();
    const lv = parseLevel({ map: Array.from({ length: PAINT_H }, (_, y) => Array.from({ length: PAINT_W }, (_, x) => (x === 0 && y === 0 ? 'S' : '.')).join('')) });
    let template = null;
    main.innerHTML = `<div class="prog tisch-malen ${mode}"><div class="prog-main">
        <div class="board-box"></div>
        <div class="tisch-side">
          ${steering ? `<div class="mode-switch"><button class="ptile op-right${mode === 'abs' ? ' on' : ''}" data-m="abs">${opIcon('right')}</button><button class="ptile op-tr${mode === 'rel' ? ' on' : ''}" data-m="rel">${opIcon('tr')}</button></div>` : ''}
          <div class="palette paint-pal"></div>
          <div class="templates">${TEMPLATES.map((tp, i) => `<button class="tpl" data-i="${i}">${templateThumb(tp)}</button>`).join('')}</div>
        </div></div>
      <div class="prog-bar"><div class="plan-host"></div>${controlsHtml()}<button class="round-btn save-btn" aria-label="Speichern">${ICON.check}</button></div></div>`;
    const board = createBoard(main.querySelector('.board-box'), lv, { mode, ship: state.ship });
    const tplLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tplLayer.setAttribute('class', 'template');
    board.el.querySelector('.water').after(tplLayer);
    const names = [...(mode === 'rel' ? REL : ABS), 'loop1', 'loop2', 'color0', 'color1', 'color2', 'pen'];
    const plan = createPlan(main.querySelector('.plan-host'), {
      slots: 12, choices: names, onChange: () => { if (!board.atStart) board.reset(); }, onCount: w => koko.talk(w),
    });
    const pal = createPalette(main.querySelector('.paint-pal'), names, (name, btn) => {
      if (!plan.add(name)) { sfx('wrong'); shake(btn); return; }
      sfx('pop');
    });
    if (program) plan.set(program);
    koko.say(P('tisch_malen_intro'));

    main.querySelector('.plan-undo').addEventListener('click', () => { if (plan.undo()) sfx('tap'); });
    const ms = main.querySelector('.mode-switch');
    if (ms) ms.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b && b.dataset.m !== mode) { sfx('pop'); showMalen({ mode: b.dataset.m }); } });

    main.querySelector('.templates').addEventListener('click', e => {
      const b = e.target.closest('.tpl');
      if (!b) return;
      sfx('tap');
      const tp = TEMPLATES[Number(b.dataset.i)];
      template = template === tp ? null : tp;
      main.querySelectorAll('.tpl').forEach(x => x.classList.toggle('on', template && x === b));
      tplLayer.innerHTML = template ? templateEdges(template).map(([a, c]) => `<line x1="${a.x * CELL + 50}" y1="${a.y * CELL + 50}" x2="${c.x * CELL + 50}" y2="${c.y * CELL + 50}"/>`).join('') : '';
    });

    let busy = false;
    main.querySelector('.sail').addEventListener('click', async () => {
      if (busy || !plan.program.length) { if (!plan.program.length) koko.say(P('prog_leer')); return; }
      busy = true;
      pal.lock(true); plan.lock(true);
      board.reset();
      sfx('sail');
      const r = run(lv, plan.program, { paint: true, maxSteps: 120 });
      await board.play(r.steps, { onStep: s => plan.highlight(s.path, s.iter), alive: () => alive, speed: 0.6 });
      if (!alive) return;
      plan.clearRun();
      pal.lock(false); plan.lock(false);
      busy = false;
      if (r.result === 'edge') { koko.say(P('prog_rand')); return; }
      if (template) {
        const painted = new Set(r.steps.filter(s => s.kind === 'move' && s.color !== null).map(s => edgeKey(s.from, s)));
        if (templateEdges(template).every(([a, c]) => painted.has(edgeKey(a, c)))) {
          sfx('fanfare');
          koko.cheer();
          koko.say(P('tisch_vorlage_ok'));
          return;
        }
      }
      koko.say(pick(P('tisch_malen_fertig')));
    });

    main.querySelector('.save-btn').addEventListener('click', e => {
      if (!plan.program.length) { shake(e.currentTarget); return; }
      saveWerk('bilder', { mode, program: plan.program });
      sfx('coin');
      koko.cheer();
      koko.say(P('tisch_gespeichert'));
    });
  }

  /* ---------- Rätsel bauen ---------- */
  function showBauen() {
    backTo = () => showStart();
    let tool = 'rock';
    const lv = parseLevel({ map: Array.from({ length: BUILD_H }, () => '.'.repeat(BUILD_W)) });
    lv.start = null;
    main.innerHTML = `<div class="prog tisch-bauen"><div class="prog-main">
        <div class="board-box"></div>
        <div class="palette tools">${['ship', 'chest', 'rock', 'coin', 'erase'].map(t => `<button class="ptile big tool${t === tool ? ' on' : ''}" data-t="${t}">${opIcon(t)}</button>`).join('')}</div>
      </div>
      <div class="prog-bar build-bar"><button class="btn gold check-btn">?</button><button class="btn green store-btn" disabled>${opIcon('chest')}</button></div></div>`;
    const box = main.querySelector('.board-box');
    const saveBtn = main.querySelector('.store-btn');
    let solvable = false;
    const draw = () => {
      const view = { ...lv, start: lv.start || { x: -5, y: -5 } };
      box.innerHTML = boardSvg(view, { ship: state.ship, empty: !lv.start });
      saveBtn.disabled = !solvable;
    };
    draw();
    koko.say(P('tisch_bauen_intro'));

    main.querySelector('.tools').addEventListener('click', e => {
      const b = e.target.closest('.tool');
      if (!b) return;
      sfx('tap');
      tool = b.dataset.t;
      main.querySelectorAll('.tool').forEach(x => x.classList.toggle('on', x === b));
    });

    box.addEventListener('click', e => {
      const svg = box.querySelector('svg');
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const x = Math.floor(p.x / CELL), y = Math.floor(p.y / CELL);
      if (x < 0 || y < 0 || x >= lv.w || y >= lv.h) return;
      const k = key(x, y);
      // Feld zuerst leeren, dann setzen
      lv.rocks = lv.rocks.filter(c => key(c.x, c.y) !== k);
      lv.coins = lv.coins.filter(c => key(c.x, c.y) !== k);
      lv.blocked.delete(k);
      if (lv.start && key(lv.start.x, lv.start.y) === k) lv.start = null;
      if (lv.goal && key(lv.goal.x, lv.goal.y) === k) lv.goal = null;
      if (tool === 'ship') lv.start = { x, y };
      if (tool === 'chest') lv.goal = { x, y };
      if (tool === 'rock') { lv.rocks.push({ x, y }); lv.blocked.add(k); }
      if (tool === 'coin' && lv.coins.length < 3) lv.coins.push({ x, y });
      sfx(tool === 'erase' ? 'tap' : 'pop');
      solvable = false;
      draw();
    });

    main.querySelector('.check-btn').addEventListener('click', async () => {
      if (!lv.start || !lv.goal) { sfx('wrong'); koko.say(P('tisch_fehlt')); return; }
      const an = analyse(lv, 'abs');
      solvable = !!an && an.length >= 2;
      draw();
      if (solvable) {
        sfx('correct');
        koko.cheer();
        const chest = box.querySelector('.map-chest');
        if (chest) chest.classList.add('found');
        koko.say(P('tisch_geht'));
      } else {
        sfx('wrong');
        koko.say(P('tisch_geht_nicht'));
      }
    });

    saveBtn.addEventListener('click', () => {
      if (!solvable) return;
      saveWerk('raetsel', { map: levelRows(lv) });
      sfx('coin');
      koko.say(P('tisch_gespeichert'));
      solvable = false;
      draw();
    });
  }

  /* ---------- Meine Truhe ---------- */
  function showTruhe() {
    backTo = () => showStart();
    const w = werkstatt();
    main.innerHTML = `<div class="tisch-truhe">
      <h2 class="truhe-title">${opIcon('chest')}</h2>
      <div class="tisch-list">
        ${w.raetsel.map((r, i) => `<div class="werk panel"><button class="werk-open" data-k="raetsel" data-i="${i}">${boardSvg(parseLevel(r), { ship: state.ship })}</button><button class="werk-del" data-k="raetsel" data-i="${i}" aria-label="Wegwerfen">${opIcon('trash')}</button></div>`).join('')}
        ${w.bilder.map((b, i) => `<div class="werk panel"><button class="werk-open" data-k="bilder" data-i="${i}">${paintThumb(b)}</button><button class="werk-del" data-k="bilder" data-i="${i}" aria-label="Wegwerfen">${opIcon('trash')}</button></div>`).join('')}
      </div></div>`;
    koko.say(P(w.raetsel.length || w.bilder.length ? 'tisch_truhe' : 'tisch_truhe_leer'));
    main.querySelector('.tisch-list').addEventListener('click', e => {
      const del = e.target.closest('.werk-del');
      if (del) {
        if (!del.classList.contains('armed')) { del.classList.add('armed'); sfx('tap'); return; }
        removeWerk(del.dataset.k, Number(del.dataset.i));
        sfx('pop');
        showTruhe();
        return;
      }
      const open = e.target.closest('.werk-open');
      if (!open) return;
      sfx('pop');
      const item = werkstatt()[open.dataset.k][Number(open.dataset.i)];
      if (open.dataset.k === 'bilder') showMalen({ mode: item.mode, program: item.program });
      else solve(item);
    });
  }

  /** Ein gebautes Rätsel lösen – derselbe Bildschirm wie in den Stationen, aber ohne Sterne. */
  function solve(item) {
    backTo = () => showTruhe();
    const t = planTask(parseLevel({ ...item, set: 'eigen', id: 'eigen' }), 'eigen');
    main.innerHTML = '<div class="task"></div>';
    koko.say(P('prog_planen_intro'));
    mountPlan(main.querySelector('.task'), t, {
      koko,
      ready: Promise.resolve(),
      alive: () => alive,
      async correct({ say } = {}) { sfx('correct'); koko.cheer(); await Promise.all([koko.say(say || pick(P('praise'))), wait(900)]); },
      wrong({ target, say, silent = false } = {}) { sfx('wrong'); shake(target); if (!silent) koko.say(say || pick(P('retry'))); },
      done() { if (alive) setTimeout(() => { if (alive) showTruhe(); }, 600); },
    });
  }

  return () => { alive = false; };
});

/* ---------- kleine Vorschaubilder ---------- */

function templateThumb(tp) {
  const edges = templateEdges(tp);
  const xs = edges.flat().map(p => p.x), ys = edges.flat().map(p => p.y);
  const minX = Math.min(...xs), minY = Math.min(...ys), w = Math.max(...xs) - minX || 1, h = Math.max(...ys) - minY || 1;
  return `<svg viewBox="${minX - 0.5} ${minY - 0.5} ${w + 1} ${h + 1}" class="tpl-svg" aria-hidden="true">${edges.map(([a, b]) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`).join('')}</svg>`;
}

function paintThumb(b) {
  const lv = parseLevel({ map: Array.from({ length: PAINT_H }, (_, y) => Array.from({ length: PAINT_W }, (_, x) => (x === 0 && y === 0 ? 'S' : '.')).join('')), face: 'E' });
  const r = run(lv, b.program, { paint: true, maxSteps: 120 });
  const lines = r.steps.filter(s => s.kind === 'move' && s.color !== null).map(s => `<line x1="${s.from.x}" y1="${s.from.y}" x2="${s.x}" y2="${s.y}" stroke="${PAINT[s.color]}"/>`).join('');
  return `<svg class="paint-thumb" viewBox="-0.6 -0.6 ${PAINT_W + 0.2} ${PAINT_H + 0.2}" aria-hidden="true"><rect x="-0.6" y="-0.6" width="${PAINT_W + 0.2}" height="${PAINT_H + 0.2}" rx=".4" fill="#7ad9e6"/>${lines}</svg>`;
}

const miniPaint = () => `<svg class="tisch-ico" viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="4" width="56" height="56" rx="10" fill="#7ad9e6" stroke="#3b2a20" stroke-width="4"/>
  <path d="M14 48 V16 H48 V48 H26" fill="none" stroke="#f0553f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const miniBuild = () => `<svg class="tisch-ico" viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="4" width="56" height="56" rx="10" fill="#7ad9e6" stroke="#3b2a20" stroke-width="4"/>
  <g stroke="#3b2a20" stroke-width="3"><path d="M14 30 Q12 18 22 14 Q32 12 34 22 Q36 32 14 30Z" fill="#8f8578"/><circle cx="44" cy="44" r="9" fill="#ffcb3d"/></g></svg>`;
