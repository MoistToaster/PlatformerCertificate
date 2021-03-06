var Player = function()
 {
	//Put filename in
	this.sprite = new Sprite("ChuckNorris.png");
	
	
	//LEFT SIDE ANIMATIONS
	
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, 
		[0, 1, 2, 3, 4, 5, 6, 7]); //LEFT IDLE ANIMATION
									
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, 
		[8,9,10,11,12]); //LEFT JUMP ANIMATION
	
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, 
		[12, 14, 15, 16, 17, 18, 19, 20, 21, 21, 22, 23, 24, 25, 26]); //LEFT WALK ANIMATION
	
	
	//RIGHT SIDE ANIMATIONS
	
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, 
		[52, 53, 54, 55, 56, 57, 58, 59]); //RIGHT IDLE ANIMATION
									
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, 
		[60, 61, 62, 63, 64]); //RIGHT JUMP ANIMATION
	
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, 
		[65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]); //RIGHT WALK ANIMATION
	
	
	this.width = 165;
	this.height = 125;
	
	this.health = 100;
	
	
	for ( var i = 0 ; i < ANIM_MAX ; ++i)
	{
		this.sprite.setAnimationOffset(i, -this.width/2, -this.height/2);
	}
	
	this.startPos = new Vector2();
	this.startPos.set(canvas.width/10, canvas.height/1.3);
	
	
	
	this.position = new Vector2();
	this.position.set(this.startPos.x, this.startPos.y);
	
	this.velocity = new Vector2();
	
	
	
	this.jumping = false;
	this.falling = false;
	
	this.direction = RIGHT;
	
	this.angularVelocity = 0;
	this.rotation = 0;
	
	};


