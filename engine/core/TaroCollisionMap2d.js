var TaroCollisionMap2d = TaroEntity.extend({
	classId: 'TaroCollisionMap2d',

	init: function (tileWidth, tileHeight) {
		TaroEntity.prototype.init.call(this);
		var self = this;

		this.map = new TaroMap2d();
	},

	mapData: function (val) {
		if (val !== undefined) {
			this.map.mapData(val);
			return this;
		}

		return this.map.mapData();
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = TaroCollisionMap2d; }
