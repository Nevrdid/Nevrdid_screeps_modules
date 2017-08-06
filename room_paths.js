'use strict';

/**
 *  ---- SUMMARY ----
 * Room prototypes :
 * 
 *15 - initPaths()                       --->  create room's paths
 *49 - createPath(startPos, pathName)    --->
 *63 - getEndPoints()                    --->  return endPoints
 * 
 * */

Room.prototype.initPaths = function() {
    
    this.memory.pathsList = [];
    this.memory.paths = {};
    /**
    var exitDirs = [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];
    let exitTiles = this.find(exitDirs[1]);
    let center = exitTiles[Math.floor(exitTiles.length / 2)];
    **/
  let center = this.controller && this.controller.pos || new RoomPosition(25, 25, this.name);
  
  this.CostMatrix = newRoomCM();
  center = center.findNearestTerrain();
  center.bordersAvoid();
  this.CostMatrix.set(center.x, center.y, 1);
  
  this.center = center;
  this.nodesAmount = 0;
  this.paths = {};
  this.pathsList = [];
  this.endPoints = this.getEndPoints();
   
  /**
 * TODO: if remote room, use exit closer to parentRoom as center 
 * */
   
  let n = 0;
  while (n < 10) {
    if (n < 3) {
      this.createPath('S' + (n + 1));
    } else if (n < 4 && !this.controller.my){
        this.createPath('C')
    } else if (n < 8) {
      this.createPath('E' + (n - 3));
    } else if (n < 9) {
      this.createPath('M');
    } else {
      this.createPath('Sp');
    } 
    n++;
    
  }
  this.memory.center = this.center;
  this.memory.pathsList = this.pathsList;
  this.memory.paths = this.memory.paths || {};
  _.each(this.paths, path => {
	this.memory.paths[path.name] = {
		name: path.name,
		path: path.path,
		endPos: path.endPos,
		deep: path.deep,
		parent: path.parent || '',
		childrens: path.childrens || [],
	};
  });
}

Room.prototype.createPath = function( pathName) {
    let pathArray = this.center.getInternPath(this.endPoints[pathName]);
    
    if (pathArray) {
        this.paths[pathName] = new Path(pathName, this);
        this.paths[pathName].generate(pathArray);
        
        return true;
    }
    

    if (config.debug.paths) {
      console.log(`Path to ${pathName} not exist`);
    }

    return false;
}

Room.prototype.getEndPoints = function() {
  var endPoints = {};
  var i;

  var exitTiles;
  var exitDirs = [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];
  for (i = 1; i <= 4; i++) {
    exitTiles = this.find(exitDirs[i - 1]);
    if (exitTiles.length > 0) {
      endPoints['E' + i] = exitTiles[Math.floor(exitTiles.length / 2)];
    }
  }
  
  var sources = this.find(FIND_SOURCES);
  for (i = 1; i <= 3; i++) {
    if (sources[i - 1]) {
      endPoints['S' + i] = sources[i - 1].id;
      sources[i - 1].pos.bordersAvoid();
    }
  }
  
  var mineral = this.find(FIND_MINERALS)[0];
  if ( mineral ) {
    mineral.pos.bordersAvoid();
    endPoints.M = mineral.id;
  }
  
  
  var spawn = this.find(FIND_MY_SPAWNS)[0];
  if ( spawn ) {
    spawn.pos.bordersAvoid();
    endPoints.Sp = spawn.id;  
  }
  
  
  endPoints.C = this.controller && this.controller.id
  
  return endPoints;
};
