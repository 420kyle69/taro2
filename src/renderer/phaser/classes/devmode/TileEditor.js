var TileEditor = /** @class */ (function () {
    function TileEditor(gameScene, devModeScene, devModeTools) {
        var _this = this;
        this.gameScene = gameScene;
        this.devModeTools = devModeTools;
        var palette = this.tilePalette = this.devModeTools.palette;
        var gameMap = this.gameScene.tilemap;
        this.marker = new TileMarker(this.gameScene, gameMap, false, 2);
        this.paletteMarker = new TileMarker(this.devModeTools.scene, this.tilePalette.map, true, 1);
        this.area = { x: 1, y: 1 };
        this.selectedTile = null;
        this.selectedTileArea = [[null, null], [null, null]];
        var pointerPosition = { x: 0, y: 0 };
        this.startDragIn = 'none';
        devModeScene.input.on('pointerdown', function (p) {
            if (!devModeScene.pointerInsideButtons() &&
                !devModeScene.pointerInsideWidgets() &&
                palette.visible && devModeScene.pointerInsidePalette()) {
                _this.startDragIn = 'palette';
                pointerPosition.x = devModeScene.input.activePointer.x;
                pointerPosition.y = devModeScene.input.activePointer.y;
            }
        });
        gameScene.input.on('pointerdown', function (p) {
            if (!devModeScene.pointerInsideButtons() &&
                !devModeScene.pointerInsideWidgets() &&
                (palette.visible || devModeScene.pointerInsidePalette()) &&
                _this.gameScene.tilemap.currentLayerIndex >= 0 &&
                devModeScene.input.manager.activePointer.rightButtonDown()) {
                _this.startDragIn = 'map';
                pointerPosition.x = gameScene.input.activePointer.x;
                pointerPosition.y = gameScene.input.activePointer.y;
            }
        });
        devModeScene.input.on('pointerup', function (p) {
            if (_this.startDragIn === 'palette' &&
                Math.abs(pointerPosition.x - devModeScene.input.activePointer.x) < 50 &&
                Math.abs(pointerPosition.y - devModeScene.input.activePointer.y) < 50) {
                var palettePoint = devModeScene.cameras.getCamera('palette').getWorldPoint(devModeScene.input.activePointer.x, devModeScene.input.activePointer.y);
                var palettePointerTileX = palette.map.worldToTileX(palettePoint.x);
                var palettePointerTileY = palette.map.worldToTileY(palettePoint.y);
                _this.devModeTools.brush();
                if (_this.area.x > 1 || _this.area.y > 1) {
                    for (var i = 0; i < _this.area.x; i++) {
                        for (var j = 0; j < _this.area.y; j++) {
                            _this.selectedTileArea[i][j] = _this.getTile(palettePointerTileX + i, palettePointerTileY + j, _this.selectedTileArea[i][j], palette.map);
                        }
                    }
                }
                else {
                    _this.selectedTile = _this.getTile(palettePointerTileX, palettePointerTileY, _this.selectedTile, palette.map);
                }
            }
            if (_this.startDragIn === 'palette') {
                _this.startDragIn = 'none';
            }
        });
        gameScene.input.on('pointerup', function (p) {
            if (_this.startDragIn === 'map' &&
                Math.abs(pointerPosition.x - gameScene.input.activePointer.x) < 50 &&
                Math.abs(pointerPosition.y - gameScene.input.activePointer.y) < 50 &&
                !devModeTools.modeButtons[3].active) {
                var worldPoint = gameScene.cameras.main.getWorldPoint(gameScene.input.activePointer.x, gameScene.input.activePointer.y);
                var pointerTileX = gameMap.worldToTileX(worldPoint.x);
                var pointerTileY = gameMap.worldToTileY(worldPoint.y);
                if (_this.area.x > 1 || _this.area.y > 1) {
                    for (var i = 0; i < _this.area.x; i++) {
                        for (var j = 0; j < _this.area.y; j++) {
                            _this.selectedTileArea[i][j] = _this.getTile(pointerTileX + i, pointerTileY + j, _this.selectedTileArea[i][j], gameMap);
                        }
                    }
                }
                else {
                    _this.selectedTile = _this.getTile(pointerTileX, pointerTileY, _this.selectedTile, gameMap);
                }
            }
            if (_this.startDragIn === 'map') {
                _this.startDragIn = 'none';
            }
        });
    }
    TileEditor.prototype.activateMarker = function (active) {
        //this.marker.activate(active);
        this.marker.active = active;
        this.marker.graphics.setVisible(active);
        if (this.marker.visiblePreview)
            this.marker.preview.setVisible(active);
        else
            this.marker.preview.setVisible(false);
        //this.paletteMarker.activate(active);
        this.paletteMarker.active = active;
        this.paletteMarker.graphics.setVisible(active);
        if (active)
            this.devModeTools.regionEditor.regionTool = false;
    };
    TileEditor.prototype.edit = function (data) {
        var map = this.gameScene.tilemap;
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
    };
    TileEditor.prototype.putTile = function (tileX, tileY, selectedTile) {
        var map = this.gameScene.tilemap;
        if (this.gameScene.tilemapLayers[map.currentLayerIndex].visible && selectedTile && this.devModeTools.scene.pointerInsideMap(tileX, tileY, map)) {
            var index = selectedTile.index;
            if (selectedTile.index === -1)
                index = 0;
            if (index !== (map.getTileAt(tileX, tileY, true)).index &&
                !(index === 0 && map.getTileAt(tileX, tileY, true).index === -1)) {
                map.putTileAt(index, tileX, tileY);
                map.getTileAt(tileX, tileY, true).tint = 0xffffff;
                ige.network.send('editTile', { gid: index, layer: map.currentLayerIndex, x: tileX, y: tileY });
            }
        }
    };
    TileEditor.prototype.getTile = function (tileX, tileY, selectedTile, map) {
        if (this.devModeTools.scene.pointerInsideMap(tileX, tileY, map)) {
            if (selectedTile)
                selectedTile.tint = 0xffffff;
            if (map.getTileAt(tileX, tileY) && map.getTileAt(tileX, tileY).index !== 0) {
                selectedTile = map.getTileAt(tileX, tileY);
                this.marker.preview.setTexture('extruded-tiles/tilesheet_complete', selectedTile.index - 1);
                if (map === this.tilePalette.map)
                    selectedTile.tint = 0x87cfff;
            }
            return selectedTile;
        }
    };
    TileEditor.prototype.update = function () {
        if (ige.developerMode.active && ige.developerMode.activeTab === 'map') {
            var devModeScene = this.devModeTools.scene;
            var palette = this.tilePalette;
            var map = this.gameScene.tilemap;
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
                marker.preview.setVisible(false);
                // Snap to tile coordinates, but in world space
                paletteMarker.graphics.x = paletteMap.tileToWorldX(palettePointerTileX);
                paletteMarker.graphics.y = paletteMap.tileToWorldY(palettePointerTileY);
            }
            else if ((!devModeScene.pointerInsidePalette() || !palette.visible) &&
                !devModeScene.pointerInsideButtons() && !devModeScene.pointerInsideWidgets() && marker.active && map.currentLayerIndex >= 0) {
                paletteMarker.graphics.setVisible(false);
                marker.graphics.setVisible(true);
                if (this.marker.visiblePreview)
                    marker.preview.setVisible(true);
                // Rounds down to nearest tile
                var pointerTileX = map.worldToTileX(worldPoint.x);
                var pointerTileY = map.worldToTileY(worldPoint.y);
                // Snap to tile coordinates, but in world space
                marker.graphics.x = map.tileToWorldX(pointerTileX);
                marker.graphics.y = map.tileToWorldY(pointerTileY);
                marker.preview.x = map.tileToWorldX(pointerTileX);
                marker.preview.y = map.tileToWorldY(pointerTileY);
                if (devModeScene.input.manager.activePointer.leftButtonDown()) {
                    if (this.area.x > 1 || this.area.y > 1) {
                        for (var i = 0; i < this.area.x; i++) {
                            for (var j = 0; j < this.area.y; j++) {
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
        else {
            this.marker.graphics.setVisible(false);
            if (this.marker.visiblePreview)
                this.marker.preview.setVisible(false);
            this.paletteMarker.graphics.setVisible(false);
        }
    };
    return TileEditor;
}());
//# sourceMappingURL=TileEditor.js.map