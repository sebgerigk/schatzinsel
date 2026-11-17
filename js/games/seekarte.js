// Seekarten-Logik ohne Bildschirm: Karten lesen, Pläne ausführen, kürzeste Lösungen finden.
// Wird von der Programmierinsel und vom Kartentisch benutzt.
//
// Ein Plan ist eine Liste von Plättchen:
//   { op: 'up' | 'down' | 'left' | 'right' }      Bildschirm-Pfeile (Teil 1)
//   { op: 'fwd' | 'tl' | 'tr' }                     Steuerrad: vorwärts, links / rechts drehen (Teil 2)
//   { op: 'loop', size, n, body: [...] }             Strudel: body (höchstens size Plättchen) n-mal
//   { op: 'color', c } / { op: 'pen' }               nur beim Malen: Farbe wechseln / Spur aus
// Eine Regel (Ausguck) ist { blocked: op, free: op } und wird bis zum Schatz wiederholt.
import { rnd, pick, shuffle } from '../engine/util.js';

export const ABS = ['up', 'down', 'left', 'right'];
export const REL = ['fwd', 'tl', 'tr'];
const VEC = { E: [1, 0], S: [0, 1], W: [-1, 0], N: [0, -1] };
const ABS_FACE = { up: 'N', down: 'S', left: 'W', right: 'E' };
const CLOCK = ['E', 'S', 'W', 'N'];
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left', tl: 'tr', tr: 'tl', fwd: 'fwd' };

export const key = (x, y) => x + ',' + y;
export const turn = (face, op) => CLOCK[(CLOCK.indexOf(face) + (op === 'tr' ? 1 : 3)) % 4];
export const isMove = op => ABS.includes(op) || REL.includes(op);

/**
 * Karte aus Textzeilen: S Start, T Schatz, # Felsen, I kleine Insel, $ Münze, . Wasser.
 * face: Blickrichtung des Schiffs am Start (E, S, W, N).
 */
export function parseLevel(def) {
  const rows = def.map;
  const lv = {
    id: def.id || rows.join('/'), set: def.set, w: rows[0].length, h: rows.length, face: def.face || 'E',
    start: null, goal: null, rocks: [], isles: [], coins: [], blocked: new Set(),
  };
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === 'S') lv.start = { x, y };
    else if (ch === 'T') lv.goal = { x, y };
    else if (ch === '#') { lv.rocks.push({ x, y }); lv.blocked.add(key(x, y)); }
    else if (ch === 'I') { lv.isles.push({ x, y }); lv.blocked.add(key(x, y)); }
    else if (ch === '$') lv.coins.push({ x, y });
  }));
  return lv;
}

/** Karte wieder als Textzeilen (zum Speichern selbst gebauter Rätsel). */
export function levelRows(lv) {
  const rows = Array.from({ length: lv.h }, () => Array(lv.w).fill('.'));
  lv.rocks.forEach(p => { rows[p.y][p.x] = '#'; });
  lv.isles.forEach(p => { rows[p.y][p.x] = 'I'; });
  lv.coins.forEach(p => { rows[p.y][p.x] = '$'; });
  if (lv.start) rows[lv.start.y][lv.start.x] = 'S';
  if (lv.goal) rows[lv.goal.y][lv.goal.x] = 'T';
  return rows.map(r => r.join(''));
}

export const inside = (lv, x, y) => x >= 0 && y >= 0 && x < lv.w && y < lv.h;
export const free = (lv, x, y) => inside(lv, x, y) && !lv.blocked.has(key(x, y));

/** Alle Plättchen in Ausführungsreihenfolge. path: [Platz] oder [Platz, Platz im Strudel]; iter: Durchgang. */
export function flatten(program) {
  const out = [];
  program.forEach((node, i) => {
    if (node.op === 'loop') {
      for (let k = 0; k < node.n; k++) node.body.forEach((b, j) => { if (b) out.push({ ...b, path: [i, j], iter: k }); });
    } else {
      out.push({ ...node, path: [i], iter: 0 });
    }
  });
  return out;
}

/** Wie viele Plättchen ein Plan hat (ein Strudel zählt eins plus seinen Inhalt). */
export const tileCount = program => program.reduce((n, node) => n + (node.op === 'loop' ? 1 + node.body.length : 1), 0);

/**
 * Führt einen Plan aus. Ergebnis: { steps, result, blame, last }
 *   steps: [{ x, y, face, kind: 'move'|'turn'|'rock'|'edge'|'paint', path, iter, coin, from }]
 *   result: 'win' | 'rock' | 'edge' | 'short' | 'coins' | 'loop'
 *   blame: path des Plättchens, an dem es schiefging (oder null)
 *   last: Index des zuletzt ausgeführten Platzes (danach ist alles „übrig")
 */
