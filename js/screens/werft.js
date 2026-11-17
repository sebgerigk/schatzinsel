// Die Werft: hier gibt das Kind seine Goldmünzen aus und schmückt sein Schiff.
// Ablauf: Teil antippen = anprobieren (Vorschau am großen Schiff), dann „Kaufen".
// Was schon gekauft ist, lässt sich jederzeit kostenlos wechseln.
import { register, go } from '../engine/router.js';
import { getState, isOwned, buyPart, equipPart } from '../engine/storage.js';
import { P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { pick, burst, shake } from '../engine/util.js';
import { SHIPYARD } from '../content/shipyard.js';
import { shipSvg, skySvg } from '../art/world.js';
import { createKoko } from '../art/koko.js';
import { ICON, coinSvg } from '../art/icons.js';

let visited = false;

register('werft', el => {
  const state = getState();
  let tab = 0;
  let trying = null;   // { cat, item } – wird gerade anprobiert, aber noch nicht gekauft

  el.innerHTML = `
    <div class="sky">${skySvg()}</div>
    <div class="wave wave-3"></div>
    <div class="werft-ship"></div>
    <div class="wave wave-2"></div>
    <div class="wave wave-1"></div>
    <header class="hud">
      <button class="round-btn back" aria-label="Zurück zur Karte">${ICON.back}</button>
      <div class="plank">Werft</div>
      <div class="coins">${coinSvg()}<b></b></div>
    </header>
    <section class="shop panel">
      <div class="shop-tabs" role="tablist">
        ${SHIPYARD.map((c, i) => `<button class="shop-tab" role="tab" data-i="${i}">${c.title}</button>`).join('')}
      </div>
      <div class="shop-items"></div>
      <div class="shop-buy"></div>
    </section>`;

  const shipBox = el.querySelector('.werft-ship');
  const itemsBox = el.querySelector('.shop-items');
  const buyBox = el.querySelector('.shop-buy');
  const coinsEl = el.querySelector('.coins b');
  const koko = createKoko();
  el.appendChild(koko.el);
  if (!visited) { visited = true; koko.say(P('werft_intro')); } else koko.show(P('werft_again'));

  /** So sähe das Schiff mit einem bestimmten Teil aus. */
  function shipWith(cat, id, multi) {
    const ship = { ...state.ship, extras: [...(state.ship.extras || [])] };
    if (multi) { if (!ship.extras.includes(id)) ship.extras.push(id); } else ship[cat] = id;
    return ship;
  }
  // Manche Teile gibt es erst, wenn eine bestimmte Station geschafft ist (z. B. das Steuerrad).
  const locked = item => !!item.needs && !(state.stars[item.needs] > 0);
  const isOn = (c, item) => (c.multi ? (state.ship.extras || []).includes(item.id) : state.ship[c.cat] === item.id);

  function render() {
    const c = SHIPYARD[tab];
    coinsEl.textContent = state.coins;
    shipBox.innerHTML = shipSvg(trying ? shipWith(trying.cat, trying.item.id, c.multi) : state.ship);
    el.querySelectorAll('.shop-tab').forEach((t, i) => t.setAttribute('aria-selected', i === tab));
    itemsBox.innerHTML = c.items.map((item, i) => {
      const owned = isOwned(c.cat, item);
      const cls = ['item', owned ? 'owned' : '', isOn(c, item) ? 'equipped' : '', trying && trying.item === item ? 'trying' : ''].join(' ');
      const tag = isOn(c, item) ? `<span class="item-tag on">${ICON.check}</span>`
        : owned ? '<span class="item-tag">Meins</span>'
          : locked(item) ? `<span class="item-tag">${ICON.lock}</span>`
            : `<span class="item-tag price">${coinSvg()}${item.price}</span>`;
      return `<button class="${cls}" data-i="${i}">${shipSvg(shipWith(c.cat, item.id, c.multi))}<span class="item-name">${item.name}</span>${tag}</button>`;
    }).join('');
    if (trying) {
      const enough = state.coins >= trying.item.price;
      buyBox.innerHTML = `<button class="btn ${enough ? 'green' : 'poor'} buy">${coinSvg()}<span>${trying.item.price}</span><span>Kaufen</span></button>`;
    } else {
      buyBox.innerHTML = '';
    }
  }

  el.querySelector('.shop-tabs').addEventListener('click', e => {
    const t = e.target.closest('.shop-tab');
    if (!t) return;
    sfx('tap');
    tab = Number(t.dataset.i);
    trying = null;
    render();
  });

  itemsBox.addEventListener('click', e => {
    const btn = e.target.closest('.item');
    if (!btn) return;
    const c = SHIPYARD[tab];
    const item = c.items[Number(btn.dataset.i)];
    if (isOwned(c.cat, item)) {
      // Gehört schon dem Kind: einfach wechseln (Extras: an- oder abbauen).
      const wasOn = isOn(c, item);
      if (c.multi || !wasOn) equipPart(c.cat, item.id, c.multi);
      trying = null;
      sfx('pop');
      render();
      koko.say(P(c.multi && wasOn ? 'werft_off' : 'werft_on'));
      return;
    }
    if (locked(item)) {
      sfx('wrong');
      shake(btn);
      koko.say(P('werft_locked'));
      return;
    }
    trying = { cat: c.cat, item };
    sfx('tap');
    render();
    koko.say(P(state.coins >= item.price ? 'werft_try' : 'werft_poor'));
  });

  buyBox.addEventListener('click', e => {
    const btn = e.target.closest('.buy');
    if (!btn || !trying) return;
    const c = SHIPYARD[tab];
    if (!buyPart(trying.cat, trying.item, c.multi)) {
      sfx('wrong');
      shake(btn);
      koko.say(P('werft_poor'));
      return;
    }
    trying = null;
    sfx('coin');
    sfx('fanfare');
    render();
    burst(shipBox, { n: 18, spread: 160 });
    koko.cheer();
    koko.say(pick(P('werft_bought')));
  });

  el.querySelector('.back').addEventListener('click', () => { sfx('tap'); go('map'); });
  render();
});
