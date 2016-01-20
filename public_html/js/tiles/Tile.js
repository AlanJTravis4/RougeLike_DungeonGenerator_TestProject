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
}