/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// A Coordinate object, to store x,y pairs representing locations within the 
// dungeon grid.
function Coordinate(x, y) {
    this.x = x;
    this.y = y;
}


// A Dimension object, representing the width and height of a random room 
// being created.
function Dimension(width, height) {
    this.w = width;
    this.h = height;
}


// simple random number function that yields numbers between min and 
// max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
};


// Define the InputParamters constructor
// stores the values taken from the text fields on the main web page.
function InputParameters(dw, dh, tw, dirtPercent){
    this.dw = dw;
    this.dh = dh;
    this.tw = tw;
    this.th = tw;
    this.dirtPercent = dirtPercent;
}

// function to determine the tile width based on the input dungeon width and desired tile width
// this is needed for situations like 100px wide dungeon with a 15px tile.  the width is
// not evenly divisible so take the floor of the division, which results in 6.
InputParameters.prototype.tileWidthCount = function(){
    return Math.floor(this.dw / this.tw);
};

// function to determine the tile height based on the input dungeon height and desired tile height
// this is needed for situations like 100px high dungeon with a 15px tile.  the height is
// not evenly divisible so take the floor of the division, which results in 6.
InputParameters.prototype.tileHeightCount = function(){
    return Math.floor(this.dh / this.th);
};/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global InputParameters */

// create a click event handler on the #submit button for generating a random dungeon
$("#submit").click(function (event) {
    // event.preventDefault();
    generateDungeon();
});


// This function is called when the user clicks the "Generate Random Dungeon" Button
function generateDungeon() {
    // Get the input parameters from within the DOM
    var parameters = getInput();
    
    // Validate that the result of getInput is not null and is an instance of the
    // InputParameters class
    if (!(parameters && parameters instanceof InputParameters)) {
        return;
    }
    
    // create and initialize a new Dungeon... all tiles will be Rocks
    var dungeon = new Dungeon(parameters);   
    
    // construct a new DungeonGenerator, and then generate the Dungeon (Physical Environment)
    var dungeonGenerator = new DungeonGenerator(dungeon);
    dungeonGenerator.generate();
        
    //sprinkle the dirt floor with some items, including ladders
    var itemGenerator = new ItemGenerator(dungeon);
    itemGenerator.generate();
    
    //add enemies to the dungeon
    var enemyGenerator = new EnemyGenerator(dungeon);
    enemyGenerator.generate();    
    
    //now display what's been created
    displayDungeon(dungeon);
}


// This function creates a SVG image sized to match the users requested dimensions
// and presents the randomly generated dungeon
function displayDungeon(dungeon) {
    $("#displaySVG")[0].innerHTML = dungeon.displayDungeonAsSVG();
}


// This function attempts to read and validate that the user input is acceptable.
// If the input is valid an InputParameters object is created and returned.
function getInput() {
    var validInput = true;
    $("#errorMessage")[0].innerHTML = "";
            
    var svgWidth = $("#svgWidth")[0].value ? $("#svgWidth")[0].value: $("#svgWidth")[0].placeholder;
    var svgHeight = $("#svgHeight")[0].value ? $("#svgHeight")[0].value: $("#svgHeight")[0].placeholder;
    var tileWidth = $("#tileWidth")[0].value ? $("#tileWidth")[0].value: $("#tileWidth")[0].placeholder;
    var dirtPercent = $("#dirtPercent")[0].value ? $("#dirtPercent")[0].value: $("#dirtPercent")[0].placeholder;
    
    if (!isPositiveInteger(svgWidth, 99, 800)) {
        validInput = false;
        $("#errorMessage")[0].innerHTML = "Error!  Dungeon Width must be a positive integer value, in the range (100..800).  Aborting";
    }
    else if (!isPositiveInteger(svgHeight, 99, 800)) {
        validInput = false;
        $("#errorMessage")[0].innerHTML = "Error!  Dungeon Height must be a positive integer value, in the range (100..800).  Aborting";
    }
    else if (!isPositiveInteger(tileWidth, 9, 100)) {
        validInput = false;
        $("#errorMessage")[0].innerHTML = "Error!  Tile Width must be a positive integer value, in the range (10..100).  Aborting";
    }
    else if (!isPositiveInteger(dirtPercent, 65, 100)) {
        validInput = false;
        $("#errorMessage")[0].innerHTML = "Error!  Dirt Percent must be a positive integer value, in the range (60..100).  Aborting";
    }
    
    if (validInput)
    {
        return new InputParameters(svgWidth, svgHeight, tileWidth, dirtPercent);
    }
    else
    {
        return null;
    }
}


