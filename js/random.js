export class SeededRandom {
  constructor(seed = 42) { this.initialSeed = Number(seed) >>> 0; this.state = this.initialSeed || 42; }
  next() {
    this.state += 0x6D2B79F5;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
  range(min, max) { return min + this.next() * (max - min); }
  pick(items) { return items[Math.floor(this.next() * items.length)]; }
}
