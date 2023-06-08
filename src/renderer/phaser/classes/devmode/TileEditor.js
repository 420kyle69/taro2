var TileEditor = /** @class */ (function () {
    function TileEditor(gameScene, devModeScene, devModeTools, commandController) {
        var _this = this;
        this.gameScene = gameScene;
        this.devModeTools = devModeTools;
        var palette = this.tilePalette = this.devModeTools.palette;
        var gameMap = this.gameScene.tilemap;
        this.marker = new TileMarker(this.gameScene, devModeScene, gameMap, false, 2, commandController);
        this.paletteMarker = new TileMarker(this.devModeTools.scene, devModeScene, this.tilePalette.map, true, 1, commandController);
        this.commandController = commandController;
        this.paletteArea = { x: 1, y: 1 };
        this.brushArea = new TileShape();
        this.selectedTileArea = {};
        var pointerPosition = { x: 0, y: 0 };
        this.activateMarkers(false);
        this.startDragIn = 'none';
        var shiftKey = devModeScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false);
        gameScene.input.on('pointerdown', function (p) {
            if (!devModeScene.pointerInsideButtons &&
                !devModeScene.pointerInsideWidgets() &&
                (!palette.visible || !devModeScene.pointerInsidePalette()) &&
                _this.gameScene.tilemap.currentLayerIndex >= 0 &&
                devModeScene.input.manager.activePointer.rightButtonDown()) {
                _this.startDragIn = 'map';
                pointerPosition.x = gameScene.input.activePointer.x;
                pointerPosition.y = gameScene.input.activePointer.y;
            }
        });
        devModeScene.input.on('pointerdown', function (p) {
            if (!devModeScene.pointerInsideButtons &&
                !devModeScene.pointerInsideWidgets() &&
                palette.visible && devModeScene.pointerInsidePalette()) {
                _this.startDragIn = 'palette';
                pointerPosition.x = devModeScene.input.activePointer.x;
                pointerPosition.y = devModeScene.input.activePointer.y;
                if (!devModeTools.modeButtons[3].active)
                    _this.devModeTools.brush();
                if (shiftKey.isDown) {
                    //pass
                }
                else {
                    if (p.button === 0) {
                        _this.selectedTileArea = {};
                        _this.clearTint();
                    }
                }
            }
        });
        devModeScene.input.on('pointermove', function (p) {
            var _a;
            if (devModeTools.modeButtons[2].active && p.isDown && p.button === 0 &&
                Math.abs(pointerPosition.x - devModeScene.input.activePointer.x) < 50 &&
                Math.abs(pointerPosition.y - devModeScene.input.activePointer.y) < 50 &&
                _this.startDragIn === 'palette') {
                var palettePoint = devModeScene.cameras.getCamera('palette').getWorldPoint(p.x, p.y);
                var palettePointerTileX = palette.map.worldToTileX(palettePoint.x);
                var palettePointerTileY = palette.map.worldToTileY(palettePoint.y);
                if (!_this.selectedTileArea[palettePointerTileX]) {
                    _this.selectedTileArea[palettePointerTileX] = {};
                }
                var tile = _this.getTile(palettePointerTileX, palettePointerTileY, palette.map);
                _this.selectedTileArea[palettePointerTileX][palettePointerTileY] = tile;
                // apply tint to palette tile
                var paletteLayer = _this.tilePalette.map.layers[0];
                var row = Math.floor((tile - 1) / paletteLayer.width);
                var paletteTile = (_a = paletteLayer === null || paletteLayer === void 0 ? void 0 : paletteLayer.data[row]) === null || _a === void 0 ? void 0 : _a[tile - 1 - (row * paletteLayer.width)];
                if (paletteTile)
                    paletteTile.tint = 0x87cfff;
                _this.marker.changePreview();
            }
        });
        devModeScene.input.on('pointerup', function (p) {
            var _a;
            if (_this.startDragIn === 'palette' &&
                Math.abs(pointerPosition.x - devModeScene.input.activePointer.x) < 50 &&
                Math.abs(pointerPosition.y - devModeScene.input.activePointer.y) < 50 && p.button === 0) {
                var palettePoint = devModeScene.cameras.getCamera('palette').getWorldPoint(devModeScene.input.activePointer.x, devModeScene.input.activePointer.y);
                var palettePointerTileX = palette.map.worldToTileX(palettePoint.x);
                var palettePointerTileY = palette.map.worldToTileY(palettePoint.y);
                if (!_this.selectedTileArea[palettePointerTileX]) {
                    _this.selectedTileArea[palettePointerTileX] = {};
                }
                var tile = _this.getTile(palettePointerTileX, palettePointerTileY, palette.map);
                _this.selectedTileArea[palettePointerTileX][palettePointerTileY] = tile;
                // apply tint to palette tile
                var paletteLayer = _this.tilePalette.map.layers[0];
                var row = Math.floor((tile - 1) / paletteLayer.width);
                var paletteTile = (_a = paletteLayer === null || paletteLayer === void 0 ? void 0 : paletteLayer.data[row]) === null || _a === void 0 ? void 0 : _a[tile - 1 - (row * paletteLayer.width)];
                if (paletteTile)
                    paletteTile.tint = 0x87cfff;
                _this.marker.changePreview();
            }
            if (_this.startDragIn === 'palette') {
                _this.startDragIn = 'none';
            }
        });
        gameScene.input.on('pointerup', function (p) {
            //TODO hanlde pick color
            if (_this.startDragIn === 'map' &&
                Math.abs(pointerPosition.x - gameScene.input.activePointer.x) < 50 &&
                Math.abs(pointerPosition.y - gameScene.input.activePointer.y) < 50 &&
                p.button === 0 &&
                !devModeTools.modeButtons[3].active) {
                var worldPoint = gameScene.cameras.main.getWorldPoint(gameScene.input.activePointer.x, gameScene.input.activePointer.y);
                var pointerTileX = gameMap.worldToTileX(worldPoint.x);
                var pointerTileY = gameMap.worldToTileY(worldPoint.y);
                _this.clearTint();
                for (var i = 0; i < _this.brushArea.size.x; i++) {
                    if (!_this.selectedTileArea[i]) {
                        _this.selectedTileArea[i] = {};
                    }
                    for (var j = 0; j < _this.brushArea.size.y; j++) {
                        _this.selectedTileArea[i][j] = _this.getTile(pointerTileX, pointerTileY, gameMap);
                    }
                }
                _this.marker.changePreview();
            }
            if (_this.startDragIn === 'map') {
                _this.startDragIn = 'none';
            }
        });
    }
    TileEditor.prototype.activateMarkers = function (active) {
        this.marker.active = active;
        this.paletteMarker.active = active;
        if (active)
            this.devModeTools.regionEditor.regionTool = false;
    };
    TileEditor.prototype.showMarkers = function (value) {
        this.marker.graphics.setVisible(value);
        this.marker.showPreview(value);
        this.paletteMarker.graphics.setVisible(value);
    };
    TileEditor.prototype.clearTint = function () {
        this.tilePalette.map.layers[0].data.forEach(function (tilearray) {
            tilearray.forEach(function (tile) {
                if (tile)
                    tile.tint = 0xffffff;
            });
        });
    };
    TileEditor.prototype.edit = function (data) {
        var map = taro.game.data.map;
        inGameEditor.mapWasEdited && inGameEditor.mapWasEdited();
        var width = map.width;
        var tileMap = this.gameScene.tilemap;
        if (data.tool === 'flood') {
            var tempLayer = data.layer;
            if (map.layers.length > 4 && data.layer >= 2) {
                tempLayer++;
            }
            var oldTile = map.layers[tempLayer].data[data.y * width + data.x];
            this.floodFill(data.layer, oldTile, data.gid, data.x, data.y, true);
        }
        else if (data.tool === 'clear') {
            this.clearLayer(data.layer);
            if (map.layers.length > 4 && data.layer >= 2)
                data.layer++;
        }
        else {
            var index = data.gid;
            if (data.gid === 0)
                index = -1;
            tileMap.putTileAt(index, data.x, data.y, false, data.layer);
            /* TODO: SAVE MAP DATA FROM SERVER SIDE */
            //save tile change to taro.game.map.data
            if (map.layers.length > 4 && data.layer >= 2)
                data.layer++;
            map.layers[data.layer].data[data.y * width + data.x] = data.gid;
        }
        if (taro.physics && map.layers[data.layer].name === 'walls') {
            //if changes was in 'walls' layer we destroy all old walls and create new staticsFromMap
            taro.physics.destroyWalls();
            var mapCopy = taro.scaleMap(_.cloneDeep(map));
            taro.tiled.loadJson(mapCopy, function (layerArray, TaroLayersById) {
                taro.physics.staticsFromMap(TaroLayersById.walls);
            });
        }
    };
    TileEditor.prototype.putTile = function (tileX, tileY, selectedTile, local) {
        var map = this.gameScene.tilemap;
        if (this.gameScene.tilemapLayers[map.currentLayerIndex].visible && selectedTile && this.devModeTools.scene.pointerInsideMap(tileX, tileY, map)) {
            var index = selectedTile;
            if (index !== (map.getTileAt(tileX, tileY, true)).index &&
                !(index === 0 && map.getTileAt(tileX, tileY, true).index === -1)) {
                map.putTileAt(index, tileX, tileY);
                map.getTileAt(tileX, tileY, true).tint = 0xffffff;
                if (!local) {
                    if (index === -1)
                        index = 0;
                    taro.network.send('editTile', { gid: index, layer: map.currentLayerIndex, x: tileX, y: tileY });
                }
            }
        }
    };
    TileEditor.prototype.getTile = function (tileX, tileY, map) {
        if (this.devModeTools.scene.pointerInsideMap(tileX, tileY, map)) {
            if (map.getTileAt(tileX, tileY) && map.getTileAt(tileX, tileY).index !== 0) {
                var selectedTile = map.getTileAt(tileX, tileY);
                return selectedTile.index;
            }
        }
    };
    TileEditor.prototype.floodFill = function (layer, oldTile, newTile, x, y, fromServer) {
        if (fromServer) {
            var map = taro.game.data.map;
            inGameEditor.mapWasEdited && inGameEditor.mapWasEdited();
            var tileMap = this.gameScene.tilemap;
            var width = map.width;
            //fix for debris layer
            var tempLayer = layer;
            if (map.layers.length > 4 && layer >= 2) {
                tempLayer++;
            }
            if (oldTile === newTile || map.layers[tempLayer].data[y * width + x] !== oldTile) {
                return;
            }
            tileMap.putTileAt(newTile, x, y, false, layer);
            //save tile change to taro.game.map.data
            map.layers[tempLayer].data[y * width + x] = newTile;
            if (x > 0) {
                this.floodFill(layer, oldTile, newTile, x - 1, y, fromServer);
            }
            if (x < (map.width - 1)) {
                this.floodFill(layer, oldTile, newTile, x + 1, y, fromServer);
            }
            if (y > 0) {
                this.floodFill(layer, oldTile, newTile, x, y - 1, fromServer);
            }
            if (y < (map.height - 1)) {
                this.floodFill(layer, oldTile, newTile, x, y + 1, fromServer);
            }
        }
        else {
            var tileMap = this.gameScene.tilemap;
            if (oldTile === newTile ||
                tileMap.getTileAt(x, y, true, layer).index !== oldTile ||
                tileMap.getTileAt(x, y, true, layer).index === 0 ||
                tileMap.getTileAt(x, y, true, layer).index === -1) {
                return;
            }
            tileMap.putTileAt(newTile, x, y, false, layer);
            if (x > 0) {
                this.floodFill(layer, oldTile, newTile, x - 1, y, fromServer);
            }
            if (x < (tileMap.width - 1)) {
                this.floodFill(layer, oldTile, newTile, x + 1, y, fromServer);
            }
            if (y > 0) {
                this.floodFill(layer, oldTile, newTile, x, y - 1, fromServer);
            }
            if (y < (tileMap.height - 1)) {
                this.floodFill(layer, oldTile, newTile, x, y + 1, fromServer);
            }
        }
    };
    TileEditor.prototype.clearLayer = function (layer) {
        var map = taro.game.data.map;
        inGameEditor.mapWasEdited && inGameEditor.mapWasEdited();
        var tileMap = this.gameScene.tilemap;
        var width = map.width;
        //fix for debris layer
        var tempLayer = layer;
        if (map.layers.length > 4 && layer >= 2) {
            tempLayer++;
        }
        for (var i = 0; i < map.width; i++) {
            for (var j = 0; j < map.height; j++) {
                if (map.layers[tempLayer].data[j * width + i] !== 0) {
                    tileMap.putTileAt(-1, i, j, false, layer);
                    //save tile change to taro.game.map.data
                    map.layers[tempLayer].data[j * width + i] = 0;
                }
            }
        }
    };
    TileEditor.prototype.update = function () {
        var _this = this;
        if (taro.developerMode.active && taro.developerMode.activeTab === 'map') {
            var devModeScene = this.devModeTools.scene;
            var palette = this.tilePalette;
            var map_1 = this.gameScene.tilemap;
            var paletteMap = palette.map;
            var worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
            var palettePoint = devModeScene.cameras.getCamera('palette').getWorldPoint(devModeScene.input.activePointer.x, devModeScene.input.activePointer.y);
            var marker = this.marker;
            var paletteMarker = this.paletteMarker;
            paletteMarker.graphics.clear();
            paletteMarker.graphics.strokeRect(0, 0, paletteMap.tileWidth * palette.texturesLayer.scaleX, paletteMap.tileHeight * palette.texturesLayer.scaleY);
            paletteMarker.graphics.setVisible(true);
            // Rounds down to nearest tile
            var palettePointerTileX = paletteMap.worldToTileX(palettePoint.x);
            var palettePointerTileY = paletteMap.worldToTileY(palettePoint.y);
            if (palette.visible && devModeScene.pointerInsidePalette()) {
                devModeScene.regionEditor.cancelDrawRegion();
                marker.graphics.setVisible(false);
                marker.showPreview(false);
                // Snap to tile coordinates, but in world space
                paletteMarker.graphics.x = paletteMap.tileToWorldX(palettePointerTileX);
                paletteMarker.graphics.y = paletteMap.tileToWorldY(palettePointerTileY);
            }
            else if ((!devModeScene.pointerInsidePalette() || !palette.visible) &&
                !devModeScene.pointerInsideButtons && !devModeScene.pointerInsideWidgets() && map_1.currentLayerIndex >= 0) {
                this.devModeTools.tooltip.showMessage('Position', "X: ".concat(Math.floor(worldPoint.x).toString(), ", Y: ").concat(Math.floor(worldPoint.y).toString()));
                if (marker.active) {
                    paletteMarker.graphics.setVisible(false);
                    marker.graphics.setVisible(true);
                    marker.showPreview(true);
                    // Rounds down to nearest tile
                    var pointerTileX_1 = map_1.worldToTileX(worldPoint.x - (marker.graphics.scaleX - 0.5) * TILE_SIZE / 2, true);
                    var pointerTileY_1 = map_1.worldToTileY(worldPoint.y - (marker.graphics.scaleY - 0.5) * TILE_SIZE / 2, true);
                    // Snap to tile coordinates, but in world space
                    marker.graphics.x = map_1.tileToWorldX(pointerTileX_1);
                    marker.graphics.y = map_1.tileToWorldY(pointerTileY_1);
                    marker.preview.x = map_1.tileToWorldX(pointerTileX_1);
                    marker.preview.y = map_1.tileToWorldY(pointerTileY_1);
                    if (devModeScene.input.manager.activePointer.leftButtonDown()) {
                        if (this.devModeTools.modeButtons[2].active || this.devModeTools.modeButtons[3].active) {
                            var originTileArea_1 = {};
                            var nowBrushArea_1 = JSON.parse(JSON.stringify(this.brushArea));
                            var sample_1 = JSON.parse(JSON.stringify(this.brushArea.sample));
                            var noDifferent_1 = true;
                            Object.entries(sample_1).map(function (_a) {
                                var x = _a[0], obj = _a[1];
                                Object.entries(obj).map(function (_a) {
                                    var y = _a[0], value = _a[1];
                                    if (!originTileArea_1[x]) {
                                        originTileArea_1[x] = {};
                                    }
                                    originTileArea_1[x][y] = _this.getTile(pointerTileX_1 + parseInt(x), pointerTileY_1 + parseInt(y), map_1);
                                    if (value !== originTileArea_1[x][y]) {
                                        noDifferent_1 = false;
                                    }
                                });
                            });
                            if (!noDifferent_1) {
                                this.commandController.addCommand({
                                    func: function () {
                                        for (var i = 0; i < nowBrushArea_1.size.x; i++) {
                                            for (var j = 0; j < nowBrushArea_1.size.y; j++) {
                                                if (sample_1[i] && sample_1[i][j]) {
                                                    _this.putTile(pointerTileX_1 + i, pointerTileY_1 + j, sample_1[i][j]);
                                                }
                                            }
                                        }
                                    },
                                    undo: function () {
                                        for (var i = 0; i < nowBrushArea_1.size.x; i++) {
                                            for (var j = 0; j < nowBrushArea_1.size.y; j++) {
                                                _this.putTile(pointerTileX_1 + i, pointerTileY_1 + j, originTileArea_1[i][j]);
                                            }
                                        }
                                    }
                                });
                            }
                        }
                        else if (this.devModeTools.modeButtons[4].active) {
                            var targetTile = this.getTile(pointerTileX_1, pointerTileY_1, map_1);
                            var selectedTile = Object.values(Object.values(this.selectedTileArea)[0])[0];
                            if (selectedTile && targetTile !== selectedTile && (targetTile || map_1.currentLayerIndex === 0 || map_1.currentLayerIndex === 1)) {
                                this.floodFill(map_1.currentLayerIndex, targetTile, selectedTile, pointerTileX_1, pointerTileY_1, false);
                                taro.network.send('editTile', { gid: selectedTile, layer: map_1.currentLayerIndex, x: pointerTileX_1, y: pointerTileY_1, tool: 'flood' });
                            }
                        }
                    }
                }
            }
            else {
                this.showMarkers(false);
            }
        }
        else {
            this.showMarkers(false);
        }
    };
    return TileEditor;
}());
//# sourceMappingURL=TileEditor.js.map