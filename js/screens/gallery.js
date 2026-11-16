// Entwickler-Ansicht (Adresse mit #galerie öffnen): alle Zeichnungen und Schreibwege auf einen Blick.
import { register } from '../engine/router.js';
import { content } from '../engine/content.js';
import { picture } from '../art/pictures.js';
import { STROKES } from '../content/strokes.js';
import { kokoSvg } from '../art/koko.js';
import { islandSvg, shipSvg, chestSvg, compassSvg } from '../art/world.js';

register('gallery', el => {
  el.classList.add('gallery');
  el.innerHTML = `
    <div class="gal-row big">${kokoSvg()}${shipSvg()}${islandSvg('lesen')}${islandSvg('schreiben')}${islandSvg('rechnen')}${chestSvg()}${compassSvg()}</div>
    <div class="gal-row">${content.words.map(w => `<figure>${picture(w.pic)}<figcaption>${w.w}</figcaption></figure>`).join('')}</div>
    <div class="gal-row">${Object.entries(STROKES).map(([ch, strokes]) => `<figure><svg viewBox="0 0 100 180" class="gal-glyph">${strokes.map(d => `<path d="${d}"/>`).join('')}</svg><figcaption>${ch}</figcaption></figure>`).join('')}</div>`;
});
