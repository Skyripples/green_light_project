import { Vehicle } from './vehicle.js';
import { TrafficLight } from './traffic-light.js';
import { Statistics } from './statistics.js';

const DIRECTIONS = ['north', 'south', 'east', 'west'];
const FLOW_RANGES = {
  low: [4, 8],
  medium: [2, 5],
  high: [1, 3]
};

export class Simulation {
  constructor(canvas, onUpdate) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.onUpdate = onUpdate;
    this.mode = 'fixed';
    this.flow = 'medium';
    this.speedMultiplier = 1;
    this.trafficLight = new TrafficLight(this.mode);
    this.statistics = new Statistics();
    this.vehicles = [];
    this.nextVehicleId = 1;
    this.spawnAt = {};
    this.running = false;
    this.paused = false;
    this.lastTimestamp = null;
    this.animationFrame = null;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas.parentElement);
    this.resize();
    this.resetSpawnSchedule();
    this.draw();
    this.emitUpdate();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, Math.round(rect.width));
    const height = Math.max(320, Math.round(rect.height));
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = width;
    this.height = height;
    this.geometry = this.getGeometry();
    this.repositionVehiclesAfterResize();
    this.draw();
  }

  getGeometry() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const roadWidth = Math.max(112, Math.min(this.width, this.height) * 0.28);
    const laneOffset = roadWidth * 0.22;
    const halfRoad = roadWidth / 2;
    return {
      cx, cy, roadWidth, laneOffset,
      intersection: { left: cx - halfRoad, right: cx + halfRoad, top: cy - halfRoad, bottom: cy + halfRoad },
      stops: {
        north: cy + halfRoad + 8,
        south: cy - halfRoad - 8,
        east: cx - halfRoad - 8,
        west: cx + halfRoad + 8
      }
    };
  }

  repositionVehiclesAfterResize() {
    if (!this.geometry || !this.vehicles.length) return;
    const { cx, cy, laneOffset } = this.geometry;
    for (const vehicle of this.vehicles) {
      if (vehicle.direction === 'north') vehicle.x = cx - laneOffset;
      if (vehicle.direction === 'south') vehicle.x = cx + laneOffset;
      if (vehicle.direction === 'east') vehicle.y = cy + laneOffset;
      if (vehicle.direction === 'west') vehicle.y = cy - laneOffset;
    }
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
    this.vehicles = [];
    this.nextVehicleId = 1;
    this.trafficLight = new TrafficLight(this.mode);
    this.statistics.reset();
    this.resetSpawnSchedule();
    this.draw();
    this.emitUpdate();
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
  }

  setFlow(flow) {
    this.flow = flow;
    this.resetSpawnSchedule();
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Number(multiplier);
  }

  loop(timestamp) {
    if (!this.running || this.paused) return;
    if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
    const realDelta = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;
    const simulationDelta = realDelta * this.speedMultiplier;

    // Small fixed substeps keep collision and stop-line behavior reliable at 4x.
    let remaining = simulationDelta;
    while (remaining > 0) {
      const step = Math.min(remaining, 1 / 60);
      this.update(step);
      remaining -= step;
    }

    this.draw();
    this.emitUpdate();
    this.animationFrame = requestAnimationFrame((nextTimestamp) => this.loop(nextTimestamp));
  }

  update(deltaTime) {
    const queues = this.getQueues();
    this.trafficLight.update(deltaTime, queues);
    this.spawnVehicles();

    for (const direction of DIRECTIONS) {
      const lane = this.vehicles
        .filter((vehicle) => vehicle.direction === direction)
        .sort((a, b) => b.progression - a.progression);
      lane.forEach((vehicle, index) => {
        vehicle.update(
          deltaTime,
          this.trafficLight.canProceed(direction),
          this.geometry.stops[direction],
          index === 0 ? null : lane[index - 1],
          this.geometry.intersection
        );
      });
    }

    const remainingVehicles = [];
    for (const vehicle of this.vehicles) {
      if (vehicle.isOutside(this.width, this.height)) this.statistics.recordPassed(vehicle);
      else remainingVehicles.push(vehicle);
    }
    this.vehicles = remainingVehicles;
    this.statistics.update(deltaTime, this.vehicles, this.getQueues());
  }

  resetSpawnSchedule() {
    const now = this.statistics?.elapsedTime || 0;
    for (const direction of DIRECTIONS) this.spawnAt[direction] = now + this.randomSpawnDelay(direction) * 0.35;
  }

  randomSpawnDelay(direction) {
    let profile = this.flow;
    if (profile === 'unbalanced') profile = direction === 'north' || direction === 'south' ? 'high' : 'low';
    const [min, max] = FLOW_RANGES[profile] || FLOW_RANGES.medium;
    return min + Math.random() * (max - min);
  }

  spawnVehicles() {
    for (const direction of DIRECTIONS) {
      if (this.statistics.elapsedTime < this.spawnAt[direction]) continue;
      if (this.canSpawn(direction)) {
        this.vehicles.push(this.createVehicle(direction));
        this.statistics.recordGenerated();
        this.spawnAt[direction] = this.statistics.elapsedTime + this.randomSpawnDelay(direction);
      } else {
        this.spawnAt[direction] = this.statistics.elapsedTime + 0.5;
      }
    }
  }

  createVehicle(direction) {
    const { cx, cy, laneOffset } = this.geometry;
    const positions = {
      north: { x: cx - laneOffset, y: this.height + 28 },
      south: { x: cx + laneOffset, y: -28 },
      east: { x: -28, y: cy + laneOffset },
      west: { x: this.width + 28, y: cy - laneOffset }
    };
    return new Vehicle({
      id: this.nextVehicleId++,
      direction,
      ...positions[direction],
      spawnTime: this.statistics.elapsedTime
    });
  }

  canSpawn(direction) {
    const start = this.createVehicle(direction);
    return !this.vehicles.some((vehicle) => vehicle.direction === direction && Math.abs(vehicle.progression - start.progression) < 48);
  }

  getQueues() {
    const queues = { NS: 0, EW: 0 };
    for (const vehicle of this.vehicles) {
      if (vehicle.hasCrossed || !vehicle.isBeforeStopLine(this.geometry.stops[vehicle.direction])) continue;
      const nearApproach = vehicle.distanceToStopLine(this.geometry.stops[vehicle.direction]) < 220;
      if (nearApproach && (vehicle.isStopped || vehicle.speed < vehicle.maxSpeed * 0.35)) queues[vehicle.axis] += 1;
    }
    return queues;
  }

  draw() {
    if (!this.width || !this.height || !this.geometry) return;
    const context = this.context;
    const { cx, cy, roadWidth, laneOffset, intersection, stops } = this.geometry;
    context.clearRect(0, 0, this.width, this.height);
    context.fillStyle = '#0b1213';
    context.fillRect(0, 0, this.width, this.height);

    // Subtle city grid outside the roadway.
    context.strokeStyle = 'rgba(126, 151, 146, .055)';
    context.lineWidth = 1;
    for (let x = 18; x < this.width; x += 36) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, this.height); context.stroke(); }
    for (let y = 18; y < this.height; y += 36) { context.beginPath(); context.moveTo(0, y); context.lineTo(this.width, y); context.stroke(); }

    context.fillStyle = '#20282b';
    context.fillRect(cx - roadWidth / 2, 0, roadWidth, this.height);
    context.fillRect(0, cy - roadWidth / 2, this.width, roadWidth);
    context.fillStyle = '#242d30';
    context.fillRect(intersection.left, intersection.top, roadWidth, roadWidth);

    context.save();
    context.setLineDash([12, 12]);
    context.strokeStyle = 'rgba(214, 222, 219, .22)';
    context.lineWidth = 1;
    context.beginPath(); context.moveTo(cx, 0); context.lineTo(cx, intersection.top); context.stroke();
    context.beginPath(); context.moveTo(cx, intersection.bottom); context.lineTo(cx, this.height); context.stroke();
    context.beginPath(); context.moveTo(0, cy); context.lineTo(intersection.left, cy); context.stroke();
    context.beginPath(); context.moveTo(intersection.right, cy); context.lineTo(this.width, cy); context.stroke();
    context.restore();

    context.strokeStyle = 'rgba(231, 236, 234, .75)';
    context.lineWidth = 2;
    this.drawStopLine('north', cx - laneOffset, stops.north, roadWidth * .35);
    this.drawStopLine('south', cx + laneOffset, stops.south, roadWidth * .35);
    this.drawStopLine('east', stops.east, cy + laneOffset, roadWidth * .35);
    this.drawStopLine('west', stops.west, cy - laneOffset, roadWidth * .35);

    this.drawTrafficLights();
    for (const vehicle of this.vehicles) vehicle.draw(context);
  }

  drawStopLine(direction, x, y, length) {
    const context = this.context;
    context.beginPath();
    if (direction === 'north' || direction === 'south') { context.moveTo(x - length / 2, y); context.lineTo(x + length / 2, y); }
    else { context.moveTo(x, y - length / 2); context.lineTo(x, y + length / 2); }
    context.stroke();
  }

  drawTrafficLights() {
    const { intersection } = this.geometry;
    const inset = 17;
    this.drawSignal(intersection.left - inset, intersection.bottom + inset, this.trafficLight.getState('NS'));
    this.drawSignal(intersection.right + inset, intersection.top - inset, this.trafficLight.getState('NS'));
    this.drawSignal(intersection.left - inset, intersection.top - inset, this.trafficLight.getState('EW'));
    this.drawSignal(intersection.right + inset, intersection.bottom + inset, this.trafficLight.getState('EW'));
  }

  drawSignal(x, y, state) {
    const colors = { RED: '#e15d64', YELLOW: '#e4b94d', GREEN: '#48ce82' };
    const context = this.context;
    context.beginPath();
    context.arc(x, y, 7, 0, Math.PI * 2);
    context.fillStyle = '#080c0d';
    context.fill();
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fillStyle = colors[state];
    context.shadowColor = colors[state];
    context.shadowBlur = 9;
    context.fill();
    context.shadowBlur = 0;
  }

  emitUpdate() {
    const queues = this.getQueues();
    this.onUpdate?.({
      ...this.statistics.snapshot(),
      nsState: this.trafficLight.getState('NS'),
      ewState: this.trafficLight.getState('EW'),
      phaseRemaining: this.trafficLight.getRemaining(queues),
      running: this.running,
      paused: this.paused,
      mode: this.mode,
      flow: this.flow,
      speed: this.speedMultiplier
    });
  }
}
