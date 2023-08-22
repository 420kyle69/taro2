// FIXME: add more types to the physics part of taro2
const box2dwasmWrapper: PhysicsDistProps = { // added by Moe'Thun for fixing memory leak bug
	init: async function (component) {
		const box2D = await box2dwasm() as typeof Box2D & EmscriptenModule;
		const { freeLeaked, recordLeak } = new box2D.LeakMitigator();
		component.box2D = box2D;
		component.freeLeaked = freeLeaked;
		component.recordLeak = recordLeak;
		component.freeFromCache = box2D.LeakMitigator.freeFromCache;
		component.wrapPointer = box2D.wrapPointer;
		component.getPointer = box2D.getPointer;
		component.destroyB2dObj = box2D.destroy;
		component.nullPtr = box2D.NULL;
		component.b2AABB = box2D.b2AABB; // added by Jaeyun for world collision detection for raycast bullets
		component.JSQueryCallback = box2D.JSQueryCallback;
		component.b2Color = box2D.b2Color;
		component.b2Vec2 = box2D.b2Vec2;
		component.b2Math = {};
		component.b2Shape = box2D.b2Shape;
		component.b2BodyDef = box2D.b2BodyDef;
		component.b2_dynamicBody = box2D.b2_dynamicBody;
		component.b2Body = box2D.b2Body;
		component.b2Joint = box2D.b2Joint;
		component.b2FixtureDef = box2D.b2FixtureDef;
		component.b2Fixture = box2D.b2Fixture;
		component.b2World = box2D.b2World;
		component.b2MassData = box2D.b2MassData;
		component.b2PolygonShape = box2D.b2PolygonShape;
		component.b2CircleShape = box2D.b2CircleShape;
		component.b2DebugDraw = box2D.b2Draw;
		component.b2ContactListener = box2D.JSContactListener;
		component.b2RevoluteJointDef = box2D.b2RevoluteJointDef;
		component.b2WeldJointDef = box2D.b2WeldJointDef;
		component.b2Contact = box2D.b2Contact;
		component.b2Distance = box2D.b2DistanceJoint;
		component.b2FilterData = box2D.b2Filter;
		component.b2DistanceJointDef = box2D.b2DistanceJointDef;
		// aliases for camelcase
		component.b2World.prototype.isLocked = component.b2World.prototype.IsLocked;
		component.b2World.prototype.createBody = component.b2World.prototype.CreateBody;
		component.b2World.prototype.destroyBody = component.b2World.prototype.DestroyBody;
		component.b2World.prototype.createJoint = component.b2World.prototype.CreateJoint;
		component.b2World.prototype.destroyJoint = component.b2World.prototype.DestroyJoint;
		component.b2World.prototype.clearForces = component.b2World.prototype.ClearForces;
		component.b2World.prototype.getBodyList = component.b2World.prototype.GetBodyList;
		component.b2World.prototype.getJointList = component.b2World.prototype.GetJointList;
		component.b2World.prototype.getFixtureList = component.b2World.prototype.GetFixtureList;
		component.b2World.prototype.step = component.b2World.prototype.Step;
		component.b2World.prototype.rayCast = (start: Box2D.b2Vec2, end: Box2D.b2Vec2, callback: Box2D.b2RayCastCallback | number) => {
			component._world.RayCast(callback, start, end);
		};
		// signature is backwards!
		/*
			component.b2World.prototype.queryAABB = function(aabb, queryCallback){
				return component.b2World.prototype.QueryAABB(queryCallback,aabb);
			}
			*/

		component.b2Transform = box2D.b2Transform;
		component.b2Body.prototype.getNext = component.b2Body.prototype.GetNext;
		component.b2Body.prototype.getAngle = component.b2Body.prototype.GetAngle;
		component.b2Body.prototype.setPosition = function (position) {
			let angle = this.GetAngle();
			let pos = new box2D.b2Vec2(position.x, position.y);
			this.SetTransform(pos, angle);
			component.destroyB2dObj(pos);
		};
		component.b2Body.prototype.getPosition = component.b2Body.prototype.GetPosition;
		component.b2Body.prototype.setGravityScale = component.b2Body.prototype.SetGravityScale;
		component.b2Body.prototype.setAngle = function (angle) {
			let pos = this.GetPosition();
			this.SetTransform(pos, angle);
		};
		component.b2Body.prototype.setTransform = component.b2Body.prototype.SetTransform;
		component.b2Body.prototype.isAwake = component.b2Body.prototype.IsAwake;
		component.b2Body.prototype.setAwake = component.b2Body.prototype.SetAwake;
		component.b2Body.prototype.setLinearVelocity = component.b2Body.prototype.SetLinearVelocity;
		component.b2Body.prototype.getLinearVelocity = component.b2Body.prototype.GetLinearVelocity;
		component.b2Body.prototype.applyLinearImpulse = component.b2Body.prototype.ApplyLinearImpulse;
		component.b2Body.prototype.applyTorque = component.b2Body.prototype.ApplyTorque;
		component.b2Body.prototype.setActive = component.b2Body.prototype.SetEnabled;
		component.b2Body.prototype.isActive = component.b2Body.prototype.IsEnabled;
		component.b2Body.prototype.getWorldCenter = component.b2Body.prototype.GetWorldCenter;
		component.b2Body.prototype.applyForce = component.b2Body.prototype.ApplyForce;
		component.b2Vec2.prototype.set = component.b2Vec2.prototype.Set;
		// component.b2Vec2.prototype.setV = component.b2Vec2.prototype.SetV;

		component.b2Joint.prototype.getNext = component.b2Joint.prototype.GetNext;

		let ctx: Phaser.GameObjects.Graphics;
		if (taro.isClient) {
			component.enableDebug = (flags = 1) => {
				console.log('please make sure clientPhyscisEngine is not "", and enabled csp');
				if (!component.renderer) {
					const canvas = taro.renderer.scene.getScene('Game');
					ctx = canvas.add.graphics().setDepth(9999);
					const scale = 30;
					ctx.setScale(scale);
					const newRenderer = new Box2dDebugDraw(box2D, new Box2dHelpers(box2D), ctx, scale).constructJSDraw();
					newRenderer.SetFlags(flags);
					component.renderer = newRenderer;
					component._world.SetDebugDraw(newRenderer);
					component.ctx = ctx;
				}
				component.renderer.SetFlags(flags);
			};
			component.disableDebug = () => {
				component.ctx.destroy();
				component.renderer = undefined;
			};
		}


		component.createWorld = function (id, options) {
			component._world = new component.b2World(this._gravity);
			component._world.SetContinuousPhysics(this._continuousPhysics);
		};

		/**
			 * Gets / sets the gravity vector.
			 * @param x
			 * @param y
			 * @return {*}
			 */
		component.gravity = function (x, y) {
			if (x !== undefined && y !== undefined) {
				this._gravity = component.recordLeak(new this.b2Vec2(x, y));
				return this._entity;
			}

			return this._gravity;
		};

		component.setContinuousPhysics = function (continuousPhysics) {
			this._continuousPhysics = continuousPhysics;
		};
		component._continuousPhysics = false;
		component._sleep = true;
		component._gravity = component.recordLeak(new component.b2Vec2(0, 0));

	},

	contactListener: function (self, beginContactCallback, endContactCallback, preSolve, postSolve) {
		var contactListener = new self.b2ContactListener();
		if (beginContactCallback !== undefined) {
			contactListener.BeginContact = beginContactCallback;
		}

		if (endContactCallback !== undefined) {
			contactListener.EndContact = endContactCallback;
		}

		if (preSolve !== undefined) {
			contactListener.PreSolve = preSolve;
		} else {
			contactListener.PreSolve = () => { };
		}

		if (postSolve !== undefined) {
			contactListener.PostSolve = postSolve;
		} else {
			contactListener.PostSolve = () => { };
		}
		self._world.SetContactListener(contactListener);
	},

	getmxfp: function (body) {
		return body.GetPosition();
	},

	queryAABB: function (self, aabb, callback) {
		self.world().QueryAABB(callback, aabb);
	},

	createBody: function (self, entity, body, isLossTolerant) {
		const box2D = self.box2D as typeof Box2D & EmscriptenModule;
		PhysicsComponent.prototype.log(`createBody of ${entity._stats.name}`);
		// immediately destroy body if entity already has box2dBody
		if (!entity) {
			PhysicsComponent.prototype.log('warning: creating body for non-existent entity');
			return;
		}

		// if there's already a body, destroy it first
		if (entity.body) {
			self.destroyBody(entity);
		}
		var tempDef = self.recordLeak(new self.b2BodyDef());
		var param;
		let tempBod: Box2D.b2Body & { [key: string]: any };
		var fixtureDef;
		var tempFixture;
		var finalFixture;
		var tempShape;
		var tempFilterData;
		var i;
		var finalX; var finalY;
		var finalWidth; var finalHeight;
		// Process body definition and create a box2d body for it
		switch (body.type) {
			case 'static':
				tempDef.set_type(box2D.b2_staticBody);
				break;

			case 'dynamic':
				tempDef.set_type(box2D.b2_dynamicBody);
				break;

			case 'kinematic':
				tempDef.set_type(box2D.b2_kinematicBody);
				break;
		}

		// Add the parameters of the body to the new body instance
		for (param in body) {
			if (body.hasOwnProperty(param)) {
				switch (param) {
					case 'type':
					case 'gravitic':
					case 'fixedRotation':
					case 'fixtures':
						// Ignore these for now, we process them
						// below as post-creation attributes
						break;

					default:
						const funcName = `set_${param}`;
						if (typeof tempDef[funcName] === 'function') {
							tempDef[funcName](body[param]);
						} else {
							tempDef[param] = body[param];
						}
						break;
				}
			}
		}

		// set rotation
		tempDef.set_angle(entity._rotate.z);
		// Set the position
		let nowPoint = self.recordLeak(new self.b2Vec2(entity._translate.x / self._scaleRatio, entity._translate.y / self._scaleRatio));
		tempDef.set_position(nowPoint);
		self.destroyB2dObj(nowPoint);
		// Create the new body
		tempBod = self._world.CreateBody(tempDef);

		// Now apply any post-creation attributes we need to
		for (param in body) {
			if (body.hasOwnProperty(param)) {
				switch (param) {
					case 'gravitic':
						if (!body.gravitic) {
							tempBod.SetGravityScale(0);
						}
						break;

					case 'fixedRotation':
						if (body.fixedRotation) {
							tempBod.SetFixedRotation(true);
						}
						break;

					case 'fixtures':
						if (body.fixtures && body.fixtures.length) {
							for (i = 0; i < body.fixtures.length; i++) {
								// Grab the fixture definition
								fixtureDef = body.fixtures[i];
								// Create the fixture
								tempFixture = self.createFixture(fixtureDef);
								tempFixture.taroId = fixtureDef.taroId;
								// Check for a shape definition for the fixture
								if (fixtureDef.shape) {
									// Create based on the shape type
									switch (fixtureDef.shape.type) {
										case 'circle':
											tempShape = self.recordLeak(new self.b2CircleShape());
											if (fixtureDef.shape.data && typeof (fixtureDef.shape.data.radius) !== 'undefined') {
												tempShape.set_m_radius(fixtureDef.shape.data.radius / self._scaleRatio);
											} else {
												tempShape.set_m_radius(entity._bounds2d.x / self._scaleRatio / 2);
											}

											if (fixtureDef.shape.data) {
												finalX = fixtureDef.shape.data.x ?? 0;
												finalY = fixtureDef.shape.data.y ?? 0;
												tempShape.set_m_p(new self.b2Vec2(finalX / self._scaleRatio, finalY / self._scaleRatio));
											}
											break;

										case 'polygon':
											tempShape = self.recordLeak(new self.b2PolygonShape());
											tempShape.SetAsArray(fixtureDef.shape.data._poly, fixtureDef.shape.data.length());
											break;

										case 'rectangle':
											tempShape = self.recordLeak(new self.b2PolygonShape());

											if (fixtureDef.shape.data) {
												finalX = fixtureDef.shape.data.x ?? 0;
												finalY = fixtureDef.shape.data.y ?? 0;
												finalWidth = fixtureDef.shape.data.width ?? (entity._bounds2d.x / 2);
												finalHeight = fixtureDef.shape.data.height ?? (entity._bounds2d.y / 2);
											} else {
												finalX = 0;
												finalY = 0;
												finalWidth = (entity._bounds2d.x / 2);
												finalHeight = (entity._bounds2d.y / 2);
											}
											const pos = self.recordLeak(new self.b2Vec2(finalX / self._scaleRatio, finalY / self._scaleRatio));
											// Set the polygon as a box
											tempShape.SetAsBox(
												(finalWidth / self._scaleRatio),
												(finalHeight / self._scaleRatio),
												pos,
												0
											);
											self.destroyB2dObj(pos);

											break;
									}
									if (tempShape && fixtureDef.filter) {
										tempFixture.shape = tempShape;
										finalFixture = tempBod.CreateFixture(tempFixture);
										self.destroyB2dObj(tempShape);
										finalFixture.taroId = tempFixture.taroId;
									}
								}

								if (fixtureDef.filter && finalFixture) {
									tempFilterData = self.recordLeak(new self._entity.physics.b2FilterData());

									if (fixtureDef.filter.filterCategoryBits !== undefined) {
										tempFilterData.categoryBits = fixtureDef.filter.filterCategoryBits;
									}
									if (fixtureDef.filter.filterMaskBits !== undefined) {
										tempFilterData.maskBits = fixtureDef.filter.filterMaskBits;
									}
									if (fixtureDef.filter.categoryIndex !== undefined) {
										tempFilterData.categoryIndex = fixtureDef.filter.categoryIndex;
									}

									finalFixture.SetFilterData(tempFilterData);
									self.destroyB2dObj(tempFilterData);
								}

								if (fixtureDef.friction !== undefined && finalFixture) {

									finalFixture.SetFriction(fixtureDef.friction);
								}
								if (fixtureDef.restitution !== undefined && finalFixture) {
									finalFixture.SetRestitution(fixtureDef.restitution);
								}
								if (fixtureDef.density !== undefined && finalFixture) {
									finalFixture.SetDensity(fixtureDef.density);
								}
								if (fixtureDef.isSensor !== undefined && finalFixture) {
									finalFixture.SetSensor(fixtureDef.isSensor);
								}
							}
						} else {
							self.log('Box2D body has no fixtures, have you specified fixtures correctly? They are supposed to be an array of fixture anys.', 'warning');
						}
						break;
				}
			}
		}

		// Store the entity that is linked to self body
		tempBod._entity = entity;
		tempBod.SetEnabled(true);
		// Add the body to the world with the passed fixture
		entity.body = tempBod;
		entity.gravitic(!!body.affectedByGravity);
		// rotate body to its previous value
		entity.rotateTo(0, 0, entity._rotate.z);
		// Add the body to the world with the passed fixture
		self.destroyB2dObj(tempDef);
		self.freeLeaked();
		return tempBod;
	},

	createJoint: function (self, entityA, entityB, anchorA, anchorB) {
		// if joint type none do nothing
		var aBody = entityA._stats.currentBody;
		var bBody = entityB._stats.currentBody;

		if (!aBody || aBody.jointType == 'none' || aBody.type == 'none') return;

		// create a joint only if there isn't pre-existing joint
		PhysicsComponent.prototype.log(`creating ${aBody.jointType} joint between ${entityA._stats.name} and ${entityB._stats.name}`);

		if (
			entityA && entityA.body && entityB && entityB.body &&
			entityA.id() != entityB.id() // im not creating joint to myself!
		) {
			if (aBody.jointType == 'revoluteJoint') {
				var joint_def = self.recordLeak(new self.b2RevoluteJointDef());

				joint_def.Initialize(
					entityA.body,
					entityB.body,
					entityB.body.GetWorldCenter());

				// joint_def.enableLimit = true;
				// joint_def.lowerAngle = aBody.itemAnchor.lowerAngle * 0.0174533; // degree to rad
				// joint_def.upperAngle = aBody.itemAnchor.upperAngle * 0.0174533; // degree to rad

				joint_def.GetLocalAnchorA().Set(anchorA.x / self._scaleRatio, anchorA.y / self._scaleRatio); // item anchor
				joint_def.GetLocalAnchorB().Set(anchorB.x / self._scaleRatio, -anchorB.y / self._scaleRatio); // unit anchor
			} else // weld joint
			{
				var joint_def = self.recordLeak(new self.b2WeldJointDef());
				const pos = self.recordLeak(entityA.body.GetWorldCenter());
				joint_def.Initialize(
					entityA.body,
					entityB.body,
					pos
				);
				self.destroyB2dObj(pos);
			}

			var joint = self._world.CreateJoint(joint_def); // joint between two pieces
			self.destroyB2dObj(joint_def);
			self.freeLeaked();
			// var serverStats = taro.server.getStatus()
			PhysicsComponent.prototype.log('joint created ', aBody.jointType);

			entityA.jointsAttached[entityB.id()] = joint;
			entityB.jointsAttached[entityA.id()] = joint;
		}
	}
};

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = box2dwasmWrapper;
}
