/* ============================================================
   PORTFOLIO RPG 3D — arranque
   ============================================================ */
import { Game } from './game/game.js';

const canvas = document.getElementById('scene');

function fail(err) {
  console.error(err);
  const hint = document.getElementById('titleHint');
  if (hint) hint.textContent = 'No se pudo iniciar el mundo 3D (¿WebGL desactivado?). / Could not start the 3D world.';
}

try {
  // `window.game` queda expuesto para depurar desde la consola
  window.game = new Game(canvas);
} catch (err) {
  fail(err);
}
