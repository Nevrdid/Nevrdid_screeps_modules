require('config');
require('roomPosition_prototype_paths');
require('room_prototype_paths');
require('visual');

module.exports.loop = function () {
  let roomName;
  for (roomName in Game.rooms) {
    Game.rooms[roomName].pathsVisual();
  }

  console.log(`/////// CPU USED: ${Game.cpu.getUsed()}`);
};
