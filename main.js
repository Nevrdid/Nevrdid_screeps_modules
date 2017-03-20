require('config');
require('object_VRoom');
require('object_Path');
require('roomPosition_prototype_paths');
require('room_prototype_paths');
require('visual');

_.each(Game.rooms, room => {
  room.erasePaths();
  room.initPaths();
  room.resetVisual();
});

module.exports.loop = function() {
  _.each(Game.rooms, room => {
    room.checkPaths();
    room.pathsVisual();
    room.displayPaths();

    //room.manageVRoom;
  });

  console.log(`/////// CPU USED: ${Game.cpu.getUsed()}`);
};
