'use strict';

/**
 *  ---- SUMMARY ----
 * Room prototypes :
 *
 *16 - fullPath(start, end, memorize?)
 *65 - avoidWallsBorders()
 *83 - initPaths(rootExit)    --->  create room's paths
 *146 - createPath(pathName)
 *164 - getEndPoints()          --->  return endPoints
 * 
 * */
 
 
 Room.prototype.fullPath = function( start, end, memorize = false) {
     this.memory.fullPaths = this.memory.fullPaths || {};
    if (this.memory.fullPaths[start + '-' + end]) {
        if (config.debug.paths) {
            console.log(this.name, ' try to memorize ', start + '-' + end, 'path but it already exist.')
        }
        return this.memory.fullPaths[start + '-' + end];
    }
    console.log(start, ' - ', end);
    let paths = Array([start],[end]);
    for (let i = 0; i < paths.length; i++) {
        let pathOn = paths[i][0];
        while (pathOn) {
            let newPath = this.memory.paths[pathOn] &&  this.memory.paths[pathOn].parent;
            newPath && paths[i].push(newPath);
            pathOn =  newPath;
            
        }
    }
    
    let reverse = true;
    let finalPath = [];
    let deep = 0;
    let nodeId;
    let pathName;
    if (paths[0][1]) {
      while(reverse && deep < paths[0].length){
        let endDeep;
        for (endDeep in paths[1]) {
            let pathName = paths[1][endDeep]
            if (pathName === paths[0][deep]) {
                reverse = false;
                deep = endDeep - 2;
                break;
            }
        }
        reverse && finalPath.push({name: paths[0][deep], reverse: true});
        deep++;
        
      }  
    } else {
        deep = paths[1].length-1;
    }
    
    while (deep >= 0) {
        
        finalPath.push({name: paths[1][deep], reverse: false});
        deep--;
        
    }
    if (memorize) {
        this.memory.fullPaths[start + '-' + end] = finalPath;
    }
    
    return finalPath;
    
    
 }


Room.prototype.avoidWallsBorders = function() {
    let x;
    let y;
    let pos = new RoomPosition(0,0,this.name)
    for (x = 0; x < 50; x++) {
        pos.x = x;
        for (y = 0; y < 50; y++) {
            pos.y = y;
            if(!pos.isOpen({ignoreCreeps: true})){
               this.CostMatrix.set(pos.x, pos.y, 255);
               pos.bordersAvoid(config.layout.bordersDistanceToIncreaseCost);
            }
            
        }
    }
};


Room.prototype.initPaths = function(startPos, endPositions) {
    let spawns = this.find(FIND_MY_SPAWNS);
    
    this.CostMatrix = newRoomCM();
    this.avoidWallsBorders();
    this.endPoints = endPositions || this.getEndPoints();
    
    let center;
    if (startPos) {
        var exitDirs = [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];
        let exitTiles = this.find(exitDirs[rootExit]);
        center = exitTiles[Math.floor(exitTiles.length / 2)];
    } else {
        //center = spawns.length && spawns[0].pos || new RoomPosition(25, 25, this.name);
        center = (this.controller && this.controller.my && this.controller.pos) || new RoomPosition(25, 25, this.name);
    }
    
    if(!center.isOpen()) center = center.findNearestTerrain();
    center.bordersAvoid(2);
    this.CostMatrix.set(center.x, center.y, 1);
    
    this.memory.pathsList = [];
    this.memory.paths = {};
    this.memory.fullPaths = {};
    this.memory.sources = {};
  
    this.center = center;
    this.nodesAmount = 0;
    this.paths = {};
    this.pathsList = [];
    
    _.each(this.endPoints, (endPos, pathName) => this.createPath(pathName));
  
    this.memory.center = this.center;
    this.memory.pathsList = this.pathsList;
    this.memory.paths = this.memory.paths || {};
    if(config.debug.visualCM){
        this.memory.cm = this.CostMatrix.serialize();
    }
  
  
    _.each(this.paths, path => {
      
        config.layout.pathsToZigZag[path.name.charAt(0)] && path.zigzag();
        path.setPathMemory();
	
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
  
  var spawn = this.find(FIND_MY_SPAWNS)[0];
  //spawn && spawn.pos.bordersAvoid();
  endPoints.Sp = spawn && spawn.id;
  
  var sources = this.find(FIND_SOURCES);
  for (i = 1; i <= 3; i++) {
    if (sources[i - 1]) {
      endPoints['S' + i] = sources[i - 1].id;
    }
  }
  var i;
  var exitTiles;
  var exitDirs = [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];
  var diff = [[0,1], [-1,0], [0,-1], [1,0]]
    for (i = 1; i <= 4; i++) {
        exitTiles = this.find(exitDirs[i - 1]);
        // ------------------------   console.log(JSON.stringify(exitTiles));
        let exits = [];
        let actualExit = [];
        let prevPos = new RoomPosition(0, 0, this.name);
        console.log(JSON.stringify(exitTiles));
        for(let tile of exitTiles) {
            if (!tile.isOpen()) continue;
            if(tile.x - prevPos.x === 1 || tile.y - prevPos.y === 1) {
                actualExit.push(prevPos);
                for (let j = 0; j < config.layout.exitsThickness; j++) {
                    let pos = new RoomPosition(tile.x + j * diff[i - 1][0], tile.y + j * diff[i - 1][1], this.name);
                    if (pos.isOpen()){
                        this.CostMatrix.set(pos.x, pos.y, config.layout.exitsCMCost - j * 2);
                    }
              
                } 
            } else {
                actualExit.push(prevPos);
                actualExit = []; 
                exits.push(actualExit);
              
            }
            prevPos = tile;
          
          
        }
        if(!exits.length) continue;
        
        // ----------------------------console.log(JSON.stringify(exits));
        let tinerExit = _.min(exits, e => e.length);
        //console.log(JSON.stringify(tinerExit));
        endPoints['E' + i] = tinerExit.length ? tinerExit[Math.floor(tinerExit.length / 2)] : undefined;
    }
  
  var mineral = this.find(FIND_MINERALS)[0];
  //mineral && mineral.pos.bordersAvoid();
  endPoints.M = mineral && mineral.id;
  
  
  endPoints.C = this.controller && this.controller.id
  this.controller.pos.bordersAvoid(10);
  
  return endPoints;
};
