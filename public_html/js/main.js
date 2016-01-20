/* 
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
}