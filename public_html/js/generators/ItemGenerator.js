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
};