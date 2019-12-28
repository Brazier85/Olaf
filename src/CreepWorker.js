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

function CreepWorker(creep, depositManager, resourceManager, constructionManager) {
	this.cache = new Cache();
	this.creep = creep;
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.constructionManager = constructionManager;
	this.resource = false;
	this.target = false;
	this.position = false;
};

CreepWorker.prototype.init = function() {
	this.remember('role', 'CreepWorker');
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

	this.forceControllerUpgrade = this.remember('forceControllerUpgrade');

	if(this.moveToNewRoom() == true) {
		return;
	}

	if(!this.remember('position')) {
		this.position = this.resource.pos; //Required for new creeps
	} else {
		this.position = this.remember('position');
	}
	if (!this.dying()) {
		if(this.randomMovement() == false) {
			this.act();
		}
	}
};

CreepWorker.prototype.onRandomMovement = function() {
	this.remember('last-action', ACTIONS.DEPOSIT);
}

CreepWorker.prototype.setDepositFor = function(type) {
	this.remember('depositFor', type);
}
CreepWorker.prototype.getDepositFor = function() {
	return this.remember('depositFor');
}

CreepWorker.prototype.act = function() {
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
};

CreepWorker.prototype.depositEnergy = function() {

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
		var site = false;
		if(!this.forceControllerUpgrade) {
			this.creep.say("🛠");
			site = this.constructionManager.constructStructure(this);
		}

		if(!site) {
			var storage = this.depositManager.storage[0];
			if(storage) {
				this.creep.say("🔋");
				site = storage;
				if(this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					this.creep.moveTo(storage);
				}
			}
		}

		if(!site || this.forceControllerUpgrade) {
			this.creep.say("📡");
			var site = this.constructionManager.getController();
			if(this.creep.upgradeController(site) == ERR_NOT_IN_RANGE) {
				this.creep.moveTo(site);
			}
		}
	}

	this.remember('last-action', ACTIONS.DEPOSIT);
}

CreepWorker.prototype.getDeposit = function() {
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
CreepWorker.prototype.pickupEnergy = function() {
	if(this.creep.store[RESOURCE_ENERGY] == this.creep.store.getCapacity(RESOURCE_ENERGY)) {
		return false;
	}

	var target = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES,4);
	if(target.length) {
	    this.creep.pickup(target[0]);
	}
};
CreepWorker.prototype.harvestEnergy = function() {

	var storage = this.depositManager.storage[0];

	if(this.resource.energy == 0 && storage) {
		if(this.creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(storage);
		}
	} else {
		if(this.creep.pos.inRangeTo(this.resource, 2)) {
			this.creep.say("⚡️");
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
							if (creepsNear[n].transfer(this.creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
								this.creep.moveTo(creepsNear[n]);
							}
						}
					}
				}
			}
		} else {
			this.creep.moveTo(this.resource);
		}
	}

	this.remember('last-action', ACTIONS.HARVEST);
	this.forget('closest-deposit');
}

module.exports = CreepWorker;
