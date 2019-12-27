
var Deposits = require('Deposits');
var CreepFactory = require('CreepFactory');
var Population = require('Population');
var Resources = require('Resources');
var Constructions = require('Constructions');
var SquadBuilder = require('SquadBuilder');

const FLAG = {
	SET: 1,
	REMOVE: 2
}
function Room(room, roomHandler) {
	this.room = room;
	this.roomHandler = roomHandler;
	this.creeps = [];
	this.structures = [];

	this.population = new Population(this.room);
	this.depositManager = new Deposits(this.room);
	this.resourceManager = new Resources(this.room, this.population);
	this.constructionManager = new Constructions(this.room);
	this.squadBuilder = new SquadBuilder(this.room, this.depositManager, this.resourceManager);
	this.population.typeDistribution.CreepWorker.max = 2;
	this.population.typeDistribution.CreepBuilder.max = 2;
	this.population.typeDistribution.CreepMiner.max = this.resourceManager.getSources().length*2;
	if (this.depositManager.energyCapacity() > 1000) {
		this.population.typeDistribution.CreepCarrier.max = this.population.typeDistribution.CreepMiner.max;
	} else {
		this.population.typeDistribution.CreepCarrier.max = this.population.typeDistribution.CreepBuilder.max+this.population.typeDistribution.CreepMiner.max;
	}
	this.creepFactory = new CreepFactory(this.depositManager, this.resourceManager, this.constructionManager, this.population, this.room);
}

// Populate the room
Room.prototype.populate = function() {

	for(var i = 0; i < this.depositManager.spawns.length; i++) {

		// Is there something spawning?
		var spawn = this.depositManager.spawns[i];
		if(spawn.spawning) {
			continue;
		}

		var types = this.population.getTypes()
		for(var i = 0; i < types.length; i++) {
			var ctype = this.population.getType(types[i]);
			if((this.depositManager.deposits.length > ctype.minExtensions) || (!this.depositManager.length)) {
				if(ctype.total == 0 || ctype.total < ctype.max) {
					this.creepFactory.new(types[i], this.depositManager.getSpawnDeposit());
					break;
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
	// this.distributeWorkers();
	this.distributeResources('CreepMiner');
	this.distributeResources('CreepCarrier');
	this.distributeResources('CreepWorker');
	this.distributeCarriers();
};

// Distribute workers
Room.prototype.distributeWorkers = function() {
	var builderStats = this.population.getType('CreepWorker');
	if(this.depositManager.spawns.length == 0) {
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepWorker') {
				continue;
			}

			creep.remember('forceControllerUpgrade', false);
		}
		return;
	}
	if(builderStats <= 3) {
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepWorker') {
				continue;
			}
			creep.remember('forceControllerUpgrade', false);
		}
	} else {
		var c = 0;
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepWorker') {
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
	var position= 1;
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
		// set position to mine from
		if (this.room.memory.sources[sources[source].id]) {
			if (position == 1) { creep.remember('position', this.room.memory.sources[sources[source].id].pos1); }
			if (position == 2) { creep.remember('position', this.room.memory.sources[sources[source].id].pos2); }
		}
		counter++;
		position++;
		if(counter >= perSource) {
			counter = 0;
			position = 1;
			source++;
		}
	}
};

Room.prototype.defendRoom = function() {
	var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
	var towers = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
    if(hostiles.length > 0) {
		var username = hostiles[0].owner.username;
		var setFlag = true;
        //Game.notify(`User ${username} spotted in room ${this.room.name}`);
        towers.forEach(tower => {
			// Draw a shooting range line
			tower.room.visual.circle(tower.pos, {fill: 'transparent', radius: 15, stroke: 'red', lineStyle: 'dotted'});
			var EnemysInRange = tower.pos.findInRange(FIND_HOSTILE_CREEPS, 15);
			if (EnemysInRange.length) {
				var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
				tower.attack(target);
				setFlag = false;
			}
		});
		if(setFlag) {
			this.doFlag("StayHere", FLAG.SET, 21, 29);
		} else {
			this.doFlag("StayHere", FLAG.REMOVE);
		}
	}

	if(this.room.memory.roomTarget != undefined) {
		var target = Game.getObjectById(this.room.memory.roomTarget);
		towers.forEach(tower => {
			if(tower.attack(target) != OK) {
				delete this.room.memory['roomTarget'];
			}
		});
	}

	
	// If there are no hostiles
	if(hostiles.length === 0) {
		this.doFlag("StayHere", FLAG.REMOVE);
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

Room.prototype.doFlag = function(flagName, state, x, y) {
	var flags = this.room.find(FIND_FLAGS);
	var ok = false;
	if (flags.length) {
		flags.forEach(flag => {
			if (flag.name == flagName) {
				if ( state == FLAG.REMOVE ) {
					flag.remove();
					ok = true;
				}
			}
		})
	};
	if (!ok && state == FLAG.SET) {
		if(this.room.memory.defendPoint) {
			var dPoint = this.room.memory.defendPoint;
			this.room.createFlag(dPoint.x, dPoint.y, flagName, COLOR_WHITE);
		} else {
			this.room.createFlag(x, y, flagName, COLOR_WHITE);
		}
		ok = true;
	};
}

Room.prototype.buildSquad = function() {
	this.squadBuilder.init();
}

module.exports = Room;
