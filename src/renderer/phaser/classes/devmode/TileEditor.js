var TileEditor = /** @class */ (function () {
    function TileEditor(gameScene, devModeScene, devModeTools) {
        this.gameScene = gameScene;
        this.devModeTools = devModeTools;
        this.tilePalette = this.devModeTools.palette;
        var gameMap = this.gameScene.tilemap;
        this.marker = new TileMarker(this.gameScene, gameMap, 2);
        this.paletteMarker = new TileMarker(this.devModeTools.scene, this.tilePalette.map, 1);
        this.area = { x: 1, y: 1 };
        this.selectedTile = null;
        this.selectedTileArea = [[null, null], [null, null]];
    }
    TileEditor.prototype.activateMarker = function (active) {
        this.marker.active = active;
        this.marker.graphics.setVisible(active);
        this.paletteMarker.active = active;
        this.paletteMarker.graphics.setVisible(active);
        if (active)
            this.devModeTools.regionEditor.regionTool = false;
    };
    TileEditor.prototype.edit = function (data) {
        console.log('editTile', data);
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
        if (selectedTile && this.devModeTools.scene.pointerInsideMap(tileX, tileY, map)) {
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
    TileEditor.prototype.getTile = function (tileX, tileY, selectedTile, map) {
        if (this.devModeTools.scene.pointerInsideMap(tileX, tileY, map)) {
            if (selectedTile)
                selectedTile.tint = 0xffffff;
            if (map.getTileAt(tileX, tileY) && map.getTileAt(tileX, tileY).index !== 0) {
                selectedTile = map.getTileAt(tileX, tileY);
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
                marker.graphics.setVisible(false);
                // Snap to tile coordinates, but in world space
                paletteMarker.graphics.x = paletteMap.tileToWorldX(palettePointerTileX);
                paletteMarker.graphics.y = paletteMap.tileToWorldY(palettePointerTileY);
                if (devModeScene.input.manager.activePointer.isDown) {
                    this.devModeTools.brush();
                    if (this.area.x > 1 || this.area.y > 1) {
                        for (var i = 0; i < this.area.x; i++) {
                            for (var j = 0; j < this.area.y; j++) {
                                this.selectedTileArea[i][j] = this.getTile(palettePointerTileX + i, palettePointerTileY + j, this.selectedTileArea[i][j], paletteMap);
                            }
                        }
                    }
                    else {
                        this.selectedTile = this.getTile(palettePointerTileX, palettePointerTileY, this.selectedTile, paletteMap);
                    }
                }
            }
            else if ((!devModeScene.pointerInsidePalette() || !palette.visible) &&
                !devModeScene.pointerInsideButtons() && marker.active) {
                paletteMarker.graphics.setVisible(false);
                marker.graphics.setVisible(true);
                // Rounds down to nearest tile
                var pointerTileX = map.worldToTileX(worldPoint.x);
                var pointerTileY = map.worldToTileY(worldPoint.y);
                // Snap to tile coordinates, but in world space
                marker.graphics.x = map.tileToWorldX(pointerTileX);
                marker.graphics.y = map.tileToWorldY(pointerTileY);
                if (devModeScene.input.manager.activePointer.rightButtonDown() && !this.devModeTools.modeButtons[3].active) {
                    if (this.area.x > 1 || this.area.y > 1) {
                        for (var i = 0; i < this.area.x; i++) {
                            for (var j = 0; j < this.area.y; j++) {
                                this.selectedTileArea[i][j] = this.getTile(pointerTileX + i, pointerTileY + j, this.selectedTileArea[i][j], map);
                            }
                        }
                    }
                    else {
                        this.selectedTile = this.getTile(pointerTileX, pointerTileY, this.selectedTile, map);
                    }
                }
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
            this.paletteMarker.graphics.setVisible(false);
        }
    };
    return TileEditor;
}());
//# sourceMappingURL=TileEditor.js.map