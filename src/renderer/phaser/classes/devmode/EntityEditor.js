var EntityEditor = /** @class */ (function () {
    function EntityEditor(gameScene, devModeScene, devModeTools) {
        var _this = this;
        this.gameScene = gameScene;
        this.devModeTools = devModeTools;
        var COLOR_HANDLER = this.COLOR_HANDLER = 0x00fffb;
        this.preview = gameScene.add.image(0, 0, null, 0).setDepth(1000);
        this.preview.setAlpha(0.75).setVisible(false);
        this.outline = gameScene.add.graphics().setDepth(1000);
        var selectionContainer = this.selectionContainer = new Phaser.GameObjects.Container(gameScene);
        var angleArray = ['topLeftRotate', 'topRightRotate', 'bottomRightRotate', 'bottomLeftRotate'];
        var scaleArray = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft', 'left', 'right', 'top', 'bottom'];
        /*const widthArray = ['left', 'right'];
        const heightArray = ['top', 'bottom'];*/
        var dragPoints = this.dragPoints = {};
        dragPoints['topLeft'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        dragPoints['topLeft'].orientation = 'topLeft';
        dragPoints['topLeftRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        dragPoints['topLeftRotate'].orientation = 'topLeftRotate';
        dragPoints['top'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        dragPoints['top'].orientation = 'top';
        dragPoints['topRight'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        dragPoints['topRight'].orientation = 'topRight';
        dragPoints['topRightRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        dragPoints['topRightRotate'].orientation = 'topRightRotate';
        dragPoints['right'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        dragPoints['right'].orientation = 'right';
        dragPoints['bottomRight'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        dragPoints['bottomRight'].orientation = 'bottomRight';
        dragPoints['bottomRightRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        dragPoints['bottomRightRotate'].orientation = 'bottomRightRotate';
        dragPoints['bottom'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        dragPoints['bottom'].orientation = 'bottom';
        dragPoints['bottomLeft'] = gameScene.add.rectangle(0, 0, 10, 10, COLOR_HANDLER);
        dragPoints['bottomLeft'].orientation = 'bottomLeft';
        dragPoints['bottomLeftRotate'] = gameScene.add.rectangle(0, 0, 20, 20, COLOR_HANDLER, 0);
        dragPoints['bottomLeftRotate'].orientation = 'bottomLeftRotate';
        dragPoints['left'] = gameScene.add.rectangle(0, 0, 8, 8, COLOR_HANDLER);
        dragPoints['left'].orientation = 'left';
        Object.values(dragPoints).forEach(function (point) { return selectionContainer.add(point); });
        selectionContainer.setPosition(10, 10).setAngle(0).setDepth(1000).setVisible(false);
        gameScene.add.existing(selectionContainer);
        taro.client.on('scale', function (data) {
            Object.values(_this.dragPoints).forEach(function (point) { return point.setScale(1 / data.ratio); });
            if (_this.selectedEntityImage)
                _this.selectedEntityImage.updateOutline();
        });
        Object.values(this.dragPoints).forEach(function (point) {
            if (angleArray.includes(point.orientation)) {
                point.setInteractive({ draggable: true, cursor: 'url(/assets/cursors/rotate.cur), pointer' });
            }
            else {
                selectionContainer.bringToTop(point);
                point.setInteractive({ draggable: true /* , cursor: 'url(assets/cursors/resize.cur), pointer'*/ });
            }
            point.on('pointerover', function () {
                gameScene.input.setTopOnly(true);
                point.fillColor = devModeTools.COLOR_LIGHT;
            });
            point.on('pointerout', function () {
                if (angleArray.includes(point.orientation)) {
                    point.fillColor = COLOR_HANDLER;
                }
                else {
                    point.fillColor = COLOR_HANDLER;
                }
            });
            point.on('pointerdown', function (pointer) {
                var selectedEntityImage = _this.selectedEntityImage;
                if (!devModeTools.cursorButton.active || !selectedEntityImage)
                    return;
                _this.activeDragPoint = true;
                var worldPoint = _this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                selectedEntityImage.startDragX = worldPoint.x;
                selectedEntityImage.startDragY = worldPoint.y;
                selectedEntityImage.rotation = selectedEntityImage.image.rotation;
                selectedEntityImage.scale = selectedEntityImage.image.scale;
                selectedEntityImage.scaleX = selectedEntityImage.image.scaleX;
                selectedEntityImage.scaleY = selectedEntityImage.image.scaleY;
                selectedEntityImage.displayWidth = selectedEntityImage.image.displayWidth;
                selectedEntityImage.displayHeight = selectedEntityImage.image.displayHeight;
                selectedEntityImage.x = selectedEntityImage.image.x;
                selectedEntityImage.y = selectedEntityImage.image.y;
            });
            gameScene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
                var worldPoint = _this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                var selectedEntityImage = _this.selectedEntityImage;
                if (!devModeTools.cursorButton.active || gameObject !== point || !selectedEntityImage)
                    return;
                var action = selectedEntityImage.action;
                var editedAction = selectedEntityImage.editedAction;
                if (angleArray.includes(point.orientation) && !isNaN(action.angle)) {
                    var startingAngle = Phaser.Math.Angle.BetweenPoints(selectedEntityImage.image, { x: selectedEntityImage.startDragX, y: selectedEntityImage.startDragY });
                    var lastAngle = Phaser.Math.Angle.BetweenPoints(selectedEntityImage.image, worldPoint);
                    var targetAngle = lastAngle - startingAngle;
                    selectedEntityImage.image.rotation = selectedEntityImage.rotation + targetAngle;
                    editedAction.angle = selectedEntityImage.image.angle;
                    console.log('angle', editedAction.angle);
                }
                else {
                    if (scaleArray.includes(point.orientation) && !isNaN(action.width) && !isNaN(action.height)) {
                        var targetPoint = void 0;
                        var distanceToStart = void 0;
                        var distanceToCurrent = void 0;
                        switch (point.orientation) {
                            case 'topLeft':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomRight().x, selectedEntityImage.image.getBottomRight().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomRight().x, selectedEntityImage.image.getBottomRight().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'topRight':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomLeft().x, selectedEntityImage.image.getBottomLeft().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomLeft().x, selectedEntityImage.image.getBottomLeft().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'bottomRight':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopLeft().x, selectedEntityImage.image.getTopLeft().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopLeft().x, selectedEntityImage.image.getTopLeft().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            case 'bottomLeft':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopRight().x, selectedEntityImage.image.getTopRight().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopRight().x, selectedEntityImage.image.getTopRight().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            case 'left':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getRightCenter().x, selectedEntityImage.image.getRightCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getRightCenter().x, selectedEntityImage.image.getRightCenter().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                targetPoint = new Phaser.Math.Vector2((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, 0);
                                break;
                            case 'right':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getLeftCenter().x, selectedEntityImage.image.getLeftCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getLeftCenter().x, selectedEntityImage.image.getLeftCenter().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                                editedAction.width = selectedEntityImage.image.displayWidth;
                                targetPoint = new Phaser.Math.Vector2((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, 0);
                                break;
                            case 'top':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomCenter().x, selectedEntityImage.image.getBottomCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomCenter().x, selectedEntityImage.image.getBottomCenter().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2(0, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                                break;
                            case 'bottom':
                                distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopCenter().x, selectedEntityImage.image.getTopCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                                distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopCenter().x, selectedEntityImage.image.getTopCenter().y, worldPoint.x, worldPoint.y);
                                selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                                editedAction.height = selectedEntityImage.image.displayHeight;
                                targetPoint = new Phaser.Math.Vector2(0, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                                break;
                            default:
                                break;
                        }
                        /*if (point.orientation === 'left') {
                            const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getRightCenter().x, selectedEntityImage.image.getRightCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                            const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getRightCenter().x, selectedEntityImage.image.getRightCenter().y, worldPoint.x, worldPoint.y);
                            selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                            editedAction.width = selectedEntityImage.image.displayWidth;
                            targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.displayWidth - selectedEntityImage.image.displayWidth) / 2, 0);
                        } else if (point.orientation === 'right') {
                            const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getLeftCenter().x, selectedEntityImage.image.getLeftCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                            const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getLeftCenter().x, selectedEntityImage.image.getLeftCenter().y, worldPoint.x, worldPoint.y);
                            selectedEntityImage.image.scaleX = selectedEntityImage.scaleX * (distanceToCurrent / distanceToStart);
                            editedAction.width = selectedEntityImage.image.displayWidth;
                            targetPoint = new Phaser.Math.Vector2 ((selectedEntityImage.image.displayWidth - selectedEntityImage.displayWidth) / 2, 0);
                        }
                        else if (point.orientation === 'top') {
                            const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomCenter().x, selectedEntityImage.image.getBottomCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                            const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getBottomCenter().x, selectedEntityImage.image.getBottomCenter().y, worldPoint.x, worldPoint.y);
                            selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                            editedAction.height = selectedEntityImage.image.displayHeight;
                            targetPoint = new Phaser.Math.Vector2 (0, (selectedEntityImage.displayHeight - selectedEntityImage.image.displayHeight) / 2);
                        } else if (point.orientation === 'bottom') {
                            const distanceToStart = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopCenter().x, selectedEntityImage.image.getTopCenter().y, selectedEntityImage.startDragX, selectedEntityImage.startDragY);
                            const distanceToCurrent = Phaser.Math.Distance.Between(selectedEntityImage.image.getTopCenter().x, selectedEntityImage.image.getTopCenter().y, worldPoint.x, worldPoint.y);
                            selectedEntityImage.image.scaleY = selectedEntityImage.scaleY * (distanceToCurrent / distanceToStart);
                            editedAction.height = selectedEntityImage.image.displayHeight;
                            targetPoint = new Phaser.Math.Vector2 (0, (selectedEntityImage.image.displayHeight - selectedEntityImage.displayHeight) / 2);
                        }*/
                        targetPoint.rotate(selectedEntityImage.image.rotation);
                        var x = selectedEntityImage.x + targetPoint.x;
                        var y = selectedEntityImage.y + targetPoint.y;
                        selectedEntityImage.image.x = x;
                        selectedEntityImage.image.y = y;
                        editedAction.position = { x: x, y: y };
                    }
                }
                selectedEntityImage.updateOutline();
            });
            gameScene.input.on('dragend', function (pointer, gameObject) {
                var selectedEntityImage = _this.selectedEntityImage;
                if (gameObject !== point || !selectedEntityImage)
                    return;
                _this.activeDragPoint = false;
                selectedEntityImage.dragMode = null;
                console.log('editedAction', selectedEntityImage.editedAction);
                selectedEntityImage.edit(selectedEntityImage.editedAction);
                selectedEntityImage.editedAction = { actionId: selectedEntityImage.action.actionId };
            });
        });
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