Player.prototype.changeDirectionalAnimation = function(leftAnim, rightAnim)
{
	if ( this.direction == LEFT)
	{
		if ( this.sprite.currentAnimation != leftAnim )
		{
			this.sprite.setAnimation(leftAnim);
		}
	}
	else
	{
		if ( this.sprite.currentAnimation != rightAnim )
		{
			this.sprite.setAnimation(rightAnim);
		}
	}
}

	
Player.prototype.update = function(deltaTime)
{

	this.sprite.update(deltaTime);
	
	
	var acceleration = new Vector2();
	var playerAccel = 6000;
	var playerDrag = 12;
	var playerGravity = TILE * 9.8 * 6;
	var jumpForce = 45000;
	
	acceleration.y = playerGravity;
	
	if ( keyboard.isKeyDown(keyboard.KEY_LEFT) )
	{
		acceleration.x -= playerAccel;
		this.direction = LEFT;
	}
	if ( keyboard.isKeyDown(keyboard.KEY_RIGHT) )
	{
		acceleration.x += playerAccel;
		this.direction = RIGHT;
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
		acceleration.y += playerAccel / 2;
		this.jumping = false;
	}
	
	
	var dragVector = this.velocity.multiplyScalar(playerDrag);
	dragVector.y = 0;
	acceleration = acceleration.subtract(dragVector);
	
	this.velocity = this.velocity.add(acceleration.multiplyScalar(deltaTime));
	this.position = this.position.add(this.velocity.multiplyScalar(deltaTime));

	
	//ANIMATION LOGIC
	if ( this.jumping || this.falling )
	{
		this.changeDirectionalAnimation(ANIM_JUMP_LEFT, ANIM_JUMP_RIGHT);
	}
	else
	{
		if ( Math.abs(this.velocity.x) > 25)
		{
			this.changeDirectionalAnimation(ANIM_WALK_LEFT, ANIM_WALK_RIGHT);
		}
		else
		{
			this.changeDirectionalAnimation(ANIM_IDLE_LEFT, ANIM_IDLE_RIGHT);
		}
	}
	
	
	var collisionOffset = new Vector2();
	collisionOffset.set( -TILE/2, this.height/2 - TILE);
	
	var collisionPos = this.position.add(collisionOffset);
	
	collisionPos.y = this.position.y + this.height/2 - TILE;
	collisionPos.x = this.position.x - TILE/2;
	
	var tx = pixelToTile(collisionPos.x);
	var ty = pixelToTile(collisionPos.y);
	
	var nx = this.position.x % TILE;
	var ny = this.position.y % TILE;
	
	//platform collision
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cell_right = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty);
	var cell_down = cellAtTileCoord(LAYER_PLATFORMS, tx, ty+1);
	var cell_diag = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty+1);
	
	
	//pipe collision
	var objectcell = cellAtTileCoord(LAYER_OBJECT, tx, ty);
	var objectcell_right = cellAtTileCoord(LAYER_OBJECT, tx+1, ty);
	var objectcell_down = cellAtTileCoord(LAYER_OBJECT, tx, ty+1);
	var objectcell_diag = cellAtTileCoord(LAYER_OBJECT, tx+1, ty+1);
	 
	if	( objectcell ||	
		(objectcell_right && nx ) ||
		(objectcell_down && ny ) ||
		(objectcell_diag && nx && ny ))
	{
	 if (keyboard.isKeyDown(keyboard.KEY_DOWN))
		{
			player.position.set(-90, 90);
		}
	}
	
	
	//OBJECT(1) COLLISION CHECK
{
		if ( this.velocity.y > 0 )
	{
		if ( (objectcell_down && !objectcell) || (objectcell_diag && !objectcell_right && nx) )
		{
			this.position.y = tileToPixel(ty) - collisionOffset.y;
			this.velocity.y = 0;
			ny = 0;
			this.jumping = false;
		}
	}
	else if (this.velocity.y < 0 ) //if moving up
	{
		if ( (objectcell && !objectcell_down) || (objectcell_right && !objectcell_diag && nx) )
		{
			this.position.y = tileToPixel(ty) - collisionOffset.y;
			this.velocity.y = 0;
			
			objectcell = objectcell_down;
			objectcell_right + objectcell_diag;
			
			objectcell_down = cellAtTileCoord(LAYER_OBJECT, tx, ty+2);
			objectcell_diag = cellAtTileCoord(LAYER_OBJECT, tx+1, ty+2);
			
			ny = 0;
		}
	}
	
	if (this.velocity.x > 0 ) //if we're moving right
	{
		if ( (objectcell_right && !objectcell) || (objectcell_diag && !objectcell_down && ny) )
		{
			this.position.x = tileToPixel(tx) - collisionOffset.x;
			this.velocity.x = 0;
		}
	}
	else if (this.velocity.x < 0) //if we're moving left
	{
		if ( (objectcell && !objectcell_right) || (objectcell_down && !objectcell_diag && ny) )
		{
			this.position.x = tileToPixel(tx+1) - collisionOffset.x;
			this.velocity.x = 0;
		}
	}	
};	
	
	
	
	
	

	
	//lava collision
	var deathcell = cellAtTileCoord(LAYER_DEATH, tx, ty);
	var deathcell_right = cellAtTileCoord(LAYER_DEATH, tx+1, ty);
	var deathcell_down = cellAtTileCoord(LAYER_DEATH, tx, ty+1);
	var deathcell_diag = cellAtTileCoord(LAYER_DEATH, tx+1, ty+1);
	
	if ( deathcell ||	
		(deathcell_right && nx ) ||
		(deathcell_down && ny ) ||
		(deathcell_diag && nx && ny ))
	{
		this.health -= 100;
	}
	
	
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
			cell_diag = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty+2);
			
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
	//if player falls of screen
	if (this.position.y > MAP.th * TILE + this.height)
	{
		this.position.set(this.startPos.x, this.startPos.y)
		timer = 60;
	}
}

Player.prototype.draw = function(offsetX, offsetY)
{
	this.sprite.draw(context, this.position.x - offsetX, this.position.y - offsetY)
	
	context.fillStyle = "black";
	context.font = "32px Arial";
	var textToDisplay = "HP: " + this.health;
	context.fillText(textToDisplay, canvas.width -150, 50);
}



