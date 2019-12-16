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

    if(this.stayFlag()) { return; }
    if(this.attackHostiles()) { return; }
    if(this.attackSpawns()) { return; }

    this.creep.moveTo(25,25);
}
CreepShooter.prototype.attackHostiles = function() {
    var target = this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(target) {
        this.creep.say("⚔️", true);
        if(this.creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
        return true;
    }
}

CreepShooter.prototype.attackSpawns = function() {
    var targets = this.creep.room.find(FIND_HOSTILE_SPAWNS);
    if(targets.length) {
        var rangedTargets = this.creep.pos.findInRange(FIND_HOSTILE_SPAWNS, 3);
        if(rangedTargets.length > 0) {
            if(this.creep.rangedAttack(rangedTargets[0]) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(rangedTargets[0]);
            }
			return true;
        }
        this.creep.moveTo(targets[0]);
        return true;
    };
}

CreepShooter.prototype.stayFlag = function() {
    var flags = this.creep.room.find(FIND_FLAGS);
    if (flags.length) {
        flags.forEach(flag => {
            if (flag.name = "StayHere") {
                this.creep.say("🏳️");
                this.creep.moveTo(Game.flags.StayHere);
                return true;
            }
        })
    }
}

module.exports = CreepShooter;
