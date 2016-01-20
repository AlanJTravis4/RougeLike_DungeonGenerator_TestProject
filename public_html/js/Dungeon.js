/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
   
   
// To paint the grid we will do three consequtive paints of 3 different layers.
// first we paint the basic dungeon environment
// second we will paint the items into the environment
// third we will paint enemies into the environment.
DungeonGridDisplayLayers = 3;

dungeonEnvironmentLayer = 0;
dungeonItemsLayer = 1;
dungeonEnemyLayer = 2;


// This is the base constructor for a Dungeon.  The InputParameters are passed in
// and copied into local variables, and the dungeonGrid is also initialized 
function Dungeon(parameters) {
    this.numTilesWide = parameters.tileWidthCount();
    this.numTilesHigh = parameters.tileHeightCount();
    this.tileWidthPx = parameters.tw;
    this.tileHeightPx = parameters.th;
    this.dirtPercent = parameters.dirtPercent;
    
    this.initializeDungeonGrid();
}

// This function initializes the DungeonGrid.  The Dungeon is being represented 
// ultimately as a 2D grid.  The grid however has multiple different types of 
// elements that exist within it, so the dungeonGrid is a 3D array where each layer 
// contains the specific type of elements that are appropriate for that layer.
// This approach makes rendering/painting the dungeon simple, in that you pain the 
// lowest level first and then paint each additional layer on over top of it.
// These layers include, for now, the dungeon environment itself  items, and 
// enemies.  The Character is not being represented at this time, although
// it stands to reason that the Character would be just another special type of tile
// with it's own parameters, that would start it's dungeon navigation at the Ladder-Up.
Dungeon.prototype.initializeDungeonGrid = function() {
    
    this.dungeonGrid = new Array (DungeonGridDisplayLayers);
    
    for (var layer = 0; layer < DungeonGridDisplayLayers; layer++) {
        this.dungeonGrid[layer] = new Array(this.numTilesHigh);   

        for (var i = 0; i < this.numTilesHigh; ++i){
            this.dungeonGrid[layer][i] = new Array(this.numTilesWide);

            for (var j = 0; j < this.numTilesWide; ++j){
                
                if (layer == dungeonEnvironmentLayer) {
                    this.dungeonGrid[layer][i][j] = new Rock();
                }
            }
        }
    }
}

// The initial algorithm for carving out the dungeon contains logic that says 
// Too much of the dungeon has been converted to dirt floor... punt and start over.
//
// This is the punt and start over function, which re-initializes the dungeon back 
// to a solid slab of rock, which the algorithm will then carve out again.
Dungeon.prototype.reInitializeDungeonGrid = function(layer) {
    for (var i = 0; i < this.numTilesHigh; ++i){
        for (var j = 0; j < this.numTilesWide; ++j){
            this.dungeonGrid[layer][i][j] = new Rock();
        }
    }
}

// The number of pixels wide for the dungeon.  This is needed because depending on the input
// width and tile width an 800px wide dungeon may actual be 795 px...
// ex 800px and 15px tile... 53 tiles wide @ 15px... needs 795 px instead of 800
Dungeon.prototype.actualDungeonWidth = function() {
    return this.numTilesWide * this.tileWidthPx;
};

// The number of pixels high for the dungeon.  This is needed because depending on the input
// height and tile height an 800px high dungeon may actual be 795 px...
// ex 800px and 15px tile... 53 tiles high @ 15px... needs 795 px instead of 800
Dungeon.prototype.actualDungeonHeight = function() {
    return this.numTilesHigh * this.tileHeightPx;
};

// return a new Coordinate object with the j, i coordinate value turned into pixel
// coordinates within the SVG 
Dungeon.prototype.getTileCoordinates = function(j, i) {
    return new Coordinate(this.tileHeightPx * j, this.tileWidthPx * i);
};

// return a new Coordinate object with the j, i coordinate value turned into pixel
// coordinates within the SVG.  The coordinates for the tile Character are different
// from the solid color tile because instead of top left corner being the anchor
// as with an SVG rect... the bottom left corner is the anchor for text.
Dungeon.prototype.getCharCoordinates = function(j, i) {
    return new Coordinate(this.tileHeightPx * j, this.tileWidthPx * i + (1.0*this.tileWidthPx));
};

// the function picks a random (x,y) location within the dungeon grid.
// the magic number 8 is used to give a bit of padding on the right and bottom
// of the dungeon so that a room can be placed without having to worry if it goes 
// out of bounds.
Dungeon.prototype.getRandomLocation = function(location) {
    var dungeonWidth = this.numTilesWide;
    var dungeonHeight = this.numTilesHigh;
    
    //since location coords are top left corners give some slack to the right
    location.x = getRandomInt(1, dungeonHeight - Math.floor(dungeonHeight/8));
    location.y = getRandomInt(1, dungeonWidth - Math.floor(dungeonWidth/8));
};

// this function gets a random size for a dungeon room.
// the magic number 10 is used because it gives a upper bound for room size that 
// is smaller than the offset of the random room locations.
// meaning... the 8 in the random location on a 100px wide dungeon gives us at least 
// 12 tiles of buffer... and the 10 for size gives us a max room size of 10... 
// so we can cheat and not worry about a room that's going to go out of bounds of our grid.
Dungeon.prototype.getRandomSize = function(size) {
    var dungeonWidth = this.numTilesWide;
    var dungeonHeight = this.numTilesHigh;
    
    //since location coords are top left corners give some slack to the right
    size.w = getRandomInt(2, Math.floor(dungeonWidth/10));
    size.h = getRandomInt(2, Math.floor(dungeonHeight/10));
};

// This function iterates through the layers of the dungeonGrid and generates the 
// HTML SVG object which will be added to the DOM.
Dungeon.prototype.displayDungeonAsSVG = function() {
    var tileLocation;
    var charLocation;
                
    var gridAsSVG = '<svg width="'+this.actualDungeonWidth()+'" height="'+this.actualDungeonHeight()+'" style="-moz-box-sizing: border-box; box-sizing: content-box;">';
    var environmentTiles = "<g>";
    var itemTiles = "<g>";
    var enemyTiles = "<g>";
    
    for (var layer = 0; layer < DungeonGridDisplayLayers; layer++) {
        for (var i = 0; i < this.dungeonGrid[layer].length; ++i){
            for (var j = 0; j < this.dungeonGrid[layer][i].length; ++j){
                if (this.dungeonGrid[layer][i][j]) {
                    tileLocation = this.getTileCoordinates(j,i);
                    charLocation = this.getCharCoordinates(j,i);
                    environmentTiles += '<rect x="'+tileLocation.x+'" y="'+tileLocation.y+'" width="'+this.tileWidthPx+'" height="'+this.tileHeightPx+'" class="'+this.dungeonGrid[layer][i][j].gridClass+'"></rect>'+
                                        '<text x="'+charLocation.x+'" y="'+charLocation.y+'" dy="'+(-1*this.tileWidthPx/4)+'" dx="'+this.tileHeightPx/4+'" font-size="'+(this.tileHeightPx<=15? this.tileHeightPx - 2: 15) +'"" class="gridCharacter">'+this.dungeonGrid[layer][i][j].gridChar+'</text>';
                }
            }
        }
    }
    
    gridAsSVG += environmentTiles + "</g>";
    gridAsSVG += itemTiles + "</g>";
    gridAsSVG += enemyTiles + "</g>";
    
    gridAsSVG += "</svg>";
            
    return gridAsSVG;
};

