export class Statistics {
  constructor() {
    this.reset();
  }

  reset() {
    this.elapsedTime = 0;
    this.vehiclesGenerated = 0;
    this.vehiclesPassed = 0;
    this.totalIdleTime = 0;
    this.maximumWaitingTime = 0;
    this.totalCompletedWait = 0;
    this.currentlyWaiting = 0;
    this.nsQueue = 0;
    this.ewQueue = 0;
  }

  update(deltaTime, vehicles, queues) {
    this.elapsedTime += deltaTime;
    const waiting = vehicles.filter((vehicle) => vehicle.isStopped && !vehicle.hasCrossed);
    this.currentlyWaiting = waiting.length;
    this.nsQueue = queues.NS;
    this.ewQueue = queues.EW;
    this.totalIdleTime += waiting.length * deltaTime;
    for (const vehicle of vehicles) this.maximumWaitingTime = Math.max(this.maximumWaitingTime, vehicle.waitingTime);
  }

  recordGenerated() {
    this.vehiclesGenerated += 1;
  }

  recordPassed(vehicle) {
    this.vehiclesPassed += 1;
    this.totalCompletedWait += vehicle.waitingTime;
    this.maximumWaitingTime = Math.max(this.maximumWaitingTime, vehicle.waitingTime);
  }

  get averageWaitingTime() {
    return this.vehiclesPassed ? this.totalCompletedWait / this.vehiclesPassed : 0;
  }

  snapshot() {
    return {
      elapsedTime: this.elapsedTime,
      vehiclesGenerated: this.vehiclesGenerated,
      vehiclesPassed: this.vehiclesPassed,
      currentlyWaiting: this.currentlyWaiting,
      averageWaitingTime: this.averageWaitingTime,
      maximumWaitingTime: this.maximumWaitingTime,
      totalIdleTime: this.totalIdleTime,
      nsQueue: this.nsQueue,
      ewQueue: this.ewQueue
    };
  }
}
