Roles.hauler = {};

Roles.hauler.action = function(creep, state) {   //state = -2: startPos, state = 1: reversing path, state = 0 : static, state = 1 : advancing on path, state = 2 : endPos
    switch (state) {
        case -2 :
            return Roles.hauler.startPosAction(creep);
            break;
        case -1 :
            return Roles.hauler.reverseAction(creep);
            break;
        case 0 :
            return Roles.hauler.staticAction(creep);
            break;
        case 1 :
            return Roles.hauler.movingAction(creep);
            break;
        case 2 :
            return true;
            break;
        
        
    }
}

Roles.hauler.staticAction = function(creep) {
        creep.drop('energy')
        return true;
    
}

Roles.hauler.startPosAction = function(creep) {
    //creep.transfer(creep.pos.findClosestByRange(FIND_MY_SPAWNS), 'energy');
    if(creep.carry.energy === 0) {
        return true;
    } else {
        creep.drop('energy')
    }
    return true;
}

Roles.hauler.reverseAction = function(creep) {
        
        let friendlyCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS,{filter: c =>  c.memory.job.name == 'filler'} );
        let dropedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter:r => r.resourceType == 'energy'});
        if (friendlyCreep) {
            let ret = creep.transfer(friendlyCreep, 'energy');
            if(ret == OK ) return true;
        } else { 
           //creep.pickup(dropedEnergy)
        }
        //if((creep.carry.energy / creep.carryCapacity - (creep.memory.pathing.deep / (creep.memory.pathing.path.length-1) ) ) < 0) return true;
        if (creep.carry.energy === 0 && creep.memory.pathing.deep < creep.memory.pathing.path.length /  2) return true;
    
    return false;
}

Roles.hauler.movingAction = function(creep) {
    
    
    let friendlyCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS,{filter: c => c.name != creep.name && c.memory.job.name != 'filler' && (c.memory.job.name != 'hauler' ||  !c.memory.pathing.reverse)});
    if ( friendlyCreep) {
        if (friendlyCreep.transfer(creep, 'energy') === OK) return true;
    }
    if(creep.carry.energy >= creep.carryCapacity) {
        return true;
    }
    //creep.pickup(creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter:r => r.resourceType == 'energy'}));
    
    return false;
}
