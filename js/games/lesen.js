// Leseinsel: Wort–Bild, Bild–Wort, Anlaute, Silben, Reime, „Stimmt das?"-Sätze,
// Sätze bauen und kleine Flaschenpost-Geschichten.
// Wichtig: Koko liest Wörter und Sätze erst NACH der Antwort vor – sonst wäre es kein Lesen.
import { shuffle, pick, wait } from '../engine/util.js';
import { content, P } from '../engine/content.js';
import { sfx, speak } from '../engine/audio.js';
import { markSeen, leastSeenFirst } from '../engine/storage.js';
import { picture } from '../art/pictures.js';
import { ICON } from '../art/icons.js';
import { mountBuild } from './build.js';

/** Wort mit farbigen Silben (blau/rot wie in der Fibel). */
export function sylHtml(word) {
  return word.syl.split('-').map((s, i) => `<span class="syl${i % 2}">${s}</span>`).join('');
}

/** Der Anlaut, wie er in der Schule benannt wird: Sch, St, Sp, Ei, Au, Eu – sonst der erste Buchstabe. */
const ANLAUTE = ['Sch', 'St', 'Sp', 'Ei', 'Au', 'Eu'];
export const anlaut = w => ANLAUTE.find(a => w.startsWith(a)) || w[0];

