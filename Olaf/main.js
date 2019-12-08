var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

//Room functions
var Populate = require('populate');

//Our creeps
var snowflakes = [];

function GetSnowflakes() {
    var flakes = new Array(
        {name: "harvester", count: 0},
        {name: "upgrader", count: 0},
        {name: "builder", count: 0},
    )

    for (var creepname in Game.creeps){
      var role = Game.creeps[creepname].memory.role;
      if (role == "harvester") {
          flakes["harvester"]++;
      } else if ( role == "upgrader" ) {
          flakes["upgrader"]++;
      } else if ( role == "builder" ) {
          flakes["builder"]++;
      }
    }
    console.log(flakes["harvester"]);
    return flakes;
}


module.exports.loop = function () {

    //Cleanup destroyed things
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
  
    snowflakes = GetSnowflakes();
  
    Populate.PopulateRoom(snowflakes);

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
