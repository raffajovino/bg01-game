// The game's rules and state, with no drawing and no browser in it: the submarine, the pool of
// mines, energy cores and anglerfish, the vault approach, score, hull and energy. step() advances
// one fixed step and returns what happened as bit flags, so the caller can react without the
// world knowing about screens or sound. Nothing here allocates after createWorld returns.
import { CORE, CREATURE, ENERGY_MAX, ENERGY_REGEN, FIELD, MINE, PRESSURE, SUB, VAULT } from './config.js';

export const KIND_MINE = 0;
export const KIND_CORE = 1;
export const KIND_CREATURE = 2;

export const EVENT_HIT = 1;
export const EVENT_CORE = 2;
export const EVENT_CREATURE = 4;
export const EVENT_OVER = 8;
export const EVENT_WIN = 16;

export const STATE_TITLE = 'title';
export const STATE_PLAYING = 'playing';
export const STATE_PAUSED = 'paused';
export const STATE_DEAD = 'dead';
export const STATE_WIN = 'win';

export function createWorld(random) {
  const sub = { x: 220, y: FIELD.height / 2, width: SUB.width, height: SUB.height, grace: 0, boosting: false };
  const items = [];
  for (let index = 0; index < 160; index += 1) {
    items.push({ active: false, kind: KIND_MINE, x: 0, y: 0, vx: 0, vy: 0, radius: 0, phase: 0 });
  }
  const vault = { x: FIELD.width + 140, y: FIELD.height / 2, hold: 0, opened: false };
  const state = {
    sub, items, vault,
    screen: STATE_TITLE,
    score: 0, cores: 0, energy: ENERGY_MAX,
    hull: SUB.hullMax, elapsed: 0, pressure: PRESSURE.seconds,
    mineTimer: MINE.interval, coreTimer: CORE.interval,
    creatureTimer: CREATURE.firstAt,
    runSeed: 0,
  };

  function reset(seed) {
    state.runSeed = seed >>> 0;
    sub.x = 220; sub.y = FIELD.height / 2; sub.grace = 0; sub.boosting = false;
    for (const item of items) item.active = false;
    vault.x = FIELD.width + 140; vault.hold = 0; vault.opened = false;
    state.screen = STATE_PLAYING;
    state.score = 0; state.cores = 0; state.energy = ENERGY_MAX;
    state.hull = SUB.hullMax; state.elapsed = 0; state.pressure = PRESSURE.seconds;
    state.mineTimer = MINE.interval; state.coreTimer = CORE.interval;
    state.creatureTimer = CREATURE.firstAt;
  }

  function freeItem() {
    for (let index = 0; index < items.length; index += 1) if (!items[index].active) return items[index];
    return null;
  }

  function spawnMine() {
    const item = freeItem();
    if (item === null) return;
    item.active = true;
    item.kind = KIND_MINE;
    item.radius = MINE.radius;
    item.x = FIELD.width + item.radius;
    item.y = item.radius + random() * (FIELD.height - item.radius * 2);
    const speed = MINE.speedMin + MINE.speedPerDepth * (state.elapsed / 10) + random() * MINE.speedJitter;
    item.vx = -speed;
    item.vy = (random() - 0.5) * 40;
    item.phase = random() * Math.PI * 2;
  }

  function spawnCore() {
    const item = freeItem();
    if (item === null) return;
    item.active = true;
    item.kind = KIND_CORE;
    item.radius = CORE.radius;
    item.x = FIELD.width + item.radius;
    item.y = item.radius + random() * (FIELD.height - item.radius * 2);
    item.vx = -CORE.speed;
    item.vy = 0;
    item.phase = random() * Math.PI * 2;
  }

  function spawnCreature() {
    const item = freeItem();
    if (item === null) return;
    item.active = true;
    item.kind = KIND_CREATURE;
    item.radius = CREATURE.radius;
    item.x = FIELD.width + item.radius;
    item.y = item.radius + random() * (FIELD.height - item.radius * 2);
    item.vx = -CREATURE.speed;
    item.vy = 0;
    item.phase = random() * Math.PI * 2;
  }

  function overlapsSub(item) {
    const halfW = sub.width / 2, halfH = sub.height / 2;
    const nearestX = Math.max(sub.x - halfW, Math.min(item.x, sub.x + halfW));
    const nearestY = Math.max(sub.y - halfH, Math.min(item.y, sub.y + halfH));
    const dx = item.x - nearestX, dy = item.y - nearestY;
    return dx * dx + dy * dy <= item.radius * item.radius;
  }

  function start(seed) {
    reset(seed === undefined ? (Date.now() >>> 0) : seed);
  }

  /** Advance one fixed step; returns the events that happened as a bitmask. */
  function step(moveX, moveY, boost, dt) {
    let events = 0;
    if (state.screen !== STATE_PLAYING) return events;

    state.elapsed += dt;
    state.pressure = Math.max(0, state.pressure - dt);
    if (state.pressure === 0) {
      state.screen = STATE_DEAD;
      return events | EVENT_OVER;
    }

    // submarine movement; boost costs energy and doubles speed
    sub.boosting = boost && state.energy > 1;
    const speed = sub.boosting ? SUB.boostSpeed : SUB.speed;
    if (sub.boosting) state.energy = Math.max(0, state.energy - SUB.boostDrain * dt);
    else state.energy = Math.min(ENERGY_MAX, state.energy + ENERGY_REGEN * dt);
    sub.x = Math.max(sub.width / 2, Math.min(FIELD.width - sub.width / 2, sub.x + moveX * speed * dt));
    sub.y = Math.max(sub.height / 2, Math.min(FIELD.height - sub.height / 2, sub.y + moveY * speed * dt));
    if (sub.grace > 0) sub.grace = Math.max(0, sub.grace - dt);

    // spawning, faster as the run ages
    state.mineTimer -= dt;
    if (state.mineTimer <= 0) {
      spawnMine();
      const scale = Math.pow(MINE.intervalScale, state.elapsed / 10);
      state.mineTimer = Math.max(MINE.minInterval, MINE.interval * scale) * (0.6 + random() * 0.8);
    }
    state.coreTimer -= dt;
    if (state.coreTimer <= 0) {
      spawnCore();
      state.coreTimer = CORE.interval * (0.5 + random() * CORE.intervalJitter);
    }
    state.creatureTimer -= dt;
    if (state.creatureTimer <= 0) {
      spawnCreature();
      state.creatureTimer = 18 + random() * 14;
    }

    // the vault drifts in once the core quota is met; holding in its beam cracks it
    if (state.cores >= VAULT.requiredCores) {
      vault.x -= VAULT.drift * dt;
      const inside = sub.x > vault.x - 40 && sub.x < vault.x + 40 && Math.abs(sub.y - vault.y) < 52;
      if (inside) {
        vault.hold += dt;
        if (vault.hold >= VAULT.openTime) {
          vault.opened = true;
          state.screen = STATE_WIN;
          events |= EVENT_WIN;
        }
      } else {
        vault.hold = Math.max(0, vault.hold - dt * 2);
      }
    }

    // move items, cull off-screen, resolve contacts
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item.active) continue;
      item.phase += dt * 3;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      if (item.kind === KIND_CREATURE) item.y += Math.sin(item.phase) * CREATURE.wobble * dt;
      else if (item.kind === KIND_MINE) item.y += Math.sin(item.phase * 0.6) * 14 * dt;
      if (item.x < -item.radius * 2) { item.active = false; continue; }

      if (overlapsSub(item)) {
        if (item.kind === KIND_CORE) {
          item.active = false;
          state.cores += 1;
          state.score += CORE.score;
          state.energy = Math.min(ENERGY_MAX, state.energy + CORE.energy);
          // every third core patches one hull point, rewarding aggressive collection
          if (state.cores % 3 === 0 && state.hull < SUB.hullMax) state.hull += 1;
          events |= EVENT_CORE;
        } else if (sub.grace === 0) {
          item.active = false;
          state.hull -= 1;
          sub.grace = SUB.hitCooldown;
          state.score = Math.max(0, state.score - 10);
          if (item.kind === KIND_CREATURE) events |= EVENT_CREATURE;
          if (state.hull === 0) {
            state.screen = STATE_DEAD;
            events |= EVENT_OVER;
          } else {
            events |= EVENT_HIT;
          }
        }
      }
    }

    return events;
  }

  return { state, start, reset, step };
}
