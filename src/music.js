/**
 * The musical decisions, kept separate from the audio and drawing so they can
 * be tested without a browser.
 *
 * The governing constraint: this is for children under about four. There is no
 * wrong note, no losing, no score, and nothing to read. A toy that can be
 * played incorrectly by someone who cannot yet read has been designed for the
 * wrong person.
 */

/**
 * A major pentatonic scale, which is the whole trick.
 *
 * Any combination of these notes sounds consonant, in any order, at any speed,
 * played by anyone. A toddler mashing the screen with both palms produces
 * something that sounds intentional. On a diatonic scale the same mashing
 * produces semitone clashes, and adults quietly take the toy away.
 */
export const PENTATONIC = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0, // G4
  440.0, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0, // A5
];

/**
 * Map a vertical position to a note: high on the screen sounds high.
 *
 * The mapping is deliberately literal, because that correspondence is the one
 * piece of cause and effect a very small child can discover unaided.
 *
 * @param {number} y      Position, 0 at the top.
 * @param {number} height Total height.
 */
export function noteForPosition(y, height) {
  if (!Number.isFinite(y) || !Number.isFinite(height) || height <= 0) return PENTATONIC[0];
  const clamped = Math.min(Math.max(y, 0), height);
  const fromBottom = 1 - clamped / height;
  const index = Math.min(PENTATONIC.length - 1, Math.floor(fromBottom * PENTATONIC.length));
  return PENTATONIC[index];
}

/**
 * Colours, warm and desaturated rather than primary and screaming.
 *
 * Each note keeps its own colour so the same pitch always looks the same,
 * which turns the screen into a very simple instrument you can learn.
 */
export const COLORS = [
  '#f6a6a0',
  '#f7c59f',
  '#f3e0a3',
  '#bfe3b4',
  '#a5dbd6',
  '#a8c8ee',
  '#c4b6e8',
  '#eeb0d8',
  '#f6a6a0',
  '#f7c59f',
];

/** @param {number} frequency */
export function colorForNote(frequency) {
  const index = PENTATONIC.indexOf(frequency);
  return index === -1 ? COLORS[0] : COLORS[index];
}

/**
 * Bubble size falls as pitch rises, so the display reads like a xylophone.
 *
 * @param {number} frequency
 */
export function radiusForNote(frequency) {
  const index = PENTATONIC.indexOf(frequency);
  const position = index === -1 ? 0 : index / (PENTATONIC.length - 1);
  return 90 - position * 45;
}

/**
 * Cap how many bubbles live at once.
 *
 * Small children hold their hands flat on the screen. Without a cap the toy
 * accumulates hundreds of animating shapes, the frame rate collapses, and the
 * sound starts stuttering on exactly the cheap tablet it is most likely to be
 * running on.
 */
export const MAX_BUBBLES = 40;

/** @param {Array} bubbles */
export function trim(bubbles) {
  return bubbles.length <= MAX_BUBBLES ? bubbles : bubbles.slice(bubbles.length - MAX_BUBBLES);
}