export function run(lv, program, { maxSteps = 80, paint = false } = {}) {
  let x = lv.start.x, y = lv.start.y, face = lv.face;
  const got = new Set();
  const steps = [];
  let goalSeen = false, last = -1;
  let color = paint ? 0 : null, pen = true;
  for (const a of flatten(program)) {
    last = a.path[0];
    if (steps.length >= maxSteps) return { steps, result: 'loop', blame: a.path, last };
    if (a.op === 'color') { color = a.c; pen = true; steps.push({ x, y, face, kind: 'color', path: a.path, iter: a.iter, color }); continue; }
    if (a.op === 'pen') { pen = false; steps.push({ x, y, face, kind: 'color', path: a.path, iter: a.iter, color: null }); continue; }
    if (a.op === 'tl' || a.op === 'tr') {
      face = turn(face, a.op);
      steps.push({ x, y, face, kind: 'turn', turn: a.op, path: a.path, iter: a.iter });
      continue;
    }
    const f = a.op === 'fwd' ? face : ABS_FACE[a.op];
    if (!f) continue;
    face = f;
    const nx = x + VEC[f][0], ny = y + VEC[f][1];
    if (!inside(lv, nx, ny)) {
      steps.push({ x, y, face, kind: 'edge', path: a.path, iter: a.iter, tx: nx, ty: ny });
      return { steps, result: 'edge', blame: a.path, last };
    }
    if (lv.blocked.has(key(nx, ny))) {
      steps.push({ x, y, face, kind: 'rock', path: a.path, iter: a.iter, tx: nx, ty: ny });
      return { steps, result: 'rock', blame: a.path, last };
    }
    const from = { x, y };
    x = nx; y = ny;
    let coin = false;
    const k = key(x, y);
    if (lv.coins.some(c => key(c.x, c.y) === k) && !got.has(k)) { got.add(k); coin = true; }
    steps.push({ x, y, face, kind: 'move', path: a.path, iter: a.iter, coin, from, color: paint && pen ? color : null });
    if (lv.goal && x === lv.goal.x && y === lv.goal.y) {
      goalSeen = true;
      if (got.size === lv.coins.length) return { steps, result: 'win', blame: null, last };
    }
  }
  if (!lv.goal) return { steps, result: 'short', blame: null, last };
  return { steps, result: goalSeen ? 'coins' : 'short', blame: null, last };
}

/**
 * Der Ausguck: bis zum Schatz wiederholen – „vorne Felsen oder Rand? dann rule.blocked, sonst rule.free".
 * path ist hier ['blocked'] bzw. ['free'], damit das Spiel das richtige Feld der Regel aufleuchten lässt.
 */
export function runRule(lv, rule, { maxSteps = 60 } = {}) {
  let x = lv.start.x, y = lv.start.y, face = lv.face;
  const steps = [];
  const seen = new Set();
  while (steps.length < maxSteps) {
    const state = x + ',' + y + ',' + face;
    if (seen.has(state)) return { steps, result: 'loop', blame: null };
    seen.add(state);
    const ax = x + VEC[face][0], ay = y + VEC[face][1];
    const which = free(lv, ax, ay) ? 'free' : 'blocked';
    const op = rule[which];
    if (!op) return { steps, result: 'short', blame: [which] };
    if (op === 'tl' || op === 'tr') {
      face = turn(face, op);
      steps.push({ x, y, face, kind: 'turn', turn: op, path: [which], iter: 0 });
      continue;
    }
    if (!free(lv, ax, ay)) {
      steps.push({ x, y, face, kind: inside(lv, ax, ay) ? 'rock' : 'edge', path: [which], iter: 0, tx: ax, ty: ay });
      return { steps, result: inside(lv, ax, ay) ? 'rock' : 'edge', blame: [which] };
    }
    const from = { x, y };
    x = ax; y = ay;
    steps.push({ x, y, face, kind: 'move', path: [which], iter: 0, from });
    if (x === lv.goal.x && y === lv.goal.y) return { steps, result: 'win', blame: null };
  }
  return { steps, result: 'loop', blame: null };
}

/* ---------- Kürzeste Wege ---------- */

/**
 * Breitensuche über (Feld, Blickrichtung, eingesammelte Münzen).
 * Liefert die Länge des kürzesten Wegs und bis zu `limit` verschiedene kürzeste Wege (als Listen von ops).
 */
