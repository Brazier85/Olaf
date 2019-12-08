function PopulateRoom(snowflakes) {

    // Check if there are two harvesters
    if ( snowflakes["harvester"] < 2 ) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'harvester'}});
    } else if ( snowflakes["upgrader"] < 1 ) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'upgrader'}});
    } else if ( snowflakes["builder"] < 1 ) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'builder'}});
    } 
}

module.exports = PopulateRoom();