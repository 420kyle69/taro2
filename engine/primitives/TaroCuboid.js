var TaroCuboid = TaroEntity.extend({
	classId: 'TaroCuboid',

	init: function () {
		TaroEntity.prototype.init.call(this);

		this.bounds3d(40, 40, 40);

		var tex = new TaroTexture(TaroCuboidSmartTexture);
		this.texture(tex);
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = TaroCuboid; }
