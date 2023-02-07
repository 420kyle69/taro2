/**
 * Loads slightly modified Tiled-format json map data into the Isogenic Engine.
 */
var TaroTiledComponent = TaroClass.extend({
	classId: 'TaroTiledComponent',
	componentId: 'tiled',

	/**
	 * @constructor
	 * @param entity
	 * @param options
	 */
	init: function (entity, options) {
		this._entity = entity;
		this._options = options;
	},

	/**
	 * Loads a .js Tiled json-format file and converts to taro format,
	 * then calls the callback with the newly created scene and the
	 * various layers as TaroTextureMap instances.
	 * @param url
	 * @param callback
	 */
	loadJson: function (url, callback) {
		var self = this;
		var scriptElem;

		if (typeof (url) === 'string') {
			if (taro.isClient) {
				scriptElem = document.createElement('script');
				scriptElem.src = url;
				scriptElem.onload = function () {
					self.log('Tiled data loaded, processing...');
					self._processData(tiled, callback);
				};
				document.getElementsByTagName('head')[0].appendChild(scriptElem);
			} else {
				TaroTiledComponent.prototype.log('URL-based Tiled data is only available client-side. If you want to load Tiled map data on the server please include the map file in your ServerConfig.js file and then specify the map\'s data object instead of the URL.', 'error');
			}
		} else {
			self._processData(url, callback);
		}
	},

	_processData: function (data, callback) {
		if (taro.isServer && (data == undefined || data.layers == undefined)) {
			TaroTiledComponent.prototype.log('layer doesn\'t exist. unpublishing...');
			taro.server.unpublish('TaroTiledComponent#51');
		}
		var self = this;
		var mapClass = taro.isServer === true ? TaroTileMap2d : TaroTextureMap;
		var mapWidth = data.width;
		var mapHeight = data.height;
		var layerArray = data.layers;
		var layerCount = layerArray ? layerArray.length : 0;
		var layer;
		var layerType;
		var layerData;
		var layerDataCount;
		var maps = [];
		var layersById = {};
		var tileSetArray = data.tilesets;
		var tileSetCount = tileSetArray ? tileSetArray.length : 0;
		var tileSetItem;
		var tileSetsTotal = tileSetCount;
		var tileSetsLoaded = 0;
		var textureCellLookup = [];
		var currentTexture;
		var currentCell;
		var onLoadFunc;
		var image;
		var textures = [];
		var allTexturesLoadedFunc;
		var i; var k; var x; var y; var z;
		var ent;

		//if (taro.isClient) {
			taro.layersById = layersById;
		//}

		// Define the function to call when all textures have finished loading
		allTexturesLoadedFunc = function () {
			// Create a map for each layer
			for (i = 0; i < layerCount; i++) {
				layer = layerArray[i];
				layerType = layer.type;

				// Check if the layer is a tile layer or an object layer
				if (layerType === 'tilelayer') {
					layerData = layer.data;

					TaroTiledComponent.prototype.log(`setting ${layer.name} to depth ${i}`);

					maps[i] = new mapClass(data.tilewidth, data.tileheight);

					if (typeof maps[i].tileWidth == 'function') {
						maps[i].tileWidth(data.tilewidth)
							.tileHeight(data.tilewidth)
							.depth(i);
					} else {
						TaroTiledComponent.prototype.log('ERROR while loading map. Chris might have fixed this');
						taro.server.unpublish('TaroTiledComponent#109');
						return;
					}

					maps[i].type = layerType;
					maps[i].name = layer.name;

					// Check if the layer should be isometric mounts enabled
					if (data.orientation === 'isometric') {
						maps[i].isometricMounts(true);
					}

					layersById[layer.name] = maps[i];
					tileSetCount = tileSetArray.length;

					if (taro.isClient && !self.cs) {
						for (k = 0; k < tileSetCount; k++) {
							maps[i].addTexture(textures[k]);
						}
					}

					// Loop through the layer data and paint the tiles
					layerDataCount = layerData.length;

					for (y = 0; y < mapHeight; y++) {
						for (x = 0; x < mapWidth; x++) {
							z = x + (y * mapWidth);

							if (layerData[z] > 0 && layerData[z] !== 2147483712) {
								maps[i].occupyTile(x, y, 1, 1, layerData[z]);
							}
						}
					}
				}

				if (layerType === 'objectgroup') {
					maps[i] = layer;
					layersById[layer.name] = maps[i];
				}
			}

			callback(maps, layersById);
		};

		if (taro.isClient && !self.cs) {
			onLoadFunc = function (textures, tileSetCount, tileSetItem) {
				return function () {
					var i, cc;

					var imageUrl = tileSetItem.image;
					var scaleFactor = taro.scaleMapDetails.scaleFactor;

					if (imageUrl.includes('tilesheet') || tileSetCount === 0) {
						tileSetItem.tilewidth = taro.scaleMapDetails.originalTileWidth;
						tileSetItem.tileheight = taro.scaleMapDetails.originalTileHeight;
					}

					if (!self.cs) {
						self.cs = new TaroCellSheet(imageUrl, this.width * scaleFactor.x / tileSetItem.tilewidth, this.height * scaleFactor.y / tileSetItem.tileheight, taro.scaleMapDetails.shouldScaleTilesheet)
						.id(tileSetItem.name)
						.on('loaded', function () {
							if (taro.scaleMapDetails.shouldScaleTilesheet && (imageUrl.includes('tilesheet') || tileSetCount === 0)) {
								this.resize(this._sizeX * scaleFactor.x, this._sizeY * scaleFactor.y);
							}
							cc = this.cellCount();

							this._tiledStartingId = tileSetItem.firstgid;
							// Fill the lookup array
							for (i = 0; i < cc; i++) {
								textureCellLookup[this._tiledStartingId + i] = this;
							}

							textures.push(this);

							tileSetsLoaded++;

							if (tileSetsLoaded === tileSetsTotal) {
								// All textures loaded, fire processing function
								allTexturesLoadedFunc();
							}
						});
					}
				};
			};

			// TODO remove image loading or entire TaroTiledComponent

			// Load the tile sets as textures
			while (tileSetCount--) {
				// Load the image into memory first so we can read the total width and height
				image = new Image();

				tileSetItem = tileSetArray[tileSetCount];
				image.onload = onLoadFunc(textures, tileSetCount, tileSetItem);

				image.src = tileSetItem.image;
			}
		} else {
			// We're on the server so no textures are actually loaded
			allTexturesLoadedFunc();
		}
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = TaroTiledComponent;
}
