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

						if (taro.physics) {
							taro.physics.staticsFromMap(TaroLayersById.walls);
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
