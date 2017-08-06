'use strict';

/**
 *  ---- SUMMARY ----
 * Path class :
 * 
 * 17 - constructor(startPos, room, path)
 * 36 - serialize()
 * 63 - searchParent()
 * 84 - browseParent()
 * 112- splitParent(startPos)
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
		node.parent = oldParent.parent
		node.setupNode(this, oldParent);
		node.childrens = [oldParent.name]
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
        let serializedPath = '';
        let pos;
        let dirs = {
          '0-1': '1',
          '1-1': '2',
          10: '3',
          11: '4',
          '01': '5',
          '-11': '6',
          '-10': '7',
          '-1-1': '8'
        };
        for (pos of arrayPath) {
          this.room.CostMatrix.set(pos.x, pos.y, 1);
          if (prevPos) {
            let delta = `${pos.x - prevPos.x}${pos.y - prevPos.y}`;
            serializedPath += dirs[delta];
          }

          prevPos = pos;
        }

        return serializedPath; 
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
 
 
 
 
 
 
 
 
 
 
/**
 
 
module.exports = class Path {
    constructor (name, room, parent = undefined) {
        this.name = name;
        this.room = room;
        
		this.path = '';
        this.N = 0;
		this.childrens = [];
		
		if (parent != undefined) {
		    this.parent = parent.name;
		    this.deep = parent.deep + 1;
		    this.pos = new RoomPosition(parent.endPos.x, parent.endPos.y, room.name );
		} else {
		    this.deep = 0;
		    this.pos = new RoomPosition(room.center.x, room.center.y, room.name);
		}
		this.room.pathsList[this.deep] = room.pathsList[this.deep] || [];
		this.room.pathsList[this.deep].push(name);
    }
	
    
    generate(path) {
        this.path = this.serialize(path);
        this.searchParent();
        this.endPos = this.pos;
        if (config.debug.paths) {
          console.log(`Path to ${this.name} created and reformated.`);
        }
    }

    searchParent() {
        let paths = this.room.paths; 
		
        let pathsNames = this.room.pathsList[this.deep];
        let pathsAmount = pathsNames.length;
        let p = 0;
        
        while (p < pathsAmount) {
          if (_.eq(this.path[0], paths[pathsNames[p]].path[0])
			  && (this.deep === 0 || _.eq(this.parent, paths[pathsNames[p]].parent))) {
			      
            this.parent = pathsNames[p];
			this.N = 0;

            this.browseParent();
            return true;
          }
          p++;
        }
		return false;
    }

    browseParent() {
		let paths = this.room.paths || {};
		let parentPath = paths[this.parent];
		
        while (this.path[this.N]) {
			let parentActualDir = parentPath.path[this.N];
			if (!_.eq(this.path[this.N], parentActualDir)) {
				
				this.room.pathsList[this.deep] = this.room.pathsList[this.deep].filter(pathName => 
					pathName !== this.name);
					
					
				if (parentActualDir) {
					this.createNode(parentPath, this.N);
					
					this.room.pathsList[this.deep] = this.room.pathsList[this.deep].filter(pathName => 
						pathName != parentPath.name);
						
					parentPath.deep++;
					this.room.pathsList[parentPath.deep] = this.room.pathsList[parentPath.deep] || [];
					this.room.pathsList[parentPath.deep].push(parentPath.name);
					
					parentPath.path = parentPath.path.substr(this.N);
					
				} else {
					parentPath.childrens.push(this.name);
				}
				this.deep++;
				this.room.pathsList[this.deep] = this.room.pathsList[this.deep] || [];
				this.room.pathsList[this.deep].push(this.name);
				this.path = this.path.substr(this.N);
				this.searchParent();
				
				return;
			}
			this.pos.applyDir(this.path[this.N]);
			this.N++;
			
		} 
		
    }
	
	createNode(oldParent, nodePos) {
		let nodeName = 'Node' + this.room.nodesAmount;
		let node = new Path(nodeName, this.room, oldParent.parent ? this.room.paths[oldParent.parent] : undefined);
		let i = 0;
		while ( i < nodePos) {
			this.pos.applyDir(this.path[i]);
			oldParent.pos.applyDir(this.path[i]);
			node.path += this.path[i];
			i++;
		}
		node.childrens = [this.name, oldParent.name];
		this.endPos = this.pos;
		this.parent = nodeName;
		oldParent.parent = nodeName;
		
		this.room.nodesAmount++;
		this.room.paths[nodeName] = node;
	}
	
	serialize(arrayPath) {
        let prevPos;
        let serializedPath = '';
        let pos;
        let dirs = {
          '0-1': '1',
          '1-1': '2',
          10: '3',
          11: '4',
          '01': '5',
          '-11': '6',
          '-10': '7',
          '-1-1': '8'
        };
        for (pos of arrayPath) {
          this.room.CostMatrix.set(pos.x, pos.y, 1);
          if (prevPos) {
            let delta = `${pos.x - prevPos.x}${pos.y - prevPos.y}`;
            serializedPath += dirs[delta];
          }

          prevPos = pos;
        }

        return serializedPath;
    }
}
**/
