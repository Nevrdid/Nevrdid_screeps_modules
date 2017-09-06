Roles.miner = {};

Roles.miner.action = function(creep, state) {   //state = -2: startPos, state = 1: reversing path, state = 0 : static, state = 1 : advancing on path, state = 2 : endPos
    switch (state) {
        case -2 :
            return Roles.miner.startPosAction(creep);
            break;
        case -1 :
            return Roles.miner.reverseMoveAction(creep);
            break;
        case 2 :
            return Roles.miner.endPosAction(creep);
            break;
        
    }
}

Roles.miner.startPosAction = function(creep) {
    creep.upgradeController(creep.room.controller)
    if(creep.carry.energy === 0) {
        return true;
    }
    return false;
}

Roles.miner.endPosAction = function(creep) {
    creep.harvest(creep.pos.findClosestByRange(FIND_SOURCES))
    if(creep.carry.energy === creep.carryCapacity) {
        return true;
    }
    return false;
}

Roles.miner.reverseMoveAction = function(creep) {
    if((creep.carry.energy / creep.carryCapacity - creep.memory.pathing.deep / creep.memory.pathing.path.length ) < 0)
        return true;
    //if (creep.carry.energy < 0.6 * creep.carryCapacity  creep.memory.pathing.deep > creep.memory.pathing.path.length /  2) return true;
    
     let transfRet = creep.transfer(creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: s => (s.energyCapacity && s.energy < s.energyCapacity) ||
                (s.store && s.store.energy < s.storeCapacity)}), 'energy');
    if(transfRet == OK) return false;
    
    let ret = creep.build(creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES));
    if(ret && (creep.carry.energy  - 5 * creep.getActiveBodyparts(WORK)  ) <=0 ) {
        return true;
    } else if(creep.room.controller.level > 1 && creep.carry.energy >= 0.8 * creep.carryCapacity) {
        let cs = creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD);
        if (cs == ERR_INVALID_TARGET) {
            let extPos = creep.pos.findNearestTerrain(1, true);
            
            extPos && creep.room.createConstructionSite(extPos.x, extPos.y, STRUCTURE_EXTENSION);
        }
    } else {
        let road = creep.pos.lookFor(LOOK_STRUCTURES, {filter: s=> s.structureType === STRUCTURE_ROAD})[0];
        creep.repair(road);
        
    }
    return false;
}