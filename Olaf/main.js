var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var Populate = require('populate.js');

var harvester=0, upgrader = 0, builder = 0;

function GetCreeps() {
    harvester = 0;
    upgrader = 0;
    builder = 0;
    for (var creepname in Game.creeps){
      var role = Game.creeps[creepname].memory.role;
      if (role == "harvester") {
        harvester++;
      } else if ( role == "upgrader" ) {
          upgrader++;
      } else if ( role == "builder" ) {
          builder++;
      }
    }
}

function GetResources() {
    var sources = creep.room.find(FIND_SOURCES_ACTIVE);
    if ( sources.length > 1 ) {
        for ( var source in sources) {
            var id = source.id;
        }
    }
}

module.exports.loop = function () {

    //Cleanup destroyed things
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
  
    GetCreeps();
  
    Populate.PopulateRoom();

    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}
