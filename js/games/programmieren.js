// Programmierinsel: Seekarten-Rätsel. Das Kind legt einen Plan aus Plättchen und lässt sein Schiff fahren.
// Aufgabenarten (task.type): probe (Pfeile wirken sofort), planen, vorher (Wo landet es?),
// fehler (Kokos Plan reparieren), regel (Ausguck auf drei Karten).
import { P, content } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { getState, markSeen, seenCount, leastSeenFirst } from '../engine/storage.js';
import { pick, shuffle, shake, wait, rnd } from '../engine/util.js';
import {
  ABS, REL, SETS, parseLevel, analyse, run, runRule, flatten, nextHint, makePrediction, breakPlan,
  generate, transformDef, key,
} from './seekarte.js';
import { createBoard, createPalette, createPlan, controlsHtml, nameOf, stepMs } from './seekarte-ui.js';
import { opIcon, swirlSvg } from '../art/sea.js';

const VEC = { E: [1, 0], S: [0, 1], W: [-1, 0], N: [0, -1] };
const ABS_FACE = { up: 'N', down: 'S', left: 'W', right: 'E' };

const INTRO = {
  probe: 'prog_probe_intro', 'planen-planen': 'prog_planen_intro', 'planen-reise': 'prog_reise_intro',
  'planen-strudel': 'prog_strudel_intro', 'planen-treppe': 'prog_treppe_intro', 'planen-drehen': 'prog_steuerrad_intro',
  'planen-kurven': 'prog_kurven_intro', 'planen-rund': 'prog_rund_intro', 'planen-zufall': 'prog_reise_intro',
  vorher: 'prog_vorher_intro', fehler: 'prog_fehler_intro', 'regel-demo': 'prog_ausguck_intro', regel: 'prog_ausguck_drei',
  meister: 'prog_meister_intro',
};

const paletteFor = (mode, sizes) => [...(mode === 'rel' ? REL : ABS), ...sizes.map(s => 'loop' + s)];
const levelsOf = set => (content.seekarten[set] || []).map((def, i) => parseLevel({ ...def, set, id: set + '-' + i }));

/** Karten eines Satzes, am wenigsten gespielte zuerst; bei gut bekannten Sätzen kommen Zufallskarten dazu. */
function pickLevels(set, n) {
  const all = leastSeenFirst(levelsOf(set), lv => 'p:' + lv.id);
  const chosen = all.slice(0, n);
  if ((set === 'planen' || set === 'reise') && all.every(lv => seenCount('p:' + lv.id) >= 2)) {
    for (let k = 0; k < 2; k++) {
      const lv = set === 'planen' ? generate({ w: 5, h: 4, min: 3, max: 5 }) : generate({ w: 6, h: 5, min: 5, max: 9, coins: 1 });
      if (lv) chosen[chosen.length - 1 - k] = lv;
    }
  }
  return chosen;
}

function planTask(lv, set, type = 'planen') {
  const cfg = SETS[set] || SETS.reise;
  const an = analyse(lv, cfg.mode, cfg.sizes);
  if (!an) return null;
  return {
    type, kind: type === 'planen' ? 'planen-' + set : type, lv, mode: cfg.mode, sizes: cfg.sizes, an,
    slots: cfg.slots || (cfg.tight ? Math.min(10, an.minSlots + 1) : 10), palette: paletteFor(cfg.mode, cfg.sizes),
  };
}

function fehlerTask(lv, set, how) {
  const t = planTask(lv, set, 'fehler');
  if (!t) return null;
  const broken = breakPlan(lv, t.an.solution, how, t.mode);
  return broken ? { ...t, broken } : null;
}

function vorherTask(lv, mode, len) {
  const plain = { ...lv, coins: [], goal: null };
  const pred = makePrediction(plain, mode, len);
  return pred ? { type: 'vorher', kind: 'vorher', lv: plain, mode, pred } : null;
}

function regelTask(i) {
  const bases = content.seekarten.ausguck;
  const flip = Math.random() < 0.5;
  const lvs = shuffle(bases.map((_, k) => k)).slice(0, 3).map(k => parseLevel(transformDef(bases[k], rnd(0, 3), flip)));
  const solution = { blocked: flip ? 'tl' : 'tr', free: 'fwd' };
  return { type: 'regel', kind: i === 0 ? 'regel-demo' : 'regel', lvs, solution, demo: i === 0, freeFixed: i === 1 };
}

