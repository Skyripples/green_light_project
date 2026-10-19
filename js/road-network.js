import { Intersection } from './intersection.js';
import { CorridorController } from './corridor-controller.js';
import { Vehicle } from './vehicle.js';

export const ROAD_DISTANCES = Object.freeze({
  'W2-W1': 350, 'W1-C': 450, 'C-E1': 400, 'E1-E2': 350,
  'N2-N1': 300, 'N1-C': 400, 'C-S1': 400, 'S1-S2': 300
});

const NODES = {
  W2: { x: .09, y: .5, corridor: 'main' }, W1: { x: .295, y: .5, corridor: 'main' },
  C: { x: .5, y: .5, corridor: 'center' }, E1: { x: .705, y: .5, corridor: 'main' }, E2: { x: .91, y: .5, corridor: 'main' },
  N2: { x: .5, y: .09, corridor: 'secondary' }, N1: { x: .5, y: .295, corridor: 'secondary' },
  S1: { x: .5, y: .705, corridor: 'secondary' }, S2: { x: .5, y: .91, corridor: 'secondary' }
};

const MAIN_ORDER = ['W2', 'W1', 'C', 'E1', 'E2'];
const SECONDARY_ORDER = ['N2', 'N1', 'C', 'S1', 'S2'];

export class RoadNetwork {
  constructor({ strategy, random, statistics }) {
    this.strategy = strategy;
    this.random = random;
    this.statistics = statistics;
    this.corridorController = new CorridorController();
    this.intersections = new Map();
    this.vehicles = [];
    this.nextVehicleId = 1;
    this.time = 0;
    this.platoons = [];
    this.segmentOccupancy = new Map();
    this.congestedSegments = new Set();
    this.routes = new Map();
    this.sources = [];
    this.createIntersections();
    this.createRoutes();
  }

  createIntersections() {
    Object.entries(NODES).forEach(([id, node], index) => {
      this.intersections.set(id, new Intersection({ ...node, id, strategy: this.strategy, corridorController: this.corridorController, offset: 0, index }));
    });
  }

  buildCorridorRoute(key, direction, order, laneOffset, distances, routeType) {
    const ids = direction === 'east' || direction === 'south' ? order : [...order].reverse();
    const horizontal = direction === 'east' || direction === 'west';
    const first = NODES[ids[0]];
    const last = NODES[ids[ids.length - 1]];
    const entry = horizontal
      ? { x: direction === 'east' ? -.035 : 1.035, y: .5 + laneOffset }
      : { x: .5 + laneOffset, y: direction === 'south' ? -.035 : 1.035 };
    const exit = horizontal
      ? { x: direction === 'east' ? 1.035 : -.035, y: .5 + laneOffset }
      : { x: .5 + laneOffset, y: direction === 'south' ? 1.035 : -.035 };
    const path = [{ ...entry, distance: 0 }];
    const nodeDistances = [];
    const segmentKeys = [];
    let cumulative = 0;
    ids.forEach((id, index) => {
      const node = NODES[id];
      const distance = index === 0 ? 180 : distances[index - 1];
      cumulative += distance;
      path.push({ x: horizontal ? node.x : .5 + laneOffset, y: horizontal ? .5 + laneOffset : node.y, distance });
      nodeDistances.push(cumulative);
      segmentKeys.push(index === 0 ? `entry-${key}>${id}` : `${ids[index - 1]}>${id}:${direction}`);
    });
    cumulative += 180;
    path.push({ ...exit, distance: 180 });
    segmentKeys.push(`${last === first ? key : ids[ids.length - 1]}>exit-${key}`);
    const route = { key, direction, intersections: ids, path, nodeDistances, segmentKeys, totalDistance: cumulative, routeType };
    this.routes.set(key, route);
    segmentKeys.forEach((segment, index) => {
      const length = index === 0 || index === segmentKeys.length - 1 ? 180 : distances[index - 1];
      this.segmentOccupancy.set(segment, { count: 0, capacity: Math.max(5, Math.floor(length / 24)) });
    });
    ids.forEach((id, index) => { this.routes.set(`out:${id}:${direction}`, segmentKeys[index + 1] || segmentKeys[index]); });
    this.sources.push({ key, group: direction });
  }

  buildLocalRoute(intersectionId, direction) {
    const node = NODES[intersectionId];
    const horizontal = direction === 'east' || direction === 'west';
    const lane = direction === 'east' || direction === 'south' ? .012 : -.012;
    const span = .075;
    const start = horizontal
      ? { x: node.x + (direction === 'east' ? -span : span), y: node.y + lane }
      : { x: node.x + lane, y: node.y + (direction === 'south' ? -span : span) };
    const end = horizontal
      ? { x: node.x + (direction === 'east' ? span : -span), y: node.y + lane }
      : { x: node.x + lane, y: node.y + (direction === 'south' ? span : -span) };
    const key = `local-${intersectionId}-${direction}`;
    const route = {
      key, direction, intersections: [intersectionId], routeType: horizontal ? 'main' : 'secondary',
      path: [{ ...start, distance: 0 }, { x: horizontal ? node.x : node.x + lane, y: horizontal ? node.y + lane : node.y, distance: 90 }, { ...end, distance: 90 }],
      nodeDistances: [90], segmentKeys: [`entry-${key}`, `exit-${key}`], totalDistance: 180
    };
    this.routes.set(key, route);
    route.segmentKeys.forEach((segment) => this.segmentOccupancy.set(segment, { count: 0, capacity: 5 }));
    this.routes.set(`out:${intersectionId}:${direction}`, route.segmentKeys[1]);
    this.sources.push({ key, group: node.corridor === 'main' ? 'localMain' : 'localSecondary' });
  }

