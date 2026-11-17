// Eine Runde an einer Station: Aufgaben nacheinander, Fortschritt, Belohnung am Ende.
import { register, go } from '../engine/router.js';
import { awardStation } from '../engine/storage.js';
import { P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { h, pick, wait, withTimeout, shake, burst, confetti } from '../engine/util.js';
import { ISLANDS } from '../content/stations.js';
import { rechnen } from '../games/rechnen.js';
import { lesen } from '../games/lesen.js';
import { schreiben } from '../games/schreiben.js';
import { createKoko } from '../art/koko.js';
import { skySvg, chestSvg } from '../art/world.js';
import { ICON, coinSvg, starSvg } from '../art/icons.js';

const GAMES = { rechnen, lesen, schreiben };

register('round', (el, { island, idx }) => {
  const isl = ISLANDS[island];
  const station = isl.stations[idx];
  const game = GAMES[station.game];
  const tasks = game.makeTasks(station.opts);
  let i = 0;
  let firstTry = 0;
  let alive = true;
  let introKind = null;

  el.innerHTML = `
    <div class="sky">${skySvg()}</div>
    <div class="deck"></div>
    <header class="round-top">
      <button class="round-btn back" aria-label="Zurück zur Insel">${ICON.back}</button>
      <div class="progress">${tasks.map(() => '<i></i>').join('')}<span class="progress-goal">${coinSvg()}</span></div>
      <div class="plank small">${station.title}</div>
    </header>
    <main class="task-area"></main>`;

  const area = el.querySelector('.task-area');
  const dots = [...el.querySelectorAll('.progress i')];
  const koko = createKoko();
  el.appendChild(koko.el);
  el.querySelector('.back').addEventListener('click', () => { sfx('tap'); go('island', { island }); });

  function makeApi(ready) {
    return {
      koko,
      ready,
      alive: () => alive,
      /** Richtige Antwort: Klang, Sternchen, Koko freut sich und sagt das Wort bzw. ein Lob. */
      async correct({ target, say } = {}) {
        sfx('correct');
        koko.cheer();
        if (target) burst(target);
        await Promise.all([withTimeout(koko.say(say || pick(P('praise'))), 5000), wait(900)]);
      },
      /** Falsche Antwort: sanfter Hinweis, kein Punktabzug-Drama. silent: das Spiel spricht selbst. */
      wrong({ target, say, silent = false } = {}) {
        sfx('wrong');
        shake(target);
        if (!silent) koko.say(say || pick(P('retry')));
      },
      done(ok) {
        if (!alive) return;
        if (ok) firstTry++;
        dots[i].classList.remove('now');
        dots[i].classList.add(ok ? 'done' : 'miss');
        i++;
        setTimeout(next, 250);
      },
    };
  }

  function next() {
    if (!alive) return;
    if (i >= tasks.length) return finish();
    dots[i].classList.add('now');
    area.innerHTML = '';
    const wrap = h('<div class="task"></div>');
    area.appendChild(wrap);
    const intro = game.intro(station.opts, tasks[i]);
    // Die Anleitung wird nur gesprochen, wenn sich die Aufgabenart ändert.
    const kind = tasks[i].kind || station.game;
    const ready = kind !== introKind ? koko.say(intro) : (koko.show(intro), Promise.resolve());
    introKind = kind;
    game.mount(wrap, tasks[i], makeApi(ready));
  }

  async function finish() {
    const ratio = firstTry / tasks.length;
    const stars = ratio === 1 ? 3 : ratio >= 0.6 ? 2 : 1;
    awardStation(station.id, stars);
    const hasNext = idx + 1 < isl.stations.length;
    area.innerHTML = '';
    const panel = h(`<div class="result panel">
      <div class="result-chest">${chestSvg()}</div>
      <div class="result-stars">${[1, 2, 3].map(k => `<span class="rs ${k <= stars ? 'on' : ''}">${starSvg(k <= stars)}</span>`).join('')}</div>
      <div class="result-coins">${Array.from({ length: stars }, () => `<span class="rc">${coinSvg()}</span>`).join('')}</div>
      <div class="result-actions">
        <button class="btn again">${ICON.again}<span>Nochmal</span></button>
        <button class="btn green cont">${ICON.check}<span>Weiter</span></button>
      </div>
    </div>`);
    area.appendChild(panel);
    panel.querySelector('.again').addEventListener('click', () => { sfx('tap'); go('round', { island, idx }); });
    panel.querySelector('.cont').addEventListener('click', () => { sfx('tap'); go('island', { island }); });

    sfx('fanfare');
    confetti();
    koko.cheer();
    await wait(350);
    if (!alive) return;
    panel.querySelector('.result-chest').classList.add('open');
    for (let k = 0; k < stars; k++) {
      await wait(380);
      if (!alive) return;
      sfx('star');
      panel.querySelectorAll('.rs')[k].classList.add('show');
      panel.querySelectorAll('.rc')[k].classList.add('show');
    }
    panel.classList.add('ready');
    koko.say(P('result' + stars));
    void hasNext;
  }

  next();
  return () => { alive = false; };
});
