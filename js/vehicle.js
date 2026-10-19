const COLORS = { east: '#9bb69f', west: '#83a9b0', north: '#aaa087', south: '#9b95ac' };

export class Vehicle {
  constructor({ id, direction, routeSpec, spawnTime }) {
    this.id = id;
    this.direction = direction;
    this.axis = direction === 'north' || direction === 'south' ? 'NS' : 'EW';
    this.route = routeSpec.intersections;
    this.routeType = routeSpec.routeType;
    this.routeKey = routeSpec.key;
    this.routeIndex = 0;
    this.path = routeSpec.path;
    this.nodeDistances = routeSpec.nodeDistances;
    this.segmentKeys = routeSpec.segmentKeys;
    this.totalDistance = routeSpec.totalDistance;
    this.distance = 0;
    this.x = this.path[0].x;
    this.y = this.path[0].y;
    this.currentRoad = this.segmentKeys[0];
    this.nextIntersection = this.route[0] || null;
    this.speed = 0;
    this.maxSpeed = this.routeType === 'main' ? 17 : 14;
    this.travelTime = 0;
    this.totalWaitingTime = 0;
    this.waitingTime = 0;
    this.stopCount = 0;
    this.spawnTime = spawnTime;
    this.isStopped = false;
    this.completed = false;
    this.length = 4.5;
    this.stoppedSinceLastIntersection = false;
    this.corridorPassStreak = 0;
    this.greenWaveSuccess = false;
  }

  get nextNodeDistance() { return this.nodeDistances[this.routeIndex] ?? Infinity; }
  get distanceToSignal() { return Math.max(0, this.nextNodeDistance - 7 - this.distance); }

  update(deltaTime, network, leader) {
    this.travelTime += deltaTime;
    const intersection = this.nextIntersection ? network.getIntersection(this.nextIntersection) : null;
    const signalBlocked = intersection && !intersection.canProceed(this.direction) && this.distance < this.nextNodeDistance;
    const brakingDistance = (this.speed * this.speed) / 8 + 4;
    const leaderGap = leader ? leader.distance - this.distance - leader.length : Infinity;
    const vehicleBlocked = leaderGap < 9 + this.speed * 0.65;
    const downstreamFull = intersection && network.getDownstreamOccupancy(intersection.id, this.direction) >= 0.95;
    const mustBrake = (signalBlocked && this.distanceToSignal <= brakingDistance) || vehicleBlocked || downstreamFull;

    this.speed = mustBrake ? Math.max(0, this.speed - 7 * deltaTime) : Math.min(this.maxSpeed, this.speed + 3 * deltaTime);
    let movement = this.speed * deltaTime;
    if (signalBlocked && movement > this.distanceToSignal) { movement = this.distanceToSignal; this.speed = 0; }
    if (vehicleBlocked && movement > Math.max(0, leaderGap - 8)) { movement = Math.max(0, leaderGap - 8); this.speed = 0; }
    this.distance += movement;

    const wasStopped = this.isStopped;
    this.isStopped = this.speed < 0.35 && mustBrake;
    if (this.isStopped) {
      this.totalWaitingTime += deltaTime;
      this.waitingTime = this.totalWaitingTime;
      this.stoppedSinceLastIntersection = true;
      if (!wasStopped) this.stopCount += 1;
    }

    while (this.routeIndex < this.route.length && this.distance >= this.nodeDistances[this.routeIndex] + 5) {
      const passedId = this.route[this.routeIndex];
      network.recordIntersectionPass(this, passedId);
      if (this.routeType === 'main') {
        this.corridorPassStreak = this.stoppedSinceLastIntersection ? 1 : this.corridorPassStreak + 1;
        if (this.corridorPassStreak >= 3) this.greenWaveSuccess = true;
      }
      this.stoppedSinceLastIntersection = false;
      this.routeIndex += 1;
      this.nextIntersection = this.route[this.routeIndex] || null;
    }
    const segmentIndex = Math.min(this.segmentKeys.length - 1, this.routeIndex);
    this.currentRoad = this.segmentKeys[segmentIndex];
    const point = this.getWorldPosition();
    this.x = point.x;
    this.y = point.y;
    if (this.distance >= this.totalDistance) this.completed = true;
  }

  getWorldPosition() {
    let remaining = this.distance;
    for (let index = 0; index < this.path.length - 1; index += 1) {
      const from = this.path[index];
      const to = this.path[index + 1];
      const length = to.distance;
      if (remaining <= length || index === this.path.length - 2) {
        const ratio = Math.max(0, Math.min(1, remaining / length));
        return { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio };
      }
      remaining -= length;
    }
    return this.path[this.path.length - 1];
  }

  draw(context, width, height) {
    const point = this.getWorldPosition();
    const x = point.x * width;
    const y = point.y * height;
    const horizontal = this.axis === 'EW';
    context.save();
    context.translate(x, y);
    if (!horizontal) context.rotate(Math.PI / 2);
    context.fillStyle = 'rgba(0,0,0,.35)';
    context.fillRect(-5, -2 + 2, 10, 5);
    context.fillStyle = COLORS[this.direction];
    context.fillRect(-5, -2.5, 10, 5);
    context.restore();
  }
}