export const programmieren = {
  intro: (opts, t) => P(INTRO[t.kind] || INTRO[t.kind.replace(/^meister-/, '')] || 'prog_planen_intro'),
  hasMedal: () => true,

  makeTasks({ kind, set, probe = false, n = 5 }) {
    const out = [];
    if (kind === 'planen') {
      const levels = pickLevels(set, n).map(lv => planTask(lv, set)).filter(Boolean).sort((a, b) => a.an.length - b.an.length);
      if (probe && levels.length) {
        const easiest = levelsOf(set).map(lv => planTask(lv, set)).sort((a, b) => a.an.length - b.an.length)[rnd(0, 2)];
        out.push({ ...easiest, type: 'probe', kind: 'probe' });
        levels.pop();
      }
      out.push(...levels);
    } else if (kind === 'vorher') {
      pickLevels(set, n + 3).forEach(lv => { if (out.length < n) { const t = vorherTask(lv, SETS[set].mode, 3 + out.length); if (t) out.push(t); } });
    } else if (kind === 'fehler') {
      const hows = ['wrong', 'wrong', 'missing', 'extra', 'wrong'];
      pickLevels(set, n + 3).forEach(lv => { if (out.length < n) { const t = fehlerTask(lv, set, hows[out.length]); if (t) out.push(t); } });
    } else if (kind === 'regel') {
      for (let i = 0; i < n; i++) out.push(regelTask(i));
    } else if (kind === 'mix') {
      const [k1, k2, k3, k4] = shuffle(levelsOf('kurven'));
      out.push(planTask(k1, 'kurven'), fehlerTask(k2, 'kurven', 'wrong') || planTask(k2, 'kurven'),
        planTask(pick(levelsOf('rund')), 'rund'), regelTask(2), vorherTask(k3, 'rel', 5) || planTask(k4, 'kurven'));
      out.forEach(t => { t.kind = 'meister-' + t.kind; });
      out[0].kind = 'meister';
    }
    return out.filter(Boolean);
  },

  mount(root, t, api) {
    if (t.type === 'probe') return mountProbe(root, t, api);
    if (t.type === 'vorher') return mountVorher(root, t, api);
    if (t.type === 'regel') return mountRegel(root, t, api);
    return mountPlan(root, t, api);
  },
};

/* ---------- Hilfen ---------- */

function failSay(result) {
  if (result === 'rock') return pick(P('prog_felsen'));
  if (result === 'edge') return P('prog_rand');
  if (result === 'coins') return P('prog_muenze_vergessen');
  if (result === 'loop') return P('prog_kreis');
  return P('prog_kurz');
}

/** Wo steht das Schiff nach diesem (Teil-)Plan? */
function stateAfter(lv, prog) {
  const r = run({ ...lv, goal: null }, prog);
  const s = r.steps[r.steps.length - 1];
  return s && (r.result === 'short') ? { x: s.x, y: s.y, face: s.face } : { x: lv.start.x, y: lv.start.y, face: lv.face };
}

function showGhost(board, lv, at, op) {
  if (!op) return;
  if (op === 'tl' || op === 'tr') { board.ghostTurn(at, at.face, op); return; }
  const f = op === 'fwd' ? at.face : ABS_FACE[op];
  board.ghostMove(at, { x: at.x + VEC[f][0], y: at.y + VEC[f][1] });
}
const firstOp = node => (node ? (node.op === 'loop' ? node.body[0] && node.body[0].op : node.op) : null);

/* ---------- Probefahrt: jeder Pfeil fährt sofort ---------- */

function mountProbe(root, t, api) {
  root.innerHTML = `<div class="prog probe"><div class="prog-main">
    <div class="board-box"></div><div class="palette dpad"></div></div></div>`;
  const board = createBoard(root.querySelector('.board-box'), t.lv, { mode: t.mode, ship: getState().ship });
  const moves = [];
  const queue = [];   // schnelle Tipps während der Fahrt gehen nicht verloren
  let bumps = 0, busy = false, finished = false;
  const pal = createPalette(root.querySelector('.palette'), ABS, (name, btn) => {
    if (finished || queue.length >= 3) return;
    queue.push([name, btn]);
    if (!busy) drain();
  });
  async function drain() {
    busy = true;
    while (queue.length && api.alive() && !finished) await step(...queue.shift());
    busy = false;
  }
  async function step(name, btn) {
    board.clearGhost();
    pal.clearHint();
    sfx('tap');
    const r = run(t.lv, [...moves, { op: name }]);
    await board.play([r.steps[r.steps.length - 1]], { alive: api.alive });
    if (!api.alive()) return;
    if (r.result === 'rock' || r.result === 'edge') {
      bumps++;
      queue.length = 0;
      api.wrong({ target: btn, say: failSay(r.result) });
      if (bumps >= 3) {
        const got = new Set(r.steps.filter(s => s.coin).map(s => key(s.x, s.y)));
        const here = { ...t.lv, start: { ...board.pos }, face: board.face, coins: t.lv.coins.filter(c => !got.has(key(c.x, c.y))) };
        const an = analyse(here, 'abs');
        if (an && an.paths[0][0]) { showGhost(board, here, { ...board.pos, face: board.face }, an.paths[0][0]); pal.hint(an.paths[0][0]); }
      }
    } else {
      moves.push({ op: name });
      if (r.result === 'win') {
        finished = true;
        queue.length = 0;
        board.openChest(t.lv.goal);
        markSeen('p:' + t.lv.id);
        await api.correct({ target: board.chestEl(t.lv.goal), say: pick(P('prog_geschafft')) });
        api.done(bumps <= 1, { best: true });
      }
    }
  }
}

