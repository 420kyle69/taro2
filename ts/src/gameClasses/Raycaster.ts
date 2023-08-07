type bulletReturn = {
	start: {
		x: number,
		y: number
	},

	point: {
		x: number,
		y: number
	},

	fraction: number,
	obstructed: boolean
}

class Raycaster {
	engine = taro.physics.engine;
	world = taro.physics.world();
	scaleRatio = taro.physics._scaleRatio;

	data: any = {};
	closest = RayCastClosest;
	multiple = RayCastMultiple;
	any = RaycastAny;

	forwardHit = false;
	reverseHit = false;

	raycastLine (
		start: {
			x: number,
			y: number,
		},
		end: {
			x: number,
			y: number
		},
	):void {
		// reverse
		const raycast = this.multiple;

		raycast.reset();
		this.world.rayCast(
			end,
			start,
			raycast.callback
		);

		taro.game.entitiesCollidingWithLastRaycast = _.clone(raycast.entities);

		// forward
		raycast.reset();
		this.world.rayCast(
			start,
			end,
			raycast.callback
		);

		const missedEntities = _.difference(taro.game.entitiesCollidingWithLastRaycast, raycast.entities);
		missedEntities.forEach(x => x.raycastFraction = 1 - x.raycastFraction);

		taro.game.entitiesCollidingWithLastRaycast = [...raycast.entities, ...missedEntities];

		taro.game.entitiesCollidingWithLastRaycast = this.sortHits(taro.game.entitiesCollidingWithLastRaycast);

		//debug
		// console.log(taro.game.entitiesCollidingWithLastRaycast.map(x=> `${x.id()} ${x._category} ${x.raycastFraction}`));
	}

	raycastBullet (
		start: {
			x: number,
			y: number,
		},
		end: {
			x: number,
			y: number
		}
	): bulletReturn {
		// forward
		const forwardRaycast = this.closest;

		forwardRaycast.reset();

		this.world.rayCast(
			start,
			end,
			forwardRaycast.callback // though it is currently hard-coded for 'Closest'
		);

		taro.game.entitiesCollidingWithLastRaycast = forwardRaycast.entity ? [forwardRaycast.entity] : [];
		this.forwardHit = true;

		const point = forwardRaycast.point ? forwardRaycast.point : end;
		const fraction = forwardRaycast.fraction;

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
			taro.game.entitiesCollidingWithLastRaycast = [];
		}

		const bulletReturn = {
			start,
			point,
			fraction,
			obstructed: this.forwardHit === this.reverseHit
		};

		this.forwardHit = false;
		this.reverseHit = false;

		return bulletReturn;
	}

	sortHits (array: TaroEntity[]): TaroEntity[] {
		return array = _.orderBy(array, ['raycastFraction'], ['asc']);
	}

	renderBullet (
		start: {x: number, y: number},
		end: {x: number, y: number},
		config: {color: number, projType: string, fraction: number, rotation: number}

	): void {
		taro.client.emit('create-ray', {
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
		var entity = fixtureList && fixtureList.taroId && taro.$(fixtureList.taroId);
		if (
			entity &&
				(
					entity._category === 'unit' ||
			 	 	entity._category === 'wall'
				)
		) {
			entity.lastRaycastCollisionPosition = {
				x: point.x * taro.physics._scaleRatio,
				y: point.y * taro.physics._scaleRatio
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
		var entity = fixtureList && fixtureList.taroId && taro.$(fixtureList.taroId);
		if (
			entity &&
				(
					entity._category === 'unit' ||
					entity._category === 'wall'
				)
		) {
			entity.lastRaycastCollisionPosition = {
				x: point.x * taro.physics._scaleRatio,
				y: point.y * taro.physics._scaleRatio
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
		var entity = fixtureList && fixtureList.taroId && taro.$(fixtureList.taroId);
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