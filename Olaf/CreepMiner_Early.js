/*
 * Baut Energie ab
 */
var Cache = require('Cache');
var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};

function CreepMinerEarly(creep, resourceManager) {
	this.cache = new Cache();
	this.creep = creep;
	this.resourceManager = resourceManager;
	this.resource = false;
};

CreepMinerEarly.prototype.init = function() {
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

CreepMinerEarly.prototype.act = function() {
	if (!this.dying()) {	

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
		
		this.remember('last-energy', this.creep.store[RESOURCE_ENERGY]);
	}
}

module.exports = CreepMinerEarly;