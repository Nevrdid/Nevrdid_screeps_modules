'use strict';

Room.prototype.displayCM = function() {
    let CM = PathFinder.CostMatrix.deserialize(this.memory.cm);
    for (let i = 0; i<50; i++) {
        for(let j = 0; j < 50; j++) {
            let cost = CM.get(i, j);
            //if (cost < 255) {
                this.visual.rect(i - 0.5, j - 0.5,
                    1 ,1 , {
                    fill: '#000000',
                    opacity: cost / 20
                }); 
            //}
            
        }
    }
}

Room.prototype.displayPaths = function() {
  let pos = new RoomPosition(25 ,25 ,this.name);
  let pathLength;
  let r;
  let c = 0;

  _.each(this.memory.paths, (path, pathName) => {
      
      let colors = ['#3e72d5','#b4269f', '#7bae23', '#7f8068', '#665224' ,'#5c4dbc',
                    '#993b10', '#f3cc01']
      let color = colors[c];
      c++;
      
      pathLength = path.path.length;
       
	  let parentPath = path.parent && this.memory.paths[path.parent];
	  let startPos =  parentPath ? parentPath.endPos : this.memory.center;
	  
      pos.x = startPos.x;
      pos.y = startPos.y;
      r = 0;
      
      while (r < pathLength) {
        this.visual.circle(pos.x, pos.y, {
          fill: color,
          opacity: 0.5 // r / pathLength
        });
        pos.applyDir(path.path[r]);
        
        r++;
        
      }
      this.visual.circle(pos.x, pos.y, {
          fill: '#00aa00',
          opacity: 0.5, 
          radius: 0.5
        });
      this.visual.text(pathName, pos.x, pos.y + 0.2, {
          color: '#ffff00',
          size: 1,
      })
  });
}

