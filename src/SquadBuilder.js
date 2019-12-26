// Squad Builder

var CreepSquadSoldier = require('CreepSquadSoldier');


var SquadBuilder = function(room, depositManager, resourceManager) {
	this.room = room;
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
};

SquadBuilder.prototype.init = function() {
    // Hier wird der Squad definiert
    var squads = this.room.memory.squads;
    for (var squad in squads) {
        var squadMem = this.room.memory.squads[squad];
        if (squadMem.status == "build") {
            //Define Squad Members
            if(!squadMem.members) {
                squadMem.members = {};
            }
            if (Object.keys(squadMem.members).length < squadMem.size) {
                var member = this.build(this.depositManager.getSpawnDeposit(), 'CreepSquadSoldier', squad);
                if(!member) {
                    // nothing to do
                } else {
                    squadMem.members[member] = {};
                }
            } else {
                squadMem.status = "alive";
            }
		}
		
		if(squadMem.members) {
			// Load creeps
			this.loadSquad(squadMem);
		}

		// If all squadmembers are dead delete squad in mem
		if(squadMem.status == "dead") {
			console.log("Squad dead");
			delete this.room.memory.squads[squad];
		}
    }
}

SquadBuilder.prototype.loadSquad = function(squad) {
	// Load Squad Members
	if(Object.keys(squad.members).length > 0) {
		for (var creep in squad.members) {
			if(Game.creeps[creep]) {
				this.loadCreep(Game.creeps[creep]);
			} else {
				console.log("Does not exist");
				delete squad.members[creep];
			}
		}
	} else{
		if (squad.status != "build") {
			squad.status = "dead";
		}
	}
}

SquadBuilder.prototype.loadCreep = function(creep) {
    // Load Squad Member
	var loadedCreep = null;
	var role = creep.memory.role;
	if(!role) {
		role = creep.name.split('-')[0];
	}

	console.log(role);
	switch(role) {
		case 'CreepSquadSoldier':
			console.log(creep);
			loadedCreep = new CreepSquadSoldier(creep);
		break;
		case 'CreepSquadHealer':
			loadedCreep = new CreepSquadHealer(creep);
		break;
		case 'CreepSquadShooter':
			loadedCreep = new CreepSquadShooter(creep);
		break;
	}

	if(!loadedCreep) {
		return false;
	}

	//Addes CreepBase to creep
	HelperFunctions.extend(loadedCreep, CreepBase);
	loadedCreep.init();

	return loadedCreep;
}

SquadBuilder.prototype.build = function(spawn, creepType, squad) {
    // Build Squad
    var id = new Date().getTime();

    abilities = this.maxCreep(creepType);
	var spawning = spawn.spawnCreep(abilities, creepType + '-' + id, {memory: {role: creepType, squad: squad}});	

	if ( spawning != OK) {
		if(spawning == -6) { spawning = "NOT_ENOUGH_ENERGY" }
        console.log('Can not build creep: ' + creepType + " for " + _.sum(abilities.map((b) => BODYPART_COST[b])) + ' ERR: ' + spawning);
        return false;
	} else {
        console.log("Spawning " + creepType + " for " + _.sum(abilities.map((b) => BODYPART_COST[b])) + " with " + abilities);
        return creepType + '-' + id;
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