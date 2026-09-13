import test from 'node:test';
import assert from 'node:assert/strict';
import { SoundEffects } from '../audio.js';

function makeContext() {
  const oscillators = [];
  const context = {
    currentTime: 0,
    destination: {},
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; },
    createOscillator() { const oscillator = { frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} }; oscillators.push(oscillator); return oscillator; },
  };
  return { context, oscillators };
}

test('creates a bright oscillator sound for a food pickup', () => {
  const mock = makeContext();
  const sounds = new SoundEffects(() => mock.context);
  sounds.pickup();
  assert.equal(mock.oscillators.length, 1);
});

test('layers two oscillators for a game-over glitch sound', () => {
  const mock = makeContext();
  const sounds = new SoundEffects(() => mock.context);
  sounds.gameOver();
  assert.equal(mock.oscillators.length, 2);
});
