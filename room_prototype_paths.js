'use strict';

/**
 *
 * Paths by nodes module.
 * require it from your main
 * importants Room methods :
 * - .init() for init them when a room is discover. Path are memorized into
 *      room.memory.paths following above structure.
 * - .update() for dynamicly update roads type using used property.
 *
 * important Creep methods
 * - .get(target: roomPos/object/id, fullPath: bool) return segment actually
        creep is on or full path if fullPath is true,
 *
 */

////////////////////////////////////////////////////////////////////////////////
//e.g. paths structure :
// paths = {};
//paths.E1 = undefined;
//paths.E2 = {path: pathE2, used: 0};
//paths.E3 = {path: pathN1toE3, used: 0, node: [E2, 3]};
//paths.E4 = {path: pathE4, used: 0};
//paths.S1 = {path: pathN2toS1, used: 0, parentNode: [E2, 2]};
//paths.S2 = {path: pathN3toS2, used: 0, parentNode: [E4, 5]};
//paths.S3 = undefined;
//paths.M = {path: pathN4toM, used: 0, parentNode: [S2, 2]};
//
//paths.list = [['E2', 'E4'], ['E3', 'S1', 'S2'], ['M']];
//
// Roads types (road types dynamicly change depending of segment call amount):
// dirt: no road, path erased from memory, keep used property and parent node.
//        if segment is needed, path is newly generated but not memorized,
// alley: use road only on swamp terrain,
// street: use road on all segment,
// express: double the road,
//
////////////////////////////////////////////////////////////////////////////////

global.Pathing = {
  getInternPath: function (pos, target) {
    let range;
    if (_.isString(target)) {
      range = 1;
      target = Game.getObjectById(target).pos;
    } else if (target instanceof RoomPosition) {
      range = 0;
    }

    if (!target || target.roomName !== pos.roomName) {
      return false;
    }
    /**
    if (Math.floor(Math.sqrt((pos.x - target.x)**2 + (pos.y - target.y)**2)) < 2) {
      target = target.findNearestTerrain(1);
    }
    **/
    return PathFinder.search(
      new RoomPosition(pos.x, pos.y, pos.roomName), {
        pos: target,
        range: range,
      }, {
        maxRooms: 1,
        swampCost: config.layout.swampCost,
        plainCost: config.layout.plainCost,
        roomCallback: (roomName) => _CostMatrix.clone(),
      }
    ).path;
  },
};

class Path {
  constructor(startPos, pathName) {
    let room = Game.rooms[startPos.roomName]
    if (room.endPoints[pathName]) {
      this.name = pathName;
      this.room = room;
      this.unformatedPathArray = Pathing.getInternPath(startPos, room.endPoints[pathName]);

      if (this.unformatedPathArray) {
        this.unformatedPath = this.personalSerial();
        this.parent = {};
        this.deep = 0;
        this.pos = 0;
        this.formated = false;
        this.path = '';
        this.searchParent();
        if (config.debug.paths) {
          console.log(`Path to ${pathName} created and reformated.`);
        }

        return true;
      }
    }

    if (config.debug.paths) {
      console.log(`Path to ${pathName} not exist`);
    }

    return false;
  }

  personalSerial() {
    var prevPos,
        serializedPath = '',
        pos,
        dirs = {
          ['0-1']: '1',
          ['1-1']: '2',
          ['10']: '3',
          ['11']: '4',
          ['01']: '5',
          ['-11']: '6',
          ['-10']: '7',
          ['-1-1']: '8'
        };
    for (pos of this.unformatedPathArray) {
      _CostMatrix.set(pos.x, pos.y, 1);
      if (prevPos) {
        let delta = `${pos.x - prevPos.x}${pos.y - prevPos.y}`;
        serializedPath += dirs[delta];
      }
      prevPos = pos;
    }
    return serializedPath;
  }

  searchParent() {
    let paths = this.room.memory.paths; // use cache one instead of deserialize
    let pathsNames = paths.list[this.deep];
    let pathsAmount = pathsNames ? pathsNames.length : 0;
    let p = 0;
    while (p < pathsAmount) {
      if (_.eq(this.unformatedPathArray[this.pos], paths[pathsNames[p]].startPos)) {
        this.parent = {
          name: pathsNames[p],
          pos: 0,
        };
        this.browseParent();
        return true;
      }

      p++;
    }

    this.finalizePath();
  }

  browseParent() {
    while (this.unformatedPath[this.pos]) {
      if (!_(this.unformatedPath[this.pos]).eq(
        this.room.memory.paths[this.parent.name].path[this.parent.pos])) {
        this.deep++;
        this.searchParent();
        break;
      }

      this.pos++;
      this.parent.pos++;
    }
  }

