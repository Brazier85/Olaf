/*
 * Heails other creep
 */

 var Cache = require('Cache');
function CreepHealer(creep) {
    this.cache = new Cache();
    this.creep = creep;
};

CreepHealer.prototype.init = function() {
    this.remember('role', 'CreepHealer');
    if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}

    if(this.moveToNewRoom() == true) {
		return;
	}

    this.act();
};

CreepHealer.prototype.act = function() {
    var injured = this.getInjuredCreep();
    if(injured) {
        if(this.creep.heal(injured) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(injured);
        }
    } else {
        this.creep.moveTo(25,25);
    }
}

CreepHealer.prototype.getInjuredCreep = function() {
    return this.creep.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: function(c) {
            if(c.hits < c.hitsMax) {
                return true;
            }
        }
    })
}

module.exports = CreepHealer;
