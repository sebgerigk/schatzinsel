// Leseinsel: Wort–Bild, Bild–Wort und „Stimmt das?"-Sätze.
// Wichtig: Koko liest das Wort / den Satz erst NACH der Antwort vor – sonst wäre es kein Lesen.
import { shuffle, wait } from '../engine/util.js';
import { content, P } from '../engine/content.js';
import { sfx } from '../engine/audio.js';
import { picture } from '../art/pictures.js';
import { ICON } from '../art/icons.js';

/** Wort mit farbigen Silben (blau/rot wie in der Fibel). */
export function sylHtml(word) {
  return word.syl.split('-').map((s, i) => `<span class="syl${i % 2}">${s}</span>`).join('');
}

function distractors(target, count, similar) {
  let pool = content.words.filter(w => w.w !== target.w && !(target.grp && w.grp === target.grp));
  pool = shuffle(pool);
  if (similar) {
    // Ähnlich aussehende Wörter zuerst: gleicher Anfangsbuchstabe, dann ähnliche Länge.
    const score = w => (w.w[0] === target.w[0] ? 0 : 2) + Math.min(2, Math.abs(w.w.length - target.w.length));
    pool.sort((a, b) => score(a) - score(b));
  }
  const out = [];
  for (const w of pool) {
    if (out.length >= count) break;
    if (out.some(o => o.grp && o.grp === w.grp)) continue;
    out.push(w);
  }
  return out;
}

export const lesen = {
  intro: (opts, task) => P(task.kind + '_intro'),

  makeTasks({ kind, minLen = 0, maxLen = 99, n = 8 }) {
    if (kind === 'satz') {
      const yes = shuffle(content.sentences.filter(s => s.ok)).slice(0, n / 2);
      const no = shuffle(content.sentences.filter(s => !s.ok)).slice(0, n / 2);
      return shuffle([...yes, ...no]).map(s => ({ kind: 'satz', s }));
    }
    const pool = shuffle(content.words.filter(w => w.w.length >= minLen && w.w.length <= maxLen)).slice(0, n);
    return pool.map((w, i) => {
      const k = kind === 'mix' ? (i % 2 ? 'bildwort' : 'wortbild') : kind;
      return { kind: k, w, options: shuffle([w, ...distractors(w, 2, k === 'bildwort')]) };
    });
  },

  mount(root, t, api) {
    if (t.kind === 'satz') return mountSatz(root, t, api);
    const wordToPic = t.kind === 'wortbild';
    root.innerHTML = `<div class="read ${t.kind}">
      <div class="prompt panel ${wordToPic ? 'word-card' : 'pic-card'}">${wordToPic ? sylHtml(t.w) : picture(t.w.pic)}</div>
      <div class="choices">
        ${t.options.map(o => `<button class="choice panel ${wordToPic ? 'choice-pic' : 'choice-word'}" data-w="${o.w}">${wordToPic ? picture(o.pic) : sylHtml(o)}</button>`).join('')}
      </div>
    </div>`;
    let tries = 0;
    let locked = false;
    root.querySelector('.choices').addEventListener('click', async e => {
      const btn = e.target.closest('.choice');
      if (!btn || locked || btn.disabled) return;
      if (btn.dataset.w === t.w.w) {
        locked = true;
        btn.classList.add('ok');
        await api.correct({ target: btn, say: t.w.w });
        api.done(tries === 0);
      } else {
        tries++;
        btn.disabled = true;
        btn.classList.add('no');
        api.wrong({ target: btn });
      }
    });
  },
};

function mountSatz(root, t, api) {
  root.innerHTML = `<div class="read satz">
    <div class="prompt panel sentence">${t.s.t}</div>
    <div class="yesno">
      <button class="yn yes" data-v="1">${ICON.check}<span>Ja</span></button>
      <button class="yn no" data-v="0">${ICON.cross}<span>Nein</span></button>
    </div>
  </div>`;
  let locked = false;
  root.querySelector('.yesno').addEventListener('click', async e => {
    const btn = e.target.closest('.yn');
    if (!btn || locked) return;
    locked = true;
    const right = (btn.dataset.v === '1') === t.s.ok;
    const correctBtn = root.querySelector(t.s.ok ? '.yes' : '.no');
    correctBtn.classList.add('ok');
    if (right) {
      await api.correct({ target: btn, say: t.s.t });
    } else {
      sfx('wrong');
      btn.classList.add('wrong');
      await api.koko.say(t.s.t);
    }
    if (!api.alive()) return;
    await api.koko.say(P(t.s.ok ? 'satz_true' : 'satz_false'));
    await wait(300);
    api.done(right);
  });
}
