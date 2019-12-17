var _ = require('lodash');


var FlagHandler = function() {
    //nothing there
};

// Red flags are attack flags
FlagHandler.prototype.attackflags = function() {
    return _.filter(Game.flags, flag => flag.color === COLOR_RED);
} 

FlagHandler.prototype.defendflags = function(room) {
    return _.filter(Game.flags, flag => flag.color === COLOR_WHITE && flag.room == room);
} 