// This function checks to see
// 1) is the input value actually a number.
// 2) is the input value a whole number
// 3) is the whole number greater than the passed in value and less than or equal 
//      to the other passed in value.
function isPositiveInteger(value, gt, lte)
{
    var inputTest = Math.floor(Number(value));
    return (String(inputTest) === value && inputTest > gt && inputTest <= lte);
}/* 
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

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// Tile is the base "Class" object for the dungeon.
//
// Environment Tiles, Items, Characters, Enemies, everything ultimately is at it's root a Tile
function Tile(gridChar, gridClass) {
    this.gridChar = gridChar;
    this.gridClass = gridClass;
}/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// The base class for dungeon environemnt tiles.
function Environment(gridChar, gridClass) {
    Tile.call(this, gridChar, gridClass);
}
// Create a Environment object that inherits from the Environment Prototype.
Environment.prototype = Object.create(Tile.prototype);
// Set the Constructor property to construct a Environment
Environment.prototype.constructor = Environment;


//Define the Rock Constructor
function Rock() {
    Environment.call(this, "#", "rock");
}
// Create a Rock object that inherits from the Environment Prototype.
Rock.prototype = Object.create(Environment.prototype);
// Set the Constructor property to construct a Rock
Rock.prototype.constructor = Rock;


//Define the DirtFloor Constructor
function DirtFloor() {
    Environment.call(this, ".", "dirtFloor");
}
// Create a DirtFloor object that inherits from the Environment Prototype.
DirtFloor.prototype = Object.create(Environment.prototype);
// Set the Constructor property to construct a DirtFloor
DirtFloor.prototype.constructor = DirtFloor;


//Define the Door Constructor
function Door() {
    Environment.call(this, "+", "door");
    this.isOpen = false;
}
// Create a Door object that inherits from the Environment Prototype.
Door.prototype = Object.create(Environment.prototype);
// Set the Constructor property to construct a Door
Door.prototype.constructor = Door;

// Doors within the environment can be opened.
Door.prototype.openDoor = function() {
    this.isOpen = true;
    this.gridChar = "0";
};

// doors within the environment can be closed.
Door.prototype.closeDoor = function() {
    this.isOpen = true;
    this.gridChar = "+";
};


//Define the Corridor Constructor
function Corridor() {
    Environment.call(this, "=", "corridor");
}
// Create a Corridor object that inherits from the Environment Prototype.
Corridor.prototype = Object.create(Environment.prototype);
// Set the Constructor property to construct a Corridor
Corridor.prototype.constructor = Corridor;

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// The game also has Items which the user will be able to interact with
// At their root they are still a tile, but they are a special tile that will
// be placed on top of one of the environmental tile types.
function Item(desc, gridChar, gridClass) {
    Tile.call(this, gridChar, gridClass);
    this.desc = desc;
}
// Create a Item object that inherits from the Tile Prototype.
Item.prototype = Object.create(Tile.prototype);
// Set the Constructor property to construct a Item
Item.prototype.constructor = Item;



//Define the TreasureChest Constructor
function TreasureChest() {
    Item.call(this, "A Treasure Chest", "$", "chest");
}
// Create a TreasureChest object that inherits from the Item Prototype.
TreasureChest.prototype = Object.create(Item.prototype);
// Set the Constructor property to construct a TreasureChest
TreasureChest.prototype.constructor = TreasureChest;



//Define the LadderUp Constructor
function LadderUp() {
    Item.call(this, "A Ladder leading Up", ">", "ladderUp");
}
// Create a LadderUp object that inherits from the Item Prototype.
LadderUp.prototype = Object.create(Item.prototype);
// Set the Constructor property to construct a LadderUp
LadderUp.prototype.constructor = LadderUp;



//Define the LadderDown Constructor
function LadderDown() {
    Item.call(this, "A Ladder leading Down", "<", "ladderDown");
}
// Create a LadderDown object that inherits from the Item Prototype.
LadderDown.prototype = Object.create(Item.prototype);
// Set the Constructor property to construct a LadderDown
LadderDown.prototype.constructor = LadderDown;
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//Define the Trap Constructor
function Trap(desc, gridChar, gridClass) {
    Item.call(this, desc, gridChar, gridClass);
    this.armed = true;
    this.carryable = false;
}
// Create a Trap object that inherits from the Environment Prototype.
Trap.prototype = Object.create(Item.prototype);
// Set the Constructor property to construct a Trap
Trap.prototype.constructor = Trap;

// Traps can be armed
Trap.prototype.setArmed = function(val) {
    this.armed = val;
};

// traps need to be checked to see if they are armed.
Trap.prototype.isArmed = function() {
    return this.armed;
};

// traps can be disarmed... This function can and will be extended to have more
// advanced logic to see if the user succeeded in disarming the trap.
Trap.prototype.disarmTrap = function() {
    this.armed = false;
};

// some traps can be carried... and placed back in the environment by the user to 
// potentially capture an enemy
Trap.prototype.setCarryable = function(val) {
    this.carryable = val;
};

// can this trap be carried.
Trap.prototype.canCarry = function() {
    return carryable;
};


// Define the FirePit Constructor
function FirePit(desc, gridChar, gridclass) {
    Trap.call(this, "A Fire Pit which would most certainly kill", "f", "firePit");
    this.armed = true;
    this.carryable = false;
}
// Create a Trap object that inherits from the Environment Prototype.
FirePit.prototype = Object.create(Trap.prototype);
// Set the Constructor property to construct a Trap
FirePit.prototype.constructor = FirePit;


// Define the Bear Trap Constructor
function BearTrap(desc, gridChar, gridclass) {
    Trap.call(this, "A Bear Trap... That would hurt", "b", "bearTrap");
    this.setCarryable(true);
}
// Create a Trap object that inherits from the Environment Prototype.
BearTrap.prototype = Object.create(Trap.prototype);
// Set the Constructor property to construct a Trap
BearTrap.prototype.constructor = BearTrap;


// Define the BeerTrap Constructor.
// This trap is an homage to WillowTree and your policy on beer)))
function BeerTrap(desc, gridChar, gridclass) {
    Trap.call(this, "A Beer Trap... Hiccup... Drowning in beer might not be such a bad way to go.", "r", "beerTrap");
}
// Create a Trap object that inherits from the Environment Prototype.
BeerTrap.prototype = Object.create(Trap.prototype);
// Set the Constructor property to construct a Trap
BeerTrap.prototype.constructor = BeerTrap;


//Define the Snare Constructor
function Snare(desc, gridChar, gridclass) {
    Trap.call(this, "A small snare... could be helpful in catching lizards", "s", "snare");
    this.setCarryable(true);
    this.setArmed(false);
}
// Create a Trap object that inherits from the Environment Prototype.
Snare.prototype = Object.create(Trap.prototype);
// Set the Constructor property to construct a Trap
Snare.prototype.constructor = Snare;
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// The game also has Enemies which the user will be able to interact with
// At their root they are still a tile, but they are a special tile that will
// be placed on top of one of the environmental tile types.
function Enemy(desc, gridChar, gridClass) {
    Tile.call(this, gridChar, gridClass);
    this.desc = desc;
}
// Create a Item object that inherits from the Tile Prototype.
Enemy.prototype = Object.create(Tile.prototype);
// Set the Constructor property to construct a Item
Enemy.prototype.constructor = Enemy;


//Define the Lizard Constructor
function Lizard() {
    Enemy.call(this, "A Lizard that looks like an easy kill", "~", "lizard");
}
// Create a Lizard object that inherits from the Enemy Prototype.
Lizard.prototype = Object.create(Enemy.prototype);
// Set the Constructor property to construct a Lizard
Lizard.prototype.constructor = Lizard;


//Define the Troll Constructor
function Troll() {
    Enemy.call(this, "A Troll that you might be able to kill", "%", "troll");
}
// Create a Troll object that inherits from the Enemy Prototype.
Troll.prototype = Object.create(Enemy.prototype);
// Set the Constructor property to construct a Troll
Troll.prototype.constructor = Troll;


//Define the Dragon Constructor
function Dragon() {
    Enemy.call(this, "A Dragon that will KILL you!", "D", "dragon");
}
// Create a Dragon object that inherits from the Enemy Prototype.
Dragon.prototype = Object.create(Enemy.prototype);
// Set the Constructor property to construct a Dragon
Dragon.prototype.constructor = Dragon;
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
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global dungeonEnvironmentLayer */

