

global.config = {
    visual: {
        paths: true,
    },
    reset: {
        paths: true,
        sources: true
        
    },
    debug: {
        paths: true,
        cpu: true,
        visualCM: false,
        move: true,
        suicideLosts: true,
    },
    layout: {
        exisistingPathsCost: 1,
        plainCost: 2,
        swampCost: 10,
        exitsCMCost: 10,  // exit CM cost
        exitsThickness: 5, //inner exits cost : exitsCMCost - exitsThickness * 2 
        bordersValue: 4,
        bordersCostReduceByDistance: 1,
        bordersDistanceToIncreaseCost: 2,
        optimizeZigZags: true,
        //avoidWalls: false,    useless with cm method
        pathsToZigZag : {
            N: true,
            S: true, 
            E: true,
            C: true,
            M: true,
        },
        OwnedPathsOrder: ['S', 'E', 'Sp', 'M'],
        RemotePathOrder: ['S', 'C', 'E', 'Sp', 'M']
    }
};