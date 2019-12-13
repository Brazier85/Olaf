var Cache = require('Cache');
var CONSTS = {
	EMPTY_LEVEL: 0.5
};

function Deposits(room) {
	this.cache = new Cache();
	this.room = room;
	this.energy = this.room.energyAvailable;
	this.energyCapacity = this.room.energyCapacityAvailable;
	this.deposits = this.room.find(
		FIND_MY_STRUCTURES,
		{
			filter: filterExtensions
		}
	);

	this.spawns = [];
	for(var n in Game.spawns) {
		var s = Game.spawns[n];
		if(s.room == this.room) {
			this.spawns.push(s);
		}
	}
};

Deposits.prototype.getSpawnDeposit = function() {
	if(this.spawns.length != 0) {
		return this.spawns[0];
	}

	return false;
};

Deposits.prototype.getEmptyDeposits = function() {
	return this.cache.remember(
		'empty-deposits',
		function() {
			var empty = [];
			var len = this.deposits.length;
			for(var i = 0; i < len; i++) {
				var res = this.deposits[i];
				if(this.isEmptyDeposit(res)) {
					empty.push(res);
				}
			}

			return empty;
		}.bind(this)
	);
};

Deposits.prototype.isEmptyDeposit = function(deposit) {
	if(deposit.store[RESOURCE_ENERGY] / deposit.store.getCapacity(RESOURCE_ENERGY) < CONSTS.EMPTY_LEVEL) {
		return true;
	}

	return false;
};

Deposits.prototype.getEmptyDepositOnId = function(id) {
	var resource = Game.getObjectById(id);

	if(resource && this.isEmptyDeposit(resource)) {
		return resource;
	}

	return false;
};

Deposits.prototype.getClosestEmptyDeposit = function(creep) {
	var resources = this.getEmptyDeposits();
	var resource = false;
	if(resources.length != 0) {
		resource = creep.pos.findClosestByRange(resources);
	}
	if(!resource) {
		resource = this.getSpawnDeposit();
	}

	return resource;
};

Deposits.prototype.getFullDeposits = function() {
	return this.cache.remember(
		'deposits-full',
		function() {
			var full = [];
			var deposits = this.deposits;
			for(var i = 0; i < deposits.length; i++) {
				var deposit = deposits[i];
				if(deposit.store[RESOURCE_ENERGY] == deposit.store.getCapacity(RESOURCE_ENERGY)) {
					full.push(deposit);
				}
			}
			return full;
		}.bind(this)
	);
};

// PRIVATE
function filterExtensions(structure) {
	if (structure.structureType == STRUCTURE_EXTENSION // ||
		//structure.structureType == STRUCTURE_STORAGE
	){
		return true;
	}
	return false;
}


module.exports = Deposits;
