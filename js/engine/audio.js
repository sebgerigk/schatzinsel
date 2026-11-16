// Sprache (vorerzeugte Clips, sonst Sprachausgabe des Geräts) und Soundeffekte.
let ctx = null;
let master = null;
let voiceGain = null;
let busyUntil = 0; // bis wann (Audio-Zeit) noch ein Soundeffekt klingt
let index = {};
const buffers = new Map();
let currentSrc = null;
let resolveCurrent = null;
let speakToken = 0;

export async function initAudio() {
  try {
    index = await (await fetch('assets/audio/index.json')).json();
  } catch {
    index = {};
  }
  // iOS pausiert den Ton, wenn die App im Hintergrund war – bei jeder Berührung wieder aufwecken.
  document.addEventListener('pointerdown', unlockAudio, true);
}

/** Muss aus einer Berührung heraus aufgerufen werden (Vorgabe von iOS). */
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    voiceGain = ctx.createGain();
    voiceGain.gain.value = 1.15;
    voiceGain.connect(master);
    // Unhörbarer Dauerton hält die Tonausgabe wach – sonst fehlt nach Pausen der Anfang der Sprache.
    try {
      const hum = ctx.createOscillator();
      const quiet = ctx.createGain();
      hum.frequency.value = 20;
      quiet.gain.value = 0.0008;
      hum.connect(quiet).connect(master);
      hum.start();
    } catch { /* nicht kritisch */ }
    try {
      // Spielt auch dann, wenn das iPad stummgeschaltet ist.
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch { /* nicht überall verfügbar */ }
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
}

async function loadBuffer(file) {
  if (buffers.has(file)) return buffers.get(file);
  const data = await (await fetch('assets/audio/' + file)).arrayBuffer();
  const buf = await new Promise((res, rej) => ctx.decodeAudioData(data, res, rej));
  buffers.set(file, buf);
  return buf;
}

export function stopSpeech() {
  speakToken++;
  if (currentSrc) {
    try { currentSrc.onended = null; currentSrc.stop(); } catch { /* schon beendet */ }
    currentSrc = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (resolveCurrent) { resolveCurrent(); resolveCurrent = null; }
}

function playBuffer(buf) {
  return new Promise(res => {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(voiceGain);
    // Erst sprechen, wenn der Soundeffekt (Klingeln, Fanfare …) ausgeklungen ist.
    const delay = Math.min(0.9, Math.max(0, busyUntil - ctx.currentTime - 0.15));
    const finish = () => {
      if (currentSrc === src) { currentSrc = null; resolveCurrent = null; }
      res();
    };
    currentSrc = src;
    resolveCurrent = res;
    src.onended = finish;
    src.start(ctx.currentTime + delay);
    setTimeout(finish, (delay + buf.duration) * 1000 + 1200); // Sicherheitsnetz
  });
}

function tts(text) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = 0.9;
    const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('de'));
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => res();
    resolveCurrent = res;
    speechSynthesis.speak(u);
    setTimeout(res, 9000);
  });
}

/** Spricht einen Text. Das Promise endet, wenn fertig gesprochen oder unterbrochen wurde. */
export async function speak(text) {
  stopSpeech();
  const token = speakToken;
  if (!text) return;
  const file = index[text];
  if (file && ctx) {
    try {
      const buf = await loadBuffer(file);
      if (token !== speakToken) return;
      await playBuffer(buf);
      return;
    } catch { /* Clip fehlt oder nicht dekodierbar -> Sprachausgabe */ }
    if (token !== speakToken) return;
  }
  await tts(text);
}

/** Lädt Clips schon einmal vor, damit sie ohne Verzögerung starten. */
export function preload(texts) {
  if (!ctx) return;
  for (const t of texts) {
    const file = index[t];
    if (file && !buffers.has(file)) loadBuffer(file).catch(() => {});
  }
}

function tone(freq, start, dur, type = 'sine', gain = 0.2, slideTo = null) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t0 = ctx.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

const SFX = {
  tap: () => tone(620, 0, 0.07, 'triangle', 0.13),
  pop: () => tone(420, 0, 0.12, 'sine', 0.22, 880),
  correct: () => { tone(784, 0, 0.16, 'triangle', 0.2); tone(1175, 0.11, 0.3, 'triangle', 0.2); },
  wrong: () => { tone(233, 0, 0.18, 'sine', 0.22, 185); },
  coin: () => { tone(1319, 0, 0.09, 'square', 0.07); tone(1760, 0.07, 0.35, 'square', 0.07); },
  star: () => { tone(988, 0, 0.12, 'triangle', 0.18); tone(1480, 0.08, 0.4, 'sine', 0.16); },
  fanfare: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.28, 'triangle', 0.2));
    tone(1319, 0.56, 0.6, 'triangle', 0.2);
  },
  sail: () => { tone(392, 0, 0.18, 'triangle', 0.16); tone(523, 0.12, 0.18, 'triangle', 0.16); tone(659, 0.24, 0.35, 'triangle', 0.16); },
};

const SFX_LEN = { tap: 0.08, pop: 0.14, correct: 0.42, wrong: 0.2, coin: 0.42, star: 0.48, fanfare: 1.15, sail: 0.6 };

export function sfx(name) {
  if (!ctx || ctx.state !== 'running' || !SFX[name]) return;
  try {
    SFX[name]();
    busyUntil = Math.max(busyUntil, ctx.currentTime + SFX_LEN[name]);
  } catch { /* Ton ist nie kritisch */ }
}
