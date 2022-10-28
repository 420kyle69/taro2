var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DevModeScene = /** @class */ (function (_super) {
    __extends(DevModeScene, _super);
    function DevModeScene() {
        return _super.call(this, { key: 'DevMode' }) || this;
    }
    DevModeScene.prototype.init = function () {
        var _this = this;
        this.input.setTopOnly(true);
        this.gameScene = ige.renderer.scene.getScene('Game');
        this.regions = [];
        //const map = this.devPalette.map;
        var map = this.gameScene.tilemap;
        this.selectedTile = null;
        this.selectedTileArea = [[null, null, null, null]];
        ige.client.on('enterDevMode', function () {
            _this.defaultZoom = (_this.gameScene.zoomSize / 2.15);
            if (!_this.devPalette) {
                _this.devPalette = new PhaserPalette(_this, _this.tileset, _this.rexUI);
                _this.paletteMarker = new TileMarker(_this, _this.devPalette.map, 1);
            }
            _this.devPalette.show();
            _this.devPalette.layerButtonsContainer.setVisible(true);
            _this.devPalette.toolButtonsContainer.setVisible(true);
            _this.devPalette.highlightModeButton(0);
            _this.activateMarker(false);
            _this.regions.forEach(function (region) {
                region.show();
            });
        });
        ige.client.on('leaveDevMode', function () {
            _this.devPalette.hide();
            _this.devPalette.layerButtonsContainer.setVisible(false);
            _this.devPalette.toolButtonsContainer.setVisible(false);
            ige.client.emit('zoom', _this.defaultZoom);
            _this.regions.forEach(function (region) {
                if (region.devModeOnly) {
                    region.hide();
                }
            });
        });
        var tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
        tabKey.on('down', function () {
            if (ige.developerMode.active) {
                if (_this.devPalette.visible) {
                    _this.devPalette.hide();
                }
                else {
                    _this.devPalette.show();
                }
            }
        });
        var plusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, true);
        plusKey.on('down', function () {
            if (ige.developerMode.active) {
                var zoom = (_this.gameScene.zoomSize / 2.15) / 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        var minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, true);
        minusKey.on('down', function () {
            if (ige.developerMode.active) {
                var zoom = (_this.gameScene.zoomSize / 2.15) * 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        ige.client.on('editTile', function (data) {
            console.log('editTile', data);
            map.putTileAt(data.gid, data.x, data.y, false, data.layer);
            //ige.developerMode.changedTiles.push(data);
            /* TODO: SAVE MAP DATA FROM SERVER SIDE */
            var width = ige.game.data.map.width;
            //save tile change to ige.game.map.data
            if (ige.game.data.map.layers.length > 4 && data.layer >= 2)
                data.layer++;
            ige.game.data.map.layers[data.layer].data[data.y * width + data.x] = data.gid;
            if (ige.physics && ige.game.data.map.layers[data.layer].name === 'walls') {
                //if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
                ige.physics.destroyWalls();
                var map_1 = ige.scaleMap(_.cloneDeep(ige.game.data.map));
                ige.tiled.loadJson(map_1, function (layerArray, IgeLayersById) {
                    ige.physics.staticsFromMap(IgeLayersById.walls);
                });
            }
        });
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            if (_this.devPalette && _this.devPalette.visible) {
                _this.devPalette.zoom(deltaY);
            }
        });
    };
    DevModeScene.prototype.preload = function () {
        /*const data = ige.game.data;

        data.map.tilesets.forEach((tileset) => {
            const key = `tiles/${tileset.name}`;
            this.load.once(`filecomplete-image-${key}`, () => {
                const texture = this.textures.get(key);
                const canvas = this.mainScene.extrude(tileset,
                    texture.getSourceImage() as HTMLImageElement
                );
                if (canvas) {
                    this.textures.remove(texture);
                    this.textures.addCanvas(`extruded-${key}`, canvas);
                }
            });
            this.load.image(key, this.patchAssetUrl(tileset.image));
        });*/
        this.load.image('cursor', 'https://cache.modd.io/asset/spriteImage/1666276041347_cursor.png');
        this.load.image('region', 'https://cache.modd.io/asset/spriteImage/1666882309997_region.png');
        this.load.image('stamp', 'https://cache.modd.io/asset/spriteImage/1666724706664_stamp.png');
        this.load.image('eraser', 'https://cache.modd.io/asset/spriteImage/1666276083246_erasergap.png');
        this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 
        //'src/renderer/phaser/rexuiplugin.min.js',
        'rexUI', 'rexUI');
    };
    DevModeScene.prototype.create = function () {
        var _this = this;
        var data = ige.game.data;
        var map = this.tilemap = this.make.tilemap({ key: 'map' });
        data.map.tilesets.forEach(function (tileset) {
            var key = "tiles/".concat(tileset.name);
            var extrudedKey = "extruded-".concat(key);
            //if (this.textures.exists(extrudedKey)) {
            _this.tileset = map.addTilesetImage(tileset.name, extrudedKey, tileset.tilewidth, tileset.tileheight, (tileset.margin || 0) + 1, (tileset.spacing || 0) + 2);
            /*} else {
                this.tileset = map.addTilesetImage(tileset.name, key);
            }*/
        });
        var gameMap = this.gameScene.tilemap;
        console.log('game map', gameMap);
        gameMap.currentLayerIndex = 0;
        this.selectedTile = gameMap.getTileAt(2, 3);
        this.marker = new TileMarker(this.gameScene, gameMap, 2);
        this.gameScene.input.on('pointerdown', function (pointer) {
            if (this.regionTool) {
                var worldPoint = this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                this.regionDrawStart = {
                    x: worldPoint.x,
                    y: worldPoint.y,
                };
            }
        }, this);
        var graphics = this.gameScene.add.graphics();
        var width;
        var height;
        this.gameScene.input.on('pointermove', function (pointer) {
            if (!pointer.isDown)
                return;
            else if (this.regionTool) {
                var worldPoint = this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                width = worldPoint.x - this.regionDrawStart.x;
                height = worldPoint.y - this.regionDrawStart.y;
                graphics.clear();
                graphics.lineStyle(2, 0x036ffc, 1);
                graphics.strokeRect(this.regionDrawStart.x, this.regionDrawStart.y, width, height);
            }
        }, this);
        this.gameScene.input.on('pointerup', function (pointer) {
            var worldPoint = this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            if (this.regionTool && this.regionDrawStart.x !== worldPoint.x && this.regionDrawStart.y !== worldPoint.y) {
                graphics.clear();
                this.regionTool = false;
                this.devPalette.highlightModeButton(0);
                new PhaserRegion(this.gameScene, { _stats: { default: { x: this.regionDrawStart.x, y: this.regionDrawStart.y, width: width, height: height } }, on: function (eventName, call, context, oneShot, sendEventName) { } });
                this.regionDrawStart = {};
            }
        }, this);
    };
    DevModeScene.prototype.activateMarker = function (active) {
        this.marker.active = active;
        this.marker.graphics.setVisible(active);
        if (active)
            this.regionTool = false;
    };
    DevModeScene.prototype.pointerInsideMap = function (pointerX, pointerY, map) {
        return (0 <= pointerX && pointerX < map.width
            && 0 <= pointerY && pointerY < map.height);
    };
    DevModeScene.prototype.pointerInsidePalette = function () {
        return (this.input.activePointer.x > this.devPalette.scrollBarContainer.x
            && this.input.activePointer.x < this.devPalette.scrollBarContainer.x + this.devPalette.scrollBarContainer.width
            && this.input.activePointer.y > this.devPalette.scrollBarContainer.y - 30
            && this.input.activePointer.y < this.devPalette.scrollBarContainer.y + this.devPalette.scrollBarContainer.height);
    };
    DevModeScene.prototype.pointerInsideButtons = function () {
        return ((this.input.activePointer.x > this.devPalette.layerButtonsContainer.x
            && this.input.activePointer.x < this.devPalette.layerButtonsContainer.x + this.devPalette.layerButtonsContainer.width
            && this.input.activePointer.y > this.devPalette.layerButtonsContainer.y
            && this.input.activePointer.y < this.devPalette.layerButtonsContainer.y + this.devPalette.layerButtonsContainer.height)
            || (this.input.activePointer.x > this.devPalette.toolButtonsContainer.x
                && this.input.activePointer.x < this.devPalette.toolButtonsContainer.x + this.devPalette.toolButtonsContainer.width
                && this.input.activePointer.y > this.devPalette.toolButtonsContainer.y
                && this.input.activePointer.y < this.devPalette.toolButtonsContainer.y + this.devPalette.toolButtonsContainer.height));
    };
    DevModeScene.prototype.update = function () {
        if (ige.developerMode.active) {
            var palette = this.devPalette;
            var map = this.gameScene.tilemap;
            var paletteMap = palette.map;
            var worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
            var palettePoint = this.cameras.getCamera('palette').getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
            var marker = this.marker;
            var paletteMarker = this.paletteMarker;
            paletteMarker.graphics.clear();
            paletteMarker.graphics.strokeRect(0, 0, paletteMap.tileWidth * palette.texturesLayer.scaleX, paletteMap.tileHeight * palette.texturesLayer.scaleY);
            paletteMarker.graphics.setVisible(true);
            // Rounds down to nearest tile
            var palettePointerTileX = paletteMap.worldToTileX(palettePoint.x);
            var palettePointerTileY = paletteMap.worldToTileY(palettePoint.y);
            if (palette.visible && this.pointerInsidePalette()) {
                marker.graphics.setVisible(false);
                // Snap to tile coordinates, but in world space
                paletteMarker.graphics.x = paletteMap.tileToWorldX(palettePointerTileX);
                paletteMarker.graphics.y = paletteMap.tileToWorldY(palettePointerTileY);
                if (this.input.manager.activePointer.isDown) {
                    if (palette.area.x > 1 || palette.area.y > 1) {
                        for (var i = 0; i < palette.area.x; i++) {
                            for (var j = 0; j < palette.area.y; j++) {
                                if (this.pointerInsideMap(palettePointerTileX + i, palettePointerTileY + j, paletteMap)) {
                                    if (this.selectedTileArea[i][j])
                                        this.selectedTileArea[i][j].tint = 0xffffff;
                                    if (paletteMap.getTileAt(palettePointerTileX + i, palettePointerTileY + j).index !== 0) {
                                        this.selectedTileArea[i][j] = paletteMap.getTileAt(palettePointerTileX + i, palettePointerTileY + j);
                                        this.selectedTileArea[i][j].tint = 0x87cfff;
                                    }
                                    else {
                                        this.selectedTileArea[i][j] = null;
                                    }
                                    this.activateMarker(true);
                                    this.devPalette.highlightModeButton(2);
                                }
                            }
                        }
                    }
                    else {
                        if (this.pointerInsideMap(palettePointerTileX, palettePointerTileY, paletteMap)) {
                            if (this.selectedTile)
                                this.selectedTile.tint = 0xffffff;
                            if (paletteMap.getTileAt(palettePointerTileX, palettePointerTileY).index !== 0) {
                                this.selectedTile = paletteMap.getTileAt(palettePointerTileX, palettePointerTileY);
                                this.selectedTile.tint = 0x87cfff;
                            }
                            else {
                                this.selectedTile = null;
                            }
                            this.activateMarker(true);
                            this.devPalette.highlightModeButton(2);
                        }
                    }
                }
            }
            else if ((!this.pointerInsidePalette() || !palette.visible) &&
                !this.pointerInsideButtons() && marker.active) {
                paletteMarker.graphics.setVisible(false);
                marker.graphics.setVisible(true);
                // Rounds down to nearest tile
                var pointerTileX = map.worldToTileX(worldPoint.x);
                var pointerTileY = map.worldToTileY(worldPoint.y);
                // Snap to tile coordinates, but in world space
                marker.graphics.x = map.tileToWorldX(pointerTileX);
                marker.graphics.y = map.tileToWorldY(pointerTileY);
                if (this.input.manager.activePointer.rightButtonDown()) {
                    if (palette.area.x > 1 || palette.area.y > 1) {
                        for (var i = 0; i < palette.area.x; i++) {
                            for (var j = 0; j < palette.area.y; j++) {
                                if (this.pointerInsideMap(pointerTileX + i, pointerTileY + j, map)) {
                                    if (this.selectedTileArea[i][j])
                                        this.selectedTileArea[i][j].tint = 0xffffff;
                                    if (map.getTileAt(pointerTileX + i, pointerTileY + j).index !== 0) {
                                        this.selectedTileArea[i][j] = map.getTileAt(pointerTileX + i, pointerTileY + j);
                                    }
                                    else {
                                        this.selectedTileArea[i][j] = null;
                                    }
                                    this.activateMarker(true);
                                    this.devPalette.highlightModeButton(2);
                                }
                            }
                        }
                    }
                    else {
                        if (this.pointerInsideMap(pointerTileX, pointerTileY, map)) {
                            if (this.selectedTile)
                                this.selectedTile.tint = 0xffffff;
                            if (map.getTileAt(pointerTileX, pointerTileY) && map.getTileAt(pointerTileX, pointerTileY).index !== 0) {
                                this.selectedTile = map.getTileAt(pointerTileX, pointerTileY);
                            }
                            else {
                                this.selectedTile = null;
                            }
                            this.activateMarker(true);
                            this.devPalette.highlightModeButton(2);
                        }
                    }
                }
                if (this.input.manager.activePointer.leftButtonDown()) {
                    if (palette.area.x > 1 || palette.area.y > 1) {
                        for (var i = 0; i < palette.area.x; i++) {
                            for (var j = 0; j < palette.area.y; j++) {
                                if (this.pointerInsideMap(pointerTileX + i, pointerTileY + j, map) && this.selectedTileArea[i][j]
                                    && this.selectedTileArea[i][j].index !== (map.getTileAt(pointerTileX + i, pointerTileY + j, true)).index) {
                                    if (this.selectedTileArea[i][j].index === -1)
                                        this.selectedTile[i][j].index = 0;
                                    map.putTileAt(this.selectedTileArea[i][j], pointerTileX + i, pointerTileY + j);
                                    map.getTileAt(pointerTileX + i, pointerTileY + j, true).tint = 0xffffff;
                                    console.log('place tile', this.selectedTileArea[i][j].index);
                                    ige.network.send('editTile', { gid: this.selectedTileArea[i][j].index, layer: map.currentLayerIndex, x: pointerTileX + i, y: pointerTileY + j });
                                }
                            }
                        }
                    }
                    else {
                        if (this.pointerInsideMap(pointerTileX, pointerTileY, map) && this.selectedTile
                            && this.selectedTile.index !== (map.getTileAt(pointerTileX, pointerTileY, true)).index) {
                            if (this.selectedTile.index === -1)
                                this.selectedTile.index = 0;
                            map.putTileAt(this.selectedTile, pointerTileX, pointerTileY);
                            map.getTileAt(pointerTileX, pointerTileY, true).tint = 0xffffff;
                            console.log('place tile', this.selectedTile.index);
                            ige.network.send('editTile', { gid: this.selectedTile.index, layer: map.currentLayerIndex, x: pointerTileX, y: pointerTileY });
                        }
                    }
                }
            }
        }
        else
            this.marker.graphics.setVisible(false);
    };
    return DevModeScene;
}(PhaserScene));
//# sourceMappingURL=DevModeScene.js.map