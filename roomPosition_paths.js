'use strict';

/**
 *  ---- SUMMARY ----
 * RoomPosition prototypes :
 * 
 * 12 - bordersAvoid() ---> make costMatrix avoid borders of pos.
 * 35 - getInternPath(target)
 * 
 * */
 
RoomPosition.prototype.bordersAvoid = function(maxRange = 1) {
  let range = 1,
    side = 0,
    pos = [0, 0],
    i,
    terrain,
    structure;
    let pos3d = new RoomPosition(0, 0, this.roomName);
  while (range <= maxRange) {
    for (side = 0; side < 4; side++) {
      pos = [side % 2 ? (side - 2) * range : 0, (side % 2) === 0 ? (side - 1) * range : 0];
      for (i = -range; i <= range; i++) {
        pos3d.x = this.x + (!pos[0] ? i : pos[0]);
        pos3d.y = this.y + (!pos[1] ? i : pos[1]);
        if (pos3d.isOpen()) {
            Game.rooms[this.roomName].CostMatrix.set(pos3d.x, pos3d.y, config.layout.bordersValue - config.layout.bordersCostReduceByDistance * (range-1));
        }
      } 
    }
    range++;
  }
};
 
RoomPosition.prototype.getInternPath = function(target) {
    
  if (_.isString(target)) {
    target = Game.getObjectById(target).pos;//.findNearestTerrain(1);
  }

  if (!target || target.roomName !== this.roomName) {
    return false;
  }
  let range = 0;
  if (!target.isOpen()) {
            range = 1
        }
  
  return PathFinder.search(
    new RoomPosition(this.x, this.y, this.roomName), {
      pos: target,
      range: range
    }, {
      maxRooms: 1,
      swampCost: config.layout.swampCost,
      plainCost: config.layout.plainCost,
      roomCallback: (roomName) => Game.rooms[this.roomName].CostMatrix.clone()
    }
  ).path;
};