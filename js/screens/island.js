// Insel-Bildschirm: der Weg mit den Stationen. Er schlängelt sich in Reihen über den Strand
// (quer zwei, hochkant mehr), damit alle Stationen ohne Wischen zu sehen sind.
import { register, go } from '../engine/router.js';
import { getState, settings } from '../engine/storage.js';
import { P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { shake } from '../engine/util.js';
import { ISLANDS, visibleStations } from '../content/stations.js';
import { sceneSvg, chestSvg } from '../art/world.js';
import { createKoko } from '../art/koko.js';
import { ICON, coinSvg, starSvg } from '../art/icons.js';
import { medalSvg, tableSvg } from '../art/sea.js';

const welcomed = new Set();
const MIN_COL = 15;   // schmalste Spalte (vmin) – darunter kommt eine Reihe dazu

/**
 * Plätze für n Stationen und die Truhe in einer Fläche w × h (px).
 * Reihe für Reihe, abwechselnd von links und von rechts, wie eine Schlange.
 */
function layout(count, w, h, vmin) {
  const rows = Math.max(2, Math.ceil(count / Math.max(1, Math.floor(w / (MIN_COL * vmin)))));
  const cols = Math.ceil(count / rows);
  const colW = w / cols, rowH = h / rows;
  const font = Math.max(12, Math.min(22, colW * .11, 2.5 * vmin));
  const label = 2 * font * 1.15 + 10;                      // höchstens zwei Zeilen
  const extra = 5.2 * vmin + label;                        // Sterne und Schild unter der Münze
  const m = Math.max(6 * vmin, Math.min(13.5 * vmin, colW * .74, rowH - extra - 2 * vmin));
  const zig = Math.max(0, Math.min(5 * vmin, rowH - m - extra - 2 * vmin));
  const top = Math.max(vmin, (rowH - m - extra - zig) / 2);   // Reihe mittig in ihrem Streifen
  const pts = Array.from({ length: count }, (_, i) => {
    const r = Math.floor(i / cols), k = i % cols;
    const c = r % 2 ? cols - 1 - k : k;
    return { x: (c + .5) * colW, y: r * rowH + top + m / 2 + (k % 2 ? zig : 0), r, c };
  });
  return { pts, colW, m, font };
}

/** Gepunkteter Weg durch alle Plätze; am Ende einer Reihe eine Kehre nach außen. */
function routePath(pts, colW) {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (a.r === b.r) {
      const mx = (a.x + b.x) / 2;
      d += ` C${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
    } else {
      const out = (a.r % 2 ? -1 : 1) * colW * .55;
      d += ` C${a.x + out} ${a.y}, ${b.x + out} ${b.y}, ${b.x} ${b.y}`;
    }
  }
  return d;
}

register('island', (el, { island }) => {
  const isl = ISLANDS[island];
  const state = getState();
  const list = visibleStations(isl, state);
  const n = list.length;
  const stars = s => state.stars[s.id] || 0;
  const unlockAll = settings().unlockAll;   // Einstellung der Eltern
  const unlocked = i => unlockAll || i === 0 || stars(list[i - 1]) > 0;
  const allDone = list.every(s => stars(s) > 0);
  const nextIdx = list.findIndex(s => !(stars(s) > 0));
  // Der Kartentisch (freies Spielen) steht auf der Programmierinsel, sobald die „Lange Reise" geschafft ist.
  const table = island === 'programmieren' && (unlockAll || state.stars['prog-reise'] > 0);

  el.innerHTML = `
    <div class="scene">${sceneSvg()}</div>
    <header class="hud">
      <button class="round-btn back" aria-label="Zurück zur Karte">${ICON.back}</button>
      <div class="plank">${isl.name}</div>
      <div class="hud-right">
        ${table ? `<button class="round-btn tisch-btn" aria-label="Kartentisch">${tableSvg()}</button>` : ''}
        <div class="coins">${coinSvg()}<b>${state.coins}</b></div>
      </div>
    </header>
    <div class="stations"><div class="track">
      <svg class="route" aria-hidden="true"><path/></svg>
      ${list.map((s, i) => {
        const open = unlocked(i);
        return `<button class="station ${open ? 'open' : 'locked'} ${i === nextIdx ? 'next' : ''}" data-i="${i}">
          <span class="medal">${open ? i + 1 : ICON.lock}</span>
          <span class="st-stars">${[1, 2, 3].map(k => starSvg(k <= stars(s))).join('')}${(state.medals || {})[s.id] ? medalSvg() : ''}</span>
          <span class="st-title">${s.title}</span>
        </button>`;
      }).join('')}
      <div class="goal ${allDone ? 'open' : ''}">${chestSvg()}</div>
    </div></div>`;

  const koko = createKoko();
  el.appendChild(koko.el);
  if (!welcomed.has(island)) { welcomed.add(island); koko.say(P(isl.welcome)); } else koko.show(P('island_again'));

  // Stationen auf die Fläche verteilen – neu, sobald sich die Größe ändert (iPad drehen).
  const scroller = el.querySelector('.stations');
  const buttons = [...el.querySelectorAll('.station')];
  const goalEl = el.querySelector('.goal');
  const route = el.querySelector('.route');
  function place() {
    const w = scroller.clientWidth, h = scroller.clientHeight;
    if (!w || !h) return;
    const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
    const { pts, colW, m, font } = layout(n + 1, w, h, vmin);
    scroller.style.setProperty('--m', m + 'px');
    scroller.style.setProperty('--colw', colW + 'px');
    scroller.style.setProperty('--font', font + 'px');
    buttons.forEach((b, i) => { b.style.left = pts[i].x + 'px'; b.style.top = pts[i].y + 'px'; });
    const g = pts[n];
    goalEl.style.left = g.x + 'px';
    goalEl.style.top = g.y + 'px';
    route.setAttribute('viewBox', `0 0 ${w} ${h}`);
    route.querySelector('path').setAttribute('d', routePath(pts, colW));
  }
  place();
  const ro = new ResizeObserver(place);
  ro.observe(scroller);

  el.querySelector('.back').addEventListener('click', () => { sfx('tap'); go('map'); });
  if (table) el.querySelector('.tisch-btn').addEventListener('click', () => { sfx('pop'); go('kartentisch'); });
  scroller.addEventListener('click', e => {
    const btn = e.target.closest('.station');
    if (!btn) return;
    const i = Number(btn.dataset.i);
    if (!unlocked(i)) {
      sfx('wrong');
      shake(btn);
      koko.say(P('locked'));
      return;
    }
    sfx('pop');
    go('round', { island, idx: list[i].idx });
  });
  return () => ro.disconnect();
});
