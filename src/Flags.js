
var FlagsController = {};

FlagsController.run = function(rooms, flags) {
    var orangeFlags = _.filter(flags, flag => flag.color === COLOR_ORANGE);
    var whiteFlags = _.filter(flags, flag => flag.color === COLOR_WHITE);
    var redFlags = _.filter(flags, flag => flag.color === COLOR_RED);

    // Orange flags
    _.forEach(orangeFlags, function(flagObject){
        var flag = Game.flags[flagObject.name]

        // Source pos 1
        if(flag.secondaryColor == COLOR_RED || flag.secondaryColor == COLOR_BLUE) {
            setHarvesterPos(flag, 1);
        }

        // Source pos 2
        if(flag.secondaryColor == COLOR_PURPLE || flag.secondaryColor == COLOR_CYAN) {
            setHarvesterPos(flag, 2);
        }

        // Graveyard
        if(flag.secondaryColor == COLOR_GREEN) {
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

        if(flag.secondaryColor == COLOR_RED) {

        }
    })
}

setHarvesterPos = function(flag, position) {
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