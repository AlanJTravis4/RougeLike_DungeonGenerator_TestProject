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
