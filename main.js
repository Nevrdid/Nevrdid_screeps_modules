'use strict';
require('config');

global.Path = require ('pathing_class');
global.Roles = {};

require('utils');
require('roomPosition_paths');
require('roomPosition_utils');
require('room_paths');
require('visual');
//require('creep_actions');
require('role_filler');
require('role_hauler');
require('role_miner');
require('creep_pathing');
require('room_spawn');

let reset = config.reset;

_.each(Game.rooms, room => {
    reset.paths && room.initPaths();
    room.memory.sources = reset.sources ? [] : room.memory.sources;
}); 



module.exports.loop = function() {
    _.each(Game.rooms, room => {
        if(config.debug.visualCM) {
            room.displayCM();
        }
        if (config.visual.paths) {
            room.displayPaths();
            room.spawner();
            _.each(room.find(FIND_MY_CREEPS), c => {
                //c.moveToTar();
            });
        }
        
        
    });
    if (config.debug.cpu) {
        console.log(`/////// CPU USED: ${Game.cpu.getUsed()}`);
    }
    
}
