var CreepBase = {};
var Cache = require('Cache');
var universalCache = new Cache();

// Etwas in den Memory schreiben
CreepBase.remember = function(key, value) {
	if(value === undefined) {
		return this.creep.memory[key];
	}

	this.creep.memory[key] = value;

	return value;
}

// Etwas aus dem Memory löschen
CreepBase.forget = function(key) {
	delete this.creep.memory[key];
}

// Aus zu neuen Ufern!
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

// Beweg dich!
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

	if(lastEnergy != this.creep.energy) {
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
		this.creep.moveTo(tempPos.x, tempPos.y, {avoid: avoidArea});
		if(this.onRandomMovement) {
			this.onRandomMovement();
		}
		return true;
	}

	this.remember('last-pos', {x:this.creep.pos.x, y:this.creep.pos.y});
	this.remember('last-energy', this.creep.energy);

	return false;
};

// Wenn creep stribt
CreepBase.dying = function() {
	if ( this.creep.ticksToLive < 100 ) {
		this.creep.say("☠️");
		this.creep.moveTo(20, 20);
		return true;
	}	
	return false;
}

module.exports = CreepBase;
