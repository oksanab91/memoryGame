
//variables
var stage = null; 
var renderer = null;
var ratio = 320 / 480;

//Set aliases
var Container = PIXI.Container,
autoDetectRenderer = PIXI.autoDetectRenderer,
loader = PIXI.loader,
resources = PIXI.loader.resources,
Sprite = PIXI.Sprite,
TextureCache = PIXI.TextureCache,
TextPixi = PIXI.Text,
Rectangle = PIXI.Rectangle;

//Main logic of the game
var gameProcess = {
    tiles: [],
    tileColsNum: 0,
    tileRowsNum: 0,
    firstTile: null,
    secondTile: null,
    countClicked: 0,
    countTilesOpen: 0,
   
    messageEnd: new TextPixi(
            "You won!",
            { fontFamily: "Arial", fontSize: 52, fill: "#ff0080" }),

    endGame: false,

    //Create a Pixi stage and renderer
    gameStageSet: function(cols, rows){
        //320 by 480  256, 256

        this.tileColsNum = cols;
        this.tileRowsNum = rows;

        var type = "WebGL"
        if(!PIXI.utils.isWebGLSupported()){
            type = "canvas"
            //to check if pixi is loaded properly
            // PIXI.utils.sayHello(type)
        }    

        //Fill array of tiles with shapes for the game
        this.tiles = tileArraySetup();

        //Create a Pixi stage and renderer 
        //and add the renderer.view to the DOM        
        renderer = autoDetectRenderer(320,480,{
            initialising: false,
            transparent: true,
            alpha: 0.5,
            resolution: 1            
        }); 
     
        document.body.appendChild(renderer.view);
        renderer.backgroundColor = '0x660027';
        stage = new Container(); 
        renderer.render(stage);

        //Set renderer properties		
        renderer.view.style.position = "absolute";
        renderer.view.style.top = "50px";
        renderer.view.style.left = "0px";
		renderer.view.style.display = "block";
		renderer.autoResize = true;        
		renderer.resize(window.innerWidth, window.innerHeight - 50);
        		
		//Refresh the screen
        animate();

        //Load texture atlas
        loader.add("shapeSheet.json").once('complete', this.gameSetup.bind(this)).load();

        return this;
    },

    //Set the game properties
    gameSetup: function () {        
        var tilesArray = this.tiles;
        var tileColsNum = this.tileColsNum;
        var tileRowsNum = this.tileRowsNum;

        var firstTile = this.firstTile;
        var secondTile = this.secondTile;       
        var messageEnd = this.messageEnd;

        var colWidth;
        var colHeight;
        if(tileColsNum>0 && tileRowsNum>0){
            colWidth = window.innerWidth / tileColsNum - 4;
            colHeight = (window.innerHeight - 50)/ tileRowsNum - 4;
        }
        //----------------------------------------------------
               
        var setId = 0;        

        //Start the loop to create sprites by tilesArray items
        //and fill the stage with shapes images created from preloaded texture atlas
        for(var row = 0; row < tileRowsNum; row ++){    
            for (var col = 0; col < tileColsNum; col++) {

                //Index to select shape from the shapes array
                setId++;

                //Create new sprite - tile              
                var id = tilesArray[setId-1];
                var texture = TextureCache[id];                
                var shape = new Sprite(texture);

                shape.keyTile = id;
                //Make tile interactive
                shape.buttonMode=true;
                shape.interactive = true;                
                shape.isSelected=false;
                shape.tint = 0x000000;
                shape.alpha = 0.5;
                shape.transparent = false;

                //Handle tile events
                shape.mousedown = shape.touchstart = function (mouseData) {

                    //Start and continue to count events
                    var countClicked = gameProcess.countClicked;
                    var countTilesOpen = gameProcess.countTilesOpen;
                    var endGame = gameProcess.endGame;
                 
                    //If tile is clicked
                    if(!this.isSelected){
                        this.isSelected = true;
                        // show the tile
                        this.tint = 0xffffff;
                        this.alpha = 1;
                                                
						//Refresh the screen
                        animate();
                    }

                    //Remember first tile in the pare
                    if(countClicked < 2){        
                        countClicked ++;
                        if(countClicked < 2){
                            firstTile = this;
                        }        
                    }

                    //Remember second tile in the pare
                    if(countClicked === 2){                                                
                        secondTile = this;                       

                        if(firstTile !== null || secondTile !== null){
                        
                            //Compare two tiles in the pare -
                            //if they are the same, do not hide the shapes of the tiles                                                    
                            if(firstTile.keyTile === secondTile.keyTile &&
                                firstTile != secondTile){
                                secondTile.tint = 0xffffff;
                                secondTile.alpha = 1;

                                countTilesOpen += 2;
                            }else{
                                //Wait a second then hide the selected pare of the tiles
                                runTimer(firstTile, secondTile);
                            }
                            //Refresh the screen
                            animate();

                            //Check if the game is completed
                            if (countTilesOpen === tileRowsNum * tileColsNum) {
                                endGame = true;
                            }
                        }

                        //Clear the pare of tiles objects
                        firstTile = null;
                        secondTile = null;
                        countClicked = 0;                         
                    }
                    
                    //Game is completed
                    if (endGame) {
                       //Display message at the end of the game
                        messageEnd.position.set(window.innerWidth / 4, colHeight * 2 - 25);
                        						
                        stage.addChild(messageEnd);

                        //Update the screen                        
                        animate();
                       //gameProcess.playSound();
                    }

                    //Preserve events counters
                    gameProcess.countClicked = countClicked;
                    gameProcess.countTilesOpen = countTilesOpen;
                    gameProcess.endGame = endGame;

					//Refresh the screen
                    animate();

                };
                //End of handling tile events

                //Set the size of the sprites               
                shape.position.set(col * (colWidth + 4), row * (colHeight + 4)); //(col*154,row*174);  ,150,170
                shape.width = colWidth; //150;
                shape.height = colHeight; //170;                
                stage.addChild(shape);                
            }
        }
        //End of filling tiles loop
		
		//Update the screen
        animate();

        return (this);
    },
    //End of gameSetup

    //Hide all the sprites and the text, prepare stage for the new game
    clearStage: function () {
   
        //Remove message from the stage
        if (stage.getChildAt(stage.children.length - 1) === window.gameProcess.messageEnd) {
            stage.removeChild(window.gameProcess.messageEnd);
        }

        //Hide all the sprites
        stage.children.forEach(function (sprite) {
            sprite.isSelected = false;
            sprite.tint = 0x000000;
            sprite.alpha = 0.5;
        });

        //Refresh the screen        
        animate();

        window.gameProcess.countClicked = 0;
        window.gameProcess.countTilesOpen = 0;
        window.gameProcess.endGame = false;
        
        // var player = document.getElementById("player");
        // player.pause();
        // player.currentTime = 0;
    },

    playSound: function () {
        var player = document.getElementById("player");
        player.src = '../img/twist_away.mp3';
        player.play();        
    }
};
//End section 'Main logic of the game'

