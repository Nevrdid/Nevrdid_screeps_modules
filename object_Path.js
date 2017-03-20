'use strict';

global._Path = {
  create: function(startPos, pathName) {
    let room = Game.rooms[startPos.roomName];
    if (room.endPoints[pathName]) {
      this.name = pathName;
      this.room = room;
      this.unformatedPathArray = startPos.getInternPath(room.endPoints[pathName]);

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
  },
  personalSerial: function() {
    let prevPos;
    let serializedPath = '';
    let pos;
    let dirs = {
      '0-1': '1',
      '1-1': '2',
      10: '3',
      11: '4',
      '01': '5',
      '-11': '6',
      '-10': '7',
      '-1-1': '8'
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
  },
  searchParent: function() {
    let paths = this.room.memory.paths; // use cache one instead of deserialize
    let pathsNames = paths.list[this.deep];
    let pathsAmount = pathsNames ? pathsNames.length : 0;
    let p = 0;
    while (p < pathsAmount) {
      if (_.eq(this.unformatedPathArray[this.pos], paths[pathsNames[p]].startPos)) {
        this.parent = {
          name: pathsNames[p],
          pos: 0
        };
        this.browseParent();
        return true;
      }

      p++;
    }
    this.finalizePath();
  },
  browseParent: function() {
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
  },
  finalizePath: function() {
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
      endPos: this.unformatedPathArray[this.pos - 1]
    };
  }
}
