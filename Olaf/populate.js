let harvester = {
    memory: {memory: {
        role: 'harvester'
    }},
    body: [WORK,CARRY,MOVE,MOVE],
    name: "Harvester_" + Game.time
}

let builder = {
    memory: {memory: {
        role: 'builder'
    }},
    body: [WORK,CARRY,MOVE],
    name: "Builder_" + Game.time
}

let upgrader = {
    memory: {memory: {
        role: 'upgrader'
    }},
    body: [WORK,CARRY,MOVE],
    name: "Upgrader_" + Game.time
}

var creepRoom = Game.spawns.Spawn1.room;

function doSpawn(creeptype) {
    if(Game.spawns['Spawn1'].spawning) {
        //Is spawning have to wait
    } else {
        console.log('Spawning ' + creeptype.name);
        Game.spawns['Spawn1'].spawnCreep(creeptype.body, creeptype.name, creeptype.memory);
    }
}

function spawnHarvester() {
    for(let sourceIndex in Game.rooms[creepRoom].memory.sources){
        let myMiners = _.filter(Game.creeps, i => i.memory.sourceId === sourceIndex);
        if(myMiners.length < 1){
            creeptype.memory.memory.push({sourceId: sourceIndex})
            Game.spawns[0].spawnCreep(creeptype.body, creeptype.name, creeptype.memory);
        }
    }
}


function PopulateRoom() {

    // Count creeps by type
    var harvesters = _(Game.creeps).filter( { memory: { role: 'harvester' } } ).size();
    var upgraders = _(Game.creeps).filter( { memory: { role: 'upgrader' } } ).size();
    var builders = _(Game.creeps).filter( { memory: { role: 'builder' } } ).size();

    spawnHarvester();

    if ( upgraders < 1 ) {
        doSpawn(upgrader);
    } else if ( builders < 1 ) {
        doSpawn(builder);
    } 
}

module.exports.populate = PopulateRoom;