/* ---------- Planen und Fehler finden ---------- */

function mountPlan(root, t, api) {
  root.innerHTML = `<div class="prog ${t.mode}"><div class="prog-main">
      <div class="board-box"></div><div class="palette ${t.mode === 'rel' ? 'wheel' : 'dpad'}"></div></div>
    <div class="prog-bar"><div class="plan-host"></div>${controlsHtml()}</div></div>`;
  const board = createBoard(root.querySelector('.board-box'), t.lv, { mode: t.mode, ship: getState().ship });
  const sailBtn = root.querySelector('.sail');
  let fails = 0, busy = false, edited = t.type !== 'fehler';

  const plan = createPlan(root.querySelector('.plan-host'), {
    slots: t.type === 'fehler' ? Math.max(t.slots, t.broken.length + 2) : t.slots,
    choices: t.palette,
    onChange: () => {
      edited = true;
      pal.clearHint();
      board.clearGhost();
      plan.clearMarks();
      if (!board.atStart) board.reset();
      sailBtn.classList.toggle('ready', flatten(plan.program).length > 0);
    },
    onCount: word => api.koko.talk(word),
  });
  const pal = createPalette(root.querySelector('.palette'), t.palette, (name, btn) => {
    if (busy) return;
    if (!plan.add(name)) {
      sfx('wrong');
      shake(btn);
      if (plan.full()) api.koko.say(P(t.sizes.length ? 'prog_strudel_platz' : 'prog_voll'));
      return;
    }
    sfx(name.startsWith('loop') ? 'swirl' : 'pop');
  });
  if (t.type === 'fehler') { plan.set(t.broken); sailBtn.classList.add('ready'); }

  root.querySelector('.plan-undo').addEventListener('click', () => { if (!busy && plan.undo()) sfx('tap'); });
  sailBtn.addEventListener('click', () => sail());

  const lock = on => { busy = on; plan.lock(on); pal.lock(on); sailBtn.disabled = on; };

  async function sail(prog = plan.program, solution = false) {
    if (busy || !api.alive()) return;
    if (!flatten(prog).length) { shake(sailBtn); api.koko.say(P('prog_leer')); return; }
    lock(true);
    board.reset();
    plan.clearMarks();
    pal.clearHint();
    sfx('sail');
    const r = run(t.lv, prog);
    await board.play(r.steps, { onStep: s => plan.highlight(s.path, s.iter), alive: api.alive });
    if (!api.alive()) return;
    plan.clearRun();
    if (r.result === 'win') {
      board.openChest(t.lv.goal);
      plan.dimAfter(r.last);
      if (solution) { await wait(1400); api.done(false, { best: false }); return; }
      markSeen('p:' + t.lv.id);
      const best = plan.tiles() <= t.an.par;
      await api.correct({ target: board.chestEl(t.lv.goal), say: pick(P('prog_geschafft')) });
      api.done(fails <= 1, { best });
      return;
    }
    if (r.blame) plan.mark(r.blame, 'blame');
    if (!edited) {
      // Kokos kaputter Plan ist zum ersten Mal gefahren – das zählt nicht als Fehlversuch.
      edited = true;
      api.wrong({ silent: true });
      lock(false);
      await api.koko.say(failSay(r.result));
      if (api.alive()) api.koko.say(P('prog_fehler_tap'));
      return;
    }
    fails++;
    if (fails >= 3) return showSolution();
    api.wrong({ silent: true });
    lock(false);
    await api.koko.say(failSay(r.result));
    if (fails >= 2 && api.alive()) hint();
  }

  function hint() {
    const h = nextHint(plan.program, t.an.solutions);
    if (!h) return;
    const want = h.solution[h.at];
    if (h.at < plan.program.length) plan.mark([h.at], 'hint');
    if (want) pal.hint(nameOf(want));
    const op = firstOp(want);
    showGhost(board, t.lv, stateAfter(t.lv, h.solution.slice(0, h.at)), op);
    api.koko.say(P(op === 'tl' || op === 'tr' ? 'prog_rot_gruen' : t.mode === 'rel' ? 'prog_drehen_hint' : 'prog_hilfe'));
  }

  async function showSolution() {
    api.wrong({ silent: true });
    await api.koko.say(P('prog_loesung'));
    if (!api.alive()) return;
    const sol = nextHint(plan.program, t.an.solutions).solution;
    for (let i = 1; i <= sol.length; i++) {
      plan.set(sol.slice(0, i));
      sfx('pop');
      await wait(320);
      if (!api.alive()) return;
    }
    busy = false;
    sail(sol, true);
  }
}

