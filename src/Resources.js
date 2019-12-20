var Cache = require('Cache');

Source.prototype.memory = undefined;

function Resources(room, population) {
	this.cache = new Cache();
	this.room = room;
	this.population = population;
}

Resources.prototype.getAvailableResource = function() {
	// Some kind of unit counter per resource (with Population)
	var srcs = this.getSources();
	var srcIndex = Math.floor(Math.random()*srcs.length);

	return srcs[srcIndex];
};
Resources.prototype.getResourceById = function(id) {
	return Game.getObjectById(id);
};

Resources.prototype.getSources = function(room) {
	return this.cache.remember(
		'sources',
		function() {
			return this.room.find(FIND_SOURCES);
		}.bind(this)
	);
};

Resources.prototype.getPositions = function(room) {
	return this.cache.remember(
		'sources',
		function() {
			var sources = this.room.find(FIND_SOURCES);
			var positions = [];
			_.forEach(sources, function(source) {
				if (this.room.memory.sources[sources.id]) {
					source.memory = room.memory.sources[source.id];
					positions.push(source.memory.pos1);
					positions.push(source.memory.pos2);
				}
			})
			return positions;
		}.bind(this)
	);
};
module.exports = Resources;
