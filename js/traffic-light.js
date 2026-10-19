import { FixedController, AdaptiveController, SIGNAL_TIMING } from './controllers.js';

export const SignalState = Object.freeze({
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED'
});

export class TrafficLight {
  constructor(mode = 'fixed') {
    this.mode = mode;
    this.controller = this.createController(mode);
    this.reset();
  }

  createController(mode) {
    return mode === 'adaptive' ? new AdaptiveController() : new FixedController();
  }

  setMode(mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    this.controller = this.createController(mode);
    this.reset();
  }

  reset() {
    this.activeAxis = 'NS';
    this.phase = 'GREEN';
    this.phaseElapsed = 0;
  }

  update(deltaTime, queues) {
    this.phaseElapsed += deltaTime;
    if (this.phase === 'YELLOW') {
      if (this.phaseElapsed >= SIGNAL_TIMING.YELLOW) this.completeYellow();
      return;
    }

    if (this.controller.shouldEndGreen({ axis: this.activeAxis, elapsed: this.phaseElapsed, queues })) {
      this.phase = 'YELLOW';
      this.phaseElapsed = 0;
    }
  }

  completeYellow() {
    this.activeAxis = this.activeAxis === 'NS' ? 'EW' : 'NS';
    this.phase = 'GREEN';
    this.phaseElapsed = 0;
  }

  getState(axis) {
    if (axis !== this.activeAxis) return SignalState.RED;
    return this.phase === 'YELLOW' ? SignalState.YELLOW : SignalState.GREEN;
  }

  canProceed(direction) {
    const axis = direction === 'north' || direction === 'south' ? 'NS' : 'EW';
    return this.getState(axis) === SignalState.GREEN;
  }

  getRemaining(queues) {
    return this.controller.getRemaining({
      axis: this.activeAxis,
      elapsed: this.phaseElapsed,
      isYellow: this.phase === 'YELLOW',
      queues
    });
  }
}
