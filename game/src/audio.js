// Audio: tiny WebAudio bleeps synthesized on the fly — no sound files, so the game stays offline
// and source-only. Every effect is a short oscillator envelope; muted state lives here alone.

let context = null;
let muted = false;

function audio() {
  if (context === null && typeof AudioContext !== 'undefined') {
    context = new AudioContext();
  }
  return context;
}

/** Play one synthesized bleep: frequency sweep + gain envelope, in Hertz and seconds. */
export function play(freq, duration, type = 'square', volume = 0.12) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.55), ac.currentTime + duration);
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export function onCore() { play(880, 0.12, 'square', 0.10); }
export function onHit() { play(180, 0.25, 'sawtooth', 0.14); }
export function onWin() { play(1320, 0.5, 'triangle', 0.14); }
export function onLose() { play(110, 0.6, 'sawtooth', 0.16); }

export function toggleMute() {
  muted = !muted;
  return muted;
}
