export class Statistics {
  constructor() { this.reset(); }
  reset() {
    this.elapsedTime = 0;
    this.generated = 0;
    this.completed = 0;
    this.totalTravelTime = 0;
    this.totalWaitingTime = 0;
    this.totalStops = 0;
    this.maximumWaitingTime = 0;
    this.totalIdleTime = 0;
    this.mainCompleted = 0;
    this.mainDelayTotal = 0;
    this.secondaryCompleted = 0;
    this.secondaryDelayTotal = 0;
    this.spillbackEvents = 0;
    this.greenWaveEligible = 0;
    this.greenWaveSuccesses = 0;
  }
  recordGenerated() { this.generated += 1; }
  recordSpillback() { this.spillbackEvents += 1; }
  recordCompleted(vehicle) {
    this.completed += 1;
    this.totalTravelTime += vehicle.travelTime;
    this.totalWaitingTime += vehicle.totalWaitingTime;
    this.totalStops += vehicle.stopCount;
    this.maximumWaitingTime = Math.max(this.maximumWaitingTime, vehicle.totalWaitingTime);
    if (vehicle.routeType === 'main') {
      this.mainCompleted += 1;
      this.mainDelayTotal += vehicle.totalWaitingTime;
      if (vehicle.route.length > 2) { this.greenWaveEligible += 1; if (vehicle.greenWaveSuccess) this.greenWaveSuccesses += 1; }
    } else {
      this.secondaryCompleted += 1;
      this.secondaryDelayTotal += vehicle.totalWaitingTime;
    }
  }
  update(deltaTime, vehicles) {
    this.elapsedTime += deltaTime;
    const waiting = vehicles.filter((vehicle) => vehicle.isStopped);
    this.totalIdleTime += waiting.length * deltaTime;
    for (const vehicle of vehicles) this.maximumWaitingTime = Math.max(this.maximumWaitingTime, vehicle.totalWaitingTime);
  }
  snapshot(vehicles, networkState) {
    const activeWaiting = vehicles.reduce((sum, vehicle) => sum + vehicle.totalWaitingTime, 0);
    const population = this.completed + vehicles.length;
    return {
      elapsedTime: this.elapsedTime,
      generated: this.generated,
      activeVehicles: vehicles.length,
      completedVehicles: this.completed,
      averageTravelTime: this.completed ? this.totalTravelTime / this.completed : 0,
      averageWaitingTime: population ? (this.totalWaitingTime + activeWaiting) / population : 0,
      averageStops: this.completed ? this.totalStops / this.completed : 0,
      maximumWaitingTime: this.maximumWaitingTime,
      totalIdleTime: this.totalIdleTime,
      throughput: this.elapsedTime ? this.completed / (this.elapsedTime / 60) : 0,
      mainRoadDelay: this.mainCompleted ? this.mainDelayTotal / this.mainCompleted : 0,
      secondaryRoadDelay: this.secondaryCompleted ? this.secondaryDelayTotal / this.secondaryCompleted : 0,
      spillbackEvents: this.spillbackEvents,
      greenWaveSuccessRate: this.greenWaveEligible ? this.greenWaveSuccesses / this.greenWaveEligible * 100 : 0,
      ...networkState
    };
  }
}
