# Neon Serpent Mobile PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Neon Serpent a touch-first, installable PWA that can deploy from GitHub Pages.

**Architecture:** `input.js` isolates direction normalization and swipe classification from UI rendering. `app.js` binds keyboard, D-pad, and canvas touches to that API; PWA files make the static app installable and available offline.

**Tech Stack:** HTML5 Canvas, vanilla ES modules, CSS, Web App Manifest, Service Worker, GitHub Actions, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-13-mobile-pwa-design.md`

## Global Constraints

- Support phone portrait screens from 320px wide upward.
- Use four 64px-minimum D-pad targets and canvas swipe controls.
- Retain Arrow keys/WASD, Space, and Escape controls.
- Prevent browser scrolling and zoom gestures over the gameplay region.
- Ship no runtime dependencies or backend.
- Cache the static shell for offline play after a successful first visit.

---

### Task 1: Direction input helpers

**Files:**
- Create: `input.js`
- Create: `tests/input.test.mjs`

**Interfaces:**
- Produces: `getSwipeDirection(start, end, minimumDistance = 20)` returning `'up' | 'down' | 'left' | 'right' | null`.

- [ ] **Step 1: Write failing swipe tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getSwipeDirection } from '../input.js';

test('returns the dominant direction of a valid swipe', () => {
  assert.equal(getSwipeDirection({ x: 8, y: 9 }, { x: 65, y: 28 }), 'right');
  assert.equal(getSwipeDirection({ x: 80, y: 90 }, { x: 75, y: 38 }), 'up');
});

test('ignores a short canvas touch', () => {
  assert.equal(getSwipeDirection({ x: 10, y: 10 }, { x: 25, y: 20 }), null);
});
```

- [ ] **Step 2: Run tests and verify the module-missing failure**

Run: `node --test tests/input.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `input.js`.

- [ ] **Step 3: Implement `getSwipeDirection`**

```js
export function getSwipeDirection(start, end, minimumDistance = 20) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < minimumDistance) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}
```

- [ ] **Step 4: Run the helper tests**

Run: `node --test tests/input.test.mjs`

Expected: 2 passing tests.

### Task 2: Mobile game controls and layout

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`
- Test: `tests/input.test.mjs`

**Interfaces:**
- Consumes: `getSwipeDirection(start, end)` and `SnakeGame.setDirection(direction)`.
- Produces: canvas touch input and four accessible touch buttons with `data-direction` values.

- [ ] **Step 1: Add mobile D-pad markup**

```html
<section class="touch-controls" aria-label="Touch controls">
  <button data-direction="left" aria-label="Move left">←</button>
  <div class="touch-stack"><button data-direction="up" aria-label="Move up">↑</button><button data-direction="down" aria-label="Move down">↓</button></div>
  <button data-direction="right" aria-label="Move right">→</button>
</section>
```

- [ ] **Step 2: Bind D-pad and canvas swipe input**

```js
import { getSwipeDirection } from './input.js';
let touchStart = null;
canvas.addEventListener('pointerdown', (event) => { touchStart = { x: event.clientX, y: event.clientY }; });
canvas.addEventListener('pointerup', (event) => {
  const direction = touchStart && getSwipeDirection(touchStart, { x: event.clientX, y: event.clientY });
  if (direction) handleDirection(direction);
  touchStart = null;
});
document.querySelectorAll('[data-direction]').forEach((button) => button.addEventListener('pointerdown', () => handleDirection(button.dataset.direction)));
```

- [ ] **Step 3: Add responsive CSS**

```css
.touch-controls { display: none; }
@media (max-width: 700px), (pointer: coarse) {
  body { min-height: 100dvh; overflow: hidden; }
  .game-shell { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; height: 100dvh; padding: max(10px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom)); }
  .touch-controls { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 12px; }
  .touch-controls button { min-height: 64px; touch-action: none; }
  #game { touch-action: none; }
}
```

- [ ] **Step 4: Run all Node tests**

Run: `node --test`

Expected: all game, audio, and input tests pass.

### Task 3: Installable offline app

**Files:**
- Create: `manifest.webmanifest`
- Create: `service-worker.js`
- Create: `icons/icon.svg`
- Modify: `index.html`

**Interfaces:**
- Produces: manifest with `display: standalone` and service worker cache named `neon-serpent-v1`.

- [ ] **Step 1: Add PWA metadata**

```html
<link rel="manifest" href="manifest.webmanifest" />
<link rel="apple-touch-icon" href="icons/icon.svg" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

- [ ] **Step 2: Add a static cache worker**

```js
const CACHE = 'neon-serpent-v1';
const SHELL = ['./', './index.html', './styles.css', './game.js', './input.js', './audio.js', './manifest.webmanifest', './icons/icon.svg'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL))));
self.addEventListener('fetch', (event) => event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))));
```

- [ ] **Step 3: Register the worker in `app.js`**

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}
```

- [ ] **Step 4: Verify manifest and service worker over localhost**

Run: `python -m http.server 4173`

Expected: DevTools Application panel identifies the manifest and an active service worker.

### Task 4: GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `README.md`

**Interfaces:**
- Produces: GitHub Actions deployment to Pages from the `main` branch.

- [ ] **Step 1: Add Pages workflow**

```yaml
name: Deploy GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: '.' }
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Document publishing steps**

```md
1. Create a public GitHub repository and push this folder to its `main` branch.
2. In the repository, choose Settings → Pages → Source: GitHub Actions.
3. Wait for the “Deploy GitHub Pages” run to finish, then share the published URL.
```

- [ ] **Step 3: Verify YAML and final test suite**

Run: `node --test`

Expected: all tests pass; workflow has `contents`, `pages`, and `id-token` permissions and uses Pages actions v4/v5.
