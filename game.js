const VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = { up: 'down', down: 'up', left: 'right', right: 'left' };
const FRUITS = ['apple', 'cherry', 'citrus', 'berry'];

export class SnakeGame {
  constructor({ columns, rows, random = Math.random, baseSpeed = 145 }) {
    this.columns = columns;
    this.rows = rows;
    this.random = random;
    this.baseSpeed = baseSpeed;
    this.reset();
  }

  reset() {
    const centerX = Math.floor(this.columns / 2);
    const centerY = Math.floor(this.rows / 2);
    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];
    this.direction = 'right';
    this.pendingDirection = 'right';
    this.score = 0;
    this.speed = this.baseSpeed;
    this.status = 'ready';
    this.placeFood();
  }

  setDirection(direction) {
    if (!VECTORS[direction] || direction === OPPOSITES[this.direction]) return false;
    this.direction = direction;
    this.pendingDirection = direction;
    return true;
  }

  start() {
    if (this.status === 'ready' || this.status === 'paused') this.status = 'playing';
  }

  pause() {
    if (this.status === 'playing') this.status = 'paused';
  }

  step() {
    if (this.status !== 'playing') return this.status;
    this.direction = this.pendingDirection;
    const vector = VECTORS[this.direction];
    const head = this.snake[0];
    const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
    const ate = nextHead.x === this.food.x && nextHead.y === this.food.y;
    const bodyToCheck = ate ? this.snake : this.snake.slice(0, -1);
    const hitsWall = nextHead.x < 0 || nextHead.x >= this.columns || nextHead.y < 0 || nextHead.y >= this.rows;
    const hitsSelf = bodyToCheck.some((cell) => cell.x === nextHead.x && cell.y === nextHead.y);

    if (hitsWall || hitsSelf) {
      this.status = 'gameover';
      return this.status;
    }

    this.snake.unshift(nextHead);
    if (ate) {
      this.score += 1;
      this.speed = Math.max(45, this.baseSpeed - Math.floor(this.score / 5) * 13);
      this.placeFood();
    } else {
      this.snake.pop();
    }
    return this.status;
  }

  placeFood() {
    const openCells = [];
    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.columns; x += 1) {
        if (!this.snake.some((cell) => cell.x === x && cell.y === y)) openCells.push({ x, y });
      }
    }
    const cell = openCells[Math.floor(this.random() * openCells.length)];
    this.food = cell ? { ...cell, fruit: FRUITS[Math.floor(this.random() * FRUITS.length)] } : null;
  }
}
