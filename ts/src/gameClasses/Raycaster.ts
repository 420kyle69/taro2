class Raycaster {
	engine = ige.physics.engine;
	world = ige.physics.world();
	scaleRatio = ige.physics._scaleRatio;

	data: any = {};
	closest = RayCastClosest;
	multiple = RayCastMultiple;
	any = RaycastAny;

	forwardHit = false;
	reverseHit = false;

	constructor (

	) {
		// BOX2DWEB (callback, start, end)
		// PLANCK (start, end, callback)
	}

	// raycast(
	// 	start: {
	// 		x: number,
	// 		y: number,
	// 	},
	// 	end: {
	// 		x: number,
	// 		y: number
	// 	},
	// 	config: {
	// 		method: string,
	// 		projType: string,
	// 		rotation: number
	// 	}
	// ): void {

	// 	let callback, reset;

	// 	this.data = {};

	// 	switch(config.method) {
	// 		case 'closest':
	// 			this.data = this[config.method];
	// 			reset = this.data.reset;
	// 			callback = this.data.callback;
	// 			break;
	// 		case 'multiple':
	// 			this.data = this[config.method];
	// 			reset = this.data.reset;
	// 			callback = this.data.callback;
	// 			break;
	// 		case 'any': // used here for reverse checks
	// 			this.data = this[config.method];
	// 			reset = this.data.reset;
	// 			callback = this.data.callback;
	// 	}

	// 	reset();
	// 	this.world.rayCast(
	// 		start,
	// 		end,
	// 		callback
	// 	);

	// 	// leaning towards having this list exist on the item or both
	// 	if (config.method === 'multiple') {
	// 		this.sortHits();
	// 		ige.game.entitiesCollidingWithLastRaycast = this.data.entities;
	// 	} else if (config.method === 'closest') {
	// 		ige.game.entitiesCollidingWithLastRaycast = [this.data.entity];
	// 		this.forwardHit = true;

	// 		if (ige.isClient) {
	// 			end = (config.method === 'closest' && this.data.point) ?
	// 				{
	// 					x: this.data.point.x,
	// 					y: this.data.point.y
	// 				} :
	// 				{
	// 					x: end.x,
	// 					y: end.y
	// 				};
	// 		}
	// 		// testing reverse ray

	// 		// cache forward raycast results
	// 		const data = this.data;

	// 		const point = this.data.point ? this.data.point : end;

	// 		this.raycast(
	// 			point,
	// 			start,
	// 			{
	// 				method: 'any',
	// 				projType: null,
	// 				rotation: null
	// 			}
	// 		);

	// 		if (ige.isClient && (this.forwardHit !== this.reverseHit)) {

	// 			this.drawRay(start, point, { ...config, color: 0xffffff, fraction: data.fraction });
	// 		}

	// 		this.forwardHit = false;
	// 		this.reverseHit = false;

	// 	} else if (config.method === 'any') {
	// 		if (this.data.hit) {
	// 			this.reverseHit = true;
	// 			ige.game.entitiesCollidingWithLastRaycast = [];
	// 		}
	// 	}

	// 	// cleanup
	// 	this.data = {};
	// }

	raycastBullet (
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
			rotation: number
		}
	): void {
		// forward
		const forwardRaycast = this[config.method];

		forwardRaycast.reset();

		this.world.rayCast(
			start,
			end,
			forwardRaycast.callback // though it is currently hard-coded for 'Closest'
		);

		ige.game.entitiesCollidingWithLastRaycast = forwardRaycast.entity ? [forwardRaycast.entity] : [];
		this.forwardHit = true;

		const point = forwardRaycast.point ? forwardRaycast.point : end;

		// reverse
		const reverseRaycast = this.any;

		reverseRaycast.reset();

		this.world.rayCast(
			point,
			start,
			reverseRaycast.callback
		);

		if (reverseRaycast.hit) {
			// we were obstructed when shooting
			this.reverseHit = true;
			ige.game.entitiesCollidingWithLastRaycast = [];
		}

		if (ige.isClient && !this.reverseHit) {

			this.drawRay(start, point, { ...config, color: 0xffffff, fraction: forwardRaycast.fraction });
		}

		this.forwardHit = false;
		this.reverseHit = false;
	}

	sortHits (): void {
		this.data.entities = _.orderBy(this.data.entities, ['raycastFraction'], ['asc']);
	}

	drawRay (
		start: {x: number, y: number},
		end: {x: number, y: number},
		config: {color: number, method: string, projType: string, fraction: number, rotation: number}

	): void {
		ige.client.emit('create-ray', {
			start: {
				x: start.x * this.scaleRatio,
				y: start.y * this.scaleRatio
			},
			end: {
				x: end.x * this.scaleRatio,
				y: end.y * this.scaleRatio
			},
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
		def.entity = null;
		def.fraction = 1;
	};

	def.callback = function(fixture, point, normal, fraction) {

		var fixtureList = fixture.m_body.m_fixtureList;
		var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
		if (
			entity &&
				(
					entity._category === 'unit' ||
			 	 	entity._category === 'wall'
				)
		) {
			entity.lastRaycastCollisionPosition = {
				x: point.x * ige.physics._scaleRatio,
				y: point.y * ige.physics._scaleRatio
			};

			entity.raycastFraction = fraction;
			def.entity = entity;

			def.hit = true;
			def.point = point;
			def.normal = normal;
			def.fraction = fraction;

			return fraction;

		} else if (entity) {
			return -1.0;
		}

		return fraction;

		// By returning the current fraction, we instruct the calling code to clip the ray and
		// continue the ray-cast to the next fixture. WARNING: do not assume that fixtures
		// are reported in order. However, by clipping, we can always get the closest fixture.

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

		var fixtureList = fixture.m_body.m_fixtureList;
		var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
		if (entity) {
			if (entity._category === 'sensor') {
				return -1.0;
			}

			entity.lastRaycastCollisionPosition = {
				x: point.x * ige.physics._scaleRatio,
				y: point.y * ige.physics._scaleRatio
			};

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

const RaycastAny = (function() {
	let def: any;
	def = {};

	def.reset = function() {
		def.hit = false;
		def.point = null;
		def.normal = null;
	};

	def.callback = function(fixture, point, normal, fraction) {

		var fixtureList = fixture.m_body.m_fixtureList;
		var entity = fixtureList && fixtureList.igeId && ige.$(fixtureList.igeId);
		if (
			entity &&
				(
					entity._category === 'unit' ||
			 	 	entity._category === 'wall'
				)
		) {

			def.hit = true;
			def.point = point;
			def.normal = normal;

			return 0.0;

		} else if (entity) {
			return -1.0;
		}

	};

	return def;
})();

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = Raycaster;
}