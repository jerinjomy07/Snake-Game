export class SoundEffects {
  constructor(contextFactory = () => new (window.AudioContext || window.webkitAudioContext)()) {
    this.contextFactory = contextFactory;
    this.context = null;
  }

  getContext() {
    if (!this.context) this.context = this.contextFactory();
    if (this.context.state === 'suspended') this.context.resume?.();
    return this.context;
  }

  tone({ frequency, endFrequency = frequency, duration, type = 'square', volume = 0.05, delay = 0 }) {
    const context = this.getContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(start); oscillator.stop(start + duration);
  }

  pickup() {
    this.tone({ frequency: 480, endFrequency: 960, duration: 0.12, type: 'square', volume: 0.035 });
  }

  gameOver() {
    this.tone({ frequency: 175, endFrequency: 62, duration: 0.42, type: 'sawtooth', volume: 0.06 });
    this.tone({ frequency: 82, endFrequency: 42, duration: 0.28, type: 'square', volume: 0.035, delay: 0.07 });
  }
}
