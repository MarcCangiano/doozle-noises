# Doozle Noises

A gentle sound toy for very small children. Touch anywhere.

[![CI](https://github.com/MarcCangiano/doozle-noises/actions/workflows/ci.yml/badge.svg)](https://github.com/MarcCangiano/doozle-noises/actions/workflows/ci.yml)

No words, no menus, no score, and nothing to lose. Touch the screen and a soft note plays with a bubble of colour. Higher up the screen is a higher note. That's all of it.

Built for the under-fours, which is a real constraint rather than an excuse for a small project.

## The design decisions worth explaining

**A major pentatonic scale.** This is the whole trick. Any combination of those notes sounds consonant in any order at any speed played by anyone, so a toddler flattening both palms on a tablet produces something that sounds deliberate. On an ordinary diatonic scale the same gesture produces semitone clashes, it sounds like a mistake, and adults quietly take the toy away. There's a test asserting no two adjacent notes are less than a whole tone apart, because that property is the product.

**Nothing can go wrong.** Nonsense input to `noteForPosition` still returns a note. An unknown frequency still gets a colour and a size. There's no failure path that stops the noise, because to a two-year-old a toy that stopped making noise is a broken toy, and no explanation is available to them.

**A cap on how much is on screen.** Small children rest their hands flat. Without a limit the toy accumulates hundreds of animating shapes, the frame rate collapses, and audio starts stuttering, on exactly the cheap tablet it's most likely running on. Forty bubbles, newest kept.

**Quiet by default and no attack transient.** Sine waves through a soft envelope with a ceiling on gain. This gets played at arm's length from very small ears, often at whatever volume the last video left behind.

**`prefers-reduced-motion` is respected.** Bubbles still appear and fade, they just stop pulsing. Some children are sensitive to motion and some parents set that for a reason.

**`touch-action: none` and friends.** Small hands rest, drag and double-tap. None of that should scroll, zoom, or pop a text-selection menu over the toy.

## Run it

```bash
npm start     # serves src/ on localhost
npm test
```

No build step and no runtime dependencies. Sounds are synthesised with the Web Audio API, so there are no audio files to load.

## Why it exists

It belongs to Doozle, a channel of songs and lullabies for the same age group. It's also the only thing I've published that's meant to be enjoyed rather than run in CI, and building for people who can't read is a genuinely different discipline from building for engineers.

## License

MIT
