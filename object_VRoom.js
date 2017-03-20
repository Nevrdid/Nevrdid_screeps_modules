global._VCreep = function(name, roomName, posInit) {
  this = Memory.rooms[roomName].vCreep[name] || {
    name: name,
    spawned: false,
    pos: posInit,
  };
  this.setTarget = function(targetName) {
    switch (targetName[0]) {
      case 'E':

      break;

      case 'S':

      break;

      case 'M':

      break;

      case 'C':

      break;
    }
  }
  this.getPath = function() {

  };

};
global._VRoom = function(roomName) {
  this.roomName = roomName;

  this.checkVCreeps = function() {
    foreach(this.memory.vcreeps, vc => {
      vCreep = new _VCreep(vc);
      vCreep.getPath();
    });
  };
  this.checkVSpawn = function() {
    let spawns = Game.rooms[roomName].find(FIND_MY_SPAWNS);
    foreach(this.memory.vspawn, vs => {
      vSpawn = new _VSpawn(vs);
    })
  };
};


Room.prototype.manageVRoom = function() {
  let vRoom = new _VRoom(this.name);
  vRoom.checkVCreeps();
  vRoom.checkVSpawn();
};
