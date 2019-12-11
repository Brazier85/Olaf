/*
 * Baut Dinge und macht Upgrades
 */

var CreepBuilder = function(creep, depositManager, constructionManager) {
	this.creep = creep;
	this.depositManager = depositManager;
	this.constructionManager = constructionManager;
	this.forceControllerUpgrade = false;
};

CreepBuilder.prototype.init = function() {
	this.remember('role', 'CreepBuilder');
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}

	if(this.moveToNewRoom() == true) {
		return;
	}

	this.forceControllerUpgrade = this.remember('forceControllerUpgrade');

	//if(this.randomMovement() == false) {
		this.act();
	//}
};

CreepBuilder.prototype.act = function() {
	var site = false;
	if(!this.forceControllerUpgrade) {
		site = this.constructionManager.constructStructure(this);
	}

	if(!site) {
		var site = this.constructionManager.getController();
	}

	this.remember('last-energy', this.creep.store[RESOURCE_ENERGY]);
};

module.exports = CreepBuilder;
