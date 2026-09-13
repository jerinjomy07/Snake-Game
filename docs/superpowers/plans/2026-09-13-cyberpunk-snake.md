# Cyberpunk Snake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable desktop-first neon Snake game that accelerates every five points.

**Architecture:** `game.js` provides testable grid rules as an ES module. `app.js` hosts the canvas input, timing, and rendering loop, while `styles.css` establishes the cyberpunk visual system and overlays.

**Tech Stack:** HTML5 Canvas, CSS, vanilla ES modules, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-13-cyberpunk-snake-design.md`

## Global Constraints

- Use no runtime dependencies.
- Use keyboard-first desktop controls: Arrow keys/WASD, Space, and Escape.
- Render the snake with green neon glow and the food as a flickering purple pixel.
- Increase speed after scores divisible by five; do not go below 55ms per movement step.

---

### Task 1: Testable game rules

**Files:**
- Create: `game.js`
- Create: `tests/game.test.js`

**Interfaces:**
- Produces: `SnakeGame`, constructed with `{ columns, rows, random }`.
- Produces: `setDirection(direction)`, `step()`, `reset()`, `speed`, `score`, `snake`, `food`, `status`.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { SnakeGame } from '../game.js';

test('scores and accelerates when eating the fifth food', () => {
  const game = new SnakeGame({ columns: 20, rows: 20, random: () => 0 });
  game.score = 4;
  game.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  game.food = { x: 6, y: 5 };
  game.step();
  assert.equal(game.score, 5);
  assert.equal(game.snake.length, 4);
  assert.equal(game.speed, 132);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game.test.js`

Expected: FAIL because `game.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
export class SnakeGame {
  constructor({ columns, rows, random = Math.random }) {
    this.columns = columns; this.rows = rows; this.random = random; this.reset();
  }
  reset() { this.score = 0; this.speed = 145; this.status = 'ready'; }
  step() { /* advance one grid cell, eat food, then set speed to max(55, 145 - floor(score / 5) * 13) */ }
}
```

- [ ] **Step 4: Run tests to verify rules pass**

Run: `node --test tests/game.test.js`

Expected: PASS for start, directions, eating, collision, food placement, and speed tests.

### Task 2: Canvas game interface

**Files:**
- Create: `index.html`
- Create: `app.js`
- Create: `styles.css`

**Interfaces:**
- Consumes: `SnakeGame` from `game.js`.
- Produces: a playable browser interface served by a static file host.

- [ ] **Step 1: Add the game shell**

```html
<main class="game-shell">
  <header class="hud"><p>Score <strong id="score">000</strong></p><p>Level <strong id="level">01</strong></p></header>
  <section class="playfield"><canvas id="game" aria-label="Cyberpunk Snake game"></canvas><div id="overlay"></div></section>
  <p class="instructions">ARROWS / WASD <span>MOVE</span> · SPACE <span>START</span> · ESC <span>PAUSE</span></p>
</main>
```

- [ ] **Step 2: Implement canvas rendering and input**

```js
import { SnakeGame } from './game.js';
const game = new SnakeGame({ columns: 24, rows: 24 });
window.addEventListener('keydown', (event) => {
  const keys = { ArrowUp: 'up', w: 'up', ArrowRight: 'right', d: 'right', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left' };
  if (keys[event.key]) game.setDirection(keys[event.key]);
});
// draw grid, neon green snake, flickering purple food, and schedule game.step() using game.speed
```

- [ ] **Step 3: Style and visually verify**

Run: start a static server and open `index.html` in a browser.

Expected: HUD stays readable, glow is visible, food visibly flickers, and the game can be fully played with the keyboard.

### Task 3: Verification

**Files:**
- Modify: `tests/game.test.js`

- [ ] **Step 1: Run the full automated suite**

Run: `node --test`

Expected: PASS with no warnings.

- [ ] **Step 2: Perform a browser smoke test**

Test: Start with Space, make turns with arrows/WASD, pause with Escape, collect food, and verify cadence increases at five points.

Expected: All controls and score/level updates work; collision shows restart overlay.
