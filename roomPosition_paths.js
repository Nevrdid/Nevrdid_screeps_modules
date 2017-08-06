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
    pos = this;
    pos.x += delta[i][0];
    pos.y += delta[i][1];
    if (pos.lookFor(LOOK_TERRAIN) !== 'wall') {
        Game.rooms[this.roomName].CostMatrix.set(pos.x , pos.y, 250);
    }
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
