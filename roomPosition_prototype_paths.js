'use strict';

RoomPosition.prototype.applyDir= function(dir) {
    let delta = [
        [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1]
     ]
    this.x +=delta[dir - 1][0];
    this.y += delta[dir - 1][1];
};
