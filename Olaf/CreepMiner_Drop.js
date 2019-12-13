/*
 * Baut Energie ab
 */
var Cache = require('Cache');
var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};
var HARVEST = {
	STORE: 1,
	DROP: 2
}

function CreepMiner(creep, resourceManager) {
	this.cache = new Cache();
	this.creep = creep;
	this.resourceManager = resourceManager;
	this.resource = false;
};

CreepMiner.prototype.init = function() {
	this.remember('role', 'CreepMiner');

	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
	if(this.moveToNewRoom() == true) {
		return;
	}

	this.resource = this.resourceManager.getResourceById(this.remember('source'));

	this.act();
};

CreepMiner.prototype.act = function() {
	if (!this.dying()) {	

		if(this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(this.resource);
		}
		
		this.remember('last-energy', this.creep.store[RESOURCE_ENERGY]);
	}
}

CreepMiner.prototype.checkContainer = function() {
	var Container = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 0, {
		filter: (structure) => {
			return (structure.structureType == STRUCTURE_CONTAINER)
		}
	});
	if (Container.lenght) {
		console.log(this.creep.name + " is dropping its resources!");
		this.remeber('harvest', HARVEST.DROP);
	}
}

module.exports = CreepMiner;
