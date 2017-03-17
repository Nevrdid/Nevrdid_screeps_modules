'use strict';

RoomPosition.prototype.applyDir = function(dir) {
  let delta = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];
  this.x += delta[dir - 1][0];
  this.y += delta[dir - 1][1];
};

RoomPosition.prototype.findNearestTerrain = function(maxRange = 49) {
  let range = 0,
    side = 0,
    pos = [0, 0],
    i,
    terrain,
    posX,
    posY;
  while (range <= maxRange) {
    for (side = 0; side < 4; side++) {
      pos = [side % 2 ? (side - 2) * range : 0, (side % 2) === 0 ? (side - 1) * range : 0];
      for (i = -range; i <= range; i++) {
        posX = this.x + (!pos[0] ? i : pos[0]);
        posY = this.y + (!pos[1] ? i : pos[1]);
        terrain = Game.map.getTerrainAt(posX, posY, this.roomName);
        if (terrain === 'plain' || terrain === 'swamp') {
          return new RoomPosition(posX, posY, this.roomName);
        }
      }
    }
    range++;
  }
};

RoomPosition.prototype.costMatrixAvoid = function() {
  let i = 0;
  let delta = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
  ];
  while (i < 8) {
    _CostMatrix.set(this.x + delta[i][0], this.y + delta[i][1], 254);
    i++;
  }
};

RoomPosition.prototype.getInternPath = function(target) {
  let range;
  if (_.isString(target)) {
    range = 1;
    target = Game.getObjectById(target).pos;
  } else if (target instanceof RoomPosition) {
    range = 0;
  }

  if (!target || target.roomName !== this.roomName) {
    return false;
  }
  /**
  if (Math.floor(Math.sqrt((pos.x - target.x)**2 + (pos.y - target.y)**2)) < 2) {
    target = target.findNearestTerrain(1);
  }
  **/
  return PathFinder.search(
    new RoomPosition(this.x, this.y, this.roomName), {
      pos: target,
      range: range
    }, {
      maxRooms: 1,
      swampCost: config.layout.swampCost,
      plainCost: config.layout.plainCost,
      roomCallback: (roomName) => _CostMatrix.clone()
    }
  ).path;
};
