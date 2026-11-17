// Neon Depths — entry program (Node 22, standard library only).
//
// The game itself is game/: plain static files that any static server can hand to a desktop
// browser with no network request. This program's whole job is to hand it in: copy game/ and
// screenshots/ beside /output, then write /output/dossier.json with the kit's own buildDossier,
// which is the exact library the scorer rebuilds the dossier with.
//
//   outside the grader:  MAKEFUN_OUTPUT_DIR=out node main.ts
//   to play it locally:  node serve.ts   (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's five limits, as reference/gate.json states them.
const GATE_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function stage(source: string, destination: string) {
  if (!existsSync(source)) return false;
  cpSync(source, destination, { recursive: true });
  return true;
}

mkdirSync(outDir, { recursive: true });

const stagedGame = stage(join(here, 'game'), join(outDir, 'game'));
if (!stagedGame) {
  console.error('Neon Depths: game/ is missing beside main.ts, so there is nothing to hand in.');
  process.exit(1);
}

mkdirSync(join(outDir, 'screenshots'), { recursive: true });
const stagedShots = stage(join(here, 'screenshots'), join(outDir, 'screenshots'));
if (!stagedShots) {
  console.error('Neon Depths: screenshots/ is missing, so the judge would see no images of the game.');
  process.exit(1);
}

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, GATE_LIMITS));

console.log(`Neon Depths staged into ${outDir}: game/, screenshots/ and dossier.json.`);
