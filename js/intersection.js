import { FixedController, LocalAdaptiveController } from './controllers.js';
import { TrafficLight } from './traffic-light.js';

export class Intersection {
  constructor({ id, x, y, corridor, strategy, corridorController, offset = 0 }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.corridor = corridor;
    this.strategy = strategy;
    this.redWait = { NS: 0, EW: 0 };
    this.queues = { NS: 0, EW: 0 };
    this.downstream = { NS: 0, EW: 0 };
    this.platoons = [];
    const initialAxis = corridor === 'secondary' ? 'NS' : 'EW';
    this.trafficLight = new TrafficLight(this.createController(strategy, corridorController), initialAxis, offset);
  }

  createController(strategy, corridorController) {
    if (strategy === 'coordinated') return corridorController.createIntersectionController(this);
    if (strategy === 'local') return new LocalAdaptiveController();
    const durations = this.id === 'C' ? { EW: 45, NS: 30 } : this.corridor === 'secondary' ? { EW: 20, NS: 40 } : { EW: 40, NS: 20 };
    return new FixedController(durations);
  }

  update(deltaTime, state) {
    this.queues = state.queues;
    this.downstream = state.downstream;
    this.platoons = state.platoons;
    for (const axis of ['NS', 'EW']) {
      const isRed = this.trafficLight.getState(axis) === 'RED';
      this.redWait[axis] = isRed && this.queues[axis] > 0 ? this.redWait[axis] + deltaTime : 0;
    }
    this.trafficLight.update(deltaTime, this.getControllerContext());
  }

  getControllerContext() {
    return { intersection: this, queues: this.queues, redWait: this.redWait, downstream: this.downstream, platoons: this.platoons };
  }

  canProceed(direction) { return this.trafficLight.canProceed(direction); }
  getState(axis) { return this.trafficLight.getState(axis); }
  getRemaining() { return this.trafficLight.getRemaining(this.getControllerContext()); }
}
