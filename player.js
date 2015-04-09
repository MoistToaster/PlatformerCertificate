var Player = function() {
	this.image = document.createElement("img");
	
	this.position = new Vector2();
	this.position.set(canvas.width/2, canvas.height/2);
	
	this.velocity = new Vector2();
	
	this.width = 165;
	this.height = 125;
	
	this.jumping = false;
	this.falling = false;
	
	this.angularVelocity = 0;
	this.rotation = 0;
	this.image.src = "hero.png";
};

Player.prototype.update = function(deltaTime)
{
	var acceleration = new Vector2();
	var playerAccel = 6000;
	var playerDrag = 12;
	var playerGravity = TILE * 9.8 * 6;
	var jumpForce = 45000;
	
	acceleration.y = playerGravity;
	
	if ( keyboard.isKeyDown(keyboard.KEY_LEFT) )
	{
		acceleration.x -= playerAccel;
	}
	if ( keyboard.isKeyDown(keyboard.KEY_RIGHT) )
	{
		acceleration.x += playerAccel;
	}

	if ( this.velocity.y > 0 )
	{
		this.falling = true;
	}
	else
	{
			this.falling = false;
	}
	
	
	if ( keyboard.isKeyDown(keyboard.KEY_UP) && !this.jumping && !this.falling )
	{
		acceleration.y -= jumpForce;
		this.jumping = true;
	}
	
	//Makes the down arrow apply downwards force on the player
		else if ( keyboard.isKeyDown(keyboard.KEY_DOWN) && this.falling )
	{
		acceleration.y += playerAccel;
		this.jumping = false;
	}
	
	
	
	
	
	var dragVector = this.velocity.multiplyScalar(playerDrag);
	dragVector.y = 0;
	acceleration = acceleration.subtract(dragVector);
	
	this.velocity = this.velocity.add(acceleration.multiplyScalar(deltaTime));
	this.position = this.position.add(this.velocity.multiplyScalar(deltaTime));

	
	var collisionOffset = new Vector2();
	collisionOffset.set(-TILE/2, this.height/2 - TILE);
	
	var collisionPos = this.position.add(collisionOffset);
	
	collisionPos.y = this.position.y + this.height/2 - TILE;
	collisionPos.x = this.position.x - TILE/2;
	
	var tx = pixelToTile(collisionPos.x);
	var ty = pixelToTile(collisionPos.y);
	
	var nx = this.position.x % TILE;
	var ny = this.position.y % TILE;
	
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cell_right = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty);
	var cell_down = cellAtTileCoord(LAYER_PLATFORMS, tx, ty+1);
	var cell_diag = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty+1);
	
	//Actual collision checks
	if ( this.velocity.y > 0 )
	{
		if ( (cell_down && !cell) || (cell_diag && !cell_right && nx) )
		{
			this.position.y = tileToPixel(ty) - collisionOffset.y;
			this.velocity.y = 0;
			ny = 0;
			this.jumping = false;
		}
	}
	else if (this.velocity.y < 0 ) //if moving up
	{
		if ( (cell && !cell_down) || (cell_right && !cell_diag && nx) )
		{
			this.position.y = tileToPixel(ty + 1) - collisionOffset.y;
			this.velocity.y = 0;
			
			cell = cell_down;
			cell_right + cell_diag;
			
			cell_down = cellAtTileCoord(LAYER_PLATFORMS, tx, ty+2);
			cel_diag = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty+2);
			
			ny = 0;
		}
	}
	
	if (this.velocity.x > 0 ) //if we're moving right
	{
		if ( (cell_right && !cell) || (cell_diag && !cell_down && ny) )
		{
			this.position.x = tileToPixel(tx) - collisionOffset.x;
			this.velocity.x = 0;
		}
	}
	else if (this.velocity.x < 0) //if we're moving left
	{
		if ( (cell && !cell_right) || (cell_down && !cell_diag &&ny) )
		{
			this.position.x = tileToPixel(tx+1) - collisionOffset.x;
			this.velocity.x = 0;
		}
	}	
}

Player.prototype.draw = function()
{
	context.save();
	
		context.translate(this.position.x, this.position.y);
		context.rotate(this.rotation);
		context.drawImage(this.image, -this.width/2, -this.height/2);
		
	context.restore();	
}



