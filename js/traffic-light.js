import { SIGNAL_TIMING } from './controllers.js';

export const SignalState = Object.freeze({ GREEN: 'GREEN', YELLOW: 'YELLOW', RED: 'RED' });

export class TrafficLight {
  constructor(controller, initialAxis = 'EW', offset = 0) {
    this.controller = controller;
    this.initialAxis = initialAxis;
    this.offset = offset;
    this.reset();
  }
  reset() { this.activeAxis = this.initialAxis; this.phase = 'GREEN'; this.phaseElapsed = this.offset; }
  setController(controller) { this.controller = controller; this.reset(); }
  update(deltaTime, context) {
    this.phaseElapsed += deltaTime;
    if (this.phase === 'YELLOW') {
      if (this.phaseElapsed >= SIGNAL_TIMING.YELLOW) {
        this.activeAxis = this.activeAxis === 'NS' ? 'EW' : 'NS';
        this.phase = 'GREEN';
        this.phaseElapsed = 0;
      }
      return;
    }
    if (this.controller.shouldEndGreen({ ...context, axis: this.activeAxis, elapsed: this.phaseElapsed })) {
      this.phase = 'YELLOW';
      this.phaseElapsed = 0;
    }
  }
  getState(axis) {
    if (axis !== this.activeAxis) return SignalState.RED;
    return this.phase === 'YELLOW' ? SignalState.YELLOW : SignalState.GREEN;
  }
  canProceed(direction) {
    const axis = direction === 'north' || direction === 'south' ? 'NS' : 'EW';
    return this.getState(axis) === SignalState.GREEN;
  }
  getRemaining(context) {
    if (this.phase === 'YELLOW') return Math.max(0, SIGNAL_TIMING.YELLOW - this.phaseElapsed);
    return Math.max(0, this.controller.getTargetDuration({ ...context, axis: this.activeAxis }) - this.phaseElapsed);
  }
}
