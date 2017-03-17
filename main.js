require('config');
require('class_path');
require('roomPosition_prototype_paths');
require('room_prototype_paths');
require('visual');

var room;

for (room of Game.rooms) {
  room.erasePaths();
  room.initPaths();
  room.resetVisual();
}

module.exports.loop = function () {
  for (room of Game.rooms) {
    room.pathsVisual();
  }

  console.log(`/////// CPU USED: ${Game.cpu.getUsed()}`);
};
