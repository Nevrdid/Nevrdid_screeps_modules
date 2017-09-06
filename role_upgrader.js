Roles.upgrader = {};

Roles.upgrader.action = function(creep, state) {   //state = -2: startPos, state = 1: reversing path, state = 0 : static, state = 1 : advancing on path, state = 2 : endPos
    switch (state) {
        case -2 :
            return Roles.upgrader.startPosAction(creep);
            break;
        case 1 :
            return Roles.upgrader.movingAction(creep);
            break;
        
    }
}

Roles.upgrader.startPosAction = function(creep) { 
    creep.upgradeController(creep.room.controller));
    /**
    if ( ret != OK) {
        let friendlyCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS,{filter: c => c.memory.job.name == 'hauler'});
        if (friendlyCreep && friendlyCreep.carry.energy){
            friendlyCreep.drop('energy');
        }
        
    }
    **/
    creep.pickup(creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: r => r.resourceType == 'energy'}));
    
    return false;
}
    
Roles.upgrader.movingAction = function(creep) {
    let ret = creep.transfer(creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: s => (s.energy && s.energy < s.energyCapacity) ||
            (s.store && s.store.energy < s.storeCapacity)}), 'energy');
    
    if ( ret != OK) {
        let friendlyCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS,{filter: c => c.memory.job.name == 'hauler'});
        if (friendlyCreep && friendlyCreep.carry.energy){
            friendlyCreep.drop('energy');
        }
        
    }
    
    creep.pickup(creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: r => r.resourceType == 'energy'}));
    
    return false;
}
    