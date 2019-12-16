var Deposits = require('Deposits');
var CreepFactory = require('CreepFactory');
var Population = require('Population');
var Resources = require('Resources');
var Constructions = require('Constructions');

function Room(room, roomHandler) {
	this.room = room;
	this.roomHandler = roomHandler;
	this.creeps = [];
	this.structures = [];

	this.population = new Population(this.room);
	this.depositManager = new Deposits(this.room);
	this.resourceManager = new Resources(this.room, this.population);
	this.constructionManager = new Constructions(this.room);
	this.population.typeDistribution.CreepBuilder.max = 4;
	this.population.typeDistribution.CreepMiner.max = this.resourceManager.getSources().length*2;
	this.population.typeDistribution.CreepCarrier.max = this.population.typeDistribution.CreepBuilder.max+this.population.typeDistribution.CreepMiner.max;
	this.creepFactory = new CreepFactory(this.depositManager, this.resourceManager, this.constructionManager, this.population, this.roomHandler);
}

// Populate the room
Room.prototype.populate = function() {

	for(var i = 0; i < this.depositManager.spawns.length; i++) {

		// Is there something spawning?
		var spawn = this.depositManager.spawns[i];
		if(spawn.spawning) {
			continue;
		}

		// Is there enough energy?
		if((this.depositManager.energy() / this.depositManager.energyCapacity()) > 0.2) {
			var types = this.population.getTypes()
			for(var i = 0; i < types.length; i++) {
				var ctype = this.population.getType(types[i]);
				if((this.depositManager.deposits.length > ctype.minExtensions) || (!this.depositManager.length)) {
					if((ctype.goalPercentage > ctype.currentPercentage && ctype.total < ctype.max) || ctype.total == 0 || ctype.total < ctype.max*0.75) {
						this.creepFactory.new(types[i], this.depositManager.getSpawnDeposit());
						break;
					}
				}
			}
		}
	}

};

Room.prototype.loadCreeps = function() {
	var creeps = this.room.find(FIND_MY_CREEPS);
	for(var n in creeps) {
		var c = this.creepFactory.load(creeps[n]);
		if(c) {
			this.creeps.push(c);
		}
	}
	this.distributeBuilders();
	this.distributeResources('CreepMiner');
	this.distributeResources('CreepCarrier');
	this.distributeCarriers();
};

// Distribute the builders
Room.prototype.distributeBuilders = function() {
	var builderStats = this.population.getType('CreepBuilder');
	if(this.depositManager.spawns.length == 0) {
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}

			creep.remember('forceControllerUpgrade', false);
		}
		return;
	}
	if(builderStats <= 3) {
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}
			creep.remember('forceControllerUpgrade', false);
		}
	} else {
		var c = 0;
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}
			creep.remember('forceControllerUpgrade', true);
			c++;
			if(c == 2) {
				break;
			}
		}
	}
}

// Distibute the carriers
Room.prototype.distributeCarriers = function() {
	var counter = 0;
	var builders = [];
	var carriers = [];

	// Collect all builders and carriers
	for(var i = 0; i < this.creeps.length; i++) {
		var creep = this.creeps[i];
		if(creep.remember('role') == 'CreepBuilder') { // Add to builder list
			builders.push(creep.creep);
		}
		if(creep.remember('role') != 'CreepCarrier') { // Do nothing when not a carrier
			continue;
		}
		carriers.push(creep); // Add to carrier list
		if(!creep.getDepositFor()) {
			if(counter%2) {
				// Construction
				creep.setDepositFor(1);
			} else {
				// Population
				creep.setDepositFor(2);
			}
		}

		counter++;
	}

	// Loop all carriers
	counter = 0;
	for(var i = 0; i < carriers.length; i++) {
		var creep = carriers[i];
		if(creep.remember('role') != 'CreepCarrier') { // Is it really a carrier?
			continue;
		}
		if(!builders[counter]) { // All builders done?
			continue;
		}
		//var id = creep.remember('target-worker'); // Aktuellen Worker abrufen
		//if(!Game.getObjectById(id)) {
			creep.remember('target-worker', builders[counter].id);
		//}
		
		counter++;
		if(counter >= builders.length) {
			counter = 0;
		}
	}
};

Room.prototype.distributeResources = function(type) {
	var sources = this.resourceManager.getSources();
	var perSource = Math.ceil(this.population.getType(type).total/sources.length);
	var counter = 0;
	var source = 0;

	for(var i = 0; i < this.creeps.length; i++) {
		var creep = this.creeps[i];
		if(creep.remember('role') != type) {
			continue;
		}

		if(!sources[source]) {
			continue;
		}

		creep.remember('source', sources[source].id);
		counter++;
		if(counter >= perSource) {
			counter = 0;
			source++;
		}
	}
};

Room.prototype.defendRoom = function() {
	var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
	var towers = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
    if(hostiles.length > 0) {
        var username = hostiles[0].owner.username;
        //Game.notify(`User ${username} spotted in room ${this.room.name}`);
        towers.forEach(tower => {
			var EnemysInRange = tower.pos.findInRange(FIND_HOSTILE_CREEPS,20);
			if (EnemysInRange) {
				tower.attack(EnemysInRange[0]);
			}
		});
	}
	
	// If there are no hostiles
	if(hostiles.length === 0) {
		towers.forEach(tower => {
			// Only till 50%
			if(tower.store[RESOURCE_ENERGY] > tower.store.getFreeCapacity(RESOURCE_ENERGY)){
				// Only things that are below 50%
				var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax/2 && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});
				if(closestDamagedStructure) {
					 tower.repair(closestDamagedStructure);
				}
			}
		})
	}
}

module.exports = Room;
