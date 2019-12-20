
var FlagsController = {};

FlagsController.run = function(rooms, flags) {
    var orangeFlags = _.filter(flags, flag => flag.color === COLOR_ORANGE);
    var purpleFlags = _.filter(flags, flag => flag.color === COLOR_PURPLE);

    // Orange Flags
    _.forEach(orangeFlags, function(flagObject){
        var flag = Game.flags[flagObject.name]

        // Source Pos 1
        if(flag.secondaryColor == COLOR_RED || flag.secondaryColor == COLOR_BLUE) {
            setPos(flag, 1);
        }

        // Source Pos 2
        if(flag.secondaryColor == COLOR_PURPLE || flag.secondaryColor == COLOR_CYAN) {
            setPos(flag, 2);
        }

        // Graveyard
        if(flag.secondaryColor == COLOR_GREEN) {
            flag.room.memory.graveyard = flag.pos;
            console.log("Set graveyard position");
            flag.remove();
        }

    })
  
    _.forEach(purpleFlags, function(flagObject){
        var flag = Game.flags[flagObject.name];
    })
}

setPos = function(flag, position) {
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