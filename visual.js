'use strict';

let roomName,
    room;

for (roomName in Game.rooms) {
    room = Game.rooms[roomName]
    room.memory.t = 0;
    room.memory.pos = {};
    room.memory.paths = {};
    room.erase();
    room.init();
}

Room.prototype.pathsVisual = function () {
    room = this;
    if (!room) {
        return false;
    }
    if (Game.time % 100 === 0) {
        room.memory.t = 0;
        room.memory.pos = {};
    }
    let t = room.memory.t;
    let path;
    let deep;
    let pathName;
    let pos;
    console.log('--- t: ', t)

    let color = [
        '#505050',
        '#00ff00',
        '#0000ff',
        '#ff0000',
        ]
    for(deep in room.memory.paths.list) {
        for (pathName of room.memory.paths.list[deep]) {
          path = room.memory.paths[pathName];
          if (path) {
              let tStart = 0;
              room.memory.pos = room.memory.pos || {};
              if (path.parentNode.pos) {
                  let d = deep;
                  let parent = path;
                  while (parent.parentNode.name) {
                    tStart += parent.parentNode.pos;
                    parent = room.memory.paths[parent.parentNode.name]
                    d--;
                  }
                  if (t < tStart) {
                      continue;
                  }
              }
              let pos = room.memory.pos[pathName] || path.startPos;
              if (pos) {
                  pos = new RoomPosition(pos.x, pos.y, pos.roomName);
              } else {
                continue;
              }

              console.log(`${pathName}: ${JSON.stringify(pos)}`)
              if (path.path[t - tStart]) {
                pos.applyDir(path.path[t - tStart])
                room.memory.pos[pathName] = pos;
              }
              room.visual.circle(room.memory.pos[pathName].x,room.memory.pos[pathName].y, {radius: 0.75, fill: color[deep], opacity: 1});
              room.visual.text(pathName,room.memory.pos[pathName].x,room.memory.pos[pathName].y+0.2);

          }

        }
    }
    room.memory.t++
}
