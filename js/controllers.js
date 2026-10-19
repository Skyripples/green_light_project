export const SIGNAL_TIMING = Object.freeze({ MIN_GREEN: 10, BASE_GREEN: 30, MAX_GREEN: 60, YELLOW: 3, MAX_RED_WAIT: 60 });

export class FixedController {
  constructor(durations = { NS: 20, EW: 40 }) { this.durations = durations; }
  shouldEndGreen({ axis, elapsed }) { return elapsed >= this.durations[axis]; }
  getTargetDuration({ axis }) { return this.durations[axis]; }
}

export class LocalAdaptiveController {
  shouldEndGreen({ axis, elapsed, queues, redWait }) {
    if (elapsed < SIGNAL_TIMING.MIN_GREEN) return false;
    if (elapsed >= SIGNAL_TIMING.MAX_GREEN) return true;
    const otherAxis = axis === 'NS' ? 'EW' : 'NS';
    const currentQueue = queues[axis];
    const otherQueue = queues[otherAxis];
    if (redWait[otherAxis] >= SIGNAL_TIMING.MAX_RED_WAIT && otherQueue > 0) return true;
    if (currentQueue === 0 && otherQueue > 0) return true;
    if (otherQueue >= currentQueue + 3) return true;
    if (elapsed < SIGNAL_TIMING.BASE_GREEN) return false;
    return currentQueue <= otherQueue + 2;
  }
  getTargetDuration({ axis, queues }) {
    const otherAxis = axis === 'NS' ? 'EW' : 'NS';
    return queues[axis] > queues[otherAxis] + 2 ? SIGNAL_TIMING.MAX_GREEN : SIGNAL_TIMING.BASE_GREEN;
  }
}
