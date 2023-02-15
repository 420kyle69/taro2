var TaroParticle = TaroEntity.extend({
	classId: 'TaroParticle',

	init: function (emitter) {
		this._emitter = emitter;
		TaroEntity.prototype.init.call(this);

		// Setup the particle default values
		this.addComponent(TaroVelocityComponent);
	},

	destroy: function () {
		// Remove ourselves from the emitter
		if (this._emitter !== undefined) {
			this._emitter._particles.pull(this);
		}
		TaroEntity.prototype.destroy.call(this);
	}
});
