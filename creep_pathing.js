'use strict';

/**
*   ---SUMMARY---
* Creep.prototypes :
* 
* 10 - moveToTar(target)
* 
* */

global.UNICODE_ARROWS = {
	[TOP]			: "\u2191",
	[TOP_RIGHT]		: "\u2197",
	[RIGHT]			: "\u2192",
	[BOTTOM_RIGHT]	: "\u2198",
	[BOTTOM]		: "\u2193",
	[BOTTOM_LEFT]	: "\u2199",	
	[LEFT]			: "\u2190",	
	[TOP_LEFT]		: "\u2196"	
};


Creep.prototype.turnBack = function(deepEdit, pathing) {
    pathing = pathing || this.memory.pathing
    let reverse = !pathing.reverse;
    
    pathing.reverse = reverse;
    
    let deep = pathing.deep;
    
    if(deepEdit) {
        pathing.deep += reverse ? -1 : 1;
    } else {
        let actSeqOn = pathing.path[pathing.deep];
        let reverseSeqOn = (!actSeqOn.reverse && reverse)
                || (actSeqOn.reverse && !reverse);
        pathing.step += reverseSeqOn ? -1 : 1;
    }
    
    pathing.endPos = undefined;
    
    pathing.prevPos = this.pos;
    return pathing;
}

Creep.prototype.moveToTar = function (target) {
    let pathing = this.memory.pathing;
    let pos = this.pos;
    if (!pathing && target === undefined) {
        if(config.debug.move) {
            console.log(this.name, ' don\'t have a target to move on.');
        }
        return false;
    }
    if(pathing.deep < 0) {
        if(config.debug.move) {
            console.log(this.name, ' is at start of path');
        }
        
        if (Roles[this.memory.job.name].action(this, -2)) this.turnBack(true);
        return false;
    }
    if (pathing.deep >= pathing.path.length) {
        if(config.debug.move) {
            console.log(this.name, ' is at end of path');
        }
        if (Roles[this.memory.job.name].action(this, 2)) this.turnBack(true);
        return false;
        
    }
    
    let roomMem = this.room.memory;
    let actSeqOn = pathing.path[pathing.deep];
    
    let reverseActualSeq = (!actSeqOn.reverse && pathing.reverse) || (actSeqOn.reverse && !pathing.reverse);
    if (!pathing.endPos) {
        if (reverseActualSeq) {
            if (roomMem.paths[actSeqOn.name] && roomMem.paths[actSeqOn.name].parent) {
                pathing.endPos = roomMem.paths[roomMem.paths[actSeqOn.name].parent].endPos;
            } else {
                pathing.endPos = roomMem.center;
            }
        } else 
            pathing.endPos = roomMem.paths[actSeqOn.name].endPos;
       
    } else {
        if (pos.x === pathing.endPos.x && pos.y === pathing.endPos.y) {
            pathing.deep = pathing.deep + (pathing.reverse ? -1 : 1);
            if (pathing.deep >= 0 && pathing.deep < pathing.path.length)  {
                actSeqOn = pathing.path[pathing.deep];
                reverseActualSeq = (!actSeqOn.reverse && pathing.reverse) || (actSeqOn.reverse && !pathing.reverse);
                    pathing.step = reverseActualSeq ? roomMem.paths[actSeqOn.name].path.length - 1: 0;
            }
            
            this.say(actSeqOn.name);
            pathing.lost = false;
            pathing.endPos = undefined;
            pathing.prevPos = pos;
            
        }
    }
    
     if ( pathing.endPos && pathing.prevPos && (pos.x != pathing.prevPos.x || pos.y != pathing.prevPos.y)) {
            pathing.step += reverseActualSeq ? -1 : 1;
        } else if(!pathing.endPos && Roles[this.memory.job.name].action(this, pathing.reverse ? -1 : 1))
            pathing = this.turnBack(false, pathing);
        else if(pathing.endPos && Roles[this.memory.job.name].action(this, 0)) {
            pathing = this.turnBack(false, pathing);
            
        }
    
    if ( pathing.lost ) {
    	this.moveTo(pathing.endPos.x, pathing.endPos.y);
    } else{
        
       
        /**
        if (Roles[this.memory.job.name].action(this, pathing.reverse ? -1 : 1)) {
            pathing = this.turnBack(false, pathing);
        }
        **/
        
        
        
        
        if(pathing.endPos && !this.fatigue) {
            let path = roomMem.paths[actSeqOn.name].path;
            let dir = path[pathing.step];
            if (!dir) {
                this.memory.pathing.lost = true;
            }
            dir = reverseActualSeq ? (dir > 4 ? Number(dir) - 4 : Number(dir) + 4) : dir;
            pathing.endPos && this.say('' + pathing.step + '-' + UNICODE_ARROWS[dir]);
            this.move(dir);
        } 
        
        
    }
    pathing.prevPos = pos;
    
    if (Game.time % 120 === 0 & !this.memory.job.working ) {
        
        if (pathing.prev10RetPos && pathing.prev10RetPos.x == this.pos.x && pathing.prev10RetPos.y == this.pos.y) {
            if(config.debug.suicideLosts) this.suicide();
            pathing.lost = true;
			pathing.reverse = !pathing.reverse;
			pathing.endPos = undefined;
        }
        pathing.prev10RetPos =  this.pos;
    }
    this.memory.pathing = pathing;
    
};