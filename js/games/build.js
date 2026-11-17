// Gemeinsamer Baukasten: aus Plättchen der Reihe nach etwas zusammensetzen –
// Buchstaben zu einem Wort, Silben zu einem Wort oder Wörter zu einem Satz.
import { shuffle, shake, burst } from '../engine/util.js';
import { sfx, speak } from '../engine/audio.js';
import { ICON } from '../art/icons.js';

/**
 * @param parts   richtige Teile in der richtigen Reihenfolge
 * @param extras  zusätzliche falsche Teile
 * @param pic     Bild (SVG-HTML) oder null – dann gibt es einen „Anhören"-Knopf
 * @param say     Text, den Koko vorspricht (Wort oder Satz)
 * @param wide    breite Plättchen für Silben und Wörter
 * @param onSolved wird beim fertigen Bauen aufgerufen
 * @param stress  (Platz) -> Text: was Koko nach einem falschen Plättchen an diesem Platz sagt
 */
export function mountBuild(root, { parts, extras = [], pic = null, say, wide = false, onSolved, stress = null }, api) {
  let tiles = [...parts.map(c => ({ c })), ...extras.map(c => ({ c }))];
  for (let k = 0; k < 8; k++) {
    tiles = shuffle(tiles);
    // Nicht schon in der richtigen Reihenfolge anbieten.
    if (parts.length < 2 || parts.some((p, i) => tiles[i].c !== p)) break;
  }

  root.innerHTML = `<div class="build${wide ? ' wide' : ''}">
    ${pic
      ? `<button class="pic-card panel build-pic listen" aria-label="Anhören">${pic}</button>`
      : `<button class="listen-btn listen">${ICON.sound}<span>Anhören</span></button>`}
    <div class="slots">${parts.map(() => '<span class="slot-l"></span>').join('')}</div>
    <div class="tiles">${tiles.map((t, i) => `<button class="tile" data-i="${i}">${t.c}</button>`).join('')}</div>
  </div>`;

  const slots = [...root.querySelectorAll('.slot-l')];
  const tileEls = [...root.querySelectorAll('.tile')];
  let pos = 0, mistakes = 0, missHere = 0, locked = false;
  slots[0].classList.add('next');

  api.ready.then(() => { if (api.alive() && pos === 0) speak(say); });
  root.querySelector('.listen').addEventListener('click', () => { if (!locked) speak(say); });

  root.querySelector('.tiles').addEventListener('click', async e => {
    const el = e.target.closest('.tile');
    if (!el || locked || el.classList.contains('used')) return;
    if (tiles[Number(el.dataset.i)].c === parts[pos]) {
      sfx('pop');
      el.classList.add('used');
      tileEls.forEach(n => n.classList.remove('hint'));
      slots[pos].textContent = parts[pos];
      slots[pos].classList.remove('next');
      slots[pos].classList.add('set');
      burst(slots[pos], { n: 5, spread: 40 });
      pos++;
      missHere = 0;
      if (pos < parts.length) {
        slots[pos].classList.add('next');
        return;
      }
      locked = true;
      if (onSolved) onSolved();
      root.querySelector('.slots').classList.add('ok');
      await api.correct({ target: root.querySelector('.slots'), say });
      api.done(mistakes === 0);
    } else {
      mistakes++;
      missHere++;
      sfx('wrong');
      shake(el);
      if (stress) api.koko.talk(stress(pos));
      if (missHere >= 2) {
        // Nach zwei Fehlversuchen zeigt Koko das richtige Plättchen.
        const right = tileEls.find(n => !n.classList.contains('used') && tiles[Number(n.dataset.i)].c === parts[pos]);
        if (right) right.classList.add('hint');
      }
    }
  });
}
