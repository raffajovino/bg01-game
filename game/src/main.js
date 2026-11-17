// Entry point and screen flow: boots the canvas, owns the fixed-step loop, and routes
// confirm presses between title, playing, paused, dead and win screens. The world never
// touches the DOM; this file is the only one that does.
import { FIELD, STEP } from './config.js';
import { initInput, isDown, endFrame } from './input.js';
import { drawFrame } from './render.js';
import { makeRandom } from './random.js';
import { createWorld, EVENT_CORE, EVENT_CREATURE, EVENT_HIT, EVENT_OVER, EVENT_WIN } from './world.js';
import { onCore, onHit, onLose, onWin } from './audio.js';

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const status = document.getElementById('status');

function resize() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  const width = Math.floor(FIELD.width * scale);
  const height = Math.floor(FIELD.height * scale);
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.left = `${Math.floor((window.innerWidth - width) / 2)}px`;
  canvas.style.top = `${Math.floor((window.innerHeight - height) / 2)}px`;
  canvas.style.position = 'fixed';
}
window.addEventListener('resize', resize);
resize();

const random = makeRandom((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
const world = createWorld(random);

// Exposed for console inspection of a live run; nothing reads it to skip the rules.
window.neonDepths = world;

initInput(canvas, (key) => {
  if (key === 'confirm') {
    if (world.state.screen !== 'playing' && world.state.screen !== 'paused') {
      world.start();
      status.textContent = 'Dive started. Steer with arrow keys or WASD, hold Shift to boost.';
    }
  } else if (key === 'pause' && world.state.screen === 'playing') {
    world.state.screen = 'paused';
    status.textContent = 'Paused.';
  } else if (key === 'pause' && world.state.screen === 'paused') {
    world.state.screen = 'playing';
    status.textContent = 'Resumed.';
  }
});

let last = performance.now();
let accumulator = 0;
let clock = 0;

function frame(now) {
  const elapsed = Math.min(0.25, (now - last) / 1000);
  last = now;
  clock += elapsed;

  accumulator += elapsed;
  while (accumulator >= STEP) {
    const moveX = (isDown('right') ? 1 : 0) - (isDown('left') ? 1 : 0);
    const moveY = (isDown('down') ? 1 : 0) - (isDown('up') ? 1 : 0);
    const events = world.step(moveX, moveY, isDown('boost'), STEP);
    if (events & EVENT_CORE) onCore();
    if (events & (EVENT_HIT | EVENT_CREATURE)) onHit();
    if (events & EVENT_OVER) onLose();
    if (events & EVENT_WIN) onWin();
    accumulator -= STEP;
  }
  endFrame();

  drawFrame(context, world, clock);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
