var Cache = require('Cache');


function Population(room) {
	this.cache = new Cache();
	this.room = room;
	this.population = 0;
	this.populationLevelMultiplier = 8;
	this.typeDistribution = {
		CreepMiner: {
			total: 0,
			max: 5,
			minExtensions: 0
		},
		CreepCarrier: {
			total: 0,
			max: 15,
			minExtensions: 0
		},
		CreepBuilder: {
			total: 0,
			max: 15,
			minExtensions: 0
		},
		CreepWorker: {
			total: 0,
			max: 15,
			minExtensions: 0
		},
		CreepHealer: {
			total: 0,
			max: 1,
			minExtensions: 2
		},
		CreepSoldier: {
			total: 0,
			max: 1,
			minExtensions: 2
		},
		CreepShooter: {
			total: 0,
			max: 1,
			minExtensions: 10
		}
	};

	this.creeps = this.room.find(FIND_MY_CREEPS);

	for(var i = 0; i < this.creeps.length; i++) {
		var creepType = this.creeps[i].memory.role;
		if(!this.typeDistribution[creepType]) {
			//this.typeDistribution[creepType] = createTypeDistribution(creepType);
			continue; // Ignore this creep
		}
		this.typeDistribution[creepType].total++;
	}
};

Population.prototype.goalsMet = function() {
	for(var n in this.typeDistribution) {
		var type = this.typeDistribution[n];
		if(type.total == 0 || type.total < type.max) {
			return false;
		}
	}

	return true;
};

Population.prototype.getType = function(type) {
	return this.typeDistribution[type];
};

Population.prototype.getTypes = function(type) {
	var types = [];
	for(var n in this.typeDistribution) {
		types.push(n);
	}
	return types;
};

Population.prototype.getTotalPopulation = function() {
	return this.creeps.length;
};

Population.prototype.getMaxPopulation = function() {
	return this.cache.remember(
		'max-population',
		function() {
			var population = 0;
			for(var n in this.typeDistribution) {
				population += this.typeDistribution[n].max;
			}
			return population;
		}.bind(this)
	);
};

Population.prototype.getNextExpectedDeath = function() {
	return this.cache.remember(
		'creep-ttl',
		function() {
			var ttl = 100000;
			var cname = "";
			for(var i = 0; i < this.creeps.length; i++) {
				var creep = this.creeps[i];

				if(creep.ticksToLive < ttl) {
					ttl = creep.ticksToLive;
					cname = creep.name;
				}

				return ttl + 'ticks -> ' +cname;
			}
		}.bind(this)
	);
};

module.exports = Population;

// Private

function createTypeDistribution(type) {
	return {
		total: 0,
		max: 20,
		minExtensions: 0
	};
};
