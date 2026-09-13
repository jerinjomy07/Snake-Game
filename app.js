import { SnakeGame } from './game.js';
import { SoundEffects } from './audio.js';
import { getSwipeDirection } from './input.js';

const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');
const levelElement = document.querySelector('#level');
const bestElement = document.querySelector('#best');
const overlay = document.querySelector('#overlay');
const game = new SnakeGame({ columns: 32, rows: 32 });
const sounds = new SoundEffects();
const cell = canvas.width / game.columns;
let lastFrame = 0;
let elapsed = 0;
let best = Number(localStorage.getItem('neon-serpent-best') || 0);
let touchStart = null;

bestElement.textContent = String(best).padStart(3, '0');
const keyDirections = { ArrowUp: 'up', w: 'up', W: 'up', ArrowRight: 'right', d: 'right', D: 'right', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left' };

function updateOverlay() {
  if (game.status === 'playing') { overlay.classList.add('hidden'); return; }
  overlay.classList.remove('hidden');
  if (game.status === 'paused') overlay.innerHTML = '<p class="overlay-kicker">SIGNAL ON HOLD</p><h2>PAUSED</h2><button class="overlay-action" data-action="play">TAP TO RESUME</button>';
  else if (game.status === 'gameover') overlay.innerHTML = `<p class="overlay-kicker">CONNECTION LOST</p><h2>GAME OVER</h2><p class="overlay-score">SCORE ${String(game.score).padStart(3, '0')}</p><button class="overlay-action" data-action="play">TAP TO REBOOT</button>`;
  else overlay.innerHTML = '<p class="overlay-kicker">SYSTEM READY</p><h2>JACK IN</h2><button class="overlay-action" data-action="play">TAP TO START</button>';
}

function updateHud() {
  scoreElement.textContent = String(game.score).padStart(3, '0');
  levelElement.textContent = String(Math.floor(game.score / 5) + 1).padStart(2, '0');
  if (game.score > best) { best = game.score; localStorage.setItem('neon-serpent-best', String(best)); }
  bestElement.textContent = String(best).padStart(3, '0');
}

function drawGrid(time) {
  context.fillStyle = '#080912'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(130, 64, 225, .19)'; context.lineWidth = 1;
  for (let i = 0; i <= game.columns; i += 1) {
    const offset = i * cell + .5;
    context.beginPath(); context.moveTo(offset, 0); context.lineTo(offset, canvas.height); context.stroke();
    context.beginPath(); context.moveTo(0, offset); context.lineTo(canvas.width, offset); context.stroke();
  }
  context.fillStyle = `rgba(60, 10, 105, ${.12 + Math.sin(time / 700) * .05})`; context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFood(time) {
  if (!game.food) return;
  const pulse = .7 + Math.sin(time / 72) * .3; const x = game.food.x * cell; const y = game.food.y * cell;
  context.save(); context.globalAlpha = pulse; context.shadowBlur = 24 + pulse * 18; context.shadowColor = '#f354ff';
  const pixel = (px, py, width, height, color) => { context.fillStyle = color; context.fillRect(x + cell * px, y + cell * py, cell * width, cell * height); };
  if (game.food.fruit === 'cherry') {
    pixel(.26, .37, .23, .29, '#ff3e9d'); pixel(.53, .37, .23, .29, '#ff3e9d'); pixel(.47, .18, .08, .28, '#8aff8c'); pixel(.55, .18, .2, .08, '#8aff8c');
  } else if (game.food.fruit === 'citrus') {
    pixel(.25, .3, .5, .42, '#ffd13d'); pixel(.18, .4, .64, .22, '#ffd13d'); pixel(.4, .2, .2, .1, '#ffef9a'); pixel(.42, .42, .16, .16, '#fff7c4');
  } else if (game.food.fruit === 'berry') {
    pixel(.3, .3, .4, .42, '#a95cff'); pixel(.2, .42, .6, .2, '#a95cff'); pixel(.4, .18, .2, .12, '#ff7bff'); pixel(.42, .43, .16, .15, '#f4c3ff');
  } else {
    pixel(.28, .3, .44, .43, '#ff3d6e'); pixel(.2, .42, .6, .2, '#ff3d6e'); pixel(.48, .17, .09, .2, '#8aff8c'); pixel(.56, .2, .2, .09, '#8aff8c'); pixel(.38, .42, .15, .14, '#ffe4ee');
  }
  context.restore();
}

function drawSnake() {
  const pad = Math.max(2, Math.round(cell * 0.08));
  game.snake.slice().reverse().forEach((part, index, parts) => {
    const x = part.x * cell; const y = part.y * cell; const isHead = index === parts.length - 1;
    context.save(); context.shadowBlur = isHead ? 24 : 16; context.shadowColor = '#00ff72'; context.fillStyle = isHead ? '#bcffd0' : '#39ed79'; context.fillRect(x + pad, y + pad, cell - pad * 2, cell - pad * 2);
    context.fillStyle = isHead ? '#00d85c' : '#0cac47'; context.fillRect(x + pad * 2, y + pad * 2, cell - pad * 4, cell * .18);
    if (isHead) { context.fillStyle = '#ffffff'; context.fillRect(x + cell * .67, y + cell * .29, cell * .12, cell * .12); }
    context.restore();
  });
}

function draw(time) { drawGrid(time); drawFood(time); drawSnake(); }
function handleDirection(direction) {
  if (game.status !== 'playing') game.start();
  game.setDirection(direction);
  updateOverlay();
}
function startOrRestart() {
  if (game.status === 'gameover') game.reset();
  game.start();
  elapsed = 0;
  updateHud();
  updateOverlay();
}
function loop(time) {
  const delta = time - lastFrame; lastFrame = time;
  if (game.status === 'playing') {
    elapsed += delta;
    if (elapsed >= game.speed) {
      elapsed %= game.speed;
      const scoreBefore = game.score;
      const statusBefore = game.status;
      game.step();
      if (game.score > scoreBefore) sounds.pickup();
      if (statusBefore === 'playing' && game.status === 'gameover') sounds.gameOver();
      updateHud(); updateOverlay();
    }
  }
  draw(time); requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  const direction = keyDirections[event.key];
  if (direction) { event.preventDefault(); handleDirection(direction); return; }
  if (event.code === 'Space') { event.preventDefault(); startOrRestart(); }
  if (event.key === 'Escape') { game.pause(); updateOverlay(); }
});

canvas.addEventListener('pointerdown', (event) => {
  touchStart = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener('pointerup', (event) => {
  const direction = touchStart && getSwipeDirection(touchStart, { x: event.clientX, y: event.clientY });
  if (direction) handleDirection(direction);
  touchStart = null;
});
canvas.addEventListener('pointercancel', () => { touchStart = null; });
overlay.addEventListener('pointerdown', (event) => {
  if (event.target.closest('[data-action="play"]')) startOrRestart();
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});

updateHud(); updateOverlay(); requestAnimationFrame(loop);
