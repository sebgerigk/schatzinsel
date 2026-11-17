// Elternbereich: Fortschritt, Spielzeit, Inhalte und Sicherung des Spielstands.
// Bewusst schlicht und in normaler Schrift – dieser Bildschirm ist für Erwachsene.
import { register, go } from '../engine/router.js';
import { getState, settings, setSetting, applySettings, exportState, importState, resetProgress, storageInfo, werkstatt } from '../engine/storage.js';
import { ISLANDS, ISLAND_ORDER, part2Visible } from '../content/stations.js';
import { content } from '../engine/content.js';
import { minutesToday, lastDays, addBonus, timeIsUp } from '../engine/playtime.js';
import { ICON } from '../art/icons.js';

const TABS = [['fortschritt', 'Fortschritt'], ['zeit', 'Spielzeit'], ['inhalte', 'Inhalte'], ['stand', 'Spielstand']];
const LIMITS = [0, 10, 15, 20, 30, 45];

const fmtDate = key => {
  if (!key) return '–';
  const [y, m, d] = key.split('-');
  return `${Number(d)}.${Number(m)}.`;
};
const countSeen = prefix => Object.keys(getState().seen || {}).filter(k => k.startsWith(prefix)).length;

function progressHtml() {
  const st = getState();
  let total = 0, got = 0, done = 0, count = 0;
  const tables = ISLAND_ORDER.map(id => {
    const isl = ISLANDS[id];
    const medals = id === 'programmieren';
    const rows = isl.stations.map(s => {
      const stars = st.stars[s.id] || 0;
      total += 3; got += stars; count++;
      if (stars) done++;
      return `<tr><td>${s.title}${s.part === 2 ? ' <small>(Teil 2)</small>' : ''}</td><td class="stars">${'★'.repeat(stars)}<span>${'★'.repeat(3 - stars)}</span></td>
        ${medals ? `<td>${(st.medals || {})[s.id] ? 'Kompass' : '–'}</td>` : ''}<td>${st.played[s.id] || 0}×</td><td>${fmtDate((st.last || {})[s.id])}</td></tr>`;
    }).join('');
    return `<h3>${isl.name}</h3><table><thead><tr><th>Station</th><th>Sterne</th>${medals ? '<th>Medaille</th>' : ''}<th>Gespielt</th><th>Zuletzt</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).join('');
  const days = lastDays(7);
  const max = Math.max(10, ...days.map(d => d.min));
  return `
    <div class="cards">
      <div class="card"><b>${got} / ${total}</b><span>Sterne</span></div>
      <div class="card"><b>${done} / ${count}</b><span>Stationen geschafft</span></div>
      <div class="card"><b>${st.coins}</b><span>Goldmünzen</span></div>
      <div class="card"><b>${minutesToday()} min</b><span>heute gespielt</span></div>
    </div>
    <h3>Spielzeit der letzten 7 Tage</h3>
    <div class="bars">${days.map(d => `<div class="bar"><i style="height:${Math.round(d.min / max * 100)}%"></i><b>${d.min}</b><span>${d.label}</span></div>`).join('')}</div>
    <h3>Geübt</h3>
    <p>Wörter gelesen: ${countSeen('l:')} von ${content.words.length} · Wörter geschrieben: ${countSeen('w:') + countSeen('t:') + countSeen('d:') + countSeen('h:')}
      · Geschichten gelesen: ${countSeen('g:')} von ${content.stories.length}
      · Seekarten gelöst: ${countSeen('p:')} · am Kartentisch: ${werkstatt().raetsel.length} Rätsel gebaut, ${werkstatt().bilder.length} Bilder gemalt</p>
    <p class="hint">Die Kompass-Medaille gibt es auf der Programmierinsel, wenn alle Aufgaben einer Runde mit der kürzesten möglichen Lösung geschafft wurden.</p>
    <p class="hint">Ein Stern heißt geschafft, drei Sterne heißt: alles beim ersten Versuch richtig.</p>
    ${tables}`;
}

function timeHtml() {
  const s = settings();
  return `
    <p>Heute gespielt: <b>${minutesToday()} Minuten</b>${s.limitMin ? ` von ${s.limitMin}` : ''}${timeIsUp() ? ' – für heute ist Schluss.' : ''}</p>
    <h3>Tägliche Spielzeit</h3>
    <div class="choices-row">${LIMITS.map(m => `<button class="opt ${s.limitMin === m ? 'on' : ''}" data-limit="${m}">${m ? m + ' min' : 'Kein Limit'}</button>`).join('')}</div>
    <p class="hint">Ist die Zeit um, darf Ihr Kind die angefangene Runde noch beenden. Danach verabschiedet sich Koko bis morgen.
      Gezählt wird nur, solange wirklich gespielt wird.</p>
    <h3>Heute ausnahmsweise länger</h3>
    <button class="act" data-act="bonus">10 Minuten schenken</button>
    <p class="msg" data-msg="bonus"></p>`;
}

function contentHtml() {
  const s = settings();
  const toggle = (key, label, on, note = '') => `<button class="switch ${on ? 'on' : ''}" data-toggle="${key}"><i></i><span>${label}${note ? `<small>${note}</small>` : ''}</span></button>`;
  return `
    <h3>Inseln</h3>
    ${ISLAND_ORDER.map(id => toggle('island:' + id, ISLANDS[id].name, s.islands[id])).join('')}
    <p class="msg" data-msg="islands"></p>
    <h3>Programmierinsel</h3>
    ${toggle('progPart2', 'Teil 2: Steuerrad', part2Visible(getState()), s.progPart2 === 'auto' || s.progPart2 === undefined
    ? 'Erscheint von selbst, sobald Teil 1 geschafft ist. Hier können Sie ihn vorher einschalten oder ganz ausblenden.'
    : 'Von Ihnen ' + (s.progPart2 ? 'eingeschaltet' : 'ausgeblendet') + '. Drehen links/rechts aus Sicht des Schiffs, Schleifen und Bedingungen – eher ab Ende der ersten Klasse.')}
    <p>Fahrtempo des Schiffs:</p>
    <div class="choices-row">${[['normal', 'Normal'], ['langsam', 'Langsam']].map(([v, l]) => `<button class="opt ${s.progSpeed === v ? 'on' : ''}" data-speed="${v}">${l}</button>`).join('')}</div>
    <h3>Schwierigkeit</h3>
    ${toggle('caps', 'Nur Großbuchstaben', s.caps, 'Alle Texte in Großbuchstaben; Aufgaben zur Groß- und Kleinschreibung entfallen.')}
    ${toggle('unlockAll', 'Alle Stationen freischalten', s.unlockAll, 'Ihr Kind kann jede Station sofort wählen, ohne die davor zu schaffen.')}`;
}

function saveHtml() {
  const info = storageInfo();
  return `
    <p>${info.any ? 'Der Spielstand wird auf diesem Gerät gespeichert.' : '<b>Achtung: Auf diesem Gerät kann der Spielstand nicht gespeichert werden.</b>'}
      App-Starts: ${info.launches} · Speicher 1: ${info.local ? 'in Ordnung' : 'nicht verfügbar'} · Speicher 2: ${info.idb ? 'in Ordnung' : 'nicht verfügbar'}</p>
    <h3>Sicherung erstellen</h3>
    <p class="hint">Der Spielstand liegt nur auf diesem iPad. Mit einer Sicherung lässt er sich aufbewahren oder auf ein anderes Gerät übertragen.</p>
    <button class="act" data-act="export">Sicherung anzeigen</button>
    <div class="backup" hidden>
      <textarea class="code" readonly rows="4"></textarea>
      <div class="choices-row"><button class="act" data-act="copy">Kopieren</button>${navigator.share ? '<button class="act" data-act="share">Teilen …</button>' : ''}</div>
      <p class="msg" data-msg="export"></p>
    </div>
    <h3>Sicherung laden</h3>
    <textarea class="code paste" rows="3" placeholder="Sicherung hier einfügen (beginnt mit SCHATZINSEL1:)"></textarea>
    <button class="act" data-act="import">Laden</button>
    <p class="msg" data-msg="import"></p>
    <h3>Neu anfangen</h3>
    <button class="act danger" data-act="reset">Fortschritt löschen</button>
    <p class="msg" data-msg="reset"></p>`;
}

const RENDER = { fortschritt: progressHtml, zeit: timeHtml, inhalte: contentHtml, stand: saveHtml };

register('eltern', (el, { tab = 'fortschritt' }) => {
  let current = tab;
  let resetArmed = false;
  el.innerHTML = `
    <header class="eltern-head">
      <button class="round-btn back" aria-label="Zurück">${ICON.back}</button>
      <h1>Elternbereich</h1>
    </header>
    <nav class="eltern-tabs">${TABS.map(([id, label]) => `<button data-tab="${id}">${label}</button>`).join('')}</nav>
    <main class="eltern-body"></main>`;
  const body = el.querySelector('.eltern-body');
  const msg = (key, text) => { const m = body.querySelector(`[data-msg="${key}"]`); if (m) m.textContent = text; };

  function render() {
    el.querySelectorAll('.eltern-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === current));
    body.innerHTML = RENDER[current]();
    body.scrollTop = 0;
    resetArmed = false;
  }

  el.querySelector('.eltern-tabs').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    current = b.dataset.tab;
    render();
  });
  el.querySelector('.back').addEventListener('click', () => go('map'));

  body.addEventListener('click', async e => {
    const limit = e.target.closest('[data-limit]');
    if (limit) { setSetting('limitMin', Number(limit.dataset.limit)); render(); return; }
    const speed = e.target.closest('[data-speed]');
    if (speed) { setSetting('progSpeed', speed.dataset.speed); render(); return; }

    const sw = e.target.closest('[data-toggle]');
    if (sw) {
      const key = sw.dataset.toggle;
      const s = settings();
      if (key.startsWith('island:')) {
        const id = key.slice(7);
        const islands = { ...s.islands, [id]: !s.islands[id] };
        if (!Object.values(islands).some(Boolean)) { msg('islands', 'Mindestens eine Insel muss eingeschaltet bleiben.'); return; }
        setSetting('islands', islands);
      } else if (key === 'progPart2') {
        setSetting('progPart2', !part2Visible(getState()));
      } else {
        setSetting(key, !s[key]);
        applySettings();
      }
      render();
      return;
    }

    const act = e.target.closest('[data-act]');
    if (!act) return;
    switch (act.dataset.act) {
      case 'bonus':
        addBonus(10);
        msg('bonus', 'Für heute sind 10 Minuten dazugekommen.');
        break;
      case 'export': {
        const box = body.querySelector('.backup');
        box.hidden = false;
        box.querySelector('textarea').value = exportState();
        break;
      }
      case 'copy': {
        const area = body.querySelector('.backup textarea');
        try {
          await navigator.clipboard.writeText(area.value);
          msg('export', 'Kopiert. Jetzt zum Beispiel in die Notizen einfügen.');
        } catch {
          area.focus(); area.select();
          msg('export', 'Bitte den markierten Text von Hand kopieren.');
        }
        break;
      }
      case 'share':
        try { await navigator.share({ title: 'Schatzinsel – Sicherung', text: body.querySelector('.backup textarea').value }); } catch { /* abgebrochen */ }
        break;
      case 'import':
        if (importState(body.querySelector('.paste').value)) {
          applySettings();
          current = 'fortschritt';
          render();
        } else {
          msg('import', 'Das ist keine gültige Sicherung. Bitte den ganzen Text einfügen.');
        }
        break;
      case 'reset':
        if (!resetArmed) {
          resetArmed = true;
          act.textContent = 'Wirklich alles löschen?';
          msg('reset', 'Sterne, Münzen und das Schiff gehen verloren. Zum Bestätigen noch einmal tippen.');
        } else {
          resetProgress();
          current = 'fortschritt';
          render();
        }
        break;
    }
  });

  render();
});