  createRoutes() {
    const mainDistances = [350, 450, 400, 350];
    const secondaryDistances = [300, 400, 400, 300];
    this.buildCorridorRoute('corridor-east', 'east', MAIN_ORDER, -.012, mainDistances, 'main');
    this.buildCorridorRoute('corridor-west', 'west', MAIN_ORDER, .012, mainDistances, 'main');
    this.buildCorridorRoute('corridor-south', 'south', SECONDARY_ORDER, .012, secondaryDistances, 'secondary');
    this.buildCorridorRoute('corridor-north', 'north', SECONDARY_ORDER, -.012, secondaryDistances, 'secondary');
    ['W2', 'W1', 'E1', 'E2'].forEach((id) => { this.buildLocalRoute(id, 'north'); this.buildLocalRoute(id, 'south'); });
    ['N2', 'N1', 'S1', 'S2'].forEach((id) => { this.buildLocalRoute(id, 'east'); this.buildLocalRoute(id, 'west'); });
  }

  getIntersection(id) { return this.intersections.get(id); }

  spawn(sourceKey) {
    const route = this.routes.get(sourceKey);
    if (!route || this.vehicles.some((vehicle) => vehicle.routeKey === sourceKey && vehicle.distance < 24)) return false;
    this.vehicles.push(new Vehicle({ id: this.nextVehicleId++, direction: route.direction, routeSpec: route, spawnTime: this.time }));
    this.statistics.recordGenerated();
    return true;
  }

  update(deltaTime) {
    this.time += deltaTime;
    this.updateSegmentOccupancy();
    const states = this.getIntersectionStates();
    for (const [id, intersection] of this.intersections) intersection.update(deltaTime, states.get(id));

    const lanes = new Map();
    for (const vehicle of this.vehicles) {
      if (!lanes.has(vehicle.routeKey)) lanes.set(vehicle.routeKey, []);
      lanes.get(vehicle.routeKey).push(vehicle);
    }
    for (const lane of lanes.values()) {
      lane.sort((a, b) => b.distance - a.distance);
      lane.forEach((vehicle, index) => vehicle.update(deltaTime, this, lane[index - 1] || null));
    }
    const active = [];
    for (const vehicle of this.vehicles) {
      if (vehicle.completed) this.statistics.recordCompleted(vehicle);
      else active.push(vehicle);
    }
    this.vehicles = active;
    this.platoons = this.platoons.filter((item) => item.estimatedArrivalTime >= this.time - 12);
  }

  updateSegmentOccupancy() {
    for (const state of this.segmentOccupancy.values()) state.count = 0;
    for (const vehicle of this.vehicles) {
      const state = this.segmentOccupancy.get(vehicle.currentRoad);
      if (state) state.count += 1;
    }
    for (const [key, state] of this.segmentOccupancy) {
      const congested = state.count / state.capacity >= .8;
      if (congested && !this.congestedSegments.has(key)) { this.congestedSegments.add(key); this.statistics.recordSpillback(); }
      if (!congested) this.congestedSegments.delete(key);
    }
  }

  getIntersectionStates() {
    const states = new Map();
    for (const id of this.intersections.keys()) states.set(id, { queues: { NS: 0, EW: 0 }, downstream: { NS: 0, EW: 0 }, platoons: this.getApproachingPlatoons(id) });
    for (const vehicle of this.vehicles) {
      if (!vehicle.nextIntersection || vehicle.distanceToSignal > 120) continue;
      states.get(vehicle.nextIntersection).queues[vehicle.axis] += 1;
    }
    for (const [id, state] of states) {
      state.downstream.NS = Math.max(this.getDownstreamOccupancy(id, 'north'), this.getDownstreamOccupancy(id, 'south'));
      state.downstream.EW = Math.max(this.getDownstreamOccupancy(id, 'east'), this.getDownstreamOccupancy(id, 'west'));
    }
    return states;
  }

  getDownstreamOccupancy(id, direction) {
    const key = this.routes.get(`out:${id}:${direction}`);
    const state = this.segmentOccupancy.get(key);
    return state ? state.count / state.capacity : 0;
  }

  recordIntersectionPass(vehicle, intersectionId) {
    const nextId = vehicle.route[vehicle.routeIndex + 1];
    if (!nextId || vehicle.route.length < 2) return;
    const distance = vehicle.nodeDistances[vehicle.routeIndex + 1] - vehicle.nodeDistances[vehicle.routeIndex];
    const arrival = this.time + distance / Math.max(10, vehicle.maxSpeed * .85);
    const recent = this.platoons.find((item) => item.direction === vehicle.direction && item.originIntersection === intersectionId && this.time - item.releaseTime <= 3);
    if (recent) { recent.vehicleCount += 1; recent.estimatedArrivalTime = arrival; recent.nextIntersection = nextId; }
    else this.platoons.push({ direction: vehicle.direction, axis: vehicle.axis, vehicleCount: 1, originIntersection: intersectionId, releaseTime: this.time, estimatedArrivalTime: arrival, nextIntersection: nextId });
  }

  getApproachingPlatoons(intersectionId) {
    return this.platoons.filter((item) => item.nextIntersection === intersectionId && item.vehicleCount >= 2)
      .map((item) => ({ ...item, eta: item.estimatedArrivalTime - this.time }));
  }

  getNetworkState() {
    let mainQueue = 0; let secondaryQueue = 0;
    for (const intersection of this.intersections.values()) { mainQueue += intersection.queues.EW; secondaryQueue += intersection.queues.NS; }
    return { mainQueue, secondaryQueue, platoons: this.platoons.filter((item) => item.vehicleCount >= 2).length, congestedSegments: this.congestedSegments.size };
  }
}

export { NODES, MAIN_ORDER, SECONDARY_ORDER };
