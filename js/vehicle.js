const VEHICLE_COLORS = {
  north: '#8db4a1',
  south: '#86a9b2',
  east: '#b0a58a',
  west: '#9c98b0'
};

export class Vehicle {
  constructor({ id, direction, x, y, spawnTime }) {
    this.id = id;
    this.direction = direction;
    this.x = x;
    this.y = y;
    this.speed = 0;
    this.maxSpeed = 82;
    this.waitingTime = 0;
    this.isStopped = false;
    this.spawnTime = spawnTime;
    this.length = 22;
    this.width = 11;
    this.hasCrossed = false;
  }

  get axis() {
    return this.direction === 'north' || this.direction === 'south' ? 'NS' : 'EW';
  }

  get progression() {
    if (this.direction === 'north') return -this.y;
    if (this.direction === 'south') return this.y;
    if (this.direction === 'east') return this.x;
    return -this.x;
  }

  distanceTo(leader) {
    if (!leader || leader.direction !== this.direction) return Infinity;
    return leader.progression - this.progression - this.length;
  }

  update(deltaTime, canProceed, stopPosition, leader, bounds) {
    const acceleration = 70;
    const braking = 145;
    const safeGap = 13;
    const approachingLine = this.isBeforeStopLine(stopPosition);
    const distanceToLine = this.distanceToStopLine(stopPosition);
    const leaderGap = this.distanceTo(leader);
    const mustStopForSignal = !this.hasCrossed && approachingLine && !canProceed && distanceToLine < Math.max(10, this.speed * 0.7);
    const mustStopForVehicle = leaderGap < safeGap + Math.max(4, this.speed * 0.28);

    if (mustStopForSignal || mustStopForVehicle) {
      this.speed = Math.max(0, this.speed - braking * deltaTime);
    } else {
      this.speed = Math.min(this.maxSpeed, this.speed + acceleration * deltaTime);
    }

    const travel = this.speed * deltaTime;
    if (mustStopForSignal && travel > distanceToLine) {
      this.move(Math.max(0, distanceToLine));
      this.speed = 0;
    } else if (mustStopForVehicle && leaderGap < safeGap + travel) {
      this.move(Math.max(0, leaderGap - safeGap));
      this.speed = 0;
    } else {
      this.move(travel);
    }

    this.isStopped = this.speed < 1;
    if (this.isStopped && (mustStopForSignal || mustStopForVehicle)) this.waitingTime += deltaTime;
    if (!this.hasCrossed && this.hasEnteredIntersection(bounds)) this.hasCrossed = true;

  }

  move(distance) {
    if (this.direction === 'north') this.y -= distance;
    if (this.direction === 'south') this.y += distance;
    if (this.direction === 'east') this.x += distance;
    if (this.direction === 'west') this.x -= distance;
  }

  getFront() {
    if (this.direction === 'north') return this.y - this.length / 2;
    if (this.direction === 'south') return this.y + this.length / 2;
    if (this.direction === 'east') return this.x + this.length / 2;
    return this.x - this.length / 2;
  }

  isBeforeStopLine(stopPosition) {
    if (this.direction === 'north' || this.direction === 'west') return this.getFront() > stopPosition;
    return this.getFront() < stopPosition;
  }

  distanceToStopLine(stopPosition) {
    if (this.direction === 'north' || this.direction === 'west') return Math.max(0, this.getFront() - stopPosition);
    return Math.max(0, stopPosition - this.getFront());
  }

  hasEnteredIntersection(bounds) {
    const front = this.getFront();
    if (this.direction === 'north') return front < bounds.bottom;
    if (this.direction === 'south') return front > bounds.top;
    if (this.direction === 'east') return front > bounds.left;
    return front < bounds.right;
  }

  isOutside(width, height, margin = 45) {
    return this.x < -margin || this.x > width + margin || this.y < -margin || this.y > height + margin;
  }

  draw(context) {
    const vertical = this.direction === 'north' || this.direction === 'south';
    context.save();
    context.translate(this.x, this.y);
    if (!vertical) context.rotate(Math.PI / 2);
    context.fillStyle = 'rgba(0, 0, 0, .28)';
    context.fillRect(-this.width / 2 + 2, -this.length / 2 + 3, this.width, this.length);
    context.fillStyle = VEHICLE_COLORS[this.direction];
    context.fillRect(-this.width / 2, -this.length / 2, this.width, this.length);
    context.fillStyle = 'rgba(10, 18, 20, .72)';
    context.fillRect(-this.width / 2 + 2, -this.length / 2 + 4, this.width - 4, 5);
    context.fillRect(-this.width / 2 + 2, this.length / 2 - 8, this.width - 4, 4);
    context.restore();
  }
}
