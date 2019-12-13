var CONST = {
    RAMPART_MAX: 200000,
    RAMPART_FIX: 50000,
};
var Cache = require('Cache');

function Constructions(room) {
    this.room = room;
    this.cache = new Cache();
    this.sites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
    this.structures = this.room.find(FIND_MY_STRUCTURES);
    this.damagedStructures = this.getDamagedStructures();
    this.upgradeableStructures = this.getUpgradeableStructures();
    this.emptyTowers = this.getEmptyTowers();
    this.controller = this.room.controller;
};


Constructions.prototype.getDamagedStructures = function() {
    return this.cache.remember(
        'damaged-stuctures',
        function() {
            return this.room.find(
                FIND_STRUCTURES, {
                    filter: function(s) {
                        var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                        if(targets.length != 0) {
                            return false;
                        }
                        if((s.hits < s.hitsMax/2 && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits < CONST.RAMPART_FIX)) {
                            return true;
                        }
                    }
                }
            );
        }.bind(this)
    );
};

Constructions.prototype.getUpgradeableStructures = function() {
    return this.cache.remember(
        'upgradeable-structures',
        function() {
            return this.room.find(
                FIND_MY_STRUCTURES,
                {
                    filter: function(s) {
                        var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                        if(targets.length != 0) {
                            return false;
                        }

                        if((s.hits < s.hitsMax && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits < CONST.RAMPART_MAX)) {

                            return true;
                        }
                    }
                }
            );
        }.bind(this)
    );
};

Constructions.prototype.getConstructionSiteById = function(id) {
    return this.cache.remember(
        'object-id-' + id,
        function() {
            return Game.getObjectById(id);
        }.bind(this)
    );
};

Constructions.prototype.getController = function() {
    return this.controller;
};

Constructions.prototype.getClosestConstructionSite = function(creep) {
    var site = false;
    if(this.sites.length != 0) {
        site = creep.pos.findClosestByRange(this.sites);
    }

    return site;
};

Constructions.prototype.getEmptyTowers = function() {
    return this.cache.remember(
        'empty-towers',
        function() {
            return this.room.find(
                FIND_MY_STRUCTURES,
                {
                    filter: function(s) {
                        if( s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            );
        }.bind(this)
    );
}


Constructions.prototype.constructStructure = function(creep) {

    // Wenn es einen Tower ohne Energie gibt füll sie auf
    if(this.emptyTowers.length != 0) {
        site = creep.creep.pos.findClosestByRange(this.emptyTowers);
        if(creep.creep.transfer(site, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.creep.moveTo(site);
        }
        return site;
    }

    // Wenn etwas kaputt ist mach es ganz!
    if(this.damagedStructures.length != 0) {
        site = creep.creep.pos.findClosestByRange(this.damagedStructures);
        if(creep.creep.repair(site) == ERR_NOT_IN_RANGE) {
            creep.creep.moveTo(site);
        }
        return site;
    }

    // Wenn es etwas zu bauen gibt geh hin!
    if(this.sites.length != 0) {
        site = creep.creep.pos.findClosestByRange(this.sites);
        if(creep.creep.build(site) == ERR_NOT_IN_RANGE) {
            creep.creep.moveTo(site);
        }
        return site;
    }

    // Wenn es etwas zum Upgraden gibt mach es!
    if(this.upgradeableStructures.length != 0) {
        site = creep.creep.pos.findClosestByRange(this.upgradeableStructures);
        if(creep.creep.repair(site) == ERR_NOT_IN_RANGE) {
            creep.creep.moveTo(site);
        }
        return site;
    }

    return false;
};


module.exports = Constructions;
