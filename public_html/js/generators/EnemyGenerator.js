/* 
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