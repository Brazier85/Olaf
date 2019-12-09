
var harvestercount = false;

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

function doSpawn(creeptype) {
    if(Game.spawns['Spawn1'].spawning) {
        //Is spawning have to wait
    } else {
        console.log('Spawning ' + creeptype.name);
        Game.spawns['Spawn1'].spawnCreep(creeptype.body, creeptype.name, creeptype.memory);
    }
}

function spawnHarvester() {
    let creeptype = harvester;
    for(var roomName in Game.rooms){ //Loop through all rooms
        var room = Game.rooms[roomName];
        for(let sourceIndex in room.memory.sources){         
            let myMiners = _(Game.creeps).filter( { memory: { role: 'harvester', sourceId: sourceIndex } } );
            if(myMiners.length < 1){
                console.log('Spawning ' + creeptype.name);
                creeptype.memory.memory.sourceId = sourceIndex;
                doSpawn(creeptype);
            } else {
                harvestercount = true;
            }
        }
    }
}


function PopulateRooms() {

    // Count creeps by type
    var harvesters = _(Game.creeps).filter( { memory: { role: 'harvester' } } );
    var upgraders = _(Game.creeps).filter( { memory: { role: 'upgrader' } } ).size();
    var builders = _(Game.creeps).filter( { memory: { role: 'builder' } } ).size();

    console.log(typeof harvesters);
    console.log(harvesters);

    harvestercount = false;
    spawnHarvester();

    if (harvestercount) {
        if ( upgraders < 1 ) {
            doSpawn(upgrader);
        } else if ( builders < 1 ) {
            doSpawn(builder);
        }
    }
}

module.exports.populate = PopulateRooms;