numberOfItemGenerators = 1;

function ItemGenerator(dungeon) {
    var dungeonSelection = Math.floor(Math.random()*999999999 % numberOfItemGenerators);
    
    switch( dungeonSelection ) {
        case 0:
            this.generator = new PoliteSmatteringOfItems(dungeon);
            break;
    }        
}
ItemGenerator.prototype.generate = function() {
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
function BasicItemGenerator(dungeon) {
    this.dungeon = dungeon;
    this.dungeonGrid = dungeon.dungeonGrid[dungeonItemsLayer];
}

// for items a "Good spot" is one where the environment layer consists of dirtFloor.
// Once a dirtFloor tile is found it checks to see if the item layer already has something here.
// if it does then it is not a good spot and will check another different random location.
BasicItemGenerator.prototype.findAGoodSpot = function(location) {
    var goodSpot = false;

    while (!goodSpot){
        this.dungeon.getRandomLocation(location);

        if (this.dungeon.dungeonGrid[dungeonEnvironmentLayer][location.x][location.y] instanceof DirtFloor) {
            if (this.dungeon.dungeonGrid[dungeonItemsLayer][location.x][location.y] == null) {
                goodSpot = true;
            }
        }
    }
};

// this function picks an item at random.  The selection is skewed to give more 
// chances for a TreasureChest to be picked than the traps.
BasicItemGenerator.prototype.pickARandomItem = function() {
    var item = getRandomInt(0,6);
    
    switch (item) {
        case 0:
            return new FirePit();
        case 1:
            return new BearTrap();
        case 2:
            return new BeerTrap();
        case 3:
            return new Snare();
        // I want the selection skewed towards Treasure Chests
        default:
            return new TreasureChest();
    }
}

// Declare the Constructor for a specific implementation of a BasicItemGenerator.
function PoliteSmatteringOfItems(dungeon) {
    BasicItemGenerator.call(this, dungeon)
}
PoliteSmatteringOfItems.prototype = Object.create(BasicItemGenerator.prototype);
PoliteSmatteringOfItems.prototype.constructor = PoliteSmatteringOfItems;

// To Generate a polite smattering of items, this algorithm calculates the value for 1.5%
// of the dungeon area, and then randomly creates that many random items.
// the LadderUp and LadderDown are also created...
PoliteSmatteringOfItems.prototype.generate = function() {
    var location = new Coordinate(0,0);
        
    // let's put about 1.5% of the dungeon area with items.
    var numberOfItems = Math.ceil(this.dungeon.numTilesHigh * this.dungeon.numTilesWide * 0.015);
    
    // add the Ladders
    this.findAGoodSpot(location);
    this.dungeonGrid[location.x][location.y] = new LadderUp();
    this.findAGoodSpot(location);
    this.dungeonGrid[location.x][location.y] = new LadderDown();

    for (var i = 0; i < numberOfItems; i++) {
        this.findAGoodSpot(location);
        this.dungeonGrid[location.x][location.y] = this.pickARandomItem();
    }
};/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global dungeonEnvironmentLayer */

numberOfItemGenerators = 1;

//Define the EmenyGenerator Constructor.
function EnemyGenerator(dungeon) {
    var dungeonSelection = Math.floor(Math.random()*999999999 % numberOfItemGenerators);
    
    switch( dungeonSelection ) {
        case 0:
            this.generator = new PoliteSmatteringOfEnemies(dungeon);
            break;
    }        
}
EnemyGenerator.prototype.generate = function() {
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
function BasicEnemyGenerator(dungeon) {
    this.dungeon = dungeon;
    this.dungeonGrid = dungeon.dungeonGrid[dungeonEnemyLayer];
}

// for items a "Good spot" is one where the environment layer consists of dirtFloor.
// Once a dirtFloor tile is found it checks to see if the item layer already has something here.
// if it does then it is not a good spot and will check another different random location.
BasicEnemyGenerator.prototype.findAGoodSpot = function(location) {
    var goodSpot = false;

    while (!goodSpot){
        this.dungeon.getRandomLocation(location);

        if (this.dungeon.dungeonGrid[dungeonEnvironmentLayer][location.x][location.y] instanceof DirtFloor) {
            
            // this 2nd test isn't "Really" needed... because of the layers.   It's perfectly valid for an 
            // enemy to be standing on top of an item, or even on/in a trap.
            // But for now let's have everything placed in a non overlapping position.
            if (this.dungeon.dungeonGrid[dungeonItemsLayer][location.x][location.y] == null) {
                goodSpot = true;
            }
        }
    }
};

// there are 3 types of enemies possible... one of them is a Dragon... I decided that
// there should only be one dragon per dungeon so this algorithm for picking random 
// enemies only yeilds trolls and lizards.
BasicEnemyGenerator.prototype.pickARandomEnemy = function() {
    var item = getRandomInt(0,2);
    
    switch (item) {
        case 0:
            return new Troll();
        // I want the selection skewed towards Lizards to be nice(ish) to the player
        default:
            return new Lizard();
    }
};

// Dragons in this dungeon are massive hoarders so wherever the dragon has been 
// positioned surrond the dragon with treasure chests.
BasicEnemyGenerator.prototype.surroundDragonWithGold = function(x,y) {
    console.log(x + "  " + y);
    this.testGoodSpotForGold(x-1,y-1);
    this.testGoodSpotForGold(x-1,y);
    this.testGoodSpotForGold(x-1,y+1);
    this.testGoodSpotForGold(x,y-1);
    this.testGoodSpotForGold(x,y);
    this.testGoodSpotForGold(x,y+1);
    this.testGoodSpotForGold(x+1,y-1);
    this.testGoodSpotForGold(x+1,y);
    this.testGoodSpotForGold(x+1,y+1);
};

// This function tests is a specific (x,y) coordinate is a good spot to place a treasure chest.
// if it is determined to be a good spot then a new TreasureChest is added.
BasicEnemyGenerator.prototype.testGoodSpotForGold = function(x,y) {
    if (this.dungeon.dungeonGrid[dungeonEnvironmentLayer][x][y] instanceof DirtFloor) {
        if (this.dungeon.dungeonGrid[dungeonItemsLayer][x][y] == null) {
            this.dungeon.dungeonGrid[dungeonItemsLayer][x][y] = new TreasureChest();
        }
    }
}

// This is an extenstion of the BasicEnemyGenerator.
function PoliteSmatteringOfEnemies(dungeon) {
    BasicEnemyGenerator.call(this, dungeon)
}
PoliteSmatteringOfEnemies.prototype = Object.create(BasicEnemyGenerator.prototype);
PoliteSmatteringOfEnemies.prototype.constructor = PoliteSmatteringOfEnemies;

// This version picks random locations and created enemies.  
// the only specialty is that exactly One dragon is placed within the dungeon, and 
// that dragon is surrounded with treasure chests.
PoliteSmatteringOfEnemies.prototype.generate = function() {
    var location = new Coordinate(0,0);
        
    // let's put about 1.5% of the dungeon area with enemies.
    var numberOfEnemies = Math.ceil(this.dungeon.numTilesHigh * this.dungeon.numTilesWide * 0.015);
    
    // let's only have one dragon per dungeon floor.
    this.findAGoodSpot(location);
    this.dungeonGrid[location.x][location.y] = new Dragon;
    this.surroundDragonWithGold(location.x, location.y);
    
    for (var i = 0; i < numberOfEnemies; i++) {
        this.findAGoodSpot(location);
        this.dungeonGrid[location.x][location.y] = this.pickARandomEnemy();
    }
};