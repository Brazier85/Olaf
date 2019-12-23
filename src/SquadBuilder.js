// Squad Builder

var CreepSquadSoldier = require('CreepSquadSoldier');


var SquadBuilder = function(room, depositManager, resourceManager) {
	this.room = room;
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
};

SquadBuilder.prototype.init = function(squad) {
    // Hier wird der Squad definiert
    if(!this.room.memory.squads) {
        this.room.memory.squads = {};
    }
    
    if(!this.room.memory.squads[squad]) {
        this.room.memory.squads[squad] = {}
    }
    return "build";
}

SquadBuilder.prototype.loadSquad = function(squad) {
    // Load Squad Members
}

SquadBuilder.prototype.build = function(spawn, creepType, squad) {
    // Build Squad
    var id = new Date().getTime();

    //For debug
    creepType = 'CreepSquadSolider';

    abilities = this.maxCreep(creepType);

	var spawning = spawn.spawnCreep(abilities, "CreepSquadSolider" + '-' + id, {memory: {role: 'CreepSquadSolider', sqaud: squad}});	

	if ( spawning != OK) {
		if(spawning == -6) { spawning = "NOT_ENOUGH_ENERGY" }
		console.log('Can not build creep: ' + creepType + " for " + _.sum(abilities.map((b) => BODYPART_COST[b])) + ' ERR: ' + spawning);
	} else {
		console.log("Spawning " + creepType + " for " + _.sum(abilities.map((b) => BODYPART_COST[b])) + " with " + abilities);
	}
}

SquadBuilder.prototype.maxCreep = function(creepType) {
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

module.exports = SquadBuilder;