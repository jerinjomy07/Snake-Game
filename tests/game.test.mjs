import test from 'node:test';
import assert from 'node:assert/strict';
import { SnakeGame } from '../game.js';

const createGame = (random = () => 0) => new SnakeGame({ columns: 12, rows: 12, random });

test('starts with a three-cell snake facing right', () => {
  const game = createGame();
  assert.deepEqual(game.snake, [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }]);
  assert.equal(game.direction, 'right');
  assert.equal(game.score, 0);
  assert.equal(game.speed, 145);
});

test('rejects a direction reversal into the neck', () => {
  const game = createGame();
  assert.equal(game.setDirection('left'), false);
  assert.equal(game.direction, 'right');
  assert.equal(game.setDirection('up'), true);
  assert.equal(game.direction, 'up');
});

test('scores, grows, and accelerates at five points', () => {
  const game = createGame();
  game.status = 'playing';
  game.score = 4;
  game.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  game.food = { x: 6, y: 5 };
  game.step();
  assert.equal(game.score, 5);
  assert.equal(game.snake.length, 4);
  assert.equal(game.speed, 132);
});

test('ends the game when the snake hits a wall', () => {
  const game = createGame();
  game.status = 'playing';
  game.snake = [{ x: 11, y: 4 }, { x: 10, y: 4 }, { x: 9, y: 4 }];
  game.step();
  assert.equal(game.status, 'gameover');
});

test('places food on an unoccupied cell', () => {
  const game = createGame(() => 0);
  game.snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
  game.placeFood();
  assert.equal(game.food.x, 3);
  assert.equal(game.food.y, 0);
});

test('assigns a cyberpunk fruit type when placing food', () => {
  const game = createGame(() => 0.99);
  assert.equal(game.food.fruit, 'berry');
});

test('supports custom baseSpeed for responsive desktop/mobile pacing', () => {
  const laptopGame = new SnakeGame({ columns: 45, rows: 25, baseSpeed: 108 });
  assert.equal(laptopGame.speed, 108);
  laptopGame.status = 'playing';
  laptopGame.score = 5;
  laptopGame.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  laptopGame.food = { x: 6, y: 5 };
  laptopGame.step();
  assert.equal(laptopGame.speed, 108 - 13);
});
