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
