/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

numberOfDungeonGenerators = 1;

// Define the Constructor for a Dungeon Generator.
// The Generator itself does not contain the business logic for how to generate 
// the dungeon.  It instead decides which type of dungeon to create, and assigns
// to it's local generator an instance of the appropriate Dungeon Generator.
function DungeonGenerator(dungeon) {
    var dungeonSelection = Math.floor(Math.random()*999999999 % numberOfDungeonGenerators);
    
    switch( dungeonSelection ) {
        case 0:
            this.generator = new LargeCavernNoDoorsOrCorridors(dungeon);
            break;
    }        
}
DungeonGenerator.prototype.generate = function() {
    // the thought here is that there can be many different types of generators, 
    // from very simple ones that create an arena, to ones that create twisting
    // to ones that include doors and caverns, to secret passage ways, rivers, 
    // buildings, anc more. 
    // 
    // there will be common functionality, since every dungeon starts from a grid
    // of rock... The rock will be carved out, shaped, and other things added.
    // But the algorithm for how to carve, and shape can be contained within each 
    // specialized generator.
    this.generator.generate();
};



// Create a base class Generator.
function BasicDungeonGenerator(dungeon) {
    this.dungeon = dungeon;
    this.dungeonGrid = dungeon.dungeonGrid[dungeonEnvironmentLayer];
    this.dirtFloorTileCount = 0;
    this.foundDirtFloorTiles = [];
    this.connectedDirtFloorTiles = 0;
    
}

// regardless of the DungeonGenerator type it made sense that they would ALL 
// need to carve out the rock.  This function Carves out a square room.  Given 
// this approach there could also be carveOutTriangle, carveOutDiamond, carveOut<pattern>
// functions which could be used by all generators.
BasicDungeonGenerator.prototype.carveOutSquare = function(topCorner, dimensions) {
    
    // change any rock tiles to dirtFloor tiles
    // the 2nd test in each for loop is to allow for at least 1 rock around the 
    // right and bottom edge.
    for (var i = topCorner.x; i < topCorner.x + dimensions.h && i < this.dungeon.numTilesHigh - 1; i++) {
        for (var j = topCorner.y; j < topCorner.y + dimensions.w && j < this.dungeon.numTilesWide - 1; j++) {
            delete this.dungeonGrid[i][j];
            this.dungeonGrid[i][j] = new DirtFloor();
        }
    }
};

// some algorithms will need/want to know what percentage of the dungeon has been
// converted from rock to dirt floor.
// This function returns that percentage.
BasicDungeonGenerator.prototype.remainingRockPercentage = function() {
    var totalTiles = this.dungeon.numTilesHigh * this.dungeon.numTilesWide;
    var dirtTiles = 0;
    
    for (var i = 0; i < this.dungeon.numTilesHigh; i++) {
        for (var j = 0; j < this.dungeon.numTilesWide; j++) {
            if (this.dungeonGrid[i][j] instanceof DirtFloor) {
                dirtTiles++;
            }
        }
    }    
    
    this.dirtFloorTileCount = dirtTiles;
    
    return Math.floor(dirtTiles / totalTiles * 100);
};

// This function is part of the set of functions used to find connected rooms, 
// 
// This function tests to see if a given (i,j) coordinate is DirtFloor and that 
// it has not already been cataloged.
//
// if it is dirt and hasn't been seen before Catalog it.  Cataloging kicks the 
// recursive function which checks the tiles up, down, left, and right, of the 
// newly cataloged tile.
BasicDungeonGenerator.prototype.isNewDirtTile = function(i,j) {
    if ( (this.dungeonGrid[i][j] instanceof DirtFloor) &&
         (this.foundDirtFloorTiles.indexOf(i+","+j) == -1) ) {
        this.catalogConnectedTile(i,j);
    }   
};

// this function increments the count of connected dirtFloor tiles, and pushes
// a string into an array which is easily searched later to tell if we've cataloged this
// tile before or not.
BasicDungeonGenerator.prototype.catalogConnectedTile = function(i,j) {
    this.connectedDirtFloorTiles++;
    this.foundDirtFloorTiles.push(i+","+j);
    this.findAllConnectedTiles(i,j);
};

