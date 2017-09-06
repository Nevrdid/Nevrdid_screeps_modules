'use strict';

/**
 *    ---SUMMARY---
 * Room prototypes :
 * 
 * 13 - verifySourceMem(i)
 * 47 - spawner()
 * 
 * */


Room.prototype.verifySourceMem = function(i) {
    this.memory.sources = this.memory.sources || {};
    let workers = this.memory.sources.workers || [];
    for (let worker of workers) {
        if (!Game.creeps[worker]) {
            this.memory.sources.worksOn -+ 2;
        }
    }
    
    if (this.memory.sources[i] && this.memory.sources[i].pathLength) {
        return this.memory.sources[i];
    }
    this.memory.sources[i] = {};
    
    let path = this.memory.paths['S' + (i + 1)];
    if (!path) return false;
    let pathsT = ['S' + (i + 1)];
    let length = 0;
    let pathNodes = [];
    while (path && path.parent) {
        pathsT.push(path.parent);
        
        path = this.memory.paths[path.parent];
        length += path.path.length;
    }
    
    let l = pathsT.length;
    while (l > 0) {
        pathNodes.push(pathsT[l - 1]);
        l--;
    }
    this.memory.sources[i].pathLength = length;
    this.memory.sources[i].pathNodes = pathNodes;
    this.memory.sources[i].worksOn = 0;
    this.memory.sources[i].workers = [];
    this.memory.sources[i].nameId = 0;
    
    return this.memory.sources[i];

}


Room.prototype.spawner = function() {
    let spawns = this.find(FIND_MY_SPAWNS);
     
    for (let spawn of spawns) {
        if (spawn.spawning) {
            continue;
        }
        
        if(Roles.filler){
            let body;
            if (this.energyAvailable >= 600) {
                body = [MOVE, CARRY, CARRY, CARRY, CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, CARRY];
            } else if (this.energyAvailable >= 450 ) {
                body = [MOVE, CARRY, CARRY, CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];
            } else if (this.energyAvailable >=300 ) {
                body = [MOVE, CARRY, CARRY, CARRY, CARRY,CARRY];
            } else {
                body = [MOVE, CARRY, CARRY, CARRY]
            }
            let creep = spawn.createCreep(body, 'filler', {
                job: {
                    name: 'filler'
                },
                pathing: {
                    path: this.fullPath('Sp', 'N0'),
                    deep: 0,
                    lost: true,
                    reverse: true,
                }
            });
            if (creep == 'filler') continue;
        }
		
        if(Roles.upgrader){
            let body;
            if (this.energyAvailable >= 700) {
                body = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            } else if (this.energyAvailable >=  450 ) {
                body = [WORK, WORK, WORK ,CARRY, MOVE, MOVE];
            } else if (this.energyAvailable >=300 ) {
                body = [WORK, WORK, CARRY, MOVE];
            }
            if (creep == 'upgrader') continue;
            let creep = spawn.createCreep(body, 'upgrader', {
                job: {
                    name: 'upgrader'
                },
                pathing: {
                    path: this.fullPath('C', 'Sp'),
                    deep: 0,
                    lost: true,
                    reverse: true,
                }
            });
            if (creep == 'upgrader') continue;
        }
        
        
        for (let sourceI of [1, 2, 3]) {
            let roomSDatas = this.verifySourceMem(sourceI - 1);
            if (roomSDatas) {  //&& roomSDatas.worksOn < 6
                roomSDatas.nameId = (roomSDatas.nameId + 1 ) % 4 ;
                let body;
                if (this.energyAvailable >= 650) {
                    body = [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY];
                } else if (this.energyAvailable >= 400 ) {
                    body = [MOVE, MOVE, WORK, WORK, CARRY, CARRY];
                } else if ((this.energyAvailable >= 300 )){
                    body = [MOVE, WORK, WORK, CARRY]
                } else {
                    body = [MOVE, WORK, CARRY]
                }
                
                let path = this.fullPath('C', 'S'+ (sourceI))
                let retMiner = spawn.createCreep(body, 'miner'+ sourceI + '-' + roomSDatas.nameId, {
                    job: {
                        name: 'miner'
                    },
                    pathing: {
                        path: path,//this.memory.sources[sourceI - 1].pathNodes,
                        deep: path.length - 2,
                        lost: true,
                        reverse: false,
                    }
                });
                if (retMiner === 'miner'+ sourceI + '-' + roomSDatas.nameId) {
                    //roomSDatas.worksOn = this.energyAvailable >= 650 ? 5 : 2;
                    //roomSDatas.workers.push(creep);
                    
                    this.memory.sources[sourceI - 1] = roomSDatas;
                    break;
                } else if( Roles.hauler && retMiner == ERR_NAME_EXISTS){
                    let body;
                    if (this.energyAvailable >= 600) {
                        body = [MOVE, MOVE,MOVE,MOVE, CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, CARRY];
                    } else if (this.energyAvailable >= 450 ) {
                        body = [MOVE, MOVE, MOVE, CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];
                    } else if (this.energyAvailable >250 ) {
                        body = [ MOVE, MOVE,CARRY,CARRY,CARRY];
                    } else {
                        body = [CARRY, CARRY,MOVE]
                    }
                    let retHauler = spawn.createCreep(body, 'hauler'+ sourceI  + '-' + roomSDatas.nameId, {
                        job: {
                            name: 'hauler'
                        },
                        pathing: {
                            path: this.fullPath('Sp', 'S'+ (sourceI)),
                            deep: 0,
                            lost: true,
                            reverse: false,
                        }
                    });
                    
                    if (retHauler == 'hauler'+ sourceI  + '-' + roomSDatas.nameId) {
                        
                        this.memory.sources[sourceI - 1] = roomSDatas;
                        break;
                    } 
                    if (retMiner === ERR_NAME_EXISTS && retHauler === ERR_NAME_EXISTS){
                        //roomSDatas.nameId = (roomSDatas.nameId + 1 ) % 4 ;//(1 + Math.ceil(roomSDatas.pathLength / 2));
                    }
                }
            
            }
            this.memory.sources[sourceI - 1] = roomSDatas;
        }
        
        
    }
}