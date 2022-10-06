class Raycaster {
	world = ige.physics.world();
	data: any = {};
	raycastClosest = RayCastClosest;
	raycastMultiple = RayCastMultiple;
	constructor () {
		// CONFIG
	}

	raycast(
		start: {
			x: number,
			y: number,
		},
		end: {
			x: number,
			y: number
		},
		method: string
	): void {

		let callback, reset;

		this.data = {};

		switch(method) {
			case 'closest':
				this.data = this.raycastClosest;
				reset = this.raycastClosest.reset;
				callback = this.raycastClosest.callback;
				break;
			case 'multiple':
				this.data = this.raycastMultiple;
				reset = this.raycastMultiple.reset;
				callback = this.raycastMultiple.callback;
				break;

		}

		reset();
		this.world.rayCast(
			start,
			end,
			callback
		);
		console.log(this.data);
	}
}

const RayCastClosest = (function() {
	let def: any;
	def = {};

	def.reset = function() {
		def.hit = false;
		def.point = null;
		def.normal = null;
		def.fraction = 1;
	};

	def.callback = function(fixture, point, normal, fraction) {
		const body = fixture.getBody();
		const userData = body.getUserData();
		if (userData) {
			if (userData === 0) {
			// By returning -1, we instruct the calling code to ignore this fixture and
			// continue the ray-cast to the next fixture.
				return -1.0;
			}
		}

		def.hit = true;
		def.point = point;
		def.normal = normal;
		def.fraction = fraction;

		// By returning the current fraction, we instruct the calling code to clip the ray and
		// continue the ray-cast to the next fixture. WARNING: do not assume that fixtures
		// are reported in order. However, by clipping, we can always get the closest fixture.
		return fraction;
	};

	return def;
})();

const RayCastMultiple = (function() {
	let def: any;
	def = {};

	// var raycastCollidesWith = self._stats.raycastCollidesWith; // outdated?
	def.points = [];
	def.normals = [];
	def.entities = [];

	def.reset = function() {
		def.points = [];
		def.normals = [];
		def.entities = [];
	};

	def.callback = function (fixture, point, normal, fraction) {
		const body = fixture.getBody();
		const userData = body.getUserData();

		if (userData) {
			if (userData == 0) {
				// By returning -1, we instruct the calling code to ignore this fixture
				// and continue the ray-cast to the next fixture.
				return -1.0;
			}
		}

		console.log(fixture);
		var fixtureList = fixture.m_body.m_fixtureList;
		var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
		if (entity) {

			entity.raycastFraction = fraction;
			def.entities.push(entity);
		}



		def.points.push(point);
		def.normals.push(normal);
		// By returning 1, we instruct the caller to continue without clipping the
		// ray.
		return 1.0;
	};

	return def;
})();

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = Raycaster;
}