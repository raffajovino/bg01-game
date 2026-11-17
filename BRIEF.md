# Neon Depths — build brief

Make an original browser arcade game, "Neon Depths": you steer a small submarine through five
depth bands of dark ocean, dodging mines and anglerfish, collecting energy cores, and finally
holding position inside a vault beam long enough to crack it before a 75-second pressure clock
runs out.

## Hard requirements
- Plain static files under `game/`, no build step: `game/index.html` opens in desktop Chrome and
  plays with keyboard + mouse and NO network request. Every script/asset is a file under `game/`
  or a `data:` URI. No libraries needed; write ES modules yourself.
- Complete game loop: title screen with controls, play with a HUD (score, cores collected, hull
  pips, energy bar, pressure clock), a way to win (crack the vault), a way to lose (hull hits or
  clock), a results screen, and restart on Enter/click.
- Sound: synthesised with WebAudio (no audio files).
- Original art direction: flat neon shapes on dark blue bands, glow halos, drifting motes.
- Split the source into small ES modules that each do one job, named for that job
  (config, input, audio, world/simulation, render, main loop).
- `main.ts` at the repo root: Node 22, standard library only. It copies `game/` and
  `screenshots/` to `$MAKEFUN_OUTPUT_DIR` (default `/output`) and writes `dossier.json` there
  with `buildDossier` imported from `./vendor/makefun-game.ts`.
- `LICENSE` already exists (MIT); do not touch it. `vendor/makefun-game.ts` is the kit's copy —
  never edit it.

## Tuning targets
- Sub speeds 320 px/s, 640 while boosting (boost drains energy, energy regenerates).
- 3 hull points, 1.2 s of grace after a hit; every third core collected repairs one hull point.
- Mines accelerate as the clock runs; anglerfish start arriving at 30 s.
- 6 cores gate the vault; the vault drifts in from the right and needs 3 s of holding in the beam.

Write the whole game yourself in this session, run it once, and leave the repository in a state
where `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` succeeds.