/* ---------- Wo landet es? ---------- */

function mountVorher(root, t, api) {
  root.innerHTML = `<div class="prog vorher ${t.mode}"><div class="prog-main"><div class="board-box"></div></div>
    <div class="prog-bar"><div class="plan-host"></div></div></div>`;
  const board = createBoard(root.querySelector('.board-box'), t.lv, { mode: t.mode, ship: getState().ship, chests: t.pred.chests });
  const plan = createPlan(root.querySelector('.plan-host'), { slots: t.pred.ops.length, editable: false });
  plan.set(t.pred.ops.map(op => ({ op })));
  board.el.classList.add('pick-chest');
  let done = false;
  board.el.addEventListener('click', async e => {
    const chest = e.target.closest('.map-chest');
    if (!chest || done || !api.alive()) return;
    done = true;
    board.el.classList.remove('pick-chest');
    const [x, y] = chest.dataset.k.split(',').map(Number);
    chest.classList.add('found');
    sfx('pop');
    await wait(300);
    const r = run(t.lv, t.pred.ops.map(op => ({ op })));
    await board.play(r.steps, { onStep: s => plan.highlight(s.path, s.iter), alive: api.alive });
    if (!api.alive()) return;
    plan.clearRun();
    board.openChest(t.pred.end);
    if (x === t.pred.end.x && y === t.pred.end.y) {
      await api.correct({ target: chest, say: pick(P('prog_geschafft')) });
      api.done(true, { best: true });
    } else {
      chest.classList.remove('found');
      chest.classList.add('nope');
      api.wrong({ target: null, silent: true });
      await Promise.all([api.koko.say(P('prog_falsche_kiste')), wait(1800)]);
      api.done(false, { best: false });
    }
  });
}

/* ---------- Der Ausguck: eine Regel für drei Karten ---------- */

const waterIcon = () => `<svg class="op-svg" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="9" width="38" height="30" rx="8" fill="#7ad9e6" stroke="#3b2a20" stroke-width="3"/>
  <path d="M12 21 q6 -5 12 0 t12 0 M12 30 q6 -5 12 0 t12 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`;

