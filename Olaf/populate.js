let harvester = {
    memory: {memory: {role: 'harvester'}},
    body: [WORK,CARRY,MOVE,MOVE],
    name: "Harvester_" + Game.time
}

let builder = {
    memory: {memory: {role: 'builder'}},
    body: [WORK,CARRY,MOVE],
    name: "Builder_" + Game.time
}

let upgrader = {
    memory: {memory: {role: 'upgrader'}},
    body: [WORK,CARRY,MOVE],
    name: "Upgrader_" + Game.time
}

function doSpawn(creeptype) {
    if(Game.spawns['Spawn1'].spawning) {
        //Is spawning have to wait
    } else {
        Game.spawns['Spawn1'].spawnCreep(creeptype.body, creeptype.name, creeptype.memory);
    }
}


function PopulateRoom() {

    // Check if there are two harvesters
    var harvesters = _(Game.creeps).filter( { memory: { role: 'harvester' } } ).size();
    var upgraders = _(Game.creeps).filter( { memory: { role: 'upgrader' } } ).size();
    var builders = _(Game.creeps).filter( { memory: { role: 'builder' } } ).size();

    if ( harvesters < 2 ) {
        console.log('Spawning new harvester');
        doSpawn(harvester);
    } else if ( upgraders < 1 ) {
        console.log('Spawning new upgrader');
        doSpawn(upgrader);
    } else if ( builders < 1 ) {
        console.log('Spawning new builder');
        doSpawn(builder);
    } 
}

module.exports.populate = PopulateRoom;