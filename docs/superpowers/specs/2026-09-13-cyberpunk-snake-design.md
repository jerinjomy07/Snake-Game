# Cyberpunk Snake Design

## Goal

Create a dependency-free, desktop-first classic Snake game with a dark cyberpunk atmosphere, a neon-green snake, purple flickering food, score HUD, and speed increases at each five-point threshold.

## Architecture

The game is a single browser page. `game.js` owns deterministic rules in a `SnakeGame` class; `app.js` binds keyboard input, the animation loop, and canvas rendering. CSS owns the cyberpunk layout, glow treatments, overlays, and responsive sizing without making touch controls part of the primary experience.

## Experience

The centered canvas is a square grid set over a subtly animated, near-black city-grid field. The header displays current score, level, and best score. Arrow keys and WASD drive movement; Space starts or restarts; Escape pauses. A start/restart overlay gives the instructions without interrupting play.

## Game Rules

- The snake starts at three cells, moving right.
- Food always occupies an unoccupied cell.
- Eating food adds one score point and one body segment.
- The game ends on wall or self collision.
- Initial movement cadence is 145ms; it drops by 13ms after score 5, 10, 15, and so on, floored at 55ms.
- Reversing direction into the neck is rejected.

## Testing

Node's built-in test runner covers initial state, legal direction changes, blocked reversal, food scoring/growth, collision, food placement, and threshold-based speed. Browser verification confirms keyboard controls, visual glow, flicker, overlays, and speed progression.