// in order to find all connected tiles we need to call isNewDirtTile to check the 
// tiles up, down, left, and right of the current tile.
// this function does exactly that.
BasicDungeonGenerator.prototype.findAllConnectedTiles = function(i,j) {
    // check the 4 tiles up down left right of this one
    // if it's dirt and hasn't already been cataloged then it's a new connection
    this.isNewDirtTile(i,j+1);
    this.isNewDirtTile(i,j-1);
    this.isNewDirtTile(i+1,j);
    this.isNewDirtTile(i-1,j);
};



// Define the constructor for a LargeCavernNoDoorsOrCorridors DungeonGenerator.
//
// This Generator as the name suggests creates one large twisty turny cavern without
// doors or corridoors.
function LargeCavernNoDoorsOrCorridors(dungeon) {
    BasicDungeonGenerator.call(this, dungeon)
}
LargeCavernNoDoorsOrCorridors.prototype = Object.create(BasicDungeonGenerator.prototype);
LargeCavernNoDoorsOrCorridors.prototype.constructor = LargeCavernNoDoorsOrCorridors;

// to generate this dungeon the algorithm defines a percentage of the dungeon to 
// convert from rock to dirt.  Once that percentage of the dungeon has been carved out 
// the algorithm checks to see if the created dungeon is one completely connected.
// if it is not then the percentage is increased, more tiles are carved out, and then the
// connected test is done again.
LargeCavernNoDoorsOrCorridors.prototype.generate = function() {
    var donePercentage = 42;
    var needMoreRooms = true;
    
    while (needMoreRooms) {
        this.carveRandomSquaresUntilDone(donePercentage);

        this.findOrphanedRooms();
    
        if (this.connectedDirtFloorTiles != this.dirtFloorTileCount) {
            // reset these variable, we're going to punt, add a few more random
            // rooms, and then check again.    
            this.foundDirtFloorTiles = [];
            this.connectedDirtFloorTiles = 0;
        }   
        else {
            needMoreRooms = false;
        }
    
        donePercentage += 4;
        
        // this percentage should be configurable
        if (donePercentage > this.dungeon.dirtPercent) {
            // the map is going to be ugly... I'm looking for something with twists and
            // turns, not just a big arena.
            //
            // take the time and computation hit... reset and try again
            this.dungeon.reInitializeDungeonGrid(dungeonEnvironmentLayer);
            donePercentage = 42;
            needMoreRooms = true;
        }
    }
    
    console.log(donePercentage);
};

// this function gets a random location and a random size and get's to carving.
// it does not care about collisions with other previous rooms.
// in fact that is desired/required for this function to work.
// the twists and turns of the cavern come from different room sizes being carved out
// with some amount of overlap, so that the the dunction can be completely connected.
LargeCavernNoDoorsOrCorridors.prototype.carveRandomSquaresUntilDone = function(donePercentage) {
    var location = new Coordinate(0,0);
    var size = new Dimension(0,0);
        
    while(this.remainingRockPercentage() < donePercentage) {
        // pick a random location
        this.dungeon.getRandomLocation(location);
        this.dungeon.getRandomSize(size);
        
        this.carveOutSquare(location, size);
    }
};

// This function searches for the first dirt tile it can find, and then calls a 
// recursive algorithm to see if all of the dirt tiles are connected.
LargeCavernNoDoorsOrCorridors.prototype.findOrphanedRooms = function() {
    var location = new Coordinate(0,0);
    var size = new Dimension(0,0);
    
    var dungeonWidth = this.dungeon.numTilesWide;
    var dungeonHeight = this.dungeon.numTilesHigh;
    
    var printVal = 0;
    
    // iterate through the grid top, down, left, right, looking for a dirtFloor tiles.
    for (var i = 0; i < this.dungeon.numTilesHigh; i++) {
        for (var j = 0; j < this.dungeon.numTilesWide; j++) {
            if (this.dungeonGrid[i][j] instanceof DirtFloor) {
                this.catalogConnectedTile(i,j);
                
                // for this SIMPLE algorithm we aren't going to add corridors, or dig 
                // paths to connect the rooms, we're going to simply dig more squares
                // until we have built a dungeon that is completely connected.
                return;
            } 
        }
    }  
};
