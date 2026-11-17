// Deterministic PRNG (mulberry32) so a run seeded with the same number replays exactly.
// The run record stores the seed; the gate's determinism check relies on this module.

export function makeRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick a random integer in [0, n). */
export function randInt(random, n) {
  return Math.floor(random() * n);
}

/** Pick a random float in [lo, hi). */
export function randRange(random, lo, hi) {
  return lo + random() * (hi - lo);
}