export function shortest(lv, mode = 'abs', { limit = 400 } = {}) {
  if (!lv.start || !lv.goal) return null;
  const coinIdx = new Map(lv.coins.map((c, i) => [key(c.x, c.y), i]));
  const full = (1 << lv.coins.length) - 1;
  const ops = mode === 'rel' ? REL : ABS;
  const id = (x, y, f, m) => `${x},${y},${mode === 'rel' ? f : ''},${m}`;
  const start = { x: lv.start.x, y: lv.start.y, f: lv.face, m: 0 };
  const dist = new Map([[id(start.x, start.y, start.f, 0), 0]]);
  const preds = new Map();   // id -> [[prevId, op]]
  const nodes = new Map([[id(start.x, start.y, start.f, 0), start]]);
  let frontier = [start];
  let goals = [];
  for (let d = 0; frontier.length && !goals.length; d++) {
    const next = [];
    for (const s of frontier) {
      const sid = id(s.x, s.y, s.f, s.m);
      for (const op of ops) {
        let { x, y, f, m } = s;
        if (op === 'tl' || op === 'tr') f = turn(f, op);
        else {
          const face = op === 'fwd' ? f : ABS_FACE[op];
          x += VEC[face][0]; y += VEC[face][1];
          if (!free(lv, x, y)) continue;
          if (mode === 'abs') f = face;
          const ci = coinIdx.get(key(x, y));
          if (ci !== undefined) m |= 1 << ci;
        }
        const nid = id(x, y, f, m);
        if (!dist.has(nid)) {
          dist.set(nid, d + 1);
          nodes.set(nid, { x, y, f, m });
          preds.set(nid, [[sid, op]]);
          next.push(nodes.get(nid));
          if (x === lv.goal.x && y === lv.goal.y && m === full) goals.push(nid);
        } else if (dist.get(nid) === d + 1) {
          preds.get(nid).push([sid, op]);
        }
      }
    }
    // Wer den Schatz schon vorher (ohne alle Münzen) erreicht, segelt weiter – das ist erlaubt.
    frontier = next;
  }
  if (!goals.length) return null;
  const paths = [];
  const startId = id(start.x, start.y, start.f, 0);
  const walk = (nid, tail) => {
    if (paths.length >= limit) return;
    if (nid === startId) { paths.push(tail); return; }
    for (const [p, op] of preds.get(nid) || []) walk(p, [op, ...tail]);
  };
  goals.forEach(g => walk(g, []));
  // Wege, die vor dem Ende schon gewinnen würden, gibt es nicht: der Schatz zählt erst mit allen Münzen.
  return { length: dist.get(goals[0]), paths };
}

/**
 * Schreibt eine Folge von ops möglichst kurz als Plan. sizes: erlaubte Strudel-Größen (z. B. [1] oder [2, 3]).
 * objective 'tiles' (wenig Plättchen) oder 'slots' (wenig Plätze in der Leiste).
 */
export function compress(seq, sizes = [], objective = 'tiles') {
  const L = seq.length;
  const best = Array(L + 1);
  best[L] = { tiles: 0, slots: 0, prog: [] };
  const better = (a, b) => (objective === 'tiles'
    ? a.tiles - b.tiles || a.slots - b.slots
    : a.slots - b.slots || a.tiles - b.tiles) < 0;
  for (let i = L - 1; i >= 0; i--) {
    const r = best[i + 1];
    let cand = { tiles: r.tiles + 1, slots: r.slots + 1, prog: [{ op: seq[i] }, ...r.prog] };
    for (const b of sizes) {
      for (let n = 2; n <= 4; n++) {
        const end = i + b * n;
        if (end > L) break;
        let same = true;
        for (let k = b; k < b * n && same; k++) same = seq[i + k] === seq[i + (k % b)];
        if (!same) continue;
        const rest = best[end];
        const c = { tiles: rest.tiles + 1 + b, slots: rest.slots + 1, prog: [{ op: 'loop', size: b, n, body: seq.slice(i, i + b).map(op => ({ op })) }, ...rest.prog] };
        if (better(c, cand)) cand = c;
      }
    }
    best[i] = cand;
  }
  return best[0];
}

/**
 * Alles, was ein Rätsel über seine Lösung wissen muss.
 * par: so wenige Plättchen braucht die beste bekannte Lösung; minSlots: so wenige Plätze.
 */
export function analyse(lv, mode = 'abs', sizes = []) {
  const sp = shortest(lv, mode);
  if (!sp) return null;
  let bestTiles = null, bestSlots = null;
  const solutions = [];
  for (const p of sp.paths) {
    const t = compress(p, sizes, 'tiles');
    const s = sizes.length ? compress(p, sizes, 'slots') : t;
    solutions.push(t.prog);
    if (!bestTiles || t.tiles < bestTiles.tiles) bestTiles = t;
    if (!bestSlots || s.slots < bestSlots.slots) bestSlots = s;
  }
  return { length: sp.length, paths: sp.paths, par: bestTiles.tiles, solution: bestTiles.prog, minSlots: bestSlots.slots, slotSolution: bestSlots.prog, solutions };
}

