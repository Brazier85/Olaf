function CreepSoldier(creep) {
    this.creep = creep;
};

CreepSoldier.prototype.init = function() {
    this.remember('role', 'CreepSoldier');
    if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
    this.remember('targetRoom', false);
    if(this.moveToNewRoom() == true) {
		return;
	}

    this.act();
};

CreepSoldier.prototype.act = function() {


    if(this.attackHostiles()) { return; }
    if(this.attackSpawns()) { return; }


    this.creep.moveTo(25,25);
}
CreepSoldier.prototype.attackHostiles = function() {
    var target = this.creep.room.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(target) {
        if(this.creep.attack(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
        return true;
    }
}
CreepSoldier.prototype.attackSpawns = function() {
    var targets = this.creep.room.find(FIND_HOSTILE_SPAWNS);
    if(targets.length) {
        var rangedTargets = this.creep.pos.findInRange(FIND_HOSTILE_SPAWNS, 3);
        if(rangedTargets.length > 0) {
            this.creep.rangedAttack(rangedTargets[0]);
        }

        this.creep.moveTo(targets[0]);
        this.creep.attack(targets[0]);
        return true;
    };
}

module.exports = CreepSoldier;
