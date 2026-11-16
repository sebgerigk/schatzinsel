// Startbildschirm. Der große Knopf schaltet auf iOS zugleich den Ton frei.
import { register, go } from '../engine/router.js';
import { unlockAudio, sfx } from '../engine/audio.js';
import { shipSvg, skySvg, palm } from '../art/world.js';
import { kokoSvg } from '../art/koko.js';
import { ICON } from '../art/icons.js';
import { INK } from '../engine/util.js';

const letters = word => [...word].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');

register('title', el => {
  el.innerHTML = `
    <div class="sky">${skySvg()}</div>
    <div class="wave wave-3"></div>
    <div class="title-islet"><svg viewBox="0 0 260 200" aria-hidden="true">
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path d="M10 190 Q130 96 250 190Z" fill="#f8dc8e"/>
        ${palm(120, 150, 0.9)}${palm(160, 160, 0.62, -1)}
      </g></svg></div>
    <div class="title-ship">${shipSvg()}</div>
    <div class="wave wave-2"></div>
    <div class="wave wave-1"></div>
    <h1 class="logo" aria-label="Schatzinsel"><span class="logo-row">${letters('Schatz')}</span><span class="logo-row">${letters('insel')}</span></h1>
    <div class="title-koko">${kokoSvg()}</div>
    <button class="btn gold big start">${ICON.play}<span>Los geht's!</span></button>`;

  el.querySelector('.start').addEventListener('click', () => {
    unlockAudio();
    sfx('sail');
    go('map', { greet: true });
  });
});
