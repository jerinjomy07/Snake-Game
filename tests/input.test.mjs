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
