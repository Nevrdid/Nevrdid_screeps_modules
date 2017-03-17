'use strict';

Room.prototype.resetVisual = function() {
  this.memory.t = 0;
  this.memory.pos = {};
};

Room.prototype.pathsVisual = function() {
  if (!this) {
    return false;
  }

  if (Game.time % 50 === 0) {
    this.memory.t = 0;
    this.memory.pos = {};
  }

  let t = this.memory.t;
  let path;
  let pathName;
  let pos;

  let deep = 0;
  let sameDeepPaths;

  console.log('--- t: ', t);
  let color = [
    '#505050',
    '#00ff00',
    '#0000ff',
    '#ff0000'
  ];
  for (sameDeepPaths of this.memory.paths.list) {
    for (pathName of this.memory.paths.list[deep]) {
      path = this.memory.paths[pathName];
      if (path) {
        let tStart = 0;
        this.memory.pos = this.memory.pos || {};
        if (path.parentNode.pos) {
          let d = deep;
          let parent = path;
          while (parent.parentNode.name) {
            tStart += parent.parentNode.pos;
            parent = this.memory.paths[parent.parentNode.name];
            d--;
          }

          if (t < tStart) {
            continue;
          }
        }

        pos = this.memory.pos[pathName] || path.startPos;
        if (pos) {
          pos = new RoomPosition(pos.x, pos.y, pos.roomName);
        } else {
          continue;
        }

        console.log(`${pathName}: ${JSON.stringify(pos)}`);
        if (path.path[t - tStart]) {
          pos.applyDir(path.path[t - tStart]);
          this.memory.pos[pathName] = pos;
        }

        this.visual.circle(this.memory.pos[pathName].x, this.memory.pos[pathName].y, {
          radius: 0.75,
          fill: color[deep],
          opacity: 1
        });
        this.visual.text(pathName, this.memory.pos[pathName].x, this.memory.pos[pathName].y + 0.2);
      }
    }
    deep++;
  }

  this.memory.t++;
};
