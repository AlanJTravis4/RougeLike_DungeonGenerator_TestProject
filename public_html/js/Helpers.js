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
};