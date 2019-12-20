/*
 * Mines stuff
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
	this.position = false;
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
	if(this.remember('position')) {
		this.position = this.remember('position');
	}

	this.resource = this.resourceManager.getResourceById(this.remember('source'));
	this.position = this.remember('position');

	this.act();
};

CreepMiner.prototype.act = function() {
	if (!this.dying()) {	

		// Check for container mining
		this.checkContainer();

		if (this.remember('harvest') == HARVEST.STORE) {
			if(this.creep.store[RESOURCE_ENERGY] == this.creep.store.getCapacity(RESOURCE_ENERGY)) {
				// If there is a carrier nearby
				var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 5);
				var carrierinRange = false;
				if(creepsNear.length){
					for(var n in creepsNear){
						if(creepsNear[n].memory.role === 'CreepCarrier'){
							carrierinRange = true;
						}
					}
				}

				// Move to spawn when no carrier is there
				if(!carrierinRange || this.remember('action') == ACTIONS.DEPOSIT) {
					this.remember('action', ACTIONS.DEPOSIT);
					var targets = this.creep.room.find(FIND_MY_STRUCTURES, {
						filter: (structure) => {
							return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
								structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
						}
					});
					if(targets.length > 0) {
						if(this.creep.transfer(targets[0], RESOURCE_ENERGY) != OK) {
							this.creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
						}
					}
				}
			} else {
				this.remember('action', ACTIONS.HARVEST);
				if(this.creep.harvest(this.resource) != OK) {
					this.creep.moveTo(this.position);
				}
			}
		} else {
			this.remember('action', ACTIONS.HARVEST);
			if(this.creep.harvest(this.resource) != OK) {
				this.creep.moveTo(this.position);
			}
		}
		
		this.remember('last-energy', this.creep.store[RESOURCE_ENERGY]);
	}
}

CreepMiner.prototype.checkContainer = function() {
	if (this.remember('harvest') == HARVEST.STORE || this.remember('harvest') == undefined )  {
		var containerNear = this.creep.pos.findInRange(FIND_STRUCTURES,0,{filter: (s) => s.structureType == STRUCTURE_CONTAINER});
		if (containerNear.length) {
			this.remember('harvest', HARVEST.DROP);
		} else {
			this.remember('harvest', HARVEST.STORE);
		}
	}
}

module.exports = CreepMiner;
