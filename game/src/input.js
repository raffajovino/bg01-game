// Keyboard + pointer input, edge-detected: the world only sees presses that happened this frame.

const held = new Set();
const pressed = new Set();

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ShiftLeft: 'boost', ShiftRight: 'boost',
  KeyP: 'pause', Escape: 'pause',
  Enter: 'confirm', Space: 'confirm',
};

export function initInput(canvas, onPress) {
  window.addEventListener('keydown', (event) => {
    const key = KEYMAP[event.code];
    if (!key) return;
    event.preventDefault();
    if (!held.has(key)) {
      pressed.add(key);
      if (onPress) onPress(key);
    }
    held.add(key);
  }, { passive: false });

  window.addEventListener('keyup', (event) => {
    const key = KEYMAP[event.code];
    if (key) held.delete(key);
  });

  canvas.addEventListener('pointerdown', () => {
    pressed.add('confirm');
    if (onPress) onPress('confirm');
  });
}

/** True while the key is down. */
export function isDown(key) {
  return held.has(key);
}

/** True only on the frame the key went down. */
export function wasPressed(key) {
  return pressed.has(key);
}

/** Clear the per-frame edge set; call once at the end of every frame. */
export function endFrame() {
  pressed.clear();
}
