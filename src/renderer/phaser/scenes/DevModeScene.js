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
        var map = this.gameScene.tilemap;
        this.selectedTile = null;
        this.selectedTileArea = [[null, null], [null, null]];
        ige.client.on('enterDevMode', function () {
            _this.defaultZoom = (_this.gameScene.zoomSize / 2.15);
            if (!_this.devPalette) {
                _this.devPalette = new TilePalette(_this, _this.tileset, _this.rexUI);
                _this.devModeTools = new DevModeTools(_this, _this.devPalette);
                _this.paletteMarker = new TileMarker(_this, _this.devPalette.map, 1);
            }
            _this.devPalette.show();
            _this.devModeTools.layerButtonsContainer.setVisible(true);
            _this.devModeTools.toolButtonsContainer.setVisible(true);
            _this.devModeTools.highlightModeButton(0);
            _this.activateMarker(false);
            _this.regions.forEach(function (region) {
                region.show();
                region.label.visible = true;
            });
        });
        ige.client.on('leaveDevMode', function () {
            _this.cancelDrawRegion();
            _this.devPalette.hide();
            _this.devModeTools.layerButtonsContainer.setVisible(false);
            _this.devModeTools.toolButtonsContainer.setVisible(false);
            ige.client.emit('zoom', _this.defaultZoom);
            _this.regions.forEach(function (region) {
                if (region.devModeOnly) {
                    region.hide();
                }
                region.label.visible = false;
            });
        });
        var tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
        tabKey.on('down', function () {
            if (shouldPreventKeybindings()) {
                _this.input.keyboard.disableGlobalCapture();
            }
            else {
                _this.input.keyboard.enableGlobalCapture();
                if (ige.developerMode.active) {
                    if (_this.devPalette.visible) {
                        _this.devPalette.hide();
                    }
                    else {
                        _this.devPalette.show();
                    }
                }
            }
        });
        var shouldPreventKeybindings = function () {
            if (!$('#game-editor').is(':visible')) {
                return false;
            }
            var activeElement = document.activeElement;
            var inputs = ['input', 'select', 'textarea'];
            if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1) {
                return true;
            }
            return false;
        };
        var plusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, false);
        plusKey.on('down', function () {
            if (ige.developerMode.active && !shouldPreventKeybindings()) {
                var zoom = (_this.gameScene.zoomSize / 2.15) / 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        var minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, false);
        minusKey.on('down', function () {
            if (ige.developerMode.active && !shouldPreventKeybindings()) {
                var zoom = (_this.gameScene.zoomSize / 2.15) * 1.1;
                ige.client.emit('zoom', zoom);
            }
        });
        ige.client.on('editTile', function (data) {
            console.log('editTile', data);
            map.putTileAt(data.gid, data.x, data.y, false, data.layer);
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
        ige.client.on('editRegion', function (data) {
            if (data.newName && data.name !== data.newName) {
                var region = ige.regionManager.getRegionById(data.name);
                if (region)
                    region._stats.id = data.newName;
                _this.regions.forEach(function (region) {
                    if (region.name === data.name) {
                        region.name = data.newName;
                        region.updateLabel();
                    }
                });
            }
            else if (data.showModal) {
                ige.addNewRegion && ige.addNewRegion({ name: data.name, x: data.x, y: data.y, width: data.width, height: data.height, userId: data.userId });
            }
            ige.updateRegionInReact && ige.updateRegionInReact();
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
            if (_this.regionTool) {
                var worldPoint = _this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                _this.regionDrawStart = {
                    x: worldPoint.x,
                    y: worldPoint.y,
                };
            }
        }, this);
        var graphics = this.regionDrawGraphics = this.gameScene.add.graphics();
        var width;
        var height;
        this.gameScene.input.on('pointermove', function (pointer) {
            if (!pointer.leftButtonDown())
                return;
            else if (_this.regionTool) {
                var worldPoint = _this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                width = worldPoint.x - _this.regionDrawStart.x;
                height = worldPoint.y - _this.regionDrawStart.y;
                graphics.clear();
                graphics.lineStyle(2, 0x036ffc, 1);
                graphics.strokeRect(_this.regionDrawStart.x, _this.regionDrawStart.y, width, height);
            }
        }, this);
        this.gameScene.input.on('pointerup', function (pointer) {
            if (!pointer.leftButtonReleased())
                return;
            var worldPoint = _this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            if (_this.regionTool && _this.regionDrawStart && _this.regionDrawStart.x !== worldPoint.x && _this.regionDrawStart.y !== worldPoint.y) {
                graphics.clear();
                _this.regionTool = false;
                _this.devModeTools.highlightModeButton(0);
                var x = _this.regionDrawStart.x;
                var y = _this.regionDrawStart.y;
                if (width < 0) {
                    x = _this.regionDrawStart.x + width;
                    width *= -1;
                }
                if (height < 0) {
                    y = _this.regionDrawStart.y + height;
                    height *= -1;
                }
                ige.network.send('editRegion', { x: Math.trunc(x),
                    y: Math.trunc(y),
                    width: Math.trunc(width),
                    height: Math.trunc(height) });
                _this.regionDrawStart = null;
            }
        }, this);
    };
    DevModeScene.prototype.putTile = function (tileX, tileY, selectedTile) {
        var map = this.gameScene.tilemap;
        if (selectedTile && this.pointerInsideMap(tileX, tileY, map)) {
            var index = selectedTile.index;
            if (selectedTile.index === -1)
                index = 0;
            if (index !== (map.getTileAt(tileX, tileY, true)).index &&
                !(index === 0 && map.getTileAt(tileX, tileY, true).index === -1)) {
                map.putTileAt(index, tileX, tileY);
                map.getTileAt(tileX, tileY, true).tint = 0xffffff;
                console.log('place tile', index);
                ige.network.send('editTile', { gid: index, layer: map.currentLayerIndex, x: tileX, y: tileY });
            }
        }
    };
    DevModeScene.prototype.getTile = function (tileX, tileY, selectedTile, map) {
        if (this.pointerInsideMap(tileX, tileY, map)) {
            if (selectedTile)
                selectedTile.tint = 0xffffff;
            if (map.getTileAt(tileX, tileY) && map.getTileAt(tileX, tileY).index !== 0) {
                selectedTile = map.getTileAt(tileX, tileY);
                if (map === this.devPalette.map)
                    selectedTile.tint = 0x87cfff;
            }
            else {
                selectedTile = null;
            }
            this.activateMarker(true);
            this.devModeTools.highlightModeButton(2);
            return selectedTile;
        }
    };
    DevModeScene.prototype.cancelDrawRegion = function () {
        if (this.regionTool) {
            this.regionDrawGraphics.clear();
            this.regionTool = false;
            this.devModeTools.highlightModeButton(0);
            this.regionDrawStart = null;
        }
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
        return ((this.input.activePointer.x > this.devModeTools.layerButtonsContainer.x
            && this.input.activePointer.x < this.devModeTools.layerButtonsContainer.x + this.devModeTools.layerButtonsContainer.width
            && this.input.activePointer.y > this.devModeTools.layerButtonsContainer.y
            && this.input.activePointer.y < this.devModeTools.layerButtonsContainer.y + this.devModeTools.layerButtonsContainer.height)
            || (this.input.activePointer.x > this.devModeTools.toolButtonsContainer.x
                && this.input.activePointer.x < this.devModeTools.toolButtonsContainer.x + this.devModeTools.toolButtonsContainer.width
                && this.input.activePointer.y > this.devModeTools.toolButtonsContainer.y
                && this.input.activePointer.y < this.devModeTools.toolButtonsContainer.y + this.devModeTools.toolButtonsContainer.height));
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
                                this.selectedTileArea[i][j] = this.getTile(palettePointerTileX + i, palettePointerTileY + j, this.selectedTileArea[i][j], paletteMap);
                            }
                        }
                    }
                    else {
                        this.selectedTile = this.getTile(palettePointerTileX, palettePointerTileY, this.selectedTile, paletteMap);
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
                                this.selectedTileArea[i][j] = this.getTile(pointerTileX + i, pointerTileY + j, this.selectedTileArea[i][j], map);
                            }
                        }
                    }
                    else {
                        this.selectedTile = this.getTile(pointerTileX, pointerTileY, this.selectedTile, map);
                    }
                }
                if (this.input.manager.activePointer.leftButtonDown()) {
                    if (palette.area.x > 1 || palette.area.y > 1) {
                        for (var i = 0; i < palette.area.x; i++) {
                            for (var j = 0; j < palette.area.y; j++) {
                                this.putTile(pointerTileX + i, pointerTileY + j, this.selectedTileArea[i][j]);
                            }
                        }
                    }
                    else {
                        this.putTile(pointerTileX, pointerTileY, this.selectedTile);
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