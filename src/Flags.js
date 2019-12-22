
var FlagsController = {};

FlagsController.run = function(rooms, flags) {
    var orangeFlags = _.filter(flags, flag => flag.color === COLOR_ORANGE);
    var whiteFlags = _.filter(flags, flag => flag.color === COLOR_WHITE);
    var blueFlags = _.filter(flags, flag => flag.color === COLOR_BLUE);
    var redFlags = _.filter(flags, flag => flag.color === COLOR_RED);

    // Orange flags
    _.forEach(orangeFlags, function(flagObject){
        var flag = Game.flags[flagObject.name]

        // Source pos 1
        if(flag.secondaryColor == COLOR_RED) {
            setHarvesterPos(flag, 1);
        }

        // Source pos 2
        if(flag.secondaryColor == COLOR_PURPLE) {
            setHarvesterPos(flag, 2);
        }

        // Graveyard
        if(flag.secondaryColor == COLOR_BLUE) {
            flag.room.memory.graveyard = flag.pos;
            console.log("Set graveyard position");
            flag.remove();
        }

    })
  
    // White flags
    _.forEach(whiteFlags, function(flagObject){
        var flag = Game.flags[flagObject.name];

        if(flag.secondaryColor == COLOR_RED) {
            flag.room.memory.assemblyPoint = flag.pos;
            console.log("Set assembly point");
            flag.remove();
        }

        if(flag.secondaryColor == COLOR_PURPLE) {
            flag.room.memory.defendPoint = flag.pos;
            console.log("Set defend point");
            flag.remove();
        }
    })

    // Red flags
    _.forEach(redFlags, function(flagObject){
        var flag = Game.flags[flagObject.name];

        // Set room target
        if(flag.secondaryColor == COLOR_RED) {
            flag.room.memory.roomTarget = flag.pos.findClosestByRange(FIND_HOSTILE_CREEPS).id;
            flag.remove();
        }

        // Build purple squad
        if(flag.secondaryColor == COLOR_PURPLE) {
            console.log('Build purple squad')
            flag.room.memory.purpleSquad = "build";
        }
    })

    // Blue flags
    _.forEach(blueFlags, function(flagObject){
        var flag = Game.flags[flagObject.name];

        // Build a road from spawn to flag
        if(flag.secondaryColor == COLOR_BLUE) {
            var spawn = flag.pos.findClosestByRange(FIND_MY_SPAWNS);
            var path = spawn.pos.findPathTo(flag.pos, {
                ignoreCreeps: true,
                swampCost: 0
            });
            for (var i = 0; i < path.length; i++) {
                spawn.room.createConstructionSite(path[i].x,path[i].y, STRUCTURE_ROAD);
            }
            flag.remove();
        }
    })
}

var setHarvesterPos = function(flag, position) {
    var room = Game.rooms[flag.pos.roomName];
    var source = flag.pos.findClosestByRange(FIND_SOURCES);

    if(!room.memory.sources){ // If there is no sources memory
        room.memory.sources = {}; //Add it
    }

    if(!room.memory.sources[source.id]){
        source.memory = room.memory.sources[source.id] = {}; //Adding memory for source
    } else {
        source.memory = room.memory.sources[source.id];
    }

    if (position == 1) {
        source.memory.pos1 = flag.pos;
        console.log("Position 1 for Source "+source.id+" set!");
        flag.remove();
    }
    if (position == 2) {
        source.memory.pos2 = flag.pos;
        console.log("Position 2 for Source "+source.id+" set!");
        flag.remove();
    }
}

module.exports = FlagsController