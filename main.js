var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;



	// COMMENTED OUT
//var chuckNorris = document.createElement("img");
//chuckNorris.src = "hero.png";


//ADDED THESE LINES
var keyboard = new Keyboard();
var player = new Player();
var enemy = new Enemy();
//var vector2 = new Vector2object();



// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var LAYER_COUNT = 4;
var MAP = {tw:40, th:30}; //set this to size of map
var TILE = 35;
var TILESET_TILE = 70;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

var LAYER_BACKGROUND = 0;
var LAYER_OBJECTS = 1;
//Fix death layer json
//var LAYER_DEATH = 2;
var LAYER_PLATFORMS = 2;
var LAYER_LADDERS = 3;

var tileset = document.createElement("img");
tileset.src = "tileset.png";

//Collision array
var cells = [];

function initializeCollision()
{
	//loop through each layer
	for ( var layerIdx = 0; layerIdx < LAYER_COUNT ; ++layerIdx )
	{
		cells[layerIdx] = [];
		var idx = 0;
	
		//loop through each row
		for ( var y = 0; y < level1.layers[layerIdx].height ; ++y )
		{
			cells[layerIdx][y] = [];
		
			//loop through each cell
			for ( var x = 0; x < level1.layers[layerIdx].width ; ++x )
			{
				if ( level1.layers[layerIdx].data[idx] != 0 )
				{
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y][x+1] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y-1][x] = 1;	
				}
				else if ( cells[layerIdx][y][x] != 1 )
				{
					cells[layerIdx][y][x] = 0;
				}
				
				++idx;
			}
		}
	}
}


function tileToPixel(tile_coord)
{
	return tile_coord * TILE;
}

function pixelToTile(pixel)
{
	return Math.floor(pixel / TILE);
}

function cellAtTileCoord(layer, tx, ty)
{
	//if off the top, left or right of the map
	if ( tx < 0 || tx > MAP.tw || ty < 0 )
	{
		return 1;
	}
	
	if ( ty >= MAP.th )
	{
		return 0;
	}
	
	return cells[layer][ty][tx];
}

function cellAtPixelCoord(layer, x, y)
{
	var tx = pixelToTile(x);
	var ty = pixelToTile(y);
	
	return cellAtTileCoord(layer, tx ,ty);
}


//DRAWS THE MAP
function drawMap()
{
	//this loops over all the layers in our tilemap
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++ )
	{
		//render everything in the current layer (layerIdx)
		//look at every tile in the layer in turn and render them
		
		var idx = 0;
		//look at each row
		for ( var y = 0 ; y < level1.layers[layerIdx].height ; ++y )
		{
			//look at each tile in the row
			for ( var x = 0 ; x < level1.layers[layerIdx].width ; ++x )
			{
				var tileIndex = level1.layers[layerIdx].data[idx] - 1;
				
				//if there's actually a tile here
				if ( tileIndex != -1 )
				{
					//draw the current tile at the current location
					
					//where in the tilemap is the current tile?
					//where in the world should the current tile go?
					
					//source x in the tileset
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * 
										(TILESET_TILE + TILESET_SPACING);
							
					//source y in the tileset		
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * 
												(TILESET_TILE + TILESET_SPACING);
					
					//destination x on the canvas
					var dx = x * TILE;
					//destination y on the canvas
					var dy = (y-1) * TILE;
					
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
												dx, dy, TILESET_TILE, TILESET_TILE);
				}
				++idx;
			}
		}
	}
}	
	


//RUNS THE GAME
function run()
{
	context.fillStyle = "#7c7979";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();
	
	
	//added these lines
	player.update(deltaTime);
	player.draw();
	
	enemy.update(deltaTime);
	enemy.draw();
	drawMap();
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#000";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
}

initializeCollision();


//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
