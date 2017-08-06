'use strict';

/**
 *  ---- SUMMARY ----
 * 
 * newRoomCM()      ---> return new costmatrix and make borders and border's walls hight value.
 * 
 * */


global.newRoomCM = function() {
    var i;
    
    let CostMatrix = new PathFinder.CostMatrix;
    for (i = 0; i < 50; i++) {
        CostMatrix.set(i, 0, 250);
        CostMatrix.set(i, 49, 250);
        CostMatrix.set(0, i, 250);
        CostMatrix.set(49, i, 250);
        
        CostMatrix.set(i, 2, 250);
        CostMatrix.set(i, 47, 250);
        CostMatrix.set(2, i, 250);
        CostMatrix.set(47, i, 250);
    }
    return CostMatrix;
}; 