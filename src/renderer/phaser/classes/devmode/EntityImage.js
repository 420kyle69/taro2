var EntityImage = /** @class */ (function () {
    function EntityImage(scene, devModeTools, entityImages, action, type) {
        var _this = this;
        var _a, _b;
        this.devModeTools = devModeTools;
        var entityEditor = this.entityEditor = devModeTools.entityEditor;
        this.action = action;
        var key;
        if (action.entityType === 'unitTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            if (!entityTypeData)
                return;
            key = "unit/".concat(entityTypeData.cellSheet.url);
        }
        else if (type === 'unit') {
            var entityTypeData = taro.game.data['unitTypes'] && taro.game.data['unitTypes'][action.unitType];
            if (!entityTypeData)
                return;
            key = "unit/".concat(entityTypeData.cellSheet.url);
        }
        else if (action.entityType === 'itemTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            if (!entityTypeData)
                return;
            key = "item/".concat(entityTypeData.cellSheet.url);
        }
        else if (type === 'item') {
            var entityTypeData = taro.game.data['itemTypes'] && taro.game.data['itemTypes'][action.itemType];
            if (!entityTypeData)
                return;
            key = "item/".concat(entityTypeData.cellSheet.url);
        }
        else if (action.entityType === 'projectileTypes') {
            var entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
            if (!entityTypeData)
                return;
            key = "projectile/".concat(entityTypeData.cellSheet.url);
        }
        else if (type === 'projectile') {
            var entityTypeData = taro.game.data['projectileTypes'] && taro.game.data['projectileTypes'][action.projectileType];
            if (!entityTypeData)
                return;
            key = "projectile/".concat(entityTypeData.cellSheet.url);
        }
        var image = this.image = scene.add.image((_a = action.position) === null || _a === void 0 ? void 0 : _a.x, (_b = action.position) === null || _b === void 0 ? void 0 : _b.y, key);
        if (action.angle)
            image.angle = action.angle;
        if (action.width && action.height)
            image.setDisplaySize(action.width, action.height);
        if (taro.developerMode.active && taro.developerMode.activeTab === 'map') {
            image.setVisible(true);
        }
        else {
            image.setVisible(false);
        }
        image.setInteractive({ draggable: true });
        image.entity = this;
        entityImages.push(image);
        image.on('pointerdown', function () {
            //console.log('pointerdown', action);
            if (!devModeTools.cursorButton.active)
                return;
            if (entityEditor.selectedEntityImage !== _this) {
                entityEditor.selectEntityImage(_this);
            }
            _this.startDragX = image.x;
            _this.startDragY = image.y;
            _this.scale = image.scale;
            if (!devModeTools.altKey.isDown && !devModeTools.shiftKey.isDown) {
                _this.dragMode = 'position';
            }
            else if (devModeTools.altKey.isDown) {
                _this.dragMode = 'angle';
            }
            else if (devModeTools.shiftKey.isDown) {
                _this.dragMode = 'scale';
            }
        });
        var outline = entityEditor.outline;
        image.on('pointerover', function () {
            if (!devModeTools.cursorButton.active)
                return;
            if (entityEditor.selectedEntityImage !== _this)
                entityEditor.selectedEntityImage = null;
            _this.updateOutline();
        });
        image.on('pointerout', function () {
            if (entityEditor.selectedEntityImage === _this)
                return;
            outline.clear();
        });
        var editedAction = { actionId: action.actionId };
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if (!devModeTools.cursorButton.active || gameObject !== image)
                return;
            if (_this.dragMode === 'position') {
                gameObject.x = dragX;
                gameObject.y = dragY;
                editedAction.position = { x: dragX, y: dragY };
            }
            else if (_this.dragMode === 'angle' && !isNaN(action.angle)) {
                var target = Phaser.Math.Angle.BetweenPoints(gameObject, { x: dragX, y: dragY });
                gameObject.rotation = target;
                editedAction.angle = gameObject.angle;
            }
            else if (_this.dragMode === 'scale' && !isNaN(action.width) && !isNaN(action.height)) {
                var dragScale = Math.min(500, Math.max(-250, (_this.startDragY - dragY)));
                gameObject.scale = _this.scale + _this.scale * dragScale / 500;
                editedAction.width = image.displayWidth;
                editedAction.height = image.displayHeight;
            }
            _this.updateOutline();
        });
        scene.input.on('dragend', function (pointer, gameObject) {
            if (gameObject !== image)
                return;
            _this.dragMode = null;
            _this.edit(editedAction);
            editedAction = { actionId: action.actionId };
        });
    }
    EntityImage.prototype.edit = function (action) {
        if (!this.action.wasEdited) {
            this.action.wasEdited = true;
            action.wasEdited = true;
        }
        taro.network.send('editInitEntity', action);
    };
    EntityImage.prototype.updateOutline = function () {
        var outline = this.entityEditor.outline;
        var image = this.image;
        outline.clear();
        if (this.devModeTools.entityEditor.selectedEntityImage === this) {
            outline.lineStyle(6, 0x036ffc, 1);
        }
        else {
            outline.lineStyle(2, 0x036ffc, 1);
        }
        outline.strokeRect(-image.displayWidth / 2, -image.displayHeight / 2, image.displayWidth, image.displayHeight);
        outline.x = image.x;
        outline.y = image.y;
        outline.angle = image.angle;
    };
    EntityImage.prototype.update = function (action) {
        if (action.wasEdited)
            this.action.wasEdited = true;
        if (this.action.position && this.action.position.x && this.action.position.y &&
            action.position && action.position.x && action.position.y) {
            this.action.position = action.position;
            this.image.x = action.position.x;
            this.image.y = action.position.y;
        }
        if (this.action.angle && action.angle) {
            this.action.angle = action.angle;
            this.image.angle = action.angle;
        }
        if (this.action.width && this.action.height && action.width && action.height) {
            this.action.width = action.width;
            this.action.height = action.height;
            this.image.setDisplaySize(action.width, action.height);
        }
        if (action.wasDeleted) {
            this.hide();
            this.action.wasDeleted = true;
        }
    };
    EntityImage.prototype.hide = function () {
        this.image.alpha = 0;
        this.image.setInteractive(false);
    };
    EntityImage.prototype.delete = function () {
        this.hide();
        var editedAction = { actionId: this.action.actionId, wasDeleted: true };
        this.edit(editedAction);
        this.entityEditor.outline.clear();
    };
    return EntityImage;
}());
//# sourceMappingURL=EntityImage.js.map