function mountRegel(root, t, api) {
  const rule = t.demo ? { ...t.solution } : { blocked: null, free: t.freeFixed ? 'fwd' : null };
  const fixed = w => t.demo || (w === 'free' && t.freeFixed);
  root.innerHTML = `<div class="prog regel"><div class="mini-boards">${t.lvs.map(() => '<div class="board-box mini"></div>').join('')}</div>
    <div class="prog-bar"><div class="rule panel">
      <span class="rule-look">${opIcon('look')}</span>
      <div class="rule-rows">
        <div class="rule-row"><span class="rule-if rock">${opIcon('rock')}</span><span class="rule-to"></span><button class="ptile rule-slot" data-w="blocked"></button></div>
        <div class="rule-row"><span class="rule-if">${waterIcon()}</span><span class="rule-to"></span><button class="ptile rule-slot" data-w="free"></button></div>
      </div>
      <span class="rule-until">${swirlSvg()}${opIcon('chest')}</span>
      <div class="chooser" hidden></div>
    </div>${controlsHtml({ undo: false })}</div></div>`;
  const boards = [...root.querySelectorAll('.board-box')].map((box, i) => createBoard(box, t.lvs[i], { mode: 'rel', ship: getState().ship }));
  const ruleEl = root.querySelector('.rule');
  const chooser = ruleEl.querySelector('.chooser');
  const sailBtn = root.querySelector('.sail');
  let fails = 0, busy = false;

  function render() {
    ruleEl.querySelectorAll('.rule-slot').forEach(s => {
      const op = rule[s.dataset.w];
      s.className = `ptile rule-slot ${op ? 'op-' + op : 'empty'}${fixed(s.dataset.w) ? ' fixed' : ''}`;
      s.innerHTML = op ? opIcon(op) : '';
    });
    sailBtn.classList.toggle('ready', !!(rule.blocked && rule.free));
  }
  render();
  if (t.demo) sailBtn.classList.add('ready');

  ruleEl.addEventListener('click', e => {
    if (busy) return;
    const c = e.target.closest('.chooser [data-c]');
    if (c) {
      rule[chooser.dataset.w] = c.dataset.c;
      chooser.hidden = true;
      sfx('pop');
      ruleEl.querySelectorAll('.hint, .blame').forEach(n => n.classList.remove('hint', 'blame'));
      boards.forEach(b => b.reset());
      render();
      return;
    }
    const slot = e.target.closest('.rule-slot');
    if (!slot || fixed(slot.dataset.w)) { chooser.hidden = true; return; }
    sfx('tap');
    chooser.dataset.w = slot.dataset.w;
    chooser.innerHTML = REL.map(op => `<button class="ptile op-${op}" data-c="${op}">${opIcon(op)}</button>`).join('');
    chooser.hidden = false;
    chooser.style.top = (slot.offsetTop + slot.offsetHeight + 6) + 'px';
    chooser.style.left = Math.max(0, slot.offsetLeft - 60) + 'px';
  });

  sailBtn.addEventListener('click', () => sail());

  async function sail(solution = false) {
    if (busy || !api.alive()) return;
    if (!rule.blocked || !rule.free) {
      const empty = ruleEl.querySelector('.rule-slot.empty');
      shake(empty);
      api.koko.say(P('prog_leer'));
      return;
    }
    busy = true;
    sailBtn.disabled = true;
    chooser.hidden = true;
    ruleEl.querySelectorAll('.hint, .blame').forEach(n => n.classList.remove('hint', 'blame'));
    boards.forEach(b => b.reset());
    sfx('sail');
    for (let i = 0; i < boards.length; i++) {
      root.querySelectorAll('.board-box').forEach((b, k) => b.classList.toggle('active', k === i));
      const r = runRule(t.lvs[i], rule);
      await boards[i].play(r.steps, {
        alive: api.alive,
        speed: 0.6,
        onStep: s => ruleEl.querySelectorAll('.rule-row').forEach(row => row.classList.toggle('run', row.querySelector('.rule-slot').dataset.w === s.path[0])),
      });
      if (!api.alive()) return;
      ruleEl.querySelectorAll('.rule-row.run').forEach(n => n.classList.remove('run'));
      if (r.result !== 'win') {
        if (r.blame) { const s = ruleEl.querySelector(`.rule-slot[data-w="${r.blame[0]}"]`); s.classList.add('blame'); shake(s); }
        root.querySelectorAll('.board-box')[i].classList.add('failed');
        fails++;
        if (fails >= 3) {
          api.wrong({ silent: true });
          await api.koko.say(P('prog_loesung'));
          Object.assign(rule, t.solution);
          render();
          root.querySelectorAll('.board-box').forEach(b => b.classList.remove('failed'));
          busy = false;
          return solution ? null : sailSolution();
        }
        api.wrong({ silent: true });
        busy = false;
        sailBtn.disabled = false;
        await api.koko.say(r.result === 'loop' ? P('prog_kreis') : P('prog_ausguck_karte'));
        if (fails >= 2 && api.alive()) {
          ['blocked', 'free'].forEach(w => { if (rule[w] !== t.solution[w]) ruleEl.querySelector(`.rule-slot[data-w="${w}"]`).classList.add('hint'); });
          api.koko.say(P('prog_hilfe_regel'));
        }
        return;
      }
      boards[i].openChest(t.lvs[i].goal);
      sfx('correct');
      await wait(stepMs());
      root.querySelectorAll('.board-box')[i].classList.remove('failed');
    }
    root.querySelectorAll('.board-box').forEach(b => b.classList.remove('active'));
    if (solution) { await wait(1200); api.done(false, { best: false }); return; }
    await api.correct({ target: ruleEl, say: P('prog_ausguck_alle') });
    api.done(fails <= 1, { best: fails === 0 });
  }

  async function sailSolution() { await sail(true); }
}

// Für den Kartentisch: selbst gebaute Rätsel mit dem normalen Planungs-Bildschirm lösen.
export { mountPlan, planTask };
