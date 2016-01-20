/* 
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