  finalizePath() {
    while (this.unformatedPath[this.pos]) {
      this.path += this.unformatedPath[this.pos];
      this.pos++;
    }

    this.formated = true;
    this.room.memory.paths.list[this.deep] = this.room.memory.paths.list[this.deep] || [];
    this.room.memory.paths.list[this.deep].push(this.name);
    this.room.memory.paths[this.name] = {
      path: this.path,
      parentNode: this.parent,
      startPos: this.unformatedPathArray[this.unformatedPathArray.length - this.path.length - 1],
      endPos: this.unformatedPathArray[this.pos - 1],
    };
  }
}

Room.prototype.getEndPoints = function () {
  let endPoints = {};
  let i;

  let exitTiles;
  let exit;
  let distance;
  let minDist = Infinity;
  let nearestExit;
  let exitDirs = [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];
  let sources = this.find(FIND_SOURCES);

  let mineral = this.find(FIND_MINERALS)[0];

  for (i = 1; i <= 4; i++) {
    exitTiles = this.find(exitDirs[i - 1]);
    if (exitTiles.length > 0) {
      /**
      for (exit of exitTiles) {
          distance = Math.sqrt((this.controller.pos.x - exit.x)**2 + (this.controller.pos.y - exit.y)**2)
          if (distance < minDist) {
              minDist = distance;
              nearestExit = exit;
          }
      }
      endPoints['E' + i] = nearestExit;
      **/
      endPoints['E' + i] = exitTiles[Math.floor(exitTiles.length / 2)];
    }
  }

  for (i = 1; i <= 3; i++) {
    if (sources[i - 1]) {
      endPoints['S' + i] = sources[i - 1].id;
      sources[i - 1].pos.costMatrixAvoid();
    }
  }

  mineral.pos.costMatrixAvoid();
  endPoints.M = mineral.id;
  return endPoints;
};

class Pos {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
Room.prototype.printRoomCosts = function (matrix, proportional = false,  aroundPos = false) {
  let x = 0, y = 0, maxCost = 5, val, tiles, cost, redHex, greenHex, color;
  let start = new Pos(Math.max(aroundPos && aroundPos.x - 3, 0) || 0,
                      Math.max(aroundPos && aroundPos.y - 3, 0) || 0);
  let end = new Pos(Math.min(aroundPos && aroundPos.x + 3, 49) || 49,
                    Math.min(aroundPos && aroundPos.y + 3, 49) || 49);
  console.log("costs:");

  if (proportional) {
    let xP, yP;
    for (xP = start.x; xP <= end.x; xP++) {
      for (yP = start.y; yP <= end.y; yP++) {
        cost = matrix.get(xP, yP);
        if (cost < 250 && cost > maxCost) {
          maxCost = cost;
        }
      }
    }

    console.log(maxCost);
  }

  for (y = start.y; y <= end.y; y++) {
    tiles = [];
    for (x = start.x; x <= end.x; x++) {
      val = Math.min(matrix.get(x, y) + 1, maxCost) * Math.floor(256 / maxCost);
      redHex = (val).toString(16);
      greenHex = (256 - val).toString(16);
      color = (redHex[1] ? redHex : '0' + (redHex[0] || '0')) +
              (greenHex[1] ? greenHex : '0' + (greenHex[0] || '0')) +
              '00';
      tiles.push('<a style="color: #' + color + '">███</a>');
    }

    console.log(tiles.join(''));
  }
};

Room.prototype.init = function () {
  let center = this.controller && this.controller.pos || new RoomPosition(25, 25, this.name),
      i;
  center = center.findNearestTerrain();
  console.log(JSON.stringify(center));
  global._CostMatrix = new PathFinder.CostMatrix;
  for (i = 0; i < 50; i++) {
    let value = config.layout.borderAvoid;
    _CostMatrix.set(i, 0,  10);
    _CostMatrix.set(i, 49, 10);
    _CostMatrix.set(0, i, 10);
    _CostMatrix.set(49, i, 10);

    _CostMatrix.set(i, 1, 10);
    _CostMatrix.set(i, 48, 10);
    _CostMatrix.set(1, i, 10);
    _CostMatrix.set(48, i, 10);

  }

  console.log(`CPU at start: ====----||${Game.cpu.getUsed()}||----====`);
  this.memory.paths = { list: [] };
  this.endPoints = this.getEndPoints();
  let n = 0;
  while (n < 8) {
    if (n < 4) {
      new Path(center, 'E' + (n + 1));
    } else if (n < 7) {
      new Path(center, 'S' + (n - 3));
    } else {
      new Path(center, 'M');
    }

    console.log(`CPU (n=${n}): ====----||${Game.cpu.getUsed()}||----====`);
    n++;
  }

  this.printRoomCosts(_CostMatrix);
};

Room.prototype.erase = function () {
  delete this.memory.paths;
};
