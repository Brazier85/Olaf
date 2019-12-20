/*
 * Moves energy from a to b
 */

var Cache = require('Cache');

var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};
var DEPOSIT_FOR = {
	CONSTRUCTION: 1,
	POPULATION: 2
}

function CreepCarrier(creep, depositManager, resourceManager, constructionsManager) {
	this.cache = new Cache();
	this.creep = creep;
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.constructionsManager = constructionsManager;
	this.resource = false;
	this.target = false;
	this.position = false;
};

CreepCarrier.prototype.init = function() {
	this.remember('role', 'CreepCarrier');
	this.depositFor = this.remember('depositFor') || 2;
	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	} else {
		this.resource = this.resourceManager.getResourceById(this.remember('source'));
	}
	if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		//this.creep.say('w');
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}

	if(this.moveToNewRoom() == true) {
		return;
	}

	if(!this.remember('position')) {
		this.position = this.resource.pos; //Required for new creeps
	} else {
		this.position = this.remember('position');
	}

	if(this.randomMovement() == false) {
	    this.act();
	}
};

CreepCarrier.prototype.onRandomMovement = function() {
	this.remember('last-action', ACTIONS.DEPOSIT);
}

CreepCarrier.prototype.setDepositFor = function(type) {
	this.remember('depositFor', type);
}
CreepCarrier.prototype.getDepositFor = function() {
	return this.remember('depositFor');
}

CreepCarrier.prototype.act = function() {
	if (!this.dying()) {
		var continueDeposit = false;
		if(this.creep.store[RESOURCE_ENERGY] != 0 && this.remember('last-action') == ACTIONS.DEPOSIT) {
			continueDeposit = true;
		}

		this.pickupEnergy();

		if(this.creep.store[RESOURCE_ENERGY] < this.creep.store.getCapacity(RESOURCE_ENERGY) && continueDeposit == false) {
			this.harvestEnergy();
		} else {
			this.depositEnergy();

		}
	}
};

CreepCarrier.prototype.depositEnergy = function() {

	if( (this.depositManager.energy() / this.depositManager.energyCapacity() ) < 0.9) {
		this.depositFor = DEPOSIT_FOR.POPULATION;
	} else {
		this.depositFor = DEPOSIT_FOR.CONSTRUCTION;
	}

	if(this.depositFor == DEPOSIT_FOR.POPULATION) {
		this.creep.say("💑");
		var deposit = this.getDeposit();
		if(this.creep.transfer(deposit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(deposit);
		}
	}

	if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		this.creep.say("🔧");
		var worker = this.getWorker();
		var range = 1;
		if(!worker) {
			worker = this.constructionsManager.controller;
			range = 2;
		}

		if(!this.creep.pos.isNearTo(worker, range)) {
			this.creep.moveTo(worker);
		} else {
			this.remember('move-attempts', 0);
		}
		this.giveEnergy();
	}

	this.remember('last-action', ACTIONS.DEPOSIT);
}

CreepCarrier.prototype.getWorker = function() {
	// From Room.distributeCarriers
	if(this.remember('target-worker')) {
		return Game.getObjectById(this.remember('target-worker'));
	}

	return false;
}

CreepCarrier.prototype.getDeposit = function() {
	return this.cache.remember(
		'selected-deposit',
		function() {
			var deposit = false;

			// Deposit energy
			if(this.remember('closest-deposit')) {
				deposit = this.depositManager.getEmptyDepositOnId(this.remember('closest-deposit'));
			}

			if(!deposit) {
				deposit = this.depositManager.getClosestEmptyDeposit(this.creep);
				this.remember('closest-deposit', deposit.id);
			}

			if(!deposit) {
				deposit = this.depositManager.getSpawnDeposit();
			}

			return deposit;
		}.bind(this)
	)
};
CreepCarrier.prototype.pickupEnergy = function() {
	if(this.creep.store[RESOURCE_ENERGY] == this.creep.store.getCapacity(RESOURCE_ENERGY)) {
		return false;
	}

	var target = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES,4);
	if(target.length) {
	    this.creep.pickup(target[0]);
	}
};
CreepCarrier.prototype.harvestEnergy = function() {

	if(this.creep.pos.inRangeTo(this.resource, 2)) {
		this.creep.say("⛽️");
		var containerNear = this.creep.pos.findInRange(FIND_STRUCTURES, 4, {
			filter: function(s) {
					if ((s.structureType == STRUCTURE_CONTAINER) && (s.store[RESOURCE_ENERGY] > 0)) {
						return true;
					} else {
						return false;
					}
				}
			});
		if(containerNear.length) {
			for(var n in containerNear) {
				if(this.creep.withdraw(containerNear[n], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					this.creep.moveTo(containerNear[n]);
				}
			}
		} else {
			var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 2); //Search for miner
			if(creepsNear.length){
				for(var n in creepsNear){
					// If miner -> get resource
					if(creepsNear[n].memory.role === 'CreepMiner' && creepsNear[n].store[RESOURCE_ENERGY] != 0){
						creepsNear[n].transfer(this.creep, RESOURCE_ENERGY);
					} else {
						this.creep.moveTo(creepsNear[n]);
					}
				}
			}
		}
	} else {
		this.creep.moveTo(this.resource);
	}
	this.remember('last-action', ACTIONS.HARVEST);
	this.forget('closest-deposit');
}

CreepCarrier.prototype.giveEnergy = function() {
	// Give energy to builder
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1, { 
		filter: function(c) {
			if(c.memory.role === 'CreepBuilder') {
				return true;
			}
		}
	});
	if(creepsNear.length){
		for(var n in creepsNear){
			this.creep.transfer(creepsNear[n], RESOURCE_ENERGY);
		}
	}
}

module.exports = CreepCarrier;
