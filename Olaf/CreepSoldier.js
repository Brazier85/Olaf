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

    if(this.stayFlag()) { return; }
    if(this.attackHostiles()) { return; }
    if(this.attackSpawns()) { return; }


    this.creep.moveTo(25,25);
}
CreepSoldier.prototype.attackHostiles = function() {
    var target = this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(target) {
        this.creep.say("⚔️", true);
        if(this.creep.attack(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
        return true;
    }
}
CreepSoldier.prototype.attackSpawns = function() {
    var targets = this.creep.room.find(FIND_HOSTILE_SPAWNS);
    if(targets.length) {
        this.creep.say("⚔️", true);
        if(this.creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target[0]);
        }
        return true;
    };
}

CreepSoldier.prototype.stayFlag = function() {
    var flags = this.creep.room.find(FIND_FLAGS);
    if (flags.length) {
        flags.forEach(flag => {
            if (flag.name = "StayHere") {
                this.creep.moveTo(flag);
                return true;
            }
        })
    }
}

module.exports = CreepSoldier;