//Refresh the screen
function animate(){
        //alert("animate start");        
        renderer.render(stage);
        window.requestAnimationFrame(animate.bind(window.gameProcess));
        //return this;
    }

//Wait a second, then hide the selected pare of the tiles
function runTimer(firstTile, secondTile) {    
    window.gameProcess.firstTile = firstTile;
    window.gameProcess.secondTile = secondTile;
  
    setTimeout(function () {
        hideTiles();      
    }, 1000);
}

//Hide the wrong selected pare of tiles
function hideTiles(){        
    var firstTile = window.gameProcess.firstTile;
    var secondTile = window.gameProcess.secondTile;

    //Change sprites' properties in order to hide them
    firstTile.tint = 0x000000;
    firstTile.alpha = 0.5;
    firstTile.isSelected = false;
    secondTile.tint = 0x000000;
    secondTile.alpha = 0.5;
    secondTile.isSelected = false;

    //Update the screen   
    animate();
}

//1 create two copy of array,
//2 run through these arrays and pickup one item from each by random Index,
//3 remove picked item from the source array
function tileArraySetup() {
    var tileResult = [];
    var tileOriginal = [];    
    var shapes = ["shape1.png", "shape2.png", "shape3.png", "shape4.png", "shape5.png", "shape6.png"];
   
    //Create copy of the array
    tileOriginal = shapes.slice();
    var tileOriginalLength = tileOriginal.length;
    var randomInd;
    var tile;
    
    //Run through the array and pickup one item by random Index
    //Get the item and remove it from the source array
    //Add the item to result array
    var ind = 0;
    while(ind < tileOriginalLength){
        //Random index
        randomInd = Math.floor((Math.random() * tileOriginal.length) + 1);
        //Picked item
        tile = tileOriginal.splice(randomInd - 1, 1);
        //Result array
        tileResult = tileResult.concat(tile);

        ind ++;
    }
    //Create copy of the array
    tileOriginal = shapes.slice();
     
    //Run through the array again, pickup one item by random Index 
    //and add the item to result array
    ind = 0;
    while (ind < tileOriginalLength) {
        //Random index
        randomInd = Math.floor((Math.random() * tileOriginal.length) + 1);
        //Picked item
        tile = tileOriginal.splice(randomInd - 1, 1);
        //Result array
        tileResult = tileResult.concat(tile);

        ind++;
    }
    return (tileResult);
}

