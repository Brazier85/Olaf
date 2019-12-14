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

		this.checkContainer();

		if (this.remember('harvest') == HARVEST.STORE) {
			if(this.creep.store[RESOURCE_ENERGY] == this.creep.store.getCapacity(RESOURCE_ENERGY)) {
				// Suche nach Carrier in der Nähe
				var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 5);
				var carrierinRange = false;
				if(creepsNear.length){
					for(var n in creepsNear){
						if(creepsNear[n].memory.role === 'CreepCarrier'){
							carrierinRange = true;
						}
					}
				}

				// Wenn kein Carrier in der Nähe ist oder wir schon auf dem Weg zum abladen sind
				if(!carrierinRange || this.remember('action') == ACTIONS.DEPOSIT) {
					this.remember('action', ACTIONS.DEPOSIT);
					var targets = this.creep.room.find(FIND_MY_STRUCTURES, {
						filter: (structure) => {
							return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
								structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
						}
					});
					if(targets.length > 0) {
						if(this.creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							this.creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
						}
					}
				}
			} else {
				this.remember('action', ACTIONS.HARVEST);
				if(this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {
					this.creep.moveTo(this.resource);
				}
			}
		} else {
			this.remember('action', ACTIONS.HARVEST);
			if(this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {
				this.creep.moveTo(this.resource);
			}
		}
		
		this.remember('last-energy', this.creep.store[RESOURCE_ENERGY]);
	}
}

CreepMiner.prototype.checkContainer = function() {
	var containerNear = this.creep.pos.findInRange(FIND_STRUCTURES, 1, {
		filter: function(s) {
				if ((s.structureType == STRUCTURE_CONTAINER) && (s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY))) {
					return true;
				} else {
					return false;
				}
			}
		});
	if (containerNear.length) {
		console.log(this.creep.name + " is dropping its resources!");
		this.remember('harvest', HARVEST.DROP);
	} else {
		console.log(this.creep.name + " is storing its resources!");
		this.remember('harvest', HARVEST.STORE);
	}
}

module.exports = CreepMiner;
