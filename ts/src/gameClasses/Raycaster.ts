class Raycaster {
	world = ige.physics.world();
	scaleRatio = ige.physics._scaleRatio;
	data: any = {};
	closest = RayCastClosest;
	multiple = RayCastMultiple;
	constructor () {
		// CONFIG: info about which physics engine we are using
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
		config: {
			method: string,
			projType: string,
		}
	): void {

		let callback, reset;

		this.data = {};

		switch(config.method) {
			case 'closest':
				this.data = this[config.method];
				reset = this.data.reset;
				callback = this.data.callback;
				break;
			case 'multiple':
				this.data = this[config.method];
				reset = this.data.reset;
				callback = this.data.callback;
				break;

		}

		reset();
		this.world.rayCast(
			start,
			end,
			callback
		);
		if (config.method === 'multiple') {
			this.sortHits();
		}

		if (ige.isClient) {
			end = (config.method === 'closest' && this.data.point) ?
				{
					x: this.data.point.x * this.scaleRatio,
					y: this.data.point.y * this.scaleRatio
				} :
				{
					x: end.x * this.scaleRatio,
					y: end.y * this.scaleRatio
				};

			this.drawRay(start, end, { ...config, fraction: this.data.fraction });
		}
	}

	sortHits (): void {
		this.data.entities = _.orderBy(this.data.entities, ['raycastFraction'], ['asc']);
	}

	drawRay (
		start: {x: number, y: number},
		end: {x: number, y: number},
		config: {method: string, projType: string, fraction: number}

	): void {
		ige.client.emit('create-ray', {
			start: {
				x: start.x * this.scaleRatio,
				y: start.y * this.scaleRatio
			},
			end,
			config
		});
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
		// const body = fixture.getBody();
		// const userData = body.getUserData();

		// if (userData) {
		// 	if (userData === 0) {
		// 	// By returning -1, we instruct the calling code to ignore this fixture and
		// 	// continue the ray-cast to the next fixture.
		// 		return -1.0;
		// 	}
		// }

		console.log(fixture);
		// var fixtureList = fixture.m_body.m_fixtureList;
		// var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
		// if (entity) {

		// 	entity.raycastFraction = fraction;
		// 	def.entities.push(entity);
		// }

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
		// const body = fixture.getBody();
		// const userData = body.getUserData();

		// if (userData) {
		// 	if (userData == 0) {
		// 		// By returning -1, we instruct the calling code to ignore this fixture
		// 		// and continue the ray-cast to the next fixture.
		// 		return -1.0;
		// 	}
		// }

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