// Schatzkarte: Auswahl der Inseln.
import { register, go } from '../engine/router.js';
import { getState, setSetting, applySettings, settings } from '../engine/storage.js';
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

  el.innerHTML = `
    <div class="map-sea"></div>
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
  if (!greeted) { greeted = true; koko.say(P('map')); } else koko.show(P('map_again'));
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

  el.querySelector('.map-ship').addEventListener('click', () => { sfx('sail'); go('werft'); });

  el.querySelector('.islands').addEventListener('click', e => {
    const btn = e.target.closest('.island');
    if (!btn) return;
    sfx('sail');
    go('island', { island: btn.dataset.id });
  });
});
