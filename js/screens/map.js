// Schatzkarte: Auswahl der Inseln.
import { register, go } from '../engine/router.js';
import { getState, setSetting, applySettings, settings, hasFlag, setFlag, takeCelebration } from '../engine/storage.js';
import { burst } from '../engine/util.js';
import { SHIPYARD } from '../content/shipyard.js';
import { achievement } from '../content/schaetze.js';
import { shipSound } from './werft.js';
import { rainbowShape, burstShape, whaleShape, spoutShape, dolphinShape } from '../art/schaetze.js';
import { openGate } from './gate.js';
import { P } from '../engine/content.js';
import { sfx, preload } from '../engine/audio.js';
import { ISLANDS, ISLAND_ORDER, visibleStations } from '../content/stations.js';
import { islandSvg, shipSvg, compassSvg } from '../art/world.js';
import { createKoko } from '../art/koko.js';
import { ICON, coinSvg, starSvg } from '../art/icons.js';

let greeted = false;

/** Gepunktete Wege vom Schiff zu jeder Insel (Inseln stehen gleichmäßig verteilt, jede zweite etwas tiefer). */
function route(n) {
  return Array.from({ length: n }, (_, i) => {
    const x = 2 + 96 * (i + 0.5) / n;
    const y = i % 2 ? 70 : 60;
    return `M66 89 C ${(66 + x) / 2} 86, ${x} ${y + 16}, ${x.toFixed(1)} ${y}`;
  }).join(' ');
}

register('map', el => {
  const state = getState();
  const caps = !!(state.settings && state.settings.caps);
  // Eltern können einzelne Inseln ausblenden.
  const shown = ISLAND_ORDER.filter(id => settings().islands[id]);
  const islands = shown.map(id => {
    const isl = ISLANDS[id];
    const list = visibleStations(isl, state);
    const got = list.reduce((sum, s) => sum + (state.stars[s.id] || 0), 0);
    return `<button class="island island-${id}" data-id="${id}">
      ${islandSvg(id)}
      <span class="ribbon">${isl.name}</span>
      <span class="isl-stars">${starSvg(true)}<b>${got}</b><i>/ ${list.length * 3}</i></span>
    </button>`;
  }).join('');

  // Schätze aus der Werft, die auf der Schatzkarte zu sehen sind
  const on = id => (state.ship.extras || []).includes(id);
  if (on('nacht')) el.classList.add('night');
  const decor = [
    on('nacht') ? '<div class="map-night"><i class="moon"></i></div>' : '',
    on('regenbogen') ? `<div class="map-rainbow">${rainbowShape()}</div>` : '',
    on('feuerwerk') ? `<div class="map-fireworks">${['#f0553f', '#ffcb3d', '#45b565', '#ff8fb3'].map((c, i) => `<span style="--i:${i}">${burstShape(c)}</span>`).join('')}</div>` : '',
    on('schnee') ? `<div class="map-snow">${Array.from({ length: 36 }, (_, i) => `<i style="--x:${(i * 37) % 100};--d:${(i * 7) % 10};--s:${0.6 + (i % 4) * 0.25}"></i>`).join('')}</div>` : '',
    on('wal') ? `<div class="map-whale"><svg viewBox="-6 -40 200 124" aria-hidden="true">${whaleShape()}<g transform="translate(44 -18)"><g class="spout">${spoutShape()}</g></g></svg></div>` : '',
    on('delfin') ? `<div class="map-dolphin"><svg viewBox="-4 -4 130 76" aria-hidden="true">${dolphinShape()}</svg></div>` : '',
  ].join('');

  el.innerHTML = `
    <div class="map-sea"></div>
    ${decor}
    <svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${route(shown.length)}"/></svg>
    <header class="hud">
      <div class="plank">Schatzkarte</div>
      <div class="hud-right">
        <button class="caps-toggle" role="switch" aria-checked="${caps}" aria-label="Nur Großbuchstaben">
          <span class="opt opt-mixed">Abc</span><span class="opt opt-caps">ABC</span>
        </button>
        <div class="coins">${coinSvg()}<b>${state.coins}</b></div>
        <button class="round-btn parents" aria-label="Elternbereich">${ICON.gear}</button>
      </div>
    </header>
    <div class="islands n${shown.length}">${islands}</div>
    <button class="map-ship" aria-label="Mein Schiff">${shipSvg(state.ship)}<span class="ship-label">Mein Schiff</span></button>
    <div class="map-compass">${compassSvg()}</div>`;

  const koko = createKoko();
  el.appendChild(koko.el);
  // Ein Ehren-Schatz ist neu freigeschaltet? Koko sagt es einmal.
  const fresh = SHIPYARD.flatMap(c => c.items).filter(item => item.needs && !hasFlag('schatzAngesagt', item.id) && achievement(item.needs, state).done);
  if (fresh.length) {
    greeted = true;
    fresh.forEach(item => setFlag('schatzAngesagt', item.id));
    koko.cheer();
    koko.say(P('schatz_neu'));
  } else if (!greeted) { greeted = true; koko.say(P('map')); } else koko.show(P('map_again'));

  // Konfettikanone: nach einer Runde mit Münzen schießt das Schiff Konfetti.
  if (takeCelebration() && on('konfetti')) {
    setTimeout(() => {
      const ship = el.querySelector('.map-ship');
      if (!ship || !ship.isConnected) return;
      sfx('boom');
      burst(ship, { n: 22, spread: 190 });
    }, 700);
  }
  preload(shown.map(id => P(ISLANDS[id].welcome)));
  el.querySelector('.parents').addEventListener('click', () => openGate(() => go('eltern')));

  // Schalter „nur Großbuchstaben": gilt sofort für alle Wörter, Sätze und Texte.
  const toggle = el.querySelector('.caps-toggle');
  toggle.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', on);
    setSetting('caps', on);
    applySettings();
    sfx('pop');
    // Sternezahl anpassen: mit Großbuchstaben entfallen die Stationen für kleine Buchstaben.
    shown.forEach(id => {
      const vis = visibleStations(ISLANDS[id], getState());
      const box = el.querySelector(`.island-${id} .isl-stars`);
      box.querySelector('b').textContent = vis.reduce((sum, s) => sum + (getState().stars[s.id] || 0), 0);
      box.querySelector('i').textContent = '/ ' + vis.length * 3;
    });
    koko.say(P(on ? 'caps_on' : 'caps_off'));
  });

  // Mit Glocke, Horn oder Lied an Bord klingt das Schiff beim Losfahren zur Werft.
  el.querySelector('.map-ship').addEventListener('click', () => { sfx(shipSound(state.ship.extras) || 'sail'); go('werft'); });

  el.querySelector('.islands').addEventListener('click', e => {
    const btn = e.target.closest('.island');
    if (!btn) return;
    sfx('sail');
    go('island', { island: btn.dataset.id });
  });
});
