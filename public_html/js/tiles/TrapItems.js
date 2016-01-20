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