function distractors(target, count, { similar = false, filter = null } = {}) {
  let pool = content.words.filter(w => w.w !== target.w && !(target.grp && w.grp === target.grp));
  if (filter) pool = pool.filter(filter);
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

const wordByName = name => content.words.find(w => w.w === name);

export const lesen = {
  intro: (opts, task) => P(task.kind + '_intro'),

  makeTasks({ kind, minLen = 0, maxLen = 99, match = null, n }) {
    if (kind === 'satz') {
      const yes = shuffle(content.sentences.filter(s => s.ok)).slice(0, 4);
      const no = shuffle(content.sentences.filter(s => !s.ok)).slice(0, 4);
      return shuffle([...yes, ...no]).map(s => ({ kind, s }));
    }
    if (kind === 'satzbau') {
      const fits = content.sentences.filter(s => s.ok && s.t.split(' ').length <= 6);
      return shuffle(fits).slice(0, n || 5).map(s => ({ kind, s }));
    }
    if (kind === 'post') {
      return shuffle(leastSeenFirst(content.stories, s => 'g:' + s.id).slice(0, n || 4)).map(story => ({ kind, story }));
    }
    if (kind === 'reim') {
      const groups = {};
      content.words.filter(w => w.reim).forEach(w => (groups[w.reim] = groups[w.reim] || []).push(w));
      return shuffle(Object.values(groups).filter(g => g.length > 1)).slice(0, n || 8).map(g => {
        const [a, b] = shuffle(g);
        const wrong = distractors(b, 2, { filter: w => w.reim !== a.reim });
        return { kind, a, b, options: shuffle([b, ...wrong]) };
      });
    }
    if (kind === 'silben') {
      const multi = content.words.filter(w => w.syl.includes('-'));
      return shuffle(leastSeenFirst(multi, w => 's:' + w.w).slice(0, n || 6)).map(w => ({ kind, w }));
    }
    if (kind === 'anlaut') {
      return shuffle(leastSeenFirst(content.words, w => 'a:' + w.w).slice(0, n || 8)).map(w => ({
        kind, w, options: shuffle([w, ...distractors(w, 2, { filter: o => o.w[0] !== w.w[0] })]),
      }));
    }
    // Wort–Bild / Bild–Wort, wahlweise nur Wörter mit einem bestimmten Laut (match)
    const re = match ? new RegExp(match, 'i') : null;
    const fits = content.words.filter(w => w.w.length >= minLen && w.w.length <= maxLen && (!re || re.test(w.w)));
    const pool = shuffle(leastSeenFirst(fits, w => 'l:' + w.w).slice(0, n || 8));
    return pool.map((w, i) => {
      const k = kind === 'mix' ? (i % 2 ? 'bildwort' : 'wortbild') : kind;
      return { kind: k, w, options: shuffle([w, ...distractors(w, 2, { similar: k === 'bildwort' })]) };
    });
  },

  mount(root, t, api) {
    switch (t.kind) {
      case 'satz': return mountSatz(root, t, api);
      case 'reim': return mountReim(root, t, api);
      case 'post': return mountPost(root, t, api);
      case 'silben': return mountSilben(root, t, api);
      case 'satzbau':
        return mountBuild(root, { parts: t.s.t.split(' '), say: t.s.t, wide: true }, api);
      default: return mountChoice(root, t, api);
    }
  },
};

/** Auswahl aus drei Karten – für Wort–Bild, Bild–Wort und Anlaute. */
function mountChoice(root, t, api) {
  const showPics = t.kind !== 'bildwort';   // Antwortkarten sind Bilder
  const prompt = t.kind === 'wortbild' ? `<div class="prompt panel word-card">${sylHtml(t.w)}</div>`
    : t.kind === 'anlaut' ? `<div class="prompt panel word-card anlaut">${anlaut(t.w.w)}</div>`
      : `<div class="prompt panel pic-card">${picture(t.w.pic)}</div>`;
  root.innerHTML = `<div class="read ${t.kind}">
    ${prompt}
    <div class="choices">
      ${t.options.map(o => `<button class="choice panel ${showPics ? 'choice-pic' : 'choice-word'}" data-w="${o.w}">${showPics ? picture(o.pic) : sylHtml(o)}</button>`).join('')}
    </div>
  </div>`;
  const seenKey = (t.kind === 'anlaut' ? 'a:' : 'l:') + t.w.w;
  onPick(root, t.w.w, api, async btn => {
    markSeen(seenKey);
    await api.correct({ target: btn, say: t.w.w });
  });
}

/** Gemeinsame Logik: richtige Karte finden, falsche werden blass und sind gesperrt. */
function onPick(root, rightWord, api, onRight, onAny) {
  let tries = 0;
  let locked = false;
  root.querySelector('.choices').addEventListener('click', async e => {
    const btn = e.target.closest('.choice');
    if (!btn || locked || btn.disabled) return;
    if (onAny) onAny();
    if (btn.dataset.w === rightWord) {
      locked = true;
      btn.classList.add('ok');
      await onRight(btn);
      api.done(tries === 0);
    } else {
      tries++;
      btn.disabled = true;
      btn.classList.add('no');
      api.wrong({ target: btn });
    }
  });
}

const labeledChoice = o => `<button class="choice panel choice-pic labeled" data-w="${o.w}">${picture(o.pic)}<span class="cap">${sylHtml(o)}</span></button>`;

function mountReim(root, t, api) {
  root.innerHTML = `<div class="read reim">
    <div class="prompt panel pic-word">${picture(t.a.pic)}<span>${sylHtml(t.a)}</span></div>
    <div class="choices">${t.options.map(labeledChoice).join('')}</div>
  </div>`;
  onPick(root, t.b.w, api, async btn => {
    await api.correct({ target: btn, say: t.a.w });
    if (api.alive()) await api.koko.say(t.b.w);   // „Haus … Maus"
  });
}

function mountSilben(root, t, api) {
  const parts = t.w.syl.split('-');
  // Eine fremde Silbe dazumischen.
  const others = content.words.flatMap(w => w.syl.split('-').slice(1)).filter(s => !parts.includes(s));
  mountBuild(root, {
    parts, extras: [pick(others)], pic: picture(t.w.pic), say: t.w.w, wide: true,
    onSolved: () => markSeen('s:' + t.w.w),
  }, api);
}

function mountPost(root, t, api) {
  const story = t.story;
  const options = story.options.map(wordByName);
  root.innerHTML = `<div class="read post">
    <div class="story panel">
      <button class="listen-btn listen" aria-label="Vorlesen">${ICON.sound}</button>
      ${story.lines.map(l => `<p>${l}</p>`).join('')}
    </div>
    <div class="question">${story.q}</div>
    <div class="choices">${options.map(labeledChoice).join('')}</div>
  </div>`;
  // Vorlesen ist eine Hilfe: Koko liest Satz für Satz und danach die Frage.
  let reading = 0;
  root.querySelector('.listen').addEventListener('click', async () => {
    const id = ++reading;
    for (const line of [...story.lines, story.q]) {
      if (id !== reading || !api.alive()) return;
      await speak(line);
    }
  });
  onPick(root, story.answer, api, async btn => {
    markSeen('g:' + story.id);
    await api.correct({ target: btn, say: story.answer });
  }, () => { reading++; });
}

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