const same = (a, b) => JSON.stringify(strip(a)) === JSON.stringify(strip(b));
const strip = node => (node.op === 'loop' ? { op: 'loop', size: node.size, n: node.n, body: node.body.map(strip) } : { op: node.op });

/**
 * Für Kokos Hilfe: die Lösung, die am besten zum Plan des Kindes passt, und der erste Platz, an dem der Plan abweicht.
 */
export function nextHint(program, solutions) {
  let best = null;
  for (const sol of solutions) {
    let i = 0;
    while (i < sol.length && i < program.length && same(sol[i], program[i])) i++;
    if (!best || i > best.at) best = { at: i, solution: sol };
  }
  return best;
}

/* ---------- Aufgaben ableiten ---------- */

/** Ein zufälliger, fahrbarer Weg (für „Wo landet es?"). */
export function randomWalk(lv, mode, len) {
  for (let tries = 0; tries < 200; tries++) {
    let x = lv.start.x, y = lv.start.y, face = lv.face;
    const ops = [];
    const visited = new Set([key(x, y)]);
    let ok = true;
    while (ops.length < len && ok) {
      const choices = (mode === 'rel' ? REL : ABS).filter(op => {
        if (mode === 'rel' && op !== 'fwd') return ops[ops.length - 1] !== OPPOSITE[op] && ops[ops.length - 1] !== op;
        const f = op === 'fwd' ? face : ABS_FACE[op];
        const nx = x + VEC[f][0], ny = y + VEC[f][1];
        return free(lv, nx, ny) && !visited.has(key(nx, ny));
      });
      if (!choices.length) { ok = false; break; }
      // Lieber geradeaus weiter: so entstehen Wege, die ein Kind gut verfolgen kann.
      const prev = ops[ops.length - 1];
      const op = choices.includes(prev) && Math.random() < 0.45 ? prev : pick(choices);
      ops.push(op);
      if (op === 'tl' || op === 'tr') face = turn(face, op);
      else {
        face = op === 'fwd' ? face : ABS_FACE[op];
        x += VEC[face][0]; y += VEC[face][1];
        visited.add(key(x, y));
      }
    }
    if (ok && ops[ops.length - 1] !== 'tl' && ops[ops.length - 1] !== 'tr') return { ops, end: { x, y } };
  }
  return null;
}

/** Wo das Schiff am Ende eines Plans steht (oder null, wenn es vorher anstößt). */
export function endOf(lv, ops) {
  const r = run({ ...lv, goal: null }, ops.map(op => ({ op })));
  if (r.result === 'rock' || r.result === 'edge') return null;
  const s = r.steps[r.steps.length - 1];
  return s ? { x: s.x, y: s.y } : { ...lv.start };
}

/** „Wo landet es?": Kokos Plan und drei Truhen (eine richtig, zwei bei typischen Denkfehlern). */
export function makePrediction(lv, mode, len) {
  for (let tries = 0; tries < 60; tries++) {
    const walk = randomWalk(lv, mode, len);
    if (!walk) continue;
    const end = walk.end;
    const k0 = key(end.x, end.y);
    const cands = new Map();
    const add = p => { if (p && free(lv, p.x, p.y) && key(p.x, p.y) !== k0 && key(p.x, p.y) !== key(lv.start.x, lv.start.y)) cands.set(key(p.x, p.y), p); };
    add(endOf(lv, walk.ops.slice(0, -1)));                     // einen Schritt zu wenig
    walk.ops.forEach((op, i) => {                               // eine Richtung vertauscht
      const ops = walk.ops.slice();
      ops[i] = OPPOSITE[op];
      add(endOf(lv, ops));
    });
    add(endOf(lv, [...walk.ops, walk.ops[walk.ops.length - 1]])); // einen Schritt zu viel
    const wrong = shuffle([...cands.values()]).slice(0, 2);
    if (wrong.length < 2) continue;
    return { ops: walk.ops, end, chests: shuffle([end, ...wrong]) };
  }
  return null;
}

