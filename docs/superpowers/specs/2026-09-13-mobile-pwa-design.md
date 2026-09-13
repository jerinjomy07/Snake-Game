# Neon Serpent Mobile PWA Design

## Goal

Turn Neon Serpent into a mobile-first progressive web app that can be opened, installed, and shared from a GitHub Pages HTTPS link while retaining desktop keyboard play.

## Scope

- Support phone portrait screens from 320px wide upward.
- Add large on-screen directional controls and swipe controls.
- Preserve Arrow keys/WASD, Space, and Escape on desktop.
- Fit the game board, HUD, and controls in a viewport without page scrolling during normal portrait play.
- Add PWA manifest, icons, and offline caching.
- Add a GitHub Actions workflow that deploys the static site to GitHub Pages.

## Architecture

The existing `SnakeGame` rules remain unchanged. `app.js` gains an input adapter that routes keyboard keys, D-pad presses, and qualifying swipes into `game.setDirection()`. CSS uses a mobile-first layout: the header becomes compact, the canvas scales from its square intrinsic size, and the controls sit beneath it inside the safe-area inset.

`manifest.webmanifest` describes the installable app. `service-worker.js` caches the static shell (`index.html`, CSS, JS, manifest) on first successful visit and serves it offline thereafter. GitHub Actions publishes the repository root to GitHub Pages on pushes to `main`.

## Touch Interaction

- Four labeled 64px minimum tap targets form a two-column D-pad beneath the board.
- A touch start on the canvas stores its position. A touch end more than 20px away selects the dominant horizontal or vertical direction. Short taps are ignored so the canvas remains uncluttered.
- Touch input starts a ready or paused game just like the first keyboard direction.
- The page sets `touch-action: none` on gameplay controls and canvas to prevent accidental browser pan/zoom while playing.

## PWA and Sharing

- The app runs under HTTPS on GitHub Pages and may be installed using the browser's Add to Home Screen command.
- The app works offline after its initial visit because the service worker caches its static dependencies.
- No account, analytics, backend, or user data is required.
- The published GitHub Pages address has the form `https://<github-user>.github.io/<repository-name>/`.

## Error Handling

- Service worker registration failures are non-fatal; the game still runs online.
- Touch pointers that end outside the canvas are cancelled with no direction change.
- Inputs attempting a direct reverse are handled by existing game rules.

## Testing and Verification

- Node tests cover swipe-direction classification and its minimum-distance threshold.
- Browser checks confirm D-pad movement, swipes, desktop keys, PWA manifest availability, service-worker registration, and no vertical overflow at 375x667 and 390x844 viewports.
- GitHub Actions is verified by syntax review locally; deployment requires the user to create or select a GitHub repository and authorize GitHub access.
