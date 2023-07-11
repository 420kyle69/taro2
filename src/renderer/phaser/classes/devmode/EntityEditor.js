var EntityEditor = /** @class */ (function () {
    function EntityEditor(gameScene, devModeScene, devModeTools) {
        var _this = this;
        this.gameScene = gameScene;
        this.devModeTools = devModeTools;
        this.preview = gameScene.add.image(0, 0, null, 0);
        this.preview.setAlpha(0.75).setVisible(false);
        this.outline = gameScene.add.graphics();
        this.dragPoints = {};
        this.dragPoints['topLeft'] = this.gameScene.add.graphics();
        this.dragPoints['top'] = this.gameScene.add.graphics();
        this.dragPoints['topRight'] = this.gameScene.add.graphics();
        this.dragPoints['right'] = this.gameScene.add.graphics();
        this.dragPoints['bottomRight'] = this.gameScene.add.graphics();
        this.dragPoints['bottom'] = this.gameScene.add.graphics();
        this.dragPoints['bottomLeft'] = this.gameScene.add.graphics();
        this.dragPoints['left'] = this.gameScene.add.graphics();
        Object.values(this.dragPoints).forEach(function (point) {
            point.setInteractive({ draggable: true });
            /*scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                if (!devModeTools.cursorButton.active || gameObject !== image) return;
                if (this.dragMode === 'position') {
                    gameObject.x = dragX;
                    gameObject.y = dragY;
                    editedAction.position = {x: dragX, y: dragY};
                } else if (this.dragMode === 'angle' && !isNaN(action.angle)) {
                    const target = Phaser.Math.Angle.BetweenPoints(gameObject, { x: dragX, y: dragY });
                    gameObject.rotation = target;
                    editedAction.angle = gameObject.angle;
                } else if (this.dragMode === 'scale' && !isNaN(action.width) && !isNaN(action.height)) {
                    const dragScale = Math.min(500, Math.max(-250, (this.startDragY - dragY)));
                    gameObject.scale = this.scale + this.scale * dragScale / 500;
                    editedAction.width = image.displayWidth;
                    editedAction.height = image.displayHeight;
                }
                this.updateOutline();
            });
    
            scene.input.on('dragend', (pointer, gameObject) => {
                if (gameObject !== image) return;
                this.dragMode = null;
                this.edit(editedAction);
                editedAction = {actionId: action.actionId};
            });*/
        });
        /*for (let i = 0; i < 4; i++) {
            const dragPoint = this.gameScene.add.graphics();
            dragPoint.fillStyle(0xffffff, 1);
            dragPoint.fillRect(0, 0, 5, 5);
            dragPoint.setVisible(true);
            this.dragPoints.push(dragPoint);
        }*/
        /*
        this.activeEntity = {
            id: 'ROrWqytd2r',
            player: 'AI resources',
            entityType: 'unitTypes'
        }
        this.updatePreview();
        */
        taro.client.on('updateActiveEntity', function () {
            _this.activeEntity = inGameEditor.getActiveEntity && inGameEditor.getActiveEntity();
            _this.updatePreview();
        });
        gameScene.input.on('pointerdown', function (p) {
            var _a, _b, _c;
            if (!p.leftButtonDown())
                return;
            var entityData = _this.activeEntity;
            if (_this.activeEntityPlacement && entityData) {
                var worldPoint = gameScene.cameras.main.getWorldPoint(_this.gameScene.input.activePointer.x, _this.gameScene.input.activePointer.y);
                var entity = taro.game.data[entityData.entityType] && taro.game.data[entityData.entityType][entityData.id];
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
        this.selectedEntityImage = null;
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
    EntityEditor.prototype.updatePreview = function () {
        var _a, _b, _c;
        var entityData = this.activeEntity;
        if (!entityData) {
            this.preview.setVisible(false);
            return;
        }
        var entity = taro.game.data[entityData.entityType] && taro.game.data[entityData.entityType][entityData.id];
        var height;
        var width;
        var key;
        if (entityData.entityType === 'unitTypes') {
            key = "unit/".concat(entity.cellSheet.url);
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
            key = "item/".concat(entity.cellSheet.url);
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
            key = "projectile/".concat(entity.cellSheet.url);
            if ((_c = entity.bodies) === null || _c === void 0 ? void 0 : _c.default) {
                height = entity.bodies.default.height;
                width = entity.bodies.default.width;
            }
            else {
                console.log('no default body for projectile', entityData.id);
                return;
            }
        }
        this.preview.setTexture(key, 0).setDisplaySize(width, height).setVisible(true);
    };
    EntityEditor.prototype.update = function () {
        if (this.activeEntityPlacement && this.preview) {
            var worldPoint = this.gameScene.cameras.main.getWorldPoint(this.gameScene.input.activePointer.x, this.gameScene.input.activePointer.y);
            this.preview.x = worldPoint.x;
            this.preview.y = worldPoint.y;
        }
    };
    EntityEditor.prototype.selectEntityImage = function (entityImage) {
        if (this.selectedEntityImage)
            this.selectedEntityImage.updateOutline();
        this.selectedEntityImage = entityImage;
        entityImage.updateOutline();
    };
    EntityEditor.prototype.deleteInitEntity = function () {
        if (this.selectedEntityImage) {
            this.selectedEntityImage.delete();
            this.selectedEntityImage = null;
        }
    };
    return EntityEditor;
}());
//# sourceMappingURL=EntityEditor.js.map