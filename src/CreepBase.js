var CreepBase = {};
var Cache = require('Cache');
var universalCache = new Cache();

// Write to memory
CreepBase.remember = function(key, value) {
	if(value === undefined) {
		return this.creep.memory[key];
	}

	this.creep.memory[key] = value;

	return value;
}

// Read from memory
CreepBase.forget = function(key) {
	delete this.creep.memory[key];
}

// Go for a new room
// Not implemented yet!
CreepBase.moveToNewRoom = function() {
	var targetRoom = this.remember('targetRoom');
	var srcRoom = this.remember('srcRoom');

	if(targetRoom) {
		if(targetRoom != this.creep.room.name) {
			var exitDir = this.creep.room.findExitTo(targetRoom);
			var exit = this.creep.pos.findClosest(exitDir);
			this.creep.moveTo(exit);
			return true;
		} else {
			this.creep.moveTo(30,30);
			var targetRoom = this.remember('targetRoom', false);
			var srcRoom = this.remember('srcRoom', this.creep.room.name);
		}
	} else {
		return false;
	}

}

// Move randomly when nothing changes
CreepBase.randomMovement = function() {
	if(!this.remember('temp-pos')) {
		this.remember('temp-pos', {x:parseInt(Math.random()*50), y:parseInt(Math.random()*50)});
	}
	if(!this.remember('last-pos')) {
		this.remember('last-pos', {x:0, y:0});
	}
	if(!this.remember('last-energy')) {
		this.remember('last-energy', 0);
	}
	if(!this.remember('move-counter')) {
		this.remember('move-counter', 0);
	}
	if(!this.remember('move-attempts')) {
		this.remember('move-attempts', 0);
	}

	var moveCounter = this.remember('move-counter');
	var moveAttempts = this.remember('move-attempts');
	var lastEnergy = this.remember('last-energy');
	var tempPos = this.remember('temp-pos');
	var lastPos = this.remember('last-pos');
	var currPos = this.creep.pos;

	if(lastEnergy != this.creep.store[RESOURCE_ENERGY]) {
		moveAttempts = this.remember('move-attempts', 0);
	}

	if(lastPos.x == currPos.x && lastPos.y == currPos.y && this.creep.fatigue == 0) {
		moveAttempts++;
		if(moveAttempts >= 7) {
			moveAttempts = 0;
			moveCounter = 3;
		}
		this.remember('move-attempts', moveAttempts)
		this.remember('move-counter', moveCounter)
	}

	if(moveCounter) {
		moveCounter--;
		this.remember('move-counter', moveCounter);
		this.creep.moveTo(tempPos.x, tempPos.y);
		if(this.onRandomMovement) {
			this.onRandomMovement();
		}
		return true;
	}

	this.remember('last-pos', {x:this.creep.pos.x, y:this.creep.pos.y});
	this.remember('last-energy', this.creep.store[RESOURCE_ENERGY]);

	return false;
};

// Dying function
CreepBase.dying = function() {
	var timeToLive = this.creep.ticksToLive;
	var isDying = false;
	var graveyard = this.creep.room.memory.graveyard;
	if ( timeToLive < 20 ) {
		this.creep.say("☠️");
		if (graveyard) {
			this.creep.moveTo(graveyard.x, graveyard.y);
		} else {
			this.creep.moveTo(25,25); // Move to the middle of the room
		}
		isDying = true;
	}
	if ( timeToLive < 10 ) {
		this.creep.drop(RESOURCE_ENERGY);
		isDying = true;
	}	

	return isDying;
}

module.exports = CreepBase;
