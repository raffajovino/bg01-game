// Canvas renderer: one drawFrame call per frame. Everything is flat neon shapes with glow
// circles — no image assets, so the whole game stays source the dossier can show.
import { ENERGY_MAX, FIELD, HUD, PALETTE, VAULT } from './config.js';
import { KIND_CORE, KIND_CREATURE, KIND_MINE, STATE_DEAD, STATE_PAUSED, STATE_TITLE, STATE_WIN } from './world.js';

function glow(context, x, y, radius, colour) {
  context.fillStyle = colour;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function drawSub(context, sub, time) {
  const halfW = sub.width / 2, halfH = sub.height / 2;
  glow(context, sub.x, sub.y, 44, PALETTE.subGlow);
  context.fillStyle = sub.grace > 0 && Math.floor(time * 10) % 2 === 0 ? PALETTE.danger : PALETTE.sub;
  context.beginPath();
  context.ellipse(sub.x, sub.y, halfW, halfH, 0, 0, Math.PI * 2);
  context.fill();
  // fin
  context.fillRect(sub.x - halfW - 6, sub.y - halfH + 2, 8, 10);
  // porthole
  context.fillStyle = '#0b0e1a';
  context.beginPath();
  context.arc(sub.x + halfW * 0.45, sub.y, 5, 0, Math.PI * 2);
  context.fill();
  // headlight beam
  context.fillStyle = 'rgba(87,230,200,0.08)';
  context.beginPath();
  context.moveTo(sub.x + halfW, sub.y - 4);
  context.lineTo(sub.x + halfW + 210, sub.y - 26);
  context.lineTo(sub.x + halfW + 210, sub.y + 26);
  context.lineTo(sub.x + halfW, sub.y + 4);
  context.closePath();
  context.fill();
}

function drawMine(context, item) {
  glow(context, item.x, item.y, item.radius * 1.9, PALETTE.mineGlow);
  context.strokeStyle = PALETTE.mine;
  context.lineWidth = 2.5;
  context.beginPath();
  context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
  context.stroke();
  for (let spike = 0; spike < 6; spike += 1) {
    const angle = item.phase * 0.4 + (spike / 6) * Math.PI * 2;
    context.beginPath();
    context.moveTo(item.x + Math.cos(angle) * item.radius, item.y + Math.sin(angle) * item.radius);
    context.lineTo(item.x + Math.cos(angle) * (item.radius + 7), item.y + Math.sin(angle) * (item.radius + 7));
    context.stroke();
  }
}

function drawCore(context, item) {
  glow(context, item.x, item.y, item.radius * 2.1, PALETTE.coreGlow);
  context.fillStyle = PALETTE.core;
  context.save();
  context.translate(item.x, item.y);
  context.rotate(item.phase * 0.5);
  context.fillRect(-8, -8, 16, 16);
  context.restore();
}

function drawCreature(context, item) {
  glow(context, item.x, item.y, item.radius * 1.8, PALETTE.creatureGlow);
  context.fillStyle = PALETTE.creature;
  context.beginPath();
  context.ellipse(item.x, item.y, item.radius, item.radius * 0.62, 0, 0, Math.PI * 2);
  context.fill();
  // glowing lure
  context.strokeStyle = PALETTE.creature;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(item.x + item.radius * 0.8, item.y - item.radius * 0.5);
  context.lineTo(item.x + item.radius * 1.3, item.y - item.radius * 1.1);
  context.stroke();
  glow(context, item.x + item.radius * 1.3, item.y - item.radius * 1.2, 6, PALETTE.coreGlow);
  context.fillStyle = PALETTE.core;
  context.beginPath();
  context.arc(item.x + item.radius * 1.3, item.y - item.radius * 1.2, 4, 0, Math.PI * 2);
  context.fill();
  // eye
  context.fillStyle = '#0b0e1a';
  context.beginPath();
  context.arc(item.x + item.radius * 0.4, item.y - 4, 4, 0, Math.PI * 2);
  context.fill();
}

function drawVault(context, vault) {
  glow(context, vault.x, vault.y, 90, PALETTE.vaultGlow);
  context.strokeStyle = PALETTE.vault;
  context.lineWidth = 4;
  context.strokeRect(vault.x - 46, vault.y - 60, 92, 120);
  const progress = Math.min(1, vault.hold / VAULT.openTime);
  context.fillStyle = PALETTE.vaultGlow;
  context.fillRect(vault.x - 46, vault.y + 60 - 120 * progress, 92, 120 * progress);
  context.fillStyle = PALETTE.vault;
  context.font = HUD.font;
  context.textAlign = 'center';
  context.fillText(progress > 0 ? `CRACKING ${Math.floor(progress * 100)}%` : 'VAULT', vault.x, vault.y - 70);
  context.textAlign = 'left';
}

function drawBackground(context, time) {
  for (let band = 0; band < PALETTE.water.length; band += 1) {
    context.fillStyle = PALETTE.water[band];
    context.fillRect(0, (FIELD.height / PALETTE.water.length) * band, FIELD.width, FIELD.height / PALETTE.water.length + 1);
  }
  // drifting motes
  context.fillStyle = 'rgba(232,236,255,0.10)';
  for (let mote = 0; mote < 26; mote += 1) {
    const x = ((mote * 173 + time * (12 + (mote % 5) * 6)) % (FIELD.width + 40)) - 20;
    const y = (mote * 251 + Math.sin(time * 0.6 + mote) * 20) % FIELD.height;
    context.fillRect(x, y, 3, 3);
  }
}

function drawHud(context, state) {
  context.textAlign = 'left';
  context.fillStyle = PALETTE.ink;
  context.font = HUD.font;
  context.fillText(`SCORE ${state.score}`, HUD.pad, 28);
  context.fillText(`CORES ${state.cores}/${VAULT.requiredCores}`, HUD.pad, 52);
  for (let pip = 0; pip < state.hull; pip += 1) {
    context.fillStyle = PALETTE.good;
    context.fillRect(HUD.pad + pip * 22, 62, 16, 8);
  }
  context.fillStyle = 'rgba(232,236,255,0.18)';
  context.fillRect(FIELD.width - 168, HUD.pad, 150, 12);
  context.fillStyle = state.energy > 25 ? PALETTE.core : PALETTE.danger;
  context.fillRect(FIELD.width - 168, HUD.pad, 150 * (state.energy / ENERGY_MAX), 12);
  context.fillStyle = state.pressure < 15 ? PALETTE.danger : PALETTE.dim;
  context.textAlign = 'right';
  context.fillText(`HULL ${state.pressure.toFixed(1)}s`, FIELD.width - HUD.pad, 50);
  context.textAlign = 'left';
}

function centerBlock(context, title, lines, time) {
  context.textAlign = 'center';
  context.fillStyle = PALETTE.ink;
  context.font = HUD.bigFont;
  context.fillText(title, FIELD.width / 2, FIELD.height / 2 - 60);
  context.font = HUD.font;
  for (let index = 0; index < lines.length; index += 1) {
    context.fillStyle = index === lines.length - 1 && Math.floor(time * 2) % 2 === 0 ? PALETTE.good : PALETTE.dim;
    context.fillText(lines[index], FIELD.width / 2, FIELD.height / 2 + index * 26);
  }
  context.textAlign = 'left';
}

/** Draw one full frame of the game onto the canvas. */
export function drawFrame(context, world, time) {
  const { state } = world;
  drawBackground(context, time);
  if (state.screen === STATE_TITLE) {
    centerBlock(context, 'NEON DEPTHS', [
      'Steer: arrows / WASD    Boost: hold SHIFT',
      'Collect 6 energy cores, then reach the VAULT',
      'Dodge mines and anglerfish — hull lasts 3 hits',
      'You have 75 seconds before the pressure hull gives out',
      'Press ENTER or CLICK to dive',
    ], time);
    return;
  }
  if (state.cores >= VAULT.requiredCores) drawVault(context, state.vault);
  for (let index = 0; index < state.items.length; index += 1) {
    const item = state.items[index];
    if (!item.active) continue;
    if (item.kind === KIND_MINE) drawMine(context, item);
    else if (item.kind === KIND_CORE) drawCore(context, item);
    else if (item.kind === KIND_CREATURE) drawCreature(context, item);
  }
  drawSub(context, state.sub, time);
  drawHud(context, state);
  if (state.screen === STATE_PAUSED) {
    centerBlock(context, 'PAUSED', ['P or ESC resumes'], time);
  } else if (state.screen === STATE_DEAD) {
    centerBlock(context, 'HULL CRACKED', [
      `final score ${state.score} — ${state.cores} cores recovered`,
      'ENTER or CLICK dives again',
    ], time);
  } else if (state.screen === STATE_WIN) {
    centerBlock(context, 'VAULT CRACKED', [
      `you escaped with ${state.score} points`,
      `hull remaining ${state.hull} — ENTER or CLICK dives again`,
    ], time);
  }
}
