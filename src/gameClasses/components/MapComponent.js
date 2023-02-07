var MapComponent = TaroEntity.extend({
	classId: 'MapComponent',
	componentId: 'map',

	init: function () {
		//
	},

	load: function (data) {
		var self = this;

		self.data = data;

		if (taro.isServer) {
			taro.addComponent(TaroTiledComponent)
				.tiled.loadJson(data, function (layerArray, layersById) {

					taro.physics.staticsFromMap(layersById.walls);

					self.createRegions();
				});

		} else if (taro.isClient) {
			$.when(taro.client.taroEngineStarted).done(function () {
				taro.addComponent(TaroTiledComponent)
					.tiled.loadJson(data, function (TaroLayerArray, TaroLayersById) {

						data.tilewidth = Number(data.tilewidth);
						data.tileheight = Number(data.tileheight);
						data.width = Number(data.width);
						data.height = Number(data.height);

						if (taro.physics) {
							taro.physics.staticsFromMap(TaroLayersById.walls);
						}

						// We can add all our layers to our main scene by looping the
						// array or we can pick a particular layer via the layersById
						// object. Let's give an example:
						if (mode === 'sandbox') {
							var mapHeight = taro.game.data.map.height * taro.game.data.map.tileheight;
							var mapWidth = taro.game.data.map.width * taro.game.data.map.tilewidth;
							// changed to Region from RegionUi
							var region = new Region({ height: mapHeight, width: mapWidth });
							region.depth(3)
								.layer(3)
								.drawBoundsData(false)
								.drawBounds(false)
								.mount(taro.client.rootScene)
								.translateTo(0 + (mapWidth / 2), 0 + (mapHeight / 2), 0)
								.height(mapHeight)
								.width(mapWidth)
								.bounds2d(mapWidth, mapHeight, 0);
						}
						taro.client.mapLoaded.resolve();
					});
			});
		}
	},
	createRegions: function () {
		var regions = {};
		for (var i in taro.game.data.variables) {
			var variable = taro.game.data.variables[i];
			if (variable.dataType == 'region') regions[i] = variable;
		}
		taro.$$('region').forEach((region) => {
			region.deleteRegion();
		});
		for (var regionName in regions) {
			if (!taro.regionManager.getRegionById(regionName)) {
				var data = regions[regionName];
				if (data) {
					data.id = regionName;
					new Region(data);
				}
			}
		}
	},

	getDimensions: function () {
		return {

		};
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = MapComponent;
}
