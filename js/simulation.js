import { RoadNetwork, NODES } from './road-network.js';
import { Statistics } from './statistics.js';
import { SeededRandom } from './random.js';
import { getScenario } from './scenario-config.js';

export class Simulation {
  constructor(canvas, onUpdate) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.onUpdate = onUpdate;
    this.strategy = 'fixed';
    this.scenarioId = 'balanced';
    this.seed = 42;
    this.speedMultiplier = 1;
    this.running = false;
    this.paused = false;
    this.lastTimestamp = null;
    this.animationFrame = null;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas.parentElement);
    this.reset();
    this.resize();
  }

  createState() {
    this.random = new SeededRandom(this.seed);
    this.statistics = new Statistics();
    this.network = new RoadNetwork({ strategy: this.strategy, random: this.random, statistics: this.statistics });
    this.spawnAt = new Map();
    for (const source of this.network.sources) this.spawnAt.set(source.key, this.randomSpawnDelay(source.group) * .3);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(340, Math.round(rect.width));
    this.height = Math.max(460, Math.round(rect.height));
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  start() {
    if (this.running && !this.paused) return;
    this.running = true;
    this.paused = false;
    this.lastTimestamp = null;
    this.animationFrame = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.lastTimestamp = null;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.emitUpdate();
  }

  reset() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.running = false;
    this.paused = false;
    this.lastTimestamp = null;
    this.animationFrame = null;
    this.createState();
    this.draw();
    this.emitUpdate();
  }

  setStrategy(strategy) { this.strategy = strategy; this.reset(); }
  setScenario(scenarioId) { this.scenarioId = scenarioId; this.reset(); }
  setSeed(seed) { this.seed = Math.max(1, Number(seed) || 42); this.reset(); }
  setSpeed(multiplier) { this.speedMultiplier = Number(multiplier); this.emitUpdate(); }

  loop(timestamp) {
    if (!this.running || this.paused) return;
    if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
    const realDelta = Math.min((timestamp - this.lastTimestamp) / 1000, .05);
    this.lastTimestamp = timestamp;
    let remaining = realDelta * this.speedMultiplier;
    while (remaining > 0) {
      const step = Math.min(remaining, 1 / 30);
      this.update(step);
      remaining -= step;
    }
    this.draw();
    this.emitUpdate();
    this.animationFrame = requestAnimationFrame((next) => this.loop(next));
  }

  update(deltaTime) {
    this.spawnVehicles();
    this.network.update(deltaTime);
    this.statistics.update(deltaTime, this.network.vehicles);
  }

  randomSpawnDelay(group) {
    const range = getScenario(this.scenarioId).intervals[group] || [6, 10];
    return this.random.range(range[0], range[1]);
  }

  spawnVehicles() {
    for (const source of this.network.sources) {
      if (this.statistics.elapsedTime < this.spawnAt.get(source.key)) continue;
      if (this.network.spawn(source.key)) this.spawnAt.set(source.key, this.statistics.elapsedTime + this.randomSpawnDelay(source.group));
      else this.spawnAt.set(source.key, this.statistics.elapsedTime + .75);
    }
  }

  draw() {
    if (!this.context || !this.width || !this.network) return;
    const ctx = this.context;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#0a1113';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeStyle = 'rgba(126,151,146,.05)';
    ctx.lineWidth = 1;
    for (let x = 20; x < this.width; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke(); }
    for (let y = 20; y < this.height; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke(); }

    this.drawRoad(.02, .5, .98, .5, 22, '#283235');
    this.drawRoad(.5, .02, .5, .98, 15, '#222c2f');
    for (const [id, node] of Object.entries(NODES)) {
      if (id !== 'C') {
        if (node.corridor === 'main') this.drawRoad(node.x, node.y - .07, node.x, node.y + .07, 8, '#1d272a');
        else this.drawRoad(node.x - .07, node.y, node.x + .07, node.y, 8, '#1d272a');
      }
    }
    this.drawLaneMarkings();
    for (const intersection of this.network.intersections.values()) this.drawIntersection(intersection);
    for (const vehicle of this.network.vehicles) vehicle.draw(ctx, this.width, this.height);
  }

  drawRoad(x1, y1, x2, y2, width, color) {
    const ctx = this.context;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(x1 * this.width, y1 * this.height); ctx.lineTo(x2 * this.width, y2 * this.height); ctx.stroke();
  }

  drawLaneMarkings() {
    const ctx = this.context;
    ctx.save();
    ctx.setLineDash([9, 10]);
    ctx.strokeStyle = 'rgba(220,229,226,.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, this.height * .5); ctx.lineTo(this.width, this.height * .5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.width * .5, 0); ctx.lineTo(this.width * .5, this.height); ctx.stroke();
    ctx.restore();
  }

  drawIntersection(intersection) {
    const ctx = this.context;
    const x = intersection.x * this.width;
    const y = intersection.y * this.height;
    const ew = intersection.getState('EW');
    const ns = intersection.getState('NS');
    const color = (state) => ({ GREEN: '#48ce82', YELLOW: '#e4b94d', RED: '#e15d64' })[state];
    ctx.fillStyle = '#303a3d';
    ctx.fillRect(x - 10, y - 10, 20, 20);
    ctx.fillStyle = '#081012';
    ctx.fillRect(x - 17, y - 18, 34, 7);
    ctx.beginPath(); ctx.arc(x - 9, y - 14.5, 3, 0, Math.PI * 2); ctx.fillStyle = color(ew); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 9, y - 14.5, 3, 0, Math.PI * 2); ctx.fillStyle = color(ns); ctx.fill();
    ctx.fillStyle = '#d5dfdd';
    ctx.font = '700 9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(intersection.id, x, y + 4);
    const queue = intersection.queues.NS + intersection.queues.EW;
    if (queue > 0) {
      ctx.fillStyle = '#79d7a1';
      ctx.font = '700 8px ui-monospace, monospace';
      ctx.fillText(`Q${queue}`, x, y + 24);
    }
  }

  emitUpdate() {
    if (!this.statistics || !this.network) return;
    const state = this.statistics.snapshot(this.network.vehicles, this.network.getNetworkState());
    this.onUpdate?.({ ...state, running: this.running, paused: this.paused, strategy: this.strategy, scenario: this.scenarioId, seed: this.seed, speed: this.speedMultiplier });
  }
}