/** „Fehler finden": aus einer Lösung einen kaputten Plan machen. how: 'wrong' | 'missing' | 'extra'. */
export function breakPlan(lv, solution, how, mode = 'abs') {
  const ops = mode === 'rel' ? REL : ABS;
  for (let tries = 0; tries < 80; tries++) {
    let prog = solution.map(n => ({ op: n.op }));
    if (how === 'missing') {
      prog = prog.slice(0, prog.length - rnd(1, Math.min(2, prog.length - 1)));
    } else if (how === 'extra') {
      const i = rnd(0, prog.length - 1);
      prog.splice(i, 0, { op: pick(ops) });
    } else {
      const i = rnd(0, prog.length - 1);
      const others = ops.filter(o => o !== prog[i].op);
      prog[i] = { op: pick(others) };
    }
    if (run(lv, prog).result !== 'win') return prog;
  }
  return null;
}

/* ---------- Zufallskarten (nur zum Auffüllen) ---------- */

export function generate({ w = 6, h = 5, min = 4, max = 8, coins = 0 } = {}) {
  for (let tries = 0; tries < 300; tries++) {
    const start = { x: rnd(0, w - 1), y: rnd(0, h - 1) };
    const path = [start];
    const seen = new Set([key(start.x, start.y)]);
    const L = rnd(min, max);
    let dir = pick(ABS);
    while (path.length <= L) {
      const p = path[path.length - 1];
      const opts = ABS.filter(d => {
        const f = ABS_FACE[d];
        const nx = p.x + VEC[f][0], ny = p.y + VEC[f][1];
        return nx >= 0 && ny >= 0 && nx < w && ny < h && !seen.has(key(nx, ny));
      });
      if (!opts.length) break;
      dir = opts.includes(dir) && Math.random() < 0.55 ? dir : pick(opts);
      const f = ABS_FACE[dir];
      const q = { x: p.x + VEC[f][0], y: p.y + VEC[f][1] };
      path.push(q);
      seen.add(key(q.x, q.y));
    }
    if (path.length < min + 1) continue;
    const rows = Array.from({ length: h }, () => Array(w).fill('.'));
    path.forEach(p => {
      for (const f of CLOCK) {
        const nx = p.x + VEC[f][0], ny = p.y + VEC[f][1];
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && !seen.has(key(nx, ny)) && Math.random() < 0.3) rows[ny][nx] = '#';
      }
    });
    const end = path[path.length - 1];
    rows[start.y][start.x] = 'S';
    rows[end.y][end.x] = 'T';
    shuffle(path.slice(2, -2)).slice(0, coins).forEach(p => { rows[p.y][p.x] = '$'; });
    const lv = parseLevel({ map: rows.map(r => r.join('')), set: 'zufall' });
    const sp = shortest(lv, 'abs', { limit: 1 });
    if (sp && sp.length >= min && lv.coins.length === coins) return lv;
  }
  return null;
}

/* ---------- Kartensätze ---------- */

// Wie die Karten eines Satzes gespielt werden: Bildschirm-Pfeile oder Steuerrad, welche Strudel es gibt,
// wie viele Plätze die Leiste hat (tight: nur einer mehr als nötig) und wie lang die Wege sein sollen.
export const SETS = {
  planen: { mode: 'abs', sizes: [], len: [1, 6] },
  reise: { mode: 'abs', sizes: [], len: [4, 11] },
  strudel: { mode: 'abs', sizes: [1], slots: 4, len: [4, 14] },
  treppe: { mode: 'abs', sizes: [2], tight: true, len: [4, 14] },
  drehen: { mode: 'rel', sizes: [], len: [2, 9] },
  kurven: { mode: 'rel', sizes: [], len: [5, 10] },
  rund: { mode: 'rel', sizes: [3, 4], tight: true, len: [5, 18] },
};

/** Ausguck-Karten drehen oder spiegeln, damit aus wenigen Grundkarten viele Aufgaben werden. */
export function transformDef(def, rot = 0, flip = false) {
  let rows = def.map.map(r => [...r]);
  let face = def.face || 'E';
  const FLIP = { E: 'W', W: 'E', N: 'N', S: 'S' };
  if (flip) { rows = rows.map(r => r.reverse()); face = FLIP[face]; }
  for (let k = 0; k < rot; k++) {
    // 90° im Uhrzeigersinn
    const h = rows.length, w = rows[0].length;
    rows = Array.from({ length: w }, (_, y) => Array.from({ length: h }, (_, x) => rows[h - 1 - x][y]));
    face = CLOCK[(CLOCK.indexOf(face) + 1) % 4];
  }
  return { ...def, map: rows.map(r => r.join('')), face };
}

/** Alle Regeln, die eine Karte schaffen. */
export function winningRules(lv) {
  const out = [];
  for (const blocked of REL) for (const fr of REL) if (runRule(lv, { blocked, free: fr }).result === 'win') out.push({ blocked, free: fr });
  return out;
}
