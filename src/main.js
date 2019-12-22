var _ = require('lodash');

//Gloabl required prototypes
Source.prototype.memory = undefined;

var HelperFunctions = require('HelperFunctions');
var RoomHandler = require('RoomHandler');
var ScoutHandler = require('ScoutHandler');
var Room = require('Room');
var CreepBase = require('CreepBase');
var CreepScout = require('CreepScout');

var FlagController = require('Flags');

//ScoutHandler.setRoomHandler(RoomHandler);

// Init rooms
for(var n in Game.rooms) {
	var roomHandler = new Room(Game.rooms[n], RoomHandler);
	RoomHandler.set(Game.rooms[n].name, roomHandler);
};

FlagController.run(Game.rooms, Game.flags);

// Load rooms
var rooms = RoomHandler.getRoomHandlers();
for(var n in rooms) {
	var room = rooms[n];
	room.loadCreeps();
	room.populate();
	room.defendRoom();

	console.log(
		room.room.name + ' | ' +
		'goals met:' +
		room.population.goalsMet() +
		', population: ' +
		room.population.getTotalPopulation() + '/' + room.population.getMaxPopulation() +
		' (B' + room.population.getType('CreepBuilder').total + '/M' +
		room.population.getType('CreepMiner').total + '/C' +
		room.population.getType('CreepCarrier').total + '/S' +
		room.population.getType('CreepSoldier').total + 
		'), ' +
		'resources at: ' + parseInt( (room.depositManager.energy() / room.depositManager.energyCapacity())*100) +'%, ' +
		'max resources: ' + room.depositManager.energyCapacity +'u, ' +
		'next death: ' + room.population.getNextExpectedDeath() +' ticks'
	);
};

// Load scouts.
//ScoutHandler.loadScouts();
//ScoutHandler.spawnNewScouts();

HelperFunctions.garbageCollection();
