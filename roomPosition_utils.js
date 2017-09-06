'use strict';

/**
 *  ---- SUMMARY ----
 * RoomPosition prototypes :
 * 
 * 13 - isOpen(opts)            -|_-|Made by Doctorzuber|-_|-->  return nearest terrain position from pos within range 
 * 42 - findNearestTerrain(maxRange?)
 * 68 - applyDir(dir)
 * 
 * */

RoomPosition.prototype.isOpen = function(opts){
    if(this.x < 0 || this.x > 49 || this.y < 0 || this.y > 49
        || (this.x === 0 && this.y === 0) || (this.x === 49 && this.y === 49)
        || (this.x === 0 && this.y === 49) || (this.x === 49 && this.y === 0)) {
        return false;
    } 
// opts.ignoreCreeps (boolean) default false. ignores creeps if true.
// opts.ignoreSolids (boolean) default false. ignores solid structures if true.
    if ("wall" === Game.map.getTerrainAt(this)) return(false);
    //if(this.lookFor(LOOK_TERRAIN) === 'wall') return false;
    if (null==Game.rooms[this.roomName]) return (true);

    if ((null==opts || !opts.ignoreCreeps) && 
        (this.lookFor(LOOK_CREEPS).length !== 0)) return(false);

    if ( opts != null && opts.ignoreRoads){
        var objectList = this.lookFor(LOOK_STRUCTURES)
        for(let j=objectList.length; --j>=0; ){
            let rObj = objectList[j];
            if (rObj.structureType === STRUCTURE_ROAD) {
                return false;
            }
        }
    }
    if (null==opts || !opts.ignoreSolids){
        var objectList = this.lookFor(LOOK_STRUCTURES).concat(
                         this.lookFor(LOOK_CONSTRUCTION_SITES));
        for(let j=objectList.length; --j>=0; ){
            let rObj = objectList[j];
            if (rObj instanceof ConstructionSite && !rObj.my) continue;
            if ((opts && opts.ignoreRoads && rObj.structureType === STRUCTURE_ROAD) || (
                rObj.structureType !== STRUCTURE_ROAD &&
                rObj.structureType !== STRUCTURE_CONTAINER &&
               (rObj.structureType !== STRUCTURE_RAMPART ||
               !rObj.my))) {
                    return false;
            }
        }
    }
    return(true);
}

RoomPosition.prototype.findNearestTerrain = function(maxRange = 49, ignoreRoads = false) {
  let range = 1,
    side = 0,
    pos = [0, 0],
    i,
    terrain,
    structure,
    posX,
    posY,
    pos3d;
  while (range <= maxRange) {
    for (side = 0; side < 4; side++) {
      pos = [side % 2 ? (side - 2) * range : 0, (side % 2) === 0 ? (side - 1) * range : 0];
      for (i = -range; i <= range; i++) {
        posX = this.x + (!pos[0] ? i : pos[0]);
        posY = this.y + (!pos[1] ? i : pos[1]);
        pos3d = new RoomPosition(posX, posY, this.roomName);
        if (pos3d.isOpen({ignoreRoads: ignoreRoads})) {
            return pos3d;
        }
      } 
    }
    range++;
  }
};

RoomPosition.prototype.applyDir = function(dir) {
  if (!(dir > 0 && dir < 9)) {
      //console.log('dir not valid for aplyDir');
      return false;
  }
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