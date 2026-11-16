// Insel-Bildschirm: der Weg mit den Stationen.
import { register, go } from '../engine/router.js';
import { getState } from '../engine/storage.js';
import { P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { shake } from '../engine/util.js';
import { ISLANDS } from '../content/stations.js';
import { sceneSvg, chestSvg } from '../art/world.js';
import { createKoko } from '../art/koko.js';
import { ICON, coinSvg, starSvg } from '../art/icons.js';

const welcomed = new Set();

register('island', (el, { island }) => {
  const isl = ISLANDS[island];
  const state = getState();
  const n = isl.stations.length;
  // Stationen im Zickzack über den Strand verteilen (Angaben in Prozent).
  const pos = isl.stations.map((s, i) => ({
    x: 15 + i * (63 / (n - 1)),
    y: i % 2 ? 46 : 59,
  }));
  const goal = { x: 91, y: (n - 1) % 2 ? 59 : 46 };
  const pts = [...pos, goal];
  let route = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], mx = (a.x + b.x) / 2;
    route += ` C${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }
  const unlocked = i => i === 0 || (state.stars[isl.stations[i - 1].id] || 0) > 0;
  const allDone = isl.stations.every(s => (state.stars[s.id] || 0) > 0);
  const nextIdx = isl.stations.findIndex(s => !(state.stars[s.id] > 0));

  el.innerHTML = `
    <div class="scene">${sceneSvg()}</div>
    <svg class="route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${route}"/></svg>
    <header class="hud">
      <button class="round-btn back" aria-label="Zurück zur Karte">${ICON.back}</button>
      <div class="plank">${isl.name}</div>
      <div class="coins">${coinSvg()}<b>${state.coins}</b></div>
    </header>
    <div class="stations">
      ${isl.stations.map((s, i) => {
        const stars = state.stars[s.id] || 0;
        const open = unlocked(i);
        return `<button class="station ${open ? 'open' : 'locked'} ${i === nextIdx ? 'next' : ''}" data-i="${i}" style="left:${pos[i].x}%;top:${pos[i].y}%">
          <span class="medal">${open ? i + 1 : ICON.lock}</span>
          <span class="st-stars">${[1, 2, 3].map(k => starSvg(k <= stars)).join('')}</span>
          <span class="st-title">${s.title}</span>
        </button>`;
      }).join('')}
      <div class="goal ${allDone ? 'open' : ''}" style="left:${goal.x}%;top:${goal.y}%">${chestSvg()}</div>
    </div>`;

  const koko = createKoko();
  el.appendChild(koko.el);
  if (!welcomed.has(island)) { welcomed.add(island); koko.say(P(isl.welcome)); } else koko.show(P('island_again'));

  el.querySelector('.back').addEventListener('click', () => { sfx('tap'); go('map'); });
  el.querySelector('.stations').addEventListener('click', e => {
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
    go('round', { island, idx: i });
  });
});
