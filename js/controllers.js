export const SIGNAL_TIMING = Object.freeze({
  MIN_GREEN: 10,
  BASE_GREEN: 30,
  MAX_GREEN: 60,
  YELLOW: 3
});

export class FixedController {
  shouldEndGreen({ elapsed }) {
    return elapsed >= SIGNAL_TIMING.BASE_GREEN;
  }

  getRemaining({ elapsed, isYellow }) {
    const duration = isYellow ? SIGNAL_TIMING.YELLOW : SIGNAL_TIMING.BASE_GREEN;
    return Math.max(0, duration - elapsed);
  }
}

export class AdaptiveController {
  shouldEndGreen({ axis, elapsed, queues }) {
    if (elapsed < SIGNAL_TIMING.MIN_GREEN) return false;
    if (elapsed >= SIGNAL_TIMING.MAX_GREEN) return true;

    const currentQueue = axis === 'NS' ? queues.NS : queues.EW;
    const opposingQueue = axis === 'NS' ? queues.EW : queues.NS;

    // Release demand on the opposing road as soon as the minimum green is met.
    if (currentQueue === 0 && opposingQueue > 0) return true;

    // Switch early when the opposing queue is clearly more urgent.
    if (opposingQueue >= currentQueue + 3) return true;

    // Before the base duration, keep serving the current approach.
    if (elapsed < SIGNAL_TIMING.BASE_GREEN) return false;

    // Beyond the base duration, extend only while this approach has more demand.
    if (currentQueue > opposingQueue + 2) return false;
    return true;
  }

  getRemaining({ axis, elapsed, isYellow, queues }) {
    if (isYellow) return Math.max(0, SIGNAL_TIMING.YELLOW - elapsed);
    const currentQueue = axis === 'NS' ? queues.NS : queues.EW;
    const opposingQueue = axis === 'NS' ? queues.EW : queues.NS;
    const target = currentQueue > opposingQueue + 2 ? SIGNAL_TIMING.MAX_GREEN : SIGNAL_TIMING.BASE_GREEN;
    return Math.max(0, target - elapsed);
  }
}
