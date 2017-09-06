'use strict';

/**
 *  ---- SUMMARY ----
 * 
 * 11 - newRoomCM()      ---> return new costmatrix and make borders and border's walls hight value.
 * 
 * */


global.newRoomCM = function() {
    var i;
    var j;
    
    let CostMatrix = new PathFinder.CostMatrix;
    /**
    for (i = 0; i < 50; i++) {
        
        CostMatrix.set(i, 0, 0);
        CostMatrix.set(i, 49, 0);
        CostMatrix.set(0, i, 0);
        CostMatrix.set(49, i, 0);
        
        CostMatrix.set(i, 1, 15);
        CostMatrix.set(i, 48, 15);
        CostMatrix.set(1, i, 15);
        CostMatrix.set(48, i, 15);
        
        CostMatrix.set(i, 2, 20);
        CostMatrix.set(i, 47, 20);
        CostMatrix.set(2, i, 20);
        CostMatrix.set(47, i, 20);
        
    }
    **/
    return CostMatrix;
}; 