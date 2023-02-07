var Region = TaroEntityPhysics.extend({
	classId: 'Region',
	componentId: 'region',

	init: function (data, entityIdFromServer) {
		TaroEntityPhysics.prototype.init.call(this);

		this.id(entityIdFromServer);

		var self = this;
		var regionName = typeof data.id === 'string' ? data.id : null;

		if (data && regionName) {
			self._stats = data;

			self.category('region');

			if (taro.isServer) {
				self.mount(taro.$('baseScene'));
			}

			this._stats.currentBody = {
				type: 'static',
				linearDamping: 1,
				angularDamping: 5,
				allowSleep: false,
				bullet: false,
				fixedRotation: false,
				fixtures: [{
					density: 0,
					friction: 0,
					restitution: 0,
					isSensor: true,
					shape: {
						type: 'rectangle'
					}
				}],
				collidesWith: { walls: true, units: true, projectiles: true, items: true},
				// Refactor TODO: width & height should've been assigned into "currentBody". not int "default".
				// Region is only one doing this (not unit/item/projectile). I shouldn't have to do below:
				width: self._stats.default.width,
				height: self._stats.default.height
			};

			var regionDimension = self._stats.default;

			if (taro.physics && taro.physics.engine === 'CRASH') {
				self._translate.x = regionDimension.x;
				self._translate.y = regionDimension.y;
			}
			else {
				self._translate.x = regionDimension.x + (regionDimension.width / 2);
				self._translate.y = regionDimension.y + (regionDimension.height / 2);
			}

			self.updateBody({
				translate: { x: self._translate.x, y: self._translate.y}
			});

			if (taro.isServer) {
				// TaroEntity.streamMode(val)
				// 1 is 'automatic' streaming
				self.streamMode(1);
			} else if (taro.isClient) {
				if ((mode === 'play' /*&& self._stats.default.inside*/) || mode === 'sandbox') {
					// o.O TODO: Remove /refactor
					taro.entitiesToRender.trackEntityById[entityIdFromServer] = this;
					
					taro.client.emit('create-region', this);
				}

				if (typeof mode === 'string' && mode === 'sandbox') {
					delete self._stats.value;

					if (taro.game.data.isDeveloper) {
						// creating region click handler if user is developer
						// /
						// need to see if we can do this with simple region instead
						// of using regionUi because we want to remove it entirely
						// /

						// TaroObject method
						self.drawMouse(true)
							// TaroEntity method (TaroUiEntity extends...)
							.mouseDown(function (event, evc) {
								if (
									taro.mapEditor.selectEntities &&
									event.which === 1 &&
									!taro.mapEditor.mouseDownOnMiniMap &&
									!taro.mapEditor.checkIfClickedMiniMap(event.pageX, event.pageY)
								) {
									var selectedRegion = self;
									if (selectedRegion._stats && selectedRegion._stats.id) {
										taro.regionManager.openRegionModal(selectedRegion._stats, selectedRegion._stats.id, false);
									}
								}
							});
					}
				}
			}
		}
		self.addBehaviour('regionBehaviour', self._behaviour);
	},
	updateDimension: function () {
		var regionCordinates = this._stats.default;
		this.translateTo(regionCordinates.x + (regionCordinates.width / 2), regionCordinates.y + (regionCordinates.height / 2), 0);
		this.width(regionCordinates.width);
		this.height(regionCordinates.height);

		if (taro.isServer) {
			var shapeData = {};
			var normalizer = 0.45;
			shapeData.width = regionCordinates.width * normalizer;
			shapeData.height = regionCordinates.height * normalizer;
			// shapeData.x = regionCordinates.x;
			// shapeData.y = regionCordinates.y;
			this._stats.currentBody.fixtures[0].shape.data = shapeData;
			this.updateBody(this._stats.currentBody);

		} else { // isClient
			this.emit('transform');
		}
	},

	streamUpdateData: function (queuedData) {
		TaroEntity.prototype.streamUpdateData.call(this, queuedData);

		for (var i = 0; i < queuedData.length; i++) {
			var data = queuedData[i];

			for (attrName in data) {
				var newValue = data[attrName];
				this._stats.default[attrName] = newValue;
			}
		}

		this.updateDimension();
	},

	_behaviour: function(ctx) {
		if (this._alive === false) {
			this.destroy();
		}

		this.processBox2dQueue();
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = Region; }
