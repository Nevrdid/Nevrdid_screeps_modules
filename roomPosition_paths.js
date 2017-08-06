'use strict';

/**
 *  ---- SUMMARY ----
 * RoomPosition prototypes :
 * 
 * 12 - bordersAvoid() ---> make costMatrix avoid borders of pos.
 * 30 - getInternPath --->
 * 
 * */
 
RoomPosition.prototype.bordersAvoid = function() {
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
    Game.rooms[this.roomName].CostMatrix.set(this.x + delta[i][0], this.y + delta[i][1], 250);
    i++;
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
  if (target.lookFor(LOOK_STRUCTURES).length
        || target.lookFor(LOOK_TERRAIN) === 'wall') {
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