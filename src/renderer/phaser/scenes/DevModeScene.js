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
            _this.enterDevMode();
        });
        ige.client.on('leaveDevMode', function () {
            _this.leaveDevMode();
        });
        var tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
        tabKey.on('down', function () {
            if (shouldPreventKeybindings()) {
                _this.input.keyboard.disableGlobalCapture();
            }
            else {
                _this.input.keyboard.enableGlobalCapture();
                if (ige.developerMode.active) {
                    if (_this.tilePalette.visible) {
                        _this.tilePalette.hide();
                    }
                    else {
                        _this.tilePalette.show();
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
            _this.regionEditor.edit(data);
        });
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            if (_this.tilePalette && _this.tilePalette.visible) {
                _this.tilePalette.zoom(deltaY);
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
    };
    DevModeScene.prototype.enterDevMode = function () {
        this.defaultZoom = (this.gameScene.zoomSize / 2.15);
        if (!this.tilePalette) {
            this.tilePalette = new TilePalette(this, this.tileset, this.rexUI);
            this.devModeTools = new DevModeTools(this, this.tilePalette);
            this.regionEditor = this.devModeTools.regionEditor;
            this.paletteMarker = new TileMarker(this, this.tilePalette.map, 1);
        }
        this.tilePalette.show();
        this.devModeTools.layerButtonsContainer.setVisible(true);
        this.devModeTools.toolButtonsContainer.setVisible(true);
        this.devModeTools.highlightModeButton(0);
        this.activateMarker(false);
        this.regionEditor.showRegions();
    };
    DevModeScene.prototype.leaveDevMode = function () {
        this.regionEditor.cancelDrawRegion();
        this.tilePalette.hide();
        this.devModeTools.layerButtonsContainer.setVisible(false);
        this.devModeTools.toolButtonsContainer.setVisible(false);
        this.regionEditor.hideRegions();
        ige.client.emit('zoom', this.defaultZoom);
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
                if (map === this.tilePalette.map)
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
    DevModeScene.prototype.activateMarker = function (active) {
        this.marker.active = active;
        this.marker.graphics.setVisible(active);
        if (active)
            this.regionEditor.regionTool = false;
    };
    DevModeScene.prototype.pointerInsideMap = function (pointerX, pointerY, map) {
        return (0 <= pointerX && pointerX < map.width
            && 0 <= pointerY && pointerY < map.height);
    };
    DevModeScene.prototype.pointerInsidePalette = function () {
        return (this.input.activePointer.x > this.tilePalette.scrollBarContainer.x
            && this.input.activePointer.x < this.tilePalette.scrollBarContainer.x + this.tilePalette.scrollBarContainer.width
            && this.input.activePointer.y > this.tilePalette.scrollBarContainer.y - 30
            && this.input.activePointer.y < this.tilePalette.scrollBarContainer.y + this.tilePalette.scrollBarContainer.height);
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
            var palette = this.tilePalette;
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