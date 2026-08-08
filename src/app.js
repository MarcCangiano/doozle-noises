import { noteForPosition, colorForNote, radiusForNote, trim } from './music.js';

const canvas = document.getElementById('stage');
const context = canvas.getContext('2d');
const startHint = document.getElementById('start');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let audio = null;
let bubbles = [];

function resize() {
  // Draw at device resolution, or circles look furry on a phone.
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

/**
 * One soft note.
 *
 * A sine wave through a gentle envelope. No attack transient, no distortion,
 * and a ceiling on gain, because this gets played at arm's length from a very
 * small pair of ears and often at whatever volume the last video left behind.
 */
function play(frequency) {
  if (!audio) return;
  const now = audio.currentTime;

  const oscillator = audio.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

  // A little sparkle an octave up, quietly, so a single note is not austere.
  const shimmer = audio.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = frequency * 2;
  const shimmerGain = audio.createGain();
  shimmerGain.gain.setValueAtTime(0.0001, now);
  shimmerGain.gain.exponentialRampToValueAtTime(0.05, now + 0.03);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  oscillator.connect(gain).connect(audio.destination);
  shimmer.connect(shimmerGain).connect(audio.destination);

  oscillator.start(now);
  shimmer.start(now);
  oscillator.stop(now + 1.7);
  shimmer.stop(now + 1.0);
}

function touch(x, y) {
  const frequency = noteForPosition(y, window.innerHeight);
  play(frequency);
  bubbles.push({
    x,
    y,
    radius: radiusForNote(frequency),
    color: colorForNote(frequency),
    born: performance.now(),
  });
  bubbles = trim(bubbles);
}

function frame(now) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  bubbles = bubbles.filter((bubble) => {
    const age = (now - bubble.born) / 1600;
    if (age >= 1) return false;

    const eased = 1 - (1 - age) * (1 - age);
    const radius = reduceMotion ? bubble.radius : bubble.radius * (0.6 + eased * 0.8);

    context.globalAlpha = 1 - age;
    context.fillStyle = bubble.color;
    context.beginPath();
    context.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
    context.fill();
    return true;
  });

  context.globalAlpha = 1;
  requestAnimationFrame(frame);
}

async function wake() {
  if (audio) return;
  audio = new (window.AudioContext || window.webkitAudioContext)();
  // iOS starts contexts suspended until a gesture resumes them.
  if (audio.state === 'suspended') await audio.resume();
  startHint.classList.add('gone');
}

function pointer(event) {
  event.preventDefault();
  wake();
  for (const point of event.changedTouches ?? [event]) {
    touch(point.clientX, point.clientY);
  }
}

canvas.addEventListener('pointerdown', pointer);
canvas.addEventListener('touchstart', pointer, { passive: false });
// Dragging a finger keeps playing, but not on every pixel, or one slow drag
// stacks eighty overlapping notes into a growl.
let lastDrag = 0;
canvas.addEventListener('pointermove', (event) => {
  if (event.buttons === 0) return;
  const now = performance.now();
  if (now - lastDrag < 110) return;
  lastDrag = now;
  pointer(event);
});

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(frame);
