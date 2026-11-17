// Insel-Bildschirm: der Weg mit den Stationen. Bei vielen Stationen lässt sich der Weg seitlich schieben.
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
const START = 19;   // Abstand der ersten Station vom linken Rand (vmin)
const STEP = 21;    // Abstand von Station zu Station (vmin)

register('island', (el, { island }) => {
  const isl = ISLANDS[island];
  const state = getState();
  const list = visibleStations(isl, state);
  const n = list.length;
  // Zickzack über den Strand: x in vmin (damit der Abstand auf jedem Gerät gleich wirkt), y in Prozent.
  const at = i => ({ x: START + i * STEP, y: i % 2 ? 46 : 59 });
  const pos = list.map((s, i) => at(i));
  const goal = at(n);
  const width = goal.x + 17;
  const pts = [...pos, goal];
  let route = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], mx = (a.x + b.x) / 2;
    route += ` C${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }
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
    <div class="stations"><div class="track" style="width:${width}vmin">
      <svg class="route" viewBox="0 0 ${width} 100" preserveAspectRatio="none" aria-hidden="true"><path d="${route}"/></svg>
      ${list.map((s, i) => {
        const open = unlocked(i);
        return `<button class="station ${open ? 'open' : 'locked'} ${i === nextIdx ? 'next' : ''}" data-i="${i}" style="left:${pos[i].x}vmin;top:${pos[i].y}%">
          <span class="medal">${open ? i + 1 : ICON.lock}</span>
          <span class="st-stars">${[1, 2, 3].map(k => starSvg(k <= stars(s))).join('')}${(state.medals || {})[s.id] ? medalSvg() : ''}</span>
          <span class="st-title">${s.title}</span>
        </button>`;
      }).join('')}
      <div class="goal ${allDone ? 'open' : ''}" style="left:${goal.x}vmin;top:${goal.y}%">${chestSvg()}</div>
    </div></div>`;

  const koko = createKoko();
  el.appendChild(koko.el);
  if (!welcomed.has(island)) { welcomed.add(island); koko.say(P(isl.welcome)); } else koko.show(P('island_again'));

  // Den Weg so schieben, dass die nächste offene Station in der Mitte liegt.
  const scroller = el.querySelector('.stations');
  const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
  const focus = nextIdx < 0 ? goal : pos[nextIdx];
  scroller.scrollLeft = Math.max(0, focus.x * vmin - scroller.clientWidth / 2);
  // Mausrad (am Computer) schiebt den Weg ebenfalls seitlich.
  scroller.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { scroller.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });

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
});
