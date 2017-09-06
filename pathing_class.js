'use strict';

/**
 *  ---- SUMMARY ----
 * Path class :
 * 
 * 23 - constructor(pathName, room)
 * 37 - generate(path)
 * 50 - setPathMemory()
 * 61 - searchParent()
 * 80 - browseParent(parent)
 * 103- elevate(N)
 * 125- setupNode (parsingPath, parent)
 * 134- createNode(oldParent)
 * 165- serialize(arrayPath)
 * 205- zigzag()
 * 293- setupEndPos(pos = 0)
 * 300- finalize()
 * 
 * */
 
module.exports = class Path {
    constructor (name, room) {
        this.name = name;
        this.room = room;
        
		this.path = '';
        this.N = 0;
		this.childrens = [];
		
	    this.deep = 0;
	    this.pos = new RoomPosition(room.center.x, room.center.y, room.name);

		    
    }
    
    generate(path) {
        
	
		path = [this.room.center].concat(path);
        this.path = this.serialize(path);
        this.searchParent();
        
        this.finalize();
        if (config.debug.paths) {
          console.log(`Path to ${this.name} created and reformated.`);
        }
    }
    
    setPathMemory () {
        
        this.room.memory.paths[this.name] = {
    		name: this.name,
    		path: this.path,
    		endPos: this.endPos,
    		deep: this.deep,
    		parent: this.parent || '',
    		childrens: this.childrens || [],
    	};
    }
    searchParent() {
        let paths = this.room.paths; 
		
        let pathsNames = this.room.pathsList[this.deep] || [];
        let pathsAmount = pathsNames.length;
        let p = 0;
        
        while (p < pathsAmount) {
          if (_.eq(this.path[0], paths[pathsNames[p]].path[0])
			  && (this.deep === 0 || _.eq(this.parent, paths[pathsNames[p]].parent))) {
			this.parent = pathsNames[p];
            this.browseParent(this.room.paths[this.parent]);
            return true;
          }
          p++;
        }
		return false;
    }

    browseParent(parent) {
		this.N = 0;
        while (this.path[this.N]) {
			let parentActualDir = parent.path[this.N];
			
			if (!_.eq(this.path[this.N], parentActualDir)) {
				if (parentActualDir) {
					let node = this.createNode(parent);
					
				}
				this.deep++;
				
				this.path = this.path.substr(this.N);
				this.searchParent();
				return;
			}
			this.pos.applyDir(this.path[this.N]);
			this.N++;
			
		} 
		
    }
    
    elevate(N) {
        let deep = this.deep;
        let room = this.room;
        
        let newList = name => {
            return (name !== this.name);
        }
        this.room.pathsList[deep] = this.room.pathsList[deep].filter(newList);
		
		this.deep++;
		
		this.room.pathsList[this.deep] = this.room.pathsList[this.deep] || []
		this.room.pathsList[this.deep].push(this.name);
		if (N) {
		    this.path = this.path.substr(N)
		}
		
		for (let child of this.childrens) {
            this.room.paths[child].elevate();
        }
		
    }
	setupNode (parsingPath, parent) {
    	this.endPos = new RoomPosition(parsingPath.pos.x, parsingPath.pos.y, this.room.name );
    	this.deep = new Number(parsingPath.deep);
		
		this.path = parsingPath.path.substring(0, parsingPath.N);
		
		this.room.nodesAmount++;
		this.room.pathsList[this.deep].push(this.name);
	}
	createNode(oldParent) {
	    let nodeName = 'N' + this.room.nodesAmount;
		
		let node = new Path(nodeName, this.room);
		node.parent = oldParent.parent;
		node.setupNode(this, oldParent);
		node.childrens = [oldParent.name];
		this.room.paths[nodeName] = node;
		this.parent = node.name;
		
		
		let granPa = oldParent.parent;
		if (granPa) {
		    
		    let oldBros = this.room.paths[granPa].childrens;
		    this.room.paths[granPa].childrens = oldBros.filter(pathName => pathName !== oldParent.name);
		    this.room.paths[granPa].childrens.push(nodeName);
		    
		}
		
		
		
		oldParent.parent = node.name;
		oldParent.elevate(this.N);
		
		
		return node;
		
		
	}
	
	serialize(arrayPath) {
        let prevPos;
        let pos;
        let nextPos;
        let serializedPath = '';
        let dirs = {
          '10': 1,
          '20': 2,
          '21': 3,
          '22': 4,
          '12': 5,
          '02': 6,
          '01': 7,
          '00': 8
        };
        let posI= 0;
        let length = arrayPath.length;
        while( posI < length - 1) {
            
            let pos = arrayPath[posI];
            let nextPos = arrayPath[posI + 1];
            let futurePos = arrayPath[posI + 2]
            
            let dir = nextPos && dirs[`${nextPos.x - pos.x + 1}${nextPos.y - pos.y + 1}`];
            let nextDir =futurePos && dirs[`${futurePos.x - nextPos.x + 1}${futurePos.y - nextPos.y + 1}`];
            
            if(futurePos) {
                this.room.CostMatrix.set(pos.x, pos.y, config.layout.exisistingPathsCost);
            }  else {
                this.room.CostMatrix.set(pos.x, pos.y, 0);
            }
            serializedPath += dir;
            
            posI++;
            
        }
        
        return serializedPath; 
    }
    
    zigzag() {
        let newPath = '';
        let prevDir = null;
        let pos;
        let dir;
        if (this.parent) {
            let endPos = this.room.paths[this.parent].endPos 
            pos = new RoomPosition(endPos.x, endPos.y, endPos.roomName)
        } else {
            pos = new RoomPosition(this.room.center.x, this.room.center.y, this.room.center.roomName)
        }
        const ZIGZAG_DIAG = [[0,8,2,2,4,4,6,6,8],
                            [0,2,2,4,4,6,6,8,8]];
        const ZIGZAG_FULL =[[0,8,1,2,3,4,5,6,7],
                            [0,2,3,4,5,6,7,8,1]];
        let j = 0;
        while(j < this.path.length){ //for(let j=0; j<this.path.length; j++){
        	dir = +this.path.charAt(j); // + converts to number
        	if(dir === prevDir){
        	   for ( let D = 0; D < 2; D++) {
        	       let spaceAvailable = 0;
    			    let tempPos = new RoomPosition(pos.x, pos.y , pos.roomName);
    			    
    				tempPos.applyDir(ZIGZAG_FULL[D][dir]);
    				spaceAvailable += tempPos.isOpen() ? 1 : 0;
    				
    				if ( config.layout.optimizeZigZags && tempPos.isOpen()) {
    				    tempPos.applyDir(ZIGZAG_FULL[D][ZIGZAG_DIAG[D][dir]]);     ////// here actuallly !!!!!!! should change applyDir fct for return instead of modify
    				    spaceAvailable += tempPos.isOpen() ? 1 : 0;
    				}
    				
    				if (tempPos.isOpen()) {
    				    if (!config.layout.avoidWalls || dir === 1 || dir === 3 || dir === 5 || dir === 7) {
    				    	pos.applyDir(ZIGZAG_DIAG[D][dir]);
    				        pos.applyDir(ZIGZAG_DIAG[-D + 1][dir]);
                            newPath += ZIGZAG_DIAG[D][dir];
                            newPath += ZIGZAG_DIAG[-D + 1][dir];
                            prevDir = null;
                            break;
    				    } else if (config.layout.avoidWalls){
    				        pos.applyDir(ZIGZAG_FULL[D][dir]);
    				        pos.applyDir(dir)
                            newPath += ZIGZAG_FULL[D][dir];
                            newPath += dir;
                            
                             while(+this.path.charAt(j + 1) === dir) {
                                
                                newPath += dir;
                                pos.applyDir(dir);
                                j++;
                                
                            }
                            //if (+this.path.charAt(j) !== ZIGZAG_FULL[D][dir]) {
                                newPath += ZIGZAG_FULL[-D + 1][dir];
                                pos.applyDir(ZIGZAG_FULL[-D + 1][dir]);
                            //}
                            
                            prevDir = null;
                            break;
    				    }
    				}
    			}
    			
    			if(prevDir != null) {
    			    pos.applyDir(dir);
    			    newPath += dir;
    			    
    			}
        	} else {
        	     if (j < 2 || j > this.path.length - 2) {
        	        newPath += dir;
        		    pos.applyDir(dir);
        		    prevDir = null;
        	    }else if( prevDir == null ){
        			prevDir = dir;
        			j++;
        			continue;
        		} else {
        		    newPath += prevDir;
        		    pos.applyDir(prevDir);
        		    prevDir = dir;
        		}
        	}
        	j++;
        }
        this.path = newPath;
    }
    
    setupEndPos(pos = 0) {
		while ( pos < this.path.length) {
			this.pos.applyDir(this.path[pos]);
			pos++;
		}
    }
    
    finalize() {
        this.parent && this.room.paths[this.parent].childrens.push(this.name);
        this.setupEndPos();
        this.endPos = this.pos;
	    this.room.pathsList[this.deep] = this.room.pathsList[this.deep] || [];
		this.room.pathsList[this.deep].push(this.name)
		
    }
    
 }