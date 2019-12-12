function CreepShooter(creep) {
    this.creep = creep;
};

CreepShooter.prototype.init = function() {
    this.remember('role', 'CreepShooter');
    if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
    if(this.moveToNewRoom() == true) {
		return;
	}

    this.act();
};

CreepShooter.prototype.act = function() {

    if(this.attackHostiles()) { return; }
    if(this.attackSpawns()) { return; }

    this.creep.moveTo(25,25);
}
CreepShooter.prototype.attackHostiles = function() {
    var targets = this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(targets.length) {
        if(this.creep.rangedAttack(target[0]) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target[0]);
        }
        return true;
    }
}

CreepShooter.prototype.attackSpawns = function() {
    var targets = this.creep.room.find(FIND_HOSTILE_SPAWNS);
    if(targets.length) {
        var rangedTargets = this.creep.pos.findInRange(FIND_HOSTILE_SPAWNS, 3);
        if(rangedTargets.length > 0) {
            this.creep.rangedAttack(rangedTargets[0]);
			return true;
        }

        this.creep.moveTo(targets[0]);
        return true;
    };
}

module.exports = CreepShooter;
