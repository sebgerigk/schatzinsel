// Abschiedsbildschirm: das Tageslimit ist erreicht. Freundlich, ohne Vorwurf.
import { register, go } from '../engine/router.js';
import { getState } from '../engine/storage.js';
import { P } from '../engine/content.js';
import { addBonus } from '../engine/playtime.js';
import { shipSvg } from '../art/world.js';
import { createKoko } from '../art/koko.js';
import { ICON } from '../art/icons.js';
import { openGate } from './gate.js';

register('pause', el => {
  el.innerHTML = `
    <div class="pause-stars"></div>
    <div class="pause-moon"></div>
    <div class="wave wave-3"></div>
    <div class="title-ship">${shipSvg(getState().ship)}</div>
    <div class="wave wave-2"></div>
    <div class="wave wave-1"></div>
    <h1 class="pause-title">Bis morgen, Kapitän!</h1>
    <button class="round-btn pause-parents" aria-label="Eltern">${ICON.gear}</button>`;
  const koko = createKoko();
  koko.el.classList.add('asleep');
  el.appendChild(koko.el);
  koko.say(P('pause'));

  // Eltern können für heute noch einmal 10 Minuten schenken.
  el.querySelector('.pause-parents').addEventListener('click', () => {
    openGate(() => { addBonus(10); go('map'); });
  });
});
