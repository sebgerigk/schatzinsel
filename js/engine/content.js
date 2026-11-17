// Lerninhalte (Wörter, Sätze, Kokos Texte) – werden beim Start geladen.
export const content = { words: [], sentences: [], stories: [], phrases: {}, extras: {}, seekarten: {} };

export async function loadContent() {
  const get = name => fetch(`content/${name}.json`).then(r => r.json());
  const [words, sentences, phrases, stories] = await Promise.all([get('words'), get('sentences'), get('phrases'), get('stories')]);
  content.stories = stories;
  content.extras = await get('extras');
  content.seekarten = await get('seekarten');
  content.words = words;
  content.sentences = sentences;
  content.phrases = phrases;
}

/** Text (oder Liste von Texten) zu einem Schlüssel aus phrases.json. */
export const P = key => content.phrases[key];

export const NUMWORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben',
  'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn',
  'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig'];
