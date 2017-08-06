'use strict';

global.Path = require ('class_path');

require('config');
require('utils');
require('roomPosition_utils');
require('roomPosition_paths');
require('room_paths');
require('visual');

let reset = config.reset;
if (reset.paths) {
    _.each(Game.rooms, room => {
        room.initPaths();
    }); 
}  

module.exports.loop = function() {
    _.each(Game.rooms, room => {
        if (config.visual.paths) {
            room.displayPaths();
        }
        
    });
    if (config.debug.cpu) {
        console.log(`/////// CPU USED: ${Game.cpu.getUsed()}`);
    }
    
}