import { describe, it, expect } from 'vitest';
import {
  PENTATONIC,
  noteForPosition,
  colorForNote,
  radiusForNote,
  trim,
  MAX_BUBBLES,
} from '../src/music.js';

describe('the scale', () => {
  // The premise of the whole toy: there is no wrong note. If a semitone ever
  // sneaks into this array, mashing the screen starts to clash.
  it('contains no semitone intervals', () => {
    for (let i = 1; i < PENTATONIC.length; i++) {
      const semitones = 12 * Math.log2(PENTATONIC[i] / PENTATONIC[i - 1]);
      expect(Math.round(semitones), `${PENTATONIC[i - 1]} to ${PENTATONIC[i]}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('rises', () => {
    const sorted = [...PENTATONIC].sort((a, b) => a - b);
    expect(PENTATONIC).toEqual(sorted);
  });
});

describe('noteForPosition', () => {
  it('plays high notes at the top of the screen', () => {
    expect(noteForPosition(0, 1000)).toBe(PENTATONIC.at(-1));
  });

  it('plays low notes at the bottom', () => {
    expect(noteForPosition(1000, 1000)).toBe(PENTATONIC[0]);
  });

  it('rises monotonically as you go up', () => {
    const notes = [900, 700, 500, 300, 100].map((y) => noteForPosition(y, 1000));
    expect(notes).toEqual([...notes].sort((a, b) => a - b));
  });

  // A toy that throws is a toy that stops making noise, which to a two year
  // old is indistinguishable from a broken toy.
  it('survives nonsense input', () => {
    expect(PENTATONIC).toContain(noteForPosition(-50, 1000));
    expect(PENTATONIC).toContain(noteForPosition(5000, 1000));
    expect(PENTATONIC).toContain(noteForPosition(NaN, 1000));
    expect(PENTATONIC).toContain(noteForPosition(100, 0));
  });
});

describe('appearance', () => {
  it('gives every note a colour', () => {
    for (const note of PENTATONIC) {
      expect(colorForNote(note)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('gives the same note the same colour every time', () => {
    expect(colorForNote(PENTATONIC[3])).toBe(colorForNote(PENTATONIC[3]));
  });

  it('falls back rather than returning undefined', () => {
    expect(colorForNote(12345)).toMatch(/^#[0-9a-f]{6}$/i);
    expect(radiusForNote(12345)).toBeGreaterThan(0);
  });

  it('draws low notes bigger than high ones', () => {
    expect(radiusForNote(PENTATONIC[0])).toBeGreaterThan(radiusForNote(PENTATONIC.at(-1)));
  });
});

describe('trim', () => {
  // Flat palms on a tablet produce a lot of these.
  it('caps the bubble count', () => {
    const many = Array.from({ length: 500 }, (_, i) => i);
    expect(trim(many)).toHaveLength(MAX_BUBBLES);
  });

  it('keeps the newest, not the oldest', () => {
    const many = Array.from({ length: 100 }, (_, i) => i);
    expect(trim(many).at(-1)).toBe(99);
  });

  it('leaves a short list alone', () => {
    expect(trim([1, 2, 3])).toEqual([1, 2, 3]);
  });
});
