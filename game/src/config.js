// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

export const SUB = {
  width: 64,
  height: 30,
  speed: 320,
  boostSpeed: 640,
  boostDrain: 28,      // energy per second while boosting
  hullMax: 3,          // hull hits you can take
  hitCooldown: 1.2,    // seconds of grace after a mine hit
};

export const ENERGY_MAX = 100;
export const ENERGY_REGEN = 6;   // passive regen per second

export const MINE = {
  radius: 16,
  speedMin: 120,
  speedPerDepth: 26,
  speedJitter: 70,
  interval: 0.85,
  intervalScale: 0.93,
  minInterval: 0.18,
};

export const CORE = {
  radius: 12,
  speed: 90,
  interval: 2.2,
  intervalJitter: 1.1,
  energy: 22,
  score: 25,
};

export const CREATURE = {
  radius: 26,
  speed: 95,
  wobble: 130,
  score: 60,
  firstAt: 30,          // seconds before the first anglerfish spawns
};

export const VAULT = {
  requiredCores: 6,     // cores needed before the vault drifts in
  drift: 55,            // vault approaches from the right at this speed
  openTime: 3.0,        // seconds you must hold inside the vault beam to crack it
};

export const PRESSURE = {
  seconds: 75,          // run length: the run ends when the hull timer hits zero
};

export const PALETTE = {
  water: ['#0b0e1a', '#0d1226', '#101733', '#131d42', '#16234f'],
  ink: '#e8ecff',
  dim: '#8a93c4',
  sub: '#57e6c8',
  subGlow: 'rgba(87,230,200,0.25)',
  mine: '#ff5470',
  mineGlow: 'rgba(255,84,112,0.22)',
  core: '#ffd166',
  coreGlow: 'rgba(255,209,102,0.25)',
  creature: '#b57bff',
  creatureGlow: 'rgba(181,123,255,0.22)',
  vault: '#63ffb4',
  vaultGlow: 'rgba(99,255,180,0.20)',
  danger: '#ff5470',
  good: '#57e6c8',
};

export const HUD = {
  font: '16px monospace',
  bigFont: 'bold 44px monospace',
  pad: 18,
};
