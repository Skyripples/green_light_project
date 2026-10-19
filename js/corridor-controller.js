import { SIGNAL_TIMING } from './controllers.js';

export const COORDINATION = Object.freeze({ MAIN_PRIORITY: 1.5, SECONDARY_PRIORITY: 1, PLATOON_ETA: 10, DOWNSTREAM_LIMIT: 0.8 });

export class CorridorController {
  createIntersectionController() {
    return { shouldEndGreen: (context) => this.shouldEndGreen(context), getTargetDuration: (context) => this.getTargetDuration(context) };
  }
  score(axis, context) {
    const weight = axis === 'EW' ? COORDINATION.MAIN_PRIORITY : COORDINATION.SECONDARY_PRIORITY;
    const platoon = context.platoons.filter((item) => item.axis === axis && item.eta <= COORDINATION.PLATOON_ETA).reduce((sum, item) => sum + item.vehicleCount, 0);
    const starvation = context.redWait[axis] >= SIGNAL_TIMING.MAX_RED_WAIT ? 20 : 0;
    const penalty = context.downstream[axis] >= COORDINATION.DOWNSTREAM_LIMIT ? 0.25 : 1;
    return (context.queues[axis] * weight + platoon * 1.25 + starvation) * penalty;
  }
  shouldEndGreen(context) {
    const { axis, elapsed, queues, redWait, downstream } = context;
    if (elapsed < SIGNAL_TIMING.MIN_GREEN) return false;
    if (elapsed >= SIGNAL_TIMING.MAX_GREEN) return true;
    const otherAxis = axis === 'NS' ? 'EW' : 'NS';
    if (redWait[otherAxis] >= SIGNAL_TIMING.MAX_RED_WAIT && queues[otherAxis] > 0) return true;
    if (queues[axis] === 0 && queues[otherAxis] > 0) return true;
    if (downstream[axis] >= COORDINATION.DOWNSTREAM_LIMIT && queues[otherAxis] > 0) return true;
    const currentScore = this.score(axis, context);
    const otherScore = this.score(otherAxis, context);
    if (elapsed < SIGNAL_TIMING.BASE_GREEN) return otherScore > currentScore * 1.6;
    const arriving = context.platoons.some((item) => item.axis === axis && item.eta <= COORDINATION.PLATOON_ETA);
    if (arriving && downstream[axis] < COORDINATION.DOWNSTREAM_LIMIT) return false;
    return currentScore <= otherScore * 1.15;
  }
  getTargetDuration(context) {
    const otherAxis = context.axis === 'NS' ? 'EW' : 'NS';
    const arriving = context.platoons.some((item) => item.axis === context.axis && item.eta <= COORDINATION.PLATOON_ETA);
    return arriving || this.score(context.axis, context) > this.score(otherAxis, context) * 1.2 ? SIGNAL_TIMING.MAX_GREEN : SIGNAL_TIMING.BASE_GREEN;
  }
}
