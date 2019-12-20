//Lets first add a shortcut prototype to the sources memory:
Source.prototype.memory = undefined;

/*
for(var roomName in Game.rooms){//Loop through all rooms your creeps/structures are in
    var room = Game.rooms[roomName];
    if(!room.memory.sources){//If this room has no sources memory yet
        room.memory.sources = {}; //Add it
        var sources = room.find(FIND_SOURCES);//Find all sources in the current room
        for(var i in sources){
            var source = sources[i];
            source.memory = room.memory.sources[source.id] = {}; //Create a new empty memory object for this source
            //Now you can do anything you want to do with this source
            //for example you could add a worker counter:
            source.memory.workers = 0;
        }
    }else{ //The memory already exists so lets add a shortcut to the sources its memory
        var sources = room.find(FIND_SOURCES);//Find all sources in the current room
        for(var i in sources){
            var source = sources[i];
            source.memory = this.memory.sources[source.id]; //Set the shortcut
        }
    }
}*/

function FlagsController(rooms, flags) {
    this.flags = flags;
    this.rooms = rooms;
};

FlagsController.prototype.run = function() {
      var orangeFlags = _.filter(this.flags, flag => flag.color === COLOR_ORANGE);
      var purpleFlags = _.filter(this.flags, flag => flag.color === COLOR_PURPLE);
  
      _.forEach(orangeFlags, function(flagObject){
        var flag = Game.flags[flagObject.name]

        // Flag on Source
        if(flag.secondaryColor == COLOR_RED || flag.secondaryColor == COLOR_CYAN) {
            this.setSource(flag);
        }
      })
  
      _.forEach(purpleFlags, function(flagObject){
        var flag = Game.flags[flagObject.name]
  
        /*if(flag.pos.room.controller.my){
          flag.remove()
        }*/
  
        if(flag.secondaryColor == COLOR_PURPLE){
          console.log('purple-purple')
        }else if(flag.secondaryColor == COLOR_RED){
          var job = {
            collect: 'claim',
            room: flagObject.room,
            priority: 10,
            flag: flagObject.name
          }
  
          Utils.addWithHash(job, jobs)
  
          if(!Utils.findCreepForJob(job)){
            var nearestRoom = Utils.myNearestRoom(flagObject.room, rooms, CreepDesigner.caps.claim)
  
            spawnQueue.add({
              creep: CreepDesigner.createCreep({
                base: CreepDesigner.baseDesign.claim,
                cap: CreepDesigner.caps.claim,
                room: Game.rooms[nearestRoom]
              }),
              memory: {
                jobHash: job.hash
              },
              priority: job.priority,
              spawned: false,
              room: nearestRoom
            })
          }
        }
      })
    }
  
FlagsController.prototype.setSource = function(flag) {
    var lookup = _.filter(flag.pos.look(), function(item){
        return (item.type == 'source')
    })[0]

    if(!lookup){
        console.log("Flag not on source!");
        flag.remove();
        return
    }else{
        var room = Game.rooms[flag.pos.roomName];

        if(!room.memory.sources){ // If there is no sources memory
            room.memory.sources = {}; //Add it
        }

        var source = Game.getObjectById(lookup.source.id);
        if(!room.memory.sources[source.id]){
            source.memory = room.memory.sources[source.id] = {}; //Adding memory for source
        }
    }
}
  module.exports = FlagsController