function CreepSquadSoldier(creep) {
    this.creep = creep;
};

CreepSquadSoldier.prototype.init = function() {
    this.remember('role', 'CreepSquadSoldier');
    if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
    this.remember('targetRoom', false);
    if(this.moveToNewRoom() == true) {
		return;
	}

    this.act();
};

CreepSquadSoldier.prototype.act = function() {

    if(this.squadFlag()) { return true; }
    if(this.attackHostiles()) { return true; }
    if(this.attackSpawns()) { return true; }
    
    if (this.creep.room.memory.assemblyPoint) {
        var asPoint = this.creep.room.memory.assemblyPoint;
        this.creep.moveTo(asPoint.x, asPoint.y);
    } else {
        this.creep.moveTo(25,25);
    }
    
}
CreepSquadSoldier.prototype.attackHostiles = function() {
    var target = this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(target) {
        this.creep.say("⚔️", true);
        if(this.creep.attack(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
        return true;
    }
}
CreepSquadSoldier.prototype.attackSpawns = function() {
    var targets = this.creep.room.find(FIND_HOSTILE_SPAWNS);
    if(targets.length) {
        this.creep.say("⚔️", true);
        if(this.creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target[0]);
        }
        return true;
    };
}


CreepSquadSoldier.prototype.squadFlag = function() {
    var flags = Game.flags;
    var ok = false;
    if (flags.length) {
        flags.forEach(flag => {
            if (flag.secondaryColor == this.remember(squad)) {
                this.creep.say("🏳️");
                this.creep.moveTo(flag);
                ok = true;
            }
        })
    }
    return ok;
}

module.exports = CreepSquadSoldier;
