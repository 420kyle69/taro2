var EntityEditor = /** @class */ (function () {
    function EntityEditor(gameScene, devModeScene, devModeTools) {
        var _this = this;
        this.gameScene = gameScene;
        this.devModeTools = devModeTools;
        gameScene.input.on('pointerdown', function (p) {
            var _a, _b, _c;
            var entityData = /*{
                id: 'uNdbzdXKIs',
                player: 'AI resources',
                entityType: 'itemTypes'
            }*/ inGameEditor.getActiveEntity && inGameEditor.getActiveEntity();
            if (_this.activeEntityPlacement && entityData) {
                var worldPoint = gameScene.cameras.main.getWorldPoint(_this.gameScene.input.activePointer.x, _this.gameScene.input.activePointer.y);
                var entity = taro.game.data[entityData.entityType][entityData.id];
                var actionType = void 0;
                var height = void 0;
                var width = void 0;
                if (entityData.entityType === 'unitTypes') {
                    actionType = 'createEntityForPlayerAtPositionWithDimensions';
                    if ((_a = entity.bodies) === null || _a === void 0 ? void 0 : _a.default) {
                        height = entity.bodies.default.height;
                        width = entity.bodies.default.width;
                    }
                    else {
                        console.log('no default body for unit', entityData.id);
                        return;
                    }
                }
                else if (entityData.entityType === 'itemTypes') {
                    actionType = 'createEntityAtPositionWithDimensions';
                    if ((_b = entity.bodies) === null || _b === void 0 ? void 0 : _b.dropped) {
                        height = entity.bodies.dropped.height;
                        width = entity.bodies.dropped.width;
                    }
                    else {
                        console.log('no dropped body for item', entityData.id);
                        return;
                    }
                }
                else if (entityData.entityType === 'projectileTypes') {
                    actionType = 'createEntityAtPositionWithDimensions';
                    if ((_c = entity.bodies) === null || _c === void 0 ? void 0 : _c.default) {
                        height = entity.bodies.default.height;
                        width = entity.bodies.default.width;
                    }
                    else {
                        console.log('no default body for projectile', entityData.id);
                        return;
                    }
                }
                var action = {
                    type: actionType,
                    entity: entityData.id,
                    entityType: entityData.entityType,
                    position: {
                        function: 'xyCoordinate',
                        x: worldPoint.x,
                        y: worldPoint.y
                    },
                    width: width,
                    height: height,
                    angle: 0,
                    actionId: taro.newIdHex()
                };
                if (entityData.entityType === 'unitTypes') {
                    action.player = {
                        variableName: entityData.player,
                        function: 'getVariable'
                    };
                }
                devModeScene.createEntityImage(action);
                taro.network.send('editInitEntity', action);
            }
        });
    }
    EntityEditor.prototype.activatePlacement = function (active) {
        if (active) {
            //show entities list
            this.activeEntityPlacement = true;
            inGameEditor.toggleEntityPlacementWindow && inGameEditor.toggleEntityPlacementWindow(true);
            if (!this.devModeTools.paletteButton.hidden) {
                this.devModeTools.palette.toggle();
            }
        }
        else {
            //hide entities list
            this.activeEntityPlacement = false;
            inGameEditor.toggleEntityPlacementWindow && inGameEditor.toggleEntityPlacementWindow(false);
            if (this.devModeTools.paletteButton.hidden) {
                this.devModeTools.palette.toggle();
            }
        }
    };
    EntityEditor.prototype.update = function () {
        /*if(taro.developerMode.active && taro.developerMode.activeTab === 'map') {
            const devModeScene = this.devModeTools.scene;
            const palette = this.tilePalette;
            const map = this.gameScene.tilemap as Phaser.Tilemaps.Tilemap;
            const paletteMap = palette.map;
            const worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
            const palettePoint = devModeScene.cameras.getCamera('palette').getWorldPoint(devModeScene.input.activePointer.x, devModeScene.input.activePointer.y);
            const marker = this.marker;
            const paletteMarker = this.paletteMarker;

            paletteMarker.graphics.clear();
            paletteMarker.graphics.strokeRect(0, 0, paletteMap.tileWidth * palette.texturesLayer.scaleX, paletteMap.tileHeight * palette.texturesLayer.scaleY);
            paletteMarker.graphics.setVisible(true);

            // Rounds down to nearest tile
            const palettePointerTileX = paletteMap.worldToTileX(palettePoint.x);
            const palettePointerTileY = paletteMap.worldToTileY(palettePoint.y);

            if (palette.visible	&& devModeScene.pointerInsidePalette()) {
                devModeScene.regionEditor.cancelDrawRegion();
                marker.graphics.setVisible(false);
                marker.showPreview(false);
                
                // Snap to tile coordinates, but in world space
                paletteMarker.graphics.x = paletteMap.tileToWorldX(palettePointerTileX);
                paletteMarker.graphics.y = paletteMap.tileToWorldY(palettePointerTileY);

            } else if ((!devModeScene.pointerInsidePalette() || !palette.visible) &&
                !devModeScene.pointerInsideButtons && !devModeScene.pointerInsideWidgets() && map.currentLayerIndex >=0) {

                this.devModeTools.tooltip.showMessage('Position', 'X: ' + Math.floor(worldPoint.x).toString() + ', Y: ' + Math.floor(worldPoint.y).toString());

                if (marker.active) {
                    paletteMarker.graphics.setVisible(false);
                    marker.graphics.setVisible(true);
                    marker.showPreview(true);

                    // Rounds down to nearest tile
                    const pointerTileX = map.worldToTileX(worldPoint.x);
                    const pointerTileY = map.worldToTileY(worldPoint.y);

                    // Snap to tile coordinates, but in world space
                    marker.graphics.x = map.tileToWorldX(pointerTileX);
                    marker.graphics.y = map.tileToWorldY(pointerTileY);
                    marker.preview.x = map.tileToWorldX(pointerTileX);
                    marker.preview.y = map.tileToWorldY(pointerTileY);

                    if (devModeScene.input.manager.activePointer.leftButtonDown()) {
                        if (this.devModeTools.modeButtons[2].active || this.devModeTools.modeButtons[3].active) {
                            if (this.area.x > 1 || this.area.y > 1) {
                                for (let i = 0; i < this.area.x; i++) {
                                    for (let j = 0; j < this.area.y; j++) {
                                        this.putTile(pointerTileX + i, pointerTileY + j, this.selectedTileArea[i][j]);
                                    }
                                }
                            }
                            else {
                                this.putTile(pointerTileX, pointerTileY, this.selectedTile);
                            }
                        } else if (this.devModeTools.modeButtons[4].active) {
                            const targetTile = this.getTile(pointerTileX, pointerTileY, map);
                            if (this.selectedTile && targetTile !== this.selectedTile && (targetTile || map.currentLayerIndex === 0 || map.currentLayerIndex === 1)) {
                                this.floodFill(map.currentLayerIndex, targetTile, this.selectedTile, pointerTileX, pointerTileY, false);
                                taro.network.send('editTile', {gid: this.selectedTile, layer: map.currentLayerIndex, x: pointerTileX, y: pointerTileY, tool: 'flood'});
                            }

                        }
                    }
                }
            } else {
                this.showMarkers(false);
            }
        }
        else {
            this.showMarkers(false);
        }*/
    };
    return EntityEditor;
}());
//# sourceMappingURL=EntityEditor.js.map