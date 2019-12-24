var _ = require('lodash');
var HelperFunctions = require('HelperFunctions');


var CreepBase = require('CreepBase');
var CreepBuilder = require('CreepBuilder');
var CreepMiner = require('CreepMiner');
var CreepSoldier = require('CreepSoldier');
var CreepSquadSoldier = require('CreepSquadSoldier');
var CreepHealer = require('CreepHealer');
var CreepScout = require('CreepScout');
var CreepCarrier = require('CreepCarrier');
var CreepShooter = require('CreepShooter');

function CreepFactory(depositManager, resourceManager, constructionsManager, population, roomHandler) {
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.population = population;
	this.constructionsManager = constructionsManager;
	this.roomHandler = roomHandler;
};

CreepFactory.prototype.load = function(creep) {
	var loadedCreep = null;
	var role = creep.memory.role;
	if(!role) {
		role = creep.name.split('-')[0];
	}

	switch(role) {
		case 'CreepBuilder':
			loadedCreep = new CreepBuilder(creep, this.depositManager, this.constructionsManager);
		break;
		case 'CreepMiner':
			loadedCreep = new CreepMiner(creep, this.resourceManager);
		break;
		case 'CreepSoldier':
			loadedCreep = new CreepSoldier(creep);
		break;
		case 'CreepHealer':
			loadedCreep = new CreepHealer(creep);
		break;
		case 'CreepCarrier':
			loadedCreep = new CreepCarrier(creep, this.depositManager, this.resourceManager, this.constructionsManager);
		break;
		case 'CreepShooter':
			loadedCreep = new CreepShooter(creep);
		break;
	}

	if(!loadedCreep) {
		return false;
	}

	// Add CreepBase to creep
	HelperFunctions.extend(loadedCreep, CreepBase);
	loadedCreep.init();

	return loadedCreep;
};

CreepFactory.prototype.new = function(creepType, spawn, addon) {
	var abilities = [];
	var id = new Date().getTime();
	var creepLevel = this.population.getTotalPopulation() / this.population.populationLevelMultiplier;
	var resourceLevel = this.depositManager.getFullDeposits().length / 5;
	var level = Math.floor(creepLevel + resourceLevel);
	if(this.population.getTotalPopulation() < 5){
		level = 1;
	}
	if(this.population.getTotalPopulation() > 10){
		level = 5;
	}
	// TOUGH          10
	// MOVE           50
	// CARRY          50
	// ATTACK         80
	// WORK           100
	// RANGED_ATTACK  150
	// HEAL           250

	switch(creepType) {
		case 'CreepMiner':
			if(level <= 1) {
				abilities = [WORK, CARRY, MOVE];
			} else
			if(level <= 2) {
				abilities = [WORK, WORK, CARRY, MOVE];
			} else
			if(level <= 3) {
				abilities = [WORK, WORK, CARRY, MOVE, MOVE];
			} else
			if(level <= 4) {
				abilities = [WORK, WORK, WORK, CARRY, MOVE, MOVE];
			} else
			if(level >= 5) {
				abilities = this.maxCreep(creepType);
			}
		break;
		case 'CreepBuilder':
			if(level <= 1) {
				abilities = [WORK, CARRY, MOVE];
			} else
			if(level <= 2) {
				abilities = [WORK, WORK, CARRY, MOVE];
			} else
			if(level >= 3) {
				abilities = this.maxCreep(creepType);
			}
		break;
		case 'CreepCarrier':
				abilities = this.maxCreep(creepType);
		break;
		case 'CreepSoldier':
				abilities = this.maxCreep(creepType);
		break;
		case 'CreepShooter':
			if(level <= 5) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level <= 6) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level <= 7) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level <= 8) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level <= 9) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			} else
			if(level >= 10) {
				abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
			}
		break;
		case 'CreepScout':
			abilities = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
		break;
		case 'CreepHealer':
			abilities = this.maxCreep(creepType);
		break;
	}

	if (addon != undefined) {
		var spawning = spawn.spawnCreep(abilities, creepType + '-' + id, {memory: {role: creepType, addon: addon}});	
	} else {
		var spawning = spawn.spawnCreep(abilities, creepType + '-' + id, {memory: {role: creepType}});
	}

	if ( spawning != OK) {
		if(spawning == -6) { spawning = "NOT_ENOUGH_ENERGY" }
		console.log('Can not build creep: ' + creepType + " for " + _.sum(abilities.map((b) => BODYPART_COST[b])) + ' ERR: ' + spawning);
	} else {
		console.log("Spawning " + creepType + " for " + _.sum(abilities.map((b) => BODYPART_COST[b])) + " with " + abilities);
	}
};

CreepFactory.prototype.maxCreep = function(creepType) {
	var maxAbilities = [];
	var baseAbilities = [];
	var baseAbilitiesCost = 0;
	var updatePackage = [];
	var updatePackageCost = 0;
	var maxCost = 0;
	var maxEnergy = this.depositManager.energyCapacity();

	// TOUGH          10
	// MOVE           50
	// CARRY          50
	// ATTACK         80
	// WORK           100
	// RANGED_ATTACK  150
	// HEAL           250

	switch(creepType) {
		case 'CreepMiner':
			baseAbilities = [WORK, CARRY, MOVE, MOVE, MOVE];
			updatePackage = [WORK];
			maxCost = 1000;
		break;
		case 'CreepBuilder':
			baseAbilities = [WORK, CARRY, CARRY, MOVE];
			updatePackage = [WORK, MOVE];
			maxCost = 1000;
		break;
		case 'CreepCarrier':
			baseAbilities = [CARRY, MOVE];
			updatePackage = [CARRY, MOVE];
			maxCost = 1000;
		break;
		case 'CreepSoldier':
		case 'CreepSquadSoldier':
			baseAbilities = [TOUGH, ATTACK, MOVE];
			updatePackage = [TOUGH, ATTACK, MOVE];
			maxCost = 800;
		break;
		case 'CreepShooter':
			baseAbilities = [TOUGH, TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, MOVE];
		break;
		case 'CreepScout':
			abilities = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
		break;
		case 'CreepHealer':
			baseAbilities = [MOVE, MOVE, MOVE, HEAL, MOVE];
			updatePackage = [HEAL];
			maxCost = 1000;
		break;
	}

	// calculate
	if (maxEnergy > maxCost) {
		maxEnergy = maxCost;
	}

	maxEnergy = maxEnergy - _.sum(baseAbilities.map((b) => BODYPART_COST[b]));
	var upgradeCount = Math.floor(maxEnergy / _.sum(updatePackage.map((b) => BODYPART_COST[b])) );
	updatePackage.forEach(update => {
		for ( var i = 1; i <= upgradeCount; i++) {
			maxAbilities.push(update);
		}
	})
	baseAbilities.forEach(base => maxAbilities.push(base));
	return maxAbilities;
}

module.exports = CreepFactory;
