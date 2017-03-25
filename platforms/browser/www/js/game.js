
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


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
Text = PIXI.Text,
Rectangle = PIXI.Rectangle;
//PIXI.Application(); ??


//Main logic of the game
var gameProcess = {
    tiles: [],
    tileColsNum: 0,
    tileRowsNum: 0,
    firstTile: null,
    secondTile: null,
    countClicked: 0,
    countTilesOpen: 0,
   
    messageEnd: new Text(
            "You won!",
            { fontFamily: "Arial", fontSize: 52, fill: "#b82e8a" }),

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
        };
    

        //Fill array of tiles with shapes for the game
        this.tiles = tileArraySetup();

        //Create a Pixi stage and renderer and add the 
        //renderer.view to the DOM
        // stage = new Container(); 
        renderer = autoDetectRenderer(320,480,{
            initialising: false,
            transparent: true,
            alpha: 0.5,
            resolution: 1            
        }); //window.innerWidth, window.innerHeight
        
        //backgroundColor: '0xff0000' //'0x1e3d7b' //'0x86D06F'

        

        // stage.width = renderer.width;
        // //stage.width = renderer.view.width/renderer.resolution; ??
        // stage.height = renderer.height;
        

        // var gameStage = document.getElementById("gameStage");
        // gameStage.appendChild(renderer.view);
        document.body.appendChild(renderer.view);
        renderer.backgroundColor = '0x990000'; //'0x1e3d7b'; // '0xff0000'++;

        stage = new Container(); 
        renderer.render(stage);
		renderer.view.style.boder = "1px dashed black";
		
        renderer.view.style.position = "absolute";
        renderer.view.style.left = "1px";
		renderer.view.style.display = "block";
		renderer.autoResize = true;        
		renderer.resize(window.innerWidth, window.innerHeight-50);
		
		//Refresh the screen
        animate();

        // renderer.view.style.top = "0px";
        

        //For resizing the game
        //PIXI.BaseTexture.SCALE_MODE.DEFAULT = PIXI.BaseTexture.SCALE_MODE.NEAREST;
        //PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		//.onComplete = this.tileArraySetup()
        // use callback
		
        //"https:///github.com//oksanab91//memoryGame//tree//master//www//img//shapeSheet.json"

        loader.add("../img/shapeSheet.json").once('complete', this.gameSetup.bind(this)).load(); //this.gameSetup
        //loader.add({name: "shapeSheet.json", url: "https://raw.githubusercontent.com/oksanab91/memoryGame/master/www/img/shapeSheet.json", crossOrigin: true})
        //.once("complete", this.gameSetup.bind(this)).load(); //this.gameSetup

		//loader.add("http://localhost:8080/img/shapeSheet.png").once('complete', this.gameSetup.bind(this)).load(); //this.gameSetup
		
        return this;
    },

    //Set game properties
    gameSetup: function () {

        var tilesArray = this.tiles;
        var tileColsNum = this.tileColsNum;
        var tileRowsNum = this.tileRowsNum;

        var firstTile = this.firstTile;
        var secondTile = this.secondTile;       
        var messageEnd = this.messageEnd;
      
        //Set renderer properties
        //renderer.view.style.position="absolute";
        // renderer.view.style.display="block";
        // renderer.autoResize=true;
        //renderer.resize(window.innerWidth, window.innerHeight);

        //----------------------------------------------------
               
        var setId = 0;        

        //Start loop to create sprites by tilesArray items
        //and fill the stage with shapes images created from preloaded texture atlas
        for(var row = 0; row < tileRowsNum; row ++){    
            for (var col = 0; col < tileColsNum; col++) {

                //Index to select shape from the shapes array
                setId++;
                                
                var id = tilesArray[setId-1];
                var texture = TextureCache[id];
                //var texture = loader.resources[id].texture;
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
                        //shape.transparent = false;
                        
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

                        if(firstTile != null || secondTile != null){
                        
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
                            
                            animate();

                            if (countTilesOpen === tileRowsNum * tileColsNum) {
                                endGame = true;
                            }
                        }

                        //Clear the pare of tiles objects
                        firstTile = null;
                        secondTile = null;
                        countClicked = 0;                         
                    }
                    
                    if (endGame) {                        
                        messageEnd.position.set(window.innerWidth / 4, (window.innerHeight - 50) / 2); //??
						//messageEnd.position.set(renderer.view.style.width / 5, renderer.view.style.height / 2); //??
                        stage.addChild(messageEnd);
                        
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
                var w = ((window.innerWidth) / tileColsNum) ;
                var h = ((window.innerHeight -50)/ tileRowsNum) ;   
				// //var w = (renderer.view.style.width / tileColsNum) ;
                // //var h = (renderer.view.style.height / tileRowsNum) ; 
                // var w=100;
                // var h=100;

                stage.addChild(shape);
                shape.position.set(col * w, row * h); //(col*154,row*174);  ,150,170
                shape.width = w-2; //150;
                shape.height = h-4; //170;                
            }
        }
        //End of filling tiles loop
		
		//Update the screen
        animate();
        return (this);
    },
    //End of gameSetup

    //Hide all the sprites and text for the new game
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
    };

function runTimer(firstTile, secondTile) {
    //myVar = setTimeout(function () { alert("Hello") }, 3000);
    window.gameProcess.firstTile = firstTile;
    window.gameProcess.secondTile = secondTile;
  
    setTimeout(function () {
        hideTiles();      
    }, 1000);

};

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
};

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

    //Run through the array and pickup one item by random Index
    //Get the item and remove it from the source array
    //Add the item to result array
    var ind = 0;
    while(ind < tileOriginalLength){
        //Random index
        var randomInd = Math.floor((Math.random() * tileOriginal.length) + 1);
        //Picked item
        var tile = tileOriginal.splice(randomInd - 1, 1);
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
        var randomInd = Math.floor((Math.random() * tileOriginal.length) + 1);
        //Picked item
        tile = tileOriginal.splice(randomInd - 1, 1);
        //Result array
        tileResult = tileResult.concat(tile);

        ind++;
    }

    return (tileResult);
};

//Resize the game stage and the tiles
function resize() {
    if (window.innerWidth / window.innerHeight >= ratio) {
        var w = (window.innerHeight -50) * ratio;
        var h = window.innerHeight - 50;
    } else {
        var w = window.innerWidth;
        var h = (window.innerWidth) / ratio;
    }
    renderer.view.style.width = w - 2 + 'px';
    renderer.view.style.height = h - 4 + 'px';
};
window.onresize = resize;

