// Eltern-Sperre: eine Malaufgabe, die ein Erstklässler nicht lösen kann.
import { h, rnd, shake } from '../engine/util.js';
import { ICON } from '../art/icons.js';

/** Zeigt die Sperre über dem aktuellen Bildschirm. onPass wird nach der richtigen Antwort aufgerufen. */
export function openGate(onPass) {
  let a, b, entry = '';
  const el = h(`<div class="gate">
    <div class="gate-card panel">
      <button class="gate-close" aria-label="Schließen">${ICON.cross}</button>
      <p class="gate-title">Nur für Eltern</p>
      <p class="gate-q"></p>
      <div class="gate-entry"></div>
      <div class="gate-pad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}
        <button data-k="del" aria-label="Löschen">${ICON.del}</button><button data-k="0">0</button><button data-k="ok" class="ok" aria-label="Fertig">${ICON.check}</button>
      </div>
    </div>
  </div>`);
  const q = el.querySelector('.gate-q');
  const out = el.querySelector('.gate-entry');
  const ask = () => {
    a = rnd(6, 9); b = rnd(6, 9); entry = '';
    q.textContent = `Wie viel ist ${a} × ${b}?`;
    out.textContent = '';
  };
  const close = () => el.remove();

  el.querySelector('.gate-close').addEventListener('click', close);
  el.addEventListener('click', e => { if (e.target === el) close(); });
  el.querySelector('.gate-pad').addEventListener('click', e => {
    const key = e.target.closest('button');
    if (!key) return;
    const k = key.dataset.k;
    if (k === 'del') entry = entry.slice(0, -1);
    else if (k === 'ok') {
      if (Number(entry) === a * b && entry !== '') { close(); onPass(); return; }
      shake(el.querySelector('.gate-card'));
      ask();
    } else if (entry.length < 3) entry += k;
    out.textContent = entry;
  });

  ask();
  document.getElementById('app').appendChild(